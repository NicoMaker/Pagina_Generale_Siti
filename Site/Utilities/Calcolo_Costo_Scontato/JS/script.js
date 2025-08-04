document.addEventListener("DOMContentLoaded", () => {
  const originalPriceInput = document.getElementById("originalPrice");
  const discountPercentageSlider = document.getElementById(
    "discountPercentageSlider",
  );
  const discountPercentageInput = document.getElementById("discountPercentage");
  const calculateBtn = document.getElementById("calculateBtn");
  const resultDiv = document.getElementById("result");
  const priceError = document.getElementById("priceError");
  const discountError = document.getElementById("discountError");
  const percentageDisplay = document.getElementById("percentageDisplay");
  const livePreview = document.getElementById("livePreview");
  const previewText = document.getElementById("previewText");
  const finalPrice = document.getElementById("finalPrice");
  const originalPriceDisplay = document.getElementById("originalPriceDisplay");
  const discountAmountDisplay = document.getElementById(
    "discountAmountDisplay",
  );

  // New elements for percentage calculation
  const priceBeforeDiscountInput = document.getElementById("priceBeforeDiscount");
  const priceAfterDiscountInput = document.getElementById("priceAfterDiscount");
  const calculatePercentageBtn = document.getElementById("calculatePercentageBtn");
  const priceBeforeDiscountError = document.getElementById("priceBeforeDiscountError");
  const priceAfterDiscountError = document.getElementById("priceAfterDiscountError");
  const percentageResultDiv = document.getElementById("percentageResult");
  const calculatedPercentageDisplay = document.getElementById("calculatedPercentage");
  const initialPricePercentageDisplay = document.getElementById("initialPricePercentageDisplay");
  const discountedPricePercentageDisplay = document.getElementById("discountedPricePercentageDisplay");


  // Mode Selector elements
  const calculationModeSelector = document.getElementById("calculationMode");
  const calculateFinalPriceSection = document.getElementById("calculateFinalPriceSection");
  const calculatePercentageSection = document.getElementById("calculatePercentageSection");


  // Function to switch calculation mode
  function switchCalculationMode() {
    const selectedMode = calculationModeSelector.value;

    if (selectedMode === "calculateFinalPrice") {
      calculateFinalPriceSection.classList.remove("hidden");
      calculatePercentageSection.classList.add("hidden");
      // Optionally clear or reset percentage calculation inputs when switching away
      priceBeforeDiscountInput.value = "";
      priceAfterDiscountInput.value = "";
      percentageResultDiv.classList.add("hidden");
      priceBeforeDiscountError.classList.add("hidden");
      priceAfterDiscountError.classList.add("hidden");
    } else {
      calculateFinalPriceSection.classList.add("hidden");
      calculatePercentageSection.classList.remove("hidden");
      // Optionally clear or reset final price calculation inputs when switching away
      originalPriceInput.value = "";
      discountPercentageInput.value = "0";
      discountPercentageSlider.value = "0";
      updatePercentageDisplay(0);
      livePreview.classList.add("hidden");
      resultDiv.classList.add("hidden");
      priceError.classList.add("hidden");
      discountError.classList.add("hidden");
    }
  }

  // Event listener for mode selector
  calculationModeSelector.addEventListener("change", switchCalculationMode);


  // Update percentage display
  function updatePercentageDisplay(value) {
    percentageDisplay.textContent = `${value}%`;
    percentageDisplay.style.background = `linear-gradient(135deg, hsl(${240 + value * 1.2}, 70%, 60%), hsl(${280 + value * 0.8}, 60%, 55%))`;
    percentageDisplay.style.webkitBackgroundClip = "text";
    percentageDisplay.style.webkitTextFillColor = "transparent";
  }

  // Live preview function
  function updateLivePreview() {
    const price = parseFloat(originalPriceInput.value);
    const discount = parseFloat(discountPercentageInput.value);

    if (
      !isNaN(price) &&
      price > 0 &&
      !isNaN(discount) &&
      discount >= 0 &&
      discount <= 100
    ) {
      const discountedPrice = price - price * (discount / 100);
      previewText.textContent = `€${discountedPrice.toFixed(2)}`;
      livePreview.classList.remove("hidden");
    } else {
      livePreview.classList.add("hidden");
    }
  }

  // Sync slider with input
  discountPercentageSlider.addEventListener("input", () => {
    const value = discountPercentageSlider.value;
    discountPercentageInput.value = value;
    updatePercentageDisplay(value);
    updateLivePreview();
  });

  // Sync input with slider
  discountPercentageInput.addEventListener("input", () => {
    let value = parseFloat(discountPercentageInput.value);
    if (isNaN(value) || value < 0) value = 0;
    if (value > 100) value = 100;
    discountPercentageSlider.value = value;
    updatePercentageDisplay(value);
    updateLivePreview();
  });

  // Update live preview on price change
  originalPriceInput.addEventListener("input", updateLivePreview);

  // Calculate button functionality (for final price)
  calculateBtn.addEventListener("click", () => {
    // Hide errors and results
    priceError.classList.add("hidden");
    discountError.classList.add("hidden");
    resultDiv.classList.add("hidden");

    const originalPrice = parseFloat(originalPriceInput.value);
    const discountPercentage = parseFloat(discountPercentageInput.value);

    let isValid = true;

    // Validation
    if (isNaN(originalPrice) || originalPrice <= 0) {
      priceError.classList.remove("hidden");
      originalPriceInput.classList.add("border-red-500");
      isValid = false;
    } else {
      originalPriceInput.classList.remove("border-red-500");
    }

    if (
      isNaN(discountPercentage) ||
      discountPercentage < 0 ||
      discountPercentage > 100
    ) {
      discountError.classList.remove("hidden");
      discountPercentageInput.classList.add("border-red-500");
      isValid = false;
    } else {
      discountPercentageInput.classList.remove("border-red-500");
    }

    if (isValid) {
      const discountAmount = originalPrice * (discountPercentage / 100);
      const discountedPrice = originalPrice - discountAmount;

      // Update result displays
      finalPrice.textContent = `€${discountedPrice.toFixed(2)}`;
      originalPriceDisplay.textContent = `€${originalPrice.toFixed(2)}`;
      discountAmountDisplay.textContent = `-€${discountAmount.toFixed(2)}`;

      // Show result with animation
      resultDiv.classList.remove("hidden");

      // Add success animation to button
      calculateBtn.innerHTML = `
                        <span class="flex items-center justify-center">
                            <svg class="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Calcolato!
                        </span>
                    `;

      setTimeout(() => {
        calculateBtn.innerHTML = `
                            <span class="flex items-center justify-center">
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                </svg>
                                Calcola Sconto
                            </span>
                        `;
      }, 2000);
    }
  });

  // Calculate Percentage Button functionality
  calculatePercentageBtn.addEventListener("click", () => {
    // Hide errors and results for percentage calculation
    priceBeforeDiscountError.classList.add("hidden");
    priceAfterDiscountError.classList.add("hidden");
    percentageResultDiv.classList.add("hidden");

    const priceBefore = parseFloat(priceBeforeDiscountInput.value);
    const priceAfter = parseFloat(priceAfterDiscountInput.value);

    let isValid = true;

    // Validation
    if (isNaN(priceBefore) || priceBefore <= 0) {
      priceBeforeDiscountError.classList.remove("hidden");
      priceBeforeDiscountInput.classList.add("border-red-500");
      isValid = false;
    } else {
      priceBeforeDiscountInput.classList.remove("border-red-500");
    }

    if (isNaN(priceAfter) || priceAfter < 0 || priceAfter > priceBefore) { // Changed priceAfter >= priceBefore to priceAfter > priceBefore
      priceAfterDiscountError.classList.remove("hidden");
      priceAfterDiscountInput.classList.add("border-red-500");
      isValid = false;
    } else {
      priceAfterDiscountInput.classList.remove("border-red-500");
    }

    if (isValid) {
      const discountAmount = priceBefore - priceAfter;
      const discountPercentage = (discountAmount / priceBefore) * 100;

      calculatedPercentageDisplay.textContent = `${discountPercentage.toFixed(2)}%`;
      initialPricePercentageDisplay.textContent = `€${priceBefore.toFixed(2)}`;
      discountedPricePercentageDisplay.textContent = `€${priceAfter.toFixed(2)}`;

      percentageResultDiv.classList.remove("hidden");

      // Add success animation to button
      calculatePercentageBtn.innerHTML = `
                        <span class="flex items-center justify-center">
                            <svg class="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Calcolato!
                        </span>
                    `;

      setTimeout(() => {
        calculatePercentageBtn.innerHTML = `
                            <span class="flex items-center justify-center">
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7.071 7.071c.391.391.391 1.023 0 1.414l-4.071 4.071c-.391.391-1.023.391-1.414 0L3.586 12.586A2 2 0 013 11.172V7a2 2 0 012-2h2zm0 0v-2a2 2 0 012-2h2m-2 16h2a2 2 0 002-2v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z"></path>
                                </svg>
                                Calcola Percentuale
                            </span>
                        `;
      }, 2000);
    }
  });

  // Optional: Clear percentage result when inputs change
  priceBeforeDiscountInput.addEventListener("input", () => {
    percentageResultDiv.classList.add("hidden");
    priceBeforeDiscountInput.classList.remove("border-red-500");
  });
  priceAfterDiscountInput.addEventListener("input", () => {
    percentageResultDiv.classList.add("hidden");
    priceAfterDiscountInput.classList.remove("border-red-500");
  });

  // Initialize
  updatePercentageDisplay(0);
  switchCalculationMode(); // Set initial visibility

  // Add keyboard support
  document.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const selectedMode = calculationModeSelector.value;
      if (selectedMode === "calculateFinalPrice") {
        if (document.activeElement === originalPriceInput || document.activeElement === discountPercentageInput) {
          calculateBtn.click();
        }
      } else { // calculatePercentage
        if (document.activeElement === priceBeforeDiscountInput || document.activeElement === priceAfterDiscountInput) {
          calculatePercentageBtn.click();
        }
      }
    }
  });
});