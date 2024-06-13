function convert() {
  const inputNumber = document.getElementById("inputNumber").value,
    fromBase = parseInt(document.getElementById("selectFromBase").value),
    toBase = parseInt(document.getElementById("selectToBase").value),
    base10Number = parseInt(inputNumber, fromBase),
    convertedNumber = base10Number.toString(toBase);

  document.getElementById("outputNumber").value = convertedNumber;
}