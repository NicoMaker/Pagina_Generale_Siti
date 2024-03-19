let myChart;

function lanciaMonete() {
  const numCoins = parseInt(document.getElementById("numCoins").value),
    risultatoElement = document.getElementById("risultato"),
    vincitoreElement = document.getElementById("vincitore");
  let testaCount = 0,
    croceCount = 0;

  if (isNaN(numCoins) || numCoins < 1) {
    risultatoElement.innerHTML = "Inserisci un numero valido";
    document.getElementById("myChart").style.display = "none";
    vincitoreElement.innerHTML = "";
    if (myChart) myChart.destroy();
    return;
  }

  for (let i = 0; i < numCoins; i++)
    Math.random() < 0.5 ? testaCount++ : croceCount++;

  risultatoElement.innerHTML = `Numero di teste: ${testaCount}<br>${(
    (testaCount / numCoins) *
    100
  ).toFixed(2)} %<br><br>
  
    Numero di croci: ${croceCount}<br>${((croceCount / numCoins) * 100).toFixed(
    2
  )} %<br><br>`;

  document.getElementById("myChart").style.display = "block";

  if (myChart) myChart.destroy();

  const ctx = document.getElementById("myChart").getContext("2d");
  myChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Teste", "Croci"],
      datasets: [
        { data: [testaCount, croceCount], backgroundColor: ["blue", "red"] },
      ],
    },
  });

  vincitoreElement.innerHTML =
    testaCount > croceCount
      ? "Hanno vinto le teste!"
      : croceCount > testaCount
      ? "Ha vinto la croce!"
      : "Pareggio!";
}
