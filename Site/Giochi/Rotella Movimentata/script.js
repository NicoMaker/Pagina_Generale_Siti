document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM
  const settingsForm = document.getElementById("settingsForm");
  const colorSelect = document.getElementById("color");
  const colorPreview = document.getElementById("colorPreview");
  const speedInput = document.getElementById("speed");
  const speedValue = document.getElementById("speedValue");
  const patternOptions = document.getElementsByName("pattern");
  const wheel = document.querySelector(".wheel");
  const pauseButton = document.getElementById("pauseButton");
  const resetButton = document.getElementById("resetButton");

  // Stato dell'applicazione
  let isPaused = false;
  const defaultSettings = {
    color: "red",
    speed: "10",
    pattern: "dashed",
  };

  // Inizializza l'applicazione
  function initApp() {
    // Carica le impostazioni salvate o usa quelle predefinite
    const savedSettings =
      JSON.parse(localStorage.getItem("wheelSettings")) || defaultSettings;

    // Applica le impostazioni iniziali
    colorSelect.value = savedSettings.color;
    speedInput.value = savedSettings.speed;
    updateColorPreview();
    updateSpeedValue();

    // Seleziona il pattern corretto
    for (const option of patternOptions) {
      if (option.value === savedSettings.pattern) {
        option.checked = true;
      }
    }

    // Applica le impostazioni alla rotella
    applySettings(savedSettings);

    // Aggiungi event listeners
    colorSelect.addEventListener("change", updateColorPreview);
    speedInput.addEventListener("input", updateSpeedValue);
    pauseButton.addEventListener("click", togglePause);
    resetButton.addEventListener("click", resetWheel);
  }

  // Aggiorna l'anteprima del colore
  function updateColorPreview() {
    colorPreview.style.backgroundColor = colorSelect.value;
  }

  // Aggiorna il valore della velocità
  function updateSpeedValue() {
    speedValue.textContent = speedInput.value + "s";
  }

  // Applica le impostazioni alla rotella
  function applySettings(settings) {
    wheel.style.backgroundColor = settings.color;
    wheel.style.animationDuration = settings.speed + "s";

    // Rimuovi tutti i tipi di bordo precedenti
    wheel.style.border = "";

    // Applica il nuovo tipo di bordo
    const borderWidth =
      window.innerWidth <= 480
        ? "10px"
        : window.innerWidth <= 767
        ? "15px"
        : "20px";
    wheel.style.border = `${borderWidth} ${settings.pattern} white`;

    // Salva le impostazioni
    localStorage.setItem("wheelSettings", JSON.stringify(settings));
  }

  // Gestisci l'invio del form
  settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Ottieni il pattern selezionato
    let selectedPattern = "dashed";
    for (const option of patternOptions) {
      if (option.checked) {
        selectedPattern = option.value;
        break;
      }
    }

    // Crea l'oggetto impostazioni
    const settings = {
      color: colorSelect.value,
      speed: speedInput.value,
      pattern: selectedPattern,
    };

    // Applica le impostazioni
    applySettings(settings);

    // Aggiungi animazione al pulsante
    const applyButton = document.querySelector(".apply-button");
    applyButton.classList.add("applied");

    // Rimuovi l'animazione dopo un po'
    setTimeout(() => {
      applyButton.classList.remove("applied");
    }, 1000);

    // Mostra feedback visivo
    showFeedback("Impostazioni applicate!");
  });

  // Metti in pausa o riprendi la rotazione
  function togglePause() {
    isPaused = !isPaused;

    if (isPaused) {
      wheel.classList.add("paused");
      pauseButton.querySelector("span").textContent = "Riprendi";
      pauseButton.querySelector("svg").innerHTML = `
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      `;
    } else {
      wheel.classList.remove("paused");
      pauseButton.querySelector("span").textContent = "Pausa";
      pauseButton.querySelector("svg").innerHTML = `
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      `;
    }
  }

  // Resetta la rotella alle impostazioni predefinite
  function resetWheel() {
    // Resetta il form
    colorSelect.value = defaultSettings.color;
    speedInput.value = defaultSettings.speed;

    for (const option of patternOptions) {
      if (option.value === defaultSettings.pattern) {
        option.checked = true;
      }
    }

    // Aggiorna le anteprime
    updateColorPreview();
    updateSpeedValue();

    // Applica le impostazioni predefinite
    applySettings(defaultSettings);

    // Riprendi la rotazione se era in pausa
    if (isPaused) {
      togglePause();
    }

    // Mostra feedback visivo
    showFeedback("Rotella resettata!");
  }

  // Mostra un messaggio di feedback
  function showFeedback(message) {
    // Crea l'elemento di feedback se non esiste
    let feedback = document.querySelector(".feedback-message");

    if (!feedback) {
      feedback = document.createElement("div");
      feedback.className = "feedback-message";
      document.body.appendChild(feedback);
    }

    // Aggiorna il messaggio e mostra il feedback
    feedback.textContent = message;
    feedback.classList.add("show");

    // Nascondi il feedback dopo un po'
    setTimeout(() => {
      feedback.classList.remove("show");
    }, 3000);
  }

  // Aggiungi stile per il messaggio di feedback
  const feedbackStyle = document.createElement("style");
  feedbackStyle.textContent = `
    .feedback-message {
      position: fixed;
      bottom: -100px;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--primary);
      color: white;
      padding: 1rem 2rem;
      border-radius: 50px;
      font-weight: 500;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
      transition: bottom 0.3s ease;
      z-index: 1000;
    }
    
    .feedback-message.show {
      bottom: 30px;
    }
  `;
  document.head.appendChild(feedbackStyle);

  // Inizializza l'applicazione
  initApp();
});
