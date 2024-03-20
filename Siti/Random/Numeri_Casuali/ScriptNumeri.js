function generaNumeroCasuale() {
  let min = parseInt(document.getElementById("min").value),
    max = parseInt(document.getElementById("max").value);

  // Verifica se il numero massimo è minore del minore
  if (max < min) {
    let temp = max;
    max = min;
    min = temp;
  }

  let numeroCasuale = Math.floor(Math.random() * (max - min + 1)) + min;
  document.getElementById("risultato").textContent =
    "Numero casuale generato: " + numeroCasuale;
}
