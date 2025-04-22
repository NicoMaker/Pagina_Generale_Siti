document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const categoriesGrid = document.getElementById("categoriesGrid");
  const projectsSection = document.getElementById("projectsSection");
  const projectsGrid = document.getElementById("projectsGrid");
  const categoryTitle = document.getElementById("categoryTitle");
  const backButton = document.getElementById("backButton");
  const searchInput = document.getElementById("searchInput");
  const projectSearchInput = document.getElementById("projectSearchInput");
  const noProjectsFound = document.getElementById("noProjectsFound");
  const noCategoriesFound = document.getElementById("noCategoriesFound"); // Nuovo elemento
  const menuToggle = document.querySelector(".menu-toggle");

  // Category icons mapping
  const categoryIcons = {
    Bici: "fa-bicycle",
    Borsa: "fa-chart-line",
    Calendario: "fa-calendar-alt",
    Calcio: "fa-futbol",
    Giochi: "fa-gamepad",
    Info_Paesi_Stati: "fa-globe",
    Matematica: "fa-calculator",
    Natale: "fa-gifts",
    Opzioni_Con_Le_Frasi: "fa-font",
    Pasqua: "fa-egg",
    Pokemon: "fa-dragon",
    Random: "fa-random",
    Salute: "fa-heartbeat",
    Temperatura: "fa-temperature-high",
  };

  // Load categories and projects data
  async function loadData() {
    try {
      const response = await fetch("JS/Categories.json");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error loading data:", error);
      return null;
    }
  }

  // Initialize the application
  async function init() {
    const data = await loadData();
    if (!data) return;

    renderCategories(data.categories);
    setupEventListeners(data);
  }

  // Render category cards (sorted alphabetically)
  function renderCategories(categories) {
    categoriesGrid.innerHTML = "";

    Object.keys(categories)
      .sort((a, b) => a.replace(/_/g, " ").localeCompare(b.replace(/_/g, " ")))
      .forEach((categoryName) => {
        const displayName = categoryName.replace(/_/g, " ");
        const iconClass = categoryIcons[categoryName] || "fa-folder";

        const categoryCard = document.createElement("div");
        categoryCard.className = "category-card fade-in";
        categoryCard.dataset.category = categoryName;

        categoryCard.innerHTML = `
          <div class="category-card-content">
            <i class="fas ${iconClass} category-icon"></i>
            <h3>${displayName}</h3>
            <p>${categories[categoryName].length} ${
          categories[categoryName].length === 1 ? "progetto" : "progetti"
        }</p>

          </div>
        `;

        categoriesGrid.appendChild(categoryCard);
      });
  }

  // Render projects for a specific category (sorted alphabetically)
  function renderProjects(categoryName, projects) {
    projectsGrid.innerHTML = "";
    categoryTitle.textContent = categoryName.replace(/_/g, " ");

    // Nascondi il messaggio "nessun progetto trovato" all'inizio
    noProjectsFound.style.display = "none";

    projects
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((project) => {
        const projectCard = document.createElement("div");
        projectCard.className = "project-card fade-in";
        projectCard.dataset.name = project.name.toLowerCase();

        projectCard.innerHTML = `
          <div class="project-card-content">
            <h3>${project.name}</h3>
            <div class="project-card-footer">
              <a href="${project.link}" target="_blank" class="project-link">
                Visita Progetto
              </a>
            </div>
          </div>
        `;

        projectsGrid.appendChild(projectCard);
      });

    // Show projects section
    projectsSection.style.display = "block";
    // Scroll to projects section
    projectsSection.scrollIntoView({ behavior: "smooth" });
  }

  // Filter categories based on search input
  function filterCategories(searchTerm) {
    const categoryCards = document.querySelectorAll(".category-card");
    let visibleCount = 0;

    categoryCards.forEach((card) => {
      const categoryName = card.dataset.category
        .toLowerCase()
        .replace(/_/g, " ");

      if (categoryName.includes(searchTerm.toLowerCase())) {
        card.style.display = "";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    // Mostra o nascondi il messaggio "nessuna categoria trovata"
    noCategoriesFound.style.display = visibleCount === 0 ? "block" : "none";
  }

  // Filter projects based on search input
  function filterProjects(searchTerm) {
    const projectCards = document.querySelectorAll(".project-card");
    let visibleCount = 0;

    projectCards.forEach((card) => {
      const projectName = card.dataset.name;

      if (projectName.includes(searchTerm.toLowerCase())) {
        card.style.display = "";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    // Mostra o nascondi il messaggio "nessun progetto trovato"
    noProjectsFound.style.display = visibleCount === 0 ? "block" : "none";
  }

  // Setup event listeners
  function setupEventListeners(data) {
    // Category click event
    categoriesGrid.addEventListener("click", function (e) {
      const categoryCard = e.target.closest(".category-card");
      if (!categoryCard) return;

      const categoryName = categoryCard.dataset.category;
      const projects = data.categories[categoryName];

      if (projects) {
        renderProjects(categoryName, projects);
        // Reset project search input
        projectSearchInput.value = "";
      }
    });

    // Back button click event
    backButton.addEventListener("click", function () {
      projectsSection.style.display = "none";
      window.scrollTo({
        top: document.querySelector(".categories").offsetTop - 80,
        behavior: "smooth",
      });
    });

    // Category search input event
    searchInput.addEventListener("input", function () {
      filterCategories(this.value);
    });

    // Project search input event
    projectSearchInput.addEventListener("input", function () {
      filterProjects(this.value);
    });

    // Menu toggle event
    menuToggle.addEventListener("click", function () {
      this.classList.toggle("active");
      // Add mobile menu functionality here if needed
    });
  }

  // Contact functions
  window.contactEmail = function (email, subject) {
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(
      `Info sul sito ${subject}`
    )}`;
    window.location.href = mailtoLink;
  };

  window.contactCell = function () {
    window.location.href = "tel:+393337024320";
  };

  window.openWhatsAppChat = function () {
    const phoneNumber = "+393337024320";
    const message = encodeURIComponent("*Info sul sito Pagina Generale Siti*");
    window.location.href = `https://wa.me/${phoneNumber}?text=${message}`;
  };

  // Initialize the app
  init();
});
