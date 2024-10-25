let suitImages = {},
  cardValues = {};

const initialize = () => {
    document
      .getElementById("generateButton")
      .addEventListener("click", startCardAnimation);
  },
  displayCard = (card) => {
    document.getElementById(
      "card"
    ).innerHTML = `<img src="${card.image}" alt="${card.suit}"> <br> ${card.value}`;
  },
  isValidGameType = (gameType) => Object.keys(cardValues).includes(gameType),
  getRandomCard = (gameType) => {
    if (!isValidGameType(gameType)) return null;
    const suits = Object.keys(cardValues[gameType]),
      suit = suits[Math.floor(Math.random() * suits.length)],
      values = cardValues[gameType][suit],
      value = values[Math.floor(Math.random() * values.length)],
      image = suitImages[suit];

    return { suit, value, image };
  };

function fetchData() {
  return fetch("cardsData.json")
    .then((response) => response.json())
    .then((data) => {
      suitImages = data.suitImages;
      cardValues = data.cardValues;
    })
    .catch((error) => console.error("Error fetching JSON:", error));
}

function generateCard() {
  const gameType = document.getElementById("game-type").value;

  if (!isValidGameType(gameType)) {
    alert("Please select a valid game type.");
    return;
  }

  const card = getRandomCard(gameType);
  if (card) displayCard(card);
}

function startCardAnimation() {
  const randomGenerator = setInterval(generateCard, 150);

  setTimeout(() => {
    clearInterval(randomGenerator);
    generateCard();
  }, 500);
}

fetchData().then(initialize);
