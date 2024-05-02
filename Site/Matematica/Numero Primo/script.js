function checkPrime() {
  const number = document.getElementById("number").value,
    result = document.getElementById("result");
  Result(number, result);
}

function Result(number, result) {
  if (number < 1) {
    result.innerHTML = "Il numero deve essere maggiore di 1.";
    return;
  }

  let isPrime = 0,
    divisors = [];

  for (let i = 0; i <= number; i++) {
    if (number % i === 0) {
      isPrime++;
      divisors.push(i);
    }
  }

  if (isPrime == 2) result.innerHTML = `${number} e' un numero primo`;
  else
    result.innerHTML = `
        ${number} non e' un numero primo. <br> <br> ${isPrime} Numeri divisibili: <br> <br> ${divisors.join(
      ", "
    )}
        `;
}
