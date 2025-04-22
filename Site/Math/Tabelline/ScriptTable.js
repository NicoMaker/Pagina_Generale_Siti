// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Add event listeners for keyboard navigation
  document.getElementById("num").addEventListener("keypress", handleEnterKey);
  document.getElementById("min").addEventListener("keypress", handleEnterKey);
  document.getElementById("max").addEventListener("keypress", handleEnterKey);

  // Add print functionality
  document.getElementById("print-btn").addEventListener("click", () => {
    window.print();
  });
});

// Handle Enter key press
function handleEnterKey(event) {
  if (event.key === "Enter") {
    generaTabellina();
  }
}

// Main function to generate multiplication table
function generaTabellina() {
  // Get the result container and error message elements
  const resultContainer = document.getElementById("result-container");
  const errorMessageElement = document.getElementById("error-message");

  // Reset UI state
  resultContainer.classList.add("hidden");
  errorMessageElement.classList.add("hidden");
  errorMessageElement.textContent = "";

  // Get input values
  const num = getInputValue("num");
  let min = getInputValue("min");
  let max = getInputValue("max");

  // Validate inputs
  if (isNaN(num) || isNaN(min) || isNaN(max)) {
    showError("Per favore, inserisci valori numerici validi in tutti i campi.");
    return;
  }

  if (num === 0) {
    showError("Il numero della tabellina non può essere zero.");
    return;
  }

  // Swap min and max if min > max
  if (min > max) {
    [min, max] = [max, min];
    showNotification("I valori minimo e massimo sono stati scambiati.");
  }

  // Limit range to prevent browser hanging
  if (max - min > 1000) {
    showError(
      "Per favore, limita l'intervallo a 1000 numeri per prestazioni ottimali."
    );
    return;
  }

  // Generate and display the table
  generateTable(num, min, max);

  // Show the result container with animation
  resultContainer.classList.remove("hidden");

  // Scroll to the result
  setTimeout(() => {
    resultContainer.scrollIntoView({ behavior: "smooth" });
  }, 100);
}

// Get input value as integer
function getInputValue(id) {
  return Number.parseInt(document.getElementById(id).value) || 0;
}

// Show error message
function showError(message) {
  const errorElement = document.getElementById("error-message");
  errorElement.textContent = message;
  errorElement.classList.remove("hidden");

  // Add shake animation
  errorElement.classList.add("shake");
  setTimeout(() => {
    errorElement.classList.remove("shake");
  }, 500);
}

// Show notification by temporarily changing the button text
function showNotification(message) {
  const button = document.getElementById("generate-btn");
  const originalText = button.querySelector(".btn-text").textContent;

  button.querySelector(".btn-text").textContent = message;
  button.classList.add("notification");

  setTimeout(() => {
    button.querySelector(".btn-text").textContent = originalText;
    button.classList.remove("notification");
  }, 3000);
}

const insertnum = () => Number.parseInt(document.getElementById("num").value),
  insertmin = () => Number.parseInt(document.getElementById("min").value),
  insertmax = () => Number.parseInt(document.getElementById("max").value);

// Generate the multiplication table
function generateTable(num, min, max) {
  const tabellinaElement = document.getElementById("tabellina");
  const summaryElement = document.getElementById("summary");

  // Create table HTML
  let tabellinaHTML = `
    <table>
      <thead>
        <tr>
          <th>Numero</th>
          <th>Moltiplicatore</th>
          <th>Risultato</th>
        </tr>
      </thead>
      <tbody>
  `;

  // Counter for operations
  let operationCount = 0;

  // Generate table rows
  for (let i = min; i <= max; i++) {
    const risultato = num * i;
    tabellinaHTML += `
      <tr class="table-row" data-index="${operationCount}">
        <td>${num}</td>
        <td>${i}</td>
        <td>${risultato}</td>
      </tr>
    `;
    operationCount++;
  }

  tabellinaHTML += `
      </tbody>
    </table>
  `;

  // Update the table in the DOM
  tabellinaElement.innerHTML = tabellinaHTML;

  // Create summary text
  const summaryText =
    operationCount === 1
      ? `È stata calcolata ${operationCount} operazione.`
      : `Sono state calcolate ${operationCount} operazioni.`;

  // Update summary
  summaryElement.innerHTML = `
    <p>${summaryText}</p>
    <p class="summary-detail">Tabellina del ${num} da ${min} a ${max}</p>
  `;

  // Add animation to table rows
  const rows = document.querySelectorAll(".table-row");
  rows.forEach((row, index) => {
    setTimeout(() => {
      row.style.opacity = "0";
      row.style.transform = "translateY(10px)";

      // Force reflow
      void row.offsetWidth;

      row.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      row.style.opacity = "1";
      row.style.transform = "translateY(0)";
    }, index * 30);
  });
}

// Add a function to highlight a specific multiplication
function highlightMultiplication(index) {
  const rows = document.querySelectorAll(".table-row");

  // Remove highlight from all rows
  rows.forEach((row) => {
    row.classList.remove("highlight");
  });

  // Add highlight to the selected row
  if (rows[index]) {
    rows[index].classList.add("highlight");
    rows[index].scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
