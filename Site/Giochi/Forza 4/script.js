// Variabili globali
const rows = 6,
  cols = 7;
let currentPlayer = "rosso",
  gameBoard = [],
  winningDirections = [],
  gameOver = false; // Nuova variabile per controllare se la partita è finita

// Funzione per caricare le direzioni di vittoria dal file JSON
async function loadWinningDirections() {
  const response = await fetch("directions.json"),
    data = await response.json();
  winningDirections = data.directions;
}

// Funzione per generare la griglia di gioco
function createBoard() {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = ""; // Resetta la griglia esistente
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.onclick = () => dropPiece(j);
      boardDiv.appendChild(cell);
    }
  }
  resetGame();
}


// Funzione per ottenere la riga vuota in cui posizionare la pedina
function getEmptyRow(col) {
  for (let i = rows - 1; i >= 0; i--) {
    if (!gameBoard[i][col]) return i;
  }
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
  indicator.className = currentPlayer; // Aggiorna il colore
}


// Inizializza la griglia di gioco all'avvio della pagina
async function initializeGame() {
  await loadWinningDirections(); // Carica le direzioni di vittoria
  createBoard();
}

// Avvia il gioco
initializeGame();

// Aggiungo un bottone per resettare la partita manualmente
document.getElementById("resetButton").addEventListener("click", resetGame);

function dropPiece(col) {
  if (gameOver) return; // Impedisce di giocare dopo la vittoria

  const row = getEmptyRow(col);
  if (row !== -1) {
    gameBoard[row][col] = currentPlayer;
    const cell = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    cell.classList.add(currentPlayer);

    if (checkWin(row, col)) {
      gameOver = true; // Impedisce di continuare a giocare
      highlightWinningCellsAnimation();
      updateWinnerMessage(`${currentPlayer} ha vinto! 🏆🎉😊`);
    } else if (isBoardFull()) {
      gameOver = true;
      updateWinnerMessage("Pareggio! 😲 Nessuno ha vinto.");
    } else {
      currentPlayer = currentPlayer === "rosso" ? "giallo" : "rosso";
      updateCurrentPlayerIndicator();
    }
  }
}

// Funzione per verificare se la griglia è piena (pareggio)
function isBoardFull() {
  return gameBoard.every((row) => row.every((cell) => cell !== null));
}

// Funzione per aggiornare il messaggio di stato (turno o vincitore)


// Modifica la funzione resetGame per ripristinare il turno
function resetGame() {
  gameOver = false;
  gameBoard = Array.from({ length: rows }, () => Array(cols).fill(null));

  document.getElementById("currentPlayerContainer").innerHTML = `
    <span>Turno:</span>
    <div id="currentPlayerIndicator" class="cell rosso"></div>
  `;

  document.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove(
      "rosso",
      "giallo",
      "winning",
      "rossoWin",
      "gialloWin"
    );
  });

  currentPlayer = "rosso";
  updateCurrentPlayerIndicator();
}

// Funzione per aggiornare il messaggio di stato (turno o vincitore)
function updateWinnerMessage(message) {
  const container = document.getElementById("currentPlayerContainer");
  container.innerHTML = `<span class="${currentPlayer} victoryMessage">${message}</span>`;

  const winnerMessage = container.querySelector("span");

  if (currentPlayer === "rosso") winnerMessage.classList.add("rossoWin");
  else if (currentPlayer === "giallo") winnerMessage.classList.add("gialloWin");
  else if (message === "Pareggio! 😲 Nessuno ha vinto.")
    winnerMessage.classList.add("draw"); // Aggiungi la classe "draw" per il pareggio

  winnerMessage.style.padding = "10px";
  winnerMessage.style.borderRadius = "5px";
}

// Funzione per aggiornare l'indicatore del giocatore corrente
function updateCurrentPlayerIndicator() {
  const indicator = document.getElementById("currentPlayerIndicator");
  indicator.className = currentPlayer; // Aggiorna il colore
  indicator.classList.add("animatedIndicator"); // Aggiungi l'animazione

  // Rimuovi l'animazione dopo che è stata eseguita una volta
  setTimeout(() => {
    indicator.classList.remove("animatedIndicator");
  }, 1500); // Rimuovi l'animazione dopo 1,5 secondi (durata dell'animazione)
}

// Inizializza il gioco (attiva l'animazione per il primo turno)
async function initializeGame() {
  await loadWinningDirections(); // Carica le direzioni di vittoria
  createBoard();
  updateCurrentPlayerIndicator(); // Aggiungi l'animazione all'inizio
}
