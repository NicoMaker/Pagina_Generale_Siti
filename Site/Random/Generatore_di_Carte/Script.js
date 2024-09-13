let suitImages = {},
  cardValues = {};

const initialize = () =>
    document
      .getElementById("generateButton")
      .addEventListener("click", startCardAnimation),
  displayCard = (card) =>
    (document.getElementById(
      "card"
    ).innerHTML = `<img src="${card.image}" alt="${card.suit}"> <br> ${card.value}`),
  isValidGameType = (gameType) => Object.keys(cardValues).includes(gameType),
  getRandomCard = (gameType) => {
    return {
      suit: (suits = Object.keys(cardValues[gameType]))[
        Math.floor(Math.random() * suits.length)
      ],
      value: (values =
        cardValues[gameType][suits[Math.floor(Math.random() * suits.length)]])[
        Math.floor(Math.random() * values.length)
      ],
      image: suitImages[suits[Math.floor(Math.random() * suits.length)]],
    };
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
  displayCard(card);
}

function startCardAnimation() {
  const randomGenerator = setInterval(generateCard, 150);

  setTimeout(() => {
    clearInterval(randomGenerator);
    generateCard();
  }, 500);
}

fetchData().then(initialize);
