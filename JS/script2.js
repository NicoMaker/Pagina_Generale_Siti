// Find the headerLogo event listener in your code and modify it
// This should be around line 180-185 in your script.js file

// Add click event to header logo AND the text
document.addEventListener("DOMContentLoaded", () => {
  // Your existing code...

  // Modified header logo click event
  const headerLogo = document.querySelector(".header .logo"); // Selects the logo in the header
  const logoText = document.querySelector(".header .logo span"); // Select the text span specifically

  // Make both the logo and text trigger the preloader
  headerLogo.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    showPreloader(); // Show the preloader
  });

  // Optional: Add specific listener for just the text if needed
  if (logoText) {
    logoText.addEventListener("click", (e) => {
      e.preventDefault();
      showPreloader();
    });
  }

  // Your existing code continues...
});

// Declare variables
let isPreloaderActive = false;
const projectsSection = document.querySelector("#projects"); // Assuming projects section has id "projects"
let categoriesData; // Will be populated later
const navLinks = document.querySelectorAll(".nav-link"); // Assuming your nav links have class "nav-link"
const mobileNavLinks = document.querySelectorAll(".mobile-nav-link"); // Assuming your mobile nav links have class "mobile-nav-link"
let updateCounters; // Declare updateCounters

// Ensure the showPreloader function is working correctly
function showPreloader() {
  // If the preloader is already active, don't do anything
  if (isPreloaderActive) return;

  // Set the flag to true
  isPreloaderActive = true;

  // Hide the projects section if it's visible
  if (projectsSection && projectsSection.style.display === "block") {
    projectsSection.style.display = "none";
  }

  try {
    // Check if a preloader already exists
    let currentPreloader = document.querySelector(".preloader");

    // If it doesn't exist, create a new one
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
      // Reset preloader state and make it visible
      currentPreloader.classList.remove("hidden");

      // Important: Reset the loading bar animation
      const loadingBar = currentPreloader.querySelector(".loading-bar");
      if (loadingBar) {
        loadingBar.style.animation = "none";
        // Force reflow to restart animation
        void loadingBar.offsetWidth;
        loadingBar.style.animation = "loadingProgress 2s ease forwards";
      }
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

      // Scroll to the top of the page
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });

      // Important: reload the data after the preloader disappears
      if (categoriesData) {
        renderCategories(categoriesData);
        renderCategoryNavigation(categoriesData);
        if (updateCounters) {
          updateCounters(categoriesData);
        }
      }

      // Update the active state of navigation links
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
    // Make sure scrolling is always enabled in case of error
    document.body.style.overflow = "auto";
    isPreloaderActive = false;
  }
}
