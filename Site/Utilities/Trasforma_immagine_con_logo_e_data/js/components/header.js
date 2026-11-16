(() => {
  "use strict";
  const LS = window.LS;

  class LSHeader extends LS.Element {
    render() {
      this.innerHTML =
        '<header class="topbar">' +
        '<div class="brand">' +
        '<span class="brand__mark" aria-hidden="true">' +
        '<svg viewBox="0 0 32 32" width="22" height="22"><rect x="3" y="5" width="26" height="22" rx="6" fill="none" stroke="currentColor" stroke-width="2"/>' +
        '<rect x="15" y="16" width="11" height="8" rx="2.5" fill="currentColor"/></svg>' +
        "</span>" +
        '<div class="brand__text"><h1>Logo Stamp</h1>' +
        "<p>Logo, data e luogo su tutte le tue foto</p></div>" +
        "</div>" +
        '<div class="topbar__actions">' +
        '<span class="pill" title="Le immagini non lasciano mai il tuo computer">' +
        '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z"/></svg>' +
        "Tutto resta nel browser" +
        "</span>" +
        '<button class="btn btn--ghost btn--icon kbd-btn" type="button" data-shortcuts aria-label="Scorciatoie da tastiera" title="Scorciatoie da tastiera (?)">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M19 10h.01M7 14h10"/></svg>' +
        "</button>" +
        '<button class="btn settings-btn" data-settings-toggle type="button" aria-controls="sidebar" aria-expanded="false" aria-label="Logo e impostazioni">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6"/></svg><span>Impostazioni</span>' +
        "</button>" +
        '<button class="btn btn--ghost btn--icon" data-theme-toggle type="button" aria-label="Cambia tema">' +
        '<svg class="i-moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>' +
        '<svg class="i-sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
        "</button>" +
        "</div>" +
        "</header>";

      this.$("[data-theme-toggle]").addEventListener("click", (e) => {
        const root = document.documentElement;
        const next = root.dataset.theme === "light" ? "dark" : "light";
        const apply = () => {
          root.dataset.theme = next;
          try {
            localStorage.setItem("ls-theme", next);
          } catch (err) {}
        };
        const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!document.startViewTransition || calm) {
          apply();
          return;
        }
        const r = e.currentTarget.getBoundingClientRect();
        root.style.setProperty(
          "--vt-x",
          `${Math.round(r.left + r.width / 2)}px`,
        );
        root.style.setProperty(
          "--vt-y",
          `${Math.round(r.top + r.height / 2)}px`,
        );
        document.startViewTransition(apply);
      });
    }
  }
  customElements.define("ls-header", LSHeader);
})();
