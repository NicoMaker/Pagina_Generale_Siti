let expression = ""; // Expression string to store the input
let result = document.getElementById("result"); // Result input element

// Function to append a number to the expression
function appendNumber(num) {
    expression += num;
    result.value = expression;
}

// Function to append an operator to the expression
function appendOperator(operator) {
    expression += operator;
    result.value = expression;
}

// Function to clear the result and expression
function clearResult() {
    expression = "";
    result.value = "";
}

// Function to evaluate the expression and display the result
function calculate() {
    try {
        const evalResult = eval(expression);
        result.value = evalResult;
        expression = evalResult;
    } catch (error) {
        result.value = "Error";
    }
}