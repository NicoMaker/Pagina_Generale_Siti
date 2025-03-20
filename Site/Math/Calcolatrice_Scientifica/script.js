class Calculator {
  constructor(displayElement, toggleButton, backspaceButton) {
    this.displayElement = displayElement;
    this.toggleButton = toggleButton;
    this.backspaceButton = backspaceButton;
    this.expression = "";
    this.isRadians = true;
    this.updateToggleButton();

    // Aggiungi event listener per il pulsante backspace
    this.backspaceButton.addEventListener("click", () => this.backspace());
  }

  appendNumber(num) {
    // Controlla se la lunghezza dell'espressione è già 20 caratteri
    if (this.expression.length >= 20) {
      alert("Hai raggiunto il limite massimo di 20 cifre.");
      return;
    }

    // Controlla se l'utente sta cercando di aggiungere un punto
    if (num === "." && this.expression.includes(".")) {
      alert("Non è possibile mettere due volte il punto.");
      return;
    }

    this.expression += num;
    this.updateDisplay();
  }

  appendOperator(operator) {
    if (operator === "!") this.expression += operator;
    else if (operator.includes("(")) this.expression += operator;
    else this.expression += ` ${operator} `;
    this.updateDisplay();
  }

  appendExp() {
    this.expression += "Math.exp(1)";
    this.updateDisplay();
  }

  clear() {
    this.expression = "";
    this.updateDisplay();
  }

  toggleRadians() {
    this.isRadians = !this.isRadians;
    this.updateToggleButton();
  }

  updateToggleButton = () =>
    (this.toggleButton.textContent = this.isRadians ? "Rad" : "Deg");

  backspace() {
    this.expression = this.expression.trim().slice(0, -1);
    this.updateDisplay();
  }

  factorial(n) {
    if (n === 0 || n === 1) return 1;
    return n * this.factorial(n - 1);
  }

  calculate() {
    try {
      let expr = this.expression
        .replace(
          /Math\.sin\(/g,
          `Math.sin(${this.isRadians ? "" : "Math.PI/180*"} `
        )
        .replace(
          /Math\.cos\(/g,
          `Math.cos(${this.isRadians ? "" : "Math.PI/180*"} `
        )
        .replace(
          /Math\.tan\(/g,
          `Math.tan(${this.isRadians ? "" : "Math.PI/180*"} `
        )
        .replace(
          /Math\.asin\(/g,
          `Math.asin(${this.isRadians ? "" : "Math.PI/180*"} `
        )
        .replace(
          /Math\.acos\(/g,
          `Math.acos(${this.isRadians ? "" : "Math.PI/180*"} `
        )
        .replace(
          /Math\.atan\(/g,
          `Math.atan(${this.isRadians ? "" : "Math.PI/180*"} `
        )
        .replace(/Math\.log10\(/g, `Math.log10(`)
        .replace(/Math\.log\(/g, `Math.log(`)
        .replace(/Math\.exp\(/g, `Math.exp(`)
        .replace(/(\d+)\^(\d+)/g, (match, base, exp) => `${base}**${exp}`)
        .replace(/(\d+)!/g, (match, num) => `${this.factorial(Number(num))}`);

      if (this.expression.includes("log")) {
        let base = prompt("Inserisci la base per il logaritmo:", "10");
        if (base) {
          expr = expr.replace(/Math\.log\((.*?)\)/g, (match, p1) => {
            return `Math.log(${p1}) / Math.log(${base})`;
          });
        }
      }

      let result = eval(expr);

      this.expression = Number.isInteger(result)
        ? result.toString()
        : result.toFixed(2);
    } catch (error) {
      this.expression = "Errore";
    }
    this.updateDisplay();
  }

  updateDisplay() {
    this.displayElement.value = this.expression;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.calculator = new Calculator(
    document.getElementById("result"),
    document.getElementById("toggleRadians"),
    document.getElementById("backspace")
  );
});
