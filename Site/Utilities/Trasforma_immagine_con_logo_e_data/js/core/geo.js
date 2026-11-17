((global) => {
  "use strict";
  const LS = (global.LS = global.LS || {});

  // Da coordinate GPS a nome del luogo.
  // 1) OpenStreetMap Nominatim  2) BigDataCloud (riserva, se il primo fallisce o non trova nulla).
  // Parte solo se "Cerca il nome del luogo" è attivo. Rispetta 1 richiesta/secondo per Nominatim,
  // ricorda i risultati trovati e riprova più tardi se la rete non era disponibile.

  const memory = new Map();
  let chain = Promise.resolve();
  let lastCall = 0;
  const RETRY_AFTER = 20000; // ms prima di riprovare un luogo non risolto per errore di rete

  try {
    const saved = JSON.parse(localStorage.getItem("ls-geo2") || "{}");
    Object.keys(saved).forEach((k) => {
      memory.set(k, saved[k]);
    });
  } catch (e) {}

  function persist() {
    try {
      const obj = {};
      memory.forEach((v, k) => {
        if (v) obj[k] = v;
      });
      localStorage.setItem("ls-geo2", JSON.stringify(obj));
    } catch (e) {}
  }

  function keyOf(g) {
    return `${g.lat.toFixed(3)},${g.lon.toFixed(3)}`;
  }

  async function getJson(url, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      ctrl.abort();
    }, ms);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function join(place, region) {
    const out = [];
    [place, region].forEach((v) => {
      if (v && out.indexOf(v) === -1) out.push(v);
    });
    return out.join(", ") || null;
  }

  function labelFromNominatim(json) {
    if (!json || json.error) return null;
    const a = json.address || {};
    const place =
      a.city ||
      a.town ||
      a.village ||
      a.municipality ||
      a.hamlet ||
      a.locality ||
      a.city_district ||
      a.suburb ||
      a.neighbourhood ||
      a.isle ||
      a.county;
    const region = a.country_code === "it" ? a.state || a.region : a.country;
    let label = join(place, region);
    if (!label && json.display_name)
      label = json.display_name.split(",").slice(0, 2).join(",").trim();
    return label || null;
  }

  function labelFromBigData(json) {
    if (!json) return null;
    const place = json.city || json.locality;
    const region =
      json.countryCode === "IT" ? json.principalSubdivision : json.countryName;
    return join(place, region);
  }

  async function viaNominatim(g) {
    const wait = Math.max(0, 1100 - (Date.now() - lastCall));
    if (wait) await LS.utils.sleep(wait);
    lastCall = Date.now();
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=14&accept-language=it&lat=${encodeURIComponent(g.lat.toFixed(5))}&lon=${encodeURIComponent(g.lon.toFixed(5))}`;
    return labelFromNominatim(await getJson(url, 12000));
  }

  async function viaBigData(g) {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(g.lat.toFixed(5))}&longitude=${encodeURIComponent(g.lon.toFixed(5))}&localityLanguage=it`;
    return labelFromBigData(await getJson(url, 12000));
  }

  // Ritorna { label, failed }: failed = true se nessun servizio ha risposto (rete assente/bloccata).
  async function resolve(g) {
    let answered = false;
    const providers = [viaNominatim, viaBigData];
    for (let i = 0; i < providers.length; i++) {
      try {
        const label = await providers[i](g);
        answered = true;
        if (label) return { label, failed: false };
      } catch (e) {
        /* offline, bloccato o troppe richieste: si prova il servizio successivo */
      }
    }
    return { label: null, failed: !answered };
  }

  function lookup(g) {
    const k = keyOf(g);
    if (memory.get(k)) return Promise.resolve({ label: memory.get(k) });

    const job = chain.then(async () => {
      if (memory.get(k)) return { label: memory.get(k) };
      const r = await resolve(g);
      if (r.label) {
        memory.set(k, r.label);
        persist();
      }
      return r;
    });
    chain = job.catch(() => {});
    return job;
  }

  // Risolve il luogo di una singola immagine. Se la rete non rispondeva, riprova dopo un po'.
  function ensure(item) {
    if (!item.exif || !item.exif.gps) return Promise.resolve(null);
    if (
      item._placeP &&
      item._placeFailAt &&
      Date.now() - item._placeFailAt > RETRY_AFTER
    ) {
      item._placeP = null;
    }
    if (!item._placeP) {
      item._placeFailAt = 0;
      item._placeP = lookup(item.exif.gps).then((r) => {
        item.place = r.label || null;
        item.placeDone = true; // senza nome si scrivono le coordinate
        if (!r.label && r.failed) item._placeFailAt = Date.now();
        LS.store.emit("meta", item);
        return item.place;
      });
    }
    return item._placeP;
  }

  function autoResolve() {
    const s = LS.store.state.settings;
    if (!LS.stamp.wantsLookup(s)) return;
    LS.store.state.images.forEach((it) => {
      ensure(it);
    });
  }

  LS.geo = { ensure, autoResolve, lookup };
})(window);
