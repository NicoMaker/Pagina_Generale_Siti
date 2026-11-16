(global => {
  'use strict';
  const LS = (global.LS = global.LS || {});

  // Da coordinate GPS a nome del luogo, tramite OpenStreetMap Nominatim.
  // Unica richiesta di rete dell'app: parte solo se "Cerca il nome del luogo" è attivo.
  // Rispetta il limite di 1 richiesta al secondo e ricorda i risultati.

  const memory = new Map();
  let chain = Promise.resolve();
  let lastCall = 0;

  try {
    const saved = JSON.parse(localStorage.getItem('ls-geo') || '{}');
    Object.keys(saved).forEach(k => { memory.set(k, saved[k]); });
  } catch (e) {}

  function persist() {
    try {
      const obj = {};
      memory.forEach((v, k) => { if (v) obj[k] = v; });
      localStorage.setItem('ls-geo', JSON.stringify(obj));
    } catch (e) {}
  }

  function keyOf(g) { return `${g.lat.toFixed(3)},${g.lon.toFixed(3)}`; }

  function labelFrom(json) {
    const a = (json && json.address) || {};
    const place = a.city || a.town || a.village || a.municipality || a.hamlet || a.suburb || a.county;
    const region = a.country_code === 'it' ? (a.state || a.region) : a.country;
    let label = [place, region].filter(Boolean).join(', ');
    if (!label && json && json.display_name) label = json.display_name.split(',').slice(0, 2).join(',').trim();
    return label || null;
  }

  function lookup(g) {
    const k = keyOf(g);
    if (memory.has(k) && memory.get(k)) return Promise.resolve(memory.get(k));

    const job = chain.then(async () => {
      if (memory.has(k) && memory.get(k)) return memory.get(k);
      const wait = Math.max(0, 1100 - (Date.now() - lastCall));
      if (wait) await LS.utils.sleep(wait);
      lastCall = Date.now();

      let label = null;
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => { ctrl.abort(); }, 8000);
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14&accept-language=it&lat=${encodeURIComponent(g.lat.toFixed(5))}&lon=${encodeURIComponent(g.lon.toFixed(5))}`;
        const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
        clearTimeout(timer);
        if (res.ok) label = labelFrom(await res.json());
      } catch (e) { /* offline o bloccato: si userà la coordinata */ }

      memory.set(k, label);
      if (label) persist();
      return label;
    });
    chain = job.catch(() => {});
    return job;
  }

  // Risolve il luogo di una singola immagine (una sola volta).
  function ensure(item) {
    if (!item.exif || !item.exif.gps) return Promise.resolve(null);
    if (!item._placeP) {
      item._placeP = lookup(item.exif.gps).then(label => {
        item.place = label;
        item.placeDone = true;
        LS.store.emit('meta', item);
        return label;
      });
    }
    return item._placeP;
  }

  function autoResolve() {
    const s = LS.store.state.settings;
    if (!LS.stamp.wantsLookup(s)) return;
    LS.store.state.images.forEach(it => { ensure(it); });
  }

  LS.geo = { ensure, autoResolve, lookup };
})(window);
