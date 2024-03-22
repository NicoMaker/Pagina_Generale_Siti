const suitImages = {
  Coppe: "Immagini/Briscola/Coppe.png",
  Denari: "Immagini/Briscola/Denari.png",
  Spade: "Immagini/Briscola/Spade.png",
  Bastoni: "Immagini/Briscola/Bastoni.png",
  Cuori: "Immagini/Scala 40/Cuori.png",
  Quadri: "Immagini/Scala 40/Quadri.png",
  Fiori: "Immagini/Scala 40/Fiori.png",
  Picche: "Immagini/Scala 40/Picche.png",
};

function generateCard() {
  const gameType = document.getElementById("game-type").value,
    suits =
      gameType === "briscola"
        ? ["Coppe", "Denari", "Spade", "Bastoni"]
        : ["Cuori", "Quadri", "Fiori", "Picche"],
    cardValues =
      gameType === "briscola"
        ? ["Asso", "2", "3", "4", "5", "6", "7", "Fante", "Cavallo", "Re"]
        : ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
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