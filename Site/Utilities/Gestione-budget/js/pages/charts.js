"use strict";

/* ================= Grafici ================= */
const charts = {};
const money = (v) => fmt(v).replace(/[,.]00(?=\s|\u00a0|$)/, "");
const valuePlugin = {
  id: "vals",
  afterDatasetsDraw(chart) {
    if (!state.showAmounts) return;
    const { ctx } = chart,
      type = chart.config.type;
    ctx.save();
    ctx.font = '700 11px "Hanken Grotesk",system-ui,sans-serif';
    chart.data.datasets.forEach((ds, di) => {
      const meta = chart.getDatasetMeta(di);
      if (meta.hidden) return;
      const n = meta.data.length;
      meta.data.forEach((el, i) => {
        const v = ds.data[i];
        if (!v) return;
        const txt = money(v);
        if (type === "doughnut") {
          if (
            chart.data.labels[0] === "Nessun dato" ||
            el.endAngle - el.startAngle < 0.3
          )
            return;
          const c = el.getCenterPoint();
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#fff";
          ctx.shadowColor = "rgba(0,0,0,.55)";
          ctx.shadowBlur = 3;
          ctx.fillText(txt, c.x, c.y);
        } else if (type === "bar") {
          ctx.shadowBlur = 0;
          ctx.fillStyle = cssVar("--text");
          if (n > 12) {
            ctx.save();
            ctx.translate(el.x, el.y - 5);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(txt, 0, 0);
            ctx.restore();
          } else {
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(txt, el.x, el.y - 4);
          }
        } else if (type === "line" && n <= 13) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = cssVar("--text");
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText(txt, el.x, el.y - 8);
        }
      });
    });
    ctx.restore();
  },
};
document.querySelectorAll(".amt").forEach((c) =>
  c.addEventListener("change", () => {
    state.showAmounts = c.checked;
    save();
    document.querySelectorAll(".amt").forEach((x) => (x.checked = c.checked));
    drawCharts();
  }),
);
function mk(id, cfg) {
  const el = $(id);
  if (!el) return;
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(el, { ...cfg, plugins: [valuePlugin] });
}
function drawCharts() {
  if (typeof Chart === "undefined") return;
  const text = cssVar("--text"),
    grid = cssVar("--border"),
    cin = cssVar("--in"),
    cout = cssVar("--out"),
    prim = cssVar("--primary"),
    card = cssVar("--surface");
  Chart.defaults.color = cssVar("--muted");
  Chart.defaults.font.family = '"Hanken Grotesk",system-ui,sans-serif';
  const tick = { callback: (v) => eur.format(v) };
  const tip = {
    callbacks: {
      label: (c) =>
        ` ${c.dataset.label ? c.dataset.label + ": " : ""}${eur.format(c.parsed.y ?? c.parsed)}`,
    },
  };
  const common = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    layout: { padding: { top: 42 } },
  };
  const axes = {
    y: { ticks: tick, grid: { color: grid } },
    x: { grid: { display: false } },
  };
  const m = inPer(),
    s = series();
  const doughnut = (type) => {
    const c = catTotals(byType(m, type));
    return {
      type: "doughnut",
      data: {
        labels: c.length ? c.map((x) => x[0]) : ["Nessun dato"],
        datasets: [
          {
            data: c.length ? c.map((x) => x[1]) : [1],
            backgroundColor: c.length
              ? c.map((x) => catColor(x[0], type))
              : [grid],
            borderColor: card,
            borderWidth: 3,
          },
        ],
      },
      options: {
        ...common,
        cutout: "62%",
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: text,
              usePointStyle: true,
              generateLabels: (ch) =>
                Chart.overrides.doughnut.plugins.legend.labels
                  .generateLabels(ch)
                  .map((l) => ({
                    ...l,
                    text:
                      state.showAmounts && c.length
                        ? `${l.text} · ${money(ch.data.datasets[0].data[l.index])}`
                        : l.text,
                  })),
            },
          },
          tooltip: {
            callbacks: {
              label: (x) =>
                c.length ? ` ${x.label}: ${eur.format(x.parsed)}` : "",
            },
          },
        },
      },
    };
  };
  if (page === "dash") {
    mk("cFlow", {
      type: "bar",
      data: {
        labels: s.map((r) => r.label),
        datasets: [
          {
            label: "Entrate",
            data: s.map((r) => r.a),
            backgroundColor: cin,
            borderRadius: 5,
          },
          {
            label: "Uscite",
            data: s.map((r) => r.b),
            backgroundColor: cout,
            borderRadius: 5,
          },
        ],
      },
      options: {
        ...common,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: text, usePointStyle: true },
          },
          tooltip: tip,
        },
        scales: axes,
      },
    });
    mk("cCat", doughnut("out"));
  } else if (page === "tot") {
    const y = cur.slice(0, 4),
      rows = Array.from({ length: 12 }, (_, i) => {
        const mm = inKey(`${y}-${pad(i + 1)}`);
        return { a: sum(byType(mm, "in")), b: sum(byType(mm, "out")) };
      });
    mk("cTotM", {
      type: "bar",
      data: {
        labels: MONTHS,
        datasets: [
          {
            label: "Guadagni",
            data: rows.map((r) => r.a),
            backgroundColor: cin,
            borderRadius: 5,
          },
          {
            label: "Spese",
            data: rows.map((r) => r.b),
            backgroundColor: cout,
            borderRadius: 5,
          },
        ],
      },
      options: {
        ...common,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: text, usePointStyle: true },
          },
          tooltip: tip,
        },
        scales: axes,
      },
    });
  } else if (page === "rep") {
    mk("cBal", {
      type: "line",
      data: {
        labels: s.map((r) => r.label),
        datasets: [
          {
            label: "Saldo",
            data: s.map((r) => r.run),
            borderColor: prim,
            backgroundColor: prim + "30",
            fill: true,
            tension: 0.35,
            pointRadius: s.length > 40 ? 0 : 3,
          },
        ],
      },
      options: {
        ...common,
        plugins: { legend: { display: false }, tooltip: tip },
        scales: axes,
      },
    });
    mk("cInCat", doughnut("in"));
  }
}
