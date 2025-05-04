
// We'll use the global math object loaded from the CDN instead
// No need for an import since it's loaded globally
// Global variables
let regionsData = []
const extractedRegions = []
const MAX_HISTORY = 8

// Initialize the application
document.addEventListener("DOMContentLoaded", initialize)

async function initialize() {
    try {
        // Load regions data
        regionsData = await loadRegioni()

        // Add event listeners
        document.getElementById("generateButton").addEventListener("click", handleGenerateButtonClick)

        // Calculate totals for display
        const totalEstensione = calculateTotalValues(regionsData, "estensione_km2")
        const totalPopolazione = calculateTotalValues(regionsData, "popolazione")
        const totalRegioni = regionsData.length
        const totalProvince = calculateTotalProvinces(regionsData)

        // Update total stats display
        document.getElementById("total-population").textContent = formatNumber(totalPopolazione) + " abitanti"
        document.getElementById("total-area").textContent = formatNumber(totalEstensione) + " km²"
        document.getElementById("total-regions").textContent = totalRegioni
        document.getElementById("total-provinces").textContent = totalProvince
    } catch (error) {
        console.error("Error initializing the application:", error)
        showErrorMessage("Si è verificato un errore durante l'inizializzazione dell'applicazione.")
    }
}

// Load regions data from JSON file
async function loadRegioni() {
    try {
        const response = await fetch("configurazioni.json")
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return await response.json()
    } catch (error) {
        console.error("Error loading regions:", error)
        showErrorMessage("Impossibile caricare i dati delle regioni.")
        return []
    }
}

// Calculate total values for a specific key across all regions
function calculateTotalValues(regioni, key) {
    return regioni.reduce((total, regione) => total + regione[key], 0)
}

// Calculate total number of provinces
function calculateTotalProvinces(regioni) {
    return regioni.reduce((total, regione) => total + regione.province.length, 0)
}

// Calculate percentage of a value relative to a total
function calculatePercent(value, total) {
    return ((value / total) * 100).toFixed(2)
}

// Calculate population density
function calculateDensity(population, area) {
    return (population / area).toFixed(2)
}

// Select a random region
function selectRandomRegione(regioni) {
    return regioni[Math.floor(Math.random() * regioni.length)]
}

// Format a number with thousands separators
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

// Handle the generate button click
function handleGenerateButtonClick() {
    const totalEstensione = calculateTotalValues(regionsData, "estensione_km2")
    const totalPopolazione = calculateTotalValues(regionsData, "popolazione")
    const totalProvince = calculateTotalProvinces(regionsData)

    // Add pulse animation to the button
    const button = document.getElementById("generateButton")
    button.classList.add("pulse")
    setTimeout(() => {
        button.classList.remove("pulse")
    }, 500)

    // Create a shuffling effect
    let counter = 0
    const maxIterations = 10
    const intervalId = setInterval(() => {
        displayRandomRegione(regionsData, totalEstensione, totalPopolazione, totalProvince, true)
        counter++

        if (counter >= maxIterations) {
            clearInterval(intervalId)
            const finalRegion = displayRandomRegione(regionsData, totalEstensione, totalPopolazione, totalProvince, false)
            addToHistory(finalRegion)
        }
    }, 100)
}

// Display a random region
function displayRandomRegione(regioni, totalEstensione, totalPopolazione, totalProvince, isShuffling) {
    const regioneCasuale = selectRandomRegione(regioni)
    const percentualeEstensione = calculatePercent(regioneCasuale.estensione_km2, totalEstensione)
    const percentualePopolazione = calculatePercent(regioneCasuale.popolazione, totalPopolazione)
    const densitaRegione = calculateDensity(regioneCasuale.popolazione, regioneCasuale.estensione_km2)
    const percentualeProvince = calculatePercent(regioneCasuale.province.length, totalProvince)

    const regioneHTML = generateRegioneHTML(
        regioneCasuale,
        percentualeEstensione,
        percentualePopolazione,
        densitaRegione,
        percentualeProvince,
        isShuffling,
    )

    updateUI(regioneHTML)
    return regioneCasuale
}

// Generate HTML for a region
function generateRegioneHTML(
    regione,
    percentualeEstensione,
    percentualePopolazione,
    densitaRegione,
    percentualeProvince,
    isShuffling,
) {
    const { nome, immagine, capoluogo, estensione_km2, popolazione, province } = regione
    const numeroProvince = province.length

    // Generate provinces list with numbers and icons
    const provinceHTML = province
        .sort()
        .map(
            (provincia, index) => `
      <div class="province-item">
        <div class="province-number">${index + 1}</div>
        <div class="province-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="province-svg">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <div class="province-name">${provincia}</div>
      </div>
    `,
        )
        .join("")

    // Apply animation class based on whether we're shuffling or showing the final result
    const animationClass = isShuffling ? "" : "fade-in"

    return `
    <div class="region-content ${animationClass}">
      <div class="region-header">
        <div class="region-title">
          <h2 class="region-name">${nome}</h2>
          <div class="region-capital">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="capital-icon">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Capoluogo: ${capoluogo}
          </div>
        </div>
      </div>
      
      <div class="region-image-container">
        <img src="Img/${immagine}" alt="${nome}" class="region-image" onerror="this.src='https://via.placeholder.com/300x200.png?text=${encodeURIComponent(nome)}'">
      </div>
      
      <div class="region-stats">
        <div class="stat-item">
          <div class="stat-label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stat-icon">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Superficie
          </div>
          <div class="stat-value">${formatNumber(estensione_km2)} km²</div>
          <div class="stat-detail">
            <span>${percentualeEstensione}% dell'Italia</span>
            <div class="percentage-bar">
              <div class="percentage-fill" style="width: ${percentualeEstensione}%"></div>
            </div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stat-icon">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Popolazione
          </div>
          <div class="stat-value">${formatNumber(popolazione)}</div>
          <div class="stat-detail">
            <span>${percentualePopolazione}% dell'Italia</span>
            <div class="percentage-bar">
              <div class="percentage-fill" style="width: ${percentualePopolazione}%"></div>
            </div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stat-icon">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Densità
          </div>
          <div class="stat-value">${densitaRegione} ab/km²</div>
        </div>
      </div>
      
      <div class="region-provinces">
        <div class="provinces-header">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="provinces-icon">
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <h3 class="provinces-title">Province (${numeroProvince})</h3>
        </div>
        
        <div class="province-percentage">
          <span>${percentualeProvince}% del totale nazionale</span>
          <div class="percentage-bar">
            <div class="percentage-fill" style="width: ${percentualeProvince}%"></div>
          </div>
        </div>
        
        <div class="provinces-grid">
          ${provinceHTML}
        </div>
      </div>
    </div>
  `
}

// Update the UI with the generated HTML
function updateUI(html) {
    const outputElement = document.getElementById("output")
    outputElement.innerHTML = html
}

// Add a region to the history
function addToHistory(region) {
    // Don't add duplicates consecutively
    if (extractedRegions.length > 0 && extractedRegions[0].nome === region.nome) {
        return
    }

    // Add to beginning of array
    extractedRegions.unshift(region)

    // Limit history size
    if (extractedRegions.length > MAX_HISTORY) {
        extractedRegions.pop()
    }

    // Update history display
    updateHistoryDisplay()
}

// Update the history display
function updateHistoryDisplay() {
    const historyContainer = document.getElementById("history")
    historyContainer.innerHTML = ""

    if (extractedRegions.length === 0) {
        historyContainer.innerHTML = "<p class='no-history'>Nessuna regione estratta</p>"
        return
    }

    extractedRegions.forEach((region) => {
        const historyItem = document.createElement("div")
        historyItem.className = "history-item"

        historyItem.innerHTML = `
      <img src="Img/${region.immagine}" alt="${region.nome}" class="history-image" onerror="this.src='https://via.placeholder.com/150x100.png?text=${encodeURIComponent(region.nome)}'">
      <div class="history-name">${region.nome}</div>
    `

        // Add click event to display this region again
        historyItem.addEventListener("click", () => {
            const totalEstensione = calculateTotalValues(regionsData, "estensione_km2")
            const totalPopolazione = calculateTotalValues(regionsData, "popolazione")
            const totalProvince = calculateTotalProvinces(regionsData)

            const percentualeEstensione = calculatePercent(region.estensione_km2, totalEstensione)
            const percentualePopolazione = calculatePercent(region.popolazione, totalPopolazione)
            const densitaRegione = calculateDensity(region.popolazione, region.estensione_km2)
            const percentualeProvince = calculatePercent(region.province.length, totalProvince)

            const regioneHTML = generateRegioneHTML(
                region,
                percentualeEstensione,
                percentualePopolazione,
                densitaRegione,
                percentualeProvince,
                false,
            )

            updateUI(regioneHTML)
        })

        historyContainer.appendChild(historyItem)
    })
}

// Show error message
function showErrorMessage(message) {
    const outputElement = document.getElementById("output")
    outputElement.innerHTML = `
    <div class="error-message">
      <div class="error-icon">⚠️</div>
      <p>${message}</p>
    </div>
  `
}

// Import math.js library
// const math = require("mathjs")

// Attendere che il DOM sia completamente caricato
document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const equationInput = document.getElementById("equation-input")
    const solveButton = document.getElementById("solve-button")
    const solutionContent = document.getElementById("solution-content")
    const stepsContent = document.getElementById("steps-content")
    const graphContent = document.getElementById("graph-content")
    const historyList = document.getElementById("history-list")
    const tabButtons = document.querySelectorAll(".tab-btn")
    const tabPanes = document.querySelectorAll(".tab-pane")
    const exampleButtons = document.querySelectorAll(".example-btn")
    const keyboardButtons = document.querySelectorAll(".keyboard-btn")
    const darkModeButton = document.getElementById("dark-mode-btn")
    const systemsButton = document.getElementById("systems-btn")
    const calculusButton = document.getElementById("calculus-btn")
    const complexButton = document.getElementById("complex-btn")

    // Chart instance
    let equationChart = null

    // History of solved equations
    const equationHistory = []
    const maxHistoryItems = 10

    // Initialize tabs
    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const tabId = button.getAttribute("data-tab")

            // Remove active class from all buttons and panes
            tabButtons.forEach((btn) => btn.classList.remove("active"))
            tabPanes.forEach((pane) => pane.classList.remove("active"))

            // Add active class to current button and pane
            button.classList.add("active")
            document.getElementById(`${tabId}-tab`).classList.add("active")

            // Update graph if graph tab is selected
            if (tabId === "graph" && equationInput.value) {
                renderGraph(equationInput.value)
            }
        })
    })

    // Example buttons
    exampleButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const equation = button.getAttribute("data-equation")
            equationInput.value = equation
            solveEquation(equation)
        })
    })

    // Keyboard buttons
    keyboardButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const value = button.getAttribute("data-value")
            const cursorPos = equationInput.selectionStart
            const textBefore = equationInput.value.substring(0, cursorPos)
            const textAfter = equationInput.value.substring(cursorPos)

            equationInput.value = textBefore + value + textAfter
            equationInput.focus()
            equationInput.selectionStart = equationInput.selectionEnd = cursorPos + value.length
        })
    })

    // Dark mode toggle
    darkModeButton.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode")

        if (document.body.classList.contains("dark-mode")) {
            document.documentElement.style.setProperty("--background", "#1e293b")
            document.documentElement.style.setProperty("--card-bg", "#334155")
            document.documentElement.style.setProperty("--text", "#f8fafc")
            document.documentElement.style.setProperty("--text-light", "#cbd5e1")
            document.documentElement.style.setProperty("--border", "#475569")
            document.documentElement.style.setProperty("--accent", "#334155")
        } else {
            document.documentElement.style.setProperty("--background", "#f8fafc")
            document.documentElement.style.setProperty("--card-bg", "#ffffff")
            document.documentElement.style.setProperty("--text", "#1e293b")
            document.documentElement.style.setProperty("--text-light", "#64748b")
            document.documentElement.style.setProperty("--border", "#e2e8f0")
            document.documentElement.style.setProperty("--accent", "#f8fafc")
        }
    })

    // Feature buttons
    systemsButton.addEventListener("click", () => {
        alert("Funzionalità in arrivo: Sistemi di equazioni")
    })

    calculusButton.addEventListener("click", () => {
        alert("Funzionalità in arrivo: Derivate e integrali")
    })

    complexButton.addEventListener("click", () => {
        alert("Funzionalità in arrivo: Equazioni complesse")
    })

    // Solve button click event
    solveButton.addEventListener("click", () => {
        const equation = equationInput.value.trim()
        if (equation) {
            solveEquation(equation)
        }
    })

    // Enter key press in input
    equationInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const equation = equationInput.value.trim()
            if (equation) {
                solveEquation(equation)
            }
        }
    })

    // Main function to solve equation
    function solveEquation(equation) {
        try {
            // Parse and solve the equation
            const { solution, steps } = parseAndSolveEquation(equation)

            // Display solution
            renderSolution(equation, solution)

            // Display steps
            renderSteps(steps)

            // Render graph
            renderGraph(equation)

            // Add to history
            addToHistory(equation, solution)
        } catch (error) {
            showError(error.message)
        }
    }

    // Parse and solve the equation
    function parseAndSolveEquation(equationStr) {
        // Check if it's a valid equation (contains =)
        if (!equationStr.includes("=")) {
            throw new Error("Inserisci un'equazione valida con il simbolo =")
        }

        try {
            // Split the equation into left and right sides
            const sides = equationStr.split("=").map((side) => side.trim())

            if (sides.length !== 2) {
                throw new Error("L'equazione deve avere esattamente un simbolo =")
            }

            const leftSide = sides[0]
            const rightSide = sides[1]

            // Check if it's a quadratic equation (contains x^2 or x²)
            if (equationStr.includes("x^2") || equationStr.includes("x²")) {
                return solveQuadraticEquation(leftSide, rightSide)
            }
            // Check if it's a linear equation (contains x)
            else if (equationStr.includes("x")) {
                return solveLinearEquation(leftSide, rightSide)
            } else {
                // It's a simple expression
                const result = math.evaluate(`${leftSide} - (${rightSide})`)
                return {
                    solution: `L'equazione è ${result === 0 ? "vera" : "falsa"}`,
                    steps: [
                        {
                            equation: equationStr,
                            explanation: "Equazione iniziale",
                        },
                        {
                            equation: `${leftSide} - ${rightSide} = ${result}`,
                            explanation: "Calcolo della differenza tra i due membri",
                        },
                        {
                            equation: result === 0 ? "L'equazione è vera" : "L'equazione è falsa",
                            explanation: "Risultato finale",
                        },
                    ],
                }
            }
        } catch (error) {
            throw new Error(`Errore nel risolvere l'equazione: ${error.message}`)
        }
    }

    // Solve linear equation (ax + b = cx + d)
    function solveLinearEquation(leftSide, rightSide) {
        // Replace x² with x^2 for math.js
        leftSide = leftSide.replace(/x²/g, "x^2")
        rightSide = rightSide.replace(/x²/g, "x^2")

        // Move all terms to the left side
        const equation = `${leftSide} - (${rightSide})`

        // Parse the expression
        const expr = math.parse(equation)

        // Simplify and collect like terms
        const simplified = math.simplify(expr)

        // Extract coefficients
        const terms = simplified.toString().split(" ")
        let a = 0 // coefficient of x
        let b = 0 // constant term

        terms.forEach((term) => {
            if (term.includes("x")) {
                // Extract coefficient of x
                const coef = term.replace("x", "")
                if (coef === "-") {
                    a = -1
                } else if (coef === "" || coef === "+") {
                    a = 1
                } else {
                    a = Number.parseFloat(coef)
                }
            } else if (!isNaN(Number.parseFloat(term))) {
                // Extract constant term
                b = Number.parseFloat(term)
            }
        })

        // Check if it's a valid linear equation
        if (a === 0) {
            if (b === 0) {
                return {
                    solution: "L'equazione è vera per ogni valore di x",
                    steps: [
                        { equation: `${leftSide} = ${rightSide}`, explanation: "Equazione iniziale" },
                        { equation: `${simplified.toString()} = 0`, explanation: "Semplificazione dell'equazione" },
                        { equation: "0 = 0", explanation: "L'equazione è vera per ogni valore di x" },
                    ],
                }
            } else {
                return {
                    solution: "L'equazione non ha soluzioni",
                    steps: [
                        { equation: `${leftSide} = ${rightSide}`, explanation: "Equazione iniziale" },
                        { equation: `${simplified.toString()} = 0`, explanation: "Semplificazione dell'equazione" },
                        { equation: `${b} = 0`, explanation: "L'equazione non ha soluzioni" },
                    ],
                }
            }
        }

        // Solve for x
        const x = -b / a

        return {
            solution: `x = ${x}`,
            steps: [
                { equation: `${leftSide} = ${rightSide}`, explanation: "Equazione iniziale" },
                { equation: `${simplified.toString()} = 0`, explanation: "Semplificazione dell'equazione" },
                { equation: `${a}x + ${b} = 0`, explanation: "Forma standard dell'equazione" },
                { equation: `${a}x = ${-b}`, explanation: "Isolamento del termine con x" },
                { equation: `x = ${x}`, explanation: "Soluzione dell'equazione" },
            ],
        }
    }

    // Solve quadratic equation (ax^2 + bx + c = 0)
    function solveQuadraticEquation(leftSide, rightSide) {
        // Replace x² with x^2 for math.js
        leftSide = leftSide.replace(/x²/g, "x^2")
        rightSide = rightSide.replace(/x²/g, "x^2")

        // Move all terms to the left side
        const equation = `${leftSide} - (${rightSide})`

        // Parse the expression
        const expr = math.parse(equation)

        // Simplify and collect like terms
        const simplified = math.simplify(expr)

        // Extract coefficients
        const terms = simplified.toString().split(" ")
        let a = 0 // coefficient of x^2
        let b = 0 // coefficient of x
        let c = 0 // constant term

        terms.forEach((term) => {
            if (term.includes("x^2")) {
                // Extract coefficient of x^2
                const coef = term.replace("x^2", "")
                if (coef === "-") {
                    a = -1
                } else if (coef === "" || coef === "+") {
                    a = 1
                } else {
                    a = Number.parseFloat(coef)
                }
            } else if (term.includes("x")) {
                // Extract coefficient of x
                const coef = term.replace("x", "")
                if (coef === "-") {
                    b = -1
                } else if (coef === "" || coef === "+") {
                    b = 1
                } else {
                    b = Number.parseFloat(coef)
                }
            } else if (!isNaN(Number.parseFloat(term))) {
                // Extract constant term
                c = Number.parseFloat(term)
            }
        })

        // Check if it's a valid quadratic equation
        if (a === 0) {
            return solveLinearEquation(leftSide, rightSide)
        }

        // Calculate discriminant
        const discriminant = b * b - 4 * a * c

        let solution, steps

        steps = [
            { equation: `${leftSide} = ${rightSide}`, explanation: "Equazione iniziale" },
            { equation: `${simplified.toString()} = 0`, explanation: "Semplificazione dell'equazione" },
            { equation: `${a}x^2 + ${b}x + ${c} = 0`, explanation: "Forma standard dell'equazione quadratica" },
            {
                equation: `Δ = b^2 - 4ac = ${b}^2 - 4 × ${a} × ${c} = ${discriminant}`,
                explanation: "Calcolo del discriminante",
            },
        ]

        if (discriminant > 0) {
            // Two real solutions
            const x1 = (-b + Math.sqrt(discriminant)) / (2 * a)
            const x2 = (-b - Math.sqrt(discriminant)) / (2 * a)

            solution = `x₁ = ${x1.toFixed(2)}, x₂ = ${x2.toFixed(2)}`

            steps.push(
                { equation: `x = (-b ± √Δ) / (2a)`, explanation: "Formula risolutiva dell'equazione di secondo grado" },
                { equation: `x = (${-b} ± √${discriminant}) / (2 × ${a})`, explanation: "Sostituzione dei valori" },
                { equation: `x₁ = ${x1.toFixed(2)}, x₂ = ${x2.toFixed(2)}`, explanation: "Soluzioni dell'equazione" },
            )
        } else if (discriminant === 0) {
            // One real solution (double root)
            const x = -b / (2 * a)

            solution = `x = ${x.toFixed(2)} (soluzione doppia)`

            steps.push(
                { equation: `x = -b / (2a)`, explanation: "Formula risolutiva per discriminante nullo" },
                { equation: `x = ${-b} / (2 × ${a})`, explanation: "Sostituzione dei valori" },
                { equation: `x = ${x.toFixed(2)}`, explanation: "Soluzione doppia dell'equazione" },
            )
        } else {
            // Complex solutions
            const realPart = -b / (2 * a)
            const imagPart = Math.sqrt(Math.abs(discriminant)) / (2 * a)

            solution = `x₁ = ${realPart.toFixed(2)} + ${imagPart.toFixed(2)}i, x₂ = ${realPart.toFixed(2)} - ${imagPart.toFixed(2)}i`

            steps.push(
                { equation: `x = (-b ± √Δ) / (2a)`, explanation: "Formula risolutiva dell'equazione di secondo grado" },
                { equation: `x = (${-b} ± √${discriminant}) / (2 × ${a})`, explanation: "Sostituzione dei valori" },
                {
                    equation: `x = (${-b} ± √(${Math.abs(discriminant)}i)) / (2 × ${a})`,
                    explanation: "Discriminante negativo, soluzioni complesse",
                },
                {
                    equation: `x₁ = ${realPart.toFixed(2)} + ${imagPart.toFixed(2)}i, x₂ = ${realPart.toFixed(2)} - ${imagPart.toFixed(2)}i`,
                    explanation: "Soluzioni complesse dell'equazione",
                },
            )
        }

        return { solution, steps }
    }

    // Render solution in the solution tab
    function renderSolution(equation, solution) {
        solutionContent.innerHTML = `
      <div class="solution-display">
        <div class="equation-display">${formatEquation(equation)}</div>
        <div class="solution-result">${solution}</div>
        <p class="solution-explanation">Questa è la soluzione dell'equazione. Vai alla scheda "Passaggi" per vedere i dettagli.</p>
      </div>
    `
    }

    // Render steps in the steps tab
    function renderSteps(steps) {
        if (!steps || steps.length === 0) {
            stepsContent.innerHTML = `
        <div class="placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>Nessun passaggio disponibile per questa equazione</p>
        </div>
      `
            return
        }

        const stepsHTML = steps
            .map(
                (step, index) => `
      <li class="step-item">
        <div class="step-number">${index + 1}</div>
        <div class="step-content">
          <div class="step-equation">${formatEquation(step.equation)}</div>
          <div class="step-explanation">${step.explanation}</div>
        </div>
      </li>
    `,
            )
            .join("")

        stepsContent.innerHTML = `
      <ul class="steps-list">
        ${stepsHTML}
      </ul>
    `
    }

    // Render graph in the graph tab
    function renderGraph(equation) {
        // Clear placeholder
        graphContent.innerHTML = '<canvas id="equation-graph"></canvas>'

        const canvas = document.getElementById("equation-graph")

        try {
            // Parse equation
            const sides = equation.split("=").map((side) => side.trim())

            if (sides.length !== 2) {
                throw new Error("Equazione non valida")
            }

            // Replace x² with x^2 for math.js
            const leftSide = sides[0].replace(/x²/g, "x^2")
            const rightSide = sides[1].replace(/x²/g, "x^2")

            // Move everything to one side: leftSide - rightSide = 0
            const expr = `${leftSide} - (${rightSide})`

            // Generate points for the graph
            const xValues = []
            const yValues = []

            // Generate 100 points from -10 to 10
            for (let i = 0; i <= 100; i++) {
                const x = -10 + i * 0.2
                try {
                    // Replace x with the current value and evaluate
                    const scope = { x: x }
                    const y = math.evaluate(expr, scope)

                    xValues.push(x)
                    yValues.push(y)
                } catch (e) {
                    // Skip points that can't be evaluated
                    continue
                }
            }

            // Find zeros (where y is close to 0)
            const zeros = []
            for (let i = 0; i < yValues.length - 1; i++) {
                if (yValues[i] * yValues[i + 1] <= 0) {
                    // There's a zero between these points
                    zeros.push({
                        x: xValues[i],
                        y: 0,
                    })
                }
            }

            // Create chart
            if (equationChart) {
                equationChart.destroy()
            }

            equationChart = new Chart(canvas, {
                type: "line",
                data: {
                    labels: xValues,
                    datasets: [
                        {
                            label: equation,
                            data: yValues.map((y, i) => ({ x: xValues[i], y })),
                            borderColor: "#6366f1",
                            backgroundColor: "rgba(99, 102, 241, 0.1)",
                            borderWidth: 2,
                            tension: 0.4,
                            pointRadius: 0,
                        },
                        {
                            label: "Soluzioni",
                            data: zeros,
                            backgroundColor: "#f43f5e",
                            borderColor: "#f43f5e",
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            showLine: false,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: "linear",
                            position: "center",
                            title: {
                                display: true,
                                text: "x",
                            },
                            grid: {
                                color: "rgba(0, 0, 0, 0.05)",
                            },
                        },
                        y: {
                            type: "linear",
                            position: "center",
                            title: {
                                display: true,
                                text: "y",
                            },
                            grid: {
                                color: "rgba(0, 0, 0, 0.05)",
                            },
                        },
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const datasetLabel = context.dataset.label || ""
                                    const value = context.parsed.y
                                    if (context.datasetIndex === 1) {
                                        return `Soluzione: x = ${context.parsed.x.toFixed(2)}`
                                    }
                                    return `${datasetLabel}: (${context.parsed.x.toFixed(2)}, ${value.toFixed(2)})`
                                },
                            },
                        },
                    },
                },
            })
        } catch (error) {
            graphContent.innerHTML = `
        <div class="placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>Impossibile generare il grafico: ${error.message}</p>
        </div>
      `
        }
    }

    // Add equation to history
    function addToHistory(equation, solution) {
        // Check if equation is already in history
        const existingIndex = equationHistory.findIndex((item) => item.equation === equation)

        if (existingIndex !== -1) {
            // Remove existing entry
            equationHistory.splice(existingIndex, 1)
        }

        // Add to beginning of array
        equationHistory.unshift({ equation, solution })

        // Limit history size
        if (equationHistory.length > maxHistoryItems) {
            equationHistory.pop()
        }

        // Update history display
        updateHistoryDisplay()
    }

    // Update history display
    function updateHistoryDisplay() {
        if (equationHistory.length === 0) {
            historyList.innerHTML = `
        <div class="placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <p>Le equazioni risolte appariranno qui</p>
        </div>
      `
            return
        }

        const historyHTML = equationHistory
            .map(
                (item) => `
      <div class="history-item" data-equation="${item.equation}">
        <div class="history-equation">${formatEquation(item.equation)}</div>
        <div class="history-result">${item.solution}</div>
      </div>
    `,
            )
            .join("")

        historyList.innerHTML = historyHTML

        // Add click event to history items
        document.querySelectorAll(".history-item").forEach((item) => {
            item.addEventListener("click", () => {
                const equation = item.getAttribute("data-equation")
                equationInput.value = equation
                solveEquation(equation)
            })
        })
    }

    // Format equation for display (replace x^2 with x²)
    function formatEquation(equation) {
        return equation.replace(/x\^2/g, "x²")
    }

    // Show error message
    function showError(message) {
        solutionContent.innerHTML = `
      <div class="solution-display">
        <div class="solution-result" style="color: #f43f5e;">Errore</div>
        <p class="solution-explanation">${message}</p>
      </div>
    `

        stepsContent.innerHTML = `
      <div class="placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>${message}</p>
      </div>
    `

        graphContent.innerHTML = `
      <div class="placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>Impossibile generare il grafico</p>
      </div>
    `
    }

    // Initialize with an example equation
    const initialEquation = "x² - 4 = 0"
    equationInput.value = initialEquation
    solveEquation(initialEquation)
})
