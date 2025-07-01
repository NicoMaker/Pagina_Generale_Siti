// Elementi DOM
const noteModal = document.getElementById("note-modal")
const confirmModal = document.getElementById("confirm-modal")
const modalOverlay = document.getElementById("modal-overlay")
const addNoteBtn = document.getElementById("add-note-btn")
const closeModalBtn = document.getElementById("close-modal")
const closeConfirmModalBtn = document.getElementById("close-confirm-modal")
const saveNoteBtn = document.getElementById("save-note")
const deleteNoteBtn = document.getElementById("delete-note")
const confirmDeleteBtn = document.getElementById("confirm-delete")
const cancelDeleteBtn = document.getElementById("cancel-delete")
const modalTitle = document.getElementById("modal-title")
const noteTitleInput = document.getElementById("note-title")
const noteContentInput = document.getElementById("note-content")
const noteTagsInput = document.getElementById("note-tags")
const isTaskCheckbox = document.getElementById("is-task")
const isCompletedCheckbox = document.getElementById("is-completed")
const taskCompletedContainer = document.getElementById("task-completed-container")
const notesGrid = document.getElementById("notes-grid")
const tagList = document.getElementById("tag-list")
const searchInput = document.getElementById("search-input")
const activeFilters = document.getElementById("active-filters")
const clearFiltersBtn = document.getElementById("clear-filters")
const themeToggleBtn = document.getElementById("theme-toggle")
const completedCountEl = document.getElementById("completed-count")
const totalCountEl = document.getElementById("total-count")
const progressFill = document.getElementById("progress-fill")
const completionEmoji = document.getElementById("completion-emoji")
const toast = document.getElementById("toast")
const toastMessage = document.getElementById("toast-message")
const toastIcon = document.getElementById("toast-icon")

// Stato dell'applicazione
let notes = []
let currentNoteId = null
let activeTagFilters = []
let searchQuery = ""

// Inizializzazione
document.addEventListener("DOMContentLoaded", () => {
    loadNotes()
    renderNotes()
    renderTags()
    updateTaskProgress()
    initTheme()
    document.getElementById("delete-all-btn").addEventListener("click", () => openDeleteConfirmation(null))
    document.getElementById("confirm-delete").addEventListener("click", handleDeleteConfirmation)
    document.getElementById("cancel-delete").addEventListener("click", closeConfirmModal)
    document.getElementById("close-confirm-modal").addEventListener("click", closeConfirmModal)

    // Event listeners
    addNoteBtn.addEventListener("click", openAddNoteModal)
    closeModalBtn.addEventListener("click", closeModal)
    closeConfirmModalBtn.addEventListener("click", closeConfirmModal)
    saveNoteBtn.addEventListener("click", saveNote)
    deleteNoteBtn.addEventListener("click", openDeleteConfirmation)
    confirmDeleteBtn.addEventListener("click", deleteCurrentNote)
    cancelDeleteBtn.addEventListener("click", closeConfirmModal)
    searchInput.addEventListener("input", handleSearch)
    clearFiltersBtn.addEventListener("click", clearFilters)
    themeToggleBtn.addEventListener("click", toggleTheme)
    isTaskCheckbox.addEventListener("change", toggleTaskCompletedOption)

    // Chiudi i modal se si clicca fuori
    modalOverlay.addEventListener("click", (e) => {
        if (noteModal.classList.contains("show")) {
            closeModal()
        } else if (confirmModal.classList.contains("show")) {
            closeConfirmModal()
        }
    })
})

// Gestione del tema
function initTheme() {
    const isDarkMode = localStorage.getItem("darkMode") === "true"
    if (isDarkMode) {
        document.body.classList.add("dark-theme")
        themeToggleBtn.innerHTML = '<i class="icon">light_mode</i>'
    } else {
        themeToggleBtn.innerHTML = '<i class="icon">dark_mode</i>'
    }
}

function toggleTheme() {
    const isDarkMode = document.body.classList.toggle("dark-theme")
    localStorage.setItem("darkMode", isDarkMode)

    if (isDarkMode) {
        themeToggleBtn.innerHTML = '<i class="icon">light_mode</i>'
    } else {
        themeToggleBtn.innerHTML = '<i class="icon">dark_mode</i>'
    }
}

// Gestione del localStorage
function loadNotes() {
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
        notes = JSON.parse(savedNotes)
    }
}

function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes))
}

// Gestione delle note
function saveNote() {
    const title = noteTitleInput.value.trim()
    const content = noteContentInput.value.trim()
    const tagsString = noteTagsInput.value.trim()
    const isTask = isTaskCheckbox.checked
    const isCompleted = isCompletedCheckbox.checked

    if (!title) {
        showToast("Inserisci un titolo per la nota", "error")
        return
    }

    const tags = tagsString
        ? tagsString
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : []

    if (currentNoteId) {
        // Aggiorna nota esistente
        updateNote(currentNoteId, { title, content, tags, isTask, completed: isTask ? isCompleted : false })
        showToast("Nota aggiornata con successo", "success")
    } else {
        // Aggiungi nuova nota
        addNote({ title, content, tags, isTask, completed: isTask ? isCompleted : false })
        showToast("Nota aggiunta con successo", "success")
    }

    closeModal()
}

function addNote(note) {
    const now = new Date()
    const newNote = {
        id: Date.now().toString(),
        title: note.title,
        content: note.content,
        tags: note.tags,
        isTask: note.isTask,
        completed: note.completed || false,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
    }

    notes.unshift(newNote)
    saveNotes()
    renderNotes()
    renderTags()
    updateTaskProgress()
}

function updateNote(id, updatedNote) {
    const index = notes.findIndex((note) => note.id === id)
    if (index !== -1) {
        notes[index] = {
            ...notes[index],
            ...updatedNote,
            updatedAt: new Date().toISOString(),
        }
        saveNotes()
        renderNotes()
        renderTags()
        updateTaskProgress()
    }
}

function deleteNote(id) {
    notes = notes.filter((note) => note.id !== id)
    saveNotes()
    renderNotes()
    renderTags()
    updateTaskProgress()
    showToast("Nota eliminata con successo", "success")
}

function deleteCurrentNote() {
    if (currentNoteId) {
        deleteNote(currentNoteId)
        closeConfirmModal()
        closeModal()
    }
}

function toggleTaskCompletion(id) {
    const index = notes.findIndex((note) => note.id === id)
    if (index !== -1 && notes[index].isTask) {
        notes[index].completed = !notes[index].completed
        saveNotes()
        renderNotes()
        updateTaskProgress()

        const status = notes[index].completed ? "completato" : "da completare"
        showToast(`Impegno segnato come ${status}`, "success")
    }
}

// Ricerca e filtri
function handleSearch() {
    searchQuery = searchInput.value.toLowerCase()
    renderNotes()
}

function clearFilters() {
    activeTagFilters = []
    searchInput.value = ""
    searchQuery = ""
    renderTags()
    renderActiveFilters()
    renderNotes()
}

function toggleTagFilter(tag) {
    const index = activeTagFilters.indexOf(tag)
    if (index === -1) {
        activeTagFilters.push(tag)
    } else {
        activeTagFilters.splice(index, 1)
    }

    renderTags()
    renderActiveFilters()
    renderNotes()
}

// Rendering delle note
function renderNotes() {
    notesGrid.innerHTML = ""

    const filteredNotes = filterNotes()

    if (filteredNotes.length === 0) {
        notesGrid.innerHTML = `
      <div class="empty-state">
        <i class="icon">note</i>
        <p>Nessuna nota trovata</p>
      </div>
    `
        return
    }

    filteredNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

    filteredNotes.forEach((note) => {
        const noteCard = document.createElement("div")
        noteCard.className = `note-card ${note.completed ? "completed" : ""}`
        noteCard.dataset.id = note.id

        const formattedDate = formatDate(note.updatedAt)

        noteCard.innerHTML = `
      <div class="note-header">
        <h3 class="note-title">${escapeHtml(note.title)}</h3>
        <span class="note-date">${formattedDate}</span>
      </div>
      <div class="note-content">${escapeHtml(note.content)}</div>
      <div class="note-footer">
        <div class="note-tags">
          ${note.tags.map((tag) => `<span class="note-tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
        ${note.isTask
                ? `
          <div class="task-status ${note.completed ? "completed" : "pending"}">
            <i class="icon">${note.completed ? "task_alt" : "pending"}</i>
            <span>${note.completed ? "Completato" : "Da completare"}</span>
          </div>
        `
                : ""
            }
      </div>
    `

        noteCard.addEventListener("click", () => openEditNoteModal(note))

        if (note.isTask) {
            const taskStatus = noteCard.querySelector(".task-status")
            taskStatus.addEventListener("click", (e) => {
                e.stopPropagation()
                toggleTaskCompletion(note.id)
            })
        }

        notesGrid.appendChild(noteCard)
    })
}

function filterNotes() {
    return notes.filter((note) => {
        // Filtra per tag
        const matchesTags = activeTagFilters.length === 0 || activeTagFilters.every((tag) => note.tags.includes(tag))

        // Filtra per ricerca
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch =
            searchQuery === "" ||
            note.title.toLowerCase().includes(searchLower) ||
            note.content.toLowerCase().includes(searchLower) ||
            note.tags.some((tag) => tag.toLowerCase().includes(searchLower))

        return matchesTags && matchesSearch
    })
}

// Gestione dei tag
function getAllTags() {
    const tagsSet = new Set()
    notes.forEach((note) => {
        note.tags.forEach((tag) => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
}

function getTagCount(tag) {
    return notes.filter((note) => note.tags.includes(tag)).length
}

function renderTags() {
    tagList.innerHTML = ""
    const allTags = getAllTags()

    if (allTags.length === 0) {
        tagList.innerHTML = `
      <div class="empty-tags" style="color: var(--text-tertiary); text-align: center; padding: 1rem 0;">
        Nessun tag disponibile
      </div>
    `
        return
    }

    allTags.forEach((tag) => {
        const tagElement = document.createElement("div")
        tagElement.className = `tag ${activeTagFilters.includes(tag) ? "active" : ""}`
        tagElement.innerHTML = `
      ${escapeHtml(tag)}
      <span class="tag-count">${getTagCount(tag)}</span>
    `

        tagElement.addEventListener("click", () => toggleTagFilter(tag))
        tagList.appendChild(tagElement)
    })
}

function renderActiveFilters() {
    activeFilters.innerHTML = ""

    if (activeTagFilters.length === 0) {
        activeFilters.innerHTML = `<span style="color: var(--text-tertiary);">Nessun filtro attivo</span>`
        return
    }

    activeTagFilters.forEach((tag) => {
        const filterTag = document.createElement("div")
        filterTag.className = "tag active"
        filterTag.innerHTML = `
      ${escapeHtml(tag)}
      <i class="icon" style="font-size: 0.75rem; margin-left: 0.25rem;">close</i>
    `

        filterTag.addEventListener("click", () => toggleTagFilter(tag))
        activeFilters.appendChild(filterTag)
    })
}

// Gestione del progresso degli impegni
function updateTaskProgress() {
    const tasks = notes.filter((note) => note.isTask)
    const completedTasks = tasks.filter((note) => note.completed)

    const totalCount = tasks.length
    const completedCount = completedTasks.length

    completedCountEl.textContent = completedCount
    totalCountEl.textContent = totalCount

    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
    progressFill.style.width = `${progressPercentage}%`

    // Aggiorna l'emoji in base al progresso
    if (totalCount === 0) {
        completionEmoji.textContent = "😄" // Faccina contenta se non ci sono impegni
    } else if (completedCount === totalCount) {
        completionEmoji.textContent = "😄" // Faccina contenta se tutti gli impegni sono completati
    } else if (progressPercentage >= 50) {
        completionEmoji.textContent = "🙂"
    } else {
        completionEmoji.textContent = "😐"
    }
}

// Gestione del modal
function openAddNoteModal() {
    modalTitle.textContent = "Aggiungi nota"
    noteTitleInput.value = ""
    noteContentInput.value = ""
    noteTagsInput.value = ""
    isTaskCheckbox.checked = false
    isCompletedCheckbox.checked = false
    taskCompletedContainer.classList.add("hidden")
    deleteNoteBtn.style.display = "none"
    currentNoteId = null

    noteModal.classList.add("show")
    modalOverlay.classList.add("show")
    noteTitleInput.focus()
}

function openEditNoteModal(note) {
    modalTitle.textContent = "Modifica nota"
    noteTitleInput.value = note.title
    noteContentInput.value = note.content
    noteTagsInput.value = note.tags.join(", ")
    isTaskCheckbox.checked = note.isTask

    // Mostra l'opzione "completato" solo se è un impegno
    if (note.isTask) {
        taskCompletedContainer.classList.remove("hidden")
        isCompletedCheckbox.checked = note.completed
    } else {
        taskCompletedContainer.classList.add("hidden")
    }

    deleteNoteBtn.style.display = "block"
    currentNoteId = note.id

    noteModal.classList.add("show")
    modalOverlay.classList.add("show")
    noteTitleInput.focus()
}

function closeModal() {
    noteModal.classList.remove("show")
    modalOverlay.classList.remove("show")
}

function openDeleteConfirmation() {
    if (!currentNoteId) return

    noteModal.classList.remove("show")
    confirmModal.classList.add("show")
    modalOverlay.classList.add("show")
}

function closeConfirmModal() {
    confirmModal.classList.remove("show")

    // Se stiamo modificando una nota, riapri il modal di modifica
    if (currentNoteId) {
        noteModal.classList.add("show")
    } else {
        modalOverlay.classList.remove("show")
    }
}

function toggleTaskCompletedOption() {
    if (isTaskCheckbox.checked) {
        taskCompletedContainer.classList.remove("hidden")
    } else {
        taskCompletedContainer.classList.add("hidden")
        isCompletedCheckbox.checked = false
    }
}

// Toast notifications
function showToast(message, type = "success") {
    toastMessage.textContent = message

    if (type === "error") {
        toastIcon.textContent = "error"
        toastIcon.className = "icon error"
    } else {
        toastIcon.textContent = "check_circle"
        toastIcon.className = "icon"
    }

    toast.classList.add("show")

    setTimeout(() => {
        toast.classList.remove("show")
    }, 3000)
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffDay > 0) {
        return `${diffDay} ${diffDay === 1 ? "giorno" : "giorni"} fa`
    } else if (diffHour > 0) {
        return `${diffHour} ${diffHour === 1 ? "ora" : "ore"} fa`
    } else if (diffMin > 0) {
        return `${diffMin} ${diffMin === 1 ? "minuto" : "minuti"} fa`
    } else {
        return "Adesso"
    }
}

function escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
}

// Previeni il submit del form quando si preme invio
document.querySelectorAll("input, textarea").forEach((element) => {
    element.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
            e.preventDefault()
        }
    })
})

// === Import/Export ===

// Trigger apertura file
document.getElementById("import-btn").addEventListener("click", () => {
    document.getElementById("import-file").click()
})

// Importa da file JSON o TXT
document.getElementById("import-file").addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
        try {
            let importedNotes = []
            if (file.name.endsWith(".json")) {
                importedNotes = JSON.parse(event.target.result)
            } else {
                importedNotes = parseTxtNotes(event.target.result)
            }

            if (!Array.isArray(importedNotes)) throw new Error("Formato non valido")

            importedNotes.forEach((note) => {
                if (note.title && note.content) {
                    addNote(note)
                }
            })

            showToast("Note importate correttamente")
        } catch (error) {
            showToast("Errore nell'importazione", "error")
        }
    }
    reader.readAsText(file)
})

// Esporta in JSON
document.getElementById("export-json-btn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" })
    downloadBlob(blob, "note.json")
})

// Esporta in TXT
document.getElementById("export-txt-btn").addEventListener("click", () => {
    const text = notes.map((n) =>
        `Titolo: ${n.title}\nContenuto: ${n.content}\nTag: ${n.tags.join(", ")}\nCompletato: ${n.completed ? "Sì" : "No"}\n---\n`
    ).join("\n")
    const blob = new Blob([text], { type: "text/plain" })
    downloadBlob(blob, "note.txt")
})

// Helpers
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

function parseTxtNotes(txt) {
    const lines = txt.split(/\r?\n/)
    const notesParsed = []
    let currentNote = { title: "", content: "", tags: [], completed: false }

    lines.forEach(line => {
        if (line.startsWith("Titolo:")) {
            if (currentNote.title || currentNote.content) {
                notesParsed.push({ ...currentNote })
            }
            currentNote = {
                title: line.replace("Titolo:", "").trim(),
                content: "",
                tags: [],
                completed: false
            }
        } else if (line.startsWith("Contenuto:")) {
            currentNote.content = line.replace("Contenuto:", "").trim()
        } else if (line.startsWith("Tag:")) {
            currentNote.tags = line.replace("Tag:", "").split(",").map(t => t.trim()).filter(Boolean)
        } else if (line.startsWith("Completato:")) {
            currentNote.completed = line.includes("Sì")
        }
    })

    if (currentNote.title || currentNote.content) {
        notesParsed.push({ ...currentNote })
    }

    return notesParsed
}

function renderNotes() {
    notesGrid.innerHTML = ""

    const filteredNotes = filterNotes()

    if (filteredNotes.length === 0) {
        notesGrid.innerHTML = `
      <div class="empty-state">
        <i class="icon">note</i>
        <p>Nessuna nota trovata</p>
      </div>
    `
        return
    }

    filteredNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

    filteredNotes.forEach((note) => {
        const noteCard = document.createElement("div")
        noteCard.className = `note-card ${note.completed ? "completed" : ""}`
        noteCard.dataset.id = note.id

        const formattedDate = formatDate(note.updatedAt)

        noteCard.innerHTML = `
      <div class="note-header">
        <h3 class="note-title">${escapeHtml(note.title)}</h3>
        <div class="note-actions">
          <span class="note-date">${formattedDate}</span>
          <button class="icon-button delete-from-card" title="Elimina" data-id="${note.id}">
            <i class="icon">delete</i>
          </button>
        </div>
      </div>
      <div class="note-content">${escapeHtml(note.content)}</div>
      <div class="note-footer">
        <div class="note-tags">
          ${note.tags.map((tag) => `<span class="note-tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
        ${note.isTask
                ? `
          <div class="task-status ${note.completed ? "completed" : "pending"}">
            <i class="icon">${note.completed ? "task_alt" : "pending"}</i>
            <span>${note.completed ? "Completato" : "Da completare"}</span>
          </div>
        ` : ""}
      </div>
    `

        noteCard.addEventListener("click", () => openEditNoteModal(note))

        noteCard.querySelector(".delete-from-card").addEventListener("click", (e) => {
            e.stopPropagation()
            openDeleteConfirmation(note.id)
        })

        if (note.isTask) {
            const taskStatus = noteCard.querySelector(".task-status")
            taskStatus.addEventListener("click", (e) => {
                e.stopPropagation()
                toggleTaskCompletion(note.id)
            })
        }

        notesGrid.appendChild(noteCard)
    })
}

function openDeleteConfirmation(id = null) {
    if (id) currentNoteId = id
    noteModal.classList.remove("show")
    confirmModal.classList.add("show")
    modalOverlay.classList.add("show")

    const modalBody = confirmModal.querySelector(".modal-body")
    modalBody.innerHTML = `
      <p>Sei sicuro di voler eliminare ${id ? "questa nota" : "tutte le note"}?</p>
      <p class="warning-text">Questa azione non può essere annullata.</p>
    `
}

function deleteAllNotes() {
    notes = []
    saveNotes()
    renderNotes()
    renderTags()
    updateTaskProgress()
    showToast("Tutte le note sono state eliminate", "success")
}

confirmDeleteBtn.addEventListener("click", () => {
    if (currentNoteId) {
        deleteNote(currentNoteId)
        closeConfirmModal()
        closeModal()
    } else {
        deleteAllNotes()
        closeConfirmModal()
    }
})

document.getElementById("delete-all-btn").addEventListener("click", openDeleteAllConfirmation)

filteredNotes.forEach((note) => {
    const noteCard = document.createElement("div")
    noteCard.className = `note-card ${note.completed ? "completed" : ""}`
    noteCard.dataset.id = note.id

    const formattedDate = formatDate(note.updatedAt)

    noteCard.innerHTML = `
      <div class="note-header">
        <h3 class="note-title">${escapeHtml(note.title)}</h3>
        <div class="note-actions">
          <span class="note-date">${formattedDate}</span>
          <button class="icon-button edit-note" title="Modifica" data-id="${note.id}">
            <i class="icon">edit</i>
          </button>
          <button class="icon-button delete-from-card" title="Elimina" data-id="${note.id}">
            <i class="icon">delete</i>
          </button>
        </div>
      </div>
      <div class="note-content">${escapeHtml(note.content)}</div>
      <div class="note-footer">
        <div class="note-tags">
          ${note.tags.map((tag) => `<span class="note-tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
        ${note.isTask
            ? `
          <div class="task-status ${note.completed ? "completed" : "pending"}">
            <i class="icon">${note.completed ? "task_alt" : "pending"}</i>
            <span>${note.completed ? "Completato" : "Da completare"}</span>
          </div>
        ` : ""}
      </div>
    `

    // 🗑️ Elimina
    noteCard.querySelector(".delete-from-card").addEventListener("click", (e) => {
        e.stopPropagation()
        openDeleteConfirmation(note.id)
    })

    // ✏️ Modifica
    noteCard.querySelector(".edit-note").addEventListener("click", (e) => {
        e.stopPropagation()
        openEditNoteModal(note)
    })

    // ✅ Toggle completato (se è impegno)
    if (note.isTask) {
        const taskStatus = noteCard.querySelector(".task-status")
        taskStatus.addEventListener("click", (e) => {
            e.stopPropagation()
            toggleTaskCompletion(note.id)
        })
    }

    notesGrid.appendChild(noteCard)
})

function closeConfirmModal() {
    confirmModal.classList.remove("show")
    modalOverlay.classList.remove("show")
}


document.getElementById("delete-all-btn").addEventListener("click", () => openDeleteConfirmation(null))


function openDeleteConfirmation(id = null) {
    currentNoteId = id // può essere null

    noteModal.classList.remove("show")
    confirmModal.classList.add("show")
    modalOverlay.classList.add("show")

    const modalBody = confirmModal.querySelector(".modal-body")
    if (id) {
        modalBody.innerHTML = `
          <p>Sei sicuro di voler eliminare questa nota?</p>
          <p class="warning-text">Questa azione non può essere annullata.</p>
        `
    } else {
        modalBody.innerHTML = `
          <p>Vuoi davvero eliminare <strong>tutte le note</strong>?</p>
          <p class="warning-text">Questa azione è irreversibile.</p>
        `
    }
}

confirmDeleteBtn.addEventListener("click", () => {
    if (currentNoteId) {
        deleteNote(currentNoteId)
        closeConfirmModal()
        closeModal()
    } else {
        deleteAllNotes()
        closeConfirmModal()
    }
})

function deleteAllNotes() {
    notes = []
    saveNotes()
    renderNotes()
    renderTags()
    updateTaskProgress()
    showToast("Tutte le note sono state eliminate", "success")
}

document.getElementById("delete-all-btn").addEventListener("click", () => openDeleteConfirmation(null))

function openDeleteConfirmation(id = null) {
    currentNoteId = id

    noteModal.classList.remove("show")
    confirmModal.classList.add("show")
    modalOverlay.classList.add("show")

    const modalBody = confirmModal.querySelector(".modal-body")
    modalBody.innerHTML = id
        ? `<p>Sei sicuro di voler eliminare questa nota?</p><p class="warning-text">Questa azione non può essere annullata.</p>`
        : `<p>Vuoi davvero eliminare <strong>tutte le note</strong>?</p><p class="warning-text">Questa azione è irreversibile.</p>`
}


function closeConfirmModal() {
    confirmModal.classList.remove("show")
    modalOverlay.classList.remove("show")
}

noteCard.addEventListener("click", () => openEditNoteModal(note))
function openDeleteConfirmation(id = null) {
    currentNoteId = id
    document.getElementById("note-modal")?.classList.remove("show")
    document.getElementById("confirm-modal").classList.add("show")
    document.getElementById("modal-overlay").classList.add("show")

    const modalBody = document.querySelector("#confirm-modal .modal-body")
    modalBody.innerHTML = id
        ? `<p>Sei sicuro di voler eliminare questa nota?</p><p class="warning-text">Questa azione non può essere annullata.</p>`
        : `<p>Vuoi davvero eliminare <strong>tutte le note</strong>?</p><p class="warning-text">Questa azione è irreversibile.</p>`
}

function closeConfirmModal() {
    document.getElementById("confirm-modal").classList.remove("show")
    document.getElementById("modal-overlay").classList.remove("show")
}

function handleDeleteConfirmation() {
    if (currentNoteId) {
        deleteNote(currentNoteId)
    } else {
        deleteAllNotes()
    }
    closeConfirmModal()
}

function deleteAllNotes() {
    notes = []
    saveNotes()
    renderNotes()
    renderTags()
    updateTaskProgress()
    showToast("Tutte le note eliminate", "success")
}
