let temperatureData;

async function loadTemperatureData() {
  try {
    const response = await fetch("values.json");
    if (!response.ok) throw new Error("Errore nel caricamento del file JSON");
    temperatureData = await response.json();
  } catch (error) {
    console.error("Errore durante il caricamento dei dati:", error);
    document.getElementById("result").textContent =
      "Impossibile caricare i dati. Riprova più tardi.";
  }
}

function convertTemperature(event) {
  event.preventDefault(); // Previene il refresh del form

  const temperatureInput = document.getElementById("temperatureInput"),
    temperatureValue = temperatureInput.value,
    temperature = parseFloat(temperatureValue),
    fromUnit = document.getElementById("fromUnit").value,
    toUnit = document.getElementById("toUnit").value;

  if (isNaN(temperature)) {
    document.getElementById("result").textContent =
      "Inserisci un valore valido per la temperatura.";
    return;
  }

  if (
    !temperatureData ||
    !temperatureData.units[fromUnit] ||
    !temperatureData.units[toUnit]
  ) {
    document.getElementById("result").textContent =
      "Unità di misura non supportata.";
    return;
  }

  try {
    const convertedTemperature = applyConversion(temperature, fromUnit, toUnit),
      symbol = temperatureData.units[toUnit].symbol;

    document.getElementById(
      "result"
    ).textContent = `Temperatura convertita: ${convertedTemperature.toFixed(
      2
    )} ${symbol}`;
  } catch (error) {
    document.getElementById("result").textContent =
      "Errore durante la conversione. Riprova.";
    console.error(error);
  }
}

function applyConversion(temperature, fromUnit, toUnit) {
  if (fromUnit === toUnit) return temperature;

  const formula =
    temperatureData.units[fromUnit][`to${capitalizeFirstLetter(toUnit)}`];
  if (!formula)
    throw new Error(`Conversione da ${fromUnit} a ${toUnit} non supportata.`);

  const convertFunction = new Function("temperature", `return ${formula}`);
  return convertFunction(temperature);
}

const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

// Carica i dati al caricamento della pagina
window.onload = loadTemperatureData;

// Aggiunge il listener per il submit del form
document
  .getElementById("temperatureForm")
  .addEventListener("submit", convertTemperature);
