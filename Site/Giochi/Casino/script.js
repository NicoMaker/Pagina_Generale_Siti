// Game state
const gameState = {
  credits: 1000,
  wins: 0,
  betAmount: 10,
  isSpinning: false,
  autoSpin: false,
  reelsData: [],
  stoppedReels: 0,
  gameType: "briscola",
  cardsData: {},
  suits: [],
  manualStop: true, // Flag per il controllo manuale
};

// DOM Elements
const reels = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3"),
  document.getElementById("reel4"),
];

const reelStrips = reels.map((reel) => reel.querySelector(".reel-strip"));
const stopButtons = [
  document.getElementById("stop1"),
  document.getElementById("stop2"),
  document.getElementById("stop3"),
  document.getElementById("stop4"),
];

const spinButton = document.getElementById("spinButton");
const autoSpinButton = document.getElementById("autoSpinButton");
const maxBetButton = document.getElementById("maxBetButton");
const decreaseBetButton = document.getElementById("decreaseBet");
const increaseBetButton = document.getElementById("increaseBet");
const betAmountDisplay = document.getElementById("betAmount");
const creditsDisplay = document.getElementById("credits");
const winsDisplay = document.getElementById("wins");
const resultMessage = document.getElementById("result-message");
const winAmount = document.getElementById("win-amount");
const gameTypeSelect = document.getElementById("gameType");

// Modals
const jackpotModal = document.getElementById("jackpot-modal");
const gameOverModal = document.getElementById("game-over-modal");
const closeJackpotButton = document.getElementById("closeJackpot");
const restartGameButton = document.getElementById("restartGame");
const jackpotValue = document.getElementById("jackpot-value");

// Timer element
const spinTimer = document.getElementById("spin-timer");
let timerInterval = null;

// Audio context for sound effects
let audioContext;

// Initialize the game
async function initGame() {
  try {
    // Load cards data
    const response = await fetch("cards.json");
    if (!response.ok) throw new Error("Error loading card data");
    gameState.cardsData = await response.json();

    // Set initial game type
    updateGameType();

    // Set up event listeners
    setupEventListeners();

    // Update UI
    updateCreditsDisplay();
    updateWinsDisplay();

    // Create initial reel strips
    createReelStrips();

    // Initialize audio context on user interaction
    document.addEventListener("click", initAudio, { once: true });
  } catch (error) {
    console.error("Game initialization error:", error);
    resultMessage.textContent = "Errore nel caricamento del gioco";
  }
}

// Initialize audio context
function initAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.log("Web Audio API not supported in this browser");
  }
}

// Set up event listeners
function setupEventListeners() {
  // Spin button
  spinButton.addEventListener("click", () => {
    playSound("click");
    if (!gameState.isSpinning) {
      startSpin();
    }
  });

  // Auto spin button
  autoSpinButton.addEventListener("click", () => {
    playSound("click");
    toggleAutoSpin();
  });

  // Max bet button
  maxBetButton.addEventListener("click", () => {
    playSound("click");
    setMaxBet();
  });

  // Bet amount controls
  decreaseBetButton.addEventListener("click", () => {
    playSound("click");
    decreaseBet();
  });

  increaseBetButton.addEventListener("click", () => {
    playSound("click");
    increaseBet();
  });

  // Game type select
  gameTypeSelect.addEventListener("change", () => {
    playSound("click");
    updateGameType();
    createReelStrips();
  });

  // Stop buttons
  stopButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      playSound("stop");
      stopReel(index);
    });
  });

  // Modal buttons
  closeJackpotButton.addEventListener("click", () => {
    playSound("click");
    hideModal(jackpotModal);
  });

  restartGameButton.addEventListener("click", () => {
    playSound("click");
    resetGame();
    hideModal(gameOverModal);
  });
}

// Update game type
function updateGameType() {
  const selectedType = gameTypeSelect.value;
  gameState.gameType = selectedType;

  // Get suits based on game type
  const gameTypes = {
    briscola: () => gameState.cardsData.briscola,
    scala40: () => gameState.cardsData.scala40,
    regioni: () => gameState.cardsData.regioni,
    regioni_briscola: () =>
      gameState.cardsData.briscola.concat(gameState.cardsData.regioni),
    regioni_scala: () =>
      gameState.cardsData.scala40.concat(gameState.cardsData.regioni),
    briscola_scala40: () =>
      gameState.cardsData.briscola.concat(gameState.cardsData.scala40),
    All: () =>
      gameState.cardsData.briscola.concat(
        gameState.cardsData.scala40,
        gameState.cardsData.regioni,
      ),
  };

  gameState.suits = (gameTypes[selectedType] || gameTypes.All)();
}

// Create reel strips
function createReelStrips() {
  if (!gameState.suits || gameState.suits.length === 0) return;

  reelStrips.forEach((strip) => {
    strip.innerHTML = "";

    // Create multiple items for each reel to create a continuous loop effect
    const itemCount = 20; // Number of items per reel

    for (let i = 0; i < itemCount; i++) {
      const randomIndex = Math.floor(Math.random() * gameState.suits.length);
      const imageSrc = gameState.suits[randomIndex];

      const reelItem = document.createElement("div");
      reelItem.className = "reel-item";

      const img = document.createElement("img");
      img.src = imageSrc;
      img.alt = "Card image";

      reelItem.appendChild(img);
      strip.appendChild(reelItem);
    }
  });
}

// Start spin
function startSpin() {
  // Check if player has enough credits
  if (gameState.credits < gameState.betAmount) {
    resultMessage.textContent = "Crediti insufficienti!";
    return;
  }

  // Deduct bet amount
  gameState.credits -= gameState.betAmount;
  updateCreditsDisplay();

  // Reset game state
  gameState.isSpinning = true;
  gameState.stoppedReels = 0;
  gameState.reelsData = [];

  // Update UI
  resultMessage.textContent = "Buona fortuna!";
  winAmount.classList.remove("show");

  // Play spin sound
  playSound("spin");

  // Start spinning animation for each reel
  reels.forEach((reel, index) => {
    const strip = reelStrips[index];

    // Reset reel position
    strip.style.transition = "none";
    strip.style.transform = "translateY(0)";
    strip.classList.remove("stopped");

    // Force reflow
    void strip.offsetWidth;

    // Start spinning animation
    strip.style.transition = "transform 0.1s linear";
    strip.classList.add("spinning");

    // Show stop button immediately for better manual control
    stopButtons[index].classList.add("active");
  });

  // Auto stop reels only if manual stop is disabled
  if (!gameState.manualStop) {
    scheduleAutoStop();
  } else {
    // Start the visual timer
    startTimer(30);

    // Set a maximum time limit for manual stopping (30 seconds)
    setTimeout(() => {
      autoStopRemainingReels();
    }, 30000);
  }

  // Start timer
  startTimer(30);
}

// Start timer
function startTimer(duration) {
  // Reset and show timer
  let timeLeft = duration;
  spinTimer.textContent = timeLeft;
  spinTimer.classList.add("active");
  spinTimer.classList.remove("warning");

  // Clear any existing interval
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  // Start countdown
  timerInterval = setInterval(() => {
    timeLeft--;
    spinTimer.textContent = timeLeft;

    // Add warning class when time is running out
    if (timeLeft <= 5) {
      spinTimer.classList.add("warning");
    }

    // Stop timer when time is up or game is not spinning
    if (timeLeft <= 0 || !gameState.isSpinning) {
      clearInterval(timerInterval);
      spinTimer.classList.remove("active");
    }
  }, 1000);
}

// Stop timer
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  spinTimer.classList.remove("active");
}

// Auto stop remaining spinning reels
function autoStopRemainingReels() {
  if (!gameState.isSpinning) return;

  reels.forEach((reel, index) => {
    const strip = reelStrips[index];
    if (!strip.classList.contains("stopped")) {
      stopReel(index);
    }
  });
}

// Schedule automatic stopping of reels
function scheduleAutoStop() {
  const baseDelay = 2000; // Base delay before auto-stopping

  reels.forEach((reel, index) => {
    // Set a timeout to automatically stop each reel
    setTimeout(
      () => {
        if (
          gameState.isSpinning &&
          !reelStrips[index].classList.contains("stopped")
        ) {
          stopReel(index);
        }
      },
      baseDelay + index * 1000,
    ); // Stagger the stopping of reels
  });
}

// Modify the stopReel function to ensure it always locks on a complete image
function stopReel(index) {
  if (!gameState.isSpinning) return;

  const strip = reelStrips[index];
  if (strip.classList.contains("stopped")) return;

  // Stop the spinning animation
  strip.classList.remove("spinning");
  strip.classList.add("stopped");

  // Calculate a stopping position that ensures a complete image is shown
  const itemHeight = strip.children[0].offsetHeight;
  const totalItems = strip.children.length;

  // Always choose a position that aligns perfectly with an item
  const randomPosition = Math.floor(Math.random() * (totalItems - 4)) + 2;
  const stopPosition = -(randomPosition * itemHeight);

  // Set the final position with a smooth transition
  strip.style.transition = "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)";
  strip.style.transform = `translateY(${stopPosition}px)`;

  // Add a visual feedback for the stopped reel
  const reelWindow = reels[index].closest(".reel-window");
  reelWindow.classList.add("stopped-reel");
  setTimeout(() => {
    reelWindow.classList.remove("stopped-reel");
  }, 500);

  // Hide stop button with animation
  stopButtons[index].classList.remove("active");

  // Play a more satisfying stop sound
  playSound("stop");

  // Store the stopped item for result checking
  const stoppedItemIndex = randomPosition;
  const stoppedItem = strip.children[stoppedItemIndex];
  const imageSrc = stoppedItem.querySelector("img").src;

  gameState.reelsData[index] = {
    position: stopPosition,
    imageSrc: imageSrc,
  };

  // Increment stopped reels counter
  gameState.stoppedReels++;

  // Check if all reels are stopped
  if (gameState.stoppedReels === reels.length) {
    setTimeout(() => {
      checkResult();
    }, 500);
  }
}

// Check the result after all reels have stopped
function checkResult() {
  gameState.isSpinning = false;
  stopTimer(); // Stop the timer when all reels have stopped

  // Check if all reels show the same image
  const firstImageSrc = gameState.reelsData[0].imageSrc;
  const allMatch = gameState.reelsData.every(
    (data) => data.imageSrc === firstImageSrc,
  );

  if (allMatch) {
    // Player wins!
    const winMultiplier = 10;
    const winnings = gameState.betAmount * winMultiplier;

    gameState.credits += winnings;
    gameState.wins++;

    updateCreditsDisplay();
    updateWinsDisplay();

    // Show win animation
    resultMessage.textContent = "Hai vinto!";
    winAmount.textContent = `+${winnings}`;
    winAmount.classList.add("show");

    // Highlight winning reels
    reels.forEach((reel) => {
      reel.classList.add("winning-reel");
      setTimeout(() => {
        reel.classList.remove("winning-reel");
      }, 2000);
    });

    // Play win sound
    playSound("win");

    // Create confetti effect
    createConfetti();

    // Check for jackpot (higher bet amounts have better chances)
    const jackpotChance = gameState.betAmount / 100;
    if (Math.random() < jackpotChance) {
      triggerJackpot();
    }
  } else {
    resultMessage.textContent = "Riprova!";

    // Check if player is out of credits
    if (gameState.credits <= 0) {
      setTimeout(() => {
        showGameOver();
      }, 1000);
    }
  }

  // Continue auto spin if enabled
  if (gameState.autoSpin && gameState.credits >= gameState.betAmount) {
    setTimeout(() => {
      startSpin();
    }, 1500);
  }
}

// Trigger jackpot
function triggerJackpot() {
  const jackpotAmount = 500;
  gameState.credits += jackpotAmount;
  updateCreditsDisplay();

  // Update jackpot display
  jackpotValue.textContent = jackpotAmount;

  // Play jackpot sound
  playSound("jackpot");

  // Show jackpot modal
  showModal(jackpotModal);
}

// Show game over
function showGameOver() {
  gameState.autoSpin = false;
  autoSpinButton.classList.remove("active");
  showModal(gameOverModal);
}

// Toggle auto spin
function toggleAutoSpin() {
  gameState.autoSpin = !gameState.autoSpin;

  if (gameState.autoSpin) {
    autoSpinButton.classList.add("active");
    autoSpinButton.innerHTML = '<i class="fas fa-stop"></i><span>STOP</span>';

    if (!gameState.isSpinning && gameState.credits >= gameState.betAmount) {
      startSpin();
    }
  } else {
    autoSpinButton.classList.remove("active");
    autoSpinButton.innerHTML =
      '<i class="fas fa-sync-alt"></i><span>AUTO</span>';
  }
}

// Set max bet
function setMaxBet() {
  const maxBet = Math.min(100, gameState.credits);
  gameState.betAmount = maxBet;
  betAmountDisplay.textContent = maxBet;
}

// Decrease bet
function decreaseBet() {
  if (gameState.betAmount > 10) {
    gameState.betAmount -= 10;
    betAmountDisplay.textContent = gameState.betAmount;
  }
}

// Increase bet
function increaseBet() {
  if (gameState.betAmount < gameState.credits && gameState.betAmount < 100) {
    gameState.betAmount += 10;
    betAmountDisplay.textContent = gameState.betAmount;
  }
}

// Update credits display
function updateCreditsDisplay() {
  creditsDisplay.textContent = gameState.credits;
}

// Update wins display
function updateWinsDisplay() {
  winsDisplay.textContent = gameState.wins;
}

// Create confetti effect
function createConfetti() {
  const confettiContainer = document.getElementById("confetti-container");
  confettiContainer.innerHTML = "";

  const colors = ["#ffc107", "#e91e63", "#2196f3", "#4caf50", "#9c27b0"];

  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = `${Math.random() * 10 + 5}px`;
    confetti.style.height = `${Math.random() * 10 + 5}px`;
    confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;

    confettiContainer.appendChild(confetti);

    // Remove confetti after animation
    setTimeout(() => {
      confetti.remove();
    }, 5000);
  }
}

// Show modal
function showModal(modal) {
  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.add("show");
  }, 10);
}

// Hide modal
function hideModal(modal) {
  modal.classList.remove("show");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

// Reset game
function resetGame() {
  gameState.credits = 1000;
  gameState.wins = 0;
  gameState.betAmount = 10;
  gameState.isSpinning = false;
  gameState.autoSpin = false;

  updateCreditsDisplay();
  updateWinsDisplay();
  betAmountDisplay.textContent = gameState.betAmount;

  resultMessage.textContent = "Premi SPIN per iniziare";

  autoSpinButton.classList.remove("active");
  autoSpinButton.innerHTML = '<i class="fas fa-sync-alt"></i><span>AUTO</span>';

  createReelStrips();
}

// Play sound with Web Audio API
function playSound(type) {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Different sound types
  switch (type) {
    case "spin":
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(
        440,
        audioContext.currentTime + 0.2,
      );
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
      break;

    case "stop":
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(
        440,
        audioContext.currentTime + 0.1,
      );
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
      break;

    case "win":
      // Play a sequence of notes for win
      for (let i = 0; i < 5; i++) {
        const noteOsc = audioContext.createOscillator();
        const noteGain = audioContext.createGain();

        noteOsc.connect(noteGain);
        noteGain.connect(audioContext.destination);

        noteOsc.type = "sine";
        noteOsc.frequency.setValueAtTime(
          440 + i * 100,
          audioContext.currentTime + i * 0.1,
        );

        noteGain.gain.setValueAtTime(0, audioContext.currentTime + i * 0.1);
        noteGain.gain.linearRampToValueAtTime(
          0.3,
          audioContext.currentTime + i * 0.1 + 0.01,
        );
        noteGain.gain.linearRampToValueAtTime(
          0,
          audioContext.currentTime + i * 0.1 + 0.1,
        );

        noteOsc.start(audioContext.currentTime + i * 0.1);
        noteOsc.stop(audioContext.currentTime + i * 0.1 + 0.1);
      }
      break;

    case "jackpot":
      // Play a more elaborate sequence for jackpot
      for (let i = 0; i < 10; i++) {
        const noteOsc = audioContext.createOscillator();
        const noteGain = audioContext.createGain();

        noteOsc.connect(noteGain);
        noteGain.connect(audioContext.destination);

        noteOsc.type = i % 2 === 0 ? "sine" : "triangle";
        noteOsc.frequency.setValueAtTime(
          330 + i * 50,
          audioContext.currentTime + i * 0.08,
        );

        noteGain.gain.setValueAtTime(0, audioContext.currentTime + i * 0.08);
        noteGain.gain.linearRampToValueAtTime(
          0.3,
          audioContext.currentTime + i * 0.08 + 0.01,
        );
        noteGain.gain.linearRampToValueAtTime(
          0,
          audioContext.currentTime + i * 0.08 + 0.2,
        );

        noteOsc.start(audioContext.currentTime + i * 0.08);
        noteOsc.stop(audioContext.currentTime + i * 0.08 + 0.2);
      }
      break;

    case "click":
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.05);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.05);
      break;
  }
}

// Initialize the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", initGame);
