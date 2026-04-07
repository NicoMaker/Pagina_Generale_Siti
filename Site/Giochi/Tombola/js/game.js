// Game state
let numbers = [];
const extractedNumbers = new Set();
let isFirstStart = true;
let gameStarted = false;
let currentNumber = null;
let autoGenerateInterval = null;
let secondsInterval = 3;
let lastExtractedTime = 0;
let isAnimating = false;

// Announce state
let announceTimeout = null;
let isAnnouncingNumbers = false;
let stopAnnounceFlag = false;
let announceMode = "all";
let countPreset = 10;
let allPreset = "all";
let rangeFrom = 1;
let rangeTo = 90;

// DOM Elements
const extractBtn = document.getElementById("extractBtn");
const resetBtn = document.getElementById("resetBtn");
const autoBtn = document.getElementById("autoBtn");
const intervalInput = document.getElementById("intervalInput");
const intervalLabel = document.getElementById("intervalLabel");
const currentNumberDisplay = document.getElementById("currentNumber");
const tombolaContainer = document.getElementById("tombola-container");
const confettiContainer = document.getElementById("confettiContainer");

// Speech synthesis
const synth = window.speechSynthesis;
let speechEnabled = true;

// ─── INIT ─────────────────────────────────────────────────────────────────────

async function initGame() {
  tombolaContainer.innerHTML = '<div class="loading">Caricamento tabellone...</div>';
  numbers = Array.from({ length: 90 }, (_, i) => i + 1);

  try {
    const response = await fetch("../tables.json");
    const data = await response.json();
    generateTables(data.tables);
  } catch (error) {
    console.error("Error loading tables:", error);
    const fallbackTable = { numbers: Array.from({ length: 90 }, (_, i) => i + 1) };
    generateTables([fallbackTable]);
    showNotification("Errore nel caricamento delle tabelle. Utilizzando tabella predefinita.", "error");
  }

  if (intervalInput) {
    intervalInput.addEventListener("input", () => {
      secondsInterval = parseFloat(intervalInput.value);
      if (intervalLabel) intervalLabel.textContent = secondsInterval + "s";
    });
    secondsInterval = parseFloat(intervalInput.value) || 3;
    if (intervalLabel) intervalLabel.textContent = secondsInterval + "s";
  }

  const speedSlider = document.getElementById("announceSpeed");
  const speedLabel = document.getElementById("speedLabel");
  if (speedSlider && speedLabel) {
    speedSlider.addEventListener("input", () => {
      speedLabel.textContent = speedSlider.value + "s";
    });
  }

  const checkInput = document.getElementById("checkNumberInput");
  if (checkInput) {
    checkInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") checkNumber();
    });
  }

  // ── Clamp tutti gli input[type=number] entro min/max ──────────────────────
  function clampInput(el) {
    const min = parseInt(el.min);
    const max = parseInt(el.max);
    el.addEventListener("input", () => {
      let val = parseInt(el.value);
      if (isNaN(val)) return;
      if (val < min) el.value = min;
      if (val > max) el.value = max;
      syncPresetButtons(el);
    });
    el.addEventListener("blur", () => {
      let val = parseInt(el.value);
      if (isNaN(val) || val < min) el.value = min;
      if (val > max) el.value = max;
      syncPresetButtons(el);
    });
    el.addEventListener("keydown", (e) => {
      const val = parseInt(el.value) || 0;
      if (e.key === "ArrowUp"   && val >= max) e.preventDefault();
      if (e.key === "ArrowDown" && val <= min) e.preventDefault();
    });
    el.addEventListener("keyup", () => {
      syncPresetButtons(el);
    });
  }
  document.querySelectorAll('input[type="number"]').forEach(clampInput);
  // ─────────────────────────────────────────────────────────────────────────

  // ── Sincronizza bottoni preset quando si scrive nel campo ─────────────────
  function syncPresetButtons(el) {
    const id = el.id;
    const val = parseInt(el.value);

    // Campo "N personalizzato" (Ultimi N)
    if (id === "customCountInput") {
      const btns = document.querySelectorAll("#modeCount .preset-btn");
      btns.forEach(b => b.classList.remove("active"));
      if (!isNaN(val)) {
        btns.forEach(b => {
          const bval = b.dataset.val;
          if (bval !== "all" && parseInt(bval) === val) b.classList.add("active");
        });
      }
      if (!isNaN(val)) countPreset = val;
      return;
    }

    // Campi Da / A (Range)
    if (id === "rangeFrom" || id === "rangeTo") {
      const from = parseInt(document.getElementById("rangeFrom").value) || 1;
      const to   = parseInt(document.getElementById("rangeTo").value)   || 90;
      rangeFrom = from;
      rangeTo   = to;
      const btns = document.querySelectorAll("#modeRange .preset-btn");
      btns.forEach(b => b.classList.remove("active"));
      btns.forEach(b => {
        if (parseInt(b.dataset.from) === from && parseInt(b.dataset.to) === to) {
          b.classList.add("active");
        }
      });
      return;
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  extractBtn.addEventListener("click", startGame);
  resetBtn.addEventListener("click", resetGame);
  if (autoBtn) autoBtn.addEventListener("click", toggleAutoGenerate);

  addSpeechToggle();
  updateUI();
  addSwipeGestures();
  addKeyboardShortcuts();

  setTimeout(() => { speak("Si inizia!"); }, 1000);
}

// ─── TABLES ───────────────────────────────────────────────────────────────────

function generateTables(tablesData) {
  let tableContent = "";
  tablesData.forEach((table) => {
    tableContent += `<div class="sub-table"><table>`;
    for (let i = 0; i < table.numbers.length; i += 5) {
      tableContent += `<tr>`;
      for (let j = 0; j < 5; j++) {
        const number = table.numbers[i + j];
        tableContent += number
          ? `<td id="nr${number}" onclick="choseMe(this)">${number}</td>`
          : `<td></td>`;
      }
      tableContent += `</tr>`;
    }
    tableContent += `</table></div>`;
  });
  tombolaContainer.innerHTML = tableContent;

  document.querySelectorAll(".sub-table").forEach((table, index) => {
    table.style.animationDelay = `${index * 0.1}s`;
    table.classList.add("fade-in");
  });
}

// ─── GAME FLOW ────────────────────────────────────────────────────────────────

function startGame() {
  if (isAnimating) return;
  if (isFirstStart) {
    speak("Si inizia!");
    isFirstStart = false;
    gameStarted = true;
    extractBtn.innerHTML = '<i class="fas fa-random"></i> Estrai Numero';
    extractBtn.classList.add("pulse-animation");
    setTimeout(() => { extractBtn.classList.remove("pulse-animation"); }, 2000);
    return;
  }
  extractRandom();
}

function toggleAutoGenerate() {
  if (autoGenerateInterval) {
    clearInterval(autoGenerateInterval);
    autoGenerateInterval = null;
    autoBtn.innerHTML = '<i class="fas fa-play"></i> <span>Avvia Automatico</span>';
    autoBtn.classList.remove("danger");
    autoBtn.classList.add("success");
    if (intervalInput) intervalInput.disabled = false;
    speak("Estrazione automatica fermata");
  } else {
    if (isFirstStart) startGame();
    if (numbers.length <= 0) {
      showNotification("Tutti i numeri sono stati estratti!", "warning");
      return;
    }
    autoBtn.innerHTML = '<i class="fas fa-stop"></i> <span>Ferma Automatico</span>';
    autoBtn.classList.remove("success");
    autoBtn.classList.add("danger");
    if (intervalInput) intervalInput.disabled = true;
    extractRandom();
    autoGenerateInterval = setInterval(extractRandom, secondsInterval * 1000);
  }
}

function extractRandom() {
  if (isAnimating) return;
  const now = Date.now();
  if (now - lastExtractedTime < 1000) return;
  lastExtractedTime = now;

  if (numbers.length <= 0) {
    if (autoGenerateInterval) {
      toggleAutoGenerate();
      showNotification("Tutti i numeri sono stati estratti!", "success");
    }
    return;
  }

  const idx = Math.floor(Math.random() * numbers.length);
  const num = numbers[idx];
  if (!extractedNumbers.has(num)) {
    isAnimating = true;
    selectNr(num);
    setTimeout(() => { isAnimating = false; }, 2000);
  }
}

function selectNr(nn) {
  const celnode = document.getElementById("nr" + nn);
  if (!celnode) return;

  celnode.className = "on";
  numbers.splice(numbers.indexOf(nn), 1);
  extractedNumbers.add(nn);

  let blinkCount = 9;
  const blinkInterval = setInterval(() => {
    celnode.className = blinkCount % 2 === 0 ? "on" : "blink";
    blinkCount--;
    if (blinkCount < 0) { clearInterval(blinkInterval); celnode.className = "on"; }
  }, 300);

  speak(`${nn}`);

  if (extractedNumbers.size === 10) setTimeout(() => speak("Estratti 10 numeri!"), 1500);
  else if (extractedNumbers.size === 20) setTimeout(() => speak("Estratti 20 numeri!"), 1500);
  else if (extractedNumbers.size === 90) setTimeout(() => speak("Tutti i numeri estratti!"), 1500);

  currentNumber = nn;
  updateUI(true);

  if (extractedNumbers.size % 10 === 0) createConfetti();
  updateExtractedNumbers();
}

function resetNr(nn) {
  const celnode = document.getElementById("nr" + nn);
  if (!celnode) return;
  celnode.className = "";
  extractedNumbers.delete(nn);
  numbers.push(nn);
  updateUI();
  updateExtractedNumbers();
}

function choseMe(anode) {
  if (isAnimating) return;
  const nn = +anode.id.match(/\d+/)[0];
  if (!extractedNumbers.has(nn)) selectNr(nn);
  else resetNr(nn);
}

function updateUI(animate = false) {
  if (currentNumberDisplay) {
    const numberSpan = currentNumberDisplay.querySelector("span");
    if (animate && currentNumber) {
      numberSpan.classList.add("number-change");
      setTimeout(() => { numberSpan.classList.remove("number-change"); }, 1000);
    }
    numberSpan.textContent = currentNumber ? currentNumber : "?";
  }
  updateExtractedNumbers();
}

function updateExtractedNumbers() {
  const extractedList = document.getElementById("extractedNumbersList");
  if (!extractedList) return;
  extractedList.innerHTML = "";
  Array.from(extractedNumbers).sort((a, b) => a - b).forEach((number) => {
    const tag = document.createElement("div");
    tag.className = "number-tag";
    tag.textContent = number;
    tag.setAttribute("aria-label", `Numero estratto ${number}`);
    extractedList.appendChild(tag);
  });
  const heading = document.querySelector(".extracted-numbers h3");
  if (heading) heading.textContent = `Numeri Estratti (${extractedNumbers.size}/90)`;
}

function resetGame() {
  if (isAnimating) return;
  if (autoGenerateInterval) {
    clearInterval(autoGenerateInterval);
    autoGenerateInterval = null;
    if (autoBtn) {
      autoBtn.innerHTML = '<i class="fas fa-play"></i> <span>Avvia Automatico</span>';
      autoBtn.classList.remove("danger");
      autoBtn.classList.add("success");
    }
    if (intervalInput) intervalInput.disabled = false;
  }

  stopAnnouncement();
  speak("Tabellone resettato!");
  isFirstStart = true;
  gameStarted = false;
  extractedNumbers.clear();
  numbers = Array.from({ length: 90 }, (_, i) => i + 1);
  currentNumber = null;

  document.querySelectorAll('td[id^="nr"]').forEach((cell, index) => {
    setTimeout(() => { cell.className = ""; }, index * 5);
  });

  updateUI();
  if (extractBtn) extractBtn.innerHTML = '<i class="fas fa-random"></i> Estrai Numero';
  setTimeout(() => { speak("Si inizia!"); }, 1500);
}

// ─── ANNOUNCE MODE CONTROLS ───────────────────────────────────────────────────

function setAnnounceMode(mode, btn) {
  announceMode = mode;
  document.querySelectorAll(".mode-btn-group .mode-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("modeAll").classList.add("hidden");
  document.getElementById("modeCount").classList.add("hidden");
  document.getElementById("modeRange").classList.add("hidden");
  document.getElementById("mode" + mode.charAt(0).toUpperCase() + mode.slice(1)).classList.remove("hidden");
}

// Sezione TUTTI — preset buttons
function setAllPreset(val, btn) {
  allPreset = val;
  document.querySelectorAll("#modeAll .preset-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function setCountPreset(val, btn) {
  countPreset = val;
  document.querySelectorAll("#modeCount .preset-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("customCountInput").value = "";
}

function setRangePreset(from, to, btn) {
  rangeFrom = from;
  rangeTo = to;
  document.querySelectorAll("#modeRange .preset-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("rangeFrom").value = from;
  document.getElementById("rangeTo").value = to;
}

// ─── ANNOUNCE ─────────────────────────────────────────────────────────────────

function buildAnnounceList() {
  const sorted = Array.from(extractedNumbers).sort((a, b) => a - b);

  if (announceMode === "all") {
    if (allPreset === "all") return sorted;
    return sorted.slice(-parseInt(allPreset));
  }

  if (announceMode === "count") {
    const customVal = document.getElementById("customCountInput").value;
    if (customVal) return sorted.slice(-parseInt(customVal));
    if (countPreset === "all" || !countPreset) return sorted;
    return sorted.slice(-parseInt(countPreset));
  }

  if (announceMode === "range") {
    const from = parseInt(document.getElementById("rangeFrom").value) || 1;
    const to = parseInt(document.getElementById("rangeTo").value) || 90;
    return sorted.filter(n => n >= from && n <= to);
  }

  return sorted;
}

function startAnnouncement() {
  if (extractedNumbers.size === 0) {
    speak("Nessun numero estratto");
    showNotification("Nessun numero estratto ancora", "warning");
    return;
  }

  stopAnnouncement();

  const list = buildAnnounceList();
  if (list.length === 0) {
    speak("Nessun numero in questo intervallo");
    showNotification("Nessun numero nel range selezionato", "warning");
    return;
  }

  stopAnnounceFlag = false;
  isAnnouncingNumbers = true;

  const startBtn = document.getElementById("startAnnounceBtn");
  const stopBtn = document.getElementById("stopAnnounceBtn");
  const progress = document.getElementById("announceProgress");
  if (startBtn) startBtn.classList.add("hidden");
  if (stopBtn) stopBtn.classList.remove("hidden");
  if (progress) progress.classList.remove("hidden");

  const speed = parseFloat(document.getElementById("announceSpeed").value) * 1000;
  speak(`Annunciando ${list.length} numeri`);

  let index = 0;
  const progressText = document.getElementById("announceProgressText");

  function announceNext() {
    if (stopAnnounceFlag || index >= list.length) {
      finishAnnouncement();
      return;
    }
    if (progressText) progressText.textContent = `Annunciando ${index + 1} di ${list.length}: ${list[index]}`;
    speak(`${list[index]}`);
    index++;
    announceTimeout = setTimeout(announceNext, speed);
  }

  announceTimeout = setTimeout(announceNext, 1800);
  showNotification(`Annuncio avviato: ${list.length} numeri`, "success");
}

function stopAnnouncement() {
  stopAnnounceFlag = true;
  isAnnouncingNumbers = false;
  if (announceTimeout) { clearTimeout(announceTimeout); announceTimeout = null; }
  synth.cancel();
  finishAnnouncement();
}

function finishAnnouncement() {
  isAnnouncingNumbers = false;
  const startBtn = document.getElementById("startAnnounceBtn");
  const stopBtn = document.getElementById("stopAnnounceBtn");
  const progress = document.getElementById("announceProgress");
  if (startBtn) startBtn.classList.remove("hidden");
  if (stopBtn) stopBtn.classList.add("hidden");
  if (progress) progress.classList.add("hidden");
}

// ─── CHECK NUMBER ─────────────────────────────────────────────────────────────

function checkNumber() {
  const input = document.getElementById("checkNumberInput");
  const result = document.getElementById("checkResult");
  const val = parseInt(input.value);

  if (!val || val < 1 || val > 90) {
    result.className = "check-result error";
    result.textContent = "Inserisci un numero valido tra 1 e 90";
    result.classList.remove("hidden");
    speak("Numero non valido");
    return;
  }

  const isOut = extractedNumbers.has(val);
  result.classList.remove("hidden");
  if (isOut) {
    result.className = "check-result out";
    result.innerHTML = `<i class="fas fa-check-circle"></i> Il numero <strong>${val}</strong> è già uscito!`;
    speak(`Il numero ${val} è già uscito`);
  } else {
    result.className = "check-result not-out";
    result.innerHTML = `<i class="fas fa-times-circle"></i> Il numero <strong>${val}</strong> non è ancora uscito.`;
    speak(`Il numero ${val} non è ancora uscito`);
  }
}

// ─── CONFETTI ─────────────────────────────────────────────────────────────────

function createConfetti() {
  const colors = ["#ffcc00", "#ff6699", "#66ff99", "#6699ff", "#ff9966"];
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = "-10px";
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = `${Math.random() * 10 + 5}px`;
    confetti.style.height = `${Math.random() * 10 + 5}px`;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiContainer.appendChild(confetti);
    const animation = confetti.animate(
      [
        { transform: `translate(${Math.random() * 20 - 10}px, 0) rotate(0deg)` },
        { transform: `translate(${Math.random() * 50 - 25}px, ${window.innerHeight}px) rotate(${Math.random() * 360}deg)` },
      ],
      { duration: Math.random() * 3000 + 2000, easing: "cubic-bezier(0.1, 0.8, 0.9, 1)" }
    );
    animation.onfinish = () => { confetti.remove(); };
  }
}

// ─── SPEECH ───────────────────────────────────────────────────────────────────

function speak(text) {
  if (!speechEnabled) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "it-IT";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  synth.speak(utterance);
}

function addSpeechToggle() {
  const gameHeader = document.querySelector(".game-header");
  if (!gameHeader) return;
  const speechToggle = document.createElement("button");
  speechToggle.className = "speech-toggle";
  speechToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
  speechToggle.setAttribute("aria-label", "Attiva/disattiva audio");
  speechToggle.setAttribute("title", "Attiva/disattiva audio");
  speechToggle.addEventListener("click", () => {
    speechEnabled = !speechEnabled;
    speechToggle.innerHTML = speechEnabled
      ? '<i class="fas fa-volume-up"></i>'
      : '<i class="fas fa-volume-mute"></i>';
    if (speechEnabled) speak("Audio attivato");
  });
  gameHeader.appendChild(speechToggle);
}

// ─── NOTIFICATION ─────────────────────────────────────────────────────────────

function showNotification(message, type = "success") {
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => { notification.classList.add("show"); }, 10);
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => { notification.remove(); }, 300);
  }, 3000);
}

// ─── SWIPE & KEYBOARD ─────────────────────────────────────────────────────────

function addSwipeGestures() {
  let touchStartX = 0;
  document.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].screenX; }, false);
  document.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const threshold = 100;
    if (touchEndX - touchStartX > threshold) window.location.href = "../index.html";
    else if (touchStartX - touchEndX > threshold) {
      if (!isFirstStart) extractRandom(); else startGame();
    }
  }, false);
}

function addKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "Enter") {
      if (document.activeElement && ["INPUT", "SELECT", "BUTTON"].includes(document.activeElement.tagName)) return;
      e.preventDefault();
      if (!isFirstStart) extractRandom(); else startGame();
    }
    if (e.code === "KeyR") resetGame();
    if (e.code === "KeyA" && autoBtn) toggleAutoGenerate();
    if (e.code === "Escape") window.location.href = "../index.html";
  });
}

// ─── CSS INLINE ───────────────────────────────────────────────────────────────

(function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .inline-controls-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    @media (max-width: 768px) {
      .inline-controls-grid { grid-template-columns: 1fr; }
    }

    .control-box {
      background: rgba(255,255,255,0.95);
      border-radius: 14px;
      padding: 18px 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .control-box-title {
      font-weight: 700;
      color: var(--theme-primary);
      font-size: 1rem;
      border-bottom: 2px solid var(--theme-primary);
      padding-bottom: 8px;
      margin-bottom: 4px;
    }
    .control-box-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .control-box-row label {
      font-weight: 600;
      font-size: 0.88rem;
      color: var(--theme-primary);
      white-space: nowrap;
    }
    .control-box-row input[type=range] {
      flex: 1;
      min-width: 80px;
      accent-color: var(--theme-primary);
    }
    .control-box-row select {
      padding: 6px 10px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .control-box-row input[type=number] {
      padding: 6px 8px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 0.95rem;
      text-align: center;
    }
    #intervalLabel, #speedLabel {
      font-weight: 700;
      color: var(--theme-primary);
      min-width: 36px;
      font-size: 0.95rem;
    }

    /* Mode buttons */
    .label-row { align-items: center; }
    .mode-btn-group { display: flex; gap: 6px; flex-wrap: wrap; }
    .mode-btn {
      padding: 7px 14px;
      border: 2px solid #ddd;
      border-radius: 10px;
      background: #f8f8f8;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .mode-btn.active {
      border-color: var(--theme-primary);
      background: var(--theme-primary);
      color: #fff;
    }

    /* Announce sub sections */
    .announce-sub-section { display: flex; flex-direction: column; gap: 8px; }
    .announce-sub-section.hidden { display: none; }

    /* Preset buttons */
    .preset-row { display: flex; flex-wrap: wrap; gap: 6px; }
    .preset-btn {
      padding: 6px 12px;
      border: 2px solid #ddd;
      border-radius: 8px;
      background: #f8f8f8;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .preset-btn.active {
      border-color: var(--theme-secondary);
      background: var(--theme-secondary);
      color: #fff;
    }

    /* Mini search button */
    .mini-btn {
      padding: 7px 12px;
      background: var(--theme-primary);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .mini-btn:hover { opacity: 0.85; transform: translateY(-1px); }

    /* Check result */
    .check-result {
      padding: 10px 14px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .check-result.hidden { display: none; }
    .check-result.out { background:#e8f5e9; color:#2e7d32; border:2px solid #a5d6a7; }
    .check-result.not-out { background:#fff3e0; color:#e65100; border:2px solid #ffcc80; }
    .check-result.error { background:#fce4ec; color:#c62828; border:2px solid #ef9a9a; }

    /* Announce action row */
    .announce-action-row { justify-content: flex-start; gap: 10px; }
    .small-btn { padding: 10px 18px !important; font-size: 0.9rem !important; }

    /* Announce progress */
    .announce-progress {
      padding: 8px 12px;
      background: #f0f4ff;
      border-radius: 8px;
      color: var(--theme-primary);
      font-weight: 600;
      font-size: 0.88rem;
      text-align: center;
    }
    .announce-progress.hidden { display: none; }

    /* Extracted numbers list */
    .extracted-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }

    /* Speech toggle */
    .speech-toggle {
      background: none;
      border: none;
      color: var(--theme-primary);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 5px;
      border-radius: 50%;
      transition: all 0.3s ease;
    }
    .speech-toggle:hover { background-color: rgba(0,0,0,0.05); transform: scale(1.1); }

    /* Notification */
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      background-color: rgba(255,255,255,0.95);
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      z-index: 2000;
      transform: translateX(120%);
      transition: transform 0.3s ease;
      color: #333;
    }
    .notification.show { transform: translateX(0); }
    .notification.success { border-left: 4px solid var(--theme-success); }
    .notification.error { border-left: 4px solid var(--theme-danger); }
    .notification.warning { border-left: 4px solid var(--theme-accent); }

    /* Animations */
    @keyframes number-change {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    .number-change { animation: number-change 0.5s ease; }
    .fade-in { opacity:0; transform:translateY(20px); animation: fadeIn 0.5s forwards; }
    .pulse-animation { animation: pulse 1s infinite alternate; }
    .loading { text-align:center; padding:20px; font-size:1.2rem; color:var(--theme-primary); }
  `;
  document.head.appendChild(style);
})();

// ─── BOOT ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", initGame);