// Global variables
let regionsData = [];
const extractedRegions = [];
const MAX_HISTORY = 8;

// Initialize the application
const initialize = async () => {
  try {
    regionsData = await loadRegioni();
    document
      .getElementById("generateButton")
      .addEventListener("click", handleGenerateButtonClick);

    const totalEstensione = calculateTotalValues(regionsData, "estensione_km2");
    const totalPopolazione = calculateTotalValues(regionsData, "popolazione");
    const totalRegioni = regionsData.length;
    const totalProvince = calculateTotalProvinces(regionsData);

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
};

// Load regions data from JSON file
const loadRegioni = async () => {
  try {
    const response = await fetch("configurazioni.json");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error loading regions:", error);
    showErrorMessage("Impossibile caricare i dati delle regioni.");
    return [];
  }
};

// Calculate total values for a specific key across all regions
const calculateTotalValues = (regioni, key) =>
  regioni.reduce((total, regione) => total + regione[key], 0);

// Calculate total number of provinces
const calculateTotalProvinces = (regioni) =>
  regioni.reduce((total, regione) => total + regione.province.length, 0);

// Calculate percentage of a value relative to a total (returns number)
const calculatePercent = (value, total) => (value / total) * 100;

// Calculate population density (returns number)
const calculateDensity = (population, area) => population / area;

// Select a random region
const selectRandomRegione = (regioni) =>
  regioni[Math.floor(Math.random() * regioni.length)];

// Format a number with thousands separators (Italian style: dot for thousands, comma for decimals if any)
const formatNumber = (number) => number.toLocaleString("it-IT");

// Format a decimal number with 2 decimal places using comma as decimal separator
const formatDecimal = (number) =>
  number.toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Handle the generate button click
const handleGenerateButtonClick = () => {
  const totalEstensione = calculateTotalValues(regionsData, "estensione_km2");
  const totalPopolazione = calculateTotalValues(regionsData, "popolazione");
  const totalProvince = calculateTotalProvinces(regionsData);

  const button = document.getElementById("generateButton");
  button.classList.add("pulse");
  setTimeout(() => {
    button.classList.remove("pulse");
  }, 500);

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
};

// Display a random region
const displayRandomRegione = (
  regioni,
  totalEstensione,
  totalPopolazione,
  totalProvince,
  isShuffling,
) => {
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
};

// Generate HTML for a region (one‑liner arrow with template literal)
const generateRegioneHTML = (
  regione,
  percentualeEstensione,
  percentualePopolazione,
  densitaRegione,
  percentualeProvince,
  isShuffling,
) => `
  <div class="region-content ${isShuffling ? "" : "fade-in"}">
    <div class="region-header">
      <div class="region-title">
        <h2 class="region-name">${regione.nome}</h2>
        <div class="region-capital">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="capital-icon">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Capoluogo: ${regione.capoluogo}
        </div>
      </div>
    </div>
    
    <div class="region-image-container">
      <img src="Img/${regione.immagine}" alt="${regione.nome}" class="region-image" onerror="this.src='https://via.placeholder.com/300x200.png?text=${encodeURIComponent(regione.nome)}'">
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
        <div class="stat-value">${formatNumber(regione.estensione_km2)} km²</div>
        <div class="stat-detail">
          <span>${formatDecimal(percentualeEstensione)}% dell'Italia</span>
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
        <div class="stat-value">${formatNumber(regione.popolazione)}</div>
        <div class="stat-detail">
          <span>${formatDecimal(percentualePopolazione)}% dell'Italia</span>
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
        <div class="stat-value">${formatDecimal(densitaRegione)} ab/km²</div>
      </div>
    </div>
    
    <div class="region-provinces">
      <div class="provinces-header">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="provinces-icon">
          <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <h3 class="provinces-title">Province (${regione.province.length})</h3>
      </div>
      
      <div class="province-percentage">
        <span>${formatDecimal(percentualeProvince)}% del totale nazionale</span>
        <div class="percentage-bar">
          <div class="percentage-fill" style="width: ${percentualeProvince}%"></div>
        </div>
      </div>
      
      <div class="provinces-grid">
        ${regione.province
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
          .join("")}
      </div>
    </div>
  </div>
`;

// Update the UI with the generated HTML
const updateUI = (html) => (document.getElementById("output").innerHTML = html);

// Add a region to the history
const addToHistory = (region) => {
  if (extractedRegions.length > 0 && extractedRegions[0].nome === region.nome)
    return;
  extractedRegions.unshift(region);
  if (extractedRegions.length > MAX_HISTORY) extractedRegions.pop();
  updateHistoryDisplay();
};

// Update the history display
const updateHistoryDisplay = () => {
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
};

// Show error message
const showErrorMessage = (message) =>
  (document.getElementById("output").innerHTML = `
  <div class="error-message">
    <div class="error-icon">⚠️</div>
    <p>${message}</p>
  </div>
`);

// Start the app
document.addEventListener("DOMContentLoaded", initialize);
