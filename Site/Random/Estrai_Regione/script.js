// Global variables
let regionsData = []
const extractedRegions = []
const MAX_HISTORY = 8

// Initialize the application
document.addEventListener("DOMContentLoaded", initialize)

async function initialize() {
  try {
    // Load regions data
    regionsData = await loadRegioni()

    // Add event listeners
    document.getElementById("generateButton").addEventListener("click", handleGenerateButtonClick)

    // Calculate totals for display
    const totalEstensione = calculateTotalValues(regionsData, "estensione_km2")
    const totalPopolazione = calculateTotalValues(regionsData, "popolazione")
    const totalRegioni = regionsData.length
    const totalProvince = calculateTotalProvinces(regionsData)

    // Update total stats display
    document.getElementById("total-population").textContent = formatNumber(totalPopolazione) + " abitanti"
    document.getElementById("total-area").textContent = formatNumber(totalEstensione) + " km²"
    document.getElementById("total-regions").textContent = totalRegioni
    document.getElementById("total-provinces").textContent = totalProvince
  } catch (error) {
    console.error("Error initializing the application:", error)
    showErrorMessage("Si è verificato un errore durante l'inizializzazione dell'applicazione.")
  }
}

// Load regions data from JSON file
async function loadRegioni() {
  try {
    const response = await fetch("configurazioni.json")
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error loading regions:", error)
    showErrorMessage("Impossibile caricare i dati delle regioni.")
    return []
  }
}

// Calculate total values for a specific key across all regions
function calculateTotalValues(regioni, key) {
  return regioni.reduce((total, regione) => total + regione[key], 0)
}

// Calculate total number of provinces
function calculateTotalProvinces(regioni) {
  return regioni.reduce((total, regione) => total + regione.province.length, 0)
}

// Calculate percentage of a value relative to a total
function calculatePercent(value, total) {
  return ((value / total) * 100).toFixed(2)
}

// Calculate population density
function calculateDensity(population, area) {
  return (population / area).toFixed(2)
}

// Select a random region
function selectRandomRegione(regioni) {
  return regioni[Math.floor(Math.random() * regioni.length)]
}

// Format a number with thousands separators
function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

// Handle the generate button click
function handleGenerateButtonClick() {
  const totalEstensione = calculateTotalValues(regionsData, "estensione_km2")
  const totalPopolazione = calculateTotalValues(regionsData, "popolazione")
  const totalProvince = calculateTotalProvinces(regionsData)

  // Add pulse animation to the button
  const button = document.getElementById("generateButton")
  button.classList.add("pulse")
  setTimeout(() => {
    button.classList.remove("pulse")
  }, 500)

  // Create a shuffling effect
  let counter = 0
  const maxIterations = 10
  const intervalId = setInterval(() => {
    displayRandomRegione(regionsData, totalEstensione, totalPopolazione, totalProvince, true)
    counter++

    if (counter >= maxIterations) {
      clearInterval(intervalId)
      const finalRegion = displayRandomRegione(regionsData, totalEstensione, totalPopolazione, totalProvince, false)
      addToHistory(finalRegion)
    }
  }, 100)
}

// Display a random region
function displayRandomRegione(regioni, totalEstensione, totalPopolazione, totalProvince, isShuffling) {
  const regioneCasuale = selectRandomRegione(regioni)
  const percentualeEstensione = calculatePercent(regioneCasuale.estensione_km2, totalEstensione)
  const percentualePopolazione = calculatePercent(regioneCasuale.popolazione, totalPopolazione)
  const densitaRegione = calculateDensity(regioneCasuale.popolazione, regioneCasuale.estensione_km2)
  const percentualeProvince = calculatePercent(regioneCasuale.province.length, totalProvince)

  const regioneHTML = generateRegioneHTML(
    regioneCasuale,
    percentualeEstensione,
    percentualePopolazione,
    densitaRegione,
    percentualeProvince,
    isShuffling,
  )

  updateUI(regioneHTML)
  return regioneCasuale
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
  const { nome, immagine, capoluogo, estensione_km2, popolazione, province } = regione
  const numeroProvince = province.length

  // Generate provinces list
  const provinceHTML = province
    .sort()
    .map((provincia) => `<li class="province-item">${provincia}</li>`)
    .join("")

  // Apply animation class based on whether we're shuffling or showing the final result
  const animationClass = isShuffling ? "" : "fade-in"

  return `
    <div class="region-content ${animationClass}">
      <div class="region-header">
        <h2 class="region-name">${nome}</h2>
        <div class="region-capital">Capoluogo: ${capoluogo}</div>
      </div>
      
      <img src="Img/${immagine}" alt="${nome}" class="region-image" onerror="this.src='https://via.placeholder.com/300x200.png?text=${encodeURIComponent(nome)}'">
      
      <div class="region-stats">
        <div class="stat-item">
          <div class="stat-label">Superficie</div>
          <div class="stat-value">${formatNumber(estensione_km2)} km²</div>
          <div class="stat-detail">
            <span>${percentualeEstensione}% dell'Italia</span>
            <div class="percentage-bar">
              <div class="percentage-fill" style="width: ${percentualeEstensione}%"></div>
            </div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">Popolazione</div>
          <div class="stat-value">${formatNumber(popolazione)}</div>
          <div class="stat-detail">
            <span>${percentualePopolazione}% dell'Italia</span>
            <div class="percentage-bar">
              <div class="percentage-fill" style="width: ${percentualePopolazione}%"></div>
            </div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">Densità</div>
          <div class="stat-value">${densitaRegione} ab/km²</div>
        </div>
      </div>
      
      <div class="region-provinces">
        <h3 class="provinces-title">Province (${numeroProvince})</h3>
        <div class="province-percentage">
          <span>${percentualeProvince}% del totale nazionale</span>
          <div class="percentage-bar">
            <div class="percentage-fill" style="width: ${percentualeProvince}%"></div>
          </div>
        </div>
        <ul class="provinces-list">
          ${provinceHTML}
        </ul>
      </div>
    </div>
  `
}

// Update the UI with the generated HTML
function updateUI(html) {
  const outputElement = document.getElementById("output")
  outputElement.innerHTML = html
}

// Add a region to the history
function addToHistory(region) {
  // Don't add duplicates consecutively
  if (extractedRegions.length > 0 && extractedRegions[0].nome === region.nome) {
    return
  }

  // Add to beginning of array
  extractedRegions.unshift(region)

  // Limit history size
  if (extractedRegions.length > MAX_HISTORY) {
    extractedRegions.pop()
  }

  // Update history display
  updateHistoryDisplay()
}

// Update the history display
function updateHistoryDisplay() {
  const historyContainer = document.getElementById("history")
  historyContainer.innerHTML = ""

  if (extractedRegions.length === 0) {
    historyContainer.innerHTML = "<p class='no-history'>Nessuna regione estratta</p>"
    return
  }

  extractedRegions.forEach((region) => {
    const historyItem = document.createElement("div")
    historyItem.className = "history-item"

    historyItem.innerHTML = `
      <img src="Img/${region.immagine}" alt="${region.nome}" class="history-image" onerror="this.src='https://via.placeholder.com/150x100.png?text=${encodeURIComponent(region.nome)}'">
      <div class="history-name">${region.nome}</div>
    `

    // Add click event to display this region again
    historyItem.addEventListener("click", () => {
      const totalEstensione = calculateTotalValues(regionsData, "estensione_km2")
      const totalPopolazione = calculateTotalValues(regionsData, "popolazione")
      const totalProvince = calculateTotalProvinces(regionsData)

      const percentualeEstensione = calculatePercent(region.estensione_km2, totalEstensione)
      const percentualePopolazione = calculatePercent(region.popolazione, totalPopolazione)
      const densitaRegione = calculateDensity(region.popolazione, region.estensione_km2)
      const percentualeProvince = calculatePercent(region.province.length, totalProvince)

      const regioneHTML = generateRegioneHTML(
        region,
        percentualeEstensione,
        percentualePopolazione,
        densitaRegione,
        percentualeProvince,
        false,
      )

      updateUI(regioneHTML)
    })

    historyContainer.appendChild(historyItem)
  })
}

// Show error message
function showErrorMessage(message) {
  const outputElement = document.getElementById("output")
  outputElement.innerHTML = `
    <div class="error-message">
      <div class="error-icon">⚠️</div>
      <p>${message}</p>
    </div>
  `
}
