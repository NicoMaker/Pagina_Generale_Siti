function calculateIdealWeight(height, gender) {
  if (gender === "male") return (height - 100) * 0.9;
  else if (gender === "female") return (height - 100) * 0.85;
  return null;
}

function calculateIdealHeight(weight, gender) {
  if (gender === "male") return weight / 0.9 + 100;
  else if (gender === "female") return weight / 0.85 + 100;
  return null;
}

function calculateIdeal() {
  const calculationType = document.getElementById("calculationType").value,
    gender = document.getElementById("gender").value,
    value = parseFloat(document.getElementById("value").value);
  let result = "";

  if (isNaN(value) || value <= 0) result = "Inserisci un valore valido.";
  else {
    if (calculationType === "weight") {
      const idealWeight = calculateIdealWeight(value, gender);
      if (idealWeight !== null) {
        result = `Il peso ideale per ${
          gender === "male" ? "un uomo" : "una donna"
        } con altezza ${value} cm è ${idealWeight.toFixed(2)} kg.`;
      }
    } else if (calculationType === "height") {
      const idealHeight = calculateIdealHeight(value, gender);
      if (idealHeight !== null) {
        result = `Per un peso di ${value} kg, l'altezza ideale per ${
          gender === "male" ? "un uomo" : "una donna"
        } è ${idealHeight.toFixed(2)} cm.`;
      }
    }
  }

  document.getElementById("result").innerHTML = result;
}
