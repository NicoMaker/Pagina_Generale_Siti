const apiKey = "e004d9474c784ab88e8a5d8a8c771c2a";

function getCityInfo() {
  const cityName = document.getElementById("cityInput").value;

  fetch(
    `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      cityName
    )}&key=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.results.length === 0) {
        displayResult("La città non esiste.");
      } else {
        const city = data.results[0];
        const cityInfo = {
          name:
            city.components.city ||
            city.components.town ||
            city.components.village ||
            city.components.county,
          state: city.components.state,
          country: city.components.country,
          latitude: city.geometry.lat,
          longitude: city.geometry.lng,
          timezone: city.annotations.timezone.name,
        };

        const currentTime = new Date().toLocaleString("it", {
          timeZone: cityInfo.timezone,
        });

        displayResult(`
          Città: ${cityInfo.name}<br>
          Regione: ${cityInfo.state}<br>
          Paese: ${cityInfo.country}<br>
          Fuso Orario: ${cityInfo.timezone}<br>
          latitudine: ${cityInfo.latitude} <br>
          longitudine: ${cityInfo.longitude} <br>
          Ora Locale: ${currentTime}
        `);
      }
    })
    .catch((error) => {
      console.error("Errore durante la richiesta API:", error);
    });
}

const displayResult = (text) =>
  (document.getElementById("result").innerHTML = text);