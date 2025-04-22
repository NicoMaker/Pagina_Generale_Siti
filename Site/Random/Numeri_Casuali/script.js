// Variabili globali
let currentNumber = null;
let history = [];
const MAX_HISTORY = 10;
const MAX_CONFETTI = 100;
const CONFETTI_COLORS = [
  "#6366f1",
  "#818cf8",
  "#4f46e5", // Indigo
  "#06b6d4",
  "#22d3ee",
  "#0891b2", // Cyan
  "#f59e0b",
  "#fbbf24",
  "#d97706", // Amber
  "#ef4444",
  "#f87171",
  "#dc2626", // Red
  "#10b981",
  "#34d399",
  "#059669", // Emerald
];
const usedNumbers = new Set();

// Elementi DOM
const minInput = document.getElementById("min");
const maxInput = document.getElementById("max");
const decrementMin = document.getElementById("decrementMin");
const incrementMin = document.getElementById("incrementMin");
const decrementMax = document.getElementById("decrementMax");
const incrementMax = document.getElementById("incrementMax");
const uniqueNumbersToggle = document.getElementById("uniqueNumbers");
const includeZeroToggle = document.getElementById("includeZero");
const generateButton = document.getElementById("generateButton");
const resultDisplay = document.getElementById("resultDisplay");
const resultInfo = document.getElementById("resultInfo");
const copyButton = document.getElementById("copyButton");
const saveButton = document.getElementById("saveButton");
const historyList = document.getElementById("historyList");
const emptyHistory = document.getElementById("emptyHistory");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const toastContainer = document.getElementById("toastContainer");
const confettiContainer = document.getElementById("confettiContainer");

// Inizializzazione dell'applicazione
document.addEventListener("DOMContentLoaded", () => {
  // Carica la cronologia dal localStorage se disponibile
  loadHistoryFromStorage();

  // Aggiungi event listeners per i pulsanti di incremento/decremento
  decrementMin.addEventListener("click", () => decrementValue(minInput));
  incrementMin.addEventListener("click", () => incrementValue(minInput));
  decrementMax.addEventListener("click", () => decrementValue(maxInput));
  incrementMax.addEventListener("click", () => incrementValue(maxInput));

  // Aggiungi event listeners per gli input
  minInput.addEventListener("change", validateInputs);
  maxInput.addEventListener("change", validateInputs);

  // Aggiungi event listeners per i toggle
  uniqueNumbersToggle.addEventListener("change", handleUniqueNumbersToggle);
  includeZeroToggle.addEventListener("change", validateInputs);

  // Aggiungi event listeners per i pulsanti
  generateButton.addEventListener("click", generateRandomNumber);
  copyButton.addEventListener("click", copyNumberToClipboard);
  saveButton.addEventListener("click", saveNumberToHistory);
  clearHistoryButton.addEventListener("click", clearHistory);

  // Inizializza l'interfaccia
  updateInterface();
});

// Funzione per incrementare il valore di un input
function incrementValue(input) {
  const currentValue = parseInt(input.value) || 0;
  input.value = currentValue + 1;
  validateInputs();
}

// Funzione per decrementare il valore di un input
function decrementValue(input) {
  const currentValue = parseInt(input.value) || 0;
  input.value = currentValue - 1;
  validateInputs();
}

// Funzione per validare gli input
function validateInputs() {
  let min = parseInt(minInput.value) || 0;
  let max = parseInt(maxInput.value) || 100;

  // Se il minimo è maggiore del massimo, scambiali
  if (min > max) {
    const temp = min;
    min = max;
    max = temp;
    minInput.value = min;
    maxInput.value = max;
  }

  // Gestisci l'inclusione dello zero
  if (!includeZeroToggle.checked) {
    if (min === 0) min = 1;
    if (max === 0) max = 1;
    minInput.value = min;
    maxInput.value = max;
  }

  // Aggiorna l'interfaccia
  updateGenerateButtonState();
}

// Funzione per gestire il toggle dei numeri unici
function handleUniqueNumbersToggle() {
  // Resetta i numeri usati quando si cambia l'opzione
  usedNumbers.clear();
  updateGenerateButtonState();
}

// Funzione per aggiornare lo stato del pulsante di generazione
function updateGenerateButtonState() {
  const min = parseInt(minInput.value) || 0;
  const max = parseInt(maxInput.value) || 100;
  const range = max - min + 1;

  // Disabilita il pulsante se tutti i numeri sono stati usati
  if (uniqueNumbersToggle.checked && usedNumbers.size >= range) {
    generateButton.disabled = true;
    showToast(
      "Attenzione",
      "Tutti i numeri nell'intervallo sono stati generati",
      "warning"
    );
  } else {
    generateButton.disabled = false;
  }
}

// Funzione per generare un numero casuale
function generateRandomNumber() {
  let min = parseInt(minInput.value) || 0;
  let max = parseInt(maxInput.value) || 100;

  // Validazione degli input
  if (isNaN(min) || isNaN(max)) {
    showToast("Errore", "Inserisci valori numerici validi", "error");
    return;
  }

  // Se il minimo è maggiore del massimo, scambiali
  if (min > max) {
    const temp = min;
    min = max;
    max = temp;
    minInput.value = min;
    maxInput.value = max;
  }

  // Gestisci l'inclusione dello zero
  if (!includeZeroToggle.checked) {
    if (min === 0) min = 1;
    if (max === 0) max = 1;
  }

  // Calcola il range
  const range = max - min + 1;

  // Verifica se tutti i numeri sono stati usati
  if (uniqueNumbersToggle.checked && usedNumbers.size >= range) {
    showToast(
      "Attenzione",
      "Tutti i numeri nell'intervallo sono stati generati",
      "warning"
    );
    return;
  }

  // Avvia l'animazione di generazione
  startGenerationAnimation(min, max);
}

// Funzione per avviare l'animazione di generazione
function startGenerationAnimation(min, max) {
  // Disabilita il pulsante durante l'animazione
  generateButton.disabled = true;

  // Rimuovi il placeholder se presente
  const placeholder = resultDisplay.querySelector(".number-placeholder");
  if (placeholder) {
    resultDisplay.removeChild(placeholder);
  }

  // Avvia l'animazione
  let animationCount = 0;
  const maxAnimations = 10;
  const animationInterval = setInterval(() => {
    animationCount++;

    // Genera un numero casuale per l'animazione
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    resultDisplay.textContent = randomNumber;

    // Ferma l'animazione dopo un certo numero di iterazioni
    if (animationCount >= maxAnimations) {
      clearInterval(animationInterval);

      // Genera il numero finale
      let finalNumber;
      if (uniqueNumbersToggle.checked) {
        // Genera un numero che non è stato ancora usato
        do {
          finalNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (
          usedNumbers.has(finalNumber) &&
          usedNumbers.size < max - min + 1
        );

        // Aggiungi il numero ai numeri usati
        usedNumbers.add(finalNumber);
      } else {
        finalNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      }

      // Aggiorna il display con il numero finale
      resultDisplay.textContent = finalNumber;
      resultDisplay.classList.add("animate");
      currentNumber = finalNumber;

      // Aggiorna le informazioni sul risultato
      resultInfo.textContent = `Numero generato tra ${min} e ${max}`;

      // Abilita i pulsanti di azione
      copyButton.disabled = false;
      saveButton.disabled = false;

      // Genera confetti
      createConfetti();

      // Aggiorna lo stato del pulsante di generazione
      setTimeout(() => {
        resultDisplay.classList.remove("animate");
        generateButton.disabled = false;
        updateGenerateButtonState();
      }, 500);
    }
  }, 100);
}

// Funzione per copiare il numero negli appunti
function copyNumberToClipboard() {
  if (currentNumber === null) return;

  navigator.clipboard
    .writeText(currentNumber.toString())
    .then(() => {
      showToast("Successo", "Numero copiato negli appunti", "success");
    })
    .catch((err) => {
      console.error("Errore durante la copia:", err);
      showToast("Errore", "Impossibile copiare il numero", "error");
    });
}

// Funzione per salvare il numero nella cronologia
function saveNumberToHistory() {
  if (currentNumber === null) return;

  // Crea un nuovo elemento nella cronologia
  const historyItem = {
    number: currentNumber,
    min: parseInt(minInput.value) || 0,
    max: parseInt(maxInput.value) || 100,
    timestamp: new Date(),
  };

  // Aggiungi l'elemento all'inizio dell'array
  history.unshift(historyItem);

  // Limita la dimensione della cronologia
  if (history.length > MAX_HISTORY) {
    history.pop();
  }

  // Aggiorna l'interfaccia
  updateInterface();

  // Salva la cronologia nel localStorage
  saveHistoryToStorage();

  // Mostra un toast di conferma
  showToast("Successo", "Numero salvato nella cronologia", "success");
}

// Funzione per cancellare la cronologia
function clearHistory() {
  if (history.length === 0) {
    showToast("Informazione", "La cronologia è già vuota", "info");
    return;
  }

  if (confirm("Sei sicuro di voler cancellare tutta la cronologia?")) {
    history = [];
    updateInterface();
    saveHistoryToStorage();
    showToast("Successo", "Cronologia cancellata", "success");
  }
}

// Funzione per aggiornare l'interfaccia
function updateInterface() {
  // Aggiorna la lista della cronologia
  historyList.innerHTML = "";

  // Mostra o nascondi lo stato vuoto
  if (history.length === 0) {
    emptyHistory.style.display = "flex";
  } else {
    emptyHistory.style.display = "none";

    // Popola la lista della cronologia
    history.forEach((item) => {
      const li = document.createElement("li");

      const numberSpan = document.createElement("span");
      numberSpan.className = "history-number";
      numberSpan.textContent = item.number;

      const detailsSpan = document.createElement("span");
      detailsSpan.className = "history-details";
      detailsSpan.textContent = `Range: ${item.min} - ${item.max}`;

      const timeSpan = document.createElement("span");
      timeSpan.className = "history-time";
      timeSpan.textContent = formatDate(item.timestamp);

      li.appendChild(numberSpan);
      li.appendChild(detailsSpan);
      li.appendChild(timeSpan);

      // Aggiungi un event listener per riutilizzare il numero
      li.addEventListener("click", () => {
        currentNumber = item.number;
        resultDisplay.textContent = item.number;
        resultDisplay.classList.add("animate");
        resultInfo.textContent = `Numero generato tra ${item.min} e ${item.max}`;
        copyButton.disabled = false;
        saveButton.disabled = false;

        setTimeout(() => {
          resultDisplay.classList.remove("animate");
        }, 500);
      });

      historyList.appendChild(li);
    });
  }
}

// Funzione per formattare la data
function formatDate(date) {
  const now = new Date();
  const diff = now - date;

  // Se è meno di un minuto fa
  if (diff < 60000) {
    return "Adesso";
  }

  // Se è meno di un'ora fa
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min fa`;
  }

  // Se è oggi
  if (date.toDateString() === now.toDateString()) {
    return `Oggi ${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }

  // Se è ieri
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Ieri ${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }

  // Altrimenti mostra la data completa
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

// Funzione per salvare la cronologia nel localStorage
function saveHistoryToStorage() {
  localStorage.setItem(
    "randomNumberGenerator_history",
    JSON.stringify(history)
  );
}

// Funzione per caricare la cronologia dal localStorage
function loadHistoryFromStorage() {
  const savedHistory = localStorage.getItem("randomNumberGenerator_history");
  if (savedHistory) {
    try {
      const parsedHistory = JSON.parse(savedHistory);

      // Converti le stringhe di data in oggetti Date
      history = parsedHistory.map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    } catch (e) {
      console.error("Errore nel caricamento della cronologia salvata:", e);
      history = [];
    }
  }
}

// Funzione per mostrare un toast di notifica
function showToast(title, message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const iconClass = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  }[type];

  toast.innerHTML = `
    <div class="toast-icon ${type}">
      <i class="fas ${iconClass}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;

  toastContainer.appendChild(toast);

  // Rimuovi il toast dopo 3 secondi
  setTimeout(() => {
    if (toastContainer.contains(toast)) {
      toastContainer.removeChild(toast);
    }
  }, 3000);
}

// Funzione per creare l'effetto confetti
function createConfetti() {
  confettiContainer.innerHTML = "";

  for (let i = 0; i < MAX_CONFETTI; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";

    // Proprietà casuali per ogni confetto
    const size = Math.random() * 10 + 5;
    const colorIndex = Math.floor(Math.random() * CONFETTI_COLORS.length);
    const left = Math.random() * window.innerWidth;
    const duration = Math.random() * 3 + 2;
    const delay = Math.random() * 0.5;

    // Forme casuali
    const shapes = ["circle", "square", "triangle"];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    // Applica stili
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = CONFETTI_COLORS[colorIndex];
    confetti.style.left = `${left}px`;
    confetti.style.top = "0";
    confetti.style.animationDuration = `${duration}s`;
    confetti.style.animationDelay = `${delay}s`;

    // Applica forme diverse
    if (shape === "circle") {
      confetti.style.borderRadius = "50%";
    } else if (shape === "triangle") {
      confetti.style.backgroundColor = "transparent";
      confetti.style.width = "0";
      confetti.style.height = "0";
      confetti.style.borderLeft = `${size / 2}px solid transparent`;
      confetti.style.borderRight = `${size / 2}px solid transparent`;
      confetti.style.borderBottom = `${size}px solid ${CONFETTI_COLORS[colorIndex]}`;
    }

    confettiContainer.appendChild(confetti);

    // Rimuovi il confetto dopo l'animazione
    setTimeout(() => {
      if (confettiContainer.contains(confetti)) {
        confettiContainer.removeChild(confetti);
      }
    }, (duration + delay) * 1000);
  }
}
