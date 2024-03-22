let conteggioOccorrenze = [0, 0, 0, 0, 0, 0],
  graficoBarre;

function init() {
  hideGrafico();
  showImmagine();
}

function generaNumeri() {
  let numeroDadi = parseInt(document.getElementById("numero-dadi").value);

  if (isNaN(numeroDadi) || numeroDadi <= 0) {
    document.getElementById("numeri-parziali").textContent =
      "Numero non valido";
    document.getElementById("somma-totale").textContent = "";
    showImmagine();
    hideGrafico();
    document.getElementById("valori_uscite").style.display = "none";
    return;
  }

  conteggioOccorrenze = [0, 0, 0, 0, 0, 0];
  let numeriParziali = [],
    sommaTotale = 0;

  for (let i = 0; i < numeroDadi; i++) {
    let numeroCasuale = Math.floor(Math.random() * 6) + 1;
    numeriParziali.push(numeroCasuale);
    sommaTotale += numeroCasuale;
    conteggioOccorrenze[numeroCasuale - 1]++;
  }

  document.getElementById("numeri-parziali").textContent =
    "Numeri parziali: " + numeriParziali.join(", ");
  document.getElementById("somma-totale").textContent =
    "Somma totale: " + sommaTotale;
  updateGraficoBarre();

  if (numeroDadi > 0) {
    stampapercentuali = `<table>
    <tr>
        <td>
            Numero
        </td>

        <td>
            Uscita Numero
        </td>

        <td>
          Percentuale uscita numero
        </td>
    </tr>
  `;
    for (let i = 0; i < conteggioOccorrenze.length; i++) {
      stampapercentuali += `
    
    <tr>
      <td>
          ${i + 1}
      </td>

      <td>
          ${conteggioOccorrenze[i]}
      </td>

      <td>
        ${parseFloat((conteggioOccorrenze[i] / numeroDadi) * 100).toFixed(2)} %
      </td>

    </tr>`;
    }

    stampapercentuali += `</table>`;

    // Mostra la tabella valori_uscite solo se numeroDadi è maggiore di 0
    document.getElementById("valori_uscite").innerHTML = stampapercentuali;
    document.getElementById("valori_uscite").style.display = "block";
  } else {
    // Nascondi la tabella valori_uscite se numeroDadi non è maggiore di 0
    document.getElementById("valori_uscite").style.display = "none";
  }
}

function updateGraficoBarre() {
  hideImmagine();
  showGrafico();

  if (graficoBarre) {
    graficoBarre.destroy();
  }

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
