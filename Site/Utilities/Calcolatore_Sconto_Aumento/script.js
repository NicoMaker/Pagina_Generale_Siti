class Calculator {
  constructor() {
    this.initElements();
    this.bindEvents();
    this.initSlider();
    this.currentOperation = "subtract";
    this.isResultVisible = false;
    this.initDecimalInputs();
  }

  initElements() {
    this.modeBtns = document.querySelectorAll(".mode-btn");
    this.finalPriceMode = document.getElementById("final-price-mode");
    this.percentageMode = document.getElementById("percentage-mode");

    this.basePrice = document.getElementById("base-price");
    this.priceBefore = document.getElementById("price-before");
    this.priceAfter = document.getElementById("price-after");

    this.slider = document.getElementById("percentage-slider");
    this.sliderTrack = document.getElementById("slider-track");
    this.percentageDisplay = document.getElementById("percentage-display");
    this.percentageInput = document.getElementById("percentage-input");

    this.operationBtns = document.querySelectorAll(".operation-btn");

    this.calcFinalBtn = document.getElementById("calculate-final");
    this.calcPercentageBtn = document.getElementById("calculate-percentage");

    this.result = document.getElementById("result");
    this.resultTitle = document.getElementById("result-title");
    this.resultValue = document.getElementById("result-value");
    this.resultDetails = document.getElementById("result-details");
    this.newCalcBtn = document.getElementById("new-calculation");
    this.copyBtn = document.getElementById("copy-result");
    this.shareBtn = document.getElementById("share-result");
  }

  // ─── INPUT ────────────────────────────────────────────────────────────────

  initDecimalInputs() {
    const priceInputs = [this.basePrice, this.priceBefore, this.priceAfter];
    priceInputs.forEach((input) => {
      if (!input) return;
      input.addEventListener("keydown", (e) => this.handlePriceKeydown(e));
      input.addEventListener("input", (e) => this.formatPriceRealtime(e));
      input.addEventListener("blur", (e) => this.formatPriceOnBlur(e));
    });

    this.percentageInput.addEventListener("keydown", (e) =>
      this.handlePctKeydown(e),
    );
    this.percentageInput.addEventListener("input", (e) =>
      this.handlePctInput(e),
    );
    this.percentageInput.addEventListener("blur", (e) =>
      this.formatPctOnBlur(e),
    );
  }

  handlePriceKeydown(e) {
    const nav = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
      "Enter",
    ];
    if (nav.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;

    // Punto o virgola → inserisci virgola decimale (se non c'è già)
    if (e.key === "." || e.key === ",") {
      e.preventDefault();
      const input = e.target;
      const raw = input.value.replace(/\./g, "");
      if (!raw.includes(",")) {
        const s = input.selectionStart;
        const v = input.value;
        const newVal =
          v.substring(0, s) + "," + v.substring(input.selectionEnd);
        input.value = newVal;
        input.setSelectionRange(s + 1, s + 1);
        input.dispatchEvent(new Event("input"));
      }
      return;
    }

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    // Blocca più di 2 decimali (solo se cursore è nella parte decimale e non c'è selezione)
    const input = e.target;
    const commaIdx = input.value.indexOf(",");
    if (commaIdx !== -1) {
      const s = input.selectionStart;
      const afterComma = input.value.substring(commaIdx + 1).length;
      if (s > commaIdx && s === input.selectionEnd && afterComma >= 2) {
        e.preventDefault();
      }
    }
  }

  formatPriceRealtime(e) {
    const input = e.target;
    const raw = input.value;
    const cursor = input.selectionStart;

    const commaIdx = raw.indexOf(",");
    let intPart, decPart, hasComma;

    if (commaIdx !== -1) {
      hasComma = true;
      intPart = raw.substring(0, commaIdx).replace(/\./g, "");
      decPart = raw
        .substring(commaIdx + 1)
        .replace(/\D/g, "")
        .substring(0, 2);
    } else {
      hasComma = false;
      intPart = raw.replace(/\./g, "");
      decPart = "";
    }

    // Rimuovi zeri iniziali
    intPart = intPart.replace(/^0+(\d)/, "$1");

    // Aggiungi punti migliaia
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const newVal = hasComma ? intFormatted + "," + decPart : intFormatted;

    if (newVal === raw) return;

    // Aggiusta cursore: conta punti aggiunti/rimossi prima del cursore
    const dotsBefore = (raw.substring(0, cursor).match(/\./g) || []).length;
    const newCursorApprox =
      cursor - dotsBefore + (intFormatted.match(/\./g) || []).length;
    // Ricalcola più precisamente contando i punti nel nuovo valore fino alla stessa posizione raw
    const rawBefore = raw.substring(0, cursor).replace(/\./g, "");
    let newCursor = 0;
    let counted = 0;
    for (let i = 0; i < newVal.length; i++) {
      if (newVal[i] !== ".") counted++;
      if (counted >= rawBefore.length && rawBefore.length > 0) {
        newCursor = i + 1;
        break;
      }
      newCursor = i + 1;
    }
    if (rawBefore.length === 0) newCursor = 0;

    input.value = newVal;
    input.setSelectionRange(newCursor, newCursor);
  }

  formatPriceOnBlur(e) {
    const input = e.target;
    const raw = input.value.trim();
    if (raw === "") return;
    const num = this.parseItalianNumber(raw);
    input.value = isNaN(num) ? "" : this.formatNumberWithComma(num);
  }

  // ─── PERCENTUALE ──────────────────────────────────────────────────────────

  handlePctKeydown(e) {
    const nav = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
      "Enter",
    ];
    if (nav.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;

    if (e.key === "." || e.key === ",") {
      e.preventDefault();
      const input = e.target;
      if (!input.value.includes(",")) {
        const s = input.selectionStart;
        const v = input.value;
        input.value = v.substring(0, s) + "," + v.substring(input.selectionEnd);
        input.setSelectionRange(s + 1, s + 1);
        input.dispatchEvent(new Event("input"));
      }
      return;
    }

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    const input = e.target;

    // Blocca più di 2 decimali
    const commaIdx = input.value.indexOf(",");
    if (commaIdx !== -1) {
      const s = input.selectionStart;
      const afterComma = input.value.substring(commaIdx + 1).length;
      if (s > commaIdx && s === input.selectionEnd && afterComma >= 2) {
        e.preventDefault();
        return;
      }
    }

    // Simula il valore che avrebbe il campo dopo la pressione del tasto
    const s = input.selectionStart;
    const end = input.selectionEnd;
    const simulated =
      input.value.substring(0, s) + e.key + input.value.substring(end);
    const simulatedNum = this.parseItalianNumber(simulated);
    if (simulatedNum > 100) {
      e.preventDefault();
    }
  }

  handlePctInput(e) {
    const input = e.target;
    const value = this.parseItalianNumber(input.value);
    if (isNaN(value)) return;
    const clamped = Math.min(100, Math.max(0, value));

    // Se supera 100, forza il campo a "100" subito
    if (value > 100) {
      input.value = "100";
      input.setSelectionRange(3, 3);
    }

    this.slider.value = clamped;
    this.sliderTrack.style.width = `${clamped}%`;
    this.updateSliderColor();
    this.percentageDisplay.textContent = this.formatNumberWithComma(clamped);
  }

  formatPctOnBlur(e) {
    const input = e.target;
    const value = this.parseItalianNumber(input.value);
    const clamped = isNaN(value) ? 0 : Math.min(100, Math.max(0, value));
    input.value = this.formatNumberWithComma(clamped);
    this.percentageDisplay.textContent = this.formatNumberWithComma(clamped);
    this.slider.value = clamped;
    this.sliderTrack.style.width = `${clamped}%`;
    this.updateSliderColor();
  }

  // ─── SLIDER ───────────────────────────────────────────────────────────────

  bindEvents() {
    this.modeBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.switchMode(btn.dataset.mode));
    });

    this.operationBtns.forEach((btn) => {
      btn.addEventListener("click", () =>
        this.switchOperation(btn.dataset.operation),
      );
    });

    this.slider.addEventListener("input", (e) =>
      this.updatePercentageFromSlider(e.target.value),
    );

    this.calcFinalBtn.addEventListener("click", () =>
      this.calculateFinalPrice(),
    );
    this.calcPercentageBtn.addEventListener("click", () =>
      this.calculatePercentage(),
    );

    this.newCalcBtn.addEventListener("click", () => this.resetCalculator());
    this.copyBtn.addEventListener("click", () => this.copyResult());
    this.shareBtn.addEventListener("click", () => this.shareResult());

    [this.basePrice, this.priceBefore, this.priceAfter].forEach((input) => {
      if (!input) return;
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          if (this.finalPriceMode.classList.contains("active")) {
            this.calculateFinalPrice();
          } else {
            this.calculatePercentage();
          }
        }
      });
    });
  }

  initSlider() {
    this.updatePercentageFromSlider(0);
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

  // ─── MODALITÀ ─────────────────────────────────────────────────────────────

  switchMode(mode) {
    this.modeBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });
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
      btn.classList.toggle("active", btn.dataset.operation === operation);
    });
    this.updateSliderColor();
  }

  // ─── CALCOLI ──────────────────────────────────────────────────────────────

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

    if (!beforeValue) this.shakeElement(this.priceBefore);
    if (!afterValue) this.shakeElement(this.priceAfter);
    if (!beforeValue || !afterValue) return;

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

  // ─── FORMATTAZIONE ────────────────────────────────────────────────────────

  formatCurrency(value) {
    return "€ " + this.formatNumberWithComma(value);
  }

  formatNumberWithComma(num) {
    if (isNaN(num)) return "0,00";
    num = Math.round(num * 100) / 100;
    let [integer, decimal] = num.toString().split(".");
    decimal = decimal ? decimal.padEnd(2, "0").substring(0, 2) : "00";
    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${integer},${decimal}`;
  }

  parseItalianNumber(str) {
    if (!str || str.trim() === "") return 0;
    const cleaned = str.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleaned) || 0;
  }

  // ─── RISULTATO ────────────────────────────────────────────────────────────

  showResult(title, value, details) {
    this.resultTitle.textContent = title;
    this.resultValue.textContent = value;
    this.resultDetails.innerHTML = details
      .map(
        (d) => `
        <div class="result-detail">
          <span>${d.label}</span>
          <span class="result-detail-value">${d.value}</span>
        </div>`,
      )
      .join("");
    this.result.classList.add("show");
    this.isResultVisible = true;
  }

  resetCalculator() {
    this.result.classList.remove("show");
    this.isResultVisible = false;
    if (this.basePrice) this.basePrice.value = "";
    if (this.priceBefore) this.priceBefore.value = "";
    if (this.priceAfter) this.priceAfter.value = "";
    this.updatePercentageFromSlider(0);
  }

  async copyResult() {
    const text = this.generateResultText();
    try {
      await navigator.clipboard.writeText(text);
      this.showToast("Copiato!", this.copyBtn);
    } catch {
      this.showToast("Errore", this.copyBtn, "error");
    }
  }

  async shareResult() {
    const text = this.generateResultText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Risultato calcolo", text });
        return;
      } catch {}
    }
    this.copyResult();
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

  // ─── UTILITY ──────────────────────────────────────────────────────────────

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
    alert(message);
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ─── CSS animazioni ────────────────────────────────────────────────────────
const style = document.createElement("style");
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-5px); }
    40%       { transform: translateX(5px); }
    60%       { transform: translateX(-3px); }
    80%       { transform: translateX(3px); }
  }
  .loading { opacity: 0.7; pointer-events: none; position: relative; }
  .loading::after {
    content: '';
    position: absolute;
    width: 20px; height: 20px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    right: var(--space-md);
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .toast-active {
    background: var(--success) !important;
    color: var(--text-inverse) !important;
    transition: all var(--transition-fast);
  }
  .toast-active i { animation: pop 0.3s ease; }
  @keyframes pop {
    0%   { transform: scale(0); }
    50%  { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", () => {
  new Calculator();
});
