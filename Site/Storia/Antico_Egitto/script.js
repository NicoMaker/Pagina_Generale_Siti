document.addEventListener("DOMContentLoaded", function () {
  // Variabili globali
  const header = document.querySelector("header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const revealElements = document.querySelectorAll(".reveal-on-scroll");
  const slides = document.querySelectorAll(".slide");
  const sliderDots = document.querySelector(".slider-dots");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");

  let currentSlide = 0;
  let slideInterval;

  // Funzione per gestire lo scroll dell'header
  function handleScroll() {
    if (window.scrollY > 100) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Rivela elementi quando sono visibili
    revealElements.forEach((el) => {
      if (isElementInViewport(el)) {
        el.classList.add("revealed");
      }
    });

    // Evidenzia la sezione attiva
    highlightActiveSection();
  }

  // Funzione per evidenziare la sezione attiva durante lo scroll
  function highlightActiveSection() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-links a");

    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;

      // Se la sezione è visibile (almeno per metà) nella viewport
      if (
        sectionTop < window.innerHeight / 2 &&
        sectionTop > -sectionHeight / 2
      ) {
        // Rimuovi la classe active da tutte le sezioni
        sections.forEach((s) => s.classList.remove("active-section"));

        // Aggiungi la classe active alla sezione corrente
        section.classList.add("active-section");

        // Aggiorna anche il link di navigazione attivo
        navLinks.forEach((link) => {
          link.classList.remove("active-link");
          if (link.getAttribute("href") === "#" + section.id) {
            link.classList.add("active-link");
          }
        });
      }
    });
  }

  // Funzione per verificare se un elemento è nel viewport
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top <=
        (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
      rect.bottom >= 0
    );
  }

  // Funzione per il menu mobile
  function toggleMenu() {
    navLinks.classList.toggle("active");
    menuToggle.classList.toggle("active");

    // Anima le barre del menu
    const bars = menuToggle.querySelectorAll(".bar");
    if (navLinks.classList.contains("active")) {
      bars[0].style.transform = "rotate(-45deg) translate(-5px, 6px)";
      bars[1].style.opacity = "0";
      bars[2].style.transform = "rotate(45deg) translate(-5px, -6px)";
    } else {
      bars[0].style.transform = "none";
      bars[1].style.opacity = "1";
      bars[2].style.transform = "none";
    }
  }

  // Funzione per chiudere il menu quando si clicca su un link
  function closeMenuOnClick() {
    if (navLinks.classList.contains("active")) {
      toggleMenu();
    }
  }

  // Funzioni per lo slider
  function initSlider() {
    // Crea i dots per lo slider
    slides.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.classList.add("dot");
      if (index === 0) dot.classList.add("active");
      dot.addEventListener("click", () => goToSlide(index));
      sliderDots.appendChild(dot);
    });

    // Imposta la prima slide come attiva
    slides[0].classList.add("active");

    // Avvia lo slider automatico
    startSlideInterval();
  }

  function startSlideInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
      nextSlide();
    }, 5000);
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
  }

  function prevSlide() {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }

  function goToSlide(index) {
    slides[currentSlide].classList.remove("active");
    document.querySelectorAll(".dot")[currentSlide].classList.remove("active");

    currentSlide = index;

    slides[currentSlide].classList.add("active");
    document.querySelectorAll(".dot")[currentSlide].classList.add("active");

    // Resetta l'intervallo
    startSlideInterval();
  }

  // Funzione per il filtro della galleria
  function filterGallery(category) {
    galleryItems.forEach((item) => {
      if (category === "all" || item.dataset.category === category) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  }

  // Event Listeners
  window.addEventListener("scroll", handleScroll);
  menuToggle.addEventListener("click", toggleMenu);
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", closeMenuOnClick);
  });

  prevBtn.addEventListener("click", prevSlide);
  nextBtn.addEventListener("click", nextSlide);

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filterGallery(btn.dataset.filter);
    });
  });

  // Chiama la funzione anche all'avvio per evidenziare la sezione iniziale
  highlightActiveSection();

  // Inizializzazione
  handleScroll(); // Controlla gli elementi visibili all'avvio
  initSlider();

  // Effetto particelle di sabbia
  function createSandParticles() {
    const sandParticles = document.querySelector(".sand-particles");
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.classList.add("sand-particle");

      // Posizione casuale
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;

      // Dimensione casuale
      const size = Math.random() * 3 + 1;

      // Velocità casuale
      const speed = Math.random() * 10 + 5;

      // Ritardo casuale
      const delay = Math.random() * 5;

      particle.style.cssText = `
                position: absolute;
                top: ${posY}%;
                left: ${posX}%;
                width: ${size}px;
                height: ${size}px;
                background-color: rgba(212, 175, 55, 0.3);
                border-radius: 50%;
                animation: floatParticle ${speed}s linear infinite ${delay}s;
            `;

      sandParticles.appendChild(particle);
    }
  }

  // Smooth scroll per i link di ancoraggio
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const headerHeight = document.querySelector("header").offsetHeight;
        const targetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Inizializza le particelle di sabbia
  createSandParticles();
});

// Aggiungi stile CSS per l'animazione delle particelle
const styleSheet = document.createElement("style");
styleSheet.textContent = `
@keyframes floatParticle {
    0% {
        transform: translateY(0) translateX(0);
        opacity: 0;
    }
    10% {
        opacity: 0.5;
    }
    90% {
        opacity: 0.5;
    }
    100% {
        transform: translateY(-100vh) translateX(20px);
        opacity: 0;
    }
}
`;
document.head.appendChild(styleSheet);
