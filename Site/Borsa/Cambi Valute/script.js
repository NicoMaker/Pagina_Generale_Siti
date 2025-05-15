// Variabile globale per memorizzare i dati delle valute
let currencies = []

// Funzione per caricare i dati delle valute dal file JSON
async function loadCurrencies() {
  try {
    const response = await fetch("currencies.json")
    if (!response.ok) {
      throw new Error("Impossibile caricare i dati delle valute")
    }
    const data = await response.json()
    currencies = data.currencies

    // Inizializza i selettori dopo aver caricato i dati
    initializeSelectors()
  } catch (error) {
    console.error("Errore nel caricamento delle valute:", error)
    // Fallback: usa un array di valute predefinito
    initializeSelectors()
  }
}

// Funzione per inizializzare i selettori personalizzati
function initializeSelectors() {
  initializeSelector("from", "EUR")
  initializeSelector("to", "USD")
}

// Funzione per inizializzare un singolo selettore personalizzato
function initializeSelector(id, defaultValue) {
  const input = document.getElementById(`${id}-select`)
  const dropdown = document.getElementById(`${id}-dropdown`)
  const hiddenInput = document.getElementById(`${id}-value`)
  const container = document.getElementById(`${id}-container`)

  // Imposta il valore predefinito
  hiddenInput.value = defaultValue

  // Popola il dropdown con le opzioni
  populateDropdown(dropdown, id)

  // Aggiorna il display dell'input con il valore predefinito
  updateInputDisplay(input, defaultValue)

  // Aggiungi event listener per l'input
  input.addEventListener("input", function () {
    const searchTerm = this.value.trim().toLowerCase()
    filterDropdownOptions(dropdown, searchTerm)
    dropdown.classList.add("show")
  })


  // Aggiungi event listener per il focus
  input.addEventListener("focus", function () {
    // Se l'input ha già un valore, seleziona tutto il testo
    if (this.value) {
      this.select()
    }
    dropdown.classList.add("show")
    // Se non c'è un termine di ricerca, mostra tutte le opzioni
    if (!this.value.trim()) {
      resetDropdownOptions(dropdown)
    }
  })

  // Aggiungi event listener per il click sull'input
  input.addEventListener("click", function (e) {
    e.stopPropagation() // Previene che il click si propaghi al documento
    dropdown.classList.add("show")
  })

  // Chiudi il dropdown quando si clicca fuori
  document.addEventListener("click", function (e) {
    if (!container.contains(e.target)) {
      dropdown.classList.remove("show")
      // Ripristina il display dell'input
      updateInputDisplay(input, hiddenInput.value)
    }
  })

  // Gestisci la navigazione da tastiera
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      dropdown.classList.remove("show")
      updateInputDisplay(input, hiddenInput.value)
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      const firstOption = dropdown.querySelector(".select-option")
      if (firstOption) {
        firstOption.focus()
      }
    } else if (e.key === "Enter") {
      e.preventDefault()
      const selectedOption =
        dropdown.querySelector(".select-option.selected") || dropdown.querySelector(".select-option")
      if (selectedOption) {
        const currencyCode = selectedOption.dataset.code
        selectCurrency(id, currencyCode, input, hiddenInput, dropdown)
      }
    }
  })
}

// Funzione per popolare il dropdown con le opzioni
function populateDropdown(dropdown, selectId) {
  // Svuota il dropdown
  dropdown.innerHTML = ""

  // Aggiungi le opzioni
  currencies.forEach((currency) => {
    const option = createOptionElement(currency, selectId)
    dropdown.appendChild(option)
  })
}

// Funzione per creare un elemento opzione
function createOptionElement(currency, selectId) {
  const option = document.createElement("div")
  option.className = "select-option"
  option.tabIndex = 0 // Per permettere il focus da tastiera
  option.dataset.code = currency.code

  // Controlla se questa opzione è selezionata
  const hiddenInput = document.getElementById(`${selectId}-value`)
  if (currency.code === hiddenInput.value) {
    option.classList.add("selected")
  }

  option.innerHTML = `
    <span class="currency-symbol">${currency.symbol}</span>
    <div class="currency-details">
      <span class="currency-code">${currency.code}</span>
      <span class="currency-name">${currency.name}</span>
    </div>
  `

  // Aggiungi event listener per selezionare la valuta
  // Usa mousedown invece di click per dispositivi mobili
  option.addEventListener("mousedown", function (e) {
    e.preventDefault() // Previene la perdita di focus
    const input = document.getElementById(`${selectId}-select`)
    const hiddenInput = document.getElementById(`${selectId}-value`)
    const dropdown = document.getElementById(`${selectId}-dropdown`)
    selectCurrency(selectId, currency.code, input, hiddenInput, dropdown)
  })

  // Aggiungi anche touchstart per dispositivi mobili
  option.addEventListener("touchstart", function (e) {
    e.preventDefault() // Previene comportamenti indesiderati su mobile
    const input = document.getElementById(`${selectId}-select`)
    const hiddenInput = document.getElementById(`${selectId}-value`)
    const dropdown = document.getElementById(`${selectId}-dropdown`)
    selectCurrency(selectId, currency.code, input, hiddenInput, dropdown)
  })

  // Gestisci la navigazione da tastiera all'interno del dropdown
  option.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      const input = document.getElementById(`${selectId}-select`)
      const hiddenInput = document.getElementById(`${selectId}-value`)
      const dropdown = document.getElementById(`${selectId}-dropdown`)
      selectCurrency(selectId, currency.code, input, hiddenInput, dropdown)
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      const nextOption = this.nextElementSibling
      if (nextOption) {
        nextOption.focus()
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      const prevOption = this.previousElementSibling
      if (prevOption) {
        prevOption.focus()
      } else {
        // Se siamo al primo elemento, torniamo all'input
        document.getElementById(`${selectId}-select`).focus()
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      const dropdown = document.getElementById(`${selectId}-dropdown`)
      dropdown.classList.remove("show")
      document.getElementById(`${selectId}-select`).focus()
    }
  })

  return option
}

// Funzione per filtrare le opzioni del dropdown
function filterDropdownOptions(dropdown, searchTerm) {
  const options = dropdown.querySelectorAll(".select-option")
  let visibleCount = 0

  // Se non c'è un termine di ricerca, mostra tutte le opzioni
  if (!searchTerm) {
    options.forEach((option) => {
      option.style.display = ""
      // Rimuovi l'evidenziazione
      removeHighlighting(option)
    })
    return
  }

  options.forEach((option) => {
    const code = option.dataset.code.toLowerCase()
    const name = option.querySelector(".currency-name").textContent.toLowerCase()

    if (code.includes(searchTerm) || name.includes(searchTerm)) {
      option.style.display = ""
      // Evidenzia il termine di ricerca
      highlightSearchTerm(option, searchTerm)
      visibleCount++
    } else {
      option.style.display = "none"
    }
  })

  // Se non ci sono risultati, mostra un messaggio
  if (visibleCount === 0) {
    const noResults = document.createElement("div")
    noResults.className = "no-results"
    noResults.textContent = `Nessuna valuta trovata per "${searchTerm}"`
    dropdown.innerHTML = ""
    dropdown.appendChild(noResults)
  }
}

// Funzione per evidenziare il termine di ricerca
function highlightSearchTerm(option, searchTerm) {
  const codeElement = option.querySelector(".currency-code")
  const nameElement = option.querySelector(".currency-name")

  codeElement.innerHTML = highlightText(codeElement.textContent, searchTerm)
  nameElement.innerHTML = highlightText(nameElement.textContent, searchTerm)
}

// Funzione per rimuovere l'evidenziazione
function removeHighlighting(option) {
  const codeElement = option.querySelector(".currency-code")
  const nameElement = option.querySelector(".currency-name")

  codeElement.textContent = codeElement.textContent
  nameElement.textContent = nameElement.textContent
}

// Funzione per evidenziare il testo
function highlightText(text, searchTerm) {
  if (!searchTerm) return text

  const regex = new RegExp(`(${searchTerm})`, "gi")
  return text.replace(regex, '<span class="highlight">$1</span>')
}

// Funzione per ripristinare le opzioni del dropdown
function resetDropdownOptions(dropdown) {
  // Rimuovi eventuali messaggi di "nessun risultato"
  const noResults = dropdown.querySelector(".no-results")
  if (noResults) {
    dropdown.removeChild(noResults)
    populateDropdown(dropdown, dropdown.id.split("-")[0])
  }

  // Mostra tutte le opzioni
  const options = dropdown.querySelectorAll(".select-option")
  options.forEach((option) => {
    option.style.display = ""
    removeHighlighting(option)
  })
}

// Funzione per selezionare una valuta
function selectCurrency(selectId, currencyCode, input, hiddenInput, dropdown) {
  // Aggiorna il valore nascosto
  hiddenInput.value = currencyCode

  // Aggiorna il display dell'input
  updateInputDisplay(input, currencyCode)

  // Aggiorna la classe selected nelle opzioni
  const options = dropdown.querySelectorAll(".select-option")
  options.forEach((option) => {
    if (option.dataset.code === currencyCode) {
      option.classList.add("selected")
    } else {
      option.classList.remove("selected")
    }
  })

  // Chiudi il dropdown
  dropdown.classList.remove("show")

  // Aggiorna la conversione se c'è già un importo
  if (document.getElementById("amount").value) {
    convert()
  }

  // Feedback visivo per la selezione
  input.classList.add("selection-made")
  setTimeout(() => {
    input.classList.remove("selection-made")
  }, 300)
}

// Funzione per aggiornare il display dell'input
function updateInputDisplay(input, currencyCode) {
  // Trova la valuta selezionata
  const selectedCurrency = currencies.find((c) => c.code === currencyCode)

  if (selectedCurrency) {
    // Imposta il valore dell'input come il codice e il nome della valuta
    input.value = `${selectedCurrency.symbol} ${selectedCurrency.code} - ${selectedCurrency.name}`
    input.classList.add("has-value")
  } else {
    input.value = ""
    input.classList.remove("has-value")
  }
}

// Funzione per scambiare le valute
function swapCurrencies() {
  const fromValue = document.getElementById("from-value").value
  const toValue = document.getElementById("to-value").value
  const fromInput = document.getElementById("from-select")
  const toInput = document.getElementById("to-select")

  // Scambia i valori
  document.getElementById("from-value").value = toValue
  document.getElementById("to-value").value = fromValue

  // Aggiorna i display degli input
  updateInputDisplay(fromInput, toValue)
  updateInputDisplay(toInput, fromValue)

  // Aggiorna le classi selected nei dropdown
  updateSelectedOptions("from", toValue)
  updateSelectedOptions("to", fromValue)

  // Se c'è già un risultato, aggiorna la conversione
  if (!document.getElementById("result-container").classList.contains("hidden")) {
    convert()
  }

  // Animazione del pulsante di scambio
  const swapButton = document.querySelector(".swap-button")
  swapButton.classList.add("active")
  setTimeout(() => {
    swapButton.classList.remove("active")
  }, 300)
}

// Funzione per aggiornare le opzioni selezionate
function updateSelectedOptions(selectId, currencyCode) {
  const dropdown = document.getElementById(`${selectId}-dropdown`)
  const options = dropdown.querySelectorAll(".select-option")

  options.forEach((option) => {
    if (option.dataset.code === currencyCode) {
      option.classList.add("selected")
    } else {
      option.classList.remove("selected")
    }
  })
}

// Funzione per convertire le valute
function convert() {
  const amount = document.getElementById("amount").value
  const from = document.getElementById("from-value").value
  const to = document.getElementById("to-value").value

  // Validazione dell'input
  if (!amount || isNaN(amount) || amount <= 0) {
    showError("Inserisci un importo valido maggiore di zero")
    return
  }

  // Mostra lo stato di caricamento
  const button = document.getElementById("convert-button")
  button.classList.add("loading")

  // Nascondi il risultato precedente durante il caricamento
  document.getElementById("result-container").classList.add("hidden")

  fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore nella risposta del server")
      }
      return response.json()
    })
    .then((data) => {
      // Rimuovi lo stato di caricamento
      button.classList.remove("loading")

      const rate = data.rates[to]
      const convertedAmount = amount * rate

      // Formatta i numeri con separatore delle migliaia
      const formattedAmount = formatNumber(amount, from)
      const formattedConvertedAmount = formatNumber(convertedAmount, to)

      // Mostra il risultato
      document.getElementById("result").innerHTML = `${formattedAmount} = ${formattedConvertedAmount}`

      // Mostra il tasso di cambio
      const rateFormatted = rate.toFixed(4)
      document.getElementById("rate-info").textContent = `1 ${from} = ${rateFormatted} ${to}`

      // Mostra il container del risultato con animazione
      const resultContainer = document.getElementById("result-container")
      resultContainer.classList.remove("hidden")
      resultContainer.classList.add("fade-in")

      // Vibrazione di feedback su dispositivi mobili
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    })
    .catch((error) => {
      console.error(error)
      button.classList.remove("loading")
      showError("Si è verificato un errore nella conversione. Riprova più tardi.")
    })
}

// Funzione per formattare i numeri con separatore delle migliaia
function formatNumber(number, currency) {
  // Configura le opzioni di formattazione in base alla valuta
  const options = {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }

  // Gestisci valute speciali come JPY che non usano decimali
  if (currency === "JPY" || currency === "KRW" || currency === "IDR" || currency === "VND") {
    options.minimumFractionDigits = 0
    options.maximumFractionDigits = 0
  }

  return new Intl.NumberFormat("it-IT", options).format(number)
}

// Funzione per mostrare errori
function showError(message) {
  const resultContainer = document.getElementById("result-container")
  resultContainer.classList.remove("hidden")
  document.getElementById("result").innerHTML = `<span style="color: #e63946;">${message}</span>`
  document.getElementById("rate-info").textContent = ""
}

// Gestione del tema (chiaro/scuro)
function initTheme() {
  // Controlla se esiste una preferenza salvata
  const savedTheme = localStorage.getItem("theme")

  // Controlla se il sistema preferisce il tema scuro
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)")

  // Imposta il tema in base alla preferenza salvata o alla preferenza di sistema
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme)
  } else if (prefersDarkScheme.matches) {
    document.documentElement.setAttribute("data-theme", "dark")
  }

  // Aggiungi event listener per il pulsante di cambio tema
  const themeToggle = document.getElementById("theme-toggle")
  themeToggle.addEventListener("click", () => {
    // Ottieni il tema corrente
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light"

    // Cambia il tema
    const newTheme = currentTheme === "light" ? "dark" : "light"

    // Applica il nuovo tema
    document.documentElement.setAttribute("data-theme", newTheme)

    // Salva la preferenza
    localStorage.setItem("theme", newTheme)

    // Animazione del pulsante
    themeToggle.classList.add("theme-toggle-active")
    setTimeout(() => {
      themeToggle.classList.remove("theme-toggle-active")
    }, 300)
  })

  // Aggiungi listener per cambiamenti nella preferenza di sistema
  prefersDarkScheme.addEventListener("change", (e) => {
    // Solo se l'utente non ha già impostato una preferenza
    if (!localStorage.getItem("theme")) {
      const newTheme = e.matches ? "dark" : "light"
      document.documentElement.setAttribute("data-theme", newTheme)
    }
  })
}

// Aggiungi event listener per convertire quando si preme Invio
function setupEventListeners() {
  document.getElementById("amount").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault()
      convert()
    }
  })

  // Migliora l'esperienza mobile
  setupMobileExperience()
}

// Funzione per migliorare l'esperienza su dispositivi mobili
function setupMobileExperience() {
  // Rileva se è un dispositivo mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  if (isMobile) {
    // Aggiungi classe per stili specifici per mobile
    document.body.classList.add("mobile-device")

    // Migliora l'interazione con i dropdown su mobile
    const selectInputs = document.querySelectorAll(".select-input")
    selectInputs.forEach(input => {
      input.addEventListener("touchend", function (e) {
        // Previeni il comportamento predefinito che può causare problemi su alcuni browser mobile
        e.preventDefault()
        this.focus()
      })
    })

    // Migliora la selezione delle opzioni su mobile
    document.addEventListener("touchstart", function (e) {

      // Se l'utente tocca un'opzione, assicurati che venga selezionata
      if (target.classList.contains("select-option") || target.closest(".select-option")) {
        const option = target.classList.contains("select-option") ? target : target.closest(".select-option")
        if (option) {
          const selectId = option.closest(".select-dropdown")?.id.split("-")[0]
          const currencyCode = option.getAttribute("data-code")

          if (selectId && currencyCode) {
            const input = document.getElementById(`${selectId}-select`)
            const hiddenInput = document.getElementById(`${selectId}-value`)
            const dropdown = document.getElementById(`${selectId}-dropdown`)

            if (input && hiddenInput && dropdown) {
              e.preventDefault()
              selectCurrency(selectId, currencyCode, input, hiddenInput, dropdown)
            }
          }
        }
      }
    }, { passive: false })
  }
}

// Imposta la data di ultimo aggiornamento
function setLastUpdateDate() {
  document.getElementById("last-update").textContent = new Date().toLocaleDateString("it-IT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Aggiungi stili CSS per migliorare l'esperienza mobile
function addMobileStyles() {
  const style = document.createElement("style")
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
  `
  document.head.appendChild(style)
}

// Inizializza l'applicazione quando il DOM è caricato
document.addEventListener("DOMContentLoaded", () => {
  // Aggiungi stili migliorati per mobile
  addMobileStyles()

  // Inizializza il tema
  initTheme()

  // Imposta la data di ultimo aggiornamento
  setLastUpdateDate()

  // Configura gli event listener
  setupEventListeners()

  // Carica i dati delle valute e inizializza i selettori
  loadCurrencies()
})