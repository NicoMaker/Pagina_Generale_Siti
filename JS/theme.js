// Add this code at the end of your main script file or in a separate script file
document.addEventListener("DOMContentLoaded", function () {
  // Force light theme
  document.body.classList.remove("dark-theme");

  // Update theme toggle buttons
  const themeToggle = document.querySelector(".theme-toggle");
  const themeToggleMobile = document.querySelector(".theme-toggle-mobile");

  if (themeToggle) {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }

  if (themeToggleMobile) {
    themeToggleMobile.innerHTML =
      '<i class="fas fa-moon"></i><span>Tema Scuro</span>';
  }

  // Set localStorage
  localStorage.setItem("theme", "light");

  // Override the toggleTheme function
  window.toggleTheme = function () {
    // If somehow in dark theme, switch back to light
    if (document.body.classList.contains("dark-theme")) {
      document.body.classList.remove("dark-theme");

      if (themeToggle) {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      }

      if (themeToggleMobile) {
        themeToggleMobile.innerHTML =
          '<i class="fas fa-moon"></i><span>Tema Scuro</span>';
      }

      localStorage.setItem("theme", "light");
    }
  };

  // Replace existing event listeners
  if (themeToggle) {
    const newToggle = themeToggle.cloneNode(true);
    themeToggle.parentNode.replaceChild(newToggle, themeToggle);
    newToggle.addEventListener("click", window.toggleTheme);
  }

  if (themeToggleMobile) {
    const newMobileToggle = themeToggleMobile.cloneNode(true);
    themeToggleMobile.parentNode.replaceChild(
      newMobileToggle,
      themeToggleMobile
    );
    newMobileToggle.addEventListener("click", window.toggleTheme);
  }
});
