// Global variables
let regionsData = [];
const extractedRegions = [];
const MAX_HISTORY = 8;

// Initialize the application
document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
  try {
    // Load regions data
    regionsData = await loadRegioni();

    // Add event listeners
    document
      .getElementById("generateButton")
      .addEventListener("click", handleGenerateButtonClick);

    // Calculate totals for display
    const totalEstensione = calculateTotalValues(regionsData, "estensione_km2");
    const totalPopolazione = calculateTotalValues(regionsData, "popolazione");
    const totalRegioni = regionsData.length;
    const totalProvince = calculateTotalProvinces(regionsData);

    // Update total stats display
    document.getElementById("total-population").textContent =
      formatNumber(totalPopolazione) + " abitanti";
    document.getElementById("total-area").textContent =
      formatNumber(totalEstensione) + " km²";
    document.getElementById("total-regions").textContent = totalRegioni;
    document.getElementById("total-provinces").textContent = totalProvince;
  } catch (error) {
    console.error("Error initializing the application:", error);
    showErrorMessage(
      "Si è verificato un errore durante l'inizializzazione dell'applicazione.",
    );
  }
}

// Load regions data from JSON file
async function loadRegioni() {
  try {
    const response = await fetch("configurazioni.json");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading regions:", error);
    showErrorMessage("Impossibile caricare i dati delle regioni.");
    return [];
  }
}

// Calculate total values for a specific key across all regions
function calculateTotalValues(regioni, key) {
  return regioni.reduce((total, regione) => total + regione[key], 0);
}

// Calculate total number of provinces
function calculateTotalProvinces(regioni) {
  return regioni.reduce((total, regione) => total + regione.province.length, 0);
}

// Calculate percentage of a value relative to a total
function calculatePercent(value, total) {
  return ((value / total) * 100).toFixed(2);
}

// Calculate population density
function calculateDensity(population, area) {
  return (population / area).toFixed(2);
}

// Select a random region
function selectRandomRegione(regioni) {
  return regioni[Math.floor(Math.random() * regioni.length)];
}

// Format a number with thousands separators
function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Handle the generate button click
function handleGenerateButtonClick() {
  const totalEstensione = calculateTotalValues(regionsData, "estensione_km2");
  const totalPopolazione = calculateTotalValues(regionsData, "popolazione");
  const totalProvince = calculateTotalProvinces(regionsData);

  // Add pulse animation to the button
  const button = document.getElementById("generateButton");
  button.classList.add("pulse");
  setTimeout(() => {
    button.classList.remove("pulse");
  }, 500);

  // Create a shuffling effect
  let counter = 0;
  const maxIterations = 10;
  const intervalId = setInterval(() => {
    displayRandomRegione(
      regionsData,
      totalEstensione,
      totalPopolazione,
      totalProvince,
      true,
    );
    counter++;

    if (counter >= maxIterations) {
      clearInterval(intervalId);
      const finalRegion = displayRandomRegione(
        regionsData,
        totalEstensione,
        totalPopolazione,
        totalProvince,
        false,
      );
      addToHistory(finalRegion);
    }
  }, 100);
}

// Display a random region
function displayRandomRegione(
  regioni,
  totalEstensione,
  totalPopolazione,
  totalProvince,
  isShuffling,
) {
  const regioneCasuale = selectRandomRegione(regioni);
  const percentualeEstensione = calculatePercent(
    regioneCasuale.estensione_km2,
    totalEstensione,
  );
  const percentualePopolazione = calculatePercent(
    regioneCasuale.popolazione,
    totalPopolazione,
  );
  const densitaRegione = calculateDensity(
    regioneCasuale.popolazione,
    regioneCasuale.estensione_km2,
  );
  const percentualeProvince = calculatePercent(
    regioneCasuale.province.length,
    totalProvince,
  );

  const regioneHTML = generateRegioneHTML(
    regioneCasuale,
    percentualeEstensione,
    percentualePopolazione,
    densitaRegione,
    percentualeProvince,
    isShuffling,
  );

  updateUI(regioneHTML);
  return regioneCasuale;
}

// Generate HTML for a region
function generateRegioneHTML(
  regione,
  percentualeEstensione,
  percentualePopolazione,
  densitaRegione,
  percentualeProvince,
  isShuffling,
) {
  const { nome, immagine, capoluogo, estensione_km2, popolazione, province } =
    regione;
  const numeroProvince = province.length;

  // Generate provinces list with numbers and icons
  const provinceHTML = province
    .sort()
    .map(
      (provincia, index) => `
      <div class="province-item">
        <div class="province-number">${index + 1}</div>
        <div class="province-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="province-svg">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <div class="province-name">${provincia}</div>
      </div>
    `,
    )
    .join("");

  // Apply animation class based on whether we're shuffling or showing the final result
  const animationClass = isShuffling ? "" : "fade-in";

  return `
    <div class="region-content ${animationClass}">
      <div class="region-header">
        <div class="region-title">
          <h2 class="region-name">${nome}</h2>
          <div class="region-capital">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="capital-icon">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Capoluogo: ${capoluogo}
          </div>
        </div>
      </div>
      
      <div class="region-image-container">
        <img src="Img/${immagine}" alt="${nome}" class="region-image" onerror="this.src='https://via.placeholder.com/300x200.png?text=${encodeURIComponent(nome)}'">
      </div>
      
      <div class="region-stats">
        <div class="stat-item">
          <div class="stat-label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stat-icon">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Superficie
          </div>
          <div class="stat-value">${formatNumber(estensione_km2)} km²</div>
          <div class="stat-detail">
            <span>${percentualeEstensione}% dell'Italia</span>
            <div class="percentage-bar">
              <div class="percentage-fill" style="width: ${percentualeEstensione}%"></div>
            </div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stat-icon">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Popolazione
          </div>
          <div class="stat-value">${formatNumber(popolazione)}</div>
          <div class="stat-detail">
            <span>${percentualePopolazione}% dell'Italia</span>
            <div class="percentage-bar">
              <div class="percentage-fill" style="width: ${percentualePopolazione}%"></div>
            </div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stat-icon">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Densità
          </div>
          <div class="stat-value">${densitaRegione} ab/km²</div>
        </div>
      </div>
      
      <div class="region-provinces">
        <div class="provinces-header">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="provinces-icon">
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <h3 class="provinces-title">Province (${numeroProvince})</h3>
        </div>
        
        <div class="province-percentage">
          <span>${percentualeProvince}% del totale nazionale</span>
          <div class="percentage-bar">
            <div class="percentage-fill" style="width: ${percentualeProvince}%"></div>
          </div>
        </div>
        
        <div class="provinces-grid">
          ${provinceHTML}
        </div>
      </div>
    </div>
  `;
}

// Update the UI with the generated HTML
function updateUI(html) {
  const outputElement = document.getElementById("output");
  outputElement.innerHTML = html;
}

// Add a region to the history
function addToHistory(region) {
  // Don't add duplicates consecutively
  if (extractedRegions.length > 0 && extractedRegions[0].nome === region.nome) {
    return;
  }

  // Add to beginning of array
  extractedRegions.unshift(region);

  // Limit history size
  if (extractedRegions.length > MAX_HISTORY) {
    extractedRegions.pop();
  }

  // Update history display
  updateHistoryDisplay();
}

// Update the history display
function updateHistoryDisplay() {
  const historyContainer = document.getElementById("history");
  historyContainer.innerHTML = "";

  if (extractedRegions.length === 0) {
    historyContainer.innerHTML =
      "<p class='no-history'>Nessuna regione estratta</p>";
    return;
  }

  extractedRegions.forEach((region) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    historyItem.innerHTML = `
      <img src="Img/${region.immagine}" alt="${region.nome}" class="history-image" onerror="this.src='https://via.placeholder.com/150x100.png?text=${encodeURIComponent(region.nome)}'">
      <div class="history-name">${region.nome}</div>
    `;

    // Add click event to display this region again
    historyItem.addEventListener("click", () => {
      const totalEstensione = calculateTotalValues(
        regionsData,
        "estensione_km2",
      );
      const totalPopolazione = calculateTotalValues(regionsData, "popolazione");
      const totalProvince = calculateTotalProvinces(regionsData);

      const percentualeEstensione = calculatePercent(
        region.estensione_km2,
        totalEstensione,
      );
      const percentualePopolazione = calculatePercent(
        region.popolazione,
        totalPopolazione,
      );
      const densitaRegione = calculateDensity(
        region.popolazione,
        region.estensione_km2,
      );
      const percentualeProvince = calculatePercent(
        region.province.length,
        totalProvince,
      );

      const regioneHTML = generateRegioneHTML(
        region,
        percentualeEstensione,
        percentualePopolazione,
        densitaRegione,
        percentualeProvince,
        false,
      );

      updateUI(regioneHTML);
    });

    historyContainer.appendChild(historyItem);
  });
}

// Show error message
function showErrorMessage(message) {
  const outputElement = document.getElementById("output");
  outputElement.innerHTML = `
    <div class="error-message">
      <div class="error-icon">⚠️</div>
      <p>${message}</p>
    </div>
  `;
}
