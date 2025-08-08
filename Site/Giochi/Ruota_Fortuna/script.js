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

    // Trigger animation
    setTimeout(() => notification.classList.add("show"), 100);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => this.remove(notification), duration);
    }

    return notification;
  }

  createNotification(message, type, title) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;

    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };

    const titles = {
      success: title || "Successo",
      error: title || "Errore",
      warning: title || "Attenzione",
      info: title || "Informazione",
    };

    notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">
                    ${icons[type]} ${titles[type]}
                </div>
                <button class="notification-close">✕</button>
            </div>
            <div class="notification-message">${message}</div>
        `;

    // Close button functionality
    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => {
        this.remove(notification);
      });

    return notification;
  }

  remove(notification) {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      this.notifications = this.notifications.filter((n) => n !== notification);
    }, 400);
  }

  clear() {
    this.notifications.forEach((notification) => this.remove(notification));
  }
}

// Custom Modal System
class ModalSystem {
  constructor() {
    this.overlay = document.getElementById("modalOverlay");
    this.content = document.getElementById("modalContent");
    this.title = document.getElementById("modalTitle");
    this.body = document.getElementById("modalBody");
    this.footer = document.getElementById("modalFooter");
    this.closeBtn = document.getElementById("modalClose");

    this.bindEvents();
  }

  bindEvents() {
    this.closeBtn.addEventListener("click", () => this.hide());
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.hide();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.overlay.classList.contains("show")) {
        this.hide();
      }
    });
  }

  show(options = {}) {
    const { title = "", body = "", buttons = [], type = "info" } = options;

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
        title,
        body: message,
        buttons: [
          {
            text: "Annulla",
            class: "btn-secondary",
            action: () => resolve(false),
          },
          {
            text: "Conferma",
            class: "btn-danger",
            action: () => resolve(true),
          },
        ],
      });
    });
  }

  prompt(message, defaultValue = "", title = "Inserisci") {
    return new Promise((resolve) => {
      const inputId = "modal-prompt-input";
      this.show({
        title,
        body: `
                    <p>${message}</p>
                    <input type="text" id="${inputId}" class="modal-input" value="${defaultValue}" placeholder="Inserisci valore...">
                `,
        buttons: [
          {
            text: "Annulla",
            class: "btn-secondary",
            action: () => resolve(null),
          },
          {
            text: "Conferma",
            class: "btn-primary",
            action: () => {
              const input = document.getElementById(inputId);
              resolve(input.value.trim() || null);
            },
          },
        ],
      });

      // Focus input and handle Enter key
      setTimeout(() => {
        const input = document.getElementById(inputId);
        input.focus();
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            resolve(input.value.trim() || null);
            this.hide();
          }
        });
      }, 100);
    });
  }

  alert(message, title = "Avviso", type = "info") {
    return new Promise((resolve) => {
      this.show({
        title,
        body: message,
        buttons: [
          {
            text: "OK",
            class: type === "error" ? "btn-danger" : "btn-primary",
            action: () => resolve(true),
          },
        ],
      });
    });
  }
}

// Initialize notification and modal systems
const notifications = new NotificationSystem();
const modal = new ModalSystem();

class WheelOfFortune {
  constructor() {
    this.names = [];
    this.isSpinning = false;
    this.init();
  }

  init() {
    this.loadFromStorage();
    this.bindEvents();
    this.updateWheel();
    this.updateNamesList();
  }

  bindEvents() {
    document
      .getElementById("addNameBtn")
      .addEventListener("click", () => this.addName());
    document.getElementById("nameInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addName();
    });
    document
      .getElementById("spinButton")
      .addEventListener("click", () => this.spinWheel());
    document
      .getElementById("clearAllBtn")
      .addEventListener("click", () => this.clearAll());
    document
      .getElementById("fileInput")
      .addEventListener("change", (e) => this.loadFile(e));
    document.getElementById("loadFileBtn").addEventListener("click", () => {
      document.getElementById("fileInput").click();
    });
    document
      .getElementById("exportTxtBtn")
      .addEventListener("click", () => this.exportTxt());
    document
      .getElementById("exportJsonBtn")
      ?.addEventListener("click", () => this.exportJson());
  }

  saveToStorage() {
    try {
      const data = JSON.stringify(this.names);
      window.wheelData = data;
    } catch (e) {
      console.error("Errore nel salvataggio:", e);
      notifications.show("Errore nel salvataggio dei dati", "error");
    }
  }

  loadFromStorage() {
    try {
      if (window.wheelData) {
        const parsed = JSON.parse(window.wheelData);
        if (Array.isArray(parsed)) {
          this.names = parsed.slice(0, 100);
        }
      }
    } catch (e) {
      console.error("Errore nel caricamento:", e);
      notifications.show("Errore nel caricamento dei dati salvati", "error");
    }
  }

  generateColors(count) {
    const colors = [];
    const hueStep = 360 / count;
    for (let i = 0; i < count; i++) {
      colors.push(`hsl(${i * hueStep}, 70%, 60%)`);
    }
    return colors;
  }

  async addName() {
    const input = document.getElementById("nameInput");
    const name = input.value.trim();

    if (this.names.length >= 100) {
      notifications.show("Puoi inserire al massimo 100 nomi!", "warning");
      return;
    }

    if (!name) {
      notifications.show("Inserisci un nome valido", "warning");
      return;
    }

    if (this.names.includes(name)) {
      notifications.show("Questo nome è già presente nella lista", "warning");
      return;
    }

    this.names.push(name);
    input.value = "";
    this.updateWheel();
    this.updateNamesList();
    this.saveToStorage();
    this.hideResult();

    notifications.show(`"${name}" aggiunto con successo!`, "success");
  }

  async editName(index) {
    if (this.isSpinning) {
      notifications.show(
        "Non puoi modificare i nomi mentre la ruota gira",
        "warning",
      );
      return;
    }

    const currentName = this.names[index];
    const newName = await modal.prompt(
      "Modifica nome:",
      currentName,
      "Modifica Nome",
    );

    if (newName === null) return; // User cancelled

    if (!newName) {
      notifications.show("Il nome non può essere vuoto", "warning");
      return;
    }

    if (this.names.includes(newName) && newName !== currentName) {
      notifications.show("Questo nome è già presente nella lista", "warning");
      return;
    }

    this.names[index] = newName;
    this.updateWheel();
    this.updateNamesList();
    this.saveToStorage();
    this.hideResult();

    notifications.show(`Nome modificato in "${newName}"`, "success");
  }

  async deleteName(index) {
    if (this.isSpinning) {
      notifications.show(
        "Non puoi eliminare partecipanti mentre la ruota sta girando",
        "warning",
      );
      return;
    }

    const name = this.names[index];
    const confirmed = await modal.confirm(
      `Sei sicuro di voler eliminare "${name}" dalla lista?`,
      "Elimina Nome",
    );

    if (confirmed) {
      this.names.splice(index, 1);
      this.updateWheel();
      this.updateNamesList();
      this.saveToStorage();
      this.hideResult();

      notifications.show(`"${name}" eliminato dalla lista`, "success");
    }
  }

  async clearAll() {
    if (this.isSpinning) {
      notifications.show(
        "Attendi che la ruota finisca di girare prima di resettare",
        "warning",
      );
      return;
    }

    if (this.names.length === 0) {
      notifications.show("La lista è già vuota", "info");
      return;
    }

    const confirmed = await modal.confirm(
      `Sei sicuro di voler cancellare tutti i ${this.names.length} nomi dalla lista? Questa azione non può essere annullata.`,
      "Cancella Tutto",
    );

    if (confirmed) {
      const count = this.names.length;
      this.names = [];
      window.wheelData = null;
      this.updateWheel();
      this.updateNamesList();
      this.hideResult();

      notifications.show(`${count} nomi eliminati dalla lista`, "success");
    }
  }

  updateWheel() {
    const svg = document.getElementById("wheelSvg");
    svg.innerHTML = "";

    if (this.names.length === 0) {
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", "200");
      circle.setAttribute("cy", "200");
      circle.setAttribute("r", "180");
      circle.setAttribute("fill", "#e1e5e9");
      circle.setAttribute("stroke", "#ccc");
      circle.setAttribute("stroke-width", "3");
      svg.appendChild(circle);

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      text.setAttribute("x", "200");
      text.setAttribute("y", "200");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("fill", "#999");
      text.setAttribute("font-size", "18");
      text.setAttribute("font-weight", "bold");
      text.textContent = "Aggiungi nomi";
      svg.appendChild(text);
      return;
    }

    const colors = this.generateColors(this.names.length);
    const centerX = 200;
    const centerY = 200;
    const radius = 180;
    const angleStep = 360 / this.names.length;

    this.names.forEach((name, index) => {
      const startAngle = index * angleStep;
      const endAngle = (index + 1) * angleStep;

      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);

      const largeArcFlag = angleStep > 180 ? 1 : 0;

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      path.setAttribute("d", pathData);
      path.setAttribute("fill", colors[index]);
      path.setAttribute("stroke", "white");
      path.setAttribute("stroke-width", "3");
      path.classList.add("wheel-section");
      svg.appendChild(path);

      const textAngle = startAngle + angleStep / 2;
      const textRadius = radius * 0.7;
      const textX =
        centerX + textRadius * Math.cos((textAngle * Math.PI) / 180);
      const textY =
        centerY + textRadius * Math.sin((textAngle * Math.PI) / 180);

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      text.setAttribute("x", textX);
      text.setAttribute("y", textY);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("fill", "white");
      text.setAttribute("font-size", Math.min(14, 150 / this.names.length + 8));
      text.setAttribute("font-weight", "bold");
      text.setAttribute("paint-order", "stroke");
      text.setAttribute("stroke", "black");
      text.setAttribute("stroke-width", "0.8");
      text.setAttribute(
        "transform",
        `rotate(${textAngle}, ${textX}, ${textY})`,
      );
      text.textContent =
        name.length > 10 ? name.substring(0, 10) + "..." : name;
      text.classList.add("wheel-text");
      svg.appendChild(text);
    });
  }

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

    namesList.innerHTML = this.names
      .map(
        (name, index) => `
            <div class="name-item">
                <span class="name-text">${name}</span>
                <div class="name-actions">
                    <button class="btn btn-secondary btn-small" onclick="wheel.editName(${index})" title="Modifica nome">✏️</button>
                    <button class="btn btn-danger btn-small" onclick="wheel.deleteName(${index})" title="Elimina nome">🗑️</button>
                </div>
            </div>
        `,
      )
      .join("");
  }

  spinWheel() {
    if (this.names.length === 0) {
      notifications.show(
        "Aggiungi almeno un nome prima di girare la ruota!",
        "warning",
      );
      return;
    }

    if (this.isSpinning) {
      notifications.show("La ruota sta già girando!", "info");
      return;
    }

    this.isSpinning = true;
    const spinButton = document.getElementById("spinButton");
    spinButton.disabled = true;
    spinButton.textContent = "🔄 Girando...";

    document
      .querySelectorAll(".btn-danger, .btn-secondary")
      .forEach((btn) => (btn.disabled = true));
    document.getElementById("clearAllBtn").disabled = true;

    const svg = document.getElementById("wheelSvg");
    const winnerIndex = Math.floor(Math.random() * this.names.length);
    const anglePerSegment = 360 / this.names.length;
    const stopAngle =
      360 - (winnerIndex * anglePerSegment + anglePerSegment / 2);
    const extraSpins = 10 * 360;
    const finalRotation = extraSpins + stopAngle;

    svg.style.setProperty("--spin-rotation", finalRotation + "deg");
    svg.classList.add("spinning");

    notifications.show("La ruota sta girando... 🎲", "info", "In corso", 4000);

    setTimeout(() => {
      const winner = this.names[winnerIndex];
      this.showResult(winner);

      const paths = svg.querySelectorAll(".wheel-section");
      paths.forEach((path, i) => {
        path.classList.toggle("winner", i === winnerIndex);
      });

      this.isSpinning = false;
      spinButton.disabled = false;
      spinButton.textContent = "🎲 Gira la Ruota!";

      document
        .querySelectorAll(".btn-danger, .btn-secondary")
        .forEach((btn) => (btn.disabled = false));
      document.getElementById("clearAllBtn").disabled = false;

      svg.classList.remove("spinning");

      notifications.show(
        `🎉 Il vincitore è: ${winner}!`,
        "success",
        "Abbiamo un vincitore!",
        8000,
      );
    }, 4000);
  }

  showResult(winner) {
    const resultDisplay = document.getElementById("resultDisplay");
    const winnerName = document.getElementById("winnerName");
    winnerName.textContent = winner;
    resultDisplay.classList.add("show");
  }

  hideResult = () =>
    document.getElementById("resultDisplay").classList.remove("show");

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
          newNames = content
            .split("\n")
            .map((name) => name.trim())
            .filter((name) => name);
        }

        if (newNames.length === 0) {
          notifications.show("Il file non contiene nomi validi", "warning");
          return;
        }

        const uniqueNames = newNames.filter(
          (name) => !this.names.includes(name),
        );
        const remainingSlots = 100 - this.names.length;
        const namesToAdd = uniqueNames.slice(0, remainingSlots);

        if (namesToAdd.length === 0) {
          notifications.show(
            "Tutti i nomi nel file sono già presenti nella lista",
            "info",
          );
          return;
        }

        this.names = [...this.names, ...namesToAdd];
        this.updateWheel();
        this.updateNamesList();
        this.saveToStorage();
        this.hideResult();

        let message = `${namesToAdd.length} nomi caricati con successo!`;
        if (uniqueNames.length > namesToAdd.length) {
          message += ` (Limite di 100 nomi raggiunto)`;
        }
        if (newNames.length > uniqueNames.length) {
          message += ` (${newNames.length - uniqueNames.length} duplicati ignorati)`;
        }

        notifications.show(message, "success", "File Caricato");
      } catch (err) {
        console.error("Errore nel caricamento del file:", err);
        notifications.show(
          "Errore nel caricamento del file. Controlla il formato.",
          "error",
        );
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  exportTxt() {
    if (this.names.length === 0) {
      notifications.show("Nessun nome da esportare!", "warning");
      return;
    }

    try {
      const blob = new Blob([this.names.join("\n")], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "nomi_ruota_fortuna.txt";
      a.click();
      URL.revokeObjectURL(a.href);

      notifications.show(
        `${this.names.length} nomi esportati in formato TXT`,
        "success",
      );
    } catch (err) {
      notifications.show("Errore durante l'esportazione del file TXT", "error");
    }
  }

  exportJson() {
    if (this.names.length === 0) {
      notifications.show("Nessun nome da esportare!", "warning");
      return;
    }

    try {
      const data = {
        names: this.names,
        exported: new Date().toISOString(),
        count: this.names.length,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "nomi_ruota_fortuna.json";
      a.click();
      URL.revokeObjectURL(a.href);

      notifications.show(
        `${this.names.length} nomi esportati in formato JSON`,
        "success",
      );
    } catch (err) {
      notifications.show(
        "Errore durante l'esportazione del file JSON",
        "error",
      );
    }
  }
}

// Initialize the wheel application
const wheel = new WheelOfFortune();
window.wheel = wheel;

// Welcome message
setTimeout(() => {
  notifications.show(
    "Benvenuto nella Ruota della Fortuna! Aggiungi alcuni nomi e inizia a giocare.",
    "info",
    "Benvenuto! 🎯",
    6000,
  );
}, 1000);

// Event listener per il bottone genera nomi (link al file locale)
document
  .getElementById("generateNamesBtn")
  .addEventListener("click", function () {
    // Apre il file locale per generare nomi in una nuova scheda
    window.open("Generazione_Nomi_TXT/index.html", "_blank");
  });
