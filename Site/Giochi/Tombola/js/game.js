// Game state
let numbers = [];
const extractedNumbers = new Set();
let isFirstStart = true;
let gameStarted = false;
let currentNumber = null;
let autoGenerateInterval = null;
let secondsInterval = 3; // Default interval in seconds
let lastExtractedTime = 0;
let isAnimating = false;

// DOM Elements
const extractBtn = document.getElementById("extractBtn");
const resetBtn = document.getElementById("resetBtn");
const autoBtn = document.getElementById("autoBtn");
const announceBtn = document.getElementById("announceBtn");
const intervalInput = document.getElementById("intervalInput");
const currentNumberDisplay = document.getElementById("currentNumber");
const extractedNumbersList = document.getElementById("extractedNumbersList");
const tombolaContainer = document.getElementById("tombola-container");
const confettiContainer = document.getElementById("confettiContainer");

// Speech synthesis configuration
const synth = window.speechSynthesis;
let speechEnabled = true;

// Initialize the game
async function initGame() {
  // Add loading indicator
  tombolaContainer.innerHTML =
    '<div class="loading">Caricamento tabellone...</div>';

  // Initialize numbers array
  numbers = Array.from({ length: 90 }, (_, i) => i + 1);

  // Load tables data
  try {
    const response = await fetch("../tables.json");
    const data = await response.json();
    generateTables(data.tables);

    // Add extracted numbers container if it doesn't exist
    if (!document.querySelector(".extracted-numbers")) {
      const extractedContainer = document.createElement("div");
      extractedContainer.className = "extracted-numbers";
      extractedContainer.innerHTML = `
                <h3>Numeri Estratti (0/90)</h3>
                <div class="extracted-list" id="extractedNumbersList"></div>
            `;
      // Insert before the tombola container
      tombolaContainer.parentNode.insertBefore(
        extractedContainer,
        tombolaContainer
      );
    }
  } catch (error) {
    console.error("Error loading tables:", error);
    // Fallback to generate a single table with all numbers
    const fallbackTable = {
      numbers: Array.from({ length: 90 }, (_, i) => i + 1),
    };
    generateTables([fallbackTable]);

    // Show error notification
    showNotification(
      "Errore nel caricamento delle tabelle. Utilizzando tabella predefinita.",
      "error"
    );
  }

  // Add event listeners
  extractBtn.addEventListener("click", startGame);
  resetBtn.addEventListener("click", resetGame);

  // Auto-generate event listeners
  if (autoBtn) {
    autoBtn.addEventListener("click", toggleAutoGenerate);
  }
  if (intervalInput) {
    intervalInput.addEventListener("change", updateInterval);
    intervalInput.value = secondsInterval;
  }

  // Announce button event listener
  if (announceBtn) {
    announceBtn.addEventListener("click", announceExtractedNumbers);
  }

  // Add speech toggle button
  addSpeechToggle();

  // Update UI
  updateUI();

  // Add swipe gestures for mobile
  addSwipeGestures();

  // Add keyboard shortcuts
  addKeyboardShortcuts();

  // Announce start at page load with a delay to ensure the speech synthesis is ready
  setTimeout(() => {
    speak("Si inizia!");
  }, 1000);
}

// Generate tables
function generateTables(tablesData) {
  let tableContent = "";

  tablesData.forEach((table, index) => {
    tableContent += `<div class="sub-table">`;
    tableContent += `<table>`;

    // Create rows with 5 numbers each
    for (let i = 0; i < table.numbers.length; i += 5) {
      tableContent += `<tr>`;
      for (let j = 0; j < 5; j++) {
        const number = table.numbers[i + j];
        if (number) {
          tableContent += `<td id="nr${number}" onclick="choseMe(this)">${number}</td>`;
        } else {
          tableContent += `<td></td>`;
        }
      }
      tableContent += `</tr>`;
    }

    tableContent += `</table>`;
    tableContent += `</div>`;
  });

  tombolaContainer.innerHTML = tableContent;

  // Add animation to tables
  const tables = document.querySelectorAll(".sub-table");
  tables.forEach((table, index) => {
    table.style.animationDelay = `${index * 0.1}s`;
    table.classList.add("fade-in");
  });
}

// Start game function
function startGame() {
  if (isAnimating) return; // Prevent multiple clicks during animation

  if (isFirstStart) {
    // Al primo click dice solo "Si inizia!" senza estrarre numeri
    speak("Si inizia!");
    isFirstStart = false;
    gameStarted = true;
    extractBtn.innerHTML = '<i class="fas fa-random"></i> Estrai Numero';

    // Add pulse animation to extract button
    extractBtn.classList.add("pulse-animation");
    setTimeout(() => {
      extractBtn.classList.remove("pulse-animation");
    }, 2000);

    return;
  }

  extractRandom();
}

function toggleAutoGenerate() {
  if (autoGenerateInterval) {
    // Stop auto-generation
    clearInterval(autoGenerateInterval);
    autoGenerateInterval = null;
    autoBtn.innerHTML = '<i class="fas fa-play"></i> Avvia Automatico';
    autoBtn.classList.remove("danger");
    autoBtn.classList.add("success");
    intervalInput.disabled = false;

    // Announce stop
    speak("Estrazione automatica fermata");
  } else {
    // Start auto-generation
    if (isFirstStart) {
      // Initialize game if it's the first start
      startGame();
    }

    // Make sure we have numbers to extract
    if (numbers.length <= 0) {
      showNotification("Tutti i numeri sono stati estratti!", "warning");
      return;
    }

    // Set up the UI first
    secondsInterval = Number.parseInt(intervalInput.value) || 3;
    autoBtn.innerHTML = '<i class="fas fa-stop"></i> Ferma Automatico';
    autoBtn.classList.remove("success");
    autoBtn.classList.add("danger");
    intervalInput.disabled = true;

    // Extract the first number immediately
    extractRandom();

    // Start the interval for subsequent numbers
    autoGenerateInterval = setInterval(extractRandom, secondsInterval * 1000);
  }
}

// Update interval time
function updateInterval() {
  const value = Number.parseInt(intervalInput.value);
  if (value && value > 0) {
    secondsInterval = value;
  } else {
    intervalInput.value = secondsInterval;
  }
}

// Extract a random number
function extractRandom() {
  if (isAnimating) return; // Prevent extraction during animations

  // Throttle extractions to prevent rapid clicking
  const now = Date.now();
  if (now - lastExtractedTime < 1000) return;
  lastExtractedTime = now;

  if (numbers.length <= 0) {
    // If auto-generate is running, stop it
    if (autoGenerateInterval) {
      toggleAutoGenerate();
      showNotification("Tutti i numeri sono stati estratti!", "success");
    }
    return;
  }

  const idx = Math.floor(Math.random() * numbers.length);
  const num = numbers[idx];

  if (!extractedNumbers.has(num)) {
    isAnimating = true;
    selectNr(num);

    // Reset animation flag after animation completes
    setTimeout(() => {
      isAnimating = false;
    }, 2000);
  }
}

// Select a number
function selectNr(nn) {
  const celnode = document.getElementById("nr" + nn);
  if (!celnode) return; // Safety check

  celnode.className = "on";
  numbers.splice(numbers.indexOf(nn), 1);
  extractedNumbers.add(nn);

  // Blink effect
  let blinkCount = 9;
  const blinkInterval = setInterval(() => {
    if (blinkCount % 2 === 0) {
      celnode.className = "on";
    } else {
      celnode.className = "blink";
    }
    blinkCount--;
    if (blinkCount < 0) {
      clearInterval(blinkInterval);
      celnode.className = "on";
    }
  }, 300);

  // Announce number using speech synthesis
  speak(`${nn}`);

  // Announce milestones
  if (extractedNumbers.size === 10) {
    setTimeout(() => speak(`Estratti 10 numeri!`), 1500);
  } else if (extractedNumbers.size === 20) {
    setTimeout(() => speak(`Estratti 20 numeri!`), 1500);
  } else if (extractedNumbers.size === 90) {
    setTimeout(() => speak(`Tutti i numeri estratti!`), 1500);
  }

  // Update current number display with animation
  currentNumber = nn;
  updateUI(true);

  // Create confetti effect for milestone numbers
  if (extractedNumbers.size % 10 === 0) {
    createConfetti();
  }

  // Update extracted numbers list
  updateExtractedNumbers();
}

// Reset a number
function resetNr(nn) {
  const celnode = document.getElementById("nr" + nn);
  if (!celnode) return; // Safety check

  celnode.className = "";
  extractedNumbers.delete(nn);
  numbers.push(nn);
  updateUI();

  // Update extracted numbers list
  updateExtractedNumbers();
}

// Toggle number selection manually
function choseMe(anode) {
  if (isAnimating) return; // Prevent interaction during animations

  const id = anode.id,
    nn = +id.match(/\d+/)[0];

  if (!extractedNumbers.has(nn)) {
    selectNr(nn);
  } else {
    resetNr(nn);
  }
}

// Update the UI
function updateUI(animate = false) {
  // Update current number display
  if (currentNumberDisplay) {
    const numberSpan = currentNumberDisplay.querySelector("span");
    if (animate && currentNumber) {
      // Add animation class
      numberSpan.classList.add("number-change");

      // Remove animation class after animation completes
      setTimeout(() => {
        numberSpan.classList.remove("number-change");
      }, 1000);
    }

    if (currentNumber) {
      numberSpan.textContent = currentNumber;
    } else {
      numberSpan.textContent = "?";
    }
  }

  // Update extracted numbers list
  updateExtractedNumbers();
}

// Update extracted numbers list
function updateExtractedNumbers() {
  const extractedList = document.getElementById("extractedNumbersList");
  if (!extractedList) return;

  extractedList.innerHTML = "";
  const sortedNumbers = Array.from(extractedNumbers).sort((a, b) => a - b);

  sortedNumbers.forEach((number) => {
    const numberTag = document.createElement("div");
    numberTag.className = "number-tag";
    numberTag.textContent = number;
    numberTag.setAttribute("aria-label", `Numero estratto ${number}`);
    extractedList.appendChild(numberTag);
  });

  // Update the heading to show count
  const heading = extractedList.parentNode.querySelector("h3");
  if (heading) {
    heading.textContent = `Numeri Estratti (${extractedNumbers.size}/90)`;
  }
}

// Reset the game
function resetGame() {
  if (isAnimating) return; // Prevent reset during animations

  // Stop auto-generation if it's running
  if (autoGenerateInterval) {
    clearInterval(autoGenerateInterval);
    autoGenerateInterval = null;
    if (autoBtn) {
      autoBtn.innerHTML = '<i class="fas fa-play"></i> Avvia Automatico';
      autoBtn.classList.remove("danger");
      autoBtn.classList.add("success");
    }
    if (intervalInput) {
      intervalInput.disabled = false;
    }
  }

  // Announce reset
  speak("Tabellone resettato!");

  isFirstStart = true;
  gameStarted = false;
  extractedNumbers.clear();
  numbers = Array.from({ length: 90 }, (_, i) => i + 1);
  currentNumber = null;

  // Reset all cells with animation
  document.querySelectorAll('td[id^="nr"]').forEach((cell, index) => {
    setTimeout(() => {
      cell.className = "";
    }, index * 5); // Staggered reset for visual effect
  });

  // Update UI
  updateUI();

  // Reset extract button text
  if (extractBtn) {
    extractBtn.innerHTML = '<i class="fas fa-random"></i> Estrai Numero';
  }

  // After a short delay, announce "Si inizia!" again
  setTimeout(() => {
    speak("Si inizia!");
  }, 1500);
}

// Create confetti effect
function createConfetti() {
  const colors = ["#ffcc00", "#ff6699", "#66ff99", "#6699ff", "#ff9966"];

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = "-10px";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = `${Math.random() * 10 + 5}px`;
    confetti.style.height = `${Math.random() * 10 + 5}px`;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

    confettiContainer.appendChild(confetti);

    // Animate confetti
    const animation = confetti.animate(
      [
        {
          transform: `translate(${Math.random() * 20 - 10}px, 0) rotate(0deg)`,
        },
        {
          transform: `translate(${Math.random() * 50 - 25}px, ${
            window.innerHeight
          }px) rotate(${Math.random() * 360}deg)`,
        },
      ],
      {
        duration: Math.random() * 3000 + 2000,
        easing: "cubic-bezier(0.1, 0.8, 0.9, 1)",
      }
    );

    animation.onfinish = () => {
      confetti.remove();
    };
  }
}

// Speech synthesis function
function speak(text) {
  if (!speechEnabled) return;

  // Cancel any ongoing speech
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "it-IT";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  synth.speak(utterance);
}

// Announce extracted numbers - Con pausa più lunga tra i numeri
function announceExtractedNumbers() {
  if (extractedNumbers.size === 0) {
    speak("Nessun numero estratto");
    showNotification("Nessun numero estratto ancora", "warning");
    return;
  }

  const sortedNumbers = Array.from(extractedNumbers).sort((a, b) => a - b);

  // Annuncia il conteggio prima
  speak(`Numeri estratti: ${extractedNumbers.size}`);

  // Pausa di 2 secondi prima di iniziare ad annunciare i numeri
  setTimeout(() => {
    let index = 0;

    function announceNext() {
      if (index < sortedNumbers.length) {
        speak(`${sortedNumbers[index]}`);
        index++;
        // Pausa di 2 secondi tra ogni numero (più lunga dell'automatico)
        setTimeout(announceNext, 2000);
      }
    }

    announceNext();
  }, 2000);

  showNotification(
    `Annunciando ${extractedNumbers.size} numeri estratti`,
    "success"
  );
}

// Add speech toggle button
function addSpeechToggle() {
  const gameHeader = document.querySelector(".game-header");
  if (!gameHeader) return;

  const speechToggle = document.createElement("button");
  speechToggle.className = "speech-toggle";
  speechToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
  speechToggle.setAttribute("aria-label", "Attiva/disattiva audio");
  speechToggle.setAttribute("title", "Attiva/disattiva audio");

  speechToggle.addEventListener("click", () => {
    speechEnabled = !speechEnabled;
    if (speechEnabled) {
      speechToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
      speak("Audio attivato");
    } else {
      speechToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
  });

  gameHeader.appendChild(speechToggle);

  // Add styles for the speech toggle
  const style = document.createElement("style");
  style.textContent = `
        .speech-toggle {
            background: none;
            border: none;
            color: var(--theme-primary);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: all 0.3s ease;
        }

        .speech-toggle:hover {
            background-color: rgba(0, 0, 0, 0.05);
            transform: scale(1.1);
        }

        @keyframes number-change {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }

        .number-change {
            animation: number-change 0.5s ease;
        }

        .fade-in {
            opacity: 0;
            transform: translateY(20px);
            animation: fadeIn 0.5s forwards;
        }

        .pulse-animation {
            animation: pulse 1s infinite alternate;
        }

        .loading {
            text-align: center;
            padding: 20px;
            font-size: 1.2rem;
            color: var(--theme-primary);
        }

        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            background-color: rgba(255, 255, 255, 0.95);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            transform: translateX(120%);
            transition: transform 0.3s ease;
            color: #333;
        }

        .notification.show {
            transform: translateX(0);
        }

        .notification.success {
            border-left: 4px solid var(--theme-success);
        }

        .notification.error {
            border-left: 4px solid var(--theme-danger);
        }

        .notification.warning {
            border-left: 4px solid var(--theme-accent);
        }
    `;
  document.head.appendChild(style);
}

// Show notification
function showNotification(message, type = "success") {
  // Remove any existing notifications
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Add to body
  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");

    // Remove from DOM after animation
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Add swipe gestures for mobile
function addSwipeGestures() {
  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    false
  );

  document.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    false
  );

  function handleSwipe() {
    const swipeThreshold = 100;

    if (touchEndX - touchStartX > swipeThreshold) {
      // Swipe right - go back
      window.location.href = "../index.html";
    } else if (touchStartX - touchEndX > swipeThreshold) {
      // Swipe left - extract number
      if (!isFirstStart) {
        extractRandom();
      } else {
        startGame();
      }
    }
  }
}

// Add keyboard shortcuts
function addKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Space or Enter to extract number
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      if (!isFirstStart) {
        extractRandom();
      } else {
        startGame();
      }
    }

    // R to reset
    if (e.code === "KeyR") {
      resetGame();
    }

    // A to toggle auto
    if (e.code === "KeyA" && autoBtn) {
      toggleAutoGenerate();
    }

    // N to announce numbers
    if (e.code === "KeyN" && announceBtn) {
      announceExtractedNumbers();
    }

    // Escape to go back
    if (e.code === "Escape") {
      window.location.href = "../index.html";
    }
  });
}

// Initialize the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", initGame);
