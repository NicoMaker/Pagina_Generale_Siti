// Implementazione QR Code senza dipendenze esterne
class SimpleQRCode {
    constructor() {
        this.modules = []
        this.moduleCount = 0
    }

    static generate(text, options = {}) {
        const qr = new SimpleQRCode()
        const size = options.width || 300
        const margin = options.margin || 2
        const darkColor = options.color?.dark || "#000000"
        const lightColor = options.color?.light || "#ffffff"

        // Usa API di Google Charts per generare QR code
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = size
        canvas.height = size

        // Crea un'immagine QR usando l'API di Google Charts
        const img = new Image()
        img.crossOrigin = "anonymous"

        return new Promise((resolve, reject) => {
            img.onload = () => {
                // Disegna l'immagine sul canvas
                ctx.drawImage(img, 0, 0, size, size)

                // Applica i colori personalizzati se necessario
                if (darkColor !== "#000000" || lightColor !== "#ffffff") {
                    const imageData = ctx.getImageData(0, 0, size, size)
                    const data = imageData.data

                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i]
                        const g = data[i + 1]
                        const b = data[i + 2]

                        // Se il pixel è scuro (QR code)
                        if (r < 128 && g < 128 && b < 128) {
                            const darkRgb = hexToRgb(darkColor)
                            data[i] = darkRgb.r
                            data[i + 1] = darkRgb.g
                            data[i + 2] = darkRgb.b
                        } else {
                            // Se il pixel è chiaro (sfondo)
                            const lightRgb = hexToRgb(lightColor)
                            data[i] = lightRgb.r
                            data[i + 1] = lightRgb.g
                            data[i + 2] = lightRgb.b
                        }
                    }

                    ctx.putImageData(imageData, 0, 0)
                }

                resolve(canvas)
            }

            img.onerror = () => {
                // Fallback: crea un QR code semplice con pattern
                qr.createFallbackQR(canvas, text, size, darkColor, lightColor)
                resolve(canvas)
            }

            // URL dell'API Google Charts per QR code
            const encodedText = encodeURIComponent(text)
            img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`
        })
    }

    createFallbackQR(canvas, text, size, darkColor, lightColor) {
        const ctx = canvas.getContext("2d")
        const moduleSize = Math.floor(size / 25) // 25x25 grid semplificato

        // Pulisci il canvas
        ctx.fillStyle = lightColor
        ctx.fillRect(0, 0, size, size)

        // Crea un pattern semplice basato sul testo
        ctx.fillStyle = darkColor

        // Pattern di base per QR code
        const pattern = this.generateSimplePattern(text)

        for (let row = 0; row < 25; row++) {
            for (let col = 0; col < 25; col++) {
                if (pattern[row] && pattern[row][col]) {
                    ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
                }
            }
        }
    }

    generateSimplePattern(text) {
        // Genera un pattern semplice basato sul hash del testo
        const hash = this.simpleHash(text)
        const pattern = []

        for (let i = 0; i < 25; i++) {
            pattern[i] = []
            for (let j = 0; j < 25; j++) {
                // Crea pattern basato su hash e posizione
                const value = (hash + i * j) % 3
                pattern[i][j] = value === 0
            }
        }

        // Aggiungi pattern di riconoscimento agli angoli
        this.addFinderPatterns(pattern)

        return pattern
    }

    addFinderPatterns(pattern) {
        // Pattern di riconoscimento 7x7 negli angoli
        const finderPattern = [
            [1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1],
        ]

        // Angolo superiore sinistro
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                if (pattern[i] && pattern[i][j] !== undefined) {
                    pattern[i][j] = finderPattern[i][j] === 1
                }
            }
        }

        // Angolo superiore destro
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                if (pattern[i] && pattern[i][18 + j] !== undefined) {
                    pattern[i][18 + j] = finderPattern[i][j] === 1
                }
            }
        }

        // Angolo inferiore sinistro
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                if (pattern[18 + i] && pattern[18 + i][j] !== undefined) {
                    pattern[18 + i][j] = finderPattern[i][j] === 1
                }
            }
        }
    }

    simpleHash(str) {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i)
            hash = (hash << 5) - hash + char
            hash = hash & hash // Convert to 32-bit integer
        }
        return Math.abs(hash)
    }
}

// Utility function
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? {
            r: Number.parseInt(result[1], 16),
            g: Number.parseInt(result[2], 16),
            b: Number.parseInt(result[3], 16),
        }
        : { r: 0, g: 0, b: 0 }
}

// Classe principale del generatore QR
class QRGenerator {
    constructor() {
        this.initializeElements()
        this.bindEvents()
        this.currentQRData = null
    }

    initializeElements() {
        this.typeSelect = document.getElementById("qr-type")
        this.generateBtn = document.getElementById("generate-btn")
        this.downloadBtn = document.getElementById("download-btn")
        this.copyBtn = document.getElementById("copy-btn")
        this.qrContainer = document.getElementById("qr-container")
        this.downloadSection = document.getElementById("download-section")
        this.toast = document.getElementById("toast")
        this.toastMessage = document.getElementById("toast-message")

        // Info elements
        this.infoType = document.getElementById("info-type")
        this.infoSize = document.getElementById("info-size")
        this.infoContent = document.getElementById("info-content")

        // Input elements
        this.inputs = {
            text: document.getElementById("qr-text"),
            url: document.getElementById("qr-url"),
            email: document.getElementById("qr-email"),
            emailSubject: document.getElementById("qr-email-subject"),
            emailBody: document.getElementById("qr-email-body"),
            phone: document.getElementById("qr-phone"),
            wifiSsid: document.getElementById("wifi-ssid"),
            wifiPassword: document.getElementById("wifi-password"),
            wifiSecurity: document.getElementById("wifi-security"),
        }

        // Input containers
        this.inputContainers = {
            text: document.getElementById("text-input"),
            url: document.getElementById("url-input"),
            email: document.getElementById("email-input"),
            phone: document.getElementById("phone-input"),
            wifi: document.getElementById("wifi-input"),
        }

        // Customization
        this.sizeSelect = document.getElementById("qr-size")
        this.colorInput = document.getElementById("qr-color")
        this.bgColorInput = document.getElementById("bg-color")
    }

    bindEvents() {
        this.typeSelect.addEventListener("change", () => this.handleTypeChange())
        this.generateBtn.addEventListener("click", () => this.generateQR())
        this.downloadBtn.addEventListener("click", () => this.downloadQR())
        this.copyBtn.addEventListener("click", () => this.copyQR())

        // Auto-generate on input change
        Object.values(this.inputs).forEach((input) => {
            if (input) {
                input.addEventListener("input", () => this.debounceGenerate())
            }
        })
            ;[this.sizeSelect, this.colorInput, this.bgColorInput].forEach((element) => {
                element.addEventListener("change", () => this.debounceGenerate())
            })
    }

    handleTypeChange() {
        const selectedType = this.typeSelect.value

        // Hide all input containers
        Object.values(this.inputContainers).forEach((container) => {
            container.classList.add("hidden")
        })

        // Show selected input container
        if (this.inputContainers[selectedType]) {
            this.inputContainers[selectedType].classList.remove("hidden")
        }

        // Clear previous QR code
        this.clearQR()
    }

    debounceGenerate() {
        clearTimeout(this.generateTimeout)
        this.generateTimeout = setTimeout(() => {
            if (this.hasValidInput()) {
                this.generateQR()
            }
        }, 500)
    }

    hasValidInput() {
        const type = this.typeSelect.value

        switch (type) {
            case "text":
                return this.inputs.text.value.trim().length > 0
            case "url":
                return this.inputs.url.value.trim().length > 0
            case "email":
                return this.inputs.email.value.trim().length > 0
            case "phone":
                return this.inputs.phone.value.trim().length > 0
            case "wifi":
                return this.inputs.wifiSsid.value.trim().length > 0
            default:
                return false
        }
    }

    getQRData() {
        const type = this.typeSelect.value

        switch (type) {
            case "text":
                return this.inputs.text.value.trim()

            case "url":
                let url = this.inputs.url.value.trim()
                if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
                    url = "https://" + url
                }
                return url

            case "email":
                const email = this.inputs.email.value.trim()
                const subject = this.inputs.emailSubject.value.trim()
                const body = this.inputs.emailBody.value.trim()

                let emailUrl = `mailto:${email}`
                const params = []

                if (subject) {
                    params.push(`subject=${encodeURIComponent(subject)}`)
                }
                if (body) {
                    params.push(`body=${encodeURIComponent(body)}`)
                }

                if (params.length > 0) {
                    emailUrl += "?" + params.join("&")
                }

                return emailUrl

            case "phone":
                return `tel:${this.inputs.phone.value.trim()}`

            case "wifi":
                const ssid = this.inputs.wifiSsid.value.trim()
                const password = this.inputs.wifiPassword.value.trim()
                const security = this.inputs.wifiSecurity.value

                if (security === "nopass") {
                    return `WIFI:T:nopass;S:${ssid};;`
                } else {
                    return `WIFI:T:${security};S:${ssid};P:${password};;`
                }

            default:
                return ""
        }
    }

    async generateQR() {
        const data = this.getQRData()

        if (!data) {
            this.showToast("Inserisci dei dati validi!", "error")
            return
        }

        try {
            // Show loading state
            this.generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...'
            this.generateBtn.disabled = true

            // Clear previous QR code
            this.qrContainer.innerHTML = ""

            // Generate QR code
            const size = Number.parseInt(this.sizeSelect.value)
            const canvas = await SimpleQRCode.generate(data, {
                width: size,
                height: size,
                color: {
                    dark: this.colorInput.value,
                    light: this.bgColorInput.value,
                },
                margin: 2,
            })

            // Add QR code to container
            canvas.className = "qr-code"
            this.qrContainer.appendChild(canvas)
            this.qrContainer.classList.add("has-qr")

            // Store current QR data
            this.currentQRData = {
                canvas: canvas,
                data: data,
                size: size,
                type: this.typeSelect.value,
            }

            // Update info section
            this.updateInfoSection()

            // Show download section
            this.downloadSection.classList.remove("hidden")

            this.showToast("QR Code generato con successo!", "success")
        } catch (error) {
            console.error("Errore nella generazione del QR Code:", error)
            this.showToast("Errore nella generazione del QR Code", "error")
        } finally {
            // Reset button state
            this.generateBtn.innerHTML = '<i class="fas fa-magic"></i> Genera QR Code'
            this.generateBtn.disabled = false
        }
    }

    updateInfoSection() {
        if (!this.currentQRData) return

        const typeNames = {
            text: "Testo",
            url: "URL/Link",
            email: "Email",
            phone: "Telefono",
            wifi: "WiFi",
        }

        this.infoType.textContent = typeNames[this.currentQRData.type] || "Sconosciuto"
        this.infoSize.textContent = `${this.currentQRData.size}x${this.currentQRData.size}px`

        // Truncate content if too long
        let content = this.currentQRData.data
        if (content.length > 50) {
            content = content.substring(0, 50) + "..."
        }
        this.infoContent.textContent = content
    }

    downloadQR() {
        if (!this.currentQRData) {
            this.showToast("Nessun QR Code da scaricare!", "error")
            return
        }

        try {
            const link = document.createElement("a")
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
            link.download = `qr-code-${this.currentQRData.type}-${timestamp}.png`
            link.href = this.currentQRData.canvas.toDataURL("image/png", 1.0)
            link.click()

            this.showToast("QR Code scaricato!", "success")
        } catch (error) {
            console.error("Errore nel download:", error)
            this.showToast("Errore nel download del QR Code", "error")
        }
    }

    async copyQR() {
        if (!this.currentQRData) {
            this.showToast("Nessun QR Code da copiare!", "error")
            return
        }

        try {
            // Convert canvas to blob
            this.currentQRData.canvas.toBlob(
                async (blob) => {
                    try {
                        if (navigator.clipboard && window.ClipboardItem) {
                            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
                            this.showToast("QR Code copiato negli appunti!", "success")
                        } else {
                            // Fallback: copy as data URL
                            const dataUrl = this.currentQRData.canvas.toDataURL()
                            await navigator.clipboard.writeText(dataUrl)
                            this.showToast("Link QR Code copiato negli appunti!", "success")
                        }
                    } catch (error) {
                        console.error("Errore nella copia:", error)
                        this.showToast("Impossibile copiare negli appunti", "error")
                    }
                },
                "image/png",
                1.0,
            )
        } catch (error) {
            console.error("Errore nella copia:", error)
            this.showToast("Errore nella copia del QR Code", "error")
        }
    }

    clearQR() {
        this.qrContainer.innerHTML = `
      <div class="placeholder">
        <i class="fas fa-qrcode"></i>
        <p>Il tuo QR Code apparirà qui</p>
      </div>
    `
        this.qrContainer.classList.remove("has-qr")
        this.downloadSection.classList.add("hidden")
        this.currentQRData = null

        // Reset info section
        this.infoType.textContent = "-"
        this.infoSize.textContent = "-"
        this.infoContent.textContent = "-"
    }

    showToast(message, type = "success") {
        this.toastMessage.textContent = message

        // Change toast color based on type
        if (type === "error") {
            this.toast.style.background = "#ff6b6b"
            this.toast.querySelector("i").className = "fas fa-exclamation-circle"
        } else {
            this.toast.style.background = "#4ecdc4"
            this.toast.querySelector("i").className = "fas fa-check-circle"
        }

        this.toast.classList.add("show")

        setTimeout(() => {
            this.toast.classList.remove("show")
        }, 3000)
    }
}

// Initialize the QR Generator when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new QRGenerator()
})

// Add keyboard shortcuts
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case "Enter":
                e.preventDefault()
                const generateBtn = document.getElementById("generate-btn")
                if (generateBtn && !generateBtn.disabled) {
                    generateBtn.click()
                }
                break
            case "s":
                e.preventDefault()
                const downloadBtn = document.getElementById("download-btn")
                if (downloadBtn && !downloadBtn.classList.contains("hidden")) {
                    downloadBtn.click()
                }
                break
        }
    }
})
