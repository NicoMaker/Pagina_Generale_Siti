// Variabili globali
let passwordConfig = null;
let passwordHistory = [];
const MAX_HISTORY = 10;

// Elementi DOM
const passwordForm = document.getElementById("passwordForm");
const passwordLengthSlider = document.getElementById("passwordLength");
const lengthValue = document.getElementById("lengthValue");
const uppercaseCheck = document.getElementById("uppercaseCheck");
const lowercaseCheck = document.getElementById("lowercaseCheck");
const numbersCheck = document.getElementById("numbersCheck");
const symbolsCheck = document.getElementById("symbolsCheck");
const excludeSimilarCheck = document.getElementById("excludeSimilarCheck");
const generateButton = document.getElementById("generateButton");
const passwordOutput = document.getElementById("passwordOutput");
const copyButton = document.getElementById("copyButton");
const refreshButton = document.getElementById("refreshButton");
const strengthBars = document.querySelectorAll(".strength-bar");
const strengthText = document.getElementById("strengthText");
const historyList = document.getElementById("historyList");
const emptyHistory = document.getElementById("emptyHistory");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const toastContainer = document.getElementById("toastContainer");

// Caratteri simili da escludere
const similarChars = "il1Lo0O";

// Inizializzazione dell'applicazione
document.addEventListener("DOMContentLoaded", async () => {
  // Carica la configurazione
  try {
    passwordConfig = await loadPasswordConfig();
  } catch (error) {
    console.error("Errore nel caricamento della configurazione:", error);
    showToast("Errore", "Impossibile caricare la configurazione", "error");

    // Configurazione di fallback
    passwordConfig = {
      uppercaseChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercaseChars: "abcdefghijklmnopqrstuvwxyz",
      specialChars: "!@#$%^&*()",
      numericChars: "0123456789",
    };
  }

  // Carica la cronologia dal localStorage
  loadHistoryFromStorage();

  // Aggiungi event listeners
  passwordLengthSlider.addEventListener("input", updateLengthValue);
  passwordForm.addEventListener("submit", handleFormSubmit);
  copyButton.addEventListener("click", copyPasswordToClipboard);
  refreshButton.addEventListener("click", regeneratePassword);
  clearHistoryButton.addEventListener("click", clearHistory);

  // Aggiungi event listeners per i checkbox
  const checkboxes = [
    uppercaseCheck,
    lowercaseCheck,
    numbersCheck,
    symbolsCheck,
  ];
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", validateCheckboxes);
  });

  // Inizializza l'interfaccia
  updateLengthValue();
  updateInterface();
});

// Funzione per caricare la configurazione
async function loadPasswordConfig() {
  const response = await fetch("configurazioni.json");
  return await response.json();
}

// Funzione per aggiornare il valore della lunghezza
function updateLengthValue() {
  lengthValue.textContent = passwordLengthSlider.value;
}

// Funzione per validare i checkbox
function validateCheckboxes() {
  // Almeno un tipo di carattere deve essere selezionato
  if (
    !uppercaseCheck.checked &&
    !lowercaseCheck.checked &&
    !numbersCheck.checked &&
    !symbolsCheck.checked
  ) {
    // Riattiva l'ultimo checkbox deselezionato
    this.checked = true;
    showToast(
      "Attenzione",
      "Almeno un tipo di carattere deve essere selezionato",
      "warning",
    );
  }
}

// Funzione per gestire l'invio del form
function handleFormSubmit(event) {
  event.preventDefault();
  generatePassword();
}

// Funzione per generare una password
function generatePassword() {
  const passwordLength = Number.parseInt(passwordLengthSlider.value);

  // Verifica che almeno un tipo di carattere sia selezionato
  if (
    !uppercaseCheck.checked &&
    !lowercaseCheck.checked &&
    !numbersCheck.checked &&
    !symbolsCheck.checked
  ) {
    showToast("Errore", "Seleziona almeno un tipo di carattere", "error");
    return;
  }

  // Avvia l'animazione di generazione
  startGenerationAnimation(passwordLength);
}

// Funzione per avviare l'animazione di generazione
function startGenerationAnimation(passwordLength) {
  // Disabilita il pulsante durante l'animazione
  generateButton.disabled = true;

  // Avvia l'animazione
  let animationCount = 0;
  const maxAnimations = 10;
  const animationInterval = setInterval(() => {
    animationCount++;

    // Genera una password casuale per l'animazione
    const tempPassword = generateRandomPassword(passwordLength);
    passwordOutput.value = tempPassword;

    // Ferma l'animazione dopo un certo numero di iterazioni
    if (animationCount >= maxAnimations) {
      clearInterval(animationInterval);

      // Genera la password finale
      const finalPassword = generateRandomPassword(passwordLength);
      passwordOutput.value = finalPassword;

      // Valuta la robustezza della password
      evaluatePasswordStrength(finalPassword);

      // Abilita i pulsanti di azione
      copyButton.disabled = false;
      refreshButton.disabled = false;

      // Riabilita il pulsante di generazione
      generateButton.disabled = false;
    }
  }, 100);
}

// Funzione per generare una password casuale
function generateRandomPassword(length) {
  let charPool = "";
  let password = "";

  // Crea il pool di caratteri in base alle opzioni selezionate
  if (uppercaseCheck.checked) charPool += passwordConfig.uppercaseChars;
  if (lowercaseCheck.checked) charPool += passwordConfig.lowercaseChars;
  if (numbersCheck.checked) charPool += passwordConfig.numericChars;
  if (symbolsCheck.checked) charPool += passwordConfig.specialChars;

  // Rimuovi caratteri simili se l'opzione è selezionata
  if (excludeSimilarCheck.checked) {
    for (let i = 0; i < similarChars.length; i++) {
      charPool = charPool.replace(similarChars[i], "");
    }
  }

  // Assicurati che ci sia almeno un carattere di ogni tipo selezionato
  if (uppercaseCheck.checked) {
    password += passwordConfig.uppercaseChars.charAt(
      Math.floor(Math.random() * passwordConfig.uppercaseChars.length),
    );
  }

  if (lowercaseCheck.checked) {
    password += passwordConfig.lowercaseChars.charAt(
      Math.floor(Math.random() * passwordConfig.lowercaseChars.length),
    );
  }

  if (numbersCheck.checked) {
    password += passwordConfig.numericChars.charAt(
      Math.floor(Math.random() * passwordConfig.numericChars.length),
    );
  }

  if (symbolsCheck.checked) {
    password += passwordConfig.specialChars.charAt(
      Math.floor(Math.random() * passwordConfig.specialChars.length),
    );
  }

  // Riempi il resto della password con caratteri casuali
  for (let i = password.length; i < length; i++) {
    password += charPool.charAt(Math.floor(Math.random() * charPool.length));
  }

  // Mescola la password
  password = shuffleString(password);

  return password;
}

// Funzione per mescolare una stringa
function shuffleString(string) {
  const array = string.split("");
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join("");
}

// Funzione per valutare la robustezza della password
function evaluatePasswordStrength(password) {
  // Calcola il punteggio di robustezza
  let score = 0;

  // Lunghezza (0-4 punti)
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;

  // Complessità (0-4 punti)
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Aggiorna l'indicatore di robustezza
  updateStrengthMeter(score);

  return score;
}

// Funzione per aggiornare l'indicatore di robustezza
function updateStrengthMeter(score) {
  // Resetta le classi
  strengthBars.forEach((bar) => {
    bar.className = "strength-bar";
  });

  strengthText.className = "strength-text";

  // Aggiorna in base al punteggio
  if (score <= 2) {
    // Debole
    strengthBars[0].classList.add("weak");
    strengthText.textContent = "Debole";
    strengthText.classList.add("weak");
  } else if (score <= 5) {
    // Media
    strengthBars[0].classList.add("medium");
    strengthBars[1].classList.add("medium");
    strengthText.textContent = "Media";
    strengthText.classList.add("medium");
  } else if (score <= 7) {
    // Forte
    strengthBars[0].classList.add("strong");
    strengthBars[1].classList.add("strong");
    strengthBars[2].classList.add("strong");
    strengthText.textContent = "Forte";
    strengthText.classList.add("strong");
  } else {
    // Molto forte
    strengthBars.forEach((bar) => {
      bar.classList.add("strong");
    });
    strengthText.textContent = "Molto forte";
    strengthText.classList.add("strong");
  }
}

// Funzione per copiare la password negli appunti
function copyPasswordToClipboard() {
  const password = passwordOutput.value;

  if (!password) {
    showToast("Errore", "Nessuna password da copiare", "error");
    return;
  }

  navigator.clipboard
    .writeText(password)
    .then(() => {
      showToast("Successo", "Password copiata negli appunti", "success");
    })
    .catch((err) => {
      console.error("Errore durante la copia:", err);
      showToast("Errore", "Impossibile copiare la password", "error");
    });
}

// Funzione per rigenerare la password
function regeneratePassword() {
  generatePassword();
}

// Funzione per salvare la password nella cronologia
function savePasswordToHistory(password) {
  if (!password) return;

  // Crea un nuovo elemento nella cronologia
  const historyItem = {
    password: password,
    length: password.length,
    timestamp: new Date(),
    options: {
      uppercase: uppercaseCheck.checked,
      lowercase: lowercaseCheck.checked,
      numbers: numbersCheck.checked,
      symbols: symbolsCheck.checked,
      excludeSimilar: excludeSimilarCheck.checked,
    },
  };

  // Aggiungi l'elemento all'inizio dell'array
  passwordHistory.unshift(historyItem);

  // Limita la dimensione della cronologia
  if (passwordHistory.length > MAX_HISTORY) {
    passwordHistory.pop();
  }

  // Aggiorna l'interfaccia
  updateInterface();

  // Salva la cronologia nel localStorage
  saveHistoryToStorage();
}

// Funzione per cancellare la cronologia
function clearHistory() {
  if (passwordHistory.length === 0) {
    showToast("Informazione", "La cronologia è già vuota", "info");
    return;
  }

  if (confirm("Sei sicuro di voler cancellare tutta la cronologia?")) {
    passwordHistory = [];
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
  if (passwordHistory.length === 0) {
    emptyHistory.style.display = "flex";
  } else {
    emptyHistory.style.display = "none";

    // Popola la lista della cronologia
    passwordHistory.forEach((item) => {
      const li = document.createElement("li");

      const passwordSpan = document.createElement("span");
      passwordSpan.className = "history-password";
      passwordSpan.textContent = item.password;

      const detailsSpan = document.createElement("span");
      detailsSpan.className = "history-details";

      // Crea una stringa con le opzioni utilizzate
      const options = [];
      if (item.options.uppercase) options.push("Maiuscole");
      if (item.options.lowercase) options.push("Minuscole");
      if (item.options.numbers) options.push("Numeri");
      if (item.options.symbols) options.push("Simboli");

      detailsSpan.textContent = `${item.length} caratteri | ${options.join(
        ", ",
      )}`;

      const timeSpan = document.createElement("span");
      timeSpan.className = "history-time";
      timeSpan.textContent = formatDate(item.timestamp);

      li.appendChild(passwordSpan);
      li.appendChild(detailsSpan);
      li.appendChild(timeSpan);

      // Aggiungi un event listener per riutilizzare la password
      li.addEventListener("click", () => {
        passwordOutput.value = item.password;
        evaluatePasswordStrength(item.password);
        copyButton.disabled = false;
        refreshButton.disabled = false;

        showToast("Informazione", "Password caricata dalla cronologia", "info");
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
    "passwordGenerator_history",
    JSON.stringify(passwordHistory),
  );
}

// Funzione per caricare la cronologia dal localStorage
function loadHistoryFromStorage() {
  const savedHistory = localStorage.getItem("passwordGenerator_history");
  if (savedHistory) {
    try {
      const parsedHistory = JSON.parse(savedHistory);

      // Converti le stringhe di data in oggetti Date
      passwordHistory = parsedHistory.map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    } catch (e) {
      console.error("Errore nel caricamento della cronologia salvata:", e);
      passwordHistory = [];
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
