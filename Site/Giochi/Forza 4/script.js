// Variabili globali
const rows = 6,
  cols = 7;
let currentPlayer = "rosso",
  gameBoard = [],
  winningDirections = [],
  gameOver = false;

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

    // Aggiungi feedback sonoro (opzionale)
    playDropSound();

    // Verifica la vittoria
    if (checkWin(row, col)) {
      gameOver = true; // Impedisce di continuare a giocare
      highlightWinningCellsAnimation();
      updateWinnerMessage(
        `Il ${currentPlayer === "rosso" ? "Rosso" : "Giallo"} ha vinto! 🏆🎉`
      );
    } else if (isBoardFull()) {
      gameOver = true;
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

// Inizializza la griglia di gioco all'avvio della pagina
async function initializeGame() {
  await loadWinningDirections(); // Carica le direzioni di vittoria
  createBoard();
}

// Avvia il gioco
document.addEventListener("DOMContentLoaded", initializeGame);
