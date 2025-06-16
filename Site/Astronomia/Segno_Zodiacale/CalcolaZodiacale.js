// Elementi DOM
const output = document.getElementById("output");
const immagine = document.getElementById("immagine");
const signSymbol = document.getElementById("sign-symbol");
const definition = document.getElementById("definition");
const resultContainer = document.getElementById("result-container");
const calcolaBtn = document.getElementById("calcola-btn");
const monthInput = document.getElementById("month");
const year = new Date().getFullYear();

// Elementi per il popup informativo
const infoBtn = document.getElementById("info-btn");
const infoPopup = document.getElementById("info-popup");
const closePopup = document.querySelector(".close-popup");
const signsList = document.getElementById("signs-list");
const searchInput = document.getElementById("search-sign");
const searchBtn = document.getElementById("search-btn");
const resetSearchBtn = document.getElementById("reset-search-btn");
const resetSearchBtnInline = document.getElementById("reset-search-btn-inline");
const noResults = document.getElementById("no-results");

// Variabili per la ricerca
let allZodiacSigns = [];

async function loadZodiacSymbols() {
  try {
    const response = await fetch('JSON/symbols.json');
    const data = await response.json();
    return data.zodiacSymbols;
  } catch (error) {
    console.error('Errore nel caricamento del JSON:', error);
  }
}

// Utilizzo del metodo 1
loadZodiacSymbols().then(symbols => {
  console.log(symbols);
  console.log('Simbolo Ariete:', symbols.Ariete); // ♈
});

// Metodo 2: Se il JSON è embedded come stringa
const jsonString = `{
  "zodiacSymbols": {
    "Ariete": "♈",
    "Toro": "♉",
    "Gemelli": "♊",
    "Cancro": "♋",
    "Leone": "♌",
    "Vergine": "♍",
    "Bilancia": "♎",
    "Scorpione": "♏",
    "Sagittario": "♐",
    "Capricorno": "♑",
    "Acquario": "♒",
    "Pesci": "♓"
  }
}`;

const zodiacData = JSON.parse(jsonString);
const symbols = zodiacData.zodiacSymbols;

// Funzioni di utilità
const showDefaultImage = () => {
  immagine.innerHTML =
    '<img src="img/segni.jpg" alt="Segni zodiacali" class="default-image">';
  immagine.style.display = "block";
  resultContainer.classList.add("hidden");
};

const updateOutput = (text, isError = false) => {
  output.innerHTML = `<p class="${isError ? "error" : "colorSegno"
    } fade-in">${text}</p>`;
};

const showLoading = () => {
  calcolaBtn.innerHTML =
    '<span class="loading"></span><span>Calcolando...</span>';
  calcolaBtn.disabled = true;
};

const resetButton = () => {
  calcolaBtn.innerHTML =
    '<span class="btn-text">Calcola il mio segno</span><span class="btn-icon">✨</span>';
  calcolaBtn.disabled = false;
};

const monthDayToDate = (month, day) =>
  day > new Date(year, month + 1, 0).getDate()
    ? undefined
    : new Date(year, month, day);

// Crea sfondo stellato
function createStars() {
  const starsContainer = document.getElementById("stars-container");
  for (let i = 0; i < 100; i++) {
    const star = document.createElement("div");
    star.classList.add("star");
    star.style.width = `${Math.random() * 3 + 1}px`;
    star.style.height = star.style.width;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    starsContainer.appendChild(star);
  }
}

// Carica configurazione zodiacale
async function loadZodiacConfig() {
  try {
    const response = await fetch("JSON/configurazioni.json");
    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Errore nel caricamento della configurazione:", error);
    updateOutput("Errore nel caricamento dei dati. Riprova più tardi.", true);
    return [];
  }
}

// Analizza data da stringa
function parseDate(str) {
  const [month, day] = str.split("-").map(Number);
  return monthDayToDate(month - 1, day);
}

// Formatta data da MM-DD a DD/MM
function formatDate(dateStr) {
  const [month, day] = dateStr.split("-").map(Number);
  return `${day.toString().padStart(2, "0")}/${month
    .toString()
    .padStart(2, "0")}`;
}

// Calcola segno zodiacale
async function calcolaSegnoZodiacale() {
  const day = Number.parseInt(document.getElementById("day").value);
  const month = Number.parseInt(monthInput.value);

  // Nascondi risultati precedenti e mostra immagine predefinita
  showDefaultImage();

  // Valida input
  if (
    isNaN(day) ||
    isNaN(month) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12
  ) {
    updateOutput("Inserisci un giorno e un mese validi", true);
    return;
  }

  const selectedDate = monthDayToDate(month - 1, day)?.valueOf();

  if (!selectedDate) {
    updateOutput("Data non valida per il mese selezionato", true);
    return;
  }

  // Mostra stato di caricamento
  showLoading();
  updateOutput("Calcolando il tuo segno...");

  try {
    const config = await loadZodiacConfig();

    if (!config || config.length === 0) {
      throw new Error("Configurazione non disponibile");
    }

    const segno = config.find(({ inizio, fine }) => {
      const inizioDate = parseDate(inizio)?.valueOf();
      const fineDate = parseDate(fine)?.valueOf();
      return selectedDate >= inizioDate && selectedDate <= fineDate;
    });

    if (!segno) {
      updateOutput("Data non valida", true);
      resetButton();
      return;
    }

    // Aggiorna UI con informazioni sul segno zodiacale
    setTimeout(() => {
      updateOutput(`Il tuo segno zodiacale è ${segno.segno}`);

      // Nascondi l'immagine predefinita
      immagine.style.display = "none";

      // Mostra il simbolo del segno
      signSymbol.textContent = symbols[segno.segno] || "?";

      const caratteristicheFormatte = segno.Caratteristiche.split(",")
        .map((c) => c.trim())
        .join("<br>");

      definition.innerHTML = `
        <div class="fade-in">
          <p><span class="viola">Elemento:</span> ${segno.Elemento}</p>
          <p><span class="viola">Caratteristiche:</span></p>
          <p>${caratteristicheFormatte}</p>
        </div>
      `;

      // Mostra il contenitore dei risultati
      resultContainer.classList.remove("hidden");

      resetButton();
    }, 1500); // Piccolo ritardo per effetto animazione
  } catch (error) {
    console.error("Errore:", error);
    updateOutput("Si è verificato un errore. Riprova più tardi.", true);
    resetButton();
  }
}

// Funzione per cercare segni zodiacali
function searchZodiacSigns(query) {
  if (!query.trim()) {
    return allZodiacSigns; // Restituisci tutti i segni se la query è vuota
  }

  query = query.trim().toLowerCase();

  return allZodiacSigns.filter(
    (sign) =>
      sign.segno.toLowerCase().includes(query) ||
      sign.Elemento.toLowerCase().includes(query) ||
      sign.Caratteristiche.toLowerCase().includes(query)
  );
}

// Mostra messaggio quando nessun segno è trovato
function showNoResults(show) {
  if (show) {
    noResults.classList.remove("hidden");
    signsList.classList.add("hidden");
  } else {
    noResults.classList.add("hidden");
    signsList.classList.remove("hidden");
  }
}

// Popola il popup con le informazioni sui segni zodiacali
async function populateSignsInfo(filteredSigns = null) {
  try {
    // Se non ci sono segni filtrati, carica tutti i segni
    if (!filteredSigns) {
      const config = await loadZodiacConfig();

      if (!config || config.length === 0) {
        throw new Error("Configurazione non disponibile");
      }

      // Raggruppa i segni per nome (per gestire Capricorno che appare due volte)
      const signsMap = new Map();

      config.forEach((sign) => {
        if (!signsMap.has(sign.segno)) {
          signsMap.set(sign.segno, {
            segno: sign.segno,
            periodi: [],
            Elemento: sign.Elemento,
            Caratteristiche: sign.Caratteristiche,
          });
        }

        const signData = signsMap.get(sign.segno);
        signData.periodi.push({
          inizio: sign.inizio,
          fine: sign.fine,
        });
      });

      // Converti la mappa in array e salva tutti i segni
      allZodiacSigns = Array.from(signsMap.values());
      filteredSigns = allZodiacSigns;
    }

    // Svuota la lista
    signsList.innerHTML = "";

    // Controlla se ci sono risultati
    if (filteredSigns.length === 0) {
      showNoResults(true);
      return;
    }

    showNoResults(false);

    // Popola la lista con i segni
    filteredSigns.forEach((sign) => {
      // Formatta i periodi
      const periodi = sign.periodi
        .map(
          (periodo) =>
            `${formatDate(periodo.inizio)} - ${formatDate(periodo.fine)}`
        )
        .join(", ");

      // Formatta le caratteristiche
      const caratteristiche = sign.Caratteristiche.split(",")
        .map((c) => c.trim())
        .map((c) => `<li><span class="bullet">•</span> ${c}</li>`)
        .join("");

      const signItem = document.createElement("div");
      signItem.className = "sign-item";
      signItem.innerHTML = `
        <div class="sign-header">
          <div class="sign-icon">${zodiacSymbols[sign.segno] || "?"}</div>
          <div class="sign-name">${sign.segno}</div>
        </div>
        <div class="sign-info">
          <div class="sign-dates"><strong>Periodo:</strong> ${periodi}</div>
          <div class="sign-element"><strong>Elemento:</strong> ${sign.Elemento
        }</div>
          <div class="sign-characteristics">
            <strong>Caratteristiche:</strong>
            <ul class="characteristics-list">
              ${caratteristiche}
            </ul>
          </div>
        </div>
      `;

      signsList.appendChild(signItem);
    });
  } catch (error) {
    console.error(
      "Errore nel caricamento delle informazioni sui segni:",
      error
    );
    signsList.innerHTML =
      "<p class='error'>Errore nel caricamento dei dati.</p>";
  }
}

// Gestione eventi per il popup
function setupPopup() {
  // Apri popup quando si clicca sul pulsante info
  infoBtn.addEventListener("click", () => {
    infoPopup.style.display = "flex";
    populateSignsInfo();
  });

  // Chiudi popup quando si clicca sulla X
  closePopup.addEventListener("click", () => {
    infoPopup.style.display = "none";
  });

  // Chiudi popup quando si clicca fuori dal contenuto
  infoPopup.addEventListener("click", (e) => {
    if (e.target === infoPopup) {
      infoPopup.style.display = "none";
    }
  });

  // Chiudi popup con tasto Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && infoPopup.style.display === "flex") {
      infoPopup.style.display = "none";
    }
  });

  // Gestione ricerca
  searchBtn.addEventListener("click", () => {
    const query = searchInput.value;
    const filteredSigns = searchZodiacSigns(query);
    populateSignsInfo(filteredSigns);
  });

  // Permetti la ricerca premendo Invio
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value;
      const filteredSigns = searchZodiacSigns(query);
      populateSignsInfo(filteredSigns);
    }
  });

  // Reset della ricerca
  resetSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    populateSignsInfo();
  });

  // Reset della ricerca (pulsante inline)
  resetSearchBtnInline.addEventListener("click", () => {
    searchInput.value = "";
    populateSignsInfo();
  });
}

// Inizializza
document.addEventListener("DOMContentLoaded", () => {
  createStars();
  showDefaultImage();
  setupPopup();

  // Gestione selezione mesi
  const monthItems = document.querySelectorAll(".month-item");

  monthItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Rimuovi la selezione precedente
      monthItems.forEach((m) => m.classList.remove("selected"));

      // Seleziona il mese corrente
      item.classList.add("selected");

      // Aggiorna il valore dell'input nascosto
      monthInput.value = item.getAttribute("data-month");
    });
  });
});
