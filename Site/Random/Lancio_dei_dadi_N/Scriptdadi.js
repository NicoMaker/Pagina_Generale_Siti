// Variabili globali
let myChart;
let isRolling = false;
let diceHistory = [];
const MAX_HISTORY = 10;

// Inizializzazione dell'applicazione
document.addEventListener("DOMContentLoaded", () => {
  // Aggiungi event listeners per i pulsanti di incremento/decremento
  document.getElementById("increment-dadi").addEventListener("click", () => {
    incrementValue("numero-dadi", 10); // Limite massimo di 10 dadi
  });

  document.getElementById("decrement-dadi").addEventListener("click", () => {
    decrementValue("numero-dadi", 1); // Minimo 1 dado
  });

  document.getElementById("increment-facce").addEventListener("click", () => {
    incrementValue("facce-dadi", 20); // Limite massimo di 20 facce
  });

  document.getElementById("decrement-facce").addEventListener("click", () => {
    decrementValue("facce-dadi", 1); // Minimo 1 faccia
  });

  // Aggiungi event listener per il pulsante di generazione
  document
    .getElementById("generateButton")
    .addEventListener("click", startRollingAnimation);

  // Aggiungi event listeners per i tab
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab");

      // Rimuovi la classe active da tutti i tab e contenuti
      document
        .querySelectorAll(".tab-button")
        .forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));

      // Aggiungi la classe active al tab cliccato e al contenuto corrispondente
      button.classList.add("active");
      document.getElementById(`${tabId}-tab`).classList.add("active");
    });
  });
});

// Funzione per incrementare il valore di un input
function incrementValue(inputId, maxValue) {
  const input = document.getElementById(inputId);
  const currentValue = parseInt(input.value);

  if (!isNaN(currentValue) && currentValue < maxValue) {
    input.value = currentValue + 1;
    // Effetto visivo di feedback
    input.classList.add("highlight");
    setTimeout(() => input.classList.remove("highlight"), 300);
  }
}

// Funzione per decrementare il valore di un input
function decrementValue(inputId, minValue) {
  const input = document.getElementById(inputId);
  const currentValue = parseInt(input.value);

  if (!isNaN(currentValue) && currentValue > minValue) {
    input.value = currentValue - 1;
    // Effetto visivo di feedback
    input.classList.add("highlight");
    setTimeout(() => input.classList.remove("highlight"), 300);
  }
}

// Funzione per mostrare un messaggio di errore
function displayErrorMessage(message) {
  const numeriParzialiElement = document.getElementById("numeri-parziali");
  const sommaTotaleElement = document.getElementById("somma-totale");

  // Animazione di shake per indicare errore
  numeriParzialiElement.classList.add("shake");
  setTimeout(() => numeriParzialiElement.classList.remove("shake"), 500);

  numeriParzialiElement.textContent = message;
  numeriParzialiElement.style.color = "#ef4444"; // Colore rosso per errori

  sommaTotaleElement.textContent = "";
  document.getElementById("valori_uscite").style.display = "none";

  if (myChart) {
    myChart.destroy();
    myChart = null;
  }

  document.getElementById("immagine-dadi").style.display = "block";
  document.getElementById("dice-container").innerHTML = "";

  // Ripristina il colore del testo dopo un po'
  setTimeout(() => {
    numeriParzialiElement.style.color = ""; // Ripristina il colore predefinito
  }, 2000);
}

// Funzione per nascondere l'immagine dei dadi
const hideDiceImage = () => {
  const img = document.getElementById("immagine-dadi");
  // Animazione di fade out
  img.style.opacity = "0";
  setTimeout(() => {
    img.style.display = "none";
    img.style.opacity = "1"; // Ripristina l'opacità per la prossima volta
  }, 300);
};

// Funzione per aggiornare i risultati
function updateResults(numeriParziali, sommaTotale) {
  const numeriParzialiElement = document.getElementById("numeri-parziali");
  const sommaTotaleElement = document.getElementById("somma-totale");

  // Animazione di fade in per i risultati
  numeriParzialiElement.style.opacity = "0";
  sommaTotaleElement.style.opacity = "0";

  setTimeout(() => {
    numeriParzialiElement.textContent = `Numeri parziali: ${numeriParziali.join(
      ", ",
    )}`;
    sommaTotaleElement.textContent = `Somma totale: ${sommaTotale}`;

    numeriParzialiElement.style.opacity = "1";
    sommaTotaleElement.style.opacity = "1";
  }, 300);
}

// Funzione per creare un dado visivo
function createDice(value, faceCount) {
  const dice = document.createElement("div");
  dice.className = "dice";

  // Aggiungi classe speciale per dadi con forme diverse
  if (faceCount === 20) {
    dice.classList.add("dice-d20");
  } else if (faceCount === 4) {
    dice.classList.add("dice-d4");
  } else if (faceCount === 8) {
    dice.classList.add("dice-d8");
  } else if (faceCount === 10) {
    dice.classList.add("dice-d10");
  } else if (faceCount === 12) {
    dice.classList.add("dice-d12");
  }

  // Aggiungi il valore del dado
  dice.textContent = value;

  // Se è un dado a 6 facce, aggiungi i punti
  if (faceCount === 6) {
    dice.textContent = "";
    const dotsContainer = document.createElement("div");
    dotsContainer.className = "dice-dots";

    // Configurazione dei punti in base al valore
    switch (value) {
      case 1:
        dotsContainer.innerHTML = '<div class="dice-dot center"></div>';
        break;
      case 2:
        dotsContainer.innerHTML =
          '<div class="dice-dot top-left"></div><div class="dice-dot bottom-right"></div>';
        break;
      case 3:
        dotsContainer.innerHTML =
          '<div class="dice-dot top-left"></div><div class="dice-dot center"></div><div class="dice-dot bottom-right"></div>';
        break;
      case 4:
        dotsContainer.innerHTML =
          '<div class="dice-dot top-left"></div><div class="dice-dot top-right"></div><div class="dice-dot bottom-left"></div><div class="dice-dot bottom-right"></div>';
        break;
      case 5:
        dotsContainer.innerHTML =
          '<div class="dice-dot top-left"></div><div class="dice-dot top-right"></div><div class="dice-dot center"></div><div class="dice-dot bottom-left"></div><div class="dice-dot bottom-right"></div>';
        break;
      case 6:
        dotsContainer.innerHTML =
          '<div class="dice-dot top-left"></div><div class="dice-dot top-right"></div><div class="dice-dot middle-left"></div><div class="dice-dot middle-right"></div><div class="dice-dot bottom-left"></div><div class="dice-dot bottom-right"></div>';
        break;
    }

    dice.appendChild(dotsContainer);
  }

  return dice;
}

// Funzione per aggiornare il grafico
function updateChart(conteggioOccorrenze, n) {
  const ctx = document.getElementById("grafico").getContext("2d");

  // Colori per il grafico
  const backgroundColors = [
    "rgba(98, 0, 234, 0.7)", // Viola primario
    "rgba(157, 70, 255, 0.7)", // Viola chiaro
    "rgba(10, 0, 182, 0.7)", // Viola scuro
    "rgba(0, 188, 212, 0.7)", // Ciano
    "rgba(98, 239, 255, 0.7)", // Ciano chiaro
    "rgba(0, 139, 163, 0.7)", // Ciano scuro
  ];

  const borderColors = [
    "rgba(98, 0, 234, 1)",
    "rgba(157, 70, 255, 1)",
    "rgba(10, 0, 182, 1)",
    "rgba(0, 188, 212, 1)",
    "rgba(98, 239, 255, 1)",
    "rgba(0, 139, 163, 1)",
  ];

  // Estendi i colori se ci sono più facce dei colori predefiniti
  const extendedBackgroundColors = [];
  const extendedBorderColors = [];

  for (let i = 0; i < n; i++) {
    extendedBackgroundColors.push(
      backgroundColors[i % backgroundColors.length],
    );
    extendedBorderColors.push(borderColors[i % borderColors.length]);
  }

  if (myChart) {
    // Aggiorna il grafico esistente con animazione
    myChart.data.labels = Array.from({ length: n }, (_, i) => i + 1);
    myChart.data.datasets[0].data = conteggioOccorrenze;
    myChart.data.datasets[0].backgroundColor = extendedBackgroundColors;
    myChart.data.datasets[0].borderColor = extendedBorderColors;
    myChart.update({
      duration: 800,
      easing: "easeOutQuart",
    });
  } else {
    // Crea un nuovo grafico
    myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Array.from({ length: n }, (_, i) => i + 1),
        datasets: [
          {
            label: "Occorrenze",
            data: conteggioOccorrenze,
            backgroundColor: extendedBackgroundColors,
            borderColor: extendedBorderColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: "easeOutQuart",
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `Occorrenze: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }
}

// Funzione per generare la tabella delle occorrenze
function generateOccurrenceTable(conteggioOccorrenze, numeroDadi) {
  let stampapercentuali = `<table>
    <tr>
      <td>Numero</td>
      <td>Occorrenze</td>
      <td>Percentuale</td>
    </tr>`;

  for (let i = 0; i < conteggioOccorrenze.length; i++) {
    const occorrenza = conteggioOccorrenze[i];
    const percentuale = ((occorrenza / numeroDadi) * 100).toFixed(2);

    // Aggiungi classe per evidenziare il valore massimo
    const isMax =
      Math.max(...conteggioOccorrenze) === occorrenza && occorrenza > 0;
    const rowClass = isMax ? 'class="highlight-row"' : "";

    stampapercentuali += `
      <tr ${rowClass}>
        <td>${i + 1}</td>
        <td>${occorrenza}</td>
        <td>${percentuale}%</td>
      </tr>`;
  }

  stampapercentuali += `</table>`;

  const valoriUsciteElement = document.getElementById("valori_uscite");
  valoriUsciteElement.innerHTML = stampapercentuali;
  valoriUsciteElement.style.display = "block";

  // Animazione di fade in per la tabella
  valoriUsciteElement.style.opacity = "0";
  setTimeout(() => {
    valoriUsciteElement.style.opacity = "1";
  }, 300);
}

// Funzione per aggiungere un lancio alla cronologia
function addToHistory(results, total) {
  diceHistory.unshift({
    results: [...results],
    total: total,
    timestamp: new Date(),
  });

  // Limita la dimensione della cronologia
  if (diceHistory.length > MAX_HISTORY) {
    diceHistory.pop();
  }
}

// Funzione per avviare l'animazione di lancio
function startRollingAnimation() {
  if (isRolling) return;
  isRolling = true;

  // Ottieni i valori di input
  const numeroDadi = parseInt(document.getElementById("numero-dadi").value);
  const n = parseInt(document.getElementById("facce-dadi").value);

  // Validazione degli input
  const numeroDadiNonValido = isNaN(numeroDadi) || numeroDadi <= 0;
  const numeroFacceNonValido = isNaN(n) || n < 1;

  if (numeroDadiNonValido && numeroFacceNonValido) {
    displayErrorMessage("Numero di dadi e numero di facce non validi");
    isRolling = false;
    return;
  }

  if (numeroDadiNonValido) {
    displayErrorMessage("Numero di dadi non valido");
    isRolling = false;
    return;
  }

  if (numeroFacceNonValido) {
    displayErrorMessage("Numero di facce non valido");
    isRolling = false;
    return;
  }

  // Nascondi l'immagine dei dadi
  hideDiceImage();

  // Disabilita il pulsante durante l'animazione
  const rollButton = document.getElementById("generateButton");
  rollButton.disabled = true;
  rollButton.classList.add("disabled");

  // Prepara il container dei dadi
  const diceContainer = document.getElementById("dice-container");
  diceContainer.innerHTML = "";

  // Crea dadi temporanei per l'animazione
  for (let i = 0; i < numeroDadi; i++) {
    const tempDice = createDice(Math.floor(Math.random() * n) + 1, n);
    tempDice.classList.add("rolling");
    diceContainer.appendChild(tempDice);
  }

  // Genera i risultati finali (determinati all'inizio ma rivelati alla fine)
  const finalResults = [];
  for (let i = 0; i < numeroDadi; i++) {
    finalResults.push(Math.floor(Math.random() * n) + 1);
  }

  // Sequenza di animazione
  let rollCount = 0;
  const maxRolls = 10;
  const rollInterval = setInterval(() => {
    rollCount++;

    // Aggiorna i dadi con valori casuali durante l'animazione
    const diceElements = diceContainer.querySelectorAll(".dice");
    diceElements.forEach((dice) => {
      const randomValue = Math.floor(Math.random() * n) + 1;

      // Rimuovi il contenuto precedente
      dice.textContent = "";
      dice.innerHTML = "";

      // Se è un dado a 6 facce, aggiungi i punti
      if (n === 6) {
        const dotsContainer = document.createElement("div");
        dotsContainer.className = "dice-dots";

        // Aggiungi i punti in base al valore
        for (let i = 0; i < randomValue; i++) {
          const dot = document.createElement("div");
          dot.className = "dice-dot";
          dotsContainer.appendChild(dot);
        }

        dice.appendChild(dotsContainer);
      } else {
        dice.textContent = randomValue;
      }
    });

    // Ferma l'animazione dopo un certo numero di aggiornamenti
    if (rollCount >= maxRolls) {
      clearInterval(rollInterval);

      // Rimuovi la classe rolling
      diceElements.forEach((dice) => {
        dice.classList.remove("rolling");
      });

      // Mostra i risultati finali
      setTimeout(() => {
        // Rimuovi i dadi temporanei
        diceContainer.innerHTML = "";

        // Aggiungi i dadi con i valori finali
        for (let i = 0; i < numeroDadi; i++) {
          const dice = createDice(finalResults[i], n);
          diceContainer.appendChild(dice);

          // Animazione di pop-in per ogni dado
          dice.style.transform = "scale(0)";
          setTimeout(() => {
            dice.style.transform = "scale(1)";
          }, i * 100);
        }

        // Calcola il totale
        const sommaTotale = finalResults.reduce((sum, val) => sum + val, 0);

        // Aggiorna i risultati
        updateResults(finalResults, sommaTotale);

        // Aggiorna le statistiche
        const conteggioOccorrenze = Array(n).fill(0);
        finalResults.forEach((val) => conteggioOccorrenze[val - 1]++);

        updateChart(conteggioOccorrenze, n);
        generateOccurrenceTable(conteggioOccorrenze, numeroDadi);

        // Aggiungi alla cronologia
        addToHistory(finalResults, sommaTotale);

        // Riabilita il pulsante
        rollButton.disabled = false;
        rollButton.classList.remove("disabled");
        isRolling = false;
      }, 500);
    }
  }, 100);
}

// Aggiungi stili CSS dinamici per posizionare i punti dei dadi
(function addDiceDotsStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .dice-dots {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
      align-items: center;
    }
    
    .dice-dot {
      width: 12px;
      height: 12px;
      background-color: var(--primary);
      border-radius: 50%;
      position: absolute;
    }
    
    .dice-dot.center {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    
    .dice-dot.top-left {
      top: 20%;
      left: 20%;
    }
    
    .dice-dot.top-right {
      top: 20%;
      right: 20%;
    }
    
    .dice-dot.middle-left {
      top: 50%;
      left: 20%;
      transform: translateY(-50%);
    }
    
    .dice-dot.middle-right {
      top: 50%;
      right: 20%;
      transform: translateY(-50%);
    }
    
    .dice-dot.bottom-left {
      bottom: 20%;
      left: 20%;
    }
    
    .dice-dot.bottom-right {
      bottom: 20%;
      right: 20%;
    }
    
    .highlight {
      transition: background-color 0.3s ease;
      background-color: rgba(98, 0, 234, 0.1);
    }
    
    .shake {
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
      40%, 60% { transform: translate3d(4px, 0, 0); }
    }
    
    .disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .highlight-row {
      background-color: rgba(98, 0, 234, 0.1) !important;
      font-weight: bold;
    }
    
    /* Forme speciali per dadi */
    .dice-d4 {
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    }
    
    .dice-d8 {
      clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    }
    
    .dice-d10 {
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    }
    
    .dice-d12 {
      clip-path: polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%);
    }
    
    .dice-d20 {
      clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
    }
  `;
  document.head.appendChild(style);
})();
