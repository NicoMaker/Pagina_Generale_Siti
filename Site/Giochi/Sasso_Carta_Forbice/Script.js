// Funzione principale per avviare il gioco
function playGame() {
  const options = ["sasso", "carta", "forbice"],
    player1 = getPlayerName("player1"),
    player2 = getPlayerName("player2"),
    player1Choice = getRandomChoice(options),
    player2Choice = getRandomChoice(options);

  displayChoices(player1, player1Choice, player2, player2Choice);
  displayWinner(
    determineWinner(player1Choice, player2Choice, player1, player2)
  );
}

const getPlayerName = (playerId) => document.getElementById(playerId).value,
  getRandomChoice = (options) =>
    options[Math.floor(Math.random() * options.length)],
  displayChoices = (player1, player1Choice, player2, player2Choice) =>
    (document.getElementById(
      "result"
    ).innerHTML = `${player1} : ${player1Choice} <br> ${player2} : ${player2Choice}`),
  determineWinner = (choice1, choice2, player1, player2) =>
    choice1 === choice2
      ? "Pareggio!"
      : (choice1 === "sasso" && choice2 === "forbice") ||
        (choice1 === "carta" && choice2 === "sasso") ||
        (choice1 === "forbice" && choice2 === "carta")
      ? `Giocatore 1 ${player1} vince!`
      : `Giocatore 2 ${player2} vince!`,
  displayWinner = (winner) =>
    (document.getElementById("winner").innerHTML = winner),
  Regole = () =>
    alert(
      "------------------------------- REGOLE -------------------------------\n\n" +
        "SASSO VINCE SU FORBICI MA PERDE CON CARTA\n" +
        "CARTA VINCE SU SASSO MA PERDE CON FORBICI\n" +
        "FORBICI VINCONO SU CARTA MA PERDONO CON SASSO\n" +
        "SE SONO UGUALI, IL RISULTATO È UN PAREGGIO"
    );

function setupGame() {
  document.getElementById("generateButton").addEventListener("click", () => {
    const interval = setInterval(playGame, 150);
    setTimeout(() => {
      clearInterval(interval);
      playGame();
    }, 500);
  });

  document.getElementById("rulesButton").addEventListener("click", showRules);
}

setupGame();
