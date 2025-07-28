// Variabili globali
let alphabets = [];
let currentLetter = "";
let isGenerating = false;
const history = [];
const MAX_HISTORY = 10;

// Elementi DOM
const letterDisplay = document.getElementById("letter-display");
const letterInfo = document.getElementById("letter-info");
const generateButton = document.getElementById("generateButton");
const copyButton = document.getElementById("copyButton");
const historyItems = document.getElementById("history-items");
const uppercaseToggle = document.getElementById("uppercaseToggle");
const lowercaseToggle = document.getElementById("lowercaseToggle");
const confettiContainer = document.getElementById("confetti-container");

// Colori per i confetti
const confettiColors = [
  "#6200ea",
  "#9d46ff",
  "#0a00b6",
  "#00bcd4",
  "#62efff",
  "#008ba3",
  "#ff4081",
  "#ff79b0",
  "#c60055",
  "#ffeb3b",
  "#ffff72",
  "#c8b900",
];

// Inizializzazione dell'applicazione
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Carica l'alfabeto
    await loadAlphabets();

    // Aggiungi event listeners
    generateButton.addEventListener("click", generateRandomLetter);
    copyButton.addEventListener("click", copyLetterToClipboard);
    uppercaseToggle.addEventListener("change", updateAlphabetOptions);
    lowercaseToggle.addEventListener("change", updateAlphabetOptions);

    // Inizializza le opzioni
    updateAlphabetOptions();

    // Abilita il pulsante di generazione
    generateButton.disabled = false;
  } catch (error) {
    console.error("Errore durante l'inizializzazione:", error);
    letterInfo.textContent =
      "Errore durante il caricamento. Ricarica la pagina.";
    letterInfo.style.color = "#ef4444";
  }
});

// Carica l'alfabeto dal file JSON
async function loadAlphabets() {
  try {
    const response = await fetch("letters.json");
    if (!response.ok) {
      throw new Error("Impossibile caricare il file dell'alfabeto");
    }
    const data = await response.json();
    alphabets = data.alphabets;
  } catch (error) {
    console.error("Errore durante il caricamento dell'alfabeto:", error);
    throw error;
  }
}

// Aggiorna le opzioni dell'alfabeto in base alle selezioni
function updateAlphabetOptions() {
  const uppercase = uppercaseToggle.checked;
  const lowercase = lowercaseToggle.checked;

  // Verifica che almeno un'opzione sia selezionata
  if (!uppercase && !lowercase) {
    // Se nessuna opzione è selezionata, riattiva l'ultima deselezionata
    if (event && event.target.id === "uppercaseToggle") {
      lowercaseToggle.checked = true;
    } else {
      uppercaseToggle.checked = true;
    }
  }

  // Aggiorna il testo informativo
  updateLetterInfo();
}

// Genera una lettera casuale
function generateRandomLetter() {
  if (isGenerating) return;
  isGenerating = true;

  // Filtra l'alfabeto in base alle opzioni selezionate
  const filteredAlphabets = alphabets.filter((letter) => {
    const isUppercase = letter === letter.toUpperCase();
    return (
      (uppercaseToggle.checked && isUppercase) ||
      (lowercaseToggle.checked && !isUppercase)
    );
  });

  if (filteredAlphabets.length === 0) {
    letterInfo.textContent =
      "Nessuna lettera disponibile con le opzioni selezionate";
    isGenerating = false;
    return;
  }

  // Rimuovi il placeholder se presente
  const placeholder = letterDisplay.querySelector(".letter-placeholder");
  if (placeholder) {
    letterDisplay.removeChild(placeholder);
  }

  // Disabilita il pulsante durante l'animazione
  generateButton.disabled = true;

  // Avvia l'animazione di generazione
  let animationCount = 0;
  const maxAnimations = 10;
  const animationInterval = setInterval(() => {
    animationCount++;

    // Genera una lettera casuale per l'animazione
    const randomIndex = Math.floor(Math.random() * filteredAlphabets.length);
    const randomLetter = filteredAlphabets[randomIndex];

    // Aggiorna il display con la lettera casuale
    letterDisplay.textContent = randomLetter;

    // Cambia il colore di sfondo
    const backgroundColor = generateRandomPastelColor();
    letterDisplay.style.background = `linear-gradient(135deg, ${backgroundColor} 0%, ${adjustColor(
      backgroundColor,
      -30,
    )} 100%)`;

    // Ferma l'animazione dopo un certo numero di iterazioni
    if (animationCount >= maxAnimations) {
      clearInterval(animationInterval);

      // Seleziona la lettera finale
      const finalIndex = Math.floor(Math.random() * filteredAlphabets.length);
      currentLetter = filteredAlphabets[finalIndex];

      // Aggiorna il display con la lettera finale
      letterDisplay.textContent = currentLetter;
      letterDisplay.classList.add("animate");

      // Genera confetti
      createConfetti();

      // Aggiorna le informazioni sulla lettera
      updateLetterInfo(currentLetter);

      // Aggiungi alla cronologia
      addToHistory(currentLetter);

      // Abilita il pulsante di copia
      copyButton.disabled = false;

      // Riabilita il pulsante di generazione dopo un breve ritardo
      setTimeout(() => {
        generateButton.disabled = false;
        letterDisplay.classList.remove("animate");
        isGenerating = false;
      }, 500);
    }
  }, 100);
}

// Aggiorna le informazioni sulla lettera
function updateLetterInfo(letter = "") {
  if (!letter) {
    const uppercase = uppercaseToggle.checked;
    const lowercase = lowercaseToggle.checked;

    if (uppercase && lowercase) {
      letterInfo.textContent =
        "Pronto per estrarre lettere maiuscole e minuscole";
    } else if (uppercase) {
      letterInfo.textContent = "Pronto per estrarre solo lettere maiuscole";
    } else if (lowercase) {
      letterInfo.textContent = "Pronto per estrarre solo lettere minuscole";
    }
  } else {
    const isUppercase = letter === letter.toUpperCase();
    letterInfo.textContent = `Lettera ${
      isUppercase ? "maiuscola" : "minuscola"
    }: ${letter}`;
  }
}

// Copia la lettera negli appunti
function copyLetterToClipboard() {
  if (!currentLetter) return;

  navigator.clipboard
    .writeText(currentLetter)
    .then(() => {
      showToast("Lettera copiata negli appunti!");
    })
    .catch((err) => {
      console.error("Errore durante la copia:", err);
      showToast("Impossibile copiare la lettera", false);
    });
}

// Mostra un toast di notifica
function showToast(message, success = true) {
  // Rimuovi toast esistenti
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    document.body.removeChild(existingToast);
  }

  // Crea un nuovo toast
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <i class="fas fa-${success ? "check-circle" : "exclamation-circle"}"></i>
    <span>${message}</span>
  `;

  // Aggiungi il toast al body
  document.body.appendChild(toast);

  // Mostra il toast con animazione
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  // Rimuovi il toast dopo un po'
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Aggiungi una lettera alla cronologia
function addToHistory(letter) {
  // Evita duplicati consecutivi
  if (history.length > 0 && history[0] === letter) {
    return;
  }

  // Aggiungi la lettera all'inizio dell'array
  history.unshift(letter);

  // Limita la dimensione della cronologia
  if (history.length > MAX_HISTORY) {
    history.pop();
  }

  // Aggiorna la visualizzazione della cronologia
  updateHistoryDisplay();
}

// Aggiorna la visualizzazione della cronologia
function updateHistoryDisplay() {
  historyItems.innerHTML = "";

  history.forEach((letter) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    historyItem.textContent = letter;

    // Aggiungi un event listener per riutilizzare la lettera
    historyItem.addEventListener("click", () => {
      currentLetter = letter;
      letterDisplay.textContent = letter;
      letterDisplay.classList.add("animate");
      updateLetterInfo(letter);
      copyButton.disabled = false;

      setTimeout(() => {
        letterDisplay.classList.remove("animate");
      }, 500);
    });

    historyItems.appendChild(historyItem);
  });
}

// Genera un colore pastello casuale
function generateRandomPastelColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 80%)`;
}

// Regola un colore HSL
function adjustColor(color, amount) {
  // Estrai i valori HSL
  const hslMatch = color.match(/hsl$$(\d+),\s*(\d+)%,\s*(\d+)%$$/);
  if (!hslMatch) return color;

  const h = Number.parseInt(hslMatch[1]);
  const s = Number.parseInt(hslMatch[2]);
  const l = Math.max(0, Math.min(100, Number.parseInt(hslMatch[3]) + amount));

  return `hsl(${h}, ${s}%, ${l}%)`;
}

// Crea effetto confetti
function createConfetti() {
  confettiContainer.innerHTML = "";

  const confettiCount = 50;
  const containerWidth = window.innerWidth;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";

    // Proprietà casuali per ogni confetto
    const size = Math.random() * 10 + 5;
    const colorIndex = Math.floor(Math.random() * confettiColors.length);
    const left = Math.random() * containerWidth;
    const duration = Math.random() * 3 + 2;
    const delay = Math.random() * 0.5;

    // Forme casuali
    const shapes = ["circle", "square", "triangle"];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    // Applica stili
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = confettiColors[colorIndex];
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
      confetti.style.borderBottom = `${size}px solid ${confettiColors[colorIndex]}`;
    }

    confettiContainer.appendChild(confetti);

    // Rimuovi il confetto dopo l'animazione
    setTimeout(
      () => {
        if (confettiContainer.contains(confetti)) {
          confettiContainer.removeChild(confetti);
        }
      },
      (duration + delay) * 1000,
    );
  }
}

// Funzione per generare un colore casuale per lo sfondo
function generateRandomBackgroundColor() {
  const r = Math.floor(Math.random() * 106) + 150;
  const g = Math.floor(Math.random() * 106) + 150;
  const b = Math.floor(Math.random() * 106) + 150;

  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
