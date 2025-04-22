// Variabili globali
let nomi = [];
let isGenerating = false;
const MAX_CONFETTI = 100;
const CONFETTI_COLORS = [
  "#6366f1",
  "#818cf8",
  "#4f46e5", // Indigo
  "#06b6d4",
  "#22d3ee",
  "#0891b2", // Cyan
  "#f59e0b",
  "#fbbf24",
  "#d97706", // Amber
  "#ef4444",
  "#f87171",
  "#dc2626", // Red
  "#10b981",
  "#34d399",
  "#059669", // Emerald
];

// Elementi DOM
const nomeInput = document.getElementById("nomeInput");
const aggiungiButton = document.getElementById("aggiungiButton");
const nomiInseriti = document.getElementById("nomiInseriti");
const generateButton = document.getElementById("generateButton");
const nomeCasuale = document.getElementById("nomeCasuale");
const nameCount = document.getElementById("nameCount");
const emptyState = document.getElementById("emptyState");
const clearAllButton = document.getElementById("clearAllButton");
const importButton = document.getElementById("importButton");
const exportButton = document.getElementById("exportButton");
const importModal = document.getElementById("importModal");
const closeImportModal = document.getElementById("closeImportModal");
const importText = document.getElementById("importText");
const confirmImport = document.getElementById("confirmImport");
const cancelImport = document.getElementById("cancelImport");
const resultWheel = document.getElementById("resultWheel");
const toastContainer = document.getElementById("toastContainer");
const confettiContainer = document.getElementById("confettiContainer");

// Inizializzazione dell'applicazione
document.addEventListener("DOMContentLoaded", () => {
  // Carica i nomi dal localStorage se disponibili
  loadNamesFromStorage();

  // Aggiungi event listeners
  nomeInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      aggiungiNome();
    }
  });

  aggiungiButton.addEventListener("click", aggiungiNome);
  generateButton.addEventListener("click", generaNomeCasuale);
  clearAllButton.addEventListener("click", clearAllNames);
  importButton.addEventListener("click", showImportModal);
  exportButton.addEventListener("click", exportNames);
  closeImportModal.addEventListener("click", hideImportModal);
  confirmImport.addEventListener("click", importNames);
  cancelImport.addEventListener("click", hideImportModal);

  // Aggiorna l'interfaccia
  updateInterface();
});

// Funzione per aggiungere un nome alla lista
function aggiungiNome() {
  const inputNome = nomeInput.value.trim();

  if (inputNome === "") {
    showToast("Errore", "Inserisci un nome valido", "error");
    nomeInput.focus();
    return;
  }

  // Controlla se il nome è già presente
  if (nomi.includes(inputNome)) {
    showToast("Attenzione", "Questo nome è già nella lista", "warning");
    nomeInput.value = "";
    nomeInput.focus();
    return;
  }

  // Aggiungi il nome all'array
  nomi.push(inputNome);

  // Aggiorna l'interfaccia
  updateInterface();

  // Salva i nomi nel localStorage
  saveNamesToStorage();

  // Mostra un toast di conferma
  showToast("Successo", `"${inputNome}" aggiunto alla lista`, "success");

  // Pulisci l'input e rimetti il focus
  nomeInput.value = "";
  nomeInput.focus();
}

// Funzione per rimuovere un nome dalla lista
function rimuoviNome(index) {
  const nomeRimosso = nomi[index];
  nomi.splice(index, 1);

  // Aggiorna l'interfaccia
  updateInterface();

  // Salva i nomi nel localStorage
  saveNamesToStorage();

  // Mostra un toast di conferma
  showToast("Informazione", `"${nomeRimosso}" rimosso dalla lista`, "info");
}

// Funzione per generare un nome casuale
function generaNomeCasuale() {
  if (isGenerating) return;

  if (nomi.length === 0) {
    showToast("Errore", "Aggiungi almeno un nome alla lista", "error");
    return;
  }

  isGenerating = true;

  // Disabilita il pulsante durante l'animazione
  generateButton.disabled = true;

  // Avvia l'animazione di rotazione
  resultWheel.classList.add("spinning");

  // Sequenza di animazione
  let animationCount = 0;
  const maxAnimations = 10;
  const animationInterval = setInterval(() => {
    animationCount++;

    // Genera un nome casuale per l'animazione
    const randomIndex = Math.floor(Math.random() * nomi.length);
    nomeCasuale.textContent = nomi[randomIndex];

    // Ferma l'animazione dopo un certo numero di iterazioni
    if (animationCount >= maxAnimations) {
      clearInterval(animationInterval);

      // Seleziona il nome finale
      const finalIndex = Math.floor(Math.random() * nomi.length);
      const finalName = nomi[finalIndex];

      // Ferma l'animazione di rotazione
      resultWheel.classList.remove("spinning");

      // Aggiorna il display con il nome finale
      setTimeout(() => {
        nomeCasuale.textContent = finalName;
        nomeCasuale.classList.add("highlight");

        // Genera confetti
        createConfetti();

        // Riabilita il pulsante di generazione dopo un breve ritardo
        setTimeout(() => {
          generateButton.disabled = false;
          nomeCasuale.classList.remove("highlight");
          isGenerating = false;
        }, 500);
      }, 300);
    }
  }, 100);
}

// Funzione per aggiornare l'interfaccia
function updateInterface() {
  // Aggiorna il contatore dei nomi
  nameCount.textContent = nomi.length;

  // Aggiorna la lista dei nomi
  nomiInseriti.innerHTML = "";

  // Mostra o nascondi lo stato vuoto
  if (nomi.length === 0) {
    emptyState.style.display = "flex";
  } else {
    emptyState.style.display = "none";

    // Popola la lista dei nomi
    nomi.forEach((nome, index) => {
      const li = document.createElement("li");

      const nameText = document.createElement("span");
      nameText.className = "name-text";
      nameText.textContent = nome;

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-button";
      deleteButton.innerHTML = '<i class="fas fa-times"></i>';
      deleteButton.title = "Rimuovi nome";
      deleteButton.onclick = () => rimuoviNome(index);

      li.appendChild(nameText);
      li.appendChild(deleteButton);
      nomiInseriti.appendChild(li);
    });
  }
}

// Funzione per cancellare tutti i nomi
function clearAllNames() {
  if (nomi.length === 0) {
    showToast("Informazione", "La lista è già vuota", "info");
    return;
  }

  if (confirm("Sei sicuro di voler cancellare tutti i nomi?")) {
    nomi = [];
    updateInterface();
    saveNamesToStorage();
    showToast("Successo", "Tutti i nomi sono stati rimossi", "success");
    nomeCasuale.textContent = "Premi il pulsante per estrarre";
  }
}

// Funzione per mostrare il modal di importazione
function showImportModal() {
  importText.value = "";
  importModal.classList.add("show");
}

// Funzione per nascondere il modal di importazione
function hideImportModal() {
  importModal.classList.remove("show");
}

// Funzione per importare nomi
function importNames() {
  const text = importText.value.trim();

  if (text === "") {
    showToast("Errore", "Inserisci almeno un nome", "error");
    return;
  }

  // Dividi il testo in righe e poi per virgole
  const lines = text
    .split(/[\n,]+/)
    .map((name) => name.trim())
    .filter((name) => name !== "");

  if (lines.length === 0) {
    showToast("Errore", "Nessun nome valido trovato", "error");
    return;
  }

  // Conta quanti nomi sono stati aggiunti
  let addedCount = 0;

  // Aggiungi i nomi all'array, evitando duplicati
  lines.forEach((name) => {
    if (!nomi.includes(name)) {
      nomi.push(name);
      addedCount++;
    }
  });

  // Aggiorna l'interfaccia
  updateInterface();

  // Salva i nomi nel localStorage
  saveNamesToStorage();

  // Nascondi il modal
  hideImportModal();

  // Mostra un toast di conferma
  if (addedCount > 0) {
    showToast("Successo", `Importati ${addedCount} nuovi nomi`, "success");
  } else {
    showToast("Informazione", "Nessun nuovo nome importato", "info");
  }
}

// Funzione per esportare nomi
function exportNames() {
  if (nomi.length === 0) {
    showToast("Errore", "Non ci sono nomi da esportare", "error");
    return;
  }

  // Crea un elemento textarea temporaneo
  const textarea = document.createElement("textarea");
  textarea.value = nomi.join("\n");
  document.body.appendChild(textarea);

  // Seleziona e copia il testo
  textarea.select();
  document.execCommand("copy");

  // Rimuovi l'elemento
  document.body.removeChild(textarea);

  showToast("Successo", `${nomi.length} nomi copiati negli appunti`, "success");
}

// Funzione per salvare i nomi nel localStorage
function saveNamesToStorage() {
  localStorage.setItem("randomNameGenerator_names", JSON.stringify(nomi));
}

// Funzione per caricare i nomi dal localStorage
function loadNamesFromStorage() {
  const savedNames = localStorage.getItem("randomNameGenerator_names");
  if (savedNames) {
    try {
      nomi = JSON.parse(savedNames);
    } catch (e) {
      console.error("Errore nel caricamento dei nomi salvati:", e);
      nomi = [];
    }
  }
}

// Funzione per mostrare un toast di notifica
function showToast(title, message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const iconClass = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  }[type];

  toast.innerHTML = `
    <div class="toast-icon ${type}">
      <i class="fas ${iconClass}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;

  toastContainer.appendChild(toast);

  // Rimuovi il toast dopo 3 secondi
  setTimeout(() => {
    if (toastContainer.contains(toast)) {
      toastContainer.removeChild(toast);
    }
  }, 3000);
}

// Funzione per creare l'effetto confetti
function createConfetti() {
  confettiContainer.innerHTML = "";

  for (let i = 0; i < MAX_CONFETTI; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";

    // Proprietà casuali per ogni confetto
    const size = Math.random() * 10 + 5;
    const colorIndex = Math.floor(Math.random() * CONFETTI_COLORS.length);
    const left = Math.random() * window.innerWidth;
    const duration = Math.random() * 3 + 2;
    const delay = Math.random() * 0.5;

    // Forme casuali
    const shapes = ["circle", "square", "triangle"];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    // Applica stili
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = CONFETTI_COLORS[colorIndex];
    confetti.style.left = `${left}px`;
    confetti.style.top = "0";
    confetti.style.animationDuration = `${duration}s`;
    confetti.style.animationDelay = `${delay}s`;

    // Applica forme diverse
    if (shape === "circle") {
      confetti.style.borderRadius = "50%";
    } else if (shape === "triangle") {
      confetti.style.backgroundColor = "transparent";
      confetti.style.width = "0";
      confetti.style.height = "0";
      confetti.style.borderLeft = `${size / 2}px solid transparent`;
      confetti.style.borderRight = `${size / 2}px solid transparent`;
      confetti.style.borderBottom = `${size}px solid ${CONFETTI_COLORS[colorIndex]}`;
    }

    confettiContainer.appendChild(confetti);

    // Rimuovi il confetto dopo l'animazione
    setTimeout(() => {
      if (confettiContainer.contains(confetti)) {
        confettiContainer.removeChild(confetti);
      }
    }, (duration + delay) * 1000);
  }
}
