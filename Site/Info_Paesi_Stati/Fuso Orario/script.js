const apiKey = "e004d9474c784ab88e8a5d8a8c771c2a"

// DOM elements
const cityInput = document.getElementById("cityInput")
const searchButton = document.getElementById("searchButton")
const resultContainer = document.getElementById("resultContainer")
const result = document.getElementById("result")

// Event listeners
cityInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault()
    getCityInfo()
  }
})

// Set city from quick selection
function setCity(cityName) {
  cityInput.value = cityName
  getCityInfo()
}

// Main function to get city information
function getCityInfo() {
  const cityName = cityInput.value.trim()

  if (!cityName) {
    displayError("Per favore, inserisci il nome di una città.")
    return
  }

  // Show loading state
  showLoading(true)

  fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(cityName)}&key=${apiKey}&language=it`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Errore di rete: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      showLoading(false)

      if (data.results.length === 0) {
        displayError("Città non trovata. Controlla il nome e riprova.")
      } else {
        const city = data.results[0]
        const cityInfo = {
          name:
            city.components.city ||
            city.components.town ||
            city.components.village ||
            city.components.county ||
            cityName,
          state: city.components.state || "N/A",
          country: city.components.country || "N/A",
          latitude: city.geometry.lat,
          longitude: city.geometry.lng,
          timezone: city.annotations.timezone.name,
          flag: city.annotations.flag || "",
          currency: city.annotations.currency?.name || "N/A",
          currencySymbol: city.annotations.currency?.symbol || "",
        }

        const currentTime = new Date().toLocaleString("it-IT", {
          timeZone: cityInfo.timezone,
          dateStyle: "full",
          timeStyle: "medium",
        })

        displayCityInfo(cityInfo, currentTime)
      }
    })
    .catch((error) => {
      showLoading(false)
      console.error("Errore durante la richiesta API:", error)
      displayError("Si è verificato un errore durante la ricerca. Riprova più tardi.")
    })
}

// Display error message
function displayError(message) {
  result.innerHTML = `<div class="error-message">${message}</div>`
  resultContainer.classList.add("active")
}

// Display city information in a structured format
function displayCityInfo(cityInfo, currentTime) {
  const html = `
    <div class="city-info fade-in">
      <h3>${cityInfo.name}, ${cityInfo.country} ${cityInfo.flag}</h3>
      
      <div class="info-card">
        <span class="info-label">Regione/Stato</span>
        <span class="info-value">${cityInfo.state}</span>
      </div>
      
      <div class="info-card">
        <span class="info-label">Fuso Orario</span>
        <span class="info-value">${cityInfo.timezone}</span>
      </div>
      
      <div class="info-card">
        <span class="info-label">Ora Locale</span>
        <span class="info-value">${currentTime}</span>
      </div>
      
      <div class="info-card">
        <span class="info-label">Coordinate</span>
        <span class="info-value">${cityInfo.latitude.toFixed(4)}, ${cityInfo.longitude.toFixed(4)}</span>
      </div>
      
      <div class="info-card">
        <span class="info-label">Valuta</span>
        <span class="info-value">${cityInfo.currency} ${cityInfo.currencySymbol}</span>
      </div>
      
      <div class="map-container">
        <iframe 
          width="100%" 
          height="100%" 
          frameborder="0" 
          scrolling="no" 
          marginheight="0" 
          marginwidth="0" 
          src="https://www.openstreetmap.org/export/embed.html?bbox=${cityInfo.longitude - 0.02}%2C${cityInfo.latitude - 0.02}%2C${cityInfo.longitude + 0.02}%2C${cityInfo.latitude + 0.02}&amp;layer=mapnik&amp;marker=${cityInfo.latitude}%2C${cityInfo.longitude}" 
          style="border: 1px solid #ddd">
        </iframe>
      </div>
    </div>
  `

  result.innerHTML = html
  resultContainer.classList.add("active")
}

// Toggle loading state
function showLoading(isLoading) {
  const buttonText = document.querySelector(".button-text")
  const loader = document.querySelector(".loader")

  if (isLoading) {
    buttonText.style.opacity = "0"
    loader.style.display = "block"
    searchButton.disabled = true
  } else {
    buttonText.style.opacity = "1"
    loader.style.display = "none"
    searchButton.disabled = false
  }
}

// Initialize the app
function initApp() {
  // Focus on input field when page loads
  cityInput.focus()

  // Check if browser supports geolocation
  if (navigator.geolocation) {
    const geolocateButton = document.createElement("button")
    geolocateButton.className = "city-chip"
    geolocateButton.innerHTML = "La mia posizione"
    geolocateButton.onclick = getUserLocation

    document.querySelector(".city-chips").appendChild(geolocateButton)
  }
}

// Get user's current location
function getUserLocation() {
  if (navigator.geolocation) {
    showLoading(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}&language=it`)
          .then((response) => response.json())
          .then((data) => {
            showLoading(false)

            if (data.results.length > 0) {
              const location = data.results[0]
              const city =
                location.components.city ||
                location.components.town ||
                location.components.village ||
                location.components.county

              if (city) {
                cityInput.value = city
                getCityInfo()
              } else {
                displayError("Non è stato possibile determinare la tua città.")
              }
            } else {
              displayError("Non è stato possibile determinare la tua posizione.")
            }
          })
          .catch((error) => {
            showLoading(false)
            console.error("Errore durante la ricerca della posizione:", error)
            displayError("Si è verificato un errore durante la ricerca della tua posizione.")
          })
      },
      (error) => {
        showLoading(false)
        console.error("Errore di geolocalizzazione:", error)
        displayError("Non è stato possibile accedere alla tua posizione.")
      },
    )
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp)
