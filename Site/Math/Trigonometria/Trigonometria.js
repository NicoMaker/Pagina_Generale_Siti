// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Add event listeners for keyboard navigation
  document
    .getElementById("gradi-radianti")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        CalculateTrigonometrics();
      }
    });

  // Initialize with placeholder angle indicator
  updateAngleIndicator(0);
});

// Main calculation function
function CalculateTrigonometrics() {
  // Get input values
  const gradi = getGradi();
  const options = getOptions();
  const info = getInfo(options);

  // Validate input
  if (isNaN(gradi)) {
    displayInvalidInput();
    return;
  }

  // Convert to radians for calculation
  const result = convertToRadians(gradi, options);

  // Display results
  displayResult(info, gradi, result);

  // Update the angle indicator on the unit circle
  updateAngleIndicator(result);

  // Show the results card with animation
  const resultsCard = document.getElementById("results-card");
  resultsCard.classList.add("highlight");
  setTimeout(() => {
    resultsCard.classList.remove("highlight");
  }, 500);
}

// Helper functions
const getGradi = () =>
  Number.parseFloat(document.getElementById("gradi-radianti").value);
const getOptions = () => document.getElementById("options").value;
const getInfo = (options) => (options === "Rad" ? "Radianti" : "Gradi");
const convertToRadians = (gradi, options) =>
  options === "Rad" ? gradi : (gradi * Math.PI) / 180;

// Display error for invalid input
const displayInvalidInput = () => {
  const risultatoElement = document.getElementById("risultato");
  risultatoElement.innerHTML = `
    <div class="error-message">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>Inserisci un numero valido</span>
    </div>
  `;
};

// Format number to 6 decimal places
function formatNumber(num) {
  return Number.isInteger(num) ? num : num.toFixed(6).replace(/\.?0+$/, "");
}

// Display calculation results
function displayResult(info, gradi, result) {
  // Calculate all trigonometric functions
  const trigFunctions = {
    "Seno (sin)": Math.sin(result),
    "Coseno (cos)": Math.cos(result),
    "Tangente (tan)": Math.tan(result),
    "Arcoseno (asin)": Math.asin(Math.sin(result)),
    "Arcocoseno (acos)": Math.acos(Math.cos(result)),
    "Arcotangente (atan)": Math.atan(Math.tan(result)),
  };

  // Create header for results
  let stampaHTML = `
    <div class="result-header">
      Calcolo per ${formatNumber(gradi)} ${info}
    </div>
  `;

  // Add each trigonometric function result
  for (const [name, value] of Object.entries(trigFunctions)) {
    const isError = Number.isNaN(value);
    stampaHTML += `
      <div class="trig-result">
        <div class="trig-name">${name}</div>
        <div class="trig-value ${isError ? "error" : ""}">${
          isError ? "Non definito" : formatNumber(value)
        }</div>
      </div>
    `;
  }

  // Update the results container
  document.getElementById("risultato").innerHTML = stampaHTML;
}

// Update the angle indicator on the unit circle
function updateAngleIndicator(radians) {
  const indicator = document.getElementById("angle-indicator");

  // Convert to degrees for CSS rotation (0 degrees is at 3 o'clock position)
  const degrees = (radians * 180) / Math.PI - 90;

  // Update the indicator
  indicator.style.transform = `rotate(${degrees}deg)`;
  indicator.style.opacity = "1";
}

// Add this CSS to the existing stylesheet
document.head.insertAdjacentHTML(
  "beforeend",
  `
<style>
.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--error);
  padding: 15px;
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: var(--radius);
  margin: 20px 0;
}

.highlight {
  animation: highlight 0.5s ease;
}

@keyframes highlight {
  0% {
    box-shadow: 0 4px 20px var(--shadow);
  }
  50% {
    box-shadow: 0 4px 25px rgba(67, 97, 238, 0.4);
  }
  100% {
    box-shadow: 0 4px 20px var(--shadow);
  }
}
</style>
`,
);
