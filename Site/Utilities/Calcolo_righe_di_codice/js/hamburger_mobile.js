function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  menu.classList.toggle("hidden");
}
// Close mobile menu on outside click
document.addEventListener("click", function (e) {
  const btn = document.getElementById("hamburgerBtn");
  const menu = document.getElementById("mobileMenu");
  if (!btn.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.add("hidden");
  }
});

function toggleSidebar() {
  const sidebar = document.getElementById("mobileSidebar");
  const btn = document.getElementById("sidebarToggleBtn");
  sidebar.classList.toggle("sidebar-open");
  btn.classList.toggle("open");
  const label = btn.querySelector("span:first-child");
  label.textContent = sidebar.classList.contains("sidebar-open")
    ? "✕ Chiudi importa"
    : "⬆ Importa file";
}
