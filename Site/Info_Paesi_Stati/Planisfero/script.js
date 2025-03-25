// Elementi DOM
const mapView = document.getElementById("map-view"),
  listView = document.getElementById("list-view"),
  toggleViewBtn = document.getElementById("toggle-view-btn"),
  worldMapContainer = document.getElementById("world-map-container"),
  countriesGrid = document.getElementById("countries-grid"),
  loadingIndicator = document.getElementById("loading"),
  popup = document.getElementById("country-popup"),
  closePopup = document.getElementById("close-popup"),
  zoomIn = document.getElementById("zoom-in"),
  zoomOut = document.getElementById("zoom-out"),
  zoomReset = document.getElementById("zoom-reset"),
  countrySearch = document.getElementById("country-search"),
  noResultsMessage = document.getElementById("no-results"),
  continentFiltersContainer = document.getElementById(
    "continent-filters-container"
  ),
  countriesByContinent = document.getElementById("countries-by-continent");

// Elementi del popup
const countryFlag = document.getElementById("country-flag"),
  countryName = document.getElementById("country-name"),
  nativeName = document.getElementById("native-name"),
  countryCapital = document.getElementById("country-capital"),
  countryPopulation = document.getElementById("country-population"),
  countryArea = document.getElementById("country-area"),
  countryRegion = document.getElementById("country-region"),
  countrySubregion = document.getElementById("country-subregion"),
  countryCurrencies = document.getElementById("country-currencies"),
  countryLanguages = document.getElementById("country-languages"),
  countryTimezones = document.getElementById("country-timezones"),
  borderCountries = document.getElementById("border-countries");

// Dati delle nazioni
let countriesData = {},
  selectedCountry = null,
  selectedCountryRegion = null, // Per tenere traccia del continente della nazione selezionata
  viewMode = "map", // 'map' o 'list'
  continents = {},
  continentsList = [], // Lista ordinata dei continenti
  activeContinents = new Set(["all"]), // Set per tenere traccia dei continenti attivi
  continentVisibility = {}; // Per tenere traccia della visibilità dei continenti

let scale = 1,
  translateX = 0,
  translateY = 0;

// Alterna tra vista mappa ed elenco
toggleViewBtn.addEventListener("click", () => {
  if (viewMode === "map") {
    mapView.style.display = "none";
    listView.style.display = "block";
    toggleViewBtn.textContent = "Passa alla vista mappa";
    viewMode = "list";

    // Aggiorna la visualizzazione per evidenziare il continente selezionato
    if (selectedCountryRegion) highlightContinent(selectedCountryRegion);
    updateCountriesDisplay();
  } else {
    mapView.style.display = "block";
    listView.style.display = "none";
    toggleViewBtn.textContent = "Passa alla vista elenco";
    viewMode = "map";
  }
});

// Controlli di zoom
zoomIn.addEventListener("click", () => {
  scale *= 1.2;
  updateMapTransform();
});

zoomOut.addEventListener("click", () => {
  scale /= 1.2;
  if (scale < 1) scale = 1;
  updateMapTransform();
});

zoomReset.addEventListener("click", () => {
  scale = 1;
  translateX = 0;
  translateY = 0;
  updateMapTransform();
});

function updateMapTransform() {
  const worldMap = document.getElementById("world-map");
  if (worldMap) {
    worldMap.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    worldMap.style.transformOrigin = "center";
  }
}

// Carica i dati delle nazioni dall'API
async function loadCountriesData() {
  loadingIndicator.style.display = "block";
  try {
    const response = await fetch("https://restcountries.com/v3.1/all");
    if (!response.ok)
      throw new Error("Impossibile caricare i dati delle nazioni");

    const data = await response.json();

    // Organizza i dati per codice ISO alpha-2 e alpha-3
    data.forEach((country) => {
      if (country.cca2) countriesData[country.cca2.toLowerCase()] = country;
      if (country.cca3) countriesData[country.cca3.toLowerCase()] = country;
    });

    // Organizza i paesi per continente
    organizeCountriesByContinent(data);

    // Carica il planisfero dettagliato
    await loadDetailedWorldMap();

    // Crea l'elenco dei paesi
    createCountriesList(data);

    // Crea i filtri per continente
    createContinentFilters();

    loadingIndicator.style.display = "none";
    return true;
  } catch (error) {
    console.error("Errore nel caricamento dei dati delle nazioni:", error);
    loadingIndicator.style.display = "none";
    worldMapContainer.innerHTML = `<div class="error-message">Errore nel caricamento dei dati: ${error.message}</div>`;
    return false;
  }
}

// Organizza i paesi per continente
function organizeCountriesByContinent(countries) {
  continents = {};

  // Raggruppa i paesi per continente
  countries.forEach((country) => {
    const region = country.region || "Altro";

    if (!continents[region]) {
      continents[region] = [];
      // Inizializza la visibilità del continente (true = visibile)
      continentVisibility[region] = true;
    }

    continents[region].push(country);
  });

  // Ordina i paesi all'interno di ogni continente
  for (const region in continents) {
    continents[region].sort((a, b) =>
      a.name.common.localeCompare(b.name.common)
    );
  }

  // Crea una lista ordinata dei continenti
  continentsList = Object.keys(continents).sort();
}

// Crea i filtri per continente
function createContinentFilters() {
  continentFiltersContainer.innerHTML = "";

  // Aggiungi il filtro "Tutti"
  const allFilter = document.createElement("div");
  allFilter.className = "continent-filter active";
  allFilter.textContent = "Tutti";
  allFilter.setAttribute("data-continent", "all");
  allFilter.addEventListener("click", () => {
    toggleContinentFilter("all");
  });

  continentFiltersContainer.appendChild(allFilter);

  // Aggiungi un filtro per ogni continente in ordine alfabetico
  continentsList.forEach((region) => {
    const continentFilter = document.createElement("div");
    continentFilter.className = "continent-filter";
    continentFilter.setAttribute("data-continent", region);

    // Aggiungi il nome del continente
    const continentName = document.createElement("span");
    continentName.textContent = region;
    continentFilter.appendChild(continentName);

    // Aggiungi il toggle per mostrare/nascondere i paesi del continente
    const continentToggle = document.createElement("span");
    continentToggle.className = "continent-toggle active";
    continentToggle.textContent = "v";
    continentToggle.setAttribute("data-continent", region);
    continentToggle.addEventListener("click", (e) => {
      e.stopPropagation(); // Evita che il click si propaghi al filtro del continente
      toggleContinentVisibility(region);
    });

    continentFilter.appendChild(continentToggle);

    // Aggiungi l'event listener per il filtro del continente
    continentFilter.addEventListener("click", () => {
      toggleContinentFilter(region);
    });

    continentFiltersContainer.appendChild(continentFilter);
  });
}

// Alterna l'attivazione di un continente
function toggleContinentFilter(continent) {
  if (continent === "all") {
    // Se si clicca su "Tutti", disattiva tutti gli altri filtri
    activeContinents.clear();
    activeContinents.add("all");
  } else {
    // Se si clicca su un continente specifico
    if (activeContinents.has("all")) {
      // Se "Tutti" è attivo, rimuovilo e aggiungi solo il continente selezionato
      activeContinents.clear();
      activeContinents.add(continent);
    } else if (activeContinents.has(continent)) {
      // Se il continente è già attivo, rimuovilo
      activeContinents.delete(continent);
      // Se non ci sono più continenti attivi, attiva "Tutti"
      if (activeContinents.size === 0) activeContinents.add("all");
    } else {
      // Altrimenti, aggiungi il continente ai filtri attivi
      activeContinents.add(continent);

      // Controlla se tutti i continenti sono selezionati
      checkAllContinentsSelected();
    }
  }

  // Aggiorna la classe active sui filtri
  updateContinentFiltersUI();

  // Aggiorna la visualizzazione dei paesi
  updateCountriesDisplay();
}

// Controlla se tutti i continenti sono selezionati e attiva "Tutti" in quel caso
function checkAllContinentsSelected() {
  // Se "Tutti" è già attivo, non fare nulla
  if (activeContinents.has("all")) return;

  // Controlla se tutti i continenti sono selezionati
  const allSelected = continentsList.every((continent) =>
    activeContinents.has(continent)
  );

  if (allSelected) {
    // Se tutti i continenti sono selezionati, attiva "Tutti" e rimuovi gli altri
    activeContinents.clear();
    activeContinents.add("all");
  }
}

// Aggiorna l'interfaccia utente dei filtri per continente
function updateContinentFiltersUI() {
  const filters = document.querySelectorAll(".continent-filter");
  filters.forEach((filter) => {
    const continent = filter.getAttribute("data-continent");
    if (activeContinents.has(continent)) {
      filter.classList.add("active");
    } else filter.classList.remove("active");
  });
}

// Alterna la visibilità dei paesi di un continente
function toggleContinentVisibility(continent) {
  continentVisibility[continent] = !continentVisibility[continent];

  // Aggiorna la classe active sul toggle
  const toggles = document.querySelectorAll(".continent-toggle");
  toggles.forEach((toggle) => {
    if (toggle.getAttribute("data-continent") === continent) {
      if (continentVisibility[continent]) {
        toggle.classList.add("active");
        toggle.classList.remove("inactive");
      } else {
        toggle.classList.remove("active");
        toggle.classList.add("inactive");
      }
    }
  });

  // Aggiorna la visualizzazione dei paesi
  updateCountriesDisplay();
}

// Evidenzia il continente di una nazione selezionata
function highlightContinent(region) {
  // Prima rimuovi tutte le evidenziazioni
  clearContinentHighlights();

  if (!region) return;

  // Evidenzia il filtro del continente
  const continentFilters = document.querySelectorAll(".continent-filter");
  continentFilters.forEach((filter) => {
    if (filter.getAttribute("data-continent") === region) {
      filter.classList.add("highlighted");

      // Evidenzia anche il toggle
      const toggle = filter.querySelector(".continent-toggle");
      if (toggle) toggle.classList.add("highlighted");
    }
  });

  // Evidenzia l'intestazione del continente nella lista
  const continentHeaders = document.querySelectorAll(".continent-header");
  continentHeaders.forEach((header) => {
    if (header.getAttribute("data-continent") === region) {
      header.classList.add("highlighted");

      // Evidenzia anche il toggle
      const toggle = header.querySelector(".continent-toggle");
      if (toggle) toggle.classList.add("highlighted");
    }
  });
}

// Rimuovi tutte le evidenziazioni dei continenti
function clearContinentHighlights() {
  // Rimuovi l'evidenziazione dai filtri
  const continentFilters = document.querySelectorAll(".continent-filter");
  continentFilters.forEach((filter) => {
    filter.classList.remove("highlighted");

    // Rimuovi anche dal toggle
    const toggle = filter.querySelector(".continent-toggle");
    if (toggle) toggle.classList.remove("highlighted");
  });

  // Rimuovi l'evidenziazione dalle intestazioni
  const continentHeaders = document.querySelectorAll(".continent-header");
  continentHeaders.forEach((header) => {
    header.classList.remove("highlighted");

    // Rimuovi anche dal toggle
    const toggle = header.querySelector(".continent-toggle");
    if (toggle) toggle.classList.remove("highlighted");
  });

  // Rimuovi l'evidenziazione dagli elementi paese
  const countryItems = document.querySelectorAll(".country-item");
  countryItems.forEach((item) => {
    item.classList.remove("selected");
  });
}

// Aggiorna la visualizzazione dei paesi in base al filtro e alla visibilità dei continenti
function updateCountriesDisplay() {
  const searchTerm = countrySearch.value.toLowerCase().trim();

  // Pulisci la visualizzazione attuale
  countriesByContinent.innerHTML = "";

  // Determina quali continenti mostrare
  let continentsToShow = [];

  if (activeContinents.has("all"))
    // Usa la lista ordinata dei continenti
    continentsToShow = [...continentsList];
  // Ordina i continenti attivi alfabeticamente
  else continentsToShow = Array.from(activeContinents).sort();

  // Crea una sezione per ogni continente da mostrare
  continentsToShow.forEach((region) => {
    // Salta il continente se è nascosto
    if (!continentVisibility[region]) return;

    const continentSection = document.createElement("div");
    continentSection.className = "continent-section";
    continentSection.setAttribute("data-continent", region);

    // Crea l'intestazione del continente
    const continentHeader = document.createElement("div");
    continentHeader.className = "continent-header";
    continentHeader.setAttribute("data-continent", region);

    // Evidenzia l'intestazione se corrisponde al continente della nazione selezionata
    if (region === selectedCountryRegion)
      continentHeader.classList.add("highlighted");

    const continentName = document.createElement("div");
    continentName.className = "continent-name";
    continentName.textContent = region;
    const continentToggle = document.createElement("span");
    continentToggle.className = "continent-toggle active";
    continentToggle.textContent = "v";
    continentToggle.setAttribute("data-continent", region);

    // Evidenzia il toggle se corrisponde al continente della nazione selezionata
    if (region === selectedCountryRegion)
      continentToggle.classList.add("highlighted");

    continentToggle.addEventListener("click", function () {
      const countriesContainer = continentSection.querySelector(
        ".continent-countries"
      );
      countriesContainer.classList.toggle("hidden");
      this.classList.toggle("active");

      // Mantieni l'evidenziazione anche quando si espande/comprime
      if (region === selectedCountryRegion) {
        this.classList.add("highlighted");
      }
    });

    continentHeader.appendChild(continentName);
    continentHeader.appendChild(continentToggle);
    continentSection.appendChild(continentHeader);

    // Crea il contenitore per i paesi di questo continente
    const countriesContainer = document.createElement("div");
    countriesContainer.className = "continent-countries";

    // Filtra i paesi in base al termine di ricerca
    const filteredCountries = continents[region].filter((country) =>
      country.name.common.toLowerCase().includes(searchTerm)
    );

    // Se non ci sono paesi che corrispondono alla ricerca, salta questo continente
    if (filteredCountries.length === 0) return;

    // Aggiungi i paesi filtrati
    filteredCountries.forEach((country) => {
      const countryItem = document.createElement("div");
      countryItem.className = "country-item";
      const countryId = country.cca3.toLowerCase();

      // Evidenzia il paese se è quello selezionato
      if (countryId === selectedCountry) countryItem.classList.add("selected");

      countryItem.textContent = country.name.common;
      countryItem.setAttribute("data-id", countryId);

      countryItem.addEventListener("click", function () {
        // Rimuovi la selezione da tutti i paesi
        const allCountryItems = document.querySelectorAll(".country-item");
        allCountryItems.forEach((item) => item.classList.remove("selected"));

        // Evidenzia questo paese
        this.classList.add("selected");

        const countryId = this.getAttribute("data-id");
        showCountryInfo(countryId);
      });

      countriesContainer.appendChild(countryItem);
    });

    continentSection.appendChild(countriesContainer);
    countriesByContinent.appendChild(continentSection);
  });

  // Mostra o nascondi il messaggio "nessuna nazione trovata"
  const hasResults = countriesByContinent.children.length > 0;
  noResultsMessage.style.display = searchTerm && !hasResults ? "block" : "none";
}

// Carica il planisfero dettagliato
async function loadDetailedWorldMap() {
  try {
    // Utilizziamo un servizio che fornisce SVG di mappe del mondo
    const response = await fetch(
      "https://unpkg.com/world-atlas@2.0.2/countries-110m.json"
    );
    if (!response.ok)
      throw new Error("Impossibile caricare la mappa dettagliata");

    const worldData = await response.json();

    // Crea la mappa SVG utilizzando i dati GeoJSON
    createWorldMapFromGeoJSON(worldData);
  } catch (error) {
    console.error("Errore nel caricamento della mappa dettagliata:", error);
    // Fallback alla mappa semplificata
    createSimplifiedWorldMap();
  }
}

// Crea la mappa mondiale da dati GeoJSON
const createWorldMapFromGeoJSON = () => createSimplifiedWorldMap();

// Crea una mappa mondiale semplificata
function createSimplifiedWorldMap() {
  const worldMapSvg = `
        <svg id="world-map" viewBox="0 0 1000 500" style="transition: transform 0.3s ease;">
          <rect x="0" y="0" width="1000" height="500" fill="#e6f7ff" />
          
          <!-- Continenti e paesi principali -->
          <!-- Nord America -->
          <path id="usa" class="country" d="M180,150 L280,150 L280,200 L180,200 Z" />
          <path id="can" class="country" d="M180,100 L280,100 L280,145 L180,145 Z" />
          <path id="mex" class="country" d="M180,205 L250,205 L250,230 L180,230 Z" />
          
          <!-- Sud America -->
          <path id="bra" class="country" d="M250,250 L300,250 L300,300 L250,300 Z" />
          <path id="arg" class="country" d="M250,305 L290,305 L290,340 L250,340 Z" />
          <path id="col" class="country" d="M220,235 L260,235 L260,260 L220,260 Z" />
          
          <!-- Europa -->
          <path id="gbr" class="country" d="M450,140 L470,140 L470,155 L450,155 Z" />
          <path id="fra" class="country" d="M450,160 L480,160 L480,175 L450,175 Z" />
          <path id="deu" class="country" d="M480,145 L500,145 L500,160 L480,160 Z" />
          <path id="ita" class="country" d="M470,175 L490,175 L490,195 L470,195 Z" />
          <path id="esp" class="country" d="M430,175 L450,175 L450,195 L430,195 Z" />
          
          <!-- Africa -->
          <path id="egy" class="country" d="M500,200 L530,200 L530,220 L500,220 Z" />
          <path id="nga" class="country" d="M470,230 L490,230 L490,250 L470,250 Z" />
          <path id="zaf" class="country" d="M490,280 L510,280 L510,300 L490,300 Z" />
          
          <!-- Asia -->
          <path id="rus" class="country" d="M500,100 L650,100 L650,150 L500,150 Z" />
          <path id="chn" class="country" d="M650,170 L700,170 L700,210 L650,210 Z" />
          <path id="ind" class="country" d="M630,210 L670,210 L670,240 L630,240 Z" />
          <path id="jpn" class="country" d="M730,170 L750,170 L750,190 L730,190 Z" />
          
          <!-- Oceania -->
          <path id="aus" class="country" d="M700,300 L750,300 L750,340 L700,340 Z" />
          <path id="nzl" class="country" d="M760,340 L780,340 L780,355 L760,355 Z" />
          
          <!-- Etichette dei paesi -->
          <text x="230" y="175" font-size="10" text-anchor="middle">USA</text>
          <text x="230" y="125" font-size="10" text-anchor="middle">Canada</text>
          <text x="215" y="220" font-size="10" text-anchor="middle">Messico</text>
          <text x="275" y="275" font-size="10" text-anchor="middle">Brasile</text>
          <text x="270" y="325" font-size="10" text-anchor="middle">Argentina</text>
          <text x="240" y="250" font-size="10" text-anchor="middle">Colombia</text>
          <text x="460" y="150" font-size="10" text-anchor="middle">UK</text>
          <text x="465" y="170" font-size="10" text-anchor="middle">Francia</text>
          <text x="490" y="155" font-size="10" text-anchor="middle">Germania</text>
          <text x="480" y="185" font-size="10" text-anchor="middle">Italia</text>
          <text x="440" y="185" font-size="10" text-anchor="middle">Spagna</text>
          <text x="515" y="210" font-size="10" text-anchor="middle">Egitto</text>
          <text x="480" y="240" font-size="10" text-anchor="middle">Nigeria</text>
          <text x="500" y="290" font-size="10" text-anchor="middle">Sudafrica</text>
          <text x="575" y="125" font-size="10" text-anchor="middle">Russia</text>
          <text x="675" y="190" font-size="10" text-anchor="middle">Cina</text>
          <text x="650" y="225" font-size="10" text-anchor="middle">India</text>
          <text x="740" y="180" font-size="10" text-anchor="middle">Giappone</text>
          <text x="725" y="320" font-size="10" text-anchor="middle">Australia</text>
          <text x="770" y="350" font-size="10" text-anchor="middle">N. Zelanda</text>
        </svg>
      `;

  worldMapContainer.innerHTML = worldMapSvg;

  // Aggiungi gli event listener ai paesi
  setupEventListeners();

  // Aggiungi la funzionalità di trascinamento
  setupDragFunctionality();
}

// Configura la funzionalità di trascinamento della mappa
function setupDragFunctionality() {
  const worldMap = document.getElementById("world-map");
  let isDragging = false,
    startX,
    startY,
    startTranslateX = translateX,
    startTranslateY = translateY;

  worldMap.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("country")) return; // Non trascinare quando si clicca su un paese

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startTranslateX = translateX;
    startTranslateY = translateY;
    worldMap.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX,
      dy = e.clientY - startY;

    translateX = startTranslateX + dx;
    translateY = startTranslateY + dy;

    updateMapTransform();
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    worldMap.style.cursor = "grab";
  });

  // Versione touch per dispositivi mobili
  worldMap.addEventListener("touchstart", (e) => {
    if (e.target.classList.contains("country")) return;

    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTranslateX = translateX;
    startTranslateY = translateY;
  });

  document.addEventListener("touchmove", (e) => {
    if (!isDragging) return;

    const dx = e.touches[0].clientX - startX,
      dy = e.touches[0].clientY - startY;

    translateX = startTranslateX + dx;
    translateY = startTranslateY + dy;

    updateMapTransform();
  });

  document.addEventListener("touchend", () => {
    isDragging = false;
  });
}

// Configura gli event listener
function setupEventListeners() {
  const countries = document.querySelectorAll(".country");

  countries.forEach((country) => {
    country.addEventListener("click", function () {
      const countryId = this.id.toLowerCase();

      // Resetta tutti i paesi
      countries.forEach((c) => c.classList.remove("selected"));

      // Evidenzia il paese selezionato
      this.classList.add("selected");
      selectedCountry = countryId;

      // Mostra le informazioni del paese
      showCountryInfo(countryId);
    });
  });

  // Chiudi il popup quando si clicca sul pulsante di chiusura
  closePopup.addEventListener("click", () => {
    popup.style.display = "none";
    // Rimuovi l'evidenziazione da tutti i paesi
    const countries = document.querySelectorAll(".country");
    countries.forEach((country) => country.classList.remove("selected"));
    selectedCountry = null;
    selectedCountryRegion = null;

    // Rimuovi l'evidenziazione dai continenti
    clearContinentHighlights();
  });

  // Chiudi il popup quando si clicca fuori dal contenuto del popup
  popup.addEventListener("click", (event) => {
    if (event.target === popup) {
      popup.style.display = "none";
      // Rimuovi l'evidenziazione da tutti i paesi
      const countries = document.querySelectorAll(".country");
      countries.forEach((country) => country.classList.remove("selected"));
      selectedCountry = null;
      selectedCountryRegion = null;

      // Rimuovi l'evidenziazione dai continenti
      clearContinentHighlights();
    }
  });
}

// Crea l'elenco dei paesi
function createCountriesList(countries) {
  // Aggiungi l'event listener per la ricerca
  countrySearch.addEventListener("input", () => {
    updateCountriesDisplay();
  });

  // Aggiungi l'event listener per resettare la ricerca quando si passa dalla vista mappa alla vista elenco
  toggleViewBtn.addEventListener("click", () => {
    if (viewMode === "list") {
      countrySearch.value = "";
      updateCountriesDisplay();
    }
  });
}

// Funzione per creare elementi di lista numerata
function createListItems(container, items) {
  container.innerHTML = "";

  if (!items || items.length === 0) {
    container.textContent = "N/A";
    return;
  }

  // Se c'è un solo elemento, mostralo come testo normale
  if (items.length === 1) {
    container.textContent = items[0];
    return;
  }

  // Creo un elenco numerato per più elementi
  const orderedList = document.createElement("ol");

  items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    orderedList.appendChild(listItem);
  });

  container.appendChild(orderedList);
}

// Calcola la densità di popolazione (abitanti per km²)
function calculatePopulationDensity(population, area) {
  if (!population || !area || area === 0) return "N/A";

  // Calcola la densità con due cifre decimali
  const density = (population / area).toFixed(2);

  // Formatta con due cifre decimali anche dopo l'unità di misura
  return `${density} ab/km²`;
}

// Mostra le informazioni del paese
function showCountryInfo(countryId) {
  const country = countriesData[countryId];

  if (country) {
    // Salva il continente della nazione selezionata
    selectedCountryRegion = country.region || null;

    // Evidenzia il continente nella vista elenco
    if (viewMode === "list" && selectedCountryRegion)
      highlightContinent(selectedCountryRegion);

    // Imposta le informazioni del paese
    countryFlag.src = country.flags.png;
    countryFlag.alt = `Bandiera di ${country.name.common}`;
    countryName.textContent = country.name.common;

    // Nome nativo (prendi il primo disponibile)
    if (country.name.nativeName) {
      const nativeNameKey = Object.keys(country.name.nativeName)[0];
      if (nativeNameKey)
        nativeName.textContent =
          country.name.nativeName[nativeNameKey].common || "";
      else nativeName.textContent = "";
    } else nativeName.textContent = "";

    // Capitale
    countryCapital.textContent = country.capital
      ? country.capital.join(", ")
      : "N/A";

    // Popolazione
    countryPopulation.textContent = country.population
      ? country.population.toLocaleString()
      : "N/A";

    // Area
    countryArea.textContent = country.area
      ? `${country.area.toLocaleString()} km²`
      : "N/A";

    // Aggiungi la densità di popolazione
    // Crea un nuovo elemento per la densità di popolazione
    const infoGrid = document.querySelector(".info-grid");

    // Verifica se l'elemento per la densità esiste già
    let densityItem = document.getElementById("density-item");
    if (!densityItem) {
      // Se non esiste, crealo
      densityItem = document.createElement("div");
      densityItem.className = "info-item";
      densityItem.id = "density-item";

      const densityLabel = document.createElement("div");
      densityLabel.className = "info-label";
      densityLabel.textContent = "Densità:";

      const densityValue = document.createElement("div");
      densityValue.className = "info-value";
      densityValue.id = "country-density";

      densityItem.appendChild(densityLabel);
      densityItem.appendChild(densityValue);

      // Inserisci dopo l'area
      const areaItem = document.querySelector(".info-item:nth-child(3)");
      if (areaItem && areaItem.nextSibling) {
        infoGrid.insertBefore(densityItem, areaItem.nextSibling);
      } else {
        infoGrid.appendChild(densityItem);
      }
    }

    // Aggiorna il valore della densità
    const countryDensity = document.getElementById("country-density");
    countryDensity.textContent = calculatePopulationDensity(
      country.population,
      country.area
    );

    // Regione e sottoregione
    countryRegion.textContent = country.region || "N/A";
    countrySubregion.textContent = country.subregion || "N/A";

    // Valute - Usa la nuova funzione per creare elementi di lista
    if (country.currencies) {
      const currencyItems = Object.values(country.currencies).map(
        (currency) => `${currency.name} (${currency.symbol || ""})`
      );
      createListItems(countryCurrencies, currencyItems);
    } else {
      countryCurrencies.textContent = "N/A";
    }

    // Lingue - Usa la nuova funzione per creare elementi di lista
    if (country.languages) {
      const languageItems = Object.values(country.languages);
      createListItems(countryLanguages, languageItems);
    } else {
      countryLanguages.textContent = "N/A";
    }

    // Fusi orari - Usa la nuova funzione per creare elementi di lista
    if (country.timezones && country.timezones.length > 0) {
      createListItems(countryTimezones, country.timezones);
    } else {
      countryTimezones.textContent = "N/A";
    }

    // Paesi confinanti
    borderCountries.innerHTML = "";
    if (country.borders && country.borders.length > 0) {
      // Se c'è un solo paese confinante, mostralo come elemento singolo
      if (country.borders.length === 1) {
        const borderCode = country.borders[0];
        const borderCountry = countriesData[borderCode.toLowerCase()];
        if (borderCountry) {
          const borderElement = document.createElement("div");
          borderElement.className = "border-country";
          borderElement.textContent = borderCountry.name.common;
          borderElement.addEventListener("click", () => {
            showCountryInfo(borderCode.toLowerCase());

            // Se siamo in modalità mappa, evidenzia il paese sulla mappa
            if (viewMode === "map") {
              const countries = document.querySelectorAll(".country");
              countries.forEach((c) => c.classList.remove("selected"));

              const borderCountryElement = document.getElementById(
                borderCode.toLowerCase()
              );
              if (borderCountryElement)
                borderCountryElement.classList.add("selected");
            }
          });
          borderCountries.appendChild(borderElement);
        }
      } else {
        // Se ci sono più paesi confinanti, crea un elenco numerato
        const orderedList = document.createElement("ol");
        orderedList.className = "borders-list-numbered";

        country.borders.forEach((borderCode) => {
          const borderCountry = countriesData[borderCode.toLowerCase()];
          if (borderCountry) {
            const listItem = document.createElement("li");
            listItem.className = "border-country-item";

            const borderLink = document.createElement("span");
            borderLink.className = "border-country";
            borderLink.textContent = borderCountry.name.common;
            borderLink.addEventListener("click", () => {
              showCountryInfo(borderCode.toLowerCase());

              // Se siamo in modalità mappa, evidenzia il paese sulla mappa
              if (viewMode === "map") {
                const countries = document.querySelectorAll(".country");
                countries.forEach((c) => c.classList.remove("selected"));

                const borderCountryElement = document.getElementById(
                  borderCode.toLowerCase()
                );
                if (borderCountryElement)
                  borderCountryElement.classList.add("selected");
              }
            });

            listItem.appendChild(borderLink);
            orderedList.appendChild(listItem);
          }
        });

        borderCountries.appendChild(orderedList);
      }
    } else borderCountries.textContent = "Nessun paese confinante";

    // Mostra il popup
    popup.style.display = "flex";
  } else console.error("Paese non trovato:", countryId);
}

// Carica i dati all'avvio
window.addEventListener("DOMContentLoaded", () => {
  loadCountriesData();
});
