// Variabili globali
let numbersArray = [];
let attempts = 0;
let wins = 0;
let isAnimating = false;
let history = [];

// Elementi DOM
const numberCards = [
  document.querySelector("#number-display1"),
  document.querySelector("#number-display2"),
  document.querySelector("#number-display3"),
  document.querySelector("#number-display4"),
];
const generateButton = document.querySelector("#generateButton");
const resetButton = document.querySelector("#resetButton");
const resultElement = document.querySelector("#result");
const attemptsElement = document.querySelector("#attempts");
const winsElement = document.querySelector("#wins");
const confettiContainer = document.querySelector("#confetti-container");
const historyContainer = document.querySelector("#history-container");
const probabilityFill = document.querySelector(".probability-fill");
const resetModal = document.querySelector("#resetModal");
const confirmResetButton = document.querySelector("#confirmReset");
const cancelResetButton = document.querySelector("#cancelReset");

// Carica i numeri dal file JSON
async function loadNumbers() {
  try {
    const response = await fetch("numeri.json");
    const data = await response.json();
    numbersArray = data.numbers;

    // Inizializza le statistiche dal localStorage
    initStats();

    // Abilita il pulsante dopo il caricamento
    generateButton.disabled = false;
    generateButton.classList.remove("disabled");

    // Aggiorna la barra di probabilità
    updateProbabilityBar();
  } catch (error) {
    console.error("Errore nel caricamento dei numeri:", error);
    showError("Impossibile caricare i numeri. Ricarica la pagina.");
  }
}

// Inizializza le statistiche
function initStats() {
  attempts = Number.parseInt(localStorage.getItem("numerica_attempts") || "0");
  wins = Number.parseInt(localStorage.getItem("numerica_wins") || "0");
  history = JSON.parse(localStorage.getItem("numerica_history") || "[]");

  updateStatsDisplay();
  renderHistory();
}

// Aggiorna il display delle statistiche
function updateStatsDisplay() {
  attemptsElement.textContent = attempts;
  winsElement.textContent = wins;
}

// Aggiorna la barra di probabilità
function updateProbabilityBar() {
  // La probabilità è 1/10^4 = 0.01%
  const probability = 0.01;

  // Aggiorna la larghezza della barra
  probabilityFill.style.width = `${probability}%`;

  // Se ci sono stati tentativi, aggiorna la probabilità empirica
  if (attempts > 0) {
    const empiricalProbability = (wins / attempts) * 100;
    probabilityFill.style.width = `${empiricalProbability}%`;
  }
}

// Salva le statistiche
function saveStats() {
  localStorage.setItem("numerica_attempts", attempts.toString());
  localStorage.setItem("numerica_wins", wins.toString());
  localStorage.setItem("numerica_history", JSON.stringify(history));
}

// Reset delle statistiche
function resetStats() {
  attempts = 0;
  wins = 0;
  history = [];

  updateStatsDisplay();
  updateProbabilityBar();
  renderHistory();
  saveStats();

  // Resetta anche le carte
  numberCards.forEach((card) => {
    card.classList.remove("flipped");
    const frontElement = card.querySelector(".number-front");
    frontElement.textContent = "?";
  });

  // Nascondi il risultato
  hideResult();

  // Mostra un messaggio di conferma
  showResult(
    false,
    ["0", "0", "0", "0"],
    "Statistiche resettate con successo!"
  );
}

// Genera un numero casuale
function generateRandomNumber() {
  const randomIndex = Math.floor(Math.random() * numbersArray.length);
  return numbersArray[randomIndex];
}

// Genera un colore pastello casuale
function generatePastelColor() {
  // Genera colori pastello basati sulla palette dell'app
  const colors = [
    "#60a5fa", // primary-light
    "#34d399", // secondary-light
    "#8b5cf6", // accent
    "#a78bfa", // violet
    "#38bdf8", // sky
    "#fb923c", // orange
    "#fbbf24", // amber
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}

// Anima le carte durante l'estrazione
function animateNumberCards() {
  return new Promise((resolve) => {
    let iterations = 0;
    const maxIterations = 10;
    const interval = 100;

    // Resetta le carte
    numberCards.forEach((card) => {
      card.classList.remove("flipped");
      const frontElement = card.querySelector(".number-front");
      frontElement.textContent = "?";
    });

    // Nascondi il risultato precedente
    hideResult();

    // Anima le carte con numeri casuali
    const animation = setInterval(() => {
      numberCards.forEach((card) => {
        const backElement = card.querySelector(".number-back");
        backElement.textContent = generateRandomNumber();
        backElement.style.backgroundColor = generatePastelColor();
      });

      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(animation);

        // Genera i numeri finali
        const finalNumbers = numberCards.map((card) => {
          const number = generateRandomNumber();
          const backElement = card.querySelector(".number-back");
          backElement.textContent = number;
          backElement.style.backgroundColor = generatePastelColor();
          return number;
        });

        // Rivela le carte una dopo l'altra
        revealCards(finalNumbers).then(resolve);
      }
    }, interval);
  });
}

// Rivela le carte una dopo l'altra
function revealCards(numbers) {
  return new Promise((resolve) => {
    numberCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("flipped");

        // Se è l'ultima carta, controlla il risultato dopo l'animazione
        if (index === numberCards.length - 1) {
          setTimeout(() => {
            resolve(numbers);
          }, 600); // Durata dell'animazione di flip
        }
      }, index * 200); // Ritardo incrementale per ogni carta
    });
  });
}

// Controlla se tutti i numeri sono uguali
function checkWin(numbers) {
  return new Set(numbers).size === 1;
}

// Mostra il risultato
function showResult(hasWon, numbers, customMessage = null) {
  if (customMessage) {
    resultElement.textContent = customMessage;
    resultElement.className = "result-message show";
  } else {
    resultElement.textContent = hasWon
      ? "Hai vinto! Tutti i numeri sono uguali!"
      : "Non hai vinto. Prova ancora!";

    resultElement.className =
      "result-message show " + (hasWon ? "win" : "lose");

    if (hasWon) {
      createConfetti();
      wins++;
    }

    attempts++;

    // Aggiungi alla cronologia
    addToHistory(numbers, hasWon);
  }

  updateStatsDisplay();
  updateProbabilityBar();
  saveStats();
}

// Aggiungi all'elenco delle estrazioni
function addToHistory(numbers, isWin) {
  // Limita la cronologia a 20 elementi
  if (history.length >= 20) {
    history.pop();
  }

  // Aggiungi la nuova estrazione all'inizio
  history.unshift({
    numbers: numbers,
    isWin: isWin,
    timestamp: Date.now(),
  });

  // Aggiorna la visualizzazione
  renderHistory();
}

// Renderizza la cronologia
function renderHistory() {
  historyContainer.innerHTML = "";

  if (history.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Nessuna estrazione precedente";
    emptyMessage.style.color = "var(--text-light)";
    emptyMessage.style.padding = "1rem";
    historyContainer.appendChild(emptyMessage);
    return;
  }

  history.forEach((item) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    // Crea un elemento per ogni numero
    item.numbers.forEach((number) => {
      const numberElement = document.createElement("div");
      numberElement.className = `history-number ${
        item.isWin ? "history-win" : ""
      }`;
      numberElement.textContent = number;
      historyItem.appendChild(numberElement);
    });

    historyContainer.appendChild(historyItem);
  });
}

// Nascondi il risultato
function hideResult() {
  resultElement.className = "result-message";
}

// Mostra un errore
function showError(message) {
  resultElement.textContent = message;
  resultElement.className = "result-message show lose";
}

// Crea l'effetto confetti
function createConfetti() {
  confettiContainer.innerHTML = "";

  const colors = [
    "#60a5fa", // primary-light
    "#34d399", // secondary-light
    "#8b5cf6", // accent
    "#a78bfa", // violet
    "#38bdf8", // sky
    "#fb923c", // orange
    "#fbbf24", // amber
  ];

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.top = -10 + "px";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = Math.random() * 10 + 5 + "px";
    confetti.style.height = Math.random() * 10 + 5 + "px";
    confetti.style.opacity = Math.random() * 0.5 + 0.5;
    confetti.style.transform = "rotate(" + Math.random() * 360 + "deg)";

    // Animazione CSS
    confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
    confetti.style.animationDelay = Math.random() * 2 + "s";

    // Aggiungi keyframes dinamicamente
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fall {
        to {
          transform: translateY(${window.innerHeight}px) rotate(${
      Math.random() * 360 + 720
    }deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    confettiContainer.appendChild(confetti);
  }

  // Rimuovi i confetti dopo l'animazione
  setTimeout(() => {
    confettiContainer.innerHTML = "";
  }, 5000);
}

// Mostra il modal di conferma
function showResetModal() {
  resetModal.classList.add("show");
}

// Nascondi il modal di conferma
function hideResetModal() {
  resetModal.classList.remove("show");
}

// Gestisci il click sul pulsante di generazione
generateButton.addEventListener("click", async () => {
  if (isAnimating) return;

  isAnimating = true;
  generateButton.disabled = true;
  generateButton.classList.add("disabled");

  try {
    // Anima le carte e ottieni i numeri finali
    const numbers = await animateNumberCards();

    // Controlla se l'utente ha vinto
    const hasWon = checkWin(numbers);

    // Mostra il risultato
    showResult(hasWon, numbers);
  } catch (error) {
    console.error("Errore durante l'animazione:", error);
    showError("Si è verificato un errore. Riprova.");
  } finally {
    // Riabilita il pulsante
    setTimeout(() => {
      generateButton.disabled = false;
      generateButton.classList.remove("disabled");
      isAnimating = false;
    }, 1000);
  }
});

// Gestisci il click sul pulsante di reset
resetButton.addEventListener("click", () => {
  showResetModal();
});

// Gestisci il click sul pulsante di conferma reset
confirmResetButton.addEventListener("click", () => {
  resetStats();
  hideResetModal();
});

// Gestisci il click sul pulsante di annulla reset
cancelResetButton.addEventListener("click", () => {
  hideResetModal();
});

// Chiudi il modal se l'utente clicca fuori da esso
resetModal.addEventListener("click", (event) => {
  if (event.target === resetModal) {
    hideResetModal();
  }
});

// Inizializza l'applicazione
document.addEventListener("DOMContentLoaded", loadNumbers);

// Aggiungi stile per l'animazione di caduta dei confetti
const confettiStyle = document.createElement("style");
confettiStyle.textContent = `
  @keyframes fall {
    to {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
`;
document.head.appendChild(confettiStyle);
