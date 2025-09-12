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
const notificationSystem = new NotificationSystem();
const modalSystem = new ModalSystem();

class DualWheelOfFortune {
  constructor() {
    this.wheel1Names = []; // Names wheel - stores only names as strings
    this.wheel2Names = []; // Nations wheel - stores only nations as strings
    this.isSpinning1 = false;
    this.isSpinning2 = false;
    this.init();
  }

  init() {
    this.loadFromStorage();
    this.bindEvents();
    this.updateWheel(1);
    this.updateWheel(2);
    this.updateNamesList(1);
    this.updateNamesList(2);
  }

  bindEvents() {
    // First wheel events (Names)
    document
      .getElementById("addNameBtn1")
      .addEventListener("click", () => this.addItem(1));
    document.getElementById("nameInput1").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addItem(1);
    });
    document
      .getElementById("generateCompleteBtn1")
      .addEventListener("click", () => this.generateAuto(1));
    document
      .getElementById("spinButton1")
      .addEventListener("click", () => this.spinWheel(1));
    document
      .getElementById("clearAllBtn1")
      .addEventListener("click", () => this.clearWheel(1));
    document
      .getElementById("fileInput1")
      .addEventListener("change", (e) => this.loadFile(e, 1));
    document.getElementById("loadFileBtn1").addEventListener("click", () => {
      document.getElementById("fileInput1").click();
    });
    document
      .getElementById("exportTxtBtn1")
      .addEventListener("click", () => this.exportTxt(1));
    document
      .getElementById("exportJsonBtn1")
      .addEventListener("click", () => this.exportJson(1));

    // Second wheel events (Nations)
    document
      .getElementById("addNameBtn2")
      .addEventListener("click", () => this.addItem(2));
    document
      .getElementById("nationInput2")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.addItem(2);
      });
    document
      .getElementById("generateCompleteBtn2")
      .addEventListener("click", () => this.generateAuto(2));
    document
      .getElementById("spinButton2")
      .addEventListener("click", () => this.spinWheel(2));
    document
      .getElementById("clearAllBtn2")
      .addEventListener("click", () => this.clearWheel(2));
    document
      .getElementById("fileInput2")
      .addEventListener("change", (e) => this.loadFile(e, 2));
    document.getElementById("loadFileBtn2").addEventListener("click", () => {
      document.getElementById("fileInput2").click();
    });
    document
      .getElementById("exportTxtBtn2")
      .addEventListener("click", () => this.exportTxt(2));
    document
      .getElementById("exportJsonBtn2")
      .addEventListener("click", () => this.exportJson(2));
  }

  generateAuto(wheelNumber) {
    const count =
      Number.parseInt(
        document.getElementById(`autoCount${wheelNumber}`).value,
      ) || 8;

    if (wheelNumber === 1) {
      // Generate names for first wheel
      const autoNames = [
        "Marco",
        "Giulia",
        "Alessandro",
        "Francesca",
        "Luca",
        "Valentina",
        "Matteo",
        "Chiara",
        "Andrea",
        "Martina",
        "Davide",
        "Sara",
        "Simone",
        "Elena",
        "Federico",
        "Alessia",
        "Lorenzo",
        "Giorgia",
        "Riccardo",
        "Ilaria",
        "Nicola",
        "Federica",
        "Stefano",
        "Silvia",
        "Antonio",
        "Roberta",
        "Giuseppe",
        "Paola",
        "Francesco",
        "Laura",
        "Giovanni",
        "Anna",
        "Roberto",
        "Maria",
        "Paolo",
        "Cristina",
        "Michele",
        "Daniela",
        "Fabio",
        "Monica",
        "Daniele",
        "Serena",
        "Emanuele",
        "Claudia",
        "Vincenzo",
        "Emanuela",
        "Salvatore",
        "Manuela",
        "Massimo",
        "Patrizia",
        "Alberto",
        "Carla",
        "Tommaso",
        "Beatrice",
        "Gabriele",
        "Camilla",
      ];

      const shuffledNames = autoNames.sort(() => 0.5 - Math.random());
      this.wheel1Names = shuffledNames.slice(0, Math.min(count, 50));

      notificationSystem.show(
        `${this.wheel1Names.length} nomi generati automaticamente!`,
        "success",
      );
    } else {
      // Generate nations for second wheel
      const autoNations = [
        "Italia",
        "Francia",
        "Germania",
        "Spagna",
        "Regno Unito",
        "Portogallo",
        "Grecia",
        "Olanda",
        "Belgio",
        "Austria",
        "Svizzera",
        "Polonia",
        "Repubblica Ceca",
        "Ungheria",
        "Romania",
        "Bulgaria",
        "Croazia",
        "Slovenia",
        "Slovacchia",
        "Danimarca",
        "Svezia",
        "Norvegia",
        "Finlandia",
        "Irlanda",
        "Lituania",
        "Lettonia",
        "Estonia",
        "Malta",
        "Cipro",
        "Lussemburgo",
        "Islanda",
        "Serbia",
        "Montenegro",
        "Bosnia",
        "Macedonia",
        "Albania",
        "Moldavia",
        "Ucraina",
        "Bielorussia",
        "Russia",
        "Turchia",
        "Brasile",
        "Argentina",
        "Messico",
        "Colombia",
        "Perù",
        "Cile",
        "Venezuela",
        "Ecuador",
        "Uruguay",
        "Paraguay",
        "Bolivia",
        "Stati Uniti",
        "Canada",
        "Australia",
        "Giappone",
      ];

      const shuffledNations = autoNations.sort(() => 0.5 - Math.random());
      this.wheel2Names = shuffledNations.slice(0, Math.min(count, 50));

      notificationSystem.show(
        `${this.wheel2Names.length} nazioni generate automaticamente!`,
        "success",
      );
    }

    this.updateWheel(wheelNumber);
    this.updateNamesList(wheelNumber);
    this.saveToStorage();
    this.hideResult(wheelNumber);
  }

  saveToStorage() {
    try {
      const data = JSON.stringify({
        wheel1: this.wheel1Names,
        wheel2: this.wheel2Names,
      });
      localStorage.setItem("dualWheelData", data);
    } catch (e) {
      console.error("Errore nel salvataggio:", e);
      notificationSystem.show("Errore nel salvataggio dei dati", "error");
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem("dualWheelData");
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.wheel1 && Array.isArray(parsed.wheel1)) {
          this.wheel1Names = parsed.wheel1.slice(0, 100);
        }
        if (parsed.wheel2 && Array.isArray(parsed.wheel2)) {
          this.wheel2Names = parsed.wheel2.slice(0, 100);
        }
      }
    } catch (e) {
      console.error("Errore nel caricamento:", e);
      notificationSystem.show(
        "Errore nel caricamento dei dati salvati",
        "error",
      );
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

  async addItem(wheelNumber) {
    const items = wheelNumber === 1 ? this.wheel1Names : this.wheel2Names;

    if (items.length >= 100) {
      const itemType = wheelNumber === 1 ? "nomi" : "nazioni";
      notificationSystem.show(
        `Puoi inserire al massimo 100 ${itemType}!`,
        "warning",
      );
      return;
    }

    let inputValue, itemType, inputId;
    if (wheelNumber === 1) {
      inputId = "nameInput1";
      itemType = "nome";
      inputValue = document.getElementById(inputId).value.trim();
    } else {
      inputId = "nationInput2";
      itemType = "nazione";
      inputValue = document.getElementById(inputId).value.trim();
    }

    if (!inputValue) {
      notificationSystem.show(`Inserisci un ${itemType} valido`, "warning");
      return;
    }

    if (items.includes(inputValue)) {
      notificationSystem.show(
        `Questo ${itemType} è già presente nella lista`,
        "warning",
      );
      return;
    }

    items.push(inputValue);
    document.getElementById(inputId).value = "";

    if (wheelNumber === 1) {
      this.wheel1Names = items;
    } else {
      this.wheel2Names = items;
    }

    this.updateWheel(wheelNumber);
    this.updateNamesList(wheelNumber);
    this.saveToStorage();
    this.hideResult(wheelNumber);

    const wheelName = wheelNumber === 1 ? "nomi" : "nazioni";
    notificationSystem.show(
      `"${inputValue}" aggiunto alla ruota ${wheelName}!`,
      "success",
    );
  }

  async editName(index, wheelNumber) {
    const items = wheelNumber === 1 ? this.wheel1Names : this.wheel2Names;
    const isSpinning = wheelNumber === 1 ? this.isSpinning1 : this.isSpinning2;

    if (isSpinning) {
      const itemType = wheelNumber === 1 ? "nomi" : "nazioni";
      notificationSystem.show(
        `Non puoi modificare i ${itemType} mentre la ruota gira`,
        "warning",
      );
      return;
    }

    const currentItem = items[index];
    const itemType = wheelNumber === 1 ? "nome" : "nazione";
    const newItem = await modalSystem.prompt(
      `Modifica ${itemType}:`,
      currentItem,
      `Modifica ${itemType}`,
    );

    if (newItem === null) return;

    if (!newItem) {
      notificationSystem.show(`Il ${itemType} non può essere vuoto`, "warning");
      return;
    }

    if (items.some((item, i) => i !== index && item === newItem)) {
      notificationSystem.show(
        `Questo ${itemType} è già presente nella lista`,
        "warning",
      );
      return;
    }

    items[index] = newItem;
    this.updateWheel(wheelNumber);
    this.updateNamesList(wheelNumber);
    this.saveToStorage();
    this.hideResult(wheelNumber);

    const wheelName = wheelNumber === 1 ? "nomi" : "nazioni";
    notificationSystem.show(
      `${itemType} modificato nella ruota ${wheelName}: "${newItem}"`,
      "success",
    );
  }

  async deleteName(index, wheelNumber) {
    const items = wheelNumber === 1 ? this.wheel1Names : this.wheel2Names;
    const isSpinning = wheelNumber === 1 ? this.isSpinning1 : this.isSpinning2;

    if (isSpinning) {
      const itemType = wheelNumber === 1 ? "nomi" : "nazioni";
      notificationSystem.show(
        `Non puoi eliminare ${itemType} mentre la ruota sta girando`,
        "warning",
      );
      return;
    }

    const item = items[index];
    const wheelName = wheelNumber === 1 ? "nomi" : "nazioni";
    const itemType = wheelNumber === 1 ? "nome" : "nazione";

    const confirmed = await modalSystem.confirm(
      `Sei sicuro di voler eliminare "${item}" dalla ruota ${wheelName}?`,
      `Elimina ${itemType}`,
    );

    if (confirmed) {
      items.splice(index, 1);
      this.updateWheel(wheelNumber);
      this.updateNamesList(wheelNumber);
      this.saveToStorage();
      this.hideResult(wheelNumber);

      notificationSystem.show(
        `"${item}" eliminato dalla ruota ${wheelName}`,
        "success",
      );
    }
  }

  updateWheel(wheelNumber) {
    const svg = document.getElementById(`wheelSvg${wheelNumber}`);
    const items = wheelNumber === 1 ? this.wheel1Names : this.wheel2Names;
    svg.innerHTML = "";

    if (items.length === 0) {
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
      const emptyText =
        wheelNumber === 1 ? "Aggiungi nomi" : "Aggiungi nazioni";
      text.textContent = emptyText;
      svg.appendChild(text);
      return;
    }

    const colors = this.generateColors(items.length);
    const centerX = 200;
    const centerY = 200;
    const radius = 180;
    const angleStep = 360 / items.length;

    items.forEach((item, index) => {
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
      text.setAttribute("font-size", Math.min(14, 140 / items.length + 8));
      text.setAttribute("font-weight", "bold");
      text.setAttribute("paint-order", "stroke");
      text.setAttribute("stroke", "black");
      text.setAttribute("stroke-width", "1");
      text.setAttribute(
        "transform",
        `rotate(${textAngle}, ${textX}, ${textY})`,
      );
      text.textContent =
        item.length > 12 ? item.substring(0, 12) + "..." : item;
      text.classList.add("wheel-text");
      svg.appendChild(text);
    });
  }

  updateNamesList(wheelNumber) {
    const namesList = document.getElementById(`namesList${wheelNumber}`);
    const items = wheelNumber === 1 ? this.wheel1Names : this.wheel2Names;

    if (items.length === 0) {
      const emptyText =
        wheelNumber === 1
          ? '<div class="empty-state"><div class="emoji">👤</div><p>Nessun nome ancora.<br>Aggiungi alcuni nomi per iniziare!</p></div>'
          : '<div class="empty-state"><div class="emoji">🌍</div><p>Nessuna nazione ancora.<br>Aggiungi alcune nazioni per iniziare!</p></div>';
      namesList.innerHTML = emptyText;
      return;
    }

    namesList.innerHTML = items
      .map(
        (item, index) => `
        <div class="name-item">
          <span class="name-text">${item}</span>
          <div class="name-actions">
            <button class="btn btn-secondary btn-small" onclick="dualWheel.editName(${index}, ${wheelNumber})" title="Modifica">✏️</button>
            <button class="btn btn-danger btn-small" onclick="dualWheel.deleteName(${index}, ${wheelNumber})" title="Elimina">🗑️</button>
          </div>
        </div>
      `,
      )
      .join("");
  }

  spinWheel(wheelNumber) {
    const items = wheelNumber === 1 ? this.wheel1Names : this.wheel2Names;
    const isSpinning = wheelNumber === 1 ? this.isSpinning1 : this.isSpinning2;

    if (items.length === 0) {
      const itemType = wheelNumber === 1 ? "nomi" : "nazioni";
      notificationSystem.show(
        `Aggiungi almeno un ${itemType.slice(0, -1)} prima di girare la ruota!`,
        "warning",
      );
      return;
    }

    if (isSpinning) {
      notificationSystem.show("La ruota sta già girando!", "info");
      return;
    }

    if (wheelNumber === 1) {
      this.isSpinning1 = true;
    } else {
      this.isSpinning2 = true;
    }

    const spinButton = document.getElementById(`spinButton${wheelNumber}`);
    spinButton.disabled = true;
    spinButton.textContent = "🔄 Girando...";

    const svg = document.getElementById(`wheelSvg${wheelNumber}`);
    const winnerIndex = Math.floor(Math.random() * items.length);
    const anglePerSegment = 360 / items.length;
    const stopAngle =
      360 - (winnerIndex * anglePerSegment + anglePerSegment / 2);
    const extraSpins = 10 * 360;
    const finalRotation = extraSpins + stopAngle;

    svg.style.setProperty("--spin-rotation", finalRotation + "deg");
    svg.classList.add("spinning");

    const wheelName = wheelNumber === 1 ? "nomi" : "nazioni";
    notificationSystem.show(
      `La ruota ${wheelName} sta girando... 🎲`,
      "info",
      "In corso",
      4000,
    );

    setTimeout(() => {
      const winner = items[winnerIndex];
      this.showResult(winner, wheelNumber);

      const paths = svg.querySelectorAll(".wheel-section");
      paths.forEach((path, i) => {
        path.classList.toggle("winner", i === winnerIndex);
      });

      if (wheelNumber === 1) {
        this.isSpinning1 = false;
        spinButton.textContent = "🎲 Gira la Ruota dei Nomi!";
      } else {
        this.isSpinning2 = false;
        spinButton.textContent = "🎲 Gira la Ruota delle Nazioni!";
      }

      spinButton.disabled = false;
      svg.classList.remove("spinning");

      const resultType = wheelNumber === 1 ? "nome" : "nazione";
      notificationSystem.show(
        `🎉 Il ${resultType} estratto è: ${winner}!`,
        "success",
        "Abbiamo un vincitore!",
        8000,
      );
    }, 4000);
  }

  async loadFile(event, wheelNumber) {
    const file = event.target.files[0];
    if (!file) return;

    const items = wheelNumber === 1 ? this.wheel1Names : this.wheel2Names;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        let newItems = [];

        if (file.name.endsWith(".json")) {
          const data = JSON.parse(content);
          if (Array.isArray(data)) {
            newItems = data.map((item) =>
              typeof item === "string"
                ? item
                : item.name || item.nation || "Item",
            );
          } else {
            newItems = data.items || data.names || data.nations || [];
          }
        } else {
          newItems = content
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line);
        }

        if (newItems.length === 0) {
          const itemType = wheelNumber === 1 ? "nomi" : "nazioni";
          notificationSystem.show(
            `Il file non contiene ${itemType} validi`,
            "warning",
          );
          return;
        }

        const uniqueItems = newItems.filter(
          (newItem) => !items.includes(newItem),
        );
        const remainingSlots = 100 - items.length;
        const itemsToAdd = uniqueItems.slice(0, remainingSlots);

        if (itemsToAdd.length === 0) {
          const itemType = wheelNumber === 1 ? "nomi" : "nazioni";
          notificationSystem.show(
            `Tutti i ${itemType} nel file sono già presenti nella lista`,
            "info",
          );
          return;
        }

        if (wheelNumber === 1) {
          this.wheel1Names = [...this.wheel1Names, ...itemsToAdd];
        } else {
          this.wheel2Names = [...this.wheel2Names, ...itemsToAdd];
        }

        this.updateWheel(wheelNumber);
        this.updateNamesList(wheelNumber);
        this.saveToStorage();
        this.hideResult(wheelNumber);

        const wheelName = wheelNumber === 1 ? "nomi" : "nazioni";
        let message = `${itemsToAdd.length} ${wheelName} caricati!`;
        if (uniqueItems.length > itemsToAdd.length) {
          message += ` (Limite di 100 raggiunto)`;
        }
        if (newItems.length > uniqueItems.length) {
          message += ` (${newItems.length - uniqueItems.length} duplicati ignorati)`;
        }

        notificationSystem.show(message, "success", "File Caricato");
      } catch (err) {
        console.error("Errore nel caricamento del file:", err);
        notificationSystem.show(
          "Errore nel caricamento del file. Controlla il formato.",
          "error",
        );
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  exportTxt(wheelNumber) {
    const items = wheelNumber === 1 ? this.wheel1Names : this.wheel2Names;

    if (items.length === 0) {
      const itemType = wheelNumber === 1 ? "nomi" : "nazioni";
      notificationSystem.show(
        `Nessun ${itemType.slice(0, -1)} da esportare!`,
        "warning",
      );
      return;
    }

    try {
      const content = items.join("\n");
      const blob = new Blob([content], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      const wheelName = wheelNumber === 1 ? "nomi" : "nazioni";
      a.download = `${wheelName}.txt`;
      a.click();
      URL.revokeObjectURL(a.href);

      notificationSystem.show(
        `${items.length} ${wheelName} esportati in formato TXT`,
        "success",
      );
    } catch (err) {
      notificationSystem.show(
        "Errore durante l'esportazione del file TXT",
        "error",
      );
    }
  }

  exportJson(wheelNumber) {
    const items = wheelNumber === 1 ? this.wheel1Names : this.wheel2Names;

    if (items.length === 0) {
      const itemType = wheelNumber === 1 ? "nomi" : "nazioni";
      notificationSystem.show(
        `Nessun ${itemType.slice(0, -1)} da esportare!`,
        "warning",
      );
      return;
    }

    try {
      const wheelName = wheelNumber === 1 ? "nomi" : "nazioni";
      const data = {
        [wheelName]: items,
        exported: new Date().toISOString(),
        count: items.length,
        wheel: wheelNumber,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${wheelName}.json`;
      a.click();
      URL.revokeObjectURL(a.href);

      notificationSystem.show(
        `${items.length} ${wheelName} esportati in formato JSON`,
        "success",
      );
    } catch (err) {
      notificationSystem.show(
        "Errore durante l'esportazione del file JSON",
        "error",
      );
    }
  }

  async clearWheel(wheelNumber) {
    const items = wheelNumber === 1 ? this.wheel1Names : this.wheel2Names;

    if (items.length === 0) {
      notificationSystem.show("La lista è già vuota!", "info");
      return;
    }

    const wheelName = wheelNumber === 1 ? "nomi" : "nazioni";
    const confirmed = await modalSystem.confirm(
      `Sei sicuro di voler cancellare tutti i ${items.length} ${wheelName}?`,
      "Cancella Tutto",
    );

    if (confirmed) {
      if (wheelNumber === 1) {
        this.wheel1Names = [];
      } else {
        this.wheel2Names = [];
      }

      this.updateWheel(wheelNumber);
      this.updateNamesList(wheelNumber);
      this.saveToStorage();
      this.hideResult(wheelNumber);

      notificationSystem.show(
        `Tutti i ${wheelName} sono stati cancellati`,
        "success",
      );
    }
  }

  showResult(winner, wheelNumber) {
    const resultDisplay = document.getElementById(
      `resultDisplay${wheelNumber}`,
    );
    const winnerName = document.getElementById(`winnerName${wheelNumber}`);
    winnerName.textContent = winner;
    resultDisplay.classList.add("show");
  }

  hideResult(wheelNumber) {
    document
      .getElementById(`resultDisplay${wheelNumber}`)
      .classList.remove("show");
  }
}

// Initialize notification and modal systems
const dualWheel = new DualWheelOfFortune();
window.dualWheel = dualWheel;

setTimeout(() => {
  notificationSystem.show(
    "Benvenuto nelle Ruote Nomi & Nazioni! La prima ruota è dedicata ai nomi, la seconda alle nazioni. Entrambe sono completamente personalizzabili!",
    "info",
    "Benvenuto! 🎯",
    8000,
  );
}, 1000);