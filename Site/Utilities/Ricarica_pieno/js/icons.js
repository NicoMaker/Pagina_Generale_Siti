/* Ricarica Pieno – icons.js
 * Icone veicolo moderne in SVG, generate interamente in JS, con colore principale e secondario.
 * Uso: Icons.svg("auto", "#2563eb", "#111827")  ·  colori anche a parole: "rosso", "blu", "teal"
 */
(function (g) {
  "use strict";

  /* ---------- colori ---------- */
  var IT = {
    rosso: "#dc2626",
    rossa: "#dc2626",
    bordeaux: "#7f1d1d",
    rosa: "#ec4899",
    fucsia: "#d946ef",
    magenta: "#c026d3",
    arancio: "#f97316",
    arancione: "#f97316",
    giallo: "#facc15",
    gialla: "#facc15",
    oro: "#eab308",
    ocra: "#a16207",
    verde: "#16a34a",
    lime: "#84cc16",
    "verde acqua": "#0f766e",
    "verde scuro": "#14532d",
    "verde chiaro": "#4ade80",
    smeraldo: "#059669",
    turchese: "#14b8a6",
    ciano: "#06b6d4",
    azzurro: "#38bdf8",
    azzurra: "#38bdf8",
    celeste: "#7dd3fc",
    blu: "#2563eb",
    "blu scuro": "#1e3a8a",
    "blu notte": "#172554",
    viola: "#7c3aed",
    lilla: "#c084fc",
    marrone: "#92400e",
    bronzo: "#b45309",
    beige: "#d6c7a1",
    panna: "#fef3c7",
    bianco: "#f8fafc",
    bianca: "#f8fafc",
    nero: "#111827",
    nera: "#111827",
    grigio: "#6b7280",
    grigia: "#6b7280",
    grafite: "#374151",
    argento: "#9ca3af",
    argentata: "#9ca3af",
    "rosso scuro": "#991b1b",
    "rosso fuoco": "#ef4444",
    "giallo oro": "#eab308",
    "arancio scuro": "#c2410c",
    "blu elettrico": "#0057ff",
    "blu chiaro": "#60a5fa",
    "grigio scuro": "#374151",
    "grigio chiaro": "#d1d5db",
    "viola scuro": "#5b21b6",
    "rosa chiaro": "#f9a8d4",
  };

  var ctx = null;
  function normHex(str) {
    var s = String(str == null ? "" : str)
      .trim()
      .toLowerCase();
    if (!s) return "";
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/.exec(s);
    if (m) {
      var h = m[1];
      if (h.length === 3)
        h =
          h.charAt(0) +
          h.charAt(0) +
          h.charAt(1) +
          h.charAt(1) +
          h.charAt(2) +
          h.charAt(2);
      return "#" + h;
    }
    var key = s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
    if (IT[key]) return IT[key];
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
          return (
            "0" + Math.max(0, Math.min(255, Math.round(n))).toString(16)
          ).slice(-2);
        })
        .join("")
    );
  }
  /** amt > 0 schiarisce, amt < 0 scurisce (-1..1) */
  function shade(hex, amt) {
    var c = rgb(hex),
      t = amt < 0 ? 0 : 255,
      p = Math.abs(amt);
    return toHex(
      c.map(function (v) {
        return v + (t - v) * p;
      }),
    );
  }
  function contrast(hex) {
    var c = rgb(hex);
    return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255 > 0.62
      ? "#0b1220"
      : "#ffffff";
  }

  /* ---------- pezzi riutilizzabili ---------- */
  var SHADOW =
    '<ellipse cx="32" cy="35.8" rx="27" ry="2" fill="#0f172a" opacity=".16"/>';

  /** corpo con sfumatura + riflesso di luce */
  function body(d, k) {
    return (
      '<path d="' +
      d +
      '" fill="' +
      k.A +
      '"/><path d="' +
      d +
      '" fill="' +
      k.H +
      '"/>'
    );
  }
  function glass(d, k) {
    return '<path d="' + d + '" fill="' + k.G + '"/>';
  }
  function line(d) {
    return (
      '<path d="' +
      d +
      '" fill="none" stroke="#0f172a" stroke-opacity=".22" stroke-width=".7" stroke-linecap="round"/>'
    );
  }
  function handle(x, y) {
    return (
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="3.6" height="1.1" rx=".55" fill="#fff" opacity=".7"/>'
    );
  }
  function lampF(x, y, w, h) {
    return (
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="' +
      h / 2 +
      '" fill="#fef08a"/>'
    );
  }
  function lampR(x, y, w, h) {
    return (
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="' +
      h / 2 +
      '" fill="#f87171"/>'
    );
  }
  function wheel(cx, cy, r, k) {
    var s =
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      (r + 1.3) +
      '" fill="#0f172a" opacity=".32"/>' +
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      r +
      '" fill="#111827"/>' +
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      (r * 0.66).toFixed(2) +
      '" fill="' +
      k.R +
      '"/>';
    for (var i = 0; i < 5; i++) {
      var an = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      s +=
        '<path d="M' +
        cx +
        " " +
        cy +
        "L" +
        (cx + Math.cos(an) * r * 0.62).toFixed(2) +
        " " +
        (cy + Math.sin(an) * r * 0.62).toFixed(2) +
        '" stroke="#6b7280" stroke-width=".7" stroke-linecap="round"/>';
    }
    return (
      s +
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      (r * 0.17).toFixed(2) +
      '" fill="#374151"/>'
    );
  }
  function waves(k) {
    return (
      '<path d="M3 37.500c4-2 8-2 12 0s8 2 12 0 8-2 12 0 8 2 12 0 6-1.500 6-1.500" fill="none" stroke="' +
      k.b +
      '" stroke-width="1.800" stroke-linecap="round" opacity=".5"/>' +
      '<path d="M8 39c3-1.300 6-1.300 9 0s6 1.300 9 0 6-1.300 9 0" fill="none" stroke="' +
      k.b +
      '" stroke-width="1.200" stroke-linecap="round" opacity=".28"/>'
    );
  }

  /* ---------- icone (viewBox 0 0 64 40) ---------- */
  var DRAW = {
    auto: function (k) {
      return (
        SHADOW +
        body(
          "M4 28v-5c0-1.600 1-2.800 2.600-3.200L16 18l6-6.500c.9-1 2.100-1.500 3.400-1.500h13c1.500 0 2.800.7 3.800 1.800L48 18l9 2c1.800.4 3 2 3 3.800V28c0 1.100-.9 2-2 2H6c-1.100 0-2-.9-2-2z",
          k,
        ) +
        '<rect x="4.500" y="25" width="55" height="2.200" rx="1.100" fill="' +
        k.C +
        '"/>' +
        glass(
          "M23 18l4-5h6v5zM35.500 13h4.200c.7 0 1.300.3 1.800.8L45 18H35.500z",
          k,
        ) +
        line("M34 13v5M33.500 18.500V25M17.500 22v3") +
        handle(37, 21) +
        handle(24, 21) +
        lampF(56.5, 21.5, 3.5, 2) +
        lampR(4, 21.5, 2.5, 2.2) +
        wheel(17, 30, 5.5, k) +
        wheel(47, 30, 5.5, k)
      );
    },
    citycar: function (k) {
      return (
        SHADOW +
        body(
          "M6 28v-6c0-1.500 1-2.800 2.500-3.200L15 17l5-5.200c.8-.8 1.800-1.300 3-1.300h11c1.400 0 2.600.6 3.500 1.600L43 17l10 2.200c2 .4 3.500 2.200 3.500 4.200V28c0 1.100-.9 2-2 2H8c-1.100 0-2-.9-2-2z",
          k,
        ) +
        '<rect x="6.500" y="25" width="50" height="2.200" rx="1.100" fill="' +
        k.C +
        '"/>' +
        glass(
          "M21 17l3.400-4.300H33V17zM35.500 12.700h2.200c.7 0 1.300.3 1.800.8L42 17h-6.500z",
          k,
        ) +
        line("M34.200 12.700V17M34 17.500V25") +
        handle(36.5, 21) +
        handle(22, 21) +
        lampF(53.5, 21.5, 3, 2) +
        lampR(6, 21.5, 2.2, 2.2) +
        wheel(17, 30, 5.5, k) +
        wheel(46, 30, 5.5, k)
      );
    },
    familiare: function (k) {
      return (
        SHADOW +
        '<rect x="19" y="9.600" width="24" height="1.300" rx=".65" fill="' +
        k.C +
        '"/>' +
        body(
          "M3 28v-5c0-1.600 1-2.800 2.600-3.200L12 18l3.500-5.500c.8-1.200 2-1.800 3.400-1.800H43c1.300 0 2.500.6 3.300 1.600L49 18l8 2c1.800.4 3 2 3 3.800V28c0 1.100-.9 2-2 2H5c-1.100 0-2-.9-2-2z",
          k,
        ) +
        '<rect x="4.500" y="25" width="55" height="2.200" rx="1.100" fill="' +
        k.C +
        '"/>' +
        glass(
          "M17 18l3-4.800H30V18zM32 13.200h10.500c.6 0 1.100.3 1.500.7L47 18H32z",
          k,
        ) +
        line("M31 13.200V18M31 18.500V25M12 22v3") +
        handle(35, 21.5) +
        handle(21, 21.5) +
        lampF(56.5, 21.5, 3.5, 2) +
        lampR(3, 21.5, 2.5, 2.2) +
        wheel(15, 30, 5.5, k) +
        wheel(47, 30, 5.5, k)
      );
    },
    cabrio: function (k) {
      return (
        SHADOW +
        '<path d="M22 19v-4.500c0-.8.6-1.400 1.400-1.400h1.600c.8 0 1.400.6 1.400 1.400V19zM30 19v-4.500c0-.8.6-1.400 1.400-1.400H33c.8 0 1.400.6 1.400 1.400V19z" fill="#1f2937"/>' +
        body(
          "M3 28v-4c0-1.200.8-2.200 2-2.500L18 19h20l7-3.500c.9-.4 1.900-.3 2.700.3L51 19l7 2.200c1.200.4 2 1.600 2 2.800V28c0 1.100-.9 2-2 2H5c-1.100 0-2-.9-2-2z",
          k,
        ) +
        '<rect x="3.500" y="25" width="56" height="2" rx="1" fill="' +
        k.C +
        '"/>' +
        glass("M40 18.600l4.600-4.300 1.700.4-.9 3.900z", k) +
        line("M38 19v6M16 22v3") +
        handle(33, 21.5) +
        lampF(56.5, 21.5, 3.5, 2) +
        lampR(3, 21.5, 2.5, 2) +
        wheel(16, 30, 5.2, k) +
        wheel(47, 30, 5.5, k)
      );
    },
    motosport: function (k) {
      return (
        SHADOW +
        '<circle cx="13" cy="29" r="7" fill="none" stroke="#111827" stroke-width="3"/>' +
        '<circle cx="51" cy="29" r="7" fill="none" stroke="#111827" stroke-width="3"/>' +
        '<circle cx="13" cy="29" r="4.500" fill="' +
        k.R +
        '" opacity=".9"/><circle cx="51" cy="29" r="4.500" fill="' +
        k.R +
        '" opacity=".9"/>' +
        '<circle cx="13" cy="29" r="1.500" fill="#374151"/><circle cx="51" cy="29" r="1.500" fill="#374151"/>' +
        '<path d="M51 29L45 15" stroke="#9ca3af" stroke-width="2.600" stroke-linecap="round"/>' +
        '<path d="M13 29L28 26" stroke="' +
        k.c +
        '" stroke-width="2.800" stroke-linecap="round"/>' +
        '<rect x="25" y="22" width="12" height="7" rx="2" fill="#1f2937"/>' +
        '<path d="M26 28.800L44 27.500" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>' +
        body(
          "M5 21c0-1.200.9-2.100 2.100-2.100H21l5-4.800c.6-.6 1.400-.9 2.200-.9H35l-.5 7.800H7.100C5.900 21 5 21 5 21z",
          k,
        ) +
        '<path d="M7 18.500h13l-1.500 1.800H7z" fill="#1f2937"/>' +
        '<path d="M33 25l2.200-10.500 9.800-2.500 5 3.800-1.800 3.200-2.200 6z" fill="' +
        k.B +
        '"/>' +
        '<path d="M33 25l2.200-10.500 9.800-2.500 5 3.800-1.800 3.200-2.200 6z" fill="' +
        k.H +
        '"/>' +
        glass("M38 13.800l5.800-1.700 1.600 1.300-6.600 1.600z", k) +
        '<path d="M43 11.500h6" stroke="#374151" stroke-width="2.400" stroke-linecap="round"/>' +
        lampF(49.5, 17, 2.5, 2) +
        lampR(3.5, 20, 1.8, 1.6)
      );
    },
    custom: function (k) {
      return (
        SHADOW +
        '<circle cx="12" cy="29" r="7" fill="none" stroke="#111827" stroke-width="3"/>' +
        '<circle cx="54" cy="29" r="7" fill="none" stroke="#111827" stroke-width="3"/>' +
        '<circle cx="12" cy="29" r="4.500" fill="' +
        k.R +
        '" opacity=".9"/><circle cx="54" cy="29" r="4.500" fill="' +
        k.R +
        '" opacity=".9"/>' +
        '<circle cx="12" cy="29" r="1.500" fill="#374151"/><circle cx="54" cy="29" r="1.500" fill="#374151"/>' +
        '<path d="M5 28a8 8 0 0 1 13-5" fill="none" stroke="' +
        k.c +
        '" stroke-width="2.200" stroke-linecap="round"/>' +
        '<path d="M54 29L41 14" stroke="#9ca3af" stroke-width="2.400" stroke-linecap="round"/>' +
        '<path d="M41 14l-1-5h-5" fill="none" stroke="#374151" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M12 29L28 26" stroke="' +
        k.c +
        '" stroke-width="2.800" stroke-linecap="round"/>' +
        '<rect x="23" y="22" width="14" height="7" rx="2.500" fill="' +
        k.C +
        '"/>' +
        '<path d="M22 29.500h22" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M10 20.500c0-1.100 5-2.600 12-2.600l1 3.500H10z" fill="#1f2937"/>' +
        body("M22 19c2-3.500 8-4.500 13-2.500l2.500 1.500-1.500 4.500H22z", k) +
        '<circle cx="46" cy="16.500" r="2.600" fill="#fef08a"/>' +
        '<path d="M48 21a8 8 0 0 1 7 6" fill="none" stroke="' +
        k.c +
        '" stroke-width="2" stroke-linecap="round"/>'
      );
    },
    suv: function (k) {
      return (
        SHADOW +
        '<rect x="9" y="10.500" width="27" height="2" rx="1" fill="' +
        k.B +
        '"/>' +
        body(
          "M4 28V15c0-1.100.9-2 2-2h30c1.200 0 2.200.5 3 1.300L46 19l10 2c2 .4 4 2 4 4v3c0 1.100-.9 2-2 2H6c-1.100 0-2-.9-2-2z",
          k,
        ) +
        '<rect x="4.500" y="25" width="55" height="2.200" rx="1.100" fill="' +
        k.C +
        '"/>' +
        glass("M9 15.500h12V21H9zM23.500 15.500H36l6.500 5.500H23.500z", k) +
        line("M22.200 15.500V25M36.500 21V25") +
        handle(26, 22) +
        handle(12, 22) +
        lampF(56.5, 22, 3.5, 2) +
        lampR(4, 19, 2.5, 3) +
        wheel(17, 30, 6, k) +
        wheel(48, 30, 6, k)
      );
    },
    sportiva: function (k) {
      return (
        SHADOW +
        body(
          "M3 28v-4c0-1.200.8-2.200 2-2.500L17 19l8-5c1-.6 2.100-1 3.300-1h8c1.600 0 3 .6 4.200 1.600L47 19.500l10 2c1.700.4 3 1.900 3 3.600V28c0 1.100-.9 2-2 2H5c-1.100 0-2-.9-2-2z",
          k,
        ) +
        '<rect x="3.500" y="24.500" width="56" height="1.800" rx=".9" fill="' +
        k.C +
        '"/>' +
        '<path d="M3 21.500h6l-1 2H3z" fill="' +
        k.B +
        '"/>' +
        glass(
          "M26 18.500l3.800-3.800c.5-.4 1-.7 1.700-.7H37c.8 0 1.500.3 2 .8l4 3.700z",
          k,
        ) +
        line("M35 14v4.500M30 19.500L28 25") +
        handle(33, 21.5) +
        lampF(56, 22, 4, 1.8) +
        lampR(3, 20.5, 2.5, 1.8) +
        wheel(16, 30, 5, k) +
        wheel(48, 30, 5.5, k)
      );
    },
    pickup: function (k) {
      return (
        SHADOW +
        '<path d="M39 17h18c1.100 0 2 .9 2 2v9c0 1.100-.9 2-2 2H39z" fill="' +
        k.B +
        '"/>' +
        '<path d="M39 17h18c1.100 0 2 .9 2 2v9c0 1.100-.9 2-2 2H39z" fill="' +
        k.H +
        '"/>' +
        '<rect x="41" y="19" width="16" height="2" rx="1" fill="#000" opacity=".16"/>' +
        body(
          "M4 28v-6c0-1.500 1-2.700 2.400-3.100L13 17l5-5c.7-.7 1.600-1 2.600-1H30c1 0 1.900.4 2.600 1l4.400 5h1v11c0 1.100-.9 2-2 2H6c-1.100 0-2-.9-2-2z",
          k,
        ) +
        glass("M16 17.500l3.500-4H30.500l4 4z", k) +
        line("M24 14v3.500M24 18V26") +
        handle(27, 21) +
        lampF(4, 20, 2.5, 2.2) +
        lampR(57, 21.5, 2, 2.5) +
        wheel(17, 30, 5.5, k) +
        wheel(49, 30, 5.5, k)
      );
    },
    furgone: function (k) {
      return (
        SHADOW +
        body(
          "M4 28V12c0-1.100.9-2 2-2h32c1.200 0 2.300.6 3 1.500L47 19l9 2c2 .4 4 2 4 4v3c0 1.100-.9 2-2 2H6c-1.100 0-2-.9-2-2z",
          k,
        ) +
        '<rect x="4.500" y="22" width="34" height="3" rx="1.500" fill="' +
        k.C +
        '"/>' +
        glass("M40 13h1.500L46 19H40z", k) +
        line("M39 10.500V28M22 11V22") +
        handle(41.5, 22) +
        lampF(57, 22.5, 3, 2) +
        lampR(4, 17, 2, 3) +
        wheel(17, 30, 5.5, k) +
        wheel(48, 30, 5.5, k)
      );
    },
    camper: function (k) {
      return (
        SHADOW +
        body("M7 7h41c2.200 0 4 1.800 4 4v19H3V11c0-2.200 1.800-4 4-4z", k) +
        body(
          "M50 14h5c1 0 1.900.5 2.500 1.300L61 20c.6.700 1 1.600 1 2.500V28c0 1.100-.9 2-2 2H50z",
          k,
        ) +
        '<rect x="3" y="23" width="59" height="3" rx="1.500" fill="' +
        k.C +
        '"/>' +
        '<rect x="8" y="11" width="14" height="8" rx="2" fill="' +
        k.G +
        '"/>' +
        '<rect x="25" y="11" width="11" height="8" rx="2" fill="' +
        k.G +
        '"/>' +
        glass("M53 16.500h3l3 3.500h-6z", k) +
        '<rect x="40" y="11" width="6.500" height="14" rx="1.500" fill="' +
        k.B +
        '" opacity=".75"/>' +
        '<rect x="9" y="4.500" width="18" height="2.500" rx="1.200" fill="' +
        k.B +
        '"/>' +
        lampF(60, 22, 2, 2) +
        lampR(3, 20, 1.8, 3) +
        wheel(15, 30, 5.5, k) +
        wheel(49, 30, 5.5, k)
      );
    },
    camion: function (k) {
      return (
        SHADOW +
        '<rect x="3" y="8" width="38" height="22" rx="3" fill="' +
        k.B +
        '"/>' +
        '<rect x="3" y="8" width="38" height="22" rx="3" fill="' +
        k.H +
        '"/>' +
        '<path d="M9 12v14M17 12v14M25 12v14M33 12v14" stroke="#000" stroke-opacity=".12" stroke-width="1"/>' +
        body(
          "M43 14h9c1 0 1.900.5 2.500 1.300L60 22v6c0 1.100-.9 2-2 2H43z",
          k,
        ) +
        glass("M46 17h5.500l4 5H46z", k) +
        '<rect x="3" y="28" width="57" height="3" rx="1.500" fill="#374151"/>' +
        lampF(58, 23.5, 2.5, 2) +
        lampR(3, 24, 1.8, 3) +
        wheel(12, 31, 5, k) +
        wheel(24, 31, 5, k) +
        wheel(51, 31, 5, k)
      );
    },
    moto: function (k) {
      return (
        SHADOW +
        '<circle cx="14" cy="29" r="7" fill="none" stroke="#111827" stroke-width="3"/>' +
        '<circle cx="50" cy="29" r="7" fill="none" stroke="#111827" stroke-width="3"/>' +
        '<circle cx="14" cy="29" r="4.500" fill="' +
        k.R +
        '" opacity=".9"/><circle cx="50" cy="29" r="4.500" fill="' +
        k.R +
        '" opacity=".9"/>' +
        '<circle cx="14" cy="29" r="1.500" fill="#374151"/><circle cx="50" cy="29" r="1.500" fill="#374151"/>' +
        '<path d="M14 29L30 25" stroke="' +
        k.b +
        '" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M50 29L43 12" stroke="#9ca3af" stroke-width="2.800" stroke-linecap="round"/>' +
        '<path d="M44 20c2.500-3 6-3.500 8-2" stroke="' +
        k.c +
        '" stroke-width="2.600" fill="none" stroke-linecap="round"/>' +
        '<rect x="27" y="21" width="13" height="8" rx="2.500" fill="' +
        k.B +
        '"/>' +
        body("M24 14h13l4.500 5-3 5H26l-3.500-4z", k) +
        '<path d="M10.500 19c0-1 .8-1.800 1.800-1.800H24c1 0 1.500 1 1 1.800L24 21H12.500c-1.100 0-2-.9-2-2z" fill="#1f2937"/>' +
        '<path d="M40 11.500h7" stroke="#374151" stroke-width="2.800" stroke-linecap="round"/>' +
        '<path d="M44 14.500h5.500a2.700 2.700 0 0 1-2.700 3z" fill="#fef08a"/>' +
        '<path d="M30 28.500L15 27.500" stroke="#cbd5e1" stroke-width="2.200" stroke-linecap="round"/>'
      );
    },
    scooter: function (k) {
      return (
        SHADOW +
        body("M8 28c0-5 3-9 8-9h7v9z", k) +
        '<path d="M10 17c0-1.100.9-2 2-2h10c1.100 0 2 .9 2 2v2H10z" fill="#1f2937"/>' +
        '<rect x="22" y="26" width="23" height="3.500" rx="1.750" fill="' +
        k.C +
        '"/>' +
        body("M44 27L42 11h4.500l3.500 16z", k) +
        '<path d="M47 22l4 9" stroke="#9ca3af" stroke-width="2.600" stroke-linecap="round"/>' +
        '<path d="M40 10h8" stroke="#374151" stroke-width="2.800" stroke-linecap="round"/>' +
        '<path d="M47 12.500h4.500a2.500 2.500 0 0 1-2.500 3z" fill="#fef08a"/>' +
        lampR(7.5, 22, 2, 3) +
        wheel(14, 31, 5.5, k) +
        wheel(51, 31, 5.5, k)
      );
    },
    trattore: function (k) {
      return (
        SHADOW +
        '<rect x="40" y="7" width="2.600" height="10" rx="1.300" fill="#374151"/>' +
        body("M28 28V17c0-1.100.9-2 2-2h14c1.100 0 2 .9 2 2v11z", k) +
        '<path d="M46 19h4v7h-4z" fill="#374151"/>' +
        body("M8 26V9c0-1.100.9-2 2-2h14c1.100 0 2 .9 2 2v17z", k) +
        '<rect x="12" y="10.500" width="11" height="9" rx="2" fill="' +
        k.G +
        '"/>' +
        '<rect x="8" y="24" width="38" height="3" rx="1.500" fill="' +
        k.C +
        '"/>' +
        '<path d="M29 18h14M29 21h14" stroke="#000" stroke-opacity=".16" stroke-width=".9"/>' +
        '<circle cx="16" cy="28" r="10" fill="#111827"/>' +
        '<circle cx="16" cy="28" r="6" fill="' +
        k.B +
        '"/>' +
        '<circle cx="16" cy="28" r="2.200" fill="#d1d5db"/>' +
        '<path d="M16 18v2M16 36v-2M6 28h2M26 28h-2M9 21l1.500 1.500M23 21l-1.500 1.500M9 35l1.500-1.500M23 35l-1.500-1.500" stroke="#374151" stroke-width="1.500" stroke-linecap="round"/>' +
        wheel(50, 31, 6, k) +
        lampF(45, 17.5, 2, 2.5)
      );
    },
    barca: function (k) {
      return (
        '<rect x="31" y="3" width="2" height="26" rx="1" fill="#9ca3af"/>' +
        '<path d="M34 5v21h17z" fill="' +
        k.B +
        '"/><path d="M34 5v21h17z" fill="' +
        k.H +
        '"/>' +
        '<path d="M30 8v18H14z" fill="#f1f5f9"/><path d="M30 8v18H14z" fill="#94a3b8" opacity=".18"/>' +
        '<path d="M32 3l5 1.500-5 1.500z" fill="' +
        k.A +
        '"/>' +
        body("M6 28h52l-6 8H13z", k) +
        '<path d="M10 30.500h45" stroke="#fff" stroke-opacity=".5" stroke-width="1" stroke-linecap="round"/>' +
        waves(k)
      );
    },
    motoscafo: function (k) {
      return (
        body("M4 24h52l5 3-6 8H12c-4 0-7-4-8-11z", k) +
        '<path d="M20 24l5-9h14l6 9z" fill="' +
        k.B +
        '"/><path d="M20 24l5-9h14l6 9z" fill="' +
        k.H +
        '"/>' +
        glass("M27 23l3-6h8l3.500 6z", k) +
        '<rect x="8" y="28.500" width="46" height="2" rx="1" fill="#fff" opacity=".75"/>' +
        '<path d="M55 20.500v4" stroke="#9ca3af" stroke-width="1.200" stroke-linecap="round"/>' +
        waves(k)
      );
    },
  };

  var LIST = [
    { k: "auto", l: "Berlina", t: "auto" },
    { k: "citycar", l: "Utilitaria", t: "auto" },
    { k: "familiare", l: "Station wagon", t: "auto" },
    { k: "suv", l: "SUV", t: "auto" },
    { k: "sportiva", l: "Sportiva", t: "auto" },
    { k: "cabrio", l: "Cabrio", t: "auto" },
    { k: "pickup", l: "Pickup", t: "furgone" },
    { k: "furgone", l: "Furgone", t: "furgone" },
    { k: "camper", l: "Camper", t: "furgone" },
    { k: "camion", l: "Camion", t: "camion" },
    { k: "moto", l: "Moto", t: "moto" },
    { k: "motosport", l: "Moto sportiva", t: "moto" },
    { k: "custom", l: "Custom", t: "moto" },
    { k: "scooter", l: "Scooter", t: "scooter" },
    { k: "trattore", l: "Trattore", t: "trattore" },
    { k: "barca", l: "Barca a vela", t: "barca" },
    { k: "motoscafo", l: "Motoscafo", t: "barca" },
  ];

  var CATS = [
    { t: "auto", l: "Auto" },
    { t: "moto", l: "Moto" },
    { t: "scooter", l: "Scooter" },
    { t: "furgone", l: "Furgoni" },
    { t: "camion", l: "Camion" },
    { t: "trattore", l: "Trattore" },
    { t: "barca", l: "Barche" },
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
    ["Tricolore", "#16a34a", "#f8fafc", "#dc2626"],
    ["Racing", "#dc2626", "#111827", "#facc15"],
    ["Marina", "#1d4ed8", "#f8fafc", "#dc2626"],
    ["Tramonto", "#f97316", "#7c3aed", "#facc15"],
  ];

  function find(key) {
    for (var i = 0; i < LIST.length; i++) if (LIST[i].k === key) return LIST[i];
    return LIST[0];
  }

  function grad(id, c, top, bot) {
    return (
      '<linearGradient id="' +
      id +
      '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' +
      shade(c, top) +
      '"/>' +
      '<stop offset=".55" stop-color="' +
      c +
      '"/>' +
      '<stop offset="1" stop-color="' +
      shade(c, bot) +
      '"/></linearGradient>'
    );
  }

  var uid = 0;
  /** SVG completo. c2 facoltativo: se manca usa una variante più scura di c1. */
  function svg(key, c1, c2, c3, cls) {
    var a = normHex(c1) || "#0f766e";
    var b = normHex(c2) || shade(a, -0.28);
    var c = normHex(c3) || b;
    var k = DRAW[key] ? key : "auto";
    var id = "vi" + ++uid;
    var defs =
      "<defs>" +
      grad(id + "a", a, 0.22, -0.2) +
      grad(id + "b", b, 0.2, -0.2) +
      grad(id + "c", c, 0.2, -0.2) +
      '<linearGradient id="' +
      id +
      'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0f9ff"/><stop offset="1" stop-color="#7dd3fc"/></linearGradient>' +
      '<linearGradient id="' +
      id +
      'r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8fafc"/><stop offset="1" stop-color="#94a3b8"/></linearGradient>' +
      '<linearGradient id="' +
      id +
      'h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<filter id="' +
      id +
      'o" x="-3" y="-3" width="70" height="46" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">' +
      '<feMorphology in="SourceAlpha" operator="dilate" radius="1.100" result="d1"/>' +
      '<feFlood flood-color="#ffffff" flood-opacity=".9"/><feComposite in2="d1" operator="in" result="halo"/>' +
      '<feMorphology in="SourceAlpha" operator="dilate" radius=".550" result="d2"/>' +
      '<feFlood flood-color="#0f172a" flood-opacity=".75"/><feComposite in2="d2" operator="in" result="ring"/>' +
      '<feMerge><feMergeNode in="halo"/><feMergeNode in="ring"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      "</defs>";
    var ctxo = {
      a: a,
      b: b,
      c: c,
      C: "url(#" + id + "c)",
      A: "url(#" + id + "a)",
      B: "url(#" + id + "b)",
      G: "url(#" + id + "g)",
      R: "url(#" + id + "r)",
      H: "url(#" + id + "h)",
    };
    return (
      '<svg class="vi ' +
      (cls || "") +
      '" viewBox="0 0 64 40" role="img" aria-label="' +
      find(k).l +
      '" xmlns="http://www.w3.org/2000/svg">' +
      defs +
      '<g filter="url(#' +
      id +
      'o)">' +
      DRAW[k](ctxo) +
      "</g></svg>"
    );
  }

  /** Icona del veicolo con i suoi colori. */
  function forVehicle(v, cls) {
    return svg(v && v.icon, v && v.color, v && v.color2, v && v.color3, cls);
  }

  g.Icons = {
    svg: svg,
    forVehicle: forVehicle,
    list: LIST,
    cats: CATS,
    find: find,
    typeIcon: TYPE_ICON,
    emoji: EMOJI,
    presets: PRESETS,
    names: IT,
    normHex: normHex,
    shade: shade,
    contrast: contrast,
    has: function (k) {
      return !!DRAW[k];
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
