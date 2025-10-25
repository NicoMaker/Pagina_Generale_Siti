// Variabili globali
let formulas = {};
let currentResult = null;

// Elementi DOM
const calculatorForm = document.getElementById("calculatorForm");
const calculationType = document.getElementById("calculationType");
const tabButtons = document.querySelectorAll(".tab-button");
const heightInputGroup = document.getElementById("heightInputGroup");
const weightInputGroup = document.getElementById("weightInputGroup");
const heightInput = document.getElementById("heightInput");
const weightInput = document.getElementById("weightInput");
const heightSlider = document.getElementById("heightSlider");
const weightSlider = document.getElementById("weightSlider");
const genderMale = document.getElementById("genderMale");
const genderFemale = document.getElementById("genderFemale");
const resultDisplay = document.getElementById("resultDisplay");
const resultDetails = document.getElementById("resultDetails");
const saveButton = document.getElementById("saveButton");
const shareButton = document.getElementById("shareButton");
const toastContainer = document.getElementById("toastContainer");

// Inizializzazione dell'applicazione
document.addEventListener("DOMContentLoaded", async () => {
  // Carica le formule
  try {
    formulas = await loadFormulas();
  } catch (error) {
    console.error("Errore nel caricamento delle formule:", error);
    showToast(
      "Errore",
      "Impossibile caricare le formule. Riprova più tardi.",
      "error",
    );

    // Formule di fallback
    formulas = {
      weight: {
        male: "(height - 100) * 0.9",
        female: "(height - 100) * 0.85",
      },
      height: {
        male: "(weight / 0.9) + 100",
        female: "(weight / 0.85) + 100",
      },
    };
  }

  // Aggiungi event listeners
  calculatorForm.addEventListener("submit", handleFormSubmit);

  // Event listeners per i tab
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Aggiorna il tipo di calcolo
      calculationType.value = button.getAttribute("data-type");

      // Aggiorna l'interfaccia
      updateCalculatorUI(calculationType.value);

      // Aggiorna la classe active
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
    });
  });

  // Event listeners per gli slider
  heightSlider.addEventListener("input", () => {
    heightInput.value = heightSlider.value;
  });

  weightSlider.addEventListener("input", () => {
    weightInput.value = weightSlider.value;
  });

  heightInput.addEventListener("input", () => {
    heightSlider.value = heightInput.value;
  });

  weightInput.addEventListener("input", () => {
    weightSlider.value = weightInput.value;
  });

  // Seleziona il contenuto degli input al focus per una facile modifica
  heightInput.addEventListener("focus", () => heightInput.select());
  weightInput.addEventListener("focus", () => weightInput.select());

  // Event listeners per i pulsanti di azione
  saveButton.addEventListener("click", saveResult);
  shareButton.addEventListener("click", shareResult);

  // Inizializza l'interfaccia
  updateCalculatorUI("weight");
});

// Funzione per caricare le formule
async function loadFormulas() {
  const response = await fetch("formulas.json");
  if (!response.ok) throw new Error("File JSON non trovato.");
  return await response.json();
}

// Funzione per aggiornare l'interfaccia del calcolatore
function updateCalculatorUI(type) {
  if (type === "weight") {
    heightInputGroup.style.display = "block";
    weightInputGroup.style.display = "none";
    heightInput.setAttribute("required", "");
    weightInput.removeAttribute("required");
  } else {
    heightInputGroup.style.display = "none";
    weightInputGroup.style.display = "block";
    heightInput.removeAttribute("required");
    weightInput.setAttribute("required", "");
  }
}

// Funzione per gestire l'invio del form
function handleFormSubmit(event) {
  event.preventDefault();

  // Ottieni i valori dal form
  const type = calculationType.value;
  const gender = genderMale.checked ? "male" : "female";
  const height = Number.parseFloat(heightInput.value);
  const weight = Number.parseFloat(weightInput.value);

  // Validazione
  if (type === "weight" && (isNaN(height) || height < 50 || height > 300)) {
    showToast(
      "Errore",
      "Inserisci un'altezza valida tra 50 e 300 cm.",
      "error",
    );
    return;
  }

  if (type === "height" && (isNaN(weight) || weight < 10 || weight > 3000)) {
    showToast(
      "Errore",
      "Inserisci un peso valido tra 10 e 3000 kg.",
      "error",
    );
    return;
  }

  // Calcola il risultato
  calculateResult(type, gender, height, weight);
}

// Funzione per calcolare il risultato
function calculateResult(type, gender, height, weight) {
  try {
    let result, formula, value;

    if (type === "weight") {
      formula = formulas.weight[gender];
      value = new Function("height", `return ${formula}`)(height);
      result = {
        type: "weight",
        gender: gender,
        height: height,
        calculatedWeight: value,
        formula: formula,
      };
    } else {
      formula = formulas.height[gender];
      value = new Function("weight", `return ${formula}`)(weight);
      result = {
        type: "height",
        gender: gender,
        weight: weight,
        calculatedHeight: value,
        formula: formula,
      };
    }

    // Salva il risultato corrente
    currentResult = result;

    // Aggiorna l'interfaccia
    displayResult(result);

    // Abilita i pulsanti di azione
    saveButton.disabled = false;
    shareButton.disabled = false;
  } catch (error) {
    console.error("Errore nel calcolo:", error);
    showToast(
      "Errore",
      "Si è verificato un errore durante il calcolo. Riprova.",
      "error",
    );
  }
}

// Funzione per visualizzare il risultato
function displayResult(result) {
  // Pulisci il display
  resultDisplay.innerHTML = "";
  resultDisplay.classList.add("has-result");

  // Crea gli elementi per il risultato
  const valueElement = document.createElement("div");
  valueElement.className = "result-value";

  const textElement = document.createElement("div");
  textElement.className = "result-text";

  if (result.type === "weight") {
    valueElement.textContent = `${result.calculatedWeight.toFixed(1)} kg`;
    textElement.textContent = `Peso ideale per ${
      result.gender === "male" ? "un uomo" : "una donna"
    } alto ${result.height} cm`;
  } else {
    valueElement.textContent = `${result.calculatedHeight.toFixed(1)} cm`;
    textElement.textContent = `Altezza ideale per ${
      result.gender === "male" ? "un uomo" : "una donna"
    } che pesa ${result.weight} kg`;
  }

  // Aggiungi gli elementi al display
  resultDisplay.appendChild(valueElement);
  resultDisplay.appendChild(textElement);

  // Aggiorna i dettagli
  updateResultDetails(result);
}

// Funzione per aggiornare i dettagli del risultato
function updateResultDetails(result) {
  // Pulisci i dettagli
  resultDetails.innerHTML = "";

  // Crea gli elementi per i dettagli
  let detailsHTML = "";

  if (result.type === "weight") {
    detailsHTML += createDetailItem(
      "Genere",
      result.gender === "male" ? "Uomo" : "Donna",
    );
    detailsHTML += createDetailItem("Altezza", `${result.height} cm`);
    detailsHTML += createDetailItem(
      "Peso ideale",
      `${result.calculatedWeight.toFixed(1)} kg`,
    );

    // Calcola il BMI
    const bmi =
      result.calculatedWeight / ((result.height / 100) * (result.height / 100));
    detailsHTML += createDetailItem("BMI stimato", bmi.toFixed(1));

    // Aggiungi la categoria BMI
    detailsHTML += createDetailItem("Categoria BMI", getBMICategory(bmi));

    // Aggiungi la formula utilizzata
    detailsHTML += createDetailItem(
      "Formula utilizzata",
      `(Altezza - 100) × ${result.gender === "male" ? "0.9" : "0.85"}`,
    );
  } else {
    detailsHTML += createDetailItem(
      "Genere",
      result.gender === "male" ? "Uomo" : "Donna",
    );
    detailsHTML += createDetailItem("Peso", `${result.weight} kg`);
    detailsHTML += createDetailItem(
      "Altezza ideale",
      `${result.calculatedHeight.toFixed(1)} cm`,
    );

    // Calcola il BMI
    const bmi =
      result.weight /
      ((result.calculatedHeight / 100) * (result.calculatedHeight / 100));
    detailsHTML += createDetailItem("BMI stimato", bmi.toFixed(1));

    // Aggiungi la categoria BMI
    detailsHTML += createDetailItem("Categoria BMI", getBMICategory(bmi));

    // Aggiungi la formula utilizzata
    detailsHTML += createDetailItem(
      "Formula utilizzata",
      `(Peso / ${result.gender === "male" ? "0.9" : "0.85"}) + 100`,
    );
  }

  // Aggiungi i dettagli al container
  resultDetails.innerHTML = detailsHTML;
  resultDetails.classList.add("visible");
}

// Funzione per creare un elemento di dettaglio
function createDetailItem(label, value) {
  return `
    <div class="detail-item">
      <div class="detail-label">${label}</div>
      <div class="detail-value">${value}</div>
    </div>
  `;
}

// Funzione per ottenere la categoria BMI
function getBMICategory(bmi) {
  if (bmi < 18.5) return "Sottopeso";
  if (bmi < 25) return "Normopeso";
  if (bmi < 30) return "Sovrappeso";
  if (bmi < 35) return "Obesità di classe I";
  if (bmi < 40) return "Obesità di classe II";
  return "Obesità di classe III";
}

// Funzione per salvare il risultato
function saveResult() {
  if (!currentResult) return;

  // Simula il salvataggio
  showToast("Successo", "Risultato salvato con successo!", "success");
}

// Funzione per condividere il risultato
function shareResult() {
  if (!currentResult) return;

  // Crea il testo da condividere
  let shareText = "";

  if (currentResult.type === "weight") {
    shareText = `Il mio peso ideale è ${currentResult.calculatedWeight.toFixed(
      1,
    )} kg (altezza: ${currentResult.height} cm)`;
  } else {
    shareText = `La mia altezza ideale è ${currentResult.calculatedHeight.toFixed(
      1,
    )} cm (peso: ${currentResult.weight} kg)`;
  }

  // Verifica se l'API di condivisione è disponibile
  if (navigator.share) {
    navigator
      .share({
        title: "Calcolatore Peso e Altezza Ideali",
        text: shareText,
      })
      .catch((error) => {
        console.error("Errore durante la condivisione:", error);
        fallbackShare(shareText);
      });
  } else {
    fallbackShare(shareText);
  }
}

// Funzione di fallback per la condivisione
function fallbackShare(text) {
  // Copia il testo negli appunti
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showToast("Successo", "Risultato copiato negli appunti!", "success");
    })
    .catch((error) => {
      console.error("Errore durante la copia:", error);
      showToast("Errore", "Impossibile copiare il risultato", "error");
    });
}

// Funzione per mostrare un toast di notifica
function showToast(title, message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const iconClass = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  }[type];

  toast.innerHTML = `
    <div class="toast-icon ${type}">
      <i class="fas ${iconClass}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;

  toastContainer.appendChild(toast);

  // Rimuovi il toast dopo 3 secondi
  setTimeout(() => {
    if (toastContainer.contains(toast)) {
      toastContainer.removeChild(toast);
    }
  }, 3000);
}
