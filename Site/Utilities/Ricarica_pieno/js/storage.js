/* Ricarica Pieno – storage.js
 * Gestione dati (localStorage), import/export JSON.
 */
(function (g) {
  'use strict';

  var KEY = 'fuellog.v1';

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function num(v, d) {
    var n = Number(v);
    return isFinite(n) ? n : (d === undefined ? 0 : d);
  }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function defaults() {
    return {
      version: 1,
      activeVehicleId: null,
      settings: { fvgDiscount: 0.24, lastFvg: false, theme: 'auto' },
      vehicles: []
    };
  }

  function normRefuel(r) {
    return {
      id: r.id || uid(),
      date: /^\d{4}-\d{2}-\d{2}$/.test(r.date || '') ? r.date : todayISO(),
      odometer: num(r.odometer),
      liters: num(r.liters),
      price: num(r.price),
      fvg: !!r.fvg,
      discount: num(r.discount),
      paidTotal: num(r.paidTotal) > 0 ? num(r.paidTotal) : null,
      full: r.full !== false,
      note: String(r.note || '')
    };
  }

  function normVehicle(v) {
    return {
      id: v.id || uid(),
      name: String(v.name || 'Veicolo'),
      plate: String(v.plate || ''),
      type: String(v.type || 'auto'),
      fuel: String(v.fuel || 'Benzina'),
      initialKm: num(v.initialKm),
      tank: v.tank === '' || v.tank == null ? null : num(v.tank, null),
      icon: String(v.icon || '🚗'),
      color: /^#[0-9a-f]{6}$/i.test(v.color || '') ? v.color : '#0f766e',
      createdAt: v.createdAt || new Date().toISOString(),
      refuels: (Array.isArray(v.refuels) ? v.refuels : []).map(normRefuel)
    };
  }

  function normalize(d) {
    var s = defaults();
    if (!d || typeof d !== 'object') return s;
    var st = d.settings || {};
    s.settings.fvgDiscount = num(st.fvgDiscount, s.settings.fvgDiscount);
    if (s.settings.fvgDiscount === 0.15) s.settings.fvgDiscount = 0.24; // vecchio segnaposto
    s.settings.lastFvg = !!st.lastFvg;
    s.settings.theme = ['auto', 'light', 'dark', 'amoled', 'ocean', 'forest', 'viola', 'sunset', 'mint'].indexOf(st.theme) >= 0 ? st.theme : 'auto';
    s.vehicles = (Array.isArray(d.vehicles) ? d.vehicles : []).map(normVehicle);
    var ok = s.vehicles.some(function (v) { return v.id === d.activeVehicleId; });
    s.activeVehicleId = ok ? d.activeVehicleId : (s.vehicles[0] ? s.vehicles[0].id : null);
    return s;
  }

  function validateImport(obj) {
    if (!obj || typeof obj !== 'object' || !Array.isArray(obj.vehicles)) {
      throw new Error('File non valido: manca l\'elenco "vehicles".');
    }
    obj.vehicles.forEach(function (v, i) {
      if (!v || typeof v.name !== 'string' || !v.name.trim()) {
        throw new Error('Veicolo #' + (i + 1) + ': nome mancante.');
      }
      if (!isFinite(Number(v.initialKm))) {
        throw new Error('Veicolo "' + v.name + '": km iniziali non validi.');
      }
      (v.refuels || []).forEach(function (r, j) {
        if (!r || !isFinite(Number(r.odometer)) || !isFinite(Number(r.liters)) || !isFinite(Number(r.price))) {
          throw new Error('Veicolo "' + v.name + '", rifornimento #' + (j + 1) + ': km, litri o prezzo non validi.');
        }
      });
    });
  }

  function load() {
    try {
      var raw = g.localStorage.getItem(KEY);
      if (raw) return normalize(JSON.parse(raw));
    } catch (e) { /* ignore */ }
    return defaults();
  }

  var state = load();

  function save() {
    try {
      g.localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  }

  function findVehicle(id) {
    return state.vehicles.filter(function (v) { return v.id === id; })[0] || null;
  }

  var Store = {
    uid: uid,
    todayISO: todayISO,
    get: function () { return state; },
    save: save,

    activeVehicle: function () { return findVehicle(state.activeVehicleId); },
    setActive: function (id) {
      if (findVehicle(id)) { state.activeVehicleId = id; save(); }
    },

    addVehicle: function (data) {
      var v = normVehicle(Object.assign({}, data, { id: uid(), refuels: [], createdAt: new Date().toISOString() }));
      state.vehicles.push(v);
      state.activeVehicleId = v.id;
      save();
      return v;
    },
    updateVehicle: function (id, patch) {
      var v = findVehicle(id);
      if (!v) return null;
      var merged = normVehicle(Object.assign({}, v, patch, { id: v.id, refuels: v.refuels, createdAt: v.createdAt }));
      Object.assign(v, merged);
      save();
      return v;
    },
    deleteVehicle: function (id) {
      state.vehicles = state.vehicles.filter(function (v) { return v.id !== id; });
      if (state.activeVehicleId === id) {
        state.activeVehicleId = state.vehicles[0] ? state.vehicles[0].id : null;
      }
      save();
    },

    addRefuel: function (vid, r) {
      var v = findVehicle(vid);
      if (!v) return null;
      var n = normRefuel(r);
      v.refuels.push(n);
      save();
      return n;
    },
    updateRefuel: function (vid, r) {
      var v = findVehicle(vid);
      if (!v) return null;
      var i = v.refuels.findIndex(function (x) { return x.id === r.id; });
      if (i < 0) return null;
      v.refuels[i] = normRefuel(r);
      save();
      return v.refuels[i];
    },
    deleteRefuel: function (vid, rid) {
      var v = findVehicle(vid);
      if (!v) return;
      v.refuels = v.refuels.filter(function (x) { return x.id !== rid; });
      save();
    },

    setSettings: function (patch) {
      Object.assign(state.settings, patch);
      save();
    },

    /** Esporta tutto (o un solo veicolo) come stringa JSON. */
    exportData: function (vehicleId) {
      var vehicles = vehicleId ? state.vehicles.filter(function (v) { return v.id === vehicleId; }) : state.vehicles;
      return JSON.stringify({
        app: 'Ricarica Pieno',
        version: 1,
        exportedAt: new Date().toISOString(),
        activeVehicleId: vehicleId || state.activeVehicleId,
        settings: state.settings,
        vehicles: vehicles
      }, null, 2);
    },

    /** Importa da stringa JSON. mode: 'merge' | 'replace'. */
    importData: function (text, mode) {
      var obj;
      try { obj = JSON.parse(text); } catch (e) { throw new Error('File non valido: il JSON è illeggibile.'); }
      validateImport(obj);
      var incoming = normalize(obj);
      var res = { vehicles: 0, refuels: 0 };

      if (mode === 'replace') {
        state = incoming;
        res.vehicles = incoming.vehicles.length;
        res.refuels = incoming.vehicles.reduce(function (a, v) { return a + v.refuels.length; }, 0);
      } else {
        incoming.vehicles.forEach(function (iv) {
          var ex = findVehicle(iv.id);
          if (!ex) {
            state.vehicles.push(iv);
            res.vehicles++;
            res.refuels += iv.refuels.length;
          } else {
            var ids = {};
            ex.refuels.forEach(function (r) { ids[r.id] = true; });
            iv.refuels.forEach(function (r) {
              if (!ids[r.id]) { ex.refuels.push(r); res.refuels++; }
            });
          }
        });
        if (!state.activeVehicleId && state.vehicles[0]) state.activeVehicleId = state.vehicles[0].id;
      }
      save();
      return res;
    },

    reset: function () {
      state = defaults();
      save();
    }
  };

  g.Store = Store;
})(typeof window !== 'undefined' ? window : globalThis);
