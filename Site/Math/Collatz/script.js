document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM
  const infoButton = document.getElementById("info-button");
  const infoModal = document.getElementById("info-modal");
  const closeButton = document.querySelector(".close-button");
  const calcolaButton = document.getElementById("calcola-button");
  const numeroInput = document.getElementById("numero");
  const resultsSection = document.getElementById("results-section");
  const initialNumberEl = document.getElementById("initial-number");
  const stepsCountEl = document.getElementById("steps-count");
  const maxValueEl = document.getElementById("max-value");
  const finalValueEl = document.getElementById("final-value");
  const sequenceContainer = document.getElementById("sequence-container");

  // Variabili per il grafico
  let collatzChart = null;

  // Gestione del modal
  infoButton.addEventListener("click", () => {
    infoModal.style.display = "block";
    setTimeout(() => {
      infoModal.classList.add("active");
    }, 10);
  });

  closeButton.addEventListener("click", closeModal);

  infoModal.addEventListener("click", (event) => {
    if (event.target === infoModal) {
      closeModal();
    }
  });

  function closeModal() {
    infoModal.classList.remove("active");
    setTimeout(() => {
      infoModal.style.display = "none";
    }, 300);
  }

  // Gestione del calcolo
  calcolaButton.addEventListener("click", calcolaCollatz);
  numeroInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      calcolaCollatz();
    }
  });

  function calcolaCollatz() {
    const numero = parseInt(numeroInput.value);

    // Validazione dell'input
    if (isNaN(numero) || numero < 1) {
      showError("Inserisci un numero intero positivo valido.");
      return;
    }

    // Calcola la sequenza di Collatz
    const sequenza = calcolaSequenzaCollatz(numero);

    // Mostra i risultati
    mostraRisultati(numero, sequenza);
  }

  function calcolaSequenzaCollatz(numero) {
    let n = numero;
    const sequenza = [n];

    while (n !== 1) {
      if (n % 2 === 0) {
        // Se n è pari
        n = n / 2;
      } else {
        // Se n è dispari
        n = 3 * n + 1;
      }

      sequenza.push(n);

      // Protezione contro loop infiniti
      if (sequenza.length > 10000) {
        console.warn("Troppe iterazioni, interrotto.");
        break;
      }
    }

    return sequenza;
  }

  function mostraRisultati(numeroIniziale, sequenza) {
    // Mostra la sezione risultati se nascosta
    if (resultsSection.classList.contains("hidden")) {
      resultsSection.classList.remove("hidden");
      setTimeout(() => {
        resultsSection.style.display = "block";
      }, 10);
    }

    // Calcola statistiche
    const passi = sequenza.length - 1;
    const valoreMassimo = Math.max(...sequenza);
    const valoreFinale = sequenza[sequenza.length - 1];

    // Aggiorna le statistiche
    initialNumberEl.textContent = numeroIniziale;
    stepsCountEl.textContent = passi;
    maxValueEl.textContent = valoreMassimo.toLocaleString("it-IT");
    finalValueEl.textContent = valoreFinale;

    // Aggiorna la sequenza
    mostraSequenza(sequenza);

    // Aggiorna il grafico
    creaGrafico(sequenza);

    // Animazione per evidenziare i risultati
    const statItems = document.querySelectorAll(".stat-item");
    statItems.forEach((item) => {
      item.classList.add("pulse");
      setTimeout(() => {
        item.classList.remove("pulse");
      }, 1000);
    });
  }

  function mostraSequenza(sequenza) {
    sequenceContainer.innerHTML = "";

    sequenza.forEach((valore, indice) => {
      const item = document.createElement("div");
      item.className = "sequence-item";

      const step = document.createElement("span");
      step.className = "sequence-step";
      step.textContent = `Passo ${indice}:`;

      const value = document.createElement("span");
      value.className = "sequence-value";
      value.textContent = valore.toLocaleString("it-IT");

      item.appendChild(step);
      item.appendChild(value);
      sequenceContainer.appendChild(item);
    });

    // Scorri alla fine della sequenza
    setTimeout(() => {
      sequenceContainer.scrollTop = sequenceContainer.scrollHeight;
    }, 100);
  }

  function creaGrafico(sequenza) {
    const ctx = document.getElementById("collatz-chart").getContext("2d");

    // Distruggi il grafico esistente se presente
    if (collatzChart) {
      collatzChart.destroy();
    }

    // Crea le etichette per l'asse x (passi)
    const labels = Array.from({ length: sequenza.length }, (_, i) => i);

    // Crea il nuovo grafico
    collatzChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Sequenza di Collatz",
            data: sequenza,
            borderColor: "#4361ee",
            backgroundColor: "rgba(67, 97, 238, 0.1)",
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: "#4361ee",
            fill: true,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: "Valore",
            },
            ticks: {
              callback: function (value) {
                return value.toLocaleString("it-IT");
              },
            },
          },
          x: {
            title: {
              display: true,
              text: "Passo",
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `Valore: ${context.parsed.y.toLocaleString("it-IT")}`;
              },
            },
          },
        },
      },
    });
  }

  function showError(message) {
    // Implementazione di un messaggio di errore
    alert(message);
  }
});

document.getElementById("footer").innerHTML = `
  <p class="copyright">© ${new Date().getFullYear()} Calcolatore Congettura di Collatz</p>
`;
