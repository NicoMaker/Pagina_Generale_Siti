document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM
  const quoteText = document.getElementById("quote-text")
  const quoteAuthor = document.getElementById("quote-author")
  const generateBtn = document.getElementById("generate-btn")
  const copyBtn = document.getElementById("copy-btn")
  const shareBtn = document.getElementById("share-btn")
  const notification = document.getElementById("notification")
  const quoteCounter = document.getElementById("quote-counter")

  // Variabili di stato
  let allQuotes = []
  let currentQuoteIndex = -1
  let initialQuoteShown = false

  // Carica le frasi dal file JSON
  async function loadQuotes() {
    try {
      const response = await fetch("frasi.json")
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()

      // Processa le frasi
      allQuotes = processQuotes(data)

      // Mostra la frase iniziale
      showInitialQuote(data.iniziale)
    } catch (error) {
      console.error("Errore nel caricamento delle frasi:", error)
      // Fallback in caso di errore
      allQuotes = getFallbackQuotes()
      showInitialQuote(
        "Le Frasi hanno un Potere particolare di guarire le persone nei propri sentimenti oppure distruggerli, fanne buon uso",
      )
    }
  }

  // Processa le frasi dal JSON
  function processQuotes(data) {
    const processedQuotes = []

    // Aggiungi la frase iniziale come prima frase
    processedQuotes.push({
      text: data.iniziale,
      author: "",
      category: "motivazionale",
    })

    // Processa tutte le frasi dal JSON
    if (Array.isArray(data.frasi)) {
      data.frasi.forEach((frase) => {
        // Controlla se la frase è già in formato oggetto
        if (typeof frase === "object" && frase.testo) {
          processedQuotes.push({
            text: frase.testo,
            author: frase.autore || "",
            category: frase.categoria || "motivazionale",
          })
        } else if (typeof frase === "string") {
          // Formato stringa (per compatibilità con il vecchio formato)
          const hasAuthor = frase.includes(" - ")

          let text, author

          if (hasAuthor) {
            ;[text, author] = frase.split(" - ").map((part) => part.trim())
          } else {
            text = frase
            author = ""
          }

          processedQuotes.push({
            text,
            author,
            category: "motivazionale",
          })
        }
      })
    }

    return processedQuotes
  }

  // Frasi di fallback in caso di errore
  function getFallbackQuotes() {
    return [
      {
        text: "Le Frasi hanno un Potere particolare di guarire le persone nei propri sentimenti oppure distruggerli, fanne buon uso",
        author: "",
        category: "motivazionale",
      },
      {
        text: "Ricorda che le montagne più alte sono scalate passo dopo passo. Non temere la salita, ma goditi il panorama lungo il cammino.",
        author: "",
        category: "motivazionale",
      },
      {
        text: "La vita è ciò che facciamo di essa.",
        author: "Eleanor Roosevelt",
        category: "motivazionale",
      },
      {
        text: "Così tra questa immensità s'annega il pensier mio: e il naufragar m'è dolce in questo mare.",
        author: "Giacomo Leopardi",
        category: "poesia",
      },
      {
        text: "Penso, dunque sono.",
        author: "René Descartes",
        category: "filosofia",
      },
    ]
  }

  // Mostra la frase iniziale
  function showInitialQuote(text) {
    quoteText.textContent = text
    quoteText.classList.add("fade-in")
    quoteAuthor.textContent = ""

    // Mostra il contatore per la frase iniziale
    quoteCounter.textContent = `Frase 1 su ${allQuotes.length}`
    quoteCounter.classList.add("fade-in")

    initialQuoteShown = true
  }

  // Genera una nuova frase casuale
  function generateRandomQuote() {
    // Filtra le frasi escludendo la frase iniziale se è già stata mostrata
    const availableQuotes = initialQuoteShown ? allQuotes.filter((_, index) => index !== 0) : allQuotes

    if (availableQuotes.length === 0) {
      quoteText.textContent = "Nessuna frase disponibile."
      quoteAuthor.textContent = ""
      return
    }

    // Trova un indice casuale diverso da quello corrente
    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * availableQuotes.length)
    } while (randomIndex === currentQuoteIndex && availableQuotes.length > 1)

    currentQuoteIndex = randomIndex
    const quote = availableQuotes[randomIndex]

    // Animazione di dissolvenza
    quoteText.classList.remove("fade-in")
    quoteAuthor.classList.remove("fade-in")

    // Forza un reflow per riavviare l'animazione
    void quoteText.offsetWidth
    void quoteAuthor.offsetWidth

    // Aggiorna il testo e l'autore
    quoteText.textContent = quote.text
    quoteAuthor.textContent = quote.author

    // Aggiungi l'animazione
    quoteText.classList.add("fade-in")
    quoteAuthor.classList.add("fade-in")

    // Aggiorna il contatore
    const totalQuotes = allQuotes.length
    const currentQuoteNumber = initialQuoteShown ? randomIndex + 1 : 1
    quoteCounter.textContent = `Frase ${currentQuoteNumber} su ${totalQuotes}`
    quoteCounter.classList.add("fade-in")

    // Aggiungi un effetto di pulsazione alla card
    const quoteCard = document.querySelector(".quote-card")
    quoteCard.style.transform = "scale(1.02)"
    setTimeout(() => {
      quoteCard.style.transform = ""
    }, 300)
  }

  // Copia la frase negli appunti
  function copyQuote() {
    const textToCopy = quoteAuthor.textContent
      ? `${quoteText.textContent} - ${quoteAuthor.textContent}`
      : quoteText.textContent

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => showNotification())
      .catch((err) => console.error("Errore nella copia: ", err))
  }

  // Condividi la frase
  function shareQuote() {
    const quote = quoteAuthor.textContent
      ? `${quoteText.textContent} - ${quoteAuthor.textContent}`
      : quoteText.textContent

    if (navigator.share) {
      navigator
        .share({
          title: "Life Coach Generator",
          text: quote,
        })
        .catch((err) => console.error("Errore nella condivisione: ", err))
    } else {
      copyQuote()
    }
  }

  // Mostra la notifica
  function showNotification() {
    notification.classList.add("show")
    setTimeout(() => {
      notification.classList.remove("show")
    }, 2000)
  }

  // Event listeners
  generateBtn.addEventListener("click", generateRandomQuote)
  copyBtn.addEventListener("click", copyQuote)
  shareBtn.addEventListener("click", shareQuote)

  // Inizializza l'applicazione
  loadQuotes()
})
