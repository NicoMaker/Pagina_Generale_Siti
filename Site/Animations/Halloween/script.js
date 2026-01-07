const colors = [
  "#ff6b00",
  "#ff8c00",
  "#ffa500",
  "#ff4500",
  "#8b00ff",
  "#4b0082",
  "#ffff00",
];
const isMobile = window.innerWidth < 768;

// Crea stelle
function createStars() {
  const count = isMobile ? 60 : 100;
  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.animationDelay = Math.random() * 3 + "s";
    document.body.appendChild(star);
  }
}

// Crea pipistrelli
function createBats() {
  const count = isMobile ? 5 : 8;
  for (let i = 0; i < count; i++) {
    const bat = document.createElement("div");
    bat.className = "bat";
    bat.textContent = "🦇";
    bat.style.left = Math.random() * 100 + "%";
    bat.style.top = Math.random() * 50 + "%";
    bat.style.animationDelay = Math.random() * 4 + "s";
    bat.style.animationDuration = Math.random() * 4 + 6 + "s";
    document.body.appendChild(bat);
  }
}

// Crea fantasmi
function createGhosts() {
  const count = isMobile ? 4 : 6;
  for (let i = 0; i < count; i++) {
    const ghost = document.createElement("div");
    ghost.className = "ghost";
    ghost.style.left = Math.random() * 100 + "%";
    ghost.style.top = Math.random() * 80 + 10 + "%";
    ghost.style.animationDelay = Math.random() * 3 + "s";
    ghost.style.animationDuration = Math.random() * 3 + 4 + "s";
    document.body.appendChild(ghost);
  }
}

// Crea coriandoli continui
function createConfetti() {
  const confetti = document.createElement("div");
  confetti.className = "confetti";
  confetti.style.left = Math.random() * 100 + "%";
  confetti.style.backgroundColor =
    colors[Math.floor(Math.random() * colors.length)];
  confetti.style.animation = `fall ${Math.random() * 3 + 3}s linear`;
  confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
  document.body.appendChild(confetti);

  setTimeout(() => confetti.remove(), 6000);
}

// Fuochi d'artificio
function createFirework(x, y) {
  const particleCount = isMobile ? 20 : 30;
  const color = colors[Math.floor(Math.random() * colors.length)];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.backgroundColor = color;
    particle.style.left = x + "px";
    particle.style.top = y + "px";

    const angle = (Math.PI * 2 * i) / particleCount;
    const velocity = Math.random() * (isMobile ? 80 : 100) + 50;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;

    particle.style.setProperty("--x", tx + "px");
    particle.style.setProperty("--y", ty + "px");
    particle.style.animation = "explode 1.5s ease-out";

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1500);
  }
}

// Eventi click e touch
const pumpkin = document.getElementById("pumpkin");

pumpkin.addEventListener("click", (e) => {
  e.stopPropagation();
  const rect = pumpkin.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  createFirework(x, y);
});

pumpkin.addEventListener("touchstart", (e) => {
  e.preventDefault();
  e.stopPropagation();
  const rect = pumpkin.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  createFirework(x, y);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".pumpkin")) {
    createFirework(e.clientX, e.clientY);
  }
});

document.addEventListener("touchstart", (e) => {
  if (!e.target.closest(".pumpkin")) {
    const touch = e.touches[0];
    createFirework(touch.clientX, touch.clientY);
  }
});

// Inizializzazione
createStars();
createBats();
createGhosts();

// Coriandoli continui - meno frequenti su mobile
const confettiInterval = isMobile ? 300 : 200;
setInterval(createConfetti, confettiInterval);

// Fuochi automatici
setInterval(() => {
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight * 0.7;
  createFirework(x, y);
}, 2500);
