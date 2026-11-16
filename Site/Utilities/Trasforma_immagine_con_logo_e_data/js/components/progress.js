(() => {
  "use strict";
  const LS = window.LS;

  // Barra di avanzamento in alto, visibile solo durante le operazioni lunghe.
  class LSProgress extends LS.Element {
    render() {
      this.innerHTML =
        '<div class="progress" hidden role="status" aria-live="polite">' +
        '<div class="progress__track"><div class="progress__bar"></div></div>' +
        '<div class="progress__label"></div>' +
        "</div>";
    }
    mounted() {
      this.listen("busy", this.update);
      this.update(LS.store.state.busy);
    }
    update(busy) {
      const root = this.$(".progress");
      if (!busy) {
        root.hidden = true;
        return;
      }
      root.hidden = false;
      const pct = busy.total
        ? Math.round((busy.done / busy.total) * 100)
        : null;
      root.classList.toggle("is-indeterminate", pct === null);
      this.$(".progress__bar").style.width = pct === null ? "" : `${pct}%`;
      this.$(".progress__label").textContent =
        busy.label + (busy.total ? ` · ${busy.done}/${busy.total}` : "…");
    }
  }
  customElements.define("ls-progress", LSProgress);
})();
