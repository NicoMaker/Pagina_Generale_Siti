const output = document.getElementById("output"),
  immagine = document.getElementById("immagine"),
  outputregion = document.getElementById("outputregion");

async function loadRegioni() {
  const response = await fetch("configurazioni.json");
  return await response.json();
}

function setRandom(regioni, totalEstensione, totalPopolazione) {
  const regioneCasuale = regioni[Math.floor(Math.random() * regioni.length)],
    percentualeEstensione = (
      (regioneCasuale.estensione_km2 / totalEstensione) *
      100
    ).toFixed(2),
    percentualePopolazione = (
      (regioneCasuale.popolazione / totalPopolazione) *
      100
    ).toFixed(2),
    DensitàRegione = (
      regioneCasuale.popolazione / regioneCasuale.estensione_km2
    ).toFixed(2);

  outputregion.innerHTML = `<p class="colorRegione">${regioneCasuale.nome}</p>`;
  immagine.innerHTML = `<img src="img/${regioneCasuale.immagine}" alt="${regioneCasuale.nome}">`;
  output.innerHTML = `
    <p class="colorRegione">Il capoluogo è: ${regioneCasuale.capoluogo}</p>
    <p class="colorRegione">km<sup>2</sup> regione ${regioneCasuale.estensione_km2} : ${percentualeEstensione} % dell'Italia</p>
    <p class="colorRegione">Popolazione regione ${regioneCasuale.popolazione} : ${percentualePopolazione} % dell'Italia</p>
    <p class="colorRegione">Densità regione : ${DensitàRegione} ab/km<sup>2</sup></p>
  `;
}

document
  .querySelector("#generateButton")
  .addEventListener("click", function () {
    loadRegioni().then((regioni) => {
      const totalEstensione = regioni.reduce(
        (total, regione) => total + regione.estensione_km2,
        0
      );
      const totalPopolazione = regioni.reduce(
        (total, regione) => total + regione.popolazione,
        0
      );

      let randomGenerator = setInterval(() => {
        setRandom(regioni, totalEstensione, totalPopolazione);
      }, 150);

      setTimeout(() => {
        clearInterval(randomGenerator);
        setRandom(regioni, totalEstensione, totalPopolazione);
      }, 500);
    });
  });
