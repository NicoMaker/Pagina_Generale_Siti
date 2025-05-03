// Elementi DOM
const nameInput = document.getElementById("name-input")
const addPersonBtn = document.getElementById("add-person-btn")
const peopleList = document.getElementById("people-list")
const startBtn = document.getElementById("start-btn")
const inputSection = document.getElementById("input-section")
const turnSection = document.getElementById("turn-section")
const turnList = document.getElementById("turn-list")
const turnNumberEl = document.getElementById("turn-number")
const currentPersonEl = document.getElementById("current-person")
const resetTurnBtn = document.getElementById("reset-turn-btn")
const resetAllBtn = document.getElementById("reset-all-btn")
const errorMessage = document.getElementById("error-message")
const notification = document.getElementById("notification")
const peopleCountEl = document.getElementById("people-count")

// Stato dell'applicazione
let people = []
let currentTurn = 1
let currentPersonIndex = 0
let editingIndex = -1
let isGameStarted = false

// Inizializzazione
document.addEventListener("DOMContentLoaded", () => {
    // Carica i dati salvati
    loadFromLocalStorage()

    // Focus sull'input
    nameInput.focus()

    // Aggiungi effetti sonori
    initSounds()

    // Crea l'interfaccia per aggiungere persone nella sezione turni
    createAddPersonInTurnSection()
})

// Crea l'interfaccia per aggiungere persone nella sezione turni
function createAddPersonInTurnSection() {
    // Crea il container per l'input e il pulsante
    const addPersonContainer = document.createElement("div")
    addPersonContainer.className = "input-group"
    addPersonContainer.style.marginTop = "var(--spacing-6)"
    addPersonContainer.style.marginBottom = "var(--spacing-4)"

    // Crea il wrapper per l'input
    const inputWrapper = document.createElement("div")
    inputWrapper.className = "input-wrapper"

    // Crea l'icona
    const inputIcon = document.createElement("i")
    inputIcon.className = "fas fa-user input-icon"

    // Crea l'input
    const turnNameInput = document.createElement("input")
    turnNameInput.id = "turn-name-input"
    turnNameInput.type = "text"
    turnNameInput.placeholder = "Aggiungi una nuova persona"

    // Crea il pulsante
    const turnAddPersonBtn = document.createElement("button")
    turnAddPersonBtn.id = "turn-add-person-btn"
    turnAddPersonBtn.className = "btn btn-primary"
    turnAddPersonBtn.innerHTML = '<i class="fas fa-plus"></i><span>Aggiungi</span>'

    // Assembla gli elementi
    inputWrapper.appendChild(inputIcon)
    inputWrapper.appendChild(turnNameInput)
    addPersonContainer.appendChild(inputWrapper)
    addPersonContainer.appendChild(turnAddPersonBtn)

    // Aggiungi il container alla sezione turni, prima della lista dei partecipanti
    const peopleContainer = turnSection.querySelector(".people-container")
    turnSection.querySelector(".card-body").insertBefore(addPersonContainer, peopleContainer)

    // Aggiungi event listener
    turnAddPersonBtn.addEventListener("click", addPersonInTurnSection)
    turnNameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            addPersonInTurnSection()
        }
    })
}

// Funzione per aggiungere una persona nella sezione turni
function addPersonInTurnSection() {
    const turnNameInput = document.getElementById("turn-name-input")
    const name = turnNameInput.value.trim()

    if (name) {
        // Aggiungi la nuova persona
        people.push({
            name: name,
            completed: false,
        })

        // Pulisci l'input e dai focus
        turnNameInput.value = ""
        turnNameInput.focus()

        // Aggiorna la lista e salva
        renderPeopleList()
        updatePeopleCount()
        saveToLocalStorage()

        // Riproduci suono
        playSound("add")

        // Mostra notifica
        showNotification(`${name} è stato aggiunto alla lista!`)

        // Effetto di feedback
        const turnAddPersonBtn = document.getElementById("turn-add-person-btn")
        turnAddPersonBtn.classList.add("pulse")
        setTimeout(() => {
            turnAddPersonBtn.classList.remove("pulse")
        }, 1000)
    }
}

// Suoni
let sounds = {}

function initSounds() {
    sounds = {
        add: new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"),
        delete: new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3"),
        complete: new Audio("https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3"),
        start: new Audio("https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3"),
        error: new Audio("https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3"),
    }

    // Precarica i suoni
    Object.values(sounds).forEach((sound) => {
        sound.load()
        sound.volume = 0.5
    })
}

function playSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName].currentTime = 0
        sounds[soundName].play().catch((e) => console.log("Audio play failed:", e))
    }
}

// Controlla se ci sono dati salvati nel localStorage
function loadFromLocalStorage() {
    const savedData = localStorage.getItem("turnManagement")
    if (savedData) {
        try {
            const data = JSON.parse(savedData)
            people = data.people || []
            currentTurn = data.currentTurn || 1
            currentPersonIndex = data.currentPersonIndex || 0
            isGameStarted = data.isGameStarted || false

            // Se il gioco era già iniziato, mostra la sezione dei turni
            if (isGameStarted) {
                inputSection.classList.add("hidden")
                turnSection.classList.remove("hidden")
            } else {
                inputSection.classList.remove("hidden")
                turnSection.classList.add("hidden")
            }

            renderPeopleList()
            updateStartButton()
            updatePeopleCount()
        } catch (e) {
            console.error("Errore nel caricamento dei dati:", e)
            resetAll()
        }
    }
}

// Salva lo stato nel localStorage
function saveToLocalStorage() {
    const data = {
        people,
        currentTurn,
        currentPersonIndex,
        isGameStarted,
    }
    localStorage.setItem("turnManagement", JSON.stringify(data))
}

// Aggiorna il contatore delle persone
function updatePeopleCount() {
    peopleCountEl.textContent = people.length

    // Aggiorna anche il contatore nella sezione turni se esiste
    const turnPeopleCount = document.querySelector("#turn-people-count")
    if (turnPeopleCount) {
        turnPeopleCount.textContent = people.length
    }
}

// Aggiunge una persona alla lista
function addPerson() {
    const name = nameInput.value.trim()
    if (name) {
        people.push({
            name: name,
            completed: false,
        })
        renderPeopleList()
        nameInput.value = ""
        nameInput.focus()

        // Abilita il pulsante di avvio se ci sono almeno 2 persone
        updateStartButton()
        updatePeopleCount()
        saveToLocalStorage()

        // Riproduci suono
        playSound("add")

        // Effetto di feedback
        addPersonBtn.classList.add("pulse")
        setTimeout(() => {
            addPersonBtn.classList.remove("pulse")
        }, 1000)
    }
}

// Aggiorna lo stato del pulsante di avvio
function updateStartButton() {
    if (people.length >= 2) {
        startBtn.disabled = false
        errorMessage.classList.add("hidden")
        startBtn.classList.add("pulse")
    } else {
        startBtn.disabled = true
        startBtn.classList.remove("pulse")
        if (people.length > 0) {
            errorMessage.classList.remove("hidden")
        } else {
            errorMessage.classList.add("hidden")
        }
    }
}

// Renderizza la lista delle persone
function renderPeopleList() {
    const list = isGameStarted ? turnList : peopleList
    list.innerHTML = ""

    people.forEach((person, index) => {
        const li = document.createElement("li")

        if (editingIndex === index) {
            // Modalità modifica
            const editInput = document.createElement("input")
            editInput.type = "text"
            editInput.value = person.name
            editInput.className = "edit-input"
            editInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    saveName(index, editInput.value)
                }
            })

            const saveBtn = document.createElement("button")
            saveBtn.innerHTML = '<i class="fas fa-check"></i>'
            saveBtn.className = "btn btn-success btn-icon"
            saveBtn.title = "Salva"
            saveBtn.onclick = () => saveName(index, editInput.value)

            const cancelBtn = document.createElement("button")
            cancelBtn.innerHTML = '<i class="fas fa-times"></i>'
            cancelBtn.className = "btn btn-warning btn-icon"
            cancelBtn.title = "Annulla"
            cancelBtn.onclick = () => cancelEdit()

            li.appendChild(editInput)
            li.appendChild(saveBtn)
            li.appendChild(cancelBtn)

            // Focus sull'input di modifica
            setTimeout(() => editInput.focus(), 0)
        } else {
            // Modalità visualizzazione
            const nameSpan = document.createElement("span")
            nameSpan.innerHTML = `<i class="fas fa-user"></i> ${index + 1}. ${person.name}`
            nameSpan.className = "person-name"

            const actionsDiv = document.createElement("div")
            actionsDiv.className = "person-actions"

            // Pulsante modifica
            const editBtn = document.createElement("button")
            editBtn.innerHTML = '<i class="fas fa-edit"></i>'
            editBtn.className = "btn btn-info btn-icon"
            editBtn.title = "Modifica"
            editBtn.onclick = () => editName(index)

            // Pulsante elimina
            const deleteBtn = document.createElement("button")
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>'
            deleteBtn.className = "btn btn-danger btn-icon"
            deleteBtn.title = "Elimina"
            // Disabilita il pulsante elimina se ci sono solo 2 persone e siamo in gioco
            if (isGameStarted && people.length <= 2) {
                deleteBtn.disabled = true
                deleteBtn.title = "Servono almeno 2 persone"
            }
            deleteBtn.onclick = () => deletePerson(index)

            // Pulsante sposta su
            const upBtn = document.createElement("button")
            upBtn.innerHTML = '<i class="fas fa-arrow-up"></i>'
            upBtn.className = "btn btn-primary btn-icon"
            upBtn.title = "Sposta su"
            upBtn.disabled = index === 0
            upBtn.onclick = () => movePerson(index, -1)

            // Pulsante sposta giù
            const downBtn = document.createElement("button")
            downBtn.innerHTML = '<i class="fas fa-arrow-down"></i>'
            downBtn.className = "btn btn-primary btn-icon"
            downBtn.title = "Sposta giù"
            downBtn.disabled = index === people.length - 1
            downBtn.onclick = () => movePerson(index, 1)

            actionsDiv.appendChild(editBtn)
            actionsDiv.appendChild(deleteBtn)
            actionsDiv.appendChild(upBtn)
            actionsDiv.appendChild(downBtn)

            li.appendChild(nameSpan)
            li.appendChild(actionsDiv)

            // Aggiungi classi per il turno corrente e completato
            if (isGameStarted) {
                if (index === currentPersonIndex) {
                    li.classList.add("current-turn")

                    // Aggiungi pulsante "Completato" solo per la persona corrente
                    const completeBtn = document.createElement("button")
                    // Aggiungi span attorno al testo per poterlo nascondere su schermi piccoli
                    completeBtn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Completato</span>'
                    completeBtn.className = "btn btn-success complete-turn-btn"
                    completeBtn.onclick = completeTurn

                    // Inserisci il pulsante prima dei controlli di modifica
                    li.insertBefore(completeBtn, actionsDiv)
                } else if (person.completed) {
                    li.classList.add("completed-turn")
                }
            }
        }

        list.appendChild(li)
    })

    // Aggiorna le informazioni sul turno corrente
    if (isGameStarted && people.length > 0) {
        currentPersonEl.textContent = people[currentPersonIndex].name
        turnNumberEl.textContent = currentTurn
    }

    // Verifica se ci sono abbastanza persone per continuare il gioco
    if (isGameStarted && people.length < 2) {
        showNotification("Servono almeno 2 persone per continuare! Aggiungi un'altra persona.")
    }
}

// Modifica il nome di una persona
function editName(index) {
    editingIndex = index
    renderPeopleList()
}

// Salva il nome modificato
function saveName(index, newName) {
    if (newName.trim()) {
        people[index].name = newName.trim()
    }
    editingIndex = -1
    renderPeopleList()
    saveToLocalStorage()
}

// Annulla la modifica
function cancelEdit() {
    editingIndex = -1
    renderPeopleList()
}

// Elimina una persona dalla lista
function deletePerson(index) {
    // Verifica che ci siano almeno 3 persone se siamo in gioco (così ne rimarranno almeno 2)
    if (isGameStarted && people.length <= 2) {
        // Mostra notifica di errore
        showNotification("Servono almeno 2 persone per continuare!")
        playSound("error")
        return
    }

    people.splice(index, 1)

    // Riproduci suono
    playSound("delete")

    // Se non ci sono più persone, torna alla schermata iniziale
    if (people.length === 0) {
        resetAll()
        return
    }

    // Se siamo in gioco, dopo l'eliminazione ricomincia sempre dalla prima persona
    if (isGameStarted) {
        // Aggiusta l'indice corrente se necessario
        if (currentPersonIndex >= people.length) {
            currentPersonIndex = 0
        }

        // Resetta lo stato di completamento per tutte le persone
        people.forEach((person) => (person.completed = false))

        // Mostra notifica
        showNotification("Persona eliminata! Si ricomincia dalla prima persona")
    }

    // Aggiorna la lista e il pulsante di avvio
    renderPeopleList()
    updateStartButton()
    updatePeopleCount()
    saveToLocalStorage()
}

// Sposta una persona nella lista (cambia l'ordine)
function movePerson(index, direction) {
    // Calcola il nuovo indice
    const newIndex = index + direction

    // Verifica che il nuovo indice sia valido
    if (newIndex >= 0 && newIndex < people.length) {
        // Scambia le persone
        const temp = people[index]
        people[index] = people[newIndex]
        people[newIndex] = temp

        // Se siamo in gioco, dopo il riordinamento ricomincia sempre dalla prima persona
        if (isGameStarted) {
            // Resetta il turno alla prima persona
            currentPersonIndex = 0

            // Resetta lo stato di completamento per tutte le persone
            people.forEach((person) => (person.completed = false))

            // Mostra notifica
            showNotification("Ordine aggiornato! Si ricomincia dalla prima persona")
        }

        renderPeopleList()
        saveToLocalStorage()
    }
}

// Mostra una notifica temporanea
function showNotification(message = "Ordine aggiornato! Tocca ora alla prima persona") {
    // Aggiorna il testo della notifica
    notification.querySelector("span").textContent = message

    // Mostra la notifica con animazione
    notification.style.display = "flex"
    notification.classList.add("fadeIn")

    // Rimuovi la notifica dopo un po'
    setTimeout(() => {
        notification.classList.remove("fadeIn")
        setTimeout(() => {
            notification.style.display = "none"
        }, 300)
    }, 2700)
}

// Inizia i turni
function startTurns() {
    if (people.length < 2) {
        errorMessage.classList.remove("hidden")
        playSound("error")
        return
    }

    isGameStarted = true
    inputSection.classList.add("hidden")
    turnSection.classList.remove("hidden")
    renderPeopleList()
    saveToLocalStorage()

    // Riproduci suono
    playSound("start")

    // Mostra notifica
    showNotification(`Turno iniziato! Tocca a ${people[currentPersonIndex].name}`)
}

// Completa il turno corrente e passa al successivo
function completeTurn() {
    // Segna la persona corrente come completata
    people[currentPersonIndex].completed = true

    // Salva il nome della persona corrente
    const currentPersonName = people[currentPersonIndex].name

    // Passa alla persona successiva
    currentPersonIndex++

    // Se abbiamo raggiunto la fine della lista
    if (currentPersonIndex >= people.length) {
        // Controlla se tutti hanno completato il turno
        const allCompleted = people.every((person) => person.completed)

        if (allCompleted) {
            // Inizia un nuovo turno
            currentTurn++
            currentPersonIndex = 0
            // Resetta lo stato di completamento
            people.forEach((person) => (person.completed = false))

            // Mostra notifica per nuovo turno
            showNotification(`Turno ${currentTurn} iniziato! Tocca a ${people[currentPersonIndex].name}`)
        } else {
            // Torna alla prima persona che non ha completato il turno
            currentPersonIndex = people.findIndex((person) => !person.completed)

            // Mostra notifica
            showNotification(`${currentPersonName} ha completato! Tocca a ${people[currentPersonIndex].name}`)
        }
    } else {
        // Mostra notifica
        showNotification(`${currentPersonName} ha completato! Tocca a ${people[currentPersonIndex].name}`)
    }

    renderPeopleList()
    saveToLocalStorage()

    // Riproduci suono
    playSound("complete")

    // Aggiungi effetto di feedback
    const turnInfoContainer = document.querySelector(".turn-info-container")
    turnInfoContainer.classList.add("pulse")
    setTimeout(() => {
        turnInfoContainer.classList.remove("pulse")
    }, 1000)
}

// Resetta al turno 1 mantenendo le stesse persone
function resetToTurnOne() {
    currentTurn = 1
    currentPersonIndex = 0

    // Resetta lo stato di completamento per tutte le persone
    people.forEach((person) => (person.completed = false))

    renderPeopleList()
    saveToLocalStorage()

    // Mostra notifica
    showNotification("Turno resettato! Si ricomincia dal turno 1")
}

// Reset completo - torna alla schermata iniziale
function resetAll() {
    // Resetta tutti i valori
    people = []
    currentTurn = 1
    currentPersonIndex = 0
    editingIndex = -1
    isGameStarted = false

    // Torna alla schermata di inserimento
    turnSection.classList.add("hidden")
    inputSection.classList.remove("hidden")

    // Pulisci la lista delle persone
    peopleList.innerHTML = ""

    // Disabilita il pulsante di avvio
    startBtn.disabled = true
    startBtn.classList.remove("pulse")

    // Pulisci l'input
    nameInput.value = ""
    nameInput.focus()

    // Nascondi il messaggio di errore
    errorMessage.classList.add("hidden")

    // Aggiorna il contatore
    updatePeopleCount()

    // Salva lo stato vuoto
    saveToLocalStorage()
}

// Event listeners
addPersonBtn.addEventListener("click", addPerson)
nameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addPerson()
    }
})
startBtn.addEventListener("click", startTurns)
resetTurnBtn.addEventListener("click", resetToTurnOne)
resetAllBtn.addEventListener("click", resetAll)

// Aggiungi animazioni al caricamento della pagina
document.addEventListener("DOMContentLoaded", () => {
    // Aggiungi classe per animazione di entrata
    setTimeout(() => {
        document.querySelector(".app-container").classList.add("fadeIn")
    }, 100)
})
