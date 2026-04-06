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
let announceQueue = [];
let isAnnouncingNumbers = false;
let stopAnnounceFlag = false;

// DOM Elements
const extractBtn = document.getElementById("extractBtn");
const resetBtn = document.getElementById("resetBtn");
const autoBtn = document.getElementById("autoBtn");
const announceBtn = document.getElementById("announceBtn");
const intervalInput = document.getElementById("intervalInput");
const currentNumberDisplay = document.getElementById("currentNumber");
const extractedNumbersList = document.getElementById("extractedNumbersList");
const tombolaContainer = document.getElementById("tombola-container");
const confettiContainer = document.getElementById("confettiContainer");

// Speech synthesis configuration
const synth = window.speechSynthesis;
let speechEnabled = true;

// Initialize the game
async function initGame() {
  tombolaContainer.innerHTML = '<div class="loading">Caricamento tabellone...</div>';
  numbers = Array.from({ length: 90 }, (_, i) => i + 1);

  try {
    const response = await fetch("../tables.json");
    const data = await response.json();
    generateTables(data.tables);

    if (!document.querySelector(".extracted-numbers")) {
      const extractedContainer = document.createElement("div");
      extractedContainer.className = "extracted-numbers";
      extractedContainer.innerHTML = `
        <h3>Numeri Estratti (0/90)</h3>
        <div class="extracted-list" id="extractedNumbersList"></div>
      `;
      tombolaContainer.parentNode.insertBefore(extractedContainer, tombolaContainer);
    }
  } catch (error) {
    console.error("Error loading tables:", error);
    const fallbackTable = { numbers: Array.from({ length: 90 }, (_, i) => i + 1) };
    generateTables([fallbackTable]);
    showNotification("Errore nel caricamento delle tabelle. Utilizzando tabella predefinita.", "error");
  }

  extractBtn.addEventListener("click", startGame);
  resetBtn.addEventListener("click", resetGame);

  if (autoBtn) autoBtn.addEventListener("click", toggleAutoGenerate);
  if (intervalInput) {
    intervalInput.addEventListener("change", updateInterval);
    intervalInput.value = secondsInterval;
  }
  if (announceBtn) announceBtn.addEventListener("click", showAnnouncePanel);

  addSpeechToggle();
  injectAnnouncePanel();
  updateUI();
  addSwipeGestures();
  addKeyboardShortcuts();

  setTimeout(() => { speak("Si inizia!"); }, 1000);
}

// Generate tables
function generateTables(tablesData) {
  let tableContent = "";
  tablesData.forEach((table) => {
    tableContent += `<div class="sub-table"><table>`;
    for (let i = 0; i < table.numbers.length; i += 5) {
      tableContent += `<tr>`;
      for (let j = 0; j < 5; j++) {
        const number = table.numbers[i + j];
        if (number) {
          tableContent += `<td id="nr${number}" onclick="choseMe(this)">${number}</td>`;
        } else {
          tableContent += `<td></td>`;
        }
      }
      tableContent += `</tr>`;
    }
    tableContent += `</table></div>`;
  });
  tombolaContainer.innerHTML = tableContent;

  const tables = document.querySelectorAll(".sub-table");
  tables.forEach((table, index) => {
    table.style.animationDelay = `${index * 0.1}s`;
    table.classList.add("fade-in");
  });
}

// Start game function
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
    autoBtn.innerHTML = '<i class="fas fa-play"></i> Avvia Automatico';
    autoBtn.classList.remove("danger");
    autoBtn.classList.add("success");
    intervalInput.disabled = false;
    speak("Estrazione automatica fermata");
  } else {
    if (isFirstStart) startGame();
    if (numbers.length <= 0) {
      showNotification("Tutti i numeri sono stati estratti!", "warning");
      return;
    }
    secondsInterval = Number.parseInt(intervalInput.value) || 3;
    autoBtn.innerHTML = '<i class="fas fa-stop"></i> Ferma Automatico';
    autoBtn.classList.remove("success");
    autoBtn.classList.add("danger");
    intervalInput.disabled = true;
    extractRandom();
    autoGenerateInterval = setInterval(extractRandom, secondsInterval * 1000);
  }
}

function updateInterval() {
  const value = Number.parseInt(intervalInput.value);
  if (value && value > 0) {
    secondsInterval = value;
  } else {
    intervalInput.value = secondsInterval;
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
    if (blinkCount % 2 === 0) { celnode.className = "on"; }
    else { celnode.className = "blink"; }
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
  const id = anode.id, nn = +id.match(/\d+/)[0];
  if (!extractedNumbers.has(nn)) { selectNr(nn); }
  else { resetNr(nn); }
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
  const sortedNumbers = Array.from(extractedNumbers).sort((a, b) => a - b);
  sortedNumbers.forEach((number) => {
    const numberTag = document.createElement("div");
    numberTag.className = "number-tag";
    numberTag.textContent = number;
    numberTag.setAttribute("aria-label", `Numero estratto ${number}`);
    extractedList.appendChild(numberTag);
  });
  const heading = extractedList.parentNode.querySelector("h3");
  if (heading) heading.textContent = `Numeri Estratti (${extractedNumbers.size}/90)`;
}

function resetGame() {
  if (isAnimating) return;
  if (autoGenerateInterval) {
    clearInterval(autoGenerateInterval);
    autoGenerateInterval = null;
    if (autoBtn) {
      autoBtn.innerHTML = '<i class="fas fa-play"></i> Avvia Automatico';
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

// ─── PANNELLO ANNUNCIO AVANZATO ───────────────────────────────────────────────

function injectAnnouncePanel() {
  const panel = document.createElement("div");
  panel.id = "announcePanel";
  panel.className = "announce-panel hidden";
  panel.innerHTML = `
    <div class="announce-panel-inner">
      <div class="announce-panel-header">
        <h3><i class="fas fa-bullhorn"></i> Annuncia Numeri Estratti</h3>
        <button class="close-panel-btn" onclick="hideAnnouncePanel()"><i class="fas fa-times"></i></button>
      </div>

      <div class="announce-section">
        <label class="announce-label"><i class="fas fa-list-ol"></i> Modalità annuncio</label>
        <div class="announce-mode-btns">
          <button class="mode-btn active" data-mode="all" onclick="setAnnounceMode('all', this)">Tutti</button>
          <button class="mode-btn" data-mode="count" onclick="setAnnounceMode('count', this)">Ultimi N</button>
          <button class="mode-btn" data-mode="range" onclick="setAnnounceMode('range', this)">Range</button>
        </div>
      </div>

      <!-- Modalità TUTTI -->
      <div id="modeAll" class="announce-mode-section">
        <p class="announce-hint">Verranno annunciati tutti i numeri estratti finora.</p>
        <div class="announce-qty-row">
          <label>Quanti numeri annunciare:</label>
          <select id="announceQtyAll">
            <option value="all">Tutti</option>
            <option value="5">Ultimi 5</option>
            <option value="10">Ultimi 10</option>
            <option value="15">Ultimi 15</option>
            <option value="20">Ultimi 20</option>
            <option value="30">Ultimi 30</option>
            <option value="50">Ultimi 50</option>
          </select>
        </div>
      </div>

      <!-- Modalità ULTIMI N -->
      <div id="modeCount" class="announce-mode-section hidden">
        <label class="announce-label">Annuncia gli ultimi:</label>
        <div class="count-presets">
          <button class="preset-btn active" data-val="10" onclick="setCountPreset(10, this)">10</button>
          <button class="preset-btn" data-val="15" onclick="setCountPreset(15, this)">15</button>
          <button class="preset-btn" data-val="20" onclick="setCountPreset(20, this)">20</button>
          <button class="preset-btn" data-val="25" onclick="setCountPreset(25, this)">25</button>
          <button class="preset-btn" data-val="30" onclick="setCountPreset(30, this)">30</button>
        </div>
        <div class="custom-count-row">
          <label>oppure inserisci un numero:</label>
          <input type="number" id="customCountInput" min="1" max="90" placeholder="es. 12" />
        </div>
      </div>

      <!-- Modalità RANGE -->
      <div id="modeRange" class="announce-mode-section hidden">
        <label class="announce-label">Annuncia numeri estratti in questo range:</label>
        <div class="range-presets">
          <button class="preset-btn active" data-from="1" data-to="10" onclick="setRangePreset(1,10,this)">1-10</button>
          <button class="preset-btn" data-from="1" data-to="20" onclick="setRangePreset(1,20,this)">1-20</button>
          <button class="preset-btn" data-from="1" data-to="30" onclick="setRangePreset(1,30,this)">1-30</button>
          <button class="preset-btn" data-from="1" data-to="50" onclick="setRangePreset(1,50,this)">1-50</button>
          <button class="preset-btn" data-from="51" data-to="90" onclick="setRangePreset(51,90,this)">51-90</button>
        </div>
        <div class="range-custom-row">
          <label>oppure range personalizzato:</label>
          <div class="range-inputs">
            <input type="number" id="rangeFrom" min="1" max="90" placeholder="Da" value="1" />
            <span>→</span>
            <input type="number" id="rangeTo" min="1" max="90" placeholder="A" value="90" />
          </div>
        </div>
      </div>

      <!-- Velocità -->
      <div class="announce-section">
        <label class="announce-label"><i class="fas fa-tachometer-alt"></i> Velocità (secondi tra i numeri)</label>
        <div class="speed-row">
          <span>1s</span>
          <input type="range" id="announceSpeed" min="1" max="6" value="2" step="0.5" />
          <span>6s</span>
          <span id="speedLabel">2s</span>
        </div>
      </div>

      <!-- Controllo numero -->
      <div class="announce-section check-section">
        <label class="announce-label"><i class="fas fa-search"></i> Controlla numero</label>
        <div class="check-number-row">
          <input type="number" id="checkNumberInput" min="1" max="90" placeholder="1-90" />
          <button class="check-btn" onclick="checkNumber()"><i class="fas fa-search"></i> Controlla</button>
        </div>
        <div id="checkResult" class="check-result hidden"></div>
      </div>

      <!-- Pulsanti azione -->
      <div class="announce-actions">
        <button id="startAnnounceBtn" class="game-btn primary" onclick="startAnnouncement()">
          <i class="fas fa-play"></i> <span>Avvia Annuncio</span>
        </button>
        <button id="stopAnnounceBtn" class="game-btn danger hidden" onclick="stopAnnouncement()">
          <i class="fas fa-stop"></i> <span>Ferma Annuncio</span>
        </button>
      </div>

      <div id="announceProgress" class="announce-progress hidden">
        <span id="announceProgressText">Annunciando...</span>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  // Speed slider label update
  const speedSlider = document.getElementById("announceSpeed");
  const speedLabel = document.getElementById("speedLabel");
  speedSlider.addEventListener("input", () => {
    speedLabel.textContent = speedSlider.value + "s";
  });
}

let announceMode = "all";
let countPreset = 10;
let rangeFrom = 1;
let rangeTo = 90;

function setAnnounceMode(mode, btn) {
  announceMode = mode;
  document.querySelectorAll(".announce-mode-btns .mode-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("modeAll").classList.add("hidden");
  document.getElementById("modeCount").classList.add("hidden");
  document.getElementById("modeRange").classList.add("hidden");
  document.getElementById("mode" + mode.charAt(0).toUpperCase() + mode.slice(1)).classList.remove("hidden");
}

function setCountPreset(val, btn) {
  countPreset = val;
  document.querySelectorAll(".count-presets .preset-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("customCountInput").value = "";
}

function setRangePreset(from, to, btn) {
  rangeFrom = from;
  rangeTo = to;
  document.querySelectorAll(".range-presets .preset-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("rangeFrom").value = from;
  document.getElementById("rangeTo").value = to;
}

function showAnnouncePanel() {
  document.getElementById("announcePanel").classList.remove("hidden");
}

function hideAnnouncePanel() {
  document.getElementById("announcePanel").classList.add("hidden");
  stopAnnouncement();
}

function buildAnnounceList() {
  const sorted = Array.from(extractedNumbers).sort((a, b) => a - b);

  if (announceMode === "all") {
    const qty = document.getElementById("announceQtyAll").value;
    if (qty === "all") return sorted;
    return sorted.slice(-parseInt(qty));
  }

  if (announceMode === "count") {
    const customVal = document.getElementById("customCountInput").value;
    const count = customVal ? parseInt(customVal) : countPreset;
    return sorted.slice(-count);
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

  stopAnnouncement(); // stop any previous

  const list = buildAnnounceList();
  if (list.length === 0) {
    speak("Nessun numero in questo intervallo");
    showNotification("Nessun numero nel range selezionato", "warning");
    return;
  }

  stopAnnounceFlag = false;
  isAnnouncingNumbers = true;

  document.getElementById("startAnnounceBtn").classList.add("hidden");
  document.getElementById("stopAnnounceBtn").classList.remove("hidden");
  document.getElementById("announceProgress").classList.remove("hidden");

  const speed = parseFloat(document.getElementById("announceSpeed").value) * 1000;

  speak(`Annunciando ${list.length} numeri`);

  let index = 0;
  const progressText = document.getElementById("announceProgressText");

  function announceNext() {
    if (stopAnnounceFlag || index >= list.length) {
      finishAnnouncement();
      return;
    }
    progressText.textContent = `Annunciando ${index + 1} di ${list.length}: ${list[index]}`;
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

// ─── CONTROLLO NUMERO ─────────────────────────────────────────────────────────

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

// Check number on Enter key in input
document.addEventListener("DOMContentLoaded", () => {
  const checkInput = document.getElementById("checkNumberInput");
  if (checkInput) {
    checkInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") checkNumber();
    });
  }
});

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

// ─── SPEECH TOGGLE ────────────────────────────────────────────────────────────

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
    if (speechEnabled) {
      speechToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
      speak("Audio attivato");
    } else {
      speechToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
  });

  gameHeader.appendChild(speechToggle);

  const style = document.createElement("style");
  style.textContent = `
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
    .speech-toggle:hover {
      background-color: rgba(0,0,0,0.05);
      transform: scale(1.1);
    }
    @keyframes number-change {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    .number-change { animation: number-change 0.5s ease; }
    .fade-in {
      opacity: 0;
      transform: translateY(20px);
      animation: fadeIn 0.5s forwards;
    }
    .pulse-animation { animation: pulse 1s infinite alternate; }
    .loading {
      text-align: center;
      padding: 20px;
      font-size: 1.2rem;
      color: var(--theme-primary);
    }
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

    /* ── ANNOUNCE PANEL ── */
    .announce-panel {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      z-index: 3000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      backdrop-filter: blur(4px);
    }
    .announce-panel.hidden { display: none; }
    .announce-panel-inner {
      background: #fff;
      border-radius: 18px;
      padding: 28px 24px 24px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-height: 90vh;
      overflow-y: auto;
    }
    .announce-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .announce-panel-header h3 {
      color: var(--theme-primary);
      font-size: 1.3rem;
    }
    .close-panel-btn {
      background: none;
      border: none;
      font-size: 1.3rem;
      cursor: pointer;
      color: #666;
      padding: 4px 8px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .close-panel-btn:hover { background: #f0f0f0; color: #333; }
    .announce-section {
      margin-bottom: 18px;
    }
    .announce-label {
      display: block;
      font-weight: 600;
      color: var(--theme-primary);
      margin-bottom: 8px;
      font-size: 0.95rem;
    }
    .announce-mode-btns {
      display: flex;
      gap: 8px;
    }
    .mode-btn {
      flex: 1;
      padding: 10px;
      border: 2px solid #ddd;
      border-radius: 10px;
      background: #f8f8f8;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      font-size: 0.9rem;
    }
    .mode-btn.active {
      border-color: var(--theme-primary);
      background: var(--theme-primary);
      color: #fff;
    }
    .announce-mode-section { margin-bottom: 14px; }
    .announce-mode-section.hidden { display: none; }
    .announce-hint {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 10px;
    }
    .announce-qty-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .announce-qty-row select {
      padding: 8px 12px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 0.95rem;
      cursor: pointer;
    }
    .count-presets, .range-presets {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }
    .preset-btn {
      padding: 8px 14px;
      border: 2px solid #ddd;
      border-radius: 8px;
      background: #f8f8f8;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .preset-btn.active {
      border-color: var(--theme-secondary);
      background: var(--theme-secondary);
      color: #fff;
    }
    .custom-count-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .custom-count-row label, .range-custom-row label { font-size: 0.88rem; color: #555; }
    .custom-count-row input {
      width: 80px;
      padding: 8px;
      border: 2px solid #ddd;
      border-radius: 8px;
      text-align: center;
      font-size: 1rem;
    }
    .range-custom-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .range-inputs {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .range-inputs input {
      width: 72px;
      padding: 8px;
      border: 2px solid #ddd;
      border-radius: 8px;
      text-align: center;
      font-size: 1rem;
    }
    .speed-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .speed-row input[type=range] { flex: 1; accent-color: var(--theme-primary); }
    #speedLabel {
      font-weight: 700;
      color: var(--theme-primary);
      min-width: 28px;
    }
    .check-section {}
    .check-number-row {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .check-number-row input {
      width: 90px;
      padding: 10px;
      border: 2px solid #ddd;
      border-radius: 8px;
      text-align: center;
      font-size: 1.1rem;
    }
    .check-btn {
      padding: 10px 18px;
      background: var(--theme-primary);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .check-btn:hover { opacity: 0.85; transform: translateY(-2px); }
    .check-result {
      margin-top: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .check-result.hidden { display: none; }
    .check-result.out {
      background: #e8f5e9;
      color: #2e7d32;
      border: 2px solid #a5d6a7;
    }
    .check-result.not-out {
      background: #fff3e0;
      color: #e65100;
      border: 2px solid #ffcc80;
    }
    .check-result.error {
      background: #fce4ec;
      color: #c62828;
      border: 2px solid #ef9a9a;
    }
    .announce-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      justify-content: center;
    }
    .announce-progress {
      text-align: center;
      margin-top: 12px;
      padding: 10px;
      background: #f0f4ff;
      border-radius: 8px;
      color: var(--theme-primary);
      font-weight: 600;
      font-size: 0.95rem;
    }
    .announce-progress.hidden { display: none; }
  `;
  document.head.appendChild(style);
}

// ─── NOTIFICATION ─────────────────────────────────────────────────────────────

function showNotification(message, type = "success") {
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) existingNotification.remove();

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
  let touchEndX = 0;

  document.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].screenX; }, false);
  document.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const threshold = 100;
    if (touchEndX - touchStartX > threshold) window.location.href = "../index.html";
    else if (touchStartX - touchEndX > threshold) {
      if (!isFirstStart) extractRandom(); else startGame();
    }
  }, false);
}

function addKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    const panel = document.getElementById("announcePanel");
    if (panel && !panel.classList.contains("hidden")) return;

    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      if (!isFirstStart) extractRandom(); else startGame();
    }
    if (e.code === "KeyR") resetGame();
    if (e.code === "KeyA" && autoBtn) toggleAutoGenerate();
    if (e.code === "KeyN" && announceBtn) showAnnouncePanel();
    if (e.code === "Escape") window.location.href = "../index.html";
  });
}

// Initialize
document.addEventListener("DOMContentLoaded", initGame);