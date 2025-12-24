document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM
  const numGiocatoriInput = document.getElementById("numGiocatori");
  const decreaseBtn = document.querySelector(".decrease");
  const increaseBtn = document.querySelector(".increase");
  const generateBtn = document.getElementById("generateBtn");
  const printBtn = document.getElementById("printBtn");
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
  let globalLastPercentage = 0;

  // Imposta l'attributo max sull'input
  numGiocatoriInput.max = sumcartelle;

  // Event listeners
  generateBtn.addEventListener("click", generateCards);
  printBtn.addEventListener("click", printCards);
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
    const safePercentage = Math.max(globalLastPercentage, percentage);
    globalLastPercentage = safePercentage;

    // Aggiorna la percentuale
    progressPercentage.textContent = `${Math.round(safePercentage)}%`;

    // Aggiorna il contatore
    progressCounter.textContent = `${processed}/${total} giocatori`;

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
      "complete"
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
        `Inserisci un numero di giocatori valido (1-${sumcartelle})`
      );
      return;
    }

    // Aggiorna i marcatori della barra di progresso
    updateProgressMarkers(numGiocatori);

    // Mostra il loading
    loadingEl.classList.remove("hidden");
    cardsContainer.innerHTML = "";
    printBtn.disabled = true;

    // Inizializza il loader
    updateLoader(0, 0, numGiocatori, "Inizializzazione");

    try {
      // Inizia a misurare il tempo
      const startTime = performance.now();

      // Genera i giocatori in modo asincrono
      const batchSize = 5;
      const totalBatches = Math.ceil(numGiocatori / batchSize);
      const giocatori = [];
      let processedGiocatori = 0;

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
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

        const batchGiocatori = [];
        let batchLastPercentage = globalLastPercentage;

        for (let i = 0; i < batchCount; i++) {
          batchGiocatori.push(generateTombolaGiocatore(start + i + 1));
          processedGiocatori++;

          const currentPercentage = (processedGiocatori / numGiocatori) * 100;
          const percentage = Math.max(batchLastPercentage, currentPercentage);
          batchLastPercentage = percentage;

          updateLoader(
            percentage,
            processedGiocatori,
            numGiocatori,
            currentPhase
          );

          if (processedGiocatori % 2 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 10));
          }
        }

        giocatori.push(...batchGiocatori);
      }

      // Visualizza le cartelle
      await renderCardsOptimized(giocatori);

      // Calcola il tempo impiegato
      const endTime = performance.now();
      const timeElapsed = ((endTime - startTime) / 1000).toFixed(2);

      // Abilita il pulsante di stampa
      printBtn.disabled = false;

      // Mostra un alert di successo
      showAlert(
        "success",
        "Generazione completata",
        `Sono stati generati ${numGiocatori} giocatori di cartelle in ${timeElapsed} secondi.`
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
        `Si è verificato un errore: ${error.message}`
      );
    } finally {
      // Nascondi il loading
      loadingEl.classList.add("hidden");
    }
  }

  /**
   * Genera 6 cartelle per un giocatore garantendo TUTTI i 90 numeri senza blocchi
   */
  function generateTombolaGiocatore(giocatoreNumber) {
    let success = false;
    let cards;

    // Ripete il tentativo di generazione se la logica si blocca
    while (!success) {
      try {
        // 1. CREAZIONE DELLE 9 COLONNE (90 numeri)
        const columns = [[], [], [], [], [], [], [], [], []];
        for (let n = 1; n <= 90; n++) {
          let colIndex = Math.floor(n / 10);
          if (n === 90) colIndex = 8;
          columns[colIndex].push(n);
        }
        columns.forEach((col) => shuffleArray(col));

        // 2. CREAZIONE DELLE 6 CARTELLE VUOTE
        cards = Array.from({ length: 6 }, () =>
          Array.from({ length: 3 }, () => Array(9).fill(null))
        );

        // FASE 1: Distribuzione obbligatoria (1 numero per colonna in ogni cartella)
        for (let c = 0; c < 9; c++) {
          for (let k = 0; k < 6; k++) {
            const row = Math.floor(Math.random() * 3);
            cards[k][row][c] = columns[c].pop();
          }
        }

        // FASE 2: Distribuzione dei restanti 36 numeri
        for (let c = 0; c < 9; c++) {
          while (columns[c].length > 0) {
            const num = columns[c].pop();
            let placed = false;
            const shuffledIndices = [0, 1, 2, 3, 4, 5];
            shuffleArray(shuffledIndices);

            for (let k of shuffledIndices) {
              const totalInCard = cards[k]
                .flat()
                .filter((n) => n !== null).length;
              const colCount = [0, 1, 2].filter(
                (r) => cards[k][r][c] !== null
              ).length;

              if (totalInCard < 15 && colCount < 3) {
                const rows = [0, 1, 2];
                shuffleArray(rows);
                for (let r of rows) {
                  if (cards[k][r][c] === null) {
                    cards[k][r][c] = num;
                    placed = true;
                    break;
                  }
                }
              }
              if (placed) break;
            }
            if (!placed) throw new Error("Incastro"); // Se un numero non trova posto, ricomincia
          }
        }

        // FASE 3: Bilanciamento righe con protezione loop infinito
        cards.forEach((card) => {
          let iterations = 0;
          while (iterations < 50) {
            const counts = card.map((r) => r.filter((n) => n !== null).length);
            const high = counts.findIndex((c) => c > 5);
            const low = counts.findIndex((c) => c < 5);
            if (high === -1 || low === -1) break;

            let moved = false;
            for (let c = 0; c < 9; c++) {
              if (card[high][c] !== null && card[low][c] === null) {
                card[low][c] = card[high][c];
                card[high][c] = null;
                moved = true;
                break;
              }
            }
            if (!moved) break;
            iterations++;
          }
          // Verifica finale: ogni riga deve avere esattamente 5 numeri
          if (card.some((r) => r.filter((n) => n !== null).length !== 5)) {
            throw new Error("Bilanciamento fallito");
          }
        });

        success = true; // Se arriva qui, la generazione è riuscita
      } catch (e) {
        success = false; // Ricomincia il ciclo while
      }
    }

    // FASE 4: Ordinamento verticale per colonna
    cards.forEach((card) => {
      for (let c = 0; c < 9; c++) {
        const colValues = [card[0][c], card[1][c], card[2][c]]
          .filter((v) => v !== null)
          .sort((a, b) => a - b);
        let idx = 0;
        for (let r = 0; r < 3; r++) {
          if (card[r][c] !== null) card[r][c] = colValues[idx++];
        }
      }
    });

    return cards.map((grid, index) => ({
      id: (giocatoreNumber - 1) * 6 + index + 1,
      setNumber: giocatoreNumber,
      cardNumber: index + 1,
      grid: grid,
    }));
  }

  /**
   * Bilancia le righe di una cartella per avere esattamente 5 numeri per riga
   */
  function balanceCardRows(card) {
    let iterations = 0;
    while (iterations < 100) {
      const counts = card.map((r) => r.filter((n) => n !== null).length);
      const high = counts.findIndex((c) => c > 5);
      const low = counts.findIndex((c) => c < 5);

      if (high === -1 || low === -1) break;

      let moved = false;
      for (let c = 0; c < 9; c++) {
        if (card[high][c] !== null && card[low][c] === null) {
          card[low][c] = card[high][c];
          card[high][c] = null;
          moved = true;
          break;
        }
      }
      if (!moved) break;
      iterations++;
    }
  }

  /**
   * Mescola un array in modo casuale (algoritmo Fisher-Yates)
   */
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Renderizza le cartelle in modo ottimizzato per grandi volumi
   * @param {Array} giocatori - Array di giocatori di cartelle
   */
  async function renderCardsOptimized(giocatori) {
    loadingEl.classList.remove("loader-complete");
    updateProgressMarkers(giocatori.length);

    cardsContainer.innerHTML = "";

    // Crea la pagina di copertina per la stampa
    const printCoverPage = createPrintCoverPage();
    cardsContainer.appendChild(printCoverPage);

    // Renderizza i giocatori in batch
    const batchSize = 10;
    const totalBatches = Math.ceil(giocatori.length / batchSize);
    let renderLastPercentage = globalLastPercentage;

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const currentRenderPercentage = ((batchIndex + 1) / totalBatches) * 100;
      const renderPercentage = Math.max(
        renderLastPercentage,
        currentRenderPercentage
      );
      renderLastPercentage = renderPercentage;

      const processedCount = Math.min(
        (batchIndex + 1) * batchSize,
        giocatori.length
      );

      updateLoader(
        renderPercentage,
        processedCount,
        giocatori.length,
        "Rendering cartelle"
      );

      await new Promise((resolve) => requestAnimationFrame(resolve));

      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, giocatori.length);
      const batch = giocatori.slice(start, end);

      batch.forEach((giocatore) => {
        const setContainer = document.createElement("div");
        setContainer.className = "card-giocatore";
        setContainer.setAttribute("data-giocatore", giocatore[0].setNumber);

        const setTitle = document.createElement("h2");
        setTitle.className = "giocatore-title";
        setTitle.innerHTML = `<i class="fas fa-folder"></i> Giocatore #${giocatore[0].setNumber}`;
        setContainer.appendChild(setTitle);

        const cardsGrid = document.createElement("div");
        cardsGrid.className = "cards-grid";
        cardsGrid.style.display = "grid";
        cardsGrid.style.gridTemplateColumns =
          "repeat(auto-fit, minmax(300px, 1fr))";
        cardsGrid.style.gap = "15px";

        giocatore.forEach((card) => {
          const cardElement = createCardElement(card);
          cardsGrid.appendChild(cardElement);
        });

        setContainer.appendChild(cardsGrid);
        cardsContainer.appendChild(setContainer);
      });

      if (batchIndex < totalBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    }

    updateLoader(100, giocatori.length, giocatori.length, "Completato");

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
    showAlert(
      "info",
      "Preparazione stampa",
      "Sul telefono, dopo il popup di stampa potrebbe volerci qualche secondo per caricare tutte le pagine.",
      3000
    );

    document.body.classList.add("printing");

    // tenta di sfruttare beforeprint/afterprint dove esistono
    const cleanUp = () => document.body.classList.remove("printing");

    if ("onafterprint" in window) {
      const handler = () => {
        cleanUp();
        window.removeEventListener("afterprint", handler);
      };
      window.addEventListener("afterprint", handler);
      window.print();
    } else {
      // fallback (molti mobile): rimuovi la classe dopo un po'
      window.print();
      setTimeout(cleanUp, 3000);
    }
  }

  /**
   * Crea la pagina di copertina per la stampa
   */
  function createPrintCoverPage() {
    const coverPage = document.createElement("div");
    coverPage.className = "print-cover-page";
    coverPage.style.display = "none";

    const mainTitle = document.createElement("h1");
    mainTitle.className = "print-cover-title";
    mainTitle.textContent = "CARTELLE TOMBOLA";
    coverPage.appendChild(mainTitle);

    const logoContainer = document.createElement("div");
    logoContainer.className = "print-cover-logo";
    logoContainer.innerHTML = '<i class="fas fa-dice"></i>';
    coverPage.appendChild(logoContainer);

    const subtitle = document.createElement("h2");
    subtitle.className = "print-cover-subtitle";
    subtitle.textContent = "Istruzioni e Regole del Gioco";
    coverPage.appendChild(subtitle);

    const rulesContainer = document.createElement("div");
    rulesContainer.className = "print-cover-rules";

    const introSection = document.createElement("div");
    introSection.className = "print-cover-section";
    const introTitle = document.createElement("h3");
    introTitle.textContent = "Introduzione";
    introSection.appendChild(introTitle);
    const introText = document.createElement("p");
    introText.innerHTML = `La tombola è un gioco tradizionale italiano, particolarmente popolare durante le festività natalizie. È un gioco di fortuna che coinvolge l'estrazione di numeri e la marcatura di cartelle.`;
    introSection.appendChild(introText);
    rulesContainer.appendChild(introSection);

    const materialsSection = document.createElement("div");
    materialsSection.className = "print-cover-section";
    const materialsTitle = document.createElement("h3");
    materialsTitle.textContent = "Materiale di Gioco";
    materialsSection.appendChild(materialsTitle);
    const materialsList = document.createElement("ul");
    materialsList.innerHTML = `
      <li><strong>Cartelle:</strong> Ogni giocatore riceve un set di 6 cartelle. Ogni set contiene tutti i numeri da 1 a 90, distribuiti in modo che ogni cartella abbia 15 numeri (5 numeri per riga).</li>
      <li><strong>Tabellone:</strong> Un tabellone con i numeri da 1 a 90 per tenere traccia dei numeri estratti.</li>
      <li><strong>Sacchetto con numeri:</strong> Un sacchetto contenente 90 numeri (da 1 a 90) per l'estrazione.</li>
      <li><strong>Segnalini:</strong> Oggetti per marcare i numeri estratti sulle cartelle (fagioli, bottoni, ecc.).</li>
    `;
    materialsSection.appendChild(materialsList);
    rulesContainer.appendChild(materialsSection);

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
    combinationsList.innerHTML = `
      <li><strong>Ambo:</strong> 2 numeri sulla stessa riga</li>
      <li><strong>Terno:</strong> 3 numeri sulla stessa riga</li>
      <li><strong>Quaterna:</strong> 4 numeri sulla stessa riga</li>
      <li><strong>Cinquina:</strong> 5 numeri sulla stessa riga (riga completa)</li>
      <li><strong>Tombola:</strong> tutti i 15 numeri di una cartella</li>
    `;
    combinationsSection.appendChild(combinationsList);
    rulesContainer.appendChild(combinationsSection);

    const footer = document.createElement("div");
    footer.className = "print-cover-footer";
    footer.innerHTML = `<p>Generato con il Generatore di Cartelle Tombola - ${new Date().toLocaleDateString()}</p>`;
    rulesContainer.appendChild(footer);

    coverPage.appendChild(rulesContainer);
    return coverPage;
  }

  /**
   * Crea l'elemento HTML per una cartella
   */
  function createCardElement(card) {
    const cardElement = document.createElement("div");
    cardElement.className = "tombola-card";
    cardElement.setAttribute("data-card-id", card.id);
    cardElement.setAttribute("data-giocatore", card.setNumber);

    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header";
    cardHeader.textContent = `Cartella #${card.id}`;
    cardElement.appendChild(cardHeader);

    const table = document.createElement("table");
    table.className = "card-grid";
    const tbody = document.createElement("tbody");

    for (let row = 0; row < 3; row++) {
      const tr = document.createElement("tr");
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
      `Genera facilmente cartelle per la tua tombola. Seleziona il numero di giocatori (fino a ${sumcartelle}) e clicca su Genera.`
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
      }
    `;
    document.head.appendChild(styleElement);
  };

  // Aggiungi gli stili di stampa
  addPrintStyles();
});
