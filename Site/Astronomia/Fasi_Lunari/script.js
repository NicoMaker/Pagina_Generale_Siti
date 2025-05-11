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
    const currentAge = document.getElementById("current-age")
    const nextPhase = document.getElementById("next-phase")

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

    // Algoritmo astronomico preciso per calcolare le fasi lunari
    function getMoonPhase(date) {
        // Algoritmo basato sulle formule astronomiche per calcolare la fase lunare
        // Riferimento: "Astronomical Algorithms" di Jean Meeus

        // Converti la data in Julian Day
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours() + date.getMinutes() / 60.0 + date.getSeconds() / 3600.0;

        let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) +
            Math.floor(275 * month / 9) + day + 1721013.5 + hour / 24.0;

        // Calcola il numero di giorni dal 1 gennaio 2000
        const daysSince2000 = jd - 2451545.0;

        // Calcola la posizione media del Sole e della Luna
        const meanSun = (280.46646 + 0.9856474 * daysSince2000) % 360;
        const meanMoon = (218.3164591 + 13.0649924465 * daysSince2000) % 360;

        // Calcola l'elongazione della Luna dal Sole
        const elongation = (meanMoon - meanSun + 360) % 360;

        // Calcola la fase lunare (0 = Luna Nuova, 0.5 = Luna Piena)
        const phase = elongation / 360;

        // Calcola l'illuminazione (0 = nuova, 1 = piena)
        const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;

        // Calcola l'età della Luna nel ciclo lunare (0-29.53 giorni)
        const lunarAge = phase * 29.53;

        // Determina la fase in base alla posizione
        let phaseName;
        if (phase < 0.025 || phase >= 0.975) {
            phaseName = "new";
        } else if (phase < 0.235) {
            phaseName = "waxing-crescent";
        } else if (phase < 0.265) {
            phaseName = "first-quarter";
        } else if (phase < 0.475) {
            phaseName = "waxing-gibbous";
        } else if (phase < 0.525) {
            phaseName = "full";
        } else if (phase < 0.735) {
            phaseName = "waning-gibbous";
        } else if (phase < 0.765) {
            phaseName = "last-quarter";
        } else {
            phaseName = "waning-crescent";
        }

        return {
            phase: phaseName,
            illumination: Math.round(illumination * 100),
            age: lunarAge.toFixed(1),
            position: phase,
            phaseName: phaseNames[phaseName],
        };
    }

    // Calcola la fase lunare per una data specifica
    function getMoonPhaseForDate(date) {
        return getMoonPhase(date);
    }

    // Calcola la fase lunare attuale
    function getCurrentMoonPhase() {
        return getMoonPhaseForDate(today)
    }

    // Calcola la prossima fase principale della luna
    function getNextMainPhase(date) {
        const currentPhase = getMoonPhaseForDate(date);
        const currentPosition = currentPhase.position;

        // Determina la prossima fase principale
        let nextPhasePosition;
        let nextPhaseName;

        if (currentPosition < 0.025) {
            nextPhasePosition = 0.25; // Primo quarto
            nextPhaseName = "first-quarter";
        } else if (currentPosition < 0.25) {
            nextPhasePosition = 0.25; // Primo quarto
            nextPhaseName = "first-quarter";
        } else if (currentPosition < 0.5) {
            nextPhasePosition = 0.5; // Luna piena
            nextPhaseName = "full";
        } else if (currentPosition < 0.75) {
            nextPhasePosition = 0.75; // Ultimo quarto
            nextPhaseName = "last-quarter";
        } else {
            nextPhasePosition = 1.0; // Luna nuova (prossimo ciclo)
            nextPhaseName = "new";
        }

        // Calcola quanti giorni mancano alla prossima fase
        const daysToNextPhase = (nextPhasePosition - currentPosition) * 29.53;
        const daysToNextPhaseRounded = Math.round(daysToNextPhase);

        // Calcola la data della prossima fase
        const nextPhaseDate = new Date(date);
        nextPhaseDate.setDate(date.getDate() + daysToNextPhaseRounded);

        return {
            phase: nextPhaseName,
            phaseName: phaseNames[nextPhaseName],
            date: nextPhaseDate,
            daysUntil: daysToNextPhaseRounded
        };
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

        // Aggiorna l'età della luna
        currentAge.textContent = `Età della Luna: ${moonData.age} giorni`

        // Calcola e mostra la prossima fase principale
        const nextPhaseData = getNextMainPhase(today);
        const nextPhaseDate = nextPhaseData.date.toLocaleDateString("it-IT", {
            day: "numeric",
            month: "long"
        });
        nextPhase.textContent = `Prossima fase principale: ${nextPhaseData.phaseName} (${nextPhaseDate}, tra ${nextPhaseData.daysUntil} giorni)`;

        // Aggiorna l'immagine della luna
        updateMoonImage(moonData.phase, moonData.position)
    }

    // Aggiorna l'immagine della luna in base alla fase
    function updateMoonImage(phase, position) {
        // Rimuovi classi precedenti
        currentMoonImage.className = "moon-image"

        // Calcola l'angolo di illuminazione basato sulla posizione nel ciclo lunare
        const illuminationPercentage = position <= 0.5
            ? position * 2 * 100  // Da 0% a 100% durante la prima metà
            : (1 - position) * 2 * 100;  // Da 100% a 0% durante la seconda metà

        // Determina se la luna è crescente o calante
        const isWaxing = position <= 0.5;

        // Aggiungi la classe CSS per la fase corrente
        switch (phase) {
            case "new":
                currentMoonImage.style.backgroundColor = "#121620"
                currentMoonImage.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.1)"
                break
            case "waxing-crescent":
                const waxingCrescentPercent = Math.round(illuminationPercentage);
                currentMoonImage.style.background = `linear-gradient(90deg, #121620 ${100 - waxingCrescentPercent}%, var(--moon-color) ${100 - waxingCrescentPercent}%)`
                currentMoonImage.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.3)"
                break
            case "first-quarter":
                currentMoonImage.style.background = "linear-gradient(90deg, #121620 50%, var(--moon-color) 50%)"
                currentMoonImage.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.4)"
                break
            case "waxing-gibbous":
                const waxingGibbousPercent = Math.round(illuminationPercentage);
                currentMoonImage.style.background = `linear-gradient(90deg, #121620 ${100 - waxingGibbousPercent}%, var(--moon-color) ${100 - waxingGibbousPercent}%)`
                currentMoonImage.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.5)"
                break
            case "full":
                currentMoonImage.style.backgroundColor = "var(--moon-color)"
                currentMoonImage.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.7)"
                break
            case "waning-gibbous":
                const waningGibbousPercent = Math.round(illuminationPercentage);
                currentMoonImage.style.background = `linear-gradient(270deg, #121620 ${100 - waningGibbousPercent}%, var(--moon-color) ${100 - waningGibbousPercent}%)`
                currentMoonImage.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.5)"
                break
            case "last-quarter":
                currentMoonImage.style.background = "linear-gradient(270deg, #121620 50%, var(--moon-color) 50%)"
                currentMoonImage.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.4)"
                break
            case "waning-crescent":
                const waningCrescentPercent = Math.round(illuminationPercentage);
                currentMoonImage.style.background = `linear-gradient(270deg, #121620 ${100 - waningCrescentPercent}%, var(--moon-color) ${100 - waningCrescentPercent}%)`
                currentMoonImage.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.3)"
                break
        }
    }

    // Crea un indicatore di fase lunare per il calendario mensile
    function createMoonPhaseIndicator(phase, position) {
        const indicator = document.createElement("div")
        indicator.className = "moon-phase-indicator"

        // Calcola l'illuminazione basata sulla posizione
        const illuminationPercentage = position <= 0.5
            ? position * 2 * 100  // Da 0% a 100% durante la prima metà
            : (1 - position) * 2 * 100;  // Da 100% a 0% durante la seconda metà

        // Determina se la luna è crescente o calante
        const isWaxing = position <= 0.5;

        switch (phase) {
            case "new":
                indicator.style.backgroundColor = "#121620"
                indicator.style.border = "1px solid rgba(255, 255, 255, 0.3)"
                break
            case "waxing-crescent":
                const waxingCrescentPercent = Math.round(illuminationPercentage);
                indicator.style.background = `linear-gradient(90deg, #121620 ${100 - waxingCrescentPercent}%, var(--moon-color) ${100 - waxingCrescentPercent}%)`
                break
            case "first-quarter":
                indicator.style.background = "linear-gradient(90deg, #121620 50%, var(--moon-color) 50%)"
                break
            case "waxing-gibbous":
                const waxingGibbousPercent = Math.round(illuminationPercentage);
                indicator.style.background = `linear-gradient(90deg, #121620 ${100 - waxingGibbousPercent}%, var(--moon-color) ${100 - waxingGibbousPercent}%)`
                break
            case "full":
                indicator.style.backgroundColor = "var(--moon-color)"
                indicator.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.5)"
                break
            case "waning-gibbous":
                const waningGibbousPercent = Math.round(illuminationPercentage);
                indicator.style.background = `linear-gradient(270deg, #121620 ${100 - waningGibbousPercent}%, var(--moon-color) ${100 - waningGibbousPercent}%)`
                break
            case "last-quarter":
                indicator.style.background = "linear-gradient(270deg, #121620 50%, var(--moon-color) 50%)"
                break
            case "waning-crescent":
                const waningCrescentPercent = Math.round(illuminationPercentage);
                indicator.style.background = `linear-gradient(270deg, #121620 ${100 - waningCrescentPercent}%, var(--moon-color) ${100 - waningCrescentPercent}%)`
                break
        }

        return indicator
    }

    // Calcola le date esatte delle fasi lunari principali per un anno specifico
    function calculateExactMoonPhasesForYear(year) {
        const phases = {
            new: [],
            "first-quarter": [],
            full: [],
            "last-quarter": []
        };

        // Inizia dal 1° gennaio dell'anno
        let currentDate = new Date(year, 0, 1);
        const endDate = new Date(year + 1, 0, 1);

        // Controlla ogni giorno dell'anno
        while (currentDate < endDate) {
            const moonData = getMoonPhaseForDate(currentDate);
            const phase = moonData.phase;

            // Verifica se è una fase principale
            if (phase === "new" || phase === "first-quarter" || phase === "full" || phase === "last-quarter") {
                // Per maggiore precisione, cerca l'ora esatta della fase
                let bestTime = new Date(currentDate);
                let bestPhaseMatch = moonData.position;

                // Controlla ogni ora del giorno per trovare il momento più preciso
                for (let hour = 0; hour < 24; hour++) {
                    const hourDate = new Date(currentDate);
                    hourDate.setHours(hour);

                    const hourMoonData = getMoonPhaseForDate(hourDate);

                    // Calcola quanto è vicino al punto esatto della fase
                    let phaseMatch;
                    if (phase === "new") phaseMatch = Math.abs(hourMoonData.position - 0);
                    else if (phase === "first-quarter") phaseMatch = Math.abs(hourMoonData.position - 0.25);
                    else if (phase === "full") phaseMatch = Math.abs(hourMoonData.position - 0.5);
                    else if (phase === "last-quarter") phaseMatch = Math.abs(hourMoonData.position - 0.75);

                    if (phaseMatch < bestPhaseMatch) {
                        bestPhaseMatch = phaseMatch;
                        bestTime = new Date(hourDate);
                    }
                }

                phases[phase].push(bestTime);

                // Salta alcuni giorni per evitare di rilevare la stessa fase più volte
                currentDate = new Date(currentDate);
                currentDate.setDate(currentDate.getDate() + 5);
            } else {
                // Passa al giorno successivo
                currentDate = new Date(currentDate);
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        return phases;
    }

    // Calcola tutte le fasi lunari per un anno specifico
    function calculateAllMoonPhasesForYear(year) {
        // Ottieni le fasi principali esatte
        const mainPhases = calculateExactMoonPhasesForYear(year);

        // Aggiungi le fasi intermedie
        const allPhases = {
            new: mainPhases.new,
            "waxing-crescent": [],
            "first-quarter": mainPhases["first-quarter"],
            "waxing-gibbous": [],
            full: mainPhases.full,
            "waning-gibbous": [],
            "last-quarter": mainPhases["last-quarter"],
            "waning-crescent": []
        };

        // Ordina tutte le date delle fasi principali
        const allMainPhaseDates = [
            ...mainPhases.new.map(date => ({ date, phase: "new" })),
            ...mainPhases["first-quarter"].map(date => ({ date, phase: "first-quarter" })),
            ...mainPhases.full.map(date => ({ date, phase: "full" })),
            ...mainPhases["last-quarter"].map(date => ({ date, phase: "last-quarter" }))
        ].sort((a, b) => a.date - b.date);

        // Per ogni coppia di fasi principali consecutive, calcola la fase intermedia
        for (let i = 0; i < allMainPhaseDates.length - 1; i++) {
            const currentPhase = allMainPhaseDates[i];
            const nextPhase = allMainPhaseDates[i + 1];

            // Determina quale fase intermedia calcolare
            let intermediatePhase;
            if (currentPhase.phase === "new" && nextPhase.phase === "first-quarter") {
                intermediatePhase = "waxing-crescent";
            } else if (currentPhase.phase === "first-quarter" && nextPhase.phase === "full") {
                intermediatePhase = "waxing-gibbous";
            } else if (currentPhase.phase === "full" && nextPhase.phase === "last-quarter") {
                intermediatePhase = "waning-gibbous";
            } else if (currentPhase.phase === "last-quarter" && nextPhase.phase === "new") {
                intermediatePhase = "waning-crescent";
            } else {
                // Salta combinazioni non valide
                continue;
            }

            // Calcola la data intermedia
            const midDate = new Date((currentPhase.date.getTime() + nextPhase.date.getTime()) / 2);
            allPhases[intermediatePhase].push(midDate);
        }

        // Gestisci il caso speciale per l'inizio e la fine dell'anno
        if (allMainPhaseDates.length > 0) {
            // Se l'ultima fase dell'anno è "last-quarter", aggiungi una fase "waning-crescent"
            if (allMainPhaseDates[allMainPhaseDates.length - 1].phase === "last-quarter") {
                const lastDate = allMainPhaseDates[allMainPhaseDates.length - 1].date;
                const midDate = new Date(lastDate);
                midDate.setDate(midDate.getDate() + 3); // Circa a metà strada verso la prossima luna nuova
                if (midDate.getFullYear() === year) {
                    allPhases["waning-crescent"].push(midDate);
                }
            }

            // Se la prima fase dell'anno è "new", aggiungi una fase "waning-crescent" all'inizio
            if (allMainPhaseDates[0].phase === "new") {
                const firstDate = allMainPhaseDates[0].date;
                const midDate = new Date(firstDate);
                midDate.setDate(midDate.getDate() - 3); // Circa a metà strada dalla luna calante precedente
                if (midDate.getFullYear() === year) {
                    allPhases["waning-crescent"].unshift(midDate);
                }
            }
        }

        return allPhases;
    }

    // Calcola le fasi lunari per un mese specifico
    function calculateMoonPhasesForMonth(year, month) {
        // Ottieni tutte le fasi lunari per l'anno
        const yearPhases = calculateAllMoonPhasesForYear(year);

        // Filtra le fasi per il mese specifico
        const monthPhases = {}

        for (const phase in yearPhases) {
            monthPhases[phase] = yearPhases[phase].filter((date) => date.getMonth() === month)
        }

        return monthPhases
    }

    // Visualizza le date delle fasi lunari nel calendario annuale
    function displayMoonPhasesForYear(year) {
        const phases = calculateAllMoonPhasesForYear(year);

        // Aggiorna ogni sezione di fase
        for (const phase in phases) {
            const elementId = phaseIdsMap[phase]
            const datesContainer = document.getElementById(elementId)

            if (!datesContainer) {
                console.error(`Elemento con ID ${elementId} non trovato`)
                continue
            }

            datesContainer.innerHTML = ""
            datesContainer.setAttribute("data-year", year)

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
                        year: "numeric",
                    })

                    dateItem.textContent = formattedDate
                    datesContainer.appendChild(dateItem)
                }
            })
        }
    }

    // Inizializza lo stato dell'applicazione
    function initializeApp() {
        displayCurrentMoonPhase()
        displayMoonPhasesForYear(selectedYear)
    }

    // Gestione degli eventi per la navigazione annuale
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

    // Funzioni per la gestione del calendario mensile
    function updateMonthDisplay() {
        currentMonthEl.textContent = monthNames[selectedMonth]
        currentMonthYearEl.textContent = `${monthNames[selectedMonth]} ${selectedYear}`
    }

    function generateMonthlyCalendar(year, month) {
        calendarGrid.innerHTML = "" // Pulisci il calendario esistente

        const firstDayOfMonth = new Date(year, month, 1)
        const lastDayOfMonth = new Date(year, month + 1, 0)
        const daysInMonth = lastDayOfMonth.getDate()
        const startingDay = firstDayOfMonth.getDay() // 0 (Domenica) - 6 (Sabato)

        // Calcola le fasi lunari per il mese
        const moonPhases = calculateMoonPhasesForMonth(year, month)

        // Aggiungi celle vuote all'inizio per allineare il primo giorno
        for (let i = 0; i < startingDay; i++) {
            const emptyCell = document.createElement("div")
            emptyCell.classList.add("calendar-day", "empty")
            calendarGrid.appendChild(emptyCell)
        }

        // Popola il calendario con i giorni del mese
        for (let day = 1; day <= daysInMonth; day++) {
            const calendarDay = document.createElement("div")
            calendarDay.classList.add("calendar-day")
            calendarDay.textContent = day

            const currentDate = new Date(year, month, day)
            const moonPhaseToday = getMoonPhaseForDate(currentDate)

            // Aggiungi l'indicatore di fase lunare
            const moonIndicator = createMoonPhaseIndicator(moonPhaseToday.phase, moonPhaseToday.position)
            calendarDay.appendChild(moonIndicator)

            calendarGrid.appendChild(calendarDay)
        }
    }

    // Gestione degli eventi per la navigazione mensile
    prevMonthBtn.addEventListener("click", () => {
        selectedMonth--
        if (selectedMonth < 0) {
            selectedMonth = 11
            selectedYear--
            currentYearEl.textContent = selectedYear
            displayMoonPhasesForYear(selectedYear)
        }
        updateMonthDisplay()
        generateMonthlyCalendar(selectedYear, selectedMonth)
    })

    nextMonthBtn.addEventListener("click", () => {
        selectedMonth++
        if (selectedMonth > 11) {
            selectedMonth = 0
            selectedYear++
            currentYearEl.textContent = selectedYear
            displayMoonPhasesForYear(selectedYear)
        }
        updateMonthDisplay()
        generateMonthlyCalendar(selectedYear, selectedMonth)
    })

    // Inizializza l'applicazione
    initializeApp()
})
