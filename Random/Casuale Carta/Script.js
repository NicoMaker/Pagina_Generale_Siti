function generateCard() {
  let gameType = document.getElementById("game-type").value;

  if (gameType === "briscola") {
    let suits = ["Coppe", "Denari", "Spade", "Bastoni"],
      cardValues = [
        "Asso",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "Fante",
        "Cavallo",
        "Re",
      ];
    RandomCard(suits, cardValues);
  } else if (gameType === "scala-40") {
    let suits = ["Cuori", "Quadri", "Fiori", "Picche"],
      cardValues = [
        "A",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K",
      ];
    RandomCard(suits, cardValues);
  }
}

function RandomCard(suits, cardValues) {
  let randomSuitIndex = Math.floor(Math.random() * suits.length),
    randomValueIndex = Math.floor(Math.random() * cardValues.length),
    suit = `${suits[randomSuitIndex]} : `,
    value = cardValues[randomValueIndex],
    card = suit + value;
  document.getElementById("card").innerHTML = card;
}