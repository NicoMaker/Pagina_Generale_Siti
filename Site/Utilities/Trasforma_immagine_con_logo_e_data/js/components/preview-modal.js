(() => {
  'use strict';
  const LS = window.LS;
  const esc = LS.utils.escapeHtml;

  class LSPreviewModal extends LS.Element {
    render() {
      this.innerHTML =
        '<dialog class="modal" aria-label="Anteprima">' +
          '<div class="modal__head">' +
            '<div class="modal__title"><strong data-title></strong><span data-meta></span></div>' +
            '<div class="row">' +
              '<label class="check"><input type="checkbox" data-compare><span>Mostra originale</span></label>' +
              '<button class="btn btn--sm" type="button" data-dl>Scarica</button>' +
              '<button class="btn btn--ghost btn--sm btn--icon" type="button" data-close aria-label="Chiudi">' +
                '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<div class="modal__stage checker">' +
            '<button class="nav nav--prev" type="button" data-prev aria-label="Precedente">‹</button>' +
            '<canvas data-canvas></canvas>' +
            '<button class="nav nav--next" type="button" data-next aria-label="Successiva">›</button>' +
          '</div>' +
        '</dialog>';

      const self = this, dlg = this.$('dialog');
      this.currentId = null;
      this.token = 0;

      this.$('[data-close]').addEventListener('click', () => { dlg.close(); });
      this.$('[data-prev]').addEventListener('click', () => { self.step(-1); });
      this.$('[data-next]').addEventListener('click', () => { self.step(1); });
      this.$('[data-compare]').addEventListener('change', () => { self.draw(); });
      this.$('[data-dl]').addEventListener('click', () => { LS.actions.downloadOne(self.currentId); });
      dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') self.step(-1);
        if (e.key === 'ArrowRight') self.step(1);
      });
      dlg.addEventListener('close', () => { self.token++; self.currentId = null; });
    }

    mounted() {
      this.on(document, 'ls:preview', e => { this.open(e.detail.id); });
      this.listen('images', function () {
        if (this.currentId && !this.item()) this.$('dialog').close();
      });
    }

    item() {
      const id = this.currentId;
      return LS.store.state.images.find(x => { return x.id === id; });
    }

    open(id) {
      this.currentId = id;
      this.$('[data-compare]').checked = false;
      const dlg = this.$('dialog');
      if (!dlg.open) dlg.showModal();
      this.draw();
    }

    step(dir) {
      const list = LS.store.state.images;
      const i = list.findIndex(function (x) { return x.id === this.currentId; }, this);
      if (i < 0 || list.length < 2) return;
      this.currentId = list[(i + dir + list.length) % list.length].id;
      this.draw();
    }

    async draw() {
      const it = this.item();
      if (!it) return;
      const st = LS.store.state, token = ++this.token;
      const original = this.$('[data-compare]').checked;

      this.$('[data-title]').textContent = it.name;
      this.$('[data-meta]').textContent = `${it.w}×${it.h} · ${LS.utils.formatBytes(it.size)}`;

      try {
        const c = await LS.exporter.renderCanvas(it, st.logo, st.settings, 1800, { noLogo: original, noInfo: original });
        if (token !== this.token) return;
        const old = this.$('[data-canvas]');
        c.setAttribute('data-canvas', '');
        old.replaceWith(c);
      } catch (e) {
        LS.toast('Non riesco a generare l’anteprima.', 'error');
      }
    }
  }
  customElements.define('ls-preview-modal', LSPreviewModal);
})();
