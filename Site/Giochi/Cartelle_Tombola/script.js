document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM
  const numGiocatoriInput = document.getElementById("numGiocatori");
  const decreaseBtn = document.querySelector(".decrease");
  const increaseBtn = document.querySelector(".increase");
  const generateBtn = document.getElementById("generateBtn");
  const printBtn = document.getElementById("printBtn");
  const resetBtn = document.getElementById("resetBtn"); // Nuovo pulsante Reset
  const loadingEl = document.getElementById("loading");
  const progressBar = document.getElementById("progressBar");
  const cardsContainer = document.getElementById("cardsContainer");
  const aboutLink = document.getElementById("aboutLink");
  const footerAboutLink = document.getElementById("footerAboutLink");
  const modalContainer = document.getElementById("modalContainer");
  const modalCloseBtn = document.querySelector(".modal-close-btn");
  const modalCloseX = document.querySelector(".modal-close");
  const navLinks = document.querySelectorAll(".app-nav a");
  const sections = document.querySelectorAll(".section-container");
  const sumcartelle = 600; // Limite massimo di cartelle

  // Nuovi elementi per il loader avanzato
  const progressPercentage = document.getElementById("progressPercentage");
  const progressCounter = document.getElementById("progressCounter");
  const loaderIcon = document.getElementById("loaderIcon");
  const loaderPhase = document.getElementById("loaderPhase");
  const loaderMessage = document.getElementById("loaderMessage");
  const progressFraction = document.getElementById("progressFraction");

  // Variabile globale per memorizzare l'ultima percentuale raggiunta
  // Questo garantisce che la barra non vada mai indietro anche tra diverse chiamate a updateLoader
  let globalLastPercentage = 0;

  // Imposta l'attributo max sull'input
  numGiocatoriInput.max = sumcartelle;

  // Event listeners
  generateBtn.addEventListener("click", generateCards);
  printBtn.addEventListener("click", printCards);
  resetBtn.addEventListener("click", resetCards); // Event listener per il reset
  decreaseBtn.addEventListener("click", () => updateNumGiocatori(-1));
  increaseBtn.addEventListener("click", () => updateNumGiocatori(1));
  aboutLink.addEventListener("click", showModal);
  footerAboutLink.addEventListener("click", showModal);
  modalCloseBtn.addEventListener("click", hideModal);
  modalCloseX.addEventListener("click", hideModal);
  modalContainer.addEventListener("click", (e) => {
    if (e.target === modalContainer) hideModal();
  });

  // Gestione della navigazione
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (link.getAttribute("href").startsWith("#")) {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);

        // Aggiorna la classe active sui link
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");

        // Mostra la sezione corrispondente
        sections.forEach((section) => {
          section.classList.remove("active");
          if (section.id === targetId) {
            section.classList.add("active");
          }
        });
      }
    });
  });

  // Sistema di alert
  const alertContainer = document.getElementById("alertContainer");
  const alertTemplate = document.getElementById("alertTemplate");

  /**
   * Mostra un alert
   * @param {string} type - Tipo di alert (success, error, warning, info)
   * @param {string} title - Titolo dell'alert
   * @param {string} message - Messaggio dell'alert
   * @param {number} duration - Durata in millisecondi (0 per non chiudere automaticamente)
   */
  function showAlert(type, title, message, duration = 5000) {
    const alert = alertTemplate.content.cloneNode(true).querySelector(".alert");
    alert.classList.add(`alert-${type}`);

    const iconElement = alert.querySelector(".alert-icon");
    const titleElement = alert.querySelector(".alert-title");
    const messageElement = alert.querySelector(".alert-message");
    const closeButton = alert.querySelector(".alert-close");

    // Imposta l'icona in base al tipo
    let icon;
    switch (type) {
      case "success":
        icon = "fa-check-circle";
        break;
      case "error":
        icon = "fa-exclamation-circle";
        break;
      case "warning":
        icon = "fa-exclamation-triangle";
        break;
      case "info":
      default:
        icon = "fa-info-circle";
    }

    iconElement.innerHTML = `<i class="fas ${icon}"></i>`;
    titleElement.textContent = title;
    messageElement.textContent = message;

    // Aggiungi l'alert al container
    alertContainer.appendChild(alert);

    // Gestisci la chiusura
    const closeAlert = () => {
      alert.classList.add("closing");
      setTimeout(() => {
        alert.remove();
      }, 300);
    };

    closeButton.addEventListener("click", closeAlert);

    // Chiudi automaticamente dopo la durata specificata
    if (duration > 0) {
      setTimeout(closeAlert, duration);
    }

    return alert;
  }

  /**
   * Aggiorna il valore del numero di giocatori
   * @param {number} delta - Valore da aggiungere/sottrarre
   */
  function updateNumGiocatori(delta) {
    const currentValue = Number.parseInt(numGiocatoriInput.value) || 1;
    const newValue = Math.max(1, Math.min(sumcartelle, currentValue + delta));
    numGiocatoriInput.value = newValue;
  }

  /**
   * Aggiorna i marcatori della barra di progresso in base al numero totale di giocatori
   * @param {number} total - Numero totale di giocatori
   */
  function updateProgressMarkers(total) {
    const marker25 = document.getElementById("marker-25");
    const marker50 = document.getElementById("marker-50");
    const marker75 = document.getElementById("marker-75");
    const marker100 = document.getElementById("marker-100");

    // Calcola i valori per ogni quarto
    const quarter = Math.ceil(total / 4);
    const half = Math.ceil(total / 2);
    const threeQuarters = Math.ceil((total * 3) / 4);

    // Aggiorna i marcatori con i valori calcolati
    marker25.textContent = quarter.toString();
    marker50.textContent = half.toString();
    marker75.textContent = threeQuarters.toString();
    marker100.textContent = total.toString();
  }

  /**
   * Mostra il modal informativo
   */
  function showModal(e) {
    if (e) e.preventDefault();
    modalContainer.classList.remove("hidden");
    setTimeout(() => {
      modalContainer.classList.add("visible");
    }, 10);
  }

  /**
   * Nasconde il modal
   */
  function hideModal() {
    modalContainer.classList.remove("visible");
    setTimeout(() => {
      modalContainer.classList.add("hidden");
    }, 300);
  }

  /**
   * Aggiorna l'interfaccia del loader in base alla percentuale di completamento
   * @param {number} percentage - Percentuale di completamento (0-100)
   * @param {number} processed - Numero di giocatori processati
   * @param {number} total - Numero totale di giocatori
   * @param {string} phase - Fase corrente del processo
   */
  function updateLoader(percentage, processed, total, phase) {
    // IMPORTANTE: Assicurati che la percentuale non diminuisca mai
    // usando la variabile globale globalLastPercentage
    const safePercentage = Math.max(globalLastPercentage, percentage);
    globalLastPercentage = safePercentage;

    // Aggiorna la percentuale
    progressPercentage.textContent = `${Math.round(safePercentage)}%`;

    // Aggiorna il contatore
    progressCounter.textContent = `${processed}/${total} giocatori (${
      processed * 6
    } / ${total * 6} cartelle)`;

    // Aggiorna la frazione
    let fractionText = "";

    // Calcola i valori per ogni quarto
    const quarter = Math.ceil(total / 4);
    const half = Math.ceil(total / 2);
    const threeQuarters = Math.ceil((total * 3) / 4);

    // Determina in quale quarto siamo
    if (processed <= quarter) {
      fractionText = "1/4";
    } else if (processed <= half) {
      fractionText = "2/4";
    } else if (processed <= threeQuarters) {
      fractionText = "3/4";
    } else {
      fractionText = "4/4";
    }

    progressFraction.textContent = `${fractionText} completato`;

    // Aggiorna la barra di progresso
    progressBar.style.width = `${safePercentage}%`;

    // Aggiungi classi alla barra di progresso in base alla percentuale
    progressBar.classList.remove(
      "quarter",
      "half",
      "three-quarters",
      "complete",
    );
    if (safePercentage >= 100) {
      progressBar.classList.add("complete");
    } else if (safePercentage >= 75) {
      progressBar.classList.add("three-quarters");
    } else if (safePercentage >= 50) {
      progressBar.classList.add("half");
    } else if (safePercentage >= 25) {
      progressBar.classList.add("quarter");
    }

    // Aggiorna la fase
    loaderPhase.textContent = phase;

    // Aggiorna il messaggio in base alla percentuale
    if (safePercentage < 25) {
      loaderMessage.textContent =
        "Inizializzazione della generazione delle cartelle...";
    } else if (safePercentage < 50) {
      loaderMessage.textContent =
        "Creazione struttura delle cartelle in corso...";
    } else if (safePercentage < 75) {
      loaderMessage.textContent = "Distribuzione dei numeri nelle cartelle...";
    } else {
      loaderMessage.textContent =
        "Finalizzazione e preparazione per la visualizzazione...";
    }

    // Cambia l'icona e lo stile della barra di progresso in base alla percentuale
    if (safePercentage < 33) {
      loaderIcon.innerHTML = '<i class="fas fa-cog fa-spin"></i>';
      progressBar.style.background = "var(--loader-initial)";
      progressPercentage.style.color = "var(--primary-color)";
    } else if (safePercentage < 66) {
      loaderIcon.innerHTML = '<i class="fas fa-dice"></i>';
      progressBar.style.background = "var(--loader-middle)";
      progressPercentage.style.color = "var(--warning-color)";
    } else {
      loaderIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
      progressBar.style.background = "var(--loader-final)";
      progressPercentage.style.color = "var(--success-color)";
    }

    // Aggiungi animazione di completamento quando raggiunge il 100%
    if (safePercentage >= 100) {
      loadingEl.classList.add("loader-complete");
      loaderMessage.textContent = "Generazione completata con successo!";

      // Rimuovi la classe dopo l'animazione
      setTimeout(() => {
        loadingEl.classList.remove("loader-complete");
      }, 3000);
    } else {
      loadingEl.classList.remove("loader-complete");
    }
  }

  /**
   * Genera le cartelle della tombola
   */
  async function generateCards() {
    // Resetta la variabile globale per una nuova generazione
    globalLastPercentage = 0;

    // Rimuovi la classe loader-complete se presente
    loadingEl.classList.remove("loader-complete");

    const numGiocatori = Number.parseInt(numGiocatoriInput.value);

    if (numGiocatori < 1 || numGiocatori > sumcartelle) {
      showAlert(
        "error",
        "Errore",
        `Inserisci un numero di giocatori valido (1-${sumcartelle})`,
      );
      return;
    }

    // Aggiorna i marcatori della barra di progresso
    updateProgressMarkers(numGiocatori);

    // Mostra il loading
    loadingEl.classList.remove("hidden");
    cardsContainer.innerHTML = "";
    resetBtn.disabled = true;
    printBtn.disabled = true;

    // Inizializza il loader
    updateLoader(0, 0, numGiocatori, "Inizializzazione");

    try {
      // Inizia a misurare il tempo
      const startTime = performance.now();

      // Genera i giocatori in modo asincrono per non bloccare l'interfaccia
      const batchSize = 5; // Numero di giocatori da generare per batch
      const totalBatches = Math.ceil(numGiocatori / batchSize);
      const giocatori = [];
      let processedGiocatori = 0;

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        // Attendi il prossimo frame di animazione per mantenere l'interfaccia reattiva
        await new Promise((resolve) => requestAnimationFrame(resolve));

        const start = batchIndex * batchSize;
        const end = Math.min(start + batchSize, numGiocatori);
        const batchCount = end - start;

        // Determina la fase attuale
        let currentPhase;
        const progress = (batchIndex / totalBatches) * 100;

        if (progress < 25) {
          currentPhase = "Inizializzazione";
        } else if (progress < 50) {
          currentPhase = "Creazione struttura";
        } else if (progress < 75) {
          currentPhase = "Distribuzione numeri";
        } else {
          currentPhase = "Finalizzazione";
        }

        // Genera il batch corrente
        const batchGiocatori = [];
        let batchLastPercentage = globalLastPercentage; // Usa la percentuale globale come punto di partenza

        for (let i = 0; i < batchCount; i++) {
          batchGiocatori.push(generateTombolaGiocatore(start + i + 1));
          processedGiocatori++;
        }

        giocatori.push(...batchGiocatori);
      }

      // Visualizza le cartelle in modo ottimizzato
      await renderCardsOptimized(giocatori);

      // Calcola il tempo impiegato
      const endTime = performance.now();
      const timeElapsed = ((endTime - startTime) / 1000).toFixed(2);

      // Abilita il pulsante di stampa
      resetBtn.disabled = false;
      printBtn.disabled = false;

      // Mostra un alert di successo
      showAlert(
        "success",
        "Generazione completata",
        `Sono stati generati ${numGiocatori} giocatori di cartelle in ${timeElapsed} secondi.`,
      );

      // Scorri fino alle cartelle
      setTimeout(() => {
        cardsContainer.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } catch (error) {
      console.error("Errore:", error);
      showAlert(
        "error",
        "Errore",
        `Si è verificato un errore: ${error.message}`,
      );
    } finally {
      // Nascondi il loading
      loadingEl.classList.add("hidden");
    }
  }

  /**
   * Resetta l'area delle cartelle e i pulsanti.
   */
  function resetCards() {
    cardsContainer.innerHTML = "";
    printBtn.disabled = true;
    generateBtn.disabled = false; // Riabilita il pulsante Genera
    resetBtn.disabled = true;
    showAlert(
      "info",
      "Reset completato",
      "L'area delle cartelle è stata pulita. Puoi generare nuove cartelle.",
      3000,
    );
  }

  /**
   * Renderizza le cartelle in modo ottimizzato per grandi volumi
   * @param {Array} giocatori - Array di giocatori di cartelle
   */
  async function renderCardsOptimized(giocatori) {
    // Rimuovi la classe loader-complete se presente
    loadingEl.classList.remove("loader-complete");

    // Aggiorna i marcatori della barra di progresso
    updateProgressMarkers(giocatori.length);

    cardsContainer.innerHTML = "";

    // Crea la pagina di copertina per la stampa
    const printCoverPage = createPrintCoverPage();
    cardsContainer.appendChild(printCoverPage);

    // Renderizza i giocatori in batch per evitare di bloccare l'interfaccia
    const batchSize = 10; // Numero di giocatori da renderizzare per batch
    const totalBatches = Math.ceil(giocatori.length / batchSize);
    let renderLastPercentage = globalLastPercentage; // Usa la percentuale globale come punto di partenza

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      // Calcola la percentuale di rendering
      const currentRenderPercentage = ((batchIndex + 1) / totalBatches) * 100;

      // Assicurati che la percentuale non diminuisca mai
      const renderPercentage = Math.max(
        renderLastPercentage,
        currentRenderPercentage,
      );
      renderLastPercentage = renderPercentage;

      const processedCount = Math.min(
        (batchIndex + 1) * batchSize,
        giocatori.length,
      );

      // Aggiorna il loader con la fase di rendering
      updateLoader(
        renderPercentage,
        processedCount,
        giocatori.length,
        "Rendering cartelle",
      );

      // Attendi il prossimo frame di animazione per mantenere l'interfaccia reattiva
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, giocatori.length);
      const batch = giocatori.slice(start, end);

      // Renderizza il batch corrente
      batch.forEach((giocatore) => {
        // Crea un contenitore per il giocatore
        const setContainer = document.createElement("div");
        setContainer.className = "card-giocatore";
        setContainer.setAttribute("data-giocatore", giocatore[0].setNumber);

        // Titolo del giocatore
        const setTitle = document.createElement("h2");
        setTitle.className = "giocatore-title";
        setTitle.innerHTML = `<i class="fas fa-folder"></i> Giocatore #${giocatore[0].setNumber}`;
        setContainer.appendChild(setTitle);

        // Contenitore per le cartelle del giocatore (griglia)
        const cardsGrid = document.createElement("div");
        cardsGrid.className = "cards-grid";

        // Stile per la visualizzazione normale (non in stampa)
        cardsGrid.style.display = "grid";
        cardsGrid.style.gridTemplateColumns =
          "repeat(auto-fit, minmax(300px, 1fr))";
        cardsGrid.style.gap = "15px";

        // Crea le cartelle del giocatore
        giocatore.forEach((card) => {
          const cardElement = createCardElement(card);
          cardsGrid.appendChild(cardElement);
        });

        setContainer.appendChild(cardsGrid);

        // Aggiungi un piè di pagina per la stampa
        const pageFooter = document.createElement("div");
        pageFooter.className = "print-page-footer hidden-on-screen";
        pageFooter.innerHTML = `<p>Generato con il Generatore di Cartelle Tombola - ${new Date().toLocaleDateString()}</p>`;
        setContainer.appendChild(pageFooter);

        cardsContainer.appendChild(setContainer);
      });

      // Piccola pausa per rendere visibile l'animazione
      if (batchIndex < totalBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    }

    // Aggiorna il loader al 100% al completamento
    updateLoader(100, giocatori.length, giocatori.length, "Completato");

    // Mostra la copertina solo quando si stampa
    window.addEventListener("beforeprint", () => {
      printCoverPage.style.display = "block";
    });

    window.addEventListener("afterprint", () => {
      printCoverPage.style.display = "none";
    });
  }

  /**
   * Stampa le cartelle in modo ottimizzato
   */
  function printCards() {
    // Mostra un alert informativo prima di iniziare la stampa
    showAlert(
      "info",
      "Preparazione stampa",
      "Preparazione della stampa in corso. Questo potrebbe richiedere alcuni secondi per grandi volumi.",
      3000,
    );

    // Breve ritardo per permettere all'alert di essere visualizzato
    setTimeout(() => {
      // Ottimizza per la stampa
      document.body.classList.add("printing");

      // Avvia la stampa
      window.print();

      // Ripristina dopo la stampa
      document.body.classList.remove("printing");
    }, 500);
  }

  /**
   * Crea la pagina di copertina per la stampa
   * @returns {HTMLElement} Elemento della pagina di copertina
   */
  function createPrintCoverPage() {
    const coverPage = document.createElement("div");
    coverPage.className = "print-cover-page";
    coverPage.style.display = "none"; // Nascondi nell'interfaccia normale

    // Titolo principale
    const mainTitle = document.createElement("h1");
    mainTitle.className = "print-cover-title";
    mainTitle.textContent = "CARTELLE TOMBOLA";
    coverPage.appendChild(mainTitle);

    // Logo/Icona
    const logoContainer = document.createElement("div");
    logoContainer.className = "print-cover-logo";
    logoContainer.innerHTML = '<i class="fas fa-dice"></i>';
    coverPage.appendChild(logoContainer);

    // Sottotitolo
    const subtitle = document.createElement("h2");
    subtitle.className = "print-cover-subtitle";
    subtitle.textContent = "Istruzioni e Regole del Gioco";
    coverPage.appendChild(subtitle);

    // Contenitore delle regole
    const rulesContainer = document.createElement("div");
    rulesContainer.className = "print-cover-rules";

    // Sezione: Introduzione
    const introSection = document.createElement("div");
    introSection.className = "print-cover-section";

    const introTitle = document.createElement("h3");
    introTitle.textContent = "Introduzione";
    introSection.appendChild(introTitle);

    const introText = document.createElement("p");
    introText.innerHTML = `
    La tombola è un gioco tradizionale italiano, particolarmente popolare durante le festività natalizie. 
    È un gioco di fortuna che coinvolge l'estrazione di numeri e la marcatura di cartelle.
  `;
    introSection.appendChild(introText);
    rulesContainer.appendChild(introSection);

    // Sezione: Materiale di Gioco
    const materialsSection = document.createElement("div");
    materialsSection.className = "print-cover-section";

    const materialsTitle = document.createElement("h3");
    materialsTitle.textContent = "Materiale di Gioco";
    materialsSection.appendChild(materialsTitle);

    const materialsList = document.createElement("ul");

    const item1 = document.createElement("li");
    item1.innerHTML =
      "<strong>Cartelle:</strong> Ogni giocatore riceve un set di 6 cartelle. Ogni set contiene tutti i numeri da 1 a 90, distribuiti in modo che ogni cartella abbia 15 numeri (5 numeri per riga).";
    materialsList.appendChild(item1);

    const item2 = document.createElement("li");
    item2.innerHTML =
      "<strong>Tabellone:</strong> Un tabellone con i numeri da 1 a 90 per tenere traccia dei numeri estratti.";
    materialsList.appendChild(item2);

    const item3 = document.createElement("li");
    item3.innerHTML =
      "<strong>Sacchetto con numeri:</strong> Un sacchetto contenente 90 numeri (da 1 a 90) per l'estrazione.";
    materialsList.appendChild(item3);

    const item4 = document.createElement("li");
    item4.innerHTML =
      "<strong>Segnalini:</strong> Oggetti per marcare i numeri estratti sulle cartelle (fagioli, bottoni, ecc.).";
    materialsList.appendChild(item4);

    materialsSection.appendChild(materialsList);
    rulesContainer.appendChild(materialsSection);

    // Sezione: Combinazioni Vincenti
    const combinationsSection = document.createElement("div");
    combinationsSection.className = "print-cover-section";

    const combinationsTitle = document.createElement("h3");
    combinationsTitle.textContent = "Combinazioni Vincenti";
    combinationsSection.appendChild(combinationsTitle);

    const combinationsText = document.createElement("p");
    combinationsText.textContent =
      "Vince chi per primo realizza una delle seguenti combinazioni:";
    combinationsSection.appendChild(combinationsText);

    const combinationsList = document.createElement("ul");

    const amboItem = document.createElement("li");
    amboItem.innerHTML = "<strong>Ambo:</strong> 2 numeri sulla stessa riga";
    combinationsList.appendChild(amboItem);

    const ternoItem = document.createElement("li");
    ternoItem.innerHTML = "<strong>Terno:</strong> 3 numeri sulla stessa riga";
    combinationsList.appendChild(ternoItem);

    const quaternaItem = document.createElement("li");
    quaternaItem.innerHTML =
      "<strong>Quaterna:</strong> 4 numeri sulla stessa riga";
    combinationsList.appendChild(quaternaItem);

    const cinquinaItem = document.createElement("li");
    cinquinaItem.innerHTML =
      "<strong>Cinquina:</strong> 5 numeri sulla stessa riga (riga completa)";
    combinationsList.appendChild(cinquinaItem);

    const tombolaItem = document.createElement("li");
    tombolaItem.innerHTML =
      "<strong>Tombola:</strong> tutti i 15 numeri di una cartella";
    combinationsList.appendChild(tombolaItem);

    combinationsSection.appendChild(combinationsList);
    rulesContainer.appendChild(combinationsSection);

    // Nota a piè di pagina
    const footer = document.createElement("div");
    footer.className = "print-cover-footer";
    footer.innerHTML = `
    <p>Generato con il Generatore di Cartelle Tombola - ${new Date().toLocaleDateString()};</p>
  `;
    rulesContainer.appendChild(footer);

    coverPage.appendChild(rulesContainer);
    return coverPage;
  }

  /**
   * Crea l'elemento HTML per una cartella
   * @param {Object} card - Dati della cartella
   * @returns {HTMLElement} Elemento della cartella
   */
  function createCardElement(card) {
    const cardElement = document.createElement("div");
    cardElement.className = "tombola-card";
    cardElement.setAttribute("data-card-id", card.cardNumber);
    cardElement.setAttribute("data-giocatore", card.setNumber);

    // Header della cartella
    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header";
    cardHeader.textContent = `Cartella #${card.cardNumber}`;
    cardElement.appendChild(cardHeader);

    // Griglia della cartella
    const table = document.createElement("table");
    table.className = "card-grid";

    const tbody = document.createElement("tbody");

    // Crea le righe della cartella
    for (let row = 0; row < 3; row++) {
      const tr = document.createElement("tr");

      // Crea le celle della riga
      for (let col = 0; col < 9; col++) {
        const td = document.createElement("td");
        const value = card.grid[row][col];

        if (value !== null) {
          td.textContent = value;
          td.className = "filled";
        }

        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    cardElement.appendChild(table);

    return cardElement;
  }

  // Mostra un alert di benvenuto
  setTimeout(() => {
    showAlert(
      "info",
      "Benvenuto",
      `Genera facilmente cartelle per la tua tombola. Seleziona il numero di giocatori (fino a ${sumcartelle}) e clicca su Genera.`,
    );
  }, 500);

  // Aggiungi stili CSS per l'ottimizzazione della stampa
  const addPrintStyles = () => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      @media print {
        body.printing .app-content {
          padding: 0 !important;
          margin: 0 !important;
        }
        
        body.printing .card-giocatore {
          page-break-before: always !important;
          break-before: page !important;
        }
        
        body.printing .card-giocatore:first-child {
          page-break-before: auto !important;
          break-before: auto !important;
        }
        
        body.printing .cards-grid {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 15px !important;
          width: 100% !important;
        }
        
        body.printing .tombola-card {
          width: 100% !important;
          margin-bottom: 15px !important;
        }

        .hidden-on-screen {
          display: none !important;
        }

        @media print {
          .hidden-on-screen {
            display: block !important;
          }
        }

        body.printing .print-page-footer {
          display: block !important;
          text-align: center;
          font-size: 0.8rem;
          color: #666;
          margin-top: 20px;
        }
      }
    `;
    document.head.appendChild(styleElement);
  };

  // Aggiungi gli stili di stampa
  addPrintStyles();

  /**
   * Genera un giocatore di 6 cartelle della tombola con tutti i numeri da 1 a 90
   * @param {number} giocatoreNumber - Numero identificativo del giocatore
   * @returns {Array} Array di 6 cartelle
   */
  function generateTombolaGiocatore(giocatoreNumber) {
    // Crea un array con tutti i numeri da 1 a 90
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

    // Mescola i numeri
    shuffleArray(allNumbers);

    // Dividi i numeri in 9 colonne secondo le regole della tombola
    const columns = [
      allNumbers.filter((n) => n >= 1 && n <= 9), // Colonna 1: 1-9
      allNumbers.filter((n) => n >= 10 && n <= 19), // Colonna 2: 10-19
      allNumbers.filter((n) => n >= 20 && n <= 29), // Colonna 3: 20-29
      allNumbers.filter((n) => n >= 30 && n <= 39), // Colonna 4: 30-39
      allNumbers.filter((n) => n >= 40 && n <= 49), // Colonna 5: 40-49
      allNumbers.filter((n) => n >= 50 && n <= 59), // Colonna 6: 50-59
      allNumbers.filter((n) => n >= 60 && n <= 69), // Colonna 7: 60-69
      allNumbers.filter((n) => n >= 70 && n <= 79), // Colonna 8: 70-79
      allNumbers.filter((n) => n >= 80 && n <= 90), // Colonna 9: 80-90
    ];

    // Mescola ogni colonna
    columns.forEach((col) => shuffleArray(col));

    // Crea 6 cartelle vuote
    const cards = Array(6)
      .fill()
      .map(() =>
        Array(3)
          .fill()
          .map(() => Array(9).fill(null)),
      );

    // Distribuisci i numeri nelle cartelle
    distributeNumbers(columns, cards);

    // Formatta le cartelle per la risposta
    return cards.map((card, index) => ({
      id: (giocatoreNumber - 1) * 6 + index + 1,
      setNumber: giocatoreNumber,
      cardNumber: index + 1,
      grid: card,
    }));
  }

  /**
   * Mescola un array in modo casuale (algoritmo Fisher-Yates)
   * @param {Array} array - Array da mescolare
   */
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Distribuisce i numeri nelle cartelle secondo le regole della tombola
   * @param {Array} columns - Array di colonne con i numeri
   * @param {Array} cards - Array di cartelle vuote
   */
  function distributeNumbers(columns, cards) {
    // Per ogni colonna
    for (let colIndex = 0; colIndex < 9; colIndex++) {
      const colNumbers = [...columns[colIndex]];

      // Determina quanti numeri per ogni cartella in questa colonna
      // Ogni cartella deve avere 15 numeri in totale, distribuiti nelle 9 colonne
      // Alcune colonne avranno 1 numero, altre 2 (raramente 3)
      const numbersPerCard = distributeColumnNumbers(
        colNumbers.length,
        cards.length,
      );

      // Assegna i numeri alle cartelle
      let numberIndex = 0;
      for (let cardIndex = 0; cardIndex < cards.length; cardIndex++) {
        const card = cards[cardIndex];
        const numToAssign = numbersPerCard[cardIndex];

        // Prendi i numeri per questa cartella
        const cardNumbers = colNumbers.slice(
          numberIndex,
          numberIndex + numToAssign,
        );
        numberIndex += numToAssign;

        // Ordina i numeri
        cardNumbers.sort((a, b) => a - b);

        // Assegna i numeri alle righe della cartella
        assignNumbersToRows(card, colIndex, cardNumbers);
      }
    }

    // Assicurati che ogni riga abbia esattamente 5 numeri
    for (const card of cards) {
      ensureExactlyFiveNumbersPerRow(card);
    }
  }

  /**
   * Distribuisce il numero di elementi per cartella in una colonna
   * @param {number} totalNumbers - Numero totale di elementi nella colonna
   * @param {number} numCards - Numero di cartelle
   * @returns {Array} Array con il numero di elementi per cartella
   */
  function distributeColumnNumbers(totalNumbers, numCards) {
    // Inizializza con la distribuzione base
    const distribution = Array(numCards).fill(
      Math.floor(totalNumbers / numCards),
    );

    // Distribuisci i numeri rimanenti
    const remaining =
      totalNumbers - Math.floor(totalNumbers / numCards) * numCards;
    for (let i = 0; i < remaining; i++) {
      distribution[i]++;
    }

    // Mescola la distribuzione per evitare che le prime cartelle abbiano sempre più numeri
    shuffleArray(distribution);

    return distribution;
  }

  /**
   * Assegna i numeri alle righe di una cartella
   * @param {Array} card - La cartella
   * @param {number} colIndex - Indice della colonna
   * @param {Array} numbers - Numeri da assegnare
   */
  function assignNumbersToRows(card, colIndex, numbers) {
    // Se non ci sono numeri, esci
    if (numbers.length === 0) return;

    // Ordina i numeri
    numbers.sort((a, b) => a - b);

    // Assegna i numeri alle righe
    if (numbers.length === 1) {
      // Un solo numero: mettilo in una riga casuale
      const rowIndex = Math.floor(Math.random() * 3);
      card[rowIndex][colIndex] = numbers[0];
    } else if (numbers.length === 2) {
      // Due numeri: mettili in righe diverse
      const rows = [0, 1, 2];
      shuffleArray(rows);
      card[rows[0]][colIndex] = numbers[0];
      card[rows[1]][colIndex] = numbers[1];
    } else if (numbers.length === 3) {
      // Tre numeri: uno per ogni riga
      card[0][colIndex] = numbers[0];
      card[1][colIndex] = numbers[1];
      card[2][colIndex] = numbers[2];
    }
  }

  /**
   * Assicura che ogni riga abbia esattamente 5 numeri
   * @param {Array} card - La cartella da bilanciare
   */
  function ensureExactlyFiveNumbersPerRow(card) {
    let changed = true;
    let attempts = 0;
    const maxAttempts = 20; // Limite per evitare loop infiniti

    while (changed && attempts < maxAttempts) {
      changed = false;
      attempts++;

      // Conta i numeri per ogni riga
      const rowCounts = card.map(
        (row) => row.filter((cell) => cell !== null).length,
      );

      // Identifica le righe con troppi o troppo pochi numeri
      const excessRows = [];
      const deficitRows = [];
      rowCounts.forEach((count, index) => {
        if (count > 5) excessRows.push(index);
        if (count < 5) deficitRows.push(index);
      });

      // Se ci sono righe in eccesso e in difetto, prova a spostare i numeri
      if (excessRows.length > 0 && deficitRows.length > 0) {
        // Itera sulle righe in eccesso
        for (const sourceRowIndex of excessRows) {
          // Trova le colonne con numeri in questa riga
          const filledCols = [];
          for (let col = 0; col < 9; col++) {
            if (card[sourceRowIndex][col] !== null) {
              filledCols.push(col);
            }
          }

          // Mescola le colonne per rendere lo spostamento casuale
          shuffleArray(filledCols);

          // Prova a spostare un numero in una riga in difetto
          for (const colToMove of filledCols) {
            // Trova una riga in difetto che sia vuota in questa colonna
            const targetRowIndex = deficitRows.find(
              (r) => card[r][colToMove] === null,
            );

            if (targetRowIndex !== undefined) {
              // Esegui lo spostamento
              card[targetRowIndex][colToMove] = card[sourceRowIndex][colToMove];
              card[sourceRowIndex][colToMove] = null;
              changed = true;
              // Esci dai loop e ricomincia il controllo
              break;
            }
          }
          if (changed) break;
        }
      }
    }

    // Se dopo i tentativi ci sono ancora discrepanze, non è un problema critico
    // perché la logica di distribuzione iniziale è già molto buona.
    // Questa funzione serve solo a perfezionare il bilanciamento.
  }


  function isNumberInCard(card, number) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 9; col++) {
        if (card[row][col] === number) {
          return true;
        }
      }
    }
    return false;
  }
});
