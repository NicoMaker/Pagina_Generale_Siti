function getCountryInfo() {
    const stateInput = document.getElementById('stateInput').value;

    fetch(`https://restcountries.com/v3.1/name/${stateInput}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 404) {
                document.getElementById('info').innerHTML = 'Lo stato non esiste';
                document.getElementById('flag').src = '';
            } else {
                const country = data[0];
                document.getElementById('info').innerHTML = `Latitudine: ${country.latlng[0]} <br> Longitudine: ${country.latlng[1]} <br> Ora Locale: ${new Date().toLocaleTimeString()} <br> Tipo di Fuso: ${country.timezones[0]}`;
                document.getElementById('flag').src = country.flags.svg;
            }
        })
        .catch(error => console.error(error) , document.getElementById('flag').src = "");
}