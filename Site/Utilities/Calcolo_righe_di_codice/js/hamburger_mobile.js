// ============================================================
// hamburger_mobile.js — Menu mobile e sidebar collassabile
// ============================================================

const MOBILE_MENU_CLOSE_MS = 180; // deve combaciare con @keyframes mobileMenuOut in style.css

function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  const btn = document.getElementById("hamburgerBtn");
  if (!menu) return;

  const isHidden = menu.classList.contains("hidden");

  if (isHidden) {
    // Apertura: rimuove hidden, l'animazione di ingresso è gestita dal CSS (slideUp)
    menu.classList.remove("closing");
    menu.classList.remove("hidden");
    if (btn) btn.setAttribute("aria-expanded", "true");
  } else {
    // Chiusura: applica l'animazione di uscita, poi nasconde davvero
    menu.classList.add("closing");
    if (btn) btn.setAttribute("aria-expanded", "false");
    window.setTimeout(() => {
      menu.classList.add("hidden");
      menu.classList.remove("closing");
    }, MOBILE_MENU_CLOSE_MS);
  }
}

// Chiude il menu mobile al click fuori
document.addEventListener("click", function (e) {
  const btn = document.getElementById("hamburgerBtn");
  const menu = document.getElementById("mobileMenu");
  if (!btn || !menu) return;
  if (menu.classList.contains("hidden")) return;
  if (!btn.contains(e.target) && !menu.contains(e.target)) {
    toggleMobileMenu();
  }
});

// Chiude il menu mobile con il tasto Esc (accessibilità da tastiera)
document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  const menu = document.getElementById("mobileMenu");
  if (menu && !menu.classList.contains("hidden")) {
    toggleMobileMenu();
  }
});

function toggleSidebar() {
  const sidebar = document.getElementById("mobileSidebar");
  const btn = document.getElementById("sidebarToggleBtn");
  if (!sidebar || !btn) return;

  sidebar.classList.toggle("sidebar-open");
  btn.classList.toggle("open");

  const isOpen = sidebar.classList.contains("sidebar-open");
  btn.setAttribute("aria-expanded", String(isOpen));

  const label = btn.querySelector("span:first-child");
  if (label) {
    label.textContent = isOpen ? "✕ Chiudi importa" : "⬆ Importa file";
  }
}