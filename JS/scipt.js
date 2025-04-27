document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const preloader = document.querySelector(".preloader");
  const categoriesGrid = document.getElementById("categoriesGrid");
  const categoryNavContainer = document.getElementById("categoryNavContainer");
  const projectsSection = document.getElementById("projectsSection");
  const projectsGrid = document.getElementById("projectsGrid");
  const categoryTitle = document.getElementById("categoryTitle");
  const backButton = document.getElementById("backButton");
  const searchInput = document.getElementById("searchInput");
  const projectSearchInput = document.getElementById("projectSearchInput");
  const noProjectsFound = document.getElementById("noProjectsFound");
  const noCategoriesFound = document.getElementById("noCategoriesFound");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileClose = document.querySelector(".mobile-close");
  const navLinks = document.querySelectorAll(".nav-link");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
  const themeToggle = document.querySelector(".theme-toggle");
  const themeToggleMobile = document.querySelector(".theme-toggle-mobile");
  const backToTopButton = document.getElementById("backToTop");
  const categoriesCount = document.getElementById("categoriesCount");
  const projectsCount = document.getElementById("projectsCount");
  const currentYearElement = document.getElementById("currentYear");
  const headerLogo = document.querySelector(".header .logo"); // Seleziona il logo nell'header

  // Variabile per memorizzare i dati delle categorie
  let categoriesData = null;
  // Flag per tracciare se il preloader è attivo
  let isPreloaderActive = false;

  // Set current year in footer
  currentYearElement.textContent = new Date().getFullYear();

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

  // Advanced preloader with loading bar
  function simulateLoading() {
    // Simulate loading time (3 seconds total)
    setTimeout(() => {
      const currentPreloader = document.querySelector(".preloader");
      if (currentPreloader) {
        currentPreloader.classList.add("hidden");
      }
      document.body.style.overflow = "auto"; // Enable scrolling after preloader is hidden
      isPreloaderActive = false;
    }, 3000);
  }

  // Function to show preloader
  function showPreloader() {
    // Se il preloader è già attivo, non fare nulla
    if (isPreloaderActive) return;

    // Imposta il flag a true
    isPreloaderActive = true;

    // Nascondi la sezione progetti se è visibile
    if (projectsSection && projectsSection.style.display === "block") {
      projectsSection.style.display = "none";
    }

    try {
      // Verifica se esiste già un preloader
      let currentPreloader = document.querySelector(".preloader");

      // Se non esiste, creane uno nuovo
      if (!currentPreloader) {
        currentPreloader = document.createElement("div");
        currentPreloader.className = "preloader";
        currentPreloader.innerHTML = `
          <div class="preloader-content">
            <div class="avatar-container">
              <img src="Icons/Avatar.jpg" alt="Nico Maker Avatar" class="preloader-avatar">
            </div>
            <div class="logo-container">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_chiaro.jpg-d1WCG74xFBZkcoQrlmO4SobXjTaScn.png"
                alt="Nico Maker Logo" class="preloader-logo">
            </div>
            <div class="text-container">
              <h2 class="preloader-text">Pagina Generale Siti</h2>
            </div>
            <div class="loading-bar-container">
              <div class="loading-bar"></div>
            </div>
          </div>
        `;
        document.body.prepend(currentPreloader);
      } else {
        // Reset preloader state
        currentPreloader.classList.remove("hidden");
      }

      document.body.style.overflow = "hidden"; // Disable scrolling during preloader

      // Simulate loading again
      setTimeout(() => {
        const updatedPreloader = document.querySelector(".preloader");
        if (updatedPreloader) {
          updatedPreloader.classList.add("hidden");
        }
        document.body.style.overflow = "auto";
        isPreloaderActive = false;

        // Torna alla home page
        window.scrollTo({
          top: 0,
          behavior: "auto",
        });

        // Importante: ricaricare i dati dopo che il preloader scompare
        if (categoriesData) {
          renderCategories(categoriesData);
          renderCategoryNavigation(categoriesData);
          updateCounters(categoriesData);
        }

        // Aggiorna lo stato attivo dei link di navigazione
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === "#home") {
            link.classList.add("active");
          }
        });

        mobileNavLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === "#home") {
            link.classList.add("active");
          }
        });
      }, 3000);
    } catch (error) {
      console.error("Errore nel preloader:", error);
      // Assicurati che lo scrolling sia sempre abilitato in caso di errore
      document.body.style.overflow = "auto";
      isPreloaderActive = false;
    }
  }

  // Add click event to header logo
  headerLogo.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    showPreloader(); // Show the preloader
  });

  // Hide preloader after page load
  window.addEventListener("load", () => {
    document.body.style.overflow = "hidden"; // Disable scrolling during preloader
    simulateLoading();
  });

  // Custom cursor
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorOutline = document.querySelector(".cursor-dot-outline");

  if (window.innerWidth > 768) {
    window.addEventListener("mousemove", (e) => {
      const posX = e.clientX;
      const posY = e.clientY;

      cursorDot.style.left = `${posX}px`;
      cursorDot.style.top = `${posY}px`;
      cursorOutline.style.left = `${posX}px`;
      cursorOutline.style.top = `${posY}px`;

      cursorDot.style.opacity = "1";
      cursorOutline.style.opacity = "1";
    });

    document.addEventListener("mouseout", () => {
      cursorDot.style.opacity = "0";
      cursorOutline.style.opacity = "0";
    });

    document.addEventListener("mousedown", () => {
      cursorDot.style.transform = "translate(-50%, -50%) scale(0.7)";
      cursorOutline.style.transform = "translate(-50%, -50%) scale(0.7)";
    });

    document.addEventListener("mouseup", () => {
      cursorDot.style.transform = "translate(-50%, -50%) scale(1)";
      cursorOutline.style.transform = "translate(-50%, -50%) scale(1)";
    });
  }

  // Header scroll behavior - keeping it fixed now
  let lastScrollTop = 0;
  const header = document.querySelector(".header");

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Show/hide back to top button
    if (scrollTop > 500) {
      backToTopButton.classList.add("visible");
    } else {
      backToTopButton.classList.remove("visible");
    }

    lastScrollTop = scrollTop;
  });

  // Back to top button
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Mobile menu toggle
  menuToggle.addEventListener("click", function () {
    this.classList.toggle("active");
    mobileMenu.classList.toggle("active");
    document.body.classList.toggle("no-scroll");
  });

  // Mobile menu close button
  mobileClose.addEventListener("click", () => {
    menuToggle.classList.remove("active");
    mobileMenu.classList.remove("active");
    document.body.classList.remove("no-scroll");
  });

  // Close mobile menu when clicking a link
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.classList.remove("active");
      mobileMenu.classList.remove("active");
      document.body.classList.remove("no-scroll");
    });
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll("section[id]");

  function highlightNavOnScroll() {
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });

        mobileNavLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", highlightNavOnScroll);

  // Theme toggle (both desktop and mobile)
  function toggleTheme() {
    document.body.classList.toggle("dark-theme");

    if (document.body.classList.contains("dark-theme")) {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      themeToggleMobile.innerHTML =
        '<i class="fas fa-sun"></i><span>Tema Chiaro</span>';
      localStorage.setItem("theme", "dark");
    } else {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      themeToggleMobile.innerHTML =
        '<i class="fas fa-moon"></i><span>Tema Scuro</span>';
      localStorage.setItem("theme", "light");
    }
  }

  themeToggle.addEventListener("click", toggleTheme);
  themeToggleMobile.addEventListener("click", toggleTheme);

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    themeToggleMobile.innerHTML =
      '<i class="fas fa-sun"></i><span>Tema Chiaro</span>';
  } else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggleMobile.innerHTML =
      '<i class="fas fa-moon"></i><span>Tema Scuro</span>';
  }

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

    // Salva i dati delle categorie nella variabile globale
    categoriesData = data.categories;

    renderCategories(categoriesData);
    renderCategoryNavigation(categoriesData);
    updateCounters(categoriesData);
    setupEventListeners(data);
  }

  // Update counters
  function updateCounters(categories) {
    const categoryCount = Object.keys(categories).length;
    let totalProjects = 0;

    Object.values(categories).forEach((category) => {
      totalProjects += category.length;
    });

    // Reset counter values to 0 before animating
    categoriesCount.textContent = "0";
    projectsCount.textContent = "0";

    // Animate counters
    animateCounter(categoriesCount, 0, categoryCount, 1500);
    animateCounter(projectsCount, 0, totalProjects, 2000);
  }

  // Animate counter
  function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      element.textContent = value;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = end;
      }
    };
    window.requestAnimationFrame(step);
  }

  // Render category navigation - New function
  function renderCategoryNavigation(categories) {
    categoryNavContainer.innerHTML = "";

    // Sort categories alphabetically
    Object.keys(categories)
      .sort((a, b) => a.replace(/_/g, " ").localeCompare(b.replace(/_/g, " ")))
      .forEach((categoryName) => {
        const displayName = categoryName.replace(/_/g, " ");

        const categoryNavItem = document.createElement("div");
        categoryNavItem.className = "category-nav-item";
        categoryNavItem.dataset.category = categoryName;
        categoryNavItem.textContent = displayName;

        categoryNavItem.addEventListener("click", function () {
          const projects = categories[categoryName];
          if (projects) {
            renderProjects(categoryName, projects);
            // Reset project search input
            projectSearchInput.value = "";

            // Add active class to clicked nav item
            document.querySelectorAll(".category-nav-item").forEach((item) => {
              item.classList.remove("active");
            });
            this.classList.add("active");
          }
        });

        categoryNavContainer.appendChild(categoryNavItem);
      });
  }

  // Render category cards (sorted alphabetically)
  function renderCategories(categories) {
    categoriesGrid.innerHTML = "";

    // Sort categories alphabetically
    Object.keys(categories)
      .sort((a, b) => a.replace(/_/g, " ").localeCompare(b.replace(/_/g, " ")))
      .forEach((categoryName, index) => {
        const displayName = categoryName.replace(/_/g, " ");
        const iconClass = categoryIcons[categoryName] || "fa-folder";

        const categoryCard = document.createElement("div");
        categoryCard.className = "category-card";
        categoryCard.dataset.category = categoryName;
        categoryCard.style.animationDelay = `${index * 0.1}s`;

        categoryCard.innerHTML = `
          <div class="category-card-content">
            <i class="fas ${iconClass} category-icon"></i>
            <h3>${displayName}</h3>
            <p>${categories[categoryName].length} ${
          categories[categoryName].length === 1 ? "Progetto" : "Progetti"
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

    // Hide "no projects found" message initially
    noProjectsFound.style.display = "none";

    // Sort projects alphabetically by name
    projects
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((project, index) => {
        const projectCard = document.createElement("div");
        projectCard.className = "project-card";
        projectCard.dataset.name = project.name.toLowerCase();
        projectCard.style.animationDelay = `${index * 0.1}s`;

        projectCard.innerHTML = `
          <div class="project-card-content">
            <h3>${project.name}</h3>
            <div class="project-card-footer">
              <a href="${project.link}" target="_blank" class="project-link">
                <i class="fas fa-external-link-alt mr-2"></i> Visita Progetto
              </a>
            </div>
          </div>
        `;

        projectsGrid.appendChild(projectCard);
      });

    // Show projects section
    projectsSection.style.display = "block";
    // Scroll to projects section with a small delay to ensure smooth transition
    setTimeout(() => {
      projectsSection.scrollIntoView({ behavior: "smooth" });
    }, 100);
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

    // Also filter category navigation items
    const categoryNavItems = document.querySelectorAll(".category-nav-item");
    categoryNavItems.forEach((item) => {
      const categoryName = item.dataset.category
        .toLowerCase()
        .replace(/_/g, " ");

      if (categoryName.includes(searchTerm.toLowerCase())) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });

    // Show/hide "no categories found" message
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

    // Show/hide "no projects found" message
    noProjectsFound.style.display = visibleCount === 0 ? "block" : "none";
  }

  // Setup event listeners
  function setupEventListeners(data) {
    // Category click event
    categoriesGrid.addEventListener("click", (e) => {
      const categoryCard = e.target.closest(".category-card");
      if (!categoryCard) return;

      const categoryName = categoryCard.dataset.category;
      const projects = data.categories[categoryName];

      if (projects) {
        renderProjects(categoryName, projects);
        // Reset project search input
        projectSearchInput.value = "";

        // Update active state in category navigation
        document.querySelectorAll(".category-nav-item").forEach((item) => {
          item.classList.remove("active");
          if (item.dataset.category === categoryName) {
            item.classList.add("active");
          }
        });
      }
    });

    // Back button click event
    backButton.addEventListener("click", () => {
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

    // Scroll down arrow click event
    const scrollDownArrow = document.querySelector(".scroll-down-arrow a");
    if (scrollDownArrow) {
      scrollDownArrow.addEventListener("click", (e) => {
        e.preventDefault();
        const categoriesSection = document.getElementById("categories");
        categoriesSection.scrollIntoView({ behavior: "smooth" });
      });
    }

    // Horizontal scroll for category navigation with mouse wheel
    if (categoryNavContainer) {
      categoryNavContainer.addEventListener("wheel", function (e) {
        if (e.deltaY !== 0) {
          e.preventDefault();
          this.scrollLeft += e.deltaY;
        }
      });
    }
  }

  // Contact functions
  window.contactEmail = (email, subject) => {
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(
      `Info sul sito ${subject}`
    )}`;
    window.location.href = mailtoLink;
  };

  window.contactCell = () => (window.location.href = "tel:+393337024320");

  window.openWhatsAppChat = () => {
    const phoneNumber = "+393337024320";
    const message = encodeURIComponent("*Info sul Portfolio*");
    window.location.href = `https://wa.me/${phoneNumber}?text=${message}`;
  };

  // Initialize the app
  init();
});
