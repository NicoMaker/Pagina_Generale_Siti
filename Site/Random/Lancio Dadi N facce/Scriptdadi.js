function generaNumeri(facceDado) {
  let numeroDadi = parseInt(document.getElementById("numero-dadi").value),
    sommaTotale = 0,
    somma = "";

  for (let i = 0; i < numeroDadi; i++) {
    let numeroCasuale = Math.floor(Math.random() * facceDado) + 1;
    (sommaTotale += numeroCasuale),
      (figura = getFigura(facceDado)),
      (risultato =
        '<div class="' +
        figura +
        '"><div class="figure-container">' +
        '<span class="number">' +
        numeroCasuale +
        "</span>" +
        "</div></div>");
    somma += "<p>" + risultato + "</p>";
  }

  document.getElementById("risultato").innerHTML = somma;
  document.getElementById("somma-totale").innerHTML = sommaTotale;
}

function getFigura(facceDado) {
  switch (facceDado) {
    case 4:
      return "triangolo";
    case 6:
      return "quadrato";
    case 8:
      return "triangolo";
    case 10:
      return "rombo";
    case 12:
      return "pentagono";
    case 20:
      return "esagono";
    default:
      return "cerchio";
  }
}

function generaNumerin() {
  let numeroDadi = parseInt(document.getElementById("numero-dadi").value),
    n = parseInt(document.getElementById("facce-dadi").value),
    sommaTotale = 0,
    somma = "";

  for (let i = 0; i < numeroDadi; i++) {
    let numeroCasuale = Math.floor(Math.random() * n) + 1; // Genera un numero casuale tra 1 e n facce
    sommaTotale += numeroCasuale;

    let risultato =
      '<div class="cerchio"><div class="figure-container">' +
      '<span class="number">' +
      numeroCasuale +
      "</span>" +
      "</div>" +
      "</div>";
    somma += "<p>" + risultato + "</p>";
  }

  document.getElementById("risultato").innerHTML = somma;
  document.getElementById("somma-totale").innerHTML = sommaTotale;
}
