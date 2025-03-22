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
  zoomReset = document.getElementById("zoom-reset");

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
  viewMode = "map"; // 'map' o 'list'
let scale = 1,
  translateX = 0,
  translateY = 0;

// Alterna tra vista mappa ed elenco
toggleViewBtn.addEventListener("click", function () {
  if (viewMode === "map") {
    mapView.style.display = "none";
    listView.style.display = "block";
    toggleViewBtn.textContent = "Passa alla vista mappa";
    viewMode = "list";
  } else {
    mapView.style.display = "block";
    listView.style.display = "none";
    toggleViewBtn.textContent = "Passa alla vista elenco";
    viewMode = "map";
  }
});

// Controlli di zoom
zoomIn.addEventListener("click", function () {
  scale *= 1.2;
  updateMapTransform();
});

zoomOut.addEventListener("click", function () {
  scale /= 1.2;
  if (scale < 1) scale = 1;
  updateMapTransform();
});

zoomReset.addEventListener("click", function () {
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
      if (country.cca2) {
        countriesData[country.cca2.toLowerCase()] = country;
      }
      if (country.cca3) {
        countriesData[country.cca3.toLowerCase()] = country;
      }
    });

    // Carica il planisfero dettagliato
    await loadDetailedWorldMap();

    // Crea l'elenco dei paesi
    createCountriesList(data);

    loadingIndicator.style.display = "none";
    return true;
  } catch (error) {
    console.error("Errore nel caricamento dei dati delle nazioni:", error);
    loadingIndicator.style.display = "none";
    worldMapContainer.innerHTML = `<div class="error-message">Errore nel caricamento dei dati: ${error.message}</div>`;
    return false;
  }
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
function createWorldMapFromGeoJSON(geoData) {
  // Implementazione semplificata - in un'applicazione reale si userebbe D3.js o una libreria simile
  // per convertire correttamente i dati GeoJSON in SVG

  // Fallback alla mappa semplificata
  createSimplifiedWorldMap();
}

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

  worldMap.addEventListener("mousedown", function (e) {
    if (e.target.classList.contains("country")) return; // Non trascinare quando si clicca su un paese

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startTranslateX = translateX;
    startTranslateY = translateY;
    worldMap.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDragging) return;

    const dx = e.clientX - startX,
      dy = e.clientY - startY;

    translateX = startTranslateX + dx;
    translateY = startTranslateY + dy;

    updateMapTransform();
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
    worldMap.style.cursor = "grab";
  });

  // Versione touch per dispositivi mobili
  worldMap.addEventListener("touchstart", function (e) {
    if (e.target.classList.contains("country")) return;

    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTranslateX = translateX;
    startTranslateY = translateY;
  });

  document.addEventListener("touchmove", function (e) {
    if (!isDragging) return;

    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    translateX = startTranslateX + dx;
    translateY = startTranslateY + dy;

    updateMapTransform();
  });

  document.addEventListener("touchend", function () {
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
  closePopup.addEventListener("click", function () {
    popup.style.display = "none";
    // Rimuovi l'evidenziazione da tutti i paesi
    const countries = document.querySelectorAll(".country");
    countries.forEach((country) => country.classList.remove("selected"));
    selectedCountry = null;
  });

  // Chiudi il popup quando si clicca fuori dal contenuto del popup
  popup.addEventListener("click", function (event) {
    if (event.target === popup) {
      popup.style.display = "none";
      // Rimuovi l'evidenziazione da tutti i paesi
      const countries = document.querySelectorAll(".country");
      countries.forEach((country) => country.classList.remove("selected"));
      selectedCountry = null;
    }
  });
}

// Crea l'elenco dei paesi
function createCountriesList(countries) {
  // Pulisci l'elenco
  countriesGrid.innerHTML = "";

  // Ordina i paesi per nome
  countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

  // Crea un elemento per ogni paese
  countries.forEach((country) => {
    const countryItem = document.createElement("div");
    countryItem.className = "country-item";
    countryItem.textContent = country.name.common;
    countryItem.setAttribute("data-id", country.cca3.toLowerCase());

    // Aggiungi l'event listener per il click
    countryItem.addEventListener("click", function () {
      const countryId = this.getAttribute("data-id");
      showCountryInfo(countryId);
    });

    countriesGrid.appendChild(countryItem);
  });
}

// Mostra le informazioni del paese
function showCountryInfo(countryId) {
  const country = countriesData[countryId];

  if (country) {
    // Imposta le informazioni del paese
    countryFlag.src = country.flags.png;
    countryFlag.alt = `Bandiera di ${country.name.common}`;
    countryName.textContent = country.name.common;

    // Nome nativo (prendi il primo disponibile)
    if (country.name.nativeName) {
      const nativeNameKey = Object.keys(country.name.nativeName)[0];
      if (nativeNameKey) {
        nativeName.textContent =
          country.name.nativeName[nativeNameKey].common || "";
      } else nativeName.textContent = "";
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

    // Regione e sottoregione
    countryRegion.textContent = country.region || "N/A";
    countrySubregion.textContent = country.subregion || "N/A";

    // Valute
    if (country.currencies) {
      const currencyList = Object.values(country.currencies)
        .map((currency) => `${currency.name} (${currency.symbol || ""})`)
        .join(", ");
      countryCurrencies.textContent = currencyList || "N/A";
    } else countryCurrencies.textContent = "N/A";

    // Lingue
    if (country.languages) {
      const languageList = Object.values(country.languages).join(", ");
      countryLanguages.textContent = languageList || "N/A";
    } else {
      countryLanguages.textContent = "N/A";
    }

    // Fusi orari
    countryTimezones.textContent = country.timezones
      ? country.timezones.join(", ")
      : "N/A";

    // Paesi confinanti
    borderCountries.innerHTML = "";
    if (country.borders && country.borders.length > 0) {
      country.borders.forEach((borderCode) => {
        const borderCountry = countriesData[borderCode.toLowerCase()];
        if (borderCountry) {
          const borderElement = document.createElement("div");
          borderElement.className = "border-country";
          borderElement.textContent = borderCountry.name.common;
          borderElement.addEventListener("click", function () {
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
      });
    } else borderCountries.textContent = "Nessun paese confinante";

    // Mostra il popup
    popup.style.display = "flex";
  } else console.error("Paese non trovato:", countryId);
}

// Carica i dati all'avvio
window.addEventListener("DOMContentLoaded", function () {
  loadCountriesData();
});
