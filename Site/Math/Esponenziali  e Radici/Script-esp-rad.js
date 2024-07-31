function calculateResult() {
  let number = parseFloat(document.getElementById("number").value),
    exponent = parseFloat(document.getElementById("exponent").value),
    operation = document.getElementById("operation").value,
    result;

  if (operation === "power") 
    result = Math.pow(number, exponent);
  else if (operation === "root")
    result = Math.pow(number, 1 / exponent);

  document.getElementById("result").innerText = `Il risultato e': ${result}`;
}

document.getElementById("calculate").addEventListener("click", calculateResult);
