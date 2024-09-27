function checkPrime() {
  const number = parseInt(document.getElementById("number").value),
    result = document.getElementById("result");

  if (isNaN(number)) {
    result.innerHTML = "Inserisci un numero valido.";
    return;
  }

  if (number < 2) {
    result.innerHTML = "Il numero deve essere maggiore di 1.";
    return;
  }

  const { isPrime, divisors } = getPrimeStatus(number);
  displayResult(number, isPrime, divisors, result);
}

function getPrimeStatus(number) {
  let divisors = [],
    isPrime = 0;

  for (let i = 1; i <= number; i++) {
    if (number % i === 0) {
      isPrime++;
      divisors.push(i);
    }
  }

  return { isPrime: isPrime === 2, divisors };
}

function displayResult(number, isPrime, divisors, result) {
  if (isPrime) result.innerHTML = `${number} è un numero primo.`;
  else
    result.innerHTML = `${number} non è un numero primo. <br> <br> Divisori: ${divisors.join(
      ", "
    )}`;
}
