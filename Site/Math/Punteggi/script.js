// At the top of the file, add a new variable to track the next available ID
const partecipanti = [];
let modalitàVittoria = "max";
let nextParticipantId = 1; // Add this line to track the next available ID

// Elementi DOM
const participantList = document.getElementById("participant-list");
const participantNameInput = document.getElementById("participant-name");
const pointsInput = document.getElementById("points");
const selectedParticipantSelect = document.getElementById(
  "selected-participant"
);
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const themeIcon = document.getElementById("theme-icon");
const accessibilityBtn = document.getElementById("accessibility-btn");
const accessibilityModal = document.getElementById("accessibility-modal");
const closeModalBtn = document.getElementById("close-modal");
const toastElement = document.getElementById("toast");
const victoryModal = document.getElementById("victory-modal");
const tieModal = document.getElementById("tie-modal");
const leaderboardModal = document.getElementById("leaderboard-modal");
const shareModal = document.getElementById("share-modal");
const victoryMessage = document.getElementById("victory-message");
const victoryDetails = document.getElementById("victory-details");
const tieMessage = document.getElementById("tie-message");
const tieDetails = document.getElementById("tie-details");
const closeVictoryModalBtn = document.getElementById("close-victory-modal");
const closeTieModalBtn = document.getElementById("close-tie-modal");
const closeLeaderboardModalBtn = document.getElementById(
  "close-leaderboard-modal"
);
const closeShareModalBtn = document.getElementById("close-share-modal");
const confettiContainer = document.getElementById("confetti-container");
const leaderboardDate = document.getElementById("leaderboard-date");
const leaderboardMode = document.getElementById("leaderboard-mode");
const podiumContainer = document.getElementById("podium-container");
const leaderboardBody = document.getElementById("leaderboard-body");
const shareTextPreview = document.getElementById("share-text-preview");

// Add these variables at the top with the other DOM elements
const resetModal = document.getElementById("reset-modal");
const closeResetModalBtn = document.getElementById("close-reset-modal");
const resetPointsOption = document.getElementById("reset-points-option");
const resetAllOption = document.getElementById("reset-all-option");
const cancelResetBtn = document.getElementById("cancel-reset-btn");
const confirmResetBtn = document.getElementById("confirm-reset-btn");
const resetBtnText = document.getElementById("reset-btn-text");
const resetProgressContainer = document.getElementById(
  "reset-progress-container"
);
const resetProgressBar = document.getElementById("reset-progress-bar");

const fileFeedbackModal = document.getElementById("file-feedback-modal");
const closeFileFeedbackModalBtn = document.getElementById(
  "close-file-feedback-modal"
);
const fileFeedbackIcon = document.getElementById("file-feedback-icon");
const fileFeedbackStatus = document.getElementById("file-feedback-status");
const fileFeedbackCount = document.getElementById("file-feedback-count");
const fileFeedbackList = document.getElementById("file-feedback-list");
const fileFeedbackSummary = document.getElementById("file-feedback-summary");
const fileFeedbackOkBtn = document.getElementById("file-feedback-ok-btn");

// Colori per i coriandoli
const confettiColors = [
  "#4361ee",
  "#4cc9f0",
  "#3a0ca3",
  "#f72585",
  "#7209b7",
  "#ffd700",
  "#ff9800",
  "#4caf50",
  "#2196f3",
  "#f44336",
];

// Inizializzazione
document.addEventListener("DOMContentLoaded", () => {
  // Carica il tema salvato
  loadThemePreference();

  // Aggiungi event listeners
  setupEventListeners();

  // Inizializza l'interfaccia
  aggiornaListaPartecipanti();
  aggiornaSelezionePartecipante();
});

// Funzione per impostare gli event listeners
function setupEventListeners() {
  // Gestione tema
  themeToggleBtn.addEventListener("click", toggleTheme);

  // Gestione modale accessibilità
  accessibilityBtn.addEventListener("click", showAccessibilityModal);
  closeModalBtn.addEventListener("click", hideAccessibilityModal);
  window.addEventListener("click", (e) => {
    if (e.target === accessibilityModal) {
      hideAccessibilityModal();
    }
  });

  // Gestione modale vittoria
  closeVictoryModalBtn.addEventListener("click", hideVictoryModal);
  closeTieModalBtn.addEventListener("click", hideTieModal);
  window.addEventListener("click", (e) => {
    if (e.target === victoryModal) {
      hideVictoryModal();
    }
    if (e.target === tieModal) {
      hideTieModal();
    }
  });

  // Gestione modale classifica
  closeLeaderboardModalBtn.addEventListener("click", hideLeaderboardModal);
  window.addEventListener("click", (e) => {
    if (e.target === leaderboardModal) {
      hideLeaderboardModal();
    }
  });

  // Gestione modale condivisione
  closeShareModalBtn.addEventListener("click", hideShareModal);
  window.addEventListener("click", (e) => {
    if (e.target === shareModal) {
      hideShareModal();
    }
  });

  // Gestione tasti per accessibilità
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (accessibilityModal.style.display === "flex") {
        hideAccessibilityModal();
      }
      if (victoryModal.style.display === "flex") {
        hideVictoryModal();
      }
      if (tieModal.style.display === "flex") {
        hideTieModal();
      }
      if (leaderboardModal.style.display === "flex") {
        hideLeaderboardModal();
      }
      if (shareModal.style.display === "flex") {
        hideShareModal();
      }
    }
  });

  // Gestione invio per aggiungere partecipante
  participantNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      aggiungiPartecipante();
    }
  });

  // Reset modal event listeners
  closeResetModalBtn.addEventListener("click", hideResetModal);
  cancelResetBtn.addEventListener("click", hideResetModal);
  confirmResetBtn.addEventListener("click", eseguiReset);
  window.addEventListener("click", (e) => {
    if (e.target === resetModal) {
      hideResetModal();
    }
  });

  // File feedback modal event listeners
  closeFileFeedbackModalBtn.addEventListener("click", hideFileFeedbackModal);
  fileFeedbackOkBtn.addEventListener("click", hideFileFeedbackModal);
  window.addEventListener("click", (e) => {
    if (e.target === fileFeedbackModal) {
      hideFileFeedbackModal();
    }
  });
}

// Funzioni per la gestione del tema
function toggleTheme() {
  const isDarkTheme = document.body.getAttribute("data-theme") === "dark";

  if (isDarkTheme) {
    document.body.removeAttribute("data-theme");
    themeIcon.textContent = "dark_mode";
    localStorage.setItem("theme", "light");
  } else {
    document.body.setAttribute("data-theme", "dark");
    themeIcon.textContent = "light_mode";
    localStorage.setItem("theme", "dark");
  }

  // Annuncia il cambio tema per screen reader
  showToast(
    isDarkTheme ? "Tema chiaro attivato" : "Tema scuro attivato",
    "info"
  );
}

function loadThemePreference() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.setAttribute("data-theme", "dark");
    themeIcon.textContent = "light_mode";
  } else {
    themeIcon.textContent = "dark_mode";
  }
}

// Funzioni per la gestione della modale
function showAccessibilityModal() {
  accessibilityModal.style.display = "flex";
  accessibilityModal.setAttribute("aria-hidden", "false");

  // Focus sul primo elemento interattivo della modale
  setTimeout(() => {
    closeModalBtn.focus();
  }, 100);
}

function hideAccessibilityModal() {
  accessibilityModal.style.display = "none";
  accessibilityModal.setAttribute("aria-hidden", "true");

  // Ripristina il focus sull'elemento che ha aperto la modale
  accessibilityBtn.focus();
}

// Funzioni per la gestione della modale di vittoria
function showVictoryModal(vincitore, punti, id) {
  // Imposta il messaggio di vittoria
  victoryMessage.innerHTML = `<span class="winner-name">${vincitore} <span class="winner-id">#${id}</span></span> ha vinto!`;
  victoryDetails.innerHTML = `Con un punteggio di <strong>${punti}</strong> punti`;

  // Mostra la modale
  victoryModal.style.display = "flex";
  victoryModal.setAttribute("aria-hidden", "false");

  // Crea effetto coriandoli
  createConfetti();

  // Aggiungi animazioni
  document.querySelector(".trophy-icon").classList.add("bounce");
  document.querySelector(".victory-message").classList.add("fade-in-up");
  document.querySelector(".victory-details").classList.add("fade-in-up");

  // Focus sul pulsante di chiusura
  setTimeout(() => {
    closeVictoryModalBtn.focus();
  }, 500);

  // Leggi per screen reader
  const victoryAnnouncement = `${vincitore} ID ${id} ha vinto con ${punti} punti!`;
  announceForScreenReader(victoryAnnouncement);
}

// Update the showTieModal function to display the IDs
function showTieModal(vincitori, punti) {
  // Imposta il messaggio di pareggio
  tieMessage.innerHTML = `Pareggio tra ${vincitori.length} partecipanti!`;

  // Crea la lista dei vincitori
  let detailsHTML = `<div class="tie-participants">Con un punteggio di <strong>${punti}</strong> punti:</div><ul class="tie-list">`;

  vincitori.forEach((vincitore, index) => {
    detailsHTML += `<li><span class="medal medal-${
      index < 3 ? ["gold", "silver", "bronze"][index] : "default"
    }">${index + 1}</span> ${vincitore.nome} <span class="winner-id">#${
      vincitore.id
    }</span></li>`;
  });

  detailsHTML += `</ul>`;
  tieDetails.innerHTML = detailsHTML;

  // Mostra la modale
  tieModal.style.display = "flex";
  tieModal.setAttribute("aria-hidden", "false");

  // Aggiungi animazioni
  document.querySelector(".tie-icon").classList.add("bounce");
  document.querySelector(".tie-message").classList.add("fade-in-up");
  document.querySelector(".tie-details").classList.add("fade-in-up");

  // Focus sul pulsante di chiusura
  setTimeout(() => {
    closeTieModalBtn.focus();
  }, 500);

  // Leggi per screen reader
  const tieAnnouncement = `Pareggio tra ${vincitori
    .map((v) => `${v.nome} ID ${v.id}`)
    .join(", ")} con ${punti} punti!`;
  announceForScreenReader(tieAnnouncement);
}

function hideVictoryModal() {
  victoryModal.style.display = "none";
  victoryModal.setAttribute("aria-hidden", "true");

  // Rimuovi i coriandoli
  confettiContainer.innerHTML = "";

  // Rimuovi le classi di animazione
  document.querySelector(".trophy-icon").classList.remove("bounce");
  document.querySelector(".victory-message").classList.remove("fade-in-up");
  document.querySelector(".victory-details").classList.remove("fade-in-up");
}

function hideTieModal() {
  tieModal.style.display = "none";
  tieModal.setAttribute("aria-hidden", "true");

  // Rimuovi le classi di animazione
  document.querySelector(".tie-icon").classList.remove("bounce");
  document.querySelector(".tie-message").classList.remove("fade-in-up");
  document.querySelector(".tie-details").classList.remove("fade-in-up");
}

// Funzioni per la gestione della modale classifica
function mostraClassifica() {
  // Aggiorna la data e la modalità
  const oggi = new Date();
  const opzioniData = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  leaderboardDate.textContent = oggi.toLocaleDateString("it-IT", opzioniData);
  leaderboardMode.textContent = `Modalità: ${
    modalitàVittoria === "max" ? "Più punti" : "Meno punti"
  }`;

  // Ordina i partecipanti
  const partecipantiOrdinati = [...partecipanti].sort((a, b) =>
    modalitàVittoria === "max" ? b.punti - a.punti : a.punti - b.punti
  );

  // Crea il podio
  creaPodio(partecipantiOrdinati);

  // Crea la tabella della classifica
  creaTabellaCassifica(partecipantiOrdinati);

  // Mostra la modale
  leaderboardModal.style.display = "flex";
  leaderboardModal.setAttribute("aria-hidden", "false");

  // Focus sul pulsante di chiusura
  setTimeout(() => {
    closeLeaderboardModalBtn.focus();
  }, 100);
}

function hideLeaderboardModal() {
  leaderboardModal.style.display = "none";
  leaderboardModal.setAttribute("aria-hidden", "true");
}

// Update the creaPodio function to display IDs
function creaPodio(partecipantiOrdinati) {
  // Pulisci il contenitore del podio
  podiumContainer.innerHTML = "";

  // Verifica se ci sono abbastanza partecipanti per il podio
  if (partecipantiOrdinati.length === 0) {
    podiumContainer.innerHTML = "<p>Nessun partecipante disponibile</p>";
    return;
  }

  // Crea il podio per i primi 3 (o meno se non ci sono abbastanza partecipanti)
  const numPodio = Math.min(3, partecipantiOrdinati.length);

  // Ordine di visualizzazione: secondo, primo, terzo
  const ordineVisualizzazione = [1, 0, 2];

  for (let i = 0; i < numPodio; i++) {
    const indice = ordineVisualizzazione[i];
    if (indice < partecipantiOrdinati.length) {
      const partecipante = partecipantiOrdinati[indice];
      const posizione = indice + 1;

      // Crea l'elemento del podio
      const podiumPlace = document.createElement("div");
      podiumPlace.className = "podium-place";

      // Blocco del podio
      const podiumBlock = document.createElement("div");
      podiumBlock.className = `podium-block podium-${
        posizione === 1 ? "first" : posizione === 2 ? "second" : "third"
      }`;
      podiumBlock.textContent = posizione;

      // Informazioni sul partecipante
      const participantInfo = document.createElement("div");
      participantInfo.className = "podium-participant";

      const participantName = document.createElement("div");
      participantName.className = "podium-name";
      participantName.textContent = partecipante.nome;

      // Add ID badge
      const idBadge = document.createElement("span");
      idBadge.className = "podium-id";
      idBadge.textContent = `#${partecipante.id}`;
      participantName.appendChild(idBadge);

      const participantPoints = document.createElement("div");
      participantPoints.className = "podium-points";
      participantPoints.textContent = `${partecipante.punti} punti`;

      // Assembla gli elementi
      participantInfo.appendChild(participantName);
      participantInfo.appendChild(participantPoints);

      podiumPlace.appendChild(podiumBlock);
      podiumPlace.appendChild(participantInfo);

      podiumContainer.appendChild(podiumPlace);
    }
  }
}

// Update the creaTabellaCassifica function to display IDs
function creaTabellaCassifica(partecipantiOrdinati) {
  // Pulisci la tabella
  leaderboardBody.innerHTML = "";

  if (partecipantiOrdinati.length === 0) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 3;
    emptyCell.textContent = "Nessun partecipante disponibile";
    emptyCell.style.textAlign = "center";
    emptyRow.appendChild(emptyCell);
    leaderboardBody.appendChild(emptyRow);
    return;
  }

  // Crea le righe della tabella
  partecipantiOrdinati.forEach((partecipante, index) => {
    const row = document.createElement("tr");

    // Aggiungi classe speciale per il vincitore
    if (index === 0) {
      row.className = "winner";
    }

    // Posizione
    const positionCell = document.createElement("td");
    positionCell.className = "position";

    // Aggiungi medaglia per i primi 3
    if (index < 3) {
      const medalSpan = document.createElement("span");
      medalSpan.className = `medal medal-${
        ["gold", "silver", "bronze"][index]
      }`;
      medalSpan.textContent = index + 1;
      positionCell.appendChild(medalSpan);
    } else {
      positionCell.textContent = index + 1;
    }

    // Nome con ID
    const nameCell = document.createElement("td");
    nameCell.className = "participant-name-cell";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = partecipante.nome;
    nameCell.appendChild(nameSpan);

    const idBadge = document.createElement("span");
    idBadge.className = "leaderboard-id-badge";
    idBadge.textContent = `#${partecipante.id}`;
    nameCell.appendChild(idBadge);

    // Punti
    const pointsCell = document.createElement("td");
    pointsCell.className = "points";
    pointsCell.textContent = partecipante.punti;

    // Assembla la riga
    row.appendChild(positionCell);
    row.appendChild(nameCell);
    row.appendChild(pointsCell);

    leaderboardBody.appendChild(row);
  });
}

// Funzioni per la condivisione
// Update the condividiClassifica function to include IDs
function condividiClassifica() {
  // Ottieni i dati della classifica
  const partecipantiOrdinati = [...partecipanti].sort((a, b) =>
    modalitàVittoria === "max" ? b.punti - a.punti : a.punti - b.punti
  );

  // Crea il testo da condividere
  let testoCondivisione = "📊 Classifica finale:\n\n";

  partecipantiOrdinati.forEach((partecipante, index) => {
    const medaglia =
      index === 0
        ? "🥇"
        : index === 1
        ? "🥈"
        : index === 2
        ? "🥉"
        : `${index + 1}.`;
    testoCondivisione += `${medaglia} ${partecipante.nome} #${partecipante.id}: ${partecipante.punti} punti\n`;
  });

  testoCondivisione +=
    "\nModalità vittoria: " +
    (modalitàVittoria === "max" ? "Più punti" : "Meno punti");
  testoCondivisione += "\nData: " + new Date().toLocaleDateString("it-IT");

  // Aggiorna l'anteprima
  shareTextPreview.textContent = testoCondivisione;

  // Mostra la modale di condivisione
  shareModal.style.display = "flex";
  shareModal.setAttribute("aria-hidden", "false");

  // Focus sul pulsante di chiusura
  setTimeout(() => {
    closeShareModalBtn.focus();
  }, 100);
}

function hideShareModal() {
  shareModal.style.display = "none";
  shareModal.setAttribute("aria-hidden", "true");
}

function condividiSuWhatsApp() {
  const testo = encodeURIComponent(shareTextPreview.textContent);
  window.open(`https://wa.me/?text=${testo}`, "_blank");
}

function condividiSuTelegram() {
  const testo = encodeURIComponent(shareTextPreview.textContent);
  window.open(`https://t.me/share/url?url=&text=${testo}`, "_blank");
}

function condividiSuEmail() {
  const testo = encodeURIComponent(shareTextPreview.textContent);
  window.open(`mailto:?subject=Classifica&body=${testo}`, "_blank");
}

function copiaTestoClassifica() {
  const testo = shareTextPreview.textContent;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(testo)
      .then(() => {
        showToast("Testo copiato negli appunti", "success");
      })
      .catch((err) => {
        console.error("Errore durante la copia negli appunti:", err);
        showToast("Impossibile copiare negli appunti", "error");
      });
  } else {
    // Fallback per browser che non supportano clipboard API
    const textArea = document.createElement("textarea");
    textArea.value = testo;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        showToast("Testo copiato negli appunti", "success");
      } else {
        showToast("Impossibile copiare negli appunti", "error");
      }
    } catch (err) {
      console.error("Errore durante la copia negli appunti:", err);
      showToast("Impossibile copiare negli appunti", "error");
    }

    document.body.removeChild(textArea);
  }
}

function salvaClassificaImmagine() {
  const leaderboardContainer = document.getElementById("leaderboard-container");

  // Aggiungi una classe temporanea per lo screenshot
  leaderboardContainer.classList.add("screenshot-mode");

  // Usa html2canvas per catturare l'immagine
  // html2canvas is not defined, so we need to declare it
  // This assumes html2canvas is loaded via a script tag.
  // If it's a module, you'd import it instead.
  if (typeof html2canvas !== "undefined") {
    html2canvas(leaderboardContainer)
      .then((canvas) => {
        // Rimuovi la classe temporanea
        leaderboardContainer.classList.remove("screenshot-mode");

        // Converti il canvas in un'immagine
        const imageData = canvas.toDataURL("image/png");

        // Crea un link per il download
        const link = document.createElement("a");
        link.href = imageData;
        link.download = `classifica_${new Date()
          .toISOString()
          .slice(0, 10)}.png`;
        link.click();

        showToast("Immagine salvata", "success");
      })
      .catch((error) => {
        console.error("Errore durante la creazione dell'immagine:", error);
        showToast("Errore durante il salvataggio dell'immagine", "error");
        leaderboardContainer.classList.remove("screenshot-mode");
      });
  } else {
    console.error(
      "html2canvas is not loaded. Please ensure it's included in your project."
    );
    showToast(
      "html2canvas is not loaded. Please ensure it's included in your project.",
      "error"
    );
    leaderboardContainer.classList.remove("screenshot-mode");
  }
}

// Funzione per creare coriandoli
function createConfetti() {
  confettiContainer.innerHTML = "";

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";

    // Proprietà casuali
    const size = Math.random() * 10 + 5;
    const color =
      confettiColors[Math.floor(Math.random() * confettiColors.length)];
    const left = Math.random() * 100;
    const duration = Math.random() * 3 + 2;
    const delay = Math.random() * 2;

    // Imposta stile
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = color;
    confetti.style.left = `${left}%`;
    confetti.style.top = `-${size}px`;
    confetti.style.animationDuration = `${duration}s`;
    confetti.style.animationDelay = `${delay}s`;

    // Forma casuale
    const shapes = ["circle", "square", "triangle"];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    if (shape === "circle") {
      confetti.style.borderRadius = "50%";
    } else if (shape === "triangle") {
      confetti.style.width = "0";
      confetti.style.height = "0";
      confetti.style.backgroundColor = "transparent";
      confetti.style.borderLeft = `${size / 2}px solid transparent`;
      confetti.style.borderRight = `${size / 2}px solid transparent`;
      confetti.style.borderBottom = `${size}px solid ${color}`;
    }

    confettiContainer.appendChild(confetti);
  }
}

// Funzione per annunciare per screen reader
function announceForScreenReader(message) {
  const announcer = document.createElement("div");
  announcer.setAttribute("aria-live", "assertive");
  announcer.classList.add("sr-only");
  announcer.textContent = message;
  document.body.appendChild(announcer);

  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
}

// Funzione per mostrare toast di notifica
function showToast(message, type = "info") {
  toastElement.textContent = message;
  toastElement.className = "toast " + type;
  toastElement.classList.add("show");

  // Accessibilità: annuncia il messaggio
  toastElement.setAttribute("aria-hidden", "false");

  setTimeout(() => {
    toastElement.classList.remove("show");

    // Dopo la transizione, nascondi per screen reader
    setTimeout(() => {
      toastElement.setAttribute("aria-hidden", "true");
    }, 300);
  }, 3000);
}

// Funzioni per la gestione dei partecipanti
// Update the aggiungiPartecipante function to assign a unique ID
function aggiungiPartecipante() {
  const nome = participantNameInput.value.trim();

  if (nome === "") {
    showToast("Inserisci un nome valido", "error");
    participantNameInput.focus();
    return;
  }

  // Generate a unique ID for the new participant
  const id = nextParticipantId++;

  // Add the participant with the unique ID
  partecipanti.push({ id, nome, punti: 0 });
  aggiornaListaPartecipanti();
  aggiornaSelezionePartecipante();

  // Pulisci e focus sull'input
  participantNameInput.value = "";
  participantNameInput.focus();

  showToast(`${nome} (ID: ${id}) aggiunto con successo`, "success");
}

// Update the eliminaPartecipante function to use the ID
function eliminaPartecipante(index) {
  const partecipante = partecipanti[index];
  partecipanti.splice(index, 1);
  aggiornaListaPartecipanti();
  aggiornaSelezionePartecipante();

  showToast(`${partecipante.nome} (ID: ${partecipante.id}) rimosso`, "info");
}

// Update the aggiornaListaPartecipanti function to display the ID
function aggiornaListaPartecipanti() {
  participantList.innerHTML = "";

  // Ordina i partecipanti in base alla modalità vittoria
  const partecipantiOrdinati = [...partecipanti].sort((a, b) =>
    modalitàVittoria === "max" ? b.punti - a.punti : a.punti - b.punti
  );

  if (partecipantiOrdinati.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "Nessun partecipante. Aggiungine uno!";
    emptyMessage.className = "empty-message";
    participantList.appendChild(emptyMessage);
    return;
  }

  partecipantiOrdinati.forEach((partecipante, index) => {
    const listItem = document.createElement("li");

    // Contenitore per le informazioni del partecipante
    const infoContainer = document.createElement("div");
    infoContainer.className = "participant-info";

    // Aggiungi medaglia per i primi 3
    if (index < 3) {
      const medalSpan = document.createElement("span");
      medalSpan.className = `medal medal-${
        ["gold", "silver", "bronze"][index]
      }`;
      medalSpan.textContent = index + 1;
      infoContainer.appendChild(medalSpan);
    }

    // Nome del partecipante con ID
    const nameSpan = document.createElement("span");
    nameSpan.className = "participant-name";
    nameSpan.textContent = `${partecipante.nome} `;

    // Add ID badge
    const idBadge = document.createElement("span");
    idBadge.className = "participant-id";
    idBadge.textContent = `#${partecipante.id}`;
    nameSpan.appendChild(idBadge);

    // Punti del partecipante
    const pointsSpan = document.createElement("span");
    pointsSpan.className = "participant-points";
    pointsSpan.textContent = partecipante.punti;

    infoContainer.appendChild(nameSpan);
    infoContainer.appendChild(document.createTextNode(": "));
    infoContainer.appendChild(pointsSpan);

    // Bottone elimina
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.setAttribute(
      "aria-label",
      `Elimina ${partecipante.nome} (ID: ${partecipante.id})`
    );

    const deleteIcon = document.createElement("span");
    deleteIcon.className = "material-icons";
    deleteIcon.textContent = "delete";

    deleteButton.appendChild(deleteIcon);
    deleteButton.addEventListener("click", () => eliminaPartecipante(index));

    listItem.appendChild(infoContainer);
    listItem.appendChild(deleteButton);
    participantList.appendChild(listItem);
  });
}

// Update the aggiornaSelezionePartecipante function to display the ID
function aggiornaSelezionePartecipante() {
  selectedParticipantSelect.innerHTML = "";

  // Opzioni di default
  const defaultOption = document.createElement("option");
  defaultOption.value = "-1";
  defaultOption.textContent = "Seleziona un partecipante";
  selectedParticipantSelect.appendChild(defaultOption);

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "Tutti";
  selectedParticipantSelect.appendChild(allOption);

  // Aggiungi tutti i partecipanti
  partecipanti.forEach((partecipante, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${partecipante.nome} #${partecipante.id}`;
    selectedParticipantSelect.appendChild(option);
  });
}

// Funzioni per la gestione dei punti
function aggiungiPunti() {
  const punti = Number.parseFloat(pointsInput.value);
  const selectedParticipantIndex = selectedParticipantSelect.value;

  if (isNaN(punti) || punti < 0) {
    showToast("Inserisci un valore valido", "error");
    pointsInput.focus();
    return;
  }

  if (selectedParticipantIndex === "-1") {
    showToast("Seleziona un partecipante", "warning");
    selectedParticipantSelect.focus();
    return;
  }

  if (selectedParticipantIndex === "all") {
    for (const partecipante of partecipanti) {
      partecipante.punti += punti;
    }
    showToast(`${punti} punti aggiunti a tutti i partecipanti`, "success");
  } else {
    const index = Number.parseInt(selectedParticipantIndex);
    partecipanti[index].punti += punti;
    showToast(
      `${punti} punti aggiunti a ${partecipanti[index].nome}`,
      "success"
    );
  }

  aggiornaListaPartecipanti();
  pointsInput.value = "0";
  pointsInput.focus();
}

function togliPunti() {
  const punti = Number.parseFloat(pointsInput.value);
  const selectedParticipantIndex = selectedParticipantSelect.value;

  if (isNaN(punti) || punti < 0) {
    showToast("Inserisci un valore valido", "error");
    pointsInput.focus();
    return;
  }

  if (selectedParticipantIndex === "-1") {
    showToast("Seleziona un partecipante", "warning");
    selectedParticipantSelect.focus();
    return;
  }

  if (selectedParticipantIndex === "all") {
    for (const partecipante of partecipanti) {
      partecipante.punti -= punti;
    }
    showToast(`${punti} punti tolti a tutti i partecipanti`, "success");
  } else {
    const index = Number.parseInt(selectedParticipantIndex);
    partecipanti[index].punti -= punti;
    showToast(`${punti} punti tolti a ${partecipanti[index].nome}`, "success");
  }

  aggiornaListaPartecipanti();
  pointsInput.value = "0";
  pointsInput.focus();
}

function impostaModalitàVittoria(modalità) {
  modalitàVittoria = modalità;
  aggiornaListaPartecipanti();

  showToast(
    `Modalità vittoria: ${modalità === "max" ? "Più punti" : "Meno punti"}`,
    "info"
  );
}

// Update the trovaVincitore function to handle IDs
function trovaVincitore() {
  if (partecipanti.length === 0) {
    showToast("Nessun partecipante disponibile", "error");
    return;
  }

  let vincitore = null;
  let punteggioVincente =
    modalitàVittoria === "max"
      ? Number.NEGATIVE_INFINITY
      : Number.POSITIVE_INFINITY;
  let vincitori = [];

  // Trova il punteggio vincente
  for (const partecipante of partecipanti) {
    if (
      (modalitàVittoria === "max" && partecipante.punti > punteggioVincente) ||
      (modalitàVittoria === "min" && partecipante.punti < punteggioVincente)
    ) {
      vincitore = partecipante;
      punteggioVincente = partecipante.punti;
      vincitori = [partecipante];
    } else if (partecipante.punti === punteggioVincente) {
      vincitori.push(partecipante);
    }
  }

  if (vincitori.length > 1) {
    // Pareggio
    showTieModal(vincitori, punteggioVincente);
  } else if (vincitore) {
    // Vittoria
    showVictoryModal(vincitore.nome, vincitore.punti, vincitore.id);
  } else {
    showToast("Nessun vincitore", "error");
  }
}

// Variables for reset functionality
let resetType = null;

// Reset modal functions
function mostraResetModal(type) {
  resetType = type;

  // Reset the UI
  resetPointsOption.classList.remove("selected");
  resetAllOption.classList.remove("selected");

  // Select the appropriate option
  if (type === "points") {
    resetPointsOption.classList.add("selected");
  } else if (type === "all") {
    resetAllOption.classList.add("selected");
  }

  // Reset progress bar
  resetProgressContainer.style.display = "none";
  resetProgressBar.style.width = "0%";

  // Reset button text
  resetBtnText.textContent = "Conferma Reset";
  confirmResetBtn.disabled = false;

  // Show the modal
  resetModal.style.display = "flex";
  resetModal.setAttribute("aria-hidden", "false");
}

function hideResetModal() {
  resetModal.style.display = "none";
  resetModal.setAttribute("aria-hidden", "true");
}

function selectResetOption(type) {
  resetType = type;

  // Update UI
  resetPointsOption.classList.remove("selected");
  resetAllOption.classList.remove("selected");

  if (type === "points") {
    resetPointsOption.classList.add("selected");
  } else if (type === "all") {
    resetAllOption.classList.add("selected");
  }
}

function eseguiReset() {
  if (!resetType) return;

  if (partecipanti.length === 0) {
    showToast("Nessun partecipante disponibile", "warning");
    hideResetModal();
    return;
  }

  // Disable the button and show progress
  confirmResetBtn.disabled = true;
  resetBtnText.innerHTML =
    '<span class="loading-spinner"></span> Resettando...';
  resetProgressContainer.style.display = "block";

  // Simulate progress (for UX purposes)
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 10;
    resetProgressBar.style.width = `${progress}%`;

    if (progress >= 100) {
      clearInterval(progressInterval);

      // Execute the actual reset
      if (resetType === "points") {
        // Reset points
        partecipanti.forEach((partecipante) => (partecipante.punti = 0));
        aggiornaListaPartecipanti();
        showToast("Punteggi azzerati con successo", "success");
      } else if (resetType === "all") {
        // Reset everything
        partecipanti.length = 0;
        aggiornaListaPartecipanti();
        aggiornaSelezionePartecipante();
        showToast("Tutti i partecipanti sono stati eliminati", "success");
      }

      // Close the modal after a short delay
      setTimeout(() => {
        hideResetModal();
      }, 500);
    }
  }, 100);
}

// File feedback modal functions
function showFileFeedbackModal(results) {
  // Set the status icon and text based on results
  if (results.errors.length > 0) {
    fileFeedbackIcon.textContent = "error";
    fileFeedbackStatus.textContent = "Caricamento completato con errori";
    fileFeedbackIcon.style.color = "var(--color-danger)";
  } else if (results.warnings.length > 0) {
    fileFeedbackIcon.textContent = "warning";
    fileFeedbackStatus.textContent = "Caricamento completato con avvisi";
    fileFeedbackIcon.style.color = "var(--color-warning)";
  } else {
    fileFeedbackIcon.textContent = "check_circle";
    fileFeedbackStatus.textContent = "Caricamento completato con successo";
    fileFeedbackIcon.style.color = "var(--color-success)";
  }

  // Set the count
  fileFeedbackCount.textContent = `${results.success.length} di ${results.total} partecipanti caricati`;

  // Clear previous list
  fileFeedbackList.innerHTML = "";

  // Add success items
  results.success.forEach((item) => {
    const listItem = document.createElement("div");
    listItem.className = "file-feedback-item success";
    listItem.innerHTML = `
      <span class="material-icons file-feedback-item-icon">check_circle</span>
      <span>${item.nome} #${item.id}: ${item.punti} punti</span>
    `;
    fileFeedbackList.appendChild(listItem);
  });

  // Add warning items (duplicates)
  results.warnings.forEach((item) => {
    const listItem = document.createElement("div");
    listItem.className = "file-feedback-item warning";
    listItem.innerHTML = `
      <span class="material-icons file-feedback-item-icon">warning</span>
      <span>${item.nome} #${item.id}: Partecipante già esistente, dati aggiornati</span>
    `;
    fileFeedbackList.appendChild(listItem);
  });

  // Add error items
  results.errors.forEach((item) => {
    const listItem = document.createElement("div");
    listItem.className = "file-feedback-item error";
    listItem.innerHTML = `
      <span class="material-icons file-feedback-item-icon">error</span>
      <span>${item.message}</span>
    `;
    fileFeedbackList.appendChild(listItem);
  });

  // Set summary
  fileFeedbackSummary.innerHTML = `
    <div>
      <span class="material-icons" style="color: var(--color-success)">check_circle</span>
      ${results.success.length} aggiunti
    </div>
    <div>
      <span class="material-icons" style="color: var(--color-warning)">warning</span>
      ${results.warnings.length} aggiornati
    </div>
    <div>
      <span class="material-icons" style="color: var(--color-danger)">error</span>
      ${results.errors.length} errori
    </div>
  `;

  // Show the modal
  fileFeedbackModal.style.display = "flex";
  fileFeedbackModal.setAttribute("aria-hidden", "false");

  // Focus on the OK button
  setTimeout(() => {
    fileFeedbackOkBtn.focus();
  }, 100);
}

function hideFileFeedbackModal() {
  fileFeedbackModal.style.display = "none";
  fileFeedbackModal.setAttribute("aria-hidden", "true");
}

// Replace the existing caricaDaFile function with this enhanced version
function caricaDaFile() {
  // Crea un input di tipo file
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".txt,.json";

  // Gestisci il caricamento del file
  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) {
      showToast("Nessun file selezionato", "warning");
      return;
    }

    // Show loading toast
    showToast("Caricamento file in corso...", "info");

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const fileContent = e.target.result;
        const fileExtension = file.name.split(".").pop().toLowerCase();

        // Results tracking
        const results = {
          total: 0,
          success: [],
          warnings: [],
          errors: [],
        };

        // Process based on file type
        if (fileExtension === "json") {
          // Parse JSON file
          const jsonData = JSON.parse(fileContent);

          if (!Array.isArray(jsonData)) {
            throw new Error(
              "Il file JSON non contiene un array di partecipanti"
            );
          }

          results.total = jsonData.length;

          // Process each participant
          jsonData.forEach((item) => {
            try {
              // Validate data
              if (!item.nome || item.punti === undefined) {
                results.errors.push({
                  message: `Dati incompleti: ${JSON.stringify(item)}`,
                });
                return;
              }

              const nome = item.nome.trim();
              const punti = Number.parseFloat(item.punti) || 0;
              const id = Number.parseInt(item.id) || nextParticipantId++;

              // Check for duplicates
              const existingIndex = partecipanti.findIndex((p) => p.id === id);

              if (existingIndex >= 0) {
                // Update existing participant
                partecipanti[existingIndex].nome = nome;
                partecipanti[existingIndex].punti = punti;

                results.warnings.push({
                  nome,
                  id,
                  punti,
                });
              } else {
                // Add new participant
                partecipanti.push({ id, nome, punti });

                // Update nextParticipantId if needed
                if (id >= nextParticipantId) {
                  nextParticipantId = id + 1;
                }

                results.success.push({
                  nome,
                  id,
                  punti,
                });
              }
            } catch (itemError) {
              results.errors.push({
                message: `Errore nell'elaborazione: ${itemError.message}`,
              });
            }
          });
        } else {
          // Process text file (default)
          const righe = fileContent
            .split("\n")
            .filter((riga) => riga.trim() !== "");
          results.total = righe.length;

          righe.forEach((riga) => {
            try {
              // Format: nome:punti:id
              const parti = riga.split(":");
              const nome = parti[0].trim();
              const punti = Number.parseFloat(parti[1]) || 0;
              const id = Number.parseInt(parti[2]) || nextParticipantId++;

              if (!nome) {
                results.errors.push({
                  message: `Nome mancante: ${riga}`,
                });
                return;
              }

              // Check for duplicates
              const existingIndex = partecipanti.findIndex((p) => p.id === id);

              if (existingIndex >= 0) {
                // Update existing participant
                partecipanti[existingIndex].nome = nome;
                partecipanti[existingIndex].punti = punti;

                results.warnings.push({
                  nome,
                  id,
                  punti,
                });
              } else {
                // Add new participant
                partecipanti.push({ id, nome, punti });

                // Update nextParticipantId if needed
                if (id >= nextParticipantId) {
                  nextParticipantId = id + 1;
                }

                results.success.push({
                  nome,
                  id,
                  punti,
                });
              }
            } catch (rigaError) {
              results.errors.push({
                message: `Errore nell'elaborazione: ${rigaError.message}`,
              });
            }
          });
        }

        // Update UI
        aggiornaListaPartecipanti();
        aggiornaSelezionePartecipante();

        // Show feedback modal
        showFileFeedbackModal(results);
      } catch (error) {
        console.error("Errore durante il caricamento del file:", error);
        showToast(
          `Errore durante il caricamento del file: ${error.message}`,
          "error"
        );
      }
    };

    reader.onerror = () => {
      showToast("Errore nella lettura del file", "error");
    };

    // Read the file based on its type
    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (fileExtension === "json") {
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
  });

  // Simula il clic per aprire il dialogo file
  input.click();
}

// Update the salvaSuFile function to support JSON export
function salvaSuFile() {
  if (partecipanti.length === 0) {
    showToast("Nessun partecipante da salvare", "error");
    return;
  }

  // Ask user for file format
  const formatOptions = document.createElement("div");
  formatOptions.className = "format-options";
  formatOptions.innerHTML = `
    <div class="format-option">
      <input type="radio" id="format-txt" name="format" value="txt" checked>
      <label for="format-txt">File di testo (.txt)</label>
    </div>
    <div class="format-option">
      <input type="radio" id="format-json" name="format" value="json">
      <label for="format-json">File JSON (.json)</label>
    </div>
  `;

  // Create a custom dialog
  const dialog = document.createElement("div");
  dialog.className = "custom-dialog";
  dialog.innerHTML = `
    <div class="dialog-content">
      <h3>Seleziona formato file</h3>
      <div class="dialog-body"></div>
      <div class="dialog-actions">
        <button class="btn btn-secondary" id="cancel-format">Annulla</button>
        <button class="btn btn-primary" id="confirm-format">Salva</button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);
  dialog.querySelector(".dialog-body").appendChild(formatOptions);

  // Add event listeners
  const cancelBtn = dialog.querySelector("#cancel-format");
  const confirmBtn = dialog.querySelector("#confirm-format");

  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(dialog);
  });

  confirmBtn.addEventListener("click", () => {
    const format = dialog.querySelector('input[name="format"]:checked').value;
    document.body.removeChild(dialog);

    // Save file in selected format
    if (format === "json") {
      saveAsJson();
    } else {
      saveAsTxt();
    }
  });

  // Show dialog
  dialog.style.display = "flex";

  // Functions to save in different formats
  function saveAsTxt() {
    // Crea il contenuto in formato leggibile
    const contenuto = partecipanti
      .map(
        (partecipante) =>
          `${partecipante.nome}:${partecipante.punti}:${partecipante.id}`
      )
      .join("\n");

    // Crea un blob per il download
    const blob = new Blob([contenuto], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // Crea un link temporaneo per il download
    const a = document.createElement("a");
    a.href = url;
    a.download = "partecipanti.txt";
    a.click();

    // Revoca l'URL per liberare memoria
    URL.revokeObjectURL(url);

    showToast("File salvato con successo", "success");
  }

  function saveAsJson() {
    // Create JSON content
    const jsonContent = JSON.stringify(partecipanti, null, 2);

    // Create blob for download
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create temporary link for download
    const a = document.createElement("a");
    a.href = url;
    a.download = "partecipanti.json";
    a.click();

    // Revoca URL to free memory
    URL.revokeObjectURL(url);

    showToast("File JSON salvato con successo", "success");
  }
}

// Remove the old reset functions and replace with these stubs that call the new modal
function resettaPunti() {
  mostraResetModal("points");
}

function resettaTotale() {
  mostraResetModal("all");
}

document.getElementById("footer").innerHTML = `
    <footer>
      <p>© ${new Date().getFullYear()} Gestione Punteggi | <button class="link-button" id="accessibility-btn">Accessibilità</button></p>
    </footer>
  `;
