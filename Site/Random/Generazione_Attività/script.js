class ActivityGenerator {
  constructor() {
    this.generatedActivities = [];
    this.pendingDeleteId = null;

    this.activities = [
      // Creativo
      {
        title: "Disegna un autoritratto",
        description:
          "Prendi carta e matita e disegna te stesso guardandoti allo specchio",
        category: "creativo",
        icon: "🎨",
        time: "30-60 min",
      },
      {
        title: "Scrivi una storia di 100 parole",
        description: "Crea una micro-storia completa in esattamente 100 parole",
        category: "creativo",
        icon: "✍️",
        time: "20-30 min",
      },
      {
        title: "Componi una canzone",
        description:
          "Inventa una melodia e scrivi il testo di una canzone originale",
        category: "creativo",
        icon: "🎵",
        time: "45-90 min",
      },
      {
        title: "Crea un collage",
        description:
          "Usa riviste, giornali e materiali vari per creare un'opera d'arte",
        category: "creativo",
        icon: "✂️",
        time: "40-60 min",
      },
      {
        title: "Fotografa 10 oggetti blu",
        description:
          "Trova e fotografa 10 oggetti di colore blu nella tua casa",
        category: "creativo",
        icon: "📸",
        time: "15-25 min",
      },

      // Fisico
      {
        title: "Fai 50 jumping jacks",
        description:
          "Esegui 50 saltelli a gambe divaricate per attivare il corpo",
        category: "fisico",
        icon: "🤸",
        time: "5-10 min",
      },
      {
        title: "Cammina per 2000 passi",
        description: "Esci e cammina fino a raggiungere 2000 passi",
        category: "fisico",
        icon: "🚶",
        time: "15-20 min",
      },
      {
        title: "Stretching di 10 minuti",
        description: "Dedica 10 minuti a stretching e allungamento muscolare",
        category: "fisico",
        icon: "🧘",
        time: "10 min",
      },
      {
        title: "Balla la tua canzone preferita",
        description: "Metti la musica e balla liberamente per almeno 3 canzoni",
        category: "fisico",
        icon: "💃",
        time: "10-15 min",
      },
      {
        title: "Fai le scale 5 volte",
        description: "Sali e scendi le scale di casa 5 volte consecutive",
        category: "fisico",
        icon: "🏃",
        time: "5-10 min",
      },

      // Mentale
      {
        title: "Risolvi un sudoku",
        description: "Completa un puzzle sudoku di difficoltà media",
        category: "mentale",
        icon: "🧩",
        time: "15-30 min",
      },
      {
        title: "Impara 5 parole in una lingua straniera",
        description:
          "Scegli una lingua e impara 5 nuove parole con la pronuncia",
        category: "mentale",
        icon: "🌍",
        time: "20-30 min",
      },
      {
        title: "Medita per 10 minuti",
        description:
          "Trova un posto tranquillo e medita concentrandoti sul respiro",
        category: "mentale",
        icon: "🧠",
        time: "10 min",
      },
      {
        title: "Leggi un articolo interessante",
        description:
          "Trova e leggi un articolo su un argomento che non conosci",
        category: "mentale",
        icon: "📚",
        time: "15-25 min",
      },
      {
        title: "Calcola mentalmente 20 operazioni",
        description:
          "Fai 20 calcoli matematici a mente senza usare calcolatrice",
        category: "mentale",
        icon: "🔢",
        time: "10-15 min",
      },

      // Sociale
      {
        title: "Chiama un vecchio amico",
        description:
          "Contatta qualcuno che non senti da tempo per fare due chiacchiere",
        category: "sociale",
        icon: "📞",
        time: "20-45 min",
      },
      {
        title: "Scrivi un messaggio di ringraziamento",
        description:
          "Manda un messaggio di gratitudine a qualcuno che ti ha aiutato",
        category: "sociale",
        icon: "💌",
        time: "10-15 min",
      },
      {
        title: "Complimenta 3 persone",
        description: "Fai un complimento sincero a 3 persone diverse oggi",
        category: "sociale",
        icon: "😊",
        time: "Durante la giornata",
      },
      {
        title: "Organizza un'uscita",
        description:
          "Pianifica un'attività da fare con amici o famiglia nel weekend",
        category: "sociale",
        icon: "🎉",
        time: "15-30 min",
      },
      {
        title: "Condividi una ricetta",
        description:
          "Condividi la ricetta del tuo piatto preferito con qualcuno",
        category: "sociale",
        icon: "👨‍🍳",
        time: "10-20 min",
      },

      // Rilassante
      {
        title: "Fai un bagno caldo",
        description: "Preparati un bagno rilassante con sali o oli essenziali",
        category: "rilassante",
        icon: "🛁",
        time: "30-45 min",
      },
      {
        title: "Ascolta musica classica",
        description: "Mettiti comodo e ascolta 30 minuti di musica classica",
        category: "rilassante",
        icon: "🎼",
        time: "30 min",
      },
      {
        title: "Annusa 5 profumi diversi",
        description:
          "Trova 5 profumi o odori piacevoli e concentrati su ognuno",
        category: "rilassante",
        icon: "🌸",
        time: "10-15 min",
      },
      {
        title: "Guarda le nuvole",
        description:
          "Sdraiati all'aperto e osserva le forme delle nuvole per 15 minuti",
        category: "rilassante",
        icon: "☁️",
        time: "15-20 min",
      },
      {
        title: "Massaggia i piedi",
        description: "Dedica 10 minuti a massaggiare i tuoi piedi stanchi",
        category: "rilassante",
        icon: "🦶",
        time: "10 min",
      },

      // Produttivo
      {
        title: "Organizza una cartella del computer",
        description: "Riordina e organizza una cartella disordinata del tuo PC",
        category: "produttivo",
        icon: "💻",
        time: "20-30 min",
      },
      {
        title: "Pulisci il cassetto della scrivania",
        description: "Svuota e riorganizza completamente un cassetto",
        category: "produttivo",
        icon: "🗂️",
        time: "15-25 min",
      },
      {
        title: "Pianifica la settimana",
        description:
          "Scrivi gli obiettivi e le attività per i prossimi 7 giorni",
        category: "produttivo",
        icon: "📅",
        time: "20-30 min",
      },
      {
        title: "Aggiorna il CV",
        description: "Rivedi e aggiorna il tuo curriculum vitae",
        category: "produttivo",
        icon: "📄",
        time: "30-60 min",
      },
      {
        title: "Cancella 50 email",
        description:
          "Elimina almeno 50 email vecchie dalla tua casella di posta",
        category: "produttivo",
        icon: "📧",
        time: "15-20 min",
      },

      // Avventura
      {
        title: "Esplora un nuovo quartiere",
        description: "Vai in una zona della tua città che non hai mai visitato",
        category: "avventura",
        icon: "🗺️",
        time: "60-120 min",
      },
      {
        title: "Prova un cibo che non hai mai mangiato",
        description: "Ordina o cucina qualcosa di completamente nuovo per te",
        category: "avventura",
        icon: "🍽️",
        time: "30-60 min",
      },
      {
        title: "Parla con uno sconosciuto",
        description:
          "Inizia una conversazione amichevole con qualcuno che non conosci",
        category: "avventura",
        icon: "🤝",
        time: "10-20 min",
      },
      {
        title: "Cambia strada per tornare a casa",
        description: "Prendi un percorso completamente diverso dal solito",
        category: "avventura",
        icon: "🛤️",
        time: "Vario",
      },
      {
        title: "Visita un museo online",
        description:
          "Esplora virtualmente un museo famoso che non hai mai visitato",
        category: "avventura",
        icon: "🏛️",
        time: "30-45 min",
      },
    ];

    this.stats = {
      totalGenerated: 0,
      categoryCount: {},
    };

    this.loadStats();
    this.initializeElements();
    this.bindEvents();
    this.loadGeneratedActivities();
    this.updateStatsDisplay();
    // this.generateActivity() - commented out so no activity is generated automatically
  }

  initializeElements() {
    this.activityCard = document.getElementById("activityCard");
    this.activityIcon = document.getElementById("activityIcon");
    this.activityTitle = document.getElementById("activityTitle");
    this.activityDescription = document.getElementById("activityDescription");
    this.activityCategory = document.getElementById("activityCategory");
    this.activityTime = document.getElementById("activityTime");
    this.generateBtn = document.getElementById("generateBtn");
    this.categoryFilter = document.getElementById("categoryFilter");
    this.totalGenerated = document.getElementById("totalGenerated");
    this.favoriteCategory = document.getElementById("favoriteCategory");

    this.activitiesList = document.getElementById("activitiesList");
    this.clearAllBtn = document.getElementById("clearAllBtn");

    this.modalOverlay = document.getElementById("modalOverlay");
    this.modalActivityPreview = document.getElementById("modalActivityPreview");
    this.modalCancelBtn = document.getElementById("modalCancelBtn");
    this.modalConfirmBtn = document.getElementById("modalConfirmBtn");

    this.clearAllModalOverlay = document.getElementById("clearAllModalOverlay");
    this.clearAllCancelBtn = document.getElementById("clearAllCancelBtn");
    this.clearAllConfirmBtn = document.getElementById("clearAllConfirmBtn");
  }

  bindEvents() {
    this.generateBtn.addEventListener("click", () => this.generateActivity());
    this.categoryFilter.addEventListener("change", () =>
      this.generateActivity(),
    );

    this.clearAllBtn.addEventListener("click", () => this.showClearAllModal());

    this.activitiesList.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const activityId = e.target.getAttribute("data-activity-id");
        this.showDeleteModal(activityId);
      }
    });

    this.modalCancelBtn.addEventListener("click", () => this.hideDeleteModal());
    this.modalConfirmBtn.addEventListener("click", () => this.confirmDelete());
    this.modalOverlay.addEventListener("click", (e) => {
      if (e.target === this.modalOverlay) this.hideDeleteModal();
    });

    this.clearAllCancelBtn.addEventListener("click", () =>
      this.hideClearAllModal(),
    );
    this.clearAllConfirmBtn.addEventListener("click", () =>
      this.confirmClearAll(),
    );
    this.clearAllModalOverlay.addEventListener("click", (e) => {
      if (e.target === this.clearAllModalOverlay) this.hideClearAllModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideDeleteModal();
        this.hideClearAllModal();
      } else if (e.key === "Enter") {
        this.generateActivity();
      }
    });
  }

  generateActivity() {
    this.generateBtn.classList.add("loading");
    this.activityCard.classList.add("pulse");

    setTimeout(() => {
      const selectedCategory = this.categoryFilter.value;
      let availableActivities = this.activities;

      if (selectedCategory !== "all") {
        availableActivities = this.activities.filter(
          (activity) => activity.category === selectedCategory,
        );
      }

      const randomActivity =
        availableActivities[
          Math.floor(Math.random() * availableActivities.length)
        ];

      this.displayActivity(randomActivity);
      this.addToGeneratedList(randomActivity);
      this.updateStats(randomActivity.category);
      this.saveStats();

      this.generateBtn.classList.remove("loading");

      setTimeout(() => {
        this.activityCard.classList.remove("pulse");
      }, 600);
    }, 800);
  }

  displayActivity(activity) {
    this.activityIcon.textContent = activity.icon;
    this.activityTitle.textContent = activity.title;
    this.activityDescription.textContent = activity.description;
    this.activityCategory.textContent = this.getCategoryLabel(
      activity.category,
    );
    this.activityTime.textContent = `⏱️ ${activity.time}`;
  }

  getCategoryLabel(category) {
    const labels = {
      creativo: "🎨 Creativo",
      fisico: "💪 Fisico",
      mentale: "🧠 Mentale",
      sociale: "👥 Sociale",
      rilassante: "😌 Rilassante",
      produttivo: "⚡ Produttivo",
      avventura: "🌟 Avventura",
    };
    return labels[category] || category;
  }

  updateStats(category) {
    this.stats.totalGenerated++;
    this.stats.categoryCount[category] =
      (this.stats.categoryCount[category] || 0) + 1;
    this.updateStatsDisplay();
  }

  updateStatsDisplay() {
    this.totalGenerated.textContent = this.generatedActivities.length;

    if (this.generatedActivities.length > 0) {
      const categoryCount = {};
      this.generatedActivities.forEach((activity) => {
        categoryCount[activity.category] =
          (categoryCount[activity.category] || 0) + 1;
      });

      const favoriteCategory = Object.keys(categoryCount).reduce((a, b) =>
        categoryCount[a] > categoryCount[b] ? a : b,
      );
      this.favoriteCategory.textContent =
        this.getCategoryLabel(favoriteCategory);
    } else {
      this.favoriteCategory.textContent = "-";
    }
  }

  showDeleteModal(activityId) {
    this.pendingDeleteId = activityId;
    const activity = this.generatedActivities.find((a) => a.id == activityId);

    if (activity) {
      this.modalActivityPreview.innerHTML = `
        <div class="preview-title">${activity.icon} ${activity.title}</div>
        <div class="preview-description">${activity.description}</div>
      `;
    }

    this.modalOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  hideDeleteModal() {
    this.modalOverlay.classList.remove("show");
    this.pendingDeleteId = null;
    document.body.style.overflow = "auto";
  }

  confirmDelete() {
    if (this.pendingDeleteId) {
      this.deleteActivity(this.pendingDeleteId);
    }
    this.hideDeleteModal();
  }

  showClearAllModal() {
    this.clearAllModalOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  hideClearAllModal() {
    this.clearAllModalOverlay.classList.remove("show");
    document.body.style.overflow = "auto";
  }

  confirmClearAll() {
    this.generatedActivities = [];
    this.renderGeneratedActivities();
    this.saveGeneratedActivities();
    this.updateStatsDisplay();
    this.hideClearAllModal();
  }

  deleteActivity(activityId) {
    this.generatedActivities = this.generatedActivities.filter(
      (activity) => activity.id != activityId,
    );
    this.renderGeneratedActivities();
    this.saveGeneratedActivities();
    this.updateStatsDisplay();
  }

  clearAllActivities() {
    this.showClearAllModal();
  }

  addToGeneratedList(activity) {
    const activityWithId = {
      ...activity,
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
    };

    this.generatedActivities.unshift(activityWithId);
    this.renderGeneratedActivities();
    this.saveGeneratedActivities();
  }

  renderGeneratedActivities() {
    if (this.generatedActivities.length === 0) {
      this.activitiesList.innerHTML =
        '<p class="no-activities">Nessuna attività generata ancora</p>';
      this.clearAllBtn.style.display = "none";
      return;
    }

    this.clearAllBtn.style.display = "block";

    this.activitiesList.innerHTML = this.generatedActivities
      .map(
        (activity) => `
      <div class="activity-item">
        <div class="activity-content">
          <div class="activity-item-title">
            ${activity.icon} ${activity.title}
          </div>
          <div class="activity-item-description">
            ${activity.description}
          </div>
          <div class="activity-item-meta">
            <span class="activity-item-category">${this.getCategoryLabel(activity.category)}</span>
            <span class="activity-item-time">⏱️ ${activity.time}</span>
            <span class="activity-item-time">🕐 ${activity.timestamp}</span>
          </div>
        </div>
        <button class="delete-btn" data-activity-id="${activity.id}">
          ✕
        </button>
      </div>
    `,
      )
      .join("");
  }

  saveGeneratedActivities() {
    localStorage.setItem(
      "generatedActivities",
      JSON.stringify(this.generatedActivities),
    );
  }

  loadGeneratedActivities() {
    const saved = localStorage.getItem("generatedActivities");
    if (saved) {
      this.generatedActivities = JSON.parse(saved);
      this.renderGeneratedActivities();
    }
  }

  saveStats() {
    localStorage.setItem("activityGeneratorStats", JSON.stringify(this.stats));
  }

  loadStats() {
    const savedStats = localStorage.getItem("activityGeneratorStats");
    if (savedStats) {
      this.stats = JSON.parse(savedStats);
    }
  }
}

let activityGenerator;

// Inizializza l'app quando la pagina è caricata
document.addEventListener("DOMContentLoaded", () => {
  activityGenerator = new ActivityGenerator();
});

// Aggiungi alcuni effetti visivi extra
document.addEventListener("DOMContentLoaded", () => {
  // Effetto particelle di sfondo
  const createParticle = () => {
    const particle = document.createElement("div");
    particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: rgba(255,255,255,0.3);
            border-radius: 50%;
            pointer-events: none;
            z-index: -1;
            left: ${Math.random() * 100}vw;
            top: 100vh;
            animation: float ${3 + Math.random() * 4}s linear forwards;
        `;

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 7000);
  };

  // Crea particelle ogni tanto
  setInterval(createParticle, 2000);

  // Aggiungi CSS per l'animazione delle particelle
  const style = document.createElement("style");
  style.textContent = `
        @keyframes float {
            to {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
  document.head.appendChild(style);
});
