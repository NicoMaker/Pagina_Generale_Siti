document.addEventListener("DOMContentLoaded", () => {
  // === Variabili globali ===
  window.isPreloaderActive = false; // Evita duplicazioni tra script
  const projectsSection = document.querySelector("#projects");
  let categoriesData;
  let updateCounters;
  const navLinks = document.querySelectorAll(".nav-link");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  // === Logo e logo mobile ===
  const headerLogo = document.querySelector(".header .logo");
  const logoText = document.querySelector(".header .logo span");
  const mobileLogoContainer = document.querySelector(".mobile-logo-container");
  const mobileLogoText = document.querySelector(".mobile-logo-container h2");

  // === Eventi click su logo ===
  if (headerLogo) {
    headerLogo.addEventListener("click", (e) => {
      e.preventDefault();
      showPreloader();
    });
  }

  if (logoText) {
    logoText.addEventListener("click", (e) => {
      e.preventDefault();
      showPreloader();
    });
  }

  if (mobileLogoContainer) {
    mobileLogoContainer.addEventListener("click", (e) => {
      e.preventDefault();
      showPreloader();
      closeMobileMenu();
    });
  }

  if (mobileLogoText) {
    mobileLogoText.addEventListener("click", (e) => {
      e.preventDefault();
      showPreloader();
      closeMobileMenu();
    });
  }

  function closeMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const mobileMenu = document.querySelector(".mobile-menu");
    if (menuToggle && mobileMenu) {
      menuToggle.classList.remove("active");
      mobileMenu.classList.remove("active");
      document.body.classList.remove("no-scroll");
    }
  }

  // === Funzione preloader ===
  function showPreloader() {
    if (window.isPreloaderActive) return;
    window.isPreloaderActive = true;

    if (projectsSection && projectsSection.style.display === "block") {
      projectsSection.style.display = "none";
    }

    try {
      let currentPreloader = document.querySelector(".preloader");

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
        currentPreloader.classList.remove("hidden");

        const loadingBar = currentPreloader.querySelector(".loading-bar");
        if (loadingBar) {
          loadingBar.style.animation = "none";
          void loadingBar.offsetWidth;
          loadingBar.style.animation = "loadingProgress 2s ease forwards";
        }
      }

      document.body.style.overflow = "hidden";

      setTimeout(() => {
        const updatedPreloader = document.querySelector(".preloader");
        if (updatedPreloader) {
          updatedPreloader.classList.add("hidden");
        }
        document.body.style.overflow = "auto";
        window.isPreloaderActive = false;

        window.scrollTo({ top: 0, behavior: "auto" });

        if (categoriesData) {
          renderCategories(categoriesData);
          renderCategoryNavigation(categoriesData);
          if (updateCounters) {
            updateCounters(categoriesData);
          }
        }

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
      document.body.style.overflow = "auto";
      window.isPreloaderActive = false;
    }
  }
});
