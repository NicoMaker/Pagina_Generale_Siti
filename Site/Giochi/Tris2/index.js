var playerTurn, moves, isGameOver, span, restartButton;
playerTurn = "x";
moves = 0;
isGameOver = false;
span = document.getElementsByTagName("span");
restartButton = `
  <button onclick="playAgain()">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
      <path d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/>
    </svg>
  </button>`;

function play(y) {
  if (y.dataset.player == "none" && window.isGameOver == false) {
    y.innerHTML = playerTurn;
    y.dataset.player = playerTurn;
    moves++;
    if (playerTurn == "x") {
      playerTurn = "o";
    } else if (playerTurn == "o") {
      playerTurn = "x";
    }
  }

  checkWinner(1, 2, 3);
  checkWinner(4, 5, 6);
  checkWinner(7, 8, 9);
  checkWinner(1, 4, 7);
  checkWinner(2, 5, 8);
  checkWinner(3, 6, 9);
  checkWinner(1, 5, 9);
  checkWinner(3, 5, 7);
  if (moves == 9 && isGameOver == false) {
    draw();
  }
}

function checkWinner(a, b, c) {
  a--;
  b--;
  c--;
  if (
    span[a].dataset.player === span[b].dataset.player &&
    span[b].dataset.player === span[c].dataset.player &&
    span[a].dataset.player === span[c].dataset.player &&
    (span[a].dataset.player === "x" || span[a].dataset.player === "o") &&
    isGameOver == false
  ) {
    span[a].parentNode.className += " activeBox";
    span[b].parentNode.className += " activeBox";
    span[c].parentNode.className += " activeBox";
    gameOver(a);
  }
}

function playAgain() {
  document
    .getElementsByClassName("alert")[0]
    .parentNode.removeChild(document.getElementsByClassName("alert")[0]);
  resetGame();
  window.isGameOver = false;
  for (var k = 0; k < span.length; k++)
    span[k].parentNode.className = span[k].parentNode.className.replace(
      "activeBox",
      ""
    );
}

function resetGame() {
  for (i = 0; i < span.length; i++) {
    span[i].dataset.player = "none";
    span[i].innerHTML = "&nbsp;";
  }
  playerTurn = "x";
}

function gameOver(a) {
  let gameOverAlertElement = `
      <b>GAME OVER </b><br><br> Player ${span[a].dataset.player.toUpperCase()} Win !!! <br><br>
      ${restartButton}`,
    div = document.createElement("div");
  div.className = "alert";
  div.innerHTML = gameOverAlertElement;
  document.getElementsByTagName("body")[0].appendChild(div);
  window.isGameOver = true;
  moves = 0;
}

function draw() {
  var drawAlertElement = `
      <b>DRAW!!!</b><br><br>
      ${restartButton}`,
    div = document.createElement("div");
  div.className = "alert";
  div.innerHTML = drawAlertElement;
  document.getElementsByTagName("body")[0].appendChild(div);
  window.gameOver = true;
  moves = 0;
}
