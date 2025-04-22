// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", initialize);

// Global variables
let myChart = null;
let tossHistory = [];
const MAX_HISTORY = 10;

// Initialize the application
function initialize() {
  // Add event listeners to increment/decrement buttons
  const incrementButton = document.querySelector(".increment");
  const decrementButton = document.querySelector(".decrement");

  incrementButton.addEventListener("click", () => {
    const input = document.getElementById("numCoins");
    const currentValue = parseInt(input.value);
    const max = parseInt(input.getAttribute("max"));

    if (currentValue < max) {
      input.value = currentValue + 1;
    }
  });

  decrementButton.addEventListener("click", () => {
    const input = document.getElementById("numCoins");
    const currentValue = parseInt(input.value);
    const min = parseInt(input.getAttribute("min"));

    if (currentValue > min) {
      input.value = currentValue - 1;
    }
  });

  // Add event listener to toss button
  document
    .getElementById("generateButton")
    .addEventListener("click", startCoinTossing);

  // Initialize chart
  initializeChart(0, 0);
}

// Initialize chart with default values
function initializeChart(headsCount, tailsCount) {
  const ctx = document.getElementById("myChart").getContext("2d");

  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Teste", "Croci"],
      datasets: [
        {
          data: [headsCount, tailsCount],
          backgroundColor: [
            "rgba(14, 165, 233, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
          borderColor: ["rgba(14, 165, 233, 1)", "rgba(239, 68, 68, 1)"],
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
              family: "Montserrat",
              size: 14,
              weight: "bold",
            },
            padding: 20,
            color: "#1e293b",
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
          titleFont: {
            family: "Montserrat",
            size: 14,
            weight: "bold",
          },
          bodyFont: {
            family: "Montserrat",
            size: 14,
          },
          padding: 12,
        },
      },
      cutout: "70%",
      animation: {
        animateScale: true,
        animateRotate: true,
      },
    },
  });
}

// Display error message
function displayErrorMessage(message) {
  document.getElementById("heads-count").textContent = "0";
  document.getElementById("heads-percentage").textContent = "0%";
  document.getElementById("tails-count").textContent = "0";
  document.getElementById("tails-percentage").textContent = "0%";

  const winnerElement = document.getElementById("winner-text");
  winnerElement.textContent = message;
  document.getElementById("winner-announcement").className =
    "winner-announcement";

  initializeChart(0, 0);
}

// Update results display
function updateResults(headsCount, tailsCount, numCoins) {
  // Update stats
  document.getElementById("heads-count").textContent = headsCount;
  document.getElementById("heads-percentage").textContent = `${(
    (headsCount / numCoins) *
    100
  ).toFixed(1)}%`;
  document.getElementById("tails-count").textContent = tailsCount;
  document.getElementById("tails-percentage").textContent = `${(
    (tailsCount / numCoins) *
    100
  ).toFixed(1)}%`;

  // Update chart
  updateChart(headsCount, tailsCount);

  // Display winner
  displayWinner(headsCount, tailsCount);
}

// Display winner
function displayWinner(headsCount, tailsCount) {
  const winnerElement = document.getElementById("winner-text");
  const winnerAnnouncement = document.getElementById("winner-announcement");

  if (headsCount > tailsCount) {
    winnerElement.textContent = "🏆 HANNO VINTO LE TESTE! 🏆";
    winnerAnnouncement.className = "winner-announcement heads";
  } else if (tailsCount > headsCount) {
    winnerElement.textContent = "🏆 HA VINTO LA CROCE! 🏆";
    winnerAnnouncement.className = "winner-announcement tails";
  } else {
    winnerElement.textContent = "🤝 PAREGGIO! 🤝";
    winnerAnnouncement.className = "winner-announcement tie";
  }
}

// Update chart
function updateChart(headsCount, tailsCount) {
  if (myChart) {
    myChart.data.datasets[0].data = [headsCount, tailsCount];
    myChart.update();
  } else {
    initializeChart(headsCount, tailsCount);
  }
}

// Toss coins
function tossCoins() {
  const numCoins = parseInt(document.getElementById("numCoins").value);

  if (isNaN(numCoins) || numCoins < 1) {
    displayErrorMessage("Inserisci un numero valido");
    return;
  }

  let headsCount = 0;
  let tailsCount = 0;
  let results = [];

  for (let i = 0; i < numCoins; i++) {
    const isHeads = Math.random() < 0.5;
    if (isHeads) {
      headsCount++;
      results.push("heads");
    } else {
      tailsCount++;
      results.push("tails");
    }
  }

  // Update results display
  updateResults(headsCount, tailsCount, numCoins);

  // Add to history
  addToHistory(numCoins, results, headsCount, tailsCount);

  // Animate coin flip
  animateCoinFlip(results[0] === "heads");

  return { headsCount, tailsCount, results };
}

// Animate coin flip
function animateCoinFlip(isHeads) {
  const coin = document.getElementById("coin");
  const resultOverlay = document.getElementById("result-overlay");
  const resultText = document.getElementById("result-text");

  // Hide result overlay during animation
  resultOverlay.classList.remove("show");

  // Remove previous animation
  coin.classList.remove("flip");

  // Force reflow to restart animation
  void coin.offsetWidth;

  // Add animation class
  coin.classList.add("flip");

  // Set final rotation based on result
  setTimeout(() => {
    coin.style.transform = isHeads ? "rotateY(0deg)" : "rotateY(180deg)";

    // Show the result text that's always upright
    resultText.textContent = isHeads ? "T" : "C";
    resultText.style.color = isHeads ? "#38bdf8" : "#f87171";
    resultOverlay.classList.add("show");
  }, 1000);
}

// Start coin tossing animation
function startCoinTossing() {
  // Disable button during animation
  const button = document.getElementById("generateButton");
  button.disabled = true;

  // Reset coin position
  const coin = document.getElementById("coin");
  coin.style.transform = "rotateY(0deg)";

  // Hide result overlay
  document.getElementById("result-overlay").classList.remove("show");

  // Update winner announcement
  const winnerElement = document.getElementById("winner-text");
  winnerElement.textContent = "Lancio in corso...";
  document.getElementById("winner-announcement").className =
    "winner-announcement";

  // Start animation
  let iterations = 0;
  const maxIterations = 5;
  const interval = setInterval(() => {
    const randomResult = Math.random() < 0.5;

    // Just flip the coin without showing the result overlay
    coin.classList.remove("flip");
    void coin.offsetWidth;
    coin.classList.add("flip");

    setTimeout(() => {
      coin.style.transform = randomResult ? "rotateY(0deg)" : "rotateY(180deg)";
    }, 200);

    iterations++;

    if (iterations >= maxIterations) {
      clearInterval(interval);

      // Final toss with real result
      setTimeout(() => {
        const result = tossCoins();

        // Re-enable button
        button.disabled = false;
      }, 500);
    }
  }, 300);
}

// Add toss to history
function addToHistory(numCoins, results, headsCount, tailsCount) {
  // Create history item
  const historyItem = {
    numCoins: numCoins,
    results: results,
    headsCount: headsCount,
    tailsCount: tailsCount,
    timestamp: new Date(),
  };

  // Add to beginning of array
  tossHistory.unshift(historyItem);

  // Limit history size
  if (tossHistory.length > MAX_HISTORY) {
    tossHistory.pop();
  }

  // Update history display
  updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
  const historyContainer = document.getElementById("history-list");
  historyContainer.innerHTML = "";

  if (tossHistory.length === 0) {
    historyContainer.innerHTML =
      '<div class="empty-history">Nessun lancio precedente</div>';
    return;
  }

  tossHistory.forEach((item) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    // Format time
    const time = item.timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Create result display
    let resultHTML = "";

    // If there are many coins, just show summary
    if (item.numCoins > 5) {
      resultHTML = `
        <div class="history-coin heads">T: ${item.headsCount}</div>
        <div class="history-coin tails">C: ${item.tailsCount}</div>
      `;
    } else {
      // Show individual coins
      item.results.forEach((result) => {
        resultHTML += `<div class="history-coin ${result}">${
          result === "heads" ? "T" : "C"
        }</div>`;
      });
    }

    historyItem.innerHTML = `
      <div class="history-info">
        <span class="history-time">${time}</span>
        <span class="history-type">${item.numCoins} ${
      item.numCoins === 1 ? "moneta" : "monete"
    }</span>
      </div>
      <div class="history-result">${resultHTML}</div>
    `;

    historyContainer.appendChild(historyItem);
  });
}
