function CalculateTrigonometrics() {
  const gradi = getGradi(),
    options = getOptions(),
    info = getInfo(options),
    result = convertToRadians(gradi, options);

  if (isNaN(gradi)) {
    displayInvalidInput();
    return;
  }

  displayResult(info, gradi, result);
}
const getGradi = () =>
    parseFloat(document.getElementById("gradi-radianti").value),
  getOptions = () => document.getElementById("options").value,
  getInfo = (options) => (options === "Rad" ? "Radianti" : "Gradi"),
  convertToRadians = (gradi, options) =>
    options === "Rad" ? gradi : (gradi * Math.PI) / 180,
  displayInvalidInput = () =>
    (document.getElementById("risultato").innerHTML =
      "Inserisci un numero valido");

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
