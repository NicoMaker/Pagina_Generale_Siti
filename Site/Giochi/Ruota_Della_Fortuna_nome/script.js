// Custom Notification System
class NotificationSystem {
  constructor() {
    this.container = document.getElementById("notificationContainer");
    this.notifications = [];
  }

  show(message, type = "info", title = "", duration = 5000) {
    const notification = this.createNotification(message, type, title);
    this.container.appendChild(notification);
    this.notifications.push(notification);
    setTimeout(() => notification.classList.add("show"), 100);
    if (duration > 0) setTimeout(() => this.remove(notification), duration);
    return notification;
  }

  createNotification(message, type, title) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
    const titles = {
      success: title || "Successo", error: title || "Errore",
      warning: title || "Attenzione", info: title || "Informazione",
    };
    notification.innerHTML = `
      <div class="notification-header">
        <div class="notification-title">${icons[type]} ${titles[type]}</div>
        <button class="notification-close">✕</button>
      </div>
      <div class="notification-message">${message}</div>`;
    notification.querySelector(".notification-close").addEventListener("click", () => this.remove(notification));
    return notification;
  }

  remove(notification) {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) notification.parentNode.removeChild(notification);
      this.notifications = this.notifications.filter((n) => n !== notification);
    }, 400);
  }

  clear() { this.notifications.forEach((n) => this.remove(n)); }
}

// Custom Modal System
class ModalSystem {
  constructor() {
    this.overlay = document.getElementById("modalOverlay");
    this.title = document.getElementById("modalTitle");
    this.body = document.getElementById("modalBody");
    this.footer = document.getElementById("modalFooter");
    this.closeBtn = document.getElementById("modalClose");
    this.bindEvents();
  }

  bindEvents() {
    this.closeBtn.addEventListener("click", () => this.hide());
    this.overlay.addEventListener("click", (e) => { if (e.target === this.overlay) this.hide(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.overlay.classList.contains("show")) this.hide();
    });
  }

  show(options = {}) {
    const { title = "", body = "", buttons = [] } = options;
    this.title.textContent = title;
    this.body.innerHTML = body;
    this.footer.innerHTML = "";
    buttons.forEach((button) => {
      const btn = document.createElement("button");
      btn.className = `btn ${button.class || "btn-secondary"}`;
      btn.textContent = button.text;
      btn.addEventListener("click", () => {
        if (button.action) button.action();
        if (button.close !== false) this.hide();
      });
      this.footer.appendChild(btn);
    });
    this.overlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  hide() {
    this.overlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  confirm(message, title = "Conferma") {
    return new Promise((resolve) => {
      this.show({
        title, body: message,
        buttons: [
          { text: "Annulla", class: "btn-secondary", action: () => resolve(false) },
          { text: "Conferma", class: "btn-danger", action: () => resolve(true) },
        ],
      });
    });
  }

  prompt(message, defaultValue = "", title = "Inserisci") {
    return new Promise((resolve) => {
      const inputId = "modal-prompt-input";
      this.show({
        title,
        body: `<p>${message}</p><input type="text" id="${inputId}" class="modal-input" value="${defaultValue}" placeholder="Inserisci valore...">`,
        buttons: [
          { text: "Annulla", class: "btn-secondary", action: () => resolve(null) },
          { text: "Conferma", class: "btn-primary", action: () => {
              const input = document.getElementById(inputId);
              resolve(input ? input.value.trim() || null : null);
          }},
        ],
      });
      setTimeout(() => {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.focus();
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") { resolve(input.value.trim() || null); this.hide(); }
        });
      }, 100);
    });
  }

  alert(message, title = "Avviso", type = "info") {
    return new Promise((resolve) => {
      this.show({
        title, body: message,
        buttons: [{ text: "OK", class: type === "error" ? "btn-danger" : "btn-primary", action: () => resolve(true) }],
      });
    });
  }
}

// Initialize systems
const notifications = new NotificationSystem();
const modal = new ModalSystem();

// Shared SVG icons
const PENCIL_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const WA_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>`;

class WheelOfFortune {
  constructor() {
    this.names = [];
    this.isSpinning = false;
    this.extractionHistory = [];
    this.playerCounter = 1;
    this.currentPlayerName = "";
    this.init();
  }

  init() {
    this.loadFromLocalStorage();
    this.bindEvents();
    this.updateWheel();
    this.updateNamesList();
    this.updatePlayerDisplay();
  }

  bindEvents() {
    document.getElementById("addNameBtn").addEventListener("click", () => this.addName());
    document.getElementById("nameInput").addEventListener("keypress", (e) => { if (e.key === "Enter") this.addName(); });
    document.getElementById("spinButton").addEventListener("click", () => this.spinWheel());
    document.getElementById("clearAllBtn").addEventListener("click", () => this.clearAll());
    document.getElementById("fileInput").addEventListener("change", (e) => this.loadFile(e));
    document.getElementById("loadFileBtn").addEventListener("click", () => document.getElementById("fileInput").click());
    document.getElementById("exportTxtBtn").addEventListener("click", () => this.exportTxt());
    document.getElementById("exportJsonBtn")?.addEventListener("click", () => this.exportJson());
    document.getElementById("clearHistoryBtn").addEventListener("click", () => this.clearHistory());
    document.getElementById("shareWhatsAppBtn")?.addEventListener("click", () => this.shareOnWhatsApp());

    // Already Extracted overlay close
    document.getElementById("aeCloseBtn")?.addEventListener("click", () => {
      const overlay = document.getElementById("alreadyExtractedOverlay");
      const card = document.getElementById("alreadyExtractedCard");
      card.classList.remove("show");
      setTimeout(() => overlay.classList.remove("show"), 400);
    });

    // Player field
    document.getElementById("playerEditBtn").addEventListener("click", () => this.openPlayerEdit());
    document.getElementById("playerSaveBtn").addEventListener("click", () => this.savePlayerName());
    document.getElementById("playerCancelBtn").addEventListener("click", () => this.closePlayerEdit());
    document.getElementById("currentPlayerInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.savePlayerName();
      if (e.key === "Escape") this.closePlayerEdit();
    });
  }

  // ── LOCAL STORAGE ──────────────────────────────────────────────────────────

  saveToLocalStorage() {
    try {
      localStorage.setItem("wheelNames", JSON.stringify(this.names));
      localStorage.setItem("currentPlayerName", this.currentPlayerName || "");
    } catch (e) {
      notifications.show("Errore nel salvataggio dei dati", "error");
    }
  }

  loadFromLocalStorage() {
    try {
      this.currentPlayerName = localStorage.getItem("currentPlayerName") || "";
      const data = localStorage.getItem("wheelNames");
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) this.names = parsed.slice(0, 100);
      }
    } catch (e) {
      notifications.show("Errore nel caricamento dei dati salvati", "error");
    }
  }

  // ── COLORS ─────────────────────────────────────────────────────────────────

  generateColors(count) {
    const colors = [];
    const hueStep = 360 / count;
    for (let i = 0; i < count; i++) colors.push(`hsl(${i * hueStep}, 70%, 60%)`);
    return colors;
  }

  // ── NAMES MANAGEMENT ───────────────────────────────────────────────────────

  async addName() {
    const input = document.getElementById("nameInput");
    const name = input.value.trim();
    if (this.names.length >= 100) { notifications.show("Puoi inserire al massimo 100 nomi!", "warning"); return; }
    if (!name) { notifications.show("Inserisci un nome valido", "warning"); return; }
    if (this.names.includes(name)) { notifications.show("Questo nome è già presente nella lista", "warning"); return; }
    this.names.push(name);
    input.value = "";
    this.updateWheel();
    this.updateNamesList();
    this.saveToLocalStorage();
    this.hideResult();
    notifications.show(`"${name}" aggiunto con successo!`, "success");
  }

  async editName(index) {
    if (this.isSpinning) { notifications.show("Non puoi modificare i nomi mentre la ruota gira", "warning"); return; }
    const currentName = this.names[index];
    const newName = await modal.prompt("Modifica nome:", currentName, "✏️ Modifica Nome");
    if (newName === null) return;
    if (!newName) { notifications.show("Il nome non può essere vuoto", "warning"); return; }
    if (this.names.includes(newName) && newName !== currentName) { notifications.show("Questo nome è già presente nella lista", "warning"); return; }
    this.names[index] = newName;
    this.updateWheel();
    this.updateNamesList();
    this.saveToLocalStorage();
    this.hideResult();
    notifications.show(`Nome modificato in "${newName}"`, "success");
  }

  async deleteName(index) {
    if (this.isSpinning) { notifications.show("Non puoi eliminare partecipanti mentre la ruota sta girando", "warning"); return; }
    const name = this.names[index];
    const confirmed = await modal.confirm(`Sei sicuro di voler eliminare "${name}" dalla lista?`, "Elimina Nome");
    if (confirmed) {
      this.names.splice(index, 1);
      this.updateWheel();
      this.updateNamesList();
      this.saveToLocalStorage();
      this.hideResult();
      notifications.show(`"${name}" eliminato dalla lista`, "success");
    }
  }

  async clearAll() {
    if (this.isSpinning) { notifications.show("Attendi che la ruota finisca di girare prima di resettare", "warning"); return; }
    if (this.names.length === 0) { notifications.show("La lista è già vuota", "info"); return; }
    const confirmed = await modal.confirm(
      `Sei sicuro di voler cancellare tutti i ${this.names.length} nomi? Questa azione non può essere annullata.`,
      "Cancella Tutto"
    );
    if (confirmed) {
      const count = this.names.length;
      this.names = [];
      localStorage.removeItem("wheelNames");
      this.updateWheel();
      this.updateNamesList();
      this.hideResult();
      notifications.show(`${count} nomi eliminati dalla lista`, "success");
    }
  }

  // ── WHEEL RENDER ───────────────────────────────────────────────────────────

  updateWheel() {
    const svg = document.getElementById("wheelSvg");
    svg.innerHTML = "";
    if (this.names.length === 0) {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "200"); circle.setAttribute("cy", "200"); circle.setAttribute("r", "180");
      circle.setAttribute("fill", "#e1e5e9"); circle.setAttribute("stroke", "#ccc"); circle.setAttribute("stroke-width", "3");
      svg.appendChild(circle);
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", "200"); text.setAttribute("y", "200");
      text.setAttribute("text-anchor", "middle"); text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("fill", "#999"); text.setAttribute("font-size", "18"); text.setAttribute("font-weight", "bold");
      text.textContent = "Aggiungi nomi";
      svg.appendChild(text);
      return;
    }

    const colors = this.generateColors(this.names.length);
    const centerX = 200, centerY = 200, radius = 180;
    const angleStep = 360 / this.names.length;

    this.names.forEach((name, index) => {
      const startAngle = index * angleStep;
      const endAngle = (index + 1) * angleStep;
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      const x1 = centerX + radius * Math.cos(startRad), y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad), y2 = centerY + radius * Math.sin(endRad);
      const largeArcFlag = angleStep > 180 ? 1 : 0;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`);
      path.setAttribute("fill", colors[index]); path.setAttribute("stroke", "white"); path.setAttribute("stroke-width", "3");
      path.classList.add("wheel-section");
      svg.appendChild(path);

      const textAngle = startAngle + angleStep / 2;
      const textRadius = radius * 0.7;
      const textX = centerX + textRadius * Math.cos((textAngle * Math.PI) / 180);
      const textY = centerY + textRadius * Math.sin((textAngle * Math.PI) / 180);

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", textX); text.setAttribute("y", textY);
      text.setAttribute("text-anchor", "middle"); text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("fill", "white"); text.setAttribute("font-size", Math.min(14, 150 / this.names.length + 8));
      text.setAttribute("font-weight", "bold"); text.setAttribute("paint-order", "stroke");
      text.setAttribute("stroke", "black"); text.setAttribute("stroke-width", "0.8");
      text.setAttribute("transform", `rotate(${textAngle}, ${textX}, ${textY})`);
      text.textContent = name.length > 10 ? name.substring(0, 10) + "..." : name;
      text.classList.add("wheel-text");
      svg.appendChild(text);
    });
  }

  // ── NAMES LIST RENDER ──────────────────────────────────────────────────────

  updateNamesList() {
    const namesList = document.getElementById("namesList");
    if (this.names.length === 0) {
      namesList.innerHTML = `
        <div class="empty-state">
          <div class="emoji">📝</div>
          <p>Nessun nome ancora.<br>Aggiungi alcuni nomi per iniziare!</p>
        </div>`;
      return;
    }
    namesList.innerHTML = this.names.map((name, index) => {
      const safe = name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `
        <div class="name-item" id="name-item-${index}">
          <span class="name-number">${index + 1}.</span>
          <span class="name-label">${safe}</span>
          <div class="name-actions">
            <button class="btn btn-edit btn-small" onclick="wheel.editName(${index})" title="Modifica nome">${PENCIL_SVG}</button>
            <button class="btn btn-danger btn-small" onclick="wheel.deleteName(${index})" title="Elimina nome">🗑️</button>
          </div>
        </div>`;
    }).join("");
  }

  // ── PLAYER FIELD ───────────────────────────────────────────────────────────

  openPlayerEdit() {
    if (this.isSpinning) return;
    document.getElementById("playerDisplay").style.display = "none";
    document.getElementById("playerEditRow").style.display = "flex";
    const input = document.getElementById("currentPlayerInput");
    input.value = this.currentPlayerName || "";
    input.focus(); input.select();
  }

  savePlayerName() {
    const name = document.getElementById("currentPlayerInput").value.trim();
    this.currentPlayerName = name;
    this.updatePlayerDisplay();
    this.closePlayerEdit();
    localStorage.setItem("currentPlayerName", name);
  }

  closePlayerEdit() {
    document.getElementById("playerDisplay").style.display = "flex";
    document.getElementById("playerEditRow").style.display = "none";
  }

  updatePlayerDisplay() {
    const nameEl = document.getElementById("playerDisplayName");
    nameEl.textContent = this.currentPlayerName || "—";
    nameEl.classList.toggle("player-name-empty", !this.currentPlayerName);
  }

  lockPlayerField(locked) {
    document.getElementById("playerField").classList.toggle("player-locked", locked);
    document.getElementById("playerEditBtn").disabled = locked;
    this.closePlayerEdit();
  }

  // ── SPIN ───────────────────────────────────────────────────────────────────

  spinWheel() {
    if (this.names.length === 0) { notifications.show("Aggiungi almeno un nome prima di girare la ruota!", "warning"); return; }
    if (this.isSpinning) { notifications.show("La ruota sta già girando!", "info"); return; }

    this.isSpinning = true;
    const spinButton = document.getElementById("spinButton");
    spinButton.disabled = true;
    spinButton.textContent = "🔄 Girando...";
    this.lockPlayerField(true);
    document.querySelectorAll(".btn-danger, .btn-secondary").forEach((btn) => (btn.disabled = true));
    document.getElementById("clearAllBtn").disabled = true;

    const svg = document.getElementById("wheelSvg");
    const winnerIndex = Math.floor(Math.random() * this.names.length);
    const anglePerSegment = 360 / this.names.length;
    const stopAngle = 360 - (winnerIndex * anglePerSegment + anglePerSegment / 2);
    svg.style.setProperty("--spin-rotation", (10 * 360 + stopAngle) + "deg");
    svg.classList.add("spinning");
    notifications.show("La ruota sta girando... 🎲", "info", "In corso", 4000);

    setTimeout(() => {
      const winner = this.names[winnerIndex];
      const playerName = this.currentPlayerName || `Giocatore ${this.playerCounter}`;
      this.showResult(winner, playerName);
      this.addToHistory(playerName, winner);
      this.playerCounter++;
      this.currentPlayerName = "";
      localStorage.setItem("currentPlayerName", "");
      this.updatePlayerDisplay();
      svg.querySelectorAll(".wheel-section").forEach((p, i) => p.classList.toggle("winner", i === winnerIndex));
      this.isSpinning = false;
      spinButton.disabled = false;
      spinButton.textContent = "🎲 Gira la Ruota!";
      this.lockPlayerField(false);
      document.querySelectorAll(".btn-danger, .btn-secondary").forEach((btn) => (btn.disabled = false));
      document.getElementById("clearAllBtn").disabled = false;
      svg.classList.remove("spinning");
      notifications.show(`🎉 Estratto: ${winner}!`, "success", "Estrazione completata!", 8000);
    }, 4000);
  }

  showResult(winner, playerName) {
    document.getElementById("winnerName").innerHTML = `
      <span class="result-player">👤 ${playerName}</span>
      <span class="result-arrow">→</span>
      <span class="result-item">🎯 ${winner}</span>`;
    document.getElementById("resultDisplay").classList.add("show");
  }

  hideResult() {
    document.getElementById("resultDisplay").classList.remove("show");
  }

  // ── HISTORY ────────────────────────────────────────────────────────────────

  addToHistory(playerName, result) {
    const entry = {
      playerName, result,
      time: new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
    };
    const alreadyExtracted = this.extractionHistory.some((e) => e.result === result);
    this.extractionHistory.unshift(entry);
    this.renderHistory();
    if (alreadyExtracted) {
      const prevEntry = this.extractionHistory.find((e, i) => i > 0 && e.result === result);
      setTimeout(() => this.showAlreadyExtracted(playerName, result, prevEntry), 500);
    }
  }

  renderHistory() {
    const container = document.getElementById("extractionHistory");
    const list = document.getElementById("historyList");
    if (this.extractionHistory.length === 0) { container.style.display = "none"; return; }
    container.style.display = "block";
    list.innerHTML = this.extractionHistory.map((e, i) => {
      const isDuplicate = this.extractionHistory.filter((h) => h.result === e.result).length > 1;
      return `
        <div class="history-item${isDuplicate ? " history-duplicate" : ""}">
          <span class="history-num">${this.extractionHistory.length - i}</span>
          <span class="history-player">👤
            <span class="history-player-name">${e.playerName}</span>
            <button class="history-edit-btn" onclick="wheel.editHistoryPlayer(${i})" title="Modifica nome">${PENCIL_SVG}</button>
          </span>
          <span class="history-arrow">→</span>
          <span class="history-result${isDuplicate ? " history-result-dup" : ""}">⚽ ${e.result}${isDuplicate ? " ⚠️" : ""}</span>
          <span class="history-time">${e.time}</span>
          <button class="btn btn-wa-row btn-small" onclick="wheel.shareRowWhatsApp(${i})" title="Invia su WhatsApp">${WA_SVG}</button>
          <button class="btn btn-danger btn-small" onclick="wheel.deleteHistoryItem(${i})">🗑️</button>
        </div>`;
    }).join("");
  }

  async editHistoryPlayer(index) {
    const entry = this.extractionHistory[index];
    const newName = await modal.prompt(
      "Modifica il nome del fantallenatore per questa estrazione:",
      entry.playerName, "✏️ Modifica Partecipante"
    );
    if (newName === null) return;
    if (!newName.trim()) { notifications.show("Il nome non può essere vuoto", "warning"); return; }
    this.extractionHistory[index].playerName = newName.trim();
    this.renderHistory();
    notifications.show(`Nome aggiornato in "${newName.trim()}"`, "success");
  }

  shareRowWhatsApp(index) {
    const e = this.extractionHistory[index];
    const num = this.extractionHistory.length - index;
    const text = `🎯 *Ruota della Fortuna - Estrazione #${num}*\n\n👤 Fantallenatore: *${e.playerName}*\n⚽ Giocatore estratto: *${e.result}*\n🕐 Orario: ${e.time}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  shareOnWhatsApp() {
    if (this.extractionHistory.length === 0) { notifications.show("Nessuna estrazione da condividere!", "warning"); return; }
    let text = "🎯 *Storico Estrazioni - Ruota della Fortuna*\n\n";
    [...this.extractionHistory].reverse().forEach((e, i) => {
      text += `${i + 1}. 👤 ${e.playerName} → ⚽ ${e.result} (${e.time})\n`;
    });
    text += `\n📊 Totale estrazioni: ${this.extractionHistory.length}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  deleteHistoryItem(index) {
    this.extractionHistory.splice(index, 1);
    this.renderHistory();
  }

  clearHistory() {
    this.extractionHistory = [];
    this.playerCounter = 1;
    this.currentPlayerName = "";
    document.getElementById("currentPlayerInput").placeholder = "Nome giocatore...";
    this.renderHistory();
  }

  // ── ALREADY EXTRACTED OVERLAY ──────────────────────────────────────────────

  showAlreadyExtracted(playerName, result, prevEntry) {
    const overlay = document.getElementById("alreadyExtractedOverlay");
    const card = document.getElementById("alreadyExtractedCard");
    const confetti = document.getElementById("aeConfetti");

    document.getElementById("aeJerseyNumber").textContent =
      this.extractionHistory.filter((e) => e.result === result).length;
    document.getElementById("aeSubtitle").textContent = prevEntry
      ? `Già assegnato a ${prevEntry.playerName} alle ${prevEntry.time}!`
      : "Questo giocatore è già stato assegnato!";
    document.getElementById("aePlayerName").textContent = `👤 ${playerName}`;
    document.getElementById("aeResultName").textContent = `⚽ ${result}`;

    confetti.innerHTML = "";
    const colors = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#c77dff", "#ff9f1c"];
    for (let i = 0; i < 40; i++) {
      const c = document.createElement("div");
      c.className = "ae-confetti-piece";
      c.style.cssText = `left:${Math.random()*100}%;background:${colors[Math.floor(Math.random()*colors.length)]};animation-delay:${Math.random()*1.5}s;animation-duration:${1.5+Math.random()*1.5}s;width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;border-radius:${Math.random()>.5?"50%":"2px"}`;
      confetti.appendChild(c);
    }
    overlay.classList.add("show");
    setTimeout(() => card.classList.add("show"), 50);
  }

  // ── FILE I/O ───────────────────────────────────────────────────────────────

  async loadFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        let newNames = [];
        if (file.name.endsWith(".json")) {
          const data = JSON.parse(content);
          newNames = Array.isArray(data) ? data : data.names || [];
        } else {
          newNames = content.split("\n").map((n) => n.trim()).filter(Boolean);
        }
        if (newNames.length === 0) { notifications.show("Il file non contiene nomi validi", "warning"); return; }
        const uniqueNames = newNames.filter((n) => !this.names.includes(n));
        const namesToAdd = uniqueNames.slice(0, 100 - this.names.length);
        if (namesToAdd.length === 0) { notifications.show("Tutti i nomi nel file sono già presenti nella lista", "info"); return; }
        this.names = [...this.names, ...namesToAdd];
        this.updateWheel(); this.updateNamesList(); this.saveToLocalStorage(); this.hideResult();
        let message = `${namesToAdd.length} nomi caricati con successo!`;
        if (uniqueNames.length > namesToAdd.length) message += ` (Limite di 100 nomi raggiunto)`;
        if (newNames.length > uniqueNames.length) message += ` (${newNames.length - uniqueNames.length} duplicati ignorati)`;
        notifications.show(message, "success", "File Caricato");
      } catch (err) {
        notifications.show("Errore nel caricamento del file. Controlla il formato.", "error");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  exportTxt() {
    if (this.names.length === 0) { notifications.show("Nessun nome da esportare!", "warning"); return; }
    try {
      const blob = new Blob([this.names.join("\n")], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "nomi_ruota_fortuna.txt"; a.click();
      URL.revokeObjectURL(a.href);
      notifications.show(`${this.names.length} nomi esportati in formato TXT`, "success");
    } catch (err) { notifications.show("Errore durante l'esportazione del file TXT", "error"); }
  }

  exportJson() {
    if (this.names.length === 0) { notifications.show("Nessun nome da esportare!", "warning"); return; }
    try {
      const data = { names: this.names, exported: new Date().toISOString(), count: this.names.length };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "nomi_ruota_fortuna.json"; a.click();
      URL.revokeObjectURL(a.href);
      notifications.show(`${this.names.length} nomi esportati in formato JSON`, "success");
    } catch (err) { notifications.show("Errore durante l'esportazione del file JSON", "error"); }
  }
}

// ── INIT ───────────────────────────────────────────────────────────────────────
const wheel = new WheelOfFortune();
window.wheel = wheel;

setTimeout(() => {
  notifications.show(
    "Benvenuto nella Ruota della Fortuna! Aggiungi alcuni nomi e inizia a giocare.",
    "info", "Benvenuto! 🎯", 6000
  );
}, 1000);

document.getElementById("generateNamesBtn").addEventListener("click", function () {
  window.open("Generazione_Nomi_TXT/index.html", "_blank");
});