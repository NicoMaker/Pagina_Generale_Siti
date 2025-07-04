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
const deleteAllBtn = document.getElementById("delete-all-btn")

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
    setupEventListeners()
})

// Setup event listeners
function setupEventListeners() {
    // Modal events
    addNoteBtn.addEventListener("click", openAddNoteModal)
    closeModalBtn.addEventListener("click", closeModal)
    closeConfirmModalBtn.addEventListener("click", closeConfirmModal)
    saveNoteBtn.addEventListener("click", saveNote)
    deleteNoteBtn.addEventListener("click", () => openDeleteConfirmation(currentNoteId))
    confirmDeleteBtn.addEventListener("click", handleDeleteConfirmation)
    cancelDeleteBtn.addEventListener("click", closeConfirmModal)

    // Search and filters
    searchInput.addEventListener("input", handleSearch)
    clearFiltersBtn.addEventListener("click", clearFilters)

    // Theme toggle
    themeToggleBtn.addEventListener("click", toggleTheme)

    // Task checkbox
    isTaskCheckbox.addEventListener("change", toggleTaskCompletedOption)

    // Delete all
    deleteAllBtn.addEventListener("click", () => openDeleteConfirmation(null))

    // Import/Export
    document.getElementById("import-btn").addEventListener("click", () => {
        document.getElementById("import-file").click()
    })
    document.getElementById("import-file").addEventListener("change", handleImport)
    document.getElementById("export-json-btn").addEventListener("click", exportJSON)
    document.getElementById("export-txt-btn").addEventListener("click", exportTXT)

    // Modal overlay
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
            if (noteModal.classList.contains("show")) {
                closeModal()
            } else if (confirmModal.classList.contains("show")) {
                closeConfirmModal()
            }
        }
    })

    // Keyboard shortcuts
    document.addEventListener("keydown", handleKeyboardShortcuts)
}

// Gestione del tema
function initTheme() {
    const isDarkMode = localStorage.getItem("darkMode") === "true"
    if (isDarkMode) {
        document.body.classList.add("dark-theme")
        themeToggleBtn.innerHTML = '<span class="icon">☀️</span>'
    } else {
        themeToggleBtn.innerHTML = '<span class="icon">🌙</span>'
    }
}

function toggleTheme() {
    const isDarkMode = document.body.classList.toggle("dark-theme")
    localStorage.setItem("darkMode", isDarkMode)

    if (isDarkMode) {
        themeToggleBtn.innerHTML = '<span class="icon">☀️</span>'
        showToast("Tema scuro attivato", "success")
    } else {
        themeToggleBtn.innerHTML = '<span class="icon">🌙</span>'
        showToast("Tema chiaro attivato", "success")
    }
}

// Gestione del localStorage
function loadNotes() {
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
        try {
            notes = JSON.parse(savedNotes)
        } catch (error) {
            console.error("Errore nel caricamento delle note:", error)
            notes = []
        }
    }
}

function saveNotes() {
    try {
        localStorage.setItem("notes", JSON.stringify(notes))
    } catch (error) {
        console.error("Errore nel salvataggio delle note:", error)
        showToast("Errore nel salvataggio", "error")
    }
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
        noteTitleInput.focus()
        return
    }

    const tags = tagsString
        ? tagsString
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : []

    if (currentNoteId) {
        updateNote(currentNoteId, { title, content, tags, isTask, completed: isTask ? isCompleted : false })
        showToast("Nota aggiornata con successo! ✨", "success")
    } else {
        addNote({ title, content, tags, isTask, completed: isTask ? isCompleted : false })
        showToast("Nota aggiunta con successo! 🎉", "success")
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
    const noteToDelete = notes.find((note) => note.id === id)
    notes = notes.filter((note) => note.id !== id)
    saveNotes()
    renderNotes()
    renderTags()
    updateTaskProgress()

    if (noteToDelete) {
        showToast(`"${noteToDelete.title}" eliminata`, "success")
    }
}

function deleteAllNotes() {
    const count = notes.length
    notes = []
    saveNotes()
    renderNotes()
    renderTags()
    updateTaskProgress()
    showToast(`${count} note eliminate`, "success")
}

function toggleTaskCompletion(id) {
    const index = notes.findIndex((note) => note.id === id)
    if (index !== -1 && notes[index].isTask) {
        notes[index].completed = !notes[index].completed
        notes[index].updatedAt = new Date().toISOString()
        saveNotes()
        renderNotes()
        updateTaskProgress()

        const status = notes[index].completed ? "completato! 🎉" : "da completare"
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
    showToast("Filtri cancellati", "success")
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
                <div class="icon">📝</div>
                <h3>Nessuna nota trovata</h3>
                <p>Inizia creando la tua prima nota!</p>
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
                    <button class="icon-button edit-note" title="Modifica" data-id="${note.id}">
                        ✏️
                    </button>
                    <button class="icon-button delete-from-card" title="Elimina" data-id="${note.id}">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="note-content">${escapeHtml(note.content)}</div>
            <div class="note-footer">
                <div class="note-tags">
                    ${note.tags.map((tag) => `<span class="note-tag">${escapeHtml(tag)}</span>`).join("")}
                </div>
                ${note.isTask
                ? `<div class="task-status ${note.completed ? "completed" : "pending"}" data-id="${note.id}">
                        <span class="icon">${note.completed ? "✅" : "⏳"}</span>
                        <span>${note.completed ? "Completato" : "Da completare"}</span>
                    </div>`
                : ""
            }
            </div>
        `

        // Event listeners per la card
        const editBtn = noteCard.querySelector(".edit-note")
        const deleteBtn = noteCard.querySelector(".delete-from-card")
        const taskStatus = noteCard.querySelector(".task-status")

        editBtn.addEventListener("click", (e) => {
            e.stopPropagation()
            openEditNoteModal(note)
        })

        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation()
            openDeleteConfirmation(note.id)
        })

        if (taskStatus) {
            taskStatus.addEventListener("click", (e) => {
                e.stopPropagation()
                toggleTaskCompletion(note.id)
            })
        }

        // Click sulla card per modificare
        noteCard.addEventListener("click", () => openEditNoteModal(note))

        notesGrid.appendChild(noteCard)
    })
}

function filterNotes() {
    return notes.filter((note) => {
        const matchesTags = activeTagFilters.length === 0 || activeTagFilters.every((tag) => note.tags.includes(tag))

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
            <span>🏷️ ${escapeHtml(tag)}</span>
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
            <span>${escapeHtml(tag)}</span>
            <span style="margin-left: 0.5rem; cursor: pointer;">✕</span>
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

    // Aggiorna l'emoji e il testo in base al progresso
    const completionText = document.querySelector(".completion-text")
    if (totalCount === 0) {
        completionEmoji.textContent = "😊"
        if (completionText) completionText.textContent = "Nessun impegno"
    } else if (completedCount === totalCount) {
        completionEmoji.textContent = "🎉"
        if (completionText) completionText.textContent = "Tutto completato!"
    } else if (progressPercentage >= 75) {
        completionEmoji.textContent = "😄"
        if (completionText) completionText.textContent = "Quasi fatto!"
    } else if (progressPercentage >= 50) {
        completionEmoji.textContent = "🙂"
        if (completionText) completionText.textContent = "A metà strada!"
    } else if (progressPercentage > 0) {
        completionEmoji.textContent = "😐"
        if (completionText) completionText.textContent = "Continua così!"
    } else {
        completionEmoji.textContent = "😴"
        if (completionText) completionText.textContent = "Inizia ora!"
    }
}

// Gestione del modal
function openAddNoteModal() {
    modalTitle.innerHTML = "✏️ Aggiungi nota"
    noteTitleInput.value = ""
    noteContentInput.value = ""
    noteTagsInput.value = ""
    isTaskCheckbox.checked = false
    isCompletedCheckbox.checked = false
    taskCompletedContainer.classList.add("hidden")
    deleteNoteBtn.style.display = "none"
    currentNoteId = null

    showModal(noteModal)
    noteTitleInput.focus()
}

function openEditNoteModal(note) {
    modalTitle.innerHTML = "✏️ Modifica nota"
    noteTitleInput.value = note.title
    noteContentInput.value = note.content
    noteTagsInput.value = note.tags.join(", ")
    isTaskCheckbox.checked = note.isTask

    if (note.isTask) {
        taskCompletedContainer.classList.remove("hidden")
        isCompletedCheckbox.checked = note.completed
    } else {
        taskCompletedContainer.classList.add("hidden")
    }

    deleteNoteBtn.style.display = "flex"
    currentNoteId = note.id

    showModal(noteModal)
    noteTitleInput.focus()
}

function openDeleteConfirmation(id = null) {
    currentNoteId = id

    const modalBody = confirmModal.querySelector(".modal-body")
    if (id) {
        const note = notes.find((n) => n.id === id)
        modalBody.innerHTML = `
            <div class="warning-content">
                <div class="warning-icon">🚨</div>
                <p>Sei sicuro di voler eliminare la nota <strong>"${escapeHtml(note?.title || "Senza titolo")}"</strong>?</p>
                <p class="warning-text">Questa azione non può essere annullata.</p>
            </div>
        `
    } else {
        modalBody.innerHTML = `
            <div class="warning-content">
                <div class="warning-icon">🚨</div>
                <p>Vuoi davvero eliminare <strong>tutte le ${notes.length} note</strong>?</p>
                <p class="warning-text">Questa azione è irreversibile.</p>
            </div>
        `
    }

    hideModal(noteModal)
    showModal(confirmModal)
}

function showModal(modal) {
    modal.classList.add("show")
    modalOverlay.classList.add("show")
    document.body.style.overflow = "hidden"
}

function hideModal(modal) {
    modal.classList.remove("show")
    if (!noteModal.classList.contains("show") && !confirmModal.classList.contains("show")) {
        modalOverlay.classList.remove("show")
        document.body.style.overflow = ""
    }
}

function closeModal() {
    hideModal(noteModal)
    currentNoteId = null
}

function closeConfirmModal() {
    hideModal(confirmModal)
}

function handleDeleteConfirmation() {
    if (currentNoteId) {
        deleteNote(currentNoteId)
        closeModal()
    } else {
        deleteAllNotes()
    }
    closeConfirmModal()
}

function toggleTaskCompletedOption() {
    if (isTaskCheckbox.checked) {
        taskCompletedContainer.classList.remove("hidden")
    } else {
        taskCompletedContainer.classList.add("hidden")
        isCompletedCheckbox.checked = false
    }
}

// Import/Export
function handleImport(e) {
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

            let importedCount = 0
            importedNotes.forEach((note) => {
                if (note.title && note.content) {
                    addNote({
                        title: note.title,
                        content: note.content,
                        tags: note.tags || [],
                        isTask: note.isTask || false,
                        completed: note.completed || false,
                    })
                    importedCount++
                }
            })

            showToast(`${importedCount} note importate! 📂`, "success")
        } catch (error) {
            console.error("Errore nell'importazione:", error)
            showToast("Errore nell'importazione del file", "error")
        }
    }
    reader.readAsText(file)

    // Reset input
    e.target.value = ""
}

function exportJSON() {
    try {
        const dataStr = JSON.stringify(notes, null, 2)
        const blob = new Blob([dataStr], { type: "application/json" })
        downloadBlob(blob, `note-${formatDateForFilename()}.json`)
        showToast("Note esportate in JSON! 💾", "success")
    } catch (error) {
        console.error("Errore nell'esportazione JSON:", error)
        showToast("Errore nell'esportazione", "error")
    }
}

function exportTXT() {
    try {
        const text = notes
            .map((note) => {
                return `Titolo: ${note.title}\nContenuto: ${note.content}\nTag: ${note.tags.join(", ")}\nTipo: ${note.isTask ? "Impegno" : "Nota"}\nCompletato: ${note.completed ? "Sì" : "No"}\nCreato: ${formatDate(note.createdAt)}\n${"=".repeat(50)}\n`
            })
            .join("\n")

        const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
        downloadBlob(blob, `note-${formatDateForFilename()}.txt`)
        showToast("Note esportate in TXT! 📄", "success")
    } catch (error) {
        console.error("Errore nell'esportazione TXT:", error)
        showToast("Errore nell'esportazione", "error")
    }
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

function parseTxtNotes(txt) {
    const sections = txt.split("=".repeat(50))
    const notesParsed = []

    sections.forEach((section) => {
        const lines = section.trim().split(/\r?\n/)
        if (lines.length < 2) return

        const currentNote = { title: "", content: "", tags: [], isTask: false, completed: false }

        lines.forEach((line) => {
            if (line.startsWith("Titolo:")) {
                currentNote.title = line.replace("Titolo:", "").trim()
            } else if (line.startsWith("Contenuto:")) {
                currentNote.content = line.replace("Contenuto:", "").trim()
            } else if (line.startsWith("Tag:")) {
                currentNote.tags = line
                    .replace("Tag:", "")
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
            } else if (line.startsWith("Tipo:")) {
                currentNote.isTask = line.includes("Impegno")
            } else if (line.startsWith("Completato:")) {
                currentNote.completed = line.includes("Sì")
            }
        })

        if (currentNote.title || currentNote.content) {
            notesParsed.push(currentNote)
        }
    })

    return notesParsed
}

// Toast notifications
function showToast(message, type = "success") {
    toastMessage.textContent = message

    if (type === "error") {
        toastIcon.textContent = "❌"
        toastIcon.className = "toast-icon error"
    } else {
        toastIcon.textContent = "✅"
        toastIcon.className = "toast-icon"
    }

    toast.classList.add("show")

    setTimeout(() => {
        toast.classList.remove("show")
    }, 4000)
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + N per nuova nota
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault()
        openAddNoteModal()
    }

    // Escape per chiudere modal
    if (e.key === "Escape") {
        if (noteModal.classList.contains("show")) {
            closeModal()
        } else if (confirmModal.classList.contains("show")) {
            closeConfirmModal()
        }
    }

    // Ctrl/Cmd + S per salvare (se modal aperto)
    if ((e.ctrlKey || e.metaKey) && e.key === "s" && noteModal.classList.contains("show")) {
        e.preventDefault()
        saveNote()
    }
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

    if (diffDay > 7) {
        return date.toLocaleDateString("it-IT", {
            day: "numeric",
            month: "short",
            year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        })
    } else if (diffDay > 0) {
        return `${diffDay} ${diffDay === 1 ? "giorno" : "giorni"} fa`
    } else if (diffHour > 0) {
        return `${diffHour} ${diffHour === 1 ? "ora" : "ore"} fa`
    } else if (diffMin > 0) {
        return `${diffMin} ${diffMin === 1 ? "minuto" : "minuti"} fa`
    } else {
        return "Adesso"
    }
}

function formatDateForFilename() {
    const now = new Date()
    return now.toISOString().split("T")[0]
}

function escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
}

// Auto-save draft (bonus feature)
let draftTimeout
function saveDraft() {
    clearTimeout(draftTimeout)
    draftTimeout = setTimeout(() => {
        if (noteModal.classList.contains("show")) {
            const draft = {
                title: noteTitleInput.value,
                content: noteContentInput.value,
                tags: noteTagsInput.value,
                isTask: isTaskCheckbox.checked,
                completed: isCompletedCheckbox.checked,
            }
            localStorage.setItem("noteDraft", JSON.stringify(draft))
        }
    }, 1000)
}

function loadDraft() {
    const draft = localStorage.getItem("noteDraft")
    if (draft && !currentNoteId) {
        try {
            const draftData = JSON.parse(draft)
            if (draftData.title || draftData.content) {
                noteTitleInput.value = draftData.title || ""
                noteContentInput.value = draftData.content || ""
                noteTagsInput.value = draftData.tags || ""
                isTaskCheckbox.checked = draftData.isTask || false
                isCompletedCheckbox.checked = draftData.completed || false
                toggleTaskCompletedOption()
            }
        } catch (error) {
            console.error("Errore nel caricamento della bozza:", error)
        }
    }
}

function clearDraft() {
    localStorage.removeItem("noteDraft")
}
// Add draft functionality to inputs
;[noteTitleInput, noteContentInput, noteTagsInput].forEach((input) => {
    input.addEventListener("input", saveDraft)
})
    ;[isTaskCheckbox, isCompletedCheckbox].forEach((checkbox) => {
        checkbox.addEventListener("change", saveDraft)
    })

// Load draft when opening add modal
const originalOpenAddNoteModal = openAddNoteModal
openAddNoteModal = () => {
    originalOpenAddNoteModal()
    loadDraft()
}

// Clear draft when saving or closing
const originalSaveNote = saveNote
saveNote = () => {
    originalSaveNote()
    clearDraft()
}

const originalCloseModal = closeModal
closeModal = () => {
    clearDraft()
    originalCloseModal()
}

// Performance optimization: debounce search
let searchTimeout
const originalHandleSearch = handleSearch
handleSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(originalHandleSearch, 300)
}

// Initialize active filters display
renderActiveFilters()

console.log("📝 Note Organizer caricato con successo!")
