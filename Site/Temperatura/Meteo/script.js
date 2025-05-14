// API key per OpenWeatherMap
const API_KEY = "4d8fb5b93d4af21d66a2948710284366" // Chiave API di esempio
const BASE_URL = "https://api.openweathermap.org/data/2.5"
const GEO_URL = "https://api.openweathermap.org/geo/1.0"

// Elementi DOM
const cityInput = document.getElementById("city-input")
const searchBtn = document.getElementById("search-btn")
const cityPills = document.querySelectorAll(".city-pill")
const searchSuggestions = document.getElementById("search-suggestions")
const loadingContainer = document.getElementById("loading")
const errorContainer = document.getElementById("error")
const errorMessage = document.getElementById("error-message")
const weatherContainer = document.getElementById("weather-data")

// Elementi per i dati meteo
const cityNameElement = document.getElementById("city-name")
const countryNameElement = document.getElementById("country-name")
const localTimeElement = document.getElementById("local-time")
const weatherIconContainer = document.getElementById("weather-icon-container")
const defaultIcon = document.getElementById("default-icon")
const temperatureElement = document.getElementById("temperature")
const feelsLikeElement = document.getElementById("feels-like")
const weatherDescriptionElement = document.getElementById("weather-description")
const windSpeedElement = document.getElementById("wind-speed")
const humidityElement = document.getElementById("humidity")
const pressureElement = document.getElementById("pressure")
const visibilityElement = document.getElementById("visibility")
const sunriseTimeElement = document.getElementById("sunrise-time")
const sunsetTimeElement = document.getElementById("sunset-time")
const sunPositionElement = document.getElementById("sun-position")
const airQualityGaugeElement = document.getElementById("air-quality-gauge")
const airQualityValueElement = document.getElementById("air-quality-value")
const airQualityLabelElement = document.getElementById("air-quality-label")
const hourlyForecastContainer = document.getElementById("hourly-forecast")

// Database delle città italiane (per la correzione del paese)
const italianCities = [
    "Roma",
    "Milano",
    "Napoli",
    "Torino",
    "Palermo",
    "Genova",
    "Bologna",
    "Firenze",
    "Bari",
    "Catania",
    "Venezia",
    "Verona",
    "Messina",
    "Padova",
    "Trieste",
    "Brescia",
    "Parma",
    "Taranto",
    "Prato",
    "Modena",
    "Reggio Calabria",
    "Reggio Emilia",
    "Perugia",
    "Livorno",
    "Ravenna",
    "Cagliari",
    "Foggia",
    "Rimini",
    "Salerno",
    "Ferrara",
    "Sassari",
    "Latina",
    "Giugliano in Campania",
    "Monza",
    "Siracusa",
    "Pescara",
    "Bergamo",
    "Forlì",
    "Vicenza",
    "Trento",
    "Terni",
    "Bolzano",
    "Novara",
    "Piacenza",
    "Ancona",
    "Andria",
    "Arezzo",
    "Udine",
    "Cesena",
    "Lecce",
    "Barletta",
    "Pesaro",
    "Alessandria",
    "La Spezia",
]

// Database delle città popolari nel mondo (per suggerimenti rapidi offline)
const popularCities = [
    // Europa
    "Londra", "Parigi", "Madrid", "Berlino", "Amsterdam", "Bruxelles", "Lisbona", "Atene", "Vienna",
    "Stoccolma", "Oslo", "Helsinki", "Copenaghen", "Praga", "Budapest", "Varsavia", "Bucarest", "Sofia",
    "Dublino", "Zurigo", "Ginevra", "Monaco", "Barcellona", "Valencia", "Siviglia", "Porto", "Marsiglia",
    "Lione", "Nizza", "Francoforte", "Amburgo", "Colonia", "Düsseldorf", "Stoccarda", "Cracovia", "Danzica",

    // Nord America
    "New York", "Los Angeles", "Chicago", "Toronto", "Montreal", "Vancouver", "Miami", "San Francisco",
    "Las Vegas", "Boston", "Washington", "Philadelphia", "Atlanta", "Dallas", "Houston", "Seattle",
    "Denver", "Phoenix", "San Diego", "Detroit", "Città del Messico", "Cancun", "Guadalajara", "Monterrey",

    // Sud America
    "Rio de Janeiro", "San Paolo", "Buenos Aires", "Santiago", "Lima", "Bogotà", "Caracas", "Montevideo",
    "La Paz", "Quito", "Asunción", "Brasilia", "Medellín", "Cali", "Cartagena", "Salvador", "Fortaleza",

    // Asia
    "Tokyo", "Pechino", "Shanghai", "Hong Kong", "Singapore", "Bangkok", "Kuala Lumpur", "Jakarta",
    "Manila", "Seoul", "Taipei", "Ho Chi Minh", "Hanoi", "Mumbai", "Delhi", "Bangalore", "Chennai",
    "Kolkata", "Dubai", "Abu Dhabi", "Doha", "Riyadh", "Istanbul", "Ankara", "Tel Aviv", "Gerusalemme",

    // Africa
    "Il Cairo", "Casablanca", "Marrakech", "Tunisi", "Algeri", "Lagos", "Nairobi", "Johannesburg",
    "Città del Capo", "Durban", "Addis Abeba", "Dakar", "Accra", "Abidjan", "Luanda", "Dar es Salaam",

    // Oceania
    "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Auckland", "Wellington", "Christchurch"
]

// Database dei paesi con i loro nomi in italiano
const countryNames = {
    AF: "Afghanistan",
    AL: "Albania",
    DZ: "Algeria",
    AD: "Andorra",
    AO: "Angola",
    AR: "Argentina",
    AM: "Armenia",
    AU: "Australia",
    AT: "Austria",
    AZ: "Azerbaigian",
    BS: "Bahamas",
    BH: "Bahrein",
    BD: "Bangladesh",
    BB: "Barbados",
    BY: "Bielorussia",
    BE: "Belgio",
    BZ: "Belize",
    BJ: "Benin",
    BT: "Bhutan",
    BO: "Bolivia",
    BA: "Bosnia ed Erzegovina",
    BW: "Botswana",
    BR: "Brasile",
    BN: "Brunei",
    BG: "Bulgaria",
    BF: "Burkina Faso",
    BI: "Burundi",
    KH: "Cambogia",
    CM: "Camerun",
    CA: "Canada",
    CV: "Capo Verde",
    CF: "Repubblica Centrafricana",
    TD: "Ciad",
    CL: "Cile",
    CN: "Cina",
    CO: "Colombia",
    KM: "Comore",
    CG: "Congo",
    CD: "Repubblica Democratica del Congo",
    CR: "Costa Rica",
    CI: "Costa d'Avorio",
    HR: "Croazia",
    CU: "Cuba",
    CY: "Cipro",
    CZ: "Repubblica Ceca",
    DK: "Danimarca",
    DJ: "Gibuti",
    DM: "Dominica",
    DO: "Repubblica Dominicana",
    EC: "Ecuador",
    EG: "Egitto",
    SV: "El Salvador",
    GQ: "Guinea Equatoriale",
    ER: "Eritrea",
    EE: "Estonia",
    ET: "Etiopia",
    FJ: "Figi",
    FI: "Finlandia",
    FR: "Francia",
    GA: "Gabon",
    GM: "Gambia",
    GE: "Georgia",
    DE: "Germania",
    GH: "Ghana",
    GR: "Grecia",
    GD: "Grenada",
    GT: "Guatemala",
    GN: "Guinea",
    GW: "Guinea-Bissau",
    GY: "Guyana",
    HT: "Haiti",
    HN: "Honduras",
    HU: "Ungheria",
    IS: "Islanda",
    IN: "India",
    ID: "Indonesia",
    IR: "Iran",
    IQ: "Iraq",
    IE: "Irlanda",
    IL: "Israele",
    IT: "Italia",
    JM: "Giamaica",
    JP: "Giappone",
    JO: "Giordania",
    KZ: "Kazakistan",
    KE: "Kenya",
    KI: "Kiribati",
    KP: "Corea del Nord",
    KR: "Corea del Sud",
    KW: "Kuwait",
    KG: "Kirghizistan",
    LA: "Laos",
    LV: "Lettonia",
    LB: "Libano",
    LS: "Lesotho",
    LR: "Liberia",
    LY: "Libia",
    LI: "Liechtenstein",
    LT: "Lituania",
    LU: "Lussemburgo",
    MK: "Macedonia del Nord",
    MG: "Madagascar",
    MW: "Malawi",
    MY: "Malesia",
    MV: "Maldive",
    ML: "Mali",
    MT: "Malta",
    MH: "Isole Marshall",
    MR: "Mauritania",
    MU: "Mauritius",
    MX: "Messico",
    FM: "Micronesia",
    MD: "Moldavia",
    MC: "Monaco",
    MN: "Mongolia",
    ME: "Montenegro",
    MA: "Marocco",
    MZ: "Mozambico",
    MM: "Myanmar",
    NA: "Namibia",
    NR: "Nauru",
    NP: "Nepal",
    NL: "Paesi Bassi",
    NZ: "Nuova Zelanda",
    NI: "Nicaragua",
    NE: "Niger",
    NG: "Nigeria",
    NO: "Norvegia",
    OM: "Oman",
    PK: "Pakistan",
    PW: "Palau",
    PA: "Panama",
    PG: "Papua Nuova Guinea",
    PY: "Paraguay",
    PE: "Perù",
    PH: "Filippine",
    PL: "Polonia",
    PT: "Portogallo",
    QA: "Qatar",
    RO: "Romania",
    RU: "Russia",
    RW: "Ruanda",
    KN: "Saint Kitts e Nevis",
    LC: "Santa Lucia",
    VC: "Saint Vincent e Grenadine",
    WS: "Samoa",
    SM: "San Marino",
    ST: "São Tomé e Príncipe",
    SA: "Arabia Saudita",
    SN: "Senegal",
    RS: "Serbia",
    SC: "Seychelles",
    SL: "Sierra Leone",
    SG: "Singapore",
    SK: "Slovacchia",
    SI: "Slovenia",
    SB: "Isole Salomone",
    SO: "Somalia",
    ZA: "Sudafrica",
    SS: "Sud Sudan",
    ES: "Spagna",
    LK: "Sri Lanka",
    SD: "Sudan",
    SR: "Suriname",
    SZ: "Eswatini",
    SE: "Svezia",
    CH: "Svizzera",
    SY: "Siria",
    TW: "Taiwan",
    TJ: "Tagikistan",
    TZ: "Tanzania",
    TH: "Thailandia",
    TL: "Timor Est",
    TG: "Togo",
    TO: "Tonga",
    TT: "Trinidad e Tobago",
    TN: "Tunisia",
    TR: "Turchia",
    TM: "Turkmenistan",
    TV: "Tuvalu",
    UG: "Uganda",
    UA: "Ucraina",
    AE: "Emirati Arabi Uniti",
    GB: "Regno Unito",
    US: "Stati Uniti",
    UY: "Uruguay",
    UZ: "Uzbekistan",
    VU: "Vanuatu",
    VA: "Città del Vaticano",
    VE: "Venezuela",
    VN: "Vietnam",
    YE: "Yemen",
    ZM: "Zambia",
    ZW: "Zimbabwe",
}

// Variabile per gestire il debounce della ricerca
let searchTimeout = null;

// Inizializzazione
document.addEventListener("DOMContentLoaded", () => {
    // Event listeners
    searchBtn.addEventListener("click", () => {
        const city = cityInput.value.trim()
        if (city) {
            searchWeather(city)
            searchSuggestions.innerHTML = ""
            searchSuggestions.classList.remove("active")
        }
    })

    cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const city = cityInput.value.trim()
            if (city) {
                searchWeather(city)
                searchSuggestions.innerHTML = ""
                searchSuggestions.classList.remove("active")
            }
        }
    })

    // Event listener per i suggerimenti di ricerca
    cityInput.addEventListener("input", () => {
        const inputValue = cityInput.value.trim()

        if (inputValue.length < 2) {
            searchSuggestions.innerHTML = ""
            searchSuggestions.classList.remove("active")
            return
        }

        // Implementa debounce per evitare troppe richieste API
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        searchTimeout = setTimeout(() => {
            fetchCitySuggestions(inputValue)
        }, 300) // Attendi 300ms dopo l'ultimo input
    })

    // Nascondi i suggerimenti quando si clicca fuori
    document.addEventListener("click", (e) => {
        if (!cityInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.innerHTML = ""
            searchSuggestions.classList.remove("active")
        }
    })

    // Event listeners per i pulsanti delle città popolari
    cityPills.forEach((pill) => {
        pill.addEventListener("click", () => {
            const city = pill.getAttribute("data-city")
            cityInput.value = city
            searchWeather(city)
        })
    })

    // Carica Roma come città predefinita
    searchWeather("Roma")
})

// Funzione per ottenere suggerimenti di città
async function fetchCitySuggestions(query) {
    searchSuggestions.innerHTML = ""

    try {
        // Prima mostra suggerimenti dalle liste locali (per velocità)
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

        // Cerca nelle città italiane e popolari
        const localMatches = [...italianCities, ...popularCities]
            .filter(city => {
                const normalizedCity = city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                return normalizedCity.includes(normalizedQuery)
            })
            .slice(0, 5) // Limita a 5 suggerimenti locali

        // Mostra i suggerimenti locali
        if (localMatches.length > 0) {
            displaySuggestions(localMatches)
        }

        // Poi cerca online per suggerimenti più precisi
        const response = await fetch(`${GEO_URL}/direct?q=${query}&limit=5&appid=${API_KEY}`)

        if (!response.ok) {
            throw new Error("Errore nel caricamento dei suggerimenti")
        }

        const data = await response.json()

        // Formatta i risultati dell'API
        const apiSuggestions = data.map(item => {
            // Formatta il nome della città con stato/paese
            let displayName = item.name

            // Aggiungi lo stato per USA
            if (item.country === "US" && item.state) {
                displayName += `, ${item.state}`
            }

            // Aggiungi il paese per tutti
            const countryName = countryNames[item.country] || item.country
            displayName += `, ${countryName}`

            return {
                name: item.name,
                displayName: displayName,
                lat: item.lat,
                lon: item.lon,
                country: item.country
            }
        })

        // Mostra i suggerimenti dell'API
        if (apiSuggestions.length > 0) {
            displayApiSuggestions(apiSuggestions)
        } else if (localMatches.length === 0) {
            // Se non ci sono suggerimenti né locali né dall'API
            searchSuggestions.innerHTML = `<div class="suggestion-item no-results">Nessun risultato trovato</div>`
            searchSuggestions.classList.add("active")
        }
    } catch (error) {
        console.error("Errore nella ricerca dei suggerimenti:", error)

        // Mostra un messaggio di errore nei suggerimenti
        searchSuggestions.innerHTML = `<div class="suggestion-item error">Errore nel caricamento dei suggerimenti</div>`
        searchSuggestions.classList.add("active")
    }
}

// Funzione per mostrare i suggerimenti locali
function displaySuggestions(cities) {
    searchSuggestions.innerHTML = ""

    cities.forEach(city => {
        const suggestionItem = document.createElement("div")
        suggestionItem.className = "suggestion-item"
        suggestionItem.textContent = city

        suggestionItem.addEventListener("click", () => {
            cityInput.value = city
            searchSuggestions.innerHTML = ""
            searchSuggestions.classList.remove("active")
            searchWeather(city)
        })

        searchSuggestions.appendChild(suggestionItem)
    })

    searchSuggestions.classList.add("active")
}

// Funzione per mostrare i suggerimenti dall'API
function displayApiSuggestions(suggestions) {
    // Pulisci i suggerimenti esistenti se non ci sono già suggerimenti locali
    if (searchSuggestions.children.length === 0) {
        searchSuggestions.innerHTML = ""
    }

    suggestions.forEach(suggestion => {
        // Verifica se questo suggerimento è già presente (per evitare duplicati)
        const isDuplicate = Array.from(searchSuggestions.children).some(
            item => item.textContent === suggestion.displayName
        )

        if (!isDuplicate) {
            const suggestionItem = document.createElement("div")
            suggestionItem.className = "suggestion-item"
            suggestionItem.textContent = suggestion.displayName

            suggestionItem.addEventListener("click", () => {
                cityInput.value = suggestion.name
                searchSuggestions.innerHTML = ""
                searchSuggestions.classList.remove("active")
                searchWeatherByCoords(suggestion.lat, suggestion.lon)
            })

            searchSuggestions.appendChild(suggestionItem)
        }
    })

    searchSuggestions.classList.add("active")
}

// Funzione per cercare il meteo di una città
async function searchWeather(city) {
    // Mostra il caricamento
    showLoading()

    try {
        // Gestisci caso speciale per Roma
        let searchCity = city
        if (city.toLowerCase() === "roma" || city.toLowerCase() === "rome") {
            searchCity = "Roma,IT" // Forza la ricerca di Roma in Italia
        } else if (italianCities.some((c) => c.toLowerCase() === city.toLowerCase())) {
            searchCity = `${city},IT` // Forza la ricerca in Italia per le città italiane
        }

        // Ottieni i dati meteo attuali
        const weatherData = await fetchWeatherData(searchCity)

        // Ottieni i dati delle previsioni orarie
        const forecastData = await fetchForecastData(weatherData.coord.lat, weatherData.coord.lon)

        // Ottieni i dati sulla qualità dell'aria
        const airQualityData = await fetchAirQualityData(weatherData.coord.lat, weatherData.coord.lon)

        // Visualizza i dati
        displayWeatherData(weatherData, forecastData, airQualityData)
    } catch (error) {
        showError(error.message)
    }
}

// Funzione per cercare il meteo usando coordinate
async function searchWeatherByCoords(lat, lon) {
    // Mostra il caricamento
    showLoading()

    try {
        // Ottieni i dati meteo attuali
        const weatherData = await fetchWeatherDataByCoords(lat, lon)

        // Ottieni i dati delle previsioni orarie
        const forecastData = await fetchForecastData(lat, lon)

        // Ottieni i dati sulla qualità dell'aria
        const airQualityData = await fetchAirQualityData(lat, lon)

        // Visualizza i dati
        displayWeatherData(weatherData, forecastData, airQualityData)
    } catch (error) {
        showError(error.message)
    }
}

// Funzione per ottenere i dati meteo
async function fetchWeatherData(city) {
    const response = await fetch(`${BASE_URL}/weather?q=${city}&units=metric&lang=it&appid=${API_KEY}`)

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Città non trovata. Controlla il nome e riprova.")
        } else if (response.status === 401) {
            throw new Error("Chiave API non valida. Controlla la tua chiave API.")
        } else {
            throw new Error("Errore nel caricamento dei dati meteo. Riprova più tardi.")
        }
    }

    const data = await response.json()

    // Forza Roma a essere in Italia
    if ((data.name === "Roma" || data.name === "Rome") && data.sys.country !== "IT") {
        data.sys.country = "IT"
    }

    return data
}

// Funzione per ottenere i dati meteo usando coordinate
async function fetchWeatherDataByCoords(lat, lon) {
    const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&lang=it&appid=${API_KEY}`)

    if (!response.ok) {
        throw new Error("Errore nel caricamento dei dati meteo. Riprova più tardi.")
    }

    const data = await response.json()

    // Forza Roma a essere in Italia
    if ((data.name === "Roma" || data.name === "Rome") && data.sys.country !== "IT") {
        data.sys.country = "IT"
    }

    return data
}

// Funzione per ottenere i dati delle previsioni
async function fetchForecastData(lat, lon) {
    const response = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&lang=it&appid=${API_KEY}`)

    if (!response.ok) {
        throw new Error("Errore nel caricamento delle previsioni.")
    }

    return await response.json()
}

// Funzione per ottenere i dati sulla qualità dell'aria
async function fetchAirQualityData(lat, lon) {
    try {
        const response = await fetch(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)

        if (!response.ok) {
            throw new Error("Dati sulla qualità dell'aria non disponibili")
        }

        return await response.json()
    } catch (error) {
        console.error("Errore nel caricamento dei dati sulla qualità dell'aria:", error)
        // Restituisci dati simulati in caso di errore
        return simulateAirQualityData()
    }
}

// Funzione per simulare i dati sulla qualità dell'aria
function simulateAirQualityData() {
    // Genera un valore AQI casuale tra 1 e 5
    const aqi = Math.floor(Math.random() * 5) + 1

    return {
        list: [
            {
                main: {
                    aqi: aqi,
                },
                components: {
                    co: Math.random() * 1000,
                    no: Math.random() * 100,
                    no2: Math.random() * 100,
                    o3: Math.random() * 100,
                    so2: Math.random() * 100,
                    pm2_5: Math.random() * 100,
                    pm10: Math.random() * 100,
                    nh3: Math.random() * 100,
                },
            },
        ],
    }
}

// Funzione per visualizzare i dati meteo
function displayWeatherData(weatherData, forecastData, airQualityData) {
    // Nascondi il caricamento e l'errore
    loadingContainer.classList.add("hidden")
    errorContainer.classList.add("hidden")

    // Mostra il contenitore dei dati meteo
    weatherContainer.classList.remove("hidden")

    // Imposta i dati della città
    cityNameElement.textContent = weatherData.name

    // Correggi il paese per le città italiane - verifica anche il nome normalizzato
    let countryCode = weatherData.sys.country
    const cityNameNormalized = weatherData.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()

    // Verifica se il nome della città è nella lista delle città italiane (case insensitive)
    const isItalianCity = italianCities.some(
        (city) =>
            city
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase() === cityNameNormalized,
    )

    // Se è una città italiana, forza il codice paese a IT
    if (isItalianCity || weatherData.name === "Roma" || weatherData.name === "Rome") {
        countryCode = "IT"
    }

    // Imposta il nome del paese in italiano
    countryNameElement.textContent = countryNames[countryCode] || countryCode

    // Calcola l'ora locale
    const localTime = calculateLocalTime(weatherData.timezone)
    localTimeElement.textContent = `${localTime.time} (GMT${formatTimezoneOffset(weatherData.timezone)})`

    // Imposta l'icona del meteo
    const iconCode = weatherData.weather[0].icon
    weatherIconContainer.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${weatherData.weather[0].description}">`

    // Imposta i dati della temperatura
    temperatureElement.textContent = Math.round(weatherData.main.temp)
    feelsLikeElement.textContent = Math.round(weatherData.main.feels_like)

    // Imposta la descrizione del meteo
    weatherDescriptionElement.textContent = weatherData.weather[0].description

    // Imposta i dettagli del meteo
    windSpeedElement.textContent = `${weatherData.wind.speed} m/s`
    humidityElement.textContent = `${weatherData.main.humidity}%`
    pressureElement.textContent = `${weatherData.main.pressure} hPa`

    // Imposta la visibilità (convertita da metri a km)
    const visibilityKm = weatherData.visibility / 1000
    visibilityElement.textContent = `${visibilityKm.toFixed(1)} km`

    // Imposta i dati di alba e tramonto
    const sunriseTime = new Date((weatherData.sys.sunrise + weatherData.timezone) * 1000)
    const sunsetTime = new Date((weatherData.sys.sunset + weatherData.timezone) * 1000)

    sunriseTimeElement.textContent = formatTimeFromDate(sunriseTime)
    sunsetTimeElement.textContent = formatTimeFromDate(sunsetTime)

    // Calcola la posizione del sole
    updateSunPosition(weatherData.dt, weatherData.sys.sunrise, weatherData.sys.sunset, weatherData.timezone)

    // Imposta i dati sulla qualità dell'aria
    displayAirQuality(airQualityData)

    // Imposta le previsioni orarie
    displayHourlyForecast(forecastData, weatherData.timezone)
}

// Funzione per visualizzare la qualità dell'aria
function displayAirQuality(airQualityData) {
    const aqi = airQualityData.list[0].main.aqi
    let label = ""
    let percentage = 0

    switch (aqi) {
        case 1:
            label = "Ottima"
            percentage = 20
            break
        case 2:
            label = "Buona"
            percentage = 40
            break
        case 3:
            label = "Moderata"
            percentage = 60
            break
        case 4:
            label = "Scarsa"
            percentage = 80
            break
        case 5:
            label = "Pessima"
            percentage = 100
            break
        default:
            label = "Non disponibile"
            percentage = 0
    }

    airQualityGaugeElement.style.width = `${percentage}%`
    airQualityValueElement.textContent = `AQI: ${aqi}`
    airQualityLabelElement.textContent = label
}

// Funzione per visualizzare le previsioni orarie
function displayHourlyForecast(forecastData, timezoneOffset) {
    hourlyForecastContainer.innerHTML = ""

    // Prendi le prime 8 previsioni (24 ore, ogni 3 ore)
    const hourlyData = forecastData.list.slice(0, 8)

    hourlyData.forEach((item) => {
        const timestamp = item.dt * 1000
        const date = new Date(timestamp + timezoneOffset * 1000)
        const hour = date.getUTCHours().toString().padStart(2, "0")
        const minutes = date.getUTCMinutes().toString().padStart(2, "0")
        const time = `${hour}:${minutes}`

        const temp = Math.round(item.main.temp)
        const iconCode = item.weather[0].icon
        const description = item.weather[0].description

        const hourlyItem = document.createElement("div")
        hourlyItem.className = "hourly-item"
        hourlyItem.innerHTML = `
            <div class="hourly-time">${time}</div>
            <div class="hourly-icon">
                <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${description}">
            </div>
            <div class="hourly-temp">${temp}°C</div>
        `

        hourlyForecastContainer.appendChild(hourlyItem)
    })
}

// Funzione per calcolare l'ora locale
function calculateLocalTime(timezoneOffset) {
    // Ottieni l'ora UTC corrente
    const now = new Date()

    // Calcola l'ora locale
    const localTime = new Date(now.getTime() + timezoneOffset * 1000)

    // Formatta l'ora
    const hours = localTime.getUTCHours().toString().padStart(2, "0")
    const minutes = localTime.getUTCMinutes().toString().padStart(2, "0")
    const time = `${hours}:${minutes}`

    // Formatta la data
    const options = { weekday: "long", day: "numeric", month: "long", year: "numeric" }
    const date = localTime.toLocaleDateString("it-IT", options)

    return { time, date }
}

// Funzione per formattare l'ora da un oggetto Date
function formatTimeFromDate(date) {
    const hours = date.getUTCHours().toString().padStart(2, "0")
    const minutes = date.getUTCMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
}

// Funzione per formattare l'offset del fuso orario
function formatTimezoneOffset(offset) {
    // Converti l'offset da secondi a ore
    const hours = Math.floor(Math.abs(offset) / 3600)
    const minutes = Math.floor((Math.abs(offset) % 3600) / 60)

    // Formatta l'offset
    const sign = offset >= 0 ? "+" : "-"
    const formattedMinutes = minutes > 0 ? `:${minutes.toString().padStart(2, "0")}` : ""

    return `${sign}${hours}${formattedMinutes}`
}

// Funzione per aggiornare la posizione del sole
function updateSunPosition(currentTime, sunrise, sunset, timezoneOffset) {
    // Converti i timestamp in ora locale
    const now = currentTime + timezoneOffset
    const sunriseTime = sunrise + timezoneOffset
    const sunsetTime = sunset + timezoneOffset

    // Calcola la percentuale del giorno trascorsa
    const dayLength = sunsetTime - sunriseTime
    const timeElapsed = now - sunriseTime

    let percentage = (timeElapsed / dayLength) * 100

    // Limita la percentuale tra 0 e 100
    percentage = Math.max(0, Math.min(100, percentage))

    // Aggiorna la posizione del sole
    sunPositionElement.style.left = `${percentage}%`

    // Calcola la posizione verticale usando una funzione sinusoidale
    const verticalPosition = Math.sin((percentage / 100) * Math.PI) * 100
    sunPositionElement.style.bottom = `${verticalPosition}%`
}

// Funzione per mostrare il caricamento
function showLoading() {
    loadingContainer.classList.remove("hidden")
    errorContainer.classList.add("hidden")
    weatherContainer.classList.add("hidden")
}

// Funzione per mostrare un errore
function showError(message) {
    loadingContainer.classList.add("hidden")
    errorContainer.classList.remove("hidden")
    weatherContainer.classList.add("hidden")

    errorMessage.textContent = message
}
