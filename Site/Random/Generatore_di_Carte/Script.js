// Global variables
let suitImages = {};
let cardValues = {};
let cardHistory = [];
const MAX_HISTORY = 10;

// Initialize the application
const initialize = () => {
  // Add event listeners
  document
    .getElementById("generateButton")
    .addEventListener("click", startCardAnimation);

  // Set up game option buttons
  const gameOptions = document.querySelectorAll(".game-option");
  const gameSelect = document.getElementById("game-type");

  // Set first option as active
  gameOptions[0].classList.add("active");

  gameOptions.forEach((option) => {
    option.addEventListener("click", () => {
      // Remove active class from all options
      gameOptions.forEach((opt) => opt.classList.remove("active"));

      // Add active class to clicked option
      option.classList.add("active");

      // Update select value
      gameSelect.value = option.getAttribute("data-game");
    });
  });

  // Sync select with options
  gameSelect.addEventListener("change", () => {
    gameOptions.forEach((opt) => {
      if (opt.getAttribute("data-game") === gameSelect.value) {
        opt.classList.add("active");
      } else {
        opt.classList.remove("active");
      }
    });
  });
};

// Display a card
const displayCard = (card) => {
  const cardElement = document.getElementById("card");

  // Add flip animation
  cardElement.classList.add("card-flip");

  // Format card text based on card type
  let cardText;
  if (card.suit === "Jolly") {
    // Special format for Jolly cards
    cardText = `Jolly ${card.value.toLowerCase()}`;
  } else {
    // Standard format for regular cards
    cardText = `${card.value} di ${card.suit}`;
  }

  // Update card content
  setTimeout(() => {
    cardElement.innerHTML = `
      <img src="${card.image}" alt="${card.suit}" class="card-image">
      <div class="card-value">${cardText}</div>
    `;

    // Remove animation class after animation completes
    setTimeout(() => {
      cardElement.classList.remove("card-flip");
    }, 500);
  }, 250);
};

// Check if game type is valid
const isValidGameType = (gameType) =>
  Object.keys(cardValues).includes(gameType);

// Get a random card
const getRandomCard = (gameType) => {
  if (!isValidGameType(gameType)) return null;

  // Handle "tutti" game type
  let effectiveGameType = gameType;

  // Get random suit and value
  const suits = Object.keys(cardValues[effectiveGameType]);
  const suit = suits[Math.floor(Math.random() * suits.length)];
  const values = cardValues[effectiveGameType][suit];
  const value = values[Math.floor(Math.random() * values.length)];
  const image = suitImages[suit];

  return { suit, value, image };
};

// Fetch card data from JSON
function fetchData() {
  return fetch("cardsData.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      suitImages = data.suitImages;
      cardValues = data.cardValues;
    })
    .catch((error) => {
      console.error("Error fetching JSON:", error);
      showErrorMessage("Errore nel caricamento dei dati delle carte.");
    });
}

// Generate a random card
function generateCard() {
  const gameType = document.getElementById("game-type").value;

  if (!isValidGameType(gameType)) {
    showErrorMessage("Seleziona un tipo di gioco valido.");
    return;
  }

  const card = getRandomCard(gameType);
  if (card) {
    displayCard(card);
    addToHistory(card);
  }
}

// Start card animation
function startCardAnimation() {
  // Add pulse animation to button
  const button = document.getElementById("generateButton");
  button.classList.add("pulse");
  setTimeout(() => {
    button.classList.remove("pulse");
  }, 300);

  // Hide placeholder
  document.querySelector(".card-placeholder").style.display = "none";

  // Create shuffling effect
  let counter = 0;
  const maxIterations = 8;
  const randomGenerator = setInterval(() => {
    generateCard();
    counter++;

    if (counter >= maxIterations) {
      clearInterval(randomGenerator);
      generateCard();
    }
  }, 100);
}

// Add card to history
function addToHistory(card) {
  // Add to beginning of array
  cardHistory.unshift(card);

  // Limit history size
  if (cardHistory.length > MAX_HISTORY) {
    cardHistory.pop();
  }

  // Update history display
  updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
  const historyContainer = document.getElementById("history-container");
  historyContainer.innerHTML = "";

  if (cardHistory.length === 0) {
    historyContainer.innerHTML =
      "<p class='no-history'>Nessuna carta estratta</p>";
    return;
  }

  cardHistory.forEach((card, index) => {
    const historyCard = document.createElement("div");
    historyCard.className = "history-card card-deal";
    historyCard.style.animationDelay = `${index * 0.05}s`;

    // Format card text for history items
    let cardText;
    if (card.suit === "Jolly") {
      cardText = `Jolly ${card.value.toLowerCase()}`;
    } else {
      cardText = card.value;
    }

    historyCard.innerHTML = `
      <img src="${card.image}" alt="${card.suit}">
      <div class="history-value">${cardText}</div>
    `;

    // Add click event to display this card again
    historyCard.addEventListener("click", () => {
      displayCard(card);
    });

    historyContainer.appendChild(historyCard);
  });
}

// Show error message
function showErrorMessage(message) {
  const cardElement = document.getElementById("card");
  cardElement.innerHTML = `
    <div class="error-message">
      <div class="error-icon">⚠️</div>
      <p>${message}</p>
    </div>
  `;
}

// Initialize the application when data is loaded
fetchData().then(initialize);
