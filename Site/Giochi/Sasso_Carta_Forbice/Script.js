document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM
  const playButton = document.getElementById("playButton");
  const player1Input = document.getElementById("player1");
  const player2Input = document.getElementById("player2");
  const player1NameDisplay = document.getElementById("player1-name-display");
  const player2NameDisplay = document.getElementById("player2-name-display");
  const player1Choice = document.getElementById("player1-choice");
  const player2Choice = document.getElementById("player2-choice");
  const resultMessage = document.getElementById("result-message");
  const winnerMessage = document.getElementById("winner-message");
  const player1Score = document.getElementById("player1-score");
  const player2Score = document.getElementById("player2-score");
  const historyContainer = document.getElementById("history-container");
  const rulesButton = document.getElementById("rulesButton");
  const rulesModal = document.getElementById("rulesModal");
  const closeButton = document.querySelector(".close-button");

  // Opzioni di gioco
  const options = ["sasso", "carta", "forbice"];
  const optionIcons = {
    sasso: "✊",
    carta: "✋",
    forbice: "✌️",
  };

  // Stato del gioco
  let scores = {
    player1: 0,
    player2: 0,
  };
  let gameHistory = [];

  // Inizializza il gioco
  function initGame() {
    // Carica i punteggi salvati
    loadScores();

    // Aggiorna i display dei nomi
    updatePlayerNames();

    // Aggiorna i punteggi visualizzati
    updateScoreDisplay();

    // Carica la cronologia delle partite
    loadHistory();
  }

  // Aggiorna i nomi dei giocatori visualizzati
  function updatePlayerNames() {
    const player1Name = player1Input.value.trim() || "Giocatore 1";
    const player2Name = player2Input.value.trim() || "Giocatore 2";

    player1NameDisplay.textContent = player1Name;
    player2NameDisplay.textContent = player2Name;
  }

  // Ottieni una scelta casuale
  function getRandomChoice() {
    return options[Math.floor(Math.random() * options.length)];
  }

  // Determina il vincitore
  function determineWinner(choice1, choice2) {
    if (choice1 === choice2) {
      return "tie";
    } else if (
      (choice1 === "sasso" && choice2 === "forbice") ||
      (choice1 === "carta" && choice2 === "sasso") ||
      (choice1 === "forbice" && choice2 === "carta")
    ) {
      return "player1";
    } else {
      return "player2";
    }
  }

  // Mostra le scelte dei giocatori
  function displayChoices(player1Choice, player2Choice) {
    return new Promise((resolve) => {
      // Resetta le scelte precedenti
      document.querySelectorAll(".choice-icon").forEach((icon) => {
        icon.textContent = "";
        icon.classList.remove("show");
      });

      document
        .querySelectorAll(".choice-placeholder")
        .forEach((placeholder) => {
          placeholder.style.opacity = "0.3";
        });

      // Animazione di scelta
      let iterations = 0;
      const maxIterations = 10;
      const interval = 100;

      const animation = setInterval(() => {
        const randomChoice1 = getRandomChoice();
        const randomChoice2 = getRandomChoice();

        document.querySelector("#player1-choice .choice-icon").textContent =
          optionIcons[randomChoice1];
        document.querySelector("#player2-choice .choice-icon").textContent =
          optionIcons[randomChoice2];

        iterations++;

        if (iterations >= maxIterations) {
          clearInterval(animation);

          // Mostra le scelte finali
          setTimeout(() => {
            document
              .querySelectorAll(".choice-placeholder")
              .forEach((placeholder) => {
                placeholder.style.opacity = "0";
              });

            const player1ChoiceIcon = document.querySelector(
              "#player1-choice .choice-icon"
            );
            const player2ChoiceIcon = document.querySelector(
              "#player2-choice .choice-icon"
            );

            player1ChoiceIcon.textContent = optionIcons[player1Choice];
            player2ChoiceIcon.textContent = optionIcons[player2Choice];

            player1ChoiceIcon.classList.add("show");
            player2ChoiceIcon.classList.add("show");

            resolve();
          }, 300);
        }
      }, interval);
    });
  }

  // Mostra il risultato
  function displayResult(
    player1Name,
    player1Choice,
    player2Name,
    player2Choice,
    winner
  ) {
    resultMessage.textContent = `${player1Name}: ${player1Choice} vs ${player2Name}: ${player2Choice}`;
    resultMessage.classList.add("show");

    let winnerText = "";

    if (winner === "tie") {
      winnerText = "Pareggio!";
    } else if (winner === "player1") {
      winnerText = `${player1Name} vince!`;
      scores.player1++;
    } else {
      winnerText = `${player2Name} vince!`;
      scores.player2++;
    }

    winnerMessage.textContent = winnerText;
    winnerMessage.classList.add("show");

    // Aggiorna i punteggi
    updateScoreDisplay();
    saveScores();

    // Aggiungi alla cronologia
    addToHistory(
      player1Name,
      player1Choice,
      player2Name,
      player2Choice,
      winner
    );
  }

  // Aggiorna il display dei punteggi
  function updateScoreDisplay() {
    player1Score.textContent = scores.player1;
    player2Score.textContent = scores.player2;
  }

  // Salva i punteggi nel localStorage
  function saveScores() {
    localStorage.setItem("rpsScores", JSON.stringify(scores));
  }

  // Carica i punteggi dal localStorage
  function loadScores() {
    const savedScores = localStorage.getItem("rpsScores");
    if (savedScores) {
      scores = JSON.parse(savedScores);
    }
  }

  // Aggiungi alla cronologia
  function addToHistory(
    player1Name,
    player1Choice,
    player2Name,
    player2Choice,
    winner
  ) {
    // Limita la cronologia a 10 partite
    if (gameHistory.length >= 10) {
      gameHistory.pop();
    }

    // Aggiungi la nuova partita all'inizio
    gameHistory.unshift({
      player1: {
        name: player1Name,
        choice: player1Choice,
      },
      player2: {
        name: player2Name,
        choice: player2Choice,
      },
      winner: winner,
      timestamp: Date.now(),
    });

    // Salva e aggiorna la cronologia
    saveHistory();
    renderHistory();
  }

  // Salva la cronologia nel localStorage
  function saveHistory() {
    localStorage.setItem("rpsHistory", JSON.stringify(gameHistory));
  }

  // Carica la cronologia dal localStorage
  function loadHistory() {
    const savedHistory = localStorage.getItem("rpsHistory");
    if (savedHistory) {
      gameHistory = JSON.parse(savedHistory);
      renderHistory();
    }
  }

  // Renderizza la cronologia
  function renderHistory() {
    historyContainer.innerHTML = "";

    if (gameHistory.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "empty-history";
      emptyMessage.textContent = "Le partite giocate appariranno qui";
      historyContainer.appendChild(emptyMessage);
      return;
    }

    gameHistory.forEach((game) => {
      const historyItem = document.createElement("div");
      historyItem.className = "history-item";

      const historyPlayers = document.createElement("div");
      historyPlayers.className = "history-players";

      const player1Div = document.createElement("div");
      player1Div.className = "history-player";
      player1Div.innerHTML = `
        <span class="history-name">${game.player1.name}:</span>
        <span class="history-choice">${optionIcons[game.player1.choice]}</span>
      `;

      const vsSpan = document.createElement("span");
      vsSpan.textContent = "vs";

      const player2Div = document.createElement("div");
      player2Div.className = "history-player";
      player2Div.innerHTML = `
        <span class="history-name">${game.player2.name}:</span>
        <span class="history-choice">${optionIcons[game.player2.choice]}</span>
      `;

      historyPlayers.appendChild(player1Div);
      historyPlayers.appendChild(vsSpan);
      historyPlayers.appendChild(player2Div);

      const historyResult = document.createElement("div");
      historyResult.className = `history-result ${game.winner}`;

      if (game.winner === "tie") {
        historyResult.textContent = "Pareggio";
        historyResult.className = "history-result tie";
      } else if (game.winner === "player1") {
        historyResult.textContent = `${game.player1.name} vince`;
        historyResult.className = "history-result win";
      } else {
        historyResult.textContent = `${game.player2.name} vince`;
        historyResult.className = "history-result win";
      }

      historyItem.appendChild(historyPlayers);
      historyItem.appendChild(historyResult);

      historyContainer.appendChild(historyItem);
    });
  }

  // Gestisci il click sul pulsante di gioco
  playButton.addEventListener("click", async () => {
    // Disabilita il pulsante durante il gioco
    playButton.disabled = true;

    // Aggiorna i nomi dei giocatori
    updatePlayerNames();

    // Ottieni i nomi dei giocatori
    const player1Name = player1Input.value.trim() || "Giocatore 1";
    const player2Name = player2Input.value.trim() || "Giocatore 2";

    // Nascondi i risultati precedenti
    resultMessage.classList.remove("show");
    winnerMessage.classList.remove("show");

    // Genera le scelte casuali
    const player1Choice = getRandomChoice();
    const player2Choice = getRandomChoice();

    // Mostra le scelte con animazione
    await displayChoices(player1Choice, player2Choice);

    // Determina il vincitore
    const winner = determineWinner(player1Choice, player2Choice);

    // Mostra il risultato
    displayResult(
      player1Name,
      player1Choice,
      player2Name,
      player2Choice,
      winner
    );

    // Riabilita il pulsante
    setTimeout(() => {
      playButton.disabled = false;
    }, 1000);
  });

  // Gestisci il modal delle regole
  rulesButton.addEventListener("click", () => {
    rulesModal.classList.add("show");
  });

  closeButton.addEventListener("click", () => {
    rulesModal.classList.remove("show");
  });

  // Chiudi il modal cliccando fuori
  window.addEventListener("click", (event) => {
    if (event.target === rulesModal) {
      rulesModal.classList.remove("show");
    }
  });

  // Inizializza il gioco
  initGame();
});
