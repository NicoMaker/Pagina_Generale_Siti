const giorni = [
  "domenica",
  "lunedì",
  "martedì",
  "mercoledì",
  "giovedì",
  "venerdì",
  "sabato",
];

const mesi = [
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

const timeEl            = document.getElementById("time");
const dateEl            = document.getElementById("date");
const periodEl          = document.getElementById("period");
const dateAnalogEl      = document.getElementById("date-analog");
const analogPeriodLabel = document.getElementById("analog-period-label");
const digitalDisp       = document.getElementById("digital-display");
const analogDisp        = document.getElementById("analog-display");
const buttons           = document.querySelectorAll(".btn");

// formato: "24" | "12" | "analog"
// formatoOra: "24" | "12" — ricorda l'ultima scelta digitale, usata anche sull'analogico
let formato    = "24";
let formatoOra = "24";

// ─── Genera tacche e numeri del quadrante ────────────────────────────
(function buildTicks() {
  const ticksGroup = document.getElementById("ticks");
  for (let i = 0; i < 60; i++) {
    const angle  = (i / 60) * 360;
    const isHour = i % 5 === 0;
    const inner  = isHour ? 82 : 90;
    const outer  = 96;
    const rad    = (angle - 90) * (Math.PI / 180);
    const x1     = 100 + inner * Math.cos(rad);
    const y1     = 100 + inner * Math.sin(rad);
    const x2     = 100 + outer * Math.cos(rad);
    const y2     = 100 + outer * Math.sin(rad);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", isHour ? "#667eea" : "#ccc");
    line.setAttribute("stroke-width", isHour ? "2.5" : "1");
    line.setAttribute("stroke-linecap", "round");
    ticksGroup.appendChild(line);

    if (isHour) {
      const num  = i / 5 || 12;
      const lr   = 70;
      const tx   = 100 + lr * Math.cos(rad);
      const ty   = 100 + lr * Math.sin(rad);
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", tx);
      text.setAttribute("y", ty);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "central");
      text.setAttribute("font-size", "11");
      text.setAttribute("font-weight", "600");
      text.setAttribute("fill", "#667eea");
      text.setAttribute("font-family", "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif");
      text.textContent = num;
      ticksGroup.appendChild(text);
    }
  }
})();

// ─── Helpers ──────────────────────────────────────────────────────────
function pad(num) {
  return String(num).padStart(2, "0");
}

function rotateLancetta(id, deg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.setAttribute("transform", `rotate(${deg} 100 100)`);
}

// ─── Aggiornamento orologio ───────────────────────────────────────────
function aggiornaClock() {
  const now = new Date();

  const giorno       = giorni[now.getDay()];
  const numeroGiorno = pad(now.getDate());
  const mese         = mesi[now.getMonth()];
  const anno         = now.getFullYear();
  const dataStr      = `${giorno} ${numeroGiorno} ${mese} ${anno}`;

  const oreRaw  = now.getHours();
  const minuti  = now.getMinutes();
  const secondi = now.getSeconds();

  // ── Digitale ──
  if (formato !== "analog") {
    let orario = "";
    let ampm   = "";

    if (formato === "24") {
      orario = `${pad(oreRaw)}:${pad(minuti)}:${pad(secondi)}`;
    } else {
      ampm = oreRaw >= 12 ? "PM" : "AM";
      const ore12 = oreRaw % 12 || 12;
      orario = `${pad(ore12)}:${pad(minuti)}:${pad(secondi)}`;
    }

    timeEl.textContent   = orario;
    periodEl.textContent = ampm;
    dateEl.textContent   = dataStr;
  }

  // ── Analogico ──
  if (formato === "analog") {
    const secDeg = secondi * 6;
    const minDeg = minuti * 6 + secondi * 0.1;
    const oreDeg = (oreRaw % 12) * 30 + minuti * 0.5;

    rotateLancetta("hour-hand",   oreDeg);
    rotateLancetta("minute-hand", minDeg);
    rotateLancetta("second-hand", secDeg);

    dateAnalogEl.textContent = dataStr;

    // Label dentro il quadrante: AM/PM se formato 12h, "24H" se 24h
    if (analogPeriodLabel) {
      if (formatoOra === "12") {
        analogPeriodLabel.textContent = oreRaw >= 12 ? "PM" : "AM";
      } else {
        analogPeriodLabel.textContent = "24H";
      }
    }
  }
}

// ─── Switch modalità ─────────────────────────────────────────────────
buttons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    formato = btn.dataset.format;
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Salva il formato ora usato sull'analogico
    if (formato !== "analog") {
      formatoOra = formato;
    }

    if (formato === "analog") {
      digitalDisp.style.display = "none";
      analogDisp.style.display  = "flex";
    } else {
      digitalDisp.style.display = "block";
      analogDisp.style.display  = "none";
      periodEl.textContent      = "";
    }

    aggiornaClock();
  });
});

// ─── Avvio ────────────────────────────────────────────────────────────
aggiornaClock();
setInterval(aggiornaClock, 1000);

// ─── Previeni pull-to-refresh su mobile ──────────────────────────────
let startY = 0;
document.addEventListener(
  "touchstart",
  (e) => { startY = e.touches[0].pageY; },
  { passive: false }
);
document.addEventListener(
  "touchmove",
  (e) => {
    const y = e.touches[0].pageY;
    if (window.scrollY === 0 && y > startY) {
      e.preventDefault();
    }
  },
  { passive: false }
);