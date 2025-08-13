class ModernCalculator {
  constructor() {
    this.initElements()
    this.bindEvents()
    this.setupSlider()
    this.updateUI()
    this.isCalculating = false
    this.percentageFieldCleared = false
    this.setupAccessibility()
  }

  initElements() {
    // Mode elements
    this.modeInputs = document.querySelectorAll('input[name="mode"]')
    this.calculatorMain = document.getElementById("calculator-main")
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

  setupAccessibility() {
    // Add ARIA labels and roles
    this.sliderWrapper.setAttribute("role", "slider")
    this.sliderWrapper.setAttribute("aria-valuemin", "0")
    this.sliderWrapper.setAttribute("aria-valuemax", "100")
    this.sliderWrapper.setAttribute("aria-valuenow", "0")
    this.sliderWrapper.setAttribute("aria-label", "Percentuale")
    this.sliderWrapper.setAttribute("tabindex", "0")

    // Keyboard navigation for slider
    this.sliderWrapper.addEventListener("keydown", (e) => {
      const currentValue = Number.parseFloat(this.percentageInput.value) || 0
      let newValue = currentValue

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowDown":
          newValue = Math.max(0, currentValue - 1)
          break
        case "ArrowRight":
        case "ArrowUp":
          newValue = Math.min(100, currentValue + 1)
          break
        case "Home":
          newValue = 0
          break
        case "End":
          newValue = 100
          break
        case "PageDown":
          newValue = Math.max(0, currentValue - 10)
          break
        case "PageUp":
          newValue = Math.min(100, currentValue + 10)
          break
        default:
          return
      }

      e.preventDefault()
      this.updatePercentageFromInput(newValue)
    })
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

    this.basePriceInput.addEventListener("input", () => {
      this.validateBasePrice()
      this.addInputAnimation(this.basePriceInput)
    })

    this.operationInputs.forEach((input) => {
      input.addEventListener("change", () => this.updateUI())
    })

    // Enhanced percentage input events
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
      this.addInputAnimation(this.percentageInput)
    })

    this.percentageInput.addEventListener("blur", (e) => {
      const value = Number.parseFloat(e.target.value)
      if (isNaN(value) || e.target.value === "") {
        e.target.value = "0.00"
        this.percentageFieldCleared = false
      } else {
        e.target.value = Math.min(100, Math.max(0, value)).toFixed(2)
      }
      this.updatePercentageFromInput(e.target.value)
    })

    this.percentageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.calculateFinalPrice()
    })

    this.calculateFinalBtn.addEventListener("click", () => this.calculateFinalPrice())

    // Percentage mode events
    this.priceBeforeInput.addEventListener("input", () => {
      this.validatePriceBefore()
      this.addInputAnimation(this.priceBeforeInput)
    })

    this.priceBeforeInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.calculatePercentage()
    })

    this.priceAfterInput.addEventListener("input", () => {
      this.validatePriceAfter()
      this.addInputAnimation(this.priceAfterInput)
    })

    this.priceAfterInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.calculatePercentage()
    })

    this.calculatePercentageBtn.addEventListener("click", () => this.calculatePercentage())

    // Result events
    this.newCalculationBtn.addEventListener("click", () => this.newCalculation())
    this.shareBtn.addEventListener("click", () => this.share())

    // Add window resize handler for responsive slider
    window.addEventListener("resize", () => this.updateSliderPosition())
  }

  addInputAnimation(input) {
    input.style.transform = "scale(1.02)"
    setTimeout(() => {
      input.style.transform = "scale(1)"
    }, 150)
  }

  setupSlider() {
    const updateSliderPosition = (percentage) => {
      this.sliderThumb.style.left = `${percentage}%`
      this.sliderTrack.style.width = `${percentage}%`
      this.sliderWrapper.setAttribute("aria-valuenow", percentage.toFixed(2))
    }

    const getPercentageFromPosition = (clientX) => {
      const rect = this.sliderWrapper.getBoundingClientRect()
      const percentage = ((clientX - rect.left) / rect.width) * 100
      return Math.max(0, Math.min(100, percentage))
    }

    const onMouseMove = (e) => {
      if (!this.sliderDragging) return
      e.preventDefault()
      const percentage = getPercentageFromPosition(e.clientX)
      this.updatePercentageFromInput(percentage)
    }

    const onMouseUp = () => {
      if (!this.sliderDragging) return
      this.sliderDragging = false
      this.sliderThumb.classList.remove("active")
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
      document.body.style.userSelect = ""
    }

    // Mouse events
    this.sliderThumb.addEventListener("mousedown", (e) => {
      e.preventDefault()
      this.sliderDragging = true
      this.sliderThumb.classList.add("active")
      document.body.style.userSelect = "none"
      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    })

    this.sliderWrapper.addEventListener("click", (e) => {
      if (!this.sliderDragging && e.target !== this.sliderThumb) {
        const percentage = getPercentageFromPosition(e.clientX)
        this.updatePercentageFromInput(percentage)
        this.addSliderClickAnimation(e.clientX)
      }
    })

    // Touch events for mobile
    const onTouchMove = (e) => {
      if (!this.sliderDragging) return
      e.preventDefault()
      const touch = e.touches[0]
      const percentage = getPercentageFromPosition(touch.clientX)
      this.updatePercentageFromInput(percentage)
    }

    const onTouchEnd = () => {
      if (!this.sliderDragging) return
      this.sliderDragging = false
      this.sliderThumb.classList.remove("active")
      document.removeEventListener("touchmove", onTouchMove)
      document.removeEventListener("touchend", onTouchEnd)
    }

    this.sliderThumb.addEventListener("touchstart", (e) => {
      e.preventDefault()
      this.sliderDragging = true
      this.sliderThumb.classList.add("active")
      document.addEventListener("touchmove", onTouchMove, { passive: false })
      document.addEventListener("touchend", onTouchEnd)
    })

    this.sliderWrapper.addEventListener("touchstart", (e) => {
      if (e.target === this.sliderWrapper) {
        const touch = e.touches[0]
        const percentage = getPercentageFromPosition(touch.clientX)
        this.updatePercentageFromInput(percentage)
        this.addSliderClickAnimation(touch.clientX)
      }
    })

    updateSliderPosition(0)
    this.updatePercentageFromInput(0)
  }

  addSliderClickAnimation(clientX) {
    const rect = this.sliderWrapper.getBoundingClientRect()
    const ripple = document.createElement("div")
    ripple.style.position = "absolute"
    ripple.style.left = `${clientX - rect.left - 10}px`
    ripple.style.top = "50%"
    ripple.style.transform = "translateY(-50%)"
    ripple.style.width = "20px"
    ripple.style.height = "20px"
    ripple.style.background = "rgba(99, 102, 241, 0.3)"
    ripple.style.borderRadius = "50%"
    ripple.style.pointerEvents = "none"
    ripple.style.animation = "ripple 0.6s ease-out"

    this.sliderWrapper.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }

  updateSliderPosition() {
    const percentage = Number.parseFloat(this.percentageInput.value) || 0
    this.sliderThumb.style.left = `${percentage}%`
    this.sliderTrack.style.width = `${percentage}%`
  }

  switchMode(mode) {
    this.hideResult()
    this.clearErrors()

    // Add transition animation
    this.finalPriceMode.style.opacity = "0"
    this.percentageMode.style.opacity = "0"

    setTimeout(() => {
      if (mode === "final-price") {
        this.finalPriceMode.classList.add("active")
        this.percentageMode.classList.remove("active")
        this.finalPriceMode.style.opacity = "1"
      } else {
        this.finalPriceMode.classList.remove("active")
        this.percentageMode.classList.add("active")
        this.percentageMode.style.opacity = "1"
      }
    }, 150)
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
    this.sliderWrapper.setAttribute("aria-valuenow", numValue.toFixed(2))

    // Add visual feedback
    this.percentageDisplay.style.transform = "scale(1.1)"
    setTimeout(() => {
      this.percentageDisplay.style.transform = "scale(1)"
    }, 200)
  }

  updateUI() {
    const operation = document.querySelector('input[name="operation"]:checked').value
    const isIncrease = operation === "add"

    // Update slider colors with smooth transition
    const newColor = isIncrease ? "var(--increase)" : "var(--discount)"
    const newGradient = isIncrease ? "var(--gradient-increase)" : "var(--gradient-discount)"

    this.sliderTrack.style.background = newGradient
    this.sliderThumb.style.borderColor = newColor
    this.sliderThumb.querySelector(".slider-thumb-inner").style.background = newColor

    // Update button colors
    if (isIncrease) {
      this.calculateFinalBtn.classList.add("increase")
    } else {
      this.calculateFinalBtn.classList.remove("increase")
    }

    // Update button text with animation
    const buttonContent = this.calculateFinalBtn.querySelector(".button-content")
    buttonContent.style.opacity = "0"

    setTimeout(() => {
      buttonContent.innerHTML = isIncrease
        ? '<i class="fas fa-plus"></i><span class="button-text">Calcola Aumento</span>'
        : '<i class="fas fa-minus"></i><span class="button-text">Calcola Sconto</span>'
      buttonContent.style.opacity = "1"
    }, 150)
  }

  async calculateFinalPrice() {
    if (this.isCalculating) return

    if (!this.validateBasePrice()) {
      this.shakeElement(this.basePriceInput)
      return
    }

    this.isCalculating = true
    this.calculateFinalBtn.classList.add("loading")

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    await this.delay(1000)

    const basePrice = Number.parseFloat(this.basePriceInput.value)
    const percentage = Number.parseFloat(this.percentageInput.value) || 0
    const operation = document.querySelector('input[name="operation"]:checked').value

    const amount = basePrice * (percentage / 100)
    const finalPrice = operation === "subtract" ? basePrice - amount : basePrice + amount

    let title, details, icon
    if (operation === "subtract") {
      title = "Prezzo Scontato"
      icon = "fas fa-tag"
      details = [
        { label: "Prezzo Originale", value: this.formatCurrency(basePrice) },
        { label: "Sconto Applicato", value: `${percentage.toFixed(2)}%` },
        { label: "Importo Risparmiato", value: this.formatCurrency(amount) },
      ]
    } else {
      title = "Prezzo Aumentato"
      icon = "fas fa-arrow-up"
      details = [
        { label: "Prezzo Base", value: this.formatCurrency(basePrice) },
        { label: "Aumento Applicato", value: `${percentage.toFixed(2)}%` },
        { label: "Importo Aggiunto", value: this.formatCurrency(amount) },
      ]
    }

    this.hideCalculatorForm()
    this.showResult(title, this.formatCurrency(finalPrice), details, icon)

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

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    await this.delay(1000)

    const priceBefore = Number.parseFloat(this.priceBeforeInput.value)
    const priceAfter = Number.parseFloat(this.priceAfterInput.value)

    const difference = Math.abs(priceBefore - priceAfter)
    const percentage = (difference / priceBefore) * 100
    const isDiscount = priceAfter < priceBefore

    const title = isDiscount ? "Percentuale di Sconto" : "Percentuale di Aumento"
    const icon = isDiscount ? "fas fa-arrow-down" : "fas fa-arrow-up"
    const details = [
      { label: "Prezzo Iniziale", value: this.formatCurrency(priceBefore) },
      { label: "Prezzo Finale", value: this.formatCurrency(priceAfter) },
      {
        label: isDiscount ? "Risparmio" : "Aumento",
        value: this.formatCurrency(difference),
      },
    ]

    this.hideCalculatorForm()
    this.showResult(title, `${percentage.toFixed(2)}%`, details, icon)

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

    if (!isNaN(priceBefore) && Math.abs(value - priceBefore) < 0.01) {
      this.showError(this.priceAfterError, "Il prezzo dopo deve essere diverso dal prezzo prima")
      this.priceAfterInput.classList.add("error")
      return false
    }

    this.hideError(this.priceAfterError)
    this.priceAfterInput.classList.remove("error")
    return true
  }

  showResult(title, value, details, iconClass = "fas fa-check-circle") {
    this.resultTitle.textContent = title
    this.resultValue.textContent = value

    // Update result icon
    const resultIcon = this.resultContainer.querySelector(".result-icon i")
    resultIcon.className = iconClass

    this.resultDetails.innerHTML = ""
    details.forEach((detail, index) => {
      const div = document.createElement("div")
      div.className = "result-detail"
      div.style.animationDelay = `${index * 0.1}s`
      div.innerHTML = `
        <span>${detail.label}</span>
        <span class="result-detail-value">${detail.value}</span>
      `
      this.resultDetails.appendChild(div)
    })

    this.resultContainer.classList.add("show")

    // Add success sound if available
    this.playSuccessSound()
  }

  playSuccessSound() {
    // Create a simple success sound using Web Audio API
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (AudioContext) {
      try {
        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)

        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
      } catch (e) {
        // Silently fail if audio context is not available
      }
    }
  }

  hideResult() {
    this.resultContainer.classList.remove("show")
  }

  hideCalculatorForm() {
    this.calculatorMain.classList.add("hidden")
    setTimeout(() => {
      this.resultContainer.style.display = "flex"
      setTimeout(() => {
        this.resultContainer.classList.add("show")
      }, 50)
    }, 200)
  }

  showCalculatorForm() {
    this.calculatorMain.classList.remove("hidden")
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
    setTimeout(() => {
      if (currentMode === "final-price") {
        this.basePriceInput.focus()
      } else {
        this.priceBeforeInput.focus()
      }
    }, 100)
  }

  showError(element, message) {
    element.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`
    element.classList.add("show")
  }

  hideError(element) {
    element.classList.remove("show")
    setTimeout(() => {
      element.innerHTML = ""
    }, 300)
  }

  clearErrors() {
    document.querySelectorAll(".error-message").forEach((el) => this.hideError(el))
    document.querySelectorAll(".input-field").forEach((el) => el.classList.remove("error"))
  }

  shakeElement(element) {
    element.classList.add("error")
    setTimeout(() => element.classList.remove("error"), 500)

    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
  }

  async share() {
    const title = this.resultTitle.textContent
    const value = this.resultValue.textContent
    const details = Array.from(this.resultDetails.children)
      .map((detail) => detail.textContent.replace(/\s+/g, " ").trim())
      .join("\n")

    const shareText = `🧮 ${title}\n💰 ${value}\n\n${details}\n\nCalcolato con il Calcolatore Smart 🚀`

    if (navigator.share && navigator.canShare && navigator.canShare({ text: shareText })) {
      try {
        await navigator.share({
          title: "Calcolatore Smart - Risultato",
          text: shareText,
          url: window.location.href,
        })
      } catch (error) {
        if (error.name !== "AbortError") {
          this.fallbackShare(shareText)
        }
      }
    } else {
      this.fallbackShare(shareText)
    }
  }

  async fallbackShare(shareText) {
    try {
      await navigator.clipboard.writeText(shareText)
      this.showShareFeedback("Copiato negli appunti!")
    } catch (error) {
      // Create a temporary textarea for fallback copy
      const textarea = document.createElement("textarea")
      textarea.value = shareText
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()

      try {
        document.execCommand("copy")
        this.showShareFeedback("Copiato negli appunti!")
      } catch (e) {
        this.showShareFeedback("Impossibile copiare automaticamente")
      }

      document.body.removeChild(textarea)
    }
  }

  showShareFeedback(message) {
    const originalContent = this.shareBtn.innerHTML
    this.shareBtn.innerHTML = `<i class="fas fa-check"></i> ${message}`
    this.shareBtn.style.background = "var(--gradient-primary)"
    this.shareBtn.style.color = "var(--white)"
    this.shareBtn.style.borderColor = "var(--primary)"

    setTimeout(() => {
      this.shareBtn.innerHTML = originalContent
      this.shareBtn.style.background = ""
      this.shareBtn.style.color = ""
      this.shareBtn.style.borderColor = ""
    }, 2500)
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

// Add CSS for ripple animation
const style = document.createElement("style")
style.textContent = `
  @keyframes ripple {
    0% {
      transform: translateY(-50%) scale(0);
      opacity: 1;
    }
    100% {
      transform: translateY(-50%) scale(4);
      opacity: 0;
    }
  }
`
document.head.appendChild(style)

// Initialize calculator when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ModernCalculator()
})

// Add service worker for offline functionality (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silently fail if service worker is not available
    })
  })
}
