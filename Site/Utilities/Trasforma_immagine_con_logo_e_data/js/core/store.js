(global => {
  'use strict';
  const LS = (global.LS = global.LS || {});

  const DEFAULTS = {
    // Cosa scrivere sulle foto: logo, data, luogo (qualsiasi combinazione)
    logoEnabled: true,
    // Logo
    position: 8,        // 0..8 (riga per riga: alto-sx ... basso-dx)
    tile: false,        // mosaico su tutta l'immagine
    size: 22,           // % della larghezza immagine
    opacity: 90,        // %
    margin: 3,          // % del lato minore
    gap: 80,            // % (solo mosaico)
    rotation: 0,        // gradi
    shadow: false,
    // Data e luogo
    infoEnabled: true,
    infoDate: true,
    infoTime: true,
    infoPlace: true,
    infoLookup: true,   // cerca il nome del luogo online (OpenStreetMap)
    infoPosition: 'auto',
    infoSize: 1.8,      // % del lato minore
    infoOpacity: 85,    // %
    // Esportazione
    format: 'original', // original | png | jpeg | webp
    quality: 92,
    suffix: '-logo'
  };

  const listeners = {};

  // Il testo c'è se è attiva la data oppure il luogo.
  function normalize(s) { s.infoEnabled = !!(s.infoDate || s.infoPlace); return s; }

  function loadSettings() {
    try {
      const raw = localStorage.getItem('ls-settings');
      if (raw) {
        const saved = JSON.parse(raw);
        // Impostazioni salvate con la vecchia versione: "data e luogo" spento = data e luogo spenti.
        if (saved.infoEnabled === false && saved.logoEnabled === undefined) { saved.infoDate = false; saved.infoPlace = false; }
        return normalize(Object.assign({}, DEFAULTS, saved));
      }
    } catch (e) {}
    return normalize(Object.assign({}, DEFAULTS));
  }
  function saveSettings() {
    try { localStorage.setItem('ls-settings', JSON.stringify(state.settings)); } catch (e) {}
  }

  const state = { images: [], logo: null, settings: loadSettings(), busy: null };

  LS.store = {
    state,
    DEFAULTS,

    on: function (evt, fn) {
      (listeners[evt] = listeners[evt] || []).push(fn);
      return () => {
        listeners[evt] = (listeners[evt] || []).filter(f => { return f !== fn; });
      };
    },
    emit: function (evt, payload) {
      (listeners[evt] || []).slice().forEach(fn => { fn(payload); });
    },

    updateSettings: function (patch) {
      Object.assign(state.settings, patch);
      normalize(state.settings);
      saveSettings();
      this.emit('settings', state.settings);
    },
    resetSettings: function () {
      state.settings = normalize(Object.assign({}, DEFAULTS));
      saveSettings();
      this.emit('settings', state.settings);
    },

    setLogo: function (logo) {
      if (state.logo && state.logo.url) URL.revokeObjectURL(state.logo.url);
      state.logo = logo;
      this.emit('logo', logo);
    },

    addImages: function (items) {
      for (let i = 0; i < items.length; i++) state.images.push(items[i]);
      this.emit('images');
    },
    removeImage: function (id) {
      const i = state.images.findIndex(x => { return x.id === id; });
      if (i < 0) return;
      URL.revokeObjectURL(state.images[i].url);
      state.images.splice(i, 1);
      this.emit('images');
    },
    clearImages: function () {
      state.images.forEach(x => { URL.revokeObjectURL(x.url); });
      state.images.length = 0;
      this.emit('images');
    },

    toggleSelect: function (id, value) {
      const it = state.images.find(x => { return x.id === id; });
      if (!it) return;
      it.selected = value === undefined ? !it.selected : !!value;
      this.emit('selection');
    },
    selectAll: function (value) {
      state.images.forEach(x => { x.selected = !!value; });
      this.emit('selection');
    },
    selected: function () { return state.images.filter(x => { return x.selected; }); },
    // Se ci sono immagini selezionate agisce su quelle, altrimenti su tutte.
    targets: function () {
      const sel = this.selected();
      return sel.length ? sel : state.images.slice();
    },

    setBusy: function (busy) {
      state.busy = busy;
      this.emit('busy', busy);
    }
  };
})(window);
