// Game constants
const CELL_SIZE = 20; // Size of each cell in pixels
const GRID_WIDTH = 28; // Number of cells in width
const GRID_HEIGHT = 31; // Number of cells in height
const PACMAN_SPEED = 150; // Milliseconds per movement
const GHOST_SPEED = 200; // Milliseconds per ghost movement
const FRIGHTENED_TIME = 10000; // Duration of frightened mode (ms)
const FRUIT_DURATION = 10000; // Duration of fruit (ms)
const FRUIT_SCORE = {
  cherry: 100,
  strawberry: 300,
  orange: 500,
  apple: 700,
  melon: 1000,
  galaxian: 2000,
  bell: 3000,
  key: 5000,
};

// Game variables
let score = 0;
let highScore = localStorage.getItem("pacmanHighScore") || 0;
let lives = 3;
let level = 1;
let dotsCount = 0;
let totalDots = 0;
let gameRunning = false;
let gamePaused = false;
let gameInterval;
let ghostIntervals = [];
let frightenedTimeout;
let fruitTimeout;
let currentFruit = null;
let gameScale = 1; // For responsive scaling

// DOM elements
const gameBoardElement = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const livesElement = document.getElementById("lives-display");
const levelElement = document.getElementById("level");
const startBtn = document.getElementById("startBtn");
const startGameBtn = document.getElementById("startGameBtn");
const restartBtn = document.getElementById("restartBtn");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const resumeBtn = document.getElementById("resumeBtn");
const quitBtn = document.getElementById("quitBtn");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over");
const levelCompleteScreen = document.getElementById("level-complete");
const pauseScreen = document.getElementById("pause-screen");
const finalScoreElement = document.getElementById("finalScore");
const currentScoreElement = document.getElementById("currentScore");
const currentLevelElement = document.getElementById("currentLevel");

// Game elements
let pacman = {
  x: 14,
  y: 23,
  direction: "right",
  nextDirection: null,
  moving: false,
};

// Ghost definitions
let ghosts = [
  {
    x: 14,
    y: 11,
    direction: "left",
    type: "blinky",
    mode: "scatter",
    target: { x: 27, y: 0 },
    frightened: false,
    eaten: false,
    speed: GHOST_SPEED,
  },
  {
    x: 13,
    y: 14,
    direction: "up",
    type: "pinky",
    mode: "scatter",
    target: { x: 0, y: 0 },
    frightened: false,
    eaten: false,
    speed: GHOST_SPEED + 50,
  },
  {
    x: 14,
    y: 14,
    direction: "up",
    type: "inky",
    mode: "scatter",
    target: { x: 27, y: 31 },
    frightened: false,
    eaten: false,
    speed: GHOST_SPEED + 25,
  },
  {
    x: 15,
    y: 14,
    direction: "up",
    type: "clyde",
    mode: "scatter",
    target: { x: 0, y: 31 },
    frightened: false,
    eaten: false,
    speed: GHOST_SPEED + 75,
  },
];

// Maze layout (0: empty, 1: wall, 2: dot, 3: power pill, 4: ghost house)
const mazeLayout = [
  [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1,
  ],
  [
    1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    2, 2, 1,
  ],
  [
    1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1,
    1, 2, 1,
  ],
  [
    1, 3, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1,
    1, 3, 1,
  ],
  [
    1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1,
    1, 2, 1,
  ],
  [
    1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    2, 2, 1,
  ],
  [
    1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1,
    1, 2, 1,
  ],
  [
    1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1,
    1, 2, 1,
  ],
  [
    1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2,
    2, 2, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1,
    1, 1, 1,
  ],
  [
    0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 0, 0,
    0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0,
    0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 4, 4, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0,
    0, 0, 0,
  ],
  [
    1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1, 1,
    1, 1, 1,
  ],
  [
    0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0,
    0, 0, 0,
  ],
  [
    1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1, 1,
    1, 1, 1,
  ],
  [
    0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0,
    0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0,
    0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0,
    0, 0, 0,
  ],
  [
    1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1,
    1, 1, 1,
  ],
  [
    1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    2, 2, 1,
  ],
  [
    1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1,
    1, 2, 1,
  ],
  [
    1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1,
    1, 2, 1,
  ],
  [
    1, 3, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2,
    2, 3, 1,
  ],
  [
    1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2,
    1, 1, 1,
  ],
  [
    1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2,
    1, 1, 1,
  ],
  [
    1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2,
    2, 2, 1,
  ],
  [
    1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 2, 1,
  ],
  [
    1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 2, 1,
  ],
  [
    1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    2, 2, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1,
  ],
];

let gameBoard = JSON.parse(JSON.stringify(mazeLayout));

// Initialize the game
function initGame() {
  // Determine appropriate cell size based on screen size
  adjustCellSize();

  // Set board dimensions
  gameBoardElement.style.gridTemplateColumns = `repeat(${GRID_WIDTH}, ${
    CELL_SIZE * gameScale
  }px)`;
  gameBoardElement.style.gridTemplateRows = `repeat(${GRID_HEIGHT}, ${
    CELL_SIZE * gameScale
  }px)`;

  // Update displayed scores
  highScoreElement.textContent = highScore;
  scoreElement.textContent = "0";
  updateLivesDisplay();
  levelElement.textContent = "1";

  // Initialize the board
  createBoard();

  // Add mobile controls if needed
  addMobileControls();

  // Show start screen
  startScreen.classList.remove("hidden");

  // Add resize event listener
  window.addEventListener("resize", handleResize);
}

// Adjust cell size based on screen dimensions
function adjustCellSize() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Calculate the maximum possible cell size
  const maxCellWidth = (screenWidth * 0.9) / GRID_WIDTH;
  const maxCellHeight = (screenHeight * 0.7) / GRID_HEIGHT;

  // Use the smaller of the two to ensure the board fits
  const optimalCellSize = Math.min(maxCellWidth, maxCellHeight, CELL_SIZE);

  // Set the scale factor
  gameScale = optimalCellSize / CELL_SIZE;

  // Apply minimum scale to ensure visibility
  if (gameScale < 0.6) gameScale = 0.6;
}

// Handle window resize
function handleResize() {
  if (!gameRunning) {
    adjustCellSize();
    gameBoardElement.style.gridTemplateColumns = `repeat(${GRID_WIDTH}, ${
      CELL_SIZE * gameScale
    }px)`;
    gameBoardElement.style.gridTemplateRows = `repeat(${GRID_HEIGHT}, ${
      CELL_SIZE * gameScale
    }px)`;
    createBoard();
  }
}

// Update lives display
function updateLivesDisplay() {
  livesElement.innerHTML = "";
  for (let i = 0; i < lives; i++) {
    const lifeIcon = document.createElement("div");
    lifeIcon.classList.add("life-icon");
    livesElement.appendChild(lifeIcon);
  }
}

// Create the game board
function createBoard() {
  gameBoardElement.innerHTML = "";
  dotsCount = 0;
  totalDots = 0;

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = x;
      cell.dataset.y = y;

      // Set cell size with scale factor
      cell.style.width = `${CELL_SIZE * gameScale}px`;
      cell.style.height = `${CELL_SIZE * gameScale}px`;

      // Set cell content based on layout
      if (gameBoard[y][x] === 1) {
        cell.classList.add("wall");
      } else if (gameBoard[y][x] === 2) {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        cell.appendChild(dot);
        totalDots++;
      } else if (gameBoard[y][x] === 3) {
        const powerPill = document.createElement("div");
        powerPill.classList.add("power-pill");
        cell.appendChild(powerPill);
        totalDots++;
      }

      gameBoardElement.appendChild(cell);
    }
  }
}

// Update game display
function updateDisplay() {
  // Remove previous Pac-Man and ghosts
  document
    .querySelectorAll(".pacman-container, .ghost-container, .fruit")
    .forEach((el) => el.remove());

  // Update Pac-Man
  const pacmanCell = document.querySelector(
    `.cell[data-x="${pacman.x}"][data-y="${pacman.y}"]`
  );
  if (pacmanCell) {
    const pacmanContainer = document.createElement("div");
    pacmanContainer.classList.add("pacman-container");

    const pacmanElement = document.createElement("div");
    pacmanElement.classList.add("pacman");

    const mouthElement = document.createElement("div");
    mouthElement.classList.add("mouth", pacman.direction);
    pacmanElement.appendChild(mouthElement);

    pacmanContainer.appendChild(pacmanElement);
    pacmanCell.appendChild(pacmanContainer);
  }

  // Update ghosts
  ghosts.forEach((ghost) => {
    const ghostCell = document.querySelector(
      `.cell[data-x="${ghost.x}"][data-y="${ghost.y}"]`
    );
    if (ghostCell) {
      const ghostContainer = document.createElement("div");
      ghostContainer.classList.add("ghost-container");

      const ghostElement = document.createElement("div");
      ghostElement.classList.add("ghost", ghost.type, ghost.direction);

      if (ghost.frightened) {
        ghostElement.classList.add("frightened");
      }

      if (ghost.eaten) {
        ghostElement.classList.add("eaten");
      }

      // Add improved eyes
      const eyesElement = document.createElement("div");
      eyesElement.classList.add("ghost-eyes");

      const leftEye = document.createElement("div");
      leftEye.classList.add("eye");
      const leftPupil = document.createElement("div");
      leftPupil.classList.add("pupil");
      leftEye.appendChild(leftPupil);

      const rightEye = document.createElement("div");
      rightEye.classList.add("eye");
      const rightPupil = document.createElement("div");
      rightPupil.classList.add("pupil");
      rightEye.appendChild(rightPupil);

      eyesElement.appendChild(leftEye);
      eyesElement.appendChild(rightEye);
      ghostElement.appendChild(eyesElement);

      ghostContainer.appendChild(ghostElement);
      ghostCell.appendChild(ghostContainer);
    }
  });

  // Update fruit
  if (currentFruit) {
    const fruitCell = document.querySelector(
      `.cell[data-x="${currentFruit.x}"][data-y="${currentFruit.y}"]`
    );
    if (fruitCell) {
      const fruitElement = document.createElement("div");
      fruitElement.classList.add("fruit", currentFruit.type);
      fruitCell.appendChild(fruitElement);
    }
  }

  // Update score and lives
  scoreElement.textContent = score;

  // Update high score if needed
  if (score > highScore) {
    highScore = score;
    highScoreElement.textContent = highScore;
    localStorage.setItem("pacmanHighScore", highScore);
  }
}

// Move Pac-Man
function movePacman() {
  if (!gameRunning || gamePaused) return;

  // Check if there's a next direction waiting
  if (pacman.nextDirection) {
    const newPos = getNewPosition(pacman.x, pacman.y, pacman.nextDirection);
    if (isValidMove(newPos.x, newPos.y)) {
      pacman.direction = pacman.nextDirection;
      pacman.nextDirection = null;
    }
  }

  // Calculate new position
  const newPos = getNewPosition(pacman.x, pacman.y, pacman.direction);

  // Check if move is valid
  if (isValidMove(newPos.x, newPos.y)) {
    pacman.x = newPos.x;
    pacman.y = newPos.y;

    // Handle tunnel
    handleTunnel();

    // Check collisions
    checkCollisions();
  }

  updateDisplay();
}

// Get new position based on direction
function getNewPosition(x, y, direction) {
  let newX = x;
  let newY = y;

  switch (direction) {
    case "up":
      newY--;
      break;
    case "down":
      newY++;
      break;
    case "left":
      newX--;
      break;
    case "right":
      newX++;
      break;
  }

  return { x: newX, y: newY };
}

// Check if a move is valid
function isValidMove(x, y) {
  // Check board boundaries
  if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
    return true; // Allow tunnel
  }

  // Check if it's a wall
  return gameBoard[y][x] !== 1;
}

// Handle tunnel
function handleTunnel() {
  // Left tunnel
  if (pacman.x < 0) {
    pacman.x = GRID_WIDTH - 1;
  }
  // Right tunnel
  else if (pacman.x >= GRID_WIDTH) {
    pacman.x = 0;
  }
  // Top tunnel
  else if (pacman.y < 0) {
    pacman.y = GRID_HEIGHT - 1;
  }
  // Bottom tunnel
  else if (pacman.y >= GRID_HEIGHT) {
    pacman.y = 0;
  }
}

// Check collisions
function checkCollisions() {
  // Check collision with dots
  if (gameBoard[pacman.y][pacman.x] === 2) {
    // Eat the dot
    gameBoard[pacman.y][pacman.x] = 0;
    score += 10;
    dotsCount++;
    playSound("eat");

    // Remove dot from DOM
    const cell = document.querySelector(
      `.cell[data-x="${pacman.x}"][data-y="${pacman.y}"]`
    );
    if (cell) {
      const dot = cell.querySelector(".dot");
      if (dot) dot.remove();
    }

    // Check if level is complete
    checkLevelComplete();
  }
  // Check collision with power pill
  else if (gameBoard[pacman.y][pacman.x] === 3) {
    // Eat the power pill
    gameBoard[pacman.y][pacman.x] = 0;
    score += 50;
    dotsCount++;
    playSound("power");

    // Remove power pill from DOM
    const cell = document.querySelector(
      `.cell[data-x="${pacman.x}"][data-y="${pacman.y}"]`
    );
    if (cell) {
      const powerPill = cell.querySelector(".power-pill");
      if (powerPill) powerPill.remove();
    }

    // Activate frightened mode
    activateFrightenedMode();

    // Check if level is complete
    checkLevelComplete();
  }

  // Check collision with fruit
  if (
    currentFruit &&
    pacman.x === currentFruit.x &&
    pacman.y === currentFruit.y
  ) {
    // Eat the fruit
    score += FRUIT_SCORE[currentFruit.type];
    playSound("fruit");

    // Show bonus points
    showBonusPoints(FRUIT_SCORE[currentFruit.type], pacman.x, pacman.y);

    // Remove fruit
    currentFruit = null;
    clearTimeout(fruitTimeout);
  }

  // Check collision with ghosts
  ghosts.forEach((ghost) => {
    if (pacman.x === ghost.x && pacman.y === ghost.y) {
      if (ghost.frightened && !ghost.eaten) {
        // Eat the ghost
        ghost.eaten = true;

        // Calculate score (200, 400, 800, 1600)
        const eatenCount = ghosts.filter((g) => g.eaten).length;
        const points = 200 * Math.pow(2, eatenCount - 1);
        score += points;

        // Show bonus points
        showBonusPoints(points, ghost.x, ghost.y);

        playSound("eatghost");

        // Reset ghost after a while
        setTimeout(() => {
          ghost.x = 14;
          ghost.y = 11;
          ghost.eaten = false;
          ghost.frightened = false;
        }, 3000);
      } else if (!ghost.eaten) {
        // Lose a life
        loseLife();
      }
    }
  });
}

// Activate frightened mode
function activateFrightenedMode() {
  // Set all ghosts to frightened mode
  ghosts.forEach((ghost) => {
    if (!ghost.eaten) {
      ghost.frightened = true;
      // Reverse direction
      ghost.direction = getOppositeDirection(ghost.direction);
    }
  });

  // Clear existing timeout if present
  if (frightenedTimeout) {
    clearTimeout(frightenedTimeout);
  }

  // Set timeout to end frightened mode
  frightenedTimeout = setTimeout(() => {
    ghosts.forEach((ghost) => {
      ghost.frightened = false;
    });
  }, FRIGHTENED_TIME / Math.sqrt(level)); // Duration decreases with level
}

// Get opposite direction
function getOppositeDirection(direction) {
  switch (direction) {
    case "up":
      return "down";
    case "down":
      return "up";
    case "left":
      return "right";
    case "right":
      return "left";
    default:
      return direction;
  }
}

// Move ghosts
function moveGhost(ghost) {
  if (!gameRunning || gamePaused || ghost.eaten) return;

  const possibleDirections = [];

  // Calculate possible directions
  const directions = ["up", "down", "left", "right"];

  directions.forEach((dir) => {
    const pos = getNewPosition(ghost.x, ghost.y, dir);

    // Check if move is valid and not opposite direction
    if (
      isValidMove(pos.x, pos.y) &&
      dir !== getOppositeDirection(ghost.direction)
    ) {
      // Ghosts can't return to ghost house unless eaten
      if (
        pos.x >= 0 &&
        pos.x < GRID_WIDTH &&
        pos.y >= 0 &&
        pos.y < GRID_HEIGHT
      ) {
        if (gameBoard[pos.y][pos.x] !== 4 || ghost.eaten) {
          possibleDirections.push({ dir, x: pos.x, y: pos.y });
        }
      } else {
        // Handle tunnel
        let tunnelX = pos.x;
        let tunnelY = pos.y;

        if (tunnelX < 0) tunnelX = GRID_WIDTH - 1;
        if (tunnelX >= GRID_WIDTH) tunnelX = 0;
        if (tunnelY < 0) tunnelY = GRID_HEIGHT - 1;
        if (tunnelY >= GRID_HEIGHT) tunnelY = 0;

        possibleDirections.push({ dir, x: tunnelX, y: tunnelY });
      }
    }
  });

  // If no possible directions, allow turning back
  if (possibleDirections.length === 0) {
    const oppositeDir = getOppositeDirection(ghost.direction);
    const pos = getNewPosition(ghost.x, ghost.y, oppositeDir);

    if (isValidMove(pos.x, pos.y)) {
      possibleDirections.push({ dir: oppositeDir, x: pos.x, y: pos.y });
    }
  }

  // Choose direction based on mode
  let chosenDirection;

  if (ghost.frightened) {
    // In frightened mode, move randomly
    chosenDirection =
      possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
  } else {
    // Calculate target based on ghost type
    const target = calculateGhostTarget(ghost);

    // Sort directions by distance to target
    possibleDirections.sort((a, b) => {
      const distA = getDistance(a.x, a.y, target.x, target.y);
      const distB = getDistance(b.x, b.y, target.x, target.y);
      return distA - distB;
    });

    // Choose best direction
    chosenDirection = possibleDirections[0];
  }

  // Update ghost position
  if (chosenDirection) {
    ghost.x = chosenDirection.x;
    ghost.y = chosenDirection.y;
    ghost.direction = chosenDirection.dir;

    // Handle tunnel
    if (ghost.x < 0) ghost.x = GRID_WIDTH - 1;
    if (ghost.x >= GRID_WIDTH) ghost.x = 0;
    if (ghost.y < 0) ghost.y = GRID_HEIGHT - 1;
    if (ghost.y >= GRID_HEIGHT) ghost.y = 0;

    // Check collision with Pac-Man
    if (ghost.x === pacman.x && ghost.y === pacman.y) {
      if (ghost.frightened && !ghost.eaten) {
        // Eat the ghost
        ghost.eaten = true;

        // Calculate score (200, 400, 800, 1600)
        const eatenCount = ghosts.filter((g) => g.eaten).length;
        const points = 200 * Math.pow(2, eatenCount - 1);
        score += points;

        // Show bonus points
        showBonusPoints(points, ghost.x, ghost.y);

        playSound("eatghost");

        // Reset ghost after a while  ghost.x, ghost.y);

        playSound("eatghost");

        // Reset ghost after a while
        setTimeout(() => {
          ghost.x = 14;
          ghost.y = 11;
          ghost.eaten = false;
          ghost.frightened = false;
        }, 3000);
      } else if (!ghost.eaten) {
        // Lose a life
        loseLife();
      }
    }
  }
}

// Calculate target for ghost
function calculateGhostTarget(ghost) {
  switch (ghost.type) {
    case "blinky":
      // Blinky targets Pac-Man directly
      return { x: pacman.x, y: pacman.y };

    case "pinky":
      // Pinky targets 4 cells ahead of Pac-Man
      let targetX = pacman.x;
      let targetY = pacman.y;

      switch (pacman.direction) {
        case "up":
          targetY -= 4;
          break;
        case "down":
          targetY += 4;
          break;
        case "left":
          targetX -= 4;
          break;
        case "right":
          targetX += 4;
          break;
      }

      return { x: targetX, y: targetY };

    case "inky":
      // Inky uses Blinky's and Pac-Man's positions
      const blinky = ghosts.find((g) => g.type === "blinky");
      let pivotX = pacman.x;
      let pivotY = pacman.y;

      // 2 cells ahead of Pac-Man
      switch (pacman.direction) {
        case "up":
          pivotY -= 2;
          break;
        case "down":
          pivotY += 2;
          break;
        case "left":
          pivotX -= 2;
          break;
        case "right":
          pivotX += 2;
          break;
      }

      // Calculate vector from Blinky to pivot and double it
      const vectorX = pivotX - blinky.x;
      const vectorY = pivotY - blinky.y;

      return { x: pivotX + vectorX, y: pivotY + vectorY };

    case "clyde":
      // Clyde alternates between chasing Pac-Man and running away
      const distance = getDistance(ghost.x, ghost.y, pacman.x, pacman.y);

      if (distance < 8) {
        // If too close, run to bottom-left corner
        return { x: 0, y: GRID_HEIGHT - 1 };
      } else {
        // Otherwise, chase Pac-Man
        return { x: pacman.x, y: pacman.y };
      }

    default:
      return { x: pacman.x, y: pacman.y };
  }
}

// Calculate distance between two points
function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Lose a life
function loseLife() {
  lives--;
  updateLivesDisplay();
  playSound("death");

  if (lives <= 0) {
    gameOver();
  } else {
    pauseGame();

    // Show animation of death
    const pacmanElement = document.querySelector(".pacman");
    if (pacmanElement) {
      pacmanElement.classList.add("dying");

      setTimeout(() => {
        // Reset positions
        resetPositions();

        // Resume game after a pause
        setTimeout(resumeGame, 1000);
      }, 1000);
    } else {
      // Reset positions
      resetPositions();

      // Resume game after a pause
      setTimeout(resumeGame, 1000);
    }
  }
}

// Reset positions
function resetPositions() {
  // Reset Pac-Man
  pacman = {
    x: 14,
    y: 23,
    direction: "right",
    nextDirection: null,
    moving: false,
  };

  // Reset ghosts
  ghosts = [
    {
      x: 14,
      y: 11,
      direction: "left",
      type: "blinky",
      mode: "scatter",
      target: { x: 27, y: 0 },
      frightened: false,
      eaten: false,
      speed: GHOST_SPEED,
    },
    {
      x: 13,
      y: 14,
      direction: "up",
      type: "pinky",
      mode: "scatter",
      target: { x: 0, y: 0 },
      frightened: false,
      eaten: false,
      speed: GHOST_SPEED + 50,
    },
    {
      x: 14,
      y: 14,
      direction: "up",
      type: "inky",
      mode: "scatter",
      target: { x: 27, y: 31 },
      frightened: false,
      eaten: false,
      speed: GHOST_SPEED + 25,
    },
    {
      x: 15,
      y: 14,
      direction: "up",
      type: "clyde",
      mode: "scatter",
      target: { x: 0, y: 31 },
      frightened: false,
      eaten: false,
      speed: GHOST_SPEED + 75,
    },
  ];

  // Clear timeouts
  if (frightenedTimeout) {
    clearTimeout(frightenedTimeout);
  }

  if (fruitTimeout) {
    clearTimeout(fruitTimeout);
  }

  // Remove fruit
  currentFruit = null;

  updateDisplay();
}

// Check if level is complete
function checkLevelComplete() {
  if (dotsCount >= totalDots) {
    levelComplete();
  } else if (
    dotsCount === Math.floor(totalDots / 3) ||
    dotsCount === Math.floor((totalDots * 2) / 3)
  ) {
    // Spawn fruit at 1/3 and 2/3 of dots eaten
    spawnFruit();
  }
}

// Spawn fruit
function spawnFruit() {
  // Choose fruit type based on level
  const fruitTypes = [
    "cherry",
    "strawberry",
    "orange",
    "apple",
    "melon",
    "galaxian",
    "bell",
    "key",
  ];
  const fruitType = fruitTypes[Math.min(level - 1, fruitTypes.length - 1)];

  // Position fruit
  currentFruit = {
    x: 14,
    y: 17,
    type: fruitType,
  };

  // Set timeout to remove fruit
  if (fruitTimeout) {
    clearTimeout(fruitTimeout);
  }

  fruitTimeout = setTimeout(() => {
    currentFruit = null;
  }, FRUIT_DURATION);

  updateDisplay();
}

// Show bonus points
function showBonusPoints(points, x, y) {
  const bonusElement = document.createElement("div");
  bonusElement.textContent = points;
  bonusElement.classList.add("bonus-points");
  bonusElement.style.left = `${
    x * CELL_SIZE * gameScale + (CELL_SIZE * gameScale) / 2
  }px`;
  bonusElement.style.top = `${y * CELL_SIZE * gameScale}px`;

  gameBoardElement.appendChild(bonusElement);

  // Remove element after animation
  setTimeout(() => {
    bonusElement.remove();
  }, 1000);
}

// Level complete
function levelComplete() {
  pauseGame();

  // Update score and level
  level++;
  score += 1000; // Bonus for completing level

  // Update DOM elements
  currentScoreElement.textContent = score;
  currentLevelElement.textContent = level;

  // Show level complete screen
  levelCompleteScreen.classList.remove("hidden");

  // Add celebration animation
  const levelCompleteTitle = document.querySelector(".level-complete-title");
  levelCompleteTitle.classList.add("celebrate");

  // Remove animation after it's done
  setTimeout(() => {
    levelCompleteTitle.classList.remove("celebrate");
  }, 1500);
}

// Next level
function nextLevel() {
  // Hide level complete screen
  levelCompleteScreen.classList.add("hidden");

  // Reset board
  gameBoard = JSON.parse(JSON.stringify(mazeLayout));
  dotsCount = 0;

  // Recreate board
  createBoard();

  // Reset positions
  resetPositions();

  // Increase ghost speed with level
  ghosts.forEach((ghost) => {
    ghost.speed = Math.max(GHOST_SPEED - level * 10, 100);
  });

  // Update level displayed
  levelElement.textContent = level;

  // Restart game
  startGame();
}

// Game over
function gameOver() {
  pauseGame();

  // Update final score
  finalScoreElement.textContent = score;

  // Save high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("pacmanHighScore", highScore);
  }

  // Show game over screen
  gameOverScreen.classList.remove("hidden");
}

// Start game
function startGame() {
  if (gameRunning) return;

  gameRunning = true;
  gamePaused = false;
  startBtn.textContent = "PAUSE";

  // Start game loop
  gameInterval = setInterval(movePacman, PACMAN_SPEED);

  // Start ghost movement
  ghostIntervals = ghosts.map((ghost) =>
    setInterval(() => moveGhost(ghost), ghost.speed)
  );

  // Spawn fruit after a while
  setTimeout(spawnFruit, 10000);
}

// Pause game
function pauseGame() {
  if (!gameRunning) return;

  gameRunning = false;
  gamePaused = true;
  startBtn.textContent = "RESUME";

  // Stop game loops
  clearInterval(gameInterval);
  ghostIntervals.forEach((interval) => clearInterval(interval));
}

// Show pause screen
function showPauseScreen() {
  pauseGame();
  pauseScreen.classList.remove("hidden");
}

// Hide pause screen
function hidePauseScreen() {
  pauseScreen.classList.add("hidden");
}

// Resume game
function resumeGame() {
  hidePauseScreen();
  gameRunning = true;
  gamePaused = false;
  startBtn.textContent = "PAUSE";

  // Start game loop
  gameInterval = setInterval(movePacman, PACMAN_SPEED);

  // Start ghost movement
  ghostIntervals = ghosts.map((ghost) =>
    setInterval(() => moveGhost(ghost), ghost.speed)
  );
}

// Reset game
function resetGame() {
  // Stop game
  pauseGame();

  // Reset variables
  score = 0;
  lives = 3;
  level = 1;
  dotsCount = 0;

  // Reset board
  gameBoard = JSON.parse(JSON.stringify(mazeLayout));

  // Recreate board
  createBoard();

  // Reset positions
  resetPositions();

  // Update lives
  updateLivesDisplay();

  // Update level
  levelElement.textContent = "1";

  // Hide screens
  gameOverScreen.classList.add("hidden");
  levelCompleteScreen.classList.add("hidden");
  pauseScreen.classList.add("hidden");

  // Update button
  startBtn.textContent = "START GAME";
}

// Add mobile controls
function addMobileControls() {
  // Check if mobile controls already exist
  if (document.querySelector(".mobile-controls")) return;

  const mobileControls = document.createElement("div");
  mobileControls.classList.add("mobile-controls");

  const directions = [
    { class: "up-btn", text: "↑", direction: "up" },
    { class: "left-btn", text: "←", direction: "left" },
    { class: "right-btn", text: "→", direction: "right" },
    { class: "down-btn", text: "↓", direction: "down" },
  ];

  directions.forEach((dir) => {
    const btn = document.createElement("div");
    btn.classList.add("control-btn", dir.class);
    btn.textContent = dir.text;

    // Add event listeners for both touch and mouse
    btn.addEventListener("touchstart", (e) => {
      e.preventDefault(); // Prevent scrolling
      pacman.nextDirection = dir.direction;
    });

    btn.addEventListener("mousedown", () => {
      pacman.nextDirection = dir.direction;
    });

    mobileControls.appendChild(btn);
  });

  document.querySelector(".controls").appendChild(mobileControls);
}

// Simulate sounds (in a real version, use Audio API)
function playSound(type) {
  // In a real version, here you would play the sounds
  console.log(`Playing sound: ${type}`);

  // Example of how to implement sounds:
  /*
  const sounds = {
    eat: new Audio('sounds/eat.wav'),
    power: new Audio('sounds/power.wav'),
    death: new Audio('sounds/death.wav'),
    eatghost: new Audio('sounds/eatghost.wav'),
    fruit: new Audio('sounds/fruit.wav')
  };
  
  if (sounds[type]) {
    sounds[type].currentTime = 0;
    sounds[type].play();
  }
  */
}

// Prevent page scrolling when using arrow keys
window.addEventListener(
  "keydown",
  (e) => {
    // Space and arrow keys
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault();
    }
  },
  false
);

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Initialize game
  initGame();

  // Event listener for start/pause button
  startBtn.addEventListener("click", () => {
    if (gameRunning) {
      showPauseScreen();
    } else {
      startGame();
    }
  });

  // Event listener for start button on start screen
  startGameBtn.addEventListener("click", () => {
    startScreen.classList.add("hidden");
    startGame();
  });

  // Event listener for restart button
  restartBtn.addEventListener("click", () => {
    resetGame();
    startGame();
  });

  // Event listener for next level button
  nextLevelBtn.addEventListener("click", () => {
    nextLevel();
  });

  // Event listener for resume button
  resumeBtn.addEventListener("click", () => {
    resumeGame();
  });

  // Event listener for quit button
  quitBtn.addEventListener("click", () => {
    resetGame();
    startScreen.classList.remove("hidden");
  });

  // Event listener for arrow keys
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowUp":
        pacman.nextDirection = "up";
        break;
      case "ArrowDown":
        pacman.nextDirection = "down";
        break;
      case "ArrowLeft":
        pacman.nextDirection = "left";
        break;
      case "ArrowRight":
        pacman.nextDirection = "right";
        break;
      case " ": // Space for pause/resume
        if (gameRunning) {
          showPauseScreen();
        } else if (gamePaused) {
          resumeGame();
        } else {
          startGame();
        }
        break;
      case "Escape": // Escape for pause
        if (gameRunning) {
          showPauseScreen();
        }
        break;
    }
  });
});
