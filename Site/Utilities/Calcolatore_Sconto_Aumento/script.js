class ModernCalculator {
  constructor() {
    this.initElements();
    this.bindEvents();
    this.setupSlider();
    this.updateUI();
    this.isCalculating = false;
  }

  initElements() {
    this.modeInputs = document.querySelectorAll('input[name="mode"]');
    this.calculatorForm = document.getElementById("calculator-form");
    this.finalPriceMode = document.getElementById("final-price-mode");
    this.percentageMode = document.getElementById("percentage-mode");

    this.basePriceInput = document.getElementById("base-price");
    this.percentageInput = document.getElementById("percentage-input");
    this.percentageDisplay = document.getElementById("percentage-display");
    this.sliderWrapper = document.getElementById("slider-wrapper");
    this.sliderTrack = document.getElementById("slider-track");
    this.sliderThumb = document.getElementById("slider-thumb");
    this.calculateFinalBtn = document.getElementById("calculate-final");

    this.priceBeforeInput = document.getElementById("price-before");
    this.priceAfterInput = document.getElementById("price-after");
    this.calculatePercentageBtn = document.getElementById(
      "calculate-percentage",
    );

    this.resultContainer = document.getElementById("result-container");
    this.resultTitle = document.getElementById("result-title");
    this.resultValue = document.getElementById("result-value");
    this.resultDetails = document.getElementById("result-details");
    this.newCalculationBtn = document.getElementById("new-calculation-button");

    // Pulsanti Separati
    this.copyBtn = document.getElementById("copy-button");
    this.shareBtn = document.getElementById("share-button");

    this.sliderDragging = false;
  }

  bindEvents() {
    this.modeInputs.forEach((i) =>
      i.addEventListener("change", () => this.switchMode(i.value)),
    );
    this.percentageInput.addEventListener("input", (e) =>
      this.updatePercentageFromInput(e.target.value),
    );
    this.calculateFinalBtn.addEventListener("click", () =>
      this.calculateFinalPrice(),
    );
    this.calculatePercentageBtn.addEventListener("click", () =>
      this.calculatePercentage(),
    );
    this.newCalculationBtn.addEventListener("click", () =>
      this.newCalculation(),
    );

    // Eventi pulsanti azioni
    this.copyBtn.addEventListener("click", () => this.copyToClipboard());
    this.shareBtn.addEventListener("click", () => this.shareResult());
  }

  // LOGICA PERCENTUALE: Toglie .00 se intero, tiene decimali se presenti
  formatSmartPercentage(value) {
    const num = Number.parseFloat(value);
    if (isNaN(num)) return "0";
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  }

  // Genera il testo del messaggio per Copia/Condividi
  generateSummaryText() {
    const title = this.resultTitle.textContent.toUpperCase();
    const value = this.resultValue.textContent;
    const details = Array.from(
      this.resultDetails.querySelectorAll(".result-detail"),
    )
      .map(
        (d) =>
          `▫️ ${d.querySelector("span").textContent}: ${d.querySelector(".result-detail-value").textContent}`,
      )
      .join("\n");

    return `📊 *${title}*\n✅ RISULTATO: ${value}\n\n${details}\n\nCalcolato con Calcolatore Smart`;
  }

  // Funzione COPIA
  copyToClipboard() {
    const text = this.generateSummaryText();
    navigator.clipboard.writeText(text).then(() => {
      const originalHTML = this.copyBtn.innerHTML;
      this.copyBtn.innerHTML =
        '<i class="fas fa-check"></i> <span>Copiato!</span>';
      setTimeout(() => (this.copyBtn.innerHTML = originalHTML), 2000);
    });
  }

  // Funzione CONDIVIDI (Web Share API)
  async shareResult() {
    const text = this.generateSummaryText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Risultato Calcolo", text: text });
      } catch (err) {
        this.copyToClipboard();
      }
    } else {
      this.copyToClipboard();
    }
  }

  // --- CALCOLI ---
  async calculateFinalPrice() {
    if (this.isCalculating || !this.basePriceInput.value) return;
    this.isCalculating = true;
    this.calculateFinalBtn.classList.add("loading");
    await this.delay(400);

    const base = Number.parseFloat(this.basePriceInput.value);
    const perc = Number.parseFloat(this.percentageInput.value) || 0;
    const op = document.querySelector('input[name="operation"]:checked').value;
    const amount = base * (perc / 100);
    const final = op === "subtract" ? base - amount : base + amount;

    const details = [
      { label: "Prezzo Base", value: this.formatCurrency(base) },
      {
        label: op === "subtract" ? "Sconto" : "Aumento",
        value: `${this.formatSmartPercentage(perc)}%`,
      },
      { label: "Variazione", value: this.formatCurrency(amount) },
    ];

    this.showResult(
      op === "subtract" ? "Prezzo Scontato" : "Prezzo Aumentato",
      this.formatCurrency(final),
      details,
    );
    this.isCalculating = false;
    this.calculateFinalBtn.classList.remove("loading");
  }

  async calculatePercentage() {
    if (
      this.isCalculating ||
      !this.priceBeforeInput.value ||
      !this.priceAfterInput.value
    )
      return;
    this.isCalculating = true;
    this.calculatePercentageBtn.classList.add("loading");
    await this.delay(400);

    const before = Number.parseFloat(this.priceBeforeInput.value);
    const after = Number.parseFloat(this.priceAfterInput.value);
    const diff = Math.abs(before - after);
    const perc = (diff / before) * 100;

    const details = [
      { label: "Prezzo Iniziale", value: this.formatCurrency(before) },
      { label: "Prezzo Finale", value: this.formatCurrency(after) },
      { label: "Differenza", value: this.formatCurrency(diff) },
    ];

    this.showResult(
      after < before ? "Percentuale Sconto" : "Percentuale Aumento",
      `${this.formatSmartPercentage(perc)}%`,
      details,
    );
    this.isCalculating = false;
    this.calculatePercentageBtn.classList.remove("loading");
  }

  // --- UI UTILS ---
  updatePercentageFromInput(v) {
    let n = Math.max(0, Math.min(100, Number.parseFloat(v) || 0));
    if (document.activeElement !== this.percentageInput)
      this.percentageInput.value = n.toFixed(2);
    this.percentageDisplay.textContent = `${this.formatSmartPercentage(n)}%`;
    this.sliderThumb.style.left = `${n}%`;
    this.sliderTrack.style.width = `${n}%`;
  }

  setupSlider() {
    const getP = (x) => {
      const r = this.sliderWrapper.getBoundingClientRect();
      return Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100));
    };
    this.sliderThumb.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.sliderDragging = true;
      const move = (ev) => {
        if (this.sliderDragging)
          this.updatePercentageFromInput(getP(ev.clientX));
      };
      const up = () => {
        this.sliderDragging = false;
        document.removeEventListener("mousemove", move);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    });
    this.sliderWrapper.addEventListener("click", (e) =>
      this.updatePercentageFromInput(getP(e.clientX)),
    );
  }

  formatCurrency(n) {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(n);
  }

  showResult(title, val, details) {
    this.resultTitle.textContent = title;
    this.resultValue.textContent = val;
    this.resultDetails.innerHTML = details
      .map(
        (d) =>
          `<div class="result-detail"><span>${d.label}</span><span class="result-detail-value">${d.value}</span></div>`,
      )
      .join("");
    this.calculatorForm.classList.add("hidden");
    this.resultContainer.style.display = "flex";
    setTimeout(() => this.resultContainer.classList.add("show"), 50);
  }

  newCalculation() {
    this.resultContainer.classList.remove("show");
    setTimeout(() => {
      this.resultContainer.style.display = "none";
      this.calculatorForm.classList.remove("hidden");
      this.basePriceInput.value = "";
      this.priceBeforeInput.value = "";
      this.priceAfterInput.value = "";
      this.updatePercentageFromInput(0);
    }, 250);
  }

  switchMode(m) {
    this.newCalculation();
    if (m === "final-price") {
      this.finalPriceMode.classList.add("active");
      this.percentageMode.classList.remove("active");
    } else {
      this.finalPriceMode.classList.remove("active");
      this.percentageMode.classList.add("active");
    }
  }

  updateUI() {
    const isInc = document.getElementById("op-add").checked;
    this.sliderTrack.style.background = isInc
      ? "var(--increase)"
      : "var(--discount)";
    this.sliderThumb.style.borderColor = isInc
      ? "var(--increase)"
      : "var(--discount)";
  }

  delay = (ms) => new Promise((res) => setTimeout(res, ms));
}

document.addEventListener("DOMContentLoaded", () => new ModernCalculator());
