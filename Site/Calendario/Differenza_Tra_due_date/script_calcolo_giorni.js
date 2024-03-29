function calcolaDifferenzaTempo() {
  let data1 = new Date(document.getElementById("inputDate1").value),
    data2 = new Date(document.getElementById("inputDate2").value);

  if (isNaN(data1) || isNaN(data2))
    document.getElementById("risultato").innerHTML = "Inserisci date valide.";
  else {
    let differenza = Math.abs(data2 - data1),
      millisecondiInUnAnno = 1000 * 60 * 60 * 24 * 365.25,
      anni = Math.floor(differenza / millisecondiInUnAnno),
      giorniRimasti = differenza % millisecondiInUnAnno,
      millisecondiInUnGiorno = 1000 * 60 * 60 * 24,
      giorni = Math.floor(giorniRimasti / millisecondiInUnGiorno),
      oreRimanenti = giorniRimasti % millisecondiInUnGiorno,
      millisecondiInUnOra = 1000 * 60 * 60,
      ore = Math.floor(oreRimanenti / millisecondiInUnOra),
      minutiRimasti = oreRimanenti % millisecondiInUnOra,
      millisecondiInUnMinuto = 1000 * 60,
      minuti = Math.floor(minutiRimasti / millisecondiInUnMinuto),
      secondi = Math.floor((minutiRimasti % millisecondiInUnMinuto) / 1000),
      risultato = `La differenza è di `;

    if (anni > 0) risultato += `${anni} anni, `;
    if (giorni > 0) risultato += `${giorni} giorni, `;
    if (ore > 0) risultato += `${ore} ore, `;
    if (minuti > 0) risultato += `${minuti} minuti, `;
    if (secondi > 0) risultato += `${secondi} secondi, `;

    risultato = risultato.slice(0, -2);
    risultato += ".";

    document.getElementById("risultato").innerHTML = risultato;
  }
}
