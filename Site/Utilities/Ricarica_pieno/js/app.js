/* Ricarica Pieno – app.js
 * Garage (scelta/creazione auto), dashboard, form rifornimento con anteprima,
 * storico, statistiche, import/export.
 */
(function () {
  'use strict';

  var S = window.Store, C = window.Calc, CH = window.Charts;

  /* ---------- helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var fmtCache = {};
  function fmt(v, d) {
    d = d || 0;
    if (v == null || !isFinite(v)) return '–';
    var f = fmtCache[d] || (fmtCache[d] = new Intl.NumberFormat('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: 'always' }));
    return f.format(v);
  }
  function eur(v, d) { return v == null || !isFinite(v) ? '–' : fmt(v, d == null ? 2 : d) + ' €'; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtDate(iso) {
    var p = String(iso).split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
  }
  var MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
  function monthLabel(key) {
    var p = key.split('-');
    return MONTHS[+p[1] - 1] + ' ' + p[0].slice(2);
  }
  function parseNum(str, isInt) {
    var t = String(str == null ? '' : str).trim().replace(/\s/g, '');
    if (!t) return NaN;
    if (isInt && /^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
    t = t.replace(',', '.');
    return /^-?\d*\.?\d+$/.test(t) ? parseFloat(t) : NaN;
  }
  function toField(v) { return String(v).replace('.', ','); }
  function kmFmt(v) { return fmt(v, v % 1 ? 1 : 0); }

  /** Singolare/plurale: pl(1,'pieno','pieni') -> "1 pieno". */
  function pl(n, one, many) { return fmt(n, 0) + ' ' + (n === 1 ? one : many); }

  var DRUM = '<b>0</b><b>1</b><b>2</b><b>3</b><b>4</b><b>5</b><b>6</b><b>7</b><b>8</b><b>9</b>';
  /** Contachilometri a tamburi: ogni cifra gira fino al valore. */
  function odoDrum(n) {
    var t = fmt(n), out = '', k = 0;
    for (var i = 0; i < t.length; i++) {
      var c = t.charAt(i);
      out += /\d/.test(c) ? '<span class="dg" style="--d:' + c + ';--n:' + (k++) + '"><i>' + DRUM + '</i></span>' : '<span class="sep">' + c + '</span>';
    }
    return '<div class="odo-drum" role="img" aria-label="' + t + ' km">' + out + '<span class="u">km</span></div>';
  }
  function reading(v, label) { return '<div><b>' + v + '</b><span>' + label + '</span></div>'; }

  /** Formatta mentre si scrive: 60415 -> 60.415 (mantiene il cursore). */
  function groupInput(el) {
    var raw = el.value, pos = el.selectionStart == null ? raw.length : el.selectionStart;
    var digitsAfter = raw.slice(pos).replace(/\D/g, '').length;
    var d = raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    var out = d.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    if (out === raw) return;
    el.value = out;
    var np = out.length, cnt = 0;
    while (np > 0 && cnt < digitsAfter) { np--; if (/\d/.test(out[np])) cnt++; }
    try { el.setSelectionRange(np, np); } catch (e) { /* ignore */ }
  }

  var TYPES = {
    auto: ['Auto', '🚗'], moto: ['Moto', '🏍️'], scooter: ['Scooter', '🛵'], furgone: ['Furgone', '🚐'],
    camion: ['Camion', '🚚'], trattore: ['Trattore', '🚜'], barca: ['Barca', '⛵'], altro: ['Altro', '🚘']
  };
  function typeLabel(v) { return (TYPES[v.type] || TYPES.altro)[0]; }

  var THEMES = [
    ['auto', 'Automatico', '#e2e8f0', '#0f172a'], ['light', 'Chiaro', '#f2f4f8', '#ffffff'],
    ['dark', 'Scuro', '#090d13', '#1a2330'], ['amoled', 'AMOLED', '#000000', '#141417'],
    ['ocean', 'Oceano', '#07131f', '#12304a'], ['forest', 'Foresta', '#0a140f', '#183024'],
    ['viola', 'Viola', '#130b1f', '#2a1a45'], ['sunset', 'Tramonto', '#fff4ec', '#ffd9bf'],
    ['mint', 'Menta', '#ecf8f4', '#bfeadc']
  ];

  /* ---------- ricerca ---------- */
  var gQuery = '', hQuery = '', hFilter = 'all';
  var MONTHS_FULL = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  function norm(t) { return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function matches(hay, q) {
    var toks = norm(q).split(/\s+/).filter(Boolean);
    return toks.every(function (t) { return hay.indexOf(t) >= 0 || hay.indexOf(t.replace(/\./g, '')) >= 0; });
  }
  function dot(n, d) { return String(Number(n).toFixed(d)).replace('.', ','); }
  function rowText(r) {
    var p = r.date.split('-');
    return norm([r.date, fmtDate(r.date), MONTHS_FULL[+p[1] - 1] || '', MONTHS[+p[1] - 1] || '', r.odometer, fmt(r.odometer),
      dot(r.liters, 2), dot(r.price, 3), dot(r.paid, 3), dot(r.total, 2), r.note, r.fvg ? 'fvg sconto' : '',
      r.full ? 'pieno completo' : 'parziale'].join(' '));
  }
  function vText(v) { return norm([v.name, v.plate, v.fuel, typeLabel(v)].join(' ')); }

  var toastTimer;
  function toast(msg, kind) {
    var el = $('#toast');
    el.textContent = msg;
    el.className = 'toast' + (kind === 'error' ? ' error' : '');
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 3400);
  }

  function download(name, text, mime) {
    var blob = new Blob([text], { type: mime });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function contrast(hex) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 ? '#0b1220' : '#ffffff';
  }

  /* ---------- stato UI & navigazione ---------- */
  var DEFAULT_ACCENT = '#0f766e';
  var screen = 'garage';          // 'garage' | 'app' | 'settings'
  var tab = 'dash';               // dash | add | history | stats | settings
  var editingId = null;

  function vehicle() { return S.activeVehicle(); }

  function applyTheme() {
    var t = S.get().settings.theme;
    if (t && t !== 'auto') document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
  }

  /** Aggiorna intestazione, tab e sezione visibile. */
  function applyChrome(scrollTop) {
    var v = vehicle();
    var color = screen === 'app' && v ? v.color : DEFAULT_ACCENT;
    var root = document.documentElement.style;
    root.setProperty('--accent', color);
    root.setProperty('--accent-contrast', contrast(color));
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);

    var show = screen === 'garage' ? 'garage' : screen === 'settings' ? 'settings' : tab;
    $$('.view').forEach(function (el) { el.classList.toggle('active', el.id === 'view-' + show); });

    $('#tabs').hidden = screen !== 'app';
    $('#btnBack').hidden = screen === 'garage';
    $('#brand').hidden = screen !== 'garage';
    $('#topTitle').hidden = screen !== 'settings';
    $('#vehiclePill').hidden = screen !== 'app';
    $('#btnGear').hidden = screen !== 'garage';
    document.body.setAttribute('data-screen', screen);

    if (v && screen === 'app') {
      $('#vpName').textContent = v.name;
      $('#vpPlate').textContent = v.plate || v.fuel;
      $('#vpIcon').textContent = v.icon || '🚗';
    }
    $$('#tabs button').forEach(function (b) {
      var on = b.dataset.tab === tab;
      b.classList.toggle('active', on);
      b.setAttribute('aria-current', on ? 'page' : 'false');
    });
    if (scrollTop) window.scrollTo({ top: 0 });
  }

  function setTab(t) { tab = t; screen = 'app'; applyChrome(true); }
  function showGarage() {
    screen = 'garage';
    resetForm();
    renderAll();
    applyChrome(true);
  }
  function openVehicle(id) {
    S.setActive(id);
    hQuery = ''; hFilter = 'all'; $('#hSearch').value = '';
    resetForm();
    screen = 'app';
    tab = 'dash';
    renderAll();
    applyChrome(true);
  }

  /* ---------- veicoli (ex garage) ---------- */
  function renderGarage() {
    var st = S.get(), box = $('#garageGrid'), q = gQuery.trim();
    $('#gSearchWrap').hidden = !st.vehicles.length;
    if (!st.vehicles.length) {
      box.innerHTML = '<div class="card garage-empty" style="grid-column:1/-1">' +
        '<div class="big-emoji">🚗</div><h2>Aggiungi il tuo primo veicolo</h2>' +
        '<p>Auto, moto, scooter, furgone… Ti servono solo il nome e i km attuali del contachilometri. Poi inserisci un rifornimento e Ricarica Pieno fa il resto.</p>' +
        '<div class="actions"><button type="button" class="btn primary" data-gact="new">＋ Aggiungi veicolo</button>' +
        '<button type="button" class="btn" data-gact="import">Ho già un backup JSON</button></div></div>';
      return;
    }
    var list = st.vehicles.filter(function (v) { return !q || matches(vText(v), q); });
    var html = list.map(function (v) {
      var rs = C.rows(v), s = C.stats(v, rs);
      var odo = rs.length ? rs[rs.length - 1].odometer : v.initialKm;
      return '<article class="gcard" style="--c:' + esc(v.color) + '">' +
        '<button type="button" class="gc-main" data-gact="open" data-id="' + esc(v.id) + '" aria-label="Apri ' + esc(v.name) + '">' +
        '<div class="gc-top"><span class="gc-ico" aria-hidden="true">' + esc(v.icon || '🚗') + '</span><div><strong>' + esc(v.name) + '</strong>' +
        '<small>' + esc(typeLabel(v)) + ' · ' + (v.plate ? esc(v.plate) + ' · ' : '') + esc(v.fuel) + '</small></div></div>' +
        '<div class="gc-stats">' +
        '<div><b>' + fmt(odo) + '</b><small>km</small></div>' +
        '<div><b>' + (s.avgKmL ? fmt(s.avgKmL, 1) : '–') + '</b><small>km/L medio</small></div>' +
        '<div><b>' + (s.n ? eur(s.spent, 0) : '–') + '</b><small>' + (v.refuels.length === 1 ? '1 pieno' : fmt(v.refuels.length, 0) + ' pieni') + '</small></div>' +
        '</div></button>' +
        '<button type="button" class="gc-edit" data-gact="edit" data-id="' + esc(v.id) + '" title="Modifica ' + esc(v.name) + '" aria-label="Modifica ' + esc(v.name) + '">✎</button>' +
        '</article>';
    }).join('');
    if (!q) html += '<div class="gcard add"><button type="button" data-gact="new"><span class="plus">＋</span>Aggiungi veicolo</button></div>';
    else {
      var hits = [];
      st.vehicles.forEach(function (v) {
        C.rows(v).slice().reverse().forEach(function (r) { if (matches(rowText(r), q)) hits.push({ v: v, r: r }); });
      });
      if (!list.length && !hits.length) html = '<p class="empty" style="grid-column:1/-1">Nessun risultato per «' + esc(q) + '».</p>';
      if (hits.length) {
        html += '<div class="hits" style="grid-column:1/-1"><h3>' + pl(hits.length, 'rifornimento trovato', 'rifornimenti trovati') + '</h3>' +
          hits.slice(0, 30).map(function (h) {
            return '<button type="button" class="hit" data-gact="hit" data-id="' + esc(h.v.id) + '"><span class="hit-ico">' + esc(h.v.icon || '🚗') + '</span>' +
              '<span><b>' + fmtDate(h.r.date) + ' · ' + esc(h.v.name) + '</b><small>' + fmt(h.r.odometer) + ' km · ' + fmt(h.r.liters, 2) + ' L · ' + eur(h.r.total) + '</small></span></button>';
          }).join('') + '</div>';
      }
    }
    box.innerHTML = html;
  }

  /* ---------- dashboard ---------- */
  function kmlPoints(rs) {
    return rs.filter(function (r) { return r.kmPerL; }).map(function (r) {
      return { label: fmtDate(r.date), short: fmtDate(r.date).slice(0, 5), value: r.kmPerL };
    });
  }
  function monthPoints(rs) {
    return C.monthly(rs).slice(-12).map(function (m) { return { label: monthLabel(m.key), value: m.spent }; });
  }
  function pct(a, b) { return b ? (a / b - 1) * 100 : 0; }

  /* ---------- dati per i grafici ---------- */
  var DOW = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  function dowPoints(rs) {
    var c = [0, 0, 0, 0, 0, 0, 0];
    rs.forEach(function (r) {
      var p = r.date.split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay();
      c[(d + 6) % 7]++;
    });
    return c.map(function (n, i) { return { label: DOW[i], value: n }; });
  }
  function segsOf(rs) { return rs.filter(function (r) { return r.kmPerL; }); }
  function chartCard(title, body, cls) { return '<div class="card chart-card ' + (cls || '') + '"><h3>' + title + '</h3>' + body + '</div>'; }
  function fewer(msg) { return '<p class="muted small">' + msg + '</p>'; }

  function dashDonut(st) {
    if (!(st.spent > 0)) return '';
    var items = [{ label: 'Pagato', value: st.spent }];
    if (st.saved > 0) items.push({ label: 'Risparmiato con FVG', value: st.saved });
    return chartCard('Quanto hai pagato', CH.donut(items, { unit: '€', big: eur(st.spent, 0), small: 'speso in totale', label: 'Pagato e risparmiato' }));
  }

  function renderDashboard() {
    var v = vehicle(), box = $('#dashBody');
    if (!v) { box.innerHTML = ''; return; }
    var rs = C.rows(v), st = C.stats(v, rs), last = rs[rs.length - 1];
    var odo = last ? last.odometer : v.initialKm;
    var segs = rs.filter(function (r) { return r.kmPerL; });
    var sparkVals = segs.slice(-12).map(function (r) { return r.kmPerL; });

    var h = '<section class="cluster">' +
      '<div class="cl-top"><span class="cl-name">' + esc(v.icon || '🚗') + ' ' + esc(v.name) + (v.plate ? ' · ' + esc(v.plate) : '') + '</span>' +
      '<button type="button" class="btn accent" data-go="add">⛽ Rifornisci</button></div>' +
      odoDrum(odo) +
      '<div class="cl-read">' + reading(st.avgKmL ? fmt(st.avgKmL, 1) : '–', 'km/L medi') +
      reading(st.l100 ? fmt(st.l100, 1) : '–', 'L/100 km') +
      reading(st.costPerKm != null ? fmt(st.costPerKm, 2) + ' €' : '–', 'al km') + CH.spark(sparkVals) + '</div></section>';

    if (!st.n) {
      h += '<div class="card empty-card"><div class="big-emoji">⛽</div><h2>Registra il primo rifornimento</h2>' +
        '<p>Parti da <b>' + fmt(v.initialKm) + ' km</b>. Ti bastano km finali, litri e prezzo: al resto pensa Ricarica Pieno.</p>' +
        '<button type="button" class="btn primary" data-go="add">＋ Primo rifornimento</button></div>';
      box.innerHTML = h;
      return;
    }

    var mk = S.todayISO().slice(0, 7);
    var mon = C.monthly(rs).filter(function (m) { return m.key === mk; })[0];
    var range = v.tank && st.avgKmL ? v.tank * st.avgKmL : (st.avgKmL ? st.avgLitersPerRefuel * st.avgKmL : null);
    var tiles = [
      ['Costo al km', st.costPerKm != null ? fmt(st.costPerKm, 3) + ' €' : '–', st.costPerKm != null ? fmt(st.costPerKm * 100, 2) + ' € / 100 km' : ''],
      ['Spesa questo mese', eur(mon ? mon.spent : 0), pl(mon ? mon.count : 0, 'rifornimento', 'rifornimenti')],
      ['Spesa totale', eur(st.spent), fmt(st.liters, 1) + ' L totali'],
      ['Risparmio FVG', eur(st.saved), st.fvgCount + ' con sconto'],
      ['Km percorsi', fmt(st.totalKm), 'dai ' + fmt(v.initialKm) + ' iniziali'],
      ['Autonomia stimata', range ? fmt(range, 0) + ' km' : '–', v.tank ? 'a serbatoio pieno' : 'dalla media dei pieni']
    ];
    h += '<div class="tiles">' + tiles.map(function (t) {
      return '<div class="tile"><span class="t-label">' + t[0] + '</span><strong class="t-value">' + t[1] + '</strong><span class="t-sub">' + t[2] + '</span></div>';
    }).join('') + '</div>';

    // spunti
    var ins = [];
    if (segs.length) {
      var ls = segs[segs.length - 1];
      if (segs.length > 1 && st.avgKmL) {
        var d = pct(ls.kmPerL, st.avgKmL);
        ins.push([d >= 0 ? 'good' : 'warn', d >= 0 ? '📈' : '📉',
          'Ultimo pieno: <b>' + fmt(ls.kmPerL, 2) + ' km/L</b> (' + (d > 0 ? '+' : '') + fmt(d, 1) + '% rispetto alla media)']);
      } else {
        ins.push(['', '⛽', 'Ultimo pieno: <b>' + fmt(ls.kmPerL, 2) + ' km/L</b>']);
      }
    }
    if (rs.length > 1 && st.avgPrice) {
      var dp = last.paid - st.avgPrice;
      ins.push([dp <= 0 ? 'good' : 'warn', '💶', 'Ultimo prezzo pagato <b>' + fmt(last.paid, 3) + ' €/L</b> (' +
        (dp > 0 ? '+' : '') + fmt(dp, 3) + ' € rispetto alla media)']);
    }
    var ago = C.daysBetween(last.date, S.todayISO());
    ins.push(['', '🗓️', 'Ultimo rifornimento ' + (ago <= 0 ? '<b>oggi</b>' : ago === 1 ? '<b>ieri</b>' : '<b>' + ago + ' giorni fa</b>') + ' (' + fmtDate(last.date) + ')']);
    if (st.avgDaysBetween) ins.push(['', '⏱️', 'In media fai il pieno ogni <b>' + fmt(st.avgDaysBetween, 1) + ' giorni</b> (' + fmt(st.kmPerDay, 1) + ' km al giorno)']);

    var recent = rs.slice(-3).reverse().map(function (r) {
      return '<div class="mini"><b>' + fmtDate(r.date) + (r.fvg ? ' <span class="tag">FVG</span>' : '') + '</b>' +
        '<small>' + fmt(r.liters, 2) + ' L · ' + eur(r.total) + ' · ' + kmFmt(r.km) + ' km</small>' +
        '<div class="kml">' + (r.kmPerL ? fmt(r.kmPerL, 1) : '–') + '<small>km/L</small></div></div>';
    }).join('');

    h += '<div class="dash-cols">' +
      '<div class="card"><h2>In breve</h2><ul class="insights">' + ins.map(function (i) {
        return '<li class="' + i[0] + '"><span class="i-ico">' + i[1] + '</span><span>' + i[2] + '</span></li>';
      }).join('') + '</ul></div>' +
      '<div class="card"><h2>Ultimi rifornimenti</h2><div class="mini-list">' + recent + '</div>' +
      '<button type="button" class="btn small" data-go="history">Vedi tutto lo storico</button></div></div>';

    var kp = kmlPoints(rs), mp = monthPoints(rs);
    h += '<div class="charts">' +
      '<div class="card chart-card"><h3>Consumo (km/L)</h3>' +
      (kp.length > 1 ? CH.line(kp, { decimals: 1, unit: 'km/L', avg: st.avgKmL, label: 'Consumo km/L' }) : '<p class="muted small">Servono almeno due pieni per il grafico.</p>') + '</div>' +
      '<div class="card chart-card"><h3>Spesa mensile (€)</h3>' + CH.bars(mp, { decimals: 0, unit: '€', label: 'Spesa mensile' }) + '</div>' +
      chartCard('Km al mese', CH.bars(C.monthly(rs).slice(-12).map(function (m) { return { label: monthLabel(m.key), value: m.km }; }), { decimals: 0, unit: 'km', label: 'Km al mese' })) +
      dashDonut(st) + '</div>';

    box.innerHTML = h;
  }

  /* ---------- modale rifornimento ---------- */
  function openRefuel() {
    var dlg = $('#refuelDialog');
    renderAddMeta();
    renderPreview();
    if (!dlg.open) { if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', ''); }
    setTimeout(function () { $('#fOdo').focus(); }, 60);
  }
  function openNewRefuel() { resetForm(); openRefuel(); }
  function closeRefuel() {
    var dlg = $('#refuelDialog');
    if (dlg.open) dlg.close();
  }

  /* ---------- form rifornimento ---------- */
  function readForm() {
    var fvg = $('#fFvg').checked;
    var price = parseNum($('#fPrice').value);
    var discount = fvg ? parseNum($('#fDiscount').value) : 0;
    var liters = parseNum($('#fLiters').value);
    var total = parseNum($('#fTotal').value);
    var dd = fvg && isFinite(discount) ? discount : 0;
    if (!isFinite(price) && liters > 0 && total > 0) price = Math.round((total / liters + dd) * 1000) / 1000;
    var paid = price - dd;
    if (!isFinite(liters) && total > 0 && paid > 0) liters = Math.round(total / paid * 100) / 100;
    return {
      date: $('#fDate').value,
      odometer: parseNum($('#fOdo').value, true),
      liters: liters,
      price: price,
      fvg: fvg,
      discount: discount,
      paidTotal: total > 0 ? total : null,
      full: $('#fFull').checked,
      note: $('#fNote').value.trim()
    };
  }

  function resetForm() {
    editingId = null;
    var st = S.get();
    $('#fDate').value = S.todayISO();
    $('#fOdo').value = '';
    $('#fLiters').value = '';
    $('#fPrice').value = '';
    $('#fTotal').value = '';
    $('#fFvg').checked = !!st.settings.lastFvg;
    $('#fDiscount').value = toField(st.settings.fvgDiscount);
    $('#fFull').checked = true;
    $('#fNote').value = '';
    $('#fvgBox').hidden = !$('#fFvg').checked;
    $('#formTitle').textContent = 'Nuovo rifornimento';
    $('#btnSave').textContent = 'Salva rifornimento';
    $('#btnCancelEdit').hidden = true;
    clearError();
  }

  function startEdit(id) {
    var v = vehicle();
    var r = v && v.refuels.filter(function (x) { return x.id === id; })[0];
    if (!r) return;
    editingId = id;
    $('#fDate').value = r.date;
    $('#fOdo').value = fmt(r.odometer);
    $('#fLiters').value = toField(r.liters);
    $('#fPrice').value = toField(r.price);
    $('#fTotal').value = r.paidTotal ? toField(r.paidTotal) : '';
    $('#fFvg').checked = r.fvg;
    $('#fDiscount').value = toField(r.fvg ? r.discount : S.get().settings.fvgDiscount);
    $('#fFull').checked = r.full;
    $('#fNote').value = r.note;
    $('#fvgBox').hidden = !r.fvg;
    $('#formTitle').textContent = 'Modifica rifornimento';
    $('#btnSave').textContent = 'Salva modifiche';
    $('#btnCancelEdit').hidden = false;
    clearError();
    openRefuel();
  }

  function showError(msg, fieldId) {
    var el = $('#formError');
    el.textContent = msg;
    el.hidden = false;
    $$('#refuelForm input').forEach(function (i) { i.classList.remove('invalid'); });
    if (fieldId) { var f = $('#' + fieldId); f.classList.add('invalid'); f.focus(); }
  }
  function clearError() {
    $('#formError').hidden = true;
    $$('#refuelForm input').forEach(function (i) { i.classList.remove('invalid'); });
  }

  function validate(v, c) {
    if (!c.date) return ['Inserisci la data.', 'fDate'];
    if (!isFinite(c.odometer) || c.odometer <= 0) return ['Inserisci i km finali del contachilometri.', 'fOdo'];
    if (!isFinite(c.price) || c.price <= 0) return ['Scrivi almeno due dati tra litri, prezzo e totale pagato.', 'fTotal'];
    if (c.price < 0.5 || c.price > 4) return ['Prezzo al litro insolito (' + fmt(c.price, 3) + ' €). Scrivilo come 1,859.', 'fPrice'];
    if (c.fvg) {
      if (!isFinite(c.discount) || c.discount < 0) return ['Inserisci lo sconto FVG in € per litro (es. 0,15).', 'fDiscount'];
      if (c.discount >= c.price) return ['Lo sconto deve essere inferiore al prezzo al litro.', 'fDiscount'];
    }
    if (!isFinite(c.liters) || c.liters <= 0) return ['Scrivi i litri riforniti oppure il totale pagato.', 'fTotal'];
    if (c.liters > 150 || (v.tank && c.liters > v.tank * 1.1)) {
      return ['Litri insolitamente alti (' + fmt(c.liters, 2) + ' L): controlla di non aver messo l\'importo in euro.', 'fLiters'];
    }
    var calc = c.liters * (c.price - (c.fvg ? c.discount : 0));
    if (c.paidTotal && Math.abs(calc - c.paidTotal) > Math.max(0.5, c.paidTotal * 0.02)) {
      return ['Litri × prezzo = ' + eur(calc) + ', ma hai indicato ' + eur(c.paidTotal) + ' pagati. Controlla litri, prezzo e sconto.', 'fLiters'];
    }

    var rs = C.rows(v), lo = v.initialKm, hi = null, i;
    if (editingId) {
      i = rs.findIndex(function (r) { return r.id === editingId; });
      lo = i > 0 ? rs[i - 1].odometer : v.initialKm;
      hi = i >= 0 && i < rs.length - 1 ? rs[i + 1].odometer : null;
    } else if (rs.length) {
      lo = rs[rs.length - 1].odometer;
    }
    if (c.odometer <= lo) {
      return ['I km finali (' + fmt(c.odometer) + ') devono essere maggiori dei km precedenti (' + fmt(lo) + ').', 'fOdo'];
    }
    if (hi != null && c.odometer >= hi) {
      return ['I km finali devono essere inferiori al rifornimento successivo (' + fmt(hi) + ' km).', 'fOdo'];
    }
    return null;
  }

  function onSubmit(e) {
    e.preventDefault();
    var v = vehicle();
    if (!v) return;
    var c = readForm();
    var err = validate(v, c);
    if (err) { showError(err[0], err[1]); return; }

    var rec = Object.assign({ id: editingId || S.uid() }, c);
    if (editingId) S.updateRefuel(v.id, rec); else S.addRefuel(v.id, rec);
    S.setSettings({ lastFvg: c.fvg, fvgDiscount: c.fvg && isFinite(c.discount) && c.discount > 0 ? c.discount : S.get().settings.fvgDiscount });

    var row = C.rows(vehicle()).filter(function (r) { return r.id === rec.id; })[0];
    var wasEdit = !!editingId;
    var msg = wasEdit ? 'Modifiche salvate' : 'Rifornimento salvato';
    if (row && row.kmPerL) msg += ' · ' + fmt(row.kmPerL, 2) + ' km/L';
    resetForm();
    closeRefuel();
    renderAll();
    applyChrome(false);
    toast(msg);
  }

  /* ---------- anteprima live ---------- */
  function renderPreview() {
    var v = vehicle(), box = $('#previewBody');
    if (!v) { box.innerHTML = ''; return; }
    var c = readForm();
    var row = C.preview(v, c, editingId);
    var all = C.stats(v, C.rows(v));

    if (!row) {
      box.innerHTML = '<p class="empty">Inserisci i <b>km finali</b> e due dati tra <b>litri</b>, <b>prezzo</b> e <b>totale</b>:<br>qui vedrai subito km percorsi, km/L e costo.</p>';
      return;
    }

    var hero = row.kmPerL ? fmt(row.kmPerL, 2) : '–';
    var sub;
    if (row.km <= 0) sub = 'Km finali non validi';
    else if (!c.full) sub = 'Pieno parziale: il consumo si calcola al prossimo pieno';
    else if (!(c.liters > 0)) sub = 'Inserisci i litri per calcolare il consumo';
    else sub = 'Percorsi ' + kmFmt(row.km) + ' km dal rifornimento precedente';

    var hasCost = c.liters > 0 && c.price > 0;
    var m = [];
    m.push(['Km precedenti', fmt(row.prevKm) + ' km']);
    m.push(['Km percorsi', row.km > 0 ? kmFmt(row.km) + ' km' : '–']);
    if (row.l100) m.push(['Consumo', fmt(row.l100, 2) + ' L/100 km']);
    if (c.price > 0) m.push(['Prezzo applicato', fmt(row.paid, 3) + ' €/L']);
    if (c.liters > 0 && !isFinite(parseNum($('#fLiters').value))) m.push(['Litri calcolati', fmt(c.liters, 2) + ' L']);
    if (c.price > 0 && !isFinite(parseNum($('#fPrice').value))) m.push(['Prezzo calcolato', fmt(c.price, 3) + ' €/L']);
    if (row.km > 0 && hasCost) m.push(['Costo al km', fmt(row.costPerKm, 3) + ' €']);
    if (c.fvg && hasCost) m.push(['Risparmio FVG', eur(row.saved), 'good']);

    var html = '<div class="hero"><strong>' + hero + '</strong><span>km/L</span></div>' +
      '<p class="hero-sub">' + esc(sub) + '</p><dl class="metrics">';
    if (hasCost) html += '<div class="metric wide total"><dt>Totale da pagare</dt><dd>' + eur(row.total) + '</dd></div>';
    m.forEach(function (x) {
      html += '<div class="metric ' + (x[2] || '') + '"><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd></div>';
    });
    html += '</dl>';

    if (row.km <= 0) {
      html += '<div class="badge-note bad">I km finali devono superare quelli precedenti.</div>';
    } else if (row.kmPerL && (row.kmPerL > 45 || row.kmPerL < 3)) {
      html += '<div class="badge-note warn">Valore insolito: controlla km finali e litri.</div>';
    } else if (row.kmPerL && all.avgKmL) {
      var diff = pct(row.kmPerL, all.avgKmL);
      if (Math.abs(diff) >= 1) {
        html += '<div class="badge-note ' + (diff > 0 ? 'good' : 'warn') + '">' +
          (diff > 0 ? '+' : '') + fmt(diff, 1) + '% rispetto alla tua media (' + fmt(all.avgKmL, 2) + ' km/L)</div>';
      }
    }
    box.innerHTML = html;
  }

  function renderAddMeta() {
    var v = vehicle();
    $('#formFields').disabled = !v;
    if (!v) { $('#prevInfo').hidden = true; return; }
    $('#prevInfo').hidden = false;
    var rs = C.rows(v), last = rs[rs.length - 1];
    var prevKm = last ? last.odometer : v.initialKm;
    $('#prevInfo').innerHTML = last
      ? 'Ultimo rifornimento: <b>' + fmtDate(last.date) + '</b> a <b>' + fmt(prevKm) + ' km</b>'
      : 'Km iniziali di ' + esc(v.name) + ': <b>' + fmt(prevKm) + ' km</b> (primo rifornimento)';
    $('#fOdo').placeholder = '> ' + fmt(prevKm);
    $('#fPrice').placeholder = last ? fmt(last.price, 3) : 'es. 1,859';
  }

  /* ---------- storico ---------- */
  function histRow(r, avg) {
    var d = r.date.split('-');
    var cls = r.kmPerL && avg ? (r.kmPerL >= avg ? 'good' : 'warn') : '';
    var tags = (r.fvg ? ' <span class="tag">FVG</span>' : '') + (!r.full ? ' <span class="tag warn">Parziale</span>' : '');
    return '<details class="rf"><summary>' +
      '<span class="rf-day"><b>' + (+d[2]) + '</b><small>' + MONTHS[+d[1] - 1] + '</small></span>' +
      '<span class="rf-main"><b>' + fmt(r.liters, 2) + ' L · ' + fmt(r.paid, 3) + ' €/L</b><small>' + kmFmt(r.km) + ' km · ' + eur(r.total) + tags + '</small></span>' +
      '<span class="rf-kml ' + cls + '">' + (r.kmPerL ? fmt(r.kmPerL, 1) : '–') + '<small>km/L</small></span></summary>' +
      '<div class="rf-body"><dl class="rf-grid">' +
      '<div><dt>Data</dt><dd>' + fmtDate(r.date) + '</dd></div>' +
      '<div><dt>Km finali</dt><dd>' + fmt(r.odometer) + '</dd></div>' +
      '<div><dt>Percorsi</dt><dd>' + kmFmt(r.km) + ' km</dd></div>' +
      '<div><dt>Consumo</dt><dd>' + (r.l100 ? fmt(r.l100, 2) + ' L/100' : '–') + '</dd></div>' +
      '<div><dt>€/L pagato</dt><dd>' + fmt(r.paid, 3) + (r.fvg ? ' <s>' + fmt(r.price, 3) + '</s>' : '') + '</dd></div>' +
      '<div><dt>€/km</dt><dd>' + (r.costPerKm != null ? fmt(r.costPerKm, 3) : '–') + '</dd></div>' +
      '</dl>' +
      (r.fvg && r.saved > 0 ? '<p class="rf-note">Risparmio FVG: <b>' + eur(r.saved) + '</b></p>' : '') +
      (r.days != null ? '<p class="rf-note">' + r.days + (r.days === 1 ? ' giorno' : ' giorni') + ' dal rifornimento precedente</p>' : '') +
      (r.note ? '<p class="rf-note">📝 ' + esc(r.note) + '</p>' : '') +
      '<div class="rf-actions">' +
      '<button type="button" class="btn small" data-act="edit" data-id="' + esc(r.id) + '">Modifica</button>' +
      '<button type="button" class="btn small danger" data-act="del" data-id="' + esc(r.id) + '">Elimina</button>' +
      '</div></div></details>';
  }

  function renderHistory() {
    var v = vehicle(), box = $('#historyList');
    $$('#hFilters .chip').forEach(function (b) { b.classList.toggle('active', b.dataset.f === hFilter); });
    if (!v) { box.innerHTML = ''; $('#historyCount').textContent = ''; return; }
    var all = C.rows(v).slice().reverse(), hq = hQuery.trim(), avg = C.stats(v, C.rows(v)).avgKmL;
    var rs = all.filter(function (r) {
      var okF = hFilter === 'all' || (hFilter === 'fvg' && r.fvg) || (hFilter === 'partial' && !r.full) || (hFilter === 'full' && r.full);
      return okF && (!hq || matches(rowText(r), hq));
    });
    var filtered = rs.length !== all.length;
    $('#historyCount').textContent = v.name + ' · ' + (filtered ? fmt(rs.length, 0) + ' di ' : '') + pl(all.length, 'rifornimento', 'rifornimenti');
    if (!all.length) {
      box.innerHTML = '<div class="empty-state"><div class="big-emoji">⛽</div><h3>Nessun rifornimento</h3><p>Il primo rifornimento di <b>' + esc(v.name) + '</b> compare qui.</p><button type="button" class="btn primary" data-go="add">Aggiungi rifornimento</button></div>';
      return;
    }
    if (!rs.length) {
      box.innerHTML = '<div class="empty-state"><h3>Nessun risultato</h3><p>Nessun rifornimento' + (hq ? ' per «' + esc(hq) + '»' : ' con questo filtro') + '.</p></div>';
      return;
    }
    var groups = [], cur = null;
    rs.forEach(function (r) {
      var k = r.date.slice(0, 7);
      if (!cur || cur.k !== k) { cur = { k: k, rows: [] }; groups.push(cur); }
      cur.rows.push(r);
    });
    var html = groups.map(function (g) {
      var p = g.k.split('-'), name = MONTHS_FULL[+p[1] - 1];
      var tot = g.rows.reduce(function (a, r) { return a + r.total; }, 0);
      return '<section class="mgroup"><h3 class="mh"><span>' + name.charAt(0).toUpperCase() + name.slice(1) + ' ' + p[0] + '</span><small>' +
        pl(g.rows.length, 'rifornimento', 'rifornimenti') + ' · ' + eur(tot) + '</small></h3><div class="mlist">' +
        g.rows.map(function (r) { return histRow(r, avg); }).join('') + '</div></section>';
    }).join('');
    if (!filtered && !hq) html += '<p class="start-km">Partenza: <b>' + fmt(v.initialKm) + ' km</b></p>';
    box.innerHTML = html;
  }

  /* ---------- statistiche ---------- */
  function statCard(label, value, sub, cls) {
    return '<div class="stat ' + (cls || '') + '"><span class="stat-label">' + label + '</span>' +
      '<strong class="stat-value">' + value + '</strong>' + (sub ? '<span class="stat-sub">' + sub + '</span>' : '') + '</div>';
  }

  function renderStats() {
    var v = vehicle(), box = $('#statsBody');
    if (!v) { box.innerHTML = ''; $('#statsVehicle').textContent = ''; return; }
    $('#statsVehicle').textContent = v.name + (v.plate ? ' · ' + v.plate : '');
    var rs = C.rows(v), st = C.stats(v, rs);
    if (!st.n) {
      box.innerHTML = '<p class="empty">Registra il primo rifornimento per vedere le statistiche di <b>' + esc(v.name) + '</b>.</p>';
      return;
    }

    var cards = '';
    cards += statCard('Consumo medio', st.avgKmL ? fmt(st.avgKmL, 2) + ' km/L' : '–',
      st.l100 ? fmt(st.l100, 2) + ' L/100 km' : 'Serve almeno un pieno dopo il primo', 'hero');
    cards += statCard('Costo al km', st.costPerKm != null ? fmt(st.costPerKm, 3) + ' €' : '–',
      st.costPerKm != null ? fmt(st.costPerKm * 100, 2) + ' € ogni 100 km' : '');
    cards += statCard('Spesa totale', eur(st.spent), pl(st.n, 'rifornimento', 'rifornimenti'));
    cards += statCard('Km percorsi', fmt(st.totalKm) + ' km', 'da ' + fmt(v.initialKm) + ' a ' + fmt(rs[rs.length - 1].odometer));
    cards += statCard('Litri totali', fmt(st.liters, 1) + ' L', 'media ' + fmt(st.avgLitersPerRefuel, 1) + ' L a pieno');
    cards += statCard('Prezzo medio pagato', fmt(st.avgPrice, 3) + ' €/L', 'listino medio ' + fmt(st.avgListino, 3) + ' €/L');
    cards += statCard('Risparmio FVG', eur(st.saved), st.fvgCount + ' di ' + st.n + ' con sconto');
    cards += statCard('Miglior consumo', st.best ? fmt(st.best.kmPerL, 2) + ' km/L' : '–', st.best ? fmtDate(st.best.date) : '');
    cards += statCard('Peggior consumo', st.worst ? fmt(st.worst.kmPerL, 2) + ' km/L' : '–', st.worst ? fmtDate(st.worst.date) : '');
    cards += statCard('Ultimi 3 pieni', st.last3KmL ? fmt(st.last3KmL, 2) + ' km/L' : '–', 'media recente');
    cards += statCard('Spesa media a rifornimento', eur(st.avgSpentPerRefuel), 'media ' + fmt(st.avgKmPerRefuel, 0) + ' km a pieno');
    cards += statCard('Spesa mensile stimata', st.spentPerMonth != null ? eur(st.spentPerMonth) : '–', st.kmPerDay != null ? fmt(st.kmPerDay, 1) + ' km al giorno' : 'servono 2+ rifornimenti');
    cards += statCard('Frequenza', st.avgDaysBetween != null ? fmt(st.avgDaysBetween, 1) + ' gg' : '–', 'tra un rifornimento e l\'altro');

    var kmlPts = kmlPoints(rs);
    var pricePts = rs.map(function (r) {
      return { label: fmtDate(r.date), short: fmtDate(r.date).slice(0, 5), value: r.paid };
    });

    var mon = C.monthly(rs).slice(-12);
    var l100Pts = rs.filter(function (r) { return r.l100; }).map(function (r) { return { label: fmtDate(r.date), short: fmtDate(r.date).slice(0, 5), value: r.l100 }; });
    var cpkPts = rs.filter(function (r) { return r.costPerKm != null; }).map(function (r) { return { label: fmtDate(r.date), short: fmtDate(r.date).slice(0, 5), value: r.costPerKm }; });
    var run = 0, cumPts = rs.map(function (r) { run += r.total; return { label: fmtDate(r.date), short: fmtDate(r.date).slice(0, 5), value: run }; });
    var priceMulti = rs.map(function (r) { return { label: fmtDate(r.date), short: fmtDate(r.date).slice(0, 5), v: [r.price, r.paid] }; });
    var lastSeg = segsOf(rs).slice(-1)[0];
    var top5 = rs.slice().sort(function (a, b) { return b.total - a.total; }).slice(0, 5).map(function (r) {
      return { label: fmtDate(r.date), value: r.total, text: eur(r.total), sub: fmt(r.liters, 2) + ' L · ' + fmt(r.paid, 3) + ' €/L' };
    });
    var years = {};
    rs.forEach(function (r) { var y = r.date.slice(0, 4); years[y] = (years[y] || 0) + r.total; });
    var yearItems = Object.keys(years).sort().reverse().map(function (y) { return { label: y, value: years[y], text: eur(years[y], 0) }; });
    var gaugeHtml = lastSeg && st.best ? CH.gauge(lastSeg.kmPerL, 0, Math.max(st.best.kmPerL, lastSeg.kmPerL), {
      unit: 'km/L ultimo pieno', label: 'Ultimo pieno rispetto al record',
      caption: 'Il tuo record è ' + fmt(st.best.kmPerL, 2) + ' km/L (' + fmtDate(st.best.date) + ')' }) : fewer('Serve almeno un pieno calcolato.');
    var fvgItems = [{ label: 'Con sconto FVG', value: st.fvgCount }, { label: 'Senza sconto', value: st.n - st.fvgCount }];
    var fullN = rs.filter(function (r) { return r.full; }).length;
    var typeItems = [{ label: 'Pieni', value: fullN }, { label: 'Parziali', value: st.n - fullN }];

    var charts = '<div class="charts">' +
      chartCard('Consumo (km/L) per rifornimento', kmlPts.length > 1 ? CH.line(kmlPts, { decimals: 1, unit: 'km/L', avg: st.avgKmL, label: 'Consumo km/L' }) : fewer('Servono almeno due pieni per il grafico.'), 'wide') +
      chartCard('Ultimo pieno vs record', gaugeHtml) +
      chartCard('Consumo (L/100 km)', l100Pts.length > 1 ? CH.line(l100Pts, { decimals: 1, unit: 'L/100 km', avg: st.l100, label: 'Litri ogni 100 km' }) : fewer('Servono almeno due pieni.')) +
      chartCard('Prezzo: listino e pagato (€/L)', CH.multi(priceMulti, ['Listino', 'Pagato'], { decimals: 3, unit: '€/L', label: 'Listino e pagato' }), 'wide') +
      chartCard('Spesa mensile (€)', CH.bars(mon.map(function (m) { return { label: monthLabel(m.key), value: m.spent }; }), { decimals: 0, unit: '€', label: 'Spesa mensile' })) +
      chartCard('Pagato e risparmio FVG per mese (€)', CH.stacked(mon.map(function (m) { return { label: monthLabel(m.key), parts: [m.spent, m.saved] }; }), ['Pagato', 'Risparmio FVG'], { decimals: 0, unit: '€', label: 'Pagato e risparmio' })) +
      chartCard('Km al mese', CH.bars(mon.map(function (m) { return { label: monthLabel(m.key), value: m.km }; }), { decimals: 0, unit: 'km', label: 'Km al mese' })) +
      chartCard('Litri al mese', CH.bars(mon.map(function (m) { return { label: monthLabel(m.key), value: m.liters }; }), { decimals: 0, unit: 'L', label: 'Litri al mese' })) +
      chartCard('Costo al km (€)', cpkPts.length > 1 ? CH.line(cpkPts, { decimals: 3, unit: '€/km', avg: st.costPerKm, label: 'Costo al km' }) : fewer('Servono almeno due rifornimenti.')) +
      chartCard('Spesa accumulata (€)', cumPts.length > 1 ? CH.line(cumPts, { decimals: 0, unit: '€', label: 'Spesa accumulata' }) : fewer('Servono almeno due rifornimenti.')) +
      chartCard('Pagato e risparmiato', st.saved > 0 ? CH.donut([{ label: 'Pagato', value: st.spent }, { label: 'Risparmiato', value: st.saved }], { unit: '€', big: eur(st.saved, 0), small: 'risparmiati', label: 'Pagato e risparmiato' }) : fewer('Nessuno sconto FVG registrato.')) +
      chartCard('Rifornimenti con sconto FVG', CH.donut(fvgItems, { big: fmt(st.fvgCount, 0), small: 'con sconto', label: 'Rifornimenti con sconto' })) +
      chartCard('Pieni e parziali', CH.donut(typeItems, { big: fmt(st.n, 0), small: st.n === 1 ? 'rifornimento' : 'rifornimenti', label: 'Pieni e parziali' })) +
      chartCard('Giorno della settimana', CH.bars(dowPoints(rs), { decimals: 0, unit: 'rifornimenti', label: 'Rifornimenti per giorno' })) +
      chartCard('I 5 pieni più cari', CH.hbars(top5)) +
      chartCard('Spesa per anno', CH.hbars(yearItems)) + '</div>';

    var compare = '';
    var all = S.get().vehicles;
    if (all.length > 1) {
      compare = '<div class="card chart-card"><h3>Confronto veicoli</h3><div class="table-wrap"><table><thead><tr>' +
        '<th>Veicolo</th><th>km/L</th><th>€/km</th><th>Spesa</th><th>Km</th></tr></thead><tbody>' +
        all.map(function (x) {
          var s = C.stats(x, C.rows(x));
          return '<tr><td>' + esc(x.name) + '</td><td>' + (s.avgKmL ? fmt(s.avgKmL, 2) : '–') + '</td><td>' +
            (s.costPerKm != null ? fmt(s.costPerKm, 3) : '–') + '</td><td>' + (s.n ? eur(s.spent, 0) : '–') +
            '</td><td>' + (s.n ? fmt(s.totalKm) : '–') + '</td></tr>';
        }).join('') + '</tbody></table></div></div>';
    }
    box.innerHTML = '<div class="stat-grid">' + cards + '</div>' + charts + compare;
  }

  /* ---------- impostazioni ---------- */
  function renderSettings() {
    var st = S.get();
    $('#sDiscount').value = toField(st.settings.fvgDiscount);
    $('#themeGrid').innerHTML = THEMES.map(function (t) {
      return '<button type="button" class="theme-opt" role="radio" data-theme-id="' + t[0] + '" aria-checked="' + (t[0] === st.settings.theme) + '">' +
        '<span class="sw" style="background:linear-gradient(135deg,' + t[2] + ' 50%,' + t[3] + ' 50%)"></span><span>' + t[1] + '</span></button>';
    }).join('');
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
  }

  /* ---------- dialog auto ---------- */
  var vEditId = null;

  function pickColor() {
    var palette = ['#0f766e', '#2563eb', '#c2410c', '#7c3aed', '#be123c', '#4d7c0f', '#0e7490', '#a16207'];
    return palette[S.get().vehicles.length % palette.length];
  }

  var ICONS = ['🚗', '🚙', '🚕', '🏎️', '🚓', '🚐', '🛻', '🚚', '🚛', '🏍️', '🛵', '🚜', '⛵', '🛥️', '🚌', '🚲'];
  var vIcon = '🚗';

  function renderIconPicker() {
    $('#vIcons').innerHTML = ICONS.map(function (ic) {
      return '<button type="button" class="icon-opt" role="radio" data-icon="' + ic + '" aria-checked="' + (ic === vIcon) + '">' + ic + '</button>';
    }).join('');
  }

  function openVehicleDialog(id) {
    var dlg = $('#vehicleDialog');
    var v = id ? S.get().vehicles.filter(function (x) { return x.id === id; })[0] : null;
    vEditId = v ? v.id : null;
    $('#vTitle').textContent = v ? 'Modifica veicolo' : 'Nuovo veicolo';
    $('#vIntro').hidden = !!v;
    $('#vDelete').hidden = !v;
    $('#vType').value = v ? v.type : 'auto';
    $('#vName').value = v ? v.name : '';
    $('#vPlate').value = v ? v.plate : '';
    $('#vFuel').value = v ? v.fuel : 'Benzina';
    $('#vInitKm').value = v ? fmt(v.initialKm) : '';
    $('#vTank').value = v && v.tank != null ? toField(v.tank) : '';
    vIcon = v ? (v.icon || TYPES[v.type][1]) : '🚗';
    renderIconPicker();
    $('#vError').hidden = true;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    setTimeout(function () { $('#vName').focus(); }, 30);
  }

  function closeVehicleDialog() {
    var dlg = $('#vehicleDialog');
    if (dlg.open) dlg.close();
  }

  function onVehicleSubmit(e) {
    e.preventDefault();
    var name = $('#vName').value.trim();
    var km = parseNum($('#vInitKm').value, true);
    var tankStr = $('#vTank').value.trim();
    var tank = tankStr ? parseNum(tankStr) : null;
    function fail(msg) { var el = $('#vError'); el.textContent = msg; el.hidden = false; }

    if (!name) return fail('Inserisci il nome del veicolo.');
    if (!isFinite(km) || km < 0) return fail('Inserisci i km attuali del contachilometri.');
    if (tankStr && (!isFinite(tank) || tank <= 0)) return fail('Capacità serbatoio non valida.');

    var data = { type: $('#vType').value, name: name, plate: $('#vPlate').value.trim().toUpperCase(), fuel: $('#vFuel').value, initialKm: km, tank: tank, icon: vIcon };

    if (vEditId) {
      var cur = S.get().vehicles.filter(function (x) { return x.id === vEditId; })[0];
      data.color = cur.color;
      var minOdo = cur.refuels.length ? Math.min.apply(null, cur.refuels.map(function (r) { return r.odometer; })) : Infinity;
      if (km >= minOdo) return fail('I km iniziali devono essere inferiori al primo rifornimento (' + fmt(minOdo) + ' km).');
      S.updateVehicle(vEditId, data);
      closeVehicleDialog();
      renderAll();
      applyChrome(false);
      toast('Veicolo aggiornato');
    } else {
      data.color = pickColor();
      var created = S.addVehicle(data);
      closeVehicleDialog();
      openVehicle(created.id);
      toast(created.name + ' aggiunto: ora registra il primo rifornimento');
    }
  }

  function onVehicleDelete() {
    var v = S.get().vehicles.filter(function (x) { return x.id === vEditId; })[0];
    if (!v) return;
    if (window.confirm('Eliminare "' + v.name + '" e ' + (v.refuels.length === 1 ? 'il suo rifornimento' : 'i suoi ' + v.refuels.length + ' rifornimenti') + '? Operazione non annullabile.')) {
      S.deleteVehicle(v.id);
      closeVehicleDialog();
      showGarage();
      toast('Veicolo eliminato');
    }
  }

  /* ---------- export / import ---------- */
  function stamp() { return S.todayISO(); }

  function exportCsv() {
    var v = vehicle();
    if (!v) return toast('Apri prima un veicolo', 'error');
    var rs = C.rows(v);
    if (!rs.length) return toast('Nessun rifornimento da esportare', 'error');
    function n(x, d) { return x == null || !isFinite(x) ? '' : String(Number(x.toFixed(d))).replace('.', ','); }
    function t(s) { return '"' + String(s).replace(/"/g, '""') + '"'; }
    var lines = ['data;km_finali;km_percorsi;litri;prezzo_listino;sconto_fvg;prezzo_pagato;totale;km_l;l_100km;costo_km;pieno;note'];
    rs.forEach(function (r) {
      lines.push([r.date, n(r.odometer, 1), n(r.km, 1), n(r.liters, 2), n(r.price, 3), r.fvg ? n(r.price - r.paid, 3) : '',
        n(r.paid, 3), n(r.total, 2), n(r.kmPerL, 2), n(r.l100, 2), n(r.costPerKm, 3), r.full ? 'si' : 'no', t(r.note)].join(';'));
    });
    download('ricarica-pieno-' + v.name.replace(/[^\w-]+/g, '_') + '-' + stamp() + '.csv', '﻿' + lines.join('\r\n'), 'text/csv;charset=utf-8');
  }

  function onImport(e) {
    var f = e.target.files[0];
    if (!f) return;
    var mode = $('#importMode').value;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        if (mode === 'replace' && !window.confirm('Sostituire TUTTI i dati attuali con quelli del file?')) return;
        var res = S.importData(String(reader.result), mode);
        resetForm();
        renderAll();
        applyChrome(false);
        toast('Importati ' + pl(res.vehicles, 'veicolo', 'veicoli') + ' e ' + pl(res.refuels, 'rifornimento', 'rifornimenti'));
      } catch (err) {
        toast(err.message || 'Importazione non riuscita', 'error');
      } finally {
        e.target.value = '';
      }
    };
    reader.onerror = function () { toast('Impossibile leggere il file', 'error'); e.target.value = ''; };
    reader.readAsText(f);
  }

  /* ---------- eventi ---------- */
  function bind() {
    $('#tabs').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-tab]');
      if (!b) return;
      if (b.dataset.tab === 'add') openNewRefuel(); else setTab(b.dataset.tab);
    });
    $('#btnBack').addEventListener('click', showGarage);
    $('#vehiclePill').addEventListener('click', showGarage);
    $('#btnGear').addEventListener('click', function () { screen = 'settings'; applyChrome(true); });

    $('#garageGrid').addEventListener('click', function (e) {
      var b = e.target.closest('[data-gact]');
      if (!b) return;
      var a = b.dataset.gact;
      if (a === 'open') openVehicle(b.dataset.id);
      if (a === 'edit') openVehicleDialog(b.dataset.id);
      if (a === 'new') openVehicleDialog();
      if (a === 'hit') { openVehicle(b.dataset.id); hQuery = gQuery; $('#hSearch').value = gQuery; renderHistory(); setTab('history'); }
      if (a === 'import') { $('#importMode').value = 'merge'; $('#importFile').click(); }
    });

    $('#dashBody').addEventListener('click', function (e) {
      var b = e.target.closest('[data-go]');
      if (!b) return;
      if (b.dataset.go === 'add') openNewRefuel(); else setTab(b.dataset.go);
    });

    var form = $('#refuelForm');
    form.addEventListener('submit', onSubmit);
    form.addEventListener('input', function () { clearError(); renderPreview(); });
    $('#fFvg').addEventListener('change', function () {
      $('#fvgBox').hidden = !this.checked;
      if (this.checked && !$('#fDiscount').value.trim()) $('#fDiscount').value = toField(S.get().settings.fvgDiscount);
      renderPreview();
    });
    $('#btnCancelEdit').addEventListener('click', closeRefuel);
    $('#rClose').addEventListener('click', closeRefuel);
    $('#refuelDialog').addEventListener('click', function (e) { if (e.target === this) closeRefuel(); });
    $('#refuelDialog').addEventListener('close', function () { resetForm(); renderPreview(); });

    $('#historyList').addEventListener('click', function (e) {
      var g = e.target.closest('[data-go]');
      if (g) { openNewRefuel(); return; }
      var b = e.target.closest('button[data-act]');
      if (!b) return;
      if (b.dataset.act === 'edit') startEdit(b.dataset.id);
      if (b.dataset.act === 'del' && window.confirm('Eliminare questo rifornimento? I km/L verranno ricalcolati.')) {
        S.deleteRefuel(vehicle().id, b.dataset.id);
        if (editingId === b.dataset.id) resetForm();
        renderAll();
        toast('Rifornimento eliminato');
      }
    });

    $('#vehicleForm').addEventListener('submit', onVehicleSubmit);
    $('#vCancel').addEventListener('click', closeVehicleDialog);
    $('#vDelete').addEventListener('click', onVehicleDelete);
    $('#vIcons').addEventListener('click', function (e) {
      var b = e.target.closest('.icon-opt');
      if (!b) return;
      vIcon = b.dataset.icon;
      renderIconPicker();
    });
    $('#vehicleDialog').addEventListener('click', function (e) { if (e.target === this) closeVehicleDialog(); });

    $('#sDiscount').addEventListener('change', function () {
      var n = parseNum(this.value);
      if (isFinite(n) && n >= 0) { S.setSettings({ fvgDiscount: n }); toast('Sconto FVG predefinito salvato'); }
      this.value = toField(S.get().settings.fvgDiscount);
      resetForm();
      renderPreview();
    });
    $('#themeGrid').addEventListener('click', function (e) {
      var b = e.target.closest('[data-theme-id]');
      if (!b) return;
      S.setSettings({ theme: b.dataset.themeId });
      applyTheme();
      renderSettings();
    });
    $('#gSearch').addEventListener('input', function () { gQuery = this.value; renderGarage(); });
    $('#hSearch').addEventListener('input', function () { hQuery = this.value; renderHistory(); });
    $('#hFilters').addEventListener('click', function (e) {
      var b = e.target.closest('[data-f]');
      if (b) { hFilter = b.dataset.f; renderHistory(); }
    });
    $('#vType').addEventListener('change', function () { vIcon = TYPES[this.value][1]; renderIconPicker(); });
    ['fOdo', 'vInitKm'].forEach(function (id) { $('#' + id).addEventListener('input', function () { groupInput(this); }); });

    $('#btnExportAll').addEventListener('click', function () {
      if (!S.get().vehicles.length) return toast('Nessun dato da esportare', 'error');
      download('ricarica-pieno-backup-' + stamp() + '.json', S.exportData(), 'application/json');
    });
    $('#btnExportOne').addEventListener('click', function () {
      var v = vehicle();
      if (!v) return toast('Apri prima un veicolo', 'error');
      download('ricarica-pieno-' + v.name.replace(/[^\w-]+/g, '_') + '-' + stamp() + '.json', S.exportData(v.id), 'application/json');
    });
    $('#btnExportCsv').addEventListener('click', exportCsv);
    $('#importFile').addEventListener('change', onImport);

    $('#btnReset').addEventListener('click', function () {
      if (window.confirm('Cancellare TUTTI i veicoli e i rifornimenti da questo dispositivo? Esporta prima un backup se ti serve.')) {
        S.reset();
        showGarage();
        toast('Dati cancellati');
      }
    });
  }

  /* ---------- avvio ---------- */
  function init() {
    $('#vType').innerHTML = Object.keys(TYPES).map(function (k) { return '<option value="' + k + '">' + TYPES[k][0] + '</option>'; }).join('');
    bind();
    resetForm();
    screen = 'garage';
    renderAll();
    applyChrome(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
