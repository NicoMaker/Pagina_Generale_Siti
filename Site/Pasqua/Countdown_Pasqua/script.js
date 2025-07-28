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

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Set current year
  document.getElementById("current-year").textContent =
    new Date().getFullYear();

  // Theme toggle functionality
  const themeToggle = document.getElementById("theme-toggle");

  // Check for saved theme preference
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
  }

  // Theme toggle event listener
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");

    // Save theme preference
    if (document.body.classList.contains("dark-theme")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });

  // Create floating Easter eggs
  createEasterEggs();

  // Calculate Easter date
  const currentDate = new Date();
  let currentYear = currentDate.getFullYear();
  let easterDate = calculateEasterDate(currentYear);

  // If Easter has already passed this year, calculate for next year
  if (currentDate > easterDate) {
    currentYear++;
    easterDate = calculateEasterDate(currentYear);
  }

  // Format and display Easter date
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("easter-date").textContent =
    easterDate.toLocaleDateString("it-IT", options);

  // Calculate Pasquetta (Easter Monday)
  const pasquettaDate = new Date(easterDate);
  pasquettaDate.setDate(pasquettaDate.getDate() + 1);

  // Format and display Pasquetta date
  document.getElementById("pasquetta-date").textContent =
    pasquettaDate.toLocaleDateString("it-IT", options);

  // Set countdown targets
  const easterCountDownDate = easterDate.getTime();
  const pasquettaCountDownDate = pasquettaDate.getTime();

  // Check if it's Easter day
  const isEasterDay =
    currentDate.getDate() === easterDate.getDate() &&
    currentDate.getMonth() === easterDate.getMonth() &&
    currentDate.getFullYear() === easterDate.getFullYear();

  // Check if it's Easter Monday (Pasquetta)
  const isPasquettaDay =
    currentDate.getDate() === pasquettaDate.getDate() &&
    currentDate.getMonth() === pasquettaDate.getMonth() &&
    currentDate.getFullYear() === pasquettaDate.getFullYear();

  // If it's Easter day, show celebration message with "Happy Easter"
  if (isEasterDay) {
    const celebrationTitle = document.getElementById("celebration-title");
    celebrationTitle.textContent = "Happy Easter!";
    celebrationTitle.classList.add("happy-easter");

    document.getElementById("celebration-message").style.display = "block";
    document.getElementById("countdown-container").style.display = "none";
    document.body.classList.add("celebrating");

    // Update Pasquetta countdown to show "tomorrow"
    document.getElementById("pasquetta-countdown-container").style.display =
      "flex";
    document.getElementById("pasquetta-days").textContent = "01";
    document.getElementById("pasquetta-hours").textContent = "00";
    document.getElementById("pasquetta-minutes").textContent = "00";
    document.getElementById("pasquetta-seconds").textContent = "00";
  }

  // If it's Pasquetta day, show celebration message with "Buona Pasquetta"
  else if (isPasquettaDay) {
    const celebrationTitle = document.getElementById(
      "pasquetta-celebration-title",
    );
    celebrationTitle.textContent = "Buona Pasquetta!";
    celebrationTitle.classList.add("buona-pasquetta");

    document.getElementById("pasquetta-celebration-text").textContent =
      "Oggi è il giorno perfetto per un picnic all'aperto con amici e familiari!";
    document.getElementById("pasquetta-celebration-message").style.display =
      "block";
    document.getElementById("pasquetta-countdown-container").style.display =
      "none";
    document.body.classList.add("celebrating");

    // Also update Easter section if Easter has passed
    if (currentDate > easterDate) {
      document.getElementById("celebration-message").style.display = "block";
      document.getElementById("countdown-container").style.display = "none";
      document.getElementById("celebration-title").textContent =
        "La Pasqua è passata!";
    }
  }

  // Update countdowns every second
  const timerInterval = setInterval(updateCountdowns, 1000);
  updateCountdowns(); // Initial call to avoid delay

  // Celebration buttons
  const celebrateBtn = document.getElementById("celebrate-btn");
  if (celebrateBtn) {
    celebrateBtn.addEventListener("click", celebrate);
  }

  const pasquettaCelebrateBtn = document.getElementById(
    "pasquetta-celebrate-btn",
  );
  if (pasquettaCelebrateBtn) {
    pasquettaCelebrateBtn.addEventListener("click", celebrate);
  }

  // Function to update both countdowns
  function updateCountdowns() {
    const now = new Date().getTime();

    // Easter countdown
    const easterDistance = easterCountDownDate - now;

    // Pasquetta countdown
    const pasquettaDistance = pasquettaCountDownDate - now;

    // Update Easter countdown
    if (easterDistance > 0 && !isEasterDay) {
      updateCountdownDisplay(
        easterDistance,
        "days",
        "hours",
        "minutes",
        "seconds",
      );
    } else if (!isEasterDay && !isPasquettaDay) {
      document.getElementById("days").textContent = "00";
      document.getElementById("hours").textContent = "00";
      document.getElementById("minutes").textContent = "00";
      document.getElementById("seconds").textContent = "00";

      if (easterDistance <= 0) {
        document.getElementById("celebration-message").style.display = "block";
      }
    }

    // Update Pasquetta countdown
    if (pasquettaDistance > 0 && !isPasquettaDay) {
      updateCountdownDisplay(
        pasquettaDistance,
        "pasquetta-days",
        "pasquetta-hours",
        "pasquetta-minutes",
        "pasquetta-seconds",
      );
    } else if (!isPasquettaDay) {
      document.getElementById("pasquetta-days").textContent = "00";
      document.getElementById("pasquetta-hours").textContent = "00";
      document.getElementById("pasquetta-minutes").textContent = "00";
      document.getElementById("pasquetta-seconds").textContent = "00";

      if (pasquettaDistance <= 0) {
        document.getElementById("pasquetta-celebration-message").style.display =
          "block";
      }
    }

    // Add pulse animation to seconds
    const secondsElement = document.getElementById("seconds");
    if (secondsElement && secondsElement.parentElement) {
      secondsElement.parentElement.classList.add("pulse");
      setTimeout(() => {
        secondsElement.parentElement.classList.remove("pulse");
      }, 900);
    }

    const pasquettaSecondsElement =
      document.getElementById("pasquetta-seconds");
    if (pasquettaSecondsElement && pasquettaSecondsElement.parentElement) {
      pasquettaSecondsElement.parentElement.classList.add("pulse");
      setTimeout(() => {
        pasquettaSecondsElement.parentElement.classList.remove("pulse");
      }, 900);
    }
  }

  // Helper function to update countdown display
  function updateCountdownDisplay(
    distance,
    daysId,
    hoursId,
    minutesId,
    secondsId,
  ) {
    // Calculate time units
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Update DOM
    document.getElementById(daysId).textContent = formatTime(days);
    document.getElementById(hoursId).textContent = formatTime(hours);
    document.getElementById(minutesId).textContent = formatTime(minutes);
    document.getElementById(secondsId).textContent = formatTime(seconds);
  }

  // Format time units to always have two digits
  function formatTime(time) {
    return time < 10 ? `0${time}` : time;
  }

  // Create floating Easter eggs
  function createEasterEggs() {
    const eggContainer = document.getElementById("egg-container");
    const eggCount = 15; // Number of eggs

    for (let i = 0; i < eggCount; i++) {
      createEgg(eggContainer);
    }
  }

  // Create a single Easter egg
  function createEgg(container) {
    const egg = document.createElement("div");
    egg.className = "easter-egg";

    // Random position
    const left = Math.random() * 100;

    // Random egg color
    const eggColors = [
      "var(--egg-1)",
      "var(--egg-2)",
      "var(--egg-3)",
      "var(--egg-4)",
      "var(--egg-5)",
    ];
    const color = eggColors[Math.floor(Math.random() * eggColors.length)];

    // Random animation duration and delay
    const animationDuration = Math.random() * 10 + 15;
    const animationDelay = Math.random() * 10;

    egg.style.cssText = `
      left: ${left}%;
      background-color: ${color};
      animation-duration: ${animationDuration}s;
      animation-delay: -${animationDelay}s;
    `;

    container.appendChild(egg);

    // Remove and recreate egg after animation completes
    setTimeout(() => {
      egg.remove();
      createEgg(container);
    }, animationDuration * 1000);
  }

  // Celebration function
  function celebrate() {
    document.body.classList.add("celebrating");

    // Create more eggs for celebration
    const eggContainer = document.getElementById("egg-container");
    for (let i = 0; i < 20; i++) {
      createEgg(eggContainer);
    }

    // Remove celebration class after some time
    setTimeout(() => {
      document.body.classList.remove("celebrating");
    }, 10000);
  }
});

// Function to calculate Easter date using Gauss algorithm
function calculateEasterDate(year) {
  const a = year % 19,
    b = Math.floor(year / 100),
    c = year % 100,
    d = Math.floor(b / 4),
    e = b % 4,
    f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30,
    i = Math.floor(c / 4),
    k = c % 4,
    l = (32 + 2 * e + 2 * i - h - k) % 7,
    m = Math.floor((a + 11 * h + 22 * l) / 451),
    month = Math.floor((h + l - 7 * m + 114) / 31),
    day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

// Add CSS animations
document.head.insertAdjacentHTML(
  "beforeend",
  `
  <style>
    body.celebrating {
      animation: celebrate 5s ease;
    }
    
    @keyframes celebrate {
      0%, 100% {
        background-color: var(--background);
      }
      25% {
        background-color: rgba(201, 36, 63, 0.3);
      }
      50% {
        background-color: rgba(15, 61, 42, 0.5);
      }
      75% {
        background-color: rgba(212, 175, 55, 0.3);
      }
    }
  </style>
`,
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
`,
);

document.head.insertAdjacentHTML(
  "beforeend",
  `
  <style>
    body.celebrating {
      animation: celebrate 5s ease;
    }
    
    @keyframes celebrate {
      0%, 100% {
        background-color: var(--background);
      }
      25% {
        background-color: rgba(201, 36, 63, 0.3);
      }
      50% {
        background-color: rgba(15, 61, 42, 0.5);
      }
      75% {
        background-color: rgba(212, 175, 55, 0.3);
      }
    }
  </style>
`,
);
