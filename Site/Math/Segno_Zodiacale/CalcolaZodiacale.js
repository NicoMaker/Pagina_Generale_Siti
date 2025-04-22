const output = document.getElementById("output"),
  immagine = document.getElementById("immagine"),
  definition = document.getElementById("definition"),
  year = new Date().getFullYear(),
  updateImmagine = (imageSrc) => {
    immagine.innerHTML = `<img src="${imageSrc}" class="fade-in">`;
  },
  updateOutput = (text, isError = false) => {
    output.innerHTML = `<p class="${
      isError ? "error" : "colorSegno"
    } fade-in">${text}</p>`;
  },
  monthDayToDate = (month, day) =>
    day > new Date(year, month + 1, 0).getDate()
      ? undefined
      : new Date(year, month, day);

// Create starry background
function createStars() {
  const container = document.getElementById("container");
  for (let i = 0; i < 50; i++) {
    const star = document.createElement("div");
    star.classList.add("star");
    star.style.width = `${Math.random() * 2 + 1}px`;
    star.style.height = star.style.width;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 3}s`;
    container.appendChild(star);
  }
}

// Load zodiac configuration
async function loadZodiacConfig() {
  try {
    const response = await fetch("configurazioni.json");
    return await response.json();
  } catch (error) {
    console.error("Errore nel caricamento della configurazione:", error);
    updateOutput("Errore nel caricamento dei dati. Riprova più tardi.", true);
    return [];
  }
}

// Parse date from string
function parseDate(str) {
  const [month, day] = str.split("-").map(Number);
  return monthDayToDate(month - 1, day);
}

// Calculate zodiac sign
async function calcolaSegnoZodiacale() {
  const day = parseInt(document.getElementById("day").value),
    month = parseInt(document.getElementById("month").value);

  // Validate inputs
  if (
    isNaN(day) ||
    isNaN(month) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12
  ) {
    updateOutput("Inserisci un giorno e un mese validi", true);
    updateImmagine("img/segni.jpg");
    definition.innerHTML = "";
    return;
  }

  const selectedDate = monthDayToDate(month - 1, day)?.valueOf();

  if (!selectedDate) {
    updateOutput("Data non valida per il mese selezionato", true);
    updateImmagine("img/segni.jpg");
    definition.innerHTML = "";
    return;
  }

  // Show loading state
  updateOutput("Calcolando il tuo segno...");

  const config = await loadZodiacConfig(),
    segno = config.find(({ inizio, fine }) => {
      const inizioDate = parseDate(inizio)?.valueOf(),
        fineDate = parseDate(fine)?.valueOf();
      return selectedDate >= inizioDate && selectedDate <= fineDate;
    });

  if (!segno) {
    updateOutput("Data non valida", true);
    updateImmagine("img/segni.jpg");
    definition.innerHTML = "";
    return;
  }

  // Update UI with zodiac sign information
  setTimeout(() => {
    updateOutput(`Il tuo segno zodiacale è ${segno.segno}`);
    updateImmagine(`img/${segno.segno}.jpg`);

    const caratteristicheFormatte =
      segno.Caratteristiche.split(",").join(",<br>");

    definition.innerHTML = `
      <div class="fade-in">
        <p><span class="viola">Elemento del segno:</span> ${segno.Elemento}</p>
        <p><span class="viola">Caratteristiche del segno:</span></p>
        <p>${caratteristicheFormatte}</p>
      </div>
    `;
  }, 500); // Small delay for animation effect
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  createStars();
  updateImmagine("img/segni.jpg");
});
