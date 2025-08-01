// Game constants
const CELL_TYPES = {
  EMPTY: 0,
  WALL: 1,
  DOT: 2,
  POWER_PELLET: 3,
  PACMAN: 4,
  GHOST: 5,
};

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// Game configuration
let gameConfig = null;
let currentDifficulty = "easy";

// Game state
let gameBoard = [];
let pacman = { x: 0, y: 0, direction: DIRECTIONS.RIGHT };
let ghosts = [];
let score = 0;
let lives = 5;
let gameInterval;
let ghostsInterval;
let isPaused = false;
let isFrightenedMode = false;
let frightenedModeTimeout;
let isGameStarted = false;

// DOM elements
const gameBoardElement = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const difficultySelector = document.getElementById("difficulty");
const startGameButton = document.getElementById("start-game");
const currentDifficultyElement = document.getElementById("current-difficulty");

// Pause/Resume elements
const pauseResumeBtn = document.getElementById("pause-resume-btn");
const pauseOverlay = document.getElementById("pause-overlay");
const resumeFromOverlayBtn = document.getElementById("resume-from-overlay");

// Victory modal elements
const victoryModal = document.getElementById("victory-modal");
const victoryScoreElement = document.getElementById("victory-score");
const completedLevelElement = document.getElementById("completed-level");
const nextLevelElement = document.getElementById("next-level");
const continueButton = document.getElementById("continue-button");

// Custom Game Over Alert elements
const gameOverAlert = document.getElementById("game-over-alert");
const finalScoreElement = document.getElementById("final-score");
const playAgainBtn = document.getElementById("play-again-btn");
const changeLevelBtn = document.getElementById("change-level-btn");

// Info modal elements
const infoButton = document.getElementById("info-button");
const infoModal = document.getElementById("info-modal");
const closeButton = document.querySelector(".close-button");

// Touch controls
const upBtn = document.getElementById("up-btn");
const downBtn = document.getElementById("down-btn");
const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");

// Detect device type
function detectDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isTablet =
    /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(
      userAgent,
    );
  const isMobile =
    /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  if (isTablet) {
    document.body.classList.add("tablet");
  } else if (isMobile) {
    document.body.classList.add("mobile");
  }
}

// Load configuration
async function loadConfig() {
  try {
    const response = await fetch("config.json");
    gameConfig = await response.json();
    console.log("Configuration loaded:", gameConfig);
  } catch (error) {
    console.error("Error loading configuration:", error);
    // Fallback configuration if loading fails
    gameConfig = {
      difficulties: {
        easy: {
          lives: 5,
          ghostSpeed: 400,
          pacmanSpeed: 200,
          frightenedModeDuration: 10000,
          ghostIntelligence: 0.3,
        },
        medium: {
          lives: 3,
          ghostSpeed: 300,
          pacmanSpeed: 200,
          frightenedModeDuration: 8000,
          ghostIntelligence: 0.6,
        },
        hard: {
          lives: 2,
          ghostSpeed: 250,
          pacmanSpeed: 180,
          frightenedModeDuration: 6000,
          ghostIntelligence: 0.8,
        },
        expert: {
          lives: 1,
          ghostSpeed: 200,
          pacmanSpeed: 180,
          frightenedModeDuration: 4000,
          ghostIntelligence: 1.0,
        },
      },
      mazeLayouts: {
        standard: [
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
          [1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1],
          [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
          [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
          [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
          [1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1],
          [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
          [1, 1, 1, 1, 2, 1, 0, 1, 1, 0, 1, 1, 0, 1, 2, 1, 1, 1, 1],
          [0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0],
          [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
          [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
          [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
          [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
          [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
          [1, 3, 2, 1, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 1, 2, 3, 1],
          [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1],
          [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
          [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
          [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
      },
      ghostColors: ["red", "pink", "cyan", "orange"],
    };
  }
}

// Initialize the game
async function initGame() {
  // Detect device type
  detectDeviceType();

  await loadConfig();

  // Set default difficulty to "easy"
  difficultySelector.value = "easy";
  currentDifficulty = "easy";
  currentDifficultyElement.textContent = "Facile";

  // Set initial lives to 5 (easy difficulty)
  lives = 5;
  updateLives();

  // Set up event listeners
  setupControls();
  setupDifficultySelector();
  setupVictoryModal();
  setupGameOverAlert();
  setupInfoModal();
  setupPauseControls();

  // Show initial board without starting the game
  createGameBoard();
  renderBoard();
}

// Set up pause/resume controls
function setupPauseControls() {
  // Pause/Resume button click
  pauseResumeBtn.addEventListener("click", togglePause);

  // Resume from overlay button
  resumeFromOverlayBtn.addEventListener("click", resumeGame);

  // Close overlay when clicking outside
  pauseOverlay.addEventListener("click", (e) => {
    if (e.target === pauseOverlay) {
      resumeGame();
    }
  });
}

// Toggle pause/resume
function togglePause() {
  if (!isGameStarted) return;

  if (isPaused) {
    resumeGame();
  } else {
    pauseGame();
  }
}

// Pause the game
function pauseGame() {
  if (!isGameStarted || isPaused) return;

  isPaused = true;

  // Update button appearance
  pauseResumeBtn.classList.add("paused");
  pauseResumeBtn.innerHTML =
    '<span class="play-icon">▶️</span><span class="pause-text">Riprendi</span>';

  // Show pause overlay
  pauseOverlay.classList.add("show");

  console.log("Game paused");
}

// Resume the game
function resumeGame() {
  if (!isGameStarted || !isPaused) return;

  isPaused = false;

  // Update button appearance
  pauseResumeBtn.classList.remove("paused");
  pauseResumeBtn.innerHTML =
    '<span class="pause-icon">⏸️</span><span class="pause-text">Pausa</span>';

  // Hide pause overlay
  pauseOverlay.classList.remove("show");

  console.log("Game resumed");
}

// Show pause button
function showPauseButton() {
  pauseResumeBtn.style.display = "flex";
}

// Hide pause button
function hidePauseButton() {
  pauseResumeBtn.style.display = "none";
  pauseOverlay.classList.remove("show");
  isPaused = false;
}

// Set up custom game over alert
function setupGameOverAlert() {
  playAgainBtn.addEventListener("click", () => {
    hideGameOverAlert();
    // Restart the game with the same difficulty
    startGame();
  });

  changeLevelBtn.addEventListener("click", () => {
    hideGameOverAlert();
    // Reset the game state
    resetGame();
  });

  // Close alert when clicking backdrop
  gameOverAlert.addEventListener("click", (e) => {
    if (e.target === gameOverAlert) {
      hideGameOverAlert();
      resetGame();
    }
  });
}

// Show custom game over alert
function showGameOverAlert() {
  finalScoreElement.textContent = score;
  gameOverAlert.classList.add("show");

  // Add a slight delay for the score animation
  setTimeout(() => {
    finalScoreElement.style.animation = "scoreCounter 0.8s ease-out";
  }, 300);
}

// Hide custom game over alert
function hideGameOverAlert() {
  gameOverAlert.classList.remove("show");
}

// Set up info modal
function setupInfoModal() {
  infoButton.addEventListener("click", () => {
    infoModal.style.display = "block";
  });

  closeButton.addEventListener("click", () => {
    infoModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === infoModal) {
      infoModal.style.display = "none";
    }
  });
}

// Set up difficulty selector
function setupDifficultySelector() {
  startGameButton.addEventListener("click", () => {
    if (isGameStarted) {
      resetGame();
    }

    currentDifficulty = difficultySelector.value;
    const difficultySettings = gameConfig.difficulties[currentDifficulty];

    // Update game settings based on difficulty
    lives = difficultySettings.lives;
    updateLives();

    // Update displayed difficulty
    let difficultyText = "";
    switch (currentDifficulty) {
      case "easy":
        difficultyText = "Facile";
        break;
      case "medium":
        difficultyText = "Medio";
        break;
      case "hard":
        difficultyText = "Difficile";
        break;
      case "expert":
        difficultyText = "Esperto";
        break;
      default:
        difficultyText = "Facile";
    }

    currentDifficultyElement.textContent = difficultyText;

    // Start the game
    startGame();
  });
}

// Set up victory modal
function setupVictoryModal() {
  continueButton.addEventListener("click", () => {
    // Hide the modal
    victoryModal.classList.remove("show");

    // Start the next level
    startNextLevel();
  });
}

// Start the game
function startGame() {
  // Clear any existing intervals
  if (gameInterval) clearInterval(gameInterval);
  if (ghostsInterval) clearInterval(ghostsInterval);

  // Reset game state
  score = 0;
  updateScore();
  isPaused = false;
  isGameStarted = true;

  // Show pause button
  showPauseButton();

  // Create the game board
  createGameBoard();
  placePacman();
  placeGhosts();
  renderBoard();

  // Get difficulty settings
  const difficultySettings = gameConfig.difficulties[currentDifficulty];

  // Start game loops with appropriate speeds
  gameInterval = setInterval(updateGame, difficultySettings.pacmanSpeed);
  ghostsInterval = setInterval(updateGhosts, difficultySettings.ghostSpeed);
}

// Create the game board with walls and dots
function createGameBoard() {
  // Use the maze layout from config
  gameBoard = JSON.parse(JSON.stringify(gameConfig.mazeLayouts.standard));

  // Set up the grid size
  const rows = gameBoard.length;
  const cols = gameBoard[0].length;

  gameBoardElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  gameBoardElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
}

// Place Pac-Man on the board
function placePacman() {
  // Place Pac-Man at a specific position
  pacman = { x: 9, y: 15, direction: DIRECTIONS.RIGHT };
  gameBoard[pacman.y][pacman.x] = CELL_TYPES.PACMAN;
}

// Place ghosts on the board
function placeGhosts() {
  ghosts = [
    { x: 8, y: 9, direction: DIRECTIONS.UP, color: "red", frightened: false },
    { x: 9, y: 9, direction: DIRECTIONS.UP, color: "pink", frightened: false },
    { x: 10, y: 9, direction: DIRECTIONS.UP, color: "cyan", frightened: false },
    {
      x: 11,
      y: 9,
      direction: DIRECTIONS.UP,
      color: "orange",
      frightened: false,
    },
  ];

  ghosts.forEach((ghost) => {
    if (gameBoard[ghost.y][ghost.x] === CELL_TYPES.EMPTY) {
      gameBoard[ghost.y][ghost.x] = CELL_TYPES.GHOST;
    }
  });
}

// Render the game board
function renderBoard() {
  gameBoardElement.innerHTML = "";

  for (let y = 0; y < gameBoard.length; y++) {
    for (let x = 0; x < gameBoard[y].length; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      switch (gameBoard[y][x]) {
        case CELL_TYPES.WALL:
          cell.classList.add("wall");
          break;
        case CELL_TYPES.DOT:
          const dot = document.createElement("div");
          dot.className = "dot";
          cell.appendChild(dot);
          break;
        case CELL_TYPES.POWER_PELLET:
          const powerPellet = document.createElement("div");
          powerPellet.className = "power-pellet";
          cell.appendChild(powerPellet);
          break;
        case CELL_TYPES.PACMAN:
          const pacmanElement = document.createElement("div");
          pacmanElement.className = "pacman";

          // Rotate Pac-Man based on direction
          let rotation = 0;
          if (pacman.direction === DIRECTIONS.UP) rotation = 270;
          else if (pacman.direction === DIRECTIONS.DOWN) rotation = 90;
          else if (pacman.direction === DIRECTIONS.LEFT) rotation = 180;

          pacmanElement.style.transform = `rotate(${rotation}deg)`;
          cell.appendChild(pacmanElement);
          break;
      }

      // Check if there's a ghost at this position
      const ghost = ghosts.find((g) => g.x === x && g.y === y);
      if (ghost) {
        const ghostElement = document.createElement("div");
        ghostElement.className = `ghost ${ghost.frightened ? "frightened" : ghost.color}`;
        cell.appendChild(ghostElement);
      }

      gameBoardElement.appendChild(cell);
    }
  }
}

// Update the game state
function updateGame() {
  if (isPaused || !isGameStarted) return;

  // Save Pac-Man's current position
  const prevX = pacman.x;
  const prevY = pacman.y;

  // Calculate new position
  const newX = pacman.x + pacman.direction.x;
  const newY = pacman.y + pacman.direction.y;

  // Check if the new position is valid
  if (isValidMove(newX, newY)) {
    // Check if Pac-Man eats a dot
    if (gameBoard[newY][newX] === CELL_TYPES.DOT) {
      score += 10;
      updateScore();
    }

    // Check if Pac-Man eats a power pellet
    if (gameBoard[newY][newX] === CELL_TYPES.POWER_PELLET) {
      score += 50;
      updateScore();
      activateFrightenedMode();
    }

    // Move Pac-Man
    gameBoard[prevY][prevX] = CELL_TYPES.EMPTY;
    gameBoard[newY][newX] = CELL_TYPES.PACMAN;
    pacman.x = newX;
    pacman.y = newY;

    // Check for ghost collision
    checkGhostCollision();

    // Check if all dots are eaten
    checkWinCondition();
  }

  renderBoard();
}

// Update ghosts movement
function updateGhosts() {
  if (isPaused || !isGameStarted) return;

  const difficultySettings = gameConfig.difficulties[currentDifficulty];
  const ghostIntelligence = difficultySettings.ghostIntelligence;

  ghosts.forEach((ghost) => {
    // Save ghost's current position
    const prevX = ghost.x;
    const prevY = ghost.y;

    // Determine ghost's next move
    const possibleDirections = getPossibleDirections(ghost);

    if (possibleDirections.length > 0) {
      // Choose a direction
      let nextDirection;

      if (ghost.frightened) {
        // Random movement when frightened
        const randomIndex = Math.floor(
          Math.random() * possibleDirections.length,
        );
        nextDirection = possibleDirections[randomIndex];
      } else {
        // Use ghost intelligence based on difficulty
        if (Math.random() < ghostIntelligence) {
          // Chase Pac-Man (intelligent movement)
          nextDirection = getDirectionTowardsPacman(ghost, possibleDirections);
        } else {
          // Random movement (less intelligent)
          const randomIndex = Math.floor(
            Math.random() * possibleDirections.length,
          );
          nextDirection = possibleDirections[randomIndex];
        }
      }

      // Update ghost direction
      ghost.direction = nextDirection;

      // Calculate new position
      const newX = ghost.x + ghost.direction.x;
      const newY = ghost.y + ghost.direction.y;

      // Move ghost
      ghost.x = newX;
      ghost.y = newY;
    }
  });

  // Check for ghost collision
  checkGhostCollision();

  renderBoard();
}

// Get possible directions for a ghost
function getPossibleDirections(ghost) {
  const possibleDirections = [];

  // Check each direction
  for (const dir in DIRECTIONS) {
    const newX = ghost.x + DIRECTIONS[dir].x;
    const newY = ghost.y + DIRECTIONS[dir].y;

    // Check if the new position is valid
    if (isValidMove(newX, newY)) {
      // Avoid going back in the opposite direction
      const isOpposite =
        (ghost.direction === DIRECTIONS.UP &&
          DIRECTIONS[dir] === DIRECTIONS.DOWN) ||
        (ghost.direction === DIRECTIONS.DOWN &&
          DIRECTIONS[dir] === DIRECTIONS.UP) ||
        (ghost.direction === DIRECTIONS.LEFT &&
          DIRECTIONS[dir] === DIRECTIONS.RIGHT) ||
        (ghost.direction === DIRECTIONS.RIGHT &&
          DIRECTIONS[dir] === DIRECTIONS.LEFT);

      if (!isOpposite) {
        possibleDirections.push(DIRECTIONS[dir]);
      }
    }
  }

  // If no valid directions (except opposite), allow going back
  if (possibleDirections.length === 0) {
    for (const dir in DIRECTIONS) {
      const newX = ghost.x + DIRECTIONS[dir].x;
      const newY = ghost.y + DIRECTIONS[dir].y;

      if (isValidMove(newX, newY)) {
        possibleDirections.push(DIRECTIONS[dir]);
      }
    }
  }

  return possibleDirections;
}

// Get direction towards Pac-Man (simple AI)
function getDirectionTowardsPacman(ghost, possibleDirections) {
  // If frightened, choose random direction
  if (ghost.frightened) {
    const randomIndex = Math.floor(Math.random() * possibleDirections.length);
    return possibleDirections[randomIndex];
  }

  // Calculate distance to Pac-Man for each possible direction
  let bestDirection = possibleDirections[0];
  let shortestDistance = Number.POSITIVE_INFINITY;

  possibleDirections.forEach((direction) => {
    const newX = ghost.x + direction.x;
    const newY = ghost.y + direction.y;

    const distance = Math.sqrt(
      Math.pow(newX - pacman.x, 2) + Math.pow(newY - pacman.y, 2),
    );

    if (distance < shortestDistance) {
      shortestDistance = distance;
      bestDirection = direction;
    }
  });

  return bestDirection;
}

// Check if a move is valid
function isValidMove(x, y) {
  // Check if the position is within the board
  if (x < 0 || x >= gameBoard[0].length || y < 0 || y >= gameBoard.length) {
    return false;
  }

  // Check if the position is not a wall
  return gameBoard[y][x] !== CELL_TYPES.WALL;
}

// Check for ghost collision
function checkGhostCollision() {
  const collidedGhost = ghosts.find(
    (ghost) => ghost.x === pacman.x && ghost.y === pacman.y,
  );

  if (collidedGhost) {
    if (collidedGhost.frightened) {
      // Eat the ghost
      score += 200;
      updateScore();

      // Reset ghost position
      collidedGhost.x = 9;
      collidedGhost.y = 9;
      collidedGhost.frightened = false;
    } else {
      // Lose a life
      lives--;
      updateLives();

      if (lives <= 0) {
        gameOver();
      } else {
        resetPositions();
      }
    }
  }
}

// Check if all dots are eaten
function checkWinCondition() {
  for (let y = 0; y < gameBoard.length; y++) {
    for (let x = 0; x < gameBoard[y].length; x++) {
      if (
        gameBoard[y][x] === CELL_TYPES.DOT ||
        gameBoard[y][x] === CELL_TYPES.POWER_PELLET
      ) {
        return; // Still have dots to eat
      }
    }
  }

  // All dots eaten, player wins
  winGame();
}

// Activate frightened mode
function activateFrightenedMode() {
  isFrightenedMode = true;

  // Get duration from difficulty settings
  const difficultySettings = gameConfig.difficulties[currentDifficulty];
  const frightenedModeDuration = difficultySettings.frightenedModeDuration;

  // Set all ghosts to frightened
  ghosts.forEach((ghost) => {
    ghost.frightened = true;
  });

  // Clear existing timeout if there is one
  if (frightenedModeTimeout) {
    clearTimeout(frightenedModeTimeout);
  }

  // Set timeout to end frightened mode
  frightenedModeTimeout = setTimeout(() => {
    isFrightenedMode = false;
    ghosts.forEach((ghost) => {
      ghost.frightened = false;
    });
  }, frightenedModeDuration);
}

// Reset positions after losing a life
function resetPositions() {
  // Pause the game briefly
  isPaused = true;

  // Reset Pac-Man position
  gameBoard[pacman.y][pacman.x] = CELL_TYPES.EMPTY;
  pacman.x = 9;
  pacman.y = 15;
  pacman.direction = DIRECTIONS.RIGHT;
  gameBoard[pacman.y][pacman.x] = CELL_TYPES.PACMAN;

  // Reset ghost positions
  ghosts.forEach((ghost, index) => {
    ghost.x = 8 + index;
    ghost.y = 9;
    ghost.frightened = false;
  });

  renderBoard();

  // Resume the game after a delay
  setTimeout(() => {
    isPaused = false;
  }, 1000);
}

// Game over - now with beautiful custom alert
function gameOver() {
  clearInterval(gameInterval);
  clearInterval(ghostsInterval);
  isGameStarted = false;

  // Hide pause button
  hidePauseButton();

  // Show the custom game over alert
  showGameOverAlert();
}

// Modify the winGame function to show a nice victory modal
function winGame() {
  clearInterval(gameInterval);
  clearInterval(ghostsInterval);
  isGameStarted = false;

  // Hide pause button
  hidePauseButton();

  // Get the next difficulty level
  let nextDifficulty;
  switch (currentDifficulty) {
    case "easy":
      nextDifficulty = "medium";
      break;
    case "medium":
      nextDifficulty = "hard";
      break;
    case "hard":
      nextDifficulty = "expert";
      break;
    case "expert":
      nextDifficulty = "easy"; // Loop back to easy after completing expert
      break;
    default:
      nextDifficulty = "easy";
  }

  // Get level names in Italian
  let currentLevelName, nextLevelName;

  switch (currentDifficulty) {
    case "easy":
      currentLevelName = "Facile";
      break;
    case "medium":
      currentLevelName = "Medio";
      break;
    case "hard":
      currentLevelName = "Difficile";
      break;
    case "expert":
      currentLevelName = "Esperto";
      break;
    default:
      currentLevelName = "Facile";
  }

  switch (nextDifficulty) {
    case "easy":
      nextLevelName = "Facile";
      break;
    case "medium":
      nextLevelName = "Medio";
      break;
    case "hard":
      nextLevelName = "Difficile";
      break;
    case "expert":
      nextLevelName = "Esperto";
      break;
    default:
      nextLevelName = "Facile";
  }

  // Update victory modal content
  victoryScoreElement.textContent = score;
  completedLevelElement.textContent = currentLevelName;

  // Check if player completed the expert level
  if (currentDifficulty === "expert") {
    // Show special game completion message
    document.querySelector(".victory-title").textContent = "GIOCO COMPLETATO!";
    document.querySelector(".victory-message").innerHTML =
      '<span class="pacman-icon">V</span> Congratulazioni! Hai completato l\'intero gioco! <span class="pacman-icon">V</span>';
    document.querySelector(".next-level-info").innerHTML =
      "<p>Hai superato tutti i livelli di difficoltà!</p><p>Punteggio Finale: " +
      score +
      "</p>";
    continueButton.textContent = "Gioca Ancora";
  } else {
    // Show regular level progression message
    document.querySelector(".victory-title").textContent = "VITTORIA!";
    document.querySelector(".victory-message").innerHTML =
      '<span class="pacman-icon">V</span> Congratulazioni! <span class="pacman-icon">V</span>';
    document.querySelector(".next-level-info").innerHTML =
      '<p>Livello completato: <span id="completed-level">' +
      currentLevelName +
      "</span></p>" +
      '<p>Prossimo livello: <span id="next-level">' +
      nextLevelName +
      "</span></p>";
    continueButton.textContent = "Continua al Prossimo Livello";
    nextLevelElement.textContent = nextLevelName;
  }

  // Show the victory modal
  victoryModal.classList.add("show");
}

// Start the next level
function startNextLevel() {
  // Get the next difficulty level
  let nextDifficulty;
  switch (currentDifficulty) {
    case "easy":
      nextDifficulty = "medium";
      break;
    case "medium":
      nextDifficulty = "hard";
      break;
    case "hard":
      nextDifficulty = "expert";
      break;
    case "expert":
      nextDifficulty = "easy"; // Loop back to easy after completing expert
      break;
    default:
      nextDifficulty = "easy";
  }

  // Set the next difficulty level in the selector
  difficultySelector.value = nextDifficulty;
  currentDifficulty = nextDifficulty;

  // Update displayed difficulty in Italian
  let nextLevelName;
  switch (nextDifficulty) {
    case "easy":
      nextLevelName = "Facile";
      break;
    case "medium":
      nextLevelName = "Medio";
      break;
    case "hard":
      nextLevelName = "Difficile";
      break;
    case "expert":
      nextLevelName = "Esperto";
      break;
    default:
      nextLevelName = "Facile";
  }

  currentDifficultyElement.textContent = nextLevelName;

  // Get difficulty settings
  const difficultySettings = gameConfig.difficulties[currentDifficulty];

  // Update game settings based on new difficulty
  lives = difficultySettings.lives;
  updateLives();

  // Start the game with the new difficulty
  startGame();
}

// Reset the game
function resetGame() {
  // Clear intervals
  if (gameInterval) clearInterval(gameInterval);
  if (ghostsInterval) clearInterval(ghostsInterval);

  // Reset game state
  score = 0;
  updateScore();
  isGameStarted = false;
  isPaused = false;

  // Hide pause button
  hidePauseButton();

  // Clear the board
  gameBoard = [];
  ghosts = [];

  // Create empty board
  createGameBoard();
  renderBoard();
}

// Update the score display
function updateScore() {
  scoreElement.textContent = score;
}

// Update the lives display
function updateLives() {
  livesElement.textContent = lives;
}

// Set up keyboard and touch controls
function setupControls() {
  // Keyboard controls
  document.addEventListener("keydown", (e) => {
    // Pause/Resume with spacebar
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      if (isGameStarted) {
        togglePause();
      }
      return;
    }

    if (!isGameStarted) return;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        pacman.direction = DIRECTIONS.UP;
        break;
      case "ArrowDown":
        e.preventDefault();
        pacman.direction = DIRECTIONS.DOWN;
        break;
      case "ArrowLeft":
        e.preventDefault();
        pacman.direction = DIRECTIONS.LEFT;
        break;
      case "ArrowRight":
        e.preventDefault();
        pacman.direction = DIRECTIONS.RIGHT;
        break;
    }
  });

  // Touch controls
  upBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (!isGameStarted) return;
    pacman.direction = DIRECTIONS.UP;
  });

  downBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (!isGameStarted) return;
    pacman.direction = DIRECTIONS.DOWN;
  });

  leftBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (!isGameStarted) return;
    pacman.direction = DIRECTIONS.LEFT;
  });

  rightBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (!isGameStarted) return;
    pacman.direction = DIRECTIONS.RIGHT;
  });

  // Mouse controls (for testing on desktop)
  upBtn.addEventListener("mousedown", () => {
    if (!isGameStarted) return;
    pacman.direction = DIRECTIONS.UP;
  });

  downBtn.addEventListener("mousedown", () => {
    if (!isGameStarted) return;
    pacman.direction = DIRECTIONS.DOWN;
  });

  leftBtn.addEventListener("mousedown", () => {
    if (!isGameStarted) return;
    pacman.direction = DIRECTIONS.LEFT;
  });

  rightBtn.addEventListener("mousedown", () => {
    if (!isGameStarted) return;
    pacman.direction = DIRECTIONS.RIGHT;
  });
}

// Start the game when the page loads
window.addEventListener("load", initGame);
