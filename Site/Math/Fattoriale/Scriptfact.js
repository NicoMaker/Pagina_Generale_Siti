function calculateFactorial() {
  let numberInput = document.getElementById("number"),
    resultDiv = document.getElementById("result"),
    number = parseInt(numberInput.value);

  if (isNaN(number)) {
    resultDiv.textContent = "Inserisci un numero valido.";
    return;
  }

  if (number < 0) {
    resultDiv.textContent = "Il numero deve essere non negativo.";
    return;
  }

  let factorial = 1;
  for (let i = 2; i <= number; i++) {
    factorial *= i;
  }

  resultDiv.textContent = `Il fattoriale di ${number} è : ${factorial}`;
}
