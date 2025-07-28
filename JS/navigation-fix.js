// Funzione per impostare la sezione Home come attiva all'avvio
function setHomeActive() {
  // Se non c'è hash nell'URL, imposta #home come default
  if (!window.location.hash) {
    window.location.hash = "#home";
  }

  // Ottieni l'hash corrente
  const currentHash = window.location.hash;

  // Aggiorna i link di navigazione desktop
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === currentHash) {
      link.classList.add("active");
    }
  });

  // Aggiorna i link di navigazione mobile
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
  mobileNavLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === currentHash) {
      link.classList.add("active");
    }
  });

  // Scorri alla sezione corrispondente
  if (currentHash) {
    const targetSection = document.querySelector(currentHash);
    if (targetSection) {
      setTimeout(() => {
        targetSection.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }
}

// Aggiungi un listener per il caricamento del documento
document.addEventListener("DOMContentLoaded", () => {
  // Imposta Home come sezione attiva all'avvio
  setHomeActive();

  // Aggiungi listener per i cambiamenti di hash
  window.addEventListener("hashchange", () => {
    // Ottieni l'hash corrente
    const currentHash = window.location.hash || "#home";

    // Aggiorna i link di navigazione
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === currentHash) {
        link.classList.add("active");
      }
    });

    // Aggiorna i link di navigazione mobile
    const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
    mobileNavLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === currentHash) {
        link.classList.add("active");
      }
    });
  });
});
