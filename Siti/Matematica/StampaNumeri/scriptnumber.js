function generaTabella() {
  const numeroInput = document.getElementById("numero"),
    scelta = document.getElementById("scelta").value,
    risultato = document.getElementById("risultato");

  const numero = parseInt(numeroInput.value);
  if (isNaN(numero) || numero < 0) {
    risultato.innerHTML = "Inserisci un numero valido.";
    return;
  }

  let numeri = [];
  if (scelta === "tutti") {
    numeri = Array.from({ length: numero }, (_, i) => i + 1);
  } else if (scelta === "pari") {
    numeri = Array.from({ length: numero }, (_, i) => i + 1).filter(
      (num) => num % 2 === 0
    );
  } else if (scelta === "dispari") {
    numeri = Array.from({ length: numero }, (_, i) => i + 1).filter(
      (num) => num % 2 !== 0
    );
  }

  let tabella = "<table>";
  for (let i = 0; i < numeri.length; i++) {
    if (i % 10 === 0) {
      tabella += "<tr>";
    }
    tabella += "<td>" + numeri[i] + "</td>";
    if (i % 10 === 4 || i === numeri.length - 1) {
      tabella += "</tr>";
    }
  }
  tabella += "</table>";

  risultato.innerHTML = tabella;
}
