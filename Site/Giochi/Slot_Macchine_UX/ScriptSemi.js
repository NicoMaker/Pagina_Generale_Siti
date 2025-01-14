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
  cardsData = {},
  gameStarted = false; // Variabile per tracciare se il gioco è stato avviato

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

// Funzione per impostare immagini iniziali (default)
function setInitialImages() {
  const defaultImage = "Img/Imagine.jpg"; // Sostituisci con il link delle immagini iniziali
  outputs.forEach((output) => {
    output.innerHTML = `<img src="${defaultImage}" alt="Immagine di default" />`;
  });
}

// Funzione per impostare le carte casuali
function setRandomImage(container) {
  if (suits.length > 0)
    container.innerHTML = `<img src="${
      suits[Math.floor(Math.random() * suits.length)]
    }" alt="Suit">`;
  else container.innerHTML = `<p>Immagini non disponibili</p>`;
}

// Gestione della selezione del tipo di gioco
gameTypeSelect.addEventListener("change", function () {
  if (!cardsData || Object.keys(cardsData).length === 0) {
    resultElement.innerHTML = "<p>Attendi il caricamento delle carte...</p>";
    return;
  }
  const selectedGameType = gameTypeSelect.value;
  suits = (gameTypes[selectedGameType] || gameTypes.default)();
  gameStarted = false; // Resetta lo stato del gioco quando cambia il tipo di gioco
  setInitialImages(); // Mostra le immagini iniziali
});

generate.addEventListener("click", function () {
  if (suits.length === 0) {
    resultElement.innerHTML = "<p>Non ci sono carte disponibili.</p>";
    return;
  }

  if (!gameStarted) {
    // Impostare immagini iniziali prima della generazione
    setInitialImages();
    gameStarted = true; // Segna che il gioco è stato avviato
  }

  // Dopo 500ms, inizia la generazione delle carte casuali
  setTimeout(() => {
    // Genera le immagini in modo casuale
    let randomGenerator = setInterval(() => {
      outputs.forEach((output) => setRandomImage(output));
    }, 150);

    // Dopo 500ms, interrompe la generazione casuale e mostra il risultato
    setTimeout(() => {
      clearInterval(randomGenerator);
      const suitImages = outputs.map(
          (output) => output.querySelector("img")?.src
        ),
        allEqual = suitImages.every((val, i, arr) => val === arr[0]);

      resultElement.innerHTML = `<p>${
        allEqual ? "Hai Vinto" : "Non Hai Vinto"
      }</p>`;
    }, 500); // La generazione si ferma dopo 500ms
  }, 500); // Aspetta prima di iniziare la generazione
});
