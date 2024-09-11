document
  .querySelector("#generateButton")
  .addEventListener("click", handleGenerateButtonClick);

async function loadRegioni() {
  const response = await fetch("configurazioni.json");
  return response.json();
}

const calculateTotalValues = (regioni, key) =>
    regioni.reduce((total, regione) => total + regione[key], 0),
  calculatePercent = (value, total) => ((value / total) * 100).toFixed(2),
  calculateDensity = (population, area) => (population / area).toFixed(2),
  selectRandomRegione = (regioni) =>
    regioni[Math.floor(Math.random() * regioni.length)],
  generateProvinceList = (province) =>
    province.map((provincia) => `<li>${provincia}</li>`).join(""),
  updateUI = (html) => (document.getElementById("output").innerHTML = html);

function generateRegioneHTML(
  regione,
  percentualeEstensione,
  percentualePopolazione,
  DensitàRegione
) {
  const { nome, immagine, capoluogo, estensione_km2, popolazione, province } =
      regione,
    numeroProvince = province.length,
    elencoProvince = generateProvinceList(province);

  return `
      <p class="colorRegione">${nome}</p>
      <img src="img/${immagine}" alt="${nome}">
      <p class="colorRegione"><strong> Il capoluogo è :</strong> ${capoluogo}</p>
      <p class="colorRegione"><strong>km<sup>2</sup> regione ${estensione_km2} :</strong> ${percentualeEstensione}% dell'Italia</p>
      <p class="colorRegione"><strong>Popolazione regione ${popolazione} :</strong> ${percentualePopolazione}% dell'Italia</p>
      <p class="colorRegione"><strong>Densità regione :</strong> ${DensitàRegione} ab/km<sup>2</sup></p>
      <p class="colorRegione"><strong>Numero di province :</strong> ${numeroProvince}</p>
      <p class="colorRegione"><strong>Province :</strong></p>
      <ol class="colorRegione">${elencoProvince}</ol>
    `;
}

function handleGenerateButtonClick() {
  loadRegioni().then((regioni) => {
    const totalEstensione = calculateTotalValues(regioni, "estensione_km2"),
      totalPopolazione = calculateTotalValues(regioni, "popolazione"),
      intervalId = setInterval(() => {
        displayRandomRegione(regioni, totalEstensione, totalPopolazione);
      }, 150);

    setTimeout(() => {
      clearInterval(intervalId);
      displayRandomRegione(regioni, totalEstensione, totalPopolazione);
    }, 500);
  });
}

function displayRandomRegione(regioni, totalEstensione, totalPopolazione) {
  const regioneCasuale = selectRandomRegione(regioni),
    percentualeEstensione = calculatePercent(
      regioneCasuale.estensione_km2,
      totalEstensione
    ),
    percentualePopolazione = calculatePercent(
      regioneCasuale.popolazione,
      totalPopolazione
    ),
    DensitàRegione = calculateDensity(
      regioneCasuale.popolazione,
      regioneCasuale.estensione_km2
    ),
    regioneHTML = generateRegioneHTML(
      regioneCasuale,
      percentualeEstensione,
      percentualePopolazione,
      DensitàRegione
    );

  updateUI(regioneHTML);
}
