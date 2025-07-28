// Variabile globale per memorizzare i dati delle valute
let currencies = [];

// Funzione per caricare i dati delle valute dal file JSON
async function loadCurrencies() {
  try {
    const response = await fetch("currencies.json");
    if (!response.ok) {
      throw new Error("Impossibile caricare i dati delle valute");
    }
    const data = await response.json();
    currencies = data.currencies;

    // Inizializza i selettori semplici dopo aver caricato i dati
    initializeSimpleSelectors();
  } catch (error) {
    console.error("Errore nel caricamento delle valute:", error);
    // Fallback: usa un array di valute predefinito
    initializeSimpleSelectors();
  }
}

// Inizializza le <select> semplici
function initializeSimpleSelectors() {
  const fromSelect = document.getElementById("from-select");
  const toSelect = document.getElementById("to-select");
  if (!fromSelect || !toSelect) return;
  fromSelect.innerHTML = "";
  toSelect.innerHTML = "";
  currencies.forEach((currency) => {
    const optFrom = document.createElement("option");
    optFrom.value = currency.code;
    optFrom.textContent = `${currency.code} - ${currency.name}`;
    fromSelect.appendChild(optFrom);
    const optTo = document.createElement("option");
    optTo.value = currency.code;
    optTo.textContent = `${currency.code} - ${currency.name}`;
    toSelect.appendChild(optTo);
  });
  fromSelect.value = "EUR";
  toSelect.value = "USD";
}

// Funzione per aggiornare le opzioni selezionate
function updateSelectedOptions(selectId, currencyCode) {
  const dropdown = document.getElementById(`${selectId}-dropdown`);
  const options = dropdown.querySelectorAll(".select-option");

  options.forEach((option) => {
    if (option.dataset.code === currencyCode) {
      option.classList.add("selected");
    } else {
      option.classList.remove("selected");
    }
  });
}

// Funzione per convertire le valute
function convert() {
  const amountInput = document.getElementById("amount");
  const fromSelect = document.getElementById("from-select");
  const toSelect = document.getElementById("to-select");
  if (!amountInput || !fromSelect || !toSelect) return;
  const amount = parseFloat(amountInput.value);
  const from = fromSelect.value;
  const to = toSelect.value;
  if (isNaN(amount) || amount <= 0) {
    showError("Inserisci un importo valido");
    return;
  }

  // Mostra lo stato di caricamento
  const button = document.getElementById("convert-button");
  button.classList.add("loading");

  // Nascondi il risultato precedente durante il caricamento
  document.getElementById("result-container").classList.add("hidden");

  fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore nella risposta del server");
      }
      return response.json();
    })
    .then((data) => {
      // Rimuovi lo stato di caricamento
      button.classList.remove("loading");

      const rate = data.rates[to];
      const convertedAmount = amount * rate;

      // Formatta i numeri con separatore delle migliaia
      const formattedAmount = formatNumber(amount, from);
      const formattedConvertedAmount = formatNumber(convertedAmount, to);

      // Mostra il risultato
      document.getElementById("result").innerHTML =
        `${formattedAmount} = ${formattedConvertedAmount}`;

      // Mostra il tasso di cambio
      const rateFormatted = rate.toFixed(4);
      document.getElementById("rate-info").textContent =
        `1 ${from} = ${rateFormatted} ${to}`;

      // Mostra il container del risultato con animazione
      const resultContainer = document.getElementById("result-container");
      resultContainer.classList.remove("hidden");
      resultContainer.classList.add("fade-in");

      // Vibrazione di feedback su dispositivi mobili
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    })
    .catch((error) => {
      console.error(error);
      button.classList.remove("loading");
      showError(
        "Si è verificato un errore nella conversione. Riprova più tardi.",
      );
    });
}

// Funzione per formattare i numeri con separatore delle migliaia
function formatNumber(number, currency) {
  // Configura le opzioni di formattazione in base alla valuta
  const options = {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  // Gestisci valute speciali come JPY che non usano decimali
  if (
    currency === "JPY" ||
    currency === "KRW" ||
    currency === "IDR" ||
    currency === "VND"
  ) {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  }

  return new Intl.NumberFormat("it-IT", options).format(number);
}

// Funzione per mostrare errori
function showError(message) {
  const resultContainer = document.getElementById("result-container");
  resultContainer.classList.remove("hidden");
  document.getElementById("result").innerHTML =
    `<span style="color: #e63946;">${message}</span>`;
  document.getElementById("rate-info").textContent = "";
}

// Gestione del tema (chiaro/scuro)
function initTheme() {
  // Controlla se esiste una preferenza salvata
  const savedTheme = localStorage.getItem("theme");

  // Controlla se il sistema preferisce il tema scuro
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Imposta il tema in base alla preferenza salvata o alla preferenza di sistema
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  } else if (prefersDarkScheme.matches) {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  // Aggiungi event listener per il pulsante di cambio tema
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", () => {
    // Ottieni il tema corrente
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";

    // Cambia il tema
    const newTheme = currentTheme === "light" ? "dark" : "light";

    // Applica il nuovo tema
    document.documentElement.setAttribute("data-theme", newTheme);

    // Salva la preferenza
    localStorage.setItem("theme", newTheme);

    // Animazione del pulsante
    themeToggle.classList.add("theme-toggle-active");
    setTimeout(() => {
      themeToggle.classList.remove("theme-toggle-active");
    }, 300);
  });

  // Aggiungi listener per cambiamenti nella preferenza di sistema
  prefersDarkScheme.addEventListener("change", (e) => {
    // Solo se l'utente non ha già impostato una preferenza
    if (!localStorage.getItem("theme")) {
      const newTheme = e.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  });
}

// Aggiungi event listener per convertire quando si preme Invio
function setupEventListeners() {
  document.getElementById("amount").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      convert();
    }
  });

  // Migliora l'esperienza mobile
  setupMobileExperience();
}

// Funzione per migliorare l'esperienza su dispositivi mobili
function setupMobileExperience() {
  // Rileva se è un dispositivo mobile
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  if (isMobile) {
    // Aggiungi classe per stili specifici per mobile
    document.body.classList.add("mobile-device");

    // Migliora l'interazione con i dropdown su mobile
    const selectInputs = document.querySelectorAll(".select-input");
    selectInputs.forEach((input) => {
      input.addEventListener("touchend", function (e) {
        // Previeni il comportamento predefinito che può causare problemi su alcuni browser mobile
        e.preventDefault();
        this.focus();
      });
    });

    // Migliora la selezione delle opzioni su mobile
    document.addEventListener(
      "touchstart",
      function (e) {
        // Se l'utente tocca un'opzione, assicurati che venga selezionata
        if (
          target.classList.contains("select-option") ||
          target.closest(".select-option")
        ) {
          const option = target.classList.contains("select-option")
            ? target
            : target.closest(".select-option");
          if (option) {
            const selectId = option
              .closest(".select-dropdown")
              ?.id.split("-")[0];
            const currencyCode = option.getAttribute("data-code");

            if (selectId && currencyCode) {
              const input = document.getElementById(`${selectId}-select`);
              const hiddenInput = document.getElementById(`${selectId}-value`);
              const dropdown = document.getElementById(`${selectId}-dropdown`);

              if (input && hiddenInput && dropdown) {
                e.preventDefault();
                selectCurrency(
                  selectId,
                  currencyCode,
                  input,
                  hiddenInput,
                  dropdown,
                );
              }
            }
          }
        }
      },
      { passive: false },
    );
  }
}

// Imposta la data di ultimo aggiornamento
function setLastUpdateDate() {
  document.getElementById("last-update").textContent =
    new Date().toLocaleDateString("it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
}

// Aggiungi stili CSS per migliorare l'esperienza mobile
function addMobileStyles() {
  const style = document.createElement("style");
  style.textContent = `
    /* Stili migliorati per dispositivi mobili */
    .mobile-device .select-option {
      padding: 15px;  /* Aree di tocco più grandi */
    }
    
    .mobile-device .select-dropdown {
      max-height: 300px;  /* Dropdown più grande su mobile */
    }
    
    /* Feedback visivo per la selezione */
    .selection-made {
      background-color: var(--selected-bg) !important;
      transition: background-color 0.3s ease;
    }
    
    /* Animazione per il pulsante di scambio */
    .swap-button.active svg {
      transform: rotate(180deg);
      transition: transform 0.3s ease;
    }
    
    /* Migliora la visibilità del focus */
    .select-option:focus {
      outline: 2px solid var(--primary-color);
      background-color: var(--hover-bg);
    }
    
    /* Previeni lo zoom su input nei dispositivi iOS */
    @media screen and (-webkit-min-device-pixel-ratio: 0) {
      select, textarea, input[type="text"], input[type="number"] {
        font-size: 16px;
      }
    }
  `;
  document.head.appendChild(style);
}

// Inizializza l'applicazione quando il DOM è caricato
document.addEventListener("DOMContentLoaded", () => {
  // Aggiungi stili migliorati per mobile
  addMobileStyles();

  // Inizializza il tema
  initTheme();

  // Imposta la data di ultimo aggiornamento
  setLastUpdateDate();

  // Configura gli event listener
  setupEventListeners();

  // Carica i dati delle valute e inizializza i selettori
  loadCurrencies();
});
