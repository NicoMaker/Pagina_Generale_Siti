const suitImages = {
    Coppe: "Img/Briscola/Coppe.png",
    Denari: "Img/Briscola/Denari.png",
    Spade: "Img/Briscola/Spade.png",
    Bastoni: "Img/Briscola/Bastoni.png",
    Cuori: "Img/Scala 40/Cuori.png",
    Quadri: "Img/Scala 40/Quadri.png",
    Fiori: "Img/Scala 40/Fiori.png",
    Picche: "Img/Scala 40/Picche.png",
  },
  cardValues = {
    briscola: {
      Coppe: ["Asso", "2", "3", "4", "5", "6", "7", "Fante", "Cavallo", "Re"],
      Denari: ["Asso", "2", "3", "4", "5", "6", "7", "Fante", "Cavallo", "Re"],
      Spade: ["Asso", "2", "3", "4", "5", "6", "7", "Fante", "Cavallo", "Re"],
      Bastoni: ["Asso", "2", "3", "4", "5", "6", "7", "Fante", "Cavallo", "Re"],
    },
    "scala-40": {
      Cuori: ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
      Quadri: [
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
      ],
      Fiori: ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
      Picche: [
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
      ],
    },
    tutti: {
      Coppe: ["Asso", "2", "3", "4", "5", "6", "7", "Fante", "Cavallo", "Re"],
      Denari: ["Asso", "2", "3", "4", "5", "6", "7", "Fante", "Cavallo", "Re"],
      Spade: ["Asso", "2", "3", "4", "5", "6", "7", "Fante", "Cavallo", "Re"],
      Bastoni: ["Asso", "2", "3", "4", "5", "6", "7", "Fante", "Cavallo", "Re"],
      Cuori: ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
      Quadri: [
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
      ],
      Fiori: ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
      Picche: [
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
      ],
    },
  };

function generateCard() {
  const gameType = document.getElementById("game-type").value;

  if (!["briscola", "scala-40", "tutti"].includes(gameType)) {
    alert("Please select a valid game type.");
    return;
  }

  const suits = Object.keys(cardValues[gameType]),
    randomSuitIndex = Math.floor(Math.random() * suits.length),
    suit = suits[randomSuitIndex],
    values = cardValues[gameType][suit],
    randomValueIndex = Math.floor(Math.random() * values.length),
    value = values[randomValueIndex],
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
