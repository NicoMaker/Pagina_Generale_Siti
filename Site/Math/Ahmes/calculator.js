/**
 * Ahmes Calculator Module
 * Implements the ancient Egyptian multiplication method
 */

// Import necessary functions from hieroglyphics.js
import { convertToEgyptianNumerals, MAX_NUMBER } from "./hieroglyphics.js";

// DOM Elements
const numero1Input = document.getElementById("numero1");
const numero2Input = document.getElementById("numero2");
const calculateBtn = document.getElementById("calculate-btn");
const passaggiDiv = document.getElementById("passaggi");
const risultatoDiv = document.getElementById("risultato");
const resultsContainer = document.getElementById("results-container");
const hieroglyphic1 = document.getElementById("hieroglyphic1");
const hieroglyphic2 = document.getElementById("hieroglyphic2");
const notification = document.getElementById("notification");
const notificationText = document.getElementById("notification-text");

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Set max attribute on number inputs
  numero1Input.setAttribute("max", MAX_NUMBER);
  numero2Input.setAttribute("max", MAX_NUMBER);

  // Focus on first input when page loads
  numero1Input.focus();

  // Listen for Enter key on inputs
  numero1Input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      numero2Input.focus();
    }
  });

  numero2Input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      calcolaAhmes();
    }
  });

  // Update hieroglyphic representation on input and validate max value
  numero1Input.addEventListener("input", () => {
    validateMaxNumber(numero1Input);
    updateHieroglyphics(numero1Input.value, hieroglyphic1);
  });

  numero2Input.addEventListener("input", () => {
    validateMaxNumber(numero2Input);
    updateHieroglyphics(numero2Input.value, hieroglyphic2);
  });

  // Add click event to calculate button
  calculateBtn.addEventListener("click", calcolaAhmes);
});

// Validate that the number doesn't exceed MAX_NUMBER
function validateMaxNumber(inputElement) {
  const value = Number(inputElement.value);
  if (value > MAX_NUMBER) {
    inputElement.value = MAX_NUMBER;
    showNotification(`Il numero massimo consentito è ${MAX_NUMBER}`);
  }
}

// Check if steps content overflows and show scroll indicator
function checkStepsOverflow() {
  if (passaggiDiv.scrollHeight > passaggiDiv.clientHeight) {
    passaggiDiv.classList.add("overflow");
  } else {
    passaggiDiv.classList.remove("overflow");
  }
}

// Convert numbers to hieroglyphic representation
function updateHieroglyphics(value, element) {
  if (value === "" || isNaN(value)) {
    element.textContent = "";
    return;
  }

  const num = Number.parseInt(value);
  if (num <= 0) {
    element.textContent = "";
    return;
  }

  if (num > MAX_NUMBER) {
    element.textContent = "Numero troppo grande";
    element.classList.add("error");
    return;
  }

  element.classList.remove("error");
  // Use the convertToEgyptianNumerals function from hieroglyphics.js
  element.textContent = convertToEgyptianNumerals(num);
}

// Show notification
function showNotification(message) {
  notificationText.textContent = message;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Format steps with Egyptian styling
function formatStep(step, isEven, num1, num2) {
  const hieroglyphic1 = convertToEgyptianNumerals(num1);
  const hieroglyphic2 = num2 ? convertToEgyptianNumerals(num2) : "";

  let hieroglyphicDisplay = "";
  if (hieroglyphic1) {
    hieroglyphicDisplay = `<div class="step-hieroglyphic">${hieroglyphic1}</div>`;
    if (hieroglyphic2) {
      hieroglyphicDisplay += ` <span class="operation-symbol">×</span> <div class="step-hieroglyphic">${hieroglyphic2}</div>`;
    }
  }

  return `<div class="step ${isEven ? "even" : "odd"}">
    ${step}
    ${hieroglyphicDisplay}
  </div>`;
}

// Main calculation function
function calcolaAhmes() {
  const numero1 = Number.parseFloat(numero1Input.value);
  const numero2 = Number.parseFloat(numero2Input.value);

  // Validate inputs
  if (isNaN(numero1) || isNaN(numero2)) {
    const errorMessage =
      isNaN(numero1) && isNaN(numero2)
        ? "Per favore, inserisci entrambi i numeri."
        : isNaN(numero1)
        ? "Per favore, inserisci il primo numero."
        : "Per favore, inserisci il secondo numero.";

    showNotification(errorMessage);
    passaggiDiv.innerHTML = "";
    risultatoDiv.innerHTML = "";
    resultsContainer.classList.remove("active");
    return;
  }

  // Validate maximum number
  if (numero1 > MAX_NUMBER || numero2 > MAX_NUMBER) {
    showNotification(`Il numero massimo consentito è ${MAX_NUMBER}`);
    return;
  }

  // Perform calculation
  const risultato = calcolaRisultato(numero1, numero2);

  // Check if result exceeds MAX_NUMBER
  if (risultato > MAX_NUMBER) {
    showNotification(
      `Il risultato (${risultato}) supera il massimo consentito di ${MAX_NUMBER}. I geroglifici non possono essere visualizzati correttamente.`
    );

    risultatoDiv.innerHTML = `
      <div class="result-content">
        <span class="result-label">Il risultato finale è</span>
        <span class="result-value">${risultato}</span>
        <div class="hieroglyphic-numbers error">Numero troppo grande per i geroglifici</div>
      </div>
    `;
  } else {
    // Display result with hieroglyphics
    const hieroglyphicResult = convertToEgyptianNumerals(risultato);

    risultatoDiv.innerHTML = `
      <div class="result-content">
        <span class="result-label">Il risultato finale è</span>
        <span class="result-value">${risultato}</span>
        <div class="hieroglyphic-numbers">${hieroglyphicResult}</div>
      </div>
    `;
  }

  // Show results container with animation
  resultsContainer.classList.add("active");

  // Scroll to results
  setTimeout(() => {
    resultsContainer.scrollIntoView({ behavior: "smooth" });
    // Check if steps content overflows
    checkStepsOverflow();
  }, 300);
}

function calcolaRisultato(numero1, numero2) {
  let resto = 0;
  let passaggio = 0;
  let stepsHTML = "";

  // Create copies of the original values for display
  let currentNum1 = numero1;
  let currentNum2 = numero2;
  const originalNumero1 = numero1;
  const originalNumero2 = numero2;

  // Introduction text with hieroglyphics
  const hieroglyphic1 = convertToEgyptianNumerals(originalNumero1);
  const hieroglyphic2 = convertToEgyptianNumerals(originalNumero2);

  stepsHTML += `<div class="intro-text">
    Calcoliamo ${originalNumero1} × ${originalNumero2} usando il metodo di Ahmes:
    <div class="hieroglyphic-numbers">${hieroglyphic1} × ${hieroglyphic2}</div>
  </div>`;

  while (currentNum1 > 0) {
    passaggio++;
    const isEven = passaggio % 2 === 0;

    if (currentNum1 % 2 === 0) {
      // Even number case
      stepsHTML += formatStep(
        `
        <span class="step-number">${passaggio})</span> 
        <span class="step-description">Visto che ${currentNum1} è pari:</span> 
        <span class="step-formula">(${currentNum1} ÷ 2) e (${currentNum2} × 2)</span>
      `,
        isEven,
        currentNum1,
        currentNum2
      );

      currentNum1 /= 2;
      currentNum2 *= 2;

      // Check if intermediate result exceeds MAX_NUMBER
      if (currentNum2 > MAX_NUMBER) {
        stepsHTML += `<div class="step warning">
          <span class="step-number">Nota:</span> 
          <span class="step-description">Il valore ${currentNum2} supera il massimo consentito per i geroglifici (${MAX_NUMBER}).</span>
        </div>`;
      }
    } else {
      // Odd number case
      const incremento = resto === 0 ? "" : ` + ${resto}`;
      stepsHTML += formatStep(
        `
        <span class="step-number">${passaggio})</span> 
        <span class="step-description">Visto che ${currentNum1} è dispari:</span> 
        <span class="step-formula">(${currentNum1} - 1) e aggiungiamo ${currentNum2}${incremento} al risultato</span>
      `,
        isEven,
        currentNum1,
        currentNum2
      );

      currentNum1--;
      resto += currentNum2;

      // Check if intermediate result exceeds MAX_NUMBER
      if (resto > MAX_NUMBER) {
        stepsHTML += `<div class="step warning">
          <span class="step-number">Nota:</span> 
          <span class="step-description">Il risultato parziale ${resto} supera il massimo consentito per i geroglifici (${MAX_NUMBER}).</span>
        </div>`;
      }
    }
  }

  // Summary
  const passaggiString = passaggio === 1 ? "passaggio" : "passaggi";
  stepsHTML += `<div class="summary">
    Il calcolo è stato completato in ${passaggio} ${passaggiString}.
    <div class="hieroglyphic-decoration"></div>
  </div>`;

  // Update the steps display
  passaggiDiv.innerHTML = stepsHTML;

  // Check if steps content overflows after content is added
  setTimeout(checkStepsOverflow, 100);

  return resto;
}
