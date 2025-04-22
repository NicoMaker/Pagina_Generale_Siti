let temperatureData;
let conversionHistory = [];

async function loadTemperatureData() {
  try {
    const response = await fetch("values.json");
    if (!response.ok) throw new Error("Errore nel caricamento del file JSON");
    temperatureData = await response.json();

    // Set default values
    document.getElementById("fromUnit").value = "celsius";
    document.getElementById("toUnit").value = "fahrenheit";

    // Load history from localStorage if available
    loadHistory();
  } catch (error) {
    console.error("Errore durante il caricamento dei dati:", error);
    showResult("Impossibile caricare i dati. Riprova più tardi.", true);
  }
}

function convertTemperature(event) {
  event.preventDefault(); // Previene il refresh del form

  const temperatureInput = document.getElementById("temperatureInput"),
    temperatureValue = temperatureInput.value,
    temperature = Number.parseFloat(temperatureValue),
    fromUnit = document.getElementById("fromUnit").value,
    toUnit = document.getElementById("toUnit").value;

  if (isNaN(temperature)) {
    showResult("Inserisci un valore valido per la temperatura.", true);
    return;
  }

  if (
    !temperatureData ||
    !temperatureData.units[fromUnit] ||
    !temperatureData.units[toUnit]
  ) {
    showResult("Unità di misura non supportata.", true);
    return;
  }

  try {
    const convertedTemperature = applyConversion(temperature, fromUnit, toUnit),
      fromSymbol = temperatureData.units[fromUnit].symbol,
      toSymbol = temperatureData.units[toUnit].symbol;

    const resultText = `${temperature.toFixed(
      2
    )} ${fromSymbol} = ${convertedTemperature.toFixed(2)} ${toSymbol}`;
    showResult(resultText);

    // Add to history
    addToHistory({
      from: `${temperature.toFixed(2)} ${fromSymbol}`,
      to: `${convertedTemperature.toFixed(2)} ${toSymbol}`,
      timestamp: new Date().toLocaleTimeString(),
    });
  } catch (error) {
    showResult("Errore durante la conversione. Riprova.", true);
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

function showResult(message, isError = false) {
  const resultElement = document.getElementById("result");
  resultElement.textContent = message;
  resultElement.className = "result";

  if (isError) {
    resultElement.style.color = "var(--error-color)";
  } else {
    resultElement.style.color = "var(--primary-color)";
    resultElement.classList.add("show");
    setTimeout(() => {
      resultElement.classList.remove("show");
    }, 300);
  }
}

function addToHistory(item) {
  // Limit history to 5 items
  conversionHistory.unshift(item);
  if (conversionHistory.length > 5) {
    conversionHistory.pop();
  }

  // Save to localStorage
  localStorage.setItem("conversionHistory", JSON.stringify(conversionHistory));

  // Update UI
  updateHistoryUI();
}

function loadHistory() {
  const savedHistory = localStorage.getItem("conversionHistory");
  if (savedHistory) {
    conversionHistory = JSON.parse(savedHistory);
    updateHistoryUI();
  }
}

function updateHistoryUI() {
  const historyList = document.getElementById("history-list");
  historyList.innerHTML = "";

  conversionHistory.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.from} → ${item.to}</span>
      <small>${item.timestamp}</small>
    `;
    historyList.appendChild(li);
  });
}

function swapUnits() {
  const fromUnitSelect = document.getElementById("fromUnit");
  const toUnitSelect = document.getElementById("toUnit");

  const tempValue = fromUnitSelect.value;
  fromUnitSelect.value = toUnitSelect.value;
  toUnitSelect.value = tempValue;
}

function toggleTheme() {
  document.body.classList.toggle("dark-theme");

  // Save preference
  const isDarkMode = document.body.classList.contains("dark-theme");
  localStorage.setItem("darkMode", isDarkMode);
}

function loadThemePreference() {
  const isDarkMode = localStorage.getItem("darkMode") === "true";
  if (isDarkMode) {
    document.body.classList.add("dark-theme");
    document.getElementById("theme-switch").checked = true;
  }
}

const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

// Initialize the app
window.onload = () => {
  loadTemperatureData();
  loadThemePreference();

  // Add event listeners
  document
    .getElementById("temperatureForm")
    .addEventListener("submit", convertTemperature);
  document.getElementById("swapUnits").addEventListener("click", swapUnits);
  document
    .getElementById("theme-switch")
    .addEventListener("change", toggleTheme);
};
