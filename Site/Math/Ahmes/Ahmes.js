// DOM Elements
const numero1Input = document.getElementById("numero1")
const numero2Input = document.getElementById("numero2")
const passaggiDiv = document.getElementById("passaggi")
const risultatoDiv = document.getElementById("risultato")
const resultsContainer = document.getElementById("results-container")
const hieroglyphic1 = document.getElementById("hieroglyphic1")
const hieroglyphic2 = document.getElementById("hieroglyphic2")
const notification = document.getElementById("notification")
const notificationText = document.getElementById("notification-text")

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Focus on first input when page loads
  numero1Input.focus()

  // Listen for Enter key on inputs
  numero1Input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault()
      numero2Input.focus()
    }
  })

  numero2Input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault()
      CalcolaAhmes()
    }
  })

  // Update hieroglyphic representation on input
  numero1Input.addEventListener("input", () => {
    updateHieroglyphics(numero1Input.value, hieroglyphic1)
  })

  numero2Input.addEventListener("input", () => {
    updateHieroglyphics(numero2Input.value, hieroglyphic2)
  })
})

// Check if steps content overflows and show scroll indicator
function checkStepsOverflow() {
  if (passaggiDiv.scrollHeight > passaggiDiv.clientHeight) {
    passaggiDiv.classList.add("overflow")
  } else {
    passaggiDiv.classList.remove("overflow")
  }
}

// Convert numbers to hieroglyphic representation
function updateHieroglyphics(value, element) {
  if (value === "" || isNaN(value)) {
    element.textContent = ""
    return
  }

  const num = Number.parseInt(value)
  if (num <= 0) {
    element.textContent = ""
    return
  }

  // Simple representation using symbols
  let hieroglyphic = ""

  // Thousands (lotus flower symbol)
  const thousands = Math.floor(num / 1000)
  hieroglyphic += "🪷".repeat(thousands)

  // Hundreds (coiled rope symbol)
  const hundreds = Math.floor((num % 1000) / 100)
  hieroglyphic += "⭕".repeat(hundreds)

  // Tens (heel bone symbol)
  const tens = Math.floor((num % 100) / 10)
  hieroglyphic += "∩".repeat(tens)

  // Units (vertical stroke symbol)
  const units = num % 10
  hieroglyphic += "|".repeat(units)

  element.textContent = hieroglyphic
}

// Show notification
function showNotification(message) {
  notificationText.textContent = message
  notification.classList.add("show")

  setTimeout(() => {
    notification.classList.remove("show")
  }, 3000)
}

// Format steps with Egyptian styling
function formatStep(step, isEven) {
  return `<div class="step ${isEven ? "even" : "odd"}">${step}</div>`
}

// Main calculation function
function CalcolaAhmes() {
  const numero1 = Number.parseFloat(document.getElementById("numero1").value)
  const numero2 = Number.parseFloat(document.getElementById("numero2").value)

  // Validate inputs
  if (isNaN(numero1) || isNaN(numero2)) {
    const errorMessage =
      isNaN(numero1) && isNaN(numero2)
        ? "Per favore, inserisci entrambi i numeri."
        : isNaN(numero1)
          ? "Per favore, inserisci il primo numero."
          : "Per favore, inserisci il secondo numero."

    showNotification(errorMessage)
    passaggiDiv.innerHTML = ""
    risultatoDiv.innerHTML = ""
    resultsContainer.classList.remove("active")
    return
  }

  // Perform calculation
  const risultato = CalcolaRisultato(numero1, numero2)

  // Display result
  risultatoDiv.innerHTML = `
    <div class="result-content">
      <span class="result-label">Il risultato finale è</span>
      <span class="result-value">${risultato}</span>
    </div>
  `

  // Show results container with animation
  resultsContainer.classList.add("active")

  // Scroll to results
  setTimeout(() => {
    resultsContainer.scrollIntoView({ behavior: "smooth" })
    // Check if steps content overflows
    checkStepsOverflow()
  }, 300)
}

function CalcolaRisultato(numero1, numero2) {
  let resto = 0
  let passaggio = 0
  let stepsHTML = ""

  // Create a copy of the original values for display
  const originalNumero1 = numero1
  const originalNumero2 = numero2

  // Introduction text
  stepsHTML += `<div class="intro-text">Calcoliamo ${originalNumero1} × ${originalNumero2} usando il metodo di Ahmes:</div>`

  while (numero1 > 0) {
    passaggio++
    const isEven = passaggio % 2 === 0

    if (numero1 % 2 === 0) {
      // Even number case
      stepsHTML += `<div class="step ${isEven ? "even" : "odd"}">
        <span class="step-number">${passaggio})</span> 
        <span class="step-description">Visto che ${numero1} è pari:</span> 
        <span class="step-formula">(${numero1} ÷ 2) e (${numero2} × 2)</span>
      </div>`

      numero1 /= 2
      numero2 *= 2
    } else {
      // Odd number case
      const incremento = resto === 0 ? "" : ` + ${resto}`
      stepsHTML += `<div class="step ${isEven ? "even" : "odd"}">
        <span class="step-number">${passaggio})</span> 
        <span class="step-description">Visto che ${numero1} è dispari:</span> 
        <span class="step-formula">(${numero1} - 1) e aggiungiamo ${numero2}${incremento} al risultato</span>
      </div>`

      numero1--
      resto += numero2
    }
  }

  // Summary
  const passaggiString = passaggio === 1 ? "passaggio" : "passaggi"
  stepsHTML += `<div class="summary">Il calcolo è stato completato in ${passaggio} ${passaggiString}.</div>`

  // Update the steps display
  passaggiDiv.innerHTML = stepsHTML

  // Check if steps content overflows after content is added
  setTimeout(checkStepsOverflow, 100)

  return resto
}
