class Calculator {
  constructor(resultElement, operationElement, toggleButton, backspaceButton) {
    this.resultElement = resultElement;
    this.operationElement = operationElement;
    this.toggleButton = toggleButton;
    this.backspaceButton = backspaceButton;
    this.currentNumber = "";
    this.expression = "";
    this.displayExpression = "";
    this.isRadians = true;
    this.lastResult = null;
    this.rootIndex = null;
    this.logBase = null;
    this.waitingForRootValue = false;
    this.waitingForLogValue = false;
    this.updateToggleButton();

    // Aggiungi event listener per il pulsante backspace
    this.backspaceButton.addEventListener("click", () => this.backspace());
  }

  appendNumber(num) {
    // Controlla se la lunghezza dell'espressione è già 10 cifre numeriche
    if (this.currentNumber.length >= 10 && num !== ".") {
      return;
    }

    // Controlla se l'utente sta cercando di aggiungere un punto
    if (num === "." && this.currentNumber.includes(".")) {
      return;
    }

    this.currentNumber += num;
    this.updateDisplay();
  }

  appendOperator(operator) {
    // Se stiamo aspettando un valore per la radice, completa l'operazione di radice
    if (this.waitingForRootValue && this.currentNumber !== "") {
      this.completeCustomRoot();
    }

    // Se stiamo aspettando un valore per il logaritmo, completa l'operazione di logaritmo
    if (this.waitingForLogValue && this.currentNumber !== "") {
      this.completeCustomLog();
    }

    if (
      this.currentNumber !== "" ||
      operator === "(" ||
      operator === "Math.PI"
    ) {
      if (this.currentNumber !== "") {
        this.expression += this.currentNumber;
        this.displayExpression += this.currentNumber;
        this.currentNumber = "";
      }

      if (operator === "!") {
        this.expression += operator;
        this.displayExpression += "!";
      } else if (operator.includes("Math.")) {
        this.expression += operator;
        this.displayExpression +=
          operator === "Math.PI" ? "π" : operator.replace("Math.", "");
      } else {
        this.expression += operator;
        this.displayExpression += operator;
      }
    }
    this.updateDisplay();
  }

  appendFunction(func) {
    // Se stiamo aspettando un valore per la radice, completa l'operazione di radice
    if (this.waitingForRootValue && this.currentNumber !== "") {
      this.completeCustomRoot();
    }

    // Se stiamo aspettando un valore per il logaritmo, completa l'operazione di logaritmo
    if (this.waitingForLogValue && this.currentNumber !== "") {
      this.completeCustomLog();
    }

    // Salva l'espressione corrente se necessario
    if (this.currentNumber !== "") {
      this.expression += this.currentNumber;
      this.displayExpression += this.currentNumber;
      this.currentNumber = "";
    }

    // Gestione speciale per il logaritmo con base personalizzabile
    if (func === "log") {
      const base = prompt("Inserisci la base per il logaritmo:", "10");
      if (base && !isNaN(base) && Number.parseFloat(base) > 0) {
        const logBase = Number.parseFloat(base);

        // Memorizziamo la base per usarla più tardi
        this.logBase = logBase;

        // Impostiamo il flag per indicare che stiamo aspettando un valore per il logaritmo
        this.waitingForLogValue = true;

        // Aggiorniamo il display per mostrare l'operazione di logaritmo
        this.displayExpression += `log${logBase}(`;

        // Non aggiungiamo ancora nulla all'espressione, lo faremo quando avremo il valore
      } else {
        // Se l'utente annulla o inserisce un valore non valido, usa base 10
        this.expression += `Math.log10(`;
        this.displayExpression += "log10(";
      }
      return this.updateDisplay();
    }

    // Aggiungi la funzione appropriata
    switch (func) {
      case "sin":
        this.expression += `Math.sin(${this.isRadians ? "" : "Math.PI/180*"}`;
        this.displayExpression += "sin(";
        break;
      case "cos":
        this.expression += `Math.cos(${this.isRadians ? "" : "Math.PI/180*"}`;
        this.displayExpression += "cos(";
        break;
      case "tan":
        this.expression += `Math.tan(${this.isRadians ? "" : "Math.PI/180*"}`;
        this.displayExpression += "tan(";
        break;
      case "asin":
        this.expression += `Math.asin(`;
        this.displayExpression += "asin(";
        break;
      case "acos":
        this.expression += `Math.acos(`;
        this.displayExpression += "acos(";
        break;
      case "atan":
        this.expression += `Math.atan(`;
        this.displayExpression += "atan(";
        break;
      case "ln":
        this.expression += `Math.log(`;
        this.displayExpression += "ln(";
        break;
      default:
        break;
    }

    this.updateDisplay();
  }

  completeCustomLog() {
    if (this.waitingForLogValue && this.logBase && this.currentNumber !== "") {
      // Aggiungiamo l'espressione per il logaritmo in base personalizzata
      if (this.logBase === 10) {
        this.expression += `Math.log10(${this.currentNumber})`;
      } else if (
        this.logBase === Math.E ||
        this.logBase === 2.718281828459045
      ) {
        this.expression += `Math.log(${this.currentNumber})`;
      } else {
        this.expression += `(Math.log(${this.currentNumber})/Math.log(${this.logBase}))`;
      }

      this.displayExpression += `${this.currentNumber})`;

      // Resettiamo le variabili
      this.currentNumber = "";
      this.waitingForLogValue = false;
      this.logBase = null;

      this.updateDisplay();
    }
  }

  appendRoot(n) {
    // Se stiamo aspettando un valore per la radice, completa l'operazione di radice
    if (this.waitingForRootValue && this.currentNumber !== "") {
      this.completeCustomRoot();
    }

    // Se stiamo aspettando un valore per il logaritmo, completa l'operazione di logaritmo
    if (this.waitingForLogValue && this.currentNumber !== "") {
      this.completeCustomLog();
    }

    // Salva l'espressione corrente se necessario
    if (this.currentNumber !== "") {
      this.expression += this.currentNumber;
      this.displayExpression += this.currentNumber;
      this.currentNumber = "";
    }

    if (n === 2) {
      this.expression += `Math.sqrt(`;
      this.displayExpression += "√(";
    } else if (n === 3) {
      this.expression += `Math.cbrt(`;
      this.displayExpression += "∛(";
    }

    this.updateDisplay();
  }

  appendCustomRoot() {
    const rootIndex = prompt("Inserisci l'indice della radice:", "");
    if (rootIndex && !isNaN(rootIndex) && Number.parseFloat(rootIndex) > 0) {
      // Salva l'espressione corrente se necessario
      if (this.currentNumber !== "") {
        this.expression += this.currentNumber;
        this.displayExpression += this.currentNumber;
        this.currentNumber = "";
      }

      // Memorizziamo l'indice della radice
      this.rootIndex = Number.parseFloat(rootIndex);

      // Impostiamo il flag per indicare che stiamo aspettando un valore per la radice
      this.waitingForRootValue = true;

      // Aggiorniamo il display per mostrare l'operazione di radice
      this.displayExpression += `${rootIndex}√(`;

      // Non aggiungiamo ancora nulla all'espressione, lo faremo quando avremo il valore
    }

    this.updateDisplay();
  }

  completeCustomRoot() {
    if (
      this.waitingForRootValue &&
      this.rootIndex &&
      this.currentNumber !== ""
    ) {
      // Aggiungiamo l'espressione per la radice n-esima
      this.expression += `Math.pow(${this.currentNumber}, 1/${this.rootIndex})`;
      this.displayExpression += `${this.currentNumber})`;

      // Resettiamo le variabili
      this.currentNumber = "";
      this.waitingForRootValue = false;
      this.rootIndex = null;

      this.updateDisplay();
    }
  }

  appendExp() {
    this.expression += "Math.E";
    this.displayExpression += "e";
    this.updateDisplay();
  }

  clear() {
    this.currentNumber = "";
    this.expression = "";
    this.displayExpression = "";
    this.lastResult = null;
    this.rootIndex = null;
    this.logBase = null;
    this.waitingForRootValue = false;
    this.waitingForLogValue = false;
    this.updateDisplay();
  }

  toggleRadians() {
    this.isRadians = !this.isRadians;
    this.updateToggleButton();
  }

  updateToggleButton() {
    this.toggleButton.textContent = this.isRadians ? "Rad" : "Deg";
  }

  backspace() {
    if (this.currentNumber.length > 0) {
      this.currentNumber = this.currentNumber.slice(0, -1);
    } else if (this.displayExpression.length > 0) {
      // Rimuovi l'ultimo carattere dall'espressione visualizzata
      this.displayExpression = this.displayExpression.slice(0, -1);

      // Rimuovi l'ultimo operatore o funzione dall'espressione reale
      // Questo è semplificato e potrebbe non funzionare perfettamente per tutte le espressioni
      const lastOperatorIndex = Math.max(
        this.expression.lastIndexOf("+"),
        this.expression.lastIndexOf("-"),
        this.expression.lastIndexOf("*"),
        this.expression.lastIndexOf("/"),
        this.expression.lastIndexOf("("),
        this.expression.lastIndexOf(")")
      );

      if (lastOperatorIndex !== -1) {
        this.expression = this.expression.slice(0, lastOperatorIndex);
      } else {
        this.expression = "";
      }
    }
    this.updateDisplay();
  }

  factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  calculate() {
    try {
      // Se stiamo aspettando un valore per la radice, completa l'operazione di radice
      if (this.waitingForRootValue && this.currentNumber !== "") {
        this.completeCustomRoot();
      }
      // Se stiamo aspettando un valore per il logaritmo, completa l'operazione di logaritmo
      else if (this.waitingForLogValue && this.currentNumber !== "") {
        this.completeCustomLog();
      } else if (this.currentNumber !== "") {
        this.expression += this.currentNumber;
        this.displayExpression += this.currentNumber;
        this.currentNumber = "";
      }

      // Completa eventuali parentesi aperte
      const openParenCount = (this.expression.match(/\(/g) || []).length;
      const closeParenCount = (this.expression.match(/\)/g) || []).length;

      if (openParenCount > closeParenCount) {
        const diff = openParenCount - closeParenCount;
        for (let i = 0; i < diff; i++) {
          this.expression += ")";
          this.displayExpression += ")";
        }
      }

      // Gestisci il fattoriale
      const expr = this.expression.replace(/(\d+)!/g, (match, num) => {
        return this.factorial(Number.parseInt(num));
      });

      console.log("Espressione da calcolare:", expr);

      // Esegui il calcolo
      const result = eval(expr);

      console.log("Risultato calcolato:", result);

      // Formatta il risultato
      if (Number.isInteger(result)) {
        this.lastResult = result.toString();
      } else {
        // Limita a 8 decimali per evitare numeri troppo lunghi
        this.lastResult = Number.parseFloat(result.toFixed(8)).toString();
      }

      // Salva l'espressione calcolata
      const calculatedExpression = this.displayExpression;

      // Aggiorna i display
      this.resultElement.value = this.lastResult;
      this.operationElement.value = calculatedExpression + " =";

      // Resetta le espressioni ma mantieni il risultato per operazioni future
      this.expression = "";
      this.displayExpression = "";
      this.currentNumber = "";
    } catch (error) {
      console.error("Errore nel calcolo:", error);
      this.resultElement.value = "Errore";
      this.operationElement.value = "Espressione non valida";
    }
  }

  updateDisplay() {
    this.resultElement.value = this.currentNumber || this.lastResult || "0";
    this.operationElement.value = this.displayExpression;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.calculator = new Calculator(
    document.getElementById("result"),
    document.getElementById("operation"),
    document.getElementById("toggleRadians"),
    document.getElementById("backspace")
  );
});
