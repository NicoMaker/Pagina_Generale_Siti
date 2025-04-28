// Miglioramenti per l'esperienza mobile
document.addEventListener("DOMContentLoaded", () => {
  // Riferimenti agli elementi DOM
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  // Migliora la visibilità del menu toggle su dispositivi mobili
  function adjustMenuToggleOnResize() {
    if (window.innerWidth < 768) {
      menuToggle.style.transform = "scale(1.1)";
    } else {
      menuToggle.style.transform = "";
    }
  }

  // Esegui subito e anche al ridimensionamento
  adjustMenuToggleOnResize();
  window.addEventListener("resize", adjustMenuToggleOnResize);

  // Migliora l'animazione del menu mobile
  menuToggle.addEventListener("click", function () {
    this.classList.toggle("active");

    if (!mobileMenu.classList.contains("active")) {
      // Apertura menu
      mobileMenu.style.display = "flex";
      setTimeout(() => {
        mobileMenu.classList.add("active");
      }, 10);
      document.body.classList.add("no-scroll");
    } else {
      // Chiusura menu
      mobileMenu.classList.remove("active");
      setTimeout(() => {
        if (!mobileMenu.classList.contains("active")) {
          mobileMenu.style.display = "";
        }
      }, 500); // Tempo uguale alla durata della transizione CSS
      document.body.classList.remove("no-scroll");
    }
  });

  // Aggiungi effetto di evidenziazione quando si clicca su un link mobile
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", function () {
      // Rimuovi la classe active da tutti i link
      mobileNavLinks.forEach((l) => l.classList.remove("active"));

      // Aggiungi la classe active al link cliccato
      this.classList.add("active");

      // Chiudi il menu mobile
      menuToggle.classList.remove("active");
      mobileMenu.classList.remove("active");
      document.body.classList.remove("no-scroll");
    });
  });

  // Migliora l'esperienza di scrolling su mobile
  let touchStartY = 0;
  let touchEndY = 0;

  document.addEventListener(
    "touchstart",
    function (e) {
      touchStartY = e.changedTouches[0].screenY;
    },
    false
  );

  document.addEventListener(
    "touchend",
    function (e) {
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    },
    false
  );

  function handleSwipe() {
    const heroSection = document.querySelector(".hero");
    const categoriesSection = document.getElementById("categories");

    // Se siamo nella hero section e lo swipe è verso l'alto
    if (isElementInViewport(heroSection) && touchEndY < touchStartY) {
      // Swipe up nella hero section, scorri alle categorie
      categoriesSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
});

// Funzione per aggiungere colori casuali alle icone fluttuanti
function addRandomColorsToFloatingIcons() {
  const floatingIcons = document.querySelectorAll(".floating-icon");
  const colors = [
    "#6a3de8",
    "#9d4edd",
    "#ff5e78",
    "#3a86ff",
    "#8338ec",
    "#ff006e",
  ];

  floatingIcons.forEach((icon) => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    icon.style.color = randomColor;

    // Aggiungi un'ombra luminosa
    icon.style.textShadow = `0 0 10px ${randomColor}80`;
  });
}

// Esegui la funzione quando il documento è pronto
document.addEventListener("DOMContentLoaded", addRandomColorsToFloatingIcons);
