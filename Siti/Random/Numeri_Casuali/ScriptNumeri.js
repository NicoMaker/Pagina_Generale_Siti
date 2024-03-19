function generaNumeroCasuale() {
    var min = parseInt(document.getElementById("min").value);
    var max = parseInt(document.getElementById("max").value);

    // Verifica se il numero massimo è minore del minore
    if (max < min) {
      var temp = max;
      max = min;
      min = temp;
    }

    var numeroCasuale = Math.floor(Math.random() * (max - min + 1)) + min;
    document.getElementById("risultato").textContent = "Numero casuale generato: " + numeroCasuale;
  }