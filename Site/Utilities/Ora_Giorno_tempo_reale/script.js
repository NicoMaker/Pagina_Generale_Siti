const giorni = ["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"];
const mesi   = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];

const timeEl            = document.getElementById("time");
const dateEl            = document.getElementById("date");
const periodEl          = document.getElementById("period");
const dateAnalogEl      = document.getElementById("date-analog");
const analogPeriodLabel = document.getElementById("analog-period-label");
const digitalDisp       = document.getElementById("digital-display");
const analogDisp        = document.getElementById("analog-display");
const buttons           = document.querySelectorAll(".btn");

// formato principale: "24" | "12" | "analog"
// subFmt: formato ore sull'analogico: "12" | "24"
let formato = "24";
let subFmt  = "12";

// ─── Helpers ─────────────────────────────────────────────────────────
function pad(num) {
  return String(num).padStart(2, "0");
}

function rotateLancetta(id, deg) {
  const el = document.getElementById(id);
  if (el) el.setAttribute("transform", `rotate(${deg} 100 100)`);
}

// ─── Costruisce tacche + numeri del quadrante ─────────────────────────
// is24: true = quadrante 24 ore, false = quadrante 12 ore
function buildTicks(is24) {
  const ticksGroup = document.getElementById("ticks");
  ticksGroup.innerHTML = "";

  const totalHours = is24 ? 24 : 12;
  const totalTicks = 60; // tacche dei minuti come base

  for (let i = 0; i < totalTicks; i++) {
    const isHour = i % (totalTicks / totalHours) === 0;
    const angle  = (i / totalTicks) * 360;
    const inner  = isHour ? 80 : 90;
    const outer  = 96;
    const rad    = (angle - 90) * (Math.PI / 180);
    const x1     = 100 + inner * Math.cos(rad);
    const y1     = 100 + inner * Math.sin(rad);
    const x2     = 100 + outer * Math.cos(rad);
    const y2     = 100 + outer * Math.sin(rad);

    // Linea tacca
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", isHour ? "#667eea" : "#ccc");
    line.setAttribute("stroke-width", isHour ? "2.5" : "1");
    line.setAttribute("stroke-linecap", "round");
    ticksGroup.appendChild(line);

    // Numero ora
    if (isHour) {
      // Indice numerico dell'ora in questo punto del quadrante
      const hourIndex = i / (totalTicks / totalHours);
      // 12h: 0 → 12, 1..11 → 1..11
      // 24h: 0 → 0, 1..23 → 1..23 (ma 0 lo scriviamo come "0" o "24"?)
      // Convenzione: 0 → 0 in 24h, 12 → 12
      const label = is24
        ? String(hourIndex).padStart(2, "0")   // 00, 01 … 23
        : (hourIndex === 0 ? 12 : hourIndex);   // 12, 1 … 11

      // Raggio testo: più piccolo in 24h per non sovrapporre
      const lr  = is24 ? 67 : 70;
      const tx  = 100 + lr * Math.cos(rad);
      const ty  = 100 + lr * Math.sin(rad);

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", tx);
      text.setAttribute("y", ty);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "central");
      text.setAttribute("font-size", is24 ? "8" : "11");
      text.setAttribute("font-weight", "600");
      text.setAttribute("fill", "#667eea");
      text.setAttribute("font-family", "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif");
      text.textContent = label;
      ticksGroup.appendChild(text);
    }
  }
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

  // ── Digitale ──────────────────────────────────────────────────────
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

  // ── Analogico ─────────────────────────────────────────────────────
  if (formato === "analog") {
    let oreDeg;
    const secDeg = secondi * 6;
    const minDeg = minuti * 6 + secondi * 0.1;

    if (subFmt === "24") {
      // Quadrante 24h: lancetta ore compie un giro completo in 24 ore
      // Mezzanotte in cima (0°), mezzogiorno in basso (180°)
      oreDeg = (oreRaw / 24) * 360 + (minuti / 24) * 0.5;
    } else {
      // Quadrante 12h classico
      oreDeg = (oreRaw % 12) * 30 + minuti * 0.5;
    }

    rotateLancetta("hour-hand",   oreDeg);
    rotateLancetta("minute-hand", minDeg);
    rotateLancetta("second-hand", secDeg);

    dateAnalogEl.textContent = dataStr;

    // Label AM/PM (solo in 12h, vuota in 24h)
    if (analogPeriodLabel) {
      analogPeriodLabel.textContent = (subFmt === "12")
        ? (oreRaw >= 12 ? "PM" : "AM")
        : "";
    }
  }
}

// ─── Switch modalità principale (24 / 12 / analog) ───────────────────
buttons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    formato = btn.dataset.format;

    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    if (formato === "analog") {
      digitalDisp.style.display = "none";
      analogDisp.style.display  = "flex";
      // Costruisce subito il quadrante corretto
      buildTicks(subFmt === "24");
    } else {
      digitalDisp.style.display = "block";
      analogDisp.style.display  = "none";
      periodEl.textContent      = "";
    }

    aggiornaClock();
  });
});

// ─── Switch sotto-formato analogico (12h / 24h) ──────────────────────
function setSubFmt(sf) {
  subFmt = sf;

  document.getElementById("sub12").classList.toggle("active", sf === "12");
  document.getElementById("sub24").classList.toggle("active", sf === "24");

  buildTicks(sf === "24");
  aggiornaClock();
}

// ─── Avvio ────────────────────────────────────────────────────────────
buildTicks(false); // quadrante 12h di default
aggiornaClock();
setInterval(aggiornaClock, 1000);

// ─── Previeni pull-to-refresh su mobile ──────────────────────────────
let startY = 0;
document.addEventListener("touchstart", (e) => { startY = e.touches[0].pageY; }, { passive: false });
document.addEventListener("touchmove", (e) => {
  const y = e.touches[0].pageY;
  if (window.scrollY === 0 && y > startY) e.preventDefault();
}, { passive: false });