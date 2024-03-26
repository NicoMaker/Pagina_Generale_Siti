let expression = "",
  result = document.getElementById("result"); // Result input element

function appendNumber(num) {
  expression += num;
  result.value = expression;
}

function appendOperator(operator) {
  expression += operator;
  result.value = expression;
}

function clearResult() {
  expression = "";
  result.value = "";
}
function calculate() {
  try {
    const evalResult = eval(expression);
    result.value = evalResult;
    expression = evalResult;
  } catch (error) {
    result.value = "Error";
  }
}
