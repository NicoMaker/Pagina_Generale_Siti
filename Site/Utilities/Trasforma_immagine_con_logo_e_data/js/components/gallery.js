(() => {
  "use strict";
  const LS = window.LS;

  class LSGallery extends LS.Element {
    render() {
      this.cards = new Map();
      this.innerHTML =
        '<section class="gallery" hidden>' +
        '<div class="gallery__head">' +
        '<h2>Anteprima <span class="count" data-count></span></h2>' +
        '<div class="row">' +
        '<label class="check"><input type="checkbox" data-all><span>Seleziona tutte</span></label>' +
        '<button class="btn btn--ghost btn--sm" type="button" data-clear>Svuota</button>' +
        "</div>" +
        "</div>" +
        '<div class="grid" data-grid></div>' +
        '<div class="grid grid--skeleton" data-skel aria-hidden="true"></div>' +
        "</section>";

      this.$("[data-all]").addEventListener("change", (e) => {
        LS.store.selectAll(e.target.checked);
      });
      this.$("[data-clear]").addEventListener("click", () => {
        LS.store.clearImages();
      });
    }

    mounted() {
      this.listen("images", this.sync);
      this.listen("busy", this.syncBusy);
      this.listen("selection", this.syncSelection);
      this.listen("logo", this.schedule);
      this.listen("settings", this.schedule);
      this.listen("meta", this.schedule);
      this.sync();
    }

    // Ridisegna tutte le schede al prossimo frame (raggruppa i cambi rapidi, es. slider).
    schedule() {
      if (this._raf) return;
      const self = this;
      this._raf = requestAnimationFrame(() => {
        self._raf = 0;
        self.cards.forEach((c) => {
          c.draw();
        });
      });
    }

    sync() {
      const images = LS.store.state.images;
      const grid = this.$("[data-grid]");
      const alive = new Set(
        images.map((i) => {
          return i.id;
        }),
      );

      this.cards.forEach(function (card, id) {
        if (!alive.has(id)) {
          card.remove();
          this.cards.delete(id);
        }
      }, this);

      images.forEach(function (it, index) {
        let card = this.cards.get(it.id);
        if (!card) {
          card = document.createElement("ls-card");
          card.item = it;
          this.cards.set(it.id, card);
        }
        card.style.setProperty("--i", index % 12);
        if (grid.children[index] !== card)
          grid.insertBefore(card, grid.children[index] || null);
      }, this);

      this.$(".gallery").hidden =
        images.length === 0 && !this.$("[data-skel]").children.length;
      this.$("[data-count]").textContent = images.length
        ? `· ${images.length}`
        : "";
      this.syncSelection();
    }

    // Segnaposto animati mentre le foto vengono caricate.
    syncBusy(busy) {
      const n =
        busy && /^Carico/.test(busy.label) && busy.total
          ? Math.min(Math.max(busy.total - busy.done, 0), 8)
          : 0;
      const skel = this.$("[data-skel]");
      if (skel.children.length !== n) {
        skel.innerHTML = new Array(n + 1).join(
          '<div class="tile tile--skeleton"><div class="tile__media"></div><div class="tile__body"><i></i><i></i></div></div>',
        );
      }
      this.$(".gallery").hidden = LS.store.state.images.length === 0 && n === 0;
    }

    syncSelection() {
      const images = LS.store.state.images;
      const selected = images.filter((i) => {
        return i.selected;
      }).length;
      this.cards.forEach((c) => {
        c.syncSelected();
      });
      const all = this.$("[data-all]");
      all.checked = images.length > 0 && selected === images.length;
      all.indeterminate = selected > 0 && selected < images.length;
    }
  }
  customElements.define("ls-gallery", LSGallery);
})();
