async function fetchData() {
  try {
    const response = await fetch("frasi.json");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    // Fallback data in case the fetch fails
    return {
      iniziale:
        "Le Frasi hanno un Potere particolare di guarire le persone nei propri sentimenti oppure distruggerli, fanne buon uso",
      frasi: [
        "Ricorda che le montagne più alte sono scalate passo dopo passo. Non temere la salita, ma goditi il panorama lungo il cammino.",
        "Le tue parole hanno il potere di creare, di guarire, di ispirare. Usa la tua voce con saggezza e gentilezza.",
        "L'amore è il filo d'oro che connette il cuore umano. Coltivalo, diffondilo e trasforma il mondo.",
      ],
    };
  }
}

async function initialize() {
  try {
    const data = await fetchData();
    updateInitialPhrase(data.iniziale);
    setupGenerateButton(data.frasi);
  } catch (error) {
    console.error("Error initializing the application:", error);
  }
}

function updateInitialPhrase(iniziale) {
  const fraseElement = document.getElementById("frase");
  fraseElement.innerHTML = `<p class="scritta">${iniziale}</p>`;
  fraseElement.classList.add("fade-in");
}

function setupGenerateButton(phrases) {
  const button = document.getElementById("generateButton");
  button.addEventListener("click", () => handleGenerateButtonClick(phrases));
}

function handleGenerateButtonClick(phrases) {
  const phraseElement = document.getElementById("phrase");
  const fraseElement = document.getElementById("frase");
  const quoteCard = document.querySelector(".quote-card");

  // Add a subtle pulse effect to the card
  quoteCard.style.transform = "scale(1.02)";
  setTimeout(() => {
    quoteCard.style.transform = "";
  }, 300);

  // Clear the initial phrase
  fraseElement.innerHTML = "";

  // Create a shuffling effect
  let counter = 0;
  const maxIterations = 10;
  const shuffleInterval = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    phraseElement.textContent = phrases[randomIndex];

    counter++;
    if (counter >= maxIterations) {
      clearInterval(shuffleInterval);

      // Final random phrase with animation
      const finalIndex = Math.floor(Math.random() * phrases.length);
      phraseElement.textContent = "";
      phraseElement.classList.remove("fade-in");

      // Force a reflow to restart the animation
      void phraseElement.offsetWidth;

      phraseElement.textContent = phrases[finalIndex];
      phraseElement.classList.add("fade-in");
    }
  }, 50);
}

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", initialize);
