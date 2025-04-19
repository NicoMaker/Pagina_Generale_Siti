// Elementi DOM
const lineChartElement = document.getElementById("line-chart"),
  imgElement = document.getElementById("img"),
  passaggiElement = document.getElementById("passaggi"),
  risultatoElement = document.getElementById("risultato"),
  numeroInput = document.getElementById("numero"),
  infoButton = document.getElementById("info-button"),
  infoModal = document.getElementById("info-modal"),
  closeButton = document.querySelector(".close-button");

// Configurazione iniziale
lineChartElement.style.display = "none";

// Configurazione del grafico
const dati = {
  labels: [],
  datasets: [
    {
      label: "Sequenza di Collatz",
      borderWidth: 2,
      backgroundColor: "rgba(67, 97, 238, 0.2)",
      borderColor: "#4361ee",
      pointBackgroundColor: "#3a0ca3",
      pointBorderColor: "#ffffff",
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.3,
      data: [],
    },
  ],
};

let myChart = null;

// Gestione eventi input
numeroInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    CalcolaCollatz();
  }
});

// Gestione modale informazioni
infoButton.addEventListener("click", function () {
  infoModal.style.display = "block";
  document.body.style.overflow = "hidden"; // Impedisce lo scorrimento della pagina
});

closeButton.addEventListener("click", function () {
  infoModal.style.display = "none";
  document.body.style.overflow = "auto"; // Ripristina lo scorrimento della pagina
});

window.addEventListener("click", function (event) {
  if (event.target === infoModal) {
    infoModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

// Funzioni per il calcolo e la visualizzazione
function displayErrorMessage(message) {
  passaggiElement.innerHTML = "";
  risultatoElement.innerHTML = `<span class="error">${message}</span>`;
  lineChartElement.style.display = "none";
  imgElement.style.display = "block";
}

function showChart() {
  lineChartElement.style.display = "block";
  imgElement.style.display = "none";
}

function updateChart() {
  if (myChart) myChart.destroy();

  const config = {
    type: "line",
    data: dati,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          backgroundColor: "rgba(58, 12, 163, 0.8)",
          titleFont: {
            size: 14,
            weight: "bold",
          },
          bodyFont: {
            size: 13,
          },
          padding: 10,
          cornerRadius: 6,
          callbacks: {
            label: function (context) {
              return `Valore: ${context.parsed.y.toLocaleString()}`;
            },
            title: function (context) {
              return `Passo ${context[0].label}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            font: {
              size: 12,
            },
            callback: function (value) {
              if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + "M";
              } else if (value >= 1000) {
                return (value / 1000).toFixed(1) + "K";
              }
              return value;
            },
          },
        },
        x: {
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            font: {
              size: 12,
            },
          },
        },
      },
      animation: {
        duration: 1000,
        easing: "easeOutQuart",
      },
    },
  };

  const ctx = lineChartElement.getContext("2d");
  myChart = new Chart(ctx, config);
}

function displayResults(k, maxValue, tempoEsecuzione) {
  risultatoElement.innerHTML = `
    <div>Passi necessari: <strong>${k}</strong></div>
    <div>Valore massimo: <strong>${maxValue.toLocaleString()}</strong></div>
  `;
  updateChart();
}

function CalcolaCollatz() {
  const numero = parseInt(numeroInput.value);

  if (isNaN(numero) || numero <= 0 || numero === "") {
    displayErrorMessage("Per favore, inserisci un numero intero positivo");
  } else {
    showChart();

    // Misura il tempo di esecuzione
    const inizioTempo = performance.now();
    const { passi, maxValue } = CalcolaRisultato(numero);
    const fineTempo = performance.now();
    const tempoEsecuzione = Math.round(fineTempo - inizioTempo);

    displayResults(passi, maxValue, tempoEsecuzione);
  }
}

function CalcolaRisultato(numero) {
  // Reset dei dati
  dati.labels = [];
  dati.datasets[0].data = [];

  let passi = 0,
    maxValue = numero,
    stampaHTML = "",
    numeroCorrente = numero;

  dati.labels.push(passi);
  dati.datasets[0].data.push(numeroCorrente);

  // Aggiungi il numero iniziale alla sequenza
  stampaHTML += `<span class="numero-iniziale">${numeroCorrente}</span> → `;

  while (numeroCorrente > 1) {
    passi++;

    // Applica la regola di Collatz
    numeroCorrente =
      numeroCorrente % 2 === 0 ? numeroCorrente / 2 : 3 * numeroCorrente + 1;

    // Aggiorna il valore massimo se necessario
    if (numeroCorrente > maxValue) {
      maxValue = numeroCorrente;
    }

    // Aggiorna i dati del grafico
    dati.labels.push(passi);
    dati.datasets[0].data.push(numeroCorrente);

    // Aggiorna la visualizzazione HTML
    stampaHTML += `${numeroCorrente}`;

    // Aggiungi freccia se non è l'ultimo numero
    if (numeroCorrente > 1) stampaHTML += ` → `;

    // Aggiungi un'interruzione di riga ogni 8 numeri per migliorare la leggibilità
    if (passi % 8 === 0 && numeroCorrente > 1) {
      stampaHTML += "<br>";
    }
  }

  // Formatta il risultato finale
  passaggiElement.innerHTML = stampaHTML;

  return { passi, maxValue };
}

// Inizializzazione
risultatoElement.innerHTML = "Inserisci un numero per vedere i risultati";
