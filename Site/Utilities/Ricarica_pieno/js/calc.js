/* Ricarica Pieno – calc.js */
(function (g) {
  "use strict";

  const sum = (arr, fn) => arr.reduce((a, x) => a + fn(x), 0);

  const parseDate = (s) => {
    var p = String(s).split("-");
    return Date.UTC(+p[0], (+p[1] || 1) - 1, +p[2] || 1);
  };

  const daysBetween = (a, b) =>
    Math.round((parseDate(b) - parseDate(a)) / 86400000);

  const sorted = (refuels) =>
    refuels
      .slice()
      .sort(
        (a, b) =>
          a.odometer - b.odometer ||
          String(a.date).localeCompare(String(b.date)),
      );

  function rows(vehicle) {
    var list = sorted(vehicle.refuels || []);
    var prev = Number(vehicle.initialKm) || 0;
    var prevDate = null;
    var segKm = 0,
      segL = 0;

    return list.map(function (r) {
      var km = r.odometer - prev;
      var discount = r.fvg ? Math.min(Math.max(r.discount, 0), r.price) : 0;
      var paid = r.price - discount;
      var total = r.paidTotal > 0 ? r.paidTotal : r.liters * paid;
      var saved = r.liters * discount;

      segKm += km;
      segL += r.liters;
      var kmPerL = null,
        segment = null;
      if (r.full) {
        if (segL > 0 && segKm > 0) {
          kmPerL = segKm / segL;
          segment = { km: segKm, liters: segL };
        }
        segKm = 0;
        segL = 0;
      }

      var out = Object.assign({}, r, {
        prevKm: prev,
        km: km,
        paid: paid,
        total: total,
        saved: saved,
        kmPerL: kmPerL,
        l100: kmPerL ? 100 / kmPerL : null,
        costPerKm: km > 0 ? total / km : null,
        days: prevDate ? daysBetween(prevDate, r.date) : null,
        segment: segment,
      });
      prev = r.odometer;
      prevDate = r.date;
      return out;
    });
  }

  function preview(vehicle, cand, editId) {
    if (!isFinite(cand.odometer)) return null;
    var others = (vehicle.refuels || []).filter((r) => r.id !== editId);
    var temp = {
      initialKm: vehicle.initialKm,
      refuels: others.concat([
        {
          id: "__preview",
          date: cand.date || "1970-01-01",
          odometer: cand.odometer,
          liters: isFinite(cand.liters) ? cand.liters : 0,
          price: isFinite(cand.price) ? cand.price : 0,
          fvg: !!cand.fvg,
          discount: isFinite(cand.discount) ? cand.discount : 0,
          paidTotal: cand.paidTotal > 0 ? cand.paidTotal : null,
          full: cand.full !== false,
          note: "",
        },
      ]),
    };
    return rows(temp).filter((r) => r.id === "__preview")[0] || null;
  }

  const weighted = (segs) => {
    var km = sum(segs, (r) => r.segment.km);
    var l = sum(segs, (r) => r.segment.liters);
    return l > 0 ? km / l : null;
  };

  function performance(segs) {
    if (!segs.length) {
      return {
        count: 0,
        avg: null,
        max: null,
        min: null,
        median: null,
        maxRow: null,
        minRow: null,
        avgKmL: null,
        l100: null,
        record: null,
      };
    }
    var vals = segs.map((r) => r.kmPerL);
    var sortedVals = vals.slice().sort((a, b) => a - b);
    var mid = Math.floor(sortedVals.length / 2);
    var median =
      sortedVals.length % 2
        ? sortedVals[mid]
        : (sortedVals[mid - 1] + sortedVals[mid]) / 2;
    var maxRow = segs.reduce((a, r) => (r.kmPerL > a.kmPerL ? r : a));
    var minRow = segs.reduce((a, r) => (r.kmPerL < a.kmPerL ? r : a));
    var km = sum(segs, (r) => r.segment.km);
    var l = sum(segs, (r) => r.segment.liters);
    var avgKmL = l > 0 ? km / l : null;
    return {
      count: segs.length,
      avg: sum(vals, (v) => v) / vals.length,
      max: maxRow.kmPerL,
      min: minRow.kmPerL,
      median: median,
      maxRow: maxRow,
      minRow: minRow,
      avgKmL: avgKmL,
      l100: avgKmL ? 100 / avgKmL : null,
      record: maxRow,
    };
  }

  function stats(vehicle, rs) {
    var n = rs.length;
    var o = { n: n };
    if (!n) return o;

    var first = rs[0],
      last = rs[n - 1];
    o.totalKm = last.odometer - vehicle.initialKm;
    o.liters = sum(rs, (r) => r.liters);
    o.spent = sum(rs, (r) => r.total);
    o.saved = sum(rs, (r) => r.saved);
    o.fvgCount = rs.filter((r) => r.fvg).length;

    var segs = rs.filter((r) => r.segment);
    o.segCount = segs.length;
    o.avgKmL = weighted(segs);
    o.l100 = o.avgKmL ? 100 / o.avgKmL : null;

    var lastSegs = segs.slice(-3);
    o.last3KmL = lastSegs.length ? weighted(lastSegs) : null;
    o.lastN = lastSegs.length;

    o.perf = performance(segs);

    if (segs.length) {
      o.best = segs.reduce((a, r) => (r.kmPerL > a.kmPerL ? r : a));
      o.worst = segs.reduce((a, r) => (r.kmPerL < a.kmPerL ? r : a));
    }

    o.avgPrice = o.liters > 0 ? o.spent / o.liters : null;
    o.avgListino =
      o.liters > 0 ? sum(rs, (r) => r.liters * r.price) / o.liters : null;
    o.costPerKm = o.totalKm > 0 ? o.spent / o.totalKm : null;
    o.avgKmPerRefuel = o.totalKm / n;
    o.avgLitersPerRefuel = o.liters / n;
    o.avgSpentPerRefuel = o.spent / n;

    var span = n > 1 ? daysBetween(first.date, last.date) : 0;
    o.spanDays = span;
    o.avgDaysBetween = n > 1 && span > 0 ? span / (n - 1) : null;
    o.kmPerDay =
      n > 1 && span > 0 ? (last.odometer - first.odometer) / span : null;
    o.spentPerMonth =
      n > 1 && span > 0 ? ((o.spent - first.total) / span) * 30.4375 : null;
    return o;
  }

  function monthly(rs) {
    var map = {};
    rs.forEach(function (r) {
      var k = String(r.date).slice(0, 7);
      var m =
        map[k] ||
        (map[k] = { key: k, spent: 0, liters: 0, km: 0, saved: 0, count: 0 });
      m.spent += r.total;
      m.liters += r.liters;
      m.km += Math.max(r.km, 0);
      m.saved += r.saved;
      m.count++;
    });
    return Object.keys(map)
      .sort()
      .map((k) => map[k]);
  }

  g.Calc = {
    rows: rows,
    preview: preview,
    stats: stats,
    performance: performance,
    monthly: monthly,
    sorted: sorted,
    daysBetween: daysBetween,
  };
})(typeof window !== "undefined" ? window : globalThis);