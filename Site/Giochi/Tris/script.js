let currentPlayer = "X",
  gameEnded = false,
  board = ["", "", "", "", "", "", "", "", ""];

document.addEventListener("DOMContentLoaded", function () {
  createGameBoard();
});

function createGameBoard() {
  let gameBoard = document.getElementById("game-board");

  for (let i = 0; i < 9; i++) {
    let cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("data-index", i);
    cell.addEventListener("click", function () {
      makeMove(this.getAttribute("data-index"));
    });

    gameBoard.appendChild(cell);
  }
}

function makeMove(index) {
  if (board[index] === "" && !gameEnded) {
    board[index] = currentPlayer;
    document.getElementsByClassName("cell")[index].textContent = currentPlayer;
    checkWin();
    togglePlayer();
  }
}

const togglePlayer = () => (currentPlayer = currentPlayer === "X" ? "O" : "X");

function checkWin() {
  let winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < winningCombinations.length; i++) {
    let [a, b, c] = winningCombinations[i];
    if (board[a] !== "" && board[a] === board[b] && board[a] === board[c]) {
      endGame(board[a]);
      break;
    }
  }

  if (!board.includes("") && !gameEnded) endGame("draw");
}

function endGame(winner) {
  gameEnded = true;
  let message =
    winner === "draw" ? "It's a draw!" : "Player " + winner + " wins!";
  alert(message);
}

function resetBoard() {
  currentPlayer = "X";
  gameEnded = false;
  board = ["", "", "", "", "", "", "", "", ""];
  let cells = document.getElementsByClassName("cell");
  for (let i = 0; i < cells.length; i++) cells[i].textContent = "";
}
