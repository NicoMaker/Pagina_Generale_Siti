function calcolaTempoTrascorso() {
  let inputData = new Date(document.getElementById("inputDate").value),
    risultato = "";

  if (isNaN(inputData)) {
    risultato = `Inserisci una data valida`;
    document.getElementById("risultato").innerHTML = risultato;
  } else {
    let dataCorrente = new Date();

    if (inputData > dataCorrente) {
      let differenzaTempo = inputData - dataCorrente,
        anni = Math.floor(differenzaTempo / (365.25 * 24 * 60 * 60 * 1000)),
        mesi = Math.floor(
          (differenzaTempo % (365.25 * 24 * 60 * 60 * 1000)) /
            (30.44 * 24 * 60 * 60 * 1000)
        ),
        giorni = Math.floor(
          (differenzaTempo % (30.44 * 24 * 60 * 60 * 1000)) /
            (24 * 60 * 60 * 1000)
        ),
        ore = Math.floor(
          (differenzaTempo % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
        ),
        minuti = Math.floor((differenzaTempo % (60 * 60 * 1000)) / (60 * 1000)),
        secondi = Math.floor((differenzaTempo % (60 * 1000)) / 1000);

      risultato = `Manca ${anni} anni, ${mesi} mesi, ${giorni} giorni, ${ore} ore, ${minuti} minuti e ${secondi} secondi alla data inserita.`;
    } else {
      let differenzaTempo = dataCorrente - inputData,
        anni = Math.floor(differenzaTempo / (365.25 * 24 * 60 * 60 * 1000)),
        mesi = Math.floor(
          (differenzaTempo % (365.25 * 24 * 60 * 60 * 1000)) /
            (30.44 * 24 * 60 * 60 * 1000)
        ),
        giorni = Math.floor(
          (differenzaTempo % (30.44 * 24 * 60 * 60 * 1000)) /
            (24 * 60 * 60 * 1000)
        ),
        ore = Math.floor(
          (differenzaTempo % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
        ),
        minuti = Math.floor((differenzaTempo % (60 * 60 * 1000)) / (60 * 1000)),
        secondi = Math.floor((differenzaTempo % (60 * 1000)) / 1000);

      risultato = `Sono passati ${anni} anni, ${mesi} mesi, ${giorni} giorni, ${ore} ore, ${minuti} minuti e ${secondi} secondi dalla data inserita.`;
    }

    document.getElementById("risultato").innerHTML = risultato;
  }
}
