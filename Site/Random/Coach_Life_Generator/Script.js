async function fetchData() {
  const response = await fetch("frasi.json");
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
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

const updateInitialPhrase = (iniziale) =>
    (document.getElementById(
      "frase"
    ).innerHTML = `<p class="scritta">${iniziale}</p>`),
  setupGenerateButton = (phrases) =>
    document
      .getElementById("generateButton")
      .addEventListener("click", () => handleGenerateButtonClick(phrases));

function handleGenerateButtonClick(phrases) {
  const phrasegenerated = document.getElementById("phrase"),
    randomGenerator = setInterval(
      () => generateRandomPhrase(phrases, phrasegenerated),
      150
    );

  setTimeout(() => {
    clearInterval(randomGenerator);
    generateRandomPhrase(phrases, phrasegenerated);
  }, 500);
}

function generateRandomPhrase(phrases, element) {
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  updateInitialPhrase("");
  element.innerHTML = randomPhrase;
}

initialize();
