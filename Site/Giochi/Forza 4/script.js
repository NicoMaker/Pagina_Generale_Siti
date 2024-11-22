// Variabili globali
const rows = 6,
  cols = 7;
let currentPlayer = "rosso",
  gameBoard = [];

// Funzione per generare la griglia di gioco
function createBoard() {
  const boardDiv = document.getElementById("board");
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

// Funzione per inserire una pedina
function dropPiece(col) {
  const row = getEmptyRow(col);
  if (row !== -1) {
    gameBoard[row][col] = currentPlayer;
    const cell = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    cell.classList.add(currentPlayer);
    if (checkWin(row, col)) {
      alert(`Il giocatore ${currentPlayer} 🏆🎉😊 ha vinto!`);
    } else {
      currentPlayer = currentPlayer === "rosso" ? "giallo" : "rosso";
    }
  }
}

// Funzione per ottenere la riga vuota in cui posizionare la pedina
function getEmptyRow(col) {
  for (let i = rows - 1; i >= 0; i--) {
    if (!gameBoard[i][col]) {
      return i;
    }
  }
  return -1; // Colonna piena
}

// Funzione per verificare le combinazioni vincenti
function checkWin(row, col) {
  const directions = [
    [0, 1], // Destra
    [1, 0], // Giù
    [1, 1], // Giù a destra
    [1, -1], // Giù a sinistra
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    for (let i = 1; i < 4; i++) {
      const newRow = row + i * dx,
        newCol = col + i * dy;
      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        gameBoard[newRow][newCol] === currentPlayer
      )
        count++;
      else break;
    }
    for (let i = -1; i > -4; i--) {
      const newRow = row + i * dx,
        newCol = col + i * dy;
      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        gameBoard[newRow][newCol] === currentPlayer
      )
        count++;
      else break;
    }

    if (count >= 4) return true;
  }

  return false;
}

// Funzione per resettare il gioco
function resetGame() {
  gameBoard = Array.from({ length: rows }, () => Array(cols).fill(null));
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    cell.classList.remove("rosso", "giallo");
  });
  currentPlayer = "rosso";
}

createBoard(); // Inizializza la griglia di gioco all'avvio della pagina
