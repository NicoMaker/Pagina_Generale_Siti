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

  let convertedTemperature;
  let symbol;

  // Conversioni
  if (fromUnit === "celsius") {
    if (toUnit === "fahrenheit") {
      convertedTemperature = (temperature * 9) / 5 + 32;
      symbol = "°F";
    } else if (toUnit === "kelvin") {
      convertedTemperature = temperature + 273.15;
      symbol = "K";
    } else {
      convertedTemperature = temperature;
      symbol = "°C";
    }
  } else if (fromUnit === "fahrenheit") {
    if (toUnit === "celsius") {
      convertedTemperature = ((temperature - 32) * 5) / 9;
      symbol = "°C";
    } else if (toUnit === "kelvin") {
      convertedTemperature = ((temperature - 32) * 5) / 9 + 273.15;
      symbol = "K";
    } else {
      convertedTemperature = temperature;
      symbol = "°F";
    }
  } else if (fromUnit === "kelvin") {
    if (toUnit === "celsius") {
      convertedTemperature = temperature - 273.15;
      symbol = "°C";
    } else if (toUnit === "fahrenheit") {
      convertedTemperature = ((temperature - 273.15) * 9) / 5 + 32;
      symbol = "°F";
    } else {
      convertedTemperature = temperature;
      symbol = "K";
    }
  }

  document.getElementById(
    "result"
  ).textContent = `Temperatura convertita: ${convertedTemperature.toFixed(
    2
  )} ${symbol}`;
}
