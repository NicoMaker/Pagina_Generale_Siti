function checkPrime() {
  const number = parseInt(document.getElementById("number").value),
    result = document.getElementById("result");

  if (isNaN(number) || number < 1) {
    result.innerHTML = "Il numero deve essere maggiore di 1.";
    return;
  }

  const { primeCount, primesList } = findPreviousPrimes(number);
  displayResult(number, primeCount, primesList, result);
}

function findPreviousPrimes(number) {
  let primeCount = 0,
    primesList = [];

  for (let i = 2; i < number; i++) {
    if (isPrime(i)) {
      primeCount++;
      primesList.push(i);
    }
  }

  return { primeCount, primesList };
}

function isPrime(n) {
  let divisors = 0;
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) {
      divisors++;
    }
  }
  return divisors === 2;
}

function displayResult(number, primeCount, primesList, result) {
  if (primeCount === 0)
    result.innerHTML = `Il numero ${number} non ha numeri primi precedenti.`;
  else
    result.innerHTML = `Il numero ${number} ha ${primeCount} numeri primi precedenti. <br><br> I numeri primi sono: ${primesList.join(
      ", "
    )}.`;
}
