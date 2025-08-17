class ModernCalculator {
  constructor() {
    this.initElements()
    this.bindEvents()
    this.setupSlider()
    this.updateUI()
    this.isCalculating = false
    this.percentageFieldCleared = false
  }

  initElements() {
    // Mode elements
    this.modeInputs = document.querySelectorAll('input[name="mode"]')
    this.calculatorForm = document.getElementById("calculator-form")
    this.finalPriceMode = document.getElementById("final-price-mode")
    this.percentageMode = document.getElementById("percentage-mode")

    // Final price mode elements
    this.basePriceInput = document.getElementById("base-price")
    this.basePriceError = document.getElementById("base-price-error")
    this.operationInputs = document.querySelectorAll('input[name="operation"]')
    this.percentageInput = document.getElementById("percentage-input")
    this.percentageDisplay = document.getElementById("percentage-display")
    this.sliderWrapper = document.getElementById("slider-wrapper")
    this.sliderTrack = document.getElementById("slider-track")
    this.sliderThumb = document.getElementById("slider-thumb")
    this.calculateFinalBtn = document.getElementById("calculate-final")

    // Percentage mode elements
    this.priceBeforeInput = document.getElementById("price-before")
    this.priceBeforeError = document.getElementById("price-before-error")
    this.priceAfterInput = document.getElementById("price-after")
    this.priceAfterError = document.getElementById("price-after-error")
    this.calculatePercentageBtn = document.getElementById("calculate-percentage")

    // Result elements
    this.resultContainer = document.getElementById("result-container")
    this.resultTitle = document.getElementById("result-title")
    this.resultValue = document.getElementById("result-value")
    this.resultDetails = document.getElementById("result-details")
    this.newCalculationBtn = document.getElementById("new-calculation-button")
    this.shareBtn = document.getElementById("share-button")

    this.sliderDragging = false
  }

  bindEvents() {
    // Mode switching
    this.modeInputs.forEach((input) => {
      input.addEventListener("change", () => this.switchMode(input.value))
    })

    // Final price mode events
    this.basePriceInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.calculateFinalPrice()
    })

    this.operationInputs.forEach((input) => {
      input.addEventListener("change", () => this.updateUI())
    })

    // Eventi migliorati per il campo percentuale
    this.percentageInput.addEventListener("focus", (e) => {
      if (e.target.value === "0.00" || e.target.value === "0") {
        e.target.select()
        this.percentageFieldCleared = false
      }
    })

    this.percentageInput.addEventListener("keydown", (e) => {
      if (!this.percentageFieldCleared && (e.target.value === "0.00" || e.target.value === "0")) {
        if (e.key >= "0" && e.key <= "9") {
          e.target.value = ""
          this.percentageFieldCleared = true
        }
      }
    })

    this.percentageInput.addEventListener("input", (e) => {
      this.updatePercentageFromInput(e.target.value)
    })

    this.percentageInput.addEventListener("blur", (e) => {
      const value = Number.parseFloat(e.target.value)
      if (isNaN(value) || e.target.value === "") {
        e.target.value = "0.00"
        this.percentageFieldCleared = false
      } else {
        e.target.value = value.toFixed(2)
      }
      this.updatePercentageFromInput(e.target.value)
    })

    this.percentageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.calculateFinalPrice()
    })

    this.calculateFinalBtn.addEventListener("click", () => this.calculateFinalPrice())

    // Percentage mode events
    this.priceBeforeInput.addEventListener("input", () => this.validatePriceBefore())
    this.priceBeforeInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.calculatePercentage()
    })

    this.priceAfterInput.addEventListener("input", () => this.validatePriceAfter())
    this.priceAfterInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.calculatePercentage()
    })

    this.calculatePercentageBtn.addEventListener("click", () => this.calculatePercentage())

    // Result events
    this.newCalculationBtn.addEventListener("click", () => this.newCalculation())
    this.shareBtn.addEventListener("click", () => this.share())
  }

  setupSlider() {
    const updateSliderPosition = (percentage) => {
      this.sliderThumb.style.left = `${percentage}%`
      this.sliderTrack.style.width = `${percentage}%`
    }

    const getPercentageFromPosition = (clientX) => {
      const rect = this.sliderWrapper.getBoundingClientRect()
      const percentage = ((clientX - rect.left) / rect.width) * 100
      return Math.max(0, Math.min(100, percentage))
    }

    const onMouseMove = (e) => {
      if (!this.sliderDragging) return
      const percentage = getPercentageFromPosition(e.clientX)
      this.updatePercentageFromInput(percentage)
    }

    const onMouseUp = () => {
      this.sliderDragging = false
      this.sliderThumb.classList.remove("active")
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    this.sliderThumb.addEventListener("mousedown", (e) => {
      e.preventDefault()
      this.sliderDragging = true
      this.sliderThumb.classList.add("active")
      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    })

    this.sliderWrapper.addEventListener("click", (e) => {
      if (!this.sliderDragging) {
        const percentage = getPercentageFromPosition(e.clientX)
        this.updatePercentageFromInput(percentage)
      }
    })

    // Touch events for mobile
    this.sliderThumb.addEventListener("touchstart", (e) => {
      e.preventDefault()
      this.sliderDragging = true
      this.sliderThumb.classList.add("active")
    })

    document.addEventListener("touchmove", (e) => {
      if (!this.sliderDragging) return
      e.preventDefault()
      const touch = e.touches[0]
      const percentage = getPercentageFromPosition(touch.clientX)
      this.updatePercentageFromInput(percentage)
    })

    document.addEventListener("touchend", () => {
      if (this.sliderDragging) {
        this.sliderDragging = false
        this.sliderThumb.classList.remove("active")
      }
    })

    updateSliderPosition(0)
    this.updatePercentageFromInput(0)
  }

  switchMode(mode) {
    this.hideResult()
    this.clearErrors()

    if (mode === "final-price") {
      this.finalPriceMode.classList.add("active")
      this.percentageMode.classList.remove("active")
    } else {
      this.finalPriceMode.classList.remove("active")
      this.percentageMode.classList.add("active")
    }
  }

  updatePercentageFromInput(value) {
    let numValue = Number.parseFloat(value)
    if (isNaN(numValue)) numValue = 0
    numValue = Math.max(0, Math.min(100, numValue))

    if (numValue > 0) {
      this.percentageFieldCleared = true
    }

    if (document.activeElement !== this.percentageInput) {
      const formattedValue = Number.parseFloat(numValue.toFixed(2))
      this.percentageInput.value = formattedValue
      numValue = formattedValue
    }

    this.percentageDisplay.textContent = `${numValue.toFixed(2)}%`
    this.sliderThumb.style.left = `${numValue}%`
    this.sliderTrack.style.width = `${numValue}%`
  }

  updateUI() {
    const operation = document.querySelector('input[name="operation"]:checked').value
    const isIncrease = operation === "add"

    // Update slider colors
    this.sliderTrack.style.background = isIncrease ? "var(--increase)" : "var(--discount)"
    this.sliderThumb.style.borderColor = isIncrease ? "var(--increase)" : "var(--discount)"

    // Update button colors
    if (isIncrease) {
      this.calculateFinalBtn.classList.add("increase")
    } else {
      this.calculateFinalBtn.classList.remove("increase")
    }

    // Update button text
    const buttonText = this.calculateFinalBtn.querySelector(".button-text")
    buttonText.innerHTML = isIncrease
      ? '<i class="fas fa-plus"></i> Calcola Aumento'
      : '<i class="fas fa-minus"></i> Calcola Sconto'
  }

  async calculateFinalPrice() {
    if (this.isCalculating) return

    if (!this.validateBasePrice()) {
      this.shakeElement(this.basePriceInput)
      return
    }

    this.isCalculating = true
    this.calculateFinalBtn.classList.add("loading")

    await this.delay(800)

    const basePrice = Number.parseFloat(this.basePriceInput.value)
    const percentage = Number.parseFloat(this.percentageInput.value) || 0
    const operation = document.querySelector('input[name="operation"]:checked').value

    const amount = basePrice * (percentage / 100)
    const finalPrice = operation === "subtract" ? basePrice - amount : basePrice + amount

    let title, details
    if (operation === "subtract") {
      title = "Prezzo Scontato"
      details = [
        { label: "Prezzo Originale", value: this.formatCurrency(basePrice) },
        { label: "Sconto Applicato", value: `${percentage.toFixed(2)}%` },
        { label: "Importo Risparmiato", value: this.formatCurrency(amount) },
      ]
    } else {
      title = "Prezzo Aumentato"
      details = [
        { label: "Prezzo Base", value: this.formatCurrency(basePrice) },
        { label: "Aumento Applicato", value: `${percentage.toFixed(2)}%` },
        { label: "Importo Aggiunto", value: this.formatCurrency(amount) },
      ]
    }

    this.hideCalculatorForm()
    this.showResult(title, this.formatCurrency(finalPrice), details)

    this.isCalculating = false
    this.calculateFinalBtn.classList.remove("loading")
  }

  async calculatePercentage() {
    if (this.isCalculating) return

    const priceBeforeValid = this.validatePriceBefore()
    const priceAfterValid = this.validatePriceAfter()

    if (!priceBeforeValid || !priceAfterValid) {
      if (!priceBeforeValid) this.shakeElement(this.priceBeforeInput)
      if (!priceAfterValid) this.shakeElement(this.priceAfterInput)
      return
    }

    this.isCalculating = true
    this.calculatePercentageBtn.classList.add("loading")

    await this.delay(800)

    const priceBefore = Number.parseFloat(this.priceBeforeInput.value)
    const priceAfter = Number.parseFloat(this.priceAfterInput.value)

    const difference = Math.abs(priceBefore - priceAfter)
    const percentage = (difference / priceBefore) * 100
    const isDiscount = priceAfter < priceBefore

    const title = isDiscount ? "Percentuale di Sconto" : "Percentuale di Aumento"
    const details = [
      { label: "Prezzo Iniziale", value: this.formatCurrency(priceBefore) },
      { label: "Prezzo Finale", value: this.formatCurrency(priceAfter) },
      {
        label: isDiscount ? "Risparmio" : "Aumento",
        value: this.formatCurrency(difference),
      },
    ]

    this.hideCalculatorForm()
    this.showResult(title, `${percentage.toFixed(2)}%`, details)

    this.isCalculating = false
    this.calculatePercentageBtn.classList.remove("loading")
  }

  validateBasePrice() {
    const value = Number.parseFloat(this.basePriceInput.value)
    if (isNaN(value) || value <= 0) {
      this.showError(this.basePriceError, "Inserisci un prezzo valido maggiore di zero")
      this.basePriceInput.classList.add("error")
      return false
    }
    this.hideError(this.basePriceError)
    this.basePriceInput.classList.remove("error")
    return true
  }

  validatePriceBefore() {
    const value = Number.parseFloat(this.priceBeforeInput.value)
    if (isNaN(value) || value <= 0) {
      this.showError(this.priceBeforeError, "Inserisci un prezzo valido maggiore di zero")
      this.priceBeforeInput.classList.add("error")
      return false
    }
    this.hideError(this.priceBeforeError)
    this.priceBeforeInput.classList.remove("error")
    return true
  }

  validatePriceAfter() {
    const value = Number.parseFloat(this.priceAfterInput.value)
    const priceBefore = Number.parseFloat(this.priceBeforeInput.value)

    if (isNaN(value) || value < 0) {
      this.showError(this.priceAfterError, "Inserisci un prezzo valido")
      this.priceAfterInput.classList.add("error")
      return false
    }

    if (!isNaN(priceBefore) && value === priceBefore) {
      this.showError(this.priceAfterError, "Il prezzo dopo deve essere diverso dal prezzo prima")
      this.priceAfterInput.classList.add("error")
      return false
    }

    this.hideError(this.priceAfterError)
    this.priceAfterInput.classList.remove("error")
    return true
  }

  showResult(title, value, details) {
    this.resultTitle.textContent = title
    this.resultValue.textContent = value

    this.resultDetails.innerHTML = ""
    details.forEach((detail) => {
      const div = document.createElement("div")
      div.className = "result-detail"
      div.innerHTML = `
              <span>${detail.label}</span>
              <span class="result-detail-value">${detail.value}</span>
            `
      this.resultDetails.appendChild(div)
    })

    this.resultContainer.classList.add("show")
  }

  hideResult() {
    this.resultContainer.classList.remove("show")
  }

  hideCalculatorForm() {
    this.calculatorForm.classList.add("hidden")
    setTimeout(() => {
      this.resultContainer.style.display = "block"
      setTimeout(() => {
        this.resultContainer.classList.add("show")
      }, 50)
    }, 200)
  }

  showCalculatorForm() {
    this.calculatorForm.classList.remove("hidden")
    this.resultContainer.style.display = "none"
  }

  newCalculation() {
    this.resultContainer.classList.remove("show")

    setTimeout(() => {
      this.hideResult()
      this.showCalculatorForm()
      this.clearInputs()
      this.clearErrors()
      this.updatePercentageFromInput(0)
      this.percentageFieldCleared = false
      this.focusFirstInput()
    }, 300)
  }

  clearInputs() {
    this.basePriceInput.value = ""
    this.percentageInput.value = "0.00"
    this.percentageFieldCleared = false

    this.priceBeforeInput.value = ""
    this.priceAfterInput.value = ""

    document.getElementById("op-subtract").checked = true
    this.updateUI()
  }

  focusFirstInput() {
    const currentMode = document.querySelector('input[name="mode"]:checked').value
    if (currentMode === "final-price") {
      this.basePriceInput.focus()
    } else {
      this.priceBeforeInput.focus()
    }
  }

  showError(element, message) {
    element.textContent = message
    element.classList.add("show")
  }

  hideError(element) {
    element.classList.remove("show")
    element.textContent = ""
  }

  clearErrors() {
    document.querySelectorAll(".error-message").forEach((el) => this.hideError(el))
    document.querySelectorAll(".input-field").forEach((el) => el.classList.remove("error"))
  }

  shakeElement(element) {
    element.classList.add("error")
    setTimeout(() => element.classList.remove("error"), 500)
  }

  share() {
    const title = this.resultTitle.textContent
    const value = this.resultValue.textContent
    const details = Array.from(this.resultDetails.children)
      .map((detail) => detail.textContent)
      .join("\n")

    const shareText = `🧮 ${title}\n💰 ${value}\n\n${details}\n\nCalcolato con il Calcolatore Smart 🚀`

    if (navigator.share) {
      navigator
        .share({
          title: "Calcolatore Smart - Risultato",
          text: shareText,
          url: window.location.href,
        })
        .catch(console.error)
    } else {
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          const originalText = this.shareBtn.innerHTML
          this.shareBtn.innerHTML = '<i class="fas fa-check"></i> Copiato!'
          setTimeout(() => {
            this.shareBtn.innerHTML = originalText
          }, 2000)
        })
        .catch(() => {
          alert("Impossibile copiare il risultato. Prova manualmente.")
        })
    }
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Initialize calculator when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ModernCalculator()
})
