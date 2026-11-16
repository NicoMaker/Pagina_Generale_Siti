(() => {
  'use strict';
  const LS = window.LS;

  class LSExportBar extends LS.Element {
    render() {
      this.innerHTML =
        '<div class="bar" hidden>' +
          '<div class="bar__info"><strong data-title></strong><span data-hint></span></div>' +
          '<div class="bar__actions">' +
            '<button class="btn btn--primary" type="button" data-all>' +
              '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v3h16v-3"/></svg>' +
              '<span data-all-label>Scarica tutto</span>' +
            '</button>' +
            '<button class="btn" type="button" data-images>' +
              '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" d="M12 4v10m0 0l-4-4m4 4l4-4M5 19h14"/></svg>' +
              '<span data-images-label>Scarica immagini</span>' +
            '</button>' +
            '<button class="btn" type="button" data-zip>' +
              '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" d="M5 8l7-4 7 4v8l-7 4-7-4V8zm0 0l7 4m0 0l7-4m-7 4v8"/></svg>' +
              '<span data-zip-label>Scarica ZIP</span>' +
            '</button>' +
          '</div>' +
        '</div>';

      this.$('[data-all]').addEventListener('click', () => { LS.actions.exportAll(); });
      this.$('[data-images]').addEventListener('click', () => { LS.actions.exportImages(); });
      this.$('[data-zip]').addEventListener('click', () => { LS.actions.exportZip(); });
    }

    mounted() {
      ['images', 'selection', 'busy', 'logo', 'settings'].forEach(function (evt) { this.listen(evt, this.update); }, this);
      this.update();
    }

    update() {
      const st = LS.store.state;
      const n = st.images.length;
      const sel = LS.store.selected().length;
      const count = sel || n;

      this.$('.bar').hidden = n === 0;
      this.$('.bar').classList.toggle('is-busy', !!st.busy);
      this.$('[data-title]').textContent = sel
        ? `${sel} di ${n} selezionate`
        : n + (n === 1 ? ' immagine' : ' immagini');

      const ready = (!!st.logo && st.settings.logoEnabled) || st.settings.infoEnabled;
      const hint = !ready ? (st.settings.logoEnabled || st.settings.infoEnabled ? 'Carica un logo o attiva data o luogo per poter scaricare' : 'Scegli cosa mettere sulle foto: logo, data o luogo')
        : sel ? 'Verranno scaricate solo quelle selezionate'
        : n > 1 ? 'Verranno scaricate tutte (spunta le schede per sceglierne alcune)' : '';
      this.$('[data-hint]').textContent = hint;

      const disabled = !!st.busy || !ready;
      this.$('[data-images]').disabled = disabled;
      this.$('[data-zip]').disabled = disabled;
      this.$('[data-all]').disabled = disabled;
      this.$('[data-all-label]').textContent = n > 1 ? `Scarica tutto (${n}, ZIP)` : 'Scarica tutto';
      this.$('[data-images-label]').textContent = count > 1 ? `Scarica ${count} immagini` : 'Scarica immagine';
      this.$('[data-zip-label]').textContent = count > 1 ? `Scarica ZIP (${count})` : 'Scarica ZIP';
    }
  }
  customElements.define('ls-export-bar', LSExportBar);
})();
