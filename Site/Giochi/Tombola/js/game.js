// Game state
let numbers = [];
let extractedNumbers = new Set();
let isFirstStart = true;
let gameStarted = false;
let currentNumber = null;
let autoGenerateInterval = null;
let secondsInterval = 3; // Default interval in seconds

// DOM Elements
const extractBtn = document.getElementById("extractBtn");
const resetBtn = document.getElementById("resetBtn");
const autoBtn = document.getElementById("autoBtn");
const intervalInput = document.getElementById("intervalInput");
const currentNumberDisplay = document.getElementById("currentNumber");
const extractedNumbersList = document.getElementById("extractedNumbersList");
const tombolaContainer = document.getElementById("tombola-container");
const confettiContainer = document.getElementById("confettiContainer");

// Initialize the game
async function initGame() {
  // Initialize numbers array
  numbers = Array.from({ length: 90 }, (_, i) => i + 1);

  // Load tables data
  try {
    const response = await fetch("../tables.json");
    const data = await response.json();
    generateTables(data.tables);
  } catch (error) {
    console.error("Error loading tables:", error);
    // Fallback to generate a single table with all numbers
    const fallbackTable = {
      numbers: Array.from({ length: 90 }, (_, i) => i + 1),
    };
    generateTables([fallbackTable]);
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

  // Update UI
  updateUI();

  // Announce start at page load
  speechSynthesis.speak(new SpeechSynthesisUtterance("Si inizia!"));
}

// Generate tables
function generateTables(tables) {
  let tableContent = "";

  tables.forEach((table, index) => {
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

    tableContent += `</table></div>`;
  });

  tombolaContainer.innerHTML = tableContent;
}

// Start game function - maintains your original logic
function startGame() {
  if (isFirstStart) {
    // Al primo click dice solo "Si inizia!" senza estrarre numeri
    speechSynthesis.speak(new SpeechSynthesisUtterance("Si inizia!"));
    isFirstStart = false;
    gameStarted = true;
    extractBtn.innerHTML = '<i class="fas fa-random"></i> Estrai Numero';
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
    speechSynthesis.speak(
      new SpeechSynthesisUtterance("Estrazione automatica fermata")
    );
  } else {
    // Start auto-generation
    if (isFirstStart) {
      // Initialize game if it's the first start
      startGame();
    }

    // Make sure we have numbers to extract
    if (numbers.length <= 0) {
      alert("Tutti i numeri sono stati estratti!");
      return;
    }

    // Set up the UI first
    secondsInterval = parseInt(intervalInput.value) || 3;
    autoBtn.innerHTML = '<i class="fas fa-pause"></i> Ferma Automatico';
    autoBtn.classList.remove("success");
    autoBtn.classList.add("danger");
    intervalInput.disabled = true;

    // Extract the first number immediately
    extractRandom();

    // Then announce the automatic extraction
    speechSynthesis.speak(
      new SpeechSynthesisUtterance(
        `Estrazione automatica ogni ${secondsInterval} secondi`
      )
    );

    // Finally, start the interval for subsequent numbers
    autoGenerateInterval = setInterval(extractRandom, secondsInterval * 1000);
  }
}
// Update interval time
function updateInterval() {
  const value = parseInt(intervalInput.value);
  if (value && value > 0) {
    secondsInterval = value;
  } else {
    intervalInput.value = secondsInterval;
  }
}

// Extract a random number
function extractRandom() {
  if (numbers.length <= 0) {
    // If auto-generate is running, stop it
    if (autoGenerateInterval) {
      toggleAutoGenerate();
      alert("Tutti i numeri sono stati estratti!");
    }
    return;
  }

  const idx = Math.floor(Math.random() * numbers.length);
  const num = numbers[idx];

  if (!extractedNumbers.has(num)) {
    selectNr(num);
  }
}

// Select a number
function selectNr(nn) {
  let celnode = document.getElementById("nr" + nn);
  celnode.className = "on";
  numbers.splice(numbers.indexOf(nn), 1);
  extractedNumbers.add(nn);

  // Blink effect
  let blinkCount = 9;
  let blinkInterval = setInterval(() => {
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
  speechSynthesis.speak(new SpeechSynthesisUtterance(`${nn}`));

  // Update current number display
  currentNumber = nn;
  updateUI();

  // Create confetti effect for milestone numbers
  if (extractedNumbers.size % 10 === 0) {
    createConfetti();
  }
}

// Reset a number
function resetNr(nn) {
  let celnode = document.getElementById("nr" + nn);
  celnode.className = "";
  extractedNumbers.delete(nn);
  numbers.push(nn);
  updateUI();
}

// Toggle number selection manually
function choseMe(anode) {
  let id = anode.id,
    nn = +id.match(/\d+/)[0];
  if (!extractedNumbers.has(nn)) {
    selectNr(nn);
  } else {
    resetNr(nn);
  }
}

// Update the UI
function updateUI() {
  // Update current number display
  if (currentNumber) {
    currentNumberDisplay.querySelector("span").textContent = currentNumber;
  } else {
    currentNumberDisplay.querySelector("span").textContent = "?";
  }

  // Update extracted numbers list
  if (extractedNumbersList) {
    extractedNumbersList.innerHTML = "";

    const sortedNumbers = Array.from(extractedNumbers).sort((a, b) => a - b);

    sortedNumbers.forEach((number) => {
      const numberTag = document.createElement("div");
      numberTag.className = "number-tag";
      numberTag.textContent = number;
      extractedNumbersList.appendChild(numberTag);
    });
  }
}

// Reset the game
function resetGame() {
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
  speechSynthesis.speak(new SpeechSynthesisUtterance("Tabellone resettato!"));

  isFirstStart = true;
  gameStarted = false;
  extractedNumbers.clear();
  numbers = Array.from({ length: 90 }, (_, i) => i + 1);
  currentNumber = null;

  // Reset all cells
  document.querySelectorAll('td[id^="nr"]').forEach((cell) => {
    cell.className = "";
  });

  // Update UI
  updateUI();

  // Reset extract button text
  if (extractBtn) {
    extractBtn.innerHTML = '<i class="fas fa-random"></i> Estrai Numero';
  }

  // After a short delay, announce "Si inizia!" again
  setTimeout(() => {
    speechSynthesis.speak(new SpeechSynthesisUtterance("Si inizia!"));
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

// Initialize the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", initGame);
