/**
 * Buona Pasqua — script.js
 *
 * Logica dei 4 scenari:
 *
 * CASO 1 — Giorno di PASQUA
 *   Sezione Pasqua   → "Buona Pasqua!" (nessun countdown)
 *   Sezione Pasquetta → countdown verso Pasquetta (= domani, ~1 giorno)
 *
 * CASO 2 — Giorno di PASQUETTA (Lunedì dell'Angelo)
 *   Sezione Pasqua   → "La Pasqua è passata!" (nessun countdown)
 *   Sezione Pasquetta → "Buon Lunedì dell'Angelo!" (nessun countdown)
 *
 * CASO 3 — DOPO Pasquetta (stesso anno → anno prossimo)
 *   Sezione Pasqua   → countdown verso Pasqua ANNO PROSSIMO
 *   Sezione Pasquetta → countdown verso Pasquetta ANNO PROSSIMO
 *
 * CASO 4 — PRIMA di Pasqua (normale)
 *   Sezione Pasqua   → countdown verso Pasqua di quest'anno
 *   Sezione Pasquetta → countdown verso Pasquetta di quest'anno
 */

// ── Algoritmo di Gauss per il calcolo della data di Pasqua ──────────────────
function calculateEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day   = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// Confronta solo anno/mese/giorno (ignora l'ora)
function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth()    === d2.getMonth()    &&
    d1.getDate()     === d2.getDate()
  );
}

// Formatta a due cifre
function fmt(n) {
  return n < 10 ? "0" + n : String(n);
}

// ── Avvia un countdown verso una data target ─────────────────────────────────
// Quando arriva a zero mostra il messaggio di celebrazione e nasconde il countdown
function startCountdown(targetDate, ids, celebrationId, countdownContainerId) {
  const { daysId, hoursId, minutesId, secondsId } = ids;

  function tick() {
    const distance = targetDate.getTime() - Date.now();

    if (distance <= 0) {
      // Azzeramento
      document.getElementById(daysId).textContent    = "00";
      document.getElementById(hoursId).textContent   = "00";
      document.getElementById(minutesId).textContent = "00";
      document.getElementById(secondsId).textContent = "00";

      if (countdownContainerId) {
        document.getElementById(countdownContainerId).style.display = "none";
      }
      if (celebrationId) {
        document.getElementById(celebrationId).style.display = "block";
        document.getElementById(celebrationId).classList.add("fade-in");
      }
      return; // stop
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById(daysId).textContent    = fmt(d);
    document.getElementById(hoursId).textContent   = fmt(h);
    document.getElementById(minutesId).textContent = fmt(m);

    const secEl = document.getElementById(secondsId);
    secEl.textContent = fmt(s);

    // Pulse sull'elemento secondi
    const box = secEl.parentElement;
    box.classList.add("pulse");
    setTimeout(() => box.classList.remove("pulse"), 900);

    setTimeout(tick, 1000);
  }

  tick();
}

// ── Mostra un messaggio di celebrazione ─────────────────────────────────────
function showCelebration(sectionId, titleId, textId, titleText, bodyText, titleCssClass) {
  const section = document.getElementById(sectionId);
  const title   = document.getElementById(titleId);
  const text    = document.getElementById(textId);

  section.style.display = "block";
  section.classList.add("fade-in");

  title.textContent = titleText;
  if (titleCssClass) title.classList.add(titleCssClass);
  if (text && bodyText) text.textContent = bodyText;
}

// ── Crea e anima le uova galleggianti ───────────────────────────────────────
function spawnEgg(container) {
  const egg    = document.createElement("div");
  egg.className = "easter-egg";
  const colors  = ["var(--egg-1)", "var(--egg-2)", "var(--egg-3)", "var(--egg-4)", "var(--egg-5)"];
  const dur     = Math.random() * 10 + 15;
  const delay   = Math.random() * 10;
  egg.style.cssText = [
    "left:" + (Math.random() * 100) + "%",
    "background-color:" + colors[Math.floor(Math.random() * colors.length)],
    "animation-duration:" + dur + "s",
    "animation-delay:-" + delay + "s",
  ].join(";");
  container.appendChild(egg);
  setTimeout(() => { egg.remove(); spawnEgg(container); }, dur * 1000);
}

function createEasterEggs() {
  const container = document.getElementById("egg-container");
  for (let i = 0; i < 15; i++) spawnEgg(container);
}

// ── Celebrazione extra (bottone Festeggia) ───────────────────────────────────
function triggerCelebration() {
  document.body.classList.add("celebrating");
  const container = document.getElementById("egg-container");
  for (let i = 0; i < 20; i++) spawnEgg(container);
  setTimeout(() => document.body.classList.remove("celebrating"), 10000);
}

// ── Entry point ──────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

  // Anno corrente nel footer
  document.getElementById("current-year").textContent = new Date().getFullYear();

  // Tema chiaro / scuro
  const themeToggle = document.getElementById("theme-toggle");
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
  }
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", document.body.classList.contains("dark-theme") ? "dark" : "light");
  });

  // Uova galleggianti
  createEasterEggs();

  // ── Calcolo date ────────────────────────────────────────────────────────────
  const now   = new Date();
  // "Oggi" senza ora (mezzanotte locale)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const thisYear        = now.getFullYear();
  const nextYear        = thisYear + 1;

  const easterThis      = calculateEasterDate(thisYear);
  const pasquettaThis   = new Date(easterThis);
  pasquettaThis.setDate(pasquettaThis.getDate() + 1);

  const easterNext      = calculateEasterDate(nextYear);
  const pasquettaNext   = new Date(easterNext);
  pasquettaNext.setDate(pasquettaNext.getDate() + 1);

  // Giorno dopo Pasquetta = inizio del periodo "dopo le feste"
  const afterPasquetta  = new Date(pasquettaThis);
  afterPasquetta.setDate(afterPasquetta.getDate() + 1);

  const localeOpts = { weekday: "long", year: "numeric", month: "long", day: "numeric" };

  const isEasterDay    = isSameDay(today, easterThis);
  const isPasquettaDay = isSameDay(today, pasquettaThis);
  // "Dopo": siamo già nel giorno successivo a Pasquetta (o oltre)
  const isAfter        = today >= afterPasquetta;

  // ID comuni
  const easterIds    = { daysId: "days",          hoursId: "hours",          minutesId: "minutes",          secondsId: "seconds"          };
  const pasquettaIds = { daysId: "pasquetta-days", hoursId: "pasquetta-hours", minutesId: "pasquetta-minutes", secondsId: "pasquetta-seconds" };

  // ── CASO 1: Giorno di PASQUA ─────────────────────────────────────────────
  if (isEasterDay) {
    // Titolo header
    document.getElementById("main-title").textContent    = "Buona Pasqua! 🐣";
    document.getElementById("main-subtitle").textContent = "Che la gioia di questo giorno illumini il tuo cuore";

    // Sezione Pasqua → celebrazione, nessun countdown
    document.getElementById("easter-section-title").textContent = "È Pasqua!";
    document.getElementById("easter-date").textContent =
      easterThis.toLocaleDateString("it-IT", localeOpts);
    document.getElementById("countdown-container").style.display = "none";
    showCelebration(
      "celebration-message", "celebration-title", "celebration-text",
      "Buona Pasqua! 🐣",
      "Che questa giornata porti gioia, pace e serenità a te e alla tua famiglia.",
      "happy-easter"
    );

    // Sezione Pasquetta → countdown verso domani
    document.getElementById("pasquetta-section-title").textContent = "Manca alla Pasquetta";
    document.getElementById("pasquetta-date").textContent =
      pasquettaThis.toLocaleDateString("it-IT", localeOpts);
    document.getElementById("pasquetta-countdown-container").style.display = "flex";
    document.getElementById("pasquetta-celebration-message").style.display = "none";
    startCountdown(pasquettaThis, pasquettaIds, "pasquetta-celebration-message", "pasquetta-countdown-container");

    document.body.classList.add("celebrating");
  }

  // ── CASO 2: Giorno di PASQUETTA ──────────────────────────────────────────
  else if (isPasquettaDay) {
    // Titolo header
    document.getElementById("main-title").textContent    = "Buon Lunedì dell'Angelo! 🌿";
    document.getElementById("main-subtitle").textContent = "Un giorno di allegria, picnic e spensieratezza";

    // Sezione Pasqua → "La Pasqua è passata!", nessun countdown
    document.getElementById("easter-section-title").textContent = "Pasqua";
    document.getElementById("easter-date").textContent =
      easterThis.toLocaleDateString("it-IT", localeOpts);
    document.getElementById("countdown-container").style.display = "none";
    showCelebration(
      "celebration-message", "celebration-title", "celebration-text",
      "La Pasqua è passata! 🌸",
      "Speriamo tu abbia trascorso una bellissima Pasqua in famiglia.",
      "pasqua-passata"
    );

    // Sezione Pasquetta → "Buon Lunedì dell'Angelo!", nessun countdown
    document.getElementById("pasquetta-main-title").textContent = "Buon Lunedì dell'Angelo! 🌿";
    document.getElementById("pasquetta-section-title").textContent = "È Pasquetta!";
    document.getElementById("pasquetta-date").textContent =
      pasquettaThis.toLocaleDateString("it-IT", localeOpts);
    document.getElementById("pasquetta-countdown-container").style.display = "none";
    showCelebration(
      "pasquetta-celebration-message", "pasquetta-celebration-title", "pasquetta-celebration-text",
      "Buon Lunedì dell'Angelo! 🌿",
      "Oggi è il giorno perfetto per un picnic all'aperto con amici e familiari!",
      "buona-pasquetta"
    );

    document.body.classList.add("celebrating");
  }

  // ── CASO 3: DOPO Pasquetta → countdown anno prossimo ─────────────────────
  else if (isAfter) {
    // Titolo header
    document.getElementById("main-title").textContent    = "Buona Pasqua";
    document.getElementById("main-subtitle").textContent = "Aspettando la prossima Pasqua...";

    // Sezione Pasqua → countdown Pasqua anno prossimo
    document.getElementById("easter-section-title").textContent = "Manca alla Pasqua " + nextYear;
    document.getElementById("easter-date").textContent =
      easterNext.toLocaleDateString("it-IT", localeOpts);
    document.getElementById("celebration-message").style.display = "none";
    document.getElementById("countdown-container").style.display = "flex";
    startCountdown(easterNext, easterIds, "celebration-message", "countdown-container");

    // Sezione Pasquetta → countdown Pasquetta anno prossimo
    document.getElementById("pasquetta-section-title").textContent = "Manca alla Pasquetta " + nextYear;
    document.getElementById("pasquetta-date").textContent =
      pasquettaNext.toLocaleDateString("it-IT", localeOpts);
    document.getElementById("pasquetta-celebration-message").style.display = "none";
    document.getElementById("pasquetta-countdown-container").style.display = "flex";
    startCountdown(pasquettaNext, pasquettaIds, "pasquetta-celebration-message", "pasquetta-countdown-container");
  }

  // ── CASO 4: PRIMA di Pasqua → countdown normale ───────────────────────────
  else {
    // Sezione Pasqua
    document.getElementById("easter-section-title").textContent = "Manca alla Pasqua";
    document.getElementById("easter-date").textContent =
      easterThis.toLocaleDateString("it-IT", localeOpts);
    document.getElementById("celebration-message").style.display = "none";
    document.getElementById("countdown-container").style.display = "flex";
    startCountdown(easterThis, easterIds, "celebration-message", "countdown-container");

    // Sezione Pasquetta
    document.getElementById("pasquetta-section-title").textContent = "Manca alla Pasquetta";
    document.getElementById("pasquetta-date").textContent =
      pasquettaThis.toLocaleDateString("it-IT", localeOpts);
    document.getElementById("pasquetta-celebration-message").style.display = "none";
    document.getElementById("pasquetta-countdown-container").style.display = "flex";
    startCountdown(pasquettaThis, pasquettaIds, "pasquetta-celebration-message", "pasquetta-countdown-container");
  }

  // ── Bottoni Festeggia ────────────────────────────────────────────────────
  document.getElementById("celebrate-btn")?.addEventListener("click", triggerCelebration);
  document.getElementById("pasquetta-celebrate-btn")?.addEventListener("click", triggerCelebration);
});