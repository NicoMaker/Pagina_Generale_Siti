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

const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const periodEl = document.getElementById("period");
const dateAnalogEl = document.getElementById("date-analog");
const analogPeriodLabel = document.getElementById("analog-period-label");
const digitalDisp = document.getElementById("digital-display");
const analogDisp = document.getElementById("analog-display");
const buttons = document.querySelectorAll(".btn");

let currentMode = "24";
let digitalFormat = "24";
let analogFormat = "12";

function pad(num) {
  return String(num).padStart(2, "0");
}

function rotateLancetta(id, deg) {
  const el = document.getElementById(id);
  if (el) el.setAttribute("transform", `rotate(${deg} 100 100)`);
}

// Costruisce il quadrante analogico
function buildAnalogTicks() {
  const ticksGroup = document.getElementById("ticks");
  ticksGroup.innerHTML = "";

  const is24h = analogFormat === "24";
  const totalHours = is24h ? 24 : 12;

  // Raggio per i numeri
  const labelRadius = is24h ? 64 : 72;

  // Disegna 60 tacche per i minuti
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * 360;
    const isMinorTick = true;
    const inner = 90;
    const outer = 96;
    const rad = (angle - 90) * (Math.PI / 180);
    const x1 = 100 + inner * Math.cos(rad);
    const y1 = 100 + inner * Math.sin(rad);
    const x2 = 100 + outer * Math.cos(rad);
    const y2 = 100 + outer * Math.sin(rad);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "#ccc");
    line.setAttribute("stroke-width", "1");
    line.setAttribute("stroke-linecap", "round");
    ticksGroup.appendChild(line);
  }

  // Disegna le tacche delle ore e i numeri
  for (let h = 0; h < totalHours; h++) {
    const angle = (h / totalHours) * 360;
    const rad = (angle - 90) * (Math.PI / 180);

    const inner = 80;
    const outer = 96;
    const x1 = 100 + inner * Math.cos(rad);
    const y1 = 100 + inner * Math.sin(rad);
    const x2 = 100 + outer * Math.cos(rad);
    const y2 = 100 + outer * Math.sin(rad);

    // Tacca ora (sopra le tacche minuti)
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "#667eea");
    line.setAttribute("stroke-width", "2.5");
    line.setAttribute("stroke-linecap", "round");
    ticksGroup.appendChild(line);

    // Numero
    let label;
    if (is24h) {
      label = String(h).padStart(2, "0");
    } else {
      label = h === 0 ? 12 : h;
    }

    const tx = 100 + labelRadius * Math.cos(rad);
    const ty = 100 + labelRadius * Math.sin(rad);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", tx);
    text.setAttribute("y", ty);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.setAttribute("font-size", is24h ? "6.5" : "10");
    text.setAttribute("font-weight", "600");
    text.setAttribute("fill", is24h ? "#555" : "#667eea");
    text.setAttribute(
      "font-family",
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    );
    text.textContent = label;
    ticksGroup.appendChild(text);
  }
}

function updateClock() {
  const now = new Date();
  const giorno = giorni[now.getDay()];
  const numeroGiorno = pad(now.getDate());
  const mese = mesi[now.getMonth()];
  const anno = now.getFullYear();
  const dataStr = `${giorno} ${numeroGiorno} ${mese} ${anno}`;

  const oreRaw = now.getHours();
  const minuti = now.getMinutes();
  const secondi = now.getSeconds();

  // Aggiorna display digitale
  let orario = "";
  let ampm = "";

  if (digitalFormat === "24") {
    orario = `${pad(oreRaw)}:${pad(minuti)}:${pad(secondi)}`;
  } else {
    ampm = oreRaw >= 12 ? "PM" : "AM";
    const ore12 = oreRaw % 12 || 12;
    orario = `${pad(ore12)}:${pad(minuti)}:${pad(secondi)}`;
  }

  timeEl.textContent = orario;
  periodEl.textContent = ampm;
  dateEl.textContent = dataStr;

  // Aggiorna analogico
  let oreDeg;
  const secDeg = secondi * 6;
  const minDeg = minuti * 6 + secondi * 0.1;

  if (analogFormat === "24") {
    // 24h: giro completo in 24 ore, 0° in alto (mezzanotte)
    oreDeg = ((oreRaw * 60 + minuti) / (24 * 60)) * 360;
  } else {
    oreDeg = (oreRaw % 12) * 30 + minuti * 0.5;
  }

  rotateLancetta("hour-hand", oreDeg);
  rotateLancetta("minute-hand", minDeg);
  rotateLancetta("second-hand", secDeg);

  dateAnalogEl.textContent = dataStr;

  if (analogPeriodLabel) {
    analogPeriodLabel.textContent =
      analogFormat === "12" ? (oreRaw >= 12 ? "PM" : "AM") : "";
  }
}

// Cambia formato della modalità digitale
window.setDigitalFmt = function (format) {
  digitalFormat = format;

  const btn12 = document.getElementById("digital-fmt-12");
  const btn24 = document.getElementById("digital-fmt-24");
  if (btn12) btn12.classList.toggle("active", format === "12");
  if (btn24) btn24.classList.toggle("active", format === "24");

  updateClock();
};

// Cambia formato della modalità analogica
window.setAnalogFmt = function (format) {
  analogFormat = format;

  const btn12 = document.getElementById("analog-fmt-12");
  const btn24 = document.getElementById("analog-fmt-24");
  if (btn12) btn12.classList.toggle("active", format === "12");
  if (btn24) btn24.classList.toggle("active", format === "24");

  buildAnalogTicks();
  updateClock();
};

// Cambia modalità principale
buttons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    currentMode = btn.dataset.format;

    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    if (currentMode === "analog") {
      digitalDisp.style.display = "none";
      analogDisp.style.display = "flex";
      buildAnalogTicks();
    } else {
      digitalDisp.style.display = "block";
      analogDisp.style.display = "none";
    }

    updateClock();
  });
});

// Avvio
buildAnalogTicks();
updateClock();
setInterval(updateClock, 1000);

// Previeni pull-to-refresh su mobile
let startY = 0;
document.addEventListener(
  "touchstart",
  (e) => {
    startY = e.touches[0].pageY;
  },
  { passive: false },
);
document.addEventListener(
  "touchmove",
  (e) => {
    const y = e.touches[0].pageY;
    if (window.scrollY === 0 && y > startY) e.preventDefault();
  },
  { passive: false },
);