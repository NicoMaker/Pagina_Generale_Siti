function calculateIdeal() {
  const calculationType = document.getElementById("calculationType").value,
    gender = document.getElementById("gender").value,
    value = parseFloat(document.getElementById("value").value),
    idealWeight = "";
  let result = "";

  if (isNaN(value) || value <= 0) result = "Inserisci un valore valido.";
  else {
    if (calculationType === "weight") {
      if (gender === "male") {
        // Formula per calcolare il peso ideale per un uomo
        idealWeight = (value - 100) * 0.9;
        result = `Il peso ideale per un uomo con altezza ${value} cm è ${idealWeight.toFixed(
          2
        )} kg.`;
      } else if (gender === "female") {
        // Formula per calcolare il peso ideale per una donna
        idealWeight = (value - 100) * 0.85;
        result = `Il peso ideale per una donna con altezza ${value} cm è ${idealWeight.toFixed(
          2
        )} kg.`;
      }
    } else if (calculationType === "height") {
      // Formula inversa per calcolare l'altezza ideale
      const idealHeightMale = value / 0.9 + 100,
        idealHeightFemale = value / 0.85 + 100;

      if (gender === "male")
        result = `Per un peso di ${value} kg, l'altezza ideale per un uomo è ${idealHeightMale.toFixed(
          2
        )} cm.`;
      else if (gender === "female")
        result = `Per un peso di ${value} kg, l'altezza ideale per una donna è ${idealHeightFemale.toFixed(
          2
        )} cm.`;
    }
  }

  document.getElementById("result").innerHTML = result;
}
