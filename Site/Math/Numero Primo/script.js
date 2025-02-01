function checkPrime() {
  const number = parseInt(document.getElementById("number").value),
    result = document.getElementById("result"),
    numbersaddivisor = 0;

  if (isNaN(number)) {
    result.innerHTML = "Inserisci un numero valido.";
    return;
  }

  if (number < 2) {
    result.innerHTML = "Il numero deve essere maggiore di 1.";
    return;
  }

  const { isPrime, divisors, numbersaddivisor: newNumbersaddivisor } = getPrimeStatus(number, numbersaddivisor);
  displayResult(number, isPrime, divisors, result, newNumbersaddivisor);
}

function getPrimeStatus(number, numbersaddivisor) {
  let divisors = [],
    isPrime = 0;
    

  for (let i = 1; i <= number; i++) {
    if (number % i === 0) {
      isPrime++;
      divisors.push(i);
      numbersaddivisor++;
    }
  }

  return { isPrime: isPrime === 2, divisors, numbersaddivisor };
}

function displayResult(number, isPrime, divisors, result, numbersaddivisor) {
  if (isPrime) result.innerHTML = `${number} è un numero primo.`;
  else
    result.innerHTML = `${number} non è un numero primo avendo ${numbersaddivisor} divisori. <br> <br> Divisori: ${divisors.join(
      ", "
    )}`;
}