const suitImages = {
  Coppe:
    "https://ih1.redbubble.net/image.3006511618.8602/st,small,507x507-pad,600x600,f8f8f8.jpg",
  Denari:
    "https://ih1.redbubble.net/image.1648092438.5340/st,small,507x507-pad,600x600,f8f8f8.jpg",
  Spade:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUvEjPGRmsR8oKNgLqynsIOa2ykLTB-IVZGQ5GtqHT1g&s",
  Bastoni:
    "https://ih1.redbubble.net/image.1112458171.9010/st,small,845x845-pad,1000x1000,f8f8f8.jpg",
  Cuori: "https://keyplayingcards.com/img/cms/carte-cuori.png",
  Quadri:
    "https://www.chipotlescreazioni.it/3411/ciondolo-seme-di-quadri-carte-da-poker-40x36-mm-plexiglass-rosso.jpg",
  Fiori:
    "https://keyplayingcards.com/img/cms/blog%20mazzi/1200px-SuitClubs-svg.png",
  Picche:
    "https://img.freepik.com/free-vector/spade-playing-card-symbol_1308-80063.jpg",
};

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
    suit = suits[randomSuitIndex],
    value = cardValues[randomValueIndex],
    cardImage = suitImages[suit],
    card = `<img src="${cardImage}" alt="${suit}" style="width: 70px; height: auto;"> ${value}`;
  document.getElementById("card").innerHTML = card;
}
