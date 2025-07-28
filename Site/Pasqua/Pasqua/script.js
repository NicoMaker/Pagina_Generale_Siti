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

/*
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const inputField = document.getElementById("input")
  const clearBtn = document.getElementById("clear-btn")
  const invertBtn = document.getElementById("invert-btn")
  const exampleBtn = document.getElementById("example-btn")
  const copyBtn = document.getElementById("copy-btn")
  const outputDiv = document.getElementById("output")
  const charCount = document.getElementById("char-count")
  const themeToggle = document.getElementById("theme-toggle")
  const currentYearSpan = document.getElementById("current-year")

  // Set current year
  currentYearSpan.textContent = new Date().getFullYear()

  // Check for saved theme preference
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme")
  }

  // Theme toggle functionality
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme")

    // Save theme preference
    if (document.body.classList.contains("dark-theme")) {
      localStorage.setItem("theme", "dark")
    } else {
      localStorage.setItem("theme", "light")
    }
  })

  // Update character count
  inputField.addEventListener("input", () => {
    const count = inputField.value.length
    charCount.textContent = count

    // Add warning color if approaching limit
    if (count > 100) {
      charCount.style.color = "var(--warning)"
    } else {
      charCount.style.color = "var(--text-light)"
    }
  })

  // Clear input
  clearBtn.addEventListener("click", () => {
    inputField.value = ""
    charCount.textContent = "0"
    charCount.style.color = "var(--text-light)"
    outputDiv.innerHTML = '<div class="placeholder-text">Il risultato apparirà qui dopo l\'inversione</div>'
    inputField.focus()
  })

  // Example button
  exampleBtn.addEventListener("click", () => {
    const examples = ["ciao mondo", "buongiorno italia", "la vita è bella", "il tempo vola", "programmare è divertente"]
    const randomExample = examples[Math.floor(Math.random() * examples.length)]
    inputField.value = randomExample
    charCount.textContent = randomExample.length
    charCount.style.color = "var(--text-light)"
    invertiFrase()
    inputField.focus()
  })

  // Invert button
  invertBtn.addEventListener("click", invertiFrase)

  // Copy button
  copyBtn.addEventListener("click", () => {
    const resultText = outputDiv.textContent
    if (resultText === "Il risultato apparirà qui dopo l'inversione") {
      return
    }

    // Create a temporary textarea to copy the text
    const textarea = document.createElement("textarea")
    textarea.value = resultText
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand("copy")
    document.body.removeChild(textarea)

    // Show success message
    const originalIcon = copyBtn.innerHTML
    copyBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `

    setTimeout(() => {
      copyBtn.innerHTML = originalIcon
    }, 2000)
  })

  // Add keyboard support
  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      invertiFrase()
    }
  })

  // Main function to invert the phrase
  function invertiFrase() {
    const input = inputField.value.trim()

    if (input === "") {
      outputDiv.innerHTML = `<p class="error-message">Inserisci una frase valida</p>`
      return
    }

    const output = input
      .split(" ")
      .map((word) => word.split("").reverse().join(""))
      .join(" ")

    // Create a more visually appealing output
    outputDiv.innerHTML = `
      <div class="result-original">Frase originale: <strong>"${input}"</strong></div>
      <div class="result-inverted">Frase invertita: <strong>"${output}"</strong></div>
    `

    // Add highlight animation
    outputDiv.classList.add("highlight")
    setTimeout(() => {
      outputDiv.classList.remove("highlight")
    }, 1500)
  }
})
*/

document.addEventListener("DOMContentLoaded", () => {
  // Set current year in footer
  document.getElementById("current-year").textContent =
    new Date().getFullYear();

  // DOM Elements
  const yearInput = document.getElementById("year");
  const calculateBtn = document.getElementById("calculate-btn");
  const currentYearBtn = document.getElementById("current-year-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const resultDiv = document.getElementById("result");
  const themeToggle = document.getElementById("theme-toggle");

  // Create floating Easter eggs
  createEasterEggs();

  // Check for saved theme preference
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
  }

  // Event Listeners
  calculateBtn.addEventListener("click", calculateEaster);
  yearInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      calculateEaster();
    }
  });

  currentYearBtn.addEventListener("click", () => {
    yearInput.value = new Date().getFullYear();
    calculateEaster();
  });

  clearBtn.addEventListener("click", () => {
    yearInput.value = "";
    resultDiv.innerHTML =
      '<div class="placeholder-text">Il risultato apparirà qui dopo il calcolo</div>';
    yearInput.focus();
  });

  copyBtn.addEventListener("click", copyResult);

  themeToggle.addEventListener("click", toggleTheme);

  // Set default year to current year
  yearInput.value = new Date().getFullYear();

  // Calculate Easter date function
  function calculateEaster() {
    // Get input value
    const yearValue = yearInput.value.trim();

    // Validate input
    if (!yearValue) {
      showError("Inserisci un anno per calcolare la data di Pasqua");
      return;
    }

    const year = Number.parseInt(yearValue);

    if (isNaN(year)) {
      showError("Inserisci un valore numerico valido");
      return;
    }

    if (year < 1900 || year > 2100) {
      showError("Inserisci un anno tra il 1900 e il 2100");
      return;
    }

    // Calculate Easter date using Gauss algorithm
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const n = Math.floor((h + l - 7 * m + 114) / 31);
    const p = (h + l - 7 * m + 114) % 31;
    const day = p + 1;

    // Convert month number to name
    let monthName;
    if (n === 3) {
      monthName = "Marzo";
    } else if (n === 4) {
      monthName = "Aprile";
    }

    // Create Easter date object for additional info
    const easterDate = new Date(year, n - 1, day);
    const dayOfWeek = getDayOfWeek(easterDate.getDay());

    // Display result with animation - MODIFICATO per mostrare l'anno dopo la data come richiesto
    resultDiv.innerHTML = `
      <div class="result-year">${year}</div>
      <div class="easter-date">${dayOfWeek} ${day} ${monthName} ${year}</div>
      <div class="result-info">La Pasqua cade ${
        day < 10 ? "il" : "l'"
      }${day} ${monthName} ${year}</div>
    `;

    // Add pulse animation to result card
    const resultCard = document.getElementById("result-card");
    resultCard.classList.add("pulse");
    setTimeout(() => {
      resultCard.classList.remove("pulse");
    }, 1500);
  }

  // Helper function to get day of week in Italian
  function getDayOfWeek(day) {
    const days = [
      "Domenica",
      "Lunedì",
      "Martedì",
      "Mercoledì",
      "Giovedì",
      "Venerdì",
      "Sabato",
    ];
    return days[day];
  }

  // Show error message
  function showError(message) {
    resultDiv.innerHTML = `
      <div class="error-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>${message}</span>
      </div>
    `;
  }

  // Copy result to clipboard
  function copyResult() {
    const resultText = resultDiv.textContent.trim();

    if (resultText === "Il risultato apparirà qui dopo il calcolo") {
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
    const originalIcon = copyBtn.innerHTML;
    copyBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-success">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;

    setTimeout(() => {
      copyBtn.innerHTML = originalIcon;
    }, 2000);
  }

  // Toggle theme function
  function toggleTheme() {
    document.body.classList.toggle("dark-theme");

    // Save theme preference
    if (document.body.classList.contains("dark-theme")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  }

  // Create floating Easter eggs
  function createEasterEggs() {
    const eggContainer = document.getElementById("egg-container");
    const eggCount = 10; // Number of eggs

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

  // Calculate Easter on page load
  calculateEaster();
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
