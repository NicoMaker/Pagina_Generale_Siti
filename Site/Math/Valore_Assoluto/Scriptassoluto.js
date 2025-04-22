// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Add event listeners
  document.getElementById("number").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      calculateAbsoluteValue();
    }
  });

  document.getElementById("clear-btn").addEventListener("click", () => {
    document.getElementById("number").value = "";
    document.getElementById("number").focus();
    document.getElementById("result").textContent = "";
    hidePointMarker();
  });

  // Initialize with empty result
  document.getElementById("result").textContent =
    "Inserisci un numero e premi Calcola";
});

// Calculate absolute value
function calculateAbsoluteValue() {
  // Get input element and result div
  const numberInput = document.getElementById("number");
  const resultDiv = document.getElementById("result");
  const resultContainer = document.getElementById("result-container");

  // Get input value and validate
  const inputValue = numberInput.value.trim().replace(",", ".");

  // Reset any previous error states
  numberInput.classList.remove("error");

  // Check if input is empty
  if (inputValue === "") {
    showError(numberInput, resultDiv, "Inserisci un numero valido.");
    hidePointMarker();
    return;
  }

  // Parse the number
  const number = Number.parseFloat(inputValue);

  // Check if input is a valid number
  if (isNaN(number)) {
    showError(numberInput, resultDiv, "Inserisci un numero valido.");
    hidePointMarker();
    return;
  }

  // Calculate absolute value
  const absoluteValue = Math.abs(number);

  // Format the result
  const formattedInput = formatNumber(number);
  const formattedResult = formatNumber(absoluteValue);

  // Display the result with animation
  resultContainer.classList.add("pulse");
  setTimeout(() => {
    resultContainer.classList.remove("pulse");
  }, 1000);

  // Show the result
  resultDiv.innerHTML = `
    <div class="result-value">
      |${formattedInput}| = <strong>${formattedResult}</strong>
    </div>
    <div class="result-explanation">
      ${getExplanation(number, absoluteValue)}
    </div>
  `;

  // Show point on graph
  showPointOnGraph(number, absoluteValue);

  // Add success state to input
  numberInput.classList.add("success");
  setTimeout(() => {
    numberInput.classList.remove("success");
  }, 2000);
}

// Format number for display
function formatNumber(num) {
  // Check if the number is an integer
  if (Number.isInteger(num)) {
    return num.toString();
  }

  // Format decimal number (up to 4 decimal places)
  return num.toFixed(4).replace(/\.?0+$/, "");
}

// Show error message
function showError(inputElement, resultDiv, message) {
  inputElement.classList.add("error");
  resultDiv.innerHTML = `<div class="error-message">${message}</div>`;

  // Shake animation for error feedback
  inputElement.classList.add("shake");
  setTimeout(() => {
    inputElement.classList.remove("shake");
  }, 500);
}

// Get explanation text based on the input
function getExplanation(number, absoluteValue) {
  if (number < 0) {
    return `Poiché ${formatNumber(
      number
    )} è negativo, il suo valore assoluto è ${formatNumber(
      number
    )} × (−1) = ${formatNumber(absoluteValue)}`;
  } else if (number > 0) {
    return `Poiché ${formatNumber(
      number
    )} è positivo, il suo valore assoluto è lo stesso numero: ${formatNumber(
      absoluteValue
    )}`;
  } else {
    return `Il valore assoluto di zero è sempre zero`;
  }
}

// Show point on the graph
function showPointOnGraph(number, absoluteValue) {
  const pointMarker = document.getElementById("point-marker");
  const graphContainer = document.querySelector(".graph-container");

  // Get graph dimensions
  const graphWidth = graphContainer.offsetWidth;
  const graphHeight = graphContainer.offsetHeight;

  // Calculate position (assuming graph is centered at 50% horizontally and vertically)
  // The graph shows x from -8 to 8 and y from -2 to 8
  const graphRangeX = 16; // from -8 to 8
  const graphRangeY = 10; // from -2 to 8

  // Calculate percentage position
  // Convert from graph coordinates to percentage
  const xPercent = ((number + 8) / graphRangeX) * 100;
  const yPercent = 100 - ((absoluteValue + 2) / graphRangeY) * 100;

  // Clamp values to stay within the visible graph
  const clampedXPercent = Math.max(0, Math.min(100, xPercent));
  const clampedYPercent = Math.max(0, Math.min(100, yPercent));

  // Set position
  pointMarker.style.left = `${clampedXPercent}%`;
  pointMarker.style.top = `${clampedYPercent}%`;
  pointMarker.style.opacity = "1";
}

// Hide point marker
function hidePointMarker() {
  const pointMarker = document.getElementById("point-marker");
  pointMarker.style.opacity = "0";
}

// Set example value
function setExample(value) {
  const numberInput = document.getElementById("number");
  numberInput.value = value;
  calculateAbsoluteValue();
}

// Add this CSS to the existing stylesheet
document.head.insertAdjacentHTML(
  "beforeend",
  `
<style>
.shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }
  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }
}

.result-value {
  font-size: 1.4rem;
  margin-bottom: 10px;
}

.result-explanation {
  font-size: 0.9rem;
  color: var(--text-light);
}
</style>
`
);
