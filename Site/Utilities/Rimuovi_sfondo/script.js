// ── Imports ────────────────────────────────────────────────────────────────────
import {
  pipeline,
  env,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3/dist/transformers.min.js";

// Use remote models (browser caches after first download)
env.allowLocalModels = false;
env.useBrowserCache = true;

// ── DOM refs ───────────────────────────────────────────────────────────────────
const fileInput = document.getElementById("fileInput");
const dropLabel = document.getElementById("dropLabel");
const removeBtn = document.getElementById("removeBtn");
const statusEl = document.getElementById("status");
const loader = document.getElementById("loader");
const loaderFill = document.getElementById("loaderFill");
const loaderText = document.getElementById("loaderText");
const previews = document.getElementById("previews");
const originalCanvas = document.getElementById("originalCanvas");
const resultCanvas = document.getElementById("resultCanvas");
const emptyResult = document.getElementById("emptyResult");
const downloadSection = document.getElementById("downloadSection");
const downloadBtn = document.getElementById("downloadBtn");
const modelBanner = document.getElementById("modelBanner");
const modelReady = document.getElementById("modelReady");
const modelStatus = document.getElementById("modelStatus");
const uploadZone = document.getElementById("uploadZone");

// ── State ──────────────────────────────────────────────────────────────────────
let segmenter = null;
let currentFile = null;
let modelLoaded = false;

// ── Helpers ────────────────────────────────────────────────────────────────────
function setStatus(msg, type = "info") {
  statusEl.textContent = msg;
  statusEl.className = `status-bar ${type}`;
}

function setLoader(active, text = "", progress = null) {
  loader.classList.toggle("active", active);
  if (text) loaderText.textContent = text;
  if (progress === null) {
    loaderFill.style.width = "0%";
    loaderFill.classList.add("indeterminate");
  } else {
    loaderFill.classList.remove("indeterminate");
    loaderFill.style.width = progress + "%";
  }
}

// ── Load AI model ──────────────────────────────────────────────────────────────
async function loadModel() {
  try {
    modelStatus.textContent =
      "Download in corso (prima volta ~50MB, poi in cache)…";
    setStatus("Caricamento modello AI RMBG-1.4…", "warning");

    // Try WebGPU first for speed, fall back to WASM
    try {
      segmenter = await pipeline("background-removal", "briaai/RMBG-1.4", {
        device: "webgpu",
      });
    } catch {
      modelStatus.textContent = "WebGPU non disponibile, uso WebAssembly…";
      segmenter = await pipeline("background-removal", "briaai/RMBG-1.4", {
        device: "wasm",
      });
    }

    modelBanner.style.display = "none";
    modelReady.style.display = "flex";
    modelLoaded = true;

    setStatus("Modello AI pronto. Carica un'immagine per iniziare.", "success");
    uploadZone.style.opacity = "1";
    uploadZone.style.pointerEvents = "auto";

    if (currentFile) removeBtn.disabled = false;
  } catch (err) {
    console.error("Model load error:", err);
    modelBanner.innerHTML =
      '<span style="color:#ff8fa3">❌ Errore caricamento modello. Verifica la connessione e ricarica la pagina.</span>';
    setStatus("Errore caricamento modello AI.", "error");
  }
}

// ── Remove background ──────────────────────────────────────────────────────────
async function removeBackground() {
  if (!segmenter || !currentFile) return;

  removeBtn.disabled = true;
  emptyResult.style.display = "none";
  setLoader(true, "Preparazione immagine…", 10);
  setStatus("Elaborazione con rete neurale…", "warning");

  try {
    const imgURL = URL.createObjectURL(currentFile);

    setLoader(true, "Inferenza AI in corso (5–20s)…", 30);
    const output = await segmenter(imgURL);
    URL.revokeObjectURL(imgURL);

    setLoader(true, "Applicazione maschera…", 80);
    await compositeResult(currentFile, output);

    setLoader(true, "Finalizzazione…", 100);
    await new Promise((r) => setTimeout(r, 150));
    setLoader(false);

    resultCanvas.toBlob((blob) => {
      downloadBtn.href = URL.createObjectURL(blob);
      downloadSection.classList.add("visible");
    }, "image/png");

    setStatus("✦ Sfondo rimosso con successo!", "success");
  } catch (err) {
    console.error("Remove BG error:", err);
    setStatus("Errore durante l'elaborazione AI. Riprova.", "error");
    setLoader(false);
    emptyResult.style.display = "block";
  } finally {
    removeBtn.disabled = false;
  }
}

// ── Composite: original image × AI mask → result canvas ───────────────────────
// background-removal pipeline in Transformers.js v3 returns a RawImage (RGBA)
// where the alpha channel already encodes the mask. Use toCanvas()/toBlob() directly.
async function compositeResult(imageFile, output) {
  return new Promise(async (resolve, reject) => {
    try {
      // Unwrap array if needed
      const raw = Array.isArray(output) ? output[0] : output;

      // Fast path: RawImage has toCanvas()
      if (raw && typeof raw.toCanvas === "function") {
        const c = raw.toCanvas();
        resultCanvas.width = c.width;
        resultCanvas.height = c.height;
        resultCanvas.getContext("2d").drawImage(c, 0, 0);
        return resolve();
      }

      // Second path: RawImage has toBlob()
      if (raw && typeof raw.toBlob === "function") {
        const blob = await raw.toBlob();
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          resultCanvas.width = img.naturalWidth;
          resultCanvas.height = img.naturalHeight;
          resultCanvas.getContext("2d").drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = reject;
        img.src = url;
        return;
      }

      // Fallback: manual pixel composite using raw pixel data
      const origImg = new Image();
      origImg.onload = async () => {
        const w = origImg.naturalWidth;
        const h = origImg.naturalHeight;
        const origC = document.createElement("canvas");
        origC.width = w;
        origC.height = h;
        const origCtx = origC.getContext("2d");
        origCtx.drawImage(origImg, 0, 0, w, h);
        const origPx = origCtx.getImageData(0, 0, w, h);

        const maskPx = await extractMaskPixels(output, w, h);
        const composed = origCtx.createImageData(w, h);
        for (let i = 0; i < origPx.data.length; i += 4) {
          composed.data[i] = origPx.data[i];
          composed.data[i + 1] = origPx.data[i + 1];
          composed.data[i + 2] = origPx.data[i + 2];
          composed.data[i + 3] = maskPx[i];
        }
        resultCanvas.width = w;
        resultCanvas.height = h;
        resultCanvas.getContext("2d").putImageData(composed, 0, 0);
        resolve();
      };
      origImg.onerror = reject;
      origImg.src = URL.createObjectURL(imageFile);
    } catch (e) {
      reject(e);
    }
  });
}

// ── Extract mask pixels from any Transformers.js v3 output format ──────────────
// Returns Uint8ClampedArray where every 4th byte (red channel) is the mask value (0–255)
async function extractMaskPixels(output, targetW, targetH) {
  // --- Format A: pipeline returns array of RawImage objects directly ---
  // briaai/RMBG-1.4 with subtask:'background-removal' returns the masked RGBA image
  // as output[0] (a RawImage with channels=4, alpha=mask)
  if (Array.isArray(output)) {
    const first = output[0];

    if (first && first.data && first.width && first.height) {
      // It's a RawImage. Check channels.
      return rawImageToAlpha(first, targetW, targetH);
    }

    // --- Format B: array with {mask: RawImage, label, score} objects ---
    if (first && first.mask && first.mask.data) {
      return rawImageToAlpha(first.mask, targetW, targetH);
    }

    // --- Format C: output is array with an object that has a .output RawImage ---
    if (first && first.output && first.output.data) {
      return rawImageToAlpha(first.output, targetW, targetH);
    }
  }

  // --- Format D: output is a single RawImage (not array) ---
  if (output && output.data && output.width) {
    return rawImageToAlpha(output, targetW, targetH);
  }

  throw new Error(
    "Unknown output format from segmentation pipeline: " +
      JSON.stringify(output),
  );
}

// Convert a RawImage (any channel count) to a scaled greyscale Uint8ClampedArray
function rawImageToAlpha(raw, targetW, targetH) {
  const { width: mW, height: mH, channels, data } = raw;
  const isFloat = !(
    data instanceof Uint8ClampedArray || data instanceof Uint8Array
  );

  // Build greyscale canvas at native mask resolution
  const tmpC = document.createElement("canvas");
  tmpC.width = mW;
  tmpC.height = mH;
  const tmpCtx = tmpC.getContext("2d");
  const imgData = tmpCtx.createImageData(mW, mH);

  for (let i = 0; i < mW * mH; i++) {
    let v;
    if (channels === 1) {
      v = data[i];
    } else if (channels === 4) {
      // Use alpha channel
      v = data[i * 4 + 3];
    } else {
      // RGB — average
      v =
        (data[i * channels] + data[i * channels + 1] + data[i * channels + 2]) /
        3;
    }
    // Normalise float [0,1] → [0,255]
    if (isFloat) v = Math.round(v * 255);
    v = Math.max(0, Math.min(255, Math.round(v)));

    imgData.data[i * 4] = v;
    imgData.data[i * 4 + 1] = v;
    imgData.data[i * 4 + 2] = v;
    imgData.data[i * 4 + 3] = 255;
  }
  tmpCtx.putImageData(imgData, 0, 0);

  // Scale to target resolution using drawImage (bilinear)
  const scaledC = document.createElement("canvas");
  scaledC.width = targetW;
  scaledC.height = targetH;
  const scaledCtx = scaledC.getContext("2d");
  scaledCtx.drawImage(tmpC, 0, 0, targetW, targetH);

  return scaledCtx.getImageData(0, 0, targetW, targetH).data;
}

// ── Load preview after file selection ─────────────────────────────────────────
function loadPreview(file) {
  currentFile = file;

  const img = new Image();
  img.onload = () => {
    const maxSize = 900;
    let w = img.width,
      h = img.height;
    if (w > h) {
      if (w > maxSize) {
        h = Math.round((h * maxSize) / w);
        w = maxSize;
      }
    } else {
      if (h > maxSize) {
        w = Math.round((w * maxSize) / h);
        h = maxSize;
      }
    }

    originalCanvas.width = w;
    originalCanvas.height = h;
    originalCanvas.getContext("2d").drawImage(img, 0, 0, w, h);

    resultCanvas.width = 0;
    resultCanvas.height = 0;
    emptyResult.style.display = "block";
    downloadSection.classList.remove("visible");
    previews.classList.add("visible");

    if (modelLoaded) {
      removeBtn.disabled = false;
      setStatus(
        'Immagine caricata. Premi "Rimuovi sfondo" per elaborare.',
        "success",
      );
    } else {
      setStatus(
        "Immagine caricata. Attendi il caricamento del modello AI…",
        "warning",
      );
    }
  };
  img.src = URL.createObjectURL(file);
}

// ── Drag & Drop ────────────────────────────────────────────────────────────────
dropLabel.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropLabel.classList.add("drag-over");
});
dropLabel.addEventListener("dragleave", () =>
  dropLabel.classList.remove("drag-over"),
);
dropLabel.addEventListener("drop", (e) => {
  e.preventDefault();
  dropLabel.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) loadPreview(file);
});

// ── Event listeners ────────────────────────────────────────────────────────────
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) loadPreview(file);
});

removeBtn.addEventListener("click", removeBackground);

downloadBtn.addEventListener("click", () => {
  setTimeout(() => URL.revokeObjectURL(downloadBtn.href), 1200);
});

// ── Init ───────────────────────────────────────────────────────────────────────
uploadZone.style.opacity = "0.5";
uploadZone.style.pointerEvents = "none";
loadModel();
