function CalculateTrigonometrics() {
  const gradi = parseFloat(document.getElementById("gradi-radianti").value),
    options = document.getElementById("options").value,
    info = options === "Rad" ? "Radianti" : "Gradi",
    result = options === "Rad" ? gradi : (gradi * Math.PI) / 180;

  if (isNaN(gradi)) {
    document.getElementById("risultato").innerHTML =
      "Inserisci un numero valido";
    return;
  }

  displayResult(info, gradi, result);
}

function displayResult(info, gradi, result) {
  let stampaHTML = `Dati del calcolo di ${gradi} ${info}<br><br>`;

  const trigFunctions = {
    Seno: Math.sin(result),
    Coseno: Math.cos(result),
    Tangente: Math.tan(result),
    Arcoseno: Math.asin(result),
    Arcocoseno: Math.acos(result),
    Arcotangente: Math.atan(result),
  };

  for (const [name, value] of Object.entries(trigFunctions))
    stampaHTML += `${name} : ${Number.isNaN(value) ? `non esiste` : value}<br>`;

  document.getElementById("risultato").innerHTML = stampaHTML;
}
