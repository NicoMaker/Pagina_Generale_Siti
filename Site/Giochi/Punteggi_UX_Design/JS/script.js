// At the top of the file, add a new variable to track the next available ID
const partecipanti = []
let modalitàVittoria = "max"
let nextParticipantId = 1 // Start from 1

// Elementi DOM
const participantList = document.getElementById("participant-list")
const participantNameInput = document.getElementById("participant-name")
const pointsInput = document.getElementById("points")
const selectedParticipantSelect = document.getElementById("selected-participant")
const themeToggleBtn = document.getElementById("theme-toggle-btn")
const themeIcon = document.getElementById("theme-icon")
const accessibilityModal = document.getElementById("accessibility-modal")
const closeModalBtn = document.getElementById("close-modal")
const toastElement = document.getElementById("toast")
const victoryModal = document.getElementById("victory-modal")
const tieModal = document.getElementById("tie-modal")
const leaderboardModal = document.getElementById("leaderboard-modal")
const shareModal = document.getElementById("share-modal")
const victoryMessage = document.getElementById("victory-message")
const victoryDetails = document.getElementById("victory-details")
const tieMessage = document.getElementById("tie-message")
const tieDetails = document.getElementById("tie-details")
const closeVictoryModalBtn = document.getElementById("close-victory-modal")
const closeTieModalBtn = document.getElementById("close-tie-modal")
const closeLeaderboardModalBtn = document.getElementById("close-leaderboard-modal")
const closeShareModalBtn = document.getElementById("close-share-modal")
const confettiContainer = document.getElementById("confetti-container")
const leaderboardDate = document.getElementById("leaderboard-date")
const leaderboardMode = document.getElementById("leaderboard-mode")
const podiumContainer = document.getElementById("podium-container")
const leaderboardBody = document.getElementById("leaderboard-body")
const shareTextPreview = document.getElementById("share-text-preview")

// Add these variables at the top with the other DOM elements
const resetModal = document.getElementById("reset-modal")
const closeResetModalBtn = document.getElementById("close-reset-modal")
const resetPointsOption = document.getElementById("reset-points-option")
const resetAllOption = document.getElementById("reset-all-option")
const cancelResetBtn = document.getElementById("cancel-reset-btn")
const confirmResetBtn = document.getElementById("confirm-reset-btn")
const resetBtnText = document.getElementById("reset-btn-text")
const resetProgressContainer = document.getElementById("reset-progress-container")
const resetProgressBar = document.getElementById("reset-progress-bar")

const fileFeedbackModal = document.getElementById("file-feedback-modal")
const closeFileFeedbackModalBtn = document.getElementById("close-file-feedback-modal")
const fileFeedbackIcon = document.getElementById("file-feedback-icon")
const fileFeedbackStatus = document.getElementById("file-feedback-status")
const fileFeedbackCount = document.getElementById("file-feedback-count")
const fileFeedbackList = document.getElementById("file-feedback-list")
const fileFeedbackSummary = document.getElementById("file-feedback-summary")
const fileFeedbackOkBtn = document.getElementById("file-feedback-ok-btn")

// Add delete modal elements
const deleteParticipantModal = document.getElementById("delete-participant-modal")
const closeDeleteModalBtn = document.getElementById("close-delete-modal")
const cancelDeleteBtn = document.getElementById("cancel-delete-btn")
const confirmDeleteBtn = document.getElementById("confirm-delete-btn")
const deleteParticipantName = document.getElementById("delete-participant-name")
const deleteParticipantStats = document.getElementById("delete-participant-stats")

// Variable to track which participant is being deleted
let participantToDelete = -1

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
]

// Declare html2canvas
let html2canvas

// Inizializzazione
document.addEventListener("DOMContentLoaded", () => {
  // Carica il tema salvato
  loadThemePreference()

  // Carica i dati salvati
  caricaDatiSalvati()

  // Aggiungi event listeners
  setupEventListeners()

  // Inizializza l'interfaccia
  aggiornaListaPartecipanti()
  aggiornaSelezionePartecipante()

  // Initialize the footer with the accessibility button
  initializeFooter()
})

// Function to initialize the footer with the accessibility button
function initializeFooter() {
  const footer = document.getElementById("footer")
  if (footer) {
    footer.innerHTML = `
    <footer>
      <p>© ${new Date().getFullYear()} Gestione Punteggi | <button class="link-button" id="accessibility-btn">Accessibilità</button></p>
    </footer>
  `

    // Now that we've created the accessibility button, we can add the event listener
    const accessibilityBtn = document.getElementById("accessibility-btn")
    if (accessibilityBtn) {
      accessibilityBtn.addEventListener("click", showAccessibilityModal)
    }
  }
}

// Funzione per impostare gli event listeners
function setupEventListeners() {
  // Gestione tema
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme)
  }

  // Gestione modale accessibilità
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", hideAccessibilityModal)
  }

  window.addEventListener("click", (e) => {
    if (accessibilityModal && e.target === accessibilityModal) {
      hideAccessibilityModal()
    }
    if (victoryModal && e.target === victoryModal) {
      hideVictoryModal()
    }
    if (tieModal && e.target === tieModal) {
      hideTieModal()
    }
    if (leaderboardModal && e.target === leaderboardModal) {
      hideLeaderboardModal()
    }
    if (shareModal && e.target === shareModal) {
      hideShareModal()
    }
    if (resetModal && e.target === resetModal) {
      hideResetModal()
    }
    if (fileFeedbackModal && e.target === fileFeedbackModal) {
      hideFileFeedbackModal()
    }
    if (editNameModal && e.target === editNameModal) {
      hideEditNameModal()
    }
    if (deleteParticipantModal && e.target === deleteParticipantModal) {
      hideDeleteParticipantModal()
    }
  })

  // Gestione modale vittoria
  if (closeVictoryModalBtn) {
    closeVictoryModalBtn.addEventListener("click", hideVictoryModal)
  }

  if (closeTieModalBtn) {
    closeTieModalBtn.addEventListener("click", hideTieModal)
  }

  // Gestione modale classifica
  if (closeLeaderboardModalBtn) {
    closeLeaderboardModalBtn.addEventListener("click", hideLeaderboardModal)
  }

  // Gestione modale condivisione
  if (closeShareModalBtn) {
    closeShareModalBtn.addEventListener("click", hideShareModal)
  }

  // Gestione modale eliminazione partecipante
  if (closeDeleteModalBtn) {
    closeDeleteModalBtn.addEventListener("click", hideDeleteParticipantModal)
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", hideDeleteParticipantModal)
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", confermaEliminazionePartecipante)
  }

  // Gestione tasti per accessibilità
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (accessibilityModal && accessibilityModal.style.display === "flex") {
        hideAccessibilityModal()
      }
      if (victoryModal && victoryModal.style.display === "flex") {
        hideVictoryModal()
      }
      if (tieModal && tieModal.style.display === "flex") {
        hideTieModal()
      }
      if (leaderboardModal && leaderboardModal.style.display === "flex") {
        hideLeaderboardModal()
      }
      if (shareModal && shareModal.style.display === "flex") {
        hideShareModal()
      }
      if (resetModal && resetModal.style.display === "flex") {
        hideResetModal()
      }
      if (fileFeedbackModal && fileFeedbackModal.style.display === "flex") {
        hideFileFeedbackModal()
      }
      if (editNameModal && editNameModal.style.display === "flex") {
        hideEditNameModal()
      }
      if (deleteParticipantModal && deleteParticipantModal.style.display === "flex") {
        hideDeleteParticipantModal()
      }
    }
  })

  // Gestione invio per aggiungere partecipante
  if (participantNameInput) {
    participantNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        aggiungiPartecipante()
      }
    })
  }

  // Reset modal event listeners
  if (closeResetModalBtn) {
    closeResetModalBtn.addEventListener("click", hideResetModal)
  }

  if (cancelResetBtn) {
    cancelResetBtn.addEventListener("click", hideResetModal)
  }

  if (confirmResetBtn) {
    confirmResetBtn.addEventListener("click", eseguiReset)
  }

  // File feedback modal event listeners
  if (closeFileFeedbackModalBtn) {
    closeFileFeedbackModalBtn.addEventListener("click", hideFileFeedbackModal)
  }

  if (fileFeedbackOkBtn) {
    fileFeedbackOkBtn.addEventListener("click", hideFileFeedbackModal)
  }

  // Setup share modal close button
  setupShareModalCloseButton()

  // Setup edit name modal event listeners
  const closeEditNameModalBtn = document.getElementById("close-edit-name-modal")
  if (closeEditNameModalBtn) {
    closeEditNameModalBtn.addEventListener("click", hideEditNameModal)
  }

  const cancelEditNameBtn = document.getElementById("cancel-edit-name-btn")
  if (cancelEditNameBtn) {
    cancelEditNameBtn.addEventListener("click", hideEditNameModal)
  }

  const confirmEditNameBtn = document.getElementById("confirm-edit-name-btn")
  if (confirmEditNameBtn) {
    confirmEditNameBtn.addEventListener("click", salvaModificaNome)
  }
}

// Delete participant modal functions
function mostraDeleteParticipantModal(index) {
  if (!deleteParticipantModal || !deleteParticipantName || !deleteParticipantStats) return

  const partecipante = partecipanti[index]
  participantToDelete = index

  // Imposta le informazioni del partecipante
  deleteParticipantName.innerHTML = `${partecipante.nome} <span class="participant-id">#${partecipante.id}</span>`
  deleteParticipantStats.textContent = `Punteggio attuale: ${partecipante.punti} punti`

  // Mostra la modale
  deleteParticipantModal.style.display = "flex"
  deleteParticipantModal.setAttribute("aria-hidden", "false")

  // Focus sul pulsante di annullamento per sicurezza
  setTimeout(() => {
    if (cancelDeleteBtn) {
      cancelDeleteBtn.focus()
    }
  }, 100)

  // Annuncia per screen reader
  announceForScreenReader(`Conferma eliminazione di ${partecipante.nome} ID ${partecipante.id}`)
}

function hideDeleteParticipantModal() {
  if (deleteParticipantModal) {
    deleteParticipantModal.style.display = "none"
    deleteParticipantModal.setAttribute("aria-hidden", "true")
    participantToDelete = -1
  }
}

function confermaEliminazionePartecipante() {
  if (participantToDelete >= 0 && participantToDelete < partecipanti.length) {
    const partecipante = partecipanti[participantToDelete]
    eliminaPartecipante(participantToDelete)
    hideDeleteParticipantModal()

    // Mostra toast di conferma
    showToast(`${partecipante.nome} #${partecipante.id} eliminato definitivamente`, "success")
  }
}

// Funzioni per la gestione del tema
function toggleTheme() {
  const isDarkTheme = document.body.getAttribute("data-theme") === "dark"

  if (isDarkTheme) {
    document.body.removeAttribute("data-theme")
    themeIcon.textContent = "dark_mode"
    localStorage.setItem("theme", "light")
  } else {
    document.body.setAttribute("data-theme", "dark")
    themeIcon.textContent = "light_mode"
    localStorage.setItem("theme", "dark")
  }

  // Annuncia il cambio tema per screen reader
  showToast(isDarkTheme ? "Tema chiaro attivato" : "Tema scuro attivato", "info")
}

function loadThemePreference() {
  const savedTheme = localStorage.getItem("theme")

  if (savedTheme === "dark") {
    document.body.setAttribute("data-theme", "dark")
    if (themeIcon) {
      themeIcon.textContent = "light_mode"
    }
  } else if (themeIcon) {
    themeIcon.textContent = "dark_mode"
  }
}

// Funzioni per la gestione della modale
function showAccessibilityModal() {
  if (accessibilityModal) {
    accessibilityModal.style.display = "flex"
    accessibilityModal.setAttribute("aria-hidden", "false")

    // Focus sul primo elemento interattivo della modale
    setTimeout(() => {
      if (closeModalBtn) {
        closeModalBtn.focus()
      }
    }, 100)
  }
}

function hideAccessibilityModal() {
  if (accessibilityModal) {
    accessibilityModal.style.display = "none"
    accessibilityModal.setAttribute("aria-hidden", "true")

    // Ripristina il focus sull'elemento che ha aperto la modale
    const accessibilityBtn = document.getElementById("accessibility-btn")
    if (accessibilityBtn) {
      accessibilityBtn.focus()
    }
  }
}

// Funzioni per la gestione della modale di vittoria
function showVictoryModal(vincitore, punti, id) {
  if (!victoryModal || !victoryMessage || !victoryDetails) return

  // Imposta il messaggio di vittoria
  victoryMessage.innerHTML = `<span class="winner-name">${vincitore} <span class="winner-id">#${id}</span></span> ha vinto!`
  victoryDetails.innerHTML = `Con un punteggio di <strong>${punti}</strong> punti`

  // Mostra la modale
  victoryModal.style.display = "flex"
  victoryModal.setAttribute("aria-hidden", "false")

  // Crea effetto coriandoli
  createConfetti()

  // Aggiungi animazioni
  const trophyIcon = document.querySelector(".trophy-icon")
  const victoryMessageEl = document.querySelector(".victory-message")
  const victoryDetailsEl = document.querySelector(".victory-details")

  if (trophyIcon) trophyIcon.classList.add("bounce")
  if (victoryMessageEl) victoryMessageEl.classList.add("fade-in-up")
  if (victoryDetailsEl) victoryDetailsEl.classList.add("fade-in-up")

  // Focus sul pulsante di chiusura
  setTimeout(() => {
    if (closeVictoryModalBtn) {
      closeVictoryModalBtn.focus()
    }
  }, 500)

  // Leggi per screen reader
  const victoryAnnouncement = `${vincitore} ID ${id} ha vinto con ${punti} punti!`
  announceForScreenReader(victoryAnnouncement)
}

// Update the showTieModal function to display the IDs
function showTieModal(vincitori, punti) {
  if (!tieModal || !tieMessage || !tieDetails) return

  // Imposta il messaggio di pareggio
  tieMessage.innerHTML = `Pareggio tra ${vincitori.length} partecipanti!`

  // Crea la lista dei vincitori
  let detailsHTML = `<div class="tie-participants">Con un punteggio di <strong>${punti}</strong> punti:</div><ul class="tie-list">`

  vincitori.forEach((vincitore, index) => {
    detailsHTML += `<li><span class="medal medal-${
      index < 3 ? ["gold", "silver", "bronze"][index] : "default"
    }">${index + 1}</span> ${vincitore.nome} <span class="winner-id">#${vincitore.id}</span></li>`
  })

  detailsHTML += `</ul>`
  tieDetails.innerHTML = detailsHTML

  // Mostra la modale
  tieModal.style.display = "flex"
  tieModal.setAttribute("aria-hidden", "false")

  // Aggiungi animazioni
  const tieIcon = document.querySelector(".tie-icon")
  const tieMessageEl = document.querySelector(".tie-message")
  const tieDetailsEl = document.querySelector(".tie-details")

  if (tieIcon) tieIcon.classList.add("bounce")
  if (tieMessageEl) tieMessageEl.classList.add("fade-in-up")
  if (tieDetailsEl) tieDetailsEl.classList.add("fade-in-up")

  // Focus sul pulsante di chiusura
  setTimeout(() => {
    if (closeTieModalBtn) {
      closeTieModalBtn.focus()
    }
  }, 500)

  // Leggi per screen reader
  const tieAnnouncement = `Pareggio tra ${vincitori.map((v) => `${v.nome} ID ${v.id}`).join(", ")} con ${punti} punti!`
  announceForScreenReader(tieAnnouncement)
}

function hideVictoryModal() {
  if (!victoryModal) return

  victoryModal.style.display = "none"
  victoryModal.setAttribute("aria-hidden", "true")

  // Rimuovi i coriandoli
  if (confettiContainer) {
    confettiContainer.innerHTML = ""
  }

  // Rimuovi le classi di animazione
  const trophyIcon = document.querySelector(".trophy-icon")
  const victoryMessageEl = document.querySelector(".victory-message")
  const victoryDetailsEl = document.querySelector(".victory-details")

  if (trophyIcon) trophyIcon.classList.remove("bounce")
  if (victoryMessageEl) victoryMessageEl.classList.remove("fade-in-up")
  if (victoryDetailsEl) victoryDetailsEl.classList.remove("fade-in-up")
}

function hideTieModal() {
  if (!tieModal) return

  tieModal.style.display = "none"
  tieModal.setAttribute("aria-hidden", "true")

  // Rimuovi le classi di animazione
  const tieIcon = document.querySelector(".tie-icon")
  const tieMessageEl = document.querySelector(".tie-message")
  const tieDetailsEl = document.querySelector(".tie-details")

  if (tieIcon) tieIcon.classList.remove("bounce")
  if (tieMessageEl) tieMessageEl.classList.remove("fade-in-up")
  if (tieDetailsEl) tieDetailsEl.classList.remove("fade-in-up")
}

// Funzioni per la gestione della modale classifica
function mostraClassifica() {
  if (!leaderboardModal || !leaderboardDate || !leaderboardMode) return

  // Aggiorna la data e la modalità
  const oggi = new Date()
  const opzioniData = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
  leaderboardDate.textContent = oggi.toLocaleDateString("it-IT", opzioniData)
  leaderboardMode.textContent = `Modalità: ${modalitàVittoria === "max" ? "Più punti" : "Meno punti"}`

  // Ordina i partecipanti
  const partecipantiOrdinati = [...partecipanti].sort((a, b) =>
    modalitàVittoria === "max" ? b.punti - a.punti : a.punti - b.punti,
  )

  // Crea il podio
  creaPodio(partecipantiOrdinati)

  // Crea la tabella della classifica
  creaTabellaCassifica(partecipantiOrdinati)

  // Mostra la modale
  leaderboardModal.style.display = "flex"
  leaderboardModal.setAttribute("aria-hidden", "false")

  // Focus sul pulsante di chiusura
  setTimeout(() => {
    if (closeLeaderboardModalBtn) {
      closeLeaderboardModalBtn.focus()
    }
  }, 100)
}

function hideLeaderboardModal() {
  if (leaderboardModal) {
    leaderboardModal.style.display = "none"
    leaderboardModal.setAttribute("aria-hidden", "true")
  }
}

// Update the creaPodio function to display IDs
function creaPodio(partecipantiOrdinati) {
  if (!podiumContainer) return

  // Pulisci il contenitore del podio
  podiumContainer.innerHTML = ""

  // Verifica se ci sono abbastanza partecipanti per il podio
  if (partecipantiOrdinati.length === 0) {
    podiumContainer.innerHTML = "<p>Nessun partecipante disponibile</p>"
    return
  }

  // Crea il podio per i primi 3 (o meno se non ci sono abbastanza partecipanti)
  const numPodio = Math.min(3, partecipantiOrdinati.length)

  // Ordine di visualizzazione: secondo, primo, terzo
  const ordineVisualizzazione = [1, 0, 2]

  for (let i = 0; i < numPodio; i++) {
    const indice = ordineVisualizzazione[i]
    if (indice < partecipantiOrdinati.length) {
      const partecipante = partecipantiOrdinati[indice]
      const posizione = indice + 1

      // Crea l'elemento del podio
      const podiumPlace = document.createElement("div")
      podiumPlace.className = "podium-place"

      // Blocco del podio
      const podiumBlock = document.createElement("div")
      podiumBlock.className = `podium-block podium-${posizione === 1 ? "first" : posizione === 2 ? "second" : "third"}`
      podiumBlock.textContent = posizione

      // Informazioni sul partecipante
      const participantInfo = document.createElement("div")
      participantInfo.className = "podium-participant"

      const participantName = document.createElement("div")
      participantName.className = "podium-name"
      participantName.textContent = partecipante.nome

      // Add ID badge
      const idBadge = document.createElement("span")
      idBadge.className = "podium-id"
      idBadge.textContent = `#${partecipante.id}`
      participantName.appendChild(idBadge)

      const participantPoints = document.createElement("div")
      participantPoints.className = "podium-points"
      participantPoints.textContent = `${partecipante.punti} punti`

      // Assembla gli elementi
      participantInfo.appendChild(participantName)
      participantInfo.appendChild(participantPoints)

      podiumPlace.appendChild(podiumBlock)
      podiumPlace.appendChild(participantInfo)

      podiumContainer.appendChild(podiumPlace)
    }
  }
}

// Update the creaTabellaCassifica function to display IDs
function creaTabellaCassifica(partecipantiOrdinati) {
  if (!leaderboardBody) return

  // Pulisci la tabella
  leaderboardBody.innerHTML = ""

  if (partecipantiOrdinati.length === 0) {
    const emptyRow = document.createElement("tr")
    const emptyCell = document.createElement("td")
    emptyCell.colSpan = 3
    emptyCell.textContent = "Nessun partecipante disponibile"
    emptyCell.style.textAlign = "center"
    emptyRow.appendChild(emptyCell)
    leaderboardBody.appendChild(emptyRow)
    return
  }

  // Crea le righe della tabella
  partecipantiOrdinati.forEach((partecipante, index) => {
    const row = document.createElement("tr")

    // Aggiungi classe speciale per il vincitore
    if (index === 0) {
      row.className = "winner"
    }

    // Posizione
    const positionCell = document.createElement("td")
    positionCell.className = "position"

    // Aggiungi medaglia per i primi 3
    if (index < 3) {
      const medalSpan = document.createElement("span")
      medalSpan.className = `medal medal-${["gold", "silver", "bronze"][index]}`
      medalSpan.textContent = index + 1
      positionCell.appendChild(medalSpan)
    } else {
      positionCell.textContent = index + 1
    }

    // Nome con ID
    const nameCell = document.createElement("td")
    nameCell.className = "participant-name-cell"

    const nameSpan = document.createElement("span")
    nameSpan.textContent = partecipante.nome
    nameCell.appendChild(nameSpan)

    const idBadge = document.createElement("span")
    idBadge.className = "leaderboard-id-badge"
    idBadge.textContent = `#${partecipante.id}`
    nameCell.appendChild(idBadge)

    // Punti
    const pointsCell = document.createElement("td")
    pointsCell.className = "points"
    pointsCell.textContent = partecipante.punti

    // Assembla la riga
    row.appendChild(positionCell)
    row.appendChild(nameCell)
    row.appendChild(pointsCell)

    leaderboardBody.appendChild(row)
  })
}

// Funzioni per la condivisione
// Update the condividiClassifica function to include IDs
function condividiClassifica() {
  if (!shareModal || !shareTextPreview) return

  // Ottieni i dati della classifica
  const partecipantiOrdinati = [...partecipanti].sort((a, b) =>
    modalitàVittoria === "max" ? b.punti - a.punti : a.punti - b.punti,
  )

  // Crea il testo da condividere
  let testoCondivisione = "📊 Classifica finale:\n\n"

  partecipantiOrdinati.forEach((partecipante, index) => {
    const medaglia = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`
    testoCondivisione += `${medaglia} ${partecipante.nome} #${partecipante.id}: ${partecipante.punti} punti\n`
  })

  testoCondivisione += "\nModalità vittoria: " + (modalitàVittoria === "max" ? "Più punti" : "Meno punti")
  testoCondivisione += "\nData: " + new Date().toLocaleDateString("it-IT")

  // Aggiorna l'anteprima
  shareTextPreview.textContent = testoCondivisione

  // Mostra la modale di condivisione
  shareModal.style.display = "flex"
  shareModal.setAttribute("aria-hidden", "false")

  // Ensure the close button works
  setupShareModalCloseButton()

  // Focus sul pulsante di chiusura
  setTimeout(() => {
    const updatedCloseBtn = document.getElementById("close-share-modal")
    if (updatedCloseBtn) updatedCloseBtn.focus()
  }, 100)
}

function hideShareModal() {
  if (shareModal) {
    shareModal.style.display = "none"
    shareModal.setAttribute("aria-hidden", "true")
  }
}

// Add a dedicated function to properly handle the share modal close button
function setupShareModalCloseButton() {
  const closeBtn = document.getElementById("close-share-modal")
  if (closeBtn && shareModal) {
    // Remove any existing event listeners by cloning and replacing
    const newCloseBtn = closeBtn.cloneNode(true)
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn)

    // Add the event listener to the new button
    newCloseBtn.addEventListener("click", () => {
      hideShareModal()
    })
  }
}

function condividiSuWhatsApp() {
  if (!shareTextPreview) return
  const testo = encodeURIComponent(shareTextPreview.textContent)
  window.open(`https://wa.me/?text=${testo}`, "_blank")
}

function condividiSuTelegram() {
  if (!shareTextPreview) return
  const testo = encodeURIComponent(shareTextPreview.textContent)
  window.open(`https://t.me/share/url?url=&text=${testo}`, "_blank")
}

function condividiSuFacebook() {
  if (!shareTextPreview) return
  const testo = encodeURIComponent(shareTextPreview.textContent)
  const url = encodeURIComponent(window.location.href)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${testo}`, "_blank")
}

function condividiSuTwitter() {
  if (!shareTextPreview) return
  const testo = encodeURIComponent(shareTextPreview.textContent)
  window.open(`https://twitter.com/intent/tweet?text=${testo}`, "_blank")
}

function condividiSuLinkedIn() {
  if (!shareTextPreview) return
  const testo = encodeURIComponent(shareTextPreview.textContent)
  const url = encodeURIComponent(window.location.href)
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${testo}`, "_blank")
}

function condividiSuEmail() {
  if (!shareTextPreview) return
  const testo = encodeURIComponent(shareTextPreview.textContent)
  window.open(`mailto:?subject=Classifica&body=${testo}`, "_blank")
}

function copiaTestoClassifica() {
  if (!shareTextPreview) return
  const testo = shareTextPreview.textContent

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(testo)
      .then(() => {
        showToast("Testo copiato negli appunti", "success")
      })
      .catch((err) => {
        console.error("Errore durante la copia negli appunti:", err)
        showToast("Impossibile copiare negli appunti", "error")
      })
  } else {
    // Fallback per browser che non supportano clipboard API
    const textArea = document.createElement("textarea")
    textArea.value = testo
    textArea.style.position = "fixed"
    textArea.style.left = "-999999px"
    textArea.style.top = "-999999px"
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand("copy")
      if (successful) {
        showToast("Testo copiato negli appunti", "success")
      } else {
        showToast("Impossibile copiare negli appunti", "error")
      }
    } catch (err) {
      console.error("Errore durante la copia negli appunti:", err)
      showToast("Impossibile copiare negli appunti", "error")
    }

    document.body.removeChild(textArea)
  }
}

// Funzione per creare coriandoli
function createConfetti() {
  if (!confettiContainer) return

  confettiContainer.innerHTML = ""

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div")
    confetti.className = "confetti"

    // Proprietà casuali
    const size = Math.random() * 10 + 5
    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)]
    const left = Math.random() * 100
    const duration = Math.random() * 3 + 2
    const delay = Math.random() * 2

    // Imposta stile
    confetti.style.width = `${size}px`
    confetti.style.height = `${size}px`
    confetti.style.backgroundColor = color
    confetti.style.left = `${left}%`
    confetti.style.top = `-${size}px`
    confetti.style.animationDuration = `${duration}s`
    confetti.style.animationDelay = `${delay}s`

    // Forma casuale
    const shapes = ["circle", "square", "triangle"]
    const shape = shapes[Math.floor(Math.random() * shapes.length)]

    if (shape === "circle") {
      confetti.style.borderRadius = "50%"
    } else if (shape === "triangle") {
      confetti.style.width = "0"
      confetti.style.height = "0"
      confetti.style.backgroundColor = "transparent"
      confetti.style.borderLeft = `${size / 2}px solid transparent`
      confetti.style.borderRight = `${size / 2}px solid transparent`
      confetti.style.borderBottom = `${size}px solid ${color}`
    }

    confettiContainer.appendChild(confetti)
  }
}

// Funzione per annunciare per screen reader
function announceForScreenReader(message) {
  const announcer = document.createElement("div")
  announcer.setAttribute("aria-live", "assertive")
  announcer.classList.add("sr-only")
  announcer.textContent = message
  document.body.appendChild(announcer)

  setTimeout(() => {
    document.body.removeChild(announcer)
  }, 1000)
}

// Funzione per mostrare toast di notifica
function showToast(message, type = "info") {
  if (!toastElement) return

  toastElement.textContent = message
  toastElement.className = "toast " + type
  toastElement.classList.add("show")

  // Accessibilità: annuncia il messaggio
  toastElement.setAttribute("aria-hidden", "false")

  setTimeout(() => {
    toastElement.classList.remove("show")

    // Dopo la transizione, nascondi per screen reader
    setTimeout(() => {
      toastElement.setAttribute("aria-hidden", "true")
    }, 300)
  }, 3000)
}

// Funzioni per la gestione dei partecipanti
// Update the aggiungiPartecipante function to assign a unique ID
function aggiungiPartecipante() {
  if (!participantNameInput) return

  const nome = participantNameInput.value.trim()

  if (nome === "") {
    showToast("Inserisci un nome valido", "error")
    participantNameInput.focus()
    return
  }

  // Generate a unique ID for the new participant
  const id = nextParticipantId++

  // Add the participant with the unique ID
  partecipanti.push({ id, nome, punti: 0 })
  aggiornaListaPartecipanti()
  aggiornaSelezionePartecipante()
  salvaDati()

  // Pulisci e focus sull'input
  participantNameInput.value = ""
  participantNameInput.focus()

  showToast(`${nome} (ID: ${id}) aggiunto con successo`, "success")
}

// Update the eliminaPartecipante function to use the ID and reorganize IDs
function eliminaPartecipante(index) {
  const partecipante = partecipanti[index]
  partecipanti.splice(index, 1)

  // Riorganizza gli ID per mantenere la sequenza 1, 2, 3, ...
  riorganizzaIds()

  aggiornaListaPartecipanti()
  aggiornaSelezionePartecipante()
  salvaDati()

  showToast(`${partecipante.nome} rimosso`, "info")
}

// Add a new function to reorganize IDs
function riorganizzaIds() {
  // Se non ci sono partecipanti, resetta nextParticipantId a 1
  if (partecipanti.length === 0) {
    nextParticipantId = 1
    return
  }

  // Riorganizza gli ID in sequenza 1, 2, 3, ...
  partecipanti.forEach((partecipante, index) => {
    partecipante.id = index + 1
  })

  // Imposta nextParticipantId al prossimo ID disponibile
  nextParticipantId = partecipanti.length + 1
}

// Update the aggiornaListaPartecipanti function to display the ID and add edit button
function aggiornaListaPartecipanti() {
  if (!participantList) return

  participantList.innerHTML = ""

  // Ordina i partecipanti in base alla modalità vittoria
  const partecipantiOrdinati = [...partecipanti].sort((a, b) =>
    modalitàVittoria === "max" ? b.punti - a.punti : a.punti - b.punti,
  )

  if (partecipantiOrdinati.length === 0) {
    const emptyMessage = document.createElement("li")
    emptyMessage.textContent = "Nessun partecipante. Aggiungine uno!"
    emptyMessage.className = "empty-message"
    participantList.appendChild(emptyMessage)
    return
  }

  partecipantiOrdinati.forEach((partecipante, index) => {
    const listItem = document.createElement("li")

    // Contenitore per le informazioni del partecipante
    const infoContainer = document.createElement("div")
    infoContainer.className = "participant-info"

    // Aggiungi medaglia per i primi 3
    if (index < 3) {
      const medalSpan = document.createElement("span")
      medalSpan.className = `medal medal-${["gold", "silver", "bronze"][index]}`
      medalSpan.textContent = index + 1
      infoContainer.appendChild(medalSpan)
    }

    // Nome del partecipante con ID
    const nameSpan = document.createElement("span")
    nameSpan.className = "participant-name"
    nameSpan.textContent = `${partecipante.nome} `

    // Add ID badge
    const idBadge = document.createElement("span")
    idBadge.className = "participant-id"
    idBadge.textContent = `#${partecipante.id}`
    nameSpan.appendChild(idBadge)

    // Punti del partecipante
    const pointsSpan = document.createElement("span")
    pointsSpan.className = "participant-points"
    pointsSpan.textContent = partecipante.punti

    infoContainer.appendChild(nameSpan)
    infoContainer.appendChild(document.createTextNode(": "))
    infoContainer.appendChild(pointsSpan)

    // Contenitore per i pulsanti
    const buttonsContainer = document.createElement("div")
    buttonsContainer.className = "participant-buttons"

    // Bottone modifica
    const editButton = document.createElement("button")
    editButton.className = "edit-btn"
    editButton.setAttribute("aria-label", `Modifica ${partecipante.nome} (ID: ${partecipante.id})`)

    const editIcon = document.createElement("span")
    editIcon.className = "material-icons"
    editIcon.textContent = "edit"

    editButton.appendChild(editIcon)
    editButton.addEventListener("click", () => {
      // Trova l'indice del partecipante nell'array originale
      const originalIndex = partecipanti.findIndex((p) => p.id === partecipante.id)
      if (originalIndex !== -1) {
        mostraEditNameModal(originalIndex)
      }
    })

    // Bottone elimina con conferma
    const deleteButton = document.createElement("button")
    deleteButton.className = "delete-btn"
    deleteButton.setAttribute("aria-label", `Elimina ${partecipante.nome} (ID: ${partecipante.id})`)

    const deleteIcon = document.createElement("span")
    deleteIcon.className = "material-icons"
    deleteIcon.textContent = "delete"

    deleteButton.appendChild(deleteIcon)
    deleteButton.addEventListener("click", () => {
      // Trova l'indice del partecipante nell'array originale
      const originalIndex = partecipanti.findIndex((p) => p.id === partecipante.id)
      if (originalIndex !== -1) {
        // Mostra il modal di conferma invece di eliminare direttamente
        mostraDeleteParticipantModal(originalIndex)
      }
    })

    buttonsContainer.appendChild(editButton)
    buttonsContainer.appendChild(deleteButton)

    listItem.appendChild(infoContainer)
    listItem.appendChild(buttonsContainer)
    participantList.appendChild(listItem)
  })
}

// Sostituisco il riferimento al select con la nuova lista di checkbox e input ricerca
const participantsCheckboxList = document.getElementById("participants-checkbox-list");
const participantSearchInput = document.getElementById("participant-search");

// Aggiorno la funzione aggiornaSelezionePartecipante per la nuova UI
function aggiornaSelezionePartecipante() {
  if (!participantsCheckboxList) return;
  const searchTerm = participantSearchInput ? participantSearchInput.value.trim().toLowerCase() : "";
  participantsCheckboxList.innerHTML = "";
  // Opzione "Tutti"
  const allDiv = document.createElement("div");
  const allCheckbox = document.createElement("input");
  allCheckbox.type = "checkbox";
  allCheckbox.id = "participant-all";
  allCheckbox.value = "all";
  allCheckbox.className = "all-checkbox";
  const allLabel = document.createElement("label");
  allLabel.htmlFor = "participant-all";
  allLabel.textContent = "Tutti";
  allDiv.appendChild(allCheckbox);
  allDiv.appendChild(allLabel);
  participantsCheckboxList.appendChild(allDiv);
  // Lista partecipanti ORDINATA ALFABETICAMENTE
  const partecipantiOrdinati = [...partecipanti].sort((a, b) => a.nome.localeCompare(b.nome, 'it', {sensitivity: 'base'}));
  const participantDivs = [];
  partecipantiOrdinati.forEach((partecipante) => {
    if (searchTerm && !partecipante.nome.toLowerCase().includes(searchTerm)) return;
    const index = partecipanti.indexOf(partecipante);
    const div = document.createElement("div");
    div.className = "participant-checkbox-item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = index;
    checkbox.id = `participant-checkbox-${index}`;
    checkbox.setAttribute("data-participant-index", index);
    const label = document.createElement("label");
    label.htmlFor = `participant-checkbox-${index}`;
    label.textContent = `${partecipante.nome} #${partecipante.id}`;
    div.appendChild(checkbox);
    div.appendChild(label);
    participantsCheckboxList.appendChild(div);
    participantDivs.push({div, checkbox});
  });
  // Gestione evidenziazione e sincronizzazione
  function updateHighlightAndAllCheckbox() {
    let allChecked = true;
    participantDivs.forEach(({div, checkbox}) => {
      if (checkbox.checked) {
        div.classList.add("highlighted");
      } else {
        div.classList.remove("highlighted");
        allChecked = false;
      }
    });
    allCheckbox.checked = allChecked && participantDivs.length > 0;
    if (allCheckbox.checked) {
      allDiv.classList.add("highlighted");
    } else {
      allDiv.classList.remove("highlighted");
    }
  }
  participantDivs.forEach(({div, checkbox}) => {
    checkbox.addEventListener("change", updateHighlightAndAllCheckbox);
  });
  allCheckbox.addEventListener("change", function () {
    participantDivs.forEach(({checkbox, div}) => {
      checkbox.checked = allCheckbox.checked;
    });
    updateHighlightAndAllCheckbox();
  });
  updateHighlightAndAllCheckbox();
}

// Aggiorno la ricerca dinamica
if (participantSearchInput) {
  participantSearchInput.addEventListener("input", aggiornaSelezionePartecipante);
}

// Modifico aggiungiPunti e togliPunti per agire su tutti i selezionati
function getSelectedParticipantIndexes() {
  if (!participantsCheckboxList) return [];
  const checkboxes = participantsCheckboxList.querySelectorAll('input[type="checkbox"][data-participant-index]:checked');
  return Array.from(checkboxes).map(cb => Number(cb.value));
}

function aggiungiPunti() {
  if (!pointsInput || !participantsCheckboxList) return;
  const punti = Number.parseFloat(pointsInput.value);
  if (isNaN(punti) || punti < 0) {
    showToast("Inserisci un valore valido", "error");
    pointsInput.focus();
    return;
  }
  const selectedIndexes = getSelectedParticipantIndexes();
  if (selectedIndexes.length === 0) {
    showToast("Seleziona almeno un partecipante", "warning");
    return;
  }
  selectedIndexes.forEach(index => {
    partecipanti[index].punti += punti;
  });
  showToast(`${punti} punti aggiunti a ${selectedIndexes.length} partecipante/i`, "success");
  aggiornaListaPartecipanti();
  pointsInput.value = "0";
  pointsInput.focus();
  salvaDati();
}

function togliPunti() {
  if (!pointsInput || !participantsCheckboxList) return;
  const punti = Number.parseFloat(pointsInput.value);
  if (isNaN(punti) || punti < 0) {
    showToast("Inserisci un valore valido", "error");
    pointsInput.focus();
    return;
  }
  const selectedIndexes = getSelectedParticipantIndexes();
  if (selectedIndexes.length === 0) {
    showToast("Seleziona almeno un partecipante", "warning");
    return;
  }
  selectedIndexes.forEach(index => {
    partecipanti[index].punti -= punti;
  });
  showToast(`${punti} punti tolti a ${selectedIndexes.length} partecipante/i`, "success");
  aggiornaListaPartecipanti();
  pointsInput.value = "0";
  pointsInput.focus();
  salvaDati();
}

function impostaModalitàVittoria(modalità) {
  modalitàVittoria = modalità
  aggiornaListaPartecipanti()
  salvaDati()

  showToast(`Modalità vittoria: ${modalità === "max" ? "Più punti" : "Meno punti"}`, "info")
}

// Update the trovaVincitore function to handle IDs
function trovaVincitore() {
  if (partecipanti.length === 0) {
    showToast("Nessun partecipante disponibile", "error")
    return
  }

  let vincitore = null
  let punteggioVincente = modalitàVittoria === "max" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
  let vincitori = []

  // Trova il punteggio vincente
  for (const partecipante of partecipanti) {
    if (
      (modalitàVittoria === "max" && partecipante.punti > punteggioVincente) ||
      (modalitàVittoria === "min" && partecipante.punti < punteggioVincente)
    ) {
      vincitore = partecipante
      punteggioVincente = partecipante.punti
      vincitori = [partecipante]
    } else if (partecipante.punti === punteggioVincente) {
      vincitori.push(partecipante)
    }
  }

  if (vincitori.length > 1) {
    // Pareggio
    showTieModal(vincitori, punteggioVincente)
  } else if (vincitore) {
    // Vittoria
    showVictoryModal(vincitore.nome, vincitore.punti, vincitore.id)
  } else {
    showToast("Nessun vincitore", "error")
  }
}

// Variables for reset functionality
let resetType = null

// Reset modal functions
function mostraResetModal(type) {
  if (!resetModal || !resetPointsOption || !resetAllOption) return

  resetType = type

  // Reset the UI
  resetPointsOption.classList.remove("selected")
  resetAllOption.classList.remove("selected")

  // Select the appropriate option
  if (type === "points") {
    resetPointsOption.classList.add("selected")
  } else if (type === "all") {
    resetAllOption.classList.add("selected")
  }

  // Reset progress bar
  if (resetProgressContainer) {
    resetProgressContainer.style.display = "none"
  }

  if (resetProgressBar) {
    resetProgressBar.style.width = "0%"
  }

  // Reset button text
  if (resetBtnText) {
    resetBtnText.textContent = "Conferma Reset"
  }

  if (confirmResetBtn) {
    confirmResetBtn.disabled = false
  }

  // Show the modal
  resetModal.style.display = "flex"
  resetModal.setAttribute("aria-hidden", "false")
}

function hideResetModal() {
  if (resetModal) {
    resetModal.style.display = "none"
    resetModal.setAttribute("aria-hidden", "true")
  }
}

function selectResetOption(type) {
  if (!resetPointsOption || !resetAllOption) return

  resetType = type

  // Update UI
  resetPointsOption.classList.remove("selected")
  resetAllOption.classList.remove("selected")

  if (type === "points") {
    resetPointsOption.classList.add("selected")
  } else if (type === "all") {
    resetAllOption.classList.add("selected")
  }
}

function eseguiReset() {
  if (!resetType || !resetProgressContainer || !resetProgressBar || !resetBtnText) return

  if (partecipanti.length === 0) {
    showToast("Nessun partecipante disponibile", "warning")
    hideResetModal()
    return
  }

  // Disable the button and show progress
  if (confirmResetBtn) {
    confirmResetBtn.disabled = true
  }

  resetBtnText.innerHTML = '<span class="loading-spinner"></span> Resettando...'
  resetProgressContainer.style.display = "block"

  // Simulate progress (for UX purposes)
  let progress = 0
  const progressInterval = setInterval(() => {
    progress += 10
    resetProgressBar.style.width = `${progress}%`

    if (progress >= 100) {
      clearInterval(progressInterval)

      // Execute the actual reset
      if (resetType === "points") {
        // Reset points
        partecipanti.forEach((partecipante) => (partecipante.punti = 0))
        aggiornaListaPartecipanti()
        salvaDati()
        showToast("Punteggi azzerati con successo", "success")
      } else if (resetType === "all") {
        // Reset everything
        partecipanti.length = 0
        // Reset nextParticipantId to 1
        nextParticipantId = 1
        aggiornaListaPartecipanti()
        aggiornaSelezionePartecipante()
        salvaDati()
        showToast("Tutti i partecipanti sono stati eliminati", "success")
      }

      // Close the modal after a short delay
      setTimeout(() => {
        hideResetModal()
      }, 500)
    }
  }, 100)
}

// File feedback modal functions
function showFileFeedbackModal(results, onConfirm, onCancel) {
  if (
    !fileFeedbackModal ||
    !fileFeedbackIcon ||
    !fileFeedbackStatus ||
    !fileFeedbackCount ||
    !fileFeedbackList ||
    !fileFeedbackSummary
  )
    return

  // Set the status icon and text based on results
  if (results.errors.length > 0) {
    fileFeedbackIcon.textContent = "error"
    fileFeedbackStatus.textContent = "Caricamento completato con errori"
    fileFeedbackIcon.style.color = "var(--color-danger)"
  } else if (results.warnings.length > 0) {
    fileFeedbackIcon.textContent = "warning"
    fileFeedbackStatus.textContent = "Caricamento completato con avvisi"
    fileFeedbackIcon.style.color = "var(--color-warning)"
  } else {
    fileFeedbackIcon.textContent = "check_circle"
    fileFeedbackStatus.textContent = "Caricamento completato con successo"
    fileFeedbackIcon.style.color = "var(--color-success)"
  }

  // Set the count
  fileFeedbackCount.textContent = `${results.success.length} di ${results.total} partecipanti caricati`

  // Clear previous list
  fileFeedbackList.innerHTML = ""

  // Add success items
  results.success.forEach((item) => {
    const listItem = document.createElement("div")
    listItem.className = "file-feedback-item success"
    listItem.innerHTML = `
    <span class="material-icons file-feedback-item-icon">check_circle</span>
    <span>${item.nome} #${item.id}: ${item.punti} punti</span>
  `
    fileFeedbackList.appendChild(listItem)
  })

  // Add warning items (duplicates)
  results.warnings.forEach((item) => {
    const listItem = document.createElement("div")
    listItem.className = "file-feedback-item warning"
    listItem.innerHTML = `
    <span class="material-icons file-feedback-item-icon">warning</span>
    <span>${item.nome} #${item.id}: Partecipante già esistente, dati aggiornati</span>
  `
    fileFeedbackList.appendChild(listItem)
  })

  // Add error items
  results.errors.forEach((item) => {
    const listItem = document.createElement("div")
    listItem.className = "file-feedback-item error"
    listItem.innerHTML = `
    <span class="material-icons file-feedback-item-icon">error</span>
    <span>${item.message}</span>
  `
    fileFeedbackList.appendChild(listItem)
  })

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
`

  // Show the modal
  fileFeedbackModal.style.display = "flex"
  fileFeedbackModal.setAttribute("aria-hidden", "false")

  // Gestione pulsanti
  if (fileFeedbackOkBtn) {
    fileFeedbackOkBtn.onclick = function() {
      hideFileFeedbackModal();
      if (typeof onConfirm === 'function') onConfirm();
    };
  }
  const fileFeedbackCancelBtn = document.getElementById("file-feedback-cancel-btn");
  if (fileFeedbackCancelBtn) {
    fileFeedbackCancelBtn.onclick = function() {
      hideFileFeedbackModal();
      if (typeof onCancel === 'function') onCancel();
    };
  }
  // Focus on the OK button
  setTimeout(() => {
    if (fileFeedbackOkBtn) {
      fileFeedbackOkBtn.focus()
    }
  }, 100)
}

function hideFileFeedbackModal() {
  if (fileFeedbackModal) {
    fileFeedbackModal.style.display = "none"
    fileFeedbackModal.setAttribute("aria-hidden", "true")
  }
}

// Replace the existing caricaDaFile function with this enhanced version
function caricaDaFile() {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = ".txt,.json"
  input.addEventListener("change", (event) => {
    const file = event.target.files[0]
    if (!file) {
      showToast("Nessun file selezionato", "warning")
      return
    }
    showToast("Caricamento file in corso...", "info")
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const fileContent = e.target.result
        const fileExtension = file.name.split(".").pop().toLowerCase()
        // Results tracking
        const results = { total: 0, success: [], warnings: [], errors: [] };
        let importData = { partecipanti: [], modalitaVittoria: null };
        if (fileExtension === "json") {
          const jsonData = JSON.parse(fileContent)
          if (typeof jsonData !== "object" || jsonData === null) {
            throw new Error("Il file JSON non contiene un oggetto valido.")
          }
          importData.partecipanti = [];
          importData.modalitaVittoria = typeof jsonData.modalitaVittoria === "string" ? jsonData.modalitaVittoria : null;
          results.total = Array.isArray(jsonData.partecipanti) ? jsonData.partecipanti.length : 0;
          if (Array.isArray(jsonData.partecipanti)) {
            jsonData.partecipanti.forEach((item) => {
              try {
                if (!item.nome || item.punti === undefined) {
                  results.errors.push({ message: `Dati incompleti: ${JSON.stringify(item)}` });
                  return;
                }
                const nome = item.nome.trim();
                const punti = Number.parseFloat(item.punti);
                importData.partecipanti.push({ nome, punti: isNaN(punti) ? 0 : punti });
                results.success.push({ nome, id: item.id || null, punti: isNaN(punti) ? 0 : punti });
              } catch (itemError) {
                results.errors.push({ message: `Errore nell'elaborazione: ${itemError.message}` });
              }
            });
          }
        } else {
          // Parsing TXT compatibile con l'export
          const righe = fileContent.split("\n");
          let startIndex = 0;
          if (righe.length > 0 && righe[0].startsWith("#MODALITA_VITTORIA:")) {
            const modeLine = righe[0];
            const modeMatch = modeLine.match(/#MODALITA_VITTORIA:(max|min)/);
            if (modeMatch && modeMatch[1]) {
              importData.modalitaVittoria = modeMatch[1];
            } else {
              results.warnings.push({ message: `Formato modalità vittoria non valido nella prima riga: ${modeLine}` });
            }
            startIndex = 1;
          }
          importData.partecipanti = [];
          results.total = righe.length - startIndex;
          for (let i = startIndex; i < righe.length; i++) {
            const riga = righe[i].trim();
            if (!riga) continue; // Salta righe vuote
            if (!riga.includes(":")) {
              results.errors.push({ message: `Riga non valida (manca ':'): ${riga}` });
              continue;
            }
            const parti = riga.split(":");
            const nome = parti[0].trim();
            const punti = Number.parseFloat(parti[1]);
            if (!nome) {
              results.errors.push({ message: `Nome mancante: ${riga}` });
              continue;
            }
            importData.partecipanti.push({ nome, punti: isNaN(punti) ? 0 : punti });
            results.success.push({ nome, id: null, punti: isNaN(punti) ? 0 : punti });
          }
        }
        // Salva i dati temporanei
        pendingImport = importData;
        // Mostra il modal con conferma/annulla
        showFileFeedbackModal(results, function() {
          // Conferma: applica i dati
          if (!pendingImport) return;
          // Svuota e riempi partecipanti
          partecipanti.length = 0;
          let idCounter = 1;
          pendingImport.partecipanti.forEach((item) => {
            partecipanti.push({ id: idCounter++, nome: item.nome.trim(), punti: Number.parseFloat(item.punti) || 0 });
          });
          nextParticipantId = idCounter;
          if (pendingImport.modalitaVittoria && (pendingImport.modalitaVittoria === "max" || pendingImport.modalitaVittoria === "min")) {
            impostaModalitàVittoria(pendingImport.modalitaVittoria);
            const radioButtons = document.querySelectorAll('input[name="winning-mode"]');
            radioButtons.forEach((radio) => {
              if (radio.value === pendingImport.modalitaVittoria) {
                radio.checked = true;
              }
            });
          }
          aggiornaListaPartecipanti();
          aggiornaSelezionePartecipante();
          salvaDati();
          pendingImport = null;
        }, function() {
          // Annulla: non applica nulla
          showToast("Caricamento annullato, nessun dato importato", "warning");
          pendingImport = null;
        });
      } catch (error) {
        console.error("Errore durante il caricamento del file:", error)
        showToast(`Errore durante il caricamento del file: ${error.message}`, "error")
      }
    }
    reader.onerror = () => {
      showToast("Errore nella lettura del file", "error")
    }
    reader.readAsText(file)
  })
  input.click()
}

// Update the salvaSuFile function to support JSON export
function salvaSuFile() {
  if (partecipanti.length === 0) {
    showToast("Nessun partecipante da salvare", "error")
    return
  }

  // Create a custom dialog
  const dialog = document.createElement("div")
  dialog.className = "custom-dialog"
  dialog.innerHTML = `
  <div class="dialog-content">
    <h3>Seleziona formato file</h3>
    <div class="dialog-body">
      <div class="format-options">
        <div class="format-option">
          <input type="radio" id="format-txt" name="format" value="txt" checked>
          <label for="format-txt">File di testo (.txt)</label>
        </div>
        <div class="format-option">
          <input type="radio" id="format-json" name="format" value="json">
          <label for="format-json">File JSON (.json)</label>
        </div>
      </div>
    </div>
    <div class="dialog-actions">
      <button class="btn btn-secondary" id="cancel-format">Annulla</button>
      <button class="btn btn-primary" id="confirm-format">Salva</button>
    </div>
  </div>
`

  document.body.appendChild(dialog)

  // Add event listeners
  const cancelBtn = dialog.querySelector("#cancel-format")
  const confirmBtn = dialog.querySelector("#confirm-format")

  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(dialog)
  })

  confirmBtn.addEventListener("click", () => {
    const format = dialog.querySelector('input[name="format"]:checked').value
    document.body.removeChild(dialog)

    // Save file in selected format
    if (format === "json") {
      saveAsJson()
    } else {
      saveAsTxt()
    }
  })

  // Show dialog
  dialog.style.display = "flex"

  // Functions to save in different formats
  function saveAsTxt() {
    // Crea il contenuto in formato leggibile
    const modeLine = `#MODALITA_VITTORIA:${modalitàVittoria}\n`
    const participantsContent = partecipanti
      .map((partecipante) => `${partecipante.nome}:${partecipante.punti}`)
      .join("\n")
    const contenuto = modeLine + participantsContent

    // Crea un blob per il download
    const blob = new Blob([contenuto], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    // Crea un link temporaneo per il download
    const a = document.createElement("a")
    a.href = url
    a.download = "partecipanti.txt"
    a.click()

    // Revoca l'URL per liberare memoria
    URL.revokeObjectURL(url)

    showToast("File salvato con successo", "success")
  }

  function saveAsJson() {
    // Create JSON content including winning mode
    const dataToSave = {
      modalitaVittoria: modalitàVittoria,
      partecipanti: partecipanti.map((p) => ({ id: p.id, nome: p.nome, punti: p.punti })),
    }
    const jsonContent = JSON.stringify(dataToSave, null, 2)

    // Create blob for download
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    // Create temporary link for download
    const a = document.createElement("a")
    a.href = url
    a.download = "partecipanti.json"
    a.click()

    // Revoca URL to free memory
    URL.revokeObjectURL(url)

    showToast("File JSON salvato con successo", "success")
  }
}

// Remove the old reset functions and replace with these stubs that call the new modal
function resettaPunti() {
  mostraResetModal("points")
}

function resettaTotale() {
  mostraResetModal("all")
}

// Funzioni per la gestione del localStorage
function salvaDati() {
  try {
    // Salva i partecipanti
    localStorage.setItem("partecipanti", JSON.stringify(partecipanti))

    // Salva la modalità vittoria
    localStorage.setItem("modalitaVittoria", modalitàVittoria)

    // Salva il nextParticipantId
    localStorage.setItem("nextParticipantId", nextParticipantId)
  } catch (error) {
    console.error("Errore durante il salvataggio dei dati:", error)
    showToast("Errore durante il salvataggio dei dati", "error")
  }
}

function caricaDatiSalvati() {
  try {
    // Carica i partecipanti
    const partecipantiSalvati = localStorage.getItem("partecipanti")
    if (partecipantiSalvati) {
      const parsed = JSON.parse(partecipantiSalvati)
      partecipanti.length = 0 // Svuota l'array
      parsed.forEach((p) => partecipanti.push(p)) // Aggiungi i partecipanti salvati
    }

    // Carica la modalità vittoria
    const modalitaSalvata = localStorage.getItem("modalitaVittoria")
    if (modalitaSalvata) {
      modalitàVittoria = modalitaSalvata

      // Aggiorna il radio button corrispondente
      const radioButtons = document.querySelectorAll('input[name="winning-mode"]')
      radioButtons.forEach((radio) => {
        if (radio.value === modalitàVittoria) {
          radio.checked = true
        }
      })
    }

    // Carica il nextParticipantId
    const nextIdSalvato = localStorage.getItem("nextParticipantId")
    if (nextIdSalvato) {
      nextParticipantId = Number.parseInt(nextIdSalvato)
    }

    showToast("Dati caricati con successo", "success")
  } catch (error) {
    console.error("Errore durante il caricamento dei dati:", error)
    showToast("Errore durante il caricamento dei dati", "error")
  }
}

// Variabili per la modifica del nome
let editingParticipantIndex = -1
const editNameModal = document.createElement("div")
editNameModal.className = "modal"
editNameModal.id = "edit-name-modal"
editNameModal.setAttribute("aria-hidden", "true")
editNameModal.innerHTML = `
<div class="modal-content" role="dialog" aria-labelledby="edit-name-title">
  <div class="modal-header">
    <h2 id="edit-name-title">Modifica Nome</h2>
    <button class="close-btn" id="close-edit-name-modal" aria-label="Chiudi">
      <span class="material-icons">close</span>
    </button>
  </div>
  <div class="modal-body">
    <div class="form-group">
      <label for="edit-name-input">Nuovo nome</label>
      <input type="text" id="edit-name-input" class="form-control" placeholder="Inserisci nuovo nome">
    </div>
    <div class="edit-name-actions">
      <button class="btn btn-secondary" id="cancel-edit-name-btn">Annulla</button>
      <button class="btn btn-primary" id="confirm-edit-name-btn">Salva</button>
    </div>
  </div>
</div>
`
document.body.appendChild(editNameModal)

function mostraEditNameModal(index) {
  if (!editNameModal) return

  editingParticipantIndex = index
  const partecipante = partecipanti[index]

  // Imposta il valore corrente nel campo di input
  const editNameInput = document.getElementById("edit-name-input")
  if (editNameInput) {
    editNameInput.value = partecipante.nome
  }

  // Mostra la modale
  editNameModal.style.display = "flex"
  editNameModal.setAttribute("aria-hidden", "false")

  // Focus sul campo di input
  setTimeout(() => {
    if (editNameInput) {
      editNameInput.focus()
      editNameInput.select()
    }
  }, 100)
}

function hideEditNameModal() {
  if (editNameModal) {
    editNameModal.style.display = "none"
    editNameModal.setAttribute("aria-hidden", "true")
    editingParticipantIndex = -1
  }
}

function salvaModificaNome() {
  if (editingParticipantIndex < 0 || editingParticipantIndex >= partecipanti.length) {
    hideEditNameModal()
    return
  }

  const editNameInput = document.getElementById("edit-name-input")
  if (!editNameInput) {
    hideEditNameModal()
    return
  }

  const nuovoNome = editNameInput.value.trim()

  if (nuovoNome === "") {
    showToast("Il nome non può essere vuoto", "error")
    return
  }

  // Aggiorna il nome del partecipante
  const vecchioNome = partecipanti[editingParticipantIndex].nome
  partecipanti[editingParticipantIndex].nome = nuovoNome

  // Aggiorna l'interfaccia
  aggiornaListaPartecipanti()
  aggiornaSelezionePartecipante()
  salvaDati()

  // Chiudi la modale
  hideEditNameModal()

  showToast(`Nome modificato da "${vecchioNome}" a "${nuovoNome}"`, "success")
}
