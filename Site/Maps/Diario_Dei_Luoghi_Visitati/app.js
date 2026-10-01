"use strict";
const KEY = "diario-luoghi-v1",
  VKEY = "diario-luoghi-view";
let places = load(),
  activeId = null,
  editingId = null,
  pending = null,
  pendingCat = "generico";
const markers = new Map();
let gpsMarker = null,
  gpsWatchId = null;
const $ = (id) => document.getElementById(id);

const map = L.map("map").setView([42.5, 12.5], 5);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap",
}).addTo(map);

/* ---------- categorie con icone ---------- */
const CATS = {
  generico: { ico: "📍", label: "Generico" },
  casa: { ico: "🏠", label: "Casa" },
  lavoro: { ico: "💼", label: "Lavoro" },
  viaggio: { ico: "✈️", label: "Viaggio" },
  aereo: { ico: "🛫", label: "Aereo" },
  treno: { ico: "🚆", label: "Treno" },
  nave: { ico: "🚢", label: "Nave" },
  auto: { ico: "🚗", label: "Auto" },
  camper: { ico: "🚐", label: "Camper" },
  bici: { ico: "🚲", label: "Bici" },
  ristorante: { ico: "🍽️", label: "Ristorante" },
  bar: { ico: "☕", label: "Bar" },
  hotel: { ico: "🏨", label: "Hotel" },
  spiaggia: { ico: "🏖️", label: "Spiaggia" },
  montagna: { ico: "⛰️", label: "Montagna" },
  monumento: { ico: "🏛️", label: "Monumento" },
  shopping: { ico: "🛍️", label: "Shopping" },
  sport: { ico: "⚽", label: "Sport" },
  altro: { ico: "⭐", label: "Altro" },
};
const catOf = (c) => CATS[c] || CATS.generico;
const catIco = (c) => catOf(c).ico;
const catLabel = (c) => catOf(c).label;

/* ---------- utilità ---------- */
function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(places));
}
const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove("show"), 2800);
}
const colorOf = (s) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `hsl(${h} 65% 55%)`;
};

/* ---------- data all'italiana ---------- */
function itDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function isoDate(it) {
  if (!it) return "";
  const m = it.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return it;
  const [, d, mo, y] = m;
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/* ---------- nome del paese/comune ---------- */
function paeseFromAddress(addr) {
  if (!addr) return "";
  const keys = [
    "city",
    "town",
    "village",
    "municipality",
    "hamlet",
    "suburb",
    "county",
    "state",
    "country",
  ];
  for (const k of keys) {
    if (addr[k]) return addr[k];
  }
  return "";
}
function paeseFromDisplay(dn) {
  if (!dn) return "";
  const parts = dn.split(",").map((s) => s.trim());
  if (parts.length >= 3) return parts[2];
  if (parts.length >= 2) return parts[1];
  return parts[0] || "";
}

/* ---------- controllo duplicati ---------- */
const norm = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
function meters(a, b) {
  const R = 6371000,
    rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat),
    dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function findDup(lat, lng, name, ignoreId) {
  return places.find(
    (p) =>
      p.id !== ignoreId &&
      (meters(p, { lat, lng }) < 150 ||
        (name &&
          norm(p.name) === norm(name) &&
          meters(p, { lat, lng }) < 5000)),
  );
}
function alreadyThere(p) {
  toast(`«${p.name}» è già nella tua lista`);
  select(p.id);
}

/* ---------- mappa: segnaposti con icona categoria ---------- */
function iconFor(cat, sel) {
  const ico = catIco(cat);
  const cls = `pin cat-${cat}${sel ? " sel" : ""}`;
  return L.divIcon({
    className: "",
    html: `<div class="${cls}"><span class="pin-ico">${ico}</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}
function syncMarkers() {
  markers.forEach((m) => map.removeLayer(m));
  markers.clear();
  places.forEach((p) => {
    const m = L.marker([p.lat, p.lng], {
      icon: iconFor(p.cat || "generico", p.id === activeId),
    })
      .addTo(map)
      .bindTooltip(`${catIco(p.cat || "generico")} ${p.name}`);
    m.on("click", () => {
      select(p.id, false);
      map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 15), {
        duration: 0.8,
      });
    });
    markers.set(p.id, m);
  });
}

/* ---------- lista ---------- */
function render() {
  const q = $("filter").value.trim().toLowerCase(),
    sort = $("sort").value;
  const arr = places.filter((p) =>
    (p.name + " " + p.note + " " + catLabel(p.cat || "generico"))
      .toLowerCase()
      .includes(q),
  );
  if (sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "date")
    arr.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  else if (sort === "rating") arr.sort((a, b) => b.rating - a.rating);
  else if (sort === "cat")
    arr.sort((a, b) =>
      catLabel(a.cat || "generico").localeCompare(
        catLabel(b.cat || "generico"),
      ),
    );
  else arr.sort((a, b) => b.created - a.created);

  $("count").textContent =
    places.length +
    (places.length === 1 ? " luogo visitato" : " luoghi visitati");
  $("list").innerHTML = arr.length
    ? arr
        .map((p) => {
          const cat = p.cat || "generico";
          return `
    <li class="item${p.id === activeId ? " active" : ""}" data-id="${p.id}">
      <div class="avatar" style="background:${colorOf(p.name)}">${catIco(cat)}</div>
      <div>
        <h3>${esc(p.name)} <span class="cat-mini" title="${esc(catLabel(cat))}">${catIco(cat)}</span></h3>
        <div class="meta">${catLabel(cat)}${p.date ? " · " + esc(itDate(p.date)) : ""}${p.rating ? ` · <span class="stars">${"★".repeat(p.rating)}</span>` : ""} · ${p.lat.toFixed(3)}, ${p.lng.toFixed(3)}</div>
        ${p.note ? `<p class="note">${esc(p.note)}</p>` : ""}
        <div class="btns">
          <button data-act="edit">Modifica</button>
          <button data-act="del" class="danger">Elimina</button>
          <button data-act="goto">Vai qui</button>
        </div>
      </div>
    </li>`;
        })
        .join("")
    : `<li class="empty">${places.length ? "Nessun risultato." : "Ancora nessun luogo. Cerca un posto o clicca sulla mappa per iniziare."}</li>`;
  syncMarkers();
}
function select(id, fly = true) {
  activeId = id;
  render();
  const p = places.find((x) => x.id === id);
  if (p && fly && $("app").dataset.view === "split")
    map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 13));
  document
    .querySelector(`.item[data-id="${id}"]`)
    ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}
$("list").addEventListener("click", (e) => {
  const li = e.target.closest(".item");
  if (!li) return;
  const id = li.dataset.id,
    act = e.target.dataset.act;
  if (act === "edit") return openDialog(places.find((p) => p.id === id));
  if (act === "del") {
    if (confirm("Eliminare questo luogo?")) {
      places = places.filter((p) => p.id !== id);
      save();
      render();
      toast("Luogo eliminato");
    }
    return;
  }
  if (act === "goto") {
    const p = places.find((x) => x.id === id);
    if (!p) return;
    select(id, false);
    map.flyTo([p.lat, p.lng], 17, { duration: 1.2 });
    toast(`Vai a «${p.name}»`);
    return;
  }
  select(id);
});
$("filter").addEventListener("input", render);
$("sort").addEventListener("change", render);

/* ---------- vista ---------- */
function setView(v) {
  $("app").dataset.view = v;
  document
    .querySelectorAll(".seg button")
    .forEach((b) => b.classList.toggle("on", b.dataset.view === v));
  try {
    localStorage.setItem(VKEY, v);
  } catch {}
  setTimeout(() => map.invalidateSize(), 50);
}
document.querySelector(".seg").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (b) setView(b.dataset.view);
});

/* ---------- selezione categoria ---------- */
function setCat(cat) {
  pendingCat = cat;
  document
    .querySelectorAll("#fCat .cat")
    .forEach((b) => b.classList.toggle("on", b.dataset.cat === cat));
}
$("fCat").addEventListener("click", (e) => {
  const b = e.target.closest(".cat");
  if (b) setCat(b.dataset.cat);
});

/* ---------- scheda luogo ---------- */
function startNew(draft) {
  const dup = findDup(draft.lat, draft.lng, draft.name);
  if (dup) return alreadyThere(dup);
  openDialog(null, draft);
}
function openDialog(p, draft) {
  editingId = p ? p.id : null;
  pending = p ? { lat: p.lat, lng: p.lng } : draft;
  $("dlgTitle").textContent = p ? "Modifica luogo" : "Nuovo luogo";
  $("fName").value = p ? p.name : draft.name || "";
  const d = p ? p.date : new Date().toISOString().slice(0, 10);
  $("fDate").value = d || "";
  $("fRate").value = p ? p.rating : 0;
  $("fNote").value = p ? p.note : "";
  setCat(p ? p.cat || "generico" : draft.cat || "generico");
  $("fCoord").textContent =
    `Coordinate: ${pending.lat.toFixed(5)}, ${pending.lng.toFixed(5)}`;
  $("fErr").textContent = "";
  $("dlg").showModal();
  $("fName").focus();
}
$("fCancel").onclick = () => $("dlg").close();
$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    name: $("fName").value.trim(),
    date: $("fDate").value,
    rating: +$("fRate").value,
    note: $("fNote").value.trim(),
    cat: pendingCat,
    lat: pending.lat,
    lng: pending.lng,
  };
  if (!data.name) return;
  const dup = findDup(data.lat, data.lng, data.name, editingId);
  if (dup) {
    $("fErr").textContent =
      `Già inserito: «${dup.name}». Non puoi aggiungere lo stesso luogo due volte.`;
    return;
  }
  if (editingId)
    Object.assign(
      places.find((p) => p.id === editingId),
      data,
    );
  else {
    const p = { id: uid(), created: Date.now(), ...data };
    places.push(p);
    activeId = p.id;
  }
  save();
  render();
  $("dlg").close();
  toast("Luogo salvato");
});

/* ---------- clic sulla mappa ---------- */
map.on("click", async (e) => {
  const { lat, lng } = e.latlng;
  const near = findDup(lat, lng, "");
  if (near) return alreadyThere(near);
  let name = "";
  try {
    const j = await (
      await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&addressdetails=1&accept-language=it&lat=${lat}&lon=${lng}`,
      )
    ).json();
    name = paeseFromAddress(j.address) || paeseFromDisplay(j.display_name);
  } catch {
    /* offline */
  }
  startNew({ lat, lng, name });
});

/* ---------- ricerca ---------- */
async function search() {
  const q = $("q").value.trim();
  if (!q) return;
  const ul = $("results");
  ul.hidden = false;
  ul.innerHTML = "<li>Ricerca in corso…</li>";
  try {
    const arr = await (
      await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&addressdetails=1&accept-language=it&q=${encodeURIComponent(q)}`,
      )
    ).json();
    ul._data = arr;
    ul.innerHTML = arr.length
      ? arr
          .map((x, i) => {
            const paese =
              paeseFromAddress(x.address) ||
              x.name ||
              paeseFromDisplay(x.display_name);
            const resto = (x.display_name || "")
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s && s !== paese)
              .slice(0, 3)
              .join(", ");
            const dup = findDup(+x.lat, +x.lon, paese);
            return `<li tabindex="0" data-i="${i}" class="${dup ? "dup" : ""}">
              <span><strong>${esc(paese)}</strong>${resto ? " — " + esc(resto) : ""}</span>
              ${dup ? '<span class="tag">già inserito</span>' : ""}
            </li>`;
          })
          .join("")
      : "<li>Nessun risultato.</li>";
  } catch {
    ul.innerHTML = "<li>Errore di rete. Riprova.</li>";
  }
}
$("btnSearch").onclick = search;
$("q").addEventListener("keydown", (e) => {
  if (e.key === "Enter") search();
  if (e.key === "Escape") $("results").hidden = true;
});
function pickResult(li) {
  const x = $("results")._data?.[li.dataset.i];
  if (!x) return;
  const lat = +x.lat,
    lng = +x.lon;
  $("results").hidden = true;
  $("q").value = "";
  const paese =
    paeseFromAddress(x.address) || x.name || paeseFromDisplay(x.display_name);
  const dup = findDup(lat, lng, paese);
  if (dup) return alreadyThere(dup);
  if ($("app").dataset.view === "split") map.flyTo([lat, lng], 13);
  startNew({ lat, lng, name: paese });
}
$("results").addEventListener("click", (e) => {
  const li = e.target.closest("li[data-i]");
  if (li) pickResult(li);
});
$("results").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const li = e.target.closest("li[data-i]");
    if (li) pickResult(li);
  }
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search")) $("results").hidden = true;
});

/* ---------- GPS ---------- */
const gpsIcon = L.divIcon({
  className: "",
  html: '<div class="gps-marker"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});
function gpsError(err) {
  const msgs = {
    1: "Permesso negato. Abilita la geolocalizzazione nel browser.",
    2: "Posizione non disponibile. Controlla il GPS.",
    3: "Timeout. Riprova.",
  };
  toast(msgs[err.code] || "Errore GPS");
}
$("btnGps").onclick = () => {
  if (!navigator.geolocation) return toast("GPS non supportato dal browser");
  if (gpsWatchId !== null) {
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
    if (gpsMarker) {
      map.removeLayer(gpsMarker);
      gpsMarker = null;
    }
    toast("GPS disattivato");
    $("btnGps").textContent = "📍 GPS";
    return;
  }
  toast("Attivazione GPS…");
  gpsWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude,
        lng = pos.coords.longitude,
        acc = pos.coords.accuracy;
      if (!gpsMarker) {
        gpsMarker = L.marker([lat, lng], {
          icon: gpsIcon,
          zIndexOffset: 1000,
        })
          .addTo(map)
          .bindTooltip("Sei qui");
        map.flyTo([lat, lng], 16, { duration: 1.2 });
        $("btnGps").textContent = "🛑 GPS";
        toast(`Sei qui (±${Math.round(acc)} m)`);
      } else {
        gpsMarker.setLatLng([lat, lng]);
      }
    },
    gpsError,
    { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
  );
};

/* ---------- download helpers ---------- */
function download(name, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
const stamp = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
};

/* ---------- JSON: include TUTTO (cat, icona, label, viaggio) ---------- */
$("btnJson").onclick = () => {
  if (!places.length) return toast("Non ci sono luoghi da esportare");
  const data = {
    version: 1,
    exported: new Date().toISOString(),
    total: places.length,
    places: places.map((p) => ({
      id: p.id,
      created: p.created,
      name: p.name,
      category: p.cat || "generico",
      categoryLabel: catLabel(p.cat || "generico"),
      categoryIcon: catIco(p.cat || "generico"),
      date: p.date,
      dateIt: itDate(p.date),
      rating: p.rating,
      note: p.note,
      lat: p.lat,
      lng: p.lng,
    })),
  };
  download(
    `diario-luoghi-${stamp()}.json`,
    JSON.stringify(data, null, 2),
    "application/json",
  );
  toast(`${places.length} luoghi esportati in JSON`);
};

/* ---------- TXT: elenco completo con categoria ---------- */
$("btnTxt").onclick = () => {
  if (!places.length) return toast("Non ci sono luoghi da esportare");
  const lines = [];
  lines.push("DIARIO DEI LUOGHI");
  lines.push(`Esportato il ${stamp()}`);
  lines.push(`Totale: ${places.length} luoghi`);
  lines.push("=".repeat(60));
  lines.push("");

  // Riepilogo per categoria
  const counts = {};
  places.forEach((p) => {
    const c = p.cat || "generico";
    counts[c] = (counts[c] || 0) + 1;
  });
  lines.push("RIEPILOGO PER CATEGORIA:");
  Object.keys(counts).forEach((c) => {
    lines.push(`  ${catIco(c)} ${catLabel(c)}: ${counts[c]}`);
  });
  lines.push("");
  lines.push("=".repeat(60));
  lines.push("");

  places.forEach((p, i) => {
    const c = p.cat || "generico";
    lines.push(`${i + 1}. ${catIco(c)} ${p.name}`);
    lines.push(`   Categoria: ${catLabel(c)}`);
    lines.push(`   Data: ${itDate(p.date) || "-"}`);
    lines.push(`   Valutazione: ${p.rating ? "★".repeat(p.rating) : "-"}`);
    lines.push(`   Coordinate: ${p.lat}, ${p.lng}`);
    lines.push(`   Note: ${p.note || "-"}`);
    lines.push("");
  });

  download(
    `diario-luoghi-${stamp()}.txt`,
    lines.join("\n"),
    "text/plain;charset=utf-8",
  );
  toast(`${places.length} luoghi esportati in TXT`);
};

/* ---------- CSV: apribile in Excel con categoria ---------- */
$("btnCsv").onclick = () => {
  if (!places.length) return toast("Non ci sono luoghi da esportare");
  const q = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
  const rows = [
    [
      "N.",
      "Icona",
      "Categoria",
      "Nome",
      "Data",
      "Valutazione",
      "Latitudine",
      "Longitudine",
      "Note",
    ].join(","),
  ];
  places.forEach((p, i) => {
    const c = p.cat || "generico";
    rows.push(
      [
        i + 1,
        q(catIco(c)),
        q(catLabel(c)),
        q(p.name),
        q(itDate(p.date)),
        p.rating || "",
        p.lat,
        p.lng,
        q(p.note),
      ].join(","),
    );
  });
  // BOM per Excel italiano
  const csv = "\uFEFF" + rows.join("\r\n");
  download(
    `diario-luoghi-${stamp()}.csv`,
    csv,
    "text/csv;charset=utf-8",
  );
  toast(`${places.length} luoghi esportati in CSV (Excel)`);
};

/* ---------- HTML: pagina autonoma con mappa e diario ---------- */
$("btnHtml").onclick = () => {
  if (!places.length) return toast("Non ci sono luoghi da esportare");
  const counts = {};
  places.forEach((p) => {
    const c = p.cat || "generico";
    counts[c] = (counts[c] || 0) + 1;
  });
  const cats = Object.keys(counts)
    .map(
      (c) =>
        `<span class="chip">${catIco(c)} ${catLabel(c)} · ${counts[c]}</span>`,
    )
    .join("");
  const cards = places
    .map((p) => {
      const c = p.cat || "generico";
      return `<div class="card">
        <div class="ico">${catIco(c)}</div>
        <div>
          <p class="name">${esc(p.name)}</p>
          <div class="meta">${catLabel(c)}${p.date ? " · " + itDate(p.date) : ""}${p.rating ? ` · <span class="stars">${"★".repeat(p.rating)}</span>` : ""} · ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}</div>
          ${p.note ? `<p class="note">${esc(p.note)}</p>` : ""}
        </div>
      </div>`;
    })
    .join("");
  const markersJs = JSON.stringify(
    places.map((p) => ({
      name: p.name,
      cat: p.cat || "generico",
      ico: catIco(p.cat || "generico"),
      lat: p.lat,
      lng: p.lng,
    })),
  );

  const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Diario dei luoghi – ${stamp()}</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, "Segoe UI", sans-serif; margin: 0; background: #f3f4fb; color: #151a33; }
  header { padding: 20px; background: #fff; box-shadow: 0 6px 20px rgba(21,26,51,.08); }
  h1 { margin: 0 0 6px; font-size: 1.4rem; }
  .sub { color: #6b7194; font-size: .9rem; }
  #map { height: 55vh; margin: 20px; border-radius: 16px; box-shadow: 0 10px 30px rgba(21,26,51,.1); }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 0 20px 40px; }
  .cats { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 0; }
  .chip { background: #eceafd; color: #5b5bf0; border-radius: 99px; padding: 4px 12px; font-size: .85rem; font-weight: 600; }
  .card { background: #fff; border-radius: 16px; padding: 16px; margin-top: 14px; box-shadow: 0 6px 20px rgba(21,26,51,.08); display: grid; grid-template-columns: 44px 1fr; gap: 12px; }
  .ico { width: 44px; height: 44px; border-radius: 13px; display: grid; place-items: center; font-size: 1.4rem; background: #eceafd; }
  .name { font-weight: 700; font-size: 1.05rem; margin: 0; }
  .meta { color: #6b7194; font-size: .82rem; margin-top: 2px; }
  .stars { color: #f5a524; }
  .note { margin: 8px 0 0; font-size: .9rem; white-space: pre-wrap; color: #3d4263; }
  .leaflet-container { font-family: inherit; }
</style>
</head>
<body>
<header>
  <div class="wrap">
    <h1>🗺️ Diario dei luoghi</h1>
    <div class="sub">Esportato il ${stamp()} · ${places.length} luoghi</div>
    <div class="cats">${cats}</div>
  </div>
</header>
<div id="map"></div>
<div class="wrap">${cards}</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"><\/script>
<script>
  var places = ${markersJs};
  var map = L.map('map');
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  if (places.length) {
    var bounds = [];
    places.forEach(function(p) {
      var ico = L.divIcon({
        className: '',
        html: '<div style="width:30px;height:30px;background:#5b5bf0;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:grid;place-items:center;box-shadow:0 3px 8px rgba(0,0,0,.35)"><span style="transform:rotate(45deg);font-size:14px">' + p.ico + '</span></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });
      L.marker([p.lat, p.lng], { icon: ico })
        .addTo(map)
        .bindTooltip(p.ico + ' ' + p.name);
      bounds.push([p.lat, p.lng]);
    });
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  } else {
    map.setView([42.5, 12.5], 5);
  }
<\/script>
</body>
</html>`;

  download(
    `diario-luoghi-${stamp()}.html`,
    html,
    "text/html;charset=utf-8",
  );
  toast(`Diario esportato in HTML (mappa inclusa)`);
};

/* ---------- IMPORTA ---------- */
$("btnImport").onclick = () => $("file").click();
$("file").addEventListener("change", async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const j = JSON.parse(await f.text());
    const arr = Array.isArray(j) ? j : j.places;
    if (!Array.isArray(arr)) throw 0;
    const replace =
      places.length &&
      confirm(
        "OK = sostituisci i luoghi attuali\nAnnulla = unisci ai luoghi attuali (i duplicati vengono saltati)",
      );
    const base = replace ? [] : places.slice();
    const backup = places;
    places = base;
    let added = 0,
      skipped = 0;
    arr.forEach((p) => {
      if (!p || !p.name || !isFinite(p.lat) || !isFinite(p.lng)) return;
      if (findDup(+p.lat, +p.lng, p.name)) {
        skipped++;
        return;
      }
      let date = p.date || "";
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date)) date = isoDate(date);
      const cat = p.cat || p.category || "generico";
      places.push({
        id: uid(),
        created: p.created || Date.now(),
        name: String(p.name),
        date,
        rating: +p.rating || 0,
        note: p.note || "",
        cat: CATS[cat] ? cat : "generico",
        lat: +p.lat,
        lng: +p.lng,
      });
      added++;
    });
    if (!added && !replace) places = backup;
    save();
    render();
    if (places.length)
      map.fitBounds(
        places.map((p) => [p.lat, p.lng]),
        { padding: [40, 40], maxZoom: 12 },
      );
    toast(`${added} importati${skipped ? `, ${skipped} già presenti` : ""}`);
  } catch {
    toast("File JSON non valido");
  }
  e.target.value = "";
});

/* ---------- SVUOTA ---------- */
$("btnClear").onclick = () => {
  if (
    places.length &&
    confirm(
      "Eliminare TUTTI i luoghi? Scarica prima un JSON se vuoi un backup.",
    )
  ) {
    places = [];
    activeId = null;
    save();
    render();
    toast("Tutti i luoghi eliminati");
  }
};

/* ---------- avvio ---------- */
render();
setView(localStorage.getItem(VKEY) === "list" ? "list" : "split");
if (places.length)
  map.fitBounds(
    places.map((p) => [p.lat, p.lng]),
    { padding: [40, 40], maxZoom: 10 },
  );