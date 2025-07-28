// Variabili globali per i dati
let zodiacConfig = [];
let zodiacSymbols = {};
let selectedMonth = null;
let allZodiacSigns = [];
let isCalculating = false;
let dataLoaded = false;

// Icone elementi
const elementIcons = {
  Fuoco: "🔥",
  Terra: "🌍",
  Aria: "💨",
  Acqua: "💧",
};

// Classi CSS per elementi
const elementClasses = {
  Fuoco: "fire",
  Terra: "earth",
  Aria: "air",
  Acqua: "water",
};

// Elementi DOM
const initialLoading = document.getElementById("initial-loading");
const mainContainer = document.getElementById("main-container");
const dayInput = document.getElementById("day-input");
const selectedMonthInput = document.getElementById("selected-month");
const calculateBtn = document.getElementById("calculate-btn");
const resetBtn = document.getElementById("reset-btn");
const statusMessage = document.getElementById("status-message");
const placeholderContent = document.getElementById("placeholder-content");
const resultContent = document.getElementById("result-content");
const zodiacSymbol = document.getElementById("zodiac-symbol");
const zodiacName = document.getElementById("zodiac-name");
const elementBadge = document.getElementById("element-badge");
const characteristicsTags = document.getElementById("characteristics-tags");
const infoBtn = document.getElementById("info-btn");
const infoModal = document.getElementById("info-modal");
const modalClose = document.getElementById("modal-close");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const allSigns = document.getElementById("all-signs");
const noResults = document.getElementById("no-results");
const clearSearch = document.getElementById("clear-search");
const loadingOverlay = document.getElementById("loading-overlay");
const errorModal = document.getElementById("error-modal");
const errorModalClose = document.getElementById("error-modal-close");
const errorMessage = document.getElementById("error-message");
const retryBtn = document.getElementById("retry-btn");
const continueOfflineBtn = document.getElementById("continue-offline-btn");

// Inizializzazione
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

async function initializeApp() {
  createStars();
  setupEventListeners();

  try {
    await loadZodiacData();
    prepareZodiacData();
    populateAllSigns();
    showMainApp();
  } catch (error) {
    console.error("Errore nell'inizializzazione:", error);
    showErrorModal(
      "Errore nel caricamento dei dati zodiacali. Verifica la connessione internet.",
    );
  }
}

// Carica dati zodiacali dai file JSON
async function loadZodiacData() {
  try {
    // Carica configurazioni zodiacali
    const configResponse = await fetch("JSON/configurazioni.json");
    if (!configResponse.ok) {
      throw new Error(`Errore HTTP: ${configResponse.status}`);
    }
    zodiacConfig = await configResponse.json();

    // Carica simboli zodiacali
    const symbolsResponse = await fetch("JSON/symbols.json");
    if (!symbolsResponse.ok) {
      throw new Error(`Errore HTTP: ${symbolsResponse.status}`);
    }
    const symbolsData = await symbolsResponse.json();
    zodiacSymbols = symbolsData.zodiacSymbols;

    dataLoaded = true;
    console.log("Dati zodiacali caricati con successo");
  } catch (error) {
    console.error("Errore nel caricamento dei dati:", error);

    // Fallback con dati di base
    zodiacConfig = getFallbackZodiacData();
    zodiacSymbols = getFallbackSymbols();

    throw error;
  }
}

// Dati di fallback in caso di errore di caricamento
function getFallbackZodiacData() {
  return [
    {
      segno: "Ariete",
      inizio: "03-21",
      fine: "04-19",
      Elemento: "Fuoco",
      Caratteristiche: "Coraggioso, impulsivo, dinamico, leader, energico",
    },
    {
      segno: "Toro",
      inizio: "04-20",
      fine: "05-20",
      Elemento: "Terra",
      Caratteristiche: "Sensuale, stabile, pratico, leale, testardo",
    },
    {
      segno: "Gemelli",
      inizio: "05-21",
      fine: "06-20",
      Elemento: "Aria",
      Caratteristiche:
        "Curioso, comunicativo, adattabile, intelligente, versatile",
    },
    {
      segno: "Cancro",
      inizio: "06-21",
      fine: "07-22",
      Elemento: "Acqua",
      Caratteristiche: "Empatico, protettivo, emotivo, intuitivo, familiare",
    },
    {
      segno: "Leone",
      inizio: "07-23",
      fine: "08-23",
      Elemento: "Fuoco",
      Caratteristiche: "Carismatico, creativo, leale, generoso, teatrale",
    },
    {
      segno: "Vergine",
      inizio: "08-24",
      fine: "09-22",
      Elemento: "Terra",
      Caratteristiche:
        "Analitico, preciso, riservato, perfezionista, servizievole",
    },
    {
      segno: "Bilancia",
      inizio: "09-23",
      fine: "10-22",
      Elemento: "Aria",
      Caratteristiche: "Socievole, diplomatico, armonioso, giusto, elegante",
    },
    {
      segno: "Scorpione",
      inizio: "10-23",
      fine: "11-21",
      Elemento: "Acqua",
      Caratteristiche:
        "Intenso, passionale, misterioso, determinato, magnetico",
    },
    {
      segno: "Sagittario",
      inizio: "11-22",
      fine: "12-21",
      Elemento: "Fuoco",
      Caratteristiche:
        "Avventuroso, ottimista, filosofico, libero, esploratore",
    },
    {
      segno: "Capricorno",
      inizio: "12-22",
      fine: "01-19",
      Elemento: "Terra",
      Caratteristiche:
        "Ambizioso, responsabile, pragmatico, determinato, paziente",
    },
    {
      segno: "Acquario",
      inizio: "01-20",
      fine: "02-19",
      Elemento: "Aria",
      Caratteristiche:
        "Innovativo, indipendente, visionario, altruista, originale",
    },
    {
      segno: "Pesci",
      inizio: "02-20",
      fine: "03-20",
      Elemento: "Acqua",
      Caratteristiche:
        "Sensibile, intuitivo, spirituale, compassionevole, artistico",
    },
  ];
}

function getFallbackSymbols() {
  return {
    Ariete: "♈",
    Toro: "♉",
    Gemelli: "♊",
    Cancro: "♋",
    Leone: "♌",
    Vergine: "♍",
    Bilancia: "♎",
    Scorpione: "♏",
    Sagittario: "♐",
    Capricorno: "♑",
    Acquario: "♒",
    Pesci: "♓",
  };
}

// Mostra app principale
function showMainApp() {
  initialLoading.style.display = "none";
  mainContainer.style.display = "flex";
}

// Mostra modal di errore
function showErrorModal(message) {
  errorMessage.textContent = message;
  errorModal.classList.add("show");
}

// Nascondi modal di errore
function hideErrorModal() {
  errorModal.classList.remove("show");
}

// Crea sfondo stellato
function createStars() {
  const starsContainer = document.getElementById("stars-container");
  const starCount = window.innerWidth < 768 ? 30 : 60;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement("div");
    star.classList.add("star");

    const size = Math.random() * 3 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 3}s`;
    star.style.animationDuration = `${2 + Math.random() * 3}s`;

    starsContainer.appendChild(star);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Selezione mesi
  document.querySelectorAll(".month-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      selectMonth(Number.parseInt(btn.dataset.month)),
    );
  });

  // Pulsanti principali
  calculateBtn.addEventListener("click", calculateZodiacSign);
  resetBtn.addEventListener("click", resetCalculator);

  // Input giorno
  dayInput.addEventListener("input", validateInput);
  dayInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !isCalculating) {
      calculateZodiacSign();
    }
  });

  // Modal
  infoBtn.addEventListener("click", openModal);
  modalClose.addEventListener("click", closeModal);
  infoModal.addEventListener("click", (e) => {
    if (e.target === infoModal) closeModal();
  });

  // Error modal
  errorModalClose.addEventListener("click", hideErrorModal);
  retryBtn.addEventListener("click", async () => {
    hideErrorModal();
    initialLoading.style.display = "flex";
    mainContainer.style.display = "none";
    try {
      await loadZodiacData();
      prepareZodiacData();
      populateAllSigns();
      showMainApp();
    } catch (error) {
      showErrorModal("Errore nel caricamento dei dati. Riprova più tardi.");
    }
  });

  continueOfflineBtn.addEventListener("click", () => {
    hideErrorModal();
    showMainApp();
  });

  // Tabs
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Ricerca
  searchInput.addEventListener("input", debounce(performSearch, 300));
  clearSearch.addEventListener("click", clearSearchResults);

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (infoModal.classList.contains("show")) {
        closeModal();
      }
      if (errorModal.classList.contains("show")) {
        hideErrorModal();
      }
    }
  });
}

// Seleziona mese
function selectMonth(month) {
  selectedMonth = month;
  selectedMonthInput.value = month;

  document.querySelectorAll(".month-btn").forEach((btn) => {
    btn.classList.remove("selected");
  });

  document.querySelector(`[data-month="${month}"]`).classList.add("selected");
  validateInput();
}

// Valida input
function validateInput() {
  const day = Number.parseInt(dayInput.value);
  const isValidDay = day >= 1 && day <= 31;
  const hasMonth = selectedMonth !== null;

  calculateBtn.disabled =
    !isValidDay || !hasMonth || isCalculating || !dataLoaded;

  if (
    statusMessage.textContent &&
    !statusMessage.classList.contains("loading")
  ) {
    statusMessage.textContent = "";
    statusMessage.className = "status-message";
  }
}

// Calcola segno zodiacale
async function calculateZodiacSign() {
  const day = Number.parseInt(dayInput.value);

  if (!day || !selectedMonth || isCalculating || !dataLoaded) return;

  if (day < 1 || day > 31) {
    showStatusMessage("Inserisci un giorno valido (1-31)", "error");
    return;
  }

  // Verifica validità del giorno per il mese selezionato
  const year = new Date().getFullYear();
  const daysInMonth = new Date(year, selectedMonth, 0).getDate();

  if (day > daysInMonth) {
    showStatusMessage(
      `Il mese selezionato ha solo ${daysInMonth} giorni`,
      "error",
    );
    return;
  }

  isCalculating = true;
  calculateBtn.disabled = true;

  // Mostra loading
  showLoadingOverlay(true);
  showStatusMessage("Calcolando il tuo segno zodiacale...", "loading");

  // Simula calcolo con delay per UX
  await new Promise((resolve) => setTimeout(resolve, 1500));

  try {
    const selectedDate = new Date(year, selectedMonth - 1, day);
    const sign = findZodiacSign(selectedDate);

    if (sign) {
      showResult(sign);
      showStatusMessage(`Il tuo segno zodiacale è ${sign.segno}!`, "success");
    } else {
      showStatusMessage("Errore nel calcolo del segno zodiacale", "error");
    }
  } catch (error) {
    console.error("Errore nel calcolo:", error);
    showStatusMessage("Si è verificato un errore. Riprova.", "error");
  } finally {
    isCalculating = false;
    calculateBtn.disabled = false;
    showLoadingOverlay(false);
  }
}

// Trova segno zodiacale
function findZodiacSign(date) {
  const year = date.getFullYear();

  return zodiacConfig.find((sign) => {
    const [startMonth, startDay] = sign.inizio.split("-").map(Number);
    const [endMonth, endDay] = sign.fine.split("-").map(Number);

    let startDate = new Date(year, startMonth - 1, startDay);
    let endDate = new Date(year, endMonth - 1, endDay);

    // Gestione Capricorno che attraversa l'anno
    if (startMonth > endMonth) {
      if (date.getMonth() + 1 >= startMonth) {
        endDate = new Date(year + 1, endMonth - 1, endDay);
      } else {
        startDate = new Date(year - 1, startMonth - 1, startDay);
      }
    }

    return date >= startDate && date <= endDate;
  });
}

// Mostra risultato
function showResult(sign) {
  // Nascondi placeholder e mostra risultato
  placeholderContent.style.display = "none";
  resultContent.style.display = "block";

  // Popola dati
  zodiacSymbol.textContent = zodiacSymbols[sign.segno] || "⭐";
  zodiacName.textContent = sign.segno;

  // Badge elemento
  elementBadge.textContent = `${elementIcons[sign.Elemento]} ${sign.Elemento}`;
  elementBadge.className = `element-badge ${elementClasses[sign.Elemento]}`;

  // Caratteristiche
  const characteristics = sign.Caratteristiche.split(", ");
  characteristicsTags.innerHTML = characteristics
    .map((char) => `<span class="characteristic-tag">${char}</span>`)
    .join("");

  // Mostra pulsante reset
  resetBtn.style.display = "flex";
}

// Reset calcolatore
function resetCalculator() {
  dayInput.value = "";
  selectedMonth = null;
  selectedMonthInput.value = "";

  document.querySelectorAll(".month-btn").forEach((btn) => {
    btn.classList.remove("selected");
  });

  placeholderContent.style.display = "flex";
  resultContent.style.display = "none";
  resetBtn.style.display = "none";

  statusMessage.textContent = "";
  statusMessage.className = "status-message";

  validateInput();
  dayInput.focus();
}

// Mostra messaggio di stato
function showStatusMessage(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
}

// Mostra/nascondi loading overlay
function showLoadingOverlay(show) {
  loadingOverlay.style.display = show ? "flex" : "none";
}

// Prepara dati zodiacali per ricerca
function prepareZodiacData() {
  const signsMap = new Map();

  zodiacConfig.forEach((sign) => {
    if (!signsMap.has(sign.segno)) {
      signsMap.set(sign.segno, {
        ...sign,
        periodi: [],
      });
    }

    const signData = signsMap.get(sign.segno);
    signData.periodi.push({
      inizio: sign.inizio,
      fine: sign.fine,
    });
  });

  allZodiacSigns = Array.from(signsMap.values());
}

// Apri modal
function openModal() {
  infoModal.classList.add("show");
  document.body.style.overflow = "hidden";
  searchInput.focus();
}

// Chiudi modal
function closeModal() {
  infoModal.classList.remove("show");
  document.body.style.overflow = "";
}

// Cambia tab
function switchTab(tabName) {
  // Aggiorna pulsanti tab
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

  // Aggiorna contenuto tab
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });
  document.getElementById(`${tabName}-tab`).classList.add("active");

  if (tabName === "search") {
    searchInput.focus();
  }
}

// Ricerca segni
function performSearch() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    searchResults.innerHTML = "";
    noResults.style.display = "none";
    return;
  }

  const filteredSigns = allZodiacSigns.filter(
    (sign) =>
      sign.segno.toLowerCase().includes(query) ||
      sign.Elemento.toLowerCase().includes(query) ||
      sign.Caratteristiche.toLowerCase().includes(query),
  );

  if (filteredSigns.length > 0) {
    displaySigns(filteredSigns, searchResults);
    noResults.style.display = "none";
  } else {
    searchResults.innerHTML = "";
    noResults.style.display = "block";
  }
}

// Pulisci ricerca
function clearSearchResults() {
  searchInput.value = "";
  searchResults.innerHTML = "";
  noResults.style.display = "none";
  searchInput.focus();
}

// Popola tutti i segni
function populateAllSigns() {
  if (allZodiacSigns.length > 0) {
    displaySigns(allZodiacSigns, allSigns);
  }
}

// Mostra segni
function displaySigns(signs, container) {
  container.innerHTML = signs.map((sign) => createSignCard(sign)).join("");
}

// Crea card segno
function createSignCard(sign) {
  const periodi = sign.periodi
    ? sign.periodi
        .map((p) => `${formatDate(p.inizio)} - ${formatDate(p.fine)}`)
        .join(", ")
    : `${formatDate(sign.inizio)} - ${formatDate(sign.fine)}`;

  const characteristics = sign.Caratteristiche.split(", ");

  return `
    <div class="sign-card">
      <div class="sign-card-header">
        <div class="sign-card-symbol">${zodiacSymbols[sign.segno] || "⭐"}</div>
        <div class="sign-card-info">
          <h3>${sign.segno}</h3>
          <div class="sign-card-element ${elementClasses[sign.Elemento]}">
            ${elementIcons[sign.Elemento]} ${sign.Elemento}
          </div>
        </div>
      </div>
      <div class="sign-card-details">
        <strong>Periodo:</strong> ${periodi}
      </div>
      <div class="sign-card-characteristics">
        ${characteristics.map((char) => `<span class="sign-card-characteristic">${char}</span>`).join("")}
      </div>
    </div>
  `;
}

// Formatta data
function formatDate(dateStr) {
  const [month, day] = dateStr.split("-").map(Number);
  return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}`;
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Gestione responsive per le stelle
window.addEventListener(
  "resize",
  debounce(() => {
    const starsContainer = document.getElementById("stars-container");
    const currentStars = starsContainer.children.length;
    const targetStars = window.innerWidth < 768 ? 30 : 60;

    if (currentStars !== targetStars) {
      starsContainer.innerHTML = "";
      createStars();
    }
  }, 250),
);
