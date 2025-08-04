// Modern Discount Calculator JavaScript
class DiscountCalculator {
  updateDiscountFromInput(value) {
    let numValue = parseFloat(value);
    if (isNaN(numValue)) {
      numValue = 0;
    }
    numValue = Math.min(Math.max(numValue, 0), 100);

    const formattedValue = numValue.toFixed(2);

    // Update slider position
    this.elements.sliderFill.style.width = `${formattedValue}%`;
    this.elements.sliderThumb.style.left = `${formattedValue}%`;
    this.elements.thumbValue.textContent = `${formattedValue}%`;
    this.elements.percentageDisplay.textContent = `${formattedValue}%`;

    // ✅ Solo se l'input non è attivo (cioè l'utente non ci sta scrivendo)
    if (document.activeElement !== this.elements.discountInput) {
      this.elements.discountInput.value = formattedValue;
    }

    this.updateLivePreview();
  }

  constructor() {
    this.init();
    this.bindEvents();
    this.setupSlider();
  }

  init() {
    // Cache DOM elements
    this.elements = {
      // Mode selector
      modeRadios: document.querySelectorAll('input[name="calculation-mode"]'),
      finalPriceMode: document.getElementById("final-price-mode"),
      percentageMode: document.getElementById("percentage-mode"),

      // Final price mode elements
      originalPriceInput: document.getElementById("original-price"),
      discountSlider: document.getElementById("discount-slider"), // This ID is not directly used for the slider element, but for context
      discountInput: document.getElementById("discount-input"),
      percentageDisplay: document.getElementById("percentage-display"),
      sliderFill: document.getElementById("slider-fill"),
      sliderThumb: document.getElementById("slider-thumb"),
      thumbValue: document.getElementById("thumb-value"),
      sliderTrack: document.querySelector(".slider-track"),
      livePreview: document.getElementById("live-preview"),
      previewPrice: document.getElementById("preview-price"),
      previewSavings: document.getElementById("preview-savings"),
      calculateFinalBtn: document.getElementById("calculate-final-btn"),
      priceError: document.getElementById("price-error"),

      // Percentage mode elements
      priceBeforeInput: document.getElementById("price-before"),
      priceAfterInput: document.getElementById("price-after"),
      calculatePercentageBtn: document.getElementById(
        "calculate-percentage-btn",
      ),
      priceBeforeError: document.getElementById("price-before-error"),
      priceAfterError: document.getElementById("price-after-error"),

      // Result elements
      resultContainer: document.getElementById("result-container"),
      resultTitle: document.getElementById("result-title"),
      mainResult: document.getElementById("main-result"),
      resultDetails: document.getElementById("result-details"),
      resetBtn: document.getElementById("reset-btn"),
      shareBtn: document.getElementById("share-btn"),
    };

    // Set initial state
    this.currentMode = "final";
    this.isCalculating = false;
    this.sliderDragging = false;
  }

  bindEvents() {
    // Mode selector events
    this.elements.modeRadios.forEach((radio) => {
      radio.addEventListener("change", () => this.switchMode(radio.value));
    });

    // Final price mode events
    this.elements.originalPriceInput.addEventListener("input", () =>
      this.updateLivePreview(),
    );
    this.elements.originalPriceInput.addEventListener("blur", () =>
      this.validatePrice(
        this.elements.originalPriceInput,
        this.elements.priceError,
      ),
    );

    // Corrected update for discount input to also update slider
    this.elements.discountInput.addEventListener("input", (e) =>
      this.updateDiscountFromInput(e.target.value),
    );
    this.elements.discountInput.addEventListener("blur", () =>
      this.validateDiscount(),
    );

    this.elements.calculateFinalBtn.addEventListener("click", () =>
      this.calculateFinalPrice(),
    );

    // Percentage mode events
    this.elements.priceBeforeInput.addEventListener("input", () =>
      this.validatePriceBefore(),
    );
    this.elements.priceAfterInput.addEventListener("input", () =>
      this.validatePriceAfter(),
    );
    this.elements.calculatePercentageBtn.addEventListener("click", () =>
      this.calculatePercentage(),
    );

    // Result events
    this.elements.resetBtn.addEventListener("click", () =>
      this.resetCalculator(),
    );
    this.elements.shareBtn.addEventListener("click", () => this.shareResult());

    // Keyboard events
    document.addEventListener("keydown", (e) =>
      this.handleKeyboardShortcuts(e),
    );

    // Prevent form submission on Enter
    document.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (this.currentMode === "final") {
          this.calculateFinalPrice();
        } else {
          this.calculatePercentage();
        }
      }
    });
  }

  setupSlider() {
    let isDragging = false;
    let startX = 0;
    let startValue = 0; // Not strictly needed for continuous slider, but useful for discrete steps

    const updateSliderPosition = (value) => {
      // Ensure value is within 0-100 range and formatted to 2 decimal places for percentage display
      const percentage = Math.min(Math.max(parseFloat(value) || 0, 0), 100);
      const displayPercentage = percentage.toFixed(2); // Display with two decimal places

      this.elements.sliderFill.style.width = `${percentage}%`;
      this.elements.sliderThumb.style.left = `${percentage}%`;
      this.elements.thumbValue.textContent = `${displayPercentage}%`;
      this.elements.percentageDisplay.textContent = `${displayPercentage}%`;
      this.elements.discountInput.value = percentage.toFixed(2); // Keep input value also formatted

      this.updateLivePreview();
    };

    const getValueFromPosition = (clientX) => {
      const rect = this.elements.sliderTrack.getBoundingClientRect();
      // Calculate percentage based on click position relative to track width
      const percentage = Math.min(
        Math.max(((clientX - rect.left) / rect.width) * 100, 0),
        100,
      );
      return percentage;
    };

    // Mouse events
    this.elements.sliderThumb.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.clientX;
      startValue = parseFloat(this.elements.discountInput.value) || 0;
      this.elements.sliderThumb.classList.add("active");
      document.body.style.userSelect = "none"; // Prevent text selection during drag
      e.preventDefault(); // Prevent default browser drag behavior
    });

    this.elements.sliderTrack.addEventListener("mousedown", (e) => {
      // Only handle if click is not on the thumb itself
      if (e.target !== this.elements.sliderThumb) {
        isDragging = true; // Start dragging immediately
        const value = getValueFromPosition(e.clientX);
        updateSliderPosition(value);
        this.elements.sliderThumb.classList.add("active"); // Add active class immediately for direct click
        document.body.style.userSelect = "none";
        e.preventDefault();
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        const value = getValueFromPosition(e.clientX);
        updateSliderPosition(value);
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        this.elements.sliderThumb.classList.remove("active");
        document.body.style.userSelect = ""; // Re-enable text selection
      }
    });

    // Touch events
    this.elements.sliderThumb.addEventListener(
      "touchstart",
      (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
        startValue = parseFloat(this.elements.discountInput.value) || 0;
        this.elements.sliderThumb.classList.add("active");
        e.preventDefault(); // Prevent scrolling
      },
      { passive: false },
    ); // Use passive: false to allow preventDefault

    this.elements.sliderTrack.addEventListener(
      "touchstart",
      (e) => {
        if (e.target !== this.elements.sliderThumb) {
          isDragging = true;
          const value = getValueFromPosition(e.touches[0].clientX);
          updateSliderPosition(value);
          this.elements.sliderThumb.classList.add("active");
          e.preventDefault();
        }
      },
      { passive: false },
    );

    document.addEventListener(
      "touchmove",
      (e) => {
        if (isDragging) {
          const value = getValueFromPosition(e.touches[0].clientX);
          updateSliderPosition(value);
          e.preventDefault();
        }
      },
      { passive: false },
    );

    document.addEventListener("touchend", () => {
      if (isDragging) {
        isDragging = false;
        this.elements.sliderThumb.classList.remove("active");
      }
    });

    // Initialize slider to 0%
    updateSliderPosition(0);
  }

  switchMode(mode) {
    this.currentMode = mode;

    // Hide results when switching modes
    this.hideResults();
    this.clearErrors();
    this.resetFormFields();

    // Ensure only the selected mode is active and visible
    if (mode === "final") {
      this.elements.finalPriceMode.classList.add("active");
      this.elements.percentageMode.classList.remove("active");
    } else {
      this.elements.percentageMode.classList.add("active");
      this.elements.finalPriceMode.classList.remove("active");
    }
  }

  updateLivePreview() {
    const originalPrice = parseFloat(this.elements.originalPriceInput.value);
    const discountPercentage = parseFloat(this.elements.discountInput.value);

    // Check for valid numbers and positive price
    if (
      !isNaN(originalPrice) &&
      originalPrice > 0 &&
      !isNaN(discountPercentage)
    ) {
      const discountAmount = originalPrice * (discountPercentage / 100);
      const finalPrice = originalPrice - discountAmount;

      this.elements.previewPrice.textContent = this.formatCurrency(finalPrice);
      this.elements.previewSavings.innerHTML = `Risparmi: <strong>${this.formatCurrency(discountAmount)}</strong>`;
      this.elements.livePreview.classList.add("show");
    } else {
      this.elements.livePreview.classList.remove("show");
    }
  }

  validatePrice(input, errorElement) {
    const value = parseFloat(input.value);
    const isValid = !isNaN(value) && value > 0;

    if (input.value.trim() === "") {
      // Allow empty input on blur if not calculating
      this.hideError(errorElement);
      input.classList.remove("error");
      return true;
    } else if (!isValid) {
      this.showError(
        errorElement,
        "Inserisci un prezzo valido e maggiore di zero.",
      );
      input.classList.add("error");
      return false;
    } else {
      this.hideError(errorElement);
      input.classList.remove("error");
      return true;
    }
  }

  validateDiscount() {
    const value = parseFloat(this.elements.discountInput.value);
    const isValid = !isNaN(value) && value >= 0 && value <= 100;

    if (!isValid) {
      // If invalid, revert to a valid number or 0 if completely unparseable
      const clampedValue = Math.min(Math.max(value || 0, 0), 100);
      this.elements.discountInput.value = clampedValue.toFixed(2);
      this.updateDiscountFromInput(this.elements.discountInput.value); // Re-sync slider
      return false; // Still return false as the original input was invalid
    }

    return isValid;
  }

  validatePriceBefore() {
    return this.validatePrice(
      this.elements.priceBeforeInput,
      this.elements.priceBeforeError,
    );
  }

  validatePriceAfter() {
    const priceBefore = parseFloat(this.elements.priceBeforeInput.value);
    const priceAfter = parseFloat(this.elements.priceAfterInput.value);

    if (this.elements.priceAfterInput.value.trim() === "") {
      this.hideError(this.elements.priceAfterError);
      this.elements.priceAfterInput.classList.remove("error");
      return true;
    }

    const isValidPriceAfter = !isNaN(priceAfter) && priceAfter >= 0;

    if (!isValidPriceAfter) {
      this.showError(
        this.elements.priceAfterError,
        "Inserisci un prezzo valido.",
      );
      this.elements.priceAfterInput.classList.add("error");
      return false;
    }

    if (!isNaN(priceBefore) && priceBefore > 0 && priceAfter >= priceBefore) {
      this.showError(
        this.elements.priceAfterError,
        "Il prezzo scontato deve essere inferiore al prezzo originale.",
      );
      this.elements.priceAfterInput.classList.add("error");
      return false;
    }

    this.hideError(this.elements.priceAfterError);
    this.elements.priceAfterInput.classList.remove("error");
    return true;
  }

  async calculateFinalPrice() {
    if (this.isCalculating) return;

    // Ensure validation happens on click
    const isPriceValid = this.validatePrice(
      this.elements.originalPriceInput,
      this.elements.priceError,
    );
    const isDiscountValid = this.validateDiscount(); // Ensure discount is also valid

    if (!isPriceValid || !isDiscountValid) {
      if (!isPriceValid) this.shakeElement(this.elements.originalPriceInput);
      return;
    }

    this.isCalculating = true;
    this.elements.calculateFinalBtn.classList.add("loading");

    // Simulate calculation delay for better UX
    await this.delay(800);

    const originalPrice = parseFloat(this.elements.originalPriceInput.value);
    const discountPercentage = parseFloat(this.elements.discountInput.value); // Use the formatted value

    const discountAmount = originalPrice * (discountPercentage / 100);
    const finalPrice = originalPrice - discountAmount;

    this.showResult({
      title: "Prezzo Finale",
      mainValue: this.formatCurrency(finalPrice),
      details: [
        {
          label: "Prezzo Originale",
          value: this.formatCurrency(originalPrice),
        },
        { label: "Sconto", value: `${discountPercentage.toFixed(2)}%` }, // Display with 2 decimal places
        {
          label: "Importo Risparmiato",
          value: this.formatCurrency(discountAmount),
        },
      ],
    });

    this.isCalculating = false;
    this.elements.calculateFinalBtn.classList.remove("loading");
  }

  async calculatePercentage() {
    if (this.isCalculating) return;

    // Validate inputs
    const isPriceBeforeValid = this.validatePriceBefore();
    const isPriceAfterValid = this.validatePriceAfter();

    if (!isPriceBeforeValid || !isPriceAfterValid) {
      if (!isPriceBeforeValid)
        this.shakeElement(this.elements.priceBeforeInput);
      if (!isPriceAfterValid) this.shakeElement(this.elements.priceAfterInput);
      return;
    }

    const priceBefore = parseFloat(this.elements.priceBeforeInput.value);
    const priceAfter = parseFloat(this.elements.priceAfterInput.value);

    // Additional check for priceAfter >= priceBefore specifically for percentage calculation
    if (priceAfter >= priceBefore) {
      this.showError(
        this.elements.priceAfterError,
        "Il prezzo scontato deve essere inferiore al prezzo originale.",
      );
      this.elements.priceAfterInput.classList.add("error");
      this.shakeElement(this.elements.priceAfterInput);
      return;
    }

    this.isCalculating = true;
    this.elements.calculatePercentageBtn.classList.add("loading");

    // Simulate calculation delay for better UX
    await this.delay(800);

    const discountAmount = priceBefore - priceAfter;
    const discountPercentage = (discountAmount / priceBefore) * 100;

    this.showResult({
      title: "Percentuale di Sconto",
      mainValue: `${discountPercentage.toFixed(2)}%`, // Display with 2 decimal places
      details: [
        { label: "Prezzo Originale", value: this.formatCurrency(priceBefore) },
        { label: "Prezzo Scontato", value: this.formatCurrency(priceAfter) },
        {
          label: "Importo Risparmiato",
          value: this.formatCurrency(discountAmount),
        },
      ],
    });

    this.isCalculating = false;
    this.elements.calculatePercentageBtn.classList.remove("loading");
  }

  showResult(data) {
    this.elements.resultTitle.textContent = data.title;
    this.elements.mainResult.textContent = data.mainValue;

    this.elements.resultDetails.innerHTML = ""; // Clear previous details
    data.details.forEach((detail) => {
      const row = document.createElement("div");
      row.classList.add("detail-row");
      row.innerHTML = `<span>${detail.label}</span><span class="detail-value">${detail.value}</span>`;
      this.elements.resultDetails.appendChild(row);
    });

    this.elements.resultContainer.classList.add("show");
    this.elements.finalPriceMode.style.display = "none"; // Hide current mode
    this.elements.percentageMode.style.display = "none"; // Hide other mode (ensure both are hidden)
  }

  hideResults() {
    this.elements.resultContainer.classList.remove("show");
    // The visibility of the modes is now handled by switchMode or init
    // No need to explicitly set display: 'block' here.
    // The 'active' class handled by CSS will control display.
  }

  resetFormFields() {
    // Reset final price mode inputs
    this.elements.originalPriceInput.value = "";
    this.elements.discountInput.value = "0.00"; // Reset to 0 with 2 decimal places
    this.updateDiscountFromInput(0); // Reset slider and preview to 0%
    this.elements.livePreview.classList.remove("show");

    // Reset percentage mode inputs
    this.elements.priceBeforeInput.value = "";
    this.elements.priceAfterInput.value = "";
  }

  resetCalculator() {
    this.resetFormFields();
    this.clearErrors();
    this.hideResults();
    // After reset, ensure the current mode is visible.
    // This is implicitly handled by `switchMode` when a mode is initially selected
    // or if `resetCalculator` is called, it just cleans up.
    // We need to ensure the correct mode is displayed after reset if not triggered by switchMode.
    // A simple way is to re-trigger the display based on currentMode.
    if (this.currentMode === "final") {
      this.elements.finalPriceMode.classList.add("active");
      this.elements.percentageMode.classList.remove("active");
    } else {
      this.elements.percentageMode.classList.add("active");
      this.elements.finalPriceMode.classList.remove("active");
    }
  }

  shareResult() {
    const resultTitle = this.elements.resultTitle.textContent;
    const mainResult = this.elements.mainResult.textContent;

    let detailsText = "";
    Array.from(this.elements.resultDetails.children).forEach((row) => {
      const label = row.querySelector("span:first-child").textContent;
      const value = row.querySelector(".detail-value").textContent;
      detailsText += `${label}: ${value}\n`;
    });

    const fullText = `Ho calcolato un risultato fantastico con il Calcolatore Sconto Moderno! 🎉\n\n${resultTitle}: ${mainResult}\n\nDettagli:\n${detailsText}\nProva anche tu: ${window.location.href}`;

    if (navigator.share) {
      navigator
        .share({
          title: "Calcolatore Sconto Moderno",
          text: fullText,
          url: window.location.href,
        })
        .then(() => console.log("Content shared successfully"))
        .catch((error) => console.error("Error sharing", error));
    } else {
      // Fallback for browsers that do not support the Web Share API
      // Use a simpler alert and copy to clipboard if supported
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(fullText)
          .then(() =>
            alert(
              "Risultato copiato negli appunti! Puoi incollarlo dove vuoi.",
            ),
          )
          .catch((err) => console.error("Could not copy text: ", err));
      } else {
        alert(
          "La funzione di condivisione non è supportata dal tuo browser. Puoi copiare il testo manualmente:\n\n" +
            fullText,
        );
      }
      console.log("Web Share API not supported.");
    }
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  }

  delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  showError(element, message = "") {
    element.textContent = message; // Set custom error message
    element.classList.add("show");
  }

  hideError(element) {
    element.classList.remove("show");
    element.textContent = ""; // Clear message when hiding
  }

  clearErrors() {
    // Get all error messages elements and hide them
    document
      .querySelectorAll(".error-message")
      .forEach((errorEl) => this.hideError(errorEl));
    // Remove error class from all input fields
    document
      .querySelectorAll('input[type="number"]')
      .forEach((inputEl) => inputEl.classList.remove("error"));
  }

  shakeElement(element) {
    element.classList.add("shake");
    element.addEventListener(
      "animationend",
      () => {
        element.classList.remove("shake");
      },
      { once: true },
    );
  }

  handleKeyboardShortcuts(e) {
    // Ctrl+R or Cmd+R to reset
    if ((e.ctrlKey || e.metaKey) && e.key === "r") {
      e.preventDefault();
      this.resetCalculator();
    }
    // Ctrl+S or Cmd+S to share
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      this.shareResult();
    }
  }

  updateDiscountFromInput(value) {
    let numValue = parseFloat(value);

    // Non bloccare l'inserimento: lascia scrivere liberamente
    const isValid = !isNaN(numValue) && numValue >= 0 && numValue <= 100;

    if (isValid) {
      const formattedValue = numValue.toFixed(2);

      this.elements.sliderFill.style.width = `${formattedValue}%`;
      this.elements.sliderThumb.style.left = `${formattedValue}%`;
      this.elements.thumbValue.textContent = `${formattedValue}%`;
      this.elements.percentageDisplay.textContent = `${formattedValue}%`;

      if (document.activeElement !== this.elements.discountInput) {
        this.elements.discountInput.value = formattedValue;
      }

      this.updateLivePreview();
    } else {
      // Se non valido, nascondi l'anteprima
      this.elements.livePreview.classList.remove("show");
    }
  }
}

// Initialize the calculator when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  new DiscountCalculator();
});
