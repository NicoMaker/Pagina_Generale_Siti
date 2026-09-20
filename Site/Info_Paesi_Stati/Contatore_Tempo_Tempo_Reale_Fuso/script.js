"use strict";

/* ---------------------------------------------------------------
   Dati
   --------------------------------------------------------------- */
const ZONES = [
  { tz: "Pacific/Midway", city: "Midway" },
  { tz: "Pacific/Honolulu", city: "Honolulu" },
  { tz: "America/Anchorage", city: "Anchorage" },
  { tz: "America/Los_Angeles", city: "Los Angeles" },
  { tz: "America/Denver", city: "Denver" },
  { tz: "America/Chicago", city: "Chicago" },
  { tz: "America/New_York", city: "New York" },
  { tz: "America/Caracas", city: "Caracas" },
  { tz: "America/Santiago", city: "Santiago" },
  { tz: "America/Sao_Paulo", city: "San Paolo" },
  { tz: "Atlantic/Azores", city: "Azzorre" },
  { tz: "Europe/London", city: "Londra" },
  { tz: "Europe/Rome", city: "Roma" },
  { tz: "Europe/Paris", city: "Parigi" },
  { tz: "Europe/Helsinki", city: "Helsinki" },
  { tz: "Europe/Moscow", city: "Mosca" },
  { tz: "Asia/Dubai", city: "Dubai" },
  { tz: "Asia/Karachi", city: "Karachi" },
  { tz: "Asia/Dhaka", city: "Dhaka" },
  { tz: "Asia/Jakarta", city: "Jakarta" },
  { tz: "Asia/Shanghai", city: "Shanghai" },
  { tz: "Asia/Tokyo", city: "Tokyo" },
  { tz: "Australia/Sydney", city: "Sydney" },
  { tz: "Pacific/Noumea", city: "Noumea" },
  { tz: "Pacific/Auckland", city: "Auckland" },
];

// Colore della barra del browser sul telefono, per ogni fascia del giorno
const PHASE_THEME = {
  night: "#141a4a",
  dawn: "#f4c2a6",
  day: "#bfddf2",
  dusk: "#ec9a78",
};

const HOURS_BEFORE = 24; // ore mostrate prima di "oggi" nella timeline
const TRACK_CELLS = 72; // ieri + oggi + domani

/* ---------------------------------------------------------------
   Utilità per l'ora
   --------------------------------------------------------------- */
const formatters = new Map();

// Offset (in minuti) di un fuso rispetto a UTC in questo momento.
// Tiene conto in automatico dell'ora legale.
function getOffsetMinutes(timezone, date) {
  let dtf = formatters.get(timezone);
  if (!dtf) {
    dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    formatters.set(timezone, dtf);
  }

  const parts = {};
  dtf.formatToParts(date).forEach((p) => {
    parts[p.type] = p.value;
  });

  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  const realUTC = Math.floor(date.getTime() / 1000) * 1000;
  return Math.round((asUTC - realUTC) / 60000);
}

// Ora locale di un fuso: ore, minuti, secondi, offset e numero del giorno
function localParts(timezone, date) {
  const off = getOffsetMinutes(timezone, date);
  const shifted = new Date(date.getTime() + off * 60000);
  return {
    off,
    h: shifted.getUTCHours(),
    m: shifted.getUTCMinutes(),
    s: shifted.getUTCSeconds(),
    dayNum: Math.floor(shifted.getTime() / 86400000),
  };
}

const pad = (n) => String(n).padStart(2, "0");

// Fascia del giorno: notte, alba, giorno, tramonto
function phaseOfHour(hour) {
  if (hour >= 21 || hour < 5) return "night";
  if (hour < 8) return "dawn";
  if (hour < 17) return "day";
  return "dusk";
}

// "UTC+2", "UTC-4", "UTC+5:30"
function formatUTC(minutes) {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? ":" + pad(m) : ""}`;
}

// Differenza tra due offset: numero grande + unità ("+6" "ore", "-3:30" "ore")
function deltaParts(diff) {
  const abs = Math.abs(diff);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const sign = diff > 0 ? "+" : diff < 0 ? "-" : "";
  return {
    num: sign + h + (m ? ":" + pad(m) : ""),
    unit: h === 1 && m === 0 ? "ora" : "ore",
  };
}

// Versione corta per la lista: "+6 h", "-5 h", "stessa ora"
function deltaShort(diff) {
  return diff === 0 ? "stessa ora" : `${deltaParts(diff).num} h`;
}

function cityFromTz(tz) {
  return tz.split("/").pop().replace(/_/g, " ");
}

function detectUserTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      new Intl.DateTimeFormat("it-IT", { timeZone: tz }); // verifica che sia valido
      return tz;
    }
  } catch (e) {
    /* usa il fuso di riserva */
  }
  return "Europe/Rome";
}

function setText(el, text) {
  if (el.textContent !== text) el.textContent = text;
}

/* ---------------------------------------------------------------
   Stato e riferimenti al DOM
   --------------------------------------------------------------- */
const $ = (selector) => document.querySelector(selector);

const sky = $("#sky");
const clock = $("#clock");
const cityEl = $("#city");
const utcEl = $("#utc");
const dateEl = $("#date");
const deltaNum = $("#delta-num");
const deltaUnit = $("#delta-unit");
const deltaRef = $("#delta-ref");
const deltaDay = $("#delta-day");
const meLabel = $("#me-label");
const meTime = $("#me-time");
const selLabel = $("#sel-label");
const selTime = $("#sel-time");
const trackMe = $("#track-me");
const trackSel = $("#track-sel");
const zoneList = $("#zone-list");
const searchInput = $("#search");
const emptyMsg = $("#empty");
const themeMeta = document.querySelector('meta[name="theme-color"]');

const meTz = detectUserTimezone();

// Se il fuso dell'utente non è nella lista, lo aggiungo in cima
const zones = ZONES.map((z) => ({ ...z }));
if (!zones.some((z) => z.tz === meTz)) {
  zones.unshift({ tz: meTz, city: cityFromTz(meTz) });
}
const zoneByTz = new Map(zones.map((z) => [z.tz, z]));
const meZone = zoneByTz.get(meTz);

const state = { selectedTz: meTz, dateKey: "" };

/* ---------------------------------------------------------------
   Orologio grande: cifre a larghezza fissa
   --------------------------------------------------------------- */
const digitEls = [];
"00:00:00".split("").forEach((ch, i) => {
  const span = document.createElement("span");
  span.className = ch === ":" ? "sep" : i >= 6 ? "dig sec" : "dig";
  span.textContent = ch;
  clock.appendChild(span);
  digitEls.push(span);
});

/* ---------------------------------------------------------------
   Timeline
   --------------------------------------------------------------- */
function buildTrack(track, tz, now) {
  track.textContent = "";
  const frag = document.createDocumentFragment();

  for (let i = 0; i < TRACK_CELLS; i++) {
    const hour = i % 24;
    const dayOffset = Math.floor(i / 24) - 1; // -1 ieri, 0 oggi, +1 domani

    const cell = document.createElement("div");
    cell.className = "cell " + phaseOfHour(hour) + (hour === 0 ? " mid" : "");

    const hourEl = document.createElement("span");
    hourEl.textContent = pad(hour);
    cell.appendChild(hourEl);

    if (hour === 0) {
      const dayEl = document.createElement("span");
      dayEl.className = "cell-d";
      dayEl.textContent = new Date(
        now.getTime() + dayOffset * 86400000,
      ).toLocaleDateString("it-IT", { timeZone: tz, weekday: "short" });
      cell.appendChild(dayEl);
    }

    frag.appendChild(cell);
  }

  track.appendChild(frag);
}

// Sposta la striscia in modo che "adesso" sia sempre sotto la linea centrale
function positionTrack(track, tz, p, now) {
  const key = tz + "|" + p.dayNum;
  if (track.dataset.key !== key) {
    buildTrack(track, tz, now);
    track.dataset.key = key;
  }

  const cellWidth = track.firstElementChild.offsetWidth;
  const position = HOURS_BEFORE + p.h + p.m / 60 + p.s / 3600;
  const center = track.parentElement.clientWidth / 2;
  track.style.transform = `translate3d(${(center - position * cellWidth).toFixed(2)}px, 0, 0)`;
}

/* ---------------------------------------------------------------
   Lista dei fusi orari
   --------------------------------------------------------------- */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

zones.forEach((z) => {
  const li = el("li");
  const btn = el("button", "zone");
  btn.type = "button";
  btn.dataset.tz = z.tz;
  btn.setAttribute("aria-pressed", "false");

  const phase = el("span", "zone-phase");
  phase.setAttribute("aria-hidden", "true");

  const main = el("span");
  const city = el("span", "zone-city", z.city);
  if (z.tz === meTz) city.appendChild(el("span", "zone-me", "Tu"));
  const utc = el("span", "zone-utc");
  main.append(city, utc);

  const side = el("span", "zone-side");
  const time = el("span", "zone-time");
  const delta = el("span", "zone-delta");
  side.append(time, delta);

  btn.append(phase, main, side);
  li.appendChild(btn);
  zoneList.appendChild(li);

  z.refs = { li, btn, phase, utc, time, delta };
});

function selectZone(tz, { scroll = true } = {}) {
  state.selectedTz = tz;
  zones.forEach((z) => {
    z.refs.btn.setAttribute("aria-pressed", String(z.tz === tz));
  });
  tick();

  // Su schermi stretti l'elenco è sotto il pannello: torno su a vedere il risultato
  if (scroll && window.matchMedia("(max-width: 999px)").matches) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }
}

zoneList.addEventListener("click", (event) => {
  const btn = event.target.closest(".zone");
  if (btn) selectZone(btn.dataset.tz);
});

/* Ricerca: per nome della città, oppure per offset ("UTC+2", "+2") */
const normalize = (s) => s.toLowerCase().replace(/[\s_/]+/g, "");

function matchesQuery(z, query, now) {
  if (!query) return true;
  const utc = formatUTC(getOffsetMinutes(z.tz, now)).toLowerCase();

  if (/^(utc|gmt)?[+-]\d/.test(query)) {
    const target = query.replace(/^(utc|gmt)/, "");
    const wanted = "utc" + target;
    return utc === wanted || utc.startsWith(wanted + ":");
  }
  return normalize(z.city + z.tz + utc).includes(query);
}

function applyFilter() {
  const query = normalize(searchInput.value);
  const now = new Date();
  let visible = 0;
  zones.forEach((z) => {
    const show = matchesQuery(z, query, now);
    z.refs.li.hidden = !show;
    if (show) visible++;
  });
  emptyMsg.hidden = visible > 0;
}

searchInput.addEventListener("input", applyFilter);

/* ---------------------------------------------------------------
   Aggiornamento ogni secondo
   --------------------------------------------------------------- */
function tick() {
  const now = new Date();
  const sel = zoneByTz.get(state.selectedTz);
  const p = localParts(sel.tz, now);
  const me = localParts(meTz, now);
  const diff = p.off - me.off;

  // Orologio grande
  const timeStr = `${pad(p.h)}:${pad(p.m)}:${pad(p.s)}`;
  digitEls.forEach((node, i) => setText(node, timeStr[i]));

  const spoken = `Ore ${pad(p.h)}:${pad(p.m)}, ${sel.city}`;
  if (clock.getAttribute("aria-label") !== spoken) {
    clock.setAttribute("aria-label", spoken);
  }

  // Colori del cielo in base all'ora del fuso scelto
  const phase = phaseOfHour(p.h);
  if (sky.dataset.phase !== phase) {
    sky.dataset.phase = phase;
    if (themeMeta) themeMeta.setAttribute("content", PHASE_THEME[phase]);
  }

  // Città, UTC e data
  setText(cityEl, sel.city);
  setText(utcEl, formatUTC(p.off));

  const dateKey = sel.tz + "|" + p.dayNum;
  if (state.dateKey !== dateKey) {
    state.dateKey = dateKey;
    const text = now.toLocaleDateString("it-IT", {
      timeZone: sel.tz,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    dateEl.textContent = text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Differenza di ore rispetto a te
  const d = deltaParts(diff);
  setText(deltaNum, d.num);
  setText(deltaUnit, d.unit);

  const meDescription = `${meZone.city}, ${formatUTC(me.off)}`;
  if (sel.tz === meTz) {
    setText(deltaRef, `Questo è il tuo fuso orario (${meDescription})`);
    deltaDay.hidden = true;
  } else {
    setText(deltaRef, `Rispetto al tuo orario (${meDescription})`);
    const dayDiff = p.dayNum - me.dayNum;
    setText(
      deltaDay,
      dayDiff > 0
        ? "Lì è già domani"
        : dayDiff < 0
          ? "Lì è ancora ieri"
          : "Lì è lo stesso giorno",
    );
    deltaDay.hidden = false;
  }

  // Timeline
  setText(meLabel, `Tu, ${meZone.city}`);
  setText(meTime, `${pad(me.h)}:${pad(me.m)}`);
  setText(selLabel, sel.city);
  setText(selTime, `${pad(p.h)}:${pad(p.m)}`);
  positionTrack(trackMe, meTz, me, now);
  positionTrack(trackSel, sel.tz, p, now);

  // Lista
  zones.forEach((z) => {
    const zp = localParts(z.tz, now);
    setText(z.refs.time, `${pad(zp.h)}:${pad(zp.m)}`);
    setText(z.refs.utc, formatUTC(zp.off));
    setText(z.refs.delta, deltaShort(zp.off - me.off));
    const zPhase = phaseOfHour(zp.h);
    if (z.refs.phase.dataset.phase !== zPhase) {
      z.refs.phase.dataset.phase = zPhase;
    }
  });
}

// Aggiorna esattamente allo scoccare di ogni secondo
function loop() {
  tick();
  setTimeout(loop, 1000 - (Date.now() % 1000) + 5);
}

window.addEventListener("resize", tick);

selectZone(meTz, { scroll: false });
loop();