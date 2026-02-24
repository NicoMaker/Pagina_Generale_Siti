class Calculator {
  constructor() {
    this.initElements();
    this.bindEvents();
    this.initSlider();
    this.currentOperation = "subtract";
    this.isResultVisible = false;

    // Inizializza tutti gli input decimali
    this.initDecimalInputs();
  }

  initElements() {
    // Modalità
    this.modeBtns = document.querySelectorAll(".mode-btn");
    this.finalPriceMode = document.getElementById("final-price-mode");
    this.percentageMode = document.getElementById("percentage-mode");

    // Input
    this.basePrice = document.getElementById("base-price");
    this.priceBefore = document.getElementById("price-before");
    this.priceAfter = document.getElementById("price-after");

    // Slider
    this.slider = document.getElementById("percentage-slider");
    this.sliderTrack = document.getElementById("slider-track");
    this.percentageDisplay = document.getElementById("percentage-display");
    this.percentageInput = document.getElementById("percentage-input");

    // Operazioni
    this.operationBtns = document.querySelectorAll(".operation-btn");

    // Bottoni calcolo
    this.calcFinalBtn = document.getElementById("calculate-final");
    this.calcPercentageBtn = document.getElementById("calculate-percentage");

    // Risultato
    this.result = document.getElementById("result");
    this.resultTitle = document.getElementById("result-title");
    this.resultValue = document.getElementById("result-value");
    this.resultDetails = document.getElementById("result-details");
    this.newCalcBtn = document.getElementById("new-calculation");
    this.copyBtn = document.getElementById("copy-result");
    this.shareBtn = document.getElementById("share-result");
  }

  // Inizializza tutti gli input che devono accettare decimali con virgola
  initDecimalInputs() {
    const decimalInputs = document.querySelectorAll(".decimal-input");

    decimalInputs.forEach((input) => {
      // Gestisce l'input in tempo reale
      input.addEventListener("input", (e) => this.handleDecimalInput(e));

      // Formatta quando perde il focus
      input.addEventListener("blur", (e) => this.formatDecimalOnBlur(e));

      // Gestisce i tasti speciali
      input.addEventListener("keydown", (e) => this.handleDecimalKeydown(e));
    });
  }

  // Gestisce l'input in tempo reale
  handleDecimalInput(e) {
    const input = e.target;
    let value = input.value;

    // Sostituisce la virgola con un punto per il parsing
    let cursorPos = input.selectionStart;
    let oldLength = value.length;

    // Permette solo numeri, virgola e punto
    value = value.replace(/[^\d,.]/g, "");

    // Gestisce la virgola come separatore decimale
    if (value.includes(",")) {
      // Se c'è più di una virgola, rimuovi le extra
      const parts = value.split(",");
      if (parts.length > 2) {
        value = parts[0] + "," + parts.slice(1).join("");
      }

      // Limita a 2 decimali dopo la virgola
      const decimalParts = value.split(",");
      if (decimalParts[1] && decimalParts[1].length > 2) {
        value = decimalParts[0] + "," + decimalParts[1].substring(0, 2);

        // Aggiusta la posizione del cursore
        if (cursorPos > oldLength) {
          cursorPos = value.length;
        }
      }
    }

    // Gestisce il punto come separatore delle migliaia (lo rimuoviamo)
    value = value.replace(/\./g, "");

    input.value = value;

    // Ripristina la posizione del cursore
    if (cursorPos <= value.length) {
      input.setSelectionRange(cursorPos, cursorPos);
    }
  }

  // Formatta con 2 decimali quando si perde il focus
  formatDecimalOnBlur(e) {
    const input = e.target;
    let value = input.value.trim();

    if (value === "") {
      return;
    }

    // Converti la virgola in punto per il parsing
    let numStr = value.replace(",", ".");
    let num = parseFloat(numStr);

    if (!isNaN(num)) {
      // Arrotonda a 2 decimali
      num = Math.round(num * 100) / 100;

      // Formatta con virgola
      input.value = this.formatNumberWithComma(num);
    } else {
      input.value = "";
    }
  }

  // Gestisce tasti speciali
  handleDecimalKeydown(e) {
    const input = e.target;

    // Previeni più virgole
    if (e.key === "," || e.key === ".") {
      if (input.value.includes(",") || input.value.includes(".")) {
        e.preventDefault();
      }

      // Sostituisci il punto con virgola
      if (e.key === ".") {
        e.preventDefault();

        // Inserisci virgola
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const value = input.value;

        input.value = value.substring(0, start) + "," + value.substring(end);
        input.setSelectionRange(start + 1, start + 1);
      }
    }

    // Previeni lettere e caratteri speciali
    if (
      e.key.length === 1 &&
      !/[0-9,]/.test(e.key) &&
      e.key !== "," &&
      e.key !== "."
    ) {
      e.preventDefault();
    }
  }

  // Formatta un numero con la virgola (2 decimali)
  formatNumberWithComma(num) {
    if (isNaN(num)) return "0,00";

    // Arrotonda a 2 decimali
    num = Math.round(num * 100) / 100;

    // Separa parte intera e decimale
    let [integer, decimal] = num.toString().split(".");
    decimal = decimal ? decimal.padEnd(2, "0").substring(0, 2) : "00";

    // Aggiungi separatore delle migliaia
    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${integer},${decimal}`;
  }

  // Converte una stringa con virgola in numero
  parseItalianNumber(str) {
    if (!str || str === "") return 0;

    // Rimuovi punti separatori delle migliaia e sostituisci virgola con punto
    const cleaned = str.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleaned) || 0;
  }

  bindEvents() {
    // Switch modalità
    this.modeBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.switchMode(btn.dataset.mode));
    });

    // Operazioni (sconto/aumento)
    this.operationBtns.forEach((btn) => {
      btn.addEventListener("click", () =>
        this.switchOperation(btn.dataset.operation),
      );
    });

    // Slider e input percentuale
    this.slider.addEventListener("input", (e) =>
      this.updatePercentageFromSlider(e.target.value),
    );

    this.percentageInput.addEventListener("input", (e) => {
      // L'input è già gestito da handleDecimalInput
      // Qui aggiorniamo solo lo slider
      const value = this.parseItalianNumber(e.target.value);
      const clamped = Math.min(100, Math.max(0, value));
      this.updatePercentageFromInput(clamped);
    });

    this.percentageInput.addEventListener("blur", (e) => {
      const value = this.parseItalianNumber(e.target.value);
      const clamped = Math.min(100, Math.max(0, value));
      this.percentageInput.value = this.formatNumberWithComma(clamped);
      this.percentageDisplay.textContent = this.formatNumberWithComma(clamped);
    });

    // Calcoli
    this.calcFinalBtn.addEventListener("click", () =>
      this.calculateFinalPrice(),
    );
    this.calcPercentageBtn.addEventListener("click", () =>
      this.calculatePercentage(),
    );

    // Azioni risultato
    this.newCalcBtn.addEventListener("click", () => this.resetCalculator());
    this.copyBtn.addEventListener("click", () => this.copyResult());
    this.shareBtn.addEventListener("click", () => this.shareResult());

    // Input validation
    [this.basePrice, this.priceBefore, this.priceAfter].forEach((input) => {
      if (input) {
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            if (this.finalPriceMode.classList.contains("active")) {
              this.calculateFinalPrice();
            } else {
              this.calculatePercentage();
            }
          }
        });
      }
    });
  }

  initSlider() {
    this.updatePercentageFromInput(0);
  }

  updatePercentageFromSlider(value) {
    const num = parseFloat(value) || 0;
    this.percentageInput.value = this.formatNumberWithComma(num);
    this.percentageDisplay.textContent = this.formatNumberWithComma(num);
    this.sliderTrack.style.width = `${num}%`;
    this.updateSliderColor();
  }

  updatePercentageFromInput(value) {
    const num = Math.min(100, Math.max(0, value));
    this.slider.value = num;
    this.percentageDisplay.textContent = this.formatNumberWithComma(num);
    this.sliderTrack.style.width = `${num}%`;
    this.updateSliderColor();
  }

  updateSliderColor() {
    if (this.currentOperation === "subtract") {
      this.sliderTrack.style.background = "var(--discount)";
    } else {
      this.sliderTrack.style.background = "var(--increase)";
    }
  }

  switchMode(mode) {
    // Aggiorna bottoni
    this.modeBtns.forEach((btn) => {
      if (btn.dataset.mode === mode) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Mostra modalità corretta
    if (mode === "final-price") {
      this.finalPriceMode.classList.add("active");
      this.percentageMode.classList.remove("active");
    } else {
      this.finalPriceMode.classList.remove("active");
      this.percentageMode.classList.add("active");
    }

    this.resetCalculator();
  }

  switchOperation(operation) {
    this.currentOperation = operation;

    this.operationBtns.forEach((btn) => {
      if (btn.dataset.operation === operation) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    this.updateSliderColor();
  }

  async calculateFinalPrice() {
    const baseValue = this.basePrice.value.trim();
    if (!baseValue) {
      this.shakeElement(this.basePrice);
      return;
    }

    this.showLoading(this.calcFinalBtn);
    await this.sleep(300);

    const base = this.parseItalianNumber(baseValue);
    const percent = this.parseItalianNumber(this.percentageInput.value);
    const amount = base * (percent / 100);
    const final =
      this.currentOperation === "subtract" ? base - amount : base + amount;

    const operationType =
      this.currentOperation === "subtract" ? "Sconto" : "Aumento";
    const title =
      this.currentOperation === "subtract"
        ? "Prezzo scontato"
        : "Prezzo aumentato";

    const details = [
      { label: "Prezzo base", value: this.formatCurrency(base) },
      {
        label: operationType,
        value: `${this.formatNumberWithComma(percent)}%`,
      },
      { label: "Variazione", value: this.formatCurrency(amount) },
    ];

    this.showResult(title, this.formatCurrency(final), details);
    this.hideLoading(this.calcFinalBtn);
  }

  async calculatePercentage() {
    const beforeValue = this.priceBefore.value.trim();
    const afterValue = this.priceAfter.value.trim();

    if (!beforeValue || !afterValue) {
      if (!beforeValue) this.shakeElement(this.priceBefore);
      if (!afterValue) this.shakeElement(this.priceAfter);
      return;
    }

    this.showLoading(this.calcPercentageBtn);
    await this.sleep(300);

    const before = this.parseItalianNumber(beforeValue);
    const after = this.parseItalianNumber(afterValue);

    if (before === 0) {
      this.showError("Il prezzo originale non può essere zero");
      this.hideLoading(this.calcPercentageBtn);
      return;
    }

    const diff = Math.abs(before - after);
    const percent = (diff / before) * 100;
    const isDiscount = after < before;

    const title = isDiscount
      ? "Percentuale di sconto"
      : "Percentuale di aumento";
    const details = [
      { label: "Prezzo originale", value: this.formatCurrency(before) },
      { label: "Prezzo finale", value: this.formatCurrency(after) },
      { label: "Differenza", value: this.formatCurrency(diff) },
    ];

    this.showResult(title, `${this.formatNumberWithComma(percent)}%`, details);
    this.hideLoading(this.calcPercentageBtn);
  }

  formatCurrency(value) {
    return "€ " + this.formatNumberWithComma(value);
  }

  showResult(title, value, details) {
    this.resultTitle.textContent = title;
    this.resultValue.textContent = value;

    this.resultDetails.innerHTML = details
      .map(
        (d) => `
      <div class="result-detail">
        <span>${d.label}</span>
        <span class="result-detail-value">${d.value}</span>
      </div>
    `,
      )
      .join("");

    this.result.classList.add("show");
    this.isResultVisible = true;
  }

  resetCalculator() {
    this.result.classList.remove("show");
    this.isResultVisible = false;

    // Reset campi
    if (this.basePrice) this.basePrice.value = "";
    if (this.priceBefore) this.priceBefore.value = "";
    if (this.priceAfter) this.priceAfter.value = "";

    // Reset slider
    this.updatePercentageFromInput(0);
  }

  async copyResult() {
    const text = this.generateResultText();

    try {
      await navigator.clipboard.writeText(text);
      this.showToast("Copiato!", this.copyBtn);
    } catch (err) {
      this.showToast("Errore", this.copyBtn, "error");
    }
  }

  async shareResult() {
    const text = this.generateResultText();

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Risultato calcolo",
          text: text,
        });
      } catch (err) {
        this.copyResult();
      }
    } else {
      this.copyResult();
    }
  }

  generateResultText() {
    const title = this.resultTitle.textContent;
    const value = this.resultValue.textContent;
    const details = Array.from(
      this.resultDetails.querySelectorAll(".result-detail"),
    )
      .map(
        (d) =>
          `• ${d.querySelector("span:first-child").textContent}: ${d.querySelector(".result-detail-value").textContent}`,
      )
      .join("\n");

    return `📊 ${title}\n✅ ${value}\n\n${details}\n\n— Calcolato con CalcolatorePrezzi`;
  }

  // Utility
  shakeElement(element) {
    if (!element) return;
    element.style.animation = "shake 0.4s ease-in-out";
    element.addEventListener(
      "animationend",
      () => {
        element.style.animation = "";
      },
      { once: true },
    );
  }

  showLoading(button) {
    if (!button) return;
    button.classList.add("loading");
    button.disabled = true;
  }

  hideLoading(button) {
    if (!button) return;
    button.classList.remove("loading");
    button.disabled = false;
  }

  showToast(message, element, type = "success") {
    const originalHTML = element.innerHTML;
    const icon = type === "success" ? "fa-check" : "fa-exclamation";

    element.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
    element.classList.add("toast-active");

    setTimeout(() => {
      element.innerHTML = originalHTML;
      element.classList.remove("toast-active");
    }, 2000);
  }

  showError(message) {
    // Implementazione semplice - puoi personalizzare
    alert(message);
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Aggiungi animazioni CSS
const style = document.createElement("style");
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-5px); }
    40% { transform: translateX(5px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(3px); }
  }
  
  .loading {
    opacity: 0.7;
    pointer-events: none;
    position: relative;
  }
  
  .loading::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    right: var(--space-md);
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .toast-active {
    background: var(--success) !important;
    color: var(--text-inverse) !important;
    transition: all var(--transition-fast);
  }
  
  .toast-active i {
    animation: pop 0.3s ease;
  }
  
  @keyframes pop {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

document.head.appendChild(style);

// Inizializza al caricamento del DOM
document.addEventListener("DOMContentLoaded", () => {
  new Calculator();
});
