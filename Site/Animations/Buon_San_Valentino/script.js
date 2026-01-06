// ==================== VARIABILI GLOBALI ====================
const colors = [
  "#ff1744",
  "#f50057",
  "#ff4081",
  "#ff80ab",
  "#ff5252",
  "#e91e63",
  "#c2185b",
  "#ad1457",
  "#880e4f",
  "#f8bbd0",
];
let confettiInterval;

// ==================== INIZIALIZZAZIONE ====================
document.addEventListener("DOMContentLoaded", init);

function init() {
  createBalloons(window.innerWidth < 768 ? 15 : 25);
  createStars(window.innerWidth < 768 ? 40 : 60);
  startConfetti();
  setupEventListeners();
  createBalloonsInterval();
}

// ==================== CREA PALLONCINI CONTINUAMENTE ====================
function createBalloonsInterval() {
  const interval = window.innerWidth < 768 ? 5000 : 4000;
  const count = window.innerWidth < 768 ? 1 : 2;
  setInterval(() => {
    createBalloons(count);
  }, interval);
}

// ==================== CREA PALLONCINI ====================
function createBalloons(count) {
  for (let i = 0; i < count; i++) {
    const balloon = document.createElement("div");
    balloon.className = "balloon";
    balloon.style.background =
      colors[Math.floor(Math.random() * colors.length)];
    balloon.style.left = Math.random() * 100 + "%";
    balloon.style.top = Math.random() * 60 + 20 + "%";
    balloon.style.animationDelay = Math.random() * 4 + "s";
    balloon.style.animationDuration = Math.random() * 4 + 6 + "s";
    document.body.appendChild(balloon);

    setTimeout(() => {
      balloon.remove();
    }, 14000);
  }
}

// ==================== CREA STELLE ====================
function createStars(count) {
  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.animationDelay = Math.random() * 3 + "s";
    star.style.animationDuration = Math.random() * 2 + 2 + "s";
    document.body.appendChild(star);
  }
}

// ==================== CREA CORIANDOLI ====================
function createConfetti() {
  const confetti = document.createElement("div");
  confetti.className = "confetti";
  confetti.style.left = Math.random() * 100 + "%";
  confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
  confetti.style.animationDuration = Math.random() * 2 + 3 + "s";
  confetti.style.animationDelay = Math.random() * 1 + "s";
  confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
  document.body.appendChild(confetti);

  setTimeout(() => {
    confetti.remove();
  }, 5000);
}

// ==================== AVVIA CORIANDOLI ====================
function startConfetti() {
  const interval = window.innerWidth < 768 ? 300 : 200;
  confettiInterval = setInterval(createConfetti, interval);
}

// ==================== CREA FUOCHI D'ARTIFICIO ====================
function createFirework(x, y) {
  const particleCount = window.innerWidth < 768 ? 20 : 30;
  const color = colors[Math.floor(Math.random() * colors.length)];

  for (let i = 0; i < particleCount; i++) {
    const firework = document.createElement("div");
    firework.className = "firework";
    firework.style.background = color;
    firework.style.left = x + "px";
    firework.style.top = y + "px";

    const angle = (Math.PI * 2 * i) / particleCount;
    const velocity = Math.random() * (window.innerWidth < 768 ? 80 : 100) + 50;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;

    firework.style.setProperty("--tx", tx + "px");
    firework.style.setProperty("--ty", ty + "px");

    document.body.appendChild(firework);

    setTimeout(() => {
      firework.remove();
    }, 2000);
  }
}

// ==================== EXPLOSION CORIANDOLI ====================
function confettiExplosion(x, y) {
  const count = window.innerWidth < 768 ? 20 : 30;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = x + "px";
      confetti.style.top = y + "px";
      confetti.style.background =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = Math.random() * 1 + 2 + "s";
      confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
      document.body.appendChild(confetti);

      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }, i * 20);
  }
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  const heart = document.getElementById("heartSvg");

  heart.addEventListener("click", (e) => {
    const rect = heart.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    createFirework(x, y);
    confettiExplosion(x, y);
  });

  heart.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const rect = heart.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    createFirework(x, y);
    confettiExplosion(x, y);
  });

  document.addEventListener("click", (e) => {
    if (!heart.contains(e.target)) {
      createFirework(e.clientX, e.clientY);
    }
  });

  document.addEventListener("touchstart", (e) => {
    if (!heart.contains(e.target)) {
      const touch = e.touches[0];
      createFirework(touch.clientX, touch.clientY);
    }
  });
}

// ==================== ANIMAZIONE AUTOMATICA ====================
setInterval(() => {
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight * 0.7;
  createFirework(x, y);
}, 3000);

// ==================== GESTIONE RESIZE ====================
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    location.reload();
  }, 250);
});
