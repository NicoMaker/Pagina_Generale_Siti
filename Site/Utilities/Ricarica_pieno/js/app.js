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
    var color = screen === "app" && v ? v.color : DEFAULT_ACCENT;
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
    document.body.setAttribute("data-screen", screen);
    if (v && screen === "app") {
      $("#vpName").textContent = v.name;
      $("#vpPlate").textContent = v.plate || v.fuel;
      $("#vpIcon").innerHTML = vIco(v);
    }

    // FIX: Icona dinamica nel bottone "Veicoli"
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
          '<button type="button" class="gc-edit" data-gact="edit" data-id="' +
          esc(v.id) +
          '" title="Modifica ' +
          esc(v.name) +
          '" aria-label="Modifica ' +
          esc(v.name) +
          '">✎</button>' +
          '<button type="button" class="gc-del" data-gact="del" data-id="' +
          esc(v.id) +
          '" title="Elimina ' +
          esc(v.name) +
          '" aria-label="Elimina ' +
          esc(v.name) +
          '">🗑</button></article>'
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
      '<button type="button" class="btn accent" data-go="add">⛽ Rifornisci</button></div>' +
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
          '<div class="mini-act"><button type="button" class="btn small" data-act="edit" data-id="' +
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
      '</div><button type="button" class="btn small" data-go="history">Vedi tutto lo storico</button></div></div>';
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
      '<div class="rf-actions"><button type="button" class="btn small" data-act="edit" data-id="' +
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
              '<button type="button" class="btn small" data-vclear="' +
              esc(v.id) +
              '" title="Rimuovi secondario">✕</button></div>' +
              '<div class="swatches tiny">' +
              allCombos()
                .map((p) => swBtn(p, p.c1 === v.color && (p.c2 || "") === (v.color2 || "")))
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
              swStyle(p.c1, p.c2) +
              '"></span><b>' +
              esc(p.name) +
              "</b><small>" +
              esc(p.c1) +
              (p.c2 ? " + " + esc(p.c2) : "") +
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
    vC2 = "";
  const vehType = () => I.find(vIcon).t;

  function renderIconPicker() {
    $("#vIcons").innerHTML = I.list
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
          I.svg(ic.k, vC1, vC2) +
          "</button>",
      )
      .join("");
    $("#vTypeLabel").textContent = (TYPES[vehType()] || TYPES.altro)[0];
  }

  /* ---------- colori: combinazioni, anteprima, campi ---------- */
  const swStyle = (c1, c2) =>
    "background:" +
    (c2 ? "linear-gradient(135deg," + c1 + " 50%," + c2 + " 50%)" : c1);
  function allCombos() {
    var own = S.get().settings.palette.map((p) => ({
      id: p.id,
      name: p.name,
      c1: p.c1,
      c2: p.c2,
      own: true,
    }));
    return I.presets
      .map((p) => ({ name: p[0], c1: p[1], c2: p[2], own: false }))
      .concat(own);
  }
  const swBtn = (p, on) =>
    '<button type="button" class="cswatch' +
    (p.own ? " own" : "") +
    '" data-c1="' +
    p.c1 +
    '" data-c2="' +
    (p.c2 || "") +
    '" title="' +
    esc(p.name) +
    '" aria-label="' +
    esc(p.name) +
    '" aria-pressed="' +
    !!on +
    '" style="' +
    swStyle(p.c1, p.c2) +
    '"></button>';

  function renderVehicleColors(skip) {
    $("#vPreview").innerHTML =
      '<span class="vprev-ico">' +
      I.svg(vIcon, vC1, vC2) +
      '</span><span class="vprev-txt"><b>' +
      esc($("#vName").value.trim() || "Anteprima") +
      "</b><small>" +
      esc(vC1) +
      (vC2 ? " + " + esc(vC2) : " (secondario automatico)") +
      "</small></span>";
    $("#vSwatches").innerHTML = allCombos()
      .map((p) => swBtn(p, p.c1 === vC1 && (p.c2 || "") === vC2))
      .join("");
    $("#vColor1").value = vC1;
    $("#vColor2").value = vC2 || I.shade(vC1, -0.28);
    if (skip !== "hex1") $("#vHex1").value = vC1;
    if (skip !== "hex2") $("#vHex2").value = vC2;
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
      renderVehicleColors();
    });
    $("#vSavePalette").addEventListener("click", function () {
      var name = window.prompt(
        "Nome della combinazione:",
        vC2 ? "Mix personale" : "Colore personale",
      );
      if (name == null) return;
      var p = S.addPalette(name.trim() || "Colore personale", vC1, vC2);
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
        patch.color2 = n;
      }
      S.updateVehicle(id, patch);
      renderAll();
      applyChrome(false);
      toast("Colore aggiornato");
    });
    $("#sVehicles").addEventListener("click", function (e) {
      var b = e.target.closest("[data-vclear]");
      if (b) {
        S.updateVehicle(b.dataset.vclear, { color2: "" });
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
        });
        renderAll();
        applyChrome(false);
        toast("Colori aggiornati");
      }
    });

    /* impostazioni: crea combinazione */
    function sync(colorId, hexId, optional) {
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
    $("#pAdd").addEventListener("click", function () {
      var err = $("#pError");
      err.hidden = true;
      var h1 = $("#pHex1").value.trim(),
        h2 = $("#pHex2").value.trim();
      var c1 = I.normHex(h1 || $("#pColor1").value);
      var c2 = h2 ? I.normHex(h2) : "";
      if (!c1 || (h2 && !c2)) {
        err.textContent =
          "Colore non valido: usa un codice come #2563eb oppure un nome come red, teal, gold.";
        err.hidden = false;
        return;
      }
      var name = $("#pName").value.trim() || (c2 ? c1 + " + " + c2 : c1);
      S.addPalette(name, c1, c2);
      $("#pName").value = "";
      $("#pHex1").value = "";
      $("#pHex2").value = "";
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

  function exportCsv() {
    var v = vehicle();
    if (!v) return toast("Apri prima un veicolo", "error");
    var rs = C.rows(v);
    if (!rs.length) return toast("Nessun rifornimento da esportare", "error");
    function n(x, d) {
      return x == null || !isFinite(x)
        ? ""
        : String(Number(x.toFixed(d))).replace(".", ",");
    }
    function t(s) {
      return '"' + String(s).replace(/"/g, '""') + '"';
    }
    var lines = [
      "data;km_finali;km_percorsi;litri;prezzo_listino;sconto_fvg;prezzo_pagato;totale;km_l;l_100km;costo_km;pieno;note",
    ];
    rs.forEach((r) => {
      lines.push(
        [
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
        ].join(";"),
      );
    });
    download(
      "ricarica-pieno-" +
        v.name.replace(/[^\w-]+/g, "_") +
        "-" +
        stamp() +
        ".csv",
      "\ufeff" + lines.join("\r\n"),
      "text/csv;charset=utf-8",
    );
  }

  async function shareFile(name, text, mime, title) {
    try {
      var f = new File([text], name, { type: mime });
      if (navigator.canShare && navigator.canShare({ files: [f] })) {
        await navigator.share({ files: [f], title: title });
        return;
      }
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }
    download(name, text, mime);
    toast("Condivisione non disponibile: file scaricato", "error");
  }

  function vehicleSummary(v) {
    var rs = C.rows(v),
      st = C.stats(v, rs);
    var odo = rs.length ? rs[rs.length - 1].odometer : v.initialKm;
    var L = [
      "⛽ Ricarica Pieno – " + v.name + (v.plate ? " (" + v.plate + ")" : ""),
      "Km: " + fmt0(odo),
      "Rifornimenti: " + fmt0(st.n || 0),
    ];
    if (st.partialCount > 0)
      L.push(
        "Pieni: " +
          fmt0(st.fullCount) +
          " · Parziali: " +
          fmt0(st.partialCount),
      );
    if (st.avgKmL)
      L.push(
        "Consumo medio: " +
          fmt2(st.avgKmL) +
          " km/L (" +
          fmt2(st.l100) +
          " L/100 km)",
      );
    if (st.perf && st.perf.count)
      L.push(
        "Record: " +
          fmt2(st.perf.max) +
          " km/L (" +
          fmtDate(st.perf.maxRow.date) +
          ")",
      );
    if (st.n) {
      L.push("Spesa totale: " + eur(st.spent, 2));
      if (st.costPerKm != null) L.push("Costo al km: " + eur(st.costPerKm, 2));
      if (st.saved > 0) L.push("Risparmio FVG: " + eur(st.saved, 2));
    }
    return L.join("\n");
  }

  async function shareText() {
    var v = vehicle();
    if (!v) return toast("Apri prima un veicolo", "error");
    var text = vehicleSummary(v);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Ricarica Pieno – " + v.name,
          text: text,
        });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast("Riepilogo copiato negli appunti");
    } catch (err) {
      if (err && err.name === "AbortError") return;
      toast("Impossibile condividere", "error");
    }
  }

  function onImport(e) {
    var f = e.target.files[0];
    if (!f) return;
    var mode = $("#importMode").value;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        if (
          mode === "replace" &&
          !window.confirm(
            "Sostituire TUTTI i dati attuali con quelli del file?",
          )
        )
          return;
        var res = S.importData(String(reader.result), mode);
        resetForm();
        renderAll();
        applyChrome(false);
        toast(
          "Importati " +
            pl(res.vehicles, "veicolo", "veicoli") +
            " e " +
            pl(res.refuels, "rifornimento", "rifornimenti"),
        );
      } catch (err) {
        toast(err.message || "Importazione non riuscita", "error");
      } finally {
        e.target.value = "";
      }
    };
    reader.onerror = function () {
      toast("Impossibile leggere il file", "error");
      e.target.value = "";
    };
    reader.readAsText(f);
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

    $("#garageGrid").addEventListener("click", (e) => {
      var b = e.target.closest("[data-gact]");
      if (!b) return;
      var a = b.dataset.gact;
      if (a === "open") {
        if (sel.mode === "garage") toggleSel(b.dataset.id);
        else openVehicle(b.dataset.id);
      }
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
        if (ab.dataset.act === "edit") startEdit(ab.dataset.id);
        if (ab.dataset.act === "del") delRefuel(ab.dataset.id);
        return;
      }
      var b = e.target.closest("[data-go]");
      if (!b) return;
      if (b.dataset.go === "add") openNewRefuel();
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

    $("#btnShareAll").addEventListener("click", () => {
      if (!S.get().vehicles.length)
        return toast("Nessun dato da condividere", "error");
      shareFile(
        "ricarica-pieno-backup-" + stamp() + ".json",
        S.exportData(),
        "application/json",
        "Backup Ricarica Pieno",
      );
    });
    $("#btnShareOne").addEventListener("click", () => {
      var v = vehicle();
      if (!v) return toast("Apri prima un veicolo", "error");
      shareFile(
        "ricarica-pieno-" +
          v.name.replace(/[^\w-]+/g, "_") +
          "-" +
          stamp() +
          ".json",
        S.exportData(v.id),
        "application/json",
        "Ricarica Pieno – " + v.name,
      );
    });
    $("#btnShareText").addEventListener("click", shareText);

    $("#vehicleForm").addEventListener("submit", onVehicleSubmit);
    bindColors();
    $("#vCancel").addEventListener("click", closeVehicleDialog);
    $("#vDelete").addEventListener("click", onVehicleDelete);
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
    $("#btnExportCsv").addEventListener("click", exportCsv);
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