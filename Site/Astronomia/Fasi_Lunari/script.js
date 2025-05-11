document.addEventListener("DOMContentLoaded", () => {
    // Elementi DOM
    const currentDateEl = document.getElementById("current-date")
    const currentYearEl = document.getElementById("current-year")
    const prevYearBtn = document.getElementById("prev-year")
    const nextYearBtn = document.getElementById("next-year")
    const currentMoonImage = document.getElementById("current-moon-image")
    const currentPhaseName = document.getElementById("current-phase-name")
    const currentPhaseDescription = document.getElementById("current-phase-description")
    const currentIllumination = document.getElementById("current-illumination")

    // Elementi per il calendario mensile
    const currentMonthEl = document.getElementById("current-month")
    const currentMonthYearEl = document.getElementById("current-month-year")
    const prevMonthBtn = document.getElementById("prev-month")
    const nextMonthBtn = document.getElementById("next-month")
    const calendarGrid = document.getElementById("calendar-grid")

    // Elementi per la navigazione tra le viste
    const navButtons = document.querySelectorAll(".nav-btn")
    const viewSections = document.querySelectorAll(".view-section")

    // Elementi per il menu hamburger
    const hamburgerMenu = document.getElementById("hamburger-menu")
    const mainNav = document.getElementById("main-nav")

    // Gestione del menu hamburger
    hamburgerMenu.addEventListener("click", function () {
        this.classList.toggle("active")
        mainNav.classList.toggle("active")
    })

    // Chiudi il menu quando si clicca su un pulsante di navigazione
    navButtons.forEach((button) => {
        button.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                hamburgerMenu.classList.remove("active")
                mainNav.classList.remove("active")
            }
        })
    })

    // Fase lunare attuale
    const today = new Date()
    const formattedDate = today.toLocaleDateString("it-IT", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })
    currentDateEl.textContent = formattedDate

    // Anno e mese correnti per i calendari
    let selectedYear = today.getFullYear()
    let selectedMonth = today.getMonth()

    // Nomi dei mesi in italiano
    const monthNames = [
        "Gennaio",
        "Febbraio",
        "Marzo",
        "Aprile",
        "Maggio",
        "Giugno",
        "Luglio",
        "Agosto",
        "Settembre",
        "Ottobre",
        "Novembre",
        "Dicembre",
    ]

    // Aggiorna gli elementi di visualizzazione dell'anno e del mese
    currentYearEl.textContent = selectedYear
    updateMonthDisplay()

    // Descrizioni delle fasi lunari in italiano
    const phaseDescriptions = {
        new: "La Luna si trova tra la Terra e il Sole, con il lato non illuminato rivolto verso la Terra. La Luna non è visibile dal nostro pianeta.",
        "waxing-crescent":
            "Una piccola parte della Luna diventa visibile. La Luna appare come una sottile falce crescente.",
        "first-quarter":
            "Metà della Luna è visibile dalla Terra. Il lato destro della Luna è illuminato nell'emisfero nord.",
        "waxing-gibbous": "Più della metà della Luna è visibile e continua a crescere verso la Luna piena.",
        full: "La Luna è completamente illuminata vista dalla Terra, poiché si trova sul lato opposto della Terra rispetto al Sole.",
        "waning-gibbous": "La Luna inizia a diminuire la sua illuminazione, ma più della metà è ancora visibile.",
        "last-quarter":
            "Metà della Luna è visibile dalla Terra. Il lato sinistro della Luna è illuminato nell'emisfero nord.",
        "waning-crescent":
            "Solo una piccola parte della Luna è visibile, che diminuisce fino a diventare nuovamente Luna nuova.",
    }

    // Nomi delle fasi in italiano
    const phaseNames = {
        new: "Luna Nuova",
        "waxing-crescent": "Luna Crescente",
        "first-quarter": "Primo Quarto",
        "waxing-gibbous": "Gibbosa Crescente",
        full: "Luna Piena",
        "waning-gibbous": "Gibbosa Calante",
        "last-quarter": "Ultimo Quarto",
        "waning-crescent": "Luna Calante",
    }

    // Mappa degli ID per le date delle fasi
    const phaseIdsMap = {
        new: "new-moon-dates",
        "waxing-crescent": "waxing-crescent-dates",
        "first-quarter": "first-quarter-dates",
        "waxing-gibbous": "waxing-gibbous-dates",
        full: "full-moon-dates",
        "waning-gibbous": "waning-gibbous-dates",
        "last-quarter": "last-quarter-dates",
        "waning-crescent": "waning-crescent-dates",
    }

    // Gestione della navigazione tra le viste
    navButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const viewToShow = this.getAttribute("data-view")

            // Rimuovi la classe active da tutti i pulsanti e aggiungi al pulsante cliccato
            navButtons.forEach((btn) => btn.classList.remove("active"))
            this.classList.add("active")

            // Nascondi tutte le sezioni e mostra quella selezionata
            viewSections.forEach((section) => section.classList.remove("active"))
            document.getElementById(`${viewToShow}-view`).classList.add("active")

            // Se è stata selezionata la vista mensile, aggiorna il calendario
            if (viewToShow === "monthly") {
                generateMonthlyCalendar(selectedYear, selectedMonth)
            }
        })
    })

    // Calcola la fase lunare per una data specifica
    function getMoonPhaseForDate(date) {
        // Algoritmo semplificato per calcolare la fase lunare
        // Basato sul ciclo lunare di 29.53 giorni
        const lunarCycle = 29.53 // Durata media del ciclo lunare in giorni

        // Data di riferimento di una Luna Nuova conosciuta (1 gennaio 2000)
        const refDate = new Date(2000, 0, 6, 18, 14)

        // Calcola il numero di giorni trascorsi dalla data di riferimento
        const daysSinceRef = (date - refDate) / (24 * 60 * 60 * 1000)

        // Calcola la posizione nel ciclo lunare (da 0 a 1)
        const position = (daysSinceRef % lunarCycle) / lunarCycle

        // Calcola l'illuminazione (0 = nuova, 0.5 = piena/nuova, 1 = nuova)
        let illumination
        if (position <= 0.5) {
            illumination = position * 2 // Da 0 a 1 durante la prima metà
        } else {
            illumination = (1 - position) * 2 // Da 1 a 0 durante la seconda metà
        }

        // Determina la fase in base alla posizione
        let phase
        if (position < 0.03 || position >= 0.97) {
            phase = "new"
        } else if (position < 0.22) {
            phase = "waxing-crescent"
        } else if (position < 0.28) {
            phase = "first-quarter"
        } else if (position < 0.47) {
            phase = "waxing-gibbous"
        } else if (position < 0.53) {
            phase = "full"
        } else if (position < 0.72) {
            phase = "waning-gibbous"
        } else if (position < 0.78) {
            phase = "last-quarter"
        } else {
            phase = "waning-crescent"
        }

        return {
            phase: phase,
            illumination: Math.round(Math.abs(0.5 - position) * 200), // Percentuale di illuminazione
            position: position,
            phaseName: phaseNames[phase],
        }
    }

    // Calcola la fase lunare attuale
    function getCurrentMoonPhase() {
        return getMoonPhaseForDate(today)
    }

    // Visualizza la fase lunare attuale
    function displayCurrentMoonPhase() {
        const moonData = getCurrentMoonPhase()

        // Aggiorna il nome della fase
        currentPhaseName.textContent = phaseNames[moonData.phase]

        // Aggiorna la descrizione
        currentPhaseDescription.textContent = phaseDescriptions[moonData.phase]

        // Aggiorna l'illuminazione
        currentIllumination.textContent = `Illuminazione: ${moonData.illumination}%`

        // Aggiorna l'immagine della luna
        updateMoonImage(moonData.phase, moonData.position)
    }

    // Aggiorna l'immagine della luna in base alla fase
    function updateMoonImage(phase, position) {
        // Rimuovi classi precedenti
        currentMoonImage.className = "moon-image"

        // Aggiungi la classe CSS per la fase corrente
        switch (phase) {
            case "new":
                currentMoonImage.style.backgroundColor = "#121620"
                currentMoonImage.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.1)"
                break
            case "waxing-crescent":
                currentMoonImage.style.background = "linear-gradient(90deg, #121620 70%, var(--moon-color) 70%)"
                currentMoonImage.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.3)"
                break
            case "first-quarter":
                currentMoonImage.style.background = "linear-gradient(90deg, #121620 50%, var(--moon-color) 50%)"
                currentMoonImage.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.4)"
                break
            case "waxing-gibbous":
                currentMoonImage.style.background = "linear-gradient(90deg, #121620 30%, var(--moon-color) 30%)"
                currentMoonImage.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.5)"
                break
            case "full":
                currentMoonImage.style.backgroundColor = "var(--moon-color)"
                currentMoonImage.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.7)"
                break
            case "waning-gibbous":
                currentMoonImage.style.background = "linear-gradient(270deg, #121620 30%, var(--moon-color) 30%)"
                currentMoonImage.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.5)"
                break
            case "last-quarter":
                currentMoonImage.style.background = "linear-gradient(270deg, #121620 50%, var(--moon-color) 50%)"
                currentMoonImage.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.4)"
                break
            case "waning-crescent":
                currentMoonImage.style.background = "linear-gradient(270deg, #121620 70%, var(--moon-color) 70%)"
                currentMoonImage.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.3)"
                break
        }
    }

    // Crea un indicatore di fase lunare per il calendario mensile
    function createMoonPhaseIndicator(phase) {
        const indicator = document.createElement("div")
        indicator.className = "moon-phase-indicator"

        switch (phase) {
            case "new":
                indicator.style.backgroundColor = "#121620"
                indicator.style.border = "1px solid rgba(255, 255, 255, 0.3)"
                break
            case "waxing-crescent":
                indicator.style.background = "linear-gradient(90deg, #121620 70%, var(--moon-color) 70%)"
                break
            case "first-quarter":
                indicator.style.background = "linear-gradient(90deg, #121620 50%, var(--moon-color) 50%)"
                break
            case "waxing-gibbous":
                indicator.style.background = "linear-gradient(90deg, #121620 30%, var(--moon-color) 30%)"
                break
            case "full":
                indicator.style.backgroundColor = "var(--moon-color)"
                indicator.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.5)"
                break
            case "waning-gibbous":
                indicator.style.background = "linear-gradient(270deg, #121620 30%, var(--moon-color) 30%)"
                break
            case "last-quarter":
                indicator.style.background = "linear-gradient(270deg, #121620 50%, var(--moon-color) 50%)"
                break
            case "waning-crescent":
                indicator.style.background = "linear-gradient(270deg, #121620 70%, var(--moon-color) 70%)"
                break
        }

        return indicator
    }

    // Calcola le date delle fasi lunari per un anno specifico
    function calculateMoonPhasesForYear(year) {
        const phases = {
            new: [],
            "waxing-crescent": [],
            "first-quarter": [],
            "waxing-gibbous": [],
            full: [],
            "waning-gibbous": [],
            "last-quarter": [],
            "waning-crescent": [],
        }

        // Data di riferimento di una Luna Nuova conosciuta
        const refDate = new Date(2000, 0, 6, 18, 14)
        const lunarCycle = 29.53 // Durata media del ciclo lunare in giorni

        // Calcola il numero di cicli lunari dal riferimento all'inizio dell'anno
        const startOfYear = new Date(year, 0, 1)
        const daysSinceRef = (startOfYear - refDate) / (24 * 60 * 60 * 1000)
        const cyclesSinceRef = daysSinceRef / lunarCycle

        // Trova la prima luna nuova dell'anno
        const cyclesAtStartOfYear = Math.floor(cyclesSinceRef)
        const firstNewMoonOfYear = new Date(refDate.getTime() + cyclesAtStartOfYear * lunarCycle * 24 * 60 * 60 * 1000)

        // Genera le date per ogni fase lunare durante l'anno
        let currentDate = new Date(firstNewMoonOfYear)

        while (currentDate.getFullYear() <= year) {
            if (currentDate.getFullYear() === year) {
                // Luna Nuova
                phases["new"].push(new Date(currentDate))

                // Altre fasi
                phases["waxing-crescent"].push(new Date(currentDate.getTime() + lunarCycle * 0.125 * 24 * 60 * 60 * 1000))
                phases["first-quarter"].push(new Date(currentDate.getTime() + lunarCycle * 0.25 * 24 * 60 * 60 * 1000))
                phases["waxing-gibbous"].push(new Date(currentDate.getTime() + lunarCycle * 0.375 * 24 * 60 * 60 * 1000))
                phases["full"].push(new Date(currentDate.getTime() + lunarCycle * 0.5 * 24 * 60 * 60 * 1000))
                phases["waning-gibbous"].push(new Date(currentDate.getTime() + lunarCycle * 0.625 * 24 * 60 * 60 * 1000))
                phases["last-quarter"].push(new Date(currentDate.getTime() + lunarCycle * 0.75 * 24 * 60 * 60 * 1000))
                phases["waning-crescent"].push(new Date(currentDate.getTime() + lunarCycle * 0.875 * 24 * 60 * 60 * 1000))
            }

            // Passa al ciclo lunare successivo
            currentDate = new Date(currentDate.getTime() + lunarCycle * 24 * 60 * 60 * 1000)
        }

        return phases
    }

    // Calcola le date delle fasi lunari per un mese specifico
    function calculateMoonPhasesForMonth(year, month) {
        // Ottieni tutte le fasi lunari per l'anno
        const yearPhases = calculateMoonPhasesForYear(year)

        // Filtra le fasi per il mese specifico
        const monthPhases = {}

        for (const phase in yearPhases) {
            monthPhases[phase] = yearPhases[phase].filter((date) => date.getMonth() === month)
        }

        return monthPhases
    }

    // Visualizza le date delle fasi lunari nel calendario annuale
    function displayMoonPhasesForYear(year) {
        const phases = calculateMoonPhasesForYear(year)

        // Aggiorna ogni sezione di fase
        for (const phase in phases) {
            const elementId = phaseIdsMap[phase]
            const datesContainer = document.getElementById(elementId)

            if (!datesContainer) {
                console.error(`Elemento con ID ${elementId} non trovato`)
                continue
            }

            datesContainer.innerHTML = ""

            if (phases[phase].length === 0) {
                datesContainer.innerHTML = '<div class="loading">Nessuna data disponibile</div>'
                continue
            }

            phases[phase].forEach((date) => {
                if (date.getFullYear() === year) {
                    const dateItem = document.createElement("div")
                    dateItem.className = "date-item"

                    // Formato data più dettagliato
                    const formattedDate = date.toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "long",
                    })

                    const formattedTime = date.toLocaleTimeString("it-IT", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })

                    dateItem.innerHTML = `<strong>${formattedDate}</strong> - ${formattedTime}`

                    // Evidenzia la data se è oggi
                    const isToday =
                        date.getDate() === today.getDate() &&
                        date.getMonth() === today.getMonth() &&
                        date.getFullYear() === today.getFullYear()

                    if (isToday) {
                        dateItem.classList.add("today")
                    }

                    datesContainer.appendChild(dateItem)
                }
            })
        }
    }

    // Genera il calendario mensile
    function generateMonthlyCalendar(year, month) {
        // Svuota il contenitore del calendario
        calendarGrid.innerHTML = ""

        // Ottieni il primo giorno del mese
        const firstDayOfMonth = new Date(year, month, 1)

        // Ottieni l'ultimo giorno del mese
        const lastDayOfMonth = new Date(year, month + 1, 0)

        // Ottieni il giorno della settimana del primo giorno (0 = Domenica, 1 = Lunedì, ecc.)
        let firstDayWeekday = firstDayOfMonth.getDay()
        // Converti da 0-6 (Dom-Sab) a 1-7 (Lun-Dom)
        firstDayWeekday = firstDayWeekday === 0 ? 7 : firstDayWeekday

        // Calcola quanti giorni del mese precedente mostrare
        const daysFromPrevMonth = firstDayWeekday - 1

        // Ottieni l'ultimo giorno del mese precedente
        const lastDayOfPrevMonth = new Date(year, month, 0)

        // Calcola le fasi lunari per questo mese
        const monthPhases = calculateMoonPhasesForMonth(year, month)

        // Crea un oggetto per mappare le date alle fasi lunari
        const datesToPhases = {}

        // Aggiungi le fasi principali (Luna Nuova, Primo Quarto, Luna Piena, Ultimo Quarto)
        for (const phase of ["new", "first-quarter", "full", "last-quarter"]) {
            monthPhases[phase].forEach((date) => {
                const dateKey = date.getDate()
                if (!datesToPhases[dateKey]) {
                    datesToPhases[dateKey] = []
                }
                datesToPhases[dateKey].push({
                    phase: phase,
                    date: date,
                    phaseName: phaseNames[phase],
                })
            })
        }

        // Aggiungi i giorni del mese precedente
        for (let i = 0; i < daysFromPrevMonth; i++) {
            const dayNumber = lastDayOfPrevMonth.getDate() - daysFromPrevMonth + i + 1
            const dayDate = new Date(year, month - 1, dayNumber)

            const dayCell = document.createElement("div")
            dayCell.className = "calendar-day other-month"

            const dayNumberEl = document.createElement("div")
            dayNumberEl.className = "day-number"
            dayNumberEl.textContent = dayNumber

            dayCell.appendChild(dayNumberEl)

            // Controlla se questo giorno ha una fase lunare principale
            const moonPhase = getMoonPhaseForDate(dayDate)
            if (["new", "first-quarter", "full", "last-quarter"].includes(moonPhase.phase)) {
                const indicator = createMoonPhaseIndicator(moonPhase.phase)
                dayCell.appendChild(indicator)

                const phaseName = document.createElement("div")
                phaseName.className = "moon-phase-name"
                phaseName.textContent = moonPhase.phaseName
                dayCell.appendChild(phaseName)
            }

            calendarGrid.appendChild(dayCell)
        }

        // Aggiungi i giorni del mese corrente
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const dayDate = new Date(year, month, i)

            const dayCell = document.createElement("div")
            dayCell.className = "calendar-day"

            // Controlla se è oggi
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayCell.classList.add("today")
            }

            const dayNumberEl = document.createElement("div")
            dayNumberEl.className = "day-number"
            dayNumberEl.textContent = i

            dayCell.appendChild(dayNumberEl)

            // Controlla se questo giorno ha una fase lunare principale
            if (datesToPhases[i]) {
                datesToPhases[i].forEach((phaseInfo) => {
                    const indicator = createMoonPhaseIndicator(phaseInfo.phase)
                    dayCell.appendChild(indicator)

                    const phaseName = document.createElement("div")
                    phaseName.className = "moon-phase-name"
                    phaseName.textContent = phaseInfo.phaseName
                    dayCell.appendChild(phaseName)
                })
            } else {
                // Se non è una fase principale, controlla comunque la fase
                const moonPhase = getMoonPhaseForDate(dayDate)
                if (["new", "first-quarter", "full", "last-quarter"].includes(moonPhase.phase)) {
                    const indicator = createMoonPhaseIndicator(moonPhase.phase)
                    dayCell.appendChild(indicator)

                    const phaseName = document.createElement("div")
                    phaseName.className = "moon-phase-name"
                    phaseName.textContent = moonPhase.phaseName
                    dayCell.appendChild(phaseName)
                }
            }

            calendarGrid.appendChild(dayCell)
        }

        // Calcola quante celle aggiungere per completare la griglia (fino a 42 celle totali = 6 righe)
        const totalCells = daysFromPrevMonth + lastDayOfMonth.getDate()
        const remainingCells = 42 - totalCells

        // Aggiungi i giorni del mese successivo
        for (let i = 1; i <= remainingCells; i++) {
            const dayDate = new Date(year, month + 1, i)

            const dayCell = document.createElement("div")
            dayCell.className = "calendar-day other-month"

            const dayNumberEl = document.createElement("div")
            dayNumberEl.className = "day-number"
            dayNumberEl.textContent = i

            dayCell.appendChild(dayNumberEl)

            // Controlla se questo giorno ha una fase lunare principale
            const moonPhase = getMoonPhaseForDate(dayDate)
            if (["new", "first-quarter", "full", "last-quarter"].includes(moonPhase.phase)) {
                const indicator = createMoonPhaseIndicator(moonPhase.phase)
                dayCell.appendChild(indicator)

                const phaseName = document.createElement("div")
                phaseName.className = "moon-phase-name"
                phaseName.textContent = moonPhase.phaseName
                dayCell.appendChild(phaseName)
            }

            calendarGrid.appendChild(dayCell)
        }
    }

    // Aggiorna la visualizzazione del mese
    function updateMonthDisplay() {
        currentMonthEl.textContent = monthNames[selectedMonth]
        currentMonthYearEl.textContent = selectedYear
    }

    // Gestione dei pulsanti per cambiare anno
    prevYearBtn.addEventListener("click", () => {
        selectedYear--
        currentYearEl.textContent = selectedYear
        displayMoonPhasesForYear(selectedYear)
    })

    nextYearBtn.addEventListener("click", () => {
        selectedYear++
        currentYearEl.textContent = selectedYear
        displayMoonPhasesForYear(selectedYear)
    })

    // Gestione dei pulsanti per cambiare mese
    prevMonthBtn.addEventListener("click", () => {
        selectedMonth--
        if (selectedMonth < 0) {
            selectedMonth = 11
            selectedYear--
        }
        updateMonthDisplay()
        generateMonthlyCalendar(selectedYear, selectedMonth)
    })

    nextMonthBtn.addEventListener("click", () => {
        selectedMonth++
        if (selectedMonth > 11) {
            selectedMonth = 0
            selectedYear++
        }
        updateMonthDisplay()
        generateMonthlyCalendar(selectedYear, selectedMonth)
    })

    // Inizializza l'app
    displayCurrentMoonPhase()
    displayMoonPhasesForYear(selectedYear)
    generateMonthlyCalendar(selectedYear, selectedMonth)
})
