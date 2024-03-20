function calcolaLogaritmo() {
  let numero = parseFloat(document.getElementById("number").value),
    base = parseFloat(document.getElementById("base").value),
    risultato = Math.log(numero) / Math.log(base);

  document.getElementById(
    "result"
  ).innerHTML = `Il logaritmo di ${numero} in base ${base} è: ${risultato}`;
}
