// Utility Systems
class NotificationSystem {
  constructor() {
    this.container = document.getElementById("notificationContainer");
    this.notifications = [];
  }

  show(message, type = "info", title = "Notifica", duration = 4000) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;

    const icon =
      {
        success: "✅",
        error: "❌",
        warning: "⚠️",
        info: "ℹ️",
      }[type] || "🔔";

    notification.innerHTML = `
            <div class="notification-header">
              <div class="notification-title">${icon} ${title}</div>
              <button class="notification-close">✕</button>
            </div>
            <div class="notification-message">${message}</div>
          `;

    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => this.hide(notification));

    this.container.appendChild(notification);
    this.notifications.push(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    setTimeout(() => {
      this.hide(notification);
    }, duration);
  }

  hide(notification) {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      this.notifications = this.notifications.filter((n) => n !== notification);
    }, 400);
  }
}

// Modal System
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
        body: `<p>${message}</p><input type="text" id="${inputId}" class="modal-input" value="${defaultValue}" placeholder="Inserisci valore...">`,
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
}

const notificationSystem = new NotificationSystem();
const modalSystem = new ModalSystem();

// Main Logic
class DualWheelOfFortune {
  constructor() {
    this.wheel1Names = this.loadFromStorage("wheel1Names", []);
    this.wheel2Names = this.loadFromStorage("wheel2Names", []);
    this.availableWheel1Names = this.loadFromStorage("availableWheel1Names", [
      ...this.wheel1Names,
    ]);
    this.availableWheel2Names = this.loadFromStorage("availableWheel2Names", [
      ...this.wheel2Names,
    ]);
    this.history = this.loadFromStorage("history", []);
    this.isSpinning1 = false;
    this.isSpinning2 = false;

    this.SPIN_DURATION = 2000;
    this.FLASH_DURATION = 1500;

    this.init();
    this.bindEvents();
  }

  init() {
    this.updateWheel(1);
    this.updateWheel(2);
    this.updateNamesList(1);
    this.updateNamesList(2);
    this.updateHistory();
  }

  loadFromStorage(key, defaultValue) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.error(`Error loading ${key} from storage:`, e);
      return defaultValue;
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem("wheel1Names", JSON.stringify(this.wheel1Names));
      localStorage.setItem("wheel2Names", JSON.stringify(this.wheel2Names));
      localStorage.setItem(
        "availableWheel1Names",
        JSON.stringify(this.availableWheel1Names)
      );
      localStorage.setItem(
        "availableWheel2Names",
        JSON.stringify(this.availableWheel2Names)
      );
      localStorage.setItem("history", JSON.stringify(this.history));
    } catch (e) {
      console.error("Error saving to storage:", e);
    }
  }

  bindEvents() {
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

    document
      .getElementById("resetHistoryBtn")
      .addEventListener("click", () => this.resetHistory());
    document
      .getElementById("resetAllBtn")
      .addEventListener("click", () => this.resetAll());
    document
      .getElementById("shareHistoryBtn")
      .addEventListener("click", () => this.shareHistory());

    document
      .getElementById("spinBothBtn")
      .addEventListener("click", () => this.spinCombined());
  }

  generateAuto(wheelNumber) {
    const count =
      Number.parseInt(
        document.getElementById(`autoCount${wheelNumber}`).value
      ) || 8;

    if (wheelNumber === 1) {
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
      ];
      const shuffledNames = autoNames.sort(() => 0.5 - Math.random());
      this.wheel1Names = shuffledNames.slice(0, Math.min(count, 50));
      this.availableWheel1Names = [...this.wheel1Names];
    } else {
      const autoNations = [
        "Italia",
        "Francia",
        "Germania",
        "Spagna",
        "Regno Unito",
        "USA",
        "Canada",
        "Brasile",
        "Argentina",
        "Cina",
        "Giappone",
        "Australia",
        "India",
        "Russia",
        "Messico",
        "Egitto",
        "Sudafrica",
        "Svezia",
        "Norvegia",
        "Portogallo",
        "Belgio",
        "Svizzera",
        "Grecia",
        "Polonia",
        "Turchia",
      ];
      const shuffledNations = autoNations.sort(() => 0.5 - Math.random());
      this.wheel2Names = shuffledNations.slice(0, Math.min(count, 25));
      this.availableWheel2Names = [...this.wheel2Names];
    }

    this.updateWheel(wheelNumber);
    this.updateNamesList(wheelNumber);
    this.saveToStorage();
    this.hideResult(wheelNumber);
    const wheelName = wheelNumber === 1 ? "nomi" : "nazioni";
    notificationSystem.show(
      `${wheelName.charAt(0).toUpperCase() + wheelName.slice(1)
      } generati automaticamente!`,
      "info"
    );
  }

  getColorPalette(count) {
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
        "warning"
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
        "warning"
      );
      return;
    }

    items.push(inputValue);
    document.getElementById(inputId).value = "";

    if (wheelNumber === 1) {
      this.wheel1Names = items;
      this.availableWheel1Names.push(inputValue);
    } else {
      this.wheel2Names = items;
      this.availableWheel2Names.push(inputValue);
    }

    this.updateWheel(wheelNumber);
    this.updateNamesList(wheelNumber);
    this.saveToStorage();
    const wheelName = wheelNumber === 1 ? "nomi" : "nazioni";
    notificationSystem.show(
      `"${inputValue}" aggiunto alla ruota ${wheelName}!`,
      "success"
    );
  }

  async editName(index, wheelNumber) {
    const items = wheelNumber === 1 ? this.wheel1Names : this.wheel2Names;
    const isSpinning = wheelNumber === 1 ? this.isSpinning1 : this.isSpinning2;
    if (isSpinning) {
      const itemType = wheelNumber === 1 ? "nomi" : "nazioni";
      notificationSystem.show(
        `Non puoi modificare i ${itemType} mentre la ruota gira`,
        "warning"
      );
      return;
    }

    const currentItem = items[index];
    const itemType = wheelNumber === 1 ? "nome" : "nazione";
    const newItem = await modalSystem.prompt(
      `Modifica ${itemType}:`,
      currentItem,
      `Modifica ${itemType}`
    );

    if (newItem === null) return;
    if (newItem === currentItem) return;

    if (items.includes(newItem)) {
      notificationSystem.show(
        `Questo ${itemType} è già presente nella lista`,
        "warning"
      );
      return;
    }

    items[index] = newItem;

    const availableItems =
      wheelNumber === 1 ? this.availableWheel1Names : this.availableWheel2Names;
    const availIndex = availableItems.indexOf(currentItem);
    if (availIndex !== -1) {
      availableItems[availIndex] = newItem;
    }

    if (wheelNumber === 1) {
      this.wheel1Names = items;
      this.availableWheel1Names = availableItems;
    } else {
      this.wheel2Names = items;
      this.availableWheel2Names = availableItems;
    }

    this.updateWheel(wheelNumber);
    this.updateNamesList(wheelNumber);
    this.saveToStorage();
    const wheelName = wheelNumber === 1 ? "nomi" : "nazioni";
    notificationSystem.show(
      `"${currentItem}" modificato in "${newItem}" nella ruota ${wheelName}`,
      "success"
    );
  }

  async deleteName(index, wheelNumber) {
    const items = wheelNumber === 1 ? this.wheel1Names : this.wheel2Names;
    const isSpinning = wheelNumber === 1 ? this.isSpinning1 : this.isSpinning2;
    if (isSpinning) {
      const itemType = wheelNumber === 1 ? "nomi" : "nazioni";
      notificationSystem.show(
        `Non puoi eliminare ${itemType} mentre la ruota sta girando`,
        "warning"
      );
      return;
    }

    const item = items[index];
    const wheelName = wheelNumber === 1 ? "nomi" : "nazioni";
    const itemType = wheelNumber === 1 ? "nome" : "nazione";

    const confirmed = await modalSystem.confirm(
      `Sei sicuro di voler eliminare "${item}" dalla ruota ${wheelName}?`,
      `Elimina ${itemType}`
    );

    if (confirmed) {
      items.splice(index, 1);

      if (wheelNumber === 1) {
        const availIndex = this.availableWheel1Names.indexOf(item);
        if (availIndex !== -1) {
          this.availableWheel1Names.splice(availIndex, 1);
        }
      } else {
        const availIndex = this.availableWheel2Names.indexOf(item);
        if (availIndex !== -1) {
          this.availableWheel2Names.splice(availIndex, 1);
        }
      }

      this.updateWheel(wheelNumber);
      this.updateNamesList(wheelNumber);
      this.saveToStorage();
      this.hideResult(wheelNumber);
      notificationSystem.show(
        `"${item}" eliminato dalla ruota ${wheelName}`,
        "success"
      );
    }
  }

  updateWheel(wheelNumber) {
    const svg = document.getElementById(`wheelSvg${wheelNumber}`);
    const items =
      wheelNumber === 1 ? this.availableWheel1Names : this.availableWheel2Names;
    svg.innerHTML = "";

    if (items.length === 0) {
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
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
        "text"
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

    const colors = this.getColorPalette(items.length);
    const totalItems = items.length;
    const arcDegrees = 360 / totalItems;
    const center = 200;
    const radius = 180;

    items.forEach((item, index) => {
      const startAngle = index * arcDegrees;
      const endAngle = (index + 1) * arcDegrees;

      const startX =
        center + radius * Math.cos((Math.PI / 180) * (startAngle - 90));
      const startY =
        center + radius * Math.sin((Math.PI / 180) * (startAngle - 90));
      const endX =
        center + radius * Math.cos((Math.PI / 180) * (endAngle - 90));
      const endY =
        center + radius * Math.sin((Math.PI / 180) * (endAngle - 90));
      const largeArcFlag = arcDegrees > 180 ? 1 : 0;

      const pathData = [
        `M ${center},${center}`,
        `L ${startX},${startY}`,
        `A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY}`,
        "Z",
      ].join(" ");

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute("d", pathData);
      path.setAttribute("fill", colors[index]);
      path.classList.add("wheel-section");
      svg.appendChild(path);

      const textAngle = startAngle + arcDegrees / 2;
      const textRadius = radius * 0.7;
      const textX =
        center + textRadius * Math.cos((Math.PI / 180) * (textAngle - 90));
      const textY =
        center + textRadius * Math.sin((Math.PI / 180) * (textAngle - 90));

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
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
        `rotate(${textAngle}, ${textX}, ${textY})`
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
              `
      )
      .join("");
  }

  showResult(winner, wheelNumber) {
    const resultDisplay = document.getElementById(
      `resultDisplay${wheelNumber}`
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

  async spinWheel(wheelNumber) {
    const items =
      wheelNumber === 1 ? this.availableWheel1Names : this.availableWheel2Names;
    const spinButton = document.getElementById(`spinButton${wheelNumber}`);
    const resultType = wheelNumber === 1 ? "nome" : "nazione";
    const svg = document.getElementById(`wheelSvg${wheelNumber}`);

    if (this.isSpinning1 || this.isSpinning2) {
      notificationSystem.show(
        "Attenzione! Una ruota è già in rotazione! Attendi la fine dell'estrazione.",
        "warning"
      );
      return;
    }

    if (items.length === 0) {
      notificationSystem.show(
        `Nessun ${resultType} disponibile per l'estrazione. Resetta la cronologia o aggiungi nuovi elementi.`,
        "error"
      );
      return;
    }

    spinButton.disabled = true;
    document.getElementById("spinBothBtn").disabled = true;
    document.getElementById(
      `spinButton${wheelNumber === 1 ? 2 : 1}`
    ).disabled = true;

    if (wheelNumber === 1) this.isSpinning1 = true;
    if (wheelNumber === 2) this.isSpinning2 = true;

    this.hideResult(wheelNumber);

    const randomIndex = Math.floor(Math.random() * items.length);
    const winner = items[randomIndex];

    const totalRotation =
      360 * 20 + (360 / items.length) * randomIndex + 180 + Math.random() * 30;

    svg.style.transition = "none";
    svg.style.transform = "rotate(0deg)";
    svg.offsetHeight;

    svg.style.transition = `transform ${this.SPIN_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    svg.style.transform = `rotate(-${totalRotation}deg)`;
    svg.classList.add("spinning");

    svg
      .querySelectorAll(".wheel-section")
      .forEach((path) => path.classList.remove("winner"));

    setTimeout(() => {
      svg.classList.remove("spinning");

      const winnerSection = svg.querySelectorAll(".wheel-section")[randomIndex];
      winnerSection.classList.add("winner");

      setTimeout(() => {
        winnerSection.classList.remove("winner");

        items.splice(randomIndex, 1);

        if (wheelNumber === 1) this.isSpinning1 = false;
        if (wheelNumber === 2) this.isSpinning2 = false;
        spinButton.disabled = false;
        document.getElementById("spinBothBtn").disabled = false;
        document.getElementById(
          `spinButton${wheelNumber === 1 ? 2 : 1}`
        ).disabled = false;

        this.showResult(winner, wheelNumber);
        this.addToHistory(wheelNumber, winner);
        notificationSystem.show(
          `🎉 Il ${resultType} estratto è: ${winner}!`,
          "success",
          "Abbiamo un vincitore!",
          8000
        );

        this.updateWheel(wheelNumber);
        this.saveToStorage();
      }, this.FLASH_DURATION);
    }, this.SPIN_DURATION);
  }

  async spinCombined() {
    const items1 = this.availableWheel1Names;
    const items2 = this.availableWheel2Names;
    const spinButton1 = document.getElementById("spinButton1");
    const spinButton2 = document.getElementById("spinButton2");
    const spinBothBtn = document.getElementById("spinBothBtn");

    const randomIndex1 = Math.floor(Math.random() * items1.length);
    const winner1 = items1[randomIndex1];
    const randomIndex2 = Math.floor(Math.random() * items2.length);
    const winner2 = items2[randomIndex2];

    if (items1.length === 0 || items2.length === 0) {
      notificationSystem.show(
        "Assicurati di avere almeno un nome e una nazione disponibili per l'estrazione Nomi & Nazioni!",
        "warning"
      );
      return;
    }

    if (this.isSpinning1 || this.isSpinning2) {
      notificationSystem.show(
        "Una ruota è già in rotazione! Attendi la fine dell'estrazione.",
        "warning"
      );
      return;
    }

    spinButton1.disabled = true;
    spinButton2.disabled = true;
    spinBothBtn.disabled = true;

    this.isSpinning1 = true;
    this.isSpinning2 = true;

    this.hideResult(1);
    this.hideResult(2);

    const svg1 = document.getElementById(`wheelSvg1`);
    const totalRotation1 =
      360 * 20 +
      (360 / items1.length) * randomIndex1 +
      180 +
      Math.random() * 30;

    svg1.style.transition = "none";
    svg1.style.transform = "rotate(0deg)";
    svg1.offsetHeight;
    svg1.style.transition = `transform ${this.SPIN_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    svg1.style.transform = `rotate(-${totalRotation1}deg)`;
    svg1.classList.add("spinning");

    const svg2 = document.getElementById(`wheelSvg2`);
    const totalRotation2 =
      360 * 20 +
      (360 / items2.length) * randomIndex2 +
      180 +
      Math.random() * 30;

    svg2.style.transition = "none";
    svg2.style.transform = "rotate(0deg)";
    svg2.offsetHeight;
    svg2.style.transition = `transform ${this.SPIN_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    svg2.style.transform = `rotate(-${totalRotation2}deg)`;
    svg2.classList.add("spinning");

    svg1
      .querySelectorAll(".wheel-section")
      .forEach((path) => path.classList.remove("winner"));
    svg2
      .querySelectorAll(".wheel-section")
      .forEach((path) => path.classList.remove("winner"));

    await new Promise((resolve) => setTimeout(resolve, this.SPIN_DURATION));

    const winnerSection1 =
      svg1.querySelectorAll(".wheel-section")[randomIndex1];
    const winnerSection2 =
      svg2.querySelectorAll(".wheel-section")[randomIndex2];
    winnerSection1.classList.add("winner");
    winnerSection2.classList.add("winner");

    await new Promise((resolve) => setTimeout(resolve, this.FLASH_DURATION));

    svg1.classList.remove("spinning");
    svg2.classList.remove("spinning");

    winnerSection1.classList.remove("winner");
    winnerSection2.classList.remove("winner");

    this.isSpinning1 = false;
    this.isSpinning2 = false;

    items1.splice(randomIndex1, 1);
    items2.splice(randomIndex2, 1);

    this.updateWheel(1);
    this.updateWheel(2);
    this.updateNamesList(1);
    this.updateNamesList(2);
    this.saveToStorage();

    this.showResult(winner1, 1);
    this.showResult(winner2, 2);

    this.addToHistory(0, winner1, winner2);

    spinButton1.disabled = false;
    spinButton2.disabled = false;
    spinBothBtn.disabled = false;

    notificationSystem.show(
      `🎉 Estrazione Nomi & Nazioni!: ${winner1} e ${winner2}!`,
      "success",
      "Abbiamo una Generazione Nome & Nazione!",
      8000
    );
  }

  addToHistory(wheelNumber, winner, nationWinner = null) {
    const timestamp = new Date();
    const historyEntry = {
      id: Date.now(),
      wheelNumber,
      winner,
      nationWinner,
      timestamp: timestamp.toLocaleString("it-IT"),
      wheelType:
        wheelNumber === 1
          ? "Nomi"
          : wheelNumber === 2
            ? "Nazioni"
            : "Nomi & Nazioni",
    };
    this.history.unshift(historyEntry);
    this.updateHistory();
    this.saveToStorage();
  }

  updateHistory() {
    const historyList = document.getElementById("historyList");
    if (this.history.length === 0) {
      historyList.innerHTML = `
              <div class="empty-state">
                <div class="emoji">📜</div>
                <p>Nessuna estrazione ancora.<br />Gira le ruote per iniziare!</p>
              </div>
            `;
      return;
    }

    historyList.innerHTML = this.history.slice().reverse().map((entry, index) => {
      if (entry.wheelNumber === 0) {
        return `
                    <div class="history-item">
                        <div class="history-item-header">
                            <div class="history-item-number">#${index + 1
          }</div>
                            <div class="history-item-time">${entry.timestamp
          }</div>
                        </div>
                        <div class="history-item-result">
                            <div class="history-result-box">
                                <div class="history-result-label">👤 Nome Estratto</div>
                                <div class="history-result-value">${entry.winner
          }</div>
                            </div>
                            <div class="history-result-box">
                                <div class="history-result-label">🌍 Nazione Estratta</div>
                                <div class="history-result-value">${entry.nationWinner
          }</div>
                            </div>
                        </div>
                    </div>
                `;
      } else {
        return `
                    <div class="history-item">
                        <div class="history-item-header">
                            <div class="history-item-number">#${index + 1
          }</div>
                            <div class="history-item-time">${entry.timestamp
          }</div>
                        </div>
                        <div class="history-item-result">
                            <div class="history-result-box">
                                <div class="history-result-label">${entry.wheelType === "Nomi" ? "👤" : "🌍"
          } ${entry.wheelType}</div>
                                <div class="history-result-value">${entry.winner
          }</div>
                            </div>
                        </div>
                    </div>
                `;
      }
    })
      .join("");
  }

  async resetHistory() {
    const confirmed = await modalSystem.confirm(
      "Sei sicuro di voler resettare la cronologia? Questo ripristinerà anche tutti i nomi e le nazioni disponibili per le estrazioni.",
      "Reset Cronologia"
    );

    if (confirmed) {
      this.history = [];
      this.availableWheel1Names = [...this.wheel1Names];
      this.availableWheel2Names = [...this.wheel2Names];
      this.updateHistory();
      this.updateWheel(1);
      this.updateWheel(2);
      this.saveToStorage();
      notificationSystem.show(
        "Cronologia resettata! Tutti gli elementi sono di nuovo disponibili.",
        "success"
      );
    }
  }

  async resetAll() {
    const confirmed = await modalSystem.confirm(
      "⚠️ ATTENZIONE: Sei sicuro di voler resettare COMPLETAMENTE l'applicazione? Verranno eliminati TUTTI i nomi, le nazioni e la cronologia.",
      "Reset Completo"
    );

    if (confirmed) {
      this.wheel1Names = [];
      this.availableWheel1Names = [];
      this.wheel2Names = [];
      this.availableWheel2Names = [];
      this.history = [];

      this.updateWheel(1);
      this.updateWheel(2);
      this.updateNamesList(1);
      this.updateNamesList(2);
      this.updateHistory();
      this.saveToStorage();
      this.hideResult(1);
      this.hideResult(2);
      notificationSystem.show(
        "Tutti i dati sono stati cancellati. Inizia ad aggiungere nuovi nomi e nazioni!",
        "success"
      );
    }
  }

  // FUNZIONE MODIFICATA PER ORDINARE DALLA PIÙ VECCHIA (#1) ALLA PIÙ RECENTE
  shareHistory() {
    if (this.history.length === 0) {
      notificationSystem.show("Nessuna estrazione da condividere.", "warning");
      return;
    }

    let shareText = "🎉 *CRONOLOGIA ESTRAZIONI* 🎉\n";
    shareText += "🎡 _Ruota Nomi 👤 & Nazioni_ 🌍\n\n";

    // 1. Creiamo una copia e la invertiamo per avere [più vecchio, ..., più recente]
    const orderedHistory = [...this.history].reverse();
    const totalCount = orderedHistory.length;

    if (totalCount === 0) {
      shareText += "_Nessuna estrazione registrata finora._";
    } else {
      orderedHistory.forEach((entry, index) => {
        // La numerazione sarà #1, #2, #3, ...
        const number = index + 1;
        let result;

        if (entry.wheelNumber === 0) {
          result = `*👤 Nome:* ${entry.winner}\n*🌍 Nazione:* ${entry.nationWinner}`;
        } else if (entry.wheelNumber === 1) {
          result = `*👤 Estratto:* ${entry.winner}`;
        } else {
          result = `*🌍 Estratta:* ${entry.winner}`;
        }

        shareText += `---------------------------------\n`;
        shareText += `⭐ *#${number}* - ${entry.wheelType} (🕒 ${entry.timestamp})\n`;
        shareText += `${result}\n`;
      });
      shareText += "---------------------------------\n\n";
      shareText += "_Generato dalla Ruota Nomi & Nazioni_";
    }

    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank");
  }

  async clearWheel(wheelNumber) {
    const items = wheelNumber === 1 ? this.wheel1Names : this.wheel2Names;
    const wheelName = wheelNumber === 1 ? "nomi" : "nazioni";

    const confirmed = await modalSystem.confirm(
      `Sei sicuro di voler cancellare tutti i ${items.length} ${wheelName}?`,
      "Cancella Tutto"
    );

    if (confirmed) {
      if (wheelNumber === 1) {
        this.wheel1Names = [];
        this.availableWheel1Names = [];
      } else {
        this.wheel2Names = [];
        this.availableWheel2Names = [];
      }

      this.updateWheel(wheelNumber);
      this.updateNamesList(wheelNumber);
      this.saveToStorage();
      this.hideResult(wheelNumber);

      notificationSystem.show(
        `Tutti i ${wheelName} sono stati cancellati`,
        "success"
      );
    }
  }

  async loadFile(event, wheelNumber) {
    const file = event.target.files[0];
    if (!file) return;

    const items = wheelNumber === 1 ? this.wheel1Names : this.wheel2Names;
    const wheelName = wheelNumber === 1 ? "nomi" : "nazioni";

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target.result;
      let newItems = [];

      try {
        if (file.name.endsWith(".json")) {
          const data = JSON.parse(content);
          if (Array.isArray(data)) {
            newItems = data.map((item) =>
              typeof item === "string"
                ? item
                : item.name || item.nation || "Item"
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
      } catch (error) {
        notificationSystem.show(
          "Errore nella lettura del file. Assicurati che sia un formato JSON o TXT valido.",
          "error"
        );
        return;
      }

      if (newItems.length === 0) {
        const itemType = wheelNumber === 1 ? "nomi" : "nazioni";
        notificationSystem.show(
          `Il file non contiene ${itemType} validi`,
          "warning"
        );
        return;
      }

      const uniqueItems = newItems.filter(
        (newItem) => !items.includes(newItem)
      );
      const remainingSlots = 100 - items.length;
      const itemsToAdd = uniqueItems.slice(0, remainingSlots);

      if (itemsToAdd.length === 0) {
        const itemType = wheelNumber === 1 ? "nomi" : "nazioni";
        notificationSystem.show(
          `Tutti i ${itemType} nel file sono già presenti nella lista`,
          "info"
        );
        return;
      }

      if (wheelNumber === 1) {
        this.wheel1Names = [...this.wheel1Names, ...itemsToAdd];
        this.availableWheel1Names = [
          ...this.availableWheel1Names,
          ...itemsToAdd,
        ];
      } else {
        this.wheel2Names = [...this.wheel2Names, ...itemsToAdd];
        this.availableWheel2Names = [
          ...this.availableWheel2Names,
          ...itemsToAdd,
        ];
      }

      this.updateWheel(wheelNumber);
      this.updateNamesList(wheelNumber);
      this.saveToStorage();

      notificationSystem.show(
        `${itemsToAdd.length} ${wheelName} aggiunti dal file!`,
        "success"
      );
    };

    reader.readAsText(file);
    event.target.value = null;
  }

  exportTxt(wheelNumber) {
    const items = wheelNumber === 1 ? this.wheel1Names : this.wheel2Names;
    const wheelName = wheelNumber === 1 ? "nomi" : "nazioni";

    if (items.length === 0) {
      notificationSystem.show(
        `Nessun ${wheelName.slice(0, -1)} da esportare`,
        "warning"
      );
      return;
    }

    const content = items.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${wheelName}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    notificationSystem.show(
      `${items.length} ${wheelName} esportati in formato TXT`,
      "success"
    );
  }

  exportJson(wheelNumber) {
    const items = wheelNumber === 1 ? this.wheel1Names : this.wheel2Names;
    const wheelName = wheelNumber === 1 ? "nomi" : "nazioni";

    if (items.length === 0) {
      notificationSystem.show(
        `Nessun ${wheelName.slice(0, -1)} da esportare`,
        "warning"
      );
      return;
    }

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
      "success"
    );
  }
}

const dualWheel = new DualWheelOfFortune();
window.dualWheel = dualWheel;

setTimeout(() => {
  notificationSystem.show(
    "Benvenuto! Aggiungi nomi e nazioni per iniziare, o usa 'Genera Automaticamente'.",
    "info",
    "Ruota Nomi & Nazioni"
  );
}, 500);