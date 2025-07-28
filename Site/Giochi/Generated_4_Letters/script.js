// Variabili globali
let alphabets = [];
let attempts = 0;
let wins = 0;
let isAnimating = false;

// Elementi DOM
const letterCards = [
  document.querySelector("#letter-display1"),
  document.querySelector("#letter-display2"),
  document.querySelector("#letter-display3"),
  document.querySelector("#letter-display4"),
];
const generateButton = document.querySelector("#generateButton");
const resetButton = document.querySelector("#resetButton");
const resultElement = document.querySelector("#result");
const attemptsElement = document.querySelector("#attempts");
const winsElement = document.querySelector("#wins");
const confettiContainer = document.querySelector("#confetti-container");
const resetModal = document.querySelector("#resetModal");
const confirmResetButton = document.querySelector("#confirmReset");
const cancelResetButton = document.querySelector("#cancelReset");

// Carica l'alfabeto dal file JSON
async function loadAlphabet() {
  try {
    const response = await fetch("alfabeto.json");
    const data = await response.json();
    alphabets = data.letters;

    // Inizializza le statistiche dal localStorage
    initStats();

    // Abilita il pulsante dopo il caricamento
    generateButton.disabled = false;
    generateButton.classList.remove("disabled");
  } catch (error) {
    console.error("Errore nel caricamento dell'alfabeto:", error);
    showError("Impossibile caricare l'alfabeto. Ricarica la pagina.");
  }
}

// Inizializza le statistiche
function initStats() {
  attempts = Number.parseInt(
    localStorage.getItem("letterario_attempts") || "0",
  );
  wins = Number.parseInt(localStorage.getItem("letterario_wins") || "0");
  updateStatsDisplay();
}

// Aggiorna il display delle statistiche
function updateStatsDisplay() {
  attemptsElement.textContent = attempts;
  winsElement.textContent = wins;
}

// Salva le statistiche
function saveStats() {
  localStorage.setItem("letterario_attempts", attempts.toString());
  localStorage.setItem("letterario_wins", wins.toString());
}

// Reset delle statistiche
function resetStats() {
  attempts = 0;
  wins = 0;
  updateStatsDisplay();
  saveStats();

  // Resetta anche le carte
  letterCards.forEach((card) => {
    card.classList.remove("flipped");
    const frontElement = card.querySelector(".letter-front");
    frontElement.textContent = "?";
  });

  // Nascondi il risultato
  hideResult();

  // Mostra un messaggio di conferma
  showResult(false, "Statistiche resettate con successo!");
}

// Genera una lettera casuale e un colore
function generateRandomLetter() {
  const randomIndex = Math.floor(Math.random() * alphabets.length);
  return alphabets[randomIndex];
}

// Genera un colore pastello casuale
function generatePastelColor() {
  // Genera colori pastello basati sulla palette dell'app
  const colors = [
    "#818cf8", // primary-light
    "#f472b6", // secondary-light
    "#8b5cf6", // accent
    "#a78bfa", // violet
    "#60a5fa", // blue
    "#34d399", // emerald
    "#fbbf24", // amber
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}

// Anima le carte durante l'estrazione
function animateLetterCards() {
  return new Promise((resolve) => {
    let iterations = 0;
    const maxIterations = 10;
    const interval = 100;

    // Resetta le carte
    letterCards.forEach((card) => {
      card.classList.remove("flipped");
      const frontElement = card.querySelector(".letter-front");
      frontElement.textContent = "?";
    });

    // Nascondi il risultato precedente
    hideResult();

    // Anima le carte con lettere casuali
    const animation = setInterval(() => {
      letterCards.forEach((card) => {
        const backElement = card.querySelector(".letter-back");
        backElement.textContent = generateRandomLetter();
        backElement.style.backgroundColor = generatePastelColor();
      });

      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(animation);

        // Genera le lettere finali
        const finalLetters = letterCards.map((card) => {
          const letter = generateRandomLetter();
          const backElement = card.querySelector(".letter-back");
          backElement.textContent = letter;
          backElement.style.backgroundColor = generatePastelColor();
          return letter;
        });

        // Rivela le carte una dopo l'altra
        revealCards(finalLetters).then(resolve);
      }
    }, interval);
  });
}

// Rivela le carte una dopo l'altra
function revealCards(letters) {
  return new Promise((resolve) => {
    letterCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("flipped");

        // Se è l'ultima carta, controlla il risultato dopo l'animazione
        if (index === letterCards.length - 1) {
          setTimeout(() => {
            resolve(letters);
          }, 600); // Durata dell'animazione di flip
        }
      }, index * 200); // Ritardo incrementale per ogni carta
    });
  });
}

// Controlla se tutte le lettere sono uguali
function checkWin(letters) {
  return new Set(letters).size === 1;
}

// Mostra il risultato
function showResult(hasWon, customMessage = null) {
  if (customMessage) {
    resultElement.textContent = customMessage;
    resultElement.className = "result-message show";
  } else {
    resultElement.textContent = hasWon
      ? "Hai vinto! Tutte le lettere sono uguali!"
      : "Non hai vinto. Prova ancora!";

    resultElement.className =
      "result-message show " + (hasWon ? "win" : "lose");

    if (hasWon) {
      createConfetti();
      wins++;
    }

    attempts++;
  }

  updateStatsDisplay();
  saveStats();
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
    "#818cf8", // primary-light
    "#f472b6", // secondary-light
    "#8b5cf6", // accent
    "#a78bfa", // violet
    "#60a5fa", // blue
    "#34d399", // emerald
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
    // Anima le carte e ottieni le lettere finali
    const letters = await animateLetterCards();

    // Controlla se l'utente ha vinto
    const hasWon = checkWin(letters);

    // Mostra il risultato
    showResult(hasWon);
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
document.addEventListener("DOMContentLoaded", loadAlphabet);

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
