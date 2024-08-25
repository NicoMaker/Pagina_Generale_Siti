const output = document.getElementById("output"),
  immagine = document.getElementById("immagine"),
  outputregion = document.getElementById("outputregion");

document
  .querySelector("#generateButton")
  .addEventListener("click", handleGenerateButtonClick);

async function loadRegioni() {
  const response = await fetch("configurazioni.json");
  return await response.json();
}

const calculateTotalValues = (regioni, key) =>
    regioni.reduce((total, regione) => total + regione[key], 0),
  calculatePercent = (value, total) => ((value / total) * 100).toFixed(2),
  calculateDensity = (population, area) => (population / area).toFixed(2),
  selectRandomRegione = (regioni) =>
    regioni[Math.floor(Math.random() * regioni.length)];

function updateUI(
  regione,
  percentualeEstensione,
  percentualePopolazione,
  DensitàRegione
) {
  outputregion.innerHTML = `<p class="colorRegione">${regione.nome}</p>`;
  immagine.innerHTML = `<img src="img/${regione.immagine}" alt="${regione.nome}">`;
  output.innerHTML = `
    <p class="colorRegione">Il capoluogo è: ${regione.capoluogo}</p>
    <p class="colorRegione">km<sup>2</sup> regione ${regione.estensione_km2} : ${percentualeEstensione} % dell'Italia</p>
    <p class="colorRegione">Popolazione regione ${regione.popolazione} : ${percentualePopolazione} % dell'Italia</p>
    <p class="colorRegione">Densità regione : ${DensitàRegione} ab/km<sup>2</sup></p>
  `;
}

function handleGenerateButtonClick() {
  loadRegioni().then((regioni) => {
    const totalEstensione = calculateTotalValues(regioni, "estensione_km2"),
      totalPopolazione = calculateTotalValues(regioni, "popolazione");

    let randomGenerator = setInterval(() => {
      displayRandomRegione(regioni, totalEstensione, totalPopolazione);
    }, 150);

    setTimeout(() => {
      clearInterval(randomGenerator);
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
    );

  updateUI(
    regioneCasuale,
    percentualeEstensione,
    percentualePopolazione,
    DensitàRegione
  );
}
