(() => {
  'use strict';
  const LS = window.LS;

  const SAMPLE_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 100">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4f7b"/><stop offset="1" stop-color="#ffa94d"/></linearGradient></defs>' +
    '<rect x="4" y="4" width="92" height="92" rx="26" fill="url(#g)"/>' +
    '<path d="M30 64 L48 30 L66 64 Z" fill="#fff" opacity=".95"/><circle cx="48" cy="68" r="6" fill="#fff"/>' +
    '<text x="116" y="63" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700" fill="#ffffff" ' +
    'stroke="#000" stroke-opacity=".28" stroke-width="2" paint-order="stroke">YOUR LOGO</text></svg>';

  class LSLogoPanel extends LS.Element {
    render() {
      this.innerHTML =
        '<section class="card">' +
          '<div class="card__head"><h2>Il tuo logo</h2><span class="badge" data-badge>Nessun logo</span></div>' +
          '<div class="logo-drop" data-logo-drop tabindex="0" role="button" aria-label="Carica il logo">' +
            '<div class="logo-drop__stage checker">' +
              '<img data-preview alt="Anteprima del logo" hidden>' +
              '<div class="logo-drop__empty" data-empty>' +
                '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14"/></svg>' +
                '<strong>Trascina qui il logo</strong>' +
                '<span>o clicca per sceglierlo · PNG, SVG, WebP, JPG</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="row">' +
            '<button class="btn" type="button" data-pick>Carica logo</button>' +
            '<button class="btn btn--ghost" type="button" data-sample>Logo di esempio</button>' +
            '<button class="btn btn--ghost" type="button" data-remove hidden>Rimuovi</button>' +
          '</div>' +
          '<input type="file" accept="image/*" hidden data-file>' +
        '</section>';

      const self = this;
      const drop = this.$('[data-logo-drop]');
      const input = this.$('[data-file]');

      const pick = () => { input.click(); };
      this.$('[data-pick]').addEventListener('click', pick);
      drop.addEventListener('click', pick);
      drop.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); }
      });
      input.addEventListener('change', () => {
        if (input.files[0]) self.setLogo(input.files[0], input.files[0].name);
        input.value = '';
      });
      this.$('[data-sample]').addEventListener('click', () => {
        self.setLogo(new Blob([SAMPLE_SVG], { type: 'image/svg+xml' }), 'logo-esempio.svg');
      });
      this.$('[data-remove]').addEventListener('click', () => { LS.store.setLogo(null); });

      ['dragenter', 'dragover'].forEach(evt => {
        drop.addEventListener(evt, e => { e.preventDefault(); drop.classList.add('is-over'); });
      });
      ['dragleave', 'drop'].forEach(evt => {
        drop.addEventListener(evt, () => { drop.classList.remove('is-over'); });
      });
      drop.addEventListener('drop', e => {
        e.preventDefault();
        const f = Array.prototype.find.call(e.dataTransfer.files || [], x => { return /^image\//.test(x.type) || /\.svg$/i.test(x.name); });
        if (f) self.setLogo(f, f.name);
        else LS.toast('Trascina un file immagine (PNG, SVG, WebP, JPG).', 'error');
      });
    }

    mounted() {
      this.listen('logo', this.sync);
      this.sync(LS.store.state.logo);
    }

    async setLogo(blob, name) {
      const url = URL.createObjectURL(blob);
      try {
        const img = await LS.loader.loadImage(url);
        let w = img.naturalWidth, h = img.naturalHeight;
        if (/svg/.test(blob.type) || /\.svg$/i.test(name)) {
          try {
            const text = await blob.text();
            const m = /viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text);
            if (m && +m[1] > 0 && +m[2] > 0) { w = +m[1]; h = +m[2]; }
          } catch (e) {}
        }
        if (!w || !h) { w = 300; h = 300; }
        LS.store.setLogo({ name, url, img, w, h });
      } catch (e) {
        URL.revokeObjectURL(url);
        LS.toast('Non riesco a leggere questo logo.', 'error');
      }
    }

    sync(logo) {
      const img = this.$('[data-preview]');
      this.$('[data-empty]').hidden = !!logo;
      img.hidden = !logo;
      if (logo) { img.src = logo.url; }
      this.$('[data-badge]').textContent = logo ? logo.name : 'Nessun logo';
      this.$('[data-badge]').classList.toggle('badge--ok', !!logo);
      this.$('[data-remove]').hidden = !logo;
      this.$('[data-sample]').hidden = !!logo;
    }
  }
  customElements.define('ls-logo-panel', LSLogoPanel);
})();
