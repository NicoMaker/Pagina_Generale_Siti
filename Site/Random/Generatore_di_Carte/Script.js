const suitImages = {
  Coppe: "Img/Briscola/Coppe.png",
  Denari: "Img/Briscola/Denari.png",
  Spade: "Img/Briscola/Spade.png",
  Bastoni: "Img/Briscola/Bastoni.png",
  Cuori: "Img/Scala 40/Cuori.png",
  Quadri: "Img/Scala 40/Quadri.png",
  Fiori: "Img/Scala 40/Fiori.png",
  Picche: "Img/Scala 40/Picche.png",
};

function generateCard() {
  const gameType = document.getElementById("game-type").value,
    suits =
      gameType === "briscola"
        ? ["Coppe", "Denari", "Spade", "Bastoni"]
        : gameType === "scala-40"
        ? ["Cuori", "Quadri", "Fiori", "Picche"]
        : [
            "Coppe",
            "Denari",
            "Spade",
            "Bastoni",
            "Cuori",
            "Quadri",
            "Fiori",
            "Picche",
          ],
    cardValues =
      gameType === "briscola"
        ? ["Asso", "2", "3", "4", "5", "6", "7", "Fante", "Cavallo", "Re"]
        : gameType === "scala-40"
        ? ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
        : [
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
            "A",
            "8",
            "9",
            "10",
            "J",
            "Q",
            "K",
          ],
    randomSuitIndex = Math.floor(Math.random() * suits.length),
    randomValueIndex = Math.floor(Math.random() * cardValues.length),
    suit = suits[randomSuitIndex],
    value = cardValues[randomValueIndex],
    cardImage = suitImages[suit],
    cardElement = document.getElementById("card");

  cardElement.innerHTML = `<img src="${cardImage}" alt="${suit}"> <br> ${value}`;
}

document
  .getElementById("generateButton")
  .addEventListener("click", function () {
    const randomGenerator = setInterval(generateCard, 150);

    setTimeout(() => {
      clearInterval(randomGenerator);
      generateCard();
    }, 500);
  });
