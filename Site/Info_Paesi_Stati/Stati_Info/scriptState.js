// DOM Elements
const stateInput = document.getElementById("stateInput");
const searchButton = document.getElementById("searchButton");
const resultsSection = document.getElementById("resultsSection");
const countryCard = document.getElementById("countryCard");
const countryName = document.getElementById("countryName");
const info = document.getElementById("info");
const additionalInfo = document.getElementById("additionalInfo");
const flag = document.getElementById("flag");
const flagPlaceholder = document.querySelector(".flag-placeholder");
const notification = document.getElementById("notification");
const notificationText = document.getElementById("notificationText");

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Focus on input when page loads
  stateInput.focus();

  // Listen for Enter key
  stateInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      getCountryInfo();
    }
  });

  // Add click event to search button
  searchButton.addEventListener("click", getCountryInfo);

  // Check for saved country in localStorage
  const savedCountry = localStorage.getItem("lastSearchedCountry");
  if (savedCountry) {
    stateInput.value = savedCountry;
    // Optional: Auto-search the saved country
    // getCountryInfo();
  }
});

// Show notification
function showNotification(message, type = "error") {
  notificationText.textContent = message;
  notification.className = `notification show ${type}`;

  setTimeout(() => {
    notification.className = "notification";
  }, 3000);
}

// Toggle loading state
function toggleLoading(isLoading) {
  const buttonText = document.querySelector(".button-text");
  const loader = document.querySelector(".loader");

  if (isLoading) {
    buttonText.style.opacity = "0";
    loader.style.display = "block";
    searchButton.disabled = true;
    stateInput.disabled = true;
  } else {
    buttonText.style.opacity = "1";
    loader.style.display = "none";
    searchButton.disabled = false;
    stateInput.disabled = false;
    stateInput.focus();
  }
}

// Show loading skeletons
function showLoadingSkeletons() {
  info.innerHTML = Array(6)
    .fill()
    .map(
      () => `
      <div class="info-item">
        <div class="skeleton" style="width: 40%;"></div>
        <div class="skeleton" style="width: 70%;"></div>
      </div>
    `
    )
    .join("");

  additionalInfo.innerHTML = Array(4)
    .fill()
    .map(
      () => `
      <div class="info-card">
        <div class="skeleton" style="width: 50%;"></div>
        <div class="skeleton" style="width: 80%;"></div>
        <div class="skeleton" style="width: 60%;"></div>
      </div>
    `
    )
    .join("");
}

// Format population number
function formatPopulation(population) {
  return new Intl.NumberFormat().format(population);
}

// Format area
function formatArea(area) {
  return area ? `${new Intl.NumberFormat().format(area)} km²` : "N/A";
}

// Get country information
function getCountryInfo() {
  const stateName = stateInput.value.trim();

  if (!stateName) {
    showNotification("Per favore, inserisci il nome di uno stato.");
    return;
  }

  // Save to localStorage
  localStorage.setItem("lastSearchedCountry", stateName);

  // Show loading state
  toggleLoading(true);

  // Reset previous results
  flag.src = "";
  flag.classList.remove("visible");
  flagPlaceholder.classList.remove("hidden");

  // Show results section with loading skeletons
  resultsSection.classList.add("active");
  showLoadingSkeletons();

  // Fetch with timeout for better error handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  fetch(`https://restcountries.com/v3.1/name/${stateName}`, {
    signal: controller.signal,
  })
    .then((response) => {
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error("Stato non trovato");
      }
      return response.json();
    })
    .then((data) => {
      // Hide loading state
      toggleLoading(false);

      if (data.length === 0) {
        showNotification("Stato non trovato. Controlla il nome e riprova.");
        return;
      }

      // Get the first result
      const country = data[0];

      // Set country name
      countryName.textContent = country.name.common;

      // Set flag
      if (country.flags && country.flags.svg) {
        flag.src = country.flags.svg;
        flag.alt = `Bandiera di ${country.name.common}`;
        flag.onload = () => {
          flag.classList.add("visible");
          flagPlaceholder.classList.add("hidden");
        };
      }

      // Set basic info
      let localTime;
      try {
        localTime = new Date().toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: country.timezones[0],
        });
      } catch (e) {
        localTime = "Non disponibile";
      }

      info.innerHTML = `
        <div class="info-item">
          <span class="info-label">Capitale</span>
          <span class="info-value">${
            country.capital ? country.capital[0] : "N/A"
          }</span>
        </div>
        <div class="info-item">
          <span class="info-label">Regione</span>
          <span class="info-value">${country.region} ${
        country.subregion ? `(${country.subregion})` : ""
      }</span>
        </div>
        <div class="info-item">
          <span class="info-label">Latitudine</span>
          <span class="info-value">${
            country.latlng && country.latlng[0]
              ? country.latlng[0].toFixed(2) + "°"
              : "N/A"
          }</span>
        </div>
        <div class="info-item">
          <span class="info-label">Longitudine</span>
          <span class="info-value">${
            country.latlng && country.latlng[1]
              ? country.latlng[1].toFixed(2) + "°"
              : "N/A"
          }</span>
        </div>
        <div class="info-item">
          <span class="info-label">Fuso Orario</span>
          <span class="info-value">${
            country.timezones && country.timezones[0]
              ? country.timezones[0]
              : "N/A"
          }</span>
        </div>
        <div class="info-item">
          <span class="info-label">Ora Locale</span>
          <span class="info-value">${localTime}</span>
        </div>
      `;

      // Set additional info
      let currenciesHTML = "";
      if (country.currencies) {
        const currencies = Object.values(country.currencies);
        currenciesHTML = currencies
          .map(
            (currency) => `
          <div class="currency">
            <span class="currency-symbol">${currency.symbol || "?"}</span>
            ${currency.name}
          </div>
        `
          )
          .join("");
      }

      let languagesHTML = "";
      if (country.languages) {
        const languages = Object.values(country.languages);
        languagesHTML = languages
          .map((language) => `<li>${language}</li>`)
          .join("");
      }

      additionalInfo.innerHTML = `
        <div class="info-card">
          <h3>Informazioni Generali</h3>
          <ul>
            <li>Popolazione: ${formatPopulation(country.population)}</li>
            <li>Area: ${formatArea(country.area)}</li>
            ${country.independent ? "<li>Stato indipendente</li>" : ""}
            ${country.unMember ? "<li>Membro delle Nazioni Unite</li>" : ""}
          </ul>
        </div>
        
        <div class="info-card">
          <h3>Valute</h3>
          ${currenciesHTML || "Nessuna informazione disponibile"}
        </div>
        
        <div class="info-card">
          <h3>Lingue</h3>
          <ul>
            ${languagesHTML || "<li>Nessuna informazione disponibile</li>"}
          </ul>
        </div>
        
        <div class="info-card">
          <h3>Confini</h3>
          <ul>
            ${
              country.borders && country.borders.length > 0
                ? country.borders.map((border) => `<li>${border}</li>`).join("")
                : "<li>Nessun confine terrestre</li>"
            }
          </ul>
        </div>
      `;

      // Show success notification
      showNotification(
        `Informazioni su ${country.name.common} caricate con successo!`,
        "success"
      );

      // Scroll to results
      resultsSection.scrollIntoView({ behavior: "smooth" });
    })
    .catch((error) => {
      // Hide loading state
      toggleLoading(false);

      console.error("Errore:", error);

      if (error.name === "AbortError") {
        showNotification(
          "La richiesta è scaduta. Verifica la tua connessione e riprova."
        );
      } else {
        showNotification("Stato non trovato. Controlla il nome e riprova.");
      }

      // Hide results section if it was showing loading skeletons
      if (!resultsSection.querySelector("#countryName").textContent) {
        resultsSection.classList.remove("active");
      }
    });
}

// Add offline detection
window.addEventListener("online", () => {
  showNotification("Connessione ristabilita!", "success");
});

window.addEventListener("offline", () => {
  showNotification(
    "Sei offline. Alcune funzionalità potrebbero non essere disponibili.",
    "error"
  );
});
