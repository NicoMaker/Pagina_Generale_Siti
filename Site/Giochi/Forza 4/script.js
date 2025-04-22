// Variabili globali
const rows = 6,
  cols = 7;
let currentPlayer = "rosso",
  gameBoard = [],
  winningDirections = [],
  gameOver = false;

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

    // Aggiungi evento alla timeline
    addTimelineEvent(
      `Giocatore ${currentPlayer} ha inserito un gettone nella colonna ${
        col + 1
      }`
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
      addTimelineEvent(`Giocatore ${currentPlayer} ha vinto la partita!`, true);

      updateWinnerMessage(
        `Il ${currentPlayer === "rosso" ? "Rosso" : "Giallo"} ha vinto! 🏆🎉`
      );
    } else if (isBoardFull()) {
      gameOver = true;

      // Aggiorna la timeline
      addTimelineEvent(`Partita terminata in pareggio!`, true);

      updateWinnerMessage("Pareggio! 😲 Nessuno ha vinto.");
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

// Modifica la funzione resetGame per ripristinare il turno
function resetGame() {
  gameOver = false;
  gameBoard = Array.from({ length: rows }, () => Array(cols).fill(null));

  document.getElementById("currentPlayerContainer").innerHTML = `
    <span>Turno:</span>
    <div id="currentPlayerIndicator" class="cell rosso" aria-label="Giocatore rosso"></div>
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

  currentPlayer = "rosso";
  updateCurrentPlayerIndicator();

  // Aggiungi evento alla timeline
  addTimelineEvent("Nuova partita iniziata");

  // Annuncia il reset del gioco per screen reader
  announceForScreenReader("Nuova partita iniziata. Turno del giocatore rosso.");
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

// Funzione per aggiungere cartellini
function addCard(player, cardType) {
  if (cardType === "yellow") {
    scores[player].yellowCards++;
    addTimelineEvent(`Cartellino GIALLO assegnato al giocatore ${player}`);
  } else if (cardType === "red") {
    scores[player].redCards++;
    addTimelineEvent(`Cartellino ROSSO assegnato al giocatore ${player}`);
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

// Funzioni per la timeline
function initializeTimeline() {
  const timeline = document.getElementById("timeline");
  timeline.innerHTML =
    '<div class="empty-timeline">Nessun evento registrato</div>';
}

function addTimelineEvent(message, isImportant = false) {
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
  } else if (message.includes("Rosso") || message.includes("rosso")) {
    eventClass += " rosso-event";
  } else if (message.includes("Giallo") || message.includes("giallo")) {
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
    icon = currentPlayer === "rosso" ? "🔴" : "🟡";
  } else if (message.includes("GIALLO")) {
    icon = "🟨";
  } else if (message.includes("ROSSO")) {
    icon = "🟥";
  } else if (message.includes("pareggio")) {
    icon = "🤝";
  } else if (message.includes("Statistiche")) {
    icon = "🗑️";
  }

  // Imposta il contenuto HTML
  eventElement.innerHTML = `
    <div class="timeline-event-icon">${icon}</div>
    <div class="timeline-event-text">${message}</div>
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
