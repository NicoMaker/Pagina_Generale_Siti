document.addEventListener("DOMContentLoaded", () => {
  // Variabili globali
  let scale = 1
  let planetData = {}
  const solarSystem = document.getElementById("solarSystem")
  const planetNameDisplay = document.getElementById("planetNameDisplay")
  const infoModal = document.getElementById("infoModal")
  const closeModal = document.querySelector(".close-modal")
  const showInfoBtn = document.getElementById("showInfoBtn")
  const tabsHeader = document.getElementById("tabsHeader")
  const tabsContent = document.getElementById("tabsContent")

  // Controlli di zoom
  const zoomIn = document.getElementById("zoomIn")
  const zoomOut = document.getElementById("zoomOut")
  const resetView = document.getElementById("resetView")

  // Carica i dati dei pianeti dal file JSON
  fetch("planets.json")
    .then((response) => response.json())
    .then((data) => {
      planetData = data
      initializeSolarSystem()
      initializeInfoModal()
    })
    .catch((error) => {
      console.error("Errore nel caricamento dei dati dei pianeti:", error)
    })

  // Inizializza il sistema solare
  function initializeSolarSystem() {
    // Crea il sole
    const sun = document.createElement("div")
    sun.className = "sun"
    sun.setAttribute("data-name", "sole")
    solarSystem.appendChild(sun)

    // Aggiungi evento mouseenter/mouseleave al sole
    sun.addEventListener("mouseenter", () => {
      showPlanetName("Sole")
    })

    sun.addEventListener("mouseleave", () => {
      hidePlanetName()
    })

    // Add click event for the sun
    sun.addEventListener("click", () => {
      showPlanetInfoPopup("sole")
    })

    // Crea orbite e pianeti
    const planetKeys = Object.keys(planetData).filter((key) => key !== "sole")

    planetKeys.forEach((planetKey, index) => {
      const planet = planetData[planetKey]

      // Determina se è un pianeta interno o esterno
      const isInnerPlanet = index < 4
      const planetCategory = isInnerPlanet ? "inner-planet" : "outer-planet"

      // Calcola parametri per orbita ellittica
      const a = planet.orbitRadius // semiasse maggiore
      const b = a * 0.8 // semiasse minore (più ellittico)

      // Crea orbita
      const orbit = document.createElement("div")
      orbit.className = `orbit elliptical ${planetCategory}`
      orbit.style.width = `${a * 2}px`
      orbit.style.height = `${b * 2}px`
      solarSystem.appendChild(orbit)

      // Crea il pianeta
      const planetElement = document.createElement("div")
      planetElement.className = `planet ${planetKey} ${planetCategory}`
      planetElement.setAttribute("data-name", planetKey)
      planetElement.setAttribute("data-category", isInnerPlanet ? "inner" : "outer")
      planetElement.style.width = `${planet.size}px`
      planetElement.style.height = `${planet.size}px`
      planetElement.style.backgroundImage = `url(${planet.icon})`

      // Aggiungi badge di categoria al pianeta
      const categoryBadge = document.createElement("div")
      categoryBadge.className = `planet-category ${isInnerPlanet ? "inner" : "outer"}`
      categoryBadge.textContent = isInnerPlanet ? "Pianeta Interno" : "Pianeta Esterno"
      planetElement.appendChild(categoryBadge)

      // Posiziona il pianeta inizialmente
      const angle = Math.random() * Math.PI * 2 // Angolo casuale iniziale
      const x = a * Math.cos(angle)
      const y = b * Math.sin(angle)

      planetElement.style.left = `calc(50% + ${x}px)`
      planetElement.style.top = `calc(50% + ${y}px)`
      planetElement.style.transform = `translate(-50%, -50%)`

      // Imposta gli attributi per l'animazione
      planetElement.setAttribute("data-orbit-a", a)
      planetElement.setAttribute("data-orbit-b", b)
      planetElement.setAttribute("data-orbit-period", planet.orbitPeriod)
      planetElement.setAttribute("data-orbit-start", angle)

      // Aggiungi anelli a Saturno se necessario
      if (planetKey === "saturno") {
        const rings = document.createElement("div")
        rings.className = "saturn-rings"
        rings.style.position = "absolute"
        rings.style.width = `${planet.size * 2}px`
        rings.style.height = `${planet.size * 0.5}px`
        rings.style.top = "50%"
        rings.style.left = "50%"
        rings.style.transform = "translate(-50%, -50%)"
        rings.style.borderRadius = "50%"
        rings.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.3)"
        rings.style.background =
          "linear-gradient(to right, rgba(210, 180, 140, 0), rgba(210, 180, 140, 0.8) 20%, rgba(210, 180, 140, 0.3) 40%, rgba(210, 180, 140, 0.8) 60%, rgba(210, 180, 140, 0))"
        rings.style.zIndex = "-1"
        planetElement.appendChild(rings)
      }

      // Aggiungi etichetta del pianeta
      const planetLabel = document.createElement("div")
      planetLabel.className = "planet-label"
      planetLabel.textContent = planet.name
      planetLabel.style.color = isInnerPlanet ? "cyan" : "orange"
      solarSystem.appendChild(planetLabel)

      // Associa l'etichetta al pianeta
      planetElement.setAttribute("data-label", planetLabel.textContent)

      solarSystem.appendChild(planetElement)

      // Aggiungi eventi mouseenter/mouseleave
      planetElement.addEventListener("mouseenter", () => {
        const category = planetElement.getAttribute("data-category")
        showPlanetName(`${planet.name} (${category === "inner" ? "Pianeta Interno" : "Pianeta Esterno"})`)
      })

      planetElement.addEventListener("mouseleave", () => {
        hidePlanetName()
      })

      // Aggiungi evento click
      planetElement.addEventListener("click", () => {
        showPlanetInfoPopup(planetKey)
      })
    })

    // Avvia l'animazione dei pianeti
    animatePlanets()
  }

  // Funzione per animare i pianeti nelle loro orbite ellittiche
  function animatePlanets() {
    const planets = document.querySelectorAll(".planet")

    function animate() {
      const now = Date.now() / 1000 // Tempo corrente in secondi

      planets.forEach((planet) => {
        const a = Number.parseFloat(planet.getAttribute("data-orbit-a"))
        const b = Number.parseFloat(planet.getAttribute("data-orbit-b"))
        const period = Number.parseFloat(planet.getAttribute("data-orbit-period"))
        const startAngle = Number.parseFloat(planet.getAttribute("data-orbit-start"))

        // Calcola l'angolo corrente in base al tempo
        const angle = startAngle + (now / period) * Math.PI * 2

        // Calcola la posizione sulla ellisse
        const x = a * Math.cos(angle)
        const y = b * Math.sin(angle)

        // Aggiorna la posizione del pianeta
        planet.style.left = `calc(50% + ${x}px)`
        planet.style.top = `calc(50% + ${y}px)`

        // Aggiorna anche la posizione dell'etichetta
        const planetName = planet.getAttribute("data-label")
        if (planetName) {
          const label = Array.from(document.querySelectorAll(".planet-label")).find(
            (label) => label.textContent === planetName,
          )

          if (label) {
            label.style.left = `calc(50% + ${x}px)`
            label.style.top = `calc(50% + ${y - 20}px)`
          }
        }
      })

      requestAnimationFrame(animate)
    }

    animate()
  }

  // Inizializza il modal con le informazioni di tutti i pianeti
  function initializeInfoModal() {
    // Crea le tab per ogni pianeta (incluso il sole)
    Object.keys(planetData).forEach((planetKey, index) => {
      const planet = planetData[planetKey]

      // Determina se è un pianeta interno o esterno (escludi il sole)
      let categoryClass = ""
      let categoryBadge = ""

      if (planetKey !== "sole") {
        const isInnerPlanet = index <= 4 // Il sole è index 0, quindi i pianeti interni sono 1-4
        categoryClass = isInnerPlanet ? "inner-planet" : "outer-planet"
        categoryBadge = `<span class="planet-category-badge ${isInnerPlanet ? "inner" : "outer"}">
                  ${isInnerPlanet ? "Pianeta Interno" : "Pianeta Esterno"}
              </span>`
      }

      // Crea il pulsante della tab
      const tabButton = document.createElement("button")
      tabButton.className = `tab-button ${categoryClass} ${index === 0 ? "active" : ""}`
      tabButton.setAttribute("data-tab", planetKey)

      // Aggiungi icona e nome
      const tabIcon = document.createElement("div")
      tabIcon.className = "tab-icon"
      tabIcon.style.backgroundImage = `url(${planet.icon})`

      tabButton.appendChild(tabIcon)
      tabButton.appendChild(document.createTextNode(planet.name))

      tabsHeader.appendChild(tabButton)

      // Crea il contenuto della tab
      const tabContent = document.createElement("div")
      tabContent.className = `tab-content ${index === 0 ? "active" : ""}`
      tabContent.setAttribute("id", `tab-${planetKey}`)

      // Prepara i fatti da mostrare, escludendo quelli senza dati
      let factsHTML = ""

      // Distanza dal Sole
      if (planet.distance) {
        factsHTML += `
        <div class="fact">
          <div class="fact-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          <div class="fact-content">
            <h3>Distanza dal Sole</h3>
            <p>${planet.distance}</p>
          </div>
        </div>
      `
      }

      // Diametro
      if (planet.diameter) {
        factsHTML += `
        <div class="fact">
          <div class="fact-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z"></path>
            </svg>
          </div>
          <div class="fact-content">
            <h3>Diametro</h3>
            <p>${planet.diameter}</p>
          </div>
        </div>
      `
      }

      // Periodo Orbitale
      if (planet.orbital) {
        factsHTML += `
        <div class="fact">
          <div class="fact-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
          </div>
          <div class="fact-content">
            <h3>Periodo Orbitale</h3>
            <p>${planet.orbital}</p>
          </div>
        </div>
      `
      }

      // Lune (solo per i pianeti, non per il sole)
      if (planetKey !== "sole" && typeof planet.moons === "object" && planet.moons.count > 0) {
        factsHTML += `
        <div class="fact">
          <div class="fact-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>
          </div>
          <div class="fact-content">
            <h3>Lune</h3>
            <p>${planet.moons.count}</p>
          </div>
        </div>
      `
      }

      // Temperatura
      if (planet.temperature) {
        factsHTML += `
        <div class="fact">
          <div class="fact-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
            </svg>
          </div>
          <div class="fact-content">
            <h3>Temperatura</h3>
            <p>${planet.temperature}</p>
          </div>
        </div>
      `
      }

      // Aggiungi fatto sull'eccentricità per i pianeti
      if (planetKey !== "sole") {
        factsHTML += `
        <div class="fact">
          <div class="fact-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <ellipse cx="12" cy="12" rx="10" ry="6"></ellipse>
              <path d="M12 2v20"></path>
            </svg>
          </div>
          <div class="fact-content">
            <h3>Eccentricità</h3>
            <p>${(index < 4 ? 0.05 : 0.2).toFixed(2)}</p>
          </div>
        </div>
      `
      }

      // Popola il contenuto della tab
      tabContent.innerHTML = `
      <div class="planet-info">
        <div class="planet-header">
          <div class="planet-image" style="background-image: url(${planet.icon})"></div>
          <div class="planet-title">
            <h2>${planet.name} ${categoryBadge}</h2>
            <p>${planet.type}</p>
          </div>
        </div>
        
        <div class="planet-facts">
          ${factsHTML}
        </div>
        
        <div class="planet-description">
          <h3>Descrizione</h3>
          <p>${planet.description}</p>
        </div>
        
        <div class="planet-gallery">
          <div class="gallery-image" style="background-image: url(${planet.gallery})"></div>
        </div>
        ${planetKey !== "sole" && typeof planet.moons === "object" && planet.moons.count > 0
          ? `
          <div class="planet-satellites">
            <h3>Satelliti</h3>
            <div class="satellites-list">
              ${planet.moons.list
            .map(
              (moon) => `
                <div class="satellite-item">
                  <h4>${moon.name}</h4>
                  <div class="satellite-details">
                    <p><strong>Diametro:</strong> ${moon.diameter}</p>
                    <p><strong>Distanza dal pianeta:</strong> ${moon.distance}</p>
                    <p><strong>Scoperto:</strong> ${moon.discovered}</p>
                  </div>
                </div>
              `,
            )
            .join("")}
            </div>
          </div>
        `
          : ""
        }
      </div>
    `

      tabsContent.appendChild(tabContent)
    })

    // Aggiungi event listener alle tab
    const tabButtons = document.querySelectorAll(".tab-button")
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabId = button.getAttribute("data-tab")

        // Rimuovi la classe active da tutte le tab
        tabButtons.forEach((btn) => btn.classList.remove("active"))
        document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))

        // Aggiungi la classe active alla tab selezionata
        button.classList.add("active")
        document.getElementById(`tab-${tabId}`).classList.add("active")
      })
    })
  }

  // Mostra il nome del pianeta al passaggio del mouse
  function showPlanetName(name) {
    planetNameDisplay.textContent = name
    planetNameDisplay.style.opacity = "1"
  }

  // Nasconde il nome del pianeta
  function hidePlanetName() {
    planetNameDisplay.style.opacity = "0"
  }

  // Mostra il modal con le informazioni
  showInfoBtn.addEventListener("click", () => {
    infoModal.style.display = "block"
    document.body.style.overflow = "hidden"
  })

  // Chiudi il modal
  closeModal.addEventListener("click", () => {
    infoModal.style.display = "none"
    document.body.style.overflow = "auto"
  })

  // Chiudi il modal cliccando fuori dal contenuto
  window.addEventListener("click", (event) => {
    if (event.target === infoModal) {
      infoModal.style.display = "none"
      document.body.style.overflow = "auto"
    }
  })

  // Controlli di zoom
  zoomIn.addEventListener("click", () => {
    scale *= 1.2
    updateScale()
  })

  zoomOut.addEventListener("click", () => {
    scale *= 0.8
    updateScale()
  })

  resetView.addEventListener("click", () => {
    scale = 1
    updateScale()
  })

  function updateScale() {
    solarSystem.style.transform = `translate(-50%, -50%) scale(${scale})`
  }

  // Gestione del ridimensionamento della finestra
  window.addEventListener("resize", () => {
    adjustSolarSystemForScreenSize()
  })

  function adjustSolarSystemForScreenSize() {
    const width = window.innerWidth
    let baseScale = 1

    if (width < 480) {
      baseScale = 0.3
    } else if (width < 768) {
      baseScale = 0.5
    } else if (width < 1024) {
      baseScale = 0.7
    } else if (width < 1200) {
      baseScale = 0.9
    }

    scale = baseScale
    updateScale()
  }

  // Inizializza la scala in base alla dimensione dello schermo
  adjustSolarSystemForScreenSize()

  // Function to show planet info popup when clicking on a planet
  function showPlanetInfoPopup(planetKey) {
    const planet = planetData[planetKey]

    // Create popup element if it doesn't exist
    let popup = document.getElementById("planetInfoPopup")
    if (!popup) {
      popup = document.createElement("div")
      popup.id = "planetInfoPopup"
      popup.className = "planet-info-popup"
      document.body.appendChild(popup)
    }

    // Determine if it's a planet or the sun
    const isPlanet = planetKey !== "sole"
    const isInnerPlanet = isPlanet && Object.keys(planetData).indexOf(planetKey) <= 4
    const categoryClass = isInnerPlanet ? "inner-planet" : "outer-planet"
    const categoryBadge = isPlanet
      ? `<span class="planet-category-badge ${isInnerPlanet ? "inner" : "outer"}">
      ${isInnerPlanet ? "Pianeta Interno" : "Pianeta Esterno"}
    </span>`
      : ""

    // Prepare facts HTML
    let factsHTML = ""

    // Distance from Sun
    if (planet.distance) {
      factsHTML += `
      <div class="fact">
        <div class="fact-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </div>
        <div class="fact-content">
          <h3>Distanza dal Sole</h3>
          <p>${planet.distance}</p>
        </div>
      </div>
    `
    }

    // Diameter
    if (planet.diameter) {
      factsHTML += `
      <div class="fact">
        <div class="fact-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z"></path>
          </svg>
        </div>
        <div class="fact-content">
          <h3>Diametro</h3>
          <p>${planet.diameter}</p>
        </div>
      </div>
    `
    }

    // Orbital Period
    if (planet.orbital) {
      factsHTML += `
      <div class="fact">
        <div class="fact-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
        </div>
        <div class="fact-content">
          <h3>Periodo Orbitale</h3>
          <p>${planet.orbital}</p>
        </div>
      </div>
    `
    }

    // Temperature
    if (planet.temperature) {
      factsHTML += `
      <div class="fact">
        <div class="fact-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
          </svg>
        </div>
        <div class="fact-content">
          <h3>Temperatura</h3>
          <p>${planet.temperature}</p>
        </div>
      </div>
    `
    }

    // Eccentricità (solo per i pianeti, non per il sole)
    if (isPlanet) {
      const index = Object.keys(planetData).indexOf(planetKey)
      const eccentricity = (index <= 4 ? 0.05 : 0.2).toFixed(2) // Pianeti interni: 0.05, esterni: 0.2

      factsHTML += `
      <div class="fact">
        <div class="fact-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="12" rx="10" ry="6"></ellipse>
            <path d="M12 2v20"></path>
          </svg>
        </div>
        <div class="fact-content">
          <h3>Eccentricità</h3>
          <p>${eccentricity}</p>
        </div>
      </div>
    `
    }

    // Moons (only for planets, not for the sun)
    if (isPlanet && typeof planet.moons === "object" && planet.moons.count > 0) {
      factsHTML += `
      <div class="fact">
        <div class="fact-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
          </svg>
        </div>
        <div class="fact-content">
          <h3>Lune</h3>
          <p>${planet.moons.count}</p>
        </div>
      </div>
    `
    }

    // Populate the popup content
    popup.innerHTML = `
    <div class="popup-content ${isPlanet ? categoryClass : ""}">
      <span class="close-popup">&times;</span>
      <div class="planet-header">
        <div class="planet-image" style="background-image: url(${planet.icon})"></div>
        <div class="planet-title">
          <h2>${planet.name} ${categoryBadge}</h2>
          <p>${planet.type}</p>
        </div>
      </div>
      
      <div class="planet-facts">
        ${factsHTML}
      </div>
      
      <div class="planet-description">
        <p>${planet.description}</p>
      </div>
      
      <div class="planet-popup-gallery">
        <div class="popup-gallery-image" style="background-image: url(${planet.gallery})">
          <div class="zoom-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </div>
        </div>
      </div>
      
      ${isPlanet && typeof planet.moons === "object" && planet.moons.count > 0
        ? `
        <div class="planet-satellites">
          <h3>Satelliti (${planet.moons.count})</h3>
          <div class="satellites-list">
            ${planet.moons.list
          .slice(0, 4)
          .map(
            (moon) => `
              <div class="satellite-item">
                <h4>${moon.name}</h4>
                <div class="satellite-details">
                  <p><strong>Diametro:</strong> ${moon.diameter}</p>
                  <p><strong>Distanza:</strong> ${moon.distance}</p>
                  <p><strong>Scoperto:</strong> ${moon.discovered}</p>
                </div>
              </div>
            `,
          )
          .join("")}
            ${planet.moons.count > 4
          ? `<div class="satellite-item more-satellites">
              <p>+ altri ${planet.moons.count - 4} satelliti
                <br>
                <br>
              </p>
            </div>`
          : ""
        }
          </div>
        </div>
      `
        : ""
      }
    </div>
  `

    // Show the popup
    popup.style.display = "block"

    // Add event listener to close button
    const closePopup = popup.querySelector(".close-popup")
    closePopup.addEventListener("click", () => {
      popup.style.display = "none"
    })

    // Close popup when clicking outside
    document.addEventListener(
      "click",
      (event) => {
        if (
          event.target !== popup &&
          !popup.contains(event.target) &&
          !event.target.classList.contains("planet") &&
          !event.target.classList.contains("sun")
        ) {
          popup.style.display = "none"
        }
      },
      { once: true },
    )

    // Add event listener for image zoom
    const galleryImage = popup.querySelector(".popup-gallery-image")
    if (galleryImage) {
      galleryImage.addEventListener("click", () => {
        showFullscreenImage(planet.gallery, planet.name)
      })
    }
  }

  // Function to show fullscreen image
  function showFullscreenImage(imageUrl, planetName) {
    // Create fullscreen container if it doesn't exist
    let fullscreenContainer = document.getElementById("fullscreenImageContainer")
    if (!fullscreenContainer) {
      fullscreenContainer = document.createElement("div")
      fullscreenContainer.id = "fullscreenImageContainer"
      fullscreenContainer.className = "fullscreen-image-container"
      document.body.appendChild(fullscreenContainer)
    }

    // Set the content
    fullscreenContainer.innerHTML = `
      <div class="fullscreen-image-content">
        <span class="close-fullscreen">&times;</span>
        <h2>${planetName}</h2>
        <div class="fullscreen-image" style="background-image: url(${imageUrl})"></div>
      </div>
    `

    // Show the fullscreen container
    fullscreenContainer.style.display = "flex"
    document.body.style.overflow = "hidden"

    // Add event listener to close button
    const closeFullscreen = fullscreenContainer.querySelector(".close-fullscreen")
    closeFullscreen.addEventListener("click", () => {
      fullscreenContainer.style.display = "none"
      document.body.style.overflow = "auto"
    })

    // Close fullscreen when clicking outside the image
    fullscreenContainer.addEventListener("click", (event) => {
      if (event.target === fullscreenContainer) {
        fullscreenContainer.style.display = "none"
        document.body.style.overflow = "auto"
      }
    })
  }
})
