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
        if (count > 200) {
            charCount.style.color = "var(--warning)"
        } else {
            charCount.style.color = "var(--text-light)"
        }

        // Auto-resize textarea
        inputField.style.height = "auto"
        inputField.style.height = inputField.scrollHeight + "px"
    })

    // Clear input
    clearBtn.addEventListener("click", () => {
        inputField.value = ""
        charCount.textContent = "0"
        charCount.style.color = "var(--text-light)"
        outputDiv.innerHTML = '<div class="placeholder-text">Il testo trasformato apparirà qui</div>'
        inputField.style.height = "auto"
        inputField.focus()
    })

    // Example button
    exampleBtn.addEventListener("click", () => {
        const examples = [
            "ciao mondo",
            "buongiorno italia",
            "la vita è bella",
            "il tempo vola come una freccia",
            "ogni parola riflessa è come uno specchio",
        ]
        const randomExample = examples[Math.floor(Math.random() * examples.length)]
        inputField.value = randomExample
        charCount.textContent = randomExample.length
        charCount.style.color = "var(--text-light)"
        inputField.style.height = "auto"
        inputField.style.height = inputField.scrollHeight + "px"
        invertiFrase()
        inputField.focus()
    })

    // Invert button
    invertBtn.addEventListener("click", invertiFrase)

    // Copy button
    copyBtn.addEventListener("click", () => {
        const resultText = outputDiv.querySelector(".result-inverted strong")?.textContent
        if (!resultText || resultText === "Il testo trasformato apparirà qui") {
            return
        }

        // Use modern clipboard API if available
        if (navigator.clipboard) {
            navigator.clipboard
                .writeText(resultText)
                .then(() => showCopySuccess())
                .catch(() => fallbackCopy(resultText))
        } else {
            fallbackCopy(resultText)
        }
    })

    // Fallback copy method
    function fallbackCopy(text) {
        const textarea = document.createElement("textarea")
        textarea.value = text
        textarea.style.position = "fixed"
        document.body.appendChild(textarea)
        textarea.select()

        try {
            document.execCommand("copy")
            showCopySuccess()
        } catch (err) {
            console.error("Fallback copy failed:", err)
        }

        document.body.removeChild(textarea)
    }

    // Show copy success animation
    function showCopySuccess() {
        const originalIcon = copyBtn.innerHTML
        copyBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `
        copyBtn.style.color = "var(--success)"

        setTimeout(() => {
            copyBtn.innerHTML = originalIcon
            copyBtn.style.color = "var(--text-light)"
        }, 2000)
    }

    // Add keyboard support
    inputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.ctrlKey) {
            e.preventDefault()
            invertiFrase()
        }
    })

    // Main function to invert the phrase
    function invertiFrase() {
        const input = inputField.value.trim()

        if (input === "") {
            outputDiv.innerHTML = `<p class="error-message">Inserisci del testo da trasformare</p>`
            return
        }

        // Inverti ogni parola mantenendo l'ordine delle parole
        const output = input
            .split(" ")
            .map((word) => word.split("").reverse().join(""))
            .join(" ")

        // Create a more visually appealing output
        outputDiv.innerHTML = `
      <div class="result-original">Testo originale: <strong>${input}</strong></div>
      <div class="result-inverted">Testo trasformato: <strong>${output}</strong></div>
    `

        // Add highlight animation
        outputDiv.classList.add("highlight")
        setTimeout(() => {
            outputDiv.classList.remove("highlight")
        }, 1500)
    }

    // Initialize
    inputField.focus()
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
        background-color: rgba(139, 92, 246, 0.2);
      }
      100% {
        background-color: rgba(139, 92, 246, 0.05);
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
  </style>
`,
)
