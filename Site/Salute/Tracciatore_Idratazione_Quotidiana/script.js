document.addEventListener("DOMContentLoaded", () => {
    // Elementi DOM
    const goalValue = document.getElementById("goal-value")
    const goalDisplay = document.getElementById("goal-display")
    const currentValue = document.getElementById("current-value")
    const percentageDisplay = document.getElementById("percentage")
    const percentageCircle = document.getElementById("percentage-circle")
    const waterLevel = document.getElementById("water-level")
    const increaseGoalBtn = document.getElementById("increase-goal")
    const decreaseGoalBtn = document.getElementById("decrease-goal")
    const waterButtons = document.querySelectorAll(".water-btn")
    const customAmountInput = document.getElementById("custom-amount")
    const addCustomBtn = document.getElementById("add-custom")
    const resetBtn = document.getElementById("reset-btn")
    const dailyTip = document.getElementById("daily-tip")
    const newTipBtn = document.getElementById("new-tip")
    const completionBadge = document.getElementById("completion-badge")
    const confettiContainer = document.getElementById("confetti-container")

    // Elementi Modal
    const resetModal = document.getElementById("reset-modal")
    const closeModalBtn = document.getElementById("close-modal")
    const cancelResetBtn = document.getElementById("cancel-reset")
    const confirmResetBtn = document.getElementById("confirm-reset")
    const successModal = document.getElementById("success-modal")
    const closeSuccessModalBtn = document.getElementById("close-success-modal")
    const closeSuccessBtn = document.getElementById("close-success-btn")

    // Variabili di stato
    let goal = 3000 // ml
    let current = 0 // ml
    let goalReached = false
    let goalReachedAnimationShown = false
    let waterHistory = {} // Storico dell'acqua per data

    // Carica i dati salvati se disponibili
    loadData()

    // Aggiorna l'interfaccia
    updateUI()

    // Mostra un consiglio casuale
    showRandomTip()

    // Event listeners
    increaseGoalBtn.addEventListener("click", () => {
        goal += 100
        updateUI()
        saveData()

        // Aggiungi animazione al pulsante
        increaseGoalBtn.classList.add("pulse")
        setTimeout(() => {
            increaseGoalBtn.classList.remove("pulse")
        }, 300)
    })

    decreaseGoalBtn.addEventListener("click", () => {
        if (goal > 100) {
            goal -= 100
            updateUI()
            saveData()

            // Aggiungi animazione al pulsante
            decreaseGoalBtn.classList.add("pulse")
            setTimeout(() => {
                decreaseGoalBtn.classList.remove("pulse")
            }, 300)
        }
    })

    waterButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const amount = Number.parseInt(this.dataset.ml)
            addWater(amount)

            // Aggiungi animazione al pulsante
            this.classList.add("pulse")
            setTimeout(() => {
                this.classList.remove("pulse")
            }, 300)
        })
    })

    addCustomBtn.addEventListener("click", () => {
        const amount = Number.parseInt(customAmountInput.value)
        if (amount && amount > 0) {
            addWater(amount)
            customAmountInput.value = ""

            // Aggiungi animazione al pulsante
            addCustomBtn.classList.add("pulse")
            setTimeout(() => {
                addCustomBtn.classList.remove("pulse")
            }, 300)
        }
    })

    // Consenti di premere Invio nell'input personalizzato
    customAmountInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const amount = Number.parseInt(customAmountInput.value)
            if (amount && amount > 0) {
                addWater(amount)
                customAmountInput.value = ""

                // Aggiungi animazione al pulsante
                addCustomBtn.classList.add("pulse")
                setTimeout(() => {
                    addCustomBtn.classList.remove("pulse")
                }, 300)
            }
        }
    })

    resetBtn.addEventListener("click", () => {
        // Mostra il modal di conferma invece di usare confirm()
        showModal(resetModal)

        // Aggiungi animazione di shake al pulsante
        resetBtn.classList.add("shake")
        setTimeout(() => {
            resetBtn.classList.remove("shake")
        }, 500)
    })

    // Event listeners per i modal
    closeModalBtn.addEventListener("click", () => {
        hideModal(resetModal)
    })

    cancelResetBtn.addEventListener("click", () => {
        hideModal(resetModal)
    })

    confirmResetBtn.addEventListener("click", () => {
        current = 0
        updateUI()
        saveData()
        hideModal(resetModal)

        // Rimuovi il badge di completamento
        completionBadge.classList.remove("show")
        goalReached = false
        goalReachedAnimationShown = false
    })

    closeSuccessModalBtn.addEventListener("click", () => {
        hideModal(successModal)
    })

    closeSuccessBtn.addEventListener("click", () => {
        hideModal(successModal)
    })

    newTipBtn.addEventListener("click", () => {
        showRandomTip()

        // Aggiungi animazione al pulsante
        newTipBtn.classList.add("pulse")
        setTimeout(() => {
            newTipBtn.classList.remove("pulse")
        }, 300)
    })

    // Funzioni
    function addWater(amount) {
        const previousPercentage = Math.min(Math.round((current / goal) * 100), 100)
        current += amount
        updateUI()
        saveData()

        // Aggiungi classe di animazione al bicchiere d'acqua
        const waterGlass = document.querySelector(".water-glass")
        waterGlass.classList.add("water-added")
        setTimeout(() => {
            waterGlass.classList.remove("water-added")
        }, 500)

        // Controlla se l'obiettivo è stato raggiunto
        const newPercentage = Math.min(Math.round((current / goal) * 100), 100)

        // Se abbiamo appena raggiunto il 100% (e non l'avevamo già raggiunto prima)
        if (newPercentage >= 100 && previousPercentage < 100 && !goalReachedAnimationShown) {
            goalReached = true
            goalReachedAnimationShown = true

            // Mostra il badge di completamento
            completionBadge.classList.add("show")

            // Aggiungi animazione al bicchiere
            waterGlass.classList.add("goal-reached")
            setTimeout(() => {
                waterGlass.classList.remove("goal-reached")
            }, 1000)

            // Crea effetto confetti
            createConfetti()

            // Crea effetto sparkle intorno al bicchiere
            createSparkles()

            // Crea effetto overflow
            createOverflow()

            // Mostra il modal di congratulazioni
            setTimeout(() => {
                showModal(successModal)
            }, 1000)
        }
    }

    function updateUI() {
        goalValue.textContent = goal
        goalDisplay.textContent = goal
        currentValue.textContent = current

        const percentage = Math.min(Math.round((current / goal) * 100), 100)
        percentageDisplay.textContent = `${percentage}%`
        waterLevel.style.height = `${percentage}%`

        // Aggiorna il cerchio percentuale SVG
        percentageCircle.setAttribute("stroke-dasharray", `${percentage}, 100`)

        // Cambia colore in base alla percentuale
        if (percentage < 25) {
            waterLevel.style.background = "linear-gradient(180deg, var(--primary-light) 0%, var(--danger) 100%)"
            percentageCircle.style.stroke = "var(--danger)"
        } else if (percentage < 50) {
            waterLevel.style.background = "linear-gradient(180deg, var(--primary-light) 0%, var(--warning) 100%)"
            percentageCircle.style.stroke = "var(--warning)"
        } else if (percentage < 75) {
            waterLevel.style.background = "linear-gradient(180deg, var(--primary-light) 0%, var(--primary) 100%)"
            percentageCircle.style.stroke = "var(--primary)"
        } else {
            waterLevel.style.background = "linear-gradient(180deg, var(--primary-light) 0%, var(--success) 100%)"
            percentageCircle.style.stroke = "var(--success)"
        }

        // Mostra il badge di completamento se l'obiettivo è stato raggiunto
        if (percentage >= 100 && !completionBadge.classList.contains("show")) {
            completionBadge.classList.add("show")
            goalReached = true
        } else if (percentage < 100) {
            completionBadge.classList.remove("show")
            goalReached = false
            goalReachedAnimationShown = false
        }
    }

    function saveData() {
        const currentDate = new Date().toDateString()

        // Salva i dati per la data corrente
        waterHistory[currentDate] = {
            goal: goal,
            current: current
        }

        // Salva lo storico completo
        localStorage.setItem("waterHistory", JSON.stringify(waterHistory))
        localStorage.setItem("waterDate", currentDate)
    }

    function loadData() {
        const savedDate = localStorage.getItem("waterDate")
        const currentDate = new Date().toDateString()

        // Carica lo storico completo
        const savedHistory = localStorage.getItem("waterHistory")
        if (savedHistory) {
            waterHistory = JSON.parse(savedHistory)
        }

        // Se abbiamo dati per oggi, caricali
        if (waterHistory[currentDate]) {
            goal = waterHistory[currentDate].goal
            current = waterHistory[currentDate].current
        }
        // Se non abbiamo dati per oggi ma abbiamo dati per ieri, copia l'obiettivo ma azzera il consumo
        else if (savedDate && savedDate !== currentDate) {
            // Usa l'ultimo obiettivo impostato
            if (waterHistory[savedDate]) {
                goal = waterHistory[savedDate].goal
            }

            // Inizializza i dati per oggi
            waterHistory[currentDate] = {
                goal: goal,
                current: 0
            }

            current = 0
        }

        // Salva i dati aggiornati
        saveData()
    }

    function showRandomTip() {
        const tips = [
            "Bevi un bicchiere d'acqua appena sveglio per riattivare il metabolismo.",
            "L'acqua aiuta a mantenere la pelle idratata e luminosa.",
            "Bere acqua prima dei pasti può aiutare a controllare l'appetito.",
            "Porta sempre con te una bottiglia d'acqua riutilizzabile.",
            "Aggiungi fette di limone, cetriolo o menta all'acqua per darle sapore senza calorie.",
            "Imposta dei promemoria sul telefono per ricordarti di bere regolarmente.",
            "Bevi più acqua quando fai attività fisica o quando fa caldo.",
            "La disidratazione può causare mal di testa e affaticamento.",
            "Bere acqua aiuta a mantenere le articolazioni lubrificate.",
            "L'acqua aiuta il corpo a eliminare le tossine attraverso urina e sudore.",
            "L'acqua fredda può aumentare leggermente il metabolismo.",
            "Cerca di bere un bicchiere d'acqua ogni ora durante la giornata lavorativa.",
            "Il tè e le tisane non zuccherate contribuiscono all'idratazione quotidiana.",
            "Molti alimenti come frutta e verdura contengono acqua che contribuisce all'idratazione.",
            "Bere acqua può aiutare a prevenire i calcoli renali.",
        ]

        // Ottieni il consiglio attuale per evitare di mostrare lo stesso due volte
        const currentTipText = dailyTip.textContent
        let newTip = currentTipText

        // Assicurati di ottenere un consiglio diverso
        while (newTip === currentTipText) {
            const randomIndex = Math.floor(Math.random() * tips.length)
            newTip = tips[randomIndex]
        }

        // Dissolvenza, cambia testo, riappari
        dailyTip.style.opacity = 0
        setTimeout(() => {
            dailyTip.textContent = newTip
            dailyTip.style.opacity = 1
        }, 300)
    }

    // Funzioni per i modal
    function showModal(modal) {
        modal.classList.add("show")
    }

    function hideModal(modal) {
        modal.classList.remove("show")
    }

    // Funzione per creare confetti
    function createConfetti() {
        const colors = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
        const confettiCount = 100

        // Rimuovi eventuali confetti esistenti
        confettiContainer.innerHTML = ""

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement("div")
            confetti.className = "confetti"
            confetti.style.left = Math.random() * 100 + "vw"
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
            confetti.style.width = Math.random() * 10 + 5 + "px"
            confetti.style.height = Math.random() * 10 + 5 + "px"
            confetti.style.opacity = Math.random()
            confetti.style.animation = `confetti-fall ${Math.random() * 3 + 2}s linear forwards`

            confettiContainer.appendChild(confetti)
        }

        // Rimuovi i confetti dopo l'animazione
        setTimeout(() => {
            confettiContainer.innerHTML = ""
        }, 5000)
    }

    // Funzione per creare sparkles
    function createSparkles() {
        const waterGlass = document.querySelector(".water-glass")
        const sparkleCount = 5

        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement("div")
            sparkle.className = "sparkle"

            // Posiziona le stelle intorno al bicchiere
            const angle = (i / sparkleCount) * Math.PI * 2
            const radius = 100
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius

            sparkle.style.left = `calc(50% + ${x}px)`
            sparkle.style.top = `calc(50% + ${y}px)`
            sparkle.style.animation = `sparkle ${Math.random() * 1 + 1}s ease-out forwards`
            sparkle.style.animationDelay = `${i * 0.2}s`

            waterGlass.parentNode.appendChild(sparkle)

            // Rimuovi le stelle dopo l'animazione
            setTimeout(
                () => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle)
                    }
                },
                2000 + i * 200,
            )
        }
    }

    // Funzione per creare effetto overflow
    function createOverflow() {
        const waterGlass = document.querySelector(".water-glass")
        const overflow = document.createElement("div")
        overflow.className = "water-overflow"

        waterGlass.appendChild(overflow)

        // Avvia l'animazione
        overflow.style.animation = "overflow 1s ease-out forwards"

        // Rimuovi l'elemento dopo l'animazione
        setTimeout(() => {
            if (overflow.parentNode) {
                overflow.parentNode.removeChild(overflow)
            }
        }, 1000)
    }

    // Chiudi i modal se si clicca fuori
    window.addEventListener("click", (event) => {
        if (event.target === resetModal) {
            hideModal(resetModal)
        }
        if (event.target === successModal) {
            hideModal(successModal)
        }
    })
})