function generaNumeri() {
  let numeroDadi = parseInt(document.getElementById("numero-dadi").value),
    n = parseInt(document.getElementById("facce-dadi").value),
    conteggioOccorrenze = Array(n).fill(0),
    numeriParziali = [],
    sommaTotale = 0;

  // Verifica se il numeroDadi è stato inserito e se è maggiore di zero
  if (isNaN(numeroDadi) || numeroDadi <= 0) {
    document.getElementById("numeri-parziali").textContent =
      "Numero non valido";
    document.getElementById("somma-totale").textContent = "";
    document.getElementById("valori_uscite").style.display = "none";

    // Nascondi il grafico
    if (window.myChart) {
      window.myChart.destroy();
      window.myChart = null;
    }

    // Mostra l'immagine dei dadi
    document.getElementById("immagine-dadi").style.display = "block";
  } else {
    // Nascondi l'immagine dei dadi se il numeroDadi è valido
    document.getElementById("immagine-dadi").style.display = "none";

    // Calcola numeri parziali e somma totale solo se il numeroDadi è valido
    for (let i = 0; i < numeroDadi; i++) {
      let numeroCasuale = Math.floor(Math.random() * n) + 1;
      numeriParziali.push(numeroCasuale);
      sommaTotale += numeroCasuale;
      conteggioOccorrenze[numeroCasuale - 1]++;
    }

    // Creazione del grafico a barre
    let ctx = document.getElementById("grafico").getContext("2d");

    // Verifica se il numeroDadi è maggiore di zero e se è stato inserito un valore valido
    if (numeroDadi > 0 && !isNaN(numeroDadi)) {
      if (window.myChart) {
        // Se il grafico è già stato creato, aggiorna i dati
        window.myChart.data.labels = Array.from({ length: n }, (_, i) => i + 1);
        window.myChart.data.datasets[0].data = conteggioOccorrenze;
        window.myChart.update();
      } else {
        // Altrimenti, crea il grafico per la prima volta
        window.myChart = new Chart(ctx, {
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

      let stampapercentuali = `<table>
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
              ${parseFloat((conteggioOccorrenze[i] / numeroDadi) * 100).toFixed(
                2
              )} %
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

    document.getElementById("numeri-parziali").textContent =
      "Numeri parziali: " + numeriParziali.join(", ");

    document.getElementById("somma-totale").textContent =
      "Somma totale: " + sommaTotale;
  }
}
