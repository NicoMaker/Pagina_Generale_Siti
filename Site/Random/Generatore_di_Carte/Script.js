let suitImages = {},
  cardValues = {};

fetch("cardsData.json")
  .then((response) => response.json())
  .then((data) => {
    suitImages = data.suitImages;
    cardValues = data.cardValues;
  })
  .catch((error) => console.error("Error fetching JSON:", error));

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
