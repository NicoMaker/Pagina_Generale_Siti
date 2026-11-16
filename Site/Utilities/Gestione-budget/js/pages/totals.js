"use strict";

/* ================= TOTALI ================= */
function renderTot() {
  const y = cur.slice(0, 4),
    pm = prevMonth(cur),
    py = String(+y - 1);
  const S = (arr) => ({
    a: sum(byType(arr, "in")),
    b: sum(byType(arr, "out")),
    n: arr.length,
  });
  const all = S(state.tx),
    mo = S(inKey(cur)),
    pmo = S(inKey(pm)),
    yr = S(inKey(y)),
    pyr = S(inKey(py));
  const tot = all.a - all.b;
  $("tHero").innerHTML =
    `<div class="lbl">Saldo totale</div><div class="big">${fmt(tot)}</div><div class="sub2">Guadagni totali ${fmt(all.a)} · Spese totali ${fmt(all.b)}</div>`;
  const dl = (c, p, upGood, lbl) => {
    if (!p) return `<span class="muted">nessun dato ${lbl}</span>`;
    const d = ((c - p) / Math.abs(p)) * 100,
      good = upGood ? d >= 0 : d <= 0;
    return `<span class="${good ? "in" : "out"}">${d >= 0 ? "▲" : "▼"} ${Math.abs(d).toFixed(0)}%</span> <span class="muted">vs ${lbl}</span>`;
  };
  const k = (l, v, c, x) =>
    `<div class="card kpi"><div class="lbl">${l}</div><div class="val ${c || ""}" style="font-size:1.4rem">${v}</div><div style="font-size:.82rem;min-height:1.2em">${x || ""}</div></div>`;
  const cls = (v) => (v >= 0 ? "in" : "out");

  $("tMonthT").textContent = `${monthLabel(cur)}`;
  const sv = mo.a ? (((mo.a - mo.b) / mo.a) * 100).toFixed(0) + "%" : "—";
  $("tMonth").innerHTML =
    k(
      "Guadagni del mese",
      fmt(mo.a),
      "in",
      dl(mo.a, pmo.a, true, monthLabel(pm)),
    ) +
    k(
      "Spese del mese",
      fmt(mo.b),
      "out",
      dl(mo.b, pmo.b, false, monthLabel(pm)),
    ) +
    k(
      "Saldo del mese",
      fmt(mo.a - mo.b),
      cls(mo.a - mo.b),
      dl(mo.a - mo.b, pmo.a - pmo.b, true, monthLabel(pm)),
    ) +
    k(
      "Risparmio sul guadagno",
      sv,
      "",
      '<span class="muted">quota di entrate non spesa</span>',
    ) +
    k(
      "Accumulato a fine mese",
      fmt(accum(cur + "-31")),
      cc(accum(cur + "-31")),
      '<span class="muted">quello che ti rimane in tutto</span>',
    );

  $("tYearT").textContent = `Anno ${y}`;
  const months = Array.from({ length: 12 }, (_, i) => {
    const sm = S(inKey(`${y}-${pad(i + 1)}`));
    return { i, ...sm, bal: sm.a - sm.b };
  }).filter((r) => r.n);
  const nm = months.length || 1;
  const best = months.reduce((a, r) => (!a || r.bal > a.bal ? r : a), null),
    worst = months.reduce((a, r) => (!a || r.bal < a.bal ? r : a), null);
  $("tYear").innerHTML =
    k(`Guadagni ${y}`, fmt(yr.a), "in", dl(yr.a, pyr.a, true, py)) +
    k(`Spese ${y}`, fmt(yr.b), "out", dl(yr.b, pyr.b, false, py)) +
    k(
      `Saldo ${y}`,
      fmt(yr.a - yr.b),
      cls(yr.a - yr.b),
      dl(yr.a - yr.b, pyr.a - pyr.b, true, py),
    ) +
    k("Media guadagni / mese", fmt(yr.a / nm), "in", "") +
    k("Media spese / mese", fmt(yr.b / nm), "out", "") +
    k(
      "Mese migliore",
      best ? fmt(best.bal) : "—",
      "in",
      best ? MONTHS_FULL[best.i] : "",
    ) +
    k(
      "Mese peggiore",
      worst ? fmt(worst.bal) : "—",
      worst && worst.bal < 0 ? "out" : "",
      worst ? MONTHS_FULL[worst.i] : "",
    ) +
    k(
      "Accumulato a fine anno",
      fmt(accum(y + "-12-31")),
      cc(accum(y + "-12-31")),
      '<span class="muted">quello che ti rimane in tutto</span>',
    );
  $("tMonthsT").textContent = `Mese per mese ${y} · con accumulato`;
  {
    let h = "";
    for (let i = 0; i < 12; i++) {
      const k2 = `${y}-${pad(i + 1)}`,
        sm = S(inKey(k2)),
        ac = accum(k2 + "-31");
      h += `<tr class="click" data-k="${k2}"><td>${MONTHS_FULL[i]}</td><td class="num in">${fmt(sm.a)}</td><td class="num out">${fmt(sm.b)}</td><td class="num ${cc(sm.a - sm.b)}">${fmt(sm.a - sm.b)}</td><td class="num ${cc(ac)}"><b>${fmt(ac)}</b></td></tr>`;
    }
    $("tMonthsB").innerHTML = h;
  }

  const dates = state.tx.map((t) => t.date).sort(),
    nAll = new Set(state.tx.map((t) => t.date.slice(0, 7))).size || 1;
  $("tAll").innerHTML =
    k("Totale guadagni", fmt(all.a), "in", "") +
    k("Totale spese", fmt(all.b), "out", "") +
    k("Operazioni", String(all.n), "", "") +
    k("Media mensile guadagni", fmt(all.a / nAll), "in", "") +
    k("Media mensile spese", fmt(all.b / nAll), "out", "") +
    k(
      "Primo movimento",
      dates.length ? dmy(dates[0]) : "—",
      "",
      dates.length ? "ultimo: " + dmy(dates[dates.length - 1]) : "",
    );

  $("tCatMT").textContent =
    `Entrate e spese per categoria · ${monthLabel(cur)}`;
  $("tCatM").innerHTML = flowHtml(inKey(cur));
  $("tCatYT").textContent = `Entrate e spese per categoria · Anno ${y}`;
  $("tCatY").innerHTML = flowHtml(inKey(y));
  $("tCatTT").textContent =
    "Entrate e spese per categoria · Totale in generale";
  $("tCatT").innerHTML = flowHtml(state.tx);
  $("tChartT").textContent = `Guadagni e spese per mese · ${y}`;
  const ys = [...new Set(state.tx.map((t) => t.date.slice(0, 4)))].sort();
  let run = 0;
  $("tYearsBody").innerHTML = ys.length
    ? ys
        .map((yy) => {
          const sm = S(inKey(yy));
          run += sm.a - sm.b;
          return `<tr class="click" data-y="${yy}"><td>${yy}</td><td class="num in">${fmt(sm.a)}</td><td class="num out">${fmt(sm.b)}</td><td class="num ${cls(sm.a - sm.b)}">${fmt(sm.a - sm.b)}</td><td class="num">${fmt(run)}</td></tr>`;
        })
        .join("")
    : '<tr><td colspan="5" class="empty">Nessun dato</td></tr>';
  drawCharts();
}
$("tYearsBody").onclick = (e) => {
  const tr = e.target.closest("tr[data-y]");
  if (!tr) return;
  cur = `${tr.dataset.y}-${cur.slice(5, 7)}`;
  syncInputs();
  render();
};
