(() => {
  "use strict";
  const LS = window.LS;
  const esc = LS.utils.escapeHtml;

  // Scheda di una singola immagine: anteprima con logo e testo, selezione, scarica, rimuovi.
  class LSCard extends LS.Element {
    render() {
      const it = this.item;
      this.innerHTML = `<article class="tile"><div class="tile__media"><button class="tile__open" type="button" data-open aria-label="Apri anteprima di ${esc(it.name)}"><canvas></canvas></button><label class="tile__check" title="Seleziona"><input type="checkbox" data-sel aria-label="Seleziona ${esc(it.name)}"><span></span></label></div><div class="tile__body"><div class="tile__name" title="${esc(it.path)}">${esc(it.name)}</div><div class="tile__meta">${it.w}×${it.h} · ${LS.utils.formatBytes(it.size)}</div><div class="tile__info" data-info></div></div><div class="tile__actions"><button class="btn btn--sm" type="button" data-dl>Scarica</button><button class="btn btn--ghost btn--sm btn--icon" type="button" data-rm aria-label="Rimuovi ${esc(it.name)}"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg></button></div></article>`;

      this.canvas = this.$("canvas");
      this.canvas.width = it.thumb.width;
      this.canvas.height = it.thumb.height;

      const id = it.id;
      this.$("[data-open]").addEventListener("click", () => {
        document.dispatchEvent(
          new CustomEvent("ls:preview", { detail: { id } }),
        );
      });
      this.$("[data-dl]").addEventListener("click", () => {
        LS.actions.downloadOne(id);
      });
      this.$("[data-rm]").addEventListener("click", () => {
        LS.store.removeImage(id);
      });
      this.$("[data-sel]").addEventListener("change", (e) => {
        LS.store.toggleSelect(id, e.target.checked);
      });

      this.draw();
      this.syncSelected();
    }

    draw() {
      const it = this.item,
        st = LS.store.state,
        c = this.canvas;
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, c.width, c.height);
      LS.watermark.render(
        ctx,
        it.thumb,
        st.logo,
        st.settings,
        c.width,
        c.height,
        {
          info: { lines: LS.stamp.lines(it, st.settings), stats: it.stats },
        },
      );

      const info = this.$("[data-info]");
      const text = LS.stamp.summary(it);
      const e = it.exif;
      info.textContent =
        text && e && e.date && !e.gps
          ? `${text} · posizione assente (il telefono l’ha tolta: scegli la foto da File/Sfoglia)`
          : text || "Nessun dato EXIF di data o luogo";
      info.classList.toggle("is-empty", !text);
    }

    syncSelected() {
      const on = !!this.item.selected;
      this.$("[data-sel]").checked = on;
      this.classList.toggle("is-selected", on);
    }
  }
  customElements.define("ls-card", LSCard);
})();
