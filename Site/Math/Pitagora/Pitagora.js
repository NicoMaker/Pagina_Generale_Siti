// Pythagorean Theorem Calculator
document.addEventListener("DOMContentLoaded", function () {
  // Initialize the calculator
  updateInputVisibility();

  // Add event listener for input type change
  document
    .getElementById("input-type")
    .addEventListener("change", updateInputVisibility);

  // Add event listeners for Enter key
  document
    .getElementById("cateto1")
    .addEventListener("keypress", handleEnterKey);
  document
    .getElementById("cateto2")
    .addEventListener("keypress", handleEnterKey);
  document
    .getElementById("ipotenusa")
    .addEventListener("keypress", handleEnterKey);
  document
    .getElementById("cateto")
    .addEventListener("keypress", handleEnterKey);
});

// Update which inputs are visible based on calculation type
function updateInputVisibility() {
  const inputType = document.getElementById("input-type").value;
  const ipotenusaInputs = document.getElementById("ipotenusa-inputs");
  const catetoInputs = document.getElementById("cateto-inputs");

  if (inputType === "ipotenusa") {
    ipotenusaInputs.classList.remove("hidden");
    catetoInputs.classList.add("hidden");
  } else if (inputType === "cateto") {
    ipotenusaInputs.classList.add("hidden");
    catetoInputs.classList.remove("hidden");
  }

  // Clear the result when switching calculation type
  document.getElementById("risultato").textContent = "";
}

// Handle Enter key press
function handleEnterKey(event) {
  if (event.key === "Enter") {
    calcola();
  }
}

// Main calculation function
function calcola() {
  const inputType = document.getElementById("input-type").value;
  const risultatoElement = document.getElementById("risultato");

  // Clear previous result
  risultatoElement.textContent = "";
  risultatoElement.classList.remove("fade-in");

  // Force browser to recognize the removal before adding it back
  void risultatoElement.offsetWidth;

  // Perform the appropriate calculation based on input type
  if (inputType === "ipotenusa") {
    calcolaIpotenusa(risultatoElement);
  } else if (inputType === "cateto") {
    calcolaCateto(risultatoElement);
  }

  // Add animation class
  risultatoElement.classList.add("fade-in");
}

// Calculate the hypotenuse given two legs
function calcolaIpotenusa(risultatoElement) {
  const cateto1 = parseFloat(document.getElementById("cateto1").value);
  const cateto2 = parseFloat(document.getElementById("cateto2").value);

  if (isNaN(cateto1) || isNaN(cateto2)) {
    risultatoElement.textContent = "Inserisci entrambi i cateti.";
    return;
  }

  if (cateto1 <= 0 || cateto2 <= 0) {
    risultatoElement.textContent = "I cateti devono essere maggiori di zero.";
    return;
  }

  const ipotenusa = Math.sqrt(cateto1 * cateto1 + cateto2 * cateto2);
  risultatoElement.innerHTML = `L'ipotenusa è: <strong>${ipotenusa.toFixed(
    3,
  )}</strong>`;

  // Update the triangle visualization
  updateTriangleVisualization(cateto1, cateto2, ipotenusa);
}

// Calculate the leg given the hypotenuse and the other leg
function calcolaCateto(risultatoElement) {
  const ipotenusa = parseFloat(document.getElementById("ipotenusa").value);
  const cateto = parseFloat(document.getElementById("cateto").value);

  if (isNaN(ipotenusa) || isNaN(cateto)) {
    risultatoElement.textContent = "Inserisci l'ipotenusa e il cateto.";
    return;
  }

  if (ipotenusa <= 0 || cateto <= 0) {
    risultatoElement.textContent = "I valori devono essere maggiori di zero.";
    return;
  }

  if (cateto >= ipotenusa) {
    risultatoElement.textContent =
      "Il cateto deve essere minore dell'ipotenusa.";
    return;
  }

  const altroCateto = Math.sqrt(ipotenusa * ipotenusa - cateto * cateto);
  risultatoElement.innerHTML = `L'altro cateto è: <strong>${altroCateto.toFixed(
    3,
  )}</strong>`;

  // Update the triangle visualization
  updateTriangleVisualization(cateto, altroCateto, ipotenusa);
}

// Update the triangle visualization based on calculated values
function updateTriangleVisualization(a, b, c) {
  // Scale the triangle to fit in the SVG
  const maxDimension = Math.max(a, b, c);
  const scale = 150 / maxDimension;

  const scaledA = a * scale;
  const scaledB = b * scale;

  // Update the triangle in the SVG
  const triangle = document.querySelector(".triangle-diagram svg polygon");
  triangle.setAttribute(
    "points",
    `20,180 ${20 + scaledA},180 20,${180 - scaledB}`,
  );

  // Update the labels
  const labels = document.querySelectorAll(".triangle-labels text");
  labels[0].textContent = `a: ${a.toFixed(1)}`;
  labels[1].textContent = `b: ${b.toFixed(1)}`;
  labels[2].textContent = `c: ${c.toFixed(1)}`;

  // Position the formula
  const formula = document.querySelector('.triangle-diagram svg text[x="60"]');
  formula.textContent = `${a.toFixed(1)}² + ${b.toFixed(1)}² = ${c.toFixed(
    1,
  )}²`;
}
