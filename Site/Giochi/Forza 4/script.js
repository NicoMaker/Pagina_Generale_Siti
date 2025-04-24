// Variabili globali
const rows = 6,
  cols = 7;
let currentPlayer = "rosso",
  gameBoard = [],
  winningDirections = [],
  gameOver = false,
  gameCount = 0; // Contatore per tenere traccia del numero di partite giocate

// Variabili per il sistema di punteggio
let scores = {
  rosso: {
    wins: 0,
    yellowCards: 0,
    redCards: 0,
  },
  giallo: {
    wins: 0,
    yellowCards: 0,
    redCards: 0,
  },
};

// Funzione per caricare le direzioni di vittoria dal file JSON
async function loadWinningDirections() {
  try {
    const response = await fetch("directions.json");
    const data = await response.json();
    winningDirections = data.directions;
  } catch (error) {
    console.error("Errore nel caricamento delle direzioni:", error);
    // Direzioni di default in caso di errore
    winningDirections = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];
  }
}

// Funzione per generare la griglia di gioco
function createBoard() {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = ""; // Resetta la griglia esistente

  // Aggiungi attributi ARIA per accessibilità
  boardDiv.setAttribute("role", "grid");
  boardDiv.setAttribute("aria-label", "Griglia di gioco Forza 4");

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.onclick = () => dropPiece(j);

      // Aggiungi attributi per accessibilità
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("tabindex", "0");
      cell.setAttribute(
        "aria-label",
        `Cella vuota, riga ${i + 1}, colonna ${j + 1}`
      );

      // Aggiungi gestione tastiera per accessibilità
      cell.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          dropPiece(j);
        }
      });

      boardDiv.appendChild(cell);
    }
  }
  resetGame();
  loadScores(); // Carica i punteggi salvati
  updateScoreDisplay(); // Aggiorna la visualizzazione dei punteggi
  initializeTimeline(); // Inizializza la timeline
  updateCardButtonsState(); // Aggiorna lo stato dei pulsanti dei cartellini
}

// Funzione per ottenere la riga vuota in cui posizionare la pedina
function getEmptyRow(col) {
  for (let i = rows - 1; i >= 0; i--) if (!gameBoard[i][col]) return i;
  return -1; // Colonna piena
}

// Funzione per verificare le combinazioni vincenti
function checkWin(row, col) {
  for (const [dx, dy] of winningDirections) {
    let count = 1;
    const winningCells = [[row, col]];

    // Controlla nella direzione positiva
    for (let i = 1; i < 4; i++) {
      const newRow = row + i * dx,
        newCol = col + i * dy;
      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        gameBoard[newRow][newCol] === currentPlayer
      ) {
        count++;
        winningCells.push([newRow, newCol]);
      } else break;
    }

    // Controlla nella direzione negativa
    for (let i = -1; i > -4; i--) {
      const newRow = row + i * dx,
        newCol = col + i * dy;
      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        gameBoard[newRow][newCol] === currentPlayer
      ) {
        count++;
        winningCells.push([newRow, newCol]);
      } else break;
    }

    if (count >= 4) {
      highlightWinningCells(winningCells); // Evidenzia le celle vincenti
      return true;
    }
  }

  return false;
}

// Funzione per evidenziare le celle vincenti
function highlightWinningCells(cells) {
  cells.forEach(([row, col]) => {
    const cell = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    cell.classList.add("winning");
  });
}

// Funzione per attivare l'animazione delle celle vincenti
function highlightWinningCellsAnimation() {
  const winningCells = document.querySelectorAll(".winning"),
    winClass = currentPlayer === "rosso" ? "rossoWin" : "gialloWin";
  winningCells.forEach((cell) => {
    cell.classList.add(winClass);
  });
}

// Funzione per aggiornare l'indicatore del giocatore corrente
function updateCurrentPlayerIndicator() {
  const indicator = document.getElementById("currentPlayerIndicator");

  // Rimuovi tutte le classi di colore
  indicator.classList.remove("rosso", "giallo");

  // Aggiungi la classe del giocatore corrente
  indicator.classList.add(currentPlayer);

  // Aggiorna l'attributo aria-label per l'accessibilità
  indicator.setAttribute("aria-label", `Giocatore ${currentPlayer}`);

  // Aggiungi l'animazione
  indicator.classList.add("animatedIndicator");

  // Rimuovi l'animazione dopo che è stata eseguita una volta
  setTimeout(() => {
    indicator.classList.remove("animatedIndicator");
  }, 1500);
}

// Funzione per aggiornare la UI della griglia
function updateBoardUI() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);

      // Rimuovi tutte le classi di colore e vincita
      cell.classList.remove(
        "rosso",
        "giallo",
        "winning",
        "rossoWin",
        "gialloWin"
      );

      // Aggiungi la classe appropriata in base allo stato della cella
      if (gameBoard[i][j]) {
        cell.classList.add(gameBoard[i][j]);
        cell.setAttribute(
          "aria-label",
          `Cella con gettone ${gameBoard[i][j]}, riga ${i + 1}, colonna ${
            j + 1
          }`
        );
      } else {
        cell.setAttribute(
          "aria-label",
          `Cella vuota, riga ${i + 1}, colonna ${j + 1}`
        );
      }
    }
  }
}

function dropPiece(col) {
  if (gameOver) return; // Impedisce di giocare dopo la vittoria

  const row = getEmptyRow(col);
  if (row !== -1) {
    gameBoard[row][col] = currentPlayer;
    const cell = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    cell.classList.add(currentPlayer);

    // Aggiorna l'attributo aria-label per l'accessibilità
    cell.setAttribute(
      "aria-label",
      `Cella con gettone ${currentPlayer}, riga ${row + 1}, colonna ${col + 1}`
    );

    // Aggiungi evento alla timeline con il pallino colorato
    addTimelineEvent(
      `Giocatore ${currentPlayer} ha inserito un gettone nella colonna ${
        col + 1
      }`,
      false,
      currentPlayer
    );

    // Aggiungi feedback sonoro (opzionale)
    playDropSound();

    // Verifica la vittoria
    if (checkWin(row, col)) {
      gameOver = true; // Impedisce di continuare a giocare
      highlightWinningCellsAnimation();

      // Aggiorna il punteggio
      scores[currentPlayer].wins++;
      saveScores();
      updateScoreDisplay();

      // Aggiorna la timeline
      addTimelineEvent(
        `Giocatore ${currentPlayer} ha vinto la partita!`,
        true,
        currentPlayer
      );

      updateWinnerMessage(
        `Il ${currentPlayer === "rosso" ? "Rosso" : "Giallo"} ha vinto! 🏆🎉`
      );

      // Disabilita i pulsanti dei cartellini
      updateCardButtonsState();
    } else if (isBoardFull()) {
      gameOver = true;

      // Aggiorna la timeline
      const nextPlayer = gameCount % 2 === 0 ? "giallo" : "rosso";
      addTimelineEvent(
        `Partita terminata in pareggio! La prossima partita inizierà il giocatore ${nextPlayer}.`,
        true
      );

      updateWinnerMessage("Pareggio! 😲 Nessuno ha vinto.");

      // Disabilita i pulsanti dei cartellini
      updateCardButtonsState();
    } else {
      currentPlayer = currentPlayer === "rosso" ? "giallo" : "rosso";
      updateCurrentPlayerIndicator();
    }
  } else {
    // Feedback per colonna piena
    showColumnFullFeedback(col);
  }
}

// Funzione per mostrare feedback quando una colonna è piena
function showColumnFullFeedback(col) {
  const columnCells = document.querySelectorAll(`[data-col="${col}"]`);
  columnCells.forEach((cell) => {
    cell.classList.add("column-full-feedback");
    setTimeout(() => {
      cell.classList.remove("column-full-feedback");
    }, 500);
  });
}

// Funzione per riprodurre un suono quando viene inserito un gettone (opzionale)
function playDropSound() {
  // Implementazione opzionale del suono
  // const sound = new Audio('drop-sound.mp3');
  // sound.play();
}

const isBoardFull = () =>
  gameBoard.every((row) => row.every((cell) => cell !== null));

// Funzione per aggiornare lo stato dei pulsanti dei cartellini
function updateCardButtonsState() {
  const yellowCardButtons = document.querySelectorAll(".yellow-card");
  const redCardButtons = document.querySelectorAll(".red-card");

  // Disabilita o abilita i pulsanti in base allo stato della partita
  yellowCardButtons.forEach((button) => {
    button.disabled = gameOver;
  });

  redCardButtons.forEach((button) => {
    button.disabled = gameOver;
  });
}

// Modifica la funzione resetGame per alternare i giocatori iniziali
function resetGame() {
  gameOver = false;
  gameBoard = Array.from({ length: rows }, () => Array(cols).fill(null));

  // Incrementa il contatore delle partite
  gameCount++;

  // Determina il giocatore iniziale in base al numero della partita
  // Prima partita (gameCount = 1): rosso, Seconda (gameCount = 2): giallo, ecc.
  currentPlayer = gameCount % 2 === 1 ? "rosso" : "giallo";

  document.getElementById("currentPlayerContainer").innerHTML = `
    <span>Turno:</span>
    <div id="currentPlayerIndicator" class="cell ${currentPlayer}" aria-label="Giocatore ${currentPlayer}"></div>
  `;

  document.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove(
      "rosso",
      "giallo",
      "winning",
      "rossoWin",
      "gialloWin"
    );

    // Reimposta gli attributi ARIA
    const row = cell.dataset.row;
    const col = cell.dataset.col;
    cell.setAttribute(
      "aria-label",
      `Cella vuota, riga ${Number.parseInt(row) + 1}, colonna ${
        Number.parseInt(col) + 1
      }`
    );
  });

  updateCurrentPlayerIndicator();

  // Resetta i cartellini per entrambi i giocatori
  scores.rosso.yellowCards = 0;
  scores.rosso.redCards = 0;
  scores.giallo.yellowCards = 0;
  scores.giallo.redCards = 0;

  // Salva e aggiorna il display dei punteggi
  saveScores();
  updateScoreDisplay();

  // Abilita i pulsanti dei cartellini
  updateCardButtonsState();

  // Aggiungi evento alla timeline
  addTimelineEvent(
    `Nuova partita iniziata. Inizia il giocatore ${currentPlayer}.`,
    false,
    currentPlayer
  );

  // Annuncia il reset del gioco per screen reader
  announceForScreenReader(
    `Nuova partita iniziata. Turno del giocatore ${currentPlayer}.`
  );
}

// Funzione per annunciare messaggi per screen reader
function announceForScreenReader(message) {
  const announcer = document.createElement("div");
  announcer.setAttribute("aria-live", "assertive");
  announcer.setAttribute("class", "sr-only");
  announcer.textContent = message;
  document.body.appendChild(announcer);

  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
}

// Funzione per aggiornare il messaggio di stato (turno o vincitore)
function updateWinnerMessage(message) {
  const container = document.getElementById("currentPlayerContainer");

  // Determina la classe CSS appropriata
  let messageClass = "";
  if (gameOver) {
    if (isBoardFull()) {
      messageClass = "draw";
    } else if (currentPlayer === "rosso") {
      messageClass = "rossoWin";
    } else {
      messageClass = "gialloWin";
    }
  }

  container.innerHTML = `<span class="victoryMessage ${messageClass}">${message}</span>`;

  // Annuncia il messaggio per screen reader
  announceForScreenReader(message);
}

// Funzioni per il sistema di punteggio
function updateScoreDisplay() {
  // Aggiorna i valori visualizzati
  document.getElementById("rossoWins").textContent = scores.rosso.wins;
  document.getElementById("rossoYellowCards").textContent =
    scores.rosso.yellowCards;
  document.getElementById("rossoRedCards").textContent = scores.rosso.redCards;

  document.getElementById("gialloWins").textContent = scores.giallo.wins;
  document.getElementById("gialloYellowCards").textContent =
    scores.giallo.yellowCards;
  document.getElementById("gialloRedCards").textContent =
    scores.giallo.redCards;
}

function saveScores() {
  localStorage.setItem("forza4Scores", JSON.stringify(scores));
}

function loadScores() {
  const savedScores = localStorage.getItem("forza4Scores");
  if (savedScores) {
    scores = JSON.parse(savedScores);
  }
}

function resetStats() {
  // Conferma prima di resettare
  if (confirm("Sei sicuro di voler azzerare tutte le statistiche?")) {
    scores = {
      rosso: {
        wins: 0,
        yellowCards: 0,
        redCards: 0,
      },
      giallo: {
        wins: 0,
        yellowCards: 0,
        redCards: 0,
      },
    };

    saveScores();
    updateScoreDisplay();

    // Aggiorna la timeline
    addTimelineEvent("Statistiche azzerate");

    // Feedback per l'utente
    announceForScreenReader("Statistiche azzerate con successo");
  }
}

// Funzione per aggiungere cartellini e verificare la squalifica
function addCard(player, cardType) {
  // Verifica se la partita è in corso
  if (gameOver) {
    // Mostra un messaggio di errore o feedback
    announceForScreenReader(
      "Non puoi assegnare cartellini a partita terminata"
    );
    return;
  }

  const opponent = player === "rosso" ? "giallo" : "rosso";

  if (cardType === "yellow") {
    scores[player].yellowCards++;
    addTimelineEvent(
      `Cartellino GIALLO assegnato al giocatore ${player}`,
      false,
      player
    );

    // Verifica se il giocatore ha raggiunto 3 cartellini gialli
    if (scores[player].yellowCards >= 3) {
      // Il giocatore ha perso per accumulo di cartellini gialli
      handleDisqualification(player, opponent, "3 cartellini gialli");
    }
  } else if (cardType === "red") {
    scores[player].redCards++;
    addTimelineEvent(
      `Cartellino ROSSO assegnato al giocatore ${player}`,
      false,
      player
    );

    // Verifica se il giocatore ha ricevuto un cartellino rosso
    if (scores[player].redCards >= 1) {
      // Il giocatore ha perso per cartellino rosso
      handleDisqualification(player, opponent, "cartellino rosso");
    }
  }

  saveScores();
  updateScoreDisplay();

  // Animazione per evidenziare l'aggiornamento
  const elementId = `${player}${cardType === "yellow" ? "Yellow" : "Red"}Cards`;
  const element = document.getElementById(elementId);
  element.classList.add("stat-updated");

  setTimeout(() => {
    element.classList.remove("stat-updated");
  }, 600);
}

// Funzione per gestire la squalifica di un giocatore
function handleDisqualification(player, opponent, reason) {
  gameOver = true;

  // Aggiorna il punteggio del vincitore
  scores[opponent].wins++;
  saveScores();
  updateScoreDisplay();

  // Aggiorna la timeline
  addTimelineEvent(
    `Giocatore ${player} squalificato per ${reason}!`,
    true,
    player
  );
  addTimelineEvent(
    `Giocatore ${opponent} ha vinto la partita per squalifica!`,
    true,
    opponent
  );

  // Mostra il messaggio di squalifica
  const container = document.getElementById("currentPlayerContainer");
  container.innerHTML = `
    <div class="disqualification-message">
      ${player === "rosso" ? "ROSSO" : "GIALLO"} squalificato: ${reason}
    </div>
    <div>Vittoria a ${opponent === "rosso" ? "ROSSO" : "GIALLO"}</div>
    <button onclick="resetGame()" class="new-game-button">
      Gioca di nuovo
    </button>
  `;

  // Disabilita i pulsanti dei cartellini
  updateCardButtonsState();

  // Annuncia la squalifica per screen reader
  announceForScreenReader(
    `Giocatore ${player} squalificato per ${reason}. Vittoria assegnata al giocatore ${opponent}.`
  );
}

// Funzioni per la timeline
function initializeTimeline() {
  const timeline = document.getElementById("timeline");
  timeline.innerHTML =
    '<div class="empty-timeline">Nessun evento registrato</div>';
}

// Funzione modificata per aggiungere eventi alla timeline con pallino colorato
function addTimelineEvent(message, isImportant = false, playerColor = null) {
  const timeline = document.getElementById("timeline");

  // Rimuovi il messaggio "vuoto" se presente
  const emptyMessage = timeline.querySelector(".empty-timeline");
  if (emptyMessage) {
    timeline.removeChild(emptyMessage);
  }

  // Crea l'elemento dell'evento
  const eventElement = document.createElement("div");

  // Determina la classe in base al giocatore corrente
  let eventClass = "timeline-event";
  if (isImportant) {
    eventClass += " important-event";
  } else if (
    message.includes("Rosso") ||
    message.includes("rosso") ||
    playerColor === "rosso"
  ) {
    eventClass += " rosso-event";
  } else if (
    message.includes("Giallo") ||
    message.includes("giallo") ||
    playerColor === "giallo"
  ) {
    eventClass += " giallo-event";
  }

  eventElement.className = eventClass;

  // Ottieni l'ora corrente
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Determina l'icona appropriata
  let icon = "🔄";
  if (message.includes("vinto")) {
    icon = "🏆";
  } else if (message.includes("gettone")) {
    icon = playerColor === "rosso" ? "🔴" : "🟡";
  } else if (message.includes("GIALLO")) {
    icon = "🟨";
  } else if (message.includes("ROSSO")) {
    icon = "🟥";
  } else if (message.includes("pareggio")) {
    icon = "🤝";
  } else if (message.includes("Statistiche")) {
    icon = "🗑️";
  } else if (message.includes("squalificato")) {
    icon = "⛔";
  }

  // Crea il pallino colorato per il giocatore
  let playerDot = "";
  if (playerColor) {
    playerDot = `<span class="player-dot ${playerColor}"></span>`;
  }

  // Imposta il contenuto HTML
  eventElement.innerHTML = `
    <div class="timeline-event-icon">${icon}</div>
    <div class="timeline-event-text">${playerDot}${message}</div>
    <div class="timeline-event-time">${timeString}</div>
  `;

  // Aggiungi l'evento all'inizio della timeline
  timeline.insertBefore(eventElement, timeline.firstChild);

  // Limita il numero di eventi nella timeline (opzionale)
  const maxEvents = 20;
  const events = timeline.querySelectorAll(".timeline-event");
  if (events.length > maxEvents) {
    timeline.removeChild(events[events.length - 1]);
  }
}

// Inizializza la griglia di gioco all'avvio della pagina
async function initializeGame() {
  await loadWinningDirections(); // Carica le direzioni di vittoria
  createBoard();
}

// Avvia il gioco
document.addEventListener("DOMContentLoaded", initializeGame);
