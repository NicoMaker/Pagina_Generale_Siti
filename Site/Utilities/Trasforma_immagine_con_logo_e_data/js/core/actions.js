(global => {
  'use strict';
  const LS = (global.LS = global.LS || {});
  const U = LS.utils;
  const store = LS.store;

  function plural(n, one, many) { return `${n} ${n === 1 ? one : many}`; }

  function friendly(err) {
    if (err && err.name === 'SecurityError') {
      return 'Il browser ha bloccato la lettura dell\'immagine. Apri la cartella con un server locale (vedi README).';
    }
    return (err && err.message) || 'Operazione non riuscita';
  }

  // Serve almeno il logo oppure la scritta con data e luogo.
  function ready() {
    const st = store.state;
    if (!st.images.length) return false;
    if (!(st.logo && st.settings.logoEnabled) && !st.settings.infoEnabled) {
      LS.toast('Scegli cosa mettere sulle foto: logo, data o luogo.', 'error');
      return false;
    }
    return true;
  }

  async function run(label, fn) {
    if (store.state.busy) { LS.toast('C\'è già un\'operazione in corso.', 'info'); return; }
    try {
      store.setBusy({ label, done: 0, total: 0 });
      await fn();
    } catch (err) {
      LS.toast(friendly(err), 'error');
    } finally {
      store.setBusy(null);
    }
  }

  LS.actions = {
    ready,

    addFiles: function (entries) {
      if (!entries || !entries.length) return Promise.resolve();
      return run('Leggo i file', async () => {
        const res = await LS.loader.expand(entries);
        const known = new Set(store.state.images.map(i => { return `${i.path}|${i.size}`; }));
        const fresh = res.list.filter(x => { return !known.has(`${x.path}|${x.blob.size}`); });
        const duplicates = res.list.length - fresh.length;

        const loaded = await LS.loader.loadItems(fresh, (done, total) => {
          store.setBusy({ label: 'Carico le immagini', done, total });
        });
        store.addImages(loaded.items);

        if (loaded.items.length) {
          const withInfo = loaded.items.filter(i => { return i.exif; }).length;
          let msg = `Aggiunte ${plural(loaded.items.length, 'immagine', 'immagini')}.`;
          if (withInfo === 0) msg += ' Nessuna ha dati EXIF di data o luogo.';
          LS.toast(msg, 'success');
        } else if (!res.list.length) {
          LS.toast('Non ho trovato immagini (JPG, PNG, WebP, GIF, BMP, AVIF).', 'error');
        }
        if (duplicates) LS.toast(`${plural(duplicates, 'file già presente ignorato', 'file già presenti ignorati')}.`, 'info');
        if (loaded.failed) LS.toast(`${plural(loaded.failed, 'file non leggibile', 'file non leggibili')}.`, 'error');
      });
    },

    exportZip: function (all) {
      if (!ready()) return Promise.resolve();
      const items = all === true ? store.state.images.slice() : store.targets(), st = store.state;
      return run('Preparo lo ZIP', async () => {
        const blob = await LS.exporter.buildZip(items, st.logo, st.settings, (done, total, label) => {
          store.setBusy({ label, done, total });
        });
        U.downloadBlob(blob, `immagini-con-logo-${U.timestamp()}.zip`);
        LS.toast(`ZIP pronto: ${plural(items.length, 'immagine', 'immagini')}.`, 'success');
      });
    },

    exportImages: function () {
      if (!ready()) return Promise.resolve();
      const items = store.targets(), st = store.state;
      return run('Preparo le immagini', async () => {
        for (let i = 0; i < items.length; i++) {
          store.setBusy({ label: `Elaboro ${i + 1}/${items.length}`, done: i, total: items.length });
          const f = await LS.exporter.renderFile(items[i], st.logo, st.settings);
          U.downloadBlob(f.blob, f.name);
          if (items.length > 1) await U.sleep(450);
        }
        LS.toast(items.length > 1
          ? 'Download avviati. Se ne vedi meno, consenti i download multipli al browser.'
          : 'Immagine scaricata.', 'success');
      });
    },

    // "Scarica tutto": ignora la selezione. Una sola foto -> il file stesso, più foto -> un unico ZIP.
    exportAll: function () {
      const images = store.state.images;
      if (!ready()) return Promise.resolve();
      if (images.length === 1) return this.downloadOne(images[0].id);
      return this.exportZip(true);
    },

    downloadOne: function (id) {
      const it = store.state.images.find(x => { return x.id === id; });
      if (!it || !ready()) return Promise.resolve();
      return run('Preparo l\'immagine', async () => {
        const f = await LS.exporter.renderFile(it, store.state.logo, store.state.settings);
        U.downloadBlob(f.blob, f.name);
      });
    }
  };
})(window);
