// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Add event listener for Enter key on input
  document.getElementById("number").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      checkPrime();
    }
  });

  // Add focus and blur event listeners for input animation
  const numberInput = document.getElementById("number");

  numberInput.addEventListener("focus", () => {
    numberInput.parentElement.classList.add("focused");
  });

  numberInput.addEventListener("blur", () => {
    numberInput.parentElement.classList.remove("focused");
  });
});

// Set example number in the input field
function setExample(number) {
  const numberInput = document.getElementById("number");
  numberInput.value = number;

  // Add a subtle flash animation to the input
  numberInput.classList.add("flash");
  setTimeout(() => {
    numberInput.classList.remove("flash");
  }, 300);

  checkPrime();
}

// Check if a number is prime
function checkPrime() {
  const numberInput = document.getElementById("number");
  const number = Number.parseInt(numberInput.value);
  const resultContainer = document.getElementById("result-container");
  const resultBadge = document.getElementById("result-badge");
  const resultNumber = document.getElementById("result-number");
  const result = document.getElementById("result");
  const divisorsContainer = document.getElementById("divisors-container");
  const divisorsList = document.getElementById("divisors-list");
  const button = document.getElementById("check-button");

  // Hide previous results with a smooth transition
  resultContainer.classList.remove("visible");
  divisorsContainer.classList.remove("visible");

  // Validate input
  if (isNaN(number) || number === "") {
    showError("Inserisci un numero valido");
    return;
  }

  if (number < 2) {
    showError("Il numero deve essere maggiore di 1");
    return;
  }

  // Show loading state
  button.innerHTML =
    '<span class="loading"></span><span class="button-text">Verificando...</span>';
  button.disabled = true;

  // Use setTimeout to create a small delay for better UX
  setTimeout(() => {
    const { isPrime, divisors } = getPrimeStatus(number);

    // Display result
    resultNumber.textContent = formatNumber(number);

    if (isPrime) {
      resultBadge.textContent = "PRIMO";
      resultBadge.className = "";
      resultBadge.classList.add("prime");
      result.textContent = `${formatNumber(
        number
      )} è un numero primo! È divisibile solo per 1 e per se stesso.`;
    } else {
      resultBadge.textContent = "COMPOSTO";
      resultBadge.className = "";
      resultBadge.classList.add("not-prime");
      result.textContent = `${formatNumber(number)} non è un numero primo. Ha ${
        divisors.length
      } divisori.`;
    }

    // Display divisors with staggered animation
    divisorsList.innerHTML = "";
    divisors.forEach((divisor, index) => {
      const divisorElement = document.createElement("span");
      divisorElement.classList.add("divisor");
      divisorElement.style.animationDelay = `${index * 50}ms`;

      // Highlight prime factors
      if (isPrimeFactor(divisor) && divisor !== 1) {
        divisorElement.classList.add("prime-factor");
      }

      divisorElement.textContent = formatNumber(divisor);
      divisorsList.appendChild(divisorElement);
    });

    // Show result with animation
    resultContainer.style.display = "block";

    // Use setTimeout to ensure CSS transitions work properly
    setTimeout(() => {
      resultContainer.classList.add("visible");

      // Show divisors container after a short delay
      setTimeout(() => {
        divisorsContainer.style.display = "block";

        setTimeout(() => {
          divisorsContainer.classList.add("visible");
        }, 50);
      }, 300);
    }, 50);

    // Reset button
    button.innerHTML =
      '<span class="button-text">Verifica</span><span class="button-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></span>';
    button.disabled = false;
  }, 800); // Delay for better UX
}

// Format large numbers with thousands separators
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Check if a number is prime
function isPrimeFactor(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;

  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }

  return true;
}

// Get prime status and divisors
function getPrimeStatus(number) {
  const divisors = [];

  // Find all divisors more efficiently
  for (let i = 1; i <= Math.sqrt(number); i++) {
    if (number % i === 0) {
      divisors.push(i);

      // Add the pair divisor if it's different
      if (i !== number / i) {
        divisors.push(number / i);
      }
    }
  }

  // Sort divisors in ascending order
  divisors.sort((a, b) => a - b);

  // A prime number has exactly 2 divisors: 1 and itself
  const isPrime = divisors.length === 2;

  return { isPrime, divisors };
}

// Show error message
function showError(message) {
  const resultContainer = document.getElementById("result-container");
  const resultBadge = document.getElementById("result-badge");
  const resultNumber = document.getElementById("result-number");
  const result = document.getElementById("result");
  const divisorsContainer = document.getElementById("divisors-container");

  resultBadge.textContent = "ERRORE";
  resultBadge.className = "";
  resultBadge.classList.add("not-prime");
  resultNumber.textContent = "";
  result.textContent = message;

  // Show error with animation
  resultContainer.style.display = "block";

  setTimeout(() => {
    resultContainer.classList.add("visible");
  }, 50);

  divisorsContainer.classList.remove("visible");
  setTimeout(() => {
    divisorsContainer.style.display = "none";
  }, 300);
}
