let formulas = {};

// Carica le formule dal file JSON
async function loadFormulas() {
  try {
    const response = await fetch("formulas.json");
    formulas = await response.json();
  } catch (error) {
    console.error("Errore nel caricamento delle formule:", error);
  }
}

function calculateIdeal() {
  const calculationType = document.getElementById("calculationType").value,
    gender = document.getElementById("gender").value,
    value = parseFloat(document.getElementById("value").value);

  let result = "";

  if (isNaN(value) || value <= 0) {
    result = "Inserisci un valore valido.";
  } else {
    try {
      // Ottieni la formula
      const formula = formulas[calculationType][gender];

      // Sostituisci height o weight nella formula
      let calculation;
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
    } catch (error) {
      result = "Errore nel calcolo. Controlla le formule.";
      console.error("Errore nel calcolo:", error);
    }
  }

  document.getElementById("result").innerHTML = result;
}

// Carica le formule al caricamento della pagina
document.addEventListener("DOMContentLoaded", loadFormulas);