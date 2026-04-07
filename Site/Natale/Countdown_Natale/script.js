document.addEventListener("DOMContentLoaded", () => {
  // ── Date helpers ──────────────────────────────────────────
  const now = new Date();
  const month = now.getMonth(); // 0-based
  const day = now.getDate();
  const year = now.getFullYear();

  const isChristmas = month === 11 && day === 25;
  const isSantoStefano = month === 11 && day === 26;

  // Next Christmas target
  const nextXmasYear = month === 11 && day > 25 ? year + 1 : year;
  const christmasMs = new Date(`Dec 25, ${nextXmasYear} 00:00:00`).getTime();
  const stefanoMs = new Date(`Dec 26, ${nextXmasYear} 00:00:00`).getTime();

  // ── Year labels ───────────────────────────────────────────
  document.getElementById("year-label").textContent = year;
  document.getElementById("copy-year").textContent =
    `© ${year} Countdown di Natale. Tutti i diritti riservati.`;

  // ── Singular/plural ───────────────────────────────────────
  function label(n, sing, pl) {
    return n === 1 ? sing : pl;
  }

  function setUnits(prefix, d, h, m, s) {
    document.getElementById(prefix + "days").textContent = label(
      d,
      "Giorno",
      "Giorni",
    );
    document.getElementById(prefix + "hours").textContent = label(
      h,
      "Ora",
      "Ore",
    );
    document.getElementById(prefix + "minutes").textContent = label(
      m,
      "Minuto",
      "Minuti",
    );
    document.getElementById(prefix + "seconds").textContent = label(
      s,
      "Secondo",
      "Secondi",
    );
  }

  // ── Title / layout ────────────────────────────────────────
  const mainTitle = document.getElementById("main-title");
  const mainSubtitle = document.getElementById("main-subtitle");
  const celBlock = document.getElementById("celebration-block");
  const primaryCd = document.getElementById("primary-cd");
  const secondaryCd = document.getElementById("secondary-cd");
  const divider = document.getElementById("divider");
  const primaryLbl = document.getElementById("primary-label");
  const secondaryLbl = document.getElementById("secondary-label");
  const celTitle = document.getElementById("cel-title");
  const celText = document.getElementById("cel-text");

  if (isChristmas) {
    mainTitle.innerHTML = `<em>Buon Natale</em>`;
    mainSubtitle.textContent = "Oggi è il giorno più magico dell'anno 🎄";

    celBlock.style.display = "block";
    celTitle.textContent = "🎄 Buon Natale!";
    celText.textContent =
      "Che questo Natale porti gioia e felicità a te e alla tua famiglia!";

    primaryCd.style.display = "none";
    divider.style.display = "block";
    secondaryCd.style.display = "block";
    secondaryLbl.textContent = "🕊️ Mancano a Santo Stefano";

    celebrate();
  } else if (isSantoStefano) {
    mainTitle.innerHTML = `<em>Buon Santo <span class="accent-red">Stefano</span></em>`;
    mainSubtitle.textContent =
      "Oggi è Santo Stefano — il Natale è già passato 🕊️";

    celBlock.style.display = "block";
    celTitle.textContent = "🕊️ Buon Santo Stefano!";
    celText.textContent =
      "Che questa giornata di festa porti serenità e relax dopo il Natale!";

    primaryCd.style.display = "block";
    primaryLbl.textContent = "🎄 Mancano al prossimo Natale";
    secondaryCd.style.display = "none";

    celebrate();
  } else {
    mainTitle.innerHTML = `Countdown per <em>Natale</em>`;
    mainSubtitle.textContent = "La magia del Natale sta arrivando ✨";

    celBlock.style.display = "none";

    primaryCd.style.display = "block";
    primaryLbl.textContent = "🎄 Mancano al Natale";
    divider.style.display = "block";
    secondaryCd.style.display = "block";
    secondaryLbl.textContent = "🕊️ Mancano a Santo Stefano";
  }

  // ── Countdown tick ────────────────────────────────────────
  function fmt(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function decompose(ms) {
    const total = Math.max(0, ms);
    const d = Math.floor(total / 86400000);
    const h = Math.floor((total % 86400000) / 3600000);
    const m = Math.floor((total % 3600000) / 60000);
    const s = Math.floor((total % 60000) / 1000);
    return { d, h, m, s };
  }

  function renderCd(prefix, unitPrefix, { d, h, m, s }, tickSec) {
    document.getElementById(prefix + "days").textContent = fmt(d);
    document.getElementById(prefix + "hours").textContent = fmt(h);
    document.getElementById(prefix + "minutes").textContent = fmt(m);

    const secEl = document.getElementById(prefix + "seconds");
    if (tickSec) {
      secEl.classList.remove("num-tick");
      void secEl.offsetWidth; // reflow
      secEl.classList.add("num-tick");
    }
    secEl.textContent = fmt(s);

    setUnits(unitPrefix, d, h, m, s);
  }

  let prevPSec = -1,
    prevSSec = -1;

  function tick() {
    const nowMs = Date.now();

    // Primary countdown (Natale, except on Christmas)
    if (!isChristmas && primaryCd.style.display !== "none") {
      const v = decompose(christmasMs - nowMs);
      const changed = v.s !== prevPSec;
      prevPSec = v.s;
      renderCd("p-", "u-", v, changed);
    }

    // Secondary countdown
    if (secondaryCd.style.display !== "none") {
      const target = isChristmas
        ? stefanoMs
        : isSantoStefano
          ? christmasMs
          : stefanoMs;
      const v = decompose(target - nowMs);
      const changed = v.s !== prevSSec;
      prevSSec = v.s;
      renderCd("s-", "su-", v, changed);
    }
  }

  tick();
  setInterval(tick, 1000);

  // ── Theme toggle ──────────────────────────────────────────
  const themeBtn = document.getElementById("theme-btn");
  const applyTheme = (light) => {
    document.body.classList.toggle("light", light);
    themeBtn.textContent = light ? "🌙" : "☀️";
  };
  themeBtn.addEventListener("click", () => {
    const isLight = !document.body.classList.contains("light");
    applyTheme(isLight);
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
  if (localStorage.getItem("theme") === "light") applyTheme(true);

  // ── Celebrate button ──────────────────────────────────────
  document.getElementById("celebrate-btn").addEventListener("click", celebrate);

  // ── Submit wish ───────────────────────────────────────────
  document.getElementById("submit-wish").addEventListener("click", () => {
    const name = document.getElementById("wish-name");
    const text = document.getElementById("wish-text");
    if (!name.value.trim() || !text.value.trim()) {
      alert("Per favore, compila tutti i campi.");
      return;
    }
    const wall = document.getElementById("wishes-wall");
    const card = document.createElement("div");
    card.className = "w-card fade-in";
    card.innerHTML = `
      <p class="w-text">"${text.value.trim()}"</p>
      <p class="w-author">— ${name.value.trim()}</p>`;
    wall.insertBefore(card, wall.firstChild);
    name.value = "";
    text.value = "";
    card.scrollIntoView({ behavior: "smooth" });
  });

  // ── Snow ──────────────────────────────────────────────────
  function spawnFlake(container) {
    const f = document.createElement("div");
    f.className = "flake";
    const sz = Math.random() * 4 + 2;
    const dur = Math.random() * 12 + 10;
    const del = Math.random() * 12;
    f.style.cssText = `
      left:${Math.random() * 100}%;
      width:${sz}px; height:${sz}px;
      animation-duration:${dur}s;
      animation-delay:-${del}s;
    `;
    container.appendChild(f);
    setTimeout(() => {
      f.remove();
      spawnFlake(container);
    }, dur * 1000);
  }
  const snowEl = document.getElementById("snow");
  const flakeCount = Math.min(Math.floor(window.innerWidth / 12), 80);
  for (let i = 0; i < flakeCount; i++) spawnFlake(snowEl);

  // ── Tree lights ───────────────────────────────────────────
  const colors = [
    "#ff2222",
    "#00ee44",
    "#ffee00",
    "#2244ff",
    "#ff44ff",
    "#00ffff",
  ];
  const overlay = document.getElementById("lights-overlay");
  for (let i = 0; i < 22; i++) {
    const dot = document.createElement("div");
    dot.className = "dot";
    const c = colors[Math.floor(Math.random() * colors.length)];
    dot.style.cssText = `
      top:${8 + Math.random() * 82}%;
      left:${8 + Math.random() * 82}%;
      color:${c}; background:${c};
      animation-duration:${1 + Math.random() * 1.5}s;
      animation-delay:${Math.random() * 2}s;
    `;
    overlay.appendChild(dot);
  }

  // ── Celebrate effect ──────────────────────────────────────
  function celebrate() {
    for (let i = 0; i < 25; i++) spawnFlake(snowEl);
    document.querySelectorAll(".dot").forEach((d) => {
      d.style.animationDuration = "0.3s";
      setTimeout(() => (d.style.animationDuration = ""), 2500);
    });
  }
});
