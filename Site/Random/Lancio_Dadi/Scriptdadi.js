let conteggioOccorrenze = [0, 0, 0, 0, 0, 0],
  graficoBarre;

function init() {
  hideGrafico();
  showImmagine();
}

function generaNumeri() {
  let numeroDadi = parseInt(document.getElementById("numero-dadi").value);

  if (isNaN(numeroDadi) || numeroDadi <= 0) {
    mostraMessaggioErrore("Numero non valido");
    return;
  }

  resetConteggioOccorrenze();
  let numeriParziali = [],
    sommaTotale = 0;

  for (let i = 0; i < numeroDadi; i++) {
    let numeroCasuale = generaNumeroCasuale();
    numeriParziali.push(numeroCasuale);
    sommaTotale += numeroCasuale;
    conteggioOccorrenze[numeroCasuale - 1]++;
  }

  mostraRisultati(numeriParziali, sommaTotale);
  aggiornaGraficoBarre();
  aggiornaTabellaPercentuali(numeroDadi);
}

const resetConteggioOccorrenze = () =>
    (conteggioOccorrenze = [0, 0, 0, 0, 0, 0]),
  generaNumeroCasuale = () => Math.floor(Math.random() * 6) + 1;

function mostraMessaggioErrore(messaggio) {
  document.getElementById("numeri-parziali").textContent = messaggio;
  document.getElementById("somma-totale").textContent = "";
  showImmagine();
  hideGrafico();
  document.getElementById("valori_uscite").style.display = "none";
}

function mostraRisultati(numeriParziali, sommaTotale) {
  document.getElementById("numeri-parziali").textContent =
    "Numeri parziali: " + numeriParziali.join(", ");
  document.getElementById("somma-totale").textContent =
    "Somma totale: " + sommaTotale;
}

function aggiornaGraficoBarre() {
  hideImmagine();
  showGrafico();

  if (graficoBarre) graficoBarre.destroy();

  let ctx = document.getElementById("grafico-barre").getContext("2d");
  graficoBarre = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["1", "2", "3", "4", "5", "6"],
      datasets: [
        {
          label: "Volte",
          data: conteggioOccorrenze,
          backgroundColor: [
            "red",
            "orange",
            "yellow",
            "green",
            "blue",
            "purple",
          ],
          borderColor: ["black", "black", "black", "black", "black", "black"],
          borderWidth: 1,
        },
      ],
    },
  });
}

function aggiornaTabellaPercentuali(numeroDadi) {
  if (numeroDadi > 0) {
    let tabellaPercentuali = creaTabellaPercentuali(numeroDadi);
    document.getElementById("valori_uscite").innerHTML = tabellaPercentuali;
    document.getElementById("valori_uscite").style.display = "block";
  } else {
    document.getElementById("valori_uscite").style.display = "none";
  }
}

function creaTabellaPercentuali(numeroDadi) {
  let tabella = `<table>
    <tr>
        <td>Numero</td>
        <td>Uscita Numero</td>
        <td>Percentuale uscita numero</td>
    </tr>`;

  for (let i = 0; i < conteggioOccorrenze.length; i++) {
    tabella += `
    <tr>
      <td>${i + 1}</td>
      <td>${conteggioOccorrenze[i]}</td>
      <td>${((conteggioOccorrenze[i] / numeroDadi) * 100).toFixed(2)} %</td>
    </tr>`;
  }

  tabella += `</table>`;
  return tabella;
}

const showImmagine = () =>
    (document.getElementById("immagine-dadi").style.display = "block"),
  hideImmagine = () =>
    (document.getElementById("immagine-dadi").style.display = "none"),
  showGrafico = () =>
    (document.getElementById("grafico-barre").style.display = "block"),
  hideGrafico = () =>
    (document.getElementById("grafico-barre").style.display = "none");

init();

document
  .getElementById("generateButton")
  .addEventListener("click", function () {
    const randomGenerator = setInterval(generaNumeri, 150);

    setTimeout(() => {
      clearInterval(randomGenerator);
      generaNumeri();
    }, 500);
  });
