function calculateFactorial() {
  let numberInput = document.getElementById("number"),
    resultDiv = document.getElementById("result"),
    result = "",
    number = parseInt(numberInput.value);

  if (isNaN(number)) {
    resultDiv.textContent = "Inserisci un numero valido.";
    return;
  }

  if (number < 0) result = number * -1;
  else result = number;

  resultDiv.textContent = `Il valore assoluto di ${number} è : ${result}`;
}
