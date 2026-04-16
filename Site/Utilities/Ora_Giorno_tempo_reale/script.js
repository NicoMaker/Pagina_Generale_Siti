const giorni = [
  "domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato",
];
const mesi = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];

const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const periodEl = document.getElementById("period");
const dateAnalogEl = document.getElementById("date-analog");
const analogPeriodLabel = document.getElementById("analog-period-label");
const digitalDisp = document.getElementById("digital-display");
const analogDisp = document.getElementById("analog-display");
const buttons = document.querySelectorAll(".btn");

// --- Carica preferenze da localStorage ---
let currentMode   = localStorage.getItem("clock_mode")          || "digital";
let digitalFormat = localStorage.getItem("clock_digitalFormat") || "24";
let analogFormat  = localStorage.getItem("clock_analogFormat")  || "24";

function savePrefs() {
  localStorage.setItem("clock_mode",          currentMode);
  localStorage.setItem("clock_digitalFormat", digitalFormat);
  localStorage.setItem("clock_analogFormat",  analogFormat);
}

function pad(num) {
  return String(num).padStart(2, "0");
}

function rotateLancetta(id, deg) {
  const el = document.getElementById(id);
  if (el) el.setAttribute("transform", `rotate(${deg} 100 100)`);
}

function buildAnalogTicks() {
  const ticksGroup = document.getElementById("ticks");
  ticksGroup.innerHTML = "";

  const is24h = analogFormat === "24";
  const totalHours = is24h ? 24 : 12;
  const labelRadius = is24h ? 64 : 72;

  // Tacche minuti
  for (let i = 0; i < 60; i++) {
    const rad = ((i / 60) * 360 - 90) * (Math.PI / 180);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", 100 + 90 * Math.cos(rad));
    line.setAttribute("y1", 100 + 90 * Math.sin(rad));
    line.setAttribute("x2", 100 + 96 * Math.cos(rad));
    line.setAttribute("y2", 100 + 96 * Math.sin(rad));
    line.setAttribute("stroke", "#ccc");
    line.setAttribute("stroke-width", "1");
    line.setAttribute("stroke-linecap", "round");
    ticksGroup.appendChild(line);
  }

  // Tacche ore + numeri
  for (let h = 0; h < totalHours; h++) {
    const rad = ((h / totalHours) * 360 - 90) * (Math.PI / 180);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", 100 + 80 * Math.cos(rad));
    line.setAttribute("y1", 100 + 80 * Math.sin(rad));
    line.setAttribute("x2", 100 + 96 * Math.cos(rad));
    line.setAttribute("y2", 100 + 96 * Math.sin(rad));
    line.setAttribute("stroke", "#667eea");
    line.setAttribute("stroke-width", "2.5");
    line.setAttribute("stroke-linecap", "round");
    ticksGroup.appendChild(line);

    const label = is24h ? String(h).padStart(2, "0") : (h === 0 ? 12 : h);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", 100 + labelRadius * Math.cos(rad));
    text.setAttribute("y", 100 + labelRadius * Math.sin(rad));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.setAttribute("font-size", is24h ? "6.5" : "10");
    text.setAttribute("font-weight", "600");
    text.setAttribute("fill", is24h ? "#555" : "#667eea");
    text.setAttribute("font-family", "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif");
    text.textContent = label;
    ticksGroup.appendChild(text);
  }
}

function updateClock() {
  const now = new Date();
  const dataStr = `${giorni[now.getDay()]} ${pad(now.getDate())} ${mesi[now.getMonth()]} ${now.getFullYear()}`;
  const oreRaw = now.getHours();
  const minuti = now.getMinutes();
  const secondi = now.getSeconds();

  let orario = "", ampm = "";
  if (digitalFormat === "24") {
    orario = `${pad(oreRaw)}:${pad(minuti)}:${pad(secondi)}`;
  } else {
    ampm = oreRaw >= 12 ? "PM" : "AM";
    orario = `${pad(oreRaw % 12 || 12)}:${pad(minuti)}:${pad(secondi)}`;
  }

  timeEl.textContent = orario;
  periodEl.textContent = ampm;
  dateEl.textContent = dataStr;

  const secDeg = secondi * 6;
  const minDeg = minuti * 6 + secondi * 0.1;
  const oreDeg = analogFormat === "24"
    ? ((oreRaw * 60 + minuti) / (24 * 60)) * 360
    : (oreRaw % 12) * 30 + minuti * 0.5;

  rotateLancetta("hour-hand", oreDeg);
  rotateLancetta("minute-hand", minDeg);
  rotateLancetta("second-hand", secDeg);

  dateAnalogEl.textContent = dataStr;
  if (analogPeriodLabel) {
    analogPeriodLabel.textContent = analogFormat === "12" ? (oreRaw >= 12 ? "PM" : "AM") : "";
  }
}

function applyMode() {
  if (currentMode === "analog") {
    digitalDisp.style.display = "none";
    analogDisp.style.display = "flex";
    buildAnalogTicks();
  } else {
    digitalDisp.style.display = "block";
    analogDisp.style.display = "none";
  }

  buttons.forEach((b) => b.classList.toggle("active", b.dataset.format === currentMode));

  document.getElementById("digital-fmt-12").classList.toggle("active", digitalFormat === "12");
  document.getElementById("digital-fmt-24").classList.toggle("active", digitalFormat === "24");
  document.getElementById("analog-fmt-12").classList.toggle("active", analogFormat === "12");
  document.getElementById("analog-fmt-24").classList.toggle("active", analogFormat === "24");
}

window.setDigitalFmt = function (format) {
  digitalFormat = format;
  savePrefs();
  document.getElementById("digital-fmt-12").classList.toggle("active", format === "12");
  document.getElementById("digital-fmt-24").classList.toggle("active", format === "24");
  updateClock();
};

window.setAnalogFmt = function (format) {
  analogFormat = format;
  savePrefs();
  document.getElementById("analog-fmt-12").classList.toggle("active", format === "12");
  document.getElementById("analog-fmt-24").classList.toggle("active", format === "24");
  buildAnalogTicks();
  updateClock();
};

buttons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    currentMode = btn.dataset.format;
    savePrefs();
    applyMode();
    updateClock();
  });
});

// Avvio
applyMode();
updateClock();
setInterval(updateClock, 1000);

// Previeni pull-to-refresh su mobile
let startY = 0;
document.addEventListener("touchstart", (e) => { startY = e.touches[0].pageY; }, { passive: false });
document.addEventListener("touchmove", (e) => {
  if (window.scrollY === 0 && e.touches[0].pageY > startY) e.preventDefault();
}, { passive: false });