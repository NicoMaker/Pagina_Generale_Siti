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
  gameStarted = false;

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

function setInitialImages() {
  const defaultImage = "Img/Imagine.jpg";
  outputs.forEach((output) => {
    output.innerHTML = `<img src="${defaultImage}" alt="Immagine di default" />`;
    output.style.backgroundColor = ""; // Resetta il colore
  });
}

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
  gameStarted = false;
  setInitialImages();
});

function playVictoryAnimation() {
  let iteration = 0;
  const interval = setInterval(() => {
    outputs.forEach((output) => {
      output.style.backgroundColor =
        output.style.backgroundColor === "yellow" ? "" : "yellow";
    });
    iteration++;
    if (iteration >= 5) clearInterval(interval);
  }, 300);

  createConfetti(); // Avvia i coriandoli
}

function createConfetti() {
  const confettiContainer = document.createElement("div");
  confettiContainer.className = "confetti-container";
  document.body.appendChild(confettiContainer);

  for (let i = 0; i < 200; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = `${Math.random() * 100}%`;
    confetti.style.animationDuration = `${Math.random() * 2 + 3}s`;
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    confettiContainer.appendChild(confetti);
  }

  setTimeout(() => {
    confettiContainer.remove(); // Rimuovi i coriandoli dopo 5 secondi
  }, 5000);
}

function resetBackgroundColors() {
  outputs.forEach((output) => {
    output.style.backgroundColor = ""; // Rimuovi il colore di sfondo
  });
}

generate.addEventListener("click", function () {
  if (suits.length === 0) {
    resultElement.innerHTML = "<p>Non ci sono carte disponibili.</p>";
    return;
  }

  // Ripristina i colori prima di rigenerare
  resetBackgroundColors();

  if (!gameStarted) {
    setInitialImages();
    gameStarted = true;
  }

  setTimeout(() => {
    let randomGenerator = setInterval(() => {
      outputs.forEach((output) => setRandomImage(output));
    }, 150);

    setTimeout(() => {
      clearInterval(randomGenerator);
      const suitImages = outputs.map(
          (output) => output.querySelector("img")?.src
        ),
        allEqual = suitImages.every((val, i, arr) => val === arr[0]);

      resultElement.innerHTML = `<p>${
        allEqual ? "Hai Vinto!" : "Non Hai Vinto"
      }</p>`;
      if (allEqual) playVictoryAnimation();
    }, 500);
  }, 500);
});
