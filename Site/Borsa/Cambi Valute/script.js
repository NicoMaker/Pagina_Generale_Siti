// Gestione del tema (chiaro/scuro)
document.addEventListener("DOMContentLoaded", function () {
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
  themeToggle.addEventListener("click", function () {
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
  prefersDarkScheme.addEventListener("change", function (e) {
    // Solo se l'utente non ha già impostato una preferenza
    if (!localStorage.getItem("theme")) {
      const newTheme = e.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  });
});

// Imposta la data di ultimo aggiornamento
document.getElementById("last-update").textContent =
  new Date().toLocaleDateString("it-IT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Funzione per scambiare le valute
function swapCurrencies() {
  const fromSelect = document.getElementById("from");
  const toSelect = document.getElementById("to");

  const tempValue = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = tempValue;

  // Se c'è già un risultato, aggiorna la conversione
  if (
    !document.getElementById("result-container").classList.contains("hidden")
  ) {
    convert();
  }

  // Animazione del pulsante di scambio
  const swapButton = document.querySelector(".swap-button");
  swapButton.classList.add("active");
  setTimeout(() => {
    swapButton.classList.remove("active");
  }, 300);
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

// Funzione per convertire le valute
function convert() {
  const amount = document.getElementById("amount").value;
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;

  // Validazione dell'input
  if (!amount || isNaN(amount) || amount <= 0) {
    showError("Inserisci un importo valido maggiore di zero");
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
      document.getElementById(
        "result"
      ).innerHTML = `${formattedAmount} = ${formattedConvertedAmount}`;

      // Mostra il tasso di cambio
      const rateFormatted = rate.toFixed(4);
      document.getElementById(
        "rate-info"
      ).textContent = `1 ${from} = ${rateFormatted} ${to}`;

      // Mostra il container del risultato con animazione
      const resultContainer = document.getElementById("result-container");
      resultContainer.classList.remove("hidden");
      resultContainer.classList.add("fade-in");
    })
    .catch((error) => {
      console.error(error);
      button.classList.remove("loading");
      showError(
        "Si è verificato un errore nella conversione. Riprova più tardi."
      );
    });
}

// Funzione per mostrare errori
function showError(message) {
  const resultContainer = document.getElementById("result-container");
  resultContainer.classList.remove("hidden");
  document.getElementById(
    "result"
  ).innerHTML = `<span style="color: #e63946;">${message}</span>`;
  document.getElementById("rate-info").textContent = "";
}

// Aggiungi event listener per convertire quando si preme Invio
document
  .getElementById("amount")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      convert();
    }
  });

// Converti automaticamente quando si cambia valuta
document.getElementById("from").addEventListener("change", function () {
  if (document.getElementById("amount").value) {
    convert();
  }
});

document.getElementById("to").addEventListener("change", function () {
  if (document.getElementById("amount").value) {
    convert();
  }
});
