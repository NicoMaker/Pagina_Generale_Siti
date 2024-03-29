function generaNumeroCasuale() {
  let min = parseInt(document.getElementById("min").value),
    max = parseInt(document.getElementById("max").value);

  if (max < min) {
    let temp = max;
    max = min;
    min = temp;
  }

  let numeroCasuale = Math.floor(Math.random() * (max - min + 1)) + min;
  document.getElementById("risultato").textContent =
    `Numero casuale generato: ${numeroCasuale}`;
}

document
  .getElementById("generateButton")
  .addEventListener("click", function () {
    const randomGenerator = setInterval(generaNumeroCasuale, 150);

    setTimeout(() => {
      clearInterval(randomGenerator);
      generaNumeroCasuale();
    }, 500);
  });