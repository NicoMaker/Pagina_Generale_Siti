((global) => {
  "use strict";
  const LS = (global.LS = global.LS || {});

  const MESI = [
    "gen",
    "feb",
    "mar",
    "apr",
    "mag",
    "giu",
    "lug",
    "ago",
    "set",
    "ott",
    "nov",
    "dic",
  ];
  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function fmtDate(d, withTime) {
    let s = `${d.d} ${MESI[d.mo - 1]} ${d.y}`;
    if (withTime) s += ` · ${pad(d.h)}:${pad(d.mi)}`;
    return s;
  }
  function fmtCoords(g) {
    return `${Math.abs(g.lat).toFixed(4)}° ${g.lat >= 0 ? "N" : "S"}, ${Math.abs(g.lon).toFixed(4)}° ${g.lon >= 0 ? "E" : "W"}`;
  }
  function wantsLookup(s) {
    return !!(s.infoEnabled && s.infoPlace && s.infoLookup);
  }

  // Righe di testo da scrivere sulla foto (max 2): data/ora e luogo.
  function lines(item, s) {
    if (!s.infoEnabled || !item.exif) return [];
    const e = item.exif,
      out = [];
    if (s.infoDate && e.date) out.push(fmtDate(e.date, s.infoTime));
    if (s.infoPlace && e.gps) {
      if (s.infoLookup) {
        // Con la ricerca attiva si aspetta il nome; se non lo trova, coordinate.
        if (item.placeDone) out.push(item.place || fmtCoords(e.gps));
      } else {
        out.push(fmtCoords(e.gps));
      }
    }
    return out;
  }

  // Descrizione breve per la scheda dell'immagine.
  function summary(item) {
    const e = item.exif;
    if (!e || (!e.date && !e.gps)) return null;
    const parts = [];
    if (e.date) parts.push(fmtDate(e.date, true));
    if (e.gps) parts.push(item.place || fmtCoords(e.gps));
    return parts.join(" · ");
  }

  LS.stamp = { lines, summary, fmtDate, fmtCoords, wantsLookup };
})(window);
