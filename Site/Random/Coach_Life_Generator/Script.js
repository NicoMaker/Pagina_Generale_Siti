document.addEventListener('DOMContentLoaded', () => {
  // Elementi DOM
  const quoteText = document.getElementById('quote-text');
  const quoteAuthor = document.getElementById('quote-author');
  const generateBtn = document.getElementById('generate-btn');
  const copyBtn = document.getElementById('copy-btn');
  const shareBtn = document.getElementById('share-btn');
  const categoryBtns = document.querySelectorAll('.category-btn');
  const notification = document.getElementById('notification');
  
  // Variabili di stato
  let allQuotes = [];
  let currentCategory = 'all';
  let currentQuoteIndex = -1;
  
  // Carica le frasi dal file JSON
  async function loadQuotes() {
    try {
      const response = await fetch('frasi.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      
      // Processa le frasi
      allQuotes = processQuotes(data);
      
      // Mostra la frase iniziale
      showInitialQuote(data.iniziale);
    } catch (error) {
      console.error('Errore nel caricamento delle frasi:', error);
      // Fallback in caso di errore
      allQuotes = getFallbackQuotes();
      showInitialQuote("Le Frasi hanno un Potere particolare di guarire le persone nei propri sentimenti oppure distruggerli, fanne buon uso");
    }
  }
  
  // Processa le frasi dal JSON
  function processQuotes(data) {
    const processedQuotes = [];
    
    // Aggiungi la frase iniziale come prima frase
    processedQuotes.push({
      text: data.iniziale,
      author: "",
      category: "motivazionale"
    });
    
    // Processa tutte le frasi dal JSON
    if (Array.isArray(data.frasi)) {
      data.frasi.forEach(frase => {
        // Controlla se la frase è già in formato oggetto
        if (typeof frase === 'object' && frase.testo) {
          processedQuotes.push({
            text: frase.testo,
            author: frase.autore || "",
            category: mapCategory(frase.categoria)
          });
        } else if (typeof frase === 'string') {
          // Formato stringa (per compatibilità con il vecchio formato)
          const hasAuthor = frase.includes(" - ");
          
          let text, author;
          
          if (hasAuthor) {
            [text, author] = frase.split(" - ").map(part => part.trim());
          } else {
            text = frase;
            author = "";
          }
          
          // Determina la categoria in base all'autore
          const category = determineCategory(author);
          
          processedQuotes.push({
            text,
            author,
            category
          });
        }
      });
    }
    
    return processedQuotes;
  }
  
  // Mappa le categorie dal formato italiano a quello inglese
  function mapCategory(categoria) {
    if (!categoria) return "motivazionale";
    
    switch (categoria.toLowerCase()) {
      case "motivazionale":
        return "motivational";
      case "poesia":
        return "poetry";
      case "filosofia":
        return "philosophy";
      default:
        return "motivational";
    }
  }
  
  // Determina la categoria in base all'autore
  function determineCategory(author) {
    if (!author) return "motivational";
    
    const poetAuthors = ["Leopardi", "Dante", "Petrarca", "D'Annunzio", "Ungaretti", "Van Gogh", "Schulz", "Pavese"];
    const philosophyAuthors = ["Einstein", "Socrate", "Aristotele", "Seneca", "Nietzsche", "Cartesio", "Descartes", 
                              "Kierkegaard", "Jung", "Buddha", "Confucio", "Protagora", "Sartre", "Kant"];
    
    for (const poet of poetAuthors) {
      if (author.includes(poet)) return "poetry";
    }
    
    for (const philosopher of philosophyAuthors) {
      if (author.includes(philosopher)) return "philosophy";
    }
    
    return "motivational";
  }
  
  // Frasi di fallback in caso di errore
  function getFallbackQuotes() {
    return [
      {
        text: "Le Frasi hanno un Potere particolare di guarire le persone nei propri sentimenti oppure distruggerli, fanne buon uso",
        author: "",
        category: "motivational"
      },
      {
        text: "Ricorda che le montagne più alte sono scalate passo dopo passo. Non temere la salita, ma goditi il panorama lungo il cammino.",
        author: "",
        category: "motivational"
      },
      {
        text: "La vita è ciò che facciamo di essa.",
        author: "Eleanor Roosevelt",
        category: "motivational"
      },
      {
        text: "Così tra questa immensità s'annega il pensier mio: e il naufragar m'è dolce in questo mare.",
        author: "Giacomo Leopardi",
        category: "poetry"
      },
      {
        text: "Penso, dunque sono.",
        author: "René Descartes",
        category: "philosophy"
      }
    ];
  }
  
  // Mostra la frase iniziale
  function showInitialQuote(text) {
    quoteText.textContent = text;
    quoteText.classList.add('fade-in');
    quoteAuthor.textContent = "";
  }
  
  // Genera una nuova frase casuale
  function generateRandomQuote() {
    // Filtra le frasi in base alla categoria selezionata
    const filteredQuotes = currentCategory === 'all' 
      ? allQuotes 
      : allQuotes.filter(quote => quote.category === currentCategory);
    
    if (filteredQuotes.length === 0) {
      quoteText.textContent = "Nessuna frase disponibile per questa categoria.";
      quoteAuthor.textContent = "";
      return;
    }
    
    // Trova un indice casuale diverso da quello corrente
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    } while (randomIndex === currentQuoteIndex && filteredQuotes.length > 1);
    
    currentQuoteIndex = randomIndex;
    const quote = filteredQuotes[randomIndex];
    
    // Animazione di dissolvenza
    quoteText.classList.remove('fade-in');
    quoteAuthor.classList.remove('fade-in');
    
    // Forza un reflow per riavviare l'animazione
    void quoteText.offsetWidth;
    void quoteAuthor.offsetWidth;
    
    // Aggiorna il testo e l'autore
    quoteText.textContent = quote.text;
    quoteAuthor.textContent = quote.author;
    
    // Aggiungi l'animazione
    quoteText.classList.add('fade-in');
    quoteAuthor.classList.add('fade-in');
    
    // Aggiungi un effetto di pulsazione alla card
    const quoteCard = document.querySelector('.quote-card');
    quoteCard.style.transform = "scale(1.02)";
    setTimeout(() => {
      quoteCard.style.transform = "";
    }, 300);
  }
  
  // Copia la frase negli appunti
  function copyQuote() {
    const textToCopy = quoteAuthor.textContent 
      ? `${quoteText.textContent} - ${quoteAuthor.textContent}` 
      : quoteText.textContent;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => showNotification())
      .catch(err => console.error('Errore nella copia: ', err));
  }
  
  // Condividi la frase
  function shareQuote() {
    const quote = quoteAuthor.textContent 
      ? `${quoteText.textContent} - ${quoteAuthor.textContent}` 
      : quoteText.textContent;
    
    if (navigator.share) {
      navigator.share({
        title: 'Frasi che Ispirano',
        text: quote,
      })
      .catch(err => console.error('Errore nella condivisione: ', err));
    } else {
      copyQuote();
    }
  }
  
  // Mostra la notifica
  function showNotification() {
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
    }, 2000);
  }
  
  // Gestisci il cambio di categoria
  function handleCategoryChange(e) {
    const selectedCategory = e.target.dataset.category;
    
    // Aggiorna la classe attiva
    categoryBtns.forEach(btn => {
      btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Imposta la nuova categoria
    currentCategory = selectedCategory;
    
    // Genera una nuova frase
    generateRandomQuote();
  }
  
  // Event listeners
  generateBtn.addEventListener('click', generateRandomQuote);
  copyBtn.addEventListener('click', copyQuote);
  shareBtn.addEventListener('click', shareQuote);
  
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', handleCategoryChange);
  });
  
  // Inizializza l'applicazione
  loadQuotes();
});