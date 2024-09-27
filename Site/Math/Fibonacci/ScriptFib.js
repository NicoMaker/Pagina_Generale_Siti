function calculateFibonacci() {
  let numInput = document.getElementById("num-input"),
    outputDiv = document.getElementById("output");
  outputDiv.textContent = "";

  let num = parseInt(numInput.value);
  if (isNaN(num) || num < 0) {
    outputDiv.textContent = "Inserisci un numero valido.";
    return;
  }

  const fibNumbers = generateFibonacci(num),
    sum = calculateSumOfLastTwo(fibNumbers);
  displayFibonacci(fibNumbers, sum, outputDiv);
}

function generateFibonacci(num) {
  let fibNumbers = [1];

  if (num === 0) return fibNumbers;

  fibNumbers = [1, 1];

  for (let i = 2; i <= num; i++) {
    let nextFib = fibNumbers[i - 1] + fibNumbers[i - 2];
    fibNumbers.push(nextFib);
  }

  return fibNumbers;
}

function calculateSumOfLastTwo(fibNumbers) {
  const len = fibNumbers.length;
  return len > 1 ? fibNumbers[len - 1] + fibNumbers[len - 2] : fibNumbers[0];
}

function displayFibonacci(fibNumbers, sum, outputDiv) {
  let output = fibNumbers.join(", ");
  outputDiv.textContent = `Sequenza di Fibonacci: ${output} , Somma: ${sum}`;
}
