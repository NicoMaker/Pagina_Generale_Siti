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

document.addEventListener("DOMContentLoaded", () => {
  // Get current date and calculate next new year
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const nextYear =
    currentDate.getMonth() === 11 && currentDate.getDate() > 25
      ? currentYear + 1
      : currentYear + 1;

  // Set next year in all relevant elements
  document.getElementById("next-year").textContent = nextYear;
  document.getElementById("footer-year").textContent = nextYear;
  document.getElementById("celebration-year").textContent = nextYear;
  document.getElementById(
    "copyright-year"
  ).textContent = `© ${currentYear} Countdown Capodanno. Tutti i diritti riservati.`;

  // Set countdown target
  const countdownDate = new Date(`Jan 1, ${nextYear} 00:00:00`).getTime();

  // Check if it's New Year's Day
  const isNewYearsDay =
    currentDate.getMonth() === 0 && currentDate.getDate() === 1;

  // If it's New Year's Day, show celebration message
  if (isNewYearsDay) {
    document.querySelector(".countdown-wrapper").style.display = "none";
    document.querySelector(".celebration-message").style.display = "block";
    launchFireworks();
  } else {
    // Update countdown every second
    const timerInterval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call to avoid delay
  }

  // Theme toggle functionality
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", toggleTheme);

  // Check for saved theme preference
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-theme");
  }

  // Celebration button
  const celebrateBtn = document.getElementById("celebrate-btn");
  celebrateBtn.addEventListener("click", launchFireworks);

  // Wish submission
  const submitWishBtn = document.getElementById("submit-wish");
  submitWishBtn.addEventListener("click", submitWish);

  // Function to update countdown
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    // If countdown is finished
    if (distance < 0) {
      clearInterval(timerInterval);
      document.querySelector(".countdown-wrapper").style.display = "none";
      document.querySelector(".celebration-message").style.display = "block";
      launchFireworks();
      return;
    }

    // Calculate time units
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Update DOM
    document.getElementById("days").textContent = formatTime(days);
    document.getElementById("hours").textContent = formatTime(hours);
    document.getElementById("minutes").textContent = formatTime(minutes);
    document.getElementById("seconds").textContent = formatTime(seconds);

    // Add pulse animation to seconds
    const secondsElement = document.getElementById("seconds");
    secondsElement.classList.add("pulse");
    setTimeout(() => {
      secondsElement.classList.remove("pulse");
    }, 900);
  }

  // Format time units to always have two digits
  function formatTime(time) {
    return time < 10 ? `0${time}` : time;
  }

  // Toggle theme function
  function toggleTheme() {
    document.body.classList.toggle("light-theme");

    // Save theme preference
    if (document.body.classList.contains("light-theme")) {
      localStorage.setItem("theme", "light");
    } else {
      localStorage.setItem("theme", "dark");
    }
  }

  // Launch fireworks animation
  function launchFireworks() {
    const fireworksContainer = document.getElementById("fireworks-container");
    fireworksContainer.innerHTML = ""; // Clear previous fireworks

    // Create multiple fireworks
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        createFirework();
      }, i * 300);
    }
  }

  // Create a single firework
  function createFirework() {
    const fireworksContainer = document.getElementById("fireworks-container");
    const firework = document.createElement("div");
    firework.className = "firework";

    // Random position
    const left = Math.random() * 100;
    const top = 50 + Math.random() * 40;

    // Random color
    const colors = [
      "#f97316",
      "#f59e0b",
      "#fbbf24",
      "#a3e635",
      "#22d3ee",
      "#a855f7",
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    firework.style.cssText = `
      position: absolute;
      left: ${left}%;
      top: ${top}%;
      width: 6px;
      height: 6px;
      background-color: ${color};
      border-radius: 50%;
      box-shadow: 0 0 10px 2px ${color};
      opacity: 0;
      transform: scale(0);
      animation: explode 1s ease-out forwards;
    `;

    fireworksContainer.appendChild(firework);

    // Create particles for explosion
    setTimeout(() => {
      createParticles(left, top, color);
      firework.remove();
    }, 300);
  }

  // Create particles for firework explosion
  function createParticles(x, y, color) {
    const fireworksContainer = document.getElementById("fireworks-container");
    const particleCount = 30 + Math.floor(Math.random() * 20);

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";

      // Random angle and distance
      const angle = Math.random() * Math.PI * 2;
      const distance = 2 + Math.random() * 3;

      // Calculate end position
      const endX = x + Math.cos(angle) * distance * 10;
      const endY = y + Math.sin(angle) * distance * 10;

      particle.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        width: 3px;
        height: 3px;
        background-color: ${color};
        border-radius: 50%;
        box-shadow: 0 0 6px 1px ${color};
        opacity: 1;
        animation: particle 1s ease-out forwards;
      `;

      // Set the end position as a CSS variable
      particle.style.setProperty("--end-x", `${endX}%`);
      particle.style.setProperty("--end-y", `${endY}%`);

      fireworksContainer.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => {
        particle.remove();
      }, 1000);
    }
  }

  // Submit wish function
  function submitWish() {
    const nameInput = document.getElementById("wish-name");
    const wishInput = document.getElementById("wish-text");

    // Validate inputs
    if (!nameInput.value.trim() || !wishInput.value.trim()) {
      alert("Per favore, compila tutti i campi.");
      return;
    }

    // Create new wish card
    const wishesWall = document.getElementById("wishes-wall");
    const wishCard = document.createElement("div");
    wishCard.className = "wish-card fade-in";

    wishCard.innerHTML = `
      <p class="wish-text">"${wishInput.value.trim()}"</p>
      <p class="wish-author">- ${nameInput.value.trim()}</p>
    `;

    // Add to the beginning of the wall
    wishesWall.insertBefore(wishCard, wishesWall.firstChild);

    // Clear inputs
    nameInput.value = "";
    wishInput.value = "";

    // Scroll to the new wish
    wishCard.scrollIntoView({ behavior: "smooth" });
  }
});

// Add CSS animations
document.head.insertAdjacentHTML(
  "beforeend",
  `
  <style>
    @keyframes explode {
      0% {
        opacity: 0;
        transform: scale(0);
      }
      50% {
        opacity: 1;
        transform: scale(1.5);
      }
      100% {
        opacity: 0;
        transform: scale(0);
      }
    }
    
    @keyframes particle {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: translate(calc(var(--end-x) - ${
          window.innerWidth * 0.01 * x
        }px), calc(var(--end-y) - ${window.innerHeight * 0.01 * y}px)) scale(0);
      }
    }
  </style>
`
);

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
