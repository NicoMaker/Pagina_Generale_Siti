document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  // Cronometro
  const cronometroDisplay = document.getElementById("cronometroDisplay");
  const cronometroProgress = document.getElementById("cronometroProgress");
  const startCronometroBtn = document.getElementById("startCronometroBtn");
  const stopCronometroBtn = document.getElementById("stopCronometroBtn");
  const resetCronometroBtn = document.getElementById("resetCronometroBtn");

  // Timer
  const timerDisplay = document.getElementById("timerDisplay");
  const timerProgress = document.getElementById("timerProgress");
  const startTimerBtn = document.getElementById("startTimerBtn");
  const stopTimerBtn = document.getElementById("stopTimerBtn");
  const resetTimerBtn = document.getElementById("resetTimerBtn");

  // Variabili cronometro
  let cronometro;
  let seconds = 0;
  let minutes = 0;
  let hours = 0;
  let isRunning = false;

  // Variabili timer
  let timer;
  let timerTotalSeconds = 0;
  let timerRemainingSeconds = 0;
  let timerIsRunning = false;

  // Gestione delle tab
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));
      button.classList.add("active");
      const tabId = button.getAttribute("data-tab");
      document.getElementById(`${tabId}-tab`).classList.add("active");
    });
  });

  // Funzioni cronometro
  window.startCronometro = () => {
    if (!isRunning) {
      isRunning = true;
      cronometro = setInterval(() => {
        seconds++;
        if (seconds >= 60) {
          seconds = 0;
          minutes++;
        }
        if (minutes >= 60) {
          minutes = 0;
          hours++;
        }
        updateCronometroDisplay();
      }, 1000);

      startCronometroBtn.disabled = true;
      stopCronometroBtn.disabled = false;
      resetCronometroBtn.disabled = false;
    }
  };

  window.stopCronometro = () => {
    if (isRunning) {
      clearInterval(cronometro);
      isRunning = false;
      startCronometroBtn.disabled = false;
      stopCronometroBtn.disabled = true;
    }
  };

  window.resetCronometro = () => {
    clearInterval(cronometro);
    isRunning = false;
    seconds = 0;
    minutes = 0;
    hours = 0;
    updateCronometroDisplay();
    startCronometroBtn.disabled = false;
    stopCronometroBtn.disabled = true;
    resetCronometroBtn.disabled = true;
    cronometroProgress.style.strokeDashoffset = 691.15;
  };

  function updateCronometroDisplay() {
    cronometroDisplay.textContent = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    const fullCycleSeconds = 60;
    const progressSeconds = seconds % fullCycleSeconds;
    const circumference = 691.15;
    const offset =
      circumference - (progressSeconds / fullCycleSeconds) * circumference;
    cronometroProgress.style.strokeDashoffset = offset;
  }

  // Funzioni timer
  window.impostaTimer = () => {
    const ore = Number.parseInt(document.getElementById("ore").value) || 0;
    const minuti =
      Number.parseInt(document.getElementById("minuti").value) || 0;
    const secondi =
      Number.parseInt(document.getElementById("secondi").value) || 0;

    timerTotalSeconds = ore * 3600 + minuti * 60 + secondi;

    if (timerTotalSeconds <= 0) {
      timerDisplay.classList.add("shake");
      setTimeout(() => {
        timerDisplay.classList.remove("shake");
      }, 500);
      return;
    }

    timerRemainingSeconds = timerTotalSeconds;
    startTimerBtn.disabled = true;
    stopTimerBtn.disabled = false;
    resetTimerBtn.disabled = false;

    document.getElementById("ore").disabled = true;
    document.getElementById("minuti").disabled = true;
    document.getElementById("secondi").disabled = true;

    updateTimerDisplay();

    timerIsRunning = true;
    timer = setInterval(() => {
      timerRemainingSeconds--;
      if (timerRemainingSeconds <= 0) {
        clearInterval(timer);
        timerIsRunning = false;
        timerDisplay.textContent = "Tempo scaduto!";
        timerDisplay.classList.add("pulse");
        document.querySelector(".card").classList.add("completed");
        riproduciMessaggioVocale("Timer finito!");
        startTimerBtn.disabled = false;
        stopTimerBtn.disabled = true;
      } else {
        updateTimerDisplay();
      }
    }, 1000);
  };

  window.stopTimer = () => {
    if (timerIsRunning) {
      clearInterval(timer);
      timerIsRunning = false;
      startTimerBtn.disabled = false;
      stopTimerBtn.disabled = true;
    }
  };

  window.resetTimer = () => {
    clearInterval(timer);
    timerIsRunning = false;
    timerRemainingSeconds = 0;

    timerDisplay.textContent = "00:00:00";
    timerDisplay.classList.remove("pulse");
    document.querySelector(".card").classList.remove("completed");

    document.getElementById("ore").disabled = false;
    document.getElementById("minuti").disabled = false;
    document.getElementById("secondi").disabled = false;

    document.getElementById("ore").value = 0;
    document.getElementById("minuti").value = 0;
    document.getElementById("secondi").value = 0;

    startTimerBtn.disabled = false;
    stopTimerBtn.disabled = true;
    resetTimerBtn.disabled = true;

    timerProgress.style.strokeDashoffset = 0;
  };

  function updateTimerDisplay() {
    const h = Math.floor(timerRemainingSeconds / 3600);
    const m = Math.floor((timerRemainingSeconds % 3600) / 60);
    const s = timerRemainingSeconds % 60;

    timerDisplay.textContent = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

    const circumference = 691.15;
    const offset = (timerRemainingSeconds / timerTotalSeconds) * circumference;
    timerProgress.style.strokeDashoffset = circumference - offset;
  }

  function riproduciMessaggioVocale(messaggio) {
    const synthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(messaggio);

    const voci = synthesis.getVoices();
    const voceItaliana = voci.find((voce) => voce.lang === "it-IT");
    if (voceItaliana) {
      utterance.voice = voceItaliana;
    }

    synthesis.speak(utterance);
  }

  updateCronometroDisplay();
});
