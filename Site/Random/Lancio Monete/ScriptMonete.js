let myChart;

function displayErrorMessage(message) {
  document.getElementById("risultato").innerHTML = message;
  document.getElementById("myChart").style.display = "none";
  document.getElementById("vincitore").innerHTML = "";
  if (myChart) myChart.destroy();
}

function updateResults(testaCount, croceCount, numCoins) {
  document.getElementById("risultato").innerHTML = `
    Numero di teste: ${testaCount}<br>${((testaCount / numCoins) * 100).toFixed(
    2
  )} %<br><br>
    Numero di croci: ${croceCount}<br>${((croceCount / numCoins) * 100).toFixed(
    2
  )} %<br><br>
  `;
  document.getElementById("myChart").style.display = "block";
}

function displayWinner(testaCount, croceCount) {
  const vincitoreElement = document.getElementById("vincitore");
  vincitoreElement.innerHTML =
    testaCount > croceCount
      ? "Hanno vinto le teste!"
      : croceCount > testaCount
      ? "Ha vinto la croce!"
      : "Pareggio!";
}

function updateChart(testaCount, croceCount) {
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
}

function lanciaMonete() {
  const numCoins = parseInt(document.getElementById("numCoins").value);

  if (isNaN(numCoins) || numCoins < 1) {
    displayErrorMessage("Inserisci un numero valido");
    return;
  }

  let testaCount = 0,
    croceCount = 0;

  for (let i = 0; i < numCoins; i++)
    Math.random() < 0.5 ? testaCount++ : croceCount++;

  updateResults(testaCount, croceCount, numCoins);
  updateChart(testaCount, croceCount);
  displayWinner(testaCount, croceCount);
}

function startCoinTossing() {
  const randomGenerator = setInterval(lanciaMonete, 150);

  setTimeout(() => {
    clearInterval(randomGenerator);
    lanciaMonete();
  }, 500);
}

document
  .getElementById("generateButton")
  .addEventListener("click", startCoinTossing);
