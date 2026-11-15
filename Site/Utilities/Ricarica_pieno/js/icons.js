/* Ricarica Pieno – icons.js
 * Icone veicolo in SVG generate interamente in JS, con colore principale e secondario.
 * Uso: Icons.svg("auto", "#2563eb", "#111827")
 */
(function (g) {
  "use strict";

  var GLASS = "#e0f2fe";
  var TYRE = "#111827";
  var HUB = "#d1d5db";

  /* ---------- utilità colore ---------- */
  var ctx = null;
  function normHex(str) {
    var s = String(str == null ? "" : str).trim().toLowerCase();
    if (!s) return "";
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/.exec(s);
    if (m) {
      var h = m[1];
      if (h.length === 3)
        h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
      return "#" + h;
    }
    // nomi CSS (rosso non esiste: usa red, blue, orange, teal…)
    try {
      if (!ctx) ctx = document.createElement("canvas").getContext("2d");
      ctx.fillStyle = "#000001";
      ctx.fillStyle = s;
      var v = ctx.fillStyle;
      if (/^#[0-9a-f]{6}$/i.test(v)) {
        if (v === "#000001" && s !== "#000001") return "";
        return v.toLowerCase();
      }
      var r = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(v);
      if (r)
        return (
          "#" +
          [r[1], r[2], r[3]]
            .map(function (n) {
              return ("0" + (+n).toString(16)).slice(-2);
            })
            .join("")
        );
    } catch (e) {}
    return "";
  }

  function rgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
  }
  function toHex(a) {
    return (
      "#" +
      a
        .map(function (n) {
          return ("0" + Math.max(0, Math.min(255, Math.round(n))).toString(16)).slice(-2);
        })
        .join("")
    );
  }
  /** amt > 0 schiarisce, amt < 0 scurisce (-1..1) */
  function shade(hex, amt) {
    var c = rgb(hex),
      t = amt < 0 ? 0 : 255,
      p = Math.abs(amt);
    return toHex(c.map(function (v) { return v + (t - v) * p; }));
  }
  function contrast(hex) {
    var c = rgb(hex);
    return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255 > 0.62 ? "#0b1220" : "#ffffff";
  }

  /* ---------- pezzi ---------- */
  function wheel(cx, cy, r) {
    return (
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + TYRE + '"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.45).toFixed(1) + '" fill="' + HUB + '"/>'
    );
  }
  function waves(b) {
    return (
      '<path d="M3 37.500c4-2 8-2 12 0s8 2 12 0 8-2 12 0 8 2 12 0 6-1.500 6-1.500" fill="none" stroke="' +
      b + '" stroke-width="1.800" stroke-linecap="round" opacity=".55"/>'
    );
  }

  /* ---------- icone (viewBox 0 0 64 40) ---------- */
  var DRAW = {
    auto: function (a, b) {
      return (
        '<path d="M4 28v-5c0-1.600 1-2.800 2.600-3.200L16 18l6-6.500c.9-1 2.100-1.500 3.400-1.500h13c1.500 0 2.800.7 3.800 1.800L48 18l9 2c1.800.4 3 2 3 3.800V28c0 1.100-.9 2-2 2H6c-1.100 0-2-.9-2-2z" fill="' + a + '"/>' +
        '<path d="M23 18l4-5h6v5zM35.500 13h4.200c.7 0 1.300.3 1.800.8L45 18H35.500z" fill="' + GLASS + '"/>' +
        '<rect x="4" y="24.500" width="56" height="2.200" fill="' + b + '"/>' +
        '<rect x="56" y="21.500" width="4" height="2" rx="1" fill="#fde68a"/>' +
        wheel(17, 30, 5.5) + wheel(47, 30, 5.5)
      );
    },
    suv: function (a, b) {
      return (
        '<rect x="9" y="10.500" width="27" height="2" rx="1" fill="' + b + '"/>' +
        '<path d="M4 28V15c0-1.100.9-2 2-2h30c1.200 0 2.200.5 3 1.300L46 19l10 2c2 .4 4 2 4 4v3c0 1.100-.9 2-2 2H6c-1.100 0-2-.9-2-2z" fill="' + a + '"/>' +
        '<path d="M9 15.500h12V21H9zM23.500 15.500H36l6.500 5.500H23.500z" fill="' + GLASS + '"/>' +
        '<rect x="4" y="25" width="56" height="2.200" fill="' + b + '"/>' +
        '<rect x="56" y="22" width="4" height="2" rx="1" fill="#fde68a"/>' +
        wheel(17, 30, 6) + wheel(48, 30, 6)
      );
    },
    sportiva: function (a, b) {
      return (
        '<path d="M3 28v-4c0-1.200.8-2.200 2-2.500L17 19l8-5c1-.6 2.100-1 3.300-1h8c1.600 0 3 .6 4.200 1.600L47 19.500l10 2c1.700.4 3 1.900 3 3.600V28c0 1.100-.9 2-2 2H5c-1.100 0-2-.9-2-2z" fill="' + a + '"/>' +
        '<path d="M26 18.500l3.800-3.800c.5-.4 1-.7 1.700-.7H37c.8 0 1.500.3 2 .8l4 3.700z" fill="' + GLASS + '"/>' +
        '<rect x="3" y="24.500" width="57" height="1.800" fill="' + b + '"/>' +
        '<path d="M3 21.500h5v2H3z" fill="' + b + '"/>' +
        '<rect x="56" y="22" width="4" height="1.800" rx=".9" fill="#fde68a"/>' +
        wheel(16, 30, 5) + wheel(48, 30, 5.500)
      );
    },
    pickup: function (a, b) {
      return (
        '<path d="M39 17h18c1.100 0 2 .9 2 2v9c0 1.100-.9 2-2 2H39z" fill="' + b + '"/>' +
        '<path d="M4 28v-6c0-1.500 1-2.700 2.400-3.100L13 17l5-5c.7-.7 1.600-1 2.600-1H30c1 0 1.900.4 2.600 1l4.400 5h1v11c0 1.100-.9 2-2 2H6c-1.100 0-2-.9-2-2z" fill="' + a + '"/>' +
        '<path d="M16 17.500l3.500-4H30.500l4 4z" fill="' + GLASS + '"/>' +
        '<rect x="4" y="24.500" width="35" height="2" fill="' + b + '" opacity=".8"/>' +
        wheel(17, 30, 5.500) + wheel(49, 30, 5.500)
      );
    },
    furgone: function (a, b) {
      return (
        '<path d="M4 28V12c0-1.100.9-2 2-2h32c1.200 0 2.300.6 3 1.500L47 19l9 2c2 .4 4 2 4 4v3c0 1.100-.9 2-2 2H6c-1.100 0-2-.9-2-2z" fill="' + a + '"/>' +
        '<path d="M40 13h1.500L46 19H40z" fill="' + GLASS + '"/>' +
        '<rect x="4" y="22" width="35" height="3" fill="' + b + '"/>' +
        '<rect x="57" y="23" width="3" height="2" rx="1" fill="#fde68a"/>' +
        wheel(17, 30, 5.500) + wheel(48, 30, 5.500)
      );
    },
    camper: function (a, b) {
      return (
        '<rect x="3" y="7" width="49" height="23" rx="4" fill="' + a + '"/>' +
        '<path d="M50 14h5c1 0 1.900.5 2.500 1.300L61 20c.6.700 1 1.600 1 2.500V28c0 1.100-.9 2-2 2H50z" fill="' + a + '"/>' +
        '<rect x="8" y="11" width="14" height="8" rx="1.500" fill="' + GLASS + '"/>' +
        '<rect x="25" y="11" width="11" height="8" rx="1.500" fill="' + GLASS + '"/>' +
        '<path d="M53 16.500h3l3 3.500h-6z" fill="' + GLASS + '"/>' +
        '<rect x="3" y="23" width="59" height="3" fill="' + b + '"/>' +
        '<rect x="40" y="11" width="6" height="14" rx="1" fill="' + b + '" opacity=".6"/>' +
        wheel(15, 30, 5.500) + wheel(49, 30, 5.500)
      );
    },
    camion: function (a, b) {
      return (
        '<rect x="3" y="8" width="38" height="22" rx="2" fill="' + b + '"/>' +
        '<path d="M43 14h9c1 0 1.900.5 2.500 1.300L60 22v6c0 1.100-.9 2-2 2H43z" fill="' + a + '"/>' +
        '<path d="M46 17h5.500l4 5H46z" fill="' + GLASS + '"/>' +
        '<rect x="3" y="28" width="57" height="3" fill="#374151"/>' +
        wheel(12, 31, 5) + wheel(24, 31, 5) + wheel(51, 31, 5)
      );
    },
    moto: function (a, b) {
      return (
        '<circle cx="14" cy="29" r="7" fill="none" stroke="' + TYRE + '" stroke-width="3"/>' +
        '<circle cx="50" cy="29" r="7" fill="none" stroke="' + TYRE + '" stroke-width="3"/>' +
        '<circle cx="14" cy="29" r="2" fill="' + HUB + '"/><circle cx="50" cy="29" r="2" fill="' + HUB + '"/>' +
        '<path d="M14 29L30 25" stroke="' + b + '" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M50 29L43 12" stroke="#6b7280" stroke-width="2.500" stroke-linecap="round"/>' +
        '<rect x="27" y="21" width="13" height="8" rx="2" fill="' + b + '"/>' +
        '<path d="M24 14h13l4.500 5-3 5H26l-3.500-4z" fill="' + a + '"/>' +
        '<path d="M10.500 19c0-1 .8-1.800 1.800-1.800H24c1 0 1.500 1 1 1.800L24 21H12.500c-1.100 0-2-.9-2-2z" fill="' + TYRE + '"/>' +
        '<path d="M40 11.500h7" stroke="#374151" stroke-width="2.800" stroke-linecap="round"/>' +
        '<circle cx="46.500" cy="15.500" r="2.200" fill="#fde68a"/>' +
        '<path d="M30 28.500L17 27.500" stroke="#9ca3af" stroke-width="2.200" stroke-linecap="round"/>'
      );
    },
    scooter: function (a, b) {
      return (
        '<path d="M8 28c0-5 3-9 8-9h7v9z" fill="' + a + '"/>' +
        '<path d="M10 17c0-1.100.9-2 2-2h10c1.100 0 2 .9 2 2v2H10z" fill="' + TYRE + '"/>' +
        '<rect x="22" y="26" width="23" height="3.500" rx="1.500" fill="' + b + '"/>' +
        '<path d="M44 27L42 11h4.500l3.500 16z" fill="' + a + '"/>' +
        '<path d="M47 22l4 9" stroke="#6b7280" stroke-width="2.500" stroke-linecap="round"/>' +
        '<path d="M40 10h8" stroke="#374151" stroke-width="2.800" stroke-linecap="round"/>' +
        '<circle cx="49" cy="14.500" r="2.200" fill="#fde68a"/>' +
        wheel(14, 31, 5.500) + wheel(51, 31, 5.500)
      );
    },
    trattore: function (a, b) {
      return (
        '<rect x="40" y="8" width="2.500" height="9" fill="#374151"/>' +
        '<path d="M28 28V17c0-1.100.9-2 2-2h14c1.100 0 2 .9 2 2v11z" fill="' + a + '"/>' +
        '<path d="M8 26V9c0-1.100.9-2 2-2h14c1.100 0 2 .9 2 2v17z" fill="' + a + '"/>' +
        '<rect x="12" y="10.500" width="11" height="9" rx="1.500" fill="' + GLASS + '"/>' +
        '<rect x="8" y="24" width="38" height="3" fill="' + b + '"/>' +
        '<circle cx="16" cy="28" r="10" fill="' + TYRE + '"/><circle cx="16" cy="28" r="5.500" fill="' + b + '"/><circle cx="16" cy="28" r="2" fill="' + HUB + '"/>' +
        wheel(50, 31, 6)
      );
    },
    barca: function (a, b) {
      return (
        '<rect x="31" y="3" width="2" height="25" fill="#6b7280"/>' +
        '<path d="M34 5v21h17z" fill="' + b + '"/>' +
        '<path d="M30 8v18H14z" fill="#e5e7eb"/>' +
        '<path d="M6 28h52l-6 8H13z" fill="' + a + '"/>' +
        waves(b)
      );
    },
    motoscafo: function (a, b) {
      return (
        '<path d="M4 24h52l5 3-6 8H12c-4 0-7-4-8-11z" fill="' + a + '"/>' +
        '<path d="M20 24l5-9h14l6 9z" fill="' + b + '"/>' +
        '<path d="M27 23l3-6h8l3.500 6z" fill="' + GLASS + '"/>' +
        '<rect x="8" y="28.500" width="46" height="2" fill="#fff" opacity=".8"/>' +
        waves(b)
      );
    },
  };

  var LIST = [
    { k: "auto", l: "Auto", t: "auto" },
    { k: "suv", l: "SUV", t: "auto" },
    { k: "sportiva", l: "Sportiva", t: "auto" },
    { k: "pickup", l: "Pickup", t: "furgone" },
    { k: "furgone", l: "Furgone", t: "furgone" },
    { k: "camper", l: "Camper", t: "furgone" },
    { k: "camion", l: "Camion", t: "camion" },
    { k: "moto", l: "Moto", t: "moto" },
    { k: "scooter", l: "Scooter", t: "scooter" },
    { k: "trattore", l: "Trattore", t: "trattore" },
    { k: "barca", l: "Barca a vela", t: "barca" },
    { k: "motoscafo", l: "Motoscafo", t: "barca" },
  ];

  var TYPE_ICON = {
    auto: "auto",
    moto: "moto",
    scooter: "scooter",
    furgone: "furgone",
    camion: "camion",
    trattore: "trattore",
    barca: "barca",
    altro: "auto",
  };

  /** emoji delle vecchie versioni → chiave icona */
  var EMOJI = {
    "🚗": "auto",
    "🚘": "auto",
    "🚙": "suv",
    "🛻": "pickup",
    "🚐": "furgone",
    "🚚": "camion",
    "🏍️": "moto",
    "🏍": "moto",
    "🛵": "scooter",
    "🚜": "trattore",
    "⛵": "barca",
    "🛥️": "motoscafo",
    "🛥": "motoscafo",
  };

  var PRESETS = [
    ["Verde acqua", "#0f766e", ""],
    ["Blu", "#2563eb", ""],
    ["Arancio", "#c2410c", ""],
    ["Viola", "#7c3aed", ""],
    ["Rosso", "#be123c", ""],
    ["Verde", "#4d7c0f", ""],
    ["Ciano", "#0e7490", ""],
    ["Ocra", "#a16207", ""],
    ["Nero", "#1f2937", ""],
    ["Argento", "#9ca3af", ""],
    ["Rosso/Nero", "#dc2626", "#111827"],
    ["Blu/Bianco", "#2563eb", "#e5e7eb"],
    ["Giallo/Nero", "#facc15", "#111827"],
    ["Verde/Oro", "#15803d", "#eab308"],
    ["Arancio/Blu", "#f97316", "#1d4ed8"],
    ["Viola/Rosa", "#7c3aed", "#ec4899"],
  ];

  function find(key) {
    for (var i = 0; i < LIST.length; i++) if (LIST[i].k === key) return LIST[i];
    return LIST[0];
  }

  /** SVG completo. c2 facoltativo: se manca usa una variante più scura di c1. */
  function svg(key, c1, c2, cls) {
    var a = normHex(c1) || "#0f766e";
    var b = normHex(c2) || shade(a, -0.28);
    var k = DRAW[key] ? key : "auto";
    return (
      '<svg class="vi ' + (cls || "") + '" viewBox="0 0 64 40" role="img" aria-label="' +
      find(k).l + '" xmlns="http://www.w3.org/2000/svg">' + DRAW[k](a, b) + "</svg>"
    );
  }

  /** Icona del veicolo con i suoi colori. */
  function forVehicle(v, cls) {
    return svg(v && v.icon, v && v.color, v && v.color2, cls);
  }

  g.Icons = {
    svg: svg,
    forVehicle: forVehicle,
    list: LIST,
    find: find,
    typeIcon: TYPE_ICON,
    emoji: EMOJI,
    presets: PRESETS,
    normHex: normHex,
    shade: shade,
    contrast: contrast,
    has: function (k) {
      return !!DRAW[k];
    },
  };
})(typeof window !== "undefined" ? window : globalThis);