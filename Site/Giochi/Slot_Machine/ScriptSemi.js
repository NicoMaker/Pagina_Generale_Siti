const outputs = [
    document.querySelector("#suit1"),
    document.querySelector("#suit2"),
    document.querySelector("#suit3"),
    document.querySelector("#suit4"),
  ],
  generate = document.querySelector("#generateButton"),
  gameTypeSelect = document.querySelector("#gameType"),
  resultElement = document.getElementById("Result"),
  gameTypes = {
    briscola: () => cardsData.briscola,
    scala40: () => cardsData.scala40,
    regioni: () => cardsData.regioni,
    regioni_briscola: () => cardsData.briscola.concat(cardsData.regioni),
    regioni_scala: () => cardsData.scala40.concat(cardsData.regioni),
    briscola_scala40: () => cardsData.briscola.concat(cardsData.scala40),
    default: () =>
      cardsData.briscola.concat(cardsData.scala40, cardsData.regioni),
  };

let suits = [],
  cardsData = {};

async function loadCards() {
  try {
    const response = await fetch("cards.json");
    if (!response.ok) throw new Error("Errore nel caricamento dei dati");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    resultElement.innerHTML = "<p>Errore nel caricamento delle carte</p>";
  }
}

loadCards().then((data) => {
  if (data) {
    cardsData = data;
    suits = cardsData.briscola;
  }
});

function setRandomImage(container) {
  if (suits.length > 0)
    container.innerHTML = `<img src="${
      suits[Math.floor(Math.random() * suits.length)]
    }" alt="Suit">`;
  else container.innerHTML = `<p>Immagini non disponibili</p>`;
}

gameTypeSelect.addEventListener("change", function () {
  if (!cardsData || Object.keys(cardsData).length === 0) {
    resultElement.innerHTML = "<p>Attendi il caricamento delle carte...</p>";
    return;
  }
  const selectedGameType = gameTypeSelect.value;
  suits = (gameTypes[selectedGameType] || gameTypes.default)();
});

generate.addEventListener("click", function () {
  if (suits.length === 0) {
    resultElement.innerHTML = "<p>Non ci sono carte disponibili.</p>";
    return;
  }

  let randomGenerator = setInterval(() => {
    outputs.forEach((output) => setRandomImage(output));
  }, 150);

  setTimeout(() => {
    clearInterval(randomGenerator);
    const suitImages = outputs.map(
        (output) => output.querySelector("img")?.src,
      ),
      allEqual = suitImages.every((val, i, arr) => val === arr[0]);

    resultElement.innerHTML = `<p>${
      allEqual ? "Hai Vinto" : "Non Hai Vinto"
    }</p>`;
  }, 500);
});
