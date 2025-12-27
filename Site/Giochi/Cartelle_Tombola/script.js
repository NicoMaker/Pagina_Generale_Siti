document.addEventListener("DOMContentLoaded", () => {
  const numGiocatoriInput = document.getElementById("numGiocatori");
  const decreaseBtn = document.querySelector(".decrease");
  const increaseBtn = document.querySelector(".increase");
  const generateBtn = document.getElementById("generateBtn");
  const resetBtn = document.getElementById("resetBtn");
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
  const sumcartelle = 600;

  const progressPercentage = document.getElementById("progressPercentage");
  const progressCounter = document.getElementById("progressCounter");
  const loaderIcon = document.getElementById("loaderIcon");
  const loaderPhase = document.getElementById("loaderPhase");
  const loaderMessage = document.getElementById("loaderMessage");
  const progressFraction = document.getElementById("progressFraction");

  let globalLastPercentage = 0;

  numGiocatoriInput.max = sumcartelle;

  generateBtn.addEventListener("click", generateCards);
  resetBtn.addEventListener("click", resetCards);
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
    progressCounter.textContent = `${processed}/${total} giocatori`;

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

  function resetCards() {
    cardsContainer.innerHTML = "";
    printBtn.disabled = true;
    numGiocatoriInput.value = 1;
    globalLastPercentage = 0;
    loadingEl.classList.add("hidden");

    showAlert(
      "success",
      "Reset completato",
      "Le cartelle generate sono state cancellate."
    );
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

      await renderCardsOptimized(giocatori);

      const endTime = performance.now();
      const timeElapsed = ((endTime - startTime) / 1000).toFixed(2);

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

  function generateTombolaGiocatore(giocatoreNumber) {
    let success = false;
    let cards;

    while (!success) {
      try {
        const columns = [[], [], [], [], [], [], [], [], []];
        for (let n = 1; n <= 90; n++) {
          let colIndex = Math.floor(n / 10);
          if (n === 90) colIndex = 8;
          columns[colIndex].push(n);
        }
        columns.forEach((col) => shuffleArray(col));

        cards = Array.from({ length: 6 }, () =>
          Array.from({ length: 3 }, () => Array(9).fill(null))
        );

        for (let c = 0; c < 9; c++) {
          for (let k = 0; k < 6; k++) {
            const row = Math.floor(Math.random() * 3);
            cards[k][row][c] = columns[c].pop();
          }
        }

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
            if (!placed) throw new Error("Incastro");
          }
        }

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
          if (card.some((r) => r.filter((n) => n !== null).length !== 5)) {
            throw new Error("Bilanciamento fallito");
          }
        });

        success = true;
      } catch (e) {
        success = false;
      }
    }

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

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  async function renderCardsOptimized(giocatori) {
    loadingEl.classList.remove("loader-complete");
    updateProgressMarkers(giocatori.length);

    cardsContainer.innerHTML = "";

    const printCoverPage = createPrintCoverPage();
    cardsContainer.appendChild(printCoverPage);

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

  function printCards() {
    showAlert(
      "info",
      "Preparazione stampa",
      "Sul telefono, dopo il popup di stampa potrebbe volerci qualche secondo per caricare tutte le pagine.",
      3000
    );

    document.body.classList.add("printing");

    const cleanUp = () => document.body.classList.remove("printing");

    if ("onafterprint" in window) {
      const handler = () => {
        cleanUp();
        window.removeEventListener("afterprint", handler);
      };
      window.addEventListener("afterprint", handler);
      window.print();
    } else {
      window.print();
      setTimeout(cleanUp, 3000);
    }
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

  setTimeout(() => {
    showAlert(
      "info",
      "Benvenuto",
      `Genera facilmente cartelle per la tua tombola. Seleziona il numero di giocatori (fino a ${sumcartelle}) e clicca su Genera.`
    );
  }, 500);
});
