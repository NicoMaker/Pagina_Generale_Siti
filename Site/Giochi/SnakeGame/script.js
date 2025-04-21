document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM
  const gameCanvas = document.getElementById("gameCanvas"),
    ctx = gameCanvas.getContext("2d"),
    scoreElement = document.getElementById("score"),
    highScoreElement = document.getElementById("highScore"),
    resetButton = document.getElementById("resetButton"),
    pauseButton = document.getElementById("pauseButton"),
    upButton = document.getElementById("upButton"),
    downButton = document.getElementById("downButton"),
    leftButton = document.getElementById("leftButton"),
    rightButton = document.getElementById("rightButton"),
    gameOverlay = document.getElementById("gameOverlay"),
    overlayTitle = document.getElementById("overlayTitle"),
    overlayMessage = document.getElementById("overlayMessage"),
    overlayButton = document.getElementById("overlayButton"),
    rulesButton = document.getElementById("rulesButton"),
    rulesModal = document.getElementById("rulesModal"),
    closeButton = document.querySelector(".close-button"),
    difficultyButtons = document.querySelectorAll(".difficulty-button");

  // Costanti del gioco
  const GRID_SIZE = 20,
    INITIAL_SNAKE = [
      { x: 8 * GRID_SIZE, y: 7 * GRID_SIZE },
      { x: 7 * GRID_SIZE, y: 7 * GRID_SIZE },
      { x: 6 * GRID_SIZE, y: 7 * GRID_SIZE },
    ],
    CANVAS_BORDER_COLOR = "#10b981",
    CANVAS_BACKGROUND_COLOR = "#ecfdf5",
    SNAKE_COLOR = "#4ade80",
    SNAKE_BORDER_COLOR = "#22c55e",
    FOOD_COLOR = "#f43f5e",
    FOOD_BORDER_COLOR = "#e11d48";

  // Stato del gioco
  let snake = [...INITIAL_SNAKE],
    score = 0,
    highScore = localStorage.getItem("snakeHighScore") || 0,
    foodX = 0,
    foodY = 0,
    dx = GRID_SIZE,
    dy = 0,
    gameSpeed = 200,
    gameIsRunning = null,
    isPaused = false,
    gameOver = false;

  // Inizializza il gioco
  function initGame() {
    // Imposta il punteggio più alto
    highScoreElement.textContent = highScore;

    // Crea il cibo iniziale
    createFood();

    // Avvia il gioco
    if (gameIsRunning) {
      clearTimeout(gameIsRunning);
    }
    gameIsRunning = setTimeout(gameLoop, gameSpeed);
  }

  // Disegna il canvas
  function clearCanvas() {
    ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
    ctx.strokeStyle = CANVAS_BORDER_COLOR;
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height);
  }

  // Disegna il serpente
  function drawSnake() {
    snake.forEach((segment, index) => {
      // Usa un colore leggermente diverso per la testa
      if (index === 0) {
        ctx.fillStyle = "#22c55e";
        ctx.strokeStyle = "#15803d";
      } else {
        ctx.fillStyle = SNAKE_COLOR;
        ctx.strokeStyle = SNAKE_BORDER_COLOR;
      }

      ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
      ctx.strokeRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
    });
  }

  // Genera una posizione casuale allineata alla griglia
  function randomGridPosition(min, max) {
    return Math.floor(Math.random() * ((max - min) / GRID_SIZE)) * GRID_SIZE;
  }

  // Crea il cibo in una posizione casuale
  function createFood() {
    foodX = randomGridPosition(0, gameCanvas.width - GRID_SIZE);
    foodY = randomGridPosition(0, gameCanvas.height - GRID_SIZE);

    // Assicurati che il cibo non appaia sul serpente
    snake.forEach((part) => {
      if (part.x === foodX && part.y === foodY) {
        createFood();
      }
    });
  }

  // Disegna il cibo
  function drawFood() {
    ctx.fillStyle = FOOD_COLOR;
    ctx.strokeStyle = FOOD_BORDER_COLOR;
    ctx.beginPath();
    ctx.arc(
      foodX + GRID_SIZE / 2,
      foodY + GRID_SIZE / 2,
      GRID_SIZE / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.stroke();
  }

  // Muovi il serpente
  function advanceSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    const didEatFood = snake[0].x === foodX && snake[0].y === foodY;
    if (didEatFood) {
      // Aumenta il punteggio
      score += 1;
      scoreElement.textContent = score;

      // Aggiorna il punteggio più alto se necessario
      if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem("snakeHighScore", highScore);

        // Aggiungi un'animazione al punteggio più alto
        highScoreElement.classList.add("pulse");
        setTimeout(() => {
          highScoreElement.classList.remove("pulse");
        }, 1000);
      }

      // Crea nuovo cibo
      createFood();

      // Aumenta leggermente la velocità ogni 5 punti
      if (score % 5 === 0) {
        gameSpeed = Math.max(50, gameSpeed - 10);
      }
    } else {
      snake.pop();
    }

    // Gestisci i bordi (attraversabili)
    if (snake[0].x >= gameCanvas.width) {
      snake[0].x = 0;
    } else if (snake[0].x < 0) {
      snake[0].x = gameCanvas.width - GRID_SIZE;
    }

    if (snake[0].y >= gameCanvas.height) {
      snake[0].y = 0;
    } else if (snake[0].y < 0) {
      snake[0].y = gameCanvas.height - GRID_SIZE;
    }
  }

  // Verifica se il gioco è terminato
  function checkGameOver() {
    // Verifica collisione con se stesso
    for (let i = 4; i < snake.length; i++) {
      if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
        return true;
      }
    }
    return false;
  }

  // Loop principale del gioco
  function gameLoop() {
    if (gameOver) return;

    clearCanvas();
    drawFood();
    advanceSnake();
    drawSnake();

    // Verifica se il gioco è terminato
    if (checkGameOver()) {
      gameOver = true;
      showGameOver();
      return;
    }

    // Continua il loop
    gameIsRunning = setTimeout(gameLoop, gameSpeed);
  }

  // Mostra l'overlay di Game Over
  function showGameOver() {
    overlayTitle.textContent = "Game Over";
    overlayMessage.textContent = `Punteggio finale: ${score}`;
    overlayButton.textContent = "Rigioca";
    gameOverlay.classList.add("show");

    // Aggiungi un'animazione di shake al canvas
    gameCanvas.classList.add("shake");
    setTimeout(() => {
      gameCanvas.classList.remove("shake");
    }, 500);
  }

  // Mostra l'overlay di pausa
  function togglePause() {
    isPaused = !isPaused;

    if (isPaused) {
      clearTimeout(gameIsRunning);
      overlayTitle.textContent = "Pausa";
      overlayMessage.textContent = "Premi il pulsante Riprendi per continuare";
      overlayButton.textContent = "Riprendi";
      gameOverlay.classList.add("show");

      pauseButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span>Riprendi</span>
      `;
    } else {
      gameOverlay.classList.remove("show");
      gameIsRunning = setTimeout(gameLoop, gameSpeed);

      pauseButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        <span>Pausa</span>
      `;
    }
  }

  // Resetta il gioco
  function resetGame() {
    snake = [...INITIAL_SNAKE];
    score = 0;
    scoreElement.textContent = score;
    dx = GRID_SIZE;
    dy = 0;
    gameOver = false;

    // Nascondi l'overlay
    gameOverlay.classList.remove("show");

    // Crea nuovo cibo
    createFood();

    // Riavvia il gioco
    if (gameIsRunning) {
      clearTimeout(gameIsRunning);
    }

    // Se il gioco era in pausa, riprendi
    if (isPaused) {
      isPaused = false;
      pauseButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        <span>Pausa</span>
      `;
    }

    gameIsRunning = setTimeout(gameLoop, gameSpeed);
  }

  // Gestione degli eventi
  function setupEventListeners() {
    // Pulsante di reset
    resetButton.addEventListener("click", resetGame);

    // Pulsante di pausa
    pauseButton.addEventListener("click", togglePause);

    // Pulsante dell'overlay
    overlayButton.addEventListener("click", () => {
      if (gameOver) {
        resetGame();
      } else {
        togglePause();
      }
    });

    // Controlli da tastiera
    document.addEventListener("keydown", (e) => {
      if (isPaused || gameOver) return;

      const goingUp = dy === -GRID_SIZE,
        goingDown = dy === GRID_SIZE,
        goingRight = dx === GRID_SIZE,
        goingLeft = dx === -GRID_SIZE;

      switch (e.key) {
        case "ArrowUp":
          if (!goingDown) {
            dx = 0;
            dy = -GRID_SIZE;
          }
          break;
        case "ArrowDown":
          if (!goingUp) {
            dx = 0;
            dy = GRID_SIZE;
          }
          break;
        case "ArrowLeft":
          if (!goingRight) {
            dx = -GRID_SIZE;
            dy = 0;
          }
          break;
        case "ArrowRight":
          if (!goingLeft) {
            dx = GRID_SIZE;
            dy = 0;
          }
          break;
        case "p":
          togglePause();
          break;
        case "r":
          resetGame();
          break;
      }
    });

    // Controlli touch per dispositivi mobili
    upButton.addEventListener("click", () => {
      if (isPaused || gameOver) return;
      if (dy !== GRID_SIZE) {
        dx = 0;
        dy = -GRID_SIZE;
      }
    });

    downButton.addEventListener("click", () => {
      if (isPaused || gameOver) return;
      if (dy !== -GRID_SIZE) {
        dx = 0;
        dy = GRID_SIZE;
      }
    });

    leftButton.addEventListener("click", () => {
      if (isPaused || gameOver) return;
      if (dx !== GRID_SIZE) {
        dx = -GRID_SIZE;
        dy = 0;
      }
    });

    rightButton.addEventListener("click", () => {
      if (isPaused || gameOver) return;
      if (dx !== -GRID_SIZE) {
        dx = GRID_SIZE;
        dy = 0;
      }
    });

    // Pulsanti di difficoltà
    difficultyButtons.forEach((button) => {
      button.addEventListener("click", () => {
        difficultyButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        gameSpeed = Number.parseInt(button.dataset.speed);

        // Riavvia il gioco con la nuova velocità
        if (!isPaused && !gameOver) {
          clearTimeout(gameIsRunning);
          gameIsRunning = setTimeout(gameLoop, gameSpeed);
        }
      });
    });

    // Pulsante delle regole
    rulesButton.addEventListener("click", () => {
      rulesModal.classList.add("show");

      // Metti in pausa il gioco quando si aprono le regole
      if (!isPaused && !gameOver) {
        togglePause();
      }
    });

    // Chiudi il modal delle regole
    closeButton.addEventListener("click", () => {
      rulesModal.classList.remove("show");
    });

    // Chiudi il modal cliccando fuori
    window.addEventListener("click", (event) => {
      if (event.target === rulesModal) {
        rulesModal.classList.remove("show");
      }
    });
  }

  // Inizializza il gioco
  setupEventListeners();
  initGame();
});
