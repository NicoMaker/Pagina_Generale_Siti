/**
 * script.js — Buona Pasqua | Countdown Festivo (redesign)
 *
 * SCENARIO 1 — Giorno di PASQUA
 *   Sezione Pasqua   → "Buona Pasqua!" (nessun countdown)
 *   Sezione Pasquetta → countdown verso Pasquetta
 *
 * SCENARIO 2 — Giorno di PASQUETTA (Lunedì dell'Angelo)
 *   Sezione Pasqua   → countdown verso Pasqua ANNO PROSSIMO
 *   Sezione Pasquetta → "Buon Lunedì dell'Angelo!" (nessun countdown)
 *
 * SCENARIO 3 — DOPO Pasquetta
 *   Entrambe le sezioni → countdown anno prossimo
 *
 * SCENARIO 4 — PRIMA di Pasqua (normale)
 *   Entrambe le sezioni → countdown quest'anno
 *
 * ETICHETTE: singolare se il valore = 1, plurale altrimenti
 *   1 Giorno / 2 Giorni
 *   1 Ora    / 2 Ore
 *   1 Minuto / 2 Minuti
 *   1 Secondo/ 2 Secondi
 */

// ── Gauss Easter Algorithm ───────────────────────────────────────────────────
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
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function fmt(n) {
  return n < 10 ? "0" + n : String(n);
}

// ── Singolare / Plurale ──────────────────────────────────────────────────────
const LABELS = {
  days: { s: "Giorno", p: "Giorni" },
  hours: { s: "Ora", p: "Ore" },
  minutes: { s: "Minuto", p: "Minuti" },
  seconds: { s: "Secondo", p: "Secondi" },
};

function updateLabels(prefix, d, h, m, s) {
  const pre = prefix ? prefix + "-" : "";
  const set = (id, val, key) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val === 1 ? LABELS[key].s : LABELS[key].p;
  };
  set(`lbl-${pre}days`, d, "days");
  set(`lbl-${pre}hours`, h, "hours");
  set(`lbl-${pre}minutes`, m, "minutes");
  set(`lbl-${pre}seconds`, s, "seconds");
}

// ── Animazione flip numero ───────────────────────────────────────────────────
function flipValue(el, newVal) {
  const str = fmt(newVal);
  if (el.textContent === str) return;
  el.style.transform = "scale(0.85)";
  el.style.opacity = "0.4";
  requestAnimationFrame(() => {
    setTimeout(() => {
      el.textContent = str;
      el.style.transform = "scale(1)";
      el.style.opacity = "1";
    }, 80);
  });
}

// ── Avvia countdown ──────────────────────────────────────────────────────────
function startCountdown(
  targetDate,
  prefix,
  celebrationId,
  countdownContainerId,
) {
  const pre = prefix ? prefix + "-" : "";
  const elD = document.getElementById(`${pre}days`);
  const elH = document.getElementById(`${pre}hours`);
  const elM = document.getElementById(`${pre}minutes`);
  const elS = document.getElementById(`${pre}seconds`);

  function tick() {
    const distance = targetDate.getTime() - Date.now();

    if (distance <= 0) {
      [elD, elH, elM, elS].forEach((el) => {
        if (el) el.textContent = "00";
      });
      updateLabels(prefix, 0, 0, 0, 0);
      const container = document.getElementById(countdownContainerId);
      if (container) container.style.display = "none";
      const cel = document.getElementById(celebrationId);
      if (cel) {
        cel.style.display = "flex";
        cel.classList.add("fade-in");
      }
      return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    flipValue(elD, d);
    flipValue(elH, h);
    flipValue(elM, m);
    flipValue(elS, s);

    updateLabels(prefix, d, h, m, s);

    elD.style.transition = "transform 0.1s ease, opacity 0.1s ease";
    elH.style.transition = "transform 0.1s ease, opacity 0.1s ease";
    elM.style.transition = "transform 0.1s ease, opacity 0.1s ease";
    elS.style.transition = "transform 0.1s ease, opacity 0.1s ease";

    setTimeout(tick, 1000);
  }

  tick();
}

// ── Mostra celebrazione ──────────────────────────────────────────────────────
function showCelebration(celebId, titleId, textId, titleText, bodyText) {
  const cel = document.getElementById(celebId);
  const title = document.getElementById(titleId);
  const text = document.getElementById(textId);
  if (!cel) return;
  cel.style.display = "flex";
  cel.classList.add("fade-in");
  if (title) title.textContent = titleText;
  if (text && bodyText) text.textContent = bodyText;
}

// ── Confetti burst ───────────────────────────────────────────────────────────
function launchConfetti() {
  const colors = [
    "#f7739a",
    "#60b8f5",
    "#d4a843",
    "#c4f5c4",
    "#d8b5ff",
    "#ffda85",
  ];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement("div");
    el.className = "confetti-particle";
    el.style.cssText = [
      `left: ${Math.random() * 100}vw`,
      `top: ${Math.random() * -10}vh`,
      `background: ${colors[Math.floor(Math.random() * colors.length)]}`,
      `width: ${Math.random() * 8 + 6}px`,
      `height: ${Math.random() * 10 + 8}px`,
      `border-radius: ${Math.random() > 0.5 ? "50%" : "3px"}`,
      `animation-duration: ${Math.random() * 2 + 2.5}s`,
      `animation-delay: ${Math.random() * 1}s`,
    ].join(";");
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

// ── Particle canvas (uova / palline pasquali) ────────────────────────────────
function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);

  const COLORS = [
    "#ffc2d9",
    "#a5d8ff",
    "#c4f5c4",
    "#ffda85",
    "#d8b5ff",
    "#ffb6c1",
  ];

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : canvas.height + 30;
      this.r = Math.random() * 12 + 6;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.vy = -(Math.random() * 0.6 + 0.3);
      this.vx = (Math.random() - 0.5) * 0.4;
      this.alpha = Math.random() * 0.4 + 0.2;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.02;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      // Forma uovo
      ctx.beginPath();
      ctx.ellipse(0, 0, this.r * 0.7, this.r, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
    update() {
      this.y += this.vy;
      this.x += this.vx;
      this.angle += this.spin;
      if (this.y < -40) this.reset();
    }
  }

  const particles = Array.from({ length: 28 }, () => new Particle());

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(loop);
  }
  loop();
}

// ── Entry point ──────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Anno footer e badge
  document.getElementById("current-year").textContent =
    new Date().getFullYear();
  document.getElementById("hero-year").textContent = new Date().getFullYear();

  // Tema
  const themeBtn = document.getElementById("theme-toggle");
  if (localStorage.getItem("theme") === "dark")
    document.body.classList.add("dark-theme");
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark-theme") ? "dark" : "light",
    );
  });

  // Particelle
  initParticles();

  // ── Date ────────────────────────────────────────────────────────────────────
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisYear = now.getFullYear();
  const nextYear = thisYear + 1;

  const easterThis = calculateEasterDate(thisYear);
  const pasquettaThis = new Date(easterThis);
  pasquettaThis.setDate(pasquettaThis.getDate() + 1);

  const easterNext = calculateEasterDate(nextYear);
  const pasquettaNext = new Date(easterNext);
  pasquettaNext.setDate(pasquettaNext.getDate() + 1);

  const afterPasquetta = new Date(pasquettaThis);
  afterPasquetta.setDate(afterPasquetta.getDate() + 1);

  const localeOpts = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const isEasterDay = isSameDay(today, easterThis);
  const isPasquettaDay = isSameDay(today, pasquettaThis);
  const isAfter = today >= afterPasquetta;

  // Helper per mostrare/nascondere elementi
  const show = (id, display = "flex") => {
    const el = document.getElementById(id);
    if (el) el.style.display = display;
  };
  const hide = (id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  };
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SCENARIO 1 — PASQUA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isEasterDay) {
    setText("main-title", "Buona Pasqua! 🐣");
    setText(
      "main-subtitle",
      "Che la gioia di questo giorno illumini il tuo cuore",
    );

    // Pasqua: celebrazione
    setText("easter-section-title", "È Pasqua!");
    setText("easter-date", easterThis.toLocaleDateString("it-IT", localeOpts));
    hide("countdown-container");
    showCelebration(
      "celebration-message",
      "celebration-title",
      "celebration-text",
      "Buona Pasqua! 🐣",
      "Che questa giornata porti gioia, pace e serenità a te e alla tua famiglia.",
    );

    // Pasquetta: countdown
    setText("pasquetta-section-title", "Manca alla Pasquetta");
    setText(
      "pasquetta-date",
      pasquettaThis.toLocaleDateString("it-IT", localeOpts),
    );
    show("pasquetta-countdown-container");
    hide("pasquetta-celebration-message");
    startCountdown(
      pasquettaThis,
      "pasquetta",
      "pasquetta-celebration-message",
      "pasquetta-countdown-container",
    );

    launchConfetti();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SCENARIO 2 — PASQUETTA (Lunedì dell'Angelo)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  else if (isPasquettaDay) {
    setText("main-title", "Buona Pasquetta! 🌿");
    setText("main-subtitle", "Un giorno di allegria, picnic e spensieratezza");

    // Pasqua: countdown verso ANNO PROSSIMO
    setText("easter-section-title", "Manca alla Pasqua " + nextYear);
    setText("easter-date", easterNext.toLocaleDateString("it-IT", localeOpts));
    hide("celebration-message");
    show("countdown-container");
    startCountdown(
      easterNext,
      "",
      "celebration-message",
      "countdown-container",
    );

    // Pasquetta: celebrazione Lunedì dell'Angelo
    setText("pasquetta-section-title", "È Pasquetta!");
    setText(
      "pasquetta-date",
      pasquettaThis.toLocaleDateString("it-IT", localeOpts),
    );
    setText(
      "pasquetta-desc",
      "Il Lunedì dell'Angelo è tradizionalmente dedicato alle gite fuori porta e ai picnic all'aperto con amici e familiari.",
    );
    hide("pasquetta-countdown-container");
    showCelebration(
      "pasquetta-celebration-message",
      "pasquetta-celebration-title",
      "pasquetta-celebration-text",
      "Buon Lunedì dell'Angelo! 🌿",
      "Oggi è il giorno perfetto per un picnic all'aperto con amici e familiari!",
    );

    launchConfetti();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SCENARIO 3 — DOPO Pasquetta → anno prossimo
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  else if (isAfter) {
    setText("main-title", "🐰 Si attende la Pasqua " + nextYear);
    setText(
      "main-subtitle",
      "Mancano ancora tanti giorni… ma l'attesa fa parte della magia 🌸",
    );

    setText("easter-section-title", "Manca alla Pasqua " + nextYear);
    setText("easter-date", easterNext.toLocaleDateString("it-IT", localeOpts));
    hide("celebration-message");
    show("countdown-container");
    startCountdown(
      easterNext,
      "",
      "celebration-message",
      "countdown-container",
    );

    setText("pasquetta-section-title", "Manca alla Pasquetta " + nextYear);
    setText(
      "pasquetta-date",
      pasquettaNext.toLocaleDateString("it-IT", localeOpts),
    );
    hide("pasquetta-celebration-message");
    show("pasquetta-countdown-container");
    startCountdown(
      pasquettaNext,
      "pasquetta",
      "pasquetta-celebration-message",
      "pasquetta-countdown-container",
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SCENARIO 4 — PRIMA di Pasqua → quest'anno
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  else {
    setText("main-title", "🐣 Si attende la Pasqua " + thisYear);
    setText(
      "main-subtitle",
      "Il conto alla rovescia è iniziato… la primavera sta arrivando 🌷",
    );

    setText("easter-section-title", "Manca alla Pasqua");
    setText("easter-date", easterThis.toLocaleDateString("it-IT", localeOpts));
    hide("celebration-message");
    show("countdown-container");
    startCountdown(
      easterThis,
      "",
      "celebration-message",
      "countdown-container",
    );

    setText("pasquetta-section-title", "Manca alla Pasquetta");
    setText(
      "pasquetta-date",
      pasquettaThis.toLocaleDateString("it-IT", localeOpts),
    );
    hide("pasquetta-celebration-message");
    show("pasquetta-countdown-container");
    startCountdown(
      pasquettaThis,
      "pasquetta",
      "pasquetta-celebration-message",
      "pasquetta-countdown-container",
    );
  }

  // ── Bottoni festeggia ──────────────────────────────────────────────────────
  document
    .getElementById("celebrate-btn")
    ?.addEventListener("click", launchConfetti);
  document
    .getElementById("pasquetta-celebrate-btn")
    ?.addEventListener("click", launchConfetti);
});
