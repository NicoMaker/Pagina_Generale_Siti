document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM
  const numGiocatoriInput = document.getElementById("numGiocatori");
  const decreaseBtn = document.querySelector(".decrease");
  const increaseBtn = document.querySelector(".increase");
  const generateBtn = document.getElementById("generateBtn");
  const printBtn = document.getElementById("printBtn");
  const resetBtn = document.getElementById("resetBtn");
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
  const sumcartelle = 600;

  const progressPercentage = document.getElementById("progressPercentage");
  const progressCounter = document.getElementById("progressCounter");
  const loaderIcon = document.getElementById("loaderIcon");
  const loaderPhase = document.getElementById("loaderPhase");
  const loaderMessage = document.getElementById("loaderMessage");
  const progressFraction = document.getElementById("progressFraction");

  let globalLastPercentage = 0;

  numGiocatoriInput.max = sumcartelle;

  // Event listeners
  generateBtn.addEventListener("click", generateCards);
  printBtn.addEventListener("click", printCards);
  resetBtn.addEventListener("click", resetCards);
  decreaseBtn.addEventListener("click", () => updateNumGiocatori(-1));
  increaseBtn.addEventListener("click", () => updateNumGiocatori(1));
  aboutLink.addEventListener("click", showModal);
  footerAboutLink.addEventListener("click", showModal);
  modalCloseBtn.addEventListener("click", hideModal);
  modalCloseX.addEventListener("click", hideModal);
  modalContainer.addEventListener("click", (e) => {
    if (e.target === modalContainer) hideModal();
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (link.getAttribute("href").startsWith("#")) {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        sections.forEach((section) => {
          section.classList.remove("active");
          if (section.id === targetId) {
            section.classList.add("active");
          }
        });
      }
    });
  });

  const alertContainer = document.getElementById("alertContainer");
  const alertTemplate = document.getElementById("alertTemplate");

  function showAlert(type, title, message, duration = 5000) {
    const alert = alertTemplate.content.cloneNode(true).querySelector(".alert");
    alert.classList.add(`alert-${type}`);

    const iconElement = alert.querySelector(".alert-icon");
    const titleElement = alert.querySelector(".alert-title");
    const messageElement = alert.querySelector(".alert-message");
    const closeButton = alert.querySelector(".alert-close");

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

    alertContainer.appendChild(alert);

    const closeAlert = () => {
      alert.classList.add("closing");
      setTimeout(() => {
        alert.remove();
      }, 300);
    };

    closeButton.addEventListener("click", closeAlert);

    if (duration > 0) {
      setTimeout(closeAlert, duration);
    }

    return alert;
  }

  function updateNumGiocatori(delta) {
    const currentValue = Number.parseInt(numGiocatoriInput.value) || 1;
    const newValue = Math.max(1, Math.min(sumcartelle, currentValue + delta));
    numGiocatoriInput.value = newValue;
  }

  function updateProgressMarkers(total) {
    const marker25 = document.getElementById("marker-25");
    const marker50 = document.getElementById("marker-50");
    const marker75 = document.getElementById("marker-75");
    const marker100 = document.getElementById("marker-100");

    const quarter = Math.ceil(total / 4);
    const half = Math.ceil(total / 2);
    const threeQuarters = Math.ceil((total * 3) / 4);

    marker25.textContent = quarter.toString();
    marker50.textContent = half.toString();
    marker75.textContent = threeQuarters.toString();
    marker100.textContent = total.toString();
  }

  function showModal(e) {
    if (e) e.preventDefault();
    modalContainer.classList.remove("hidden");
    setTimeout(() => {
      modalContainer.classList.add("visible");
    }, 10);
  }

  function hideModal() {
    modalContainer.classList.remove("visible");
    setTimeout(() => {
      modalContainer.classList.add("hidden");
    }, 300);
  }

  function updateLoader(percentage, processed, total, phase) {
    const safePercentage = Math.max(globalLastPercentage, percentage);
    globalLastPercentage = safePercentage;

    progressPercentage.textContent = `${Math.round(safePercentage)}%`;
    progressCounter.textContent = `${processed}/${total} giocatori (${
      processed * 6
    } / ${total * 6} cartelle)`;

    let fractionText = "";
    const quarter = Math.ceil(total / 4);
    const half = Math.ceil(total / 2);
    const threeQuarters = Math.ceil((total * 3) / 4);

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
    progressBar.style.width = `${safePercentage}%`;

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

    loaderPhase.textContent = phase;

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

    if (safePercentage >= 100) {
      loadingEl.classList.add("loader-complete");
      loaderMessage.textContent = "Generazione completata con successo!";
      setTimeout(() => {
        loadingEl.classList.remove("loader-complete");
      }, 3000);
    } else {
      loadingEl.classList.remove("loader-complete");
    }
  }

  async function generateCards() {
    globalLastPercentage = 0;
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

    updateProgressMarkers(numGiocatori);

    loadingEl.classList.remove("hidden");
    cardsContainer.innerHTML = "";
    resetBtn.disabled = true;
    printBtn.disabled = true;

    updateLoader(0, 0, numGiocatori, "Inizializzazione");

    try {
      const startTime = performance.now();

      const batchSize = 5;
      const totalBatches = Math.ceil(numGiocatori / batchSize);
      const giocatori = [];
      let processedGiocatori = 0;

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        await new Promise((resolve) => requestAnimationFrame(resolve));

        const start = batchIndex * batchSize;
        const end = Math.min(start + batchSize, numGiocatori);
        const batchCount = end - start;

        const generationProgress = ((batchIndex + 1) / totalBatches) * 50;

        let currentPhase;
        if (generationProgress < 12.5) {
          currentPhase = "Inizializzazione";
        } else if (generationProgress < 25) {
          currentPhase = "Creazione struttura";
        } else if (generationProgress < 37.5) {
          currentPhase = "Distribuzione numeri";
        } else {
          currentPhase = "Finalizzazione";
        }

        for (let i = 0; i < batchCount; i++) {
          giocatori.push(generateTombolaGiocatore(start + i + 1));
          processedGiocatori++;

          const currentProgress = (processedGiocatori / numGiocatori) * 50;
          updateLoader(
            currentProgress,
            processedGiocatori,
            numGiocatori,
            currentPhase
          );
        }
      }

      await renderCardsOptimized(giocatori, numGiocatori);

      const endTime = performance.now();
      const timeElapsed = ((endTime - startTime) / 1000).toFixed(2);

      resetBtn.disabled = false;
      printBtn.disabled = false;

      showAlert(
        "success",
        "Generazione completata",
        `Sono stati generati ${numGiocatori} giocatori di cartelle in ${timeElapsed} secondi.`
      );

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
      loadingEl.classList.add("hidden");
    }
  }

  function resetCards() {
    cardsContainer.innerHTML = "";
    printBtn.disabled = true;
    generateBtn.disabled = false;
    resetBtn.disabled = true;
    showAlert(
      "info",
      "Reset completato",
      "L'area delle cartelle è stata pulita. Puoi generare nuove cartelle.",
      3000
    );
  }

  async function renderCardsOptimized(giocatori, totalGiocatori) {
    loadingEl.classList.remove("loader-complete");
    cardsContainer.innerHTML = "";

    const printCoverPage = createPrintCoverPage();
    cardsContainer.appendChild(printCoverPage);

    const batchSize = 10;
    const totalBatches = Math.ceil(giocatori.length / batchSize);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const renderProgress = 50 + ((batchIndex + 1) / totalBatches) * 50;
      const processedCount = Math.min(
        (batchIndex + 1) * batchSize,
        giocatori.length
      );

      updateLoader(
        renderProgress,
        processedCount,
        totalGiocatori,
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

        const pageFooter = document.createElement("div");
        pageFooter.className = "print-page-footer";
        const currentDate = new Date().toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        pageFooter.innerHTML = `<p>Generato con il Generatore di Cartelle Tombola - ${currentDate}</p>`;
        setContainer.appendChild(pageFooter);

        cardsContainer.appendChild(setContainer);
      });

      if (batchIndex < totalBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    }

    updateLoader(100, totalGiocatori, totalGiocatori, "Completato");

    window.addEventListener("beforeprint", () => {
      printCoverPage.style.display = "block";
    });

    window.addEventListener("afterprint", () => {
      printCoverPage.style.display = "none";
    });
  }

  function printCards() {
    showAlert(
      "info",
      "Preparazione stampa",
      "Preparazione della stampa in corso. Questo potrebbe richiedere alcuni secondi per grandi volumi.",
      3000
    );

    setTimeout(() => {
      document.body.classList.add("printing");
      window.print();
      document.body.classList.remove("printing");
    }, 500);
  }

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
    introText.innerHTML =
      "La tombola è un gioco tradizionale italiano, particolarmente popolare durante le festività natalizie. È un gioco di fortuna che coinvolge l'estrazione di numeri e la marcatura di cartelle.";
    introSection.appendChild(introText);
    rulesContainer.appendChild(introSection);

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

    const footer = document.createElement("div");
    footer.className = "print-cover-footer";
    const currentDate = new Date().toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    footer.innerHTML = `<p>Generato con il Generatore di Cartelle Tombola - ${currentDate}</p>`;
    rulesContainer.appendChild(footer);

    coverPage.appendChild(rulesContainer);
    return coverPage;
  }

  function createCardElement(card) {
    const cardElement = document.createElement("div");
    cardElement.className = "tombola-card";
    cardElement.setAttribute("data-card-id", card.cardNumber);
    cardElement.setAttribute("data-giocatore", card.setNumber);

    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header";
    cardHeader.textContent = `Cartella #${card.cardNumber}`;
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

  setTimeout(() => {
    showAlert(
      "info",
      "Benvenuto",
      `Genera facilmente cartelle per la tua tombola. Seleziona il numero di giocatori (fino a ${sumcartelle}) e clicca su Genera.`
    );
  }, 500);

  const addPrintStyles = () => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .print-page-footer {
        display: none !important;
      }

      @media print {
        .print-page-footer {
          display: block !important;
          text-align: center;
          font-size: 0.8rem;
          color: #666;
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
        }

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

  addPrintStyles();

  function generateTombolaGiocatore(giocatoreNumber) {
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    shuffleArray(allNumbers);

    const columns = [
      allNumbers.filter((n) => n >= 1 && n <= 9),
      allNumbers.filter((n) => n >= 10 && n <= 19),
      allNumbers.filter((n) => n >= 20 && n <= 29),
      allNumbers.filter((n) => n >= 30 && n <= 39),
      allNumbers.filter((n) => n >= 40 && n <= 49),
      allNumbers.filter((n) => n >= 50 && n <= 59),
      allNumbers.filter((n) => n >= 60 && n <= 69),
      allNumbers.filter((n) => n >= 70 && n <= 79),
      allNumbers.filter((n) => n >= 80 && n <= 90),
    ];

    columns.forEach((col) => shuffleArray(col));

    const cards = Array(6)
      .fill()
      .map(() =>
        Array(3)
          .fill()
          .map(() => Array(9).fill(null))
      );

    distributeNumbers(columns, cards);

    return cards.map((card, index) => ({
      id: (giocatoreNumber - 1) * 6 + index + 1,
      setNumber: giocatoreNumber,
      cardNumber: index + 1,
      grid: card,
    }));
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function distributeNumbers(columns, cards) {
    for (let colIndex = 0; colIndex < 9; colIndex++) {
      const colNumbers = [...columns[colIndex]];
      const numbersPerCard = distributeColumnNumbers(
        colNumbers.length,
        cards.length
      );

      let numberIndex = 0;
      for (let cardIndex = 0; cardIndex < cards.length; cardIndex++) {
        const card = cards[cardIndex];
        const numToAssign = numbersPerCard[cardIndex];
        const cardNumbers = colNumbers.slice(
          numberIndex,
          numberIndex + numToAssign
        );
        numberIndex += numToAssign;
        cardNumbers.sort((a, b) => a - b);
        assignNumbersToRows(card, colIndex, cardNumbers);
      }
    }

    for (const card of cards) {
      ensureExactlyFiveNumbersPerRow(card);
    }
  }

  function distributeColumnNumbers(totalNumbers, numCards) {
    const distribution = Array(numCards).fill(
      Math.floor(totalNumbers / numCards)
    );
    const remaining =
      totalNumbers - Math.floor(totalNumbers / numCards) * numCards;
    for (let i = 0; i < remaining; i++) {
      distribution[i]++;
    }
    shuffleArray(distribution);
    return distribution;
  }

  function assignNumbersToRows(card, colIndex, numbers) {
    if (numbers.length === 0) return;
    numbers.sort((a, b) => a - b);

    if (numbers.length === 1) {
      const rowIndex = Math.floor(Math.random() * 3);
      card[rowIndex][colIndex] = numbers[0];
    } else if (numbers.length === 2) {
      const rows = [0, 1, 2];
      shuffleArray(rows);
      card[rows[0]][colIndex] = numbers[0];
      card[rows[1]][colIndex] = numbers[1];
    } else if (numbers.length === 3) {
      card[0][colIndex] = numbers[0];
      card[1][colIndex] = numbers[1];
      card[2][colIndex] = numbers[2];
    }
  }

  function ensureExactlyFiveNumbersPerRow(card) {
    let changed = true;
    let attempts = 0;
    const maxAttempts = 20;

    while (changed && attempts < maxAttempts) {
      changed = false;
      attempts++;

      const rowCounts = card.map(
        (row) => row.filter((cell) => cell !== null).length
      );
      const excessRows = [];
      const deficitRows = [];
      rowCounts.forEach((count, index) => {
        if (count > 5) excessRows.push(index);
        if (count < 5) deficitRows.push(index);
      });

      if (excessRows.length > 0 && deficitRows.length > 0) {
        for (const sourceRowIndex of excessRows) {
          const filledCols = [];
          for (let col = 0; col < 9; col++) {
            if (card[sourceRowIndex][col] !== null) {
              filledCols.push(col);
            }
          }
          shuffleArray(filledCols);

          for (const colToMove of filledCols) {
            const targetRowIndex = deficitRows.find(
              (r) => card[r][colToMove] === null
            );
            if (targetRowIndex !== undefined) {
              card[targetRowIndex][colToMove] = card[sourceRowIndex][colToMove];
              card[sourceRowIndex][colToMove] = null;
              changed = true;
              break;
            }
          }
          if (changed) break;
        }
      }
    }
  }
});
