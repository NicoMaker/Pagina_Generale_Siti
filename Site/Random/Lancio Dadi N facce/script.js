// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", initialize);

// Global variables
let rollHistory = [];
const MAX_HISTORY = 10;

// Initialize the application
function initialize() {
  // Add event listeners to dice buttons
  const diceButtons = document.querySelectorAll(".dice-btn");
  diceButtons.forEach((button) => {
    button.addEventListener("click", handleDiceButtonClick);
  });

  // Add event listeners to increment/decrement buttons
  const incrementButtons = document.querySelectorAll(".increment");
  const decrementButtons = document.querySelectorAll(".decrement");

  incrementButtons.forEach((button) => {
    button.addEventListener("click", handleIncrement);
  });

  decrementButtons.forEach((button) => {
    button.addEventListener("click", handleDecrement);
  });

  // Add event listener to clear button
  document
    .getElementById("clear-results")
    .addEventListener("click", clearResults);
}

// Handle dice button click
function handleDiceButtonClick(event) {
  const button = event.currentTarget;
  const faces = button.getAttribute("data-faces");

  // Update active button
  document.querySelectorAll(".dice-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  button.classList.add("active");

  // Generate dice roll
  if (faces === "custom") {
    generaNumerin();
  } else {
    generaNumeri(parseInt(faces));
  }
}

// Handle increment button click
function handleIncrement(event) {
  const button = event.currentTarget;
  const input = button.parentElement.querySelector("input");
  const currentValue = parseInt(input.value);
  const max = parseInt(input.getAttribute("max"));

  if (currentValue < max) {
    input.value = currentValue + 1;
  }
}

// Handle decrement button click
function handleDecrement(event) {
  const button = event.currentTarget;
  const input = button.parentElement.querySelector("input");
  const currentValue = parseInt(input.value);
  const min = parseInt(input.getAttribute("min"));

  if (currentValue > min) {
    input.value = currentValue - 1;
  }
}

// Clear results
function clearResults() {
  document.getElementById("risultato").innerHTML = "";
  document.getElementById("somma-totale").textContent = "0";
}

// Generate dice roll for standard dice
function generaNumeri(facceDado) {
  let numeroDadi = parseInt(document.getElementById("numero-dadi").value);
  let sommaTotale = 0;
  let risultatiHTML = "";
  let risultati = [];

  // Validate input
  if (isNaN(numeroDadi) || numeroDadi < 1) {
    numeroDadi = 1;
    document.getElementById("numero-dadi").value = 1;
  }

  // Generate random numbers
  for (let i = 0; i < numeroDadi; i++) {
    let numeroCasuale = Math.floor(Math.random() * facceDado) + 1;
    sommaTotale += numeroCasuale;
    risultati.push(numeroCasuale);

    // Get dice class based on faces
    let diceClass = getDiceClass(facceDado);

    // Create HTML for dice result
    let diceHTML = `
      <div class="dice-result ${diceClass} dice-roll" style="animation-delay: ${
        i * 0.1
      }s">
        ${numeroCasuale}
      </div>
    `;

    risultatiHTML += diceHTML;
  }

  // Update UI
  document.getElementById("risultato").innerHTML = risultatiHTML;
  document.getElementById("somma-totale").textContent = sommaTotale;

  // Add to history
  addToHistory(facceDado, risultati, sommaTotale);
}

// Generate dice roll for custom dice
function generaNumerin() {
  let numeroDadi = parseInt(document.getElementById("numero-dadi").value);
  let n = parseInt(document.getElementById("facce-dadi").value);
  let sommaTotale = 0;
  let risultatiHTML = "";
  let risultati = [];

  // Validate input
  if (isNaN(numeroDadi) || numeroDadi < 1) {
    numeroDadi = 1;
    document.getElementById("numero-dadi").value = 1;
  }

  if (isNaN(n) || n < 1) {
    n = 6;
    document.getElementById("facce-dadi").value = 6;
  }

  // Generate random numbers
  for (let i = 0; i < numeroDadi; i++) {
    let numeroCasuale = Math.floor(Math.random() * n) + 1;
    sommaTotale += numeroCasuale;
    risultati.push(numeroCasuale);

    // Create HTML for dice result
    let diceHTML = `
      <div class="dice-result dn dice-roll" style="animation-delay: ${
        i * 0.1
      }s">
        ${numeroCasuale}
      </div>
    `;

    risultatiHTML += diceHTML;
  }

  // Update UI
  document.getElementById("risultato").innerHTML = risultatiHTML;
  document.getElementById("somma-totale").textContent = sommaTotale;

  // Add to history
  addToHistory(n, risultati, sommaTotale);
}

// Get dice class based on faces
function getDiceClass(facceDado) {
  switch (facceDado) {
    case 4:
      return "d4";
    case 6:
      return "d6";
    case 8:
      return "d8";
    case 10:
      return "d10";
    case 12:
      return "d12";
    case 20:
      return "d20";
    case 100:
      return "d100";
    default:
      return "dn";
  }
}

// Add roll to history
function addToHistory(diceType, results, total) {
  // Create history item
  const historyItem = {
    diceType: diceType,
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
  const historyContainer = document.getElementById("roll-history");
  historyContainer.innerHTML = "";

  if (rollHistory.length === 0) {
    historyContainer.innerHTML =
      "<p class='no-history'>Nessun lancio precedente</p>";
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

    // Create dice icons
    let diceHTML = "";
    item.results.forEach((result) => {
      const diceClass = getDiceClass(item.diceType);
      diceHTML += `<div class="history-die ${diceClass}">${result}</div>`;
    });

    historyItem.innerHTML = `
      <div class="history-info">
        <span class="history-time">${time}</span>
        <span class="history-type">${item.results.length}d${item.diceType}</span>
      </div>
      <div class="history-dice">${diceHTML}</div>
      <div class="history-total">${item.total}</div>
    `;

    historyContainer.appendChild(historyItem);
  });
}
