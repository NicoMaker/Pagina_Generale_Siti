// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Add event listeners
  document.getElementById("number").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      checkPrime();
    }
  });

  document.getElementById("clear-btn").addEventListener("click", () => {
    document.getElementById("number").value = "";
    document.getElementById("number").focus();
    document.getElementById("result").innerHTML =
      '<div class="placeholder-text">I risultati appariranno qui dopo la ricerca</div>';
    clearVisualization();
  });

  document.getElementById("copy-btn").addEventListener("click", copyResults);

  // Initialize with empty state
  clearVisualization();
});

// Main function to check prime numbers
function checkPrime() {
  // Get input value
  const numberInput = document.getElementById("number");
  const number = Number.parseInt(numberInput.value);
  const result = document.getElementById("result");

  // Reset any previous error states
  numberInput.classList.remove("error");

  // Validate input
  if (isNaN(number) || number < 2) {
    showError(numberInput, "Il numero deve essere maggiore o uguale a 2.");
    clearVisualization();
    return;
  }

  // Find previous prime numbers
  const { primeCount, primesList } = findPreviousPrimes(number);

  // Display results
  displayResult(number, primeCount, primesList, result);

  // Create visualization
  createVisualization(number, primesList);

  // Add success state to input
  numberInput.classList.add("success");
  setTimeout(() => {
    numberInput.classList.remove("success");
  }, 2000);

  // Scroll to visualization
  setTimeout(() => {
    document
      .getElementById("visualization-container")
      .scrollIntoView({ behavior: "smooth" });
  }, 500);
}

// Find all prime numbers less than the given number
function findPreviousPrimes(number) {
  let primeCount = 0;
  const primesList = [];

  // More efficient prime checking algorithm
  // Create a boolean array "isPrime[0..n]"
  const isPrime = new Array(number).fill(true);

  // Mark 0 and 1 as non-prime
  isPrime[0] = isPrime[1] = false;

  // Use Sieve of Eratosthenes
  for (let i = 2; i * i < number; i++) {
    // If i is prime, mark all its multiples as non-prime
    if (isPrime[i]) {
      for (let j = i * i; j < number; j += i) {
        isPrime[j] = false;
      }
    }
  }

  // Collect all prime numbers
  for (let i = 2; i < number; i++) {
    if (isPrime[i]) {
      primeCount++;
      primesList.push(i);
    }
  }

  return { primeCount, primesList };
}

// Check if a number is prime (more efficient algorithm)
function isPrime(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  // Check all numbers of form 6k ± 1 up to sqrt(n)
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }

  return true;
}

// Display the results
function displayResult(number, primeCount, primesList, resultElement) {
  // Create result HTML
  let resultHTML = "";

  if (primeCount === 0) {
    resultHTML = `
      <div class="result-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>Il numero ${number} non ha numeri primi precedenti.</span>
      </div>
    `;
  } else {
    resultHTML = `
      <div class="result-summary">
        Il numero <strong>${number}</strong> ha <span class="prime-count">${primeCount}</span> numeri primi precedenti.
      </div>
      <div class="prime-list">
        ${primesList.map((prime) => `<span>${prime}</span>`).join("")}
      </div>
    `;
  }

  // Update the result element with animation
  resultElement.innerHTML = resultHTML;

  // Add highlight animation to result card
  const resultCard = document.getElementById("result-card");
  resultCard.classList.add("pulse");
  setTimeout(() => {
    resultCard.classList.remove("pulse");
  }, 1500);
}

// Create visual representation of numbers
function createVisualization(number, primesList) {
  const gridContainer = document.getElementById("number-grid");
  gridContainer.innerHTML = "";

  // Create a set of prime numbers for faster lookup
  const primesSet = new Set(primesList);

  // Create cells for numbers from 1 to the input number
  for (let i = 1; i < number; i++) {
    const cell = document.createElement("div");
    cell.className = "number-cell";
    cell.textContent = i;

    // Add prime class if the number is prime
    if (primesSet.has(i)) {
      cell.classList.add("prime");
    }

    gridContainer.appendChild(cell);

    // Add staggered animation
    setTimeout(() => {
      cell.classList.add("show");
    }, i * 10);
  }
}

// Clear visualization
function clearVisualization() {
  document.getElementById("number-grid").innerHTML = "";
}

// Generate a random number
function generateRandom() {
  // Generate a random number between 10 and 200
  const randomNumber = Math.floor(Math.random() * 191) + 10;

  // Set the input value
  const numberInput = document.getElementById("number");
  numberInput.value = randomNumber;

  // Trigger the check
  checkPrime();
}

// Show error message
function showError(inputElement, message) {
  inputElement.classList.add("error");

  // Create error message
  const resultElement = document.getElementById("result");
  resultElement.innerHTML = `
    <div class="error-message">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${message}</span>
    </div>
  `;

  // Shake animation for error feedback
  inputElement.classList.add("shake");
  setTimeout(() => {
    inputElement.classList.remove("shake");
  }, 500);
}

// Copy results to clipboard
function copyResults() {
  const resultElement = document.getElementById("result");
  const resultText = resultElement.textContent.trim();

  if (resultText === "I risultati appariranno qui dopo la ricerca") {
    return;
  }

  // Create a temporary textarea element to copy text
  const textarea = document.createElement("textarea");
  textarea.value = resultText;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);

  // Show success message
  const copyBtn = document.getElementById("copy-btn");
  const originalHTML = copyBtn.innerHTML;

  copyBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;

  setTimeout(() => {
    copyBtn.innerHTML = originalHTML;
  }, 2000);
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

.result-message {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-light);
  padding: 15px;
  background-color: rgba(100, 116, 139, 0.1);
  border-radius: var(--radius);
}

.result-summary {
  font-size: 1.1rem;
  margin-bottom: 15px;
}
</style>
`
);
