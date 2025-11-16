// Variabili globali
const rows = 6,
  cols = 7;
let currentPlayer = "rosso",
  gameBoard = [],
  winningDirections = [],
  gameOver = false,
  gameInProgress = false,
  gameCount = 0;

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
  boardDiv.innerHTML = "";

  boardDiv.setAttribute("role", "grid");
  boardDiv.setAttribute("aria-label", "Griglia di gioco Forza 4");

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.onclick = () => dropPiece(j);

      cell.setAttribute("role", "gridcell");
      cell.setAttribute("tabindex", "0");
      cell.setAttribute(
        "aria-label",
        `Cella vuota, riga ${i + 1}, colonna ${j + 1}`,
      );

      cell.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          dropPiece(j);
        }
      });

      boardDiv.appendChild(cell);
    }
  }
  resetGame();
  loadScores();
  updateScoreDisplay();
  initializeTimeline();
  updateCardButtonsState();
  updateButtonStates();
}

function getEmptyRow(col) {
  for (let i = rows - 1; i >= 0; i--) if (!gameBoard[i][col]) return i;
  return -1;
}

function checkWin(row, col) {
  for (const [dx, dy] of winningDirections) {
    let count = 1;
    const winningCells = [[row, col]];

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

    for (let i = -1; i > -4; i--) {
      const newRow = row + i * dx,
        newCol = col + i * dy;
      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol < cols &&
        gameBoard[newRow][newCol] === currentPlayer
      ) {
        count++;
        winningCells.push([newRow, newCol]);
      } else break;
    }

    if (count >= 4) {
      highlightWinningCells(winningCells);
      return true;
    }
  }

  return false;
}

function highlightWinningCells(cells) {
  cells.forEach(([row, col]) => {
    const cell = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`,
    );
    cell.classList.add("winning");
  });
}

function highlightWinningCellsAnimation() {
  const winningCells = document.querySelectorAll(".winning"),
    winClass = currentPlayer === "rosso" ? "rossoWin" : "gialloWin";
  winningCells.forEach((cell) => {
    cell.classList.add(winClass);
  });
}

function updateCurrentPlayerIndicator() {
  const indicator = document.getElementById("currentPlayerIndicator");

  indicator.classList.remove("rosso", "giallo");
  indicator.classList.add(currentPlayer);
  indicator.setAttribute("aria-label", `Giocatore ${currentPlayer}`);

  indicator.classList.add("animatedIndicator");

  setTimeout(() => {
    indicator.classList.remove("animatedIndicator");
  }, 1500);
}

function updateBoardUI() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);

      cell.classList.remove(
        "rosso",
        "giallo",
        "winning",
        "rossoWin",
        "gialloWin",
      );

      if (gameBoard[i][j]) {
        cell.classList.add(gameBoard[i][j]);
        cell.setAttribute(
          "aria-label",
          `Cella con gettone ${gameBoard[i][j]}, riga ${i + 1}, colonna ${
            j + 1
          }`,
        );
      } else {
        cell.setAttribute(
          "aria-label",
          `Cella vuota, riga ${i + 1}, colonna ${j + 1}`,
        );
      }
    }
  }
}

function dropPiece(col) {
  if (gameOver) return;

  const row = getEmptyRow(col);
  if (row !== -1) {
    gameBoard[row][col] = currentPlayer;
    const cell = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`,
    );
    cell.classList.add(currentPlayer);

    cell.setAttribute(
      "aria-label",
      `Cella con gettone ${currentPlayer}, riga ${row + 1}, colonna ${col + 1}`,
    );

    addTimelineEvent(
      `Giocatore ${currentPlayer} ha inserito un gettone nella colonna ${
        col + 1
      }`,
      false,
      currentPlayer,
    );

    playDropSound();

    if (checkWin(row, col)) {
      gameOver = true;
      gameInProgress = false;
      highlightWinningCellsAnimation();

      scores[currentPlayer].wins++;
      saveScores();
      updateScoreDisplay();

      addTimelineEvent(
        `Giocatore ${currentPlayer} ha vinto la partita!`,
        true,
        currentPlayer,
      );

      updateWinnerMessage(
        `Il ${currentPlayer === "rosso" ? "Rosso" : "Giallo"} ha vinto! 🏆🎉`,
      );

      updateCardButtonsState();
      updateButtonStates();
    } else if (isBoardFull()) {
      gameOver = true;
      gameInProgress = false;

      const nextPlayer = gameCount % 2 === 0 ? "giallo" : "rosso";
      addTimelineEvent(
        `Partita terminata in pareggio! La prossima partita inizierà il giocatore ${nextPlayer}.`,
        true,
      );

      updateWinnerMessage("Pareggio! 😲 Nessuno ha vinto.");

      updateCardButtonsState();
      updateButtonStates();
    } else {
      currentPlayer = currentPlayer === "rosso" ? "giallo" : "rosso";
      updateCurrentPlayerIndicator();
    }
  } else {
    showColumnFullFeedback(col);
  }
}

function showColumnFullFeedback(col) {
  const columnCells = document.querySelectorAll(`[data-col="${col}"]`);
  columnCells.forEach((cell) => {
    cell.classList.add("column-full-feedback");
    setTimeout(() => {
      cell.classList.remove("column-full-feedback");
    }, 500);
  });
}

function playDropSound() {
  // Implementazione opzionale del suono
}

const isBoardFull = () =>
  gameBoard.every((row) => row.every((cell) => cell !== null));

function updateCardButtonsState() {
  const yellowCardButtons = document.querySelectorAll(".yellow-card");
  const redCardButtons = document.querySelectorAll(".red-card");

  yellowCardButtons.forEach((button) => {
    button.disabled = gameOver;
  });

  redCardButtons.forEach((button) => {
    button.disabled = gameOver;
  });
}

function updateButtonStates() {
  const resetCurrentButton = document.getElementById("resetCurrentGameButton");
  const resetButton = document.getElementById("resetButton");

  if (gameInProgress) {
    // Partita in corso: Ricomincia abilitato, Nuova Partita disabilitato
    resetCurrentButton.disabled = false;
    resetCurrentButton.classList.remove("disabled-btn");
    resetButton.disabled = true;
    resetButton.classList.add("disabled-btn");
  } else {
    // Partita finita: Nuova Partita abilitato, Ricomincia disabilitato
    resetCurrentButton.disabled = true;
    resetCurrentButton.classList.add("disabled-btn");
    resetButton.disabled = false;
    resetButton.classList.remove("disabled-btn");
  }
}

function resetGame() {
  // Verifica se la partita è in corso
  if (gameInProgress) {
    announceForScreenReader(
      "Non puoi iniziare una nuova partita mentre una è in corso! Usa 'Ricomincia Partita' per ricominciare.",
    );
    return;
  }

  gameOver = false;
  gameInProgress = true;
  gameBoard = Array.from({ length: rows }, () => Array(cols).fill(null));

  gameCount++;

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
      "gialloWin",
    );

    const row = cell.dataset.row;
    const col = cell.dataset.col;
    cell.setAttribute(
      "aria-label",
      `Cella vuota, riga ${Number.parseInt(row) + 1}, colonna ${
        Number.parseInt(col) + 1
      }`,
    );
  });

  updateCurrentPlayerIndicator();

  scores.rosso.yellowCards = 0;
  scores.rosso.redCards = 0;
  scores.giallo.yellowCards = 0;
  scores.giallo.redCards = 0;

  saveScores();
  updateScoreDisplay();

  updateCardButtonsState();
  updateButtonStates();

  addTimelineEvent(
    `Nuova partita iniziata. Inizia il giocatore ${currentPlayer}.`,
    false,
    currentPlayer,
  );

  announceForScreenReader(
    `Nuova partita iniziata. Turno del giocatore ${currentPlayer}.`,
  );
}

function resetCurrentGame() {
  // Verifica se la partita è in corso
  if (!gameInProgress) {
    announceForScreenReader(
      "Non puoi ricominciare una partita già conclusa. Inizia una nuova partita.",
    );
    return;
  }

  gameOver = false;
  gameBoard = Array.from({ length: rows }, () => Array(cols).fill(null));

  // Mantieni lo stesso giocatore che ha iniziato questa partita
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
      "gialloWin",
    );

    const row = cell.dataset.row;
    const col = cell.dataset.col;
    cell.setAttribute(
      "aria-label",
      `Cella vuota, riga ${Number.parseInt(row) + 1}, colonna ${
        Number.parseInt(col) + 1
      }`,
    );
  });

  updateCurrentPlayerIndicator();

  updateCardButtonsState();

  addTimelineEvent(
    `Partita corrente ricominciata. Continua il giocatore ${currentPlayer}.`,
    false,
    currentPlayer,
  );

  announceForScreenReader(
    `Partita corrente ricominciata. Turno del giocatore ${currentPlayer}.`,
  );
}

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

function updateWinnerMessage(message) {
  const container = document.getElementById("currentPlayerContainer");

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

  announceForScreenReader(message);
}

function updateScoreDisplay() {
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

// MODAL LOGIC START
const resetStatsModal = document.getElementById("resetStatsModal");
const confirmResetStatsButton = document.getElementById(
  "confirmResetStatsButton",
);
const cancelResetStatsButton = document.getElementById(
  "cancelResetStatsButton",
);

function showResetStatsModal() {
  resetStatsModal.classList.add("modal-active");
  resetStatsModal.setAttribute("aria-hidden", "false");
  confirmResetStatsButton.focus();
}

function hideResetStatsModal() {
  resetStatsModal.classList.remove("modal-active");
  resetStatsModal.setAttribute("aria-hidden", "true");
}

function performResetStats() {
  gameCount = 0;
  gameOver = false;
  gameInProgress = true;

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

  gameBoard = Array.from({ length: rows }, () => Array(cols).fill(null));
  gameCount = 1;
  currentPlayer = "rosso";

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
      "gialloWin",
    );

    const row = cell.dataset.row;
    const col = cell.dataset.col;
    cell.setAttribute(
      "aria-label",
      `Cella vuota, riga ${Number.parseInt(row) + 1}, colonna ${
        Number.parseInt(col) + 1
      }`,
    );
  });

  updateCurrentPlayerIndicator();
  updateCardButtonsState();
  updateButtonStates();
  initializeTimeline();

  addTimelineEvent("Reset totale completato. Inizia il giocatore rosso.", false, "rosso");

  announceForScreenReader("Reset totale completato con successo");
  hideResetStatsModal();
}

confirmResetStatsButton.addEventListener("click", performResetStats);
cancelResetStatsButton.addEventListener("click", hideResetStatsModal);

resetStatsModal.addEventListener("click", (event) => {
  if (event.target === resetStatsModal) {
    hideResetStatsModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    resetStatsModal.classList.contains("modal-active")
  ) {
    hideResetStatsModal();
  }
});
// MODAL LOGIC END

function addCard(player, cardType) {
  if (gameOver) {
    announceForScreenReader(
      "Non puoi assegnare cartellini a partita terminata",
    );
    return;
  }

  const opponent = player === "rosso" ? "giallo" : "rosso";

  if (cardType === "yellow") {
    scores[player].yellowCards++;
    addTimelineEvent(
      `Cartellino GIALLO assegnato al giocatore ${player}`,
      false,
      player,
    );

    if (scores[player].yellowCards >= 3) {
      handleDisqualification(player, opponent, "3 cartellini gialli");
    }
  } else if (cardType === "red") {
    scores[player].redCards++;
    addTimelineEvent(
      `Cartellino ROSSO assegnato al giocatore ${player}`,
      false,
      player,
    );

    if (scores[player].redCards >= 1) {
      handleDisqualification(player, opponent, "cartellino rosso");
    }
  }

  saveScores();
  updateScoreDisplay();

  const elementId = `${player}${cardType === "yellow" ? "Yellow" : "Red"}Cards`;
  const element = document.getElementById(elementId);
  element.classList.add("stat-updated");

  setTimeout(() => {
    element.classList.remove("stat-updated");
  }, 600);
}

function handleDisqualification(player, opponent, reason) {
  gameOver = true;
  gameInProgress = false;

  scores[opponent].wins++;
  saveScores();
  updateScoreDisplay();

  addTimelineEvent(
    `Giocatore ${player} squalificato per ${reason}!`,
    true,
    player,
  );
  addTimelineEvent(
    `Giocatore ${opponent} ha vinto la partita per squalifica!`,
    true,
    opponent,
  );

  const container = document.getElementById("currentPlayerContainer");
  container.innerHTML = `
    <div class="disqualification-message">
      ${player === "rosso" ? "ROSSO" : "GIALLO"} squalificato: ${reason}
    </div>
    <div>Vittoria a ${opponent === "rosso" ? "ROSSO" : "GIALLO"}</div>
  `;

  updateCardButtonsState();
  updateButtonStates();

  announceForScreenReader(
    `Giocatore ${player} squalificato per ${reason}. Vittoria assegnata al giocatore ${opponent}.`,
  );
}

function initializeTimeline() {
  const timeline = document.getElementById("timeline");
  timeline.innerHTML =
    '<div class="empty-timeline">Nessun evento registrato</div>';
}

function addTimelineEvent(message, isImportant = false, playerColor = null) {
  const timeline = document.getElementById("timeline");

  const emptyMessage = timeline.querySelector(".empty-timeline");
  if (emptyMessage) {
    timeline.removeChild(emptyMessage);
  }

  const eventElement = document.createElement("div");

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

  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

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
  } else if (message.includes("Reset")) {
    icon = "🗑️";
  } else if (message.includes("squalificato")) {
    icon = "⛔";
  }

  let playerDot = "";
  if (playerColor) {
    playerDot = `<span class="player-dot ${playerColor}"></span>`;
  }

  eventElement.innerHTML = `
    <div class="timeline-event-icon">${icon}</div>
    <div class="timeline-event-text">${playerDot}${message}</div>
    <div class="timeline-event-time">${timeString}</div>
  `;

  timeline.insertBefore(eventElement, timeline.firstChild);

  const maxEvents = 20;
  const events = timeline.querySelectorAll(".timeline-event");
  if (events.length > maxEvents) {
    timeline.removeChild(events[events.length - 1]);
  }
}

async function initializeGame() {
  await loadWinningDirections();
  createBoard();
}

document.addEventListener("DOMContentLoaded", initializeGame);