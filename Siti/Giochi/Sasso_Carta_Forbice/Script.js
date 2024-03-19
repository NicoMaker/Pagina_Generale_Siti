function playGame() {
  let player1 = Player1();
  let player2 = Player2();

  let options = ["sasso", "carta", "forbice"];

  let player1Choice = ResultGenerate(options);
  let player2Choice = ResultGenerate(options);

  document.getElementById(
    "result"
  ).innerHTML = `${player1} : ${player1Choice} <br> ${player2} : ${player2Choice}`;

  let winner = determineWinner(player1Choice, player2Choice, player1, player2);
  document.getElementById("winner").innerHTML = winner;
}

let Player1 = () => document.getElementById("player1").value;
let Player2 = () => document.getElementById("player2").value;

let ResultGenerate = (options) =>
  options[Math.floor(Math.random() * options.length)];

function determineWinner(choice1, choice2, player1, player2) {
  if (choice1 === choice2) {
    return "Pareggio!";
  } else if (
    (choice1 === "sasso" && choice2 === "forbice") ||
    (choice1 === "carta" && choice2 === "sasso") ||
    (choice1 === "forbice" && choice2 === "carta")
  ) {
    return `Giocatore 1 ${player1} vince!`;
  } else {
    return `Giocatore 2 ${player2} vince!`;
  }
}

let Regole = () =>
  alert(
    "------------------------------- REGOLE -------------------------------\n\n" +
      "SASSO VINCE SU FORBICI MA PERDE CON CARTA\n" +
      "CARTA VINCE SU SASSO MA PERDE CON FORBICI\n" +
      "FORBICI VINCONO SU CARTA MA PERDONO CON SASSO\n" +
      "SE SONO UGUALI, IL RISULTATO È UN PAREGGIO"
  );
