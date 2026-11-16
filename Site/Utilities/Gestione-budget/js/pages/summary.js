"use strict";

/* ================= RIEPILOGO ================= */
function renderRep() {
  const m = inPer(),
    inc = sum(byType(m, "in")),
    out = sum(byType(m, "out"));
  const rows = series(),
    nm =
      mode === "day"
        ? 1
        : mm()
          ? rows.length
          : rows.filter((r) => r.a || r.b).length || 1;
  const avgLabel = mm()
    ? "Media spese / giorno"
    : mode === "year"
      ? "Media spese / mese"
      : "Media spese / anno";
  const k = (l, v, c, kind) =>
    `<div class="card kpi"><div class="lbl">${l}</div><div class="val ${c || ""}" style="font-size:1.35rem">${fmt(v)}</div>${kind ? trio(kind) : ""}</div>`;
  $("rKpis").innerHTML =
    k("Entrate " + W(), inc, "in", "in") +
    k("Spese " + W(), out, "out", "out") +
    k("Rimanente " + W(), inc - out, inc - out >= 0 ? "in" : "out", "bal") +
    k(avgLabel, out / nm, "") +
    k(
      "Saldo a fine periodo",
      rows.length ? rows[rows.length - 1].run : 0,
      (rows.length ? rows[rows.length - 1].run : 0) >= 0 ? "in" : "out",
    );
  $("hBal").textContent =
    "Andamento saldo cumulato " +
    (mm() ? "(per giorno)" : mode === "year" ? "(per mese)" : "(per anno)");

  const clickable = !mm(),
    showBud = !mm();
  const list = mm() ? rows.filter((r) => r.a || r.b) : rows;
  $("repTitle").textContent = mm()
    ? `Riepilogo giornaliero · ${monthLabel(cur)}`
    : mode === "year"
      ? `Riepilogo mensile ${cur.slice(0, 4)} (clicca un mese per aprirlo)`
      : "Riepilogo per anno (clicca un anno per aprirlo)";
  $("repHead").innerHTML =
    `<tr><th>${mm() ? "Giorno" : mode === "year" ? "Mese" : "Anno"}</th><th class="num">Entrate</th><th class="num">Uscite</th><th class="num">Rimanente</th><th class="num">Saldo cumulato</th>${showBud ? '<th class="num">Budget</th>' : ""}</tr>`;
  let ti = 0,
    to = 0;
  $("repBody").innerHTML =
    (list.length
      ? list
          .map((r) => {
            ti += r.a;
            to += r.b;
            const label = mm()
              ? dmy(r.key)
              : mode === "year"
                ? MONTHS_FULL[+r.key.slice(5) - 1]
                : r.key;
            return `<tr ${clickable ? `class="click" data-k="${r.key}"` : ""}><td>${label}</td><td class="num in">${fmt(r.a)}</td><td class="num out">${fmt(r.b)}</td><td class="num ${r.bal >= 0 ? "in" : "out"}">${fmt(r.bal)}</td><td class="num">${fmt(r.run)}</td>${showBud ? `<td class="num muted">${budFor(r.key) ? fmt(budFor(r.key)) : "—"}</td>` : ""}</tr>`;
          })
          .join("")
      : `<tr><td colspan="6" class="empty">Nessun dato nel periodo</td></tr>`) +
    (list.length
      ? `<tr><th>Totale</th><th class="num">${fmt(ti)}</th><th class="num">${fmt(to)}</th><th class="num">${fmt(ti - to)}</th><th></th>${showBud ? "<th></th>" : ""}</tr>`
      : "");

  const catTable = (type, tot) => {
    const rowsT = byType(m, type),
      c = catTotals(rowsT),
      cnt = {};
    rowsT.forEach((t) => (cnt[t.category] = (cnt[t.category] || 0) + 1));
    if (!c.length)
      return '<tr><td colspan="3" class="empty">Nessun dato</td></tr>';
    const mx = c[0][1];
    return (
      c
        .map(
          ([n, v]) =>
            `<tr><td><span class="catcell"><span class="cdot" style="--c:${catColor(n, type)}">${esc(catIcon(n, type))}</span>${esc(n)}</span><div class="progress" style="margin:6px 0 0;height:6px"><div style="width:${(v / mx) * 100}%;background:${catColor(n, type)}"></div></div></td><td class="num"><b>${fmt(v)}</b><br><span class="muted">${cnt[n]} op.</span></td><td class="num">${((v / tot) * 100).toFixed(1)}%</td></tr>`,
        )
        .join("") +
      `<tr><th>Totale</th><th class="num">${fmt(tot)}</th><th></th></tr>`
    );
  };
  $("rOut").innerHTML = catTable("out", out);
  $("rIn").innerHTML = catTable("in", inc);
  $("flowR").innerHTML = flowHtml(m);
  $("rBoth").innerHTML = bothHtml();
  drawCharts();
}
$("repBody").onclick = (e) => {
  const tr = e.target.closest("tr[data-k]");
  if (!tr) return;
  if (mode === "year") {
    cur = tr.dataset.k;
    syncInputs();
    setMode("month");
  } else if (mode === "all") {
    cur = `${tr.dataset.k}-${cur.slice(5, 7)}`;
    syncInputs();
    setMode("year");
  }
};
