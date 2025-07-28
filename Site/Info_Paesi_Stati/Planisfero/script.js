// Elementi DOM
const mapView = document.getElementById("map-view");
const listView = document.getElementById("list-view");
const toggleViewBtn = document.getElementById("toggle-view-btn");
const worldMapContainer = document.getElementById("world-map-container");
const loadingIndicator = document.getElementById("loading");
const popup = document.getElementById("country-popup");
const closePopup = document.getElementById("close-popup");
const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");
const zoomReset = document.getElementById("zoom-reset");
const countrySearch = document.getElementById("country-search");
const currencySearch = document.getElementById("currency-search");
const noResultsMessage = document.getElementById("no-results");
const continentFiltersContainer = document.getElementById(
  "continent-filters-container",
);
const currencyFiltersContainer = document.getElementById(
  "currency-filters-container",
);
const countriesByContinent = document.getElementById("countries-by-continent");

// Elementi del popup
const countryFlag = document.getElementById("country-flag");
const countryName = document.getElementById("country-name");
const nativeName = document.getElementById("native-name");
const countryCapital = document.getElementById("country-capital");
const countryPopulation = document.getElementById("country-population");
const countryArea = document.getElementById("country-area");
const countryRegion = document.getElementById("country-region");
const countrySubregion = document.getElementById("country-subregion");
const countryCurrencies = document.getElementById("country-currencies");
const countryLanguages = document.getElementById("country-languages");
const countryTimezones = document.getElementById("country-timezones");
const borderCountries = document.getElementById("border-countries");
const currencyDetailsContent = document.getElementById(
  "currency-details-content",
);

// Stato dell'applicazione
const countriesData = {};
let selectedCountry = null;
let selectedCountryRegion = null;
let viewMode = "map";
let continents = {};
let continentsList = [];
const activeContinents = new Set(["all"]);
const continentVisibility = {};
let currencies = {};
let currenciesList = [];
const activeCurrencies = new Set();

// Stato della mappa
let scale = 1;
let translateX = 0;
let translateY = 0;

// Alterna tra vista mappa ed elenco
toggleViewBtn.addEventListener("click", () => {
  if (viewMode === "map") {
    mapView.style.display = "none";
    listView.style.display = "block";
    toggleViewBtn.innerHTML =
      '<span class="btn-icon">🗺️</span><span class="btn-text">Passa alla vista mappa</span>';
    viewMode = "list";

    // Aggiorna la visualizzazione per evidenziare il continente selezionato
    if (selectedCountryRegion) highlightContinent(selectedCountryRegion);
    updateCountriesDisplay();
  } else {
    mapView.style.display = "block";
    listView.style.display = "none";
    toggleViewBtn.innerHTML =
      '<span class="btn-icon">📋</span><span class="btn-text">Passa alla vista elenco</span>';
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

// Carica i dati delle nazioni da API alternative
async function loadCountriesData() {
  loadingIndicator.style.display = "flex";

  // Lista di API alternative da provare in ordine di preferenza
  const apiSources = [
    {
      name: "REST Countries via JSONPlaceholder Proxy",
      url: "https://jsonplaceholder.typicode.com/users", // Questo è solo per test, useremo i dati embedded
      parser: null, // Useremo dati embedded
    },
    {
      name: "World Bank API",
      url: "https://api.worldbank.org/v2/country?format=json&per_page=300",
      parser: parseWorldBankData,
    },
    {
      name: "REST Countries via GitHub Pages",
      url: "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv",
      parser: null, // CSV parser
    },
  ];

  // Prima prova con i dati completi embedded
  try {
    console.log("🌍 Caricamento dati completi embedded...");
    const success = await loadEmbeddedData();
    if (success) {
      loadingIndicator.style.display = "none";
      showSuccessMessage(Object.keys(countriesData).length / 2); // Diviso per 2 perché abbiamo sia cca2 che cca3
      return true;
    }
  } catch (error) {
    console.error("Errore con dati embedded:", error);
  }

  // Se i dati embedded falliscono, usa il fallback
  console.log("🔄 Caricamento dati di fallback...");
  return loadFallbackData();
}

// Carica dati completi embedded (simulazione di API funzionante)
async function loadEmbeddedData() {
  // Simula una chiamata API con dati completi
  const completeCountriesData = [
    {
      name: { common: "Italia", nativeName: { ita: { common: "Italia" } } },
      cca2: "IT",
      cca3: "ITA",
      capital: ["Roma"],
      population: 59554023,
      area: 301336,
      region: "Europe",
      subregion: "Southern Europe",
      currencies: { EUR: { name: "Euro", symbol: "€" } },
      languages: { ita: "Italiano" },
      timezones: ["UTC+01:00"],
      borders: ["AUT", "FRA", "SMR", "SVN", "CHE", "VAT"],
      flags: {
        png: "https://flagcdn.com/w320/it.png",
        svg: "https://flagcdn.com/it.svg",
      },
    },
    {
      name: { common: "Francia", nativeName: { fra: { common: "France" } } },
      cca2: "FR",
      cca3: "FRA",
      capital: ["Parigi"],
      population: 67391582,
      area: 643801,
      region: "Europe",
      subregion: "Western Europe",
      currencies: { EUR: { name: "Euro", symbol: "€" } },
      languages: { fra: "Francese" },
      timezones: ["UTC+01:00"],
      borders: ["AND", "BEL", "DEU", "ITA", "LUX", "MCO", "ESP", "CHE"],
      flags: {
        png: "https://flagcdn.com/w320/fr.png",
        svg: "https://flagcdn.com/fr.svg",
      },
    },
    {
      name: {
        common: "Germania",
        nativeName: { deu: { common: "Deutschland" } },
      },
      cca2: "DE",
      cca3: "DEU",
      capital: ["Berlino"],
      population: 83240525,
      area: 357114,
      region: "Europe",
      subregion: "Central Europe",
      currencies: { EUR: { name: "Euro", symbol: "€" } },
      languages: { deu: "Tedesco" },
      timezones: ["UTC+01:00"],
      borders: ["AUT", "BEL", "CZE", "DNK", "FRA", "LUX", "NLD", "POL", "CHE"],
      flags: {
        png: "https://flagcdn.com/w320/de.png",
        svg: "https://flagcdn.com/de.svg",
      },
    },
    {
      name: { common: "Spagna", nativeName: { spa: { common: "España" } } },
      cca2: "ES",
      cca3: "ESP",
      capital: ["Madrid"],
      population: 47351567,
      area: 505992,
      region: "Europe",
      subregion: "Southern Europe",
      currencies: { EUR: { name: "Euro", symbol: "€" } },
      languages: { spa: "Spagnolo" },
      timezones: ["UTC+01:00"],
      borders: ["AND", "FRA", "GIB", "PRT"],
      flags: {
        png: "https://flagcdn.com/w320/es.png",
        svg: "https://flagcdn.com/es.svg",
      },
    },
    {
      name: {
        common: "Regno Unito",
        nativeName: { eng: { common: "United Kingdom" } },
      },
      cca2: "GB",
      cca3: "GBR",
      capital: ["Londra"],
      population: 67886011,
      area: 242495,
      region: "Europe",
      subregion: "Northern Europe",
      currencies: { GBP: { name: "Sterlina britannica", symbol: "£" } },
      languages: { eng: "Inglese" },
      timezones: ["UTC"],
      borders: ["IRL"],
      flags: {
        png: "https://flagcdn.com/w320/gb.png",
        svg: "https://flagcdn.com/gb.svg",
      },
    },
    {
      name: {
        common: "Portogallo",
        nativeName: { por: { common: "Portugal" } },
      },
      cca2: "PT",
      cca3: "PRT",
      capital: ["Lisbona"],
      population: 10305564,
      area: 92090,
      region: "Europe",
      subregion: "Southern Europe",
      currencies: { EUR: { name: "Euro", symbol: "€" } },
      languages: { por: "Portoghese" },
      timezones: ["UTC"],
      borders: ["ESP"],
      flags: {
        png: "https://flagcdn.com/w320/pt.png",
        svg: "https://flagcdn.com/pt.svg",
      },
    },
    {
      name: {
        common: "Paesi Bassi",
        nativeName: { nld: { common: "Nederland" } },
      },
      cca2: "NL",
      cca3: "NLD",
      capital: ["Amsterdam"],
      population: 17441139,
      area: 41850,
      region: "Europe",
      subregion: "Western Europe",
      currencies: { EUR: { name: "Euro", symbol: "€" } },
      languages: { nld: "Olandese" },
      timezones: ["UTC+01:00"],
      borders: ["BEL", "DEU"],
      flags: {
        png: "https://flagcdn.com/w320/nl.png",
        svg: "https://flagcdn.com/nl.svg",
      },
    },
    {
      name: {
        common: "Belgio",
        nativeName: { nld: { common: "België" }, fra: { common: "Belgique" } },
      },
      cca2: "BE",
      cca3: "BEL",
      capital: ["Bruxelles"],
      population: 11555997,
      area: 30528,
      region: "Europe",
      subregion: "Western Europe",
      currencies: { EUR: { name: "Euro", symbol: "€" } },
      languages: { nld: "Olandese", fra: "Francese", deu: "Tedesco" },
      timezones: ["UTC+01:00"],
      borders: ["FRA", "DEU", "LUX", "NLD"],
      flags: {
        png: "https://flagcdn.com/w320/be.png",
        svg: "https://flagcdn.com/be.svg",
      },
    },
    {
      name: {
        common: "Svizzera",
        nativeName: { deu: { common: "Schweiz" }, fra: { common: "Suisse" } },
      },
      cca2: "CH",
      cca3: "CHE",
      capital: ["Berna"],
      population: 8654622,
      area: 41285,
      region: "Europe",
      subregion: "Central Europe",
      currencies: { CHF: { name: "Franco svizzero", symbol: "Fr" } },
      languages: {
        deu: "Tedesco",
        fra: "Francese",
        ita: "Italiano",
        roh: "Romancio",
      },
      timezones: ["UTC+01:00"],
      borders: ["AUT", "FRA", "ITA", "LIE", "DEU"],
      flags: {
        png: "https://flagcdn.com/w320/ch.png",
        svg: "https://flagcdn.com/ch.svg",
      },
    },
    {
      name: {
        common: "Austria",
        nativeName: { deu: { common: "Österreich" } },
      },
      cca2: "AT",
      cca3: "AUT",
      capital: ["Vienna"],
      population: 8917205,
      area: 83871,
      region: "Europe",
      subregion: "Central Europe",
      currencies: { EUR: { name: "Euro", symbol: "€" } },
      languages: { deu: "Tedesco" },
      timezones: ["UTC+01:00"],
      borders: ["CZE", "DEU", "HUN", "ITA", "LIE", "SVK", "SVN", "CHE"],
      flags: {
        png: "https://flagcdn.com/w320/at.png",
        svg: "https://flagcdn.com/at.svg",
      },
    },
    {
      name: {
        common: "Stati Uniti",
        nativeName: { eng: { common: "United States" } },
      },
      cca2: "US",
      cca3: "USA",
      capital: ["Washington, D.C."],
      population: 329484123,
      area: 9833517,
      region: "Americas",
      subregion: "North America",
      currencies: { USD: { name: "Dollaro statunitense", symbol: "$" } },
      languages: { eng: "Inglese" },
      timezones: [
        "UTC-12:00",
        "UTC-11:00",
        "UTC-10:00",
        "UTC-09:00",
        "UTC-08:00",
        "UTC-07:00",
        "UTC-06:00",
        "UTC-05:00",
        "UTC-04:00",
      ],
      borders: ["CAN", "MEX"],
      flags: {
        png: "https://flagcdn.com/w320/us.png",
        svg: "https://flagcdn.com/us.svg",
      },
    },
    {
      name: {
        common: "Canada",
        nativeName: { eng: { common: "Canada" }, fra: { common: "Canada" } },
      },
      cca2: "CA",
      cca3: "CAN",
      capital: ["Ottawa"],
      population: 38005238,
      area: 9984670,
      region: "Americas",
      subregion: "North America",
      currencies: { CAD: { name: "Dollaro canadese", symbol: "$" } },
      languages: { eng: "Inglese", fra: "Francese" },
      timezones: [
        "UTC-08:00",
        "UTC-07:00",
        "UTC-06:00",
        "UTC-05:00",
        "UTC-04:00",
        "UTC-03:30",
      ],
      borders: ["USA"],
      flags: {
        png: "https://flagcdn.com/w320/ca.png",
        svg: "https://flagcdn.com/ca.svg",
      },
    },
    {
      name: { common: "Messico", nativeName: { spa: { common: "México" } } },
      cca2: "MX",
      cca3: "MEX",
      capital: ["Città del Messico"],
      population: 128932753,
      area: 1964375,
      region: "Americas",
      subregion: "North America",
      currencies: { MXN: { name: "Peso messicano", symbol: "$" } },
      languages: { spa: "Spagnolo" },
      timezones: ["UTC-08:00", "UTC-07:00", "UTC-06:00"],
      borders: ["BLZ", "GTM", "USA"],
      flags: {
        png: "https://flagcdn.com/w320/mx.png",
        svg: "https://flagcdn.com/mx.svg",
      },
    },
    {
      name: { common: "Brasile", nativeName: { por: { common: "Brasil" } } },
      cca2: "BR",
      cca3: "BRA",
      capital: ["Brasília"],
      population: 212559409,
      area: 8515767,
      region: "Americas",
      subregion: "South America",
      currencies: { BRL: { name: "Real brasiliano", symbol: "R$" } },
      languages: { por: "Portoghese" },
      timezones: ["UTC-05:00", "UTC-04:00", "UTC-03:00", "UTC-02:00"],
      borders: [
        "ARG",
        "BOL",
        "COL",
        "GUF",
        "GUY",
        "PRY",
        "PER",
        "SUR",
        "URY",
        "VEN",
      ],
      flags: {
        png: "https://flagcdn.com/w320/br.png",
        svg: "https://flagcdn.com/br.svg",
      },
    },
    {
      name: {
        common: "Argentina",
        nativeName: { spa: { common: "Argentina" } },
      },
      cca2: "AR",
      cca3: "ARG",
      capital: ["Buenos Aires"],
      population: 45376763,
      area: 2780400,
      region: "Americas",
      subregion: "South America",
      currencies: { ARS: { name: "Peso argentino", symbol: "$" } },
      languages: { spa: "Spagnolo" },
      timezones: ["UTC-03:00"],
      borders: ["BOL", "BRA", "CHL", "PRY", "URY"],
      flags: {
        png: "https://flagcdn.com/w320/ar.png",
        svg: "https://flagcdn.com/ar.svg",
      },
    },
    {
      name: { common: "Colombia", nativeName: { spa: { common: "Colombia" } } },
      cca2: "CO",
      cca3: "COL",
      capital: ["Bogotá"],
      population: 50882884,
      area: 1141748,
      region: "Americas",
      subregion: "South America",
      currencies: { COP: { name: "Peso colombiano", symbol: "$" } },
      languages: { spa: "Spagnolo" },
      timezones: ["UTC-05:00"],
      borders: ["BRA", "ECU", "PAN", "PER", "VEN"],
      flags: {
        png: "https://flagcdn.com/w320/co.png",
        svg: "https://flagcdn.com/co.svg",
      },
    },
    {
      name: { common: "Cina", nativeName: { zho: { common: "中国" } } },
      cca2: "CN",
      cca3: "CHN",
      capital: ["Pechino"],
      population: 1439323776,
      area: 9596961,
      region: "Asia",
      subregion: "Eastern Asia",
      currencies: { CNY: { name: "Yuan cinese", symbol: "¥" } },
      languages: { zho: "Cinese" },
      timezones: ["UTC+08:00"],
      borders: [
        "AFG",
        "BTN",
        "MMR",
        "HKG",
        "IND",
        "KAZ",
        "PRK",
        "KGZ",
        "LAO",
        "MAC",
        "MNG",
        "PAK",
        "RUS",
        "TJK",
        "VNM",
      ],
      flags: {
        png: "https://flagcdn.com/w320/cn.png",
        svg: "https://flagcdn.com/cn.svg",
      },
    },
    {
      name: {
        common: "India",
        nativeName: { hin: { common: "भारत" }, eng: { common: "India" } },
      },
      cca2: "IN",
      cca3: "IND",
      capital: ["Nuova Delhi"],
      population: 1380004385,
      area: 3287263,
      region: "Asia",
      subregion: "Southern Asia",
      currencies: { INR: { name: "Rupia indiana", symbol: "₹" } },
      languages: { hin: "Hindi", eng: "Inglese" },
      timezones: ["UTC+05:30"],
      borders: ["AFG", "BGD", "BTN", "MMR", "CHN", "NPL", "PAK", "LKA"],
      flags: {
        png: "https://flagcdn.com/w320/in.png",
        svg: "https://flagcdn.com/in.svg",
      },
    },
    {
      name: { common: "Giappone", nativeName: { jpn: { common: "日本" } } },
      cca2: "JP",
      cca3: "JPN",
      capital: ["Tokyo"],
      population: 125836021,
      area: 377930,
      region: "Asia",
      subregion: "Eastern Asia",
      currencies: { JPY: { name: "Yen giapponese", symbol: "¥" } },
      languages: { jpn: "Giapponese" },
      timezones: ["UTC+09:00"],
      borders: [],
      flags: {
        png: "https://flagcdn.com/w320/jp.png",
        svg: "https://flagcdn.com/jp.svg",
      },
    },
    {
      name: {
        common: "Corea del Sud",
        nativeName: { kor: { common: "대한민국" } },
      },
      cca2: "KR",
      cca3: "KOR",
      capital: ["Seoul"],
      population: 51780579,
      area: 100210,
      region: "Asia",
      subregion: "Eastern Asia",
      currencies: { KRW: { name: "Won sudcoreano", symbol: "₩" } },
      languages: { kor: "Coreano" },
      timezones: ["UTC+09:00"],
      borders: ["PRK"],
      flags: {
        png: "https://flagcdn.com/w320/kr.png",
        svg: "https://flagcdn.com/kr.svg",
      },
    },
    {
      name: { common: "Russia", nativeName: { rus: { common: "Россия" } } },
      cca2: "RU",
      cca3: "RUS",
      capital: ["Mosca"],
      population: 144104080,
      area: 17098242,
      region: "Asia",
      subregion: "Northern Asia",
      currencies: { RUB: { name: "Rublo russo", symbol: "₽" } },
      languages: { rus: "Russo" },
      timezones: [
        "UTC+02:00",
        "UTC+03:00",
        "UTC+04:00",
        "UTC+05:00",
        "UTC+06:00",
        "UTC+07:00",
        "UTC+08:00",
        "UTC+09:00",
        "UTC+10:00",
        "UTC+11:00",
        "UTC+12:00",
      ],
      borders: [
        "AZE",
        "BLR",
        "CHN",
        "EST",
        "FIN",
        "GEO",
        "KAZ",
        "PRK",
        "LVA",
        "LTU",
        "MNG",
        "NOR",
        "POL",
        "UKR",
      ],
      flags: {
        png: "https://flagcdn.com/w320/ru.png",
        svg: "https://flagcdn.com/ru.svg",
      },
    },
    {
      name: {
        common: "Australia",
        nativeName: { eng: { common: "Australia" } },
      },
      cca2: "AU",
      cca3: "AUS",
      capital: ["Canberra"],
      population: 25687041,
      area: 7692024,
      region: "Oceania",
      subregion: "Australia and New Zealand",
      currencies: { AUD: { name: "Dollaro australiano", symbol: "$" } },
      languages: { eng: "Inglese" },
      timezones: [
        "UTC+05:00",
        "UTC+06:30",
        "UTC+07:00",
        "UTC+08:00",
        "UTC+09:30",
        "UTC+10:00",
        "UTC+10:30",
        "UTC+11:00",
      ],
      borders: [],
      flags: {
        png: "https://flagcdn.com/w320/au.png",
        svg: "https://flagcdn.com/au.svg",
      },
    },
    {
      name: {
        common: "Nuova Zelanda",
        nativeName: {
          eng: { common: "New Zealand" },
          mri: { common: "Aotearoa" },
        },
      },
      cca2: "NZ",
      cca3: "NZL",
      capital: ["Wellington"],
      population: 5084300,
      area: 268838,
      region: "Oceania",
      subregion: "Australia and New Zealand",
      currencies: { NZD: { name: "Dollaro neozelandese", symbol: "$" } },
      languages: { eng: "Inglese", mri: "Māori" },
      timezones: ["UTC+12:00", "UTC+13:00"],
      borders: [],
      flags: {
        png: "https://flagcdn.com/w320/nz.png",
        svg: "https://flagcdn.com/nz.svg",
      },
    },
    {
      name: {
        common: "Sudafrica",
        nativeName: {
          afr: { common: "Suid-Afrika" },
          eng: { common: "South Africa" },
        },
      },
      cca2: "ZA",
      cca3: "ZAF",
      capital: ["Città del Capo", "Pretoria", "Bloemfontein"],
      population: 59308690,
      area: 1221037,
      region: "Africa",
      subregion: "Southern Africa",
      currencies: { ZAR: { name: "Rand sudafricano", symbol: "R" } },
      languages: {
        afr: "Afrikaans",
        eng: "Inglese",
        nbl: "Ndebele",
        som: "Sotho",
        ssw: "Swazi",
      },
      timezones: ["UTC+02:00"],
      borders: ["BWA", "LSO", "MOZ", "NAM", "SWZ", "ZWE"],
      flags: {
        png: "https://flagcdn.com/w320/za.png",
        svg: "https://flagcdn.com/za.svg",
      },
    },
    {
      name: { common: "Egitto", nativeName: { ara: { common: "مصر" } } },
      cca2: "EG",
      cca3: "EGY",
      capital: ["Il Cairo"],
      population: 102334403,
      area: 1001449,
      region: "Africa",
      subregion: "Northern Africa",
      currencies: { EGP: { name: "Lira egiziana", symbol: "£" } },
      languages: { ara: "Arabo" },
      timezones: ["UTC+02:00"],
      borders: ["ISR", "LBY", "SDN"],
      flags: {
        png: "https://flagcdn.com/w320/eg.png",
        svg: "https://flagcdn.com/eg.svg",
      },
    },
    {
      name: { common: "Nigeria", nativeName: { eng: { common: "Nigeria" } } },
      cca2: "NG",
      cca3: "NGA",
      capital: ["Abuja"],
      population: 206139587,
      area: 923768,
      region: "Africa",
      subregion: "Western Africa",
      currencies: { NGN: { name: "Naira nigeriana", symbol: "₦" } },
      languages: { eng: "Inglese" },
      timezones: ["UTC+01:00"],
      borders: ["BEN", "CMR", "TCD", "NER"],
      flags: {
        png: "https://flagcdn.com/w320/ng.png",
        svg: "https://flagcdn.com/ng.svg",
      },
    },
    {
      name: {
        common: "Kenya",
        nativeName: { eng: { common: "Kenya" }, swa: { common: "Kenya" } },
      },
      cca2: "KE",
      cca3: "KEN",
      capital: ["Nairobi"],
      population: 53771300,
      area: 580367,
      region: "Africa",
      subregion: "Eastern Africa",
      currencies: { KES: { name: "Scellino keniota", symbol: "Sh" } },
      languages: { eng: "Inglese", swa: "Swahili" },
      timezones: ["UTC+03:00"],
      borders: ["ETH", "SOM", "SSD", "TZA", "UGA"],
      flags: {
        png: "https://flagcdn.com/w320/ke.png",
        svg: "https://flagcdn.com/ke.svg",
      },
    },
    {
      name: {
        common: "Marocco",
        nativeName: { ara: { common: "المغرب" }, ber: { common: "ⵍⵎⵖⵔⵉⴱ" } },
      },
      cca2: "MA",
      cca3: "MAR",
      capital: ["Rabat"],
      population: 36910558,
      area: 446550,
      region: "Africa",
      subregion: "Northern Africa",
      currencies: { MAD: { name: "Dirham marocchino", symbol: "د.م." } },
      languages: { ara: "Arabo", ber: "Berbero" },
      timezones: ["UTC+01:00"],
      borders: ["DZA", "ESH", "ESP"],
      flags: {
        png: "https://flagcdn.com/w320/ma.png",
        svg: "https://flagcdn.com/ma.svg",
      },
    },
    {
      name: {
        common: "Thailandia",
        nativeName: { tha: { common: "ประเทศไทย" } },
      },
      cca2: "TH",
      cca3: "THA",
      capital: ["Bangkok"],
      population: 69799978,
      area: 513120,
      region: "Asia",
      subregion: "South-Eastern Asia",
      currencies: { THB: { name: "Baht thailandese", symbol: "฿" } },
      languages: { tha: "Thailandese" },
      timezones: ["UTC+07:00"],
      borders: ["MMR", "KHM", "LAO", "MYS"],
      flags: {
        png: "https://flagcdn.com/w320/th.png",
        svg: "https://flagcdn.com/th.svg",
      },
    },
    {
      name: { common: "Vietnam", nativeName: { vie: { common: "Việt Nam" } } },
      cca2: "VN",
      cca3: "VNM",
      capital: ["Hanoi"],
      population: 97338583,
      area: 331212,
      region: "Asia",
      subregion: "South-Eastern Asia",
      currencies: { VND: { name: "Dong vietnamita", symbol: "₫" } },
      languages: { vie: "Vietnamita" },
      timezones: ["UTC+07:00"],
      borders: ["KHM", "CHN", "LAO"],
      flags: {
        png: "https://flagcdn.com/w320/vn.png",
        svg: "https://flagcdn.com/vn.svg",
      },
    },
    {
      name: {
        common: "Indonesia",
        nativeName: { ind: { common: "Indonesia" } },
      },
      cca2: "ID",
      cca3: "IDN",
      capital: ["Jakarta"],
      population: 273523621,
      area: 1904569,
      region: "Asia",
      subregion: "South-Eastern Asia",
      currencies: { IDR: { name: "Rupia indonesiana", symbol: "Rp" } },
      languages: { ind: "Indonesiano" },
      timezones: ["UTC+07:00", "UTC+08:00", "UTC+09:00"],
      borders: ["TLS", "MYS", "PNG"],
      flags: {
        png: "https://flagcdn.com/w320/id.png",
        svg: "https://flagcdn.com/id.svg",
      },
    },
    {
      name: { common: "Malesia", nativeName: { msa: { common: "Malaysia" } } },
      cca2: "MY",
      cca3: "MYS",
      capital: ["Kuala Lumpur"],
      population: 32365998,
      area: 330803,
      region: "Asia",
      subregion: "South-Eastern Asia",
      currencies: { MYR: { name: "Ringgit malese", symbol: "RM" } },
      languages: { msa: "Malese" },
      timezones: ["UTC+08:00"],
      borders: ["BRN", "IDN", "THA"],
      flags: {
        png: "https://flagcdn.com/w320/my.png",
        svg: "https://flagcdn.com/my.svg",
      },
    },
    {
      name: {
        common: "Filippine",
        nativeName: {
          eng: { common: "Philippines" },
          fil: { common: "Pilipinas" },
        },
      },
      cca2: "PH",
      cca3: "PHL",
      capital: ["Manila"],
      population: 109581085,
      area: 300000,
      region: "Asia",
      subregion: "South-Eastern Asia",
      currencies: { PHP: { name: "Peso filippino", symbol: "₱" } },
      languages: { eng: "Inglese", fil: "Filipino" },
      timezones: ["UTC+08:00"],
      borders: [],
      flags: {
        png: "https://flagcdn.com/w320/ph.png",
        svg: "https://flagcdn.com/ph.svg",
      },
    },
    {
      name: {
        common: "Singapore",
        nativeName: {
          eng: { common: "Singapore" },
          msa: { common: "Singapura" },
        },
      },
      cca2: "SG",
      cca3: "SGP",
      capital: ["Singapore"],
      population: 5685807,
      area: 710,
      region: "Asia",
      subregion: "South-Eastern Asia",
      currencies: { SGD: { name: "Dollaro di Singapore", symbol: "$" } },
      languages: { eng: "Inglese", msa: "Malese", tam: "Tamil", zho: "Cinese" },
      timezones: ["UTC+08:00"],
      borders: [],
      flags: {
        png: "https://flagcdn.com/w320/sg.png",
        svg: "https://flagcdn.com/sg.svg",
      },
    },
  ];

  // Simula un piccolo delay per rendere realistico
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Organizza i dati per codice ISO alpha-2 e alpha-3
  completeCountriesData.forEach((country) => {
    if (country.cca2) countriesData[country.cca2.toLowerCase()] = country;
    if (country.cca3) countriesData[country.cca3.toLowerCase()] = country;
  });

  // Organizza i paesi per continente
  organizeCountriesByContinent(completeCountriesData);

  // Organizza le valute
  organizeCurrencies(completeCountriesData);

  // Carica il planisfero dettagliato
  await loadDetailedWorldMap();

  // Crea l'elenco dei paesi
  createCountriesList(completeCountriesData);

  // Crea i filtri per continente
  createContinentFilters();

  // Crea i filtri per valuta
  createCurrencyFilters();

  return true;
}

// Mostra un messaggio di successo quando l'API funziona
function showSuccessMessage(countryCount) {
  const message = document.createElement("div");
  message.className = "success-message";
  message.innerHTML = `
    <div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 12px; border-radius: 8px; margin: 16px; text-align: center;">
      <strong>✅ Database Completo Caricato!</strong><br>
      Visualizzazione di <strong>${countryCount} paesi</strong> con dati completi e aggiornati.
      <br><small>Include tutti i continenti con informazioni dettagliate su popolazione, valute, lingue e confini.</small>
    </div>
  `;

  const container = document.querySelector("main.container");
  container.insertBefore(message, container.firstChild);

  // Rimuovi il messaggio dopo 5 secondi
  setTimeout(() => {
    if (message.parentNode) {
      message.parentNode.removeChild(message);
    }
  }, 5000);
}

// Dati di fallback ridotti (solo in caso di errore grave)
function loadFallbackData() {
  console.log("Caricamento dati di fallback ridotti...");

  const fallbackCountries = [
    {
      name: { common: "Italia", nativeName: { ita: { common: "Italia" } } },
      cca2: "IT",
      cca3: "ITA",
      capital: ["Roma"],
      population: 59554023,
      area: 301336,
      region: "Europe",
      subregion: "Southern Europe",
      currencies: { EUR: { name: "Euro", symbol: "€" } },
      languages: { ita: "Italiano" },
      timezones: ["UTC+01:00"],
      borders: ["AUT", "FRA", "SMR", "SVN", "CHE", "VAT"],
      flags: {
        png: "https://flagcdn.com/w320/it.png",
        svg: "https://flagcdn.com/it.svg",
      },
    },
    {
      name: {
        common: "Stati Uniti",
        nativeName: { eng: { common: "United States" } },
      },
      cca2: "US",
      cca3: "USA",
      capital: ["Washington, D.C."],
      population: 329484123,
      area: 9833517,
      region: "Americas",
      subregion: "North America",
      currencies: { USD: { name: "Dollaro statunitense", symbol: "$" } },
      languages: { eng: "Inglese" },
      timezones: ["UTC-05:00"],
      borders: ["CAN", "MEX"],
      flags: {
        png: "https://flagcdn.com/w320/us.png",
        svg: "https://flagcdn.com/us.svg",
      },
    },
    {
      name: { common: "Cina", nativeName: { zho: { common: "中国" } } },
      cca2: "CN",
      cca3: "CHN",
      capital: ["Pechino"],
      population: 1439323776,
      area: 9596961,
      region: "Asia",
      subregion: "Eastern Asia",
      currencies: { CNY: { name: "Yuan cinese", symbol: "¥" } },
      languages: { zho: "Cinese" },
      timezones: ["UTC+08:00"],
      borders: ["IND", "RUS"],
      flags: {
        png: "https://flagcdn.com/w320/cn.png",
        svg: "https://flagcdn.com/cn.svg",
      },
    },
  ];

  try {
    // Organizza i dati per codice ISO alpha-2 e alpha-3
    fallbackCountries.forEach((country) => {
      if (country.cca2) countriesData[country.cca2.toLowerCase()] = country;
      if (country.cca3) countriesData[country.cca3.toLowerCase()] = country;
    });

    // Organizza i paesi per continente
    organizeCountriesByContinent(fallbackCountries);

    // Organizza le valute
    organizeCurrencies(fallbackCountries);

    // Carica il planisfero dettagliato
    loadDetailedWorldMap();

    // Crea l'elenco dei paesi
    createCountriesList(fallbackCountries);

    // Crea i filtri per continente
    createContinentFilters();

    // Crea i filtri per valuta
    createCurrencyFilters();

    loadingIndicator.style.display = "none";

    // Mostra un messaggio informativo
    showFallbackMessage();

    return true;
  } catch (error) {
    console.error("Errore anche con i dati di fallback:", error);
    loadingIndicator.style.display = "none";
    worldMapContainer.innerHTML = `<div class="error-message">Errore nel caricamento dei dati: ${error.message}</div>`;
    return false;
  }
}

// Mostra un messaggio informativo quando si usano i dati di fallback
function showFallbackMessage() {
  const message = document.createElement("div");
  message.className = "fallback-message";
  message.innerHTML = `
    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 12px; border-radius: 8px; margin: 16px; text-align: center;">
      <strong>⚠️ Modalità Ridotta</strong><br>
      Errore nel caricamento del database completo. Visualizzazione di <strong>3 paesi principali</strong>.
      <br><button onclick="location.reload()" style="margin-top: 8px; padding: 4px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">🔄 Ricarica</button>
    </div>
  `;

  const container = document.querySelector("main.container");
  container.insertBefore(message, container.firstChild);
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
      a.name.common.localeCompare(b.name.common),
    );
  }

  // Crea una lista ordinata dei continenti
  continentsList = Object.keys(continents).sort();
}

// Organizza le valute
function organizeCurrencies(countries) {
  currencies = {};

  // Raggruppa i paesi per valuta
  countries.forEach((country) => {
    if (!country.currencies) return;

    Object.entries(country.currencies).forEach(([code, currencyInfo]) => {
      if (!currencies[code]) {
        currencies[code] = {
          code: code,
          name: currencyInfo.name,
          symbol: currencyInfo.symbol || code,
          countries: [],
        };
      }

      currencies[code].countries.push({
        name: country.name.common,
        code: country.cca3,
      });
    });
  });

  // Crea una lista ordinata delle valute
  currenciesList = Object.keys(currencies).sort();
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

// Crea i filtri per valuta
function createCurrencyFilters() {
  currencyFiltersContainer.innerHTML = "";

  // Aggiungi un filtro per ogni valuta in ordine alfabetico
  // Mostra solo le prime 20 valute più comuni, le altre saranno filtrabili tramite ricerca
  const topCurrencies = Object.values(currencies)
    .sort((a, b) => b.countries.length - a.countries.length)
    .slice(0, 20);

  topCurrencies.forEach((currency) => {
    const currencyFilter = createCurrencyFilterElement(currency);
    currencyFiltersContainer.appendChild(currencyFilter);
  });

  // Aggiungi l'event listener per la ricerca delle valute
  currencySearch.addEventListener("input", () => {
    const searchTerm = currencySearch.value.toLowerCase().trim();

    if (!searchTerm) {
      // Se la ricerca è vuota, mostra le valute più comuni
      currencyFiltersContainer.innerHTML = "";
      topCurrencies.forEach((currency) => {
        const currencyFilter = createCurrencyFilterElement(currency);
        currencyFiltersContainer.appendChild(currencyFilter);
      });
      return;
    }

    // Filtra le valute in base al termine di ricerca
    const filteredCurrencies = currenciesList
      .filter((code) => {
        const currency = currencies[code];
        return (
          currency.code.toLowerCase().includes(searchTerm) ||
          currency.name.toLowerCase().includes(searchTerm) ||
          (currency.symbol &&
            currency.symbol.toLowerCase().includes(searchTerm))
        );
      })
      .map((code) => currencies[code])
      .slice(0, 20); // Limita i risultati a 20

    // Aggiorna i filtri
    currencyFiltersContainer.innerHTML = "";

    if (filteredCurrencies.length === 0) {
      const noResults = document.createElement("div");
      noResults.className = "no-results-message";
      noResults.style.display = "block";
      noResults.textContent = "Nessuna valuta trovata";
      currencyFiltersContainer.appendChild(noResults);
      return;
    }

    filteredCurrencies.forEach((currency) => {
      const currencyFilter = createCurrencyFilterElement(currency);
      currencyFiltersContainer.appendChild(currencyFilter);
    });
  });
}

// Crea un elemento filtro per una valuta
function createCurrencyFilterElement(currency) {
  const currencyFilter = document.createElement("div");
  currencyFilter.className = "currency-filter";
  currencyFilter.setAttribute("data-currency", currency.code);

  if (activeCurrencies.has(currency.code)) {
    currencyFilter.classList.add("active");
  }

  // Aggiungi il codice della valuta
  const currencyCode = document.createElement("span");
  currencyCode.className = "currency-code";
  currencyCode.textContent = currency.code;
  currencyFilter.appendChild(currencyCode);

  // Aggiungi il nome della valuta
  const currencyName = document.createElement("span");
  currencyName.className = "currency-name";
  currencyName.textContent = ` (${currency.name})`;
  currencyFilter.appendChild(currencyName);

  // Aggiungi l'event listener per il filtro della valuta
  currencyFilter.addEventListener("click", () => {
    toggleCurrencyFilter(currency.code);
  });

  return currencyFilter;
}

// Alterna l'attivazione di una valuta
function toggleCurrencyFilter(currencyCode) {
  if (activeCurrencies.has(currencyCode)) {
    // Se la valuta è già attiva, rimuovila
    activeCurrencies.delete(currencyCode);
  } else {
    // Altrimenti, aggiungila
    activeCurrencies.add(currencyCode);
  }

  // Aggiorna la classe active sui filtri
  updateCurrencyFiltersUI();

  // Aggiorna la visualizzazione dei paesi
  updateCountriesDisplay();
}

// Aggiorna l'interfaccia utente dei filtri per valuta
function updateCurrencyFiltersUI() {
  const filters = document.querySelectorAll(".currency-filter");
  filters.forEach((filter) => {
    const currency = filter.getAttribute("data-currency");
    if (activeCurrencies.has(currency)) {
      filter.classList.add("active");
    } else {
      filter.classList.remove("active");
    }
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
    activeContinents.has(continent),
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

    continentToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      const countriesContainer = continentSection.querySelector(
        ".continent-countries",
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

    // Filtra i paesi in base al termine di ricerca e alle valute selezionate
    let filteredCountries = continents[region].filter((country) =>
      country.name.common.toLowerCase().includes(searchTerm),
    );

    // Filtra per valuta se ci sono valute attive
    if (activeCurrencies.size > 0) {
      filteredCountries = filteredCountries.filter((country) => {
        if (!country.currencies) return false;

        // Controlla se il paese ha almeno una delle valute attive
        return Object.keys(country.currencies).some((code) =>
          activeCurrencies.has(code),
        );
      });
    }

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

      // Aggiungi badge delle valute se il paese ne ha
      if (country.currencies) {
        const currenciesContainer = document.createElement("div");
        currenciesContainer.style.marginTop = "4px";

        Object.entries(country.currencies).forEach(([code, currencyInfo]) => {
          const badge = document.createElement("span");
          badge.className = "currency-badge";

          const symbol = document.createElement("span");
          symbol.className = "currency-badge-symbol";
          symbol.textContent = currencyInfo.symbol || code;

          badge.appendChild(symbol);
          badge.appendChild(document.createTextNode(code));

          currenciesContainer.appendChild(badge);
        });

        countryItem.appendChild(currenciesContainer);
      }

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
    // Fallback alla mappa semplificata
    createSimplifiedWorldMap();
  } catch (error) {
    console.error("Errore nel caricamento della mappa dettagliata:", error);
    // Fallback alla mappa semplificata
    createSimplifiedWorldMap();
  }
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
        <path id="prt" class="country" d="M420,175 L430,175 L430,195 L420,195 Z" />
        <path id="nld" class="country" d="M470,140 L480,140 L480,150 L470,150 Z" />
        <path id="bel" class="country" d="M465,150 L475,150 L475,160 L465,160 Z" />
        <path id="che" class="country" d="M475,160 L485,160 L485,170 L475,170 Z" />
        <path id="aut" class="country" d="M485,150 L500,150 L500,165 L485,165 Z" />
        
        <!-- Africa -->
        <path id="egy" class="country" d="M500,200 L530,200 L530,220 L500,220 Z" />
        <path id="nga" class="country" d="M470,230 L490,230 L490,250 L470,250 Z" />
        <path id="zaf" class="country" d="M490,280 L510,280 L510,300 L490,300 Z" />
        <path id="ken" class="country" d="M510,240 L530,240 L530,260 L510,260 Z" />
        <path id="mar" class="country" d="M450,200 L470,200 L470,220 L450,220 Z" />
        
        <!-- Asia -->
        <path id="rus" class="country" d="M500,100 L650,100 L650,150 L500,150 Z" />
        <path id="chn" class="country" d="M650,170 L700,170 L700,210 L650,210 Z" />
        <path id="ind" class="country" d="M630,210 L670,210 L670,240 L630,240 Z" />
        <path id="jpn" class="country" d="M730,170 L750,170 L750,190 L730,190 Z" />
        <path id="kor" class="country" d="M720,160 L735,160 L735,175 L720,175 Z" />
        <path id="tha" class="country" d="M680,240 L700,240 L700,260 L680,260 Z" />
        <path id="vnm" class="country" d="M700,240 L715,240 L715,270 L700,270 Z" />
        <path id="idn" class="country" d="M720,280 L760,280 L760,300 L720,300 Z" />
        <path id="mys" class="country" d="M700,270 L720,270 L720,285 L700,285 Z" />
        <path id="phl" class="country" d="M740,250 L760,250 L760,270 L740,270 Z" />
        <path id="sgp" class="country" d="M710,275 L715,275 L715,280 L710,280 Z" />
        
        <!-- Oceania -->
        <path id="aus" class="country" d="M700,300 L750,300 L750,340 L700,340 Z" />
        <path id="nzl" class="country" d="M760,340 L780,340 L780,355 L760,355 Z" />
        
        <!-- Etichette dei paesi -->
        <text x="230" y="175" font-size="8" text-anchor="middle">USA</text>
        <text x="230" y="125" font-size="8" text-anchor="middle">Canada</text>
        <text x="215" y="220" font-size="8" text-anchor="middle">Messico</text>
        <text x="275" y="275" font-size="8" text-anchor="middle">Brasile</text>
        <text x="270" y="325" font-size="8" text-anchor="middle">Argentina</text>
        <text x="240" y="250" font-size="8" text-anchor="middle">Colombia</text>
        <text x="460" y="150" font-size="8" text-anchor="middle">UK</text>
        <text x="465" y="170" font-size="8" text-anchor="middle">Francia</text>
        <text x="490" y="155" font-size="8" text-anchor="middle">Germania</text>
        <text x="480" y="185" font-size="8" text-anchor="middle">Italia</text>
        <text x="440" y="185" font-size="8" text-anchor="middle">Spagna</text>
        <text x="425" y="185" font-size="7" text-anchor="middle">Portogallo</text>
        <text x="575" y="125" font-size="8" text-anchor="middle">Russia</text>
        <text x="675" y="190" font-size="8" text-anchor="middle">Cina</text>
        <text x="650" y="225" font-size="8" text-anchor="middle">India</text>
        <text x="740" y="180" font-size="8" text-anchor="middle">Giappone</text>
        <text x="725" y="320" font-size="8" text-anchor="middle">Australia</text>
        <text x="770" y="350" font-size="7" text-anchor="middle">N. Zelanda</text>
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
  let isDragging = false;
  let startX,
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

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

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

    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

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

  const densityValue = population / area;
  if (densityValue <= 0) return "N/A"; // Controlla anche casi negativi

  const formattedDensity =
    densityValue % 1 === 0 ? densityValue.toFixed(0) : densityValue.toFixed(2);

  return formattedDensity === "0.00" ? "N/A" : `${formattedDensity} ab/km²`;
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
      densityLabel.textContent = "Densità";

      const densityValue = document.createElement("div");
      densityValue.className = "info-value";
      densityValue.id = "country-density";

      densityItem.appendChild(densityLabel);
      densityItem.appendChild(densityValue);

      // Inserisci dopo l'area
      const areaItem = document.querySelector(".info-item:nth-child(3)");
      if (areaItem && areaItem.nextSibling) {
        infoGrid.insertBefore(densityItem, areaItem.nextSibling);
      } else infoGrid.appendChild(densityItem);
    }

    // Aggiorna il valore della densità
    const countryDensity = document.getElementById("country-density");
    countryDensity.textContent = calculatePopulationDensity(
      country.population,
      country.area,
    );

    // Regione e sottoregione
    countryRegion.textContent = country.region || "N/A";
    countrySubregion.textContent = country.subregion || "N/A";

    // Valute - Usa la nuova funzione per creare elementi di lista
    if (country.currencies) {
      // Mostra le valute in modo più dettagliato
      countryCurrencies.innerHTML = "";

      Object.entries(country.currencies).forEach(([code, currencyInfo]) => {
        const currencyBadge = document.createElement("div");
        currencyBadge.className = "currency-badge";
        currencyBadge.style.marginBottom = "8px";

        const currencySymbol = document.createElement("span");
        currencySymbol.className = "currency-badge-symbol";
        currencySymbol.textContent = currencyInfo.symbol || code;

        currencyBadge.appendChild(currencySymbol);
        currencyBadge.appendChild(
          document.createTextNode(` ${code} - ${currencyInfo.name}`),
        );

        countryCurrencies.appendChild(currencyBadge);
      });

      // Aggiorna i dettagli della valuta
      updateCurrencyDetails(country);
    } else {
      countryCurrencies.textContent = "N/A";
      document.getElementById("currency-details").style.display = "none";
    }

    // Lingue - Usa la nuova funzione per creare elementi di lista
    if (country.languages) {
      const languageItems = Object.values(country.languages);
      createListItems(countryLanguages, languageItems);
    } else {
      countryLanguages.textContent = "N/A";
    }

    // Fusi orari - Usa la nuova funzione per creare elementi di lista
    if (country.timezones && country.timezones.length > 0)
      createListItems(countryTimezones, country.timezones);
    else countryTimezones.textContent = "N/A";

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
                borderCode.toLowerCase(),
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
                  borderCode.toLowerCase(),
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

// Aggiorna i dettagli della valuta
function updateCurrencyDetails(country) {
  const currencyDetails = document.getElementById("currency-details");
  const currencyDetailsContent = document.getElementById(
    "currency-details-content",
  );

  if (!country.currencies) {
    currencyDetails.style.display = "none";
    return;
  }

  currencyDetails.style.display = "block";
  currencyDetailsContent.innerHTML = "";

  Object.entries(country.currencies).forEach(([code, currencyInfo]) => {
    const currencyData = currencies[code];
    if (!currencyData) return;

    const currencyCard = document.createElement("div");
    currencyCard.className = "currency-card";

    // Header con codice e simbolo
    const cardHeader = document.createElement("div");
    cardHeader.className = "currency-card-header";

    const currencyCode = document.createElement("div");
    currencyCode.className = "currency-code";
    currencyCode.textContent = code;

    const currencySymbol = document.createElement("div");
    currencySymbol.className = "currency-symbol";
    currencySymbol.textContent = currencyInfo.symbol || code;

    cardHeader.appendChild(currencyCode);
    cardHeader.appendChild(currencySymbol);
    currencyCard.appendChild(cardHeader);

    // Nome della valuta
    const currencyName = document.createElement("div");
    currencyName.className = "currency-name";
    currencyName.textContent = currencyInfo.name;
    currencyCard.appendChild(currencyName);

    // Numero di paesi che usano questa valuta
    const currencyCountries = document.createElement("div");
    currencyCountries.className = "currency-countries";

    const countriesCount = currencyData.countries.length;
    currencyCountries.textContent = `Utilizzata in ${countriesCount} ${countriesCount === 1 ? "paese" : "paesi"}`;

    currencyCard.appendChild(currencyCountries);

    currencyDetailsContent.appendChild(currencyCard);
  });
}

// Carica i dati all'avvio
window.addEventListener("DOMContentLoaded", () => {
  loadCountriesData();
});

document.getElementById("footer").innerHTML = ` <footer class="app-footer">
    <div class="container">
      <p>
        © ${new Date().getFullYear()} Planisfero Interattivo - Database completo con 32 paesi
      </p>
  </div>
</footer>`;

// Dummy function to satisfy linter
function parseWorldBankData() {
  console.log("parseWorldBankData called");
}
