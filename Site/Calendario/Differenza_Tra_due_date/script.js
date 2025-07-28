document.addEventListener("DOMContentLoaded", () => {
  // Imposta le date di default
  setDefaultDates();

  // Aggiungi event listener per i tasti Enter
  document
    .getElementById("inputDate1")
    .addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("inputDate2").focus();
      }
    });

  document
    .getElementById("inputDate2")
    .addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        calcolaDifferenzaTempo();
      }
    });
});

// Funzione per impostare le date di default
function setDefaultDates() {
  const now = new Date();
  const formattedNow = formatDateForInput(now);

  document.getElementById("inputDate1").value = formattedNow;
  document.getElementById("inputDate2").value = formattedNow;
}

// Funzione per formattare la data per l'input datetime-local
function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Funzione per calcolare la differenza di tempo
function calcolaDifferenzaTempo() {
  let data1 = new Date(document.getElementById("inputDate1").value);
  let data2 = new Date(document.getElementById("inputDate2").value);

  if (isNaN(data1.getTime()) || isNaN(data2.getTime())) {
    showError("Inserisci date valide.");
    return;
  }

  // Assicurati che data1 sia sempre la data precedente
  if (data1 > data2) {
    [data1, data2] = [data2, data1];
  }

  const differenza = Math.abs(data2 - data1);
  const millisecondiInUnAnno = 1000 * 60 * 60 * 24 * 365.25;
  const anni = Math.floor(differenza / millisecondiInUnAnno);
  const giorniRimasti = differenza % millisecondiInUnAnno;
  const millisecondiInUnGiorno = 1000 * 60 * 60 * 24;
  const giorni = Math.floor(giorniRimasti / millisecondiInUnGiorno);
  const oreRimanenti = giorniRimasti % millisecondiInUnGiorno;
  const millisecondiInUnOra = 1000 * 60 * 60;
  const ore = Math.floor(oreRimanenti / millisecondiInUnOra);
  const minutiRimasti = oreRimanenti % millisecondiInUnOra;
  const millisecondiInUnMinuto = 1000 * 60;
  const minuti = Math.floor(minutiRimasti / millisecondiInUnMinuto);
  const secondi = Math.floor((minutiRimasti % millisecondiInUnMinuto) / 1000);

  // Formatta le date per la visualizzazione
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  const data1Formattata = data1.toLocaleDateString("it-IT", options);
  const data2Formattata = data2.toLocaleDateString("it-IT", options);

  // Aggiorna il testo del risultato
  document.getElementById("risultato").innerHTML = `
    <p>Differenza tra <strong>${data1Formattata}</strong> e <strong>${data2Formattata}</strong>:</p>
  `;

  // Aggiorna i valori delle unità di tempo
  document.getElementById("years").textContent = anni;
  document.getElementById("days").textContent = giorni;
  document.getElementById("hours").textContent = ore;
  document.getElementById("minutes").textContent = minuti;
  document.getElementById("seconds").textContent = secondi;

  // Mostra la card del risultato
  document.getElementById("result-card").classList.remove("hidden");
  document.getElementById("result-card").classList.add("visible");

  // Anima l'entrata dei numeri
  animateNumbers();
}

// Funzione per animare i numeri
function animateNumbers() {
  const timeValues = document.querySelectorAll(".time-value");

  timeValues.forEach((value) => {
    value.classList.add("animate-number");
    setTimeout(() => {
      value.classList.remove("animate-number");
    }, 1000);
  });
}

// Funzione per mostrare un errore
function showError(message) {
  document.getElementById("risultato").innerHTML =
    `<p class="error">${message}</p>`;
  document.getElementById("result-card").classList.remove("hidden");
  document.getElementById("result-card").classList.add("visible");

  // Resetta i valori delle unità di tempo
  document.getElementById("years").textContent = "0";
  document.getElementById("days").textContent = "0";
  document.getElementById("hours").textContent = "0";
  document.getElementById("minutes").textContent = "0";
  document.getElementById("seconds").textContent = "0";
}

// Funzione per reimpostare il form
function resetForm() {
  setDefaultDates();
  closeResult();
}

// Funzione per chiudere il risultato
function closeResult() {
  document.getElementById("result-card").classList.remove("visible");
  setTimeout(() => {
    document.getElementById("result-card").classList.add("hidden");
  }, 300);
}

// Funzioni per le azioni rapide
function setToday() {
  const now = new Date();
  const formattedNow = formatDateForInput(now);

  document.getElementById("inputDate1").value = formattedNow;
  document.getElementById("inputDate2").value = formattedNow;
  calcolaDifferenzaTempo();
}

function setOneWeek() {
  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  document.getElementById("inputDate1").value = formatDateForInput(oneWeekAgo);
  document.getElementById("inputDate2").value = formatDateForInput(now);
  calcolaDifferenzaTempo();
}

function setOneMonth() {
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  document.getElementById("inputDate1").value = formatDateForInput(oneMonthAgo);
  document.getElementById("inputDate2").value = formatDateForInput(now);
  calcolaDifferenzaTempo();
}

function setOneYear() {
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  document.getElementById("inputDate1").value = formatDateForInput(oneYearAgo);
  document.getElementById("inputDate2").value = formatDateForInput(now);
  calcolaDifferenzaTempo();
}
