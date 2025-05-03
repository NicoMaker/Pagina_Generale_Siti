// Game constants
const CELL_TYPES = {
    EMPTY: 0,
    WALL: 1,
    DOT: 2,
    POWER_PELLET: 3,
    PACMAN: 4,
    GHOST: 5,
}

const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
}

// Game configuration
let gameConfig = null
let currentDifficulty = "easy"

// Game state
let gameBoard = []
let pacman = { x: 0, y: 0, direction: DIRECTIONS.RIGHT }
let ghosts = []
let score = 0
let lives = 3
let gameInterval
let ghostsInterval
let isPaused = false
let isFrightenedMode = false
let frightenedModeTimeout
let isGameStarted = false

// DOM elements
const gameBoardElement = document.getElementById("game-board")
const scoreElement = document.getElementById("score")
const livesElement = document.getElementById("lives")
const difficultySelector = document.getElementById("difficulty")
const startGameButton = document.getElementById("start-game")
const currentDifficultyElement = document.getElementById("current-difficulty")

// Touch controls
const upBtn = document.getElementById("up-btn")
const downBtn = document.getElementById("down-btn")
const leftBtn = document.getElementById("left-btn")
const rightBtn = document.getElementById("right-btn")

// Load configuration
async function loadConfig() {
    try {
        const response = await fetch("config.json")
        gameConfig = await response.json()
        console.log("Configuration loaded:", gameConfig)
    } catch (error) {
        console.error("Error loading configuration:", error)
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
        }
    }
}

// Initialize the game
async function initGame() {
    await loadConfig()

    // Set default difficulty to "easy"
    difficultySelector.value = "easy"
    currentDifficulty = "easy"
    currentDifficultyElement.textContent = "Easy"

    // Set up event listeners
    setupControls()
    setupDifficultySelector()

    // Show initial board without starting the game
    createGameBoard()
    renderBoard()
}

// Set up difficulty selector
function setupDifficultySelector() {
    startGameButton.addEventListener("click", () => {
        if (isGameStarted) {
            resetGame()
        }

        currentDifficulty = difficultySelector.value
        const difficultySettings = gameConfig.difficulties[currentDifficulty]

        // Update game settings based on difficulty
        lives = difficultySettings.lives
        updateLives()

        // Update displayed difficulty
        currentDifficultyElement.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)

        // Start the game
        startGame()
    })
}

// Start the game
function startGame() {
    // Clear any existing intervals
    if (gameInterval) clearInterval(gameInterval)
    if (ghostsInterval) clearInterval(ghostsInterval)

    // Reset game state
    score = 0
    updateScore()
    isPaused = false
    isGameStarted = true

    // Create the game board
    createGameBoard()
    placePacman()
    placeGhosts()
    renderBoard()

    // Get difficulty settings
    const difficultySettings = gameConfig.difficulties[currentDifficulty]

    // Start game loops with appropriate speeds
    gameInterval = setInterval(updateGame, difficultySettings.pacmanSpeed)
    ghostsInterval = setInterval(updateGhosts, difficultySettings.ghostSpeed)
}

// Create the game board with walls and dots
function createGameBoard() {
    // Use the maze layout from config
    gameBoard = JSON.parse(JSON.stringify(gameConfig.mazeLayouts.standard))

    // Set up the grid size
    const rows = gameBoard.length
    const cols = gameBoard[0].length

    gameBoardElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`
    gameBoardElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
}

// Place Pac-Man on the board
function placePacman() {
    // Place Pac-Man at a specific position
    pacman = { x: 9, y: 15, direction: DIRECTIONS.RIGHT }
    gameBoard[pacman.y][pacman.x] = CELL_TYPES.PACMAN
}

// Place ghosts on the board
function placeGhosts() {
    ghosts = [
        { x: 8, y: 9, direction: DIRECTIONS.UP, color: "red", frightened: false },
        { x: 9, y: 9, direction: DIRECTIONS.UP, color: "pink", frightened: false },
        { x: 10, y: 9, direction: DIRECTIONS.UP, color: "cyan", frightened: false },
        { x: 11, y: 9, direction: DIRECTIONS.UP, color: "orange", frightened: false },
    ]

    ghosts.forEach((ghost) => {
        if (gameBoard[ghost.y][ghost.x] === CELL_TYPES.EMPTY) {
            gameBoard[ghost.y][ghost.x] = CELL_TYPES.GHOST
        }
    })
}

// Render the game board
function renderBoard() {
    gameBoardElement.innerHTML = ""

    for (let y = 0; y < gameBoard.length; y++) {
        for (let x = 0; x < gameBoard[y].length; x++) {
            const cell = document.createElement("div")
            cell.className = "cell"

            switch (gameBoard[y][x]) {
                case CELL_TYPES.WALL:
                    cell.classList.add("wall")
                    break
                case CELL_TYPES.DOT:
                    const dot = document.createElement("div")
                    dot.className = "dot"
                    cell.appendChild(dot)
                    break
                case CELL_TYPES.POWER_PELLET:
                    const powerPellet = document.createElement("div")
                    powerPellet.className = "power-pellet"
                    cell.appendChild(powerPellet)
                    break
                case CELL_TYPES.PACMAN:
                    const pacmanElement = document.createElement("div")
                    pacmanElement.className = "pacman"

                    // Rotate Pac-Man based on direction
                    let rotation = 0
                    if (pacman.direction === DIRECTIONS.UP) rotation = 270
                    else if (pacman.direction === DIRECTIONS.DOWN) rotation = 90
                    else if (pacman.direction === DIRECTIONS.LEFT) rotation = 180

                    pacmanElement.style.transform = `rotate(${rotation}deg)`
                    cell.appendChild(pacmanElement)
                    break
            }

            // Check if there's a ghost at this position
            const ghost = ghosts.find((g) => g.x === x && g.y === y)
            if (ghost) {
                const ghostElement = document.createElement("div")
                ghostElement.className = `ghost ${ghost.frightened ? "frightened" : ghost.color}`
                cell.appendChild(ghostElement)
            }

            gameBoardElement.appendChild(cell)
        }
    }
}

// Update the game state
function updateGame() {
    if (isPaused || !isGameStarted) return

    // Save Pac-Man's current position
    const prevX = pacman.x
    const prevY = pacman.y

    // Calculate new position
    const newX = pacman.x + pacman.direction.x
    const newY = pacman.y + pacman.direction.y

    // Check if the new position is valid
    if (isValidMove(newX, newY)) {
        // Check if Pac-Man eats a dot
        if (gameBoard[newY][newX] === CELL_TYPES.DOT) {
            score += 10
            updateScore()
        }

        // Check if Pac-Man eats a power pellet
        if (gameBoard[newY][newX] === CELL_TYPES.POWER_PELLET) {
            score += 50
            updateScore()
            activateFrightenedMode()
        }

        // Move Pac-Man
        gameBoard[prevY][prevX] = CELL_TYPES.EMPTY
        gameBoard[newY][newX] = CELL_TYPES.PACMAN
        pacman.x = newX
        pacman.y = newY

        // Check for ghost collision
        checkGhostCollision()

        // Check if all dots are eaten
        checkWinCondition()
    }

    renderBoard()
}

// Update ghosts movement
function updateGhosts() {
    if (isPaused || !isGameStarted) return

    const difficultySettings = gameConfig.difficulties[currentDifficulty]
    const ghostIntelligence = difficultySettings.ghostIntelligence

    ghosts.forEach((ghost) => {
        // Save ghost's current position
        const prevX = ghost.x
        const prevY = ghost.y

        // Determine ghost's next move
        const possibleDirections = getPossibleDirections(ghost)

        if (possibleDirections.length > 0) {
            // Choose a direction
            let nextDirection

            if (ghost.frightened) {
                // Random movement when frightened
                const randomIndex = Math.floor(Math.random() * possibleDirections.length)
                nextDirection = possibleDirections[randomIndex]
            } else {
                // Use ghost intelligence based on difficulty
                if (Math.random() < ghostIntelligence) {
                    // Chase Pac-Man (intelligent movement)
                    nextDirection = getDirectionTowardsPacman(ghost, possibleDirections)
                } else {
                    // Random movement (less intelligent)
                    const randomIndex = Math.floor(Math.random() * possibleDirections.length)
                    nextDirection = possibleDirections[randomIndex]
                }
            }

            // Update ghost direction
            ghost.direction = nextDirection

            // Calculate new position
            const newX = ghost.x + ghost.direction.x
            const newY = ghost.y + ghost.direction.y

            // Move ghost
            ghost.x = newX
            ghost.y = newY
        }
    })

    // Check for ghost collision
    checkGhostCollision()

    renderBoard()
}

// Get possible directions for a ghost
function getPossibleDirections(ghost) {
    const possibleDirections = []

    // Check each direction
    for (const dir in DIRECTIONS) {
        const newX = ghost.x + DIRECTIONS[dir].x
        const newY = ghost.y + DIRECTIONS[dir].y

        // Check if the new position is valid
        if (isValidMove(newX, newY)) {
            // Avoid going back in the opposite direction
            const isOpposite =
                (ghost.direction === DIRECTIONS.UP && DIRECTIONS[dir] === DIRECTIONS.DOWN) ||
                (ghost.direction === DIRECTIONS.DOWN && DIRECTIONS[dir] === DIRECTIONS.UP) ||
                (ghost.direction === DIRECTIONS.LEFT && DIRECTIONS[dir] === DIRECTIONS.RIGHT) ||
                (ghost.direction === DIRECTIONS.RIGHT && DIRECTIONS[dir] === DIRECTIONS.LEFT)

            if (!isOpposite) {
                possibleDirections.push(DIRECTIONS[dir])
            }
        }
    }

    // If no valid directions (except opposite), allow going back
    if (possibleDirections.length === 0) {
        for (const dir in DIRECTIONS) {
            const newX = ghost.x + DIRECTIONS[dir].x
            const newY = ghost.y + DIRECTIONS[dir].y

            if (isValidMove(newX, newY)) {
                possibleDirections.push(DIRECTIONS[dir])
            }
        }
    }

    return possibleDirections
}

// Get direction towards Pac-Man (simple AI)
function getDirectionTowardsPacman(ghost, possibleDirections) {
    // If frightened, choose random direction
    if (ghost.frightened) {
        const randomIndex = Math.floor(Math.random() * possibleDirections.length)
        return possibleDirections[randomIndex]
    }

    // Calculate distance to Pac-Man for each possible direction
    let bestDirection = possibleDirections[0]
    let shortestDistance = Number.POSITIVE_INFINITY

    possibleDirections.forEach((direction) => {
        const newX = ghost.x + direction.x
        const newY = ghost.y + direction.y

        const distance = Math.sqrt(Math.pow(newX - pacman.x, 2) + Math.pow(newY - pacman.y, 2))

        if (distance < shortestDistance) {
            shortestDistance = distance
            bestDirection = direction
        }
    })

    return bestDirection
}

// Check if a move is valid
function isValidMove(x, y) {
    // Check if the position is within the board
    if (x < 0 || x >= gameBoard[0].length || y < 0 || y >= gameBoard.length) {
        return false
    }

    // Check if the position is not a wall
    return gameBoard[y][x] !== CELL_TYPES.WALL
}

// Check for ghost collision
function checkGhostCollision() {
    const collidedGhost = ghosts.find((ghost) => ghost.x === pacman.x && ghost.y === pacman.y)

    if (collidedGhost) {
        if (collidedGhost.frightened) {
            // Eat the ghost
            score += 200
            updateScore()

            // Reset ghost position
            collidedGhost.x = 9
            collidedGhost.y = 9
            collidedGhost.frightened = false
        } else {
            // Lose a life
            lives--
            updateLives()

            if (lives <= 0) {
                gameOver()
            } else {
                resetPositions()
            }
        }
    }
}

// Check if all dots are eaten
function checkWinCondition() {
    for (let y = 0; y < gameBoard.length; y++) {
        for (let x = 0; x < gameBoard[y].length; x++) {
            if (gameBoard[y][x] === CELL_TYPES.DOT || gameBoard[y][x] === CELL_TYPES.POWER_PELLET) {
                return // Still have dots to eat
            }
        }
    }

    // All dots eaten, player wins
    winGame()
}

// Activate frightened mode
function activateFrightenedMode() {
    isFrightenedMode = true

    // Get duration from difficulty settings
    const difficultySettings = gameConfig.difficulties[currentDifficulty]
    const frightenedModeDuration = difficultySettings.frightenedModeDuration

    // Set all ghosts to frightened
    ghosts.forEach((ghost) => {
        ghost.frightened = true
    })

    // Clear existing timeout if there is one
    if (frightenedModeTimeout) {
        clearTimeout(frightenedModeTimeout)
    }

    // Set timeout to end frightened mode
    frightenedModeTimeout = setTimeout(() => {
        isFrightenedMode = false
        ghosts.forEach((ghost) => {
            ghost.frightened = false
        })
    }, frightenedModeDuration)
}

// Reset positions after losing a life
function resetPositions() {
    // Pause the game briefly
    isPaused = true

    // Reset Pac-Man position
    gameBoard[pacman.y][pacman.x] = CELL_TYPES.EMPTY
    pacman.x = 9
    pacman.y = 15
    pacman.direction = DIRECTIONS.RIGHT
    gameBoard[pacman.y][pacman.x] = CELL_TYPES.PACMAN

    // Reset ghost positions
    ghosts.forEach((ghost, index) => {
        ghost.x = 8 + index
        ghost.y = 9
        ghost.frightened = false
    })

    renderBoard()

    // Resume the game after a delay
    setTimeout(() => {
        isPaused = false
    }, 1000)
}

// Game over
function gameOver() {
    clearInterval(gameInterval)
    clearInterval(ghostsInterval)
    isGameStarted = false

    alert("Game Over! Your score: " + score)
}

// Modify the winGame function to progress to the next difficulty level
function winGame() {
    clearInterval(gameInterval)
    clearInterval(ghostsInterval)
    isGameStarted = false

    // Get the next difficulty level
    let nextDifficulty
    switch (currentDifficulty) {
        case "easy":
            nextDifficulty = "medium"
            break
        case "medium":
            nextDifficulty = "hard"
            break
        case "hard":
            nextDifficulty = "expert"
            break
        case "expert":
            nextDifficulty = "easy" // Loop back to easy after completing expert
            break
        default:
            nextDifficulty = "easy"
    }

    // Show win message with current level and next level
    const currentLevelName = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)
    const nextLevelName = nextDifficulty.charAt(0).toUpperCase() + nextDifficulty.slice(1)

    alert(
        `Congratulations! You've completed the ${currentLevelName} level! Your score: ${score}\n\nAdvancing to ${nextLevelName} level...`,
    )

    // Set the next difficulty level in the selector
    difficultySelector.value = nextDifficulty

    // Start the next level after a short delay
    setTimeout(() => {
        currentDifficulty = nextDifficulty
        const difficultySettings = gameConfig.difficulties[currentDifficulty]

        // Update game settings based on new difficulty
        lives = difficultySettings.lives
        updateLives()

        // Update displayed difficulty
        currentDifficultyElement.textContent = currentLevelName

        // Start the game with the new difficulty
        startGame()
    }, 1500)
}

// Reset the game
function resetGame() {
    // Clear intervals
    if (gameInterval) clearInterval(gameInterval)
    if (ghostsInterval) clearInterval(ghostsInterval)

    // Reset game state
    score = 0
    updateScore()
    isGameStarted = false
    isPaused = false

    // Clear the board
    gameBoard = []
    ghosts = []

    // Create empty board
    createGameBoard()
    renderBoard()
}

// Update the score display
function updateScore() {
    scoreElement.textContent = score
}

// Update the lives display
function updateLives() {
    livesElement.textContent = lives
}

// Set up keyboard and touch controls
function setupControls() {
    // Keyboard controls
    document.addEventListener("keydown", (e) => {
        if (!isGameStarted) return

        switch (e.key) {
            case "ArrowUp":
                pacman.direction = DIRECTIONS.UP
                break
            case "ArrowDown":
                pacman.direction = DIRECTIONS.DOWN
                break
            case "ArrowLeft":
                pacman.direction = DIRECTIONS.LEFT
                break
            case "ArrowRight":
                pacman.direction = DIRECTIONS.RIGHT
                break
        }
    })

    // Touch controls
    upBtn.addEventListener("touchstart", () => {
        if (!isGameStarted) return
        pacman.direction = DIRECTIONS.UP
    })

    downBtn.addEventListener("touchstart", () => {
        if (!isGameStarted) return
        pacman.direction = DIRECTIONS.DOWN
    })

    leftBtn.addEventListener("touchstart", () => {
        if (!isGameStarted) return
        pacman.direction = DIRECTIONS.LEFT
    })

    rightBtn.addEventListener("touchstart", () => {
        if (!isGameStarted) return
        pacman.direction = DIRECTIONS.RIGHT
    })

    // Mouse controls (for testing on desktop)
    upBtn.addEventListener("mousedown", () => {
        if (!isGameStarted) return
        pacman.direction = DIRECTIONS.UP
    })

    downBtn.addEventListener("mousedown", () => {
        if (!isGameStarted) return
        pacman.direction = DIRECTIONS.DOWN
    })

    leftBtn.addEventListener("mousedown", () => {
        if (!isGameStarted) return
        pacman.direction = DIRECTIONS.LEFT
    })

    rightBtn.addEventListener("mousedown", () => {
        if (!isGameStarted) return
        pacman.direction = DIRECTIONS.RIGHT
    })
}

// Start the game when the page loads
window.addEventListener("load", initGame)
