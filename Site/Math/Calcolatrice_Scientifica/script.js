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
    // Controlla se la lunghezza dell'espressione è già 10 cifre numeriche
    const numbersOnly = this.expression.replace(/[^0-9.]/g, "");
    if (numbersOnly.length >= 10 && !this.expression.includes(".")) {
      alert("Hai raggiunto il limite massimo di 10 cifre numeriche.");
      return;
    }

    // Controlla se l'utente sta cercando di aggiungere un punto
    if (num === "." && this.expression.includes(".")) {
      alert("Non è possibile mettere due volte il punto.");
      return;
    }

    // Controlla se il punto è all'interno di una funzione matematica
    if (
      this.expression.includes("(") &&
      num === "." &&
      !this.expression.includes(")")
    ) {
      this.expression += num;
      this.updateDisplay();
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

  // Funzione per il calcolo delle radici
  sqrt(n) {
    return Math.sqrt(n);
  }

  cbrt(n) {
    return Math.cbrt(n);
  }

  root(base, n) {
    return Math.pow(n, 1 / base);
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
        .replace(/(\d+)!/g, (match, num) => `${this.factorial(Number(num))}`)
        // Supporto per le radici
        .replace(
          /sqrt\((\d+(\.\d+)?)\)/g,
          (match, n) => `${this.sqrt(Number(n))}`
        )
        .replace(
          /cbrt\((\d+(\.\d+)?)\)/g,
          (match, n) => `${this.cbrt(Number(n))}`
        )
        .replace(
          /root\((\d+(\.\d+)?),(\d+(\.\d+)?)\)/g,
          (match, base, _, n) => `${this.root(Number(base), Number(n))}`
        );

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
