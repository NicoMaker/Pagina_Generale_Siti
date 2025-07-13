class QRGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentQR = null;
    }

    initializeElements() {
        this.typeSelect = document.getElementById("qr-type");
        this.generateBtn = document.getElementById("generate-btn");
        this.downloadBtn = document.getElementById("download-btn");
        this.copyBtn = document.getElementById("copy-btn");
        this.qrContainer = document.getElementById("qr-container");
        this.downloadSection = document.getElementById("download-section");
        this.toast = document.getElementById("toast");
        this.toastMessage = document.getElementById("toast-message");

        this.infoType = document.getElementById("info-type");
        this.infoSize = document.getElementById("info-size");
        this.infoContent = document.getElementById("info-content");

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
        };

        this.inputContainers = {
            text: document.getElementById("text-input"),
            url: document.getElementById("url-input"),
            email: document.getElementById("email-input"),
            phone: document.getElementById("phone-input"),
            wifi: document.getElementById("wifi-input"),
        };

        this.sizeSelect = document.getElementById("qr-size");
    }

    bindEvents() {
        this.typeSelect.addEventListener("change", () => this.handleTypeChange());
        this.generateBtn.addEventListener("click", () => this.generateQR());
        this.downloadBtn.addEventListener("click", () => this.downloadQR());

        Object.values(this.inputs).forEach((input) => {
            if (input) input.addEventListener("input", () => this.debounceGenerate());
        });

        this.sizeSelect.addEventListener("change", () => this.debounceGenerate());
    }

    handleTypeChange() {
        const selectedType = this.typeSelect.value;
        Object.values(this.inputContainers).forEach((container) => container.classList.add("hidden"));
        if (this.inputContainers[selectedType]) {
            this.inputContainers[selectedType].classList.remove("hidden");
        }
        this.clearQR();
    }

    debounceGenerate() {
        clearTimeout(this.generateTimeout);
        this.generateTimeout = setTimeout(() => {
            if (this.hasValidInput()) this.generateQR();
        }, 300);
    }

    hasValidInput() {
        const type = this.typeSelect.value;
        const value = this.inputs[type]?.value?.trim();
        return !!value;
    }

    getQRData() {
        const type = this.typeSelect.value;
        switch (type) {
            case "text":
                return this.inputs.text.value.trim();
            case "url":
                let url = this.inputs.url.value.trim();
                if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;
                return url;
            case "email":
                const email = this.inputs.email.value.trim();
                const subject = this.inputs.emailSubject.value.trim();
                const body = this.inputs.emailBody.value.trim();
                let emailUrl = `mailto:${email}`;
                const params = [];
                if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
                if (body) params.push(`body=${encodeURIComponent(body)}`);
                if (params.length) emailUrl += "?" + params.join("&");
                return emailUrl;
            case "phone":
                return `tel:${this.inputs.phone.value.trim()}`;
            case "wifi":
                const ssid = this.inputs.wifiSsid.value.trim();
                const password = this.inputs.wifiPassword.value.trim();
                const security = this.inputs.wifiSecurity.value;
                return security === "nopass"
                    ? `WIFI:T:nopass;S:${ssid};;`
                    : `WIFI:T:${security};S:${ssid};P:${password};;`;
            default:
                return "";
        }
    }

    generateQR() {
        const data = this.getQRData();
        const size = parseInt(this.sizeSelect.value, 10);
        const foreground = "#000000";
        const background = "#ffffff";

        if (!data) return;

        const canvas = document.createElement("canvas");
        const qr = new QRious({
            element: canvas,
            value: data,
            size,
            foreground,
            background,
        });

        this.qrContainer.innerHTML = "";
        canvas.className = "qr-code";
        this.qrContainer.appendChild(canvas);
        this.qrContainer.classList.add("has-qr");

        this.currentQR = { canvas, data, size, type: this.typeSelect.value };
        this.updateInfoSection();
        this.downloadSection.classList.remove("hidden");
        this.showToast("QR Code generato con successo!", "success");
    }

    downloadQR() {
        if (!this.currentQR) return;
        const link = document.createElement("a");
        link.href = this.currentQR.canvas.toDataURL("image/png");
        const now = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
        link.download = `qr-${this.currentQR.type}-${now}.png`;
        link.click();
        this.showToast("QR Code scaricato!", "success");
    }

    clearQR() {
        this.qrContainer.innerHTML = `
      <div class="placeholder">
        <i class="fas fa-qrcode"></i>
        <p>Il tuo QR Code apparirà qui</p>
      </div>`;
        this.qrContainer.classList.remove("has-qr");
        this.downloadSection.classList.add("hidden");
        this.currentQR = null;
        this.infoType.textContent = "-";
        this.infoSize.textContent = "-";
        this.infoContent.textContent = "-";
    }

    updateInfoSection() {
        if (!this.currentQR) return;
        const typeMap = {
            text: "Testo",
            url: "URL/Link",
            email: "Email",
            phone: "Telefono",
            wifi: "WiFi",
        };
        this.infoType.textContent = typeMap[this.currentQR.type] || this.currentQR.type;
        this.infoSize.textContent = `${this.currentQR.size}px`;
        this.infoContent.textContent =
            this.currentQR.data.length > 50
                ? this.currentQR.data.slice(0, 50) + "..."
                : this.currentQR.data;
    }

    showToast(msg, type = "success") {
        this.toastMessage.textContent = msg;
        this.toast.style.background = type === "error" ? "#ff6b6b" : "#4ecdc4";
        this.toast.querySelector("i").className =
            type === "error" ? "fas fa-exclamation-circle" : "fas fa-check-circle";
        this.toast.classList.add("show");
        setTimeout(() => this.toast.classList.remove("show"), 3000);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new QRGenerator();
});
