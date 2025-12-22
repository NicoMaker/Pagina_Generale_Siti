document.addEventListener("DOMContentLoaded", () => {
  const numGiocatoriInput = document.getElementById("numGiocatori")
  const decreaseBtn = document.querySelector(".decrease")
  const increaseBtn = document.querySelector(".increase")
  const generateBtn = document.getElementById("generateBtn")
  const printBtn = document.getElementById("printBtn")
  const resetBtn = document.getElementById("resetBtn")
  const loadingEl = document.getElementById("loading")
  const progressBar = document.getElementById("progressBar")
  const cardsContainer = document.getElementById("cardsContainer")
  const navLinks = document.querySelectorAll(".app-nav a")
  const sections = document.querySelectorAll(".section-container")

  const sumcartelle = 600
  const progressPercentage = document.getElementById("progressPercentage")
  const progressCounter = document.getElementById("progressCounter")
  const loaderIcon = document.getElementById("loaderIcon")
  const loaderPhase = document.getElementById("loaderPhase")
  const loaderMessage = document.getElementById("loaderMessage")
  const progressFraction = document.getElementById("progressFraction")

  let globalLastPercentage = 0

  numGiocatoriInput.max = sumcartelle

  generateBtn.addEventListener("click", generateCards)
  printBtn.addEventListener("click", printCards)
  resetBtn.addEventListener("click", resetCards)
  decreaseBtn.addEventListener("click", () => updateNumGiocatori(-1))
  increaseBtn.addEventListener("click", () => updateNumGiocatori(1))

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (link.getAttribute("href").startsWith("#")) {
        e.preventDefault()
        const targetId = link.getAttribute("href").substring(1)

        navLinks.forEach((l) => l.classList.remove("active"))
        link.classList.add("active")

        sections.forEach((section) => {
          section.classList.remove("active")
          if (section.id === targetId) {
            section.classList.add("active")
          }
        })
      }
    })
  })

  const alertContainer = document.getElementById("alertContainer")
  const alertTemplate = document.getElementById("alertTemplate")

  function showAlert(type, title, message, duration = 5000) {
    const alert = alertTemplate.content.cloneNode(true).querySelector(".alert")
    alert.classList.add(`alert-${type}`)

    const iconElement = alert.querySelector(".alert-icon")
    const titleElement = alert.querySelector(".alert-title")
    const messageElement = alert.querySelector(".alert-message")
    const closeButton = alert.querySelector(".alert-close")

    let icon
    switch (type) {
      case "success":
        icon = "fa-check-circle"
        break
      case "error":
        icon = "fa-exclamation-circle"
        break
      case "warning":
        icon = "fa-exclamation-triangle"
        break
      case "info":
      default:
        icon = "fa-info-circle"
    }

    iconElement.innerHTML = `<i class="fas ${icon}"></i>`
    titleElement.textContent = title
    messageElement.textContent = message

    alertContainer.appendChild(alert)

    const closeAlert = () => {
      alert.classList.add("closing")
      setTimeout(() => {
        alert.remove()
      }, 300)
    }

    closeButton.addEventListener("click", closeAlert)

    if (duration > 0) {
      setTimeout(closeAlert, duration)
    }

    return alert
  }

  function updateNumGiocatori(delta) {
    const currentValue = Number.parseInt(numGiocatoriInput.value) || 1
    const newValue = Math.max(1, Math.min(sumcartelle, currentValue + delta))
    numGiocatoriInput.value = newValue
  }

  function updateProgressMarkers(total) {
    const marker25 = document.getElementById("marker-25")
    const marker50 = document.getElementById("marker-50")
    const marker75 = document.getElementById("marker-75")
    const marker100 = document.getElementById("marker-100")

    const quarter = Math.ceil(total / 4)
    const half = Math.ceil(total / 2)
    const threeQuarters = Math.ceil((total * 3) / 4)

    marker25.textContent = quarter.toString()
    marker50.textContent = half.toString()
    marker75.textContent = threeQuarters.toString()
    marker100.textContent = total.toString()
  }

  function updateLoader(percentage, processed, total, phase) {
    const safePercentage = Math.max(globalLastPercentage, percentage)
    globalLastPercentage = safePercentage

    progressPercentage.textContent = `${Math.round(safePercentage)}%`
    progressCounter.textContent = `${processed}/${total} giocatori (${processed * 6} / ${total * 6} cartelle)`

    let fractionText = ""
    const quarter = Math.ceil(total / 4)
    const half = Math.ceil(total / 2)
    const threeQuarters = Math.ceil((total * 3) / 4)

    if (processed <= quarter) {
      fractionText = "1/4"
    } else if (processed <= half) {
      fractionText = "2/4"
    } else if (processed <= threeQuarters) {
      fractionText = "3/4"
    } else {
      fractionText = "4/4"
    }

    progressFraction.textContent = `${fractionText} completato`

    progressBar.style.width = `${safePercentage}%`
    progressBar.classList.remove("quarter", "half", "three-quarters", "complete")

    if (safePercentage >= 100) {
      progressBar.classList.add("complete")
    } else if (safePercentage >= 75) {
      progressBar.classList.add("three-quarters")
    } else if (safePercentage >= 50) {
      progressBar.classList.add("half")
    } else if (safePercentage >= 25) {
      progressBar.classList.add("quarter")
    }

    loaderPhase.textContent = phase

    if (safePercentage < 25) {
      loaderMessage.textContent = "Inizializzazione della generazione delle cartelle..."
    } else if (safePercentage < 50) {
      loaderMessage.textContent = "Creazione struttura delle cartelle in corso..."
    } else if (safePercentage < 75) {
      loaderMessage.textContent = "Distribuzione dei numeri nelle cartelle..."
    } else {
      loaderMessage.textContent = "Finalizzazione e preparazione per la visualizzazione..."
    }

    if (safePercentage < 33) {
      loaderIcon.innerHTML = '<i class="fas fa-cog fa-spin"></i>'
      progressBar.style.background = "var(--loader-initial)"
      progressPercentage.style.color = "var(--primary-color)"
    } else if (safePercentage < 66) {
      loaderIcon.innerHTML = '<i class="fas fa-dice"></i>'
      progressBar.style.background = "var(--loader-middle)"
      progressPercentage.style.color = "var(--warning-color)"
    } else {
      loaderIcon.innerHTML = '<i class="fas fa-check-circle"></i>'
      progressBar.style.background = "var(--loader-final)"
      progressPercentage.style.color = "var(--success-color)"
    }

    if (safePercentage >= 100) {
      loadingEl.classList.add("loader-complete")
      loaderMessage.textContent = "Generazione completata con successo!"
      setTimeout(() => {
        loadingEl.classList.remove("loader-complete")
      }, 3000)
    } else {
      loadingEl.classList.remove("loader-complete")
    }
  }

  async function generateCards() {
    globalLastPercentage = 0
    loadingEl.classList.remove("loader-complete")

    const numGiocatori = Number.parseInt(numGiocatoriInput.value)

    if (numGiocatori < 1 || numGiocatori > sumcartelle) {
      showAlert("error", "Errore", `Inserisci un numero di giocatori valido (1-${sumcartelle})`)
      return
    }

    updateProgressMarkers(numGiocatori)
    loadingEl.classList.remove("hidden")
    cardsContainer.innerHTML = ""
    resetBtn.disabled = true
    printBtn.disabled = true

    updateLoader(0, 0, numGiocatori, "Inizializzazione")

    try {
      const startTime = performance.now()

      const batchSize = 5
      const totalBatches = Math.ceil(numGiocatori / batchSize)
      const giocatori = []
      let processedGiocatori = 0

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        await new Promise((resolve) => requestAnimationFrame(resolve))

        const start = batchIndex * batchSize
        const end = Math.min(start + batchSize, numGiocatori)
        const batchCount = end - start

        const generationProgress = ((batchIndex + 1) / totalBatches) * 50

        let currentPhase
        if (generationProgress < 12.5) {
          currentPhase = "Inizializzazione"
        } else if (generationProgress < 25) {
          currentPhase = "Creazione struttura"
        } else if (generationProgress < 37.5) {
          currentPhase = "Distribuzione numeri"
        } else {
          currentPhase = "Finalizzazione"
        }

        for (let i = 0; i < batchCount; i++) {
          giocatori.push(generateTombolaGiocatore(start + i + 1))
          processedGiocatori++

          const currentProgress = (processedGiocatori / numGiocatori) * 50
          updateLoader(currentProgress, processedGiocatori, numGiocatori, currentPhase)
        }
      }

      await renderCardsOptimized(giocatori, numGiocatori)

      const endTime = performance.now()
      const timeElapsed = ((endTime - startTime) / 1000).toFixed(2)

      resetBtn.disabled = false
      printBtn.disabled = false

      showAlert(
        "success",
        "Generazione completata",
        `Sono stati generati ${numGiocatori} giocatori di cartelle in ${timeElapsed} secondi.`,
      )

      setTimeout(() => {
        cardsContainer.scrollIntoView({ behavior: "smooth" })
      }, 500)
    } catch (error) {
      console.error("Errore:", error)
      showAlert("error", "Errore", `Si è verificato un errore: ${error.message}`)
    } finally {
      loadingEl.classList.add("hidden")
    }
  }

  function resetCards() {
    cardsContainer.innerHTML = ""
    printBtn.disabled = true
    generateBtn.disabled = false
    resetBtn.disabled = true

    showAlert("info", "Reset completato", "L'area delle cartelle è stata pulita. Puoi generare nuove cartelle.", 3000)
  }

  async function renderCardsOptimized(giocatori, totalGiocatori) {
    loadingEl.classList.remove("loader-complete")
    cardsContainer.innerHTML = ""

    const batchSize = 10
    const totalBatches = Math.ceil(giocatori.length / batchSize)

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const renderProgress = 50 + ((batchIndex + 1) / totalBatches) * 50
      const processedCount = Math.min((batchIndex + 1) * batchSize, giocatori.length)

      updateLoader(renderProgress, processedCount, totalGiocatori, "Rendering cartelle")

      await new Promise((resolve) => requestAnimationFrame(resolve))

      const start = batchIndex * batchSize
      const end = Math.min(start + batchSize, giocatori.length)
      const batch = giocatori.slice(start, end)

      batch.forEach((giocatore) => {
        const setContainer = document.createElement("div")
        setContainer.className = "card-giocatore"
        setContainer.setAttribute("data-giocatore", giocatore[0].setNumber)

        const setTitle = document.createElement("h2")
        setTitle.className = "giocatore-title"
        setTitle.innerHTML = `<i class="fas fa-folder"></i> Giocatore #${giocatore[0].setNumber}`
        setContainer.appendChild(setTitle)

        const cardsGrid = document.createElement("div")
        cardsGrid.className = "cards-grid"

        giocatore.forEach((card) => {
          const cardElement = createCardElement(card)
          cardsGrid.appendChild(cardElement)
        })

        setContainer.appendChild(cardsGrid)
        cardsContainer.appendChild(setContainer)
      })

      if (batchIndex < totalBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 20))
      }
    }

    updateLoader(100, totalGiocatori, totalGiocatori, "Completato")
  }

  function printCards() {
    showAlert(
      "info",
      "Preparazione stampa",
      "Preparazione della stampa in corso. Questo potrebbe richiedere alcuni secondi per grandi volumi.",
      3000,
    )

    setTimeout(() => {
      document.body.classList.add("printing")
      window.print()
      document.body.classList.remove("printing")
    }, 500)
  }

  function createCardElement(card) {
    const cardElement = document.createElement("div")
    cardElement.className = "tombola-card"
    cardElement.setAttribute("data-card-id", card.cardNumber)
    cardElement.setAttribute("data-giocatore", card.setNumber)

    const cardHeader = document.createElement("div")
    cardHeader.className = "card-header"
    cardHeader.textContent = `Cartella #${card.cardNumber}`
    cardElement.appendChild(cardHeader)

    const table = document.createElement("table")
    table.className = "card-grid"
    const tbody = document.createElement("tbody")

    for (let row = 0; row < 3; row++) {
      const tr = document.createElement("tr")
      for (let col = 0; col < 5; col++) {
        const td = document.createElement("td")
        const value = card.grid[row][col]
        td.textContent = value
        td.className = "filled"
        tr.appendChild(td)
      }
      tbody.appendChild(tr)
    }

    table.appendChild(tbody)
    cardElement.appendChild(table)

    return cardElement
  }

  setTimeout(() => {
    showAlert(
      "info",
      "Benvenuto",
      `Genera facilmente cartelle per la tua tombola. Seleziona il numero di giocatori (fino a ${sumcartelle}) e clicca su Genera.`,
    )
  }, 500)

  function generateTombolaGiocatore(giocatoreNumber) {
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1)
    shuffleArray(allNumbers)

    const cards = []
    for (let cardIndex = 0; cardIndex < 6; cardIndex++) {
      // Prendi 15 numeri consecutivi dall'array mescolato
      const cardNumbers = allNumbers.slice(cardIndex * 15, (cardIndex + 1) * 15)
      // Ordina i numeri per renderli più leggibili
      cardNumbers.sort((a, b) => a - b)

      // Crea griglia 3 righe × 5 colonne (tutte piene)
      const grid = []
      for (let row = 0; row < 3; row++) {
        const rowNumbers = cardNumbers.slice(row * 5, (row + 1) * 5)
        grid.push(rowNumbers)
      }

      cards.push({
        id: (giocatoreNumber - 1) * 6 + cardIndex + 1,
        setNumber: giocatoreNumber,
        cardNumber: cardIndex + 1,
        grid: grid,
      })
    }

    return cards
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }
})
