document.addEventListener("DOMContentLoaded", () => {
    // Variabili globali
    let scale = 1;
    let planetData = {};
    const solarSystem = document.getElementById("solarSystem");
    const planetNameDisplay = document.getElementById("planetNameDisplay");
    const modal = document.getElementById("planetModal");
    const closeModal = document.querySelector(".close-modal");

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

        // Aggiungi evento click al sole
        sun.addEventListener("click", () => {
            showPlanetDetails("sole");
        });

        sun.addEventListener("mouseenter", () => {
            showPlanetName("Sole");
        });

        sun.addEventListener("mouseleave", () => {
            hidePlanetName();
        });

        // Crea orbite e pianeti
        Object.keys(planetData).forEach((planetKey) => {
            if (planetKey === "sole") return; // Salta il sole

            const planet = planetData[planetKey];

            // Crea orbita
            const orbit = document.createElement("div");
            orbit.className = "orbit";
            orbit.style.width = `${planet.orbitRadius * 2}px`;
            orbit.style.height = `${planet.orbitRadius * 2}px`;
            solarSystem.appendChild(orbit);

            // Crea il pianeta
            const planetElement = document.createElement("div");
            planetElement.className = `planet ${planetKey}`;
            planetElement.setAttribute("data-name", planetKey);
            planetElement.style.width = `${planet.size}px`;
            planetElement.style.height = `${planet.size}px`;
            planetElement.style.backgroundImage = `url(${planet.icon})`;
            planetElement.style.position = "absolute";
            planetElement.style.top = "50%";
            planetElement.style.left = "50%";
            planetElement.style.marginTop = `-${planet.size / 2}px`;
            planetElement.style.marginLeft = `-${planet.size / 2}px`;

            // Aggiungi anelli a Saturno se necessario
            if (planetKey === "saturno") {
                const rings = document.createElement("div");
                rings.className = "saturn-rings";
                rings.style.position = "absolute";
                rings.style.width = `${planet.size * 2}px`;
                rings.style.height = `${planet.size * 0.5}px`;
                rings.style.top = "50%";
                rings.style.left = "50%";
                rings.style.transform = "translate(-50%, -50%) rotateX(75deg)";
                rings.style.borderRadius = "50%";
                rings.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.3)";
                rings.style.background =
                    "linear-gradient(to right, rgba(210, 180, 140, 0), rgba(210, 180, 140, 0.8) 20%, rgba(210, 180, 140, 0.3) 40%, rgba(210, 180, 140, 0.8) 60%, rgba(210, 180, 140, 0))";
                rings.style.zIndex = "-1";
                planetElement.appendChild(rings);
            }

            solarSystem.appendChild(planetElement);

            // Aggiungi eventi
            planetElement.addEventListener("click", (e) => {
                e.stopPropagation();
                showPlanetDetails(planetKey);
            });

            planetElement.addEventListener("mouseenter", () => {
                showPlanetName(planet.name);
            });

            planetElement.addEventListener("mouseleave", () => {
                hidePlanetName();
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

    // Mostra i dettagli del pianeta nel modal
    function showPlanetDetails(planetKey) {
        const planet = planetData[planetKey];

        // Popola il modal con i dati del pianeta
        document.getElementById("modalPlanetName").textContent = planet.name;
        document.getElementById("modalPlanetType").textContent = planet.type;
        document.getElementById("modalPlanetIcon").style.backgroundImage = `url(${planet.icon})`;
        document.getElementById("modalDistance").textContent = planet.distance;
        document.getElementById("modalDiameter").textContent = planet.diameter;
        document.getElementById("modalOrbital").textContent = planet.orbital || "N/A";
        document.getElementById("modalMoons").textContent = planet.moons;
        document.getElementById("modalTemperature").textContent = planet.temperature;
        document.getElementById("modalDescription").textContent = planet.description;
        document.getElementById("modalGalleryImage").style.backgroundImage = `url(${planet.gallery})`;

        // Mostra il modal
        modal.style.display = "block";

        // Disabilita lo scroll della pagina
        document.body.style.overflow = "hidden";
    }

    // Chiudi il modal
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    });

    // Chiudi il modal cliccando fuori dal contenuto
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
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
