document.addEventListener("DOMContentLoaded", () => {
  // Variabili globali
  let scale = 1;
  let planetData = {};
  const solarSystem = document.getElementById("solarSystem");
  const planetNameDisplay = document.getElementById("planetNameDisplay");
  const infoModal = document.getElementById("infoModal");
  const closeModal = document.querySelector(".close-modal");
  const showInfoBtn = document.getElementById("showInfoBtn");
  const tabsHeader = document.getElementById("tabsHeader");
  const tabsContent = document.getElementById("tabsContent");

  // Controlli di zoom
  const zoomIn = document.getElementById("zoomIn");
  const zoomOut = document.getElementById("zoomOut");
  const resetView = document.getElementById("resetView");

  // Carica i dati dei pianeti dal file JSON
  fetch("planets.json")
    .then((response) => response.json())
    .then((data) => {
      planetData = data;
      initializeSolarSystem();
      initializeInfoModal();
    })
    .catch((error) => {
      console.error("Errore nel caricamento dei dati dei pianeti:", error);
    });

  // Inizializza il sistema solare
  function initializeSolarSystem() {
    // Crea il sole
    const sun = document.createElement("div");
    sun.className = "sun";
    sun.setAttribute("data-name", "sole");
    solarSystem.appendChild(sun);

    // Aggiungi evento mouseenter/mouseleave al sole
    sun.addEventListener("mouseenter", () => {
      showPlanetName("Sole");
    });

    sun.addEventListener("mouseleave", () => {
      hidePlanetName();
    });

    // Crea orbite e pianeti
    const planetKeys = Object.keys(planetData).filter((key) => key !== "sole");

    // Determina la posizione della fascia di asteroidi (tra Marte e Giove)
    const marteIndex = planetKeys.findIndex(key => key === "marte");
    const gioveIndex = planetKeys.findIndex(key => key === "giove");

    if (marteIndex !== -1 && gioveIndex !== -1) {
      const marteOrbitRadius = planetData["marte"].orbitRadius;
      const gioveOrbitRadius = planetData["giove"].orbitRadius;
      const asteroidBeltRadius = (marteOrbitRadius + gioveOrbitRadius) / 2;

      // Aggiungi fascia di asteroidi tra Marte e Giove
      const asteroidBelt = document.createElement("div");
      asteroidBelt.className = "asteroid-belt";
      asteroidBelt.style.width = `${asteroidBeltRadius * 2}px`;
      asteroidBelt.style.height = `${asteroidBeltRadius * 2}px`;
      solarSystem.appendChild(asteroidBelt);

      // Aggiungi evento mouseenter/mouseleave alla fascia di asteroidi
      asteroidBelt.addEventListener("mouseenter", () => {
        showPlanetName("Fascia di Asteroidi");
      });

      asteroidBelt.addEventListener("mouseleave", () => {
        hidePlanetName();
      });
    }

    planetKeys.forEach((planetKey, index) => {
      const planet = planetData[planetKey];

      // Determina se è un pianeta interno o esterno
      const isInnerPlanet = index < 4;
      const planetCategory = isInnerPlanet ? "inner-planet" : "outer-planet";

      // Crea orbita
      const orbit = document.createElement("div");
      orbit.className = `orbit ${planetCategory}`;
      orbit.style.width = `${planet.orbitRadius * 2}px`;
      orbit.style.height = `${planet.orbitRadius * 2}px`;
      solarSystem.appendChild(orbit);

      // Crea il pianeta
      const planetElement = document.createElement("div");
      planetElement.className = `planet ${planetKey} ${planetCategory}`;
      planetElement.setAttribute("data-name", planetKey);
      planetElement.setAttribute("data-category", isInnerPlanet ? "inner" : "outer");
      planetElement.style.width = `${planet.size}px`;
      planetElement.style.height = `${planet.size}px`;
      planetElement.style.backgroundImage = `url(${planet.icon})`;

      // Aggiungi badge di categoria al pianeta
      const categoryBadge = document.createElement("div");
      categoryBadge.className = `planet-category ${isInnerPlanet ? "inner" : "outer"}`;
      categoryBadge.textContent = isInnerPlanet ? "Pianeta Interno" : "Pianeta Esterno";
      planetElement.appendChild(categoryBadge);

      // Posiziona il pianeta inizialmente
      updatePlanetPosition(planetElement, planet.orbitRadius, 0);

      // Imposta gli attributi per l'animazione
      planetElement.setAttribute("data-orbit-radius", planet.orbitRadius);
      planetElement.setAttribute("data-orbit-period", planet.orbitPeriod);
      planetElement.setAttribute("data-orbit-start", Math.random() * Math.PI * 2);

      // Aggiungi anelli a Saturno se necessario
      if (planetKey === "saturno") {
        const rings = document.createElement("div");
        rings.className = "saturn-rings";
        rings.style.position = "absolute";
        rings.style.width = `${planet.size * 2}px`;
        rings.style.height = `${planet.size * 0.5}px`;
        rings.style.top = "50%";
        rings.style.left = "50%";
        rings.style.transform = "translate(-50%, -50%)";
        rings.style.borderRadius = "50%";
        rings.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.3)";
        rings.style.background =
          "linear-gradient(to right, rgba(210, 180, 140, 0), rgba(210, 180, 140, 0.8) 20%, rgba(210, 180, 140, 0.3) 40%, rgba(210, 180, 140, 0.8) 60%, rgba(210, 180, 140, 0))";
        rings.style.zIndex = "-1";
        planetElement.appendChild(rings);
      }

      // Aggiungi etichetta del pianeta
      const planetLabel = document.createElement("div");
      planetLabel.className = "planet-label";
      planetLabel.textContent = planet.name;
      planetLabel.style.color = isInnerPlanet ? "cyan" : "orange";
      solarSystem.appendChild(planetLabel);

      // Associa l'etichetta al pianeta
      planetElement.setAttribute("data-label", planetLabel.textContent);

      solarSystem.appendChild(planetElement);

      // Aggiungi eventi mouseenter/mouseleave
      planetElement.addEventListener("mouseenter", () => {
        const category = planetElement.getAttribute("data-category");
        showPlanetName(`${planet.name} (${category === "inner" ? "Pianeta Interno" : "Pianeta Esterno"})`);
      });

      planetElement.addEventListener("mouseleave", () => {
        hidePlanetName();
      });
    });

    // Avvia l'animazione dei pianeti
    animatePlanets();
  }

  // Funzione per aggiornare la posizione di un pianeta
  function updatePlanetPosition(planetElement, radius, angle) {
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    planetElement.style.left = `calc(50% + ${x}px)`;
    planetElement.style.top = `calc(50% + ${y}px)`;
    planetElement.style.transform = `translate(-50%, -50%)`;

    // Aggiorna anche la posizione dell'etichetta
    const planetName = planetElement.getAttribute("data-label");
    if (planetName) {
      const label = Array.from(document.querySelectorAll(".planet-label")).find(
        label => label.textContent === planetName
      );

      if (label) {
        label.style.left = `calc(50% + ${x}px)`;
        label.style.top = `calc(50% + ${y - 20}px)`;
      }
    }
  }

  // Funzione per animare i pianeti nelle loro orbite
  function animatePlanets() {
    const planets = document.querySelectorAll(".planet");

    function animate() {
      const now = Date.now() / 1000; // Tempo corrente in secondi

      planets.forEach((planet) => {
        const radius = parseFloat(planet.getAttribute("data-orbit-radius"));
        const period = parseFloat(planet.getAttribute("data-orbit-period"));
        const startAngle = parseFloat(planet.getAttribute("data-orbit-start"));

        // Calcola l'angolo corrente in base al tempo
        const angle = startAngle + (now / period) * Math.PI * 2;

        // Aggiorna la posizione del pianeta
        updatePlanetPosition(planet, radius, angle);
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // Inizializza il modal con le informazioni di tutti i pianeti
  function initializeInfoModal() {
    // Crea le tab per ogni pianeta (incluso il sole)
    Object.keys(planetData).forEach((planetKey, index) => {
      const planet = planetData[planetKey];

      // Determina se è un pianeta interno o esterno (escludi il sole)
      let categoryClass = "";
      let categoryBadge = "";

      if (planetKey !== "sole") {
        const isInnerPlanet = index <= 4; // Il sole è index 0, quindi i pianeti interni sono 1-4
        categoryClass = isInnerPlanet ? "inner-planet" : "outer-planet";
        categoryBadge = `<span class="planet-category-badge ${isInnerPlanet ? "inner" : "outer"}">
                    ${isInnerPlanet ? "Pianeta Interno" : "Pianeta Esterno"}
                </span>`;
      }

      // Crea il pulsante della tab
      const tabButton = document.createElement("button");
      tabButton.className = `tab-button ${categoryClass} ${index === 0 ? "active" : ""}`;
      tabButton.setAttribute("data-tab", planetKey);

      // Aggiungi icona e nome
      const tabIcon = document.createElement("div");
      tabIcon.className = "tab-icon";
      tabIcon.style.backgroundImage = `url(${planet.icon})`;

      tabButton.appendChild(tabIcon);
      tabButton.appendChild(document.createTextNode(planet.name));

      tabsHeader.appendChild(tabButton);

      // Crea il contenuto della tab
      const tabContent = document.createElement("div");
      tabContent.className = `tab-content ${index === 0 ? "active" : ""}`;
      tabContent.setAttribute("id", `tab-${planetKey}`);

      // Prepara i fatti da mostrare, escludendo quelli senza dati
      let factsHTML = "";

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
        `;
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
        `;
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
        `;
      }

      // Lune
      if (planet.moons) {
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
              <p>${planet.moons}</p>
            </div>
          </div>
        `;
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
        `;
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
        </div>
      `;

      tabsContent.appendChild(tabContent);
    });

    // Aggiungi tab per la fascia di asteroidi
    const asteroidTabButton = document.createElement("button");
    asteroidTabButton.className = "tab-button";
    asteroidTabButton.setAttribute("data-tab", "asteroid-belt");

    // Icona per la fascia di asteroidi
    const asteroidIcon = document.createElement("div");
    asteroidIcon.className = "tab-icon";
    asteroidIcon.style.backgroundImage =
      "url('https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Asteroid_Belt.jpg/440px-Asteroid_Belt.jpg')";

    asteroidTabButton.appendChild(asteroidIcon);
    asteroidTabButton.appendChild(document.createTextNode("Fascia di Asteroidi"));

    // Inserisci la tab della fascia di asteroidi tra Marte e Giove
    const marsIndex = Array.from(tabsHeader.children).findIndex((tab) => tab.getAttribute("data-tab") === "marte");
    if (marsIndex !== -1) {
      tabsHeader.insertBefore(asteroidTabButton, tabsHeader.children[marsIndex + 2]);
    } else {
      tabsHeader.appendChild(asteroidTabButton);
    }

    // Crea il contenuto della tab per la fascia di asteroidi
    const asteroidTabContent = document.createElement("div");
    asteroidTabContent.className = "tab-content";
    asteroidTabContent.setAttribute("id", "tab-asteroid-belt");

    // Popola il contenuto della tab
    asteroidTabContent.innerHTML = `
        <div class="planet-info">
          <div class="planet-header">
            <div class="planet-image" style="background-image: url('https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Asteroid_Belt.jpg/440px-Asteroid_Belt.jpg')"></div>
            <div class="planet-title">
              <h2>Fascia di Asteroidi</h2>
              <p>Regione del Sistema Solare</p>
            </div>
          </div>
          
          <div class="planet-facts">
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
                <h3>Posizione</h3>
                <p>Tra Marte e Giove</p>
              </div>
            </div>
            
            <div class="fact">
              <div class="fact-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z"></path>
                </svg>
              </div>
              <div class="fact-content">
                <h3>Distanza dal Sole</h3>
                <p>2,2 - 3,2 UA</p>
              </div>
            </div>
            
            <div class="fact">
              <div class="fact-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
              </div>
              <div class="fact-content">
                <h3>Numero di Asteroidi</h3>
                <p>Oltre 1 milione</p>
              </div>
            </div>
            
            <div class="fact">
              <div class="fact-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                </svg>
              </div>
              <div class="fact-content">
                <h3>Asteroide più grande</h3>
                <p>Cerere (940 km)</p>
              </div>
            </div>
          </div>
          
          <div class="planet-description">
            <h3>Descrizione</h3>
            <p>La Fascia di Asteroidi è una regione del Sistema Solare situata tra le orbite di Marte e Giove. È popolata da numerosi oggetti irregolari chiamati asteroidi o pianetini. Nonostante l'impressione comune, la fascia di asteroidi non è densamente popolata e le sonde spaziali possono attraversarla senza problemi. Si ritiene che la fascia di asteroidi sia composta da materiale che non è riuscito a formare un pianeta a causa dell'influenza gravitazionale di Giove. Cerere, il più grande oggetto nella fascia, è classificato come un pianeta nano.</p>
          </div>
          
          <div class="planet-gallery">
            <div class="gallery-image" style="background-image: url('https://solarsystem.nasa.gov/system/resources/detail_files/2318_ast_belt_art_full.jpg')"></div>
          </div>
        </div>
      `;

    tabsContent.appendChild(asteroidTabContent);

    // Aggiungi event listener alle tab
    const tabButtons = document.querySelectorAll(".tab-button");
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabId = button.getAttribute("data-tab");

        // Rimuovi la classe active da tutte le tab
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"));

        // Aggiungi la classe active alla tab selezionata
        button.classList.add("active");
        document.getElementById(`tab-${tabId}`).classList.add("active");
      });
    });
  }

  // Mostra il nome del pianeta al passaggio del mouse
  function showPlanetName(name) {
    planetNameDisplay.textContent = name;
    planetNameDisplay.style.opacity = "1";
  }

  // Nasconde il nome del pianeta
  function hidePlanetName() {
    planetNameDisplay.style.opacity = "0";
  }

  // Mostra il modal con le informazioni
  showInfoBtn.addEventListener("click", () => {
    infoModal.style.display = "block";
    document.body.style.overflow = "hidden";
  });

  // Chiudi il modal
  closeModal.addEventListener("click", () => {
    infoModal.style.display = "none";
    document.body.style.overflow = "auto";
  });

  // Chiudi il modal cliccando fuori dal contenuto
  window.addEventListener("click", (event) => {
    if (event.target === infoModal) {
      infoModal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });

  // Controlli di zoom
  zoomIn.addEventListener("click", () => {
    scale *= 1.2;
    updateScale();
  });

  zoomOut.addEventListener("click", () => {
    scale *= 0.8;
    updateScale();
  });

  resetView.addEventListener("click", () => {
    scale = 1;
    updateScale();
  });

  function updateScale() {
    solarSystem.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  // Gestione del ridimensionamento della finestra
  window.addEventListener("resize", () => {
    adjustSolarSystemForScreenSize();
  });

  function adjustSolarSystemForScreenSize() {
    const width = window.innerWidth;
    let baseScale = 1;

    if (width < 480) {
      baseScale = 0.3;
    } else if (width < 768) {
      baseScale = 0.5;
    } else if (width < 1024) {
      baseScale = 0.7;
    } else if (width < 1200) {
      baseScale = 0.9;
    }

    scale = baseScale;
    updateScale();
  }

  // Inizializza la scala in base alla dimensione dello schermo
  adjustSolarSystemForScreenSize();
});
