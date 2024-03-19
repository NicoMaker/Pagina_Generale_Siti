function calcolaTempoTrascorso() {
  let inputData = new Date(document.getElementById("inputDate").value);

  let risultato = "";

  if (isNaN(inputData)) {
    risultato = `Inserisci una data valida`;
    document.getElementById("risultato").innerHTML = risultato;
  } else {
    let dataCorrente = new Date();

    if (inputData > dataCorrente) {
      let differenzaTempo = inputData - dataCorrente;

      let anni = Math.floor(differenzaTempo / (365.25 * 24 * 60 * 60 * 1000));
      let mesi = Math.floor(
        (differenzaTempo % (365.25 * 24 * 60 * 60 * 1000)) /
          (30.44 * 24 * 60 * 60 * 1000)
      );
      let giorni = Math.floor(
        (differenzaTempo % (30.44 * 24 * 60 * 60 * 1000)) /
          (24 * 60 * 60 * 1000)
      );
      let ore = Math.floor(
        (differenzaTempo % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
      );
      let minuti = Math.floor(
        (differenzaTempo % (60 * 60 * 1000)) / (60 * 1000)
      );
      let secondi = Math.floor((differenzaTempo % (60 * 1000)) / 1000);

      risultato = `Manca ${anni} anni, ${mesi} mesi, ${giorni} giorni, ${ore} ore, ${minuti} minuti e ${secondi} secondi alla data inserita.`;
    } else {
      let differenzaTempo = dataCorrente - inputData;

      let anni = Math.floor(differenzaTempo / (365.25 * 24 * 60 * 60 * 1000));
      let mesi = Math.floor(
        (differenzaTempo % (365.25 * 24 * 60 * 60 * 1000)) /
          (30.44 * 24 * 60 * 60 * 1000)
      );
      let giorni = Math.floor(
        (differenzaTempo % (30.44 * 24 * 60 * 60 * 1000)) /
          (24 * 60 * 60 * 1000)
      );
      let ore = Math.floor(
        (differenzaTempo % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
      );
      let minuti = Math.floor(
        (differenzaTempo % (60 * 60 * 1000)) / (60 * 1000)
      );
      let secondi = Math.floor((differenzaTempo % (60 * 1000)) / 1000);

      risultato = `Sono passati ${anni} anni, ${mesi} mesi, ${giorni} giorni, ${ore} ore, ${minuti} minuti e ${secondi} secondi dalla data inserita.`;
    }

    document.getElementById("risultato").innerHTML = risultato;
  }
}
