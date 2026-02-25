// Elementi DOM
const fileInput = document.getElementById("fileInput");
const removeBtn = document.getElementById("removeBtn");
const statusEl = document.getElementById("status");
const loader = document.getElementById("loader");
const modeSelector = document.getElementById("modeSelector");
const previews = document.getElementById("previews");
const originalCanvas = document.getElementById("originalCanvas");
const resultCanvas = document.getElementById("resultCanvas");
const downloadSection = document.getElementById("downloadSection");
const downloadBtn = document.getElementById("downloadBtn");
const typeBadge = document.getElementById("typeBadge");
const sliderContainer = document.getElementById("sliderContainer");
const sensitivitySlider = document.getElementById("sensitivitySlider");
const sensitivityValue = document.getElementById("sensitivityValue");

// Stato
let currentImageData = null;
let currentMode = "auto";
let imageType = "auto";
let originalImage = null;

// Sensibilità
sensitivitySlider.addEventListener("input", () => {
  sensitivityValue.textContent = sensitivitySlider.value;
});

// Gestione bottoni modalità
document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".mode-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentMode = btn.dataset.mode;

    if (currentImageData) {
      removeBackground();
    }
  });
});

function setStatus(message, type = "info") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

// Analisi avanzata del tipo di immagine
function analyzeImageTypeAdvanced(imageData) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  let edgePixels = 0;
  let bgPixels = 0;
  let objectPixels = 0;
  let varianceSum = 0;

  // Analisi dettagliata dei bordi
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x < 10 || y < 10 || x > width - 11 || y > height - 11) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        edgePixels++;

        const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
        varianceSum += variance;

        if (variance < 30) {
          bgPixels++;
        }
      } else {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
        if (variance > 50) {
          objectPixels++;
        }
      }
    }
  }

  const bgRatio = bgPixels / edgePixels;
  const objectRatio = objectPixels / (width * height - edgePixels);
  const avgVariance = varianceSum / edgePixels;

  // Loghi: sfondo uniforme ai bordi
  if (bgRatio > 0.7 && avgVariance < 40) {
    return "logo";
  }

  // Oggetti: molta varianza interna e bordi variabili
  if (objectRatio > 0.4 && avgVariance > 30) {
    return "oggetto";
  }

  // Persone: pattern specifici (tonalità pelle, contrasto)
  if (objectRatio > 0.3 && avgVariance > 50) {
    return "persona";
  }

  return "oggetto"; // Default per foto generiche
}

// Algoritmo per oggetti (basato su gradienti e bordi)
function removeObjectBackground(imageData) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);
  const resultData = result.data;

  const sensitivity = parseInt(sensitivitySlider.value) / 100;
  const threshold = 30 + sensitivity * 50;

  // Crea mappa dei gradienti per trovare i bordi
  const gradientMap = new Uint8Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;

      const gx =
        Math.abs(data[i] - data[(y * width + (x + 1)) * 4]) +
        Math.abs(data[i + 1] - data[(y * width + (x + 1)) * 4 + 1]) +
        Math.abs(data[i + 2] - data[(y * width + (x + 1)) * 4 + 2]);

      const gy =
        Math.abs(data[i] - data[((y + 1) * width + x) * 4]) +
        Math.abs(data[i + 1] - data[((y + 1) * width + x) * 4 + 1]) +
        Math.abs(data[i + 2] - data[((y + 1) * width + x) * 4 + 2]);

      gradientMap[y * width + x] = Math.min(255, (gx + gy) / 2);
    }
  }

  // Trova colore sfondo dai bordi
  let bgR = 0,
    bgG = 0,
    bgB = 0,
    bgCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x < 10 || y < 10 || x > width - 11 || y > height - 11) {
        const i = (y * width + x) * 4;
        const grad = gradientMap[y * width + x];

        if (grad < 20) {
          // Se il gradiente è basso, è probabile sfondo
          bgR += data[i];
          bgG += data[i + 1];
          bgB += data[i + 2];
          bgCount++;
        }
      }
    }
  }

  if (bgCount > 0) {
    bgR /= bgCount;
    bgG /= bgCount;
    bgB /= bgCount;
  } else {
    bgR = data[0];
    bgG = data[1];
    bgB = data[2];
  }

  // Rimuovi sfondo basato su colore E gradienti
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const colorDiff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);

    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);
    const grad = gradientMap[y * width + x];

    // Se colore simile allo sfondo E gradiente basso, rimuovi
    if (colorDiff < threshold && grad < 30) {
      resultData[i + 3] = 0;
    } else {
      resultData[i] = r;
      resultData[i + 1] = g;
      resultData[i + 2] = b;
      resultData[i + 3] = 255;
    }
  }

  return result;
}

// Algoritmo per persone (più sensibile ai dettagli)
function removePersonBackground(imageData) {
  return removeObjectBackground(imageData); // Usa lo stesso ma con sensibilità diversa
}

// Algoritmo per loghi
function removeLogoBackground(imageData) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);
  const resultData = result.data;

  const colorCounts = new Map();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x < 5 || y < 5 || x > width - 6 || y > height - 6) {
        const i = (y * width + x) * 4;
        const r = Math.round(data[i] / 20) * 20;
        const g = Math.round(data[i + 1] / 20) * 20;
        const b = Math.round(data[i + 2] / 20) * 20;
        const key = `${r},${g},${b}`;
        colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
      }
    }
  }

  let maxCount = 0;
  let bgColor = [255, 255, 255];

  for (const [color, count] of colorCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      bgColor = color.split(",").map(Number);
    }
  }

  const threshold = 60;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const diff =
      Math.abs(r - bgColor[0]) +
      Math.abs(g - bgColor[1]) +
      Math.abs(b - bgColor[2]);

    if (diff < threshold) {
      resultData[i + 3] = 0;
    } else {
      resultData[i] = r;
      resultData[i + 1] = g;
      resultData[i + 2] = b;
      resultData[i + 3] = 255;
    }
  }

  return result;
}

function removeBackground() {
  if (!currentImageData) return;

  loader.classList.add("active");
  removeBtn.disabled = true;
  setStatus("Rimuovo lo sfondo...", "warning");

  setTimeout(() => {
    try {
      let resultImageData;

      const detectedType = analyzeImageTypeAdvanced(currentImageData);

      if (currentMode === "auto") {
        if (detectedType === "logo") {
          resultImageData = removeLogoBackground(currentImageData);
        } else {
          resultImageData = removeObjectBackground(currentImageData);
        }
      } else if (currentMode === "logo") {
        resultImageData = removeLogoBackground(currentImageData);
      } else {
        resultImageData = removeObjectBackground(currentImageData);
      }

      resultCanvas.width = resultImageData.width;
      resultCanvas.height = resultImageData.height;
      const ctx = resultCanvas.getContext("2d");
      ctx.putImageData(resultImageData, 0, 0);

      resultCanvas.toBlob((blob) => {
        downloadBtn.href = URL.createObjectURL(blob);
        downloadSection.style.display = "block";
        setStatus("✅ Sfondo rimosso con successo!", "success");
      }, "image/png");
    } catch (error) {
      setStatus("❌ Errore durante la rimozione", "error");
      console.error(error);
    } finally {
      loader.classList.remove("active");
      removeBtn.disabled = false;
    }
  }, 100);
}

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setStatus("Caricamento in corso...", "warning");
  loader.classList.add("active");

  const img = new Image();
  img.onload = () => {
    try {
      const maxSize = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      originalCanvas.width = width;
      originalCanvas.height = height;
      const ctx = originalCanvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      currentImageData = ctx.getImageData(0, 0, width, height);

      imageType = analyzeImageTypeAdvanced(currentImageData);

      const typeLabels = {
        oggetto: "📦 Oggetto rilevato",
        persona: "👤 Persona rilevata",
        logo: "🎯 Logo rilevato",
        foto: "📸 Foto",
      };

      typeBadge.textContent = typeLabels[imageType] || "✨ Immagine pronta";
      typeBadge.className = `badge badge-${imageType}`;

      removeBtn.disabled = false;
      modeSelector.style.display = "flex";
      sliderContainer.classList.add("active");
      previews.style.display = "grid";
      downloadSection.style.display = "none";

      resultCanvas.width = 0;
      resultCanvas.height = 0;

      setStatus(
        '✅ Immagine caricata! Regola la sensibilità e clicca "Rimuovi sfondo"',
        "success",
      );
    } catch (error) {
      setStatus("❌ Errore nel caricamento", "error");
      console.error(error);
    } finally {
      loader.classList.remove("active");
    }
  };

  img.onerror = () => {
    setStatus("❌ Errore nel caricamento del file", "error");
    loader.classList.remove("active");
  };

  img.src = URL.createObjectURL(file);
});

removeBtn.addEventListener("click", removeBackground);

downloadBtn.addEventListener("click", () => {
  setTimeout(() => {
    URL.revokeObjectURL(downloadBtn.href);
  }, 1000);
});
