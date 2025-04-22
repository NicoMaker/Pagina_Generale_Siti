// Global variables
let conteggioOccorrenze = [0, 0, 0, 0, 0, 0];
let graficoBarre;
let rollHistory = [];
const MAX_HISTORY = 10;
let isRolling = false;

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", initialize);

function initialize() {
  // Initialize chart
  initializeChart();

  // Add event listeners
  document
    .getElementById("generateButton")
    .addEventListener("click", startRollingAnimation);
  document
    .getElementById("increment-btn")
    .addEventListener("click", incrementDice);
  document
    .getElementById("decrement-btn")
    .addEventListener("click", decrementDice);

  // Tab switching
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab");

      // Remove active class from all tabs and contents
      document
        .querySelectorAll(".tab-button")
        .forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));

      // Add active class to clicked tab and corresponding content
      button.classList.add("active");
      document.getElementById(`${tabId}-tab`).classList.add("active");
    });
  });

  // Create initial dice
  updateDiceDisplay(2);
}

// Increment dice count
function incrementDice() {
  const input = document.getElementById("numero-dadi");
  const currentValue = parseInt(input.value);
  const max = parseInt(input.getAttribute("max"));

  if (currentValue < max) {
    input.value = currentValue + 1;
    updateDiceDisplay(currentValue + 1);
  }
}

// Decrement dice count
function decrementDice() {
  const input = document.getElementById("numero-dadi");
  const currentValue = parseInt(input.value);
  const min = parseInt(input.getAttribute("min"));

  if (currentValue > min) {
    input.value = currentValue - 1;
    updateDiceDisplay(currentValue - 1);
  }
}

// Initialize chart with default values
function initializeChart() {
  const ctx = document.getElementById("grafico-barre").getContext("2d");

  if (graficoBarre) {
    graficoBarre.destroy();
  }

  graficoBarre = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["1", "2", "3", "4", "5", "6"],
      datasets: [
        {
          label: "Volte",
          data: conteggioOccorrenze,
          backgroundColor: [
            "#6200EA",
            "#7C4DFF",
            "#651FFF",
            "#B388FF",
            "#9575CD",
            "#D1C4E9",
          ],
          borderColor: [
            "#4A148C",
            "#5E35B1",
            "#4527A0",
            "#7E57C2",
            "#673AB7",
            "#9575CD",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: {
              family: "Segoe UI",
              size: 14,
            },
            padding: 20,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage =
                total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

// Update dice display
function updateDiceDisplay(numDice) {
  const container = document.getElementById("dice-container");
  container.innerHTML = "";

  for (let i = 0; i < numDice; i++) {
    const dice = createDice();
    container.appendChild(dice);
  }
}

// Create a single dice with all faces
function createDice() {
  const dice = document.createElement("div");
  dice.className = "dice";

  // Create all 6 faces
  for (let i = 1; i <= 6; i++) {
    const face = document.createElement("div");
    face.className = "dice-face";
    face.setAttribute("data-value", i);

    // Add dots based on the face value
    for (let j = 0; j < i; j++) {
      const dot = document.createElement("span");
      dot.className = "dice-dot";
      face.appendChild(dot);
    }

    dice.appendChild(face);
  }

  return dice;
}

// Start rolling animation
function startRollingAnimation() {
  if (isRolling) return;
  isRolling = true;

  // Get number of dice
  const numeroDadi =
    parseInt(document.getElementById("numero-dadi").value) || 2;

  // Update dice display
  updateDiceDisplay(numeroDadi);

  // Reset statistics
  resetConteggioOccorrenze();

  // Disable roll button during animation
  document.getElementById("generateButton").disabled = true;

  // Get all dice
  const diceElements = document.querySelectorAll(".dice");

  // Add rolling class to all dice
  diceElements.forEach((dice) => {
    dice.classList.add("rolling");
  });

  // Generate final results (determined at the start but revealed at the end)
  const finalResults = [];

  for (let i = 0; i < numeroDadi; i++) {
    finalResults.push(Math.floor(Math.random() * 6) + 1);
  }

  // After animation completes, show final results
  setTimeout(() => {
    // Remove rolling class
    diceElements.forEach((dice, index) => {
      dice.classList.remove("rolling");

      if (index < finalResults.length) {
        const value = finalResults[index];
        setDiceValue(dice, value);
        conteggioOccorrenze[value - 1]++;
      }
    });

    // Calculate total
    const total = finalResults.reduce((sum, val) => sum + val, 0);

    // Update results
    document.getElementById("numeri-parziali").textContent =
      "Numeri parziali: " + finalResults.join(", ");
    document.getElementById("somma-totale").textContent =
      "Somma totale: " + total;

    // Update statistics
    updateStatistics(numeroDadi);

    // Add to history
    addToHistory(finalResults, total);

    // Re-enable roll button
    document.getElementById("generateButton").disabled = false;
    isRolling = false;
  }, 1500);
}

// Set dice to show specific value
function setDiceValue(dice, value) {
  // Calculate rotation based on value
  // In a real dice, opposite faces sum to 7
  // 1 is opposite to 6, 2 to 5, and 3 to 4
  let rotateX = 0;
  let rotateY = 0;

  switch (value) {
    case 1: // Front face (default)
      rotateX = 0;
      rotateY = 0;
      break;
    case 6: // Back face (opposite to 1)
      rotateY = 180;
      break;
    case 3: // Right face
      rotateY = 90;
      break;
    case 4: // Left face (opposite to 3)
      rotateY = -90;
      break;
    case 5: // Top face
      rotateX = 90;
      break;
    case 2: // Bottom face (opposite to 5)
      rotateX = -90;
      break;
  }

  dice.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

// Reset statistics counters
function resetConteggioOccorrenze() {
  conteggioOccorrenze = [0, 0, 0, 0, 0, 0];
}

// Update statistics display
function updateStatistics(totalDice) {
  // Update chart
  updateChart();

  // Update table
  updateTable(totalDice);
}

// Update chart
function updateChart() {
  if (graficoBarre) {
    graficoBarre.data.datasets[0].data = conteggioOccorrenze;
    graficoBarre.update();
  } else {
    initializeChart();
  }
}

// Update table
function updateTable(totalDice) {
  if (totalDice > 0) {
    let tabellaPercentuali = creaTabellaPercentuali(totalDice);
    document.getElementById("valori_uscite").innerHTML = tabellaPercentuali;
  }
}

// Create percentages table
function creaTabellaPercentuali(totalDice) {
  let tabella = `<table>
    <tr>
        <td>Numero</td>
        <td>Uscita Numero</td>
        <td>Percentuale uscita numero</td>
    </tr>`;

  for (let i = 0; i < conteggioOccorrenze.length; i++) {
    tabella += `
    <tr>
      <td>${i + 1}</td>
      <td>${conteggioOccorrenze[i]}</td>
      <td>${((conteggioOccorrenze[i] / totalDice) * 100).toFixed(2)} %</td>
    </tr>`;
  }

  tabella += `</table>`;
  return tabella;
}

// Add roll to history
function addToHistory(results, total) {
  // Create history item
  const historyItem = {
    results: results,
    total: total,
    timestamp: new Date(),
  };

  // Add to beginning of array
  rollHistory.unshift(historyItem);

  // Limit history size
  if (rollHistory.length > MAX_HISTORY) {
    rollHistory.pop();
  }

  // Update history display
  updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
  const historyContainer = document.getElementById("history-list");

  if (!historyContainer) return;

  historyContainer.innerHTML = "";

  if (rollHistory.length === 0) {
    historyContainer.innerHTML =
      '<div class="empty-history">Nessun lancio precedente</div>';
    return;
  }

  rollHistory.forEach((item) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    // Format time
    const time = item.timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Create dice display
    let diceHTML = "";
    item.results.forEach((value) => {
      diceHTML += `<div class="history-dice-item">${value}</div>`;
    });

    historyItem.innerHTML = `
      <div class="history-info">
        <span class="history-time">${time}</span>
        <span class="history-total">Totale: ${item.total}</span>
      </div>
      <div class="history-result">
        <div class="history-dice">${diceHTML}</div>
      </div>
    `;

    historyContainer.appendChild(historyItem);
  });
}

// Generate random number between min and max (inclusive)
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Initialize the app
initialize();
