/* Ricarica Pieno – charts.js
 * Grafici SVG leggeri, senza librerie esterne.
 * I colori sono definiti nel CSS (classi .chart .line, .bar, ecc.).
 */
(function (g) {
  'use strict';

  var cache = {};
  function nf(v, d) {
    var f = cache[d] || (cache[d] = new Intl.NumberFormat('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: 'always' }));
    return f.format(v);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function range(min, max) {
    if (min === max) { min -= 1; max += 1; }
    var pad = (max - min) * 0.15;
    return [min - pad, max + pad];
  }

  var W = 640, H = 250, L = 52, R = 16, T = 18, B = 32;
  var iw = W - L - R, ih = H - T - B;

  function empty() {
    return '<p class="muted small">Servono più dati per mostrare il grafico.</p>';
  }

  /** points: [{label, value}], opt: {decimals, unit, avg, label} */
  function line(points, opt) {
    opt = opt || {};
    if (!points.length) return empty();
    var d = opt.decimals == null ? 1 : opt.decimals;
    var unit = opt.unit || '';
    var vals = points.map(function (p) { return p.value; });
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    if (opt.avg != null) { min = Math.min(min, opt.avg); max = Math.max(max, opt.avg); }
    var r = range(min, max), lo = r[0], hi = r[1];
    var n = points.length;
    function x(i) { return n === 1 ? L + iw / 2 : L + iw * i / (n - 1); }
    function y(v) { return T + ih - (v - lo) / (hi - lo) * ih; }

    var gid = grad('c0');
    var s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opt.label || 'Grafico') + '">' + gid.def + band();
    for (var i = 0; i <= 4; i++) {
      var v = lo + (hi - lo) * i / 4, yy = y(v).toFixed(1);
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '"/>';
      s += '<text class="axis" x="' + (L - 8) + '" y="' + (+yy + 4) + '" text-anchor="end">' + nf(v, d) + '</text>';
    }
    if (opt.avg != null) {
      var ya = y(opt.avg).toFixed(1);
      s += '<line class="avgline" x1="' + L + '" x2="' + (W - R) + '" y1="' + ya + '" y2="' + ya + '"/>';
      s += '<text class="axis avg" x="' + (W - R) + '" y="' + (ya - 5) + '" text-anchor="end">media ' + nf(opt.avg, d) + '</text>';
    }
    var path = points.map(function (p, i) {
      return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.value).toFixed(1);
    }).join(' ');
    if (n > 1) {
      s += '<path class="area" style="fill:url(#' + gid.id + ')" d="' + path + ' L' + x(n - 1).toFixed(1) + ' ' + (T + ih) + ' L' + x(0).toFixed(1) + ' ' + (T + ih) + ' Z"/>';
      s += '<path class="line" pathLength="1" d="' + path + '"/>';
    }
    points.forEach(function (p, i) {
      s += '<circle class="dot" data-i="' + i + '" cx="' + x(i).toFixed(1) + '" cy="' + y(p.value).toFixed(1) + '" r="4.5"/>';
    });
    var step = Math.max(1, Math.ceil(n / 6)), lastShown = -99;
    points.forEach(function (p, i) {
      var show = i % step === 0 || (i === n - 1 && i - lastShown >= step * 0.6);
      if (show) {
        lastShown = i;
        s += '<text class="axis" x="' + x(i).toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle">' + esc(p.short || p.label) + '</text>';
      }
    });
    var sl = n > 1 ? iw / (n - 1) : iw;
    points.forEach(function (p, i) {
      var rows = [{ c: 'c0', name: opt.label || 'Valore', val: nf(p.value, d) + (unit ? ' ' + unit : '') }];
      if (opt.avg != null) rows.push({ name: 'Rispetto alla media', val: sgn(p.value - opt.avg, d) + (unit ? ' ' + unit : '') });
      s += hit(i, x(i), sl, tipHtml(p.label, rows));
    });
    return s + '</svg>';
  }

  /** items: [{label, short, value}], opt: {decimals, unit, label} */
  function bars(items, opt) {
    opt = opt || {};
    if (!items.length) return empty();
    var d = opt.decimals == null ? 0 : opt.decimals;
    var unit = opt.unit || '';
    var max = Math.max.apply(null, items.map(function (i) { return i.value; }).concat([0.0001])) * 1.15;
    var n = items.length, slot = iw / n, bw = Math.min(slot * 0.62, 52);
    function y(v) { return T + ih - v / max * ih; }

    var gb = grad('c0', 1, .62);
    var s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opt.label || 'Grafico') + '">' + gb.def + band();
    for (var i = 0; i <= 4; i++) {
      var v = max * i / 4, yy = y(v).toFixed(1);
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '"/>';
      s += '<text class="axis" x="' + (L - 8) + '" y="' + (+yy + 4) + '" text-anchor="end">' + nf(v, d) + '</text>';
    }
    var hs = '';
    items.forEach(function (it, i) {
      var cx = L + slot * i + slot / 2, top = y(it.value), h = T + ih - top;
      s += '<rect class="bar" style="fill:url(#' + gb.id + ')" x="' + (cx - bw / 2).toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + bw.toFixed(1) +
        '" height="' + Math.max(h, 0).toFixed(1) + '" rx="5" data-i="' + i + '"/>';
      hs += hit(i, cx, slot, tipHtml(it.label, [{ c: 'c0', name: opt.label || 'Valore', val: nf(it.value, d) + (unit ? ' ' + unit : '') }]));
      if (n <= 8) {
        s += '<text class="axis val" x="' + cx.toFixed(1) + '" y="' + (top - 5).toFixed(1) + '" text-anchor="middle">' + nf(it.value, d) + '</text>';
      }
      s += '<text class="axis" x="' + cx.toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle">' + esc(it.short || it.label) + '</text>';
    });
    return s + hs + '</svg>';
  }


  /** Contenuto del tooltip: titolo + righe [{c, name, val}] */
  function tipHtml(title, rows) {
    return '<div class="tp-t">' + esc(title) + '</div>' + rows.map(function (r) {
      return '<div class="tp-r">' + (r.c ? '<i style="background:var(--' + r.c + ')"></i>' : '<i class="no"></i>') +
        '<span>' + esc(r.name) + '</span><b>' + esc(r.val) + '</b></div>';
    }).join('');
  }
  function band() { return '<rect class="band" x="0" y="' + T + '" width="0" height="' + ih + '"/>'; }
  function hit(i, cx, w, html) {
    var x0 = Math.max(L, cx - w / 2), x1 = Math.min(W - R, cx + w / 2);
    return '<rect class="hit" data-i="' + i + '" data-bx="' + x0.toFixed(1) + '" data-bw="' + (x1 - x0).toFixed(1) + '" x="' + x0.toFixed(1) +
      '" y="' + T + '" width="' + (x1 - x0).toFixed(1) + '" height="' + ih + '" data-tip="' + esc(html) + '"/>';
  }
  function sgn(v, d) { return (v > 0 ? '+' : v < 0 ? '−' : '') + nf(Math.abs(v), d); }

  var gcount = 0;
  /** Gradiente verticale con il colore della serie (c0..c4). */
  function grad(c, a, b) {
    a = a == null ? .55 : a; b = b == null ? .04 : b;
    var id = 'g' + (++gcount);
    return { id: id, def: '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" style="stop-color:var(--' + c + ');stop-opacity:' + a + '"/>' +
      '<stop offset="1" style="stop-color:var(--' + c + ');stop-opacity:' + b + '"/></linearGradient></defs>' };
  }
  function svgOpen(label) { return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(label || 'Grafico') + '">' + band(); }
  function gridY(lo, hi, d, y) {
    var s = '';
    for (var i = 0; i <= 4; i++) {
      var v = lo + (hi - lo) * i / 4, yy = y(v).toFixed(1);
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '"/>' +
        '<text class="axis" x="' + (L - 8) + '" y="' + (+yy + 4) + '" text-anchor="end">' + nf(v, d) + '</text>';
    }
    return s;
  }
  function xLabels(points, x) {
    var n = points.length, step = Math.max(1, Math.ceil(n / 6)), last = -99, s = '';
    points.forEach(function (p, i) {
      if (i % step === 0 || (i === n - 1 && i - last >= step * 0.6)) {
        last = i;
        s += '<text class="axis" x="' + x(i).toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle">' + esc(p.short || p.label) + '</text>';
      }
    });
    return s;
  }
  function legend(names) {
    return '<div class="legend">' + names.map(function (n, i) {
      return '<span><i style="background:var(--c' + i + ')"></i>' + esc(n) + '</span>';
    }).join('') + '</div>';
  }

  /** Più linee: points [{label, short, v:[a,b,...]}], names [..] */
  function multi(points, names, opt) {
    opt = opt || {};
    if (points.length < 2) return empty();
    var d = opt.decimals == null ? 2 : opt.decimals, vals = [];
    points.forEach(function (p) { p.v.forEach(function (v) { if (v != null) vals.push(v); }); });
    var r = range(Math.min.apply(null, vals), Math.max.apply(null, vals)), lo = r[0], hi = r[1], n = points.length;
    function x(i) { return L + iw * i / (n - 1); }
    function y(v) { return T + ih - (v - lo) / (hi - lo) * ih; }
    var s = svgOpen(opt.label) + gridY(lo, hi, d, y);
    names.forEach(function (nm, k) {
      var path = '', first = true;
      points.forEach(function (p, i) {
        if (p.v[k] == null) return;
        path += (first ? 'M' : 'L') + x(i).toFixed(1) + ' ' + y(p.v[k]).toFixed(1) + ' ';
        first = false;
      });
      s += '<path class="line c' + k + '" pathLength="1" d="' + path + '"/>';
      points.forEach(function (p, i) {
        if (p.v[k] == null) return;
        s += '<circle class="dot c' + k + '" data-i="' + i + '" cx="' + x(i).toFixed(1) + '" cy="' + y(p.v[k]).toFixed(1) + '" r="3.8"/>';
      });
    });
    points.forEach(function (p, i) {
      var rows = names.map(function (nm, k) { return p.v[k] == null ? null : { c: 'c' + k, name: nm, val: nf(p.v[k], d) + (opt.unit ? ' ' + opt.unit : '') }; }).filter(Boolean);
      if (p.v.length === 2 && p.v[0] != null && p.v[1] != null) rows.push({ name: 'Differenza', val: sgn(p.v[1] - p.v[0], d) + (opt.unit ? ' ' + opt.unit : '') });
      s += hit(i, x(i), iw / (points.length - 1), tipHtml(p.label, rows));
    });
    return s + xLabels(points, x) + '</svg>' + legend(names);
  }

  /** Barre impilate: items [{label, short, parts:[a,b]}] */
  function stacked(items, names, opt) {
    opt = opt || {};
    if (!items.length) return empty();
    var d = opt.decimals == null ? 0 : opt.decimals;
    var max = Math.max.apply(null, items.map(function (i) { return i.parts.reduce(function (a, b) { return a + b; }, 0); }).concat([0.0001])) * 1.15;
    var n = items.length, slot = iw / n, bw = Math.min(slot * 0.62, 52);
    function y(v) { return T + ih - v / max * ih; }
    var s = svgOpen(opt.label) + gridY(0, max, d, y);
    var hs = '';
    items.forEach(function (it, i) {
      var cx = L + slot * i + slot / 2, acc = 0;
      var tot = it.parts.reduce(function (a, b) { return a + b; }, 0);
      hs += hit(i, cx, slot, tipHtml(it.label, it.parts.map(function (v, k) { return { c: 'c' + k, name: names[k], val: nf(v, d) + ' ' + (opt.unit || '') }; })
        .concat([{ name: 'Totale', val: nf(tot, d) + ' ' + (opt.unit || '') }])));
      it.parts.forEach(function (v, k) {
        if (v <= 0) return;
        var top = y(acc + v), h = y(acc) - top;
        s += '<rect class="bar c' + k + '" x="' + (cx - bw / 2).toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + bw.toFixed(1) +
          '" height="' + h.toFixed(1) + '" rx="4" data-i="' + i + '"/>';
        acc += v;
      });
      s += '<text class="axis" x="' + cx.toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle">' + esc(it.short || it.label) + '</text>';
    });
    return s + hs + '</svg>' + legend(names);
  }

  /** Ciambella: items [{label, value}], opt {big, small, decimals, unit} */
  function donut(items, opt) {
    opt = opt || {};
    var tot = items.reduce(function (a, i) { return a + i.value; }, 0);
    if (!(tot > 0)) return empty();
    var d = opt.decimals == null ? 0 : opt.decimals, r = 62, c = 2 * Math.PI * r, acc = 0;
    var s = '<div class="donut"><svg viewBox="0 0 180 180" role="img" aria-label="' + esc(opt.label || 'Ripartizione') + '">' +
      '<circle class="dn-track" cx="90" cy="90" r="' + r + '"/>';
    items.forEach(function (it, k) {
      if (it.value <= 0) return;
      var len = it.value / tot * c, gap = items.length > 1 ? 3 : 0;
      s += '<circle class="dn-seg c' + k + '" cx="90" cy="90" r="' + r + '" stroke-dasharray="' + Math.max(len - gap, 0.1).toFixed(1) + ' ' + c.toFixed(1) +
        '" stroke-dashoffset="' + (-acc).toFixed(1) + '" transform="rotate(-90 90 90)" data-tip="' + esc(tipHtml(it.label, [{ c: 'c' + k, name: 'Valore', val: nf(it.value, d) + (opt.unit ? ' ' + opt.unit : '') }, { name: 'Quota', val: nf(it.value / tot * 100, 1) + '%' }])) + '"/>';
      acc += len;
    });
    s += '<text class="dn-big" x="90" y="92" text-anchor="middle">' + esc(opt.big || nf(tot, d)) + '</text>' +
      '<text class="dn-small" x="90" y="110" text-anchor="middle">' + esc(opt.small || '') + '</text></svg><ul class="dn-legend">';
    items.forEach(function (it, k) {
      s += '<li><i style="background:var(--c' + k + ')"></i><span>' + esc(it.label) + '</span><b>' + nf(it.value, d) + (opt.unit ? ' ' + esc(opt.unit) : '') +
        '</b><small>' + nf(it.value / tot * 100, 0) + '%</small></li>';
    });
    return s + '</ul></div>';
  }

  /** Contachilometri semicircolare: value tra min e max. */
  function gauge(value, min, max, opt) {
    opt = opt || {};
    if (value == null || !(max > min)) return empty();
    var pct = Math.max(0, Math.min(1, (value - min) / (max - min))) * 100, d = opt.decimals == null ? 1 : opt.decimals;
    var arc = 'M20 100 A80 80 0 0 1 180 100';
    return '<div class="gauge"><svg viewBox="0 0 200 124" role="img" aria-label="' + esc(opt.label || 'Indicatore') + '">' +
      '<path class="ga-track" d="' + arc + '" pathLength="100"/>' +
      '<path class="ga-val" d="' + arc + '" pathLength="100" stroke-dasharray="' + pct.toFixed(1) + ' 100" data-tip="' + esc(tipHtml(opt.label || 'Indicatore', [{ c: 'c0', name: 'Valore', val: nf(value, d) + (opt.unit ? ' ' + opt.unit : '') }, { name: 'Del massimo', val: nf(pct, 0) + '%' }])) + '"/>' +
      '<text class="ga-big" x="100" y="92" text-anchor="middle">' + nf(value, d) + '</text>' +
      '<text class="ga-small" x="100" y="112" text-anchor="middle">' + esc(opt.unit || '') + '</text>' +
      '<text class="axis" x="20" y="120" text-anchor="middle">' + nf(min, d) + '</text>' +
      '<text class="axis" x="180" y="120" text-anchor="middle">' + nf(max, d) + '</text></svg>' +
      (opt.caption ? '<p class="ga-cap">' + esc(opt.caption) + '</p>' : '') + '</div>';
  }

  /** Barre orizzontali (HTML): items [{label, value, text, sub}] */
  function hbars(items, opt) {
    opt = opt || {};
    if (!items.length) return empty();
    var max = Math.max.apply(null, items.map(function (i) { return i.value; }).concat([0.0001]));
    return '<div class="hbars">' + items.map(function (it, i) {
      return '<div class="hb" data-tip="' + esc(tipHtml(it.label, [{ name: 'Totale', val: it.text }].concat(it.sub ? [{ name: 'Dettaglio', val: it.sub }] : []))) + '"><div class="hb-top"><span>' + esc(it.label) + '</span><b>' + esc(it.text) + '</b></div>' +
        '<div class="hb-track"><i style="width:' + (it.value / max * 100).toFixed(1) + '%;animation-delay:' + (i * 60) + 'ms"></i></div>' +
        (it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</div>';
    }).join('') + '</div>';
  }

  /** Mini grafico per la dashboard (solo linea, senza assi). */
  function spark(vals) {
    if (!vals || vals.length < 2) return '';
    var w = 180, h = 64, p = 8;
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    if (min === max) { min -= 1; max += 1; }
    function x(i) { return p + (w - 2 * p) * i / (vals.length - 1); }
    function y(v) { return p + (h - 2 * p) * (1 - (v - min) / (max - min)); }
    var d = vals.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
    var li = vals.length - 1;
    return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true">' +
      '<path class="sa" d="' + d + ' L' + x(li).toFixed(1) + ' ' + h + ' L' + x(0).toFixed(1) + ' ' + h + ' Z"/>' +
      '<path class="sl" d="' + d + '"/>' +
      '<circle class="sd" cx="' + x(li).toFixed(1) + '" cy="' + y(vals[li]).toFixed(1) + '" r="4"/></svg>';
  }


  /* ---------- tooltip interattivo (mouse e touch) ---------- */
  var tipEl = null, active = [], activeSvg = null;
  function tipNode() {
    if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'tip'; tipEl.hidden = true; document.body.appendChild(tipEl); }
    return tipEl;
  }
  function clearActive() {
    active.forEach(function (n) { n.classList.remove('on'); });
    active = [];
    if (activeSvg) { activeSvg.classList.remove('hovering'); activeSvg = null; }
  }
  function place(e) {
    var el = tipEl, pad = 16, w = el.offsetWidth, h = el.offsetHeight;
    var x = e.clientX + pad, y = e.clientY - h - pad;
    if (x + w > window.innerWidth - 8) x = e.clientX - w - pad;
    if (x < 8) x = 8;
    if (y < 8) y = e.clientY + pad;
    el.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
  }
  function showTip(t, e) {
    clearActive();
    var el = tipNode();
    el.innerHTML = t.getAttribute('data-tip');
    el.hidden = false;
    var svg = t.ownerSVGElement;
    if (svg && t.hasAttribute('data-bx')) {
      var b = svg.querySelector('.band');
      if (b) { b.setAttribute('x', t.getAttribute('data-bx')); b.setAttribute('width', t.getAttribute('data-bw')); b.classList.add('on'); active.push(b); }
      var i = t.getAttribute('data-i');
      Array.prototype.forEach.call(svg.querySelectorAll('[data-i="' + i + '"]:not(.hit)'), function (n) { n.classList.add('on'); active.push(n); });
      svg.classList.add('hovering'); activeSvg = svg;
    } else { t.classList.add('on'); active.push(t); }
    place(e);
  }
  function hideTip() { if (tipEl) tipEl.hidden = true; clearActive(); }

  if (typeof document !== 'undefined') {
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest ? e.target.closest('[data-tip]') : null;
      if (t) showTip(t, e);
    });
    document.addEventListener('pointermove', function (e) { if (tipEl && !tipEl.hidden) place(e); });
    document.addEventListener('pointerout', function (e) {
      if (e.pointerType === 'touch') return;
      var t = e.target.closest ? e.target.closest('[data-tip]') : null;
      if (t) hideTip();
    });
    document.addEventListener('pointerdown', function (e) {
      if (!(e.target.closest && e.target.closest('[data-tip]'))) hideTip();
    });
    window.addEventListener('scroll', hideTip, { passive: true });
  }

  g.Charts = { line: line, bars: bars, spark: spark, multi: multi, stacked: stacked, donut: donut, gauge: gauge, hbars: hbars, legend: legend };
})(typeof window !== 'undefined' ? window : globalThis);
