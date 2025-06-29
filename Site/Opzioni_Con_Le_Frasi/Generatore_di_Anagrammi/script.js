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
  // DOM Elements
  const anagramForm = document.getElementById("anagramForm");
  const wordInput = document.getElementById("wordInput");
  const clearBtn = document.getElementById("clear-btn");
  const randomBtn = document.getElementById("random-btn");
  const generateBtn = document.getElementById("generate-btn");
  const copyBtn = document.getElementById("copy-btn");
  const filterInput = document.getElementById("filter-input");
  const charCount = document.getElementById("char-count");
  const resultsCard = document.getElementById("results-card");
  const resultsSummary = document.getElementById("results-summary");
  const anagramsGrid = document.getElementById("anagrams-grid");
  const loadingContainer = document.getElementById("loading-container");
  const themeToggle = document.getElementById("theme-toggle");
  const currentYearSpan = document.getElementById("current-year");

  // Set current year
  currentYearSpan.textContent = new Date().getFullYear();

  // Check for saved theme preference
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
  }

  // Theme toggle functionality
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");

    // Save theme preference
    if (document.body.classList.contains("dark-theme")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });

  // Update character count
  wordInput.addEventListener("input", () => {
    const count = wordInput.value.length;
    charCount.textContent = `${count}/15`;

    // Add warning color if approaching limit
    if (count >= 6) {
      charCount.style.color = "var(--warning)";
    } else {
      charCount.style.color = "var(--text-light)";
    }
  });

  // Clear input
  clearBtn.addEventListener("click", () => {
    wordInput.value = "";
    charCount.textContent = "0/15";
    charCount.style.color = "var(--text-light)";
    wordInput.focus();
  });

  // Random word
  randomBtn.addEventListener("click", () => {
    const randomWords = [
      "roma",
      "amore",
      "cane",
      "arte",
      "sole",
      "mare",
      "vita",
      "casa",
    ];
    const randomWord =
      randomWords[Math.floor(Math.random() * randomWords.length)];
    wordInput.value = randomWord;
    charCount.textContent = `${randomWord.length}/15`;
    charCount.style.color =
      randomWord.length >= 6 ? "var(--warning)" : "var(--text-light)";
    wordInput.focus();
  });

  // Form submission
  anagramForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const word = wordInput.value.trim().toLowerCase();

    if (!word) {
      showError("Inserisci una parola per generare gli anagrammi");
      return;
    }

    if (word.length > 15) {
      showError("Per prestazioni ottimali, usa parole con massimo 15 caratteri");
      return;
    }

    // Show loading state
    loadingContainer.style.display = "flex";
    anagramsGrid.innerHTML = "";
    resultsSummary.innerHTML = "";

    // Use setTimeout to allow the loading spinner to render
    setTimeout(() => {
      generateAnagrams(word);
    }, 100);
  });

  // Filter anagrams
  filterInput.addEventListener("input", () => {
    const filterText = filterInput.value.trim().toLowerCase();
    const anagramItems = document.querySelectorAll(".anagram-item");

    anagramItems.forEach((item) => {
      const anagramText = item.textContent.toLowerCase();
      if (anagramText.includes(filterText)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });

    // Update visible count
    const visibleCount = Array.from(anagramItems).filter(
      (item) => item.style.display !== "none"
    ).length;
    updateSummary(visibleCount, anagramItems.length);
  });

  // Copy all anagrams
  copyBtn.addEventListener("click", () => {
    const anagramItems = document.querySelectorAll(".anagram-item");
    if (anagramItems.length === 0) return;

    const anagramTexts = Array.from(anagramItems).map(
      (item) => item.textContent
    );
    const textToCopy = anagramTexts.join(", ");

    // Create a temporary textarea to copy the text
    const textarea = document.createElement("textarea");
    textarea.value = textToCopy;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    // Show success message
    const originalIcon = copyBtn.innerHTML;
    copyBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;

    setTimeout(() => {
      copyBtn.innerHTML = originalIcon;
    }, 2000);
  });

  // Generate anagrams function
  function generateAnagrams(word) {
    // For longer words, use a more efficient algorithm
    let anagrams;

    if (word.length <= 15) {
      anagrams = generateAllAnagrams(word);
    } else {
      // For longer words, limit the number of anagrams
      anagrams = generateLimitedAnagrams(word, 1000);
    }

    // Remove duplicates
    anagrams = [...new Set(anagrams)];

    // Hide loading state
    loadingContainer.style.display = "none";

    // Display results
    displayResults(word, anagrams);
  }

  // Generate all possible anagrams (recursive)
  function generateAllAnagrams(word) {
    if (word.length <= 1) return [word];

    const anagrams = [];

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const remainingChars = word.slice(0, i) + word.slice(i + 1);

      for (const subAnagram of generateAllAnagrams(remainingChars)) {
        anagrams.push(char + subAnagram);
      }
    }

    return anagrams;
  }

  // Generate limited number of anagrams for longer words
  function generateLimitedAnagrams(word, limit) {
    const anagrams = new Set();
    const chars = word.split("");

    for (let i = 0; i < limit; i++) {
      // Shuffle the characters
      shuffleArray(chars);
      anagrams.add(chars.join(""));

      if (anagrams.size >= limit) break;
    }

    return [...anagrams];
  }

  // Fisher-Yates shuffle algorithm
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Display results
  function displayResults(word, anagrams) {
    // Clear previous results
    anagramsGrid.innerHTML = "";

    // Update summary
    updateSummary(anagrams.length, anagrams.length);

    // Create anagram items with staggered animation
    anagrams.forEach((anagram, index) => {
      const anagramItem = document.createElement("div");
      anagramItem.className = "anagram-item";
      anagramItem.textContent = anagram;
      anagramItem.style.opacity = "0";
      anagramItem.style.transform = "translateY(10px)";

      // Add click to copy functionality
      anagramItem.addEventListener("click", () => {
        navigator.clipboard.writeText(anagram).then(() => {
          anagramItem.classList.add("highlight");
          setTimeout(() => {
            anagramItem.classList.remove("highlight");
          }, 1500);
        });
      });

      anagramsGrid.appendChild(anagramItem);

      // Staggered animation (limit to improve performance)
      setTimeout(() => {
        anagramItem.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        anagramItem.style.opacity = "1";
        anagramItem.style.transform = "translateY(0)";
      }, Math.min(index, 100) * 10);
    });

    // Reset filter
    filterInput.value = "";
  }

  // Update summary text
  function updateSummary(visibleCount, totalCount) {
    resultsSummary.innerHTML = `
      <div class="summary-content">
        <strong>${visibleCount}</strong> anagrammi ${
      visibleCount !== totalCount ? `(su ${totalCount} totali)` : ""
    } 
        ${visibleCount === 1 ? "trovato" : "trovati"}
      </div>
    `;
  }

  // Show error message
  function showError(message) {
    resultsSummary.innerHTML = `
      <div class="error-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>${message}</span>
      </div>
    `;
  }

  // Add keyboard support
  wordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      generateBtn.click();
    }
  });

  // Add CSS for error message
  const style = document.createElement("style");
  style.textContent = `
    .error-message {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--error);
      padding: 10px;
      background-color: rgba(239, 68, 68, 0.1);
      border-radius: var(--radius);
    }
    
    .summary-content {
      text-align: center;
    }
  `;
  document.head.appendChild(style);
});

document.addEventListener("DOMContentLoaded", () => {
  // Get current date and calculate Christmas date
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const christmasYear =
    currentDate.getMonth() === 11 && currentDate.getDate() > 25
      ? currentYear + 1
      : currentYear;

  // Set current year in all relevant elements
  document.getElementById("current-year").textContent = currentYear;
  document.getElementById(
    "copyright-year"
  ).textContent = `© ${currentYear} Countdown di Natale. Tutti i diritti riservati.`;

  // Set countdown target
  const countdownDate = new Date(`Dec 25, ${christmasYear} 00:00:00`).getTime();

  // Check if it's Christmas Day
  const isChristmasDay =
    currentDate.getMonth() === 11 && currentDate.getDate() === 25;

  // If it's Christmas Day, show celebration message
  if (isChristmasDay) {
    document.querySelector(".countdown-wrapper").style.display = "none";
    document.querySelector(".celebration-message").style.display = "block";
    createSnowfall();
    addTreeLights();
  } else {
    // Update countdown every second
    const timerInterval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call to avoid delay
    createSnowfall();
    addTreeLights();
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
  celebrateBtn.addEventListener("click", celebrate);

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
      celebrate();
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

  // Create snowfall animation
  function createSnowfall() {
    const snowfallContainer = document.getElementById("snowfall-container");
    const snowflakeCount = Math.floor(window.innerWidth / 10); // Adjust density based on screen width

    for (let i = 0; i < snowflakeCount; i++) {
      createSnowflake(snowfallContainer);
    }
  }

  // Create a single snowflake
  function createSnowflake(container) {
    const snowflake = document.createElement("div");
    snowflake.className = "snowflake";

    // Random size
    const size = Math.random() * 5 + 3;

    // Random position and animation duration
    const left = Math.random() * 100;
    const animationDuration = Math.random() * 10 + 10;
    const animationDelay = Math.random() * 10;

    snowflake.style.cssText = `
      left: ${left}%;
      width: ${size}px;
      height: ${size}px;
      opacity: ${Math.random() * 0.6 + 0.4};
      animation-duration: ${animationDuration}s;
      animation-delay: -${animationDelay}s;
    `;

    container.appendChild(snowflake);

    // Remove and recreate snowflake after animation completes
    setTimeout(() => {
      snowflake.remove();
      createSnowflake(container);
    }, animationDuration * 1000);
  }

  // Add lights to the Christmas tree
  function addTreeLights() {
    const treeLights = document.getElementById("tree-lights");
    const lightCount = 20;
    const colors = [
      "#ff0000",
      "#00ff00",
      "#ffff00",
      "#0000ff",
      "#ff00ff",
      "#00ffff",
    ];

    for (let i = 0; i < lightCount; i++) {
      const light = document.createElement("div");
      light.className = "light";

      // Random position within the tree
      const top = 10 + Math.random() * 80;
      const left = 10 + Math.random() * 80;

      // Random color and animation delay
      const color = colors[Math.floor(Math.random() * colors.length)];
      const animationDelay = Math.random() * 2;

      light.style.cssText = `
        top: ${top}%;
        left: ${left}%;
        color: ${color};
        animation-delay: ${animationDelay}s;
      `;

      treeLights.appendChild(light);
    }
  }

  // Celebration function
  function celebrate() {
    // Increase snowfall
    const snowfallContainer = document.getElementById("snowfall-container");
    for (let i = 0; i < 30; i++) {
      createSnowflake(snowfallContainer);
    }

    // Flash tree lights
    const lights = document.querySelectorAll(".light");
    lights.forEach((light) => {
      light.style.animationDuration = "0.5s";
      setTimeout(() => {
        light.style.animationDuration = "1.5s";
      }, 3000);
    });

    // Add celebration class to body for additional effects
    document.body.classList.add("celebrating");
    setTimeout(() => {
      document.body.classList.remove("celebrating");
    }, 5000);
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
`
);
