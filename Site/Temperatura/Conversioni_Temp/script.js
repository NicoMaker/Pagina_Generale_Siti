let temperatureData;

async function loadTemperatureData() {
  const response = await fetch("values.json");
  temperatureData = await response.json();
}

function convertTemperature() {
  const temperature = parseFloat(
      document.getElementById("temperatureInput").value
    ),
    fromUnit = document.getElementById("fromUnit").value,
    toUnit = document.getElementById("toUnit").value;

  if (isNaN(temperature)) {
    document.getElementById("result").textContent =
      "Inserisci un valore valido";
    return;
  }

  let convertedTemperature = applyConversion(temperature, fromUnit, toUnit),
    symbol = temperatureData.units[toUnit].symbol;

  document.getElementById(
    "result"
  ).textContent = `Temperatura convertita: ${convertedTemperature.toFixed(
    2
  )} ${symbol}`;
}

function applyConversion(temperature, fromUnit, toUnit) {
  if (fromUnit === toUnit) return temperature;

  const conversionFormula =
    temperatureData.units[fromUnit][`to${capitalizeFirstLetter(toUnit)}`];
  return eval(conversionFormula);
}

const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

window.onload = loadTemperatureData;
