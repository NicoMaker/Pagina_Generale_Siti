
let formulas = {};

// Carica le formule dal file JSON
async function loadFormulas() {
  try {
    const response = await fetch("formulas.json");
    if (!response.ok) throw new Error("File JSON non trovato.");
    formulas = await response.json();
  } catch (error) {
    console.error("Errore nel caricamento delle formule:", error);
    document.getElementById("result").innerHTML =
      "Impossibile caricare le formule. Riprova più tardi.";
  }
}

// Funzione per calcolare il peso o l'altezza ideale
function calculateIdeal() {
  const calculationType = document.getElementById("calculationType").value,
    gender = document.getElementById("gender").value,
    value = parseFloat(document.getElementById("value").value);

  let result = "";

  // Validazione input
  if (isNaN(value) || value <= 0) {
    result = "Inserisci un valore numerico valido maggiore di zero.";
    document.getElementById("result").className = "error";
  } else if (
    (calculationType === "weight" && (value < 50 || value > 250)) ||
    (calculationType === "height" && (value < 10 || value > 300))
  ) {
    result = "Inserisci un valore realistico.";
    document.getElementById("result").className = "error";
  } else {
    // Verifica che la formula esista
    if (formulas[calculationType] && formulas[calculationType][gender]) {
      try {
        const formula = formulas[calculationType][gender];
        let calculation;

        // Calcolo basato sul tipo
        if (calculationType === "weight") {
          calculation = new Function("height", `return ${formula};`)(value);
          result = `Il peso ideale per ${
            gender === "male" ? "un uomo" : "una donna"
          } con altezza ${value} cm è ${calculation.toFixed(2)} kg.`;
        } else if (calculationType === "height") {
          calculation = new Function("weight", `return ${formula};`)(value);
          result = `L'altezza ideale per ${
            gender === "male" ? "un uomo" : "una donna"
          } con peso ${value} kg è ${calculation.toFixed(2)} cm.`;
        }

        document.getElementById("result").className = ""; // Rimuove classe errore
      } catch (error) {
        result = "Errore nel calcolo. Controlla le formule.";
        console.error("Errore nel calcolo:", error);
        document.getElementById("result").className = "error";
      }
    } else {
      result = "Errore: la formula per il calcolo non è disponibile.";
      document.getElementById("result").className = "error";
    }
  }

  document.getElementById("result").innerHTML = result;
}

// Carica le formule al caricamento della pagina
document.addEventListener("DOMContentLoaded", loadFormulas);