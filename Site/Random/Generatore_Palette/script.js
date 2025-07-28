class ColorCraft {
  constructor() {
    this.currentPalette = [];
    this.savedPalettes =
      JSON.parse(localStorage.getItem("savedPalettes")) || [];
    this.trashedPalettes =
      JSON.parse(localStorage.getItem("trashedPalettes")) || [];

    this.initializeElements();
    this.bindEvents();
    this.updateCounts();
    this.generatePalette();
  }

  initializeElements() {
    // Controls
    this.baseColor = document.getElementById("baseColor");
    this.baseColorHex = document.getElementById("baseColorHex");
    this.harmonyType = document.getElementById("harmonyType");
    this.colorCount = document.getElementById("colorCount");
    this.colorCountValue = document.getElementById("colorCountValue");
    this.brightness = document.getElementById("brightness");
    this.brightnessValue = document.getElementById("brightnessValue");
    this.saturation = document.getElementById("saturation");
    this.saturationValue = document.getElementById("saturationValue");
    this.colorFormat = document.getElementById("colorFormat");

    // Buttons
    this.generateBtn = document.getElementById("generateBtn");
    this.savePaletteBtn = document.getElementById("savePaletteBtn");
    this.exportBtn = document.getElementById("exportBtn");
    this.viewImageBtn = document.getElementById("viewImageBtn");
    this.randomColorBtn = document.getElementById("randomColorBtn");

    // Display
    this.paletteContainer = document.getElementById("paletteContainer");
    this.paletteType = document.getElementById("paletteType");
    this.paletteCount = document.getElementById("paletteCount");

    // Modals
    this.savedPalettesModal = document.getElementById("savedPalettesModal");
    this.trashedPalettesModal = document.getElementById("trashedPalettesModal");
    this.exportModal = document.getElementById("exportModal");
    this.imageModal = document.getElementById("imageModal");

    // Modal content
    this.savedPalettesList = document.getElementById("savedPalettesList");
    this.trashedPalettesList = document.getElementById("trashedPalettesList");
    this.exportCode = document.getElementById("exportCode");
    this.paletteCanvas = document.getElementById("paletteCanvas");

    // Counters
    this.savedCount = document.getElementById("savedCount");
    this.trashedCount = document.getElementById("trashedCount");

    // Toast container
    this.toastContainer = document.getElementById("toastContainer");
  }

  bindEvents() {
    // Control events
    this.baseColor.addEventListener("input", (e) => {
      this.baseColorHex.value = e.target.value;
      this.generatePalette();
    });

    this.baseColorHex.addEventListener("input", (e) => {
      if (this.isValidHex(e.target.value)) {
        this.baseColor.value = e.target.value;
        this.generatePalette();
      }
    });

    this.harmonyType.addEventListener("change", () => this.generatePalette());

    this.colorCount.addEventListener("input", (e) => {
      this.colorCountValue.textContent = e.target.value;
      this.generatePalette();
    });

    this.brightness.addEventListener("input", (e) => {
      this.brightnessValue.textContent = e.target.value + "%";
      this.generatePalette();
    });

    this.saturation.addEventListener("input", (e) => {
      this.saturationValue.textContent = e.target.value + "%";
      this.generatePalette();
    });

    this.colorFormat.addEventListener("change", () =>
      this.updatePaletteDisplay(),
    );

    // Button events
    this.generateBtn.addEventListener("click", () => this.generatePalette());
    this.savePaletteBtn.addEventListener("click", () => this.savePalette());
    this.exportBtn.addEventListener("click", () => this.showExportModal());
    this.viewImageBtn.addEventListener("click", () => this.showImageModal());
    this.randomColorBtn.addEventListener("click", () =>
      this.generateRandomColor(),
    );

    // Navigation events
    document
      .getElementById("savedPalettesBtn")
      .addEventListener("click", () => this.showSavedPalettes());
    document
      .getElementById("trashedPalettesBtn")
      .addEventListener("click", () => this.showTrashedPalettes());

    // Modal events
    document
      .getElementById("closeSavedModal")
      .addEventListener("click", () => this.hideModal(this.savedPalettesModal));
    document
      .getElementById("closeTrashedModal")
      .addEventListener("click", () =>
        this.hideModal(this.trashedPalettesModal),
      );
    document
      .getElementById("closeExportModal")
      .addEventListener("click", () => this.hideModal(this.exportModal));
    document
      .getElementById("closeImageModal")
      .addEventListener("click", () => this.hideModal(this.imageModal));

    // Export events
    document.querySelectorAll(".export-option").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.selectExportFormat(e.target.closest(".export-option")),
      );
    });

    document
      .getElementById("copyCodeBtn")
      .addEventListener("click", () => this.copyExportCode());
    document
      .getElementById("downloadImageBtn")
      .addEventListener("click", () => this.downloadImage());
    document
      .getElementById("copyImageBtn")
      .addEventListener("click", () => this.copyImage());
    document
      .getElementById("emptyTrashBtn")
      .addEventListener("click", () => this.emptyTrash());

    // Modal backdrop clicks
    [
      this.savedPalettesModal,
      this.trashedPalettesModal,
      this.exportModal,
      this.imageModal,
    ].forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (
          e.target === modal ||
          e.target.classList.contains("modal-backdrop")
        ) {
          this.hideModal(modal);
        }
      });
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "Enter":
            e.preventDefault();
            this.generatePalette();
            break;
          case "s":
            e.preventDefault();
            this.savePalette();
            break;
          case "e":
            e.preventDefault();
            this.showExportModal();
            break;
        }
      }
      if (e.key === "Escape") {
        this.hideAllModals();
      }
    });
  }

  // Color generation methods
  generatePalette() {
    const baseColor = this.baseColorHex.value;
    const harmonyType = this.harmonyType.value;
    const count = Number.parseInt(this.colorCount.value);
    const brightness = Number.parseInt(this.brightness.value);
    const saturation = Number.parseInt(this.saturation.value);

    if (!this.isValidHex(baseColor)) return;

    this.currentPalette = this.generateColorHarmony(
      baseColor,
      harmonyType,
      count,
      brightness,
      saturation,
    );
    this.updatePaletteDisplay();
    this.updatePaletteInfo();

    if (!this.isValidHex(baseColor)) {
      this.showToast("Il colore base non è valido", "error");
      return;
    }
  }

  generateColorHarmony(baseColor, harmonyType, count, brightness, saturation) {
    const baseHsl = this.hexToHsl(baseColor);
    const colors = [];

    switch (harmonyType) {
      case "monochromatic":
        colors.push(
          ...this.generateMonochromatic(baseHsl, count, brightness, saturation),
        );
        break;
      case "analogous":
        colors.push(
          ...this.generateAnalogous(baseHsl, count, brightness, saturation),
        );
        break;
      case "complementary":
        colors.push(
          ...this.generateComplementary(baseHsl, count, brightness, saturation),
        );
        break;
      case "triadic":
        colors.push(
          ...this.generateTriadic(baseHsl, count, brightness, saturation),
        );
        break;
      case "tetradic":
        colors.push(
          ...this.generateTetradic(baseHsl, count, brightness, saturation),
        );
        break;
      case "splitComplementary":
        colors.push(
          ...this.generateSplitComplementary(
            baseHsl,
            count,
            brightness,
            saturation,
          ),
        );
        break;
      case "compound":
        colors.push(
          ...this.generateCompound(baseHsl, count, brightness, saturation),
        );
        break;
    }

    return colors.slice(0, count);
  }

  generateMonochromatic(baseHsl, count, brightness, saturation) {
    const colors = [];
    const [h, s, l] = baseHsl;

    for (let i = 0; i < count; i++) {
      const newL = Math.max(
        10,
        Math.min(90, l + (i - Math.floor(count / 2)) * (brightness / count)),
      );
      const newS = Math.max(
        20,
        Math.min(100, s + (Math.random() - 0.5) * (saturation / 100) * 20),
      );
      colors.push(this.hslToHex(h, newS, newL));
    }

    return colors;
  }

  generateAnalogous(baseHsl, count, brightness, saturation) {
    const colors = [];
    const [h, s, l] = baseHsl;
    const step = 30;

    for (let i = 0; i < count; i++) {
      const newH = (h + (i - Math.floor(count / 2)) * step + 360) % 360;
      const newL = Math.max(
        10,
        Math.min(90, l + (Math.random() - 0.5) * (brightness / 100) * 40),
      );
      const newS = Math.max(
        20,
        Math.min(100, s + (Math.random() - 0.5) * (saturation / 100) * 30),
      );
      colors.push(this.hslToHex(newH, newS, newL));
    }

    return colors;
  }

  generateComplementary(baseHsl, count, brightness, saturation) {
    const colors = [];
    const [h, s, l] = baseHsl;
    const complementH = (h + 180) % 360;

    for (let i = 0; i < count; i++) {
      const useComplement = i % 2 === 1;
      const newH = useComplement ? complementH : h;
      const newL = Math.max(
        10,
        Math.min(90, l + (Math.random() - 0.5) * (brightness / 100) * 40),
      );
      const newS = Math.max(
        20,
        Math.min(100, s + (Math.random() - 0.5) * (saturation / 100) * 30),
      );
      colors.push(this.hslToHex(newH, newS, newL));
    }

    return colors;
  }

  generateTriadic(baseHsl, count, brightness, saturation) {
    const colors = [];
    const [h, s, l] = baseHsl;
    const hues = [h, (h + 120) % 360, (h + 240) % 360];

    for (let i = 0; i < count; i++) {
      const newH = hues[i % 3];
      const newL = Math.max(
        10,
        Math.min(90, l + (Math.random() - 0.5) * (brightness / 100) * 40),
      );
      const newS = Math.max(
        20,
        Math.min(100, s + (Math.random() - 0.5) * (saturation / 100) * 30),
      );
      colors.push(this.hslToHex(newH, newS, newL));
    }

    return colors;
  }

  generateTetradic(baseHsl, count, brightness, saturation) {
    const colors = [];
    const [h, s, l] = baseHsl;
    const hues = [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360];

    for (let i = 0; i < count; i++) {
      const newH = hues[i % 4];
      const newL = Math.max(
        10,
        Math.min(90, l + (Math.random() - 0.5) * (brightness / 100) * 40),
      );
      const newS = Math.max(
        20,
        Math.min(100, s + (Math.random() - 0.5) * (saturation / 100) * 30),
      );
      colors.push(this.hslToHex(newH, newS, newL));
    }

    return colors;
  }

  generateSplitComplementary(baseHsl, count, brightness, saturation) {
    const colors = [];
    const [h, s, l] = baseHsl;
    const hues = [h, (h + 150) % 360, (h + 210) % 360];

    for (let i = 0; i < count; i++) {
      const newH = hues[i % 3];
      const newL = Math.max(
        10,
        Math.min(90, l + (Math.random() - 0.5) * (brightness / 100) * 40),
      );
      const newS = Math.max(
        20,
        Math.min(100, s + (Math.random() - 0.5) * (saturation / 100) * 30),
      );
      colors.push(this.hslToHex(newH, newS, newL));
    }

    return colors;
  }

  generateCompound(baseHsl, count, brightness, saturation) {
    const colors = [];
    const [h, s, l] = baseHsl;

    // Mix of analogous and complementary
    for (let i = 0; i < count; i++) {
      let newH;
      if (i < count / 2) {
        newH = (h + i * 30) % 360; // Analogous
      } else {
        newH = (h + 180 + (i - count / 2) * 30) % 360; // Complementary analogous
      }

      const newL = Math.max(
        10,
        Math.min(90, l + (Math.random() - 0.5) * (brightness / 100) * 40),
      );
      const newS = Math.max(
        20,
        Math.min(100, s + (Math.random() - 0.5) * (saturation / 100) * 30),
      );
      colors.push(this.hslToHex(newH, newS, newL));
    }

    return colors;
  }

  generateRandomColor() {
    const randomHex =
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");
    this.baseColor.value = randomHex;
    this.baseColorHex.value = randomHex;
    this.generatePalette();
  }

  // Display methods
  updatePaletteDisplay() {
    this.paletteContainer.innerHTML = "";
    const format = this.colorFormat.value;

    this.currentPalette.forEach((color, index) => {
      const colorCard = this.createColorCard(color, index, format);
      this.paletteContainer.appendChild(colorCard);
    });
  }

  createColorCard(hexColor, index, format) {
    const card = document.createElement("div");
    card.className = "color-card animate-fade-in";
    card.style.animationDelay = `${index * 0.1}s`;

    const preview = document.createElement("div");
    preview.className = "color-preview";
    preview.style.backgroundColor = hexColor;

    const info = document.createElement("div");
    info.className = "color-info";

    const name = document.createElement("span");
    name.className = "color-name";
    name.textContent = hexColor.toUpperCase();

    const formats = document.createElement("div");
    formats.className = "color-formats";

    // Add different format displays
    const formatData = this.getColorFormats(hexColor);
    Object.entries(formatData).forEach(([formatName, value]) => {
      if (formatName === format || format === "all") {
        const formatDiv = document.createElement("div");
        formatDiv.className = "color-format";

        const valueSpan = document.createElement("span");
        valueSpan.textContent = value;

        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-btn";
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.addEventListener("click", () => this.copyToClipboard(value));

        formatDiv.appendChild(valueSpan);
        formatDiv.appendChild(copyBtn);
        formats.appendChild(formatDiv);
      }
    });

    info.appendChild(name);
    info.appendChild(formats);
    card.appendChild(preview);
    card.appendChild(info);

    return card;
  }

  getColorFormats(hexColor) {
    const rgb = this.hexToRgb(hexColor);
    const hsl = this.hexToHsl(hexColor);
    const hsv = this.hexToHsv(hexColor);

    return {
      hex: hexColor.toUpperCase(),
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${Math.round(hsl[0])}°, ${Math.round(hsl[1])}%, ${Math.round(hsl[2])}%)`,
      hsv: `hsv(${Math.round(hsv[0])}°, ${Math.round(hsv[1])}%, ${Math.round(hsv[2])}%)`,
    };
  }

  updatePaletteInfo() {
    const harmonyNames = {
      monochromatic: "Monocromatica",
      analogous: "Analoga",
      complementary: "Complementare",
      triadic: "Triadica",
      tetradic: "Tetradica",
      splitComplementary: "Split-Complementare",
      compound: "Composta",
    };

    this.paletteType.textContent = harmonyNames[this.harmonyType.value];
    this.paletteCount.textContent = `${this.currentPalette.length} colori`;
  }

  // Color conversion utilities
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null;
  }

  hexToHsl(hex) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return [0, 0, 0];

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  }

  hexToHsv(hex) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return [0, 0, 0];

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    if (diff !== 0) {
      switch (max) {
        case r:
          h = ((g - b) / diff) % 6;
          break;
        case g:
          h = (b - r) / diff + 2;
          break;
        case b:
          h = (r - g) / diff + 4;
          break;
      }
    }

    const s = max === 0 ? 0 : diff / max;
    const v = max;

    return [h * 60, s * 100, v * 100];
  }

  hslToHex(h, s, l) {
    h = h % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0,
      g = 0,
      b = 0;

    if (0 <= h && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (240 <= h && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (300 <= h && h < 360) {
      r = c;
      g = 0;
      b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  isValidHex(hex) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  }

  // Palette management
  savePalette() {
    if (this.currentPalette.length === 0) {
      this.showToast("Genera prima una palette!", "warning");
      return;
    }

    const name = prompt("Inserisci un nome per la palette:");
    if (!name) return;

    const palette = {
      id: Date.now(),
      name: name.trim(),
      colors: [...this.currentPalette],
      harmony: this.harmonyType.value,
      createdAt: new Date().toISOString(),
    };

    this.savedPalettes.unshift(palette);
    this.updateStorage();
    this.updateCounts();
    this.showToast("Palette salvata con successo!", "success");
  }

  deletePalette(id) {
    const paletteIndex = this.savedPalettes.findIndex((p) => p.id === id);
    if (paletteIndex === -1) return;

    const palette = this.savedPalettes[paletteIndex];
    palette.deletedAt = new Date().toISOString();

    this.trashedPalettes.unshift(palette);
    this.savedPalettes.splice(paletteIndex, 1);

    this.updateStorage();
    this.updateCounts();
    this.renderSavedPalettes();
    this.showToast("Palette spostata nel cestino", "success");
  }

  restorePalette(id) {
    const paletteIndex = this.trashedPalettes.findIndex((p) => p.id === id);
    if (paletteIndex === -1) return;

    const palette = this.trashedPalettes[paletteIndex];
    delete palette.deletedAt;

    this.savedPalettes.unshift(palette);
    this.trashedPalettes.splice(paletteIndex, 1);

    this.updateStorage();
    this.updateCounts();
    this.renderTrashedPalettes();
    this.showToast("Palette ripristinata!", "success");
  }

  deletePermanently(id) {
    if (
      !confirm("Sei sicuro di voler eliminare definitivamente questa palette?")
    )
      return;

    this.trashedPalettes = this.trashedPalettes.filter((p) => p.id !== id);
    this.updateStorage();
    this.updateCounts();
    this.renderTrashedPalettes();
    this.showToast("Palette eliminata definitivamente", "error");
  }

  emptyTrash() {
    if (this.trashedPalettes.length === 0) {
      this.showToast("Il cestino è già vuoto", "warning");
      return;
    }

    if (!confirm("Sei sicuro di voler svuotare completamente il cestino?"))
      return;

    this.trashedPalettes = [];
    this.updateStorage();
    this.updateCounts();
    this.renderTrashedPalettes();
    this.showToast("Cestino svuotato", "success");
  }

  loadPalette(colors) {
    this.currentPalette = [...colors];

    // Imposta il primo colore come colore base
    const baseColor = colors[0];
    this.baseColor.value = baseColor;
    this.baseColorHex.value = baseColor;

    this.generatePalette(); // rigenera tutto correttamente
    this.showToast("Palette caricata!", "success");
  }

  // Modal management
  showSavedPalettes() {
    this.renderSavedPalettes();
    this.showModal(this.savedPalettesModal);
  }

  showTrashedPalettes() {
    this.renderTrashedPalettes();
    this.showModal(this.trashedPalettesModal);
  }

  showExportModal() {
    if (this.currentPalette.length === 0) {
      this.showToast("Genera prima una palette!", "warning");
      return;
    }

    this.updateExportCode();
    this.showModal(this.exportModal);
  }

  showImageModal() {
    if (this.currentPalette.length === 0) {
      this.showToast("Genera prima una palette!", "warning");
      return;
    }

    this.generatePaletteImage();
    this.showModal(this.imageModal);
  }

  showModal(modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  hideModal(modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  hideAllModals() {
    [
      this.savedPalettesModal,
      this.trashedPalettesModal,
      this.exportModal,
      this.imageModal,
    ].forEach((modal) => {
      this.hideModal(modal);
    });
  }

  // Rendering methods
  renderSavedPalettes() {
    if (this.savedPalettes.length === 0) {
      this.savedPalettesList.innerHTML =
        '<p class="text-center" style="color: var(--gray-500); padding: 2rem;">Nessuna palette salvata</p>';
      return;
    }

    this.savedPalettesList.innerHTML = this.savedPalettes
      .map(
        (palette) => `
      <div class="saved-palette">
        <div class="palette-header">
          <span class="palette-name">${palette.name}</span>
          <span class="palette-date">${new Date(palette.createdAt).toLocaleDateString("it-IT")}</span>
        </div>
        <div class="palette-colors">
          ${palette.colors.map((color) => `<div class="palette-color" style="background-color: ${color}"></div>`).join("")}
        </div>
        <div class="palette-actions">
          <button class="btn btn-primary" onclick="colorCraft.loadPalette(${JSON.stringify(palette.colors).replace(/"/g, "&quot;")})">
            <i class="fas fa-eye"></i> Carica
          </button>
          <button class="btn btn-danger" onclick="colorCraft.deletePalette(${palette.id})">
            <i class="fas fa-trash"></i> Elimina
          </button>
        </div>
      </div>
    `,
      )
      .join("");
  }

  renderTrashedPalettes() {
    if (this.trashedPalettes.length === 0) {
      this.trashedPalettesList.innerHTML =
        '<p class="text-center" style="color: var(--gray-500); padding: 2rem;">Nessuna palette nel cestino</p>';
      return;
    }

    this.trashedPalettesList.innerHTML = this.trashedPalettes
      .map(
        (palette) => `
      <div class="trashed-palette">
        <div class="palette-header">
          <span class="palette-name">${palette.name}</span>
          <span class="palette-date">Eliminata il ${new Date(palette.deletedAt).toLocaleDateString("it-IT")}</span>
        </div>
        <div class="palette-colors">
          ${palette.colors.map((color) => `<div class="palette-color" style="background-color: ${color}"></div>`).join("")}
        </div>
        <div class="palette-actions">
          <button class="btn btn-secondary" onclick="colorCraft.restorePalette(${palette.id})">
            <i class="fas fa-undo"></i> Ripristina
          </button>
          <button class="btn btn-danger" onclick="colorCraft.deletePermanently(${palette.id})">
            <i class="fas fa-trash"></i> Elimina
          </button>
        </div>
      </div>
    `,
      )
      .join("");
  }

  // Export functionality
  selectExportFormat(option) {
    document
      .querySelectorAll(".export-option")
      .forEach((opt) => opt.classList.remove("active"));
    option.classList.add("active");
    this.updateExportCode();
  }

  updateExportCode() {
    const activeFormat = document.querySelector(".export-option.active").dataset
      .format;
    let code = "";

    switch (activeFormat) {
      case "css":
        code = this.generateCSSCode();
        break;
      case "json":
        code = this.generateJSONCode();
        break;
      case "scss":
        code = this.generateSCSSCode();
        break;
      case "ase":
        code = this.generateASECode();
        break;
    }

    this.exportCode.value = code;
  }

  generateCSSCode() {
    let css = ":root {\n";
    this.currentPalette.forEach((color, index) => {
      css += `  --color-${index + 1}: ${color};\n`;
    });
    css += "}\n\n";

    this.currentPalette.forEach((color, index) => {
      css += `.color-${index + 1} {\n  background-color: var(--color-${index + 1});\n}\n\n`;
    });

    return css;
  }

  generateJSONCode() {
    const palette = {
      name: "Generated Palette",
      harmony: this.harmonyType.value,
      colors: this.currentPalette.map((color, index) => ({
        name: `Color ${index + 1}`,
        hex: color,
        ...this.getColorFormats(color),
      })),
    };

    return JSON.stringify(palette, null, 2);
  }

  generateSCSSCode() {
    let scss = "// Color Palette Variables\n";
    this.currentPalette.forEach((color, index) => {
      scss += `$color-${index + 1}: ${color};\n`;
    });
    scss += "\n// Color Map\n$colors: (\n";
    this.currentPalette.forEach((color, index) => {
      scss += `  "color-${index + 1}": $color-${index + 1}${index < this.currentPalette.length - 1 ? "," : ""}\n`;
    });
    scss += ");\n\n";

    scss += "// Utility Classes\n";
    this.currentPalette.forEach((color, index) => {
      scss += `.color-${index + 1} {\n  background-color: $color-${index + 1};\n}\n\n`;
    });

    return scss;
  }

  generateASECode() {
    return `Adobe Swatch Exchange (ASE) format is binary.\nUse the download feature to get the actual ASE file.\n\nColors in this palette:\n${this.currentPalette.map((color, index) => `${index + 1}. ${color}`).join("\n")}`;
  }

  copyExportCode() {
    this.copyToClipboard(this.exportCode.value);
  }

  // Image generation
  generatePaletteImage() {
    const canvas = this.paletteCanvas;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Calculate dimensions
    const colorWidth = width / this.currentPalette.length;
    const mainHeight = height * 0.75;
    const infoHeight = height * 0.25;

    // Draw main colors
    this.currentPalette.forEach((color, index) => {
      const x = index * colorWidth;

      // Main color block
      ctx.fillStyle = color;
      ctx.fillRect(x, 0, colorWidth, mainHeight);

      // Color code text
      ctx.fillStyle = this.getContrastColor(color);
      ctx.font = "bold 24px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(color.toUpperCase(), x + colorWidth / 2, mainHeight / 2);

      // Color variations
      const variations = this.generateColorVariations(color);
      const varHeight = infoHeight / variations.length;

      variations.forEach((variation, varIndex) => {
        ctx.fillStyle = variation;
        ctx.fillRect(
          x,
          mainHeight + varIndex * varHeight,
          colorWidth,
          varHeight,
        );
      });
    });

    // Add title and info
    ctx.fillStyle = "#333333";
    ctx.font = "bold 32px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("ColorCraft Palette", 40, height - 40);

    ctx.font = "18px Inter, sans-serif";
    ctx.textAlign = "right";
    const harmonyNames = {
      monochromatic: "Monocromatica",
      analogous: "Analoga",
      complementary: "Complementare",
      triadic: "Triadica",
      tetradic: "Tetradica",
      splitComplementary: "Split-Complementare",
      compound: "Composta",
    };
    ctx.fillText(
      `${harmonyNames[this.harmonyType.value]} • ${new Date().toLocaleDateString("it-IT")}`,
      width - 40,
      height - 40,
    );
  }

  generateColorVariations(hexColor) {
    const hsl = this.hexToHsl(hexColor);
    const variations = [];

    // Lighter and darker variations
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue; // Skip the original color
      const newL = Math.max(5, Math.min(95, hsl[2] + i * 15));
      variations.push(this.hslToHex(hsl[0], hsl[1], newL));
    }

    return variations;
  }

  getContrastColor(hexColor) {
    const rgb = this.hexToRgb(hexColor);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#ffffff";
  }

  downloadImage() {
    const link = document.createElement("a");
    link.download = `colorcraft-palette-${Date.now()}.png`;
    link.href = this.paletteCanvas.toDataURL("image/png", 1.0);
    link.click();
    this.showToast("Immagine scaricata!", "success");
  }

  async copyImage() {
    try {
      this.paletteCanvas.toBlob(
        async (blob) => {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          this.showToast("Immagine copiata negli appunti!", "success");
        },
        "image/png",
        1.0,
      );
    } catch (error) {
      this.showToast("Errore nella copia dell'immagine", "error");
    }
  }

  // Utility methods
  copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.showToast("Copiato negli appunti!", "success");
      })
      .catch(() => {
        this.showToast("Errore nella copia", "error");
      });
  }

  updateStorage() {
    localStorage.setItem("savedPalettes", JSON.stringify(this.savedPalettes));
    localStorage.setItem(
      "trashedPalettes",
      JSON.stringify(this.trashedPalettes),
    );
  }

  updateCounts() {
    this.savedCount.textContent = this.savedPalettes.length;
    this.trashedCount.textContent = this.trashedPalettes.length;
  }

  showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-exclamation-triangle"} toast-icon"></i>
      <span class="toast-message">${message}</span>
    `;

    toast.classList.add(type);
    this.toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add("show"), 100);

    // Remove after delay
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize the application
const colorCraft = new ColorCraft();
