// Elementi DOM
const output = document.getElementById("output");
const immagine = document.getElementById("immagine");
const signSymbol = document.getElementById("sign-symbol");
const definition = document.getElementById("definition");
const resultContainer = document.getElementById("result-container");
const calcolaBtn = document.getElementById("calcola-btn");
const monthInput = document.getElementById("month");
const year = new Date().getFullYear();

// Mappa dei simboli zodiacali
const zodiacSymbols = {
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

// Funzioni di utilità
const showDefaultImage = () => {
  immagine.innerHTML =
    '<img src="img/segni.jpg" alt="Segni zodiacali" class="default-image">';
  immagine.style.display = "block";
  resultContainer.classList.add("hidden");
};

const updateOutput = (text, isError = false) => {
  output.innerHTML = `<p class="${
    isError ? "error" : "colorSegno"
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
    const response = await fetch("configurazioni.json");
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

// Calcola segno zodiacale
async function calcolaSegnoZodiacale() {
  const day = parseInt(document.getElementById("day").value);
  const month = parseInt(monthInput.value);

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
      signSymbol.textContent = zodiacSymbols[segno.segno] || "?";

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

// Inizializza
document.addEventListener("DOMContentLoaded", () => {
  createStars();
  showDefaultImage();

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
