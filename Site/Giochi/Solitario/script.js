document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM
  const newGameBtn = document.getElementById("new-game-btn");
  const rulesBtn = document.getElementById("rules-btn");
  const rulesModal = document.getElementById("rules-modal");
  const winModal = document.getElementById("win-modal");
  const closeBtn = document.querySelector(".close");
  const playAgainBtn = document.getElementById("play-again-btn");
  const deckElement = document.getElementById("deck");
  const wasteElement = document.getElementById("waste");
  const handElement = document.getElementById("hand");
  const combinationsElement = document.getElementById("combinations");
  const scoreElement = document.getElementById("score");
  const movesElement = document.getElementById("moves");
  const timerElement = document.getElementById("timer");
  const finalScoreElement = document.getElementById("final-score");
  const finalTimeElement = document.getElementById("final-time");
  const finalMovesElement = document.getElementById("final-moves");

  // Variabili di gioco
  let deck = [];
  let waste = [];
  let hand = [];
  let combinations = [];
  let selectedCards = [];
  let score = 0;
  let moves = 0;
  let gameStarted = false;
  let timerInterval;
  let startTime;

  // Costanti
  const SUITS = ["hearts", "diamonds", "clubs", "spades"];
  const VALUES = [
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
  const CARD_VALUES = {
    A: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    J: 11,
    Q: 12,
    K: 13,
    JOKER: 0,
  };
  const SUIT_SYMBOLS = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  };

  // Inizializzazione del gioco
  function initGame() {
    resetGame();
    createDeck();
    shuffleDeck();
    dealInitialHand();
    renderGame();
    startTimer();
    gameStarted = true;
  }

  // Reset del gioco
  function resetGame() {
    deck = [];
    waste = [];
    hand = [];
    combinations = [];
    selectedCards = [];
    score = 0;
    moves = 0;
    gameStarted = false;
    clearInterval(timerInterval);
    updateStats();
  }

  // Creazione del mazzo
  function createDeck() {
    // Due mazzi standard
    for (let i = 0; i < 2; i++) {
      for (const suit of SUITS) {
        for (const value of VALUES) {
          deck.push({
            suit,
            value,
            id: `${value}-${suit}-${i}`,
          });
        }
      }
      // Aggiungi 2 jolly per mazzo
      deck.push({ suit: "joker", value: "JOKER", id: `joker-${i}-1` });
      deck.push({ suit: "joker", value: "JOKER", id: `joker-${i}-2` });
    }
  }

  // Mischia il mazzo
  function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  // Distribuisci le carte iniziali
  function dealInitialHand() {
    for (let i = 0; i < 13; i++) {
      if (deck.length > 0) {
        hand.push(deck.pop());
      }
    }
    // Ordina la mano per valore e seme
    sortHand();
  }

  // Ordina la mano
  function sortHand() {
    hand.sort((a, b) => {
      if (a.suit === "joker") return 1;
      if (b.suit === "joker") return -1;
      if (a.suit !== b.suit)
        return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
      return CARD_VALUES[a.value] - CARD_VALUES[b.value];
    });
  }

  // Pesca una carta
  function drawCard() {
    if (deck.length === 0) {
      // Se il mazzo è vuoto, mescola gli scarti
      if (waste.length > 1) {
        const topWaste = waste.pop();
        deck = [...waste];
        waste = [topWaste];
        shuffleDeck();
      } else {
        alert("Non ci sono più carte nel mazzo!");
        return;
      }
    }

    hand.push(deck.pop());
    sortHand();
    moves++;
    updateStats();
    renderGame();
  }

  // Scarta una carta
  function discardCard(cardIndex) {
    if (cardIndex >= 0 && cardIndex < hand.length) {
      const card = hand.splice(cardIndex, 1)[0];
      waste.push(card);
      moves++;
      updateStats();
      renderGame();

      // Controlla se il gioco è finito
      checkWinCondition();
    }
  }

  // Seleziona/deseleziona una carta
  function toggleCardSelection(cardIndex) {
    const cardId = hand[cardIndex].id;
    const selectionIndex = selectedCards.indexOf(cardId);

    if (selectionIndex === -1) {
      selectedCards.push(cardId);
    } else {
      selectedCards.splice(selectionIndex, 1);
    }

    renderHand();
  }

  // Verifica se le carte selezionate formano una combinazione valida
  function checkCombination() {
    if (selectedCards.length < 3) {
      alert("Seleziona almeno 3 carte per formare una combinazione.");
      return false;
    }

    const selectedCardObjects = selectedCards.map((id) =>
      hand.find((card) => card.id === id),
    );

    // Controlla se è un tris/poker (stesso valore, semi diversi)
    const isSameValue = selectedCardObjects.every(
      (card) =>
        card.suit === "joker" ||
        card.value === selectedCardObjects[0].value ||
        selectedCardObjects[0].suit === "joker",
    );

    // Controlla se è una scala (stesso seme, valori consecutivi)
    let isSequence = false;
    if (!isSameValue) {
      // Filtra i jolly per il controllo della sequenza
      const nonJokers = selectedCardObjects.filter(
        (card) => card.suit !== "joker",
      );
      const jokerCount = selectedCardObjects.length - nonJokers.length;

      // Controlla se tutte le carte non jolly sono dello stesso seme
      const sameSuit = nonJokers.every(
        (card) => card.suit === nonJokers[0].suit,
      );

      if (sameSuit) {
        // Ordina per valore
        const sortedCards = [...nonJokers].sort(
          (a, b) => CARD_VALUES[a.value] - CARD_VALUES[b.value],
        );

        // Controlla se i valori sono consecutivi (considerando i jolly)
        let gaps = 0;
        for (let i = 1; i < sortedCards.length; i++) {
          const gap =
            CARD_VALUES[sortedCards[i].value] -
            CARD_VALUES[sortedCards[i - 1].value] -
            1;
          if (gap > 0) gaps += gap;
        }

        isSequence = gaps <= jokerCount;
      }
    }

    if (isSameValue || isSequence) {
      // Crea la combinazione
      const combination = {
        id: Date.now(),
        cards: selectedCardObjects,
        type: isSameValue ? "set" : "sequence",
      };

      // Rimuovi le carte dalla mano
      for (const cardId of selectedCards) {
        const index = hand.findIndex((card) => card.id === cardId);
        if (index !== -1) {
          hand.splice(index, 1);
        }
      }

      combinations.push(combination);
      selectedCards = [];

      // Aggiorna il punteggio
      score += combination.cards.length * 10;
      if (combination.type === "sequence" && combination.cards.length >= 5) {
        score += 20; // Bonus per scale lunghe
      }

      moves++;
      updateStats();
      renderGame();

      // Controlla se il gioco è finito
      checkWinCondition();

      return true;
    } else {
      alert("Le carte selezionate non formano una combinazione valida.");
      return false;
    }
  }

  // Controlla se il giocatore ha vinto
  function checkWinCondition() {
    if (hand.length === 0) {
      endGame();
    }
  }

  // Termina il gioco
  function endGame() {
    clearInterval(timerInterval);
    gameStarted = false;

    // Calcola il punteggio finale
    const timeBonus = Math.max(0, 1000 - getElapsedTime());
    score += timeBonus;

    // Aggiorna gli elementi del modal
    finalScoreElement.textContent = score;
    finalTimeElement.textContent = formatTime(getElapsedTime());
    finalMovesElement.textContent = moves;

    // Mostra il modal di vittoria
    winModal.style.display = "block";
  }

  // Avvia il timer
  function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
      timerElement.textContent = formatTime(getElapsedTime());
    }, 1000);
  }

  // Ottieni il tempo trascorso in secondi
  function getElapsedTime() {
    return Math.floor((Date.now() - startTime) / 1000);
  }

  // Formatta il tempo in mm:ss
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  // Aggiorna le statistiche
  function updateStats() {
    scoreElement.textContent = score;
    movesElement.textContent = moves;
  }

  // Rendering del gioco
  function renderGame() {
    renderDeck();
    renderWaste();
    renderHand();
    renderCombinations();
  }

  // Rendering del mazzo
  function renderDeck() {
    deckElement.innerHTML = "";
    if (deck.length > 0) {
      const cardBack = document.createElement("div");
      cardBack.className = "card-back";
      deckElement.appendChild(cardBack);

      // Aggiungi il contatore delle carte
      const counter = document.createElement("div");
      counter.className = "deck-counter";
      counter.textContent = deck.length;
      counter.style.position = "absolute";
      counter.style.bottom = "5px";
      counter.style.right = "5px";
      counter.style.backgroundColor = "white";
      counter.style.padding = "2px 6px";
      counter.style.borderRadius = "10px";
      counter.style.fontSize = "12px";
      counter.style.fontWeight = "bold";
      deckElement.appendChild(counter);

      // Aggiungi l'evento click
      deckElement.style.cursor = "pointer";
      deckElement.onclick = drawCard;
    } else {
      deckElement.style.cursor = "default";
      deckElement.onclick = null;
    }
  }

  // Rendering degli scarti
  function renderWaste() {
    wasteElement.innerHTML = "";
    if (waste.length > 0) {
      const topCard = waste[waste.length - 1];
      const cardElement = createCardElement(topCard);
      wasteElement.appendChild(cardElement);

      // Aggiungi il contatore delle carte
      if (waste.length > 1) {
        const counter = document.createElement("div");
        counter.className = "waste-counter";
        counter.textContent = waste.length;
        counter.style.position = "absolute";
        counter.style.bottom = "5px";
        counter.style.right = "5px";
        counter.style.backgroundColor = "white";
        counter.style.padding = "2px 6px";
        counter.style.borderRadius = "10px";
        counter.style.fontSize = "12px";
        counter.style.fontWeight = "bold";
        wasteElement.appendChild(counter);
      }
    }
  }

  // Rendering della mano
  function renderHand() {
    handElement.innerHTML = "";
    hand.forEach((card, index) => {
      const cardElement = createCardElement(card);

      // Aggiungi la classe selected se la carta è selezionata
      if (selectedCards.includes(card.id)) {
        cardElement.classList.add("selected");
      }

      // Aggiungi gli eventi
      cardElement.onclick = () => toggleCardSelection(index);
      cardElement.ondblclick = () => discardCard(index);

      handElement.appendChild(cardElement);
    });
  }

  // Rendering delle combinazioni
  function renderCombinations() {
    combinationsElement.innerHTML = "";
    combinations.forEach((combination) => {
      const combinationElement = document.createElement("div");
      combinationElement.className = "combination";

      combination.cards.forEach((card) => {
        const cardElement = createCardElement(card);
        cardElement.style.transform = "scale(0.8)";
        cardElement.style.margin = "-10px";
        combinationElement.appendChild(cardElement);
      });

      combinationsElement.appendChild(combinationElement);
    });
  }

  // Crea un elemento carta
  function createCardElement(card) {
    const cardElement = document.createElement("div");
    cardElement.className = "card";
    cardElement.dataset.id = card.id;

    const cardInner = document.createElement("div");
    cardInner.className = "card-inner";

    if (card.suit === "joker") {
      // Rendering del jolly
      cardInner.style.backgroundColor = "#f8f8f8";

      const jokerText = document.createElement("div");
      jokerText.textContent = "JOKER";
      jokerText.style.fontSize = "1.2rem";
      jokerText.style.fontWeight = "bold";
      jokerText.style.color = "#e91e63";

      cardInner.appendChild(jokerText);
    } else {
      // Rendering della carta normale
      cardInner.classList.add(card.suit);

      // Angolo superiore sinistro
      const topLeft = document.createElement("div");
      topLeft.className = `card-corner top-left ${card.suit}`;

      const valueTop = document.createElement("div");
      valueTop.className = "card-value";
      valueTop.textContent = card.value;

      const suitTop = document.createElement("div");
      suitTop.className = "card-suit";
      suitTop.textContent = SUIT_SYMBOLS[card.suit];

      topLeft.appendChild(valueTop);
      topLeft.appendChild(suitTop);

      // Angolo inferiore destro
      const bottomRight = document.createElement("div");
      bottomRight.className = `card-corner bottom-right ${card.suit}`;

      const valueBottom = document.createElement("div");
      valueBottom.className = "card-value";
      valueBottom.textContent = card.value;

      const suitBottom = document.createElement("div");
      suitBottom.className = "card-suit";
      suitBottom.textContent = SUIT_SYMBOLS[card.suit];

      bottomRight.appendChild(valueBottom);
      bottomRight.appendChild(suitBottom);

      // Centro della carta
      const centerSymbol = document.createElement("div");
      centerSymbol.className = `card-center-symbol ${card.suit}`;
      centerSymbol.textContent = SUIT_SYMBOLS[card.suit];
      centerSymbol.style.fontSize = "3rem";

      cardInner.appendChild(topLeft);
      cardInner.appendChild(centerSymbol);
      cardInner.appendChild(bottomRight);
    }

    cardElement.appendChild(cardInner);
    return cardElement;
  }

  // Event listeners
  newGameBtn.addEventListener("click", initGame);

  rulesBtn.addEventListener("click", () => {
    rulesModal.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    rulesModal.style.display = "none";
  });

  playAgainBtn.addEventListener("click", () => {
    winModal.style.display = "none";
    initGame();
  });

  // Chiudi il modal cliccando fuori
  window.addEventListener("click", (event) => {
    if (event.target === rulesModal) {
      rulesModal.style.display = "none";
    }
    if (event.target === winModal) {
      winModal.style.display = "none";
    }
  });

  // Aggiungi pulsante per creare combinazioni
  const createCombinationBtn = document.createElement("button");
  createCombinationBtn.className = "btn primary-btn";
  createCombinationBtn.textContent = "Crea Combinazione";
  createCombinationBtn.style.marginTop = "15px";
  createCombinationBtn.onclick = checkCombination;
  handElement.parentNode.appendChild(createCombinationBtn);

  // Inizializza il gioco
  initGame();
});
