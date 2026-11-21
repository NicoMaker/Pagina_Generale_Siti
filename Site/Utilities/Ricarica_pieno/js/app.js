/* Ricarica Pieno – app.js */
(function () {
  "use strict";

  var S = window.Store,
    C = window.Calc,
    CH = window.Charts;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) =>
    Array.prototype.slice.call((root || document).querySelectorAll(sel));

  var nfCache = {};
  function nf(d) {
    if (!nfCache[d]) {
      nfCache[d] = new Intl.NumberFormat("it-IT", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
        useGrouping: "always",
      });
    }
    return nfCache[d];
  }
  function fmt(v, d) {
    d = d == null ? 2 : d;
    if (v == null || !isFinite(v)) return "–";
    return nf(d).format(v);
  }
  const fmt2 = (v) => fmt(v, 2);
  const fmt0 = (v) => fmt(v, 0);
  const eur = (v, d) =>
    v == null || !isFinite(v) ? "–" : fmt(v, d == null ? 2 : d) + " €";
  const eur2 = (v) => eur(v, 2);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  const fmtDate = (iso) => {
    var p = String(iso).split("-");
    return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : iso;
  };
  var MONTHS = [
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
  const monthLabel = (key) => {
    var p = key.split("-");
    return MONTHS[+p[1] - 1] + " " + p[0].slice(2);
  };
  function parseNum(str, isInt) {
    var t = String(str == null ? "" : str)
      .trim()
      .replace(/\s/g, "");
    if (!t) return NaN;
    if (isInt && /^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
    t = t.replace(",", ".");
    return /^-?\d*\.?\d+$/.test(t) ? parseFloat(t) : NaN;
  }
  const toField = (v) => String(v).replace(".", ",");
  const kmFmt = (v) =>
    v == null || !isFinite(v) ? "–" : v % 1 ? fmt(v, 1) : fmt(v, 0);

  const pieniCompletati = (n) =>
    n === 1 ? "1 pieno completato" : fmt0(n) + " pieni completati";
  const pl = (n, one, many) => fmt0(n) + " " + (n === 1 ? one : many);

  var DRUM =
    "<b>0</b><b>1</b><b>2</b><b>3</b><b>4</b><b>5</b><b>6</b><b>7</b><b>8</b><b>9</b>";
  function odoDrum(n) {
    var t = fmt0(n),
      out = "",
      k = 0;
    for (var i = 0; i < t.length; i++) {
      var c = t.charAt(i);
      out += /\d/.test(c)
        ? '<span class="dg" style="--d:' +
          c +
          ";--n:" +
          k++ +
          '"><i>' +
          DRUM +
          "</i></span>"
        : '<span class="sep">' + c + "</span>";
    }
    return (
      '<div class="odo-drum" role="img" aria-label="' +
      t +
      ' km">' +
      out +
      '<span class="u">km</span></div>'
    );
  }
  const reading = (v, label) =>
    "<div><b>" + v + "</b><span>" + label + "</span></div>";

  function groupInput(el) {
    var raw = el.value,
      pos = el.selectionStart == null ? raw.length : el.selectionStart;
    var digitsAfter = raw.slice(pos).replace(/\D/g, "").length;
    var d = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    var out = d.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    if (out === raw) return;
    el.value = out;
    var np = out.length,
      cnt = 0;
    while (np > 0 && cnt < digitsAfter) {
      np--;
      if (/\d/.test(out[np])) cnt++;
    }
    try {
      el.setSelectionRange(np, np);
    } catch (e) {}
  }

  var TYPES = {
    auto: ["Auto", "🚗"],
    moto: ["Moto", "🏍️"],
    scooter: ["Scooter", "🛵"],
    furgone: ["Furgone", "🚐"],
    camion: ["Camion", "🚚"],
    trattore: ["Trattore", "🚜"],
    barca: ["Barca", "⛵"],
    altro: ["Altro", "🚘"],
  };
  const typeLabel = (v) => (TYPES[v.type] || TYPES.altro)[0];
  var I = window.Icons;
  const vIco = (v, cls) => I.forVehicle(v, cls);

  var THEMES = [
    ["auto", "Automatico", "#e2e8f0", "#0f172a"],
    ["light", "Chiaro", "#f2f4f8", "#ffffff"],
    ["dark", "Scuro", "#090d13", "#1a2330"],
    ["amoled", "AMOLED", "#000000", "#141417"],
    ["ocean", "Oceano", "#07131f", "#12304a"],
    ["forest", "Foresta", "#0a140f", "#183024"],
    ["viola", "Viola", "#130b1f", "#2a1a45"],
    ["sunset", "Tramonto", "#fff4ec", "#ffd9bf"],
    ["mint", "Menta", "#ecf8f4", "#bfeadc"],
  ];

  var gQuery = "",
    hQuery = "",
    hFilter = "all",
    hSort = "date";
  var sel = { mode: null, ids: {} };
  var gVisible = [],
    hVisible = [];
  const selIds = () => Object.keys(sel.ids).filter((k) => sel.ids[k]);

  function syncSel() {
    var n = selIds().length;
    var bulkBar = $("#bulkBar");
    if (bulkBar) bulkBar.hidden = !sel.mode;
    var bulkCount = $("#bulkCount");
    if (bulkCount)
      bulkCount.textContent = n === 1 ? "1 selezionato" : n + " selezionati";
    var bulkDel = $("#bulkDel");
    if (bulkDel) bulkDel.disabled = !n;
    var gSel = $("#gSelect");
    if (gSel)
      gSel.textContent = sel.mode === "garage" ? "✕ Fine" : "☑ Seleziona";
    var hSel = $("#hSelect");
    if (hSel)
      hSel.textContent = sel.mode === "history" ? "✕ Fine" : "☑ Seleziona";
    document.body.classList.toggle("selecting", !!sel.mode);
  }
  function rerenderSel() {
    renderGarage();
    renderHistory();
  }
  function clearSel() {
    if (!sel.mode && !selIds().length) return;
    sel.mode = null;
    sel.ids = {};
    syncSel();
    rerenderSel();
  }
  function startSel(mode) {
    if (sel.mode === mode) return clearSel();
    sel.mode = mode;
    sel.ids = {};
    syncSel();
    rerenderSel();
  }
  function toggleSel(id) {
    sel.ids[id] = !sel.ids[id];
    syncSel();
    rerenderSel();
  }
  function delRefuel(id) {
    var v = vehicle();
    if (!v) return;
    if (
      !window.confirm(
        "Eliminare questo rifornimento? I km/L verranno ricalcolati.",
      )
    )
      return;
    S.deleteRefuel(v.id, id);
    if (editingId === id) resetForm();
    renderAll();
    toast("Rifornimento eliminato");
  }
  function delVehicle(id) {
    var v = S.get().vehicles.filter((x) => x.id === id)[0];
    if (!v) return;
    var n = v.refuels.length;
    if (
      !window.confirm(
        'Eliminare "' +
          v.name +
          '" e ' +
          (n === 1 ? "il suo rifornimento" : "i suoi " + n + " rifornimenti") +
          "? Operazione non annullabile.",
      )
    )
      return;
    S.deleteVehicle(id);
    renderAll();
    applyChrome(false);
    toast("Veicolo eliminato");
  }
  function goRank() {
    hSort = "best";
    $("#hSort").value = "best";
    renderHistory();
    setTab("history");
  }
  var MONTHS_FULL = [
    "gennaio",
    "febbraio",
    "marzo",
    "aprile",
    "maggio",
    "giugno",
    "luglio",
    "agosto",
    "settembre",
    "ottobre",
    "novembre",
    "dicembre",
  ];
  const norm = (t) =>
    String(t)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  function matches(hay, q) {
    var toks = norm(q).split(/\s+/).filter(Boolean);
    return toks.every(
      (t) => hay.indexOf(t) >= 0 || hay.indexOf(t.replace(/\./g, "")) >= 0,
    );
  }
  const dot = (n, d) => {
    d = d == null ? 2 : d;
    return String(Number(n).toFixed(d)).replace(".", ",");
  };
  function rowText(r) {
    var p = r.date.split("-");
    return norm(
      [
        r.date,
        fmtDate(r.date),
        MONTHS_FULL[+p[1] - 1] || "",
        MONTHS[+p[1] - 1] || "",
        r.odometer,
        fmt(r.odometer, 0),
        dot(r.liters, 2),
        dot(r.price, 3),
        dot(r.paid, 3),
        dot(r.total, 2),
        r.note,
        r.fvg ? "fvg sconto" : "",
        r.full ? "pieno completo" : "parziale",
      ].join(" "),
    );
  }
  const vText = (v) => norm([v.name, v.plate, v.fuel, typeLabel(v)].join(" "));

  var toastTimer;
  function toast(msg, kind) {
    var el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.className = "toast" + (kind === "error" ? " error" : "");
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 3400);
  }

  function download(name, text, mime) {
    var blob = new Blob([text], { type: mime });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
  }

  const contrast = (hex) => {
    var n = parseInt(hex.slice(1), 16),
      r = n >> 16,
      g = (n >> 8) & 255,
      b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62
      ? "#0b1220"
      : "#ffffff";
  };

  var DEFAULT_ACCENT = "#0f766e";
  var screen = "garage";
  var tab = "dash";
  var editingId = null;
  const vehicle = () => S.activeVehicle();

  function themeColor() {
    var meta = $('meta[name="theme-color"]');
    if (!meta) return;
    var bg = getComputedStyle(document.documentElement)
      .getPropertyValue("--bg")
      .trim();
    if (bg) meta.setAttribute("content", bg);
  }
  function applyTheme() {
    var t = S.get().settings.theme;
    if (t && t !== "auto")
      document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
    themeColor();
  }

  function applyChrome(scrollTop) {
    var v = vehicle();
    var color =
      DEFAULT_ACCENT; /* il colore del veicolo vale solo per icona e scheda */
    var root = document.documentElement.style;
    root.setProperty("--accent", color);
    root.setProperty("--accent-contrast", contrast(color));
    themeColor();
    var show =
      screen === "garage" ? "garage" : screen === "settings" ? "settings" : tab;
    $$(".view").forEach((el) =>
      el.classList.toggle("active", el.id === "view-" + show),
    );
    $("#tabs").hidden = screen !== "app";
    $("#btnBack").hidden = screen === "garage";
    $("#brand").hidden = screen !== "garage";
    $("#topTitle").hidden = screen !== "settings";
    $("#vehiclePill").hidden = screen !== "app";
    $("#btnGear").hidden = screen !== "garage";
    $("#btnTopShare").hidden = !S.get().vehicles.length;
    document.body.setAttribute("data-screen", screen);
    if (v && screen === "app") {
      $("#vpName").textContent = v.name;
      $("#vpPlate").textContent = v.plate || v.fuel;
      $("#vpIcon").innerHTML = vIco(v);
    }

    var backIcon = document.getElementById("backIcon");
    if (backIcon) {
      backIcon.innerHTML = v ? vIco(v) : I.svg("auto", "#64748b");
    }

    $$("#tabs button").forEach((b) => {
      var on = b.dataset.tab === tab;
      b.classList.toggle("active", on);
      b.setAttribute("aria-current", on ? "page" : "false");
    });
    if (scrollTop) window.scrollTo({ top: 0 });
  }

  function setTab(t) {
    if (sel.mode) clearSel();
    tab = t;
    screen = "app";
    applyChrome(true);
  }
  function showGarage() {
    clearSel();
    screen = "garage";
    resetForm();
    renderAll();
    applyChrome(true);
  }
  function openVehicle(id) {
    S.setActive(id);
    hQuery = "";
    hFilter = "all";
    hSort = "date";
    $("#hSort").value = "date";
    clearSel();
    $("#hSearch").value = "";
    resetForm();
    screen = "app";
    tab = "dash";
    renderAll();
    applyChrome(true);
  }

  /* colore del testo leggibile sopra lo sfondo (sfumatura) della scheda veicolo */
  function cardFg(v) {
    var cs = v.color2
      ? [v.color, v.color2, v.color3].filter(Boolean)
      : [v.color, I.shade(v.color, -0.48)];
    var r = 0,
      g = 0,
      b = 0;
    cs.forEach(function (c) {
      var n = parseInt(c.slice(1), 16);
      r += n >> 16;
      g += (n >> 8) & 255;
      b += n & 255;
    });
    var h =
      "#" +
      [r, g, b]
        .map((x) => ("0" + Math.round(x / cs.length).toString(16)).slice(-2))
        .join("");
    return I.contrast(h);
  }

  function renderGarage() {
    var st = S.get(),
      box = $("#garageGrid"),
      q = gQuery.trim();
    $("#gTools").hidden = !st.vehicles.length;
    if (!st.vehicles.length) {
      box.innerHTML =
        '<div class="card garage-empty" style="grid-column:1/-1">' +
        '<div class="big-emoji">🚗</div><h2>Aggiungi il tuo primo veicolo</h2>' +
        "<p>Auto, moto, scooter, furgone… Ti servono solo il nome e i km attuali del contachilometri. Poi inserisci un rifornimento e Ricarica Pieno fa il resto.</p>" +
        '<div class="actions"><button type="button" class="btn primary" data-gact="new">＋ Aggiungi veicolo</button>' +
        '<button type="button" class="btn" data-gact="import">Ho già un backup JSON</button></div></div>';
      return;
    }
    var list = st.vehicles.filter((v) => !q || matches(vText(v), q));
    gVisible = list.map((v) => v.id);
    var gsel = sel.mode === "garage";
    var html = list
      .map((v) => {
        var rs = C.rows(v),
          s = C.stats(v, rs);
        var odo = rs.length ? rs[rs.length - 1].odometer : v.initialKm;
        return (
          '<article class="gcard' +
          (gsel ? " selmode" : "") +
          (gsel && sel.ids[v.id] ? " sel" : "") +
          '" style="--c:' +
          esc(v.color) +
          (v.color2 ? ";--cb:" + esc(v.color2) : "") +
          (v.color3 ? ";--cc:" + esc(v.color3) : "") +
          ";--fg:" +
          cardFg(v) +
          '">' +
          (gsel
            ? '<span class="gc-check" aria-hidden="true">' +
              (sel.ids[v.id] ? "☑" : "☐") +
              "</span>"
            : "") +
          '<button type="button" class="gc-main" data-gact="open" data-id="' +
          esc(v.id) +
          '" aria-label="Apri ' +
          esc(v.name) +
          '">' +
          '<div class="gc-top"><span class="gc-ico" aria-hidden="true">' +
          vIco(v) +
          "</span><div><strong>" +
          esc(v.name) +
          "</strong><small>" +
          esc(typeLabel(v)) +
          " · " +
          (v.plate ? esc(v.plate) + " · " : "") +
          esc(v.fuel) +
          "</small></div></div>" +
          '<div class="gc-stats">' +
          "<div><b>" +
          fmt0(odo) +
          "</b><small>km</small></div>" +
          "<div><b>" +
          (s.avgKmL ? fmt2(s.avgKmL) : "–") +
          "</b><small>km/L medio</small></div>" +
          "<div><b>" +
          (s.n ? eur(s.spent, 2) : "–") +
          "</b><small>" +
          (v.refuels.length === 1
            ? "1 pieno"
            : fmt0(v.refuels.length) + " pieni") +
          "</small></div></div></button>" +
          '<div class="gc-actions">' +
          '<button type="button" class="gc-share" data-gact="share" data-id="' +
          esc(v.id) +
          '" title="Condividi ' +
          esc(v.name) +
          '" aria-label="Condividi ' +
          esc(v.name) +
          '">' +
          shi("share") +
          "</button>" +
          '<button type="button" class="gc-edit" data-gact="edit" data-id="' +
          esc(v.id) +
          '" title="Modifica ' +
          esc(v.name) +
          '" aria-label="Modifica ' +
          esc(v.name) +
          '">' +
          shi("edit") +
          "</button>" +
          '<button type="button" class="gc-del" data-gact="del" data-id="' +
          esc(v.id) +
          '" title="Elimina ' +
          esc(v.name) +
          '" aria-label="Elimina ' +
          esc(v.name) +
          '">' +
          shi("trash") +
          "</button></div></article>"
        );
      })
      .join("");
    if (!q && !gsel)
      html +=
        '<div class="gcard add"><button type="button" data-gact="new"><span class="plus">＋</span>Aggiungi veicolo</button></div>';
    else {
      var hits = [];
      st.vehicles.forEach((v) => {
        C.rows(v)
          .slice()
          .reverse()
          .forEach((r) => {
            if (matches(rowText(r), q)) hits.push({ v: v, r: r });
          });
      });
      if (!list.length && !hits.length)
        html =
          '<p class="empty" style="grid-column:1/-1">Nessun risultato per «' +
          esc(q) +
          "».</p>";
      if (hits.length) {
        html +=
          '<div class="hits" style="grid-column:1/-1"><h3>' +
          pl(hits.length, "rifornimento trovato", "rifornimenti trovati") +
          "</h3>" +
          hits
            .slice(0, 30)
            .map(
              (h) =>
                '<button type="button" class="hit" data-gact="hit" data-id="' +
                esc(h.v.id) +
                '"><span class="hit-ico">' +
                vIco(h.v) +
                "</span><span><b>" +
                fmtDate(h.r.date) +
                " · " +
                esc(h.v.name) +
                "</b><small>" +
                fmt0(h.r.odometer) +
                " km · " +
                fmt2(h.r.liters) +
                " L · " +
                eur(h.r.total) +
                "</small></span></button>",
            )
            .join("") +
          "</div>";
      }
    }
    box.innerHTML = html;
  }

  const kmlPoints = (rs) =>
    rs
      .filter((r) => r.kmPerL)
      .map((r) => ({
        label: fmtDate(r.date),
        short: fmtDate(r.date).slice(0, 5),
        value: r.kmPerL,
      }));
  const monthPoints = (rs) =>
    C.monthly(rs)
      .slice(-12)
      .map((m) => ({ label: monthLabel(m.key), value: m.spent }));
  const pct = (a, b) => (b ? (a / b - 1) * 100 : 0);
  var DOW = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  function dowPoints(rs) {
    var c = [0, 0, 0, 0, 0, 0, 0];
    rs.forEach((r) => {
      var p = r.date.split("-"),
        d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay();
      c[(d + 6) % 7]++;
    });
    return c.map((n, i) => ({ label: DOW[i], value: n }));
  }
  const segsOf = (rs) => rs.filter((r) => r.kmPerL);
  const chartCard = (title, body, cls) =>
    '<div class="card chart-card ' +
    (cls || "") +
    '"><h3>' +
    title +
    "</h3>" +
    body +
    "</div>";
  const fewer = (msg) => '<p class="muted small">' + msg + "</p>";

  function topKmlCard(rs) {
    var top = segsOf(rs)
      .slice()
      .sort((a, b) => b.kmPerL - a.kmPerL)
      .slice(0, 5)
      .map((r) => ({
        label: fmtDate(r.date),
        value: r.kmPerL,
        text: fmt2(r.kmPerL) + " km/L",
        sub: fmt0(r.odometer) + " km · " + fmt2(r.liters) + " L",
      }));
    return chartCard(
      "I 5 pieni con più km/L",
      top.length
        ? CH.hbars(top) +
            '<button type="button" class="btn small" style="margin-top:14px" data-go="rank">Vedi classifica completa</button>'
        : fewer("Serve almeno un pieno completato."),
    );
  }

  function topCariCard(rs) {
    var top = rs
      .slice()
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((r) => ({
        label: fmtDate(r.date),
        value: r.total,
        text: eur(r.total, 2),
        sub: fmt2(r.liters) + " L · " + fmt(r.paid, 3) + " €/L",
      }));
    return chartCard(
      "I 5 pieni più cari",
      top.length
        ? CH.hbars(top) +
            '<button type="button" class="btn small" style="margin-top:14px" data-go="rank">Vedi classifica completa</button>'
        : fewer("Serve almeno un rifornimento."),
    );
  }

  function dashDonut(st) {
    if (!(st.spent > 0)) return "";
    var items = [{ label: "Pagato", value: st.spent }];
    if (st.saved > 0)
      items.push({ label: "Risparmiato con FVG", value: st.saved });
    return chartCard(
      "Quanto hai pagato",
      CH.donut(items, {
        unit: "€",
        decimals: 2,
        big: eur(st.spent, 2),
        small: "speso in totale",
        label: "Pagato e risparmiato",
      }),
    );
  }

  function semiGauge(val, min, max, title, subtitle) {
    if (val == null || !isFinite(val)) return "";
    var pct = Math.max(0, Math.min(1, (val - min) / (max - min))) * 100;
    var arc = "M20 100 A80 80 0 0 1 180 100";
    return (
      '<div class="mini-gauge"><svg viewBox="0 0 200 124" role="img" aria-label="' +
      esc(title) +
      '">' +
      '<path class="ga-track" d="' +
      arc +
      '" pathLength="100"/>' +
      '<path class="ga-val" d="' +
      arc +
      '" pathLength="100" stroke-dasharray="' +
      pct.toFixed(1) +
      ' 100"/>' +
      '<text class="ga-big" x="100" y="92" text-anchor="middle">' +
      fmt2(val) +
      "</text>" +
      '<text class="ga-small" x="100" y="112" text-anchor="middle">' +
      esc(subtitle) +
      "</text>" +
      "</svg>" +
      '<span class="mg-lbl">' +
      esc(title) +
      "</span></div>"
    );
  }

  function lastVsRecordPanel(st) {
    var p = st.perf;
    if (!p || !p.count)
      return chartCard(
        "Ultimo pieno vs record",
        fewer("Serve almeno un pieno calcolato."),
      );
    var maxV = Math.max(p.max, p.record.kmPerL);
    var grid =
      '<div class="mg-grid">' +
      semiGauge(p.min, 0, maxV, "Minimo", "km/L") +
      semiGauge(p.avgKmL, 0, maxV, "Media", "km/L") +
      semiGauge(p.median, 0, maxV, "Mediana", "km/L") +
      semiGauge(p.max, 0, maxV, "Massimo", "km/L") +
      "</div>";
    var gauge = CH.gauge(p.record.kmPerL, 0, maxV, {
      unit: "km/L ultimo pieno",
      label: "Ultimo pieno rispetto al record",
      caption:
        "Il tuo record è " +
        fmt2(p.max) +
        " km/L (" +
        fmtDate(p.maxRow.date) +
        ")",
    });
    return chartCard("Ultimo pieno vs record", grid + gauge);
  }

  function recordPanel(st, opts) {
    opts = opts || {};
    var p = st.perf;
    var title = opts.title || "Record e medie (km/L)";
    if (!p || !p.count)
      return (
        '<div class="card record-card"><h3>' +
        title +
        "</h3>" +
        fewer(
          "Registra almeno un pieno completato per vedere record e medie.",
        ) +
        "</div>"
      );
    var rec = p.record;
    var recLine =
      '<div class="record-hero"><div class="record-badge" aria-hidden="true">🏆</div>' +
      '<div class="record-text"><span class="record-lbl">Il tuo record è</span>' +
      '<strong class="record-val">' +
      fmt2(rec.kmPerL) +
      ' <span class="unit">km/L</span></strong>' +
      '<span class="record-date">(' +
      fmtDate(rec.date) +
      " · " +
      fmt0(rec.odometer) +
      " km)</span></div></div>";
    var maxV = Math.max(p.max, p.record.kmPerL);
    var gridGauges =
      '<div class="mg-grid">' +
      semiGauge(p.min, 0, maxV, "Minimo", "km/L") +
      semiGauge(p.avgKmL, 0, maxV, "Media", "km/L") +
      semiGauge(p.median, 0, maxV, "Mediana", "km/L") +
      semiGauge(p.max, 0, maxV, "Massimo", "km/L") +
      "</div>";
    var numericGrid =
      '<div class="record-grid">' +
      '<div class="record-stat avg"><span class="rs-lbl">Media</span><strong class="rs-val">' +
      fmt2(p.avgKmL) +
      '</strong><span class="rs-sub">km/L (pesata sui litri)</span></div>' +
      '<div class="record-stat max"><span class="rs-lbl">Massimo</span><strong class="rs-val">' +
      fmt2(p.max) +
      '</strong><span class="rs-sub">' +
      fmtDate(p.maxRow.date) +
      "</span></div>" +
      '<div class="record-stat min"><span class="rs-lbl">Minimo</span><strong class="rs-val">' +
      fmt2(p.min) +
      '</strong><span class="rs-sub">' +
      fmtDate(p.minRow.date) +
      "</span></div>" +
      '<div class="record-stat med"><span class="rs-lbl">Mediana</span><strong class="rs-val">' +
      fmt2(p.median) +
      '</strong><span class="rs-sub">valore centrale</span></div>' +
      '<div class="record-stat delta"><span class="rs-lbl">Delta max-min</span><strong class="rs-val">' +
      fmt2(p.max - p.min) +
      '</strong><span class="rs-sub">km/L di differenza</span></div>' +
      '<div class="record-stat pes"><span class="rs-lbl">Consumo pesato</span><strong class="rs-val">' +
      fmt2(p.avgKmL) +
      '</strong><span class="rs-sub">' +
      (p.l100 ? fmt2(p.l100) + " L/100 km" : "km/L") +
      "</span></div></div>";
    return (
      '<div class="card record-card"><h3>' +
      title +
      "</h3>" +
      recLine +
      gridGauges +
      numericGrid +
      '<p class="hint" style="margin:10px 0 0">Calcolato su ' +
      pieniCompletati(p.count) +
      ". Media pesata sui litri: " +
      fmt2(p.avgKmL) +
      " km/L.</p></div>"
    );
  }

  function renderDashboard() {
    var v = vehicle(),
      box = $("#dashBody");
    if (!v) {
      box.innerHTML = "";
      return;
    }
    var rs = C.rows(v),
      st = C.stats(v, rs),
      last = rs[rs.length - 1];
    var odo = last ? last.odometer : v.initialKm;
    var segs = rs.filter((r) => r.kmPerL);
    var sparkVals = segs.slice(-12).map((r) => r.kmPerL);
    var h =
      '<section class="cluster"><div class="cl-top"><span class="cl-name">' +
      vIco(v) +
      " " +
      esc(v.name) +
      (v.plate ? " · " + esc(v.plate) : "") +
      "</span>" +
      '<div style="display:flex;gap:6px;">' +
      '<button type="button" class="btn small ghost" data-go="share" title="Condividi dati veicolo">' +
      shi("share") +
      "</button>" +
      '<button type="button" class="btn accent" data-go="add">⛽ Rifornisci</button>' +
      "</div></div>" +
      odoDrum(odo) +
      '<div class="cl-read">' +
      reading(st.avgKmL ? fmt2(st.avgKmL) : "–", "km/L medi") +
      reading(st.l100 ? fmt2(st.l100) : "–", "L/100 km") +
      reading(st.costPerKm != null ? fmt2(st.costPerKm) + " €" : "–", "al km") +
      CH.spark(sparkVals) +
      "</div></section>";
    if (!st.n) {
      h +=
        '<div class="card empty-card"><div class="big-emoji">⛽</div><h2>Registra il primo rifornimento</h2>' +
        "<p>Parti da <b>" +
        fmt0(v.initialKm) +
        " km</b>. Ti bastano km finali, litri e prezzo: al resto pensa Ricarica Pieno.</p>" +
        '<button type="button" class="btn primary" data-go="add">＋ Primo rifornimento</button></div>';
      box.innerHTML = h;
      return;
    }
    var mk = S.todayISO().slice(0, 7);
    var mon = C.monthly(rs).filter((m) => m.key === mk)[0];
    var range =
      v.tank && st.avgKmL
        ? v.tank * st.avgKmL
        : st.avgKmL
          ? st.avgLitersPerRefuel * st.avgKmL
          : null;
    var litersSub = fmt2(st.liters) + " L totali";
    if (st.partialLiters > 0)
      litersSub += " (di cui " + fmt2(st.partialLiters) + " L in parziali)";
    var tiles = [
      [
        "Costo al km",
        st.costPerKm != null ? fmt2(st.costPerKm) + " €" : "–",
        st.costPerKm != null ? fmt2(st.costPerKm * 100) + " € / 100 km" : "",
      ],
      [
        "Spesa questo mese",
        eur(mon ? mon.spent : 0, 2),
        pl(mon ? mon.count : 0, "rifornimento", "rifornimenti"),
      ],
      ["Spesa totale", eur(st.spent, 2), litersSub],
      ["Risparmio FVG", eur2(st.saved), st.fvgCount + " con sconto"],
      [
        "Km percorsi",
        fmt0(st.totalKm),
        "dai " + fmt0(v.initialKm) + " iniziali",
      ],
      [
        "Autonomia stimata",
        range ? fmt0(range) + " km" : "–",
        v.tank ? "a serbatoio pieno" : "dalla media dei pieni",
      ],
    ];
    h +=
      '<div class="tiles">' +
      tiles
        .map(
          (t) =>
            '<div class="tile"><span class="t-label">' +
            t[0] +
            '</span><strong class="t-value">' +
            t[1] +
            '</strong><span class="t-sub">' +
            t[2] +
            "</span></div>",
        )
        .join("") +
      "</div>";
    var ins = [];
    if (segs.length) {
      var ls = segs[segs.length - 1];
      if (segs.length > 1 && st.avgKmL) {
        var d = pct(ls.kmPerL, st.avgKmL);
        ins.push([
          d >= 0 ? "good" : "warn",
          d >= 0 ? "📈" : "📉",
          "Ultimo pieno: <b>" +
            fmt2(ls.kmPerL) +
            " km/L</b> (" +
            (d > 0 ? "+" : "") +
            fmt(d, 1) +
            "% rispetto alla media)",
        ]);
      } else
        ins.push([
          "",
          "⛽",
          "Ultimo pieno: <b>" + fmt2(ls.kmPerL) + " km/L</b>",
        ]);
    }
    if (rs.length > 1 && st.avgPrice) {
      var dp = last.paid - st.avgPrice;
      ins.push([
        dp <= 0 ? "good" : "warn",
        "💶",
        "Ultimo prezzo pagato <b>" +
          fmt(last.paid, 3) +
          " €/L</b> (" +
          (dp > 0 ? "+" : "") +
          fmt(dp, 3) +
          " € rispetto alla media)",
      ]);
    }
    var ago = C.daysBetween(last.date, S.todayISO());
    ins.push([
      "",
      "🗓️",
      "Ultimo rifornimento " +
        (ago <= 0
          ? "<b>oggi</b>"
          : ago === 1
            ? "<b>ieri</b>"
            : "<b>" + ago + " giorni fa</b>") +
        " (" +
        fmtDate(last.date) +
        ")",
    ]);
    if (st.avgDaysBetween)
      ins.push([
        "",
        "⏱️",
        "In media fai il pieno ogni <b>" +
          fmt(st.avgDaysBetween, 1) +
          " giorni</b> (" +
          fmt(st.kmPerDay, 1) +
          " km al giorno)",
      ]);
    var recent = rs
      .slice(-3)
      .reverse()
      .map(
        (r) =>
          '<div class="mini"><b>' +
          fmtDate(r.date) +
          (r.fvg ? ' <span class="tag">FVG</span>' : "") +
          "</b>" +
          "<small>" +
          fmt2(r.liters) +
          " L · " +
          eur(r.total, 2) +
          " · " +
          kmFmt(r.km) +
          " km</small>" +
          '<div class="kml">' +
          (r.kmPerL ? fmt2(r.kmPerL) : "–") +
          "<small>km/L</small></div>" +
          '<div class="mini-act"><button type="button" class="btn small" data-act="share" data-id="' +
          esc(r.id) +
          '">' +
          shi("share") +
          " Condividi</button>" +
          '<button type="button" class="btn small" data-act="edit" data-id="' +
          esc(r.id) +
          '">✎ Modifica</button>' +
          '<button type="button" class="btn small danger" data-act="del" data-id="' +
          esc(r.id) +
          '">🗑 Elimina</button></div></div>',
      )
      .join("");
    h +=
      '<div class="dash-cols"><div class="card"><h2>In breve</h2><ul class="insights">' +
      ins
        .map(
          (i) =>
            '<li class="' +
            i[0] +
            '"><span class="i-ico">' +
            i[1] +
            "</span><span>" +
            i[2] +
            "</span></li>",
        )
        .join("") +
      '</ul></div><div class="card"><h2>Ultimi rifornimenti</h2><div class="mini-list">' +
      recent +
      '</div><div class="btn-row" style="margin-top:10px;"><button type="button" class="btn small" data-go="history">Vedi tutto lo storico</button><button type="button" class="btn small" data-go="share">' +
      shi("share") +
      " Condividi riepilogo</button></div></div></div>";
    h += recordPanel(st, { title: "Record e medie (km/L)" });
    var kp = kmlPoints(rs),
      mp = monthPoints(rs);
    h +=
      '<div class="charts">' +
      '<div class="card chart-card"><h3>Consumo (km/L)</h3>' +
      (kp.length > 1
        ? CH.line(kp, {
            decimals: 2,
            unit: "km/L",
            avg: st.avgKmL,
            label: "Consumo km/L",
          })
        : '<p class="muted small">Servono almeno due pieni per il grafico.</p>') +
      "</div>" +
      '<div class="card chart-card"><h3>Spesa mensile (€)</h3>' +
      CH.bars(mp, { decimals: 2, unit: "€", label: "Spesa mensile" }) +
      "</div>" +
      chartCard(
        "Km al mese",
        CH.bars(
          C.monthly(rs)
            .slice(-12)
            .map((m) => ({ label: monthLabel(m.key), value: m.km })),
          { decimals: 0, unit: "km", label: "Km al mese" },
        ),
      ) +
      dashDonut(st) +
      topKmlCard(rs) +
      "</div>";
    box.innerHTML = h;
  }

  function openRefuel() {
    var dlg = $("#refuelDialog");
    renderAddMeta();
    renderPreview();
    if (!dlg.open) {
      if (typeof dlg.showModal === "function") dlg.showModal();
      else dlg.setAttribute("open", "");
    }
    setTimeout(() => {
      $("#fOdo").focus();
    }, 60);
  }
  function openNewRefuel() {
    resetForm();
    openRefuel();
  }
  function closeRefuel() {
    var dlg = $("#refuelDialog");
    if (dlg.open) dlg.close();
  }

  function readForm() {
    var fvg = $("#fFvg").checked;
    var price = parseNum($("#fPrice").value);
    var discount = fvg ? parseNum($("#fDiscount").value) : 0;
    var liters = parseNum($("#fLiters").value);
    var total = parseNum($("#fTotal").value);
    var dd = fvg && isFinite(discount) ? discount : 0;
    if (!isFinite(price) && liters > 0 && total > 0)
      price = Math.round((total / liters + dd) * 1000) / 1000;
    var paid = price - dd;
    if (!isFinite(liters) && total > 0 && paid > 0)
      liters = Math.round((total / paid) * 100) / 100;
    return {
      date: $("#fDate").value,
      odometer: parseNum($("#fOdo").value, true),
      liters: liters,
      price: price,
      fvg: fvg,
      discount: discount,
      paidTotal: total > 0 ? total : null,
      full: $("#fFull").checked,
      note: $("#fNote").value.trim(),
    };
  }

  function resetForm() {
    editingId = null;
    var st = S.get();
    $("#fDate").value = S.todayISO();
    $("#fOdo").value = "";
    $("#fLiters").value = "";
    $("#fPrice").value = "";
    $("#fTotal").value = "";
    $("#fFvg").checked = !!st.settings.lastFvg;
    $("#fDiscount").value = toField(st.settings.fvgDiscount);
    $("#fFull").checked = true;
    $("#fNote").value = "";
    $("#fvgBox").hidden = !$("#fFvg").checked;
    $("#formTitle").textContent = "Nuovo rifornimento";
    $("#btnSave").textContent = "Salva rifornimento";
    $("#btnCancelEdit").hidden = true;
    clearError();
  }

  function startEdit(id) {
    var v = vehicle();
    var r = v && v.refuels.filter((x) => x.id === id)[0];
    if (!r) return;
    editingId = id;
    $("#fDate").value = r.date;
    $("#fOdo").value = fmt0(r.odometer);
    $("#fLiters").value = toField(r.liters);
    $("#fPrice").value = toField(r.price);
    $("#fTotal").value = r.paidTotal ? toField(r.paidTotal) : "";
    $("#fFvg").checked = r.fvg;
    $("#fDiscount").value = toField(
      r.fvg ? r.discount : S.get().settings.fvgDiscount,
    );
    $("#fFull").checked = r.full;
    $("#fNote").value = r.note;
    $("#fvgBox").hidden = !r.fvg;
    $("#formTitle").textContent = "Modifica rifornimento";
    $("#btnSave").textContent = "Salva modifiche";
    $("#btnCancelEdit").hidden = false;
    clearError();
    openRefuel();
  }

  function showError(msg, fieldId) {
    var el = $("#formError");
    el.textContent = msg;
    el.hidden = false;
    $$("#refuelForm input").forEach((i) => i.classList.remove("invalid"));
    if (fieldId) {
      var f = $("#" + fieldId);
      f.classList.add("invalid");
      f.focus();
    }
  }
  function clearError() {
    $("#formError").hidden = true;
    $$("#refuelForm input").forEach((i) => i.classList.remove("invalid"));
  }

  function validate(v, c) {
    if (!c.date) return ["Inserisci la data.", "fDate"];
    if (!isFinite(c.odometer) || c.odometer <= 0)
      return ["Inserisci i km finali del contachilometri.", "fOdo"];
    if (!isFinite(c.price) || c.price <= 0)
      return [
        "Scrivi almeno due dati tra litri, prezzo e totale pagato.",
        "fTotal",
      ];
    if (c.price < 0.5 || c.price > 4)
      return [
        "Prezzo al litro insolito (" +
          fmt(c.price, 3) +
          " €). Scrivilo come 1,859.",
        "fPrice",
      ];
    if (c.fvg) {
      if (!isFinite(c.discount) || c.discount < 0)
        return [
          "Inserisci lo sconto FVG in € per litro (es. 0,15).",
          "fDiscount",
        ];
      if (c.discount >= c.price)
        return [
          "Lo sconto deve essere inferiore al prezzo al litro.",
          "fDiscount",
        ];
    }
    if (!isFinite(c.liters) || c.liters <= 0)
      return ["Scrivi i litri riforniti oppure il totale pagato.", "fTotal"];
    if (v.tank && c.liters > v.tank + 0.001)
      return [
        "Il serbatoio di " +
          v.name +
          " contiene al massimo " +
          fmt2(v.tank) +
          " L: non puoi inserirne " +
          fmt2(c.liters) +
          ".",
        "fLiters",
      ];
    if (c.liters > 150)
      return [
        "Litri insolitamente alti (" +
          fmt2(c.liters) +
          " L): controlla di non aver messo l'importo in euro.",
        "fLiters",
      ];
    var calc = c.liters * (c.price - (c.fvg ? c.discount : 0));
    if (
      c.paidTotal &&
      Math.abs(calc - c.paidTotal) > Math.max(0.5, c.paidTotal * 0.02)
    )
      return [
        "Litri × prezzo = " +
          eur(calc, 2) +
          ", ma hai indicato " +
          eur(c.paidTotal, 2) +
          " pagati. Controlla litri, prezzo e sconto.",
        "fLiters",
      ];
    var rs = C.rows(v),
      lo = v.initialKm,
      hi = null,
      i;
    if (editingId) {
      i = rs.findIndex((r) => r.id === editingId);
      lo = i > 0 ? rs[i - 1].odometer : v.initialKm;
      hi = i >= 0 && i < rs.length - 1 ? rs[i + 1].odometer : null;
    } else if (rs.length) lo = rs[rs.length - 1].odometer;
    if (c.odometer <= lo)
      return [
        "I km finali (" +
          fmt0(c.odometer) +
          ") devono essere maggiori dei km precedenti (" +
          fmt0(lo) +
          ").",
        "fOdo",
      ];
    if (hi != null && c.odometer >= hi)
      return [
        "I km finali devono essere inferiori al rifornimento successivo (" +
          fmt0(hi) +
          " km).",
        "fOdo",
      ];
    return null;
  }

  function onSubmit(e) {
    e.preventDefault();
    var v = vehicle();
    if (!v) return;
    var c = readForm(),
      err = validate(v, c);
    if (err) {
      showError(err[0], err[1]);
      return;
    }
    var rec = Object.assign({ id: editingId || S.uid() }, c);
    if (editingId) S.updateRefuel(v.id, rec);
    else S.addRefuel(v.id, rec);
    S.setSettings({
      lastFvg: c.fvg,
      fvgDiscount:
        c.fvg && isFinite(c.discount) && c.discount > 0
          ? c.discount
          : S.get().settings.fvgDiscount,
    });
    var row = C.rows(vehicle()).filter((r) => r.id === rec.id)[0];
    var wasEdit = !!editingId;
    var msg = wasEdit ? "Modifiche salvate" : "Rifornimento salvato";
    if (row && row.kmPerL) msg += " · " + fmt2(row.kmPerL) + " km/L";
    else if (row && !row.full) msg += " · parziale";
    resetForm();
    closeRefuel();
    renderAll();
    applyChrome(false);
    toast(msg);
  }

  function renderPreview() {
    var v = vehicle(),
      box = $("#previewBody");
    if (!v) {
      box.innerHTML = "";
      return;
    }
    var c = readForm(),
      row = C.preview(v, c, editingId);
    var all = C.stats(v, C.rows(v));
    if (!row) {
      box.innerHTML =
        '<p class="empty">Inserisci i <b>km finali</b> e due dati tra <b>litri</b>, <b>prezzo</b> e <b>totale</b>:<br>qui vedrai subito km percorsi, km/L e costo.</p>';
      return;
    }
    var hero = row.kmPerL ? fmt2(row.kmPerL) : "–";
    var sub;
    if (row.km <= 0) sub = "Km finali non validi";
    else if (!c.full)
      sub =
        "Pieno parziale: i litri vengono contati nelle statistiche, il consumo si calcolerà al prossimo pieno completo";
    else if (!(c.liters > 0))
      sub = "Inserisci i litri per calcolare il consumo";
    else sub = "Percorsi " + kmFmt(row.km) + " km dal rifornimento precedente";
    var hasCost = c.liters > 0 && c.price > 0;
    var m = [];
    m.push(["Km precedenti", fmt0(row.prevKm) + " km"]);
    m.push(["Km percorsi", row.km > 0 ? kmFmt(row.km) + " km" : "–"]);
    if (row.l100) m.push(["Consumo", fmt2(row.l100) + " L/100 km"]);
    if (c.price > 0) m.push(["Prezzo applicato", fmt(row.paid, 3) + " €/L"]);
    if (c.liters > 0 && !isFinite(parseNum($("#fLiters").value)))
      m.push(["Litri calcolati", fmt2(c.liters) + " L"]);
    if (c.price > 0 && !isFinite(parseNum($("#fPrice").value)))
      m.push(["Prezzo calcolato", fmt(c.price, 3) + " €/L"]);
    if (row.km > 0 && hasCost)
      m.push(["Costo al km", fmt2(row.costPerKm) + " €"]);
    if (c.fvg && hasCost) m.push(["Risparmio FVG", eur2(row.saved), "good"]);
    var html =
      '<div class="hero"><strong>' +
      hero +
      "</strong><span>km/L</span></div>" +
      '<p class="hero-sub">' +
      esc(sub) +
      '</p><dl class="metrics">';
    if (hasCost)
      html +=
        '<div class="metric wide total"><dt>Totale da pagare</dt><dd>' +
        eur(row.total, 2) +
        "</dd></div>";
    m.forEach((x) => {
      html +=
        '<div class="metric ' +
        (x[2] || "") +
        '"><dt>' +
        x[0] +
        "</dt><dd>" +
        x[1] +
        "</dd></div>";
    });
    html += "</dl>";
    if (row.km <= 0)
      html +=
        '<div class="badge-note bad">I km finali devono superare quelli precedenti.</div>';
    else if (row.kmPerL && (row.kmPerL > 45 || row.kmPerL < 3))
      html +=
        '<div class="badge-note warn">Valore insolito: controlla km finali e litri.</div>';
    else if (row.kmPerL && all.avgKmL) {
      var diff = pct(row.kmPerL, all.avgKmL);
      if (Math.abs(diff) >= 1)
        html +=
          '<div class="badge-note ' +
          (diff > 0 ? "good" : "warn") +
          '">' +
          (diff > 0 ? "+" : "") +
          fmt(diff, 1) +
          "% rispetto alla tua media (" +
          fmt2(all.avgKmL) +
          " km/L)</div>";
    }
    box.innerHTML = html;
  }

  function renderAddMeta() {
    var v = vehicle();
    $("#formFields").disabled = !v;
    if (!v) {
      $("#prevInfo").hidden = true;
      return;
    }
    $("#prevInfo").hidden = false;
    var rs = C.rows(v),
      last = rs[rs.length - 1];
    var prevKm = last ? last.odometer : v.initialKm;
    $("#prevInfo").innerHTML = last
      ? "Ultimo rifornimento: <b>" +
        fmtDate(last.date) +
        "</b> a <b>" +
        fmt0(prevKm) +
        " km</b>"
      : "Km iniziali di " +
        esc(v.name) +
        ": <b>" +
        fmt0(prevKm) +
        " km</b> (primo rifornimento)";
    $("#fOdo").placeholder = "> " + fmt0(prevKm);
    $("#fPrice").placeholder = last ? fmt(last.price, 3) : "es. 1,859";
    $("#fLiters").placeholder = v.tank
      ? "max " + fmt(v.tank, v.tank % 1 ? 1 : 0)
      : "es. 38,5";
  }

  function histRow(r, avg, o) {
    o = o || {};
    var d = r.date.split("-");
    var cls = r.kmPerL && avg ? (r.kmPerL >= avg ? "good" : "warn") : "";
    var tags =
      (r.fvg ? ' <span class="tag">FVG</span>' : "") +
      (!r.full ? ' <span class="tag warn">Parziale</span>' : "");
    var isSel = !!sel.ids[r.id];
    var inSel = sel.mode === "history";
    var dayBox = o.rank
      ? '<span class="rf-day"><b>' + o.rank + "</b><small>pos.</small></span>"
      : '<span class="rf-day"><b>' +
        d[2] +
        "</b><small>" +
        MONTHS[+d[1] - 1] +
        "</small></span>";
    var datePre = o.rank ? fmtDate(r.date) + " · " : "";
    return (
      '<details class="rf' +
      (inSel && isSel ? " selected" : "") +
      '" data-id="' +
      esc(r.id) +
      '"><summary>' +
      (inSel
        ? '<span class="ck" aria-hidden="true">' +
          (isSel ? "☑" : "☐") +
          "</span>"
        : "") +
      dayBox +
      '<span class="rf-main"><b>' +
      fmt2(r.liters) +
      " L · " +
      fmt(r.paid, 3) +
      " €/L</b><small>" +
      datePre +
      kmFmt(r.km) +
      " km · " +
      eur(r.total, 2) +
      tags +
      "</small></span>" +
      '<span class="rf-kml ' +
      cls +
      '">' +
      (r.kmPerL ? fmt2(r.kmPerL) : "–") +
      "<small>km/L</small></span></summary>" +
      '<div class="rf-body"><dl class="rf-grid">' +
      "<div><dt>Data</dt><dd>" +
      fmtDate(r.date) +
      "</dd></div>" +
      "<div><dt>Km finali</dt><dd>" +
      fmt0(r.odometer) +
      "</dd></div>" +
      "<div><dt>Percorsi</dt><dd>" +
      kmFmt(r.km) +
      " km</dd></div>" +
      "<div><dt>Consumo</dt><dd>" +
      (r.l100 ? fmt2(r.l100) + " L/100" : "–") +
      "</dd></div>" +
      "<div><dt>€/L pagato</dt><dd>" +
      fmt(r.paid, 3) +
      (r.fvg ? " <s>" + fmt(r.price, 3) + "</s>" : "") +
      "</dd></div>" +
      "<div><dt>€/km</dt><dd>" +
      (r.costPerKm != null ? fmt2(r.costPerKm) : "–") +
      "</dd></div></dl>" +
      (r.fvg && r.saved > 0
        ? '<p class="rf-note">Risparmio FVG: <b>' + eur2(r.saved) + "</b></p>"
        : "") +
      (r.days != null
        ? '<p class="rf-note">' +
          r.days +
          (r.days === 1 ? " giorno" : " giorni") +
          " dal rifornimento precedente</p>"
        : "") +
      (r.note ? '<p class="rf-note">📝 ' + esc(r.note) + "</p>" : "") +
      '<div class="rf-actions">' +
      '<button type="button" class="btn small" data-act="share" data-id="' +
      esc(r.id) +
      '">' +
      shi("share") +
      " Condividi</button>" +
      '<button type="button" class="btn small" data-act="edit" data-id="' +
      esc(r.id) +
      '">✎ Modifica</button>' +
      '<button type="button" class="btn small danger" data-act="del" data-id="' +
      esc(r.id) +
      '">🗑 Elimina</button></div></div></details>'
    );
  }

  function renderHistory() {
    var v = vehicle(),
      box = $("#historyList");
    $$("#hFilters .chip").forEach((b) =>
      b.classList.toggle("active", b.dataset.f === hFilter),
    );
    box.classList.toggle("selmode", sel.mode === "history");
    if (!v) {
      box.innerHTML = "";
      hVisible = [];
      $("#historyCount").textContent = "";
      return;
    }
    var all = C.rows(v).slice().reverse(),
      hq = hQuery.trim(),
      avg = C.stats(v, C.rows(v)).avgKmL;
    var rs = all.filter((r) => {
      var okF =
        hFilter === "all" ||
        (hFilter === "fvg" && r.fvg) ||
        (hFilter === "partial" && !r.full) ||
        (hFilter === "full" && r.full);
      return okF && (!hq || matches(rowText(r), hq));
    });
    var ranked = hSort !== "date";
    if (ranked) {
      if (hSort === "best" || hSort === "worst")
        rs = rs.filter((r) => r.kmPerL);
      rs = rs.slice().sort((a, b) => {
        if (hSort === "best") return b.kmPerL - a.kmPerL;
        if (hSort === "worst") return a.kmPerL - b.kmPerL;
        return b.total - a.total;
      });
    }
    hVisible = rs.map((r) => r.id);
    var filtered = rs.length !== all.length;
    $("#historyCount").textContent =
      v.name +
      " · " +
      (filtered ? fmt0(rs.length) + " di " : "") +
      pl(all.length, "rifornimento", "rifornimenti");
    if (!all.length) {
      box.innerHTML =
        '<div class="empty-state"><div class="big-emoji">⛽</div><h3>Nessun rifornimento</h3><p>Il primo rifornimento di <b>' +
        esc(v.name) +
        '</b> compare qui.</p><button type="button" class="btn primary" data-go="add">Aggiungi rifornimento</button></div>';
      return;
    }
    if (!rs.length) {
      box.innerHTML =
        '<div class="empty-state"><h3>Nessun risultato</h3><p>Nessun rifornimento' +
        (hq ? " per «" + esc(hq) + "»" : " con questo filtro") +
        ".</p></div>";
      return;
    }
    if (ranked) {
      var title =
        hSort === "best"
          ? "Migliori km/L"
          : hSort === "worst"
            ? "Peggiori km/L"
            : "Più cari";
      box.innerHTML =
        '<section class="mgroup"><h3 class="mh"><span>' +
        title +
        "</span><small>" +
        pl(rs.length, "rifornimento", "rifornimenti") +
        '</small></h3><div class="mlist">' +
        rs.map((r, i) => histRow(r, avg, { rank: i + 1 })).join("") +
        "</div></section>" +
        (hSort !== "cost"
          ? '<p class="start-km">Sono inclusi solo i pieni completati con km/L calcolato.</p>'
          : "");
      return;
    }
    var groups = [],
      cur = null;
    rs.forEach((r) => {
      var k = r.date.slice(0, 7);
      if (!cur || cur.k !== k) {
        cur = { k: k, rows: [] };
        groups.push(cur);
      }
      cur.rows.push(r);
    });
    var html = groups
      .map((g) => {
        var p = g.k.split("-"),
          name = MONTHS_FULL[+p[1] - 1];
        var tot = g.rows.reduce((a, r) => a + r.total, 0);
        return (
          '<section class="mgroup"><h3 class="mh"><span>' +
          name.charAt(0).toUpperCase() +
          name.slice(1) +
          " " +
          p[0] +
          "</span><small>" +
          pl(g.rows.length, "rifornimento", "rifornimenti") +
          " · " +
          eur(tot, 2) +
          '</small></h3><div class="mlist">' +
          g.rows.map((r) => histRow(r, avg)).join("") +
          "</div></section>"
        );
      })
      .join("");
    if (!filtered && !hq)
      html +=
        '<p class="start-km">Partenza: <b>' + fmt0(v.initialKm) + " km</b></p>";
    box.innerHTML = html;
  }

  const statCard = (label, value, sub, cls) =>
    '<div class="stat ' +
    (cls || "") +
    '"><span class="stat-label">' +
    label +
    "</span>" +
    '<strong class="stat-value">' +
    value +
    "</strong>" +
    (sub ? '<span class="stat-sub">' + sub + "</span>" : "") +
    "</div>";

  function renderStats() {
    var v = vehicle(),
      box = $("#statsBody");
    if (!v) {
      box.innerHTML = "";
      $("#statsVehicle").textContent = "";
      return;
    }
    $("#statsVehicle").textContent = v.name + (v.plate ? " · " + v.plate : "");
    var rs = C.rows(v),
      st = C.stats(v, rs);
    if (!st.n) {
      box.innerHTML =
        '<p class="empty">Registra il primo rifornimento per vedere le statistiche di <b>' +
        esc(v.name) +
        "</b>.</p>";
      return;
    }
    var last3Sub = "media recente";
    if (st.lastN === 1) last3Sub = "media ultimo pieno";
    else if (st.lastN === 2) last3Sub = "media ultimi 2 pieni";
    else if (st.lastN >= 3) last3Sub = "media ultimi 3 pieni";
    var cards = "";
    cards += statCard(
      "Consumo medio",
      st.avgKmL ? fmt2(st.avgKmL) + " km/L" : "–",
      st.l100
        ? fmt2(st.l100) + " L/100 km"
        : "Serve almeno un pieno dopo il primo",
      "hero",
    );
    cards += statCard(
      "Costo al km",
      st.costPerKm != null ? fmt2(st.costPerKm) + " €" : "–",
      st.costPerKm != null ? fmt2(st.costPerKm * 100) + " € ogni 100 km" : "",
    );
    cards += statCard(
      "Spesa totale",
      eur(st.spent, 2),
      pl(st.n, "rifornimento", "rifornimenti"),
    );
    cards += statCard(
      "Km percorsi",
      fmt0(st.totalKm) + " km",
      "da " + fmt0(v.initialKm) + " a " + fmt0(rs[rs.length - 1].odometer),
    );
    cards += statCard(
      "Litri totali",
      fmt2(st.liters) + " L",
      "media " + fmt2(st.avgLitersPerRefuel) + " L a pieno",
    );
    cards += statCard(
      "Prezzo medio pagato",
      fmt(st.avgPrice, 3) + " €/L",
      "listino medio " + fmt(st.avgListino, 3) + " €/L",
    );
    cards += statCard(
      "Risparmio FVG",
      eur2(st.saved),
      st.fvgCount + " di " + st.n + " con sconto",
    );
    cards += statCard(
      "Miglior consumo",
      st.best ? fmt2(st.best.kmPerL) + " km/L" : "–",
      st.best ? fmtDate(st.best.date) : "",
    );
    cards += statCard(
      "Peggior consumo",
      st.worst ? fmt2(st.worst.kmPerL) + " km/L" : "–",
      st.worst ? fmtDate(st.worst.date) : "",
    );
    cards += statCard(
      "Ultimi 3 pieni",
      st.last3KmL ? fmt2(st.last3KmL) + " km/L" : "–",
      last3Sub,
    );
    cards += statCard(
      "Spesa media a rifornimento",
      eur(st.avgSpentPerRefuel, 2),
      "media " + fmt0(st.avgKmPerRefuel) + " km a pieno",
    );
    cards += statCard(
      "Spesa mensile stimata",
      st.spentPerMonth != null ? eur(st.spentPerMonth, 2) : "–",
      st.kmPerDay != null
        ? fmt(st.kmPerDay, 1) + " km al giorno"
        : "servono 2+ rifornimenti",
    );
    cards += statCard(
      "Frequenza",
      st.avgDaysBetween != null ? fmt(st.avgDaysBetween, 1) + " gg" : "–",
      "tra un rifornimento e l'altro",
    );

    if (st.partialCount > 0) {
      cards += statCard(
        "Pieni e parziali",
        st.fullCount +
          " pieni · " +
          st.partialCount +
          (st.partialCount === 1 ? " parziale" : " parziali"),
        "Parziali: " +
          fmt2(st.partialLiters) +
          " L · " +
          eur(st.partialSpent, 2) +
          " · " +
          fmt0(st.partialKm) +
          " km",
      );
    }

    var kmlPts = kmlPoints(rs),
      mon = C.monthly(rs).slice(-12);
    var l100Pts = rs
      .filter((r) => r.l100)
      .map((r) => ({
        label: fmtDate(r.date),
        short: fmtDate(r.date).slice(0, 5),
        value: r.l100,
      }));
    var cpkPts = rs
      .filter((r) => r.costPerKm != null)
      .map((r) => ({
        label: fmtDate(r.date),
        short: fmtDate(r.date).slice(0, 5),
        value: r.costPerKm,
      }));
    var run = 0,
      cumPts = rs.map((r) => {
        run += r.total;
        return {
          label: fmtDate(r.date),
          short: fmtDate(r.date).slice(0, 5),
          value: run,
        };
      });
    var priceMulti = rs.map((r) => ({
      label: fmtDate(r.date),
      short: fmtDate(r.date).slice(0, 5),
      v: [r.price, r.paid],
    }));
    var years = {};
    rs.forEach((r) => {
      var y = r.date.slice(0, 4);
      years[y] = (years[y] || 0) + r.total;
    });
    var yearItems = Object.keys(years)
      .sort()
      .reverse()
      .map((y) => ({ label: y, value: years[y], text: eur(years[y], 2) }));
    var fvgItems = [
      { label: "Con sconto FVG", value: st.fvgCount },
      { label: "Senza sconto", value: st.n - st.fvgCount },
    ];
    var typeItems = [
      { label: "Pieni", value: st.fullCount },
      { label: "Parziali", value: st.partialCount },
    ];

    var charts =
      '<div class="charts">' +
      chartCard(
        "Consumo (km/L) per rifornimento",
        kmlPts.length > 1
          ? CH.line(kmlPts, {
              decimals: 2,
              unit: "km/L",
              avg: st.avgKmL,
              label: "Consumo km/L",
            })
          : fewer("Servono almeno due pieni per il grafico."),
        "wide",
      ) +
      lastVsRecordPanel(st) +
      chartCard(
        "Consumo (L/100 km)",
        l100Pts.length > 1
          ? CH.line(l100Pts, {
              decimals: 2,
              unit: "L/100 km",
              avg: st.l100,
              label: "Litri ogni 100 km",
            })
          : fewer("Servono almeno due pieni."),
      ) +
      chartCard(
        "Prezzo: listino e pagato (€/L)",
        CH.multi(priceMulti, ["Listino", "Pagato"], {
          decimals: 3,
          unit: "€/L",
          label: "Listino e pagato",
        }),
        "wide",
      ) +
      chartCard(
        "Spesa mensile (€)",
        CH.bars(
          mon.map((m) => ({ label: monthLabel(m.key), value: m.spent })),
          { decimals: 2, unit: "€", label: "Spesa mensile" },
        ),
      ) +
      chartCard(
        "Pagato e risparmio FVG per mese (€)",
        CH.stacked(
          mon.map((m) => ({
            label: monthLabel(m.key),
            parts: [m.spent, m.saved],
          })),
          ["Pagato", "Risparmio FVG"],
          { decimals: 2, unit: "€", label: "Pagato e risparmio" },
        ),
      ) +
      chartCard(
        "Km al mese",
        CH.bars(
          mon.map((m) => ({ label: monthLabel(m.key), value: m.km })),
          { decimals: 0, unit: "km", label: "Km al mese" },
        ),
      ) +
      chartCard(
        "Litri al mese",
        CH.bars(
          mon.map((m) => ({ label: monthLabel(m.key), value: m.liters })),
          { decimals: 2, unit: "L", label: "Litri al mese" },
        ),
      ) +
      chartCard(
        "Costo al km (€)",
        cpkPts.length > 1
          ? CH.line(cpkPts, {
              decimals: 2,
              unit: "€/km",
              avg: st.costPerKm,
              label: "Costo al km",
            })
          : fewer("Servono almeno due rifornimenti."),
      ) +
      chartCard(
        "Spesa accumulata (€)",
        cumPts.length > 1
          ? CH.line(cumPts, {
              decimals: 2,
              unit: "€",
              label: "Spesa accumulata",
            })
          : fewer("Servono almeno due rifornimenti."),
      ) +
      chartCard(
        "Pagato e risparmiato",
        st.saved > 0
          ? CH.donut(
              [
                { label: "Pagato", value: st.spent },
                { label: "Risparmiato", value: st.saved },
              ],
              {
                unit: "€",
                decimals: 2,
                big: eur(st.saved, 2),
                small: "risparmiati",
                label: "Pagato e risparmiato",
              },
            )
          : fewer("Nessuno sconto FVG registrato."),
      ) +
      chartCard(
        "Rifornimenti con sconto FVG",
        CH.donut(fvgItems, {
          decimals: 0,
          big: fmt0(st.fvgCount),
          small: "con sconto",
          label: "Rifornimenti con sconto",
        }),
      ) +
      chartCard(
        "Pieni e parziali",
        CH.donut(typeItems, {
          decimals: 0,
          big: fmt0(st.n),
          small: st.n === 1 ? "rifornimento" : "rifornimenti",
          label: "Pieni e parziali",
        }),
      ) +
      chartCard(
        "Giorno della settimana",
        CH.bars(dowPoints(rs), {
          decimals: 0,
          unit: "rifornimenti",
          label: "Rifornimenti per giorno",
        }),
      ) +
      topKmlCard(rs) +
      topCariCard(rs) +
      chartCard("Spesa per anno", CH.hbars(yearItems)) +
      "</div>";
    var perfHtml = "";
    var p = st.perf;
    if (p && p.count) {
      perfHtml =
        '<div class="stat-grid" style="grid-template-columns:1fr 1fr">' +
        statCard(
          "Performance media",
          fmt2(p.avgKmL) + " km/L",
          pieniCompletati(p.count) + " · pesata sui litri",
          "hero",
        ) +
        statCard(
          "Massimo",
          fmt2(p.max) + " km/L",
          fmtDate(p.maxRow.date) + " · " + fmt0(p.maxRow.odometer) + " km",
        ) +
        statCard(
          "Minimo",
          fmt2(p.min) + " km/L",
          fmtDate(p.minRow.date) + " · " + fmt0(p.minRow.odometer) + " km",
        ) +
        statCard(
          "Mediana",
          fmt2(p.median) + " km/L",
          "valore centrale dei pieni",
        ) +
        statCard(
          "Delta max-min",
          fmt2(p.max - p.min) + " km/L",
          "differenza record/minimo",
        ) +
        statCard(
          "Consumo medio pesato",
          fmt2(p.avgKmL) + " km/L",
          p.l100 ? fmt2(p.l100) + " L/100 km" : "",
        ) +
        "</div>";
    }
    var recordBlock = recordPanel(st, { title: "Record e medie (km/L)" });
    var compare = "",
      all = S.get().vehicles;
    if (all.length > 1) {
      compare =
        '<div class="card chart-card"><h3>Confronto veicoli</h3><div class="table-wrap"><table><thead><tr>' +
        "<th>Veicolo</th><th>km/L</th><th>€/km</th><th>Spesa</th><th>Km</th></tr></thead><tbody>" +
        all
          .map((x) => {
            var s = C.stats(x, C.rows(x));
            return (
              "<tr><td>" +
              esc(x.name) +
              "</td><td>" +
              (s.avgKmL ? fmt2(s.avgKmL) : "–") +
              "</td><td>" +
              (s.costPerKm != null ? fmt2(s.costPerKm) : "–") +
              "</td><td>" +
              (s.n ? eur(s.spent, 2) : "–") +
              "</td><td>" +
              (s.n ? fmt0(s.totalKm) : "–") +
              "</td></tr>"
            );
          })
          .join("") +
        "</tbody></table></div></div>";
    }
    box.innerHTML =
      recordBlock +
      '<div class="stat-grid">' +
      cards +
      "</div>" +
      perfHtml +
      charts +
      compare;
  }

  function renderSettings() {
    var st = S.get();
    $("#sDiscount").value = toField(st.settings.fvgDiscount);
    $("#themeGrid").innerHTML = THEMES.map(
      (t) =>
        '<button type="button" class="theme-opt" role="radio" data-theme-id="' +
        t[0] +
        '" aria-checked="' +
        (t[0] === st.settings.theme) +
        '">' +
        '<span class="sw" style="background:linear-gradient(135deg,' +
        t[2] +
        " 50%," +
        t[3] +
        ' 50%)"></span><span>' +
        t[1] +
        "</span></button>",
    ).join("");

    $("#sVehicles").innerHTML = st.vehicles.length
      ? st.vehicles
          .map(
            (v) =>
              '<div class="vc-row" data-id="' +
              esc(v.id) +
              '"><span class="vc-ico">' +
              vIco(v) +
              '</span><b class="vc-name">' +
              esc(v.name) +
              (v.plate ? "<small>" + esc(v.plate) + "</small>" : "") +
              '</b><div class="vc-ctl">' +
              '<label>Principale<span class="colorpick mini"><input type="color" data-vid="' +
              esc(v.id) +
              '" data-k="1" value="' +
              v.color +
              '" /><input type="text" data-vid="' +
              esc(v.id) +
              '" data-k="1" value="' +
              v.color +
              '" maxlength="20" /></span></label>' +
              '<label>Secondario<span class="colorpick mini"><input type="color" data-vid="' +
              esc(v.id) +
              '" data-k="2" value="' +
              (v.color2 || I.shade(v.color, -0.28)) +
              '" /><input type="text" data-vid="' +
              esc(v.id) +
              '" data-k="2" value="' +
              (v.color2 || "") +
              '" maxlength="20" placeholder="nessuno" /></span></label>' +
              '<label>Terzo<span class="colorpick mini"><input type="color" data-vid="' +
              esc(v.id) +
              '" data-k="3" value="' +
              (v.color3 || v.color2 || I.shade(v.color, -0.28)) +
              '" /><input type="text" data-vid="' +
              esc(v.id) +
              '" data-k="3" value="' +
              (v.color3 || "") +
              '" maxlength="20" placeholder="nessuno" /></span></label>' +
              '<button type="button" class="btn small" data-vclear="' +
              esc(v.id) +
              '" title="Rimuovi secondario">✕</button></div>' +
              '<div class="swatches tiny">' +
              allCombos()
                .map((p) =>
                  swBtn(
                    p,
                    p.c1 === v.color &&
                      (p.c2 || "") === (v.color2 || "") &&
                      (p.c3 || "") === (v.color3 || ""),
                  ),
                )
                .join("") +
              "</div></div>",
          )
          .join("")
      : '<p class="muted small">Nessun veicolo: aggiungine uno dalla schermata Veicoli.</p>';

    $("#pList").innerHTML = st.settings.palette.length
      ? st.settings.palette
          .map(
            (p) =>
              '<div class="own-item"><span class="cswatch static" style="' +
              swStyle(p.c1, p.c2, p.c3) +
              '"></span><b>' +
              esc(p.name) +
              "</b><small>" +
              esc(p.c1) +
              (p.c2 ? " + " + esc(p.c2) : "") +
              (p.c3 ? " + " + esc(p.c3) : "") +
              '</small><button type="button" class="btn small danger" data-pdel="' +
              esc(p.id) +
              '" aria-label="Elimina ' +
              esc(p.name) +
              '">🗑</button></div>',
          )
          .join("")
      : '<p class="muted small" style="margin-top:12px">Nessuna combinazione salvata.</p>';
  }

  function renderAll() {
    applyTheme();
    renderGarage();
    renderDashboard();
    renderAddMeta();
    renderPreview();
    renderHistory();
    renderStats();
    renderSettings();
    bindMissing();
  }

  var vEditId = null;
  function pickColor() {
    var palette = [
      "#0f766e",
      "#2563eb",
      "#c2410c",
      "#7c3aed",
      "#be123c",
      "#4d7c0f",
      "#0e7490",
      "#a16207",
    ];
    return palette[S.get().vehicles.length % palette.length];
  }

  var vOldType = "auto",
    vIcon = "auto",
    vC1 = "#0f766e",
    vC2 = "",
    vC3 = "";
  const vehType = () => I.find(vIcon).t;

  function renderIconPicker() {
    var curType = vehType();
    $("#vCats").innerHTML = I.cats
      .map(
        (c) =>
          '<button type="button" class="chip' +
          (c.t === curType ? " active" : "") +
          '" role="radio" data-cat="' +
          c.t +
          '" aria-checked="' +
          (c.t === curType) +
          '">' +
          esc(c.l) +
          "</button>",
      )
      .join("");
    $("#vIcons").innerHTML = I.list
      .filter((ic) => ic.t === curType)
      .map(
        (ic) =>
          '<button type="button" class="icon-opt" role="radio" data-icon="' +
          ic.k +
          '" title="' +
          ic.l +
          '" aria-label="' +
          ic.l +
          '" aria-checked="' +
          (ic.k === vIcon) +
          '">' +
          I.svg(ic.k, vC1, vC2, vC3) +
          "</button>",
      )
      .join("");
    $("#vTypeLabel").textContent = (TYPES[vehType()] || TYPES.altro)[0];
  }

  /* ---------- colori: combinazioni, anteprima, campi ---------- */
  const swStyle = (c1, c2, c3) =>
    "background:" +
    (c3
      ? "linear-gradient(135deg," +
        c1 +
        " 34%," +
        (c2 || c1) +
        " 34% 67%," +
        c3 +
        " 67%)"
      : c2
        ? "linear-gradient(135deg," + c1 + " 50%," + c2 + " 50%)"
        : c1);
  function allCombos() {
    var own = S.get().settings.palette.map((p) => ({
      id: p.id,
      name: p.name,
      c1: p.c1,
      c2: p.c2,
      c3: p.c3 || "",
      own: true,
    }));
    return I.presets
      .map((p) => ({
        name: p[0],
        c1: p[1],
        c2: p[2],
        c3: p[3] || "",
        own: false,
      }))
      .concat(own);
  }
  const swBtn = (p, on) =>
    '<button type="button" class="cswatch' +
    (p.own ? " own" : "") +
    '" data-c1="' +
    p.c1 +
    '" data-c2="' +
    (p.c2 || "") +
    '" data-c3="' +
    (p.c3 || "") +
    '" title="' +
    esc(p.name) +
    '" aria-label="' +
    esc(p.name) +
    '" aria-pressed="' +
    !!on +
    '" style="' +
    swStyle(p.c1, p.c2, p.c3) +
    '"></button>';

  function renderVehicleColors(skip) {
    $("#vPreview").innerHTML =
      '<span class="vprev-ico">' +
      I.svg(vIcon, vC1, vC2, vC3) +
      '</span><span class="vprev-txt"><b>' +
      esc($("#vName").value.trim() || "Anteprima") +
      "</b><small>" +
      esc(vC1) +
      (vC2 ? " + " + esc(vC2) : " (secondario automatico)") +
      (vC3 ? " + " + esc(vC3) : "") +
      "</small></span>";
    $("#vSwatches").innerHTML = allCombos()
      .map((p) =>
        swBtn(p, p.c1 === vC1 && (p.c2 || "") === vC2 && (p.c3 || "") === vC3),
      )
      .join("");
    $("#vColor1").value = vC1;
    $("#vColor2").value = vC2 || I.shade(vC1, -0.28);
    $("#vColor3").value = vC3 || vC2 || I.shade(vC1, -0.28);
    if (skip !== "hex1") $("#vHex1").value = vC1;
    if (skip !== "hex2") $("#vHex2").value = vC2;
    if (skip !== "hex3") $("#vHex3").value = vC3;
    renderIconPicker();
  }

  function bindColors() {
    $("#vColor1").addEventListener("input", function () {
      vC1 = I.normHex(this.value) || vC1;
      renderVehicleColors();
    });
    $("#vColor2").addEventListener("input", function () {
      vC2 = I.normHex(this.value) || vC2;
      renderVehicleColors();
    });
    $("#vHex1").addEventListener("input", function () {
      var n = I.normHex(this.value);
      if (n) {
        vC1 = n;
        renderVehicleColors("hex1");
      }
    });
    $("#vHex2").addEventListener("input", function () {
      if (!this.value.trim()) vC2 = "";
      else {
        var n = I.normHex(this.value);
        if (!n) return;
        vC2 = n;
      }
      renderVehicleColors("hex2");
    });
    $("#vColor3").addEventListener("input", function () {
      vC3 = I.normHex(this.value) || vC3;
      renderVehicleColors();
    });
    $("#vHex3").addEventListener("input", function () {
      if (!this.value.trim()) vC3 = "";
      else {
        var n = I.normHex(this.value);
        if (!n) return;
        vC3 = n;
      }
      renderVehicleColors("hex3");
    });
    $("#vNoColor3").addEventListener("click", function () {
      vC3 = "";
      renderVehicleColors();
    });
    $("#vNoColor2").addEventListener("click", function () {
      vC2 = "";
      renderVehicleColors();
    });
    $("#vName").addEventListener("input", function () {
      renderVehicleColors("hex1");
    });
    $("#vSwatches").addEventListener("click", function (e) {
      var b = e.target.closest(".cswatch");
      if (!b) return;
      vC1 = b.dataset.c1;
      vC2 = b.dataset.c2 || "";
      vC3 = b.dataset.c3 || "";
      renderVehicleColors();
    });
    $("#vSavePalette").addEventListener("click", function () {
      var name = window.prompt(
        "Nome della combinazione:",
        vC2 ? "Mix personale" : "Colore personale",
      );
      if (name == null) return;
      var p = S.addPalette(name.trim() || "Colore personale", vC1, vC2, vC3);
      if (!p) return toast("Colore non valido", "error");
      renderVehicleColors();
      renderSettings();
      toast("Combinazione salvata");
    });

    /* impostazioni: colori per veicolo */
    $("#sVehicles").addEventListener("change", function (e) {
      var t = e.target;
      var id = t.dataset.vid,
        k = t.dataset.k;
      if (!id || !k) return;
      var val = t.value.trim();
      var n = I.normHex(val);
      var patch = {};
      if (k === "1") {
        if (!n) {
          toast("Colore non valido", "error");
          return renderSettings();
        }
        patch.color = n;
      } else {
        if (val && !n) {
          toast("Colore non valido", "error");
          return renderSettings();
        }
        patch[k === "3" ? "color3" : "color2"] = n;
      }
      S.updateVehicle(id, patch);
      renderAll();
      applyChrome(false);
      toast("Colore aggiornato");
    });
    $("#sVehicles").addEventListener("click", function (e) {
      var b = e.target.closest("[data-vclear]");
      if (b) {
        S.updateVehicle(b.dataset.vclear, { color2: "", color3: "" });
        renderAll();
        applyChrome(false);
        toast("Colore secondario rimosso");
        return;
      }
      var sw = e.target.closest(".cswatch");
      if (sw) {
        S.updateVehicle(sw.closest("[data-id]").dataset.id, {
          color: sw.dataset.c1,
          color2: sw.dataset.c2 || "",
          color3: sw.dataset.c3 || "",
        });
        renderAll();
        applyChrome(false);
        toast("Colori aggiornati");
      }
    });

    /* impostazioni: crea combinazione */
    function sync(colorId, hexId) {
      $("#" + colorId).addEventListener("input", function () {
        $("#" + hexId).value = this.value;
      });
      $("#" + hexId).addEventListener("input", function () {
        var n = I.normHex(this.value);
        if (n) $("#" + colorId).value = n;
      });
    }
    sync("pColor1", "pHex1");
    sync("pColor2", "pHex2");
    sync("pColor3", "pHex3");
    $("#pAdd").addEventListener("click", function () {
      var err = $("#pError");
      err.hidden = true;
      var h1 = $("#pHex1").value.trim(),
        h2 = $("#pHex2").value.trim(),
        h3 = $("#pHex3").value.trim();
      var c1 = I.normHex(h1 || $("#pColor1").value);
      var c2 = h2 ? I.normHex(h2) : "";
      var c3 = h3 ? I.normHex(h3) : "";
      if (!c1 || (h2 && !c2) || (h3 && !c3)) {
        err.textContent =
          "Colore non valido: usa un codice come #2563eb oppure un nome come red, teal, gold.";
        err.hidden = false;
        return;
      }
      var name = $("#pName").value.trim() || (c2 ? c1 + " + " + c2 : c1);
      S.addPalette(name, c1, c2, c3);
      $("#pName").value = "";
      $("#pHex1").value = "";
      $("#pHex2").value = "";
      $("#pHex3").value = "";
      renderSettings();
      toast("Combinazione aggiunta");
    });
    $("#pList").addEventListener("click", function (e) {
      var d = e.target.closest("[data-pdel]");
      if (!d) return;
      S.deletePalette(d.dataset.pdel);
      renderSettings();
      toast("Combinazione eliminata");
    });
  }

  function openVehicleDialog(id) {
    var dlg = $("#vehicleDialog");
    var v = id ? S.get().vehicles.filter((x) => x.id === id)[0] : null;
    vEditId = v ? v.id : null;
    $("#vTitle").textContent = v ? "Modifica veicolo" : "Nuovo veicolo";
    $("#vIntro").hidden = !!v;
    $("#vDelete").hidden = !v;
    vOldType = v ? v.type : "auto";
    $("#vName").value = v ? v.name : "";
    $("#vPlate").value = v ? v.plate : "";
    $("#vFuel").value = v ? v.fuel : "Benzina";
    $("#vInitKm").value = v ? fmt0(v.initialKm) : "";
    $("#vTank").value = v && v.tank != null ? toField(v.tank) : "";
    vIcon = v ? v.icon || I.typeIcon[v.type] || "auto" : "auto";
    vC1 = v ? v.color : pickColor();
    vC2 = v ? v.color2 || "" : "";
    vC3 = v ? v.color3 || "" : "";
    renderVehicleColors();
    $("#vError").hidden = true;
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
    setTimeout(() => {
      $("#vName").focus();
    }, 30);
  }

  function closeVehicleDialog() {
    var dlg = $("#vehicleDialog");
    if (dlg.open) dlg.close();
  }

  function onVehicleSubmit(e) {
    e.preventDefault();
    var name = $("#vName").value.trim();
    var km = parseNum($("#vInitKm").value, true);
    var tankStr = $("#vTank").value.trim();
    var tank = tankStr ? parseNum(tankStr) : null;
    function fail(msg) {
      var el = $("#vError");
      el.textContent = msg;
      el.hidden = false;
    }
    if (!name) return fail("Inserisci il nome del veicolo.");
    if (!isFinite(km) || km < 0)
      return fail("Inserisci i km attuali del contachilometri.");
    if (!tankStr || !isFinite(tank) || tank <= 0)
      return fail("Inserisci la capacità del serbatoio in litri (es. 38).");
    var data = {
      type: vehType(),
      name: name,
      plate: $("#vPlate").value.trim().toUpperCase(),
      fuel: $("#vFuel").value,
      initialKm: km,
      tank: tank,
      icon: vIcon,
      color: vC1,
      color2: vC2,
      color3: vC3,
    };
    if (vEditId) {
      var cur = S.get().vehicles.filter((x) => x.id === vEditId)[0];
      var minOdo = cur.refuels.length
        ? Math.min.apply(
            null,
            cur.refuels.map((r) => r.odometer),
          )
        : Infinity;
      if (km >= minOdo)
        return fail(
          "I km iniziali devono essere inferiori al primo rifornimento (" +
            fmt0(minOdo) +
            " km).",
        );
      var maxL = cur.refuels.length
        ? Math.max.apply(
            null,
            cur.refuels.map((r) => r.liters),
          )
        : 0;
      if (tank < maxL)
        return fail(
          "Il serbatoio non può essere inferiore al rifornimento più grande già registrato (" +
            fmt2(maxL) +
            " L).",
        );
      S.updateVehicle(vEditId, data);
      closeVehicleDialog();
      renderAll();
      applyChrome(false);
      toast("Veicolo aggiornato");
    } else {
      var created = S.addVehicle(data);
      closeVehicleDialog();
      openVehicle(created.id);
      toast(created.name + " aggiunto: ora registra il primo rifornimento");
    }
  }

  function onVehicleDelete() {
    var v = S.get().vehicles.filter((x) => x.id === vEditId)[0];
    if (!v) return;
    if (
      window.confirm(
        'Eliminare "' +
          v.name +
          '" e ' +
          (v.refuels.length === 1
            ? "il suo rifornimento"
            : "i suoi " + v.refuels.length + " rifornimenti") +
          "? Operazione non annullabile.",
      )
    ) {
      S.deleteVehicle(v.id);
      closeVehicleDialog();
      showGarage();
      toast("Veicolo eliminato");
    }
  }

  const stamp = () => S.todayISO();

  /** Costruisce il CSV per uno o più veicoli (con colonne veicolo/targa se withVeh). */
  function csvBuild(list, withVeh) {
    function n(x, d) {
      return x == null || !isFinite(x)
        ? ""
        : String(Number(x.toFixed(d))).replace(".", ",");
    }
    function t(s) {
      return '"' + String(s).replace(/"/g, '""') + '"';
    }
    var head =
      "data;km_finali;km_percorsi;litri;prezzo_listino;sconto_fvg;prezzo_pagato;totale;km_l;l_100km;costo_km;pieno;note";
    var lines = [(withVeh ? "veicolo;targa;" : "") + head];
    var count = 0;
    list.forEach((v) => {
      C.rows(v).forEach((r) => {
        count++;
        var cells = [
          r.date,
          n(r.odometer, 1),
          n(r.km, 1),
          n(r.liters, 2),
          n(r.price, 3),
          r.fvg ? n(r.price - r.paid, 3) : "",
          n(r.paid, 3),
          n(r.total, 2),
          n(r.kmPerL, 2),
          n(r.l100, 2),
          n(r.costPerKm, 2),
          r.full ? "si" : "no",
          t(r.note),
        ];
        if (withVeh) cells.unshift(t(v.name), t(v.plate));
        lines.push(cells.join(";"));
      });
    });
    return count ? "\ufeff" + lines.join("\r\n") : null;
  }

  /* =====================================================================
   *  CONDIVISIONE · EXPORT · IMPORT (Excel / CSV / JSON)
   * ===================================================================== */
  var SH_ICO = {
    share:
      '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash:
      '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.6-5.3A8.4 8.4 0 1 1 21 11.5Z"/>',
    send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    sheet:
      '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
    box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5Z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    download:
      '<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/>',
    upload: '<path d="M12 15V3"/><path d="M7 8l5-5 5 5"/><path d="M5 21h14"/>',
  };
  function shi(name, cls) {
    return (
      '<svg class="ico ' +
      (cls || "") +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      SH_ICO[name] +
      "</svg>"
    );
  }

  const safeName = (s) => String(s).replace(/[^\w-]+/g, "_");
  const XLSX_MIME =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const hasX = () => typeof window.XLSX !== "undefined";
  const rnd = (x, d) =>
    x == null || !isFinite(x) ? null : Number(Number(x).toFixed(d));

  /* ---------- CSV (sempre con colonne veicolo/targa: re-importabile) ---------- */
  function csvFile(all, targetVeh) {
    var vObj = targetVeh || vehicle();
    var list = all ? S.get().vehicles : [vObj].filter(Boolean);
    if (!list.length) {
      toast(
        all ? "Nessun dato da esportare" : "Apri prima un veicolo",
        "error",
      );
      return null;
    }
    var text = csvBuild(list, true);
    if (!text) {
      toast("Nessun rifornimento da esportare", "error");
      return null;
    }
    var name = all
      ? "ricarica-pieno-tutti-i-veicoli-" + stamp() + ".csv"
      : "ricarica-pieno-" + safeName(list[0].name) + "-" + stamp() + ".csv";
    return { name: name, text: text };
  }

  /* ---------- Excel (.xlsx): fogli «Veicoli» e «Rifornimenti» ---------- */
  function xlsxBuild(list) {
    if (!hasX()) return null;
    var X = window.XLSX,
      wb = X.utils.book_new();
    var vh = [
      [
        "nome",
        "targa",
        "tipo",
        "carburante",
        "km_iniziali",
        "serbatoio_L",
        "km_attuali",
        "rifornimenti",
        "litri_totali",
        "spesa_totale_eur",
        "consumo_medio_km_l",
        "costo_km_eur",
        "risparmio_fvg_eur",
      ],
    ];
    var rh = [
      [
        "veicolo",
        "targa",
        "data",
        "km_finali",
        "km_percorsi",
        "litri",
        "prezzo_listino",
        "sconto_fvg",
        "prezzo_pagato",
        "totale",
        "km_l",
        "l_100km",
        "costo_km",
        "pieno",
        "note",
      ],
    ];
    list.forEach((v) => {
      var rs = C.rows(v),
        st = C.stats(v, rs);
      vh.push([
        v.name,
        v.plate,
        v.type,
        v.fuel,
        v.initialKm,
        v.tank,
        rs.length ? rs[rs.length - 1].odometer : v.initialKm,
        st.n || 0,
        rnd(st.liters, 2),
        rnd(st.spent, 2),
        rnd(st.avgKmL, 2),
        rnd(st.costPerKm, 3),
        rnd(st.saved, 2),
      ]);
      rs.forEach((r) => {
        var p = String(r.date).split("-");
        rh.push([
          v.name,
          v.plate,
          new Date(+p[0], +p[1] - 1, +p[2]),
          r.odometer,
          rnd(r.km, 1),
          rnd(r.liters, 2),
          rnd(r.price, 3),
          r.fvg ? rnd(r.price - r.paid, 3) : null,
          rnd(r.paid, 3),
          rnd(r.total, 2),
          rnd(r.kmPerL, 2),
          rnd(r.l100, 2),
          rnd(r.costPerKm, 3),
          r.full ? "si" : "no",
          r.note || "",
        ]);
      });
    });
    function sheet(aoa, widths, fmts) {
      var ws = X.utils.aoa_to_sheet(aoa, { cellDates: true });
      ws["!cols"] = widths.map((w) => ({ wch: w }));
      Object.keys(fmts).forEach((c) => {
        for (var r = 1; r < aoa.length; r++) {
          var cell = ws[X.utils.encode_cell({ r: r, c: +c })];
          if (cell && cell.t !== "s") cell.z = fmts[c];
        }
      });
      if (ws["!ref"]) ws["!autofilter"] = { ref: ws["!ref"] };
      return ws;
    }
    X.utils.book_append_sheet(
      wb,
      sheet(vh, [22, 12, 10, 12, 12, 12, 12, 13, 12, 16, 18, 14, 17], {
        4: "#,##0",
        6: "#,##0",
        8: "#,##0.00",
        9: "#,##0.00",
        10: "0.00",
        11: "0.000",
        12: "#,##0.00",
      }),
      "Veicoli",
    );
    X.utils.book_append_sheet(
      wb,
      sheet(rh, [22, 12, 12, 11, 12, 9, 14, 11, 13, 10, 8, 9, 10, 7, 30], {
        2: "dd/mm/yyyy",
        3: "#,##0",
        4: "#,##0.0",
        5: "0.00",
        6: "0.000",
        7: "0.000",
        8: "0.000",
        9: "0.00",
        10: "0.00",
        11: "0.00",
        12: "0.000",
      }),
      "Rifornimenti",
    );
    return new Uint8Array(X.write(wb, { bookType: "xlsx", type: "array" }));
  }

  /* Prepara {name, data, mime} per xlsx / csv / json */
  function fileFor(kind, all, targetVeh) {
    var vObj = targetVeh || vehicle();
    var list = all ? S.get().vehicles : [vObj].filter(Boolean);
    if (!list.length) {
      toast(
        all ? "Nessun dato da esportare" : "Apri prima un veicolo",
        "error",
      );
      return null;
    }
    var base = all
      ? "ricarica-pieno-garage-" + stamp()
      : "ricarica-pieno-" + safeName(list[0].name) + "-" + stamp();
    if (kind === "json")
      return {
        name: base + ".json",
        data: S.exportData(all ? undefined : list[0].id),
        mime: "application/json",
      };
    if (kind === "xlsx") {
      var x = xlsxBuild(list);
      if (x) return { name: base + ".xlsx", data: x, mime: XLSX_MIME };
      toast("Libreria Excel non trovata: uso il CSV", "error");
    }
    var c = csvFile(all, targetVeh);
    return c ? { name: c.name, data: c.text, mime: "text/csv" } : null;
  }

  function exportFile(kind, all, targetVeh) {
    var f = fileFor(kind, all === true, targetVeh);
    if (f) {
      download(f.name, f.data, f.mime);
      toast("File scaricato: " + f.name);
    }
  }
  async function shareFileKind(kind, all, targetVeh) {
    var f = fileFor(kind, all === true, targetVeh);
    if (f) await shareFile(f.name, f.data, f.mime, "Ricarica Pieno");
  }

  async function shareFile(name, data, mime, title) {
    try {
      var f = new File([data], name, { type: mime });
      if (navigator.canShare && navigator.canShare({ files: [f] })) {
        await navigator.share({ files: [f], title: title });
        return;
      }
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }
    download(name, data, mime);
    toast("Condivisione file non supportata qui: file scaricato");
  }

  /* ---------- Messaggio bello (formato WhatsApp: *grassetto* _corsivo_) ---------- */
  var SEP = "━━━━━━━━━━━━━━━";

  function vehicleBlock(v, withRecent) {
    var rs = C.rows(v),
      st = C.stats(v, rs);
    var odo = rs.length ? rs[rs.length - 1].odometer : v.initialKm;
    var L = [
      "🚗 *" +
        v.name +
        "*" +
        (v.plate ? " · " + v.plate : "") +
        (v.fuel ? " · " + v.fuel : ""),
      "🧭 Contachilometri: *" + fmt0(odo) + " km*",
    ];
    if (!st.n) {
      L.push("⛽ Nessun rifornimento registrato");
      return L.join("\n");
    }
    L.push(
      "⛽ " +
        pl(st.n, "rifornimento", "rifornimenti") +
        (st.partialCount > 0
          ? " (" +
            fmt0(st.fullCount) +
            " pieni, " +
            fmt0(st.partialCount) +
            " parziali)"
          : ""),
    );
    if (st.avgKmL)
      L.push(
        "📉 Consumo medio: *" +
          fmt2(st.avgKmL) +
          " km/L* (" +
          fmt2(st.l100) +
          " L/100 km)",
      );
    if (st.last3KmL && st.lastN > 1)
      L.push(
        "🔄 Ultimi " + st.lastN + " pieni: " + fmt2(st.last3KmL) + " km/L",
      );
    if (st.perf && st.perf.count)
      L.push(
        "🏆 Record: " +
          fmt2(st.perf.max) +
          " km/L (" +
          fmtDate(st.perf.maxRow.date) +
          ")",
      );
    L.push("💶 Spesa totale: *" + eur(st.spent, 2) + "*");
    L.push("🛢️ Litri totali: " + fmt2(st.liters) + " L");
    if (st.avgPrice) L.push("🏷️ Prezzo medio: " + fmt(st.avgPrice, 3) + " €/L");
    if (st.costPerKm != null) L.push("🪙 Costo al km: " + eur(st.costPerKm, 2));
    if (st.saved > 0) L.push("🎁 Risparmio FVG: " + eur(st.saved, 2));
    if (withRecent) {
      L.push("", "🕒 *Ultimi rifornimenti*");
      rs.slice(-3)
        .reverse()
        .forEach((r) => {
          L.push(
            "• " +
              fmtDate(r.date) +
              " · " +
              fmt2(r.liters) +
              " L · " +
              eur(r.total, 2) +
              (r.kmPerL ? " · " + fmt2(r.kmPerL) + " km/L" : "") +
              (r.full ? "" : " (parziale)"),
          );
        });
    }
    return L.join("\n");
  }

  function buildMessage(list, withRecent) {
    var many = list.length > 1;
    var out = [
      "⛽ *Ricarica Pieno*",
      many
        ? "📊 Il mio garage · " + pl(list.length, "veicolo", "veicoli")
        : "📊 Riepilogo veicolo",
      SEP,
      list.map((v) => vehicleBlock(v, withRecent)).join("\n" + SEP + "\n"),
    ];
    if (many) {
      var tk = 0,
        tl = 0,
        ts = 0,
        tv = 0;
      list.forEach((v) => {
        var st = C.stats(v, C.rows(v));
        if (st.n) {
          tk += st.totalKm || 0;
          tl += st.liters;
          ts += st.spent;
          tv += st.saved || 0;
        }
      });
      out.push(
        SEP,
        "🧮 *Totale garage*",
        "🛣️ Km registrati: " + fmt0(tk) + " km",
        "🛢️ Litri: " + fmt2(tl) + " L",
        "💶 Spesa: *" + eur(ts, 2) + "*",
      );
      if (tv > 0) out.push("🎁 Risparmio FVG: " + eur(tv, 2));
    }
    out.push(SEP, "_Aggiornato al " + fmtDate(stamp()) + " · Ricarica Pieno_");
    return out.join("\n");
  }

  async function shareRawText(title, text) {
    try {
      if (navigator.share) {
        await navigator.share({ title: title, text: text });
        return;
      }
      await copyText(text);
    } catch (err) {
      if (err && err.name === "AbortError") return;
      toast("Impossibile condividere", "error");
    }
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast("Messaggio copiato negli appunti ✓");
  }

  async function shareSingleRefuel(refuelId) {
    var v = vehicle();
    if (!v) return;
    var r = C.rows(v).filter((x) => x.id === refuelId)[0];
    if (!r) return;
    var L = [
      "⛽ *Rifornimento* · " + fmtDate(r.date),
      "🚗 *" + v.name + "*" + (v.plate ? " · " + v.plate : ""),
      SEP,
      "🧭 Contachilometri: *" +
        fmt0(r.odometer) +
        " km* (+" +
        kmFmt(r.km) +
        " km)",
      "🛢️ Litri: " + fmt2(r.liters) + " L" + (r.full ? "" : " (parziale)"),
      "🏷️ Prezzo: " +
        fmt(r.paid, 3) +
        " €/L" +
        (r.fvg ? " (sconto FVG −" + fmt(r.price - r.paid, 3) + ")" : ""),
      "💶 Totale: *" + eur(r.total, 2) + "*",
    ];
    if (r.kmPerL)
      L.push(
        "📉 Consumo: *" +
          fmt2(r.kmPerL) +
          " km/L* (" +
          fmt2(r.l100) +
          " L/100 km)",
      );
    if (r.costPerKm != null) L.push("🪙 Costo al km: " + eur(r.costPerKm, 2));
    if (r.note) L.push("📝 " + r.note);
    L.push(SEP, "_Ricarica Pieno_");
    await shareRawText(
      "Rifornimento " + v.name + " – " + fmtDate(r.date),
      L.join("\n"),
    );
  }

  /* ---------- Pannello Condividi ---------- */
  var shS = { veh: null, scope: "v", recent: true };

  function shList() {
    return shS.scope === "all" || !shS.veh ? S.get().vehicles : [shS.veh];
  }
  const shAll = () => shS.scope === "all" || !shS.veh;
  const shMessage = () => buildMessage(shList(), shS.recent);

  function previewHtml(msg) {
    return esc(msg)
      .replace(/\*([^*\n]+)\*/g, "<b>$1</b>")
      .replace(/^_(.+)_$/gm, "<i>$1</i>");
  }

  function shTile(k, ic, col, name, desc) {
    return (
      '<div class="sh-tile"><button type="button" class="main" data-sh="file-' +
      k +
      '"><i style="background:' +
      col +
      '">' +
      shi(ic) +
      "</i><span><b>" +
      name +
      "</b><small>" +
      desc +
      "</small></span></button>" +
      '<button type="button" class="dl" data-sh="dl-' +
      k +
      '" title="Scarica sul dispositivo" aria-label="Scarica ' +
      name +
      '">' +
      shi("download") +
      "</button></div>"
    );
  }

  function renderShare() {
    var st = S.get(),
      many = st.vehicles.length > 1;
    $("#shTitle").textContent =
      "Condividi · " + (shAll() ? "Tutto il garage" : shS.veh.name);
    $("#shSub").textContent = shAll()
      ? pl(st.vehicles.length, "veicolo", "veicoli") + " nel messaggio"
      : "Riepilogo, file Excel o backup";
    var h = "";
    if (shS.veh && many)
      h +=
        '<div class="sh-seg" role="tablist">' +
        '<button type="button" data-sc="v" class="' +
        (shS.scope === "v" ? "on" : "") +
        '">🚗 ' +
        esc(shS.veh.name) +
        "</button>" +
        '<button type="button" data-sc="all" class="' +
        (shS.scope === "all" ? "on" : "") +
        '">🏠 Tutto il garage (' +
        st.vehicles.length +
        ")</button></div>";
    h +=
      '<div class="sh-sec"><div class="sh-lab"><span>Messaggio pronto</span>' +
      '<button type="button" class="sh-chip' +
      (shS.recent ? " on" : "") +
      '" data-sh="recent">' +
      (shS.recent ? "✓ " : "") +
      "Ultimi rifornimenti</button></div>" +
      '<div class="sh-bubble">' +
      previewHtml(shMessage()) +
      "</div></div>" +
      '<button type="button" class="btn share-cta big" data-sh="native">' +
      shi("share") +
      " Invia messaggio…</button>" +
      '<div class="sh-ch">' +
      '<button type="button" data-sh="wa"><i style="background:#25d366">' +
      shi("chat") +
      "</i>WhatsApp</button>" +
      '<button type="button" data-sh="tg"><i style="background:#229ed9">' +
      shi("send") +
      "</i>Telegram</button>" +
      '<button type="button" data-sh="mail"><i style="background:#f97316">' +
      shi("mail") +
      "</i>E-mail</button>" +
      '<button type="button" data-sh="copy"><i style="background:#64748b">' +
      shi("copy") +
      "</i>Copia</button></div>" +
      '<div class="sh-sec"><div class="sh-lab"><span>Oppure invia un file</span></div><div class="sh-files">' +
      shTile(
        "xlsx",
        "sheet",
        "#1d6f42",
        "Excel (.xlsx)",
        "Tabelle pronte, si riapre con «Importa»",
      ) +
      shTile(
        "csv",
        "file",
        "#0ea5e9",
        "CSV",
        "Compatibile con ogni foglio di calcolo",
      ) +
      shTile(
        "json",
        "box",
        "#8b5cf6",
        "Backup JSON",
        "Copia completa per ripristinare l'app",
      ) +
      "</div></div>" +
      '<button type="button" class="sh-imp" data-sh="import">' +
      shi("upload") +
      " Hai un file Excel, CSV o JSON? <b>Importalo</b></button>";
    $("#shBody").innerHTML = h;
  }

  function openShareDialog(targetVehId) {
    var st = S.get();
    if (!st.vehicles.length) {
      toast("Nessun dato da condividere", "error");
      return;
    }
    var v = targetVehId
      ? st.vehicles.filter((x) => x.id === targetVehId)[0]
      : screen === "app"
        ? vehicle()
        : null;
    shS.veh = v || null;
    shS.scope = v ? "v" : "all";
    renderShare();
    var dlg = $("#shareDialog");
    if (!dlg.open) {
      if (typeof dlg.showModal === "function") dlg.showModal();
      else dlg.setAttribute("open", "");
    }
  }

  function onShareClick(e) {
    var sc = e.target.closest("[data-sc]");
    if (sc) {
      shS.scope = sc.dataset.sc;
      return renderShare();
    }
    var b = e.target.closest("[data-sh]");
    if (!b) return;
    var a = b.dataset.sh,
      all = shAll(),
      v = shS.veh,
      enc = encodeURIComponent;
    if (a === "recent") {
      shS.recent = !shS.recent;
      return renderShare();
    }
    var msg = shMessage();
    var subj = "Ricarica Pieno – " + (all ? "il mio garage" : v.name);
    if (a === "native") shareRawText(subj, msg);
    else if (a === "copy") copyText(msg);
    else if (a === "wa")
      window.open("https://wa.me/?text=" + enc(msg), "_blank", "noopener");
    else if (a === "tg")
      window.open(
        "https://t.me/share/url?url=" +
          enc(/^https?:/.test(location.href) ? location.href : "https://t.me") +
          "&text=" +
          enc(msg),
        "_blank",
        "noopener",
      );
    else if (a === "mail")
      location.href = "mailto:?subject=" + enc(subj) + "&body=" + enc(msg);
    else if (a.indexOf("file-") === 0) shareFileKind(a.slice(5), all, v);
    else if (a.indexOf("dl-") === 0) exportFile(a.slice(3), all, v);
    else if (a === "import") {
      var dlg = $("#shareDialog");
      if (dlg.open) dlg.close();
      $("#importMode").value = "merge";
      $("#importFile").click();
    }
  }

  /* ---------- IMPORT: Excel / CSV / JSON ---------- */
  const nk = (s) =>
    String(s == null ? "" : s)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  var VEH_KEYS = {
    nome: "name",
    veicolo: "name",
    targa: "plate",
    tipo: "type",
    carburante: "fuel",
    kminiziali: "initial",
    serbatoio: "tank",
    serbatoiol: "tank",
  };
  var REF_KEYS = {
    veicolo: "veh",
    nome: "veh",
    targa: "plate",
    data: "date",
    kmfinali: "odo",
    km: "odo",
    odometro: "odo",
    contachilometri: "odo",
    odometer: "odo",
    kmpercorsi: "trip",
    litri: "liters",
    l: "liters",
    quantita: "liters",
    prezzolistino: "price",
    listino: "price",
    prezzo: "price",
    scontofvg: "disc",
    sconto: "disc",
    prezzopagato: "paid",
    totale: "total",
    importo: "total",
    spesa: "total",
    pieno: "full",
    note: "note",
  };

  /** Numero da Excel (number) o testo italiano/inglese ("1.234,5", "12,5", "12.5"). */
  function pn(v) {
    if (v == null || v === "") return null;
    if (typeof v === "number") return isFinite(v) ? v : null;
    var s = String(v).replace(/[€\s]/g, "");
    if (!s) return null;
    var c = s.lastIndexOf(","),
      d = s.lastIndexOf(".");
    if (c >= 0 && d >= 0)
      s = c > d ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
    else if (c >= 0) s = s.replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
    var n = Number(s);
    return isFinite(n) ? n : null;
  }
  /** Data → "aaaa-mm-gg" da Date Excel, seriale, "gg/mm/aaaa" o ISO. */
  function pd(v) {
    var y, m, d, p;
    if (v instanceof Date) {
      var t = new Date(v.getTime() + 43200000);
      y = t.getFullYear();
      m = t.getMonth() + 1;
      d = t.getDate();
    } else if (typeof v === "number" && v > 20000 && v < 80000) {
      var u = new Date(Math.round((v - 25569) * 86400000));
      y = u.getUTCFullYear();
      m = u.getUTCMonth() + 1;
      d = u.getUTCDate();
    } else if (
      v != null &&
      (p = String(v)
        .trim()
        .match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))
    ) {
      y = +p[1];
      m = +p[2];
      d = +p[3];
    } else if (
      v != null &&
      (p = String(v)
        .trim()
        .match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/))
    ) {
      d = +p[1];
      m = +p[2];
      y = +p[3];
      if (y < 100) y += 2000;
    } else return null;
    if (!(y > 1950 && m >= 1 && m <= 12 && d >= 1 && d <= 31)) return null;
    return (
      y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0")
    );
  }
  function isFull(v) {
    if (v == null || v === "") return true;
    if (typeof v === "boolean") return v;
    var s = nk(v);
    return !(
      s === "no" ||
      s === "false" ||
      s === "0" ||
      s === "n" ||
      s === "parziale"
    );
  }

  function csvParse(text) {
    text = String(text).replace(/^\ufeff/, "");
    var first = text.split(/\r?\n/)[0] || "";
    var sep = [";", "\t", ","]
      .map((s) => [s, first.split(s).length])
      .sort((a, b) => b[1] - a[1])[0][0];
    var rows = [],
      row = [],
      cell = "",
      q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) {
        if (ch === '"') {
          if (text[i + 1] === '"') {
            cell += '"';
            i++;
          } else q = false;
        } else cell += ch;
      } else if (ch === '"') q = true;
      else if (ch === sep) {
        row.push(cell);
        cell = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else cell += ch;
    }
    if (cell !== "" || row.length) {
      row.push(cell);
      rows.push(row);
    }
    return rows;
  }

  function addTable(tables, aoa) {
    aoa = (aoa || []).filter(
      (r) => r && r.some((c) => c != null && String(c).trim() !== ""),
    );
    if (aoa.length < 1) return;
    var heads = aoa[0].map(nk);
    function build(KEYS) {
      var map = {},
        found = {};
      heads.forEach((h, i) => {
        if (KEYS[h] && !found[KEYS[h]]) {
          found[KEYS[h]] = true;
          map[i] = KEYS[h];
        }
      });
      return { map: map, found: found };
    }
    function recs(m) {
      return aoa.slice(1).map((r) => {
        var o = {};
        Object.keys(m).forEach((i) => {
          o[m[i]] = r[i];
        });
        return o;
      });
    }
    var rf = build(REF_KEYS);
    if (rf.found.odo && rf.found.liters) {
      tables.ref = tables.ref.concat(recs(rf.map));
      return;
    }
    var vf = build(VEH_KEYS);
    if (vf.found.name) tables.veh = tables.veh.concat(recs(vf.map));
  }

  function buildImport(tables, fname) {
    var act = S.activeVehicle();
    var key = (n, p) => nk(n) + "|" + nk(p);
    var vinfo = {};
    tables.veh.forEach((r) => {
      if (r.name && String(r.name).trim()) vinfo[key(r.name, r.plate)] = r;
    });
    var groups = {},
      order = [],
      skipped = 0;
    var fallback = String(fname || "Veicolo importato").replace(/\.[^.]+$/, "");
    tables.ref.forEach((r) => {
      var date = pd(r.date),
        odo = pn(r.odo),
        liters = pn(r.liters);
      if (!date || odo == null || !(liters > 0)) {
        skipped++;
        return;
      }
      var name, plate;
      if (r.veh != null && String(r.veh).trim()) {
        name = String(r.veh).trim();
        plate = r.plate ? String(r.plate).trim() : "";
      } else {
        name = act ? act.name : fallback;
        plate = act ? act.plate : "";
      }
      var disc = pn(r.disc) || 0,
        paid = pn(r.paid),
        total = pn(r.total),
        price = pn(r.price);
      if (!(price > 0))
        price = paid > 0 ? paid + disc : total > 0 ? total / liters : 0;
      var k = key(name, plate);
      if (!groups[k]) {
        groups[k] = { name: name, plate: plate, list: [] };
        order.push(k);
      }
      groups[k].list.push({
        date: date,
        odometer: odo,
        liters: liters,
        price: price,
        fvg: disc > 0,
        discount: disc,
        paidTotal: total > 0 ? total : null,
        full: isFull(r.full),
        note: r.note ? String(r.note) : "",
        _trip: pn(r.trip),
      });
    });
    var vehicles = [];
    order.forEach((k) => {
      var g = groups[k];
      var info = vinfo[k] || null;
      if (!info)
        Object.keys(vinfo).some((kk) => {
          if (kk.split("|")[0] === nk(g.name)) {
            info = vinfo[kk];
            return true;
          }
        });
      var first = g.list.reduce((a, r) => (r.odometer < a.odometer ? r : a));
      var ini = info ? pn(info.initial) : null;
      if (ini == null)
        ini =
          first._trip != null && first._trip >= 0
            ? first.odometer - first._trip
            : first.odometer;
      vehicles.push({
        name: g.name,
        plate: g.plate || (info && info.plate) || "",
        type: info && info.type ? String(info.type) : "auto",
        fuel: info && info.fuel ? String(info.fuel) : "Benzina",
        initialKm: ini,
        tank: info ? pn(info.tank) : null,
        refuels: g.list.map((r) => {
          delete r._trip;
          return r;
        }),
      });
    });
    tables.veh.forEach((r) => {
      if (r.name && !vehicles.some((v) => nk(v.name) === nk(r.name)))
        vehicles.push({
          name: String(r.name),
          plate: r.plate ? String(r.plate) : "",
          type: r.type ? String(r.type) : "auto",
          fuel: r.fuel ? String(r.fuel) : "Benzina",
          initialKm: pn(r.initial) || 0,
          tank: pn(r.tank),
          refuels: [],
        });
    });
    if (!vehicles.length)
      throw new Error(
        "Nessun dato riconosciuto: servono almeno le colonne data, km_finali e litri.",
      );
    return {
      json: JSON.stringify({
        app: "Ricarica Pieno",
        version: 1,
        vehicles: vehicles,
      }),
      skipped: skipped,
    };
  }

  async function importPayload(f) {
    var ext = (f.name.split(".").pop() || "").toLowerCase();
    if (ext === "json") return { json: await f.text(), skipped: 0 };
    var tables = { veh: [], ref: [] };
    if (["xlsx", "xls", "xlsm", "ods"].indexOf(ext) >= 0) {
      if (!hasX())
        throw new Error(
          "Lettura Excel non disponibile (manca js/xlsx.mini.min.js).",
        );
      var X = window.XLSX;
      var wb = X.read(await f.arrayBuffer(), {
        type: "array",
        cellDates: true,
      });
      wb.SheetNames.forEach((n) =>
        addTable(
          tables,
          X.utils.sheet_to_json(wb.Sheets[n], {
            header: 1,
            raw: true,
            defval: null,
          }),
        ),
      );
    } else {
      var t = await f.text();
      if (/^\s*\{/.test(t)) return { json: t, skipped: 0 };
      addTable(tables, csvParse(t));
    }
    return buildImport(tables, f.name);
  }

  async function runImport(f) {
    if (!f) return;
    var mode = $("#importMode").value;
    try {
      var p = await importPayload(f);
      if (
        mode === "replace" &&
        !window.confirm("Sostituire TUTTI i dati attuali con quelli del file?")
      )
        return;
      var res = S.importData(p.json, mode);
      resetForm();
      renderAll();
      applyChrome(false);
      var msg =
        res.vehicles || res.refuels
          ? "Importati " +
            pl(res.vehicles, "veicolo", "veicoli") +
            " e " +
            pl(res.refuels, "rifornimento", "rifornimenti")
          : "Nessun dato nuovo: era già tutto presente";
      if (p.skipped)
        msg += " · " + pl(p.skipped, "riga ignorata", "righe ignorate");
      toast(msg);
    } catch (err) {
      toast(err.message || "Importazione non riuscita", "error");
    }
  }

  function onImport(e) {
    var f = e.target.files[0];
    runImport(f).then(() => {
      e.target.value = "";
    });
  }

  function bindSelButtons() {
    var g = document.getElementById("gSelect");
    if (g && !g._bound) {
      g._bound = true;
      g.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        startSel("garage");
      });
    }
    var h = document.getElementById("hSelect");
    if (h && !h._bound) {
      h._bound = true;
      h.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        startSel("history");
      });
    }
  }

  function bindGlobalDelegate() {
    if (document._globalDelegate) return;
    document._globalDelegate = true;
    document.addEventListener(
      "click",
      function (e) {
        var ck = e.target.closest(".gc-check");
        if (ck) {
          e.preventDefault();
          e.stopPropagation();
          var card = ck.closest(".gcard");
          var mainBtn = card && card.querySelector(".gc-main");
          var id = mainBtn && mainBtn.getAttribute("data-id");
          if (id) toggleSel(id);
          return;
        }
        var go = e.target.closest('[data-go="rank"]');
        if (go) {
          e.preventDefault();
          goRank();
          return;
        }
      },
      true,
    );
  }

  function bindMissing() {
    bindSelButtons();
    bindGlobalDelegate();
  }

  function bind() {
    $("#tabs").addEventListener("click", (e) => {
      var b = e.target.closest("button[data-tab]");
      if (!b) return;
      if (b.dataset.tab === "add") openNewRefuel();
      else setTab(b.dataset.tab);
    });
    $("#btnBack").addEventListener("click", showGarage);
    $("#vehiclePill").addEventListener("click", showGarage);
    $("#btnGear").addEventListener("click", () => {
      clearSel();
      screen = "settings";
      applyChrome(true);
    });

    /* Pulsanti condivisione ovunque */
    $("#btnTopShare").addEventListener("click", () => openShareDialog());
    $("#gShareAll").addEventListener("click", () => openShareDialog());
    $("#hShare").addEventListener("click", () => openShareDialog());
    $("#stShare").addEventListener("click", () => openShareDialog());
    $("#shClose").addEventListener("click", () => {
      var dlg = $("#shareDialog");
      if (dlg.open) dlg.close();
    });
    $("#shareDialog").addEventListener("click", function (e) {
      if (e.target === this && this.open) this.close();
    });

    $("#garageGrid").addEventListener("click", (e) => {
      var b = e.target.closest("[data-gact]");
      if (!b) return;
      var a = b.dataset.gact;
      if (a === "open") {
        if (sel.mode === "garage") toggleSel(b.dataset.id);
        else openVehicle(b.dataset.id);
      }
      if (a === "share") openShareDialog(b.dataset.id);
      if (a === "del") delVehicle(b.dataset.id);
      if (a === "edit") openVehicleDialog(b.dataset.id);
      if (a === "new") openVehicleDialog();
      if (a === "hit") {
        openVehicle(b.dataset.id);
        hQuery = gQuery;
        $("#hSearch").value = gQuery;
        renderHistory();
        setTab("history");
      }
      if (a === "import") {
        $("#importMode").value = "merge";
        $("#importFile").click();
      }
    });

    $("#dashBody").addEventListener("click", (e) => {
      var ab = e.target.closest("button[data-act]");
      if (ab) {
        if (ab.dataset.act === "share") shareSingleRefuel(ab.dataset.id);
        if (ab.dataset.act === "edit") startEdit(ab.dataset.id);
        if (ab.dataset.act === "del") delRefuel(ab.dataset.id);
        return;
      }
      var b = e.target.closest("[data-go]");
      if (!b) return;
      if (b.dataset.go === "add") openNewRefuel();
      else if (b.dataset.go === "share") openShareDialog();
      else if (b.dataset.go === "rank") goRank();
      else setTab(b.dataset.go);
    });

    var form = $("#refuelForm");
    form.addEventListener("submit", onSubmit);
    form.addEventListener("input", () => {
      clearError();
      renderPreview();
    });
    $("#fFvg").addEventListener("change", function () {
      $("#fvgBox").hidden = !this.checked;
      if (this.checked && !$("#fDiscount").value.trim())
        $("#fDiscount").value = toField(S.get().settings.fvgDiscount);
      renderPreview();
    });
    $("#btnCancelEdit").addEventListener("click", closeRefuel);
    $("#rClose").addEventListener("click", closeRefuel);
    $("#refuelDialog").addEventListener("click", function (e) {
      if (e.target === this) closeRefuel();
    });
    $("#refuelDialog").addEventListener("close", () => {
      resetForm();
      renderPreview();
    });

    $("#historyList").addEventListener("click", (e) => {
      var sm = e.target.closest("summary");
      if (sel.mode === "history" && sm) {
        e.preventDefault();
        toggleSel(sm.parentNode.dataset.id);
        return;
      }
      var g = e.target.closest("[data-go]");
      if (g) {
        openNewRefuel();
        return;
      }
      var b = e.target.closest("button[data-act]");
      if (!b) return;
      if (b.dataset.act === "share") shareSingleRefuel(b.dataset.id);
      if (b.dataset.act === "edit") startEdit(b.dataset.id);
      if (b.dataset.act === "del") delRefuel(b.dataset.id);
    });

    $("#statsBody").addEventListener("click", (e) => {
      var b = e.target.closest("[data-go]");
      if (b && b.dataset.go === "rank") goRank();
    });

    $("#hSort").addEventListener("change", function () {
      hSort = this.value;
      renderHistory();
    });

    bindSelButtons();
    bindGlobalDelegate();

    $("#bulkCancel").addEventListener("click", clearSel);
    $("#bulkAll").addEventListener("click", () => {
      var ids = sel.mode === "garage" ? gVisible : hVisible;
      var allOn = ids.length && ids.every((id) => sel.ids[id]);
      ids.forEach((id) => {
        sel.ids[id] = !allOn;
      });
      syncSel();
      rerenderSel();
    });
    $("#bulkDel").addEventListener("click", () => {
      var ids = selIds(),
        mode = sel.mode;
      if (!ids.length) return;
      var msg =
        mode === "garage"
          ? "Eliminare " +
            pl(ids.length, "veicolo", "veicoli") +
            " con tutti i rifornimenti? Operazione non annullabile."
          : "Eliminare " +
            pl(ids.length, "rifornimento", "rifornimenti") +
            "? I km/L verranno ricalcolati.";
      if (!window.confirm(msg)) return;
      if (mode === "garage") ids.forEach((id) => S.deleteVehicle(id));
      else {
        var v = vehicle();
        if (v) ids.forEach((id) => S.deleteRefuel(v.id, id));
      }
      sel.mode = null;
      sel.ids = {};
      syncSel();
      renderAll();
      applyChrome(false);
      toast(pl(ids.length, "elemento eliminato", "elementi eliminati"));
    });

    $("#btnShareOpen").addEventListener("click", () => openShareDialog());

    $("#vehicleForm").addEventListener("submit", onVehicleSubmit);
    bindColors();
    $("#vCancel").addEventListener("click", closeVehicleDialog);
    $("#vDelete").addEventListener("click", onVehicleDelete);
    $("#vCats").addEventListener("click", (e) => {
      var b = e.target.closest("[data-cat]");
      if (!b || b.dataset.cat === vehType()) return;
      var first = I.list.filter((ic) => ic.t === b.dataset.cat)[0];
      if (first) vIcon = first.k;
      renderVehicleColors();
    });
    $("#vIcons").addEventListener("click", (e) => {
      var b = e.target.closest(".icon-opt");
      if (!b) return;
      vIcon = b.dataset.icon;
      renderVehicleColors();
    });
    $("#vehicleDialog").addEventListener("click", function (e) {
      if (e.target === this) closeVehicleDialog();
    });

    $("#sDiscount").addEventListener("change", function () {
      var n = parseNum(this.value);
      if (isFinite(n) && n >= 0) {
        S.setSettings({ fvgDiscount: n });
        toast("Sconto FVG predefinito salvato");
      }
      this.value = toField(S.get().settings.fvgDiscount);
      resetForm();
      renderPreview();
    });
    $("#themeGrid").addEventListener("click", (e) => {
      var b = e.target.closest("[data-theme-id]");
      if (!b) return;
      S.setSettings({ theme: b.dataset.themeId });
      applyTheme();
      renderSettings();
    });

    $("#gSearch").addEventListener("input", function () {
      gQuery = this.value;
      renderGarage();
    });
    $("#hSearch").addEventListener("input", function () {
      hQuery = this.value;
      renderHistory();
    });
    $("#hFilters").addEventListener("click", (e) => {
      var b = e.target.closest("[data-f]");
      if (b) {
        hFilter = b.dataset.f;
        renderHistory();
      }
    });
    ["fOdo", "vInitKm"].forEach((id) => {
      $("#" + id).addEventListener("input", function () {
        groupInput(this);
      });
    });

    $("#btnExportAll").addEventListener("click", () => {
      if (!S.get().vehicles.length)
        return toast("Nessun dato da esportare", "error");
      download(
        "ricarica-pieno-backup-" + stamp() + ".json",
        S.exportData(),
        "application/json",
      );
    });
    $("#btnExportOne").addEventListener("click", () => {
      var v = vehicle();
      if (!v) return toast("Apri prima un veicolo", "error");
      download(
        "ricarica-pieno-" +
          v.name.replace(/[^\w-]+/g, "_") +
          "-" +
          stamp() +
          ".json",
        S.exportData(v.id),
        "application/json",
      );
    });
    $("#btnExportCsv").addEventListener("click", () =>
      exportFile("csv", false),
    );
    $("#btnExportXlsx").addEventListener("click", () =>
      exportFile("xlsx", false),
    );
    $("#btnExportXlsxAll").addEventListener("click", () =>
      exportFile("xlsx", true),
    );
    $("#btnExportCsvAll").addEventListener("click", () =>
      exportFile("csv", true),
    );
    var dz = $("#dropZone");
    ["dragenter", "dragover"].forEach((ev) =>
      dz.addEventListener(ev, (e) => {
        e.preventDefault();
        dz.classList.add("over");
      }),
    );
    ["dragleave", "drop"].forEach((ev) =>
      dz.addEventListener(ev, (e) => {
        e.preventDefault();
        dz.classList.remove("over");
      }),
    );
    dz.addEventListener("drop", (e) => runImport(e.dataTransfer.files[0]));
    $("#shBody").addEventListener("click", onShareClick);
    $("#importFile").addEventListener("change", onImport);

    $("#btnReset").addEventListener("click", () => {
      if (
        window.confirm(
          "Cancellare TUTTI i veicoli e i rifornimenti da questo dispositivo? Esporta prima un backup se ti serve.",
        )
      ) {
        S.reset();
        showGarage();
        toast("Dati cancellati");
      }
    });
  }

  function init() {
    bind();
    bindMissing();
    try {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", themeColor);
    } catch (e) {}
    resetForm();
    screen = "garage";
    renderAll();
    applyChrome(false);
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
