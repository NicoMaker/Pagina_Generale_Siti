// Wait for DOM to be fully loaded
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

    // Show/hide clear button based on input
    if (count > 0) {
      clearBtn.style.opacity = "1"
      clearBtn.style.pointerEvents = "auto"
    } else {
      clearBtn.style.opacity = "0"
      clearBtn.style.pointerEvents = "none"
    }
  })

  // Initially hide clear button
  clearBtn.style.opacity = "0"
  clearBtn.style.pointerEvents = "none"

  // Clear input
  clearBtn.addEventListener("click", () => {
    inputField.value = ""
    charCount.textContent = "0"
    charCount.style.color = "var(--text-light)"
    outputDiv.innerHTML = '<div class="placeholder-text">Il risultato apparirà qui dopo l\'inversione</div>'
    clearBtn.style.opacity = "0"
    clearBtn.style.pointerEvents = "none"
    inputField.focus()
  })

  // Example button
  exampleBtn.addEventListener("click", () => {
    const examples = ["ciao mondo", "buongiorno italia", "la vita è bella", "il tempo vola", "programmare è divertente"]
    const randomExample = examples[Math.floor(Math.random() * examples.length)]
    inputField.value = randomExample
    charCount.textContent = randomExample.length
    charCount.style.color = "var(--text-light)"
    clearBtn.style.opacity = "1"
    clearBtn.style.pointerEvents = "auto"
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
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `
    copyBtn.classList.add("copy-success")

    setTimeout(() => {
      copyBtn.innerHTML = originalIcon
      copyBtn.classList.remove("copy-success")
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

    // Create a more visually appealing output with horizontal layout
    outputDiv.innerHTML = `
      <div class="result-container">
        <div class="result-original">Frase originale: <strong>"${input}"</strong></div>
        <div class="result-divider"></div>
        <div class="result-inverted">Frase invertita: <strong>"${output}"</strong></div>
      </div>
    `

    // Add highlight animation
    outputDiv.classList.add("highlight")
    setTimeout(() => {
      outputDiv.classList.remove("highlight")
    }, 1500)
  }
})

// Add CSS animations
document.head.insertAdjacentHTML(
  "beforeend",
  `
  <style>
    .highlight {
      animation: highlight 1.5s ease;
    }
    
    @keyframes highlight {
      0% {
        background-color: rgba(124, 58, 237, 0.2);
      }
      100% {
        background-color: rgba(124, 58, 237, 0.05);
      }
    }
    
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

    .copy-success {
      animation: copy-success 2s ease-in-out;
    }

    @keyframes copy-success {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
      }
    }
  </style>
`,
)
