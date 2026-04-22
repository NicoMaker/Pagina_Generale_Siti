(function () {
  /* ── State ─────────────────────────────────── */
  let currentQuestion = 0;
  const answers = { q1: null, q2: null, q3: null, q4: null };
  const questions = ["q1", "q2", "q3", "q4"];
  let chronotype = null;

  /* ── DOM refs ───────────────────────────────── */
  const questionSection = document.getElementById("questionSection");
  const resultsSection = document.getElementById("resultsSection");
  const progressFill = document.getElementById("progressFill");
  const questionCounter = document.getElementById("questionCounter");
  const resetBtn = document.getElementById("resetBtn");

  /* ── Live clock hands ───────────────────────── */
  function tickClock() {
    const now = new Date();
    const h = now.getHours() % 12;
    const m = now.getMinutes();
    const s = now.getSeconds();
    const minDeg = (m + s / 60) * 6;
    const hourDeg = (h + m / 60) * 30;
    const hHand = document.getElementById("hourHand");
    const mHand = document.getElementById("minuteHand");
    if (hHand) hHand.style.transform = `rotate(${hourDeg}deg)`;
    if (mHand) mHand.style.transform = `rotate(${minDeg}deg)`;
  }
  tickClock();
  setInterval(tickClock, 1000);
  // Remove CSS animation since we drive manually
  document
    .querySelectorAll(".hand")
    .forEach((el) => (el.style.animation = "none"));

  /* ── Step indicators ────────────────────────── */
  function updateSteps(idx) {
    document.querySelectorAll(".q-step").forEach((el, i) => {
      el.classList.toggle("active", i === idx);
      el.classList.toggle("done", i < idx);
    });
  }

  /* ── Show question ──────────────────────────── */
  function showQuestion(idx) {
    questions.forEach((q) => {
      const el = document.getElementById(q);
      if (el) el.classList.add("hidden");
    });
    const curr = document.getElementById(questions[idx]);
    if (curr) {
      curr.classList.remove("hidden");
      // Re-trigger animation
      curr.style.animation = "none";
      void curr.offsetWidth;
      curr.style.animation = "";
    }
    const pct = ((idx + 1) / questions.length) * 100;
    progressFill.style.width = `${pct}%`;
    const num = String(idx + 1).padStart(2, "0");
    questionCounter.textContent = `${num} / 0${questions.length}`;
    updateSteps(idx);
  }

  /* ── Calculate chronotype ───────────────────── */
  function calculateChronotype() {
    const map = { early: 1, neutral: 2, late: 3 };
    const score = Object.values(answers).reduce((s, v) => s + (map[v] || 0), 0);
    if (score <= 6) return "early";
    if (score <= 9) return "neutral";
    return "late";
  }

  /* ── Generate energy chart ──────────────────── */
  function generateTimeline(chrono) {
    const timeline = document.getElementById("timeline");
    const hours = [
      "06",
      "08",
      "10",
      "12",
      "14",
      "16",
      "18",
      "20",
      "22",
      "00",
      "02",
    ];
    const labels = [
      "6h",
      "8h",
      "10h",
      "12h",
      "14h",
      "16h",
      "18h",
      "20h",
      "22h",
      "0h",
      "2h",
    ];

    const energyMap = {
      early: [
        "medium",
        "high",
        "peak",
        "high",
        "medium",
        "medium",
        "low",
        "low",
        "low",
        "low",
        "low",
      ],
      neutral: [
        "low",
        "medium",
        "high",
        "peak",
        "high",
        "medium",
        "medium",
        "low",
        "low",
        "low",
        "low",
      ],
      late: [
        "low",
        "low",
        "low",
        "medium",
        "medium",
        "high",
        "peak",
        "high",
        "medium",
        "low",
        "low",
      ],
    };
    const levels = energyMap[chrono];

    timeline.innerHTML = levels
      .map(
        (lvl, i) => `
      <div class="time-block ${lvl}" title="${labels[i]} — ${lvl}">
        <div class="bar"></div>
        <span class="time-label">${labels[i]}</span>
      </div>
    `,
      )
      .join("");
  }

  /* ── Update result content ──────────────────── */
  function updateAdvice(chrono) {
    const iconEl = document.getElementById("chronoIcon");
    const nameEl = document.getElementById("chronoName");

    const profiles = {
      early: { icon: "🌅", name: "Allodola Mattutina" },
      neutral: { icon: "🐦", name: "Normotipo — Colomba" },
      late: { icon: "🦉", name: "Gufo Notturno" },
    };
    const p = profiles[chrono];
    iconEl.textContent = p.icon;
    nameEl.textContent = p.name;

    const data = {
      early: {
        sleep: "21:30 → 05:30",
        sleepDetail: "8 ore · alba naturale",
        creative: "09:00 – 11:00",
        sport: "10:30 – 12:00",
        meals: "07:30 / 12:30 / 19:00",
        relax: "20:30",
        caffeine: "Ultimo caffè entro le 14:00",
      },
      neutral: {
        sleep: "22:30 → 06:30",
        sleepDetail: "8 ore · ritmo standard",
        creative: "10:00 – 12:00",
        sport: "15:00 – 17:00",
        meals: "08:30 / 13:00 / 20:00",
        relax: "21:30",
        caffeine: "Ultimo caffè entro le 15:30",
      },
      late: {
        sleep: "00:30 → 08:30",
        sleepDetail: "8 ore · recupero profondo",
        creative: "16:00 – 18:00",
        sport: "18:00 – 20:00",
        meals: "10:00 / 14:00 / 21:30",
        relax: "23:30",
        caffeine: "Ultimo caffè entro le 17:00",
      },
    };
    const d = data[chrono];
    document.getElementById("sleepWindow").textContent = d.sleep;
    document.getElementById("sleepDetail").textContent = d.sleepDetail;
    document.getElementById("creativePeak").textContent = d.creative;
    document.getElementById("sportPeak").textContent = d.sport;
    document.getElementById("mealTimes").textContent = d.meals;
    document.getElementById("relaxTime").textContent = d.relax;
    document.getElementById("caffeineAdvice").textContent = d.caffeine;

    generateTimeline(chrono);
  }

  /* ── Handle answer ──────────────────────────── */
  function handleAnswer(questionId, value) {
    answers[questionId] = value;

    // Animate selected button
    const btn = document.querySelector(
      `#${questionId} .opt-btn[data-value="${value}"]`,
    );
    if (btn) {
      btn.style.background = "rgba(232,201,106,.18)";
      btn.style.borderColor = "rgba(232,201,106,.7)";
    }

    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        currentQuestion++;
        showQuestion(currentQuestion);
      } else {
        chronotype = calculateChronotype();
        updateAdvice(chronotype);
        questionSection.classList.add("hidden");
        resultsSection.classList.remove("hidden");
      }
    }, 220);
  }

  /* ── Reset ──────────────────────────────────── */
  function resetTest() {
    currentQuestion = 0;
    Object.keys(answers).forEach((k) => (answers[k] = null));
    chronotype = null;

    resultsSection.classList.add("hidden");
    questionSection.classList.remove("hidden");
    showQuestion(0);
    progressFill.style.width = "25%";
    questionCounter.textContent = "01 / 04";
  }

  /* ── Bind events ─────────────────────────────── */
  questions.forEach((qId) => {
    document.querySelectorAll(`#${qId} .opt-btn`).forEach((btn) => {
      btn.addEventListener("click", () => handleAnswer(qId, btn.dataset.value));
    });
  });
  resetBtn.addEventListener("click", resetTest);

  /* ── Init ───────────────────────────────────── */
  showQuestion(0);
})();
