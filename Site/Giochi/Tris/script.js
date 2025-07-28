let currentPlayer = "X",
  gameEnded = false,
  board = Array(9).fill(""),
  winPatterns = [];

document.addEventListener("DOMContentLoaded", initializeGame);

// Inizializza il gioco caricando la configurazione
function initializeGame() {
  loadConfig().then(() => {
    createGameBoard();
    updateTurnIndicator();
  });
}

// Carica il file JSON con le combinazioni vincenti
async function loadConfig() {
  try {
    const response = await fetch("config.json");
    const data = await response.json();
    winPatterns = data.winCombinations;
  } catch (error) {
    console.error("Errore nel caricamento del JSON:", error);
  }
}

// Crea la griglia di gioco dinamicamente
function createGameBoard() {
  const gameBoard = document.getElementById("game-board");
  gameBoard.innerHTML = "";

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("data-index", i);
    cell.addEventListener("click", () => handleCellClick(i));

    gameBoard.appendChild(cell);
  }
}

// Gestisce il click su una cella
function handleCellClick(index) {
  if (board[index] !== "" || gameEnded) return;

  board[index] = currentPlayer;
  updateUI(index);
  checkWin();

  if (!gameEnded) togglePlayer();
}

// Cambia il giocatore corrente
function togglePlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurnIndicator();
}

// Aggiorna l'interfaccia utente
function updateUI(index) {
  document.getElementsByClassName("cell")[index].textContent = currentPlayer;
}

// Aggiorna il turno visualizzato
function updateTurnIndicator() {
  document.getElementById("turn-indicator").textContent =
    `Turno del giocatore: ${currentPlayer}`;
}

// Controlla se c'è un vincitore o un pareggio
function checkWin() {
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      highlightWin(pattern);
      endGame(board[a]);
      return;
    }
  }

  if (!board.includes("") && !gameEnded) endGame("draw");
}

// Evidenzia le celle vincenti
function highlightWin(cells) {
  gameEnded = true;
  cells.forEach((index) => {
    document.getElementsByClassName("cell")[index].classList.add("win-cell");
  });
}

// Termina la partita e mostra il vincitore
function endGame(winner) {
  gameEnded = true;
  setTimeout(() =>
    alert(
      winner === "draw"
        ? "È un pareggio! 😐"
        : `Giocatore ${winner} vince! 🏆🎉`,
    ),
  );
}

// Resetta il tabellone e riavvia la partita
function resetBoard() {
  currentPlayer = "X";
  gameEnded = false;
  board.fill("");

  document.querySelectorAll(".cell").forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("win-cell");
  });

  updateTurnIndicator();
}
