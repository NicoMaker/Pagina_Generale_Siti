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

const dateEl = document.getElementById("date");
const timeEl = document.getElementById("time");
const buttons = document.querySelectorAll(".format-buttons button");

let currentFormat = "24";

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFormat = btn.dataset.format;
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    updateClock();
  });
});

// 24h attivo di default
if (buttons[0]) {
  buttons[0].classList.add("active");
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function updateClock() {
  const now = new Date();

  const dayName = giorni[now.getDay()];
  const dayNumber = pad2(now.getDate());
  const monthName = mesi[now.getMonth()];
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = pad2(now.getMinutes());
  const seconds = pad2(now.getSeconds());

  let ampm = "";
  let hoursForDisplay = hours;

  if (currentFormat === "12") {
    ampm = hours >= 12 ? "PM" : "AM";
    hoursForDisplay = hours % 12;
    if (hoursForDisplay === 0) hoursForDisplay = 12;
  }

  let timeString = "";

  if (currentFormat === "24") {
    timeString = `${pad2(hours)}:${minutes}:${seconds}`;
  } else {
    timeString = `${pad2(hoursForDisplay)}:${minutes}:${seconds} ${ampm}`;
  }

  dateEl.textContent = `${dayName} ${dayNumber} ${monthName} ${year}`;
  timeEl.textContent = timeString;
}

updateClock();
setInterval(updateClock, 1000);
