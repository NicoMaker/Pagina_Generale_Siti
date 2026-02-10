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
const buttons = document.querySelectorAll(".btn");

let formato = "24";

// Event listener per i pulsanti
buttons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    formato = btn.dataset.format;
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    aggiornaClock();
  });
});

// Funzione per aggiungere lo zero
function pad(num) {
  return String(num).padStart(2, "0");
}

// Funzione principale per aggiornare l'orologio
function aggiornaClock() {
  const now = new Date();

  // Data
  const giorno = giorni[now.getDay()];
  const numeroGiorno = pad(now.getDate());
  const mese = mesi[now.getMonth()];
  const anno = now.getFullYear();

  // Ora
  let ore = now.getHours();
  const minuti = pad(now.getMinutes());
  const secondi = pad(now.getSeconds());

  let orario = "";
  let ampm = "";

  if (formato === "24") {
    orario = `${pad(ore)}:${minuti}:${secondi}`;
  } else {
    ampm = ore >= 12 ? "PM" : "AM";
    ore = ore % 12 || 12;
    orario = `${pad(ore)}:${minuti}:${secondi}`;
  }

  // Aggiorna il DOM
  timeEl.textContent = orario;
  periodEl.textContent = ampm;
  dateEl.textContent = `${giorno} ${numeroGiorno} ${mese} ${anno}`;
}

// Avvia l'orologio
aggiornaClock();
setInterval(aggiornaClock, 1000);

// Previeni il refresh accidentale su mobile
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
    if (window.scrollY === 0 && y > startY) {
      e.preventDefault();
    }
  },
  { passive: false },
);
