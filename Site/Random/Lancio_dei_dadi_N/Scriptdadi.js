let myChart;

function displayErrorMessage(message) {
  document.getElementById("numeri-parziali").textContent = message;
  document.getElementById("somma-totale").textContent = "";
  document.getElementById("valori_uscite").style.display = "none";
  if (myChart) {
    myChart.destroy();
    myChart = null;
  }
  document.getElementById("immagine-dadi").style.display = "block";
}

const hideDiceImage = () =>
  (document.getElementById("immagine-dadi").style.display = "none");

function updateResults(numeriParziali, sommaTotale) {
  document.getElementById(
    "numeri-parziali"
  ).textContent = `Numeri parziali: ${numeriParziali.join(", ")}`;
  document.getElementById(
    "somma-totale"
  ).textContent = `Somma totale: ${sommaTotale}`;
}

function updateChart(conteggioOccorrenze, n) {
  let ctx = document.getElementById("grafico").getContext("2d");
  if (myChart) {
    myChart.data.labels = Array.from({ length: n }, (_, i) => i + 1);
    myChart.data.datasets[0].data = conteggioOccorrenze;
    myChart.update();
  } else {
    myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Array.from({ length: n }, (_, i) => i + 1),
        datasets: [
          {
            label: "volte",
            data: conteggioOccorrenze,
            backgroundColor: "red",
            borderColor: "black",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}

function generateOccurrenceTable(conteggioOccorrenze, numeroDadi) {
  let stampapercentuali = `<table>
    <tr>
      <td>Numero</td>
      <td>Uscita Numero</td>
      <td>Percentuale uscita numero</td>
    </tr>`;

  for (let i = 0; i < conteggioOccorrenze.length; i++) {
    stampapercentuali += `
      <tr>
        <td>${i + 1}</td>
        <td>${conteggioOccorrenze[i]}</td>
        <td>${((conteggioOccorrenze[i] / numeroDadi) * 100).toFixed(2)} %</td>
      </tr>`;
  }

  stampapercentuali += `</table>`;
  document.getElementById("valori_uscite").innerHTML = stampapercentuali;
  document.getElementById("valori_uscite").style.display = "block";
}

function generaNumeri() {
  const numeroDadi = parseInt(document.getElementById("numero-dadi").value),
    n = parseInt(document.getElementById("facce-dadi").value),
    numeroDadiNonValido = isNaN(numeroDadi) || numeroDadi <= 0,
    numeroFacceNonValido = isNaN(n) || n < 1;

  if (numeroDadiNonValido && numeroFacceNonValido) {
    displayErrorMessage("Numero di dadi e numero di facce non validi");
    return;
  }

  if (numeroDadiNonValido) {
    displayErrorMessage("Numero di dadi non valido");
    return;
  }

  if (numeroFacceNonValido) {
    displayErrorMessage("Numero di facce non valido");
    return;
  }

  hideDiceImage();

  let conteggioOccorrenze = Array(n).fill(0),
    numeriParziali = [],
    sommaTotale = 0;

  for (let i = 0; i < numeroDadi; i++) {
    const numeroCasuale = Math.floor(Math.random() * n) + 1;
    numeriParziali.push(numeroCasuale);
    sommaTotale += numeroCasuale;
    conteggioOccorrenze[numeroCasuale - 1]++;
  }

  updateResults(numeriParziali, sommaTotale);
  updateChart(conteggioOccorrenze, n);
  generateOccurrenceTable(conteggioOccorrenze, numeroDadi);
}

function startGeneratingNumbers() {
  const randomGenerator = setInterval(generaNumeri, 150);

  setTimeout(() => {
    clearInterval(randomGenerator);
    generaNumeri();
  }, 500);
}

document
  .getElementById("generateButton")
  .addEventListener("click", startGeneratingNumbers);
