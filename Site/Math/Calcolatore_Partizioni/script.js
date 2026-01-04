const form = document.getElementById("calculatorForm");
const numberInput = document.getElementById("numberInput");
const modeSelect = document.getElementById("modeSelect");
const resetBtn = document.getElementById("resetBtn");
const resultsSection = document.getElementById("resultsSection");
const totalCount = document.getElementById("totalCount");
const countBadge = document.getElementById("countBadge");
const partitionsList = document.getElementById("partitionsList");

function generateCombinations(n, allowZero, allowRepeat) {
  const results = [];
  const start = allowZero ? 0 : 1;

  if (allowRepeat) {
    // Con ripetizioni: stampa entrambe le versioni (i+j e j+i)
    for (let i = start; i <= n; i++) {
      const j = n - i;
      if (j >= start && j <= n) {
        results.push([i, j]);
        // Se i != j, aggiungi anche la versione inversa
        if (i !== j) {
          results.push([j, i]);
        }
      }
    }
  } else {
    // Senza ripetizioni: solo coppie dove i <= j per evitare duplicati
    for (let i = start; i <= n; i++) {
      const j = n - i;
      if (j >= i && j <= n) {
        results.push([i, j]);
      }
    }
  }

  return results;
}

function calculate(event) {
  event.preventDefault();

  const num = parseInt(numberInput.value);
  const mode = modeSelect.value;

  if (!num || num <= 0) {
    alert("Per favore inserisci un numero valido maggiore di 0");
    return;
  }

  let results = [];

  switch (mode) {
    case "no-zero-no-repeat":
      results = generateCombinations(num, false, false);
      break;
    case "no-zero-repeat":
      results = generateCombinations(num, false, true);
      break;
    case "no-repeat-with-zero":
      results = generateCombinations(num, true, false);
      break;
    case "repeat-with-zero":
      results = generateCombinations(num, true, true);
      break;
  }

  displayResults(results, num);
}

function displayResults(results, num) {
  resultsSection.style.display = "block";

  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 100);

  totalCount.textContent = results.length;
  countBadge.textContent = `${results.length} ${
    results.length === 1 ? "risultato" : "risultati"
  }`;

  if (results.length === 0) {
    partitionsList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🔍</div>
                        <p class="empty-state-text">Nessuna partizione trovata per questo numero e modalità</p>
                    </div>
                `;
  } else {
    partitionsList.innerHTML = results
      .map(
        (partition, index) =>
          `<div class="partition-item" style="animation-delay: ${
            index * 0.02
          }s;">
                        <span class="partition-sum">${partition.join(
                          " + "
                        )} = ${num}</span>
                    </div>`
      )
      .join("");
  }
}

function reset() {
  numberInput.value = "";
  modeSelect.value = "no-zero-no-repeat";
  resultsSection.style.display = "none";
  numberInput.focus();
}

form.addEventListener("submit", calculate);
resetBtn.addEventListener("click", reset);

numberInput.focus();
