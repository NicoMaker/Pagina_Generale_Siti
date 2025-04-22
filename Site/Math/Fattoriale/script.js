// DOM elements
const numberInput = document.getElementById("number");
const calculateBtn = document.getElementById("calculate-btn");
const resultDiv = document.getElementById("result");
const loadingDiv = document.getElementById("loading");

// Add event listeners
numberInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    calculateFactorial();
  }
});

// Main factorial calculation function
function calculateFactorial() {
  // Clear previous results
  resultDiv.textContent = "";
  resultDiv.className = "result";

  // Get and validate input
  const number = parseInt(numberInput.value);

  if (isNaN(number)) {
    showError("Inserisci un numero valido.");
    return;
  }

  if (number < 0) {
    showError("Il numero deve essere non negativo.");
    return;
  }

  if (number > 20) {
    showError("Il numero è troppo grande per calcolare il fattoriale.");
    return;
  }

  // Show loading indicator
  loadingDiv.classList.remove("hidden");
  calculateBtn.disabled = true;

  // Use setTimeout to allow the UI to update before calculation
  setTimeout(() => {
    try {
      const result = calculateFactorialValue(number);
      showResult(number, result);
    } catch (error) {
      showError("Si è verificato un errore durante il calcolo.");
    } finally {
      // Hide loading indicator
      loadingDiv.classList.add("hidden");
      calculateBtn.disabled = false;
    }
  }, 500); // Simulate calculation delay for better UX
}

// Calculate factorial value
function calculateFactorialValue(number) {
  let factorial = 1;

  for (let i = 2; i <= number; i++) {
    factorial *= i;
  }

  return factorial;
}

// Display result with animation
function showResult(number, result) {
  resultDiv.textContent = `Il fattoriale di ${number} è: ${formatNumber(
    result
  )}`;
  resultDiv.className = "result success";

  // Add animation
  resultDiv.style.opacity = 0;
  resultDiv.style.transform = "translateY(10px)";

  setTimeout(() => {
    resultDiv.style.opacity = 1;
    resultDiv.style.transform = "translateY(0)";
  }, 10);
}

// Display error message
function showError(message) {
  resultDiv.textContent = message;
  resultDiv.className = "result error";

  // Add animation
  resultDiv.style.opacity = 0;
  resultDiv.style.transform = "translateY(10px)";

  setTimeout(() => {
    resultDiv.style.opacity = 1;
    resultDiv.style.transform = "translateY(0)";
  }, 10);
}

// Format large numbers with thousand separators
function formatNumber(num) {
  return num.toLocaleString("it-IT");
}

// Focus the input field when the page loads
window.addEventListener("load", () => {
  numberInput.focus();
});
