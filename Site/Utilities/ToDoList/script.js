class ModernTodoApp {
  constructor() {
    this.todos = [];
    this.nextId = 1;
    this.filter = "all"; // Aggiunto stato per il filtro
    this.initializeElements();
    this.attachEventListeners();
    this.loadInitialData();
  }

  initializeElements() {
    this.addButton = document.getElementById("add-todo");
    this.input = document.getElementById("new-todo");
    this.todoList = document.getElementById("todo-list");
    this.themeToggle = document.getElementById("theme-toggle");
    this.clearCompleted = document.getElementById("clear-completed");
    this.clearAll = document.getElementById("clear-all");
    this.emptyState = document.getElementById("empty-state");
    this.stats = document.getElementById("stats");
    this.totalCount = document.getElementById("total-count");
    this.completedCount = document.getElementById("completed-count");
    this.pendingCount = document.getElementById("pending-count");

    // Nuovi elementi per i filtri
    this.filterButtons = document.querySelectorAll(".filter-btn");
  }

  attachEventListeners() {
    this.addButton.addEventListener("click", () => this.addTodo());
    this.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTodo();
    });
    this.themeToggle.addEventListener("click", () => this.toggleTheme());
    this.clearCompleted.addEventListener("click", () =>
      this.clearCompletedTodos()
    );
    this.clearAll.addEventListener("click", () => this.clearAllTodos());

    // Event listeners per i nuovi filtri
    this.filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.setFilter(btn.dataset.filter));
    });
  }

  loadInitialData() {
    const storedData = localStorage.getItem("todos");
    if (storedData) {
      try {
        this.todos = JSON.parse(storedData);
        this.nextId =
          this.todos.length > 0
            ? Math.max(...this.todos.map((t) => t.id)) + 1
            : 1;
      } catch (e) {
        console.error("Failed to parse todos from localStorage", e);
        this.todos = [];
        this.nextId = 1;
      }
    }
    this.updateDisplay();
  }

  saveData() {
    localStorage.setItem("todos", JSON.stringify(this.todos));
  }

  addTodo() {
    const text = this.input.value.trim();
    if (text === "") {
      this.showAlert({
        type: "warning",
        title: "⚠️ Attenzione!",
        message:
          "Per favore, inserisci il testo dell'attività prima di aggiungerla alla lista.",
        buttons: [
          {
            text: "✅ Ho capito",
            type: "primary",
            action: () => {
              this.input.focus();
            },
          },
        ],
      });
      return;
    }

    if (text.length > 100) {
      this.showAlert({
        type: "warning",
        title: "📝 Testo troppo lungo",
        message:
          "L'attività non può superare i 100 caratteri. Riduci il testo per continuare.",
        buttons: [
          {
            text: "✂️ Riduco",
            type: "primary",
            action: () => {
              this.input.focus();
              this.input.select();
            },
          },
        ],
      });
      return;
    }

    const todo = {
      id: this.nextId++,
      text: text,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.todos.push(todo);
    this.input.value = "";
    this.saveData();
    this.updateDisplay();

    this.showAlert({
      type: "success",
      title: "🎉 Fantastico!",
      message: `"${text}" è stata aggiunta con successo alle tue attività!`,
      buttons: [{ text: "🚀 Perfetto!", type: "primary", action: () => {} }],
    });
  }

  toggleTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      const wasCompleted = todo.completed;
      todo.completed = !todo.completed;
      this.saveData();
      this.updateDisplay();

      if (!wasCompleted && todo.completed) {
        this.showAlert({
          type: "success",
          title: "✅ Completato!",
          message: `Ottimo lavoro! Hai completato "${todo.text}"`,
          buttons: [{ text: "🎊 Evviva!", type: "primary", action: () => {} }],
        });
      }
    }
  }

  editTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) return;

    this.showAlert({
      type: "warning",
      title: "✏️ Modifica attività",
      message: "Inserisci il nuovo testo per questa attività:",
      input: {
        placeholder: "Scrivi qui il nuovo testo...",
        value: todo.text,
      },
      buttons: [
        {
          text: "💾 Salva modifiche",
          type: "primary",
          action: (newText) => {
            if (!newText || newText.trim() === "") {
              this.showAlert({
                type: "warning",
                title: "⚠️ Testo vuoto",
                message: "Il testo dell'attività non può essere vuoto!",
                buttons: [
                  {
                    text: "🔄 Riprova",
                    type: "primary",
                    action: () => {
                      setTimeout(() => this.editTodo(id), 100);
                    },
                  },
                ],
              });
              return;
            }

            if (newText.trim().length > 100) {
              this.showAlert({
                type: "warning",
                title: "📝 Testo troppo lungo",
                message: "Il testo non può superare i 100 caratteri!",
                buttons: [
                  {
                    text: "🔄 Riprova",
                    type: "primary",
                    action: () => {
                      setTimeout(() => this.editTodo(id), 100);
                    },
                  },
                ],
              });
              return;
            }

            const oldText = todo.text;
            todo.text = newText.trim();
            this.saveData();
            this.updateDisplay();

            this.showAlert({
              type: "success",
              title: "✅ Modificato con successo!",
              message: `L\'attività è stata aggiornata da "${oldText}" a "${newText.trim()}"`,
              buttons: [
                { text: "🎯 Perfetto!", type: "primary", action: () => {} },
              ],
            });
          },
        },
        { text: "❌ Annulla", type: "secondary", action: () => {} },
      ],
    });
  }

  deleteTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) return;

    this.showAlert({
      type: "danger",
      title: "🗑️ Elimina attività",
      message: `Sei davvero sicuro di voler eliminare definitivamente "${todo.text}"?<br><br><strong>⚠️ Questa azione non può essere annullata!</strong>`,
      buttons: [
        {
          text: "🗑️ Sì, elimina",
          type: "danger",
          action: () => {
            const todoElement = document.querySelector(`[data-id="${id}"]`);
            if (todoElement) {
              todoElement.style.animation =
                "slideOut 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards";
              setTimeout(() => {
                this.todos = this.todos.filter((t) => t.id !== id);
                this.saveData();
                this.updateDisplay();

                this.showAlert({
                  type: "success",
                  title: "✅ Eliminato!",
                  message: `"${todo.text}" è stata rimossa dalle tue attività.`,
                  buttons: [
                    { text: "👍 Ok", type: "primary", action: () => {} },
                  ],
                });
              }, 500);
            }
          },
        },
        { text: "❌ Annulla", type: "secondary", action: () => {} },
      ],
    });
  }

  clearCompletedTodos() {
    const completedTodos = this.todos.filter((t) => t.completed);
    if (completedTodos.length === 0) {
      this.showAlert({
        type: "warning",
        title: "🤔 Nessuna attività completata",
        message:
          "Non hai ancora completato nessuna attività da eliminare!<br><br>Completa alcune attività e poi torna qui. 💪",
        buttons: [{ text: "💪 Ci penso!", type: "primary", action: () => {} }],
      });
      return;
    }

    this.showAlert({
      type: "danger",
      title: "🗑️ Elimina tutte le completate",
      message: `Stai per eliminare <strong>${
        completedTodos.length
      } attività completate</strong>:<br><br>${completedTodos
        .map((t) => `• ${t.text}`)
        .join(
          "<br>"
        )}<br><br>⚠️ <strong>Questa azione è irreversibile!</strong>`,
      buttons: [
        {
          text: `🗑️ Elimina ${completedTodos.length} attività`,
          type: "danger",
          action: () => {
            const remainingTodos = this.todos.filter((t) => !t.completed);
            this.todos = remainingTodos;
            this.saveData();
            this.updateDisplay();

            this.showAlert({
              type: "success",
              title: "🎉 Pulizia completata!",
              message: `${completedTodos.length} attività completate sono state eliminate con successo!`,
              buttons: [
                { text: "✨ Fantastico!", type: "primary", action: () => {} },
              ],
            });
          },
        },
        { text: "❌ Annulla", type: "secondary", action: () => {} },
      ],
    });
  }

  clearAllTodos() {
    if (this.todos.length === 0) {
      this.showAlert({
        type: "warning",
        title: "📝 Lista già vuota",
        message:
          "La tua lista delle attività è già vuota!<br><br>Aggiungi qualche nuova attività per iniziare. 🚀",
        buttons: [
          {
            text: "➕ Aggiungo subito!",
            type: "primary",
            action: () => {
              this.input.focus();
            },
          },
        ],
      });
      return;
    }

    const totalTodos = this.todos.length;
    const completedTodos = this.todos.filter((t) => t.completed).length;
    const pendingTodos = totalTodos - completedTodos;

    this.showAlert({
      type: "danger",
      title: "💥 ATTENZIONE - Eliminazione totale",
      message: `<strong>Stai per eliminare TUTTE le tue ${totalTodos} attività:</strong><br><br>📊 <strong>Riepilogo:</strong><br>✅ ${completedTodos} completate<br>⏳ ${pendingTodos} in sospeso<br><br>🚨 <strong>QUESTA AZIONE È IRREVERSIBILE!</strong><br>Una volta eliminato tutto, non potrai più recuperare le tue attività.`,
      buttons: [
        {
          text: "💥 SÌ, ELIMINA TUTTO",
          type: "danger",
          action: () => {
            // Animazione di eliminazione per tutti gli elementi
            const todoElements = document.querySelectorAll(".todo-item");
            todoElements.forEach((element, index) => {
              setTimeout(() => {
                element.style.animation =
                  "slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards";
              }, index * 100);
            });

            setTimeout(() => {
              this.todos = [];
              this.saveData();
              this.updateDisplay();

              this.showAlert({
                type: "success",
                title: "🎉 Reset completato!",
                message: `Tutte le ${totalTodos} attività sono state eliminate!<br><br>La tua lista è ora vuota e pronta per nuove sfide! ✨`,
                buttons: [
                  {
                    text: "🚀 Ricominciamo!",
                    type: "primary",
                    action: () => {
                      this.input.focus();
                    },
                  },
                ],
              });
            }, todoElements.length * 100 + 400);
          },
        },
        {
          text: "❌ Annulla (meglio così!)",
          type: "secondary",
          action: () => {},
        },
      ],
    });
  }

  setFilter(newFilter) {
    this.filter = newFilter;
    this.updateDisplay();

    // Rimuove la classe attiva da tutti i bottoni e la aggiunge a quello cliccato
    this.filterButtons.forEach((btn) => btn.classList.remove("active"));
    document
      .querySelector(`[data-filter="${newFilter}"]`)
      .classList.add("active");
  }

  updateDisplay() {
    this.renderTodos();
    this.updateStats();
    this.updateEmptyState();
  }

  renderTodos() {
    this.todoList.innerHTML = "";
    
    // Filtra le attività in base allo stato
    const filteredTodos = this.todos.filter((todo) => {
      if (this.filter === "completed") return todo.completed;
      if (this.filter === "pending") return !todo.completed;
      return true; // "all"
    });

    filteredTodos.forEach((todo, index) => {
      const li = document.createElement("li");
      li.className = `todo-item ${todo.completed ? "completed" : ""}`;
      li.setAttribute("data-id", todo.id);
      li.style.animationDelay = `${index * 0.1}s`;

      li.innerHTML = `
            <div class="todo-checkbox ${
              todo.completed ? "checked" : ""
            }" onclick="app.toggleTodo(${todo.id})"></div>
            <div class="todo-text" onclick="app.editTodo(${
              todo.id
            })" title="Clicca per modificare">${todo.text}</div>
            <div class="todo-actions">
              <button class="todo-btn edit-btn" onclick="app.editTodo(${
                todo.id
              })" title="Modifica attività">
                <span class="btn-icon">✏️</span>
              </button>
              <button class="todo-btn delete-btn" onclick="app.deleteTodo(${
                todo.id
              })" title="Elimina attività">
                <span class="btn-icon">🗑️</span>
              </button>
            </div>
          `;

      this.todoList.appendChild(li);
    });
  }

  updateStats() {
    const total = this.todos.length;
    const completed = this.todos.filter((t) => t.completed).length;
    const pending = total - completed;

    this.totalCount.textContent = total;
    this.completedCount.textContent = completed;
    this.pendingCount.textContent = pending;

    this.stats.style.display = total > 0 ? "flex" : "none";
  }

  updateEmptyState() {
    // Aggiorna lo stato vuoto in base al filtro corrente
    const filteredCount = this.todos.filter((todo) => {
        if (this.filter === "completed") return todo.completed;
        if (this.filter === "pending") return !todo.completed;
        return true;
      }).length;
    this.emptyState.style.display = filteredCount === 0 ? "block" : "none";
  }

  toggleTheme() {
    const currentTheme = document.body.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.body.setAttribute("data-theme", newTheme);

    const themeIcon = this.themeToggle.querySelector(".theme-icon");
    const themeText = this.themeToggle.querySelector(".theme-text");

    if (newTheme === "dark") {
      themeIcon.textContent = "☀️";
      themeText.textContent = "Chiara";
    } else {
      themeIcon.textContent = "🌙";
      themeText.textContent = "Scura";
    }

    this.showAlert({
      type: "success",
      title:
        newTheme === "dark"
          ? "🌙 Modalità scura attivata"
          : "☀️ Modalità chiara attivata",
      message: `Il tema è stato cambiato con successo! ${
        newTheme === "dark"
          ? "Perfetto per lavorare di sera! 🌟"
          : "Ideale per la produttività diurna! ✨"
      }`,
      buttons: [
        {
          text: newTheme === "dark" ? "🌟 Fantastico!" : "✨ Perfetto!",
          type: "primary",
          action: () => {},
        },
      ],
    });
  }

  showAlert({ type, title, message, input, buttons }) {
    const alertDiv = document.createElement("div");
    alertDiv.className = "custom-alert";

    let inputHTML = "";
    if (input) {
      inputHTML = `<input type="text" class="alert-input" placeholder="${
        input.placeholder
      }" value="${input.value || ""}" maxlength="100">`;
    }

    const buttonsHTML = buttons
      .map(
        (btn) =>
          `<button class="alert-btn ${btn.type}" data-action="${buttons.indexOf(
            btn
          )}">${btn.text}</button>`
      )
      .join("");

    const iconMap = {
      warning: "⚠️",
      danger: "🚨",
      success: "✅",
    };

    alertDiv.innerHTML = `
          <div class="alert-content">
            <div class="alert-icon ${type}">
              ${iconMap[type]}
            </div>
            <div class="alert-title">${title}</div>
            <div class="alert-message">${message}</div>
            ${inputHTML}
            <div class="alert-buttons">
              ${buttonsHTML}
            </div>
          </div>
        `;

    document.body.appendChild(alertDiv);

    setTimeout(() => alertDiv.classList.add("show"), 50);

    const alertInput = alertDiv.querySelector(".alert-input");
    if (alertInput) {
      setTimeout(() => {
        alertInput.focus();
        alertInput.select();
      }, 100);
    }

    buttons.forEach((btn, index) => {
      const btnElement = alertDiv.querySelector(`[data-action="${index}"]`);
      btnElement.addEventListener("click", () => {
        const inputValue = alertInput ? alertInput.value.trim() : null;
        alertDiv.classList.remove("show");
        setTimeout(() => {
          if (document.body.contains(alertDiv)) {
            document.body.removeChild(alertDiv);
          }
        }, 400);
        setTimeout(() => btn.action(inputValue), 100);
      });
    });

    // Gestione tasti per gli alert con input
    if (alertInput) {
      alertInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const primaryBtn = buttons.find((btn) => btn.type === "primary");
          if (primaryBtn) {
            const inputValue = alertInput.value.trim();
            alertDiv.classList.remove("show");
            setTimeout(() => {
              if (document.body.contains(alertDiv)) {
                document.body.removeChild(alertDiv);
              }
            }, 400);
            setTimeout(() => primaryBtn.action(inputValue), 100);
          }
        }
      });
    }

    // Chiusura con ESC
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        const cancelBtn = buttons.find((btn) => btn.type === "secondary");
        if (cancelBtn) {
          alertDiv.classList.remove("show");
          setTimeout(() => {
            if (document.body.contains(alertDiv)) {
              document.body.removeChild(alertDiv);
            }
          }, 400);
          setTimeout(() => cancelBtn.action(), 100);
        }
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);
  }
}

// Inizializza l'app
const app = new ModernTodoApp();

// Effetti aggiuntivi per l'interfaccia
document.addEventListener("DOMContentLoaded", function () {
  // Effetto particelle casuali per celebrare
  const createParticle = () => {
    const particle = document.createElement("div");
    particle.style.cssText = `
          position: fixed;
          width: 8px;
          height: 8px;
          background: linear-gradient(45deg, #6366f1, #10b981);
          border-radius: 50%;
          pointer-events: none;
          z-index: 999;
          opacity: 0.7;
        `;

    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight + 10;

    particle.style.left = startX + "px";
    particle.style.top = startY + "px";

    document.body.appendChild(particle);

    const animation = particle.animate(
      [
        { transform: "translateY(0) rotate(0deg)", opacity: 0.7 },
        {
          transform: `translateY(-${
            window.innerHeight + 100
          }px) rotate(360deg)`,
          opacity: 0,
        },
      ],
      {
        duration: 3000,
        easing: "linear",
      }
    );

    animation.onfinish = () => {
      if (document.body.contains(particle)) {
        document.body.removeChild(particle);
      }
    };
  };

  // Aggiungi qualche particella occasionale
  setInterval(() => {
    if (Math.random() < 0.1) {
      createParticle();
    }
  }, 2000);
});