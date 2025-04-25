document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM
  const cells = document.querySelectorAll(".game-cell");
  const resetButton = document.getElementById("resetButton");
  const resetAllButton = document.getElementById("resetAllButton");
  const playerTurnDisplay = document.getElementById("playerTurnDisplay");
  const scoreXElement = document.getElementById("scoreX");
  const scoreOElement = document.getElementById("scoreO");
  const gameNumberDisplay = document.getElementById("gameNumberDisplay");
  const historyContainer = document.getElementById("historyContainer");
  const rulesButton = document.getElementById("rulesButton");
  const rulesModal = document.getElementById("rulesModal");
  const closeButton = document.querySelector(".close-button");

  // Stato del gioco
  let playerTurn = "x";
  let moves = 0;
  let isGameOver = false;
  let gameNumber = 1;
  let scores = {
    x: 0,
    0: 0,
    draws: 0,
  };
  let gameHistory = [];

  // Inizializza il gioco
  function initGame() {
    // Carica i punteggi salvati
    loadScores();

    // Aggiorna i punteggi visualizzati
    updateScoreDisplay();

    // Carica la cronologia delle partite
    loadHistory();

    // Carica il numero di partita
    loadGameNumber();

    // Imposta il turno iniziale in base al numero di partita
    setInitialTurn();
  }

  // Carica il numero di partita dal localStorage
  function loadGameNumber() {
    const savedGameNumber = localStorage.getItem("trisGameNumber");
    if (savedGameNumber) {
      gameNumber = Number.parseInt(savedGameNumber);
    }
    gameNumberDisplay.textContent = gameNumber;
  }

  // Salva il numero di partita nel localStorage
  function saveGameNumber() {
    localStorage.setItem("trisGameNumber", gameNumber.toString());
  }

  // Imposta il turno iniziale in base al numero di partita
  function setInitialTurn() {
    // Se il numero di partita è dispari, inizia X
    // Se il numero di partita è pari, inizia 0
    playerTurn = gameNumber % 2 === 1 ? "x" : "0";
    updateTurnDisplay();
  }

  // Aggiorna il display del turno
  function updateTurnDisplay() {
    playerTurnDisplay.textContent = playerTurn.toUpperCase();

    // Cambia il colore in base al giocatore
    if (playerTurn === "x") {
      playerTurnDisplay.style.color = "var(--primary-dark)";
    } else {
      playerTurnDisplay.style.color = "var(--secondary-dark)";
    }
  }

  // Aggiorna il display dei punteggi
  function updateScoreDisplay() {
    scoreXElement.textContent = scores.x;
    scoreOElement.textContent = scores["0"];
  }

  // Salva i punteggi nel localStorage
  function saveScores() {
    localStorage.setItem("trisScores", JSON.stringify(scores));
  }

  // Carica i punteggi dal localStorage
  function loadScores() {
    const savedScores = localStorage.getItem("trisScores");
    if (savedScores) {
      scores = JSON.parse(savedScores);
      // Assicurati che ci sia la chiave "0" invece di "o"
      if (scores.o !== undefined && scores["0"] === undefined) {
        scores["0"] = scores.o;
        delete scores.o;
      }
    }
  }

  // Funzione di gioco
  window.play = (element) => {
    if (element.dataset.player === "none" && !isGameOver) {
      // Imposta il simbolo del giocatore
      element.innerHTML = playerTurn;
      element.dataset.player = playerTurn;

      // Aggiungi classe per lo stile
      if (playerTurn === "x") {
        element.classList.add("player-x");
      } else {
        element.classList.add("player-0");
      }

      // Incrementa le mosse
      moves++;

      // Controlla se c'è un vincitore
      checkWinner();

      // Cambia il turno se il gioco non è finito
      if (!isGameOver) {
        playerTurn = playerTurn === "x" ? "0" : "x";
        updateTurnDisplay();
      }
    }
  };

  // Controlla se c'è un vincitore
  function checkWinner() {
    // Combinazioni vincenti (indici delle celle)
    const winningCombinations = [
      [0, 1, 2], // Prima riga
      [3, 4, 5], // Seconda riga
      [6, 7, 8], // Terza riga
      [0, 3, 6], // Prima colonna
      [1, 4, 7], // Seconda colonna
      [2, 5, 8], // Terza colonna
      [0, 4, 8], // Diagonale principale
      [2, 4, 6], // Diagonale secondaria
    ];

    // Ottieni lo stato attuale della tavola
    const board = Array.from(cells).map((cell) => cell.dataset.player);

    // Controlla ogni combinazione vincente
    for (const [a, b, c] of winningCombinations) {
      if (
        board[a] !== "none" &&
        board[a] === board[b] &&
        board[b] === board[c]
      ) {
        // Abbiamo un vincitore!
        const winner = board[a];

        // Evidenzia le celle vincenti
        cells[a].parentNode.classList.add("activeBox");
        cells[b].parentNode.classList.add("activeBox");
        cells[c].parentNode.classList.add("activeBox");

        // Aggiorna il punteggio
        scores[winner]++;
        updateScoreDisplay();
        saveScores();

        // Aggiungi alla cronologia
        addToHistory(winner);

        // Mostra il messaggio di vittoria
        showGameOverMessage(winner);

        isGameOver = true;
        return;
      }
    }

    // Controlla se è un pareggio
    if (moves === 9) {
      scores.draws++;
      updateScoreDisplay();
      saveScores();

      // Aggiungi alla cronologia
      addToHistory("draw");

      // Mostra il messaggio di pareggio
      showDrawMessage();

      isGameOver = true;
    }
  }

  // Mostra il messaggio di vittoria
  function showGameOverMessage(winner) {
    const gameOverAlert = document.createElement("div");
    gameOverAlert.className = "alert";

    gameOverAlert.innerHTML = `
      <b>PARTITA FINITA</b>
      <p>Il giocatore ${winner.toUpperCase()} ha vinto!</p>
      <button id="playAgainButton">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 2v6h6"></path>
          <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
          <path d="M21 22v-6h-6"></path>
          <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
        </svg>
        Gioca ancora
      </button>
    `;

    document.body.appendChild(gameOverAlert);

    // Aggiungi event listener al pulsante
    document.getElementById("playAgainButton").addEventListener("click", () => {
      document.body.removeChild(gameOverAlert);
      resetGame();
    });
  }

  // Mostra il messaggio di pareggio
  function showDrawMessage() {
    const drawAlert = document.createElement("div");
    drawAlert.className = "alert";

    drawAlert.innerHTML = `
      <b>PAREGGIO</b>
      <p>La partita è finita in parità!</p>
      <button id="playAgainButton">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 2v6h6"></path>
          <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
          <path d="M21 22v-6h-6"></path>
          <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
        </svg>
        Gioca ancora
      </button>
    `;

    document.body.appendChild(drawAlert);

    // Aggiungi event listener al pulsante
    document.getElementById("playAgainButton").addEventListener("click", () => {
      document.body.removeChild(drawAlert);
      resetGame();
    });
  }

  // Aggiungi alla cronologia
  function addToHistory(result) {
    // Limita la cronologia a 10 partite
    if (gameHistory.length >= 10) {
      gameHistory.pop();
    }

    // Aggiungi la nuova partita all'inizio
    gameHistory.unshift({
      result: result,
      timestamp: Date.now(),
      gameNumber: gameNumber,
    });

    // Salva e aggiorna la cronologia
    saveHistory();
    renderHistory();
  }

  // Salva la cronologia nel localStorage
  function saveHistory() {
    localStorage.setItem("trisHistory", JSON.stringify(gameHistory));
  }

  // Carica la cronologia dal localStorage
  function loadHistory() {
    const savedHistory = localStorage.getItem("trisHistory");
    if (savedHistory) {
      gameHistory = JSON.parse(savedHistory);
      renderHistory();
    }
  }

  // Renderizza la cronologia
  function renderHistory() {
    historyContainer.innerHTML = "";

    if (gameHistory.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "empty-history";
      emptyMessage.textContent = "Le partite giocate appariranno qui";
      historyContainer.appendChild(emptyMessage);
      return;
    }

    gameHistory.forEach((game, index) => {
      const historyItem = document.createElement("div");
      historyItem.className = "history-item";

      const gameNumberInfo = document.createElement("div");
      gameNumberInfo.className = "game-number";
      gameNumberInfo.textContent = `Partita ${game.gameNumber || index + 1}`;

      const historyResult = document.createElement("div");

      if (game.result === "draw") {
        historyResult.className = "history-result draw";
        historyResult.textContent = "Pareggio";
      } else if (game.result === "x") {
        historyResult.className = "history-result win-x";
        historyResult.textContent = "Vittoria X";
      } else {
        historyResult.className = "history-result win-0";
        historyResult.textContent = "Vittoria 0";
      }

      historyItem.appendChild(gameNumberInfo);
      historyItem.appendChild(historyResult);

      historyContainer.appendChild(historyItem);
    });
  }

  // Resetta il gioco
  function resetGame() {
    // Rimuovi eventuali messaggi di fine partita
    const alerts = document.querySelectorAll(".alert");
    alerts.forEach((alert) => {
      if (alert.parentNode) {
        document.body.removeChild(alert);
      }
    });

    // Mantieni lo stesso numero di partita
    gameNumberDisplay.textContent = gameNumber;

    // Resetta lo stato del gioco
    moves = 0;
    isGameOver = false;

    // Imposta il turno iniziale in base al numero di partita
    setInitialTurn();

    // Resetta tutte le celle
    cells.forEach((cell) => {
      cell.textContent = "";
      cell.dataset.player = "none";
      cell.classList.remove("player-x", "player-0");
      cell.parentNode.classList.remove("activeBox");
    });
  }

  // Reset completo (punteggi e cronologia)
  function resetAll() {
    // Mostra il modal di conferma
    showResetConfirmation();
  }

  // Mostra il modal di conferma per il reset totale
  function showResetConfirmation() {
    const confirmModal = document.createElement("div");
    confirmModal.className = "confirm-modal";

    confirmModal.innerHTML = `
      <b>RESET TOTALE</b>
      <p>Sei sicuro di voler cancellare tutti i punteggi e la cronologia delle partite?</p>
      <div class="confirm-buttons">
        <button id="confirmYes" class="confirm-button confirm-yes">Sì, cancella tutto</button>
        <button id="confirmNo" class="confirm-button confirm-no">No, annulla</button>
      </div>
    `;

    document.body.appendChild(confirmModal);

    // Aggiungi event listener ai pulsanti
    document.getElementById("confirmYes").addEventListener("click", () => {
      // Resetta i punteggi
      scores = {
        x: 0,
        0: 0,
        draws: 0,
      };
      updateScoreDisplay();
      saveScores();

      // Resetta la cronologia
      gameHistory = [];
      saveHistory();
      renderHistory();

      // Resetta il numero di partita
      gameNumber = 1;
      gameNumberDisplay.textContent = gameNumber;
      saveGameNumber();

      // Resetta il gioco corrente
      resetGame();

      // Rimuovi il modal
      document.body.removeChild(confirmModal);

      // Mostra un messaggio di conferma
      showResetSuccessMessage();
    });

    document.getElementById("confirmNo").addEventListener("click", () => {
      document.body.removeChild(confirmModal);
    });
  }

  // Mostra un messaggio di conferma dopo il reset totale
  function showResetSuccessMessage() {
    const successAlert = document.createElement("div");
    successAlert.className = "alert";

    successAlert.innerHTML = `
      <b>RESET COMPLETATO</b>
      <p>Tutti i punteggi e la cronologia sono stati cancellati.</p>
      <button id="okButton">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        OK
      </button>
    `;

    document.body.appendChild(successAlert);

    // Aggiungi event listener al pulsante
    document.getElementById("okButton").addEventListener("click", () => {
      document.body.removeChild(successAlert);
    });
  }

  // Event Listeners
  resetButton.addEventListener("click", resetGame);
  resetAllButton.addEventListener("click", resetAll);

  // Pulsante delle regole
  rulesButton.addEventListener("click", () => {
    rulesModal.classList.add("show");
  });

  // Chiudi il modal delle regole
  closeButton.addEventListener("click", () => {
    rulesModal.classList.remove("show");
  });

  // Chiudi il modal cliccando fuori
  window.addEventListener("click", (event) => {
    if (event.target === rulesModal) {
      rulesModal.classList.remove("show");
    }
  });

  // Inizializza il gioco
  initGame();
});
