let timeLeft = 25 * 60;
let totalSeconds = 25 * 60;
let isRunning = false;
let isWorkSession = true;
let sessionsCompleted = 0;
let totalBreakTime = 0;
let timerInterval = null;

const timerDisplay = document.getElementById("timerDisplay");
const statusDisplay = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const progressFill = document.getElementById("progressFill");

function updateDisplay() {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  timerDisplay.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const progress = (timeLeft / totalSeconds) * 100;
  progressFill.style.width = progress + "%";

  // Cambia titolo della pagina
  document.title = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} - Pomodoro Timer`;
}

function toggleTimer() {
  if (isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.textContent = "Riprendi";
  } else {
    isRunning = true;
    startBtn.textContent = "Pausa";

    timerInterval = setInterval(() => {
      timeLeft--;
      updateDisplay();

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        playSound();
        switchSession();
        startBtn.textContent = "Avvia";
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  isWorkSession = true;

  const workDuration =
    parseInt(document.getElementById("workDuration").value) || 25;
  timeLeft = workDuration * 60;
  totalSeconds = workDuration * 60;

  statusDisplay.textContent = "Sessione di lavoro";
  startBtn.textContent = "Avvia";
  updateDisplay();
}

function switchSession() {
  isWorkSession = !isWorkSession;

  if (isWorkSession) {
    sessionsCompleted++;
    document.getElementById("sessionsCount").textContent = sessionsCompleted;
    statusDisplay.textContent = "Sessione di lavoro";
    const workDuration =
      parseInt(document.getElementById("workDuration").value) || 25;
    timeLeft = workDuration * 60;
    totalSeconds = workDuration * 60;
  } else {
    const breakDuration =
      parseInt(document.getElementById("breakDuration").value) || 5;
    totalBreakTime += breakDuration;
    document.getElementById("breakTime").textContent = totalBreakTime + "m";
    statusDisplay.textContent = "Pausa - Riposati!";
    timeLeft = breakDuration * 60;
    totalSeconds = breakDuration * 60;
  }

  updateDisplay();
}

function playSound() {
  if (!document.getElementById("soundToggle").checked) return;

  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gain.gain.setValueAtTime(0.3, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.5);
  } catch (e) {
    console.log("Suono non disponibile");
  }
}

// Inizializza il display
updateDisplay();
