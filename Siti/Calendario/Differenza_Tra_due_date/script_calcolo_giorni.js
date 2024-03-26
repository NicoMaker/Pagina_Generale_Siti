function calcolaDifferenzaTempo() {
  let data1 = new Date(document.getElementById("inputDate1").value),
      data2 = new Date(document.getElementById("inputDate2").value);

  if (isNaN(data1) || isNaN(data2))
      document.getElementById("risultato").innerHTML = "Inserisci date valide.";
  else {
      let differenza = Math.abs(data2 - data1),
          anni = Math.floor(differenza / (1000 * 60 * 60 * 24 * 365.25)),
          giorni = Math.floor(
              (differenza % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24)
          ),
          ore = Math.floor((differenza % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minuti = Math.floor((differenza % (1000 * 60 * 60)) / (1000 * 60)),
          secondi = Math.floor((differenza % (1000 * 60)) / 1000),
          risultato = `La differenza è di `;

      if (anni > 0)
          risultato += `${anni} anni, `;
      if (giorni > 0)
          risultato += `${giorni} giorni, `;
      if (ore > 0)
          risultato += `${ore} ore, `;
      if (minuti > 0)
          risultato += `${minuti} minuti, `;
      if (secondi > 0)
          risultato += `${secondi} secondi, `;

      risultato = risultato.slice(0, -2);
      risultato += ".";

      document.getElementById("risultato").innerHTML = risultato;
  }
}