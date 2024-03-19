function checkPrime() {
  let number = Number();
  Result(number);
}

let Number = () => document.getElementById("number").value;

function Result(number) {
  let result = document.getElementById("result");

  if (number < 1) {
    result.innerHTML = "Il numero deve essere maggiore di 1.";
    return;
  }

  let isPrime = 0;
  let primi = [];
  let priminumeri = 0;

  for (let i = 0; i < number; i++) {
    isPrime = 0;
    for (let j = 0; j <= i; j++) {
      if (i % j == 0) isPrime++;
    }
    if (isPrime == 2) {
      isPrime++;
      primi.push(i);
      priminumeri++;
    }
  }

  if (priminumeri == 0)
    result.innerHTML = `
    il numero ${number} ha <br> <br> ${priminumeri} numeri primi precedenti`;
  else
    result.innerHTML = `
    il numero ${number} ha <br> <br> ${priminumeri} numeri primi precedenti e sono : <br> <br> ${primi.join(
      ", "
    )}
    `;
}
