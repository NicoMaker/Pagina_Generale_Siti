(global => {
  'use strict';
  const LS = (global.LS = global.LS || {});
  const U = LS.utils;

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => { resolve(img); };
      img.onerror = () => { reject(new Error('Immagine non leggibile')); };
      img.src = url;
    });
  }

  // ---------- Drag & drop (anche cartelle) ----------
  function readEntries(reader) {
    return new Promise((res, rej) => { reader.readEntries(res, rej); });
  }
  async function walkEntry(entry, prefix, out) {
    if (entry.isFile) {
      const file = await new Promise((res, rej) => { entry.file(res, rej); });
      out.push({ file, path: prefix + file.name });
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      let batch;
      do {
        batch = await readEntries(reader);
        for (let i = 0; i < batch.length; i++) await walkEntry(batch[i], `${prefix + entry.name}/`, out);
      } while (batch.length);
    }
  }
  async function fromDataTransfer(dt) {
    const items = dt.items ? Array.prototype.slice.call(dt.items) : [];
    // Le entry vanno prese in modo sincrono, prima di qualsiasi await.
    const entries = items.map(i => {
      return i.kind === 'file' && i.webkitGetAsEntry ? i.webkitGetAsEntry() : null;
    });
    if (entries.length && entries.every(Boolean)) {
      const out = [];
      for (let i = 0; i < entries.length; i++) await walkEntry(entries[i], '', out);
      return out;
    }
    return fromFileList(dt.files);
  }
  function fromFileList(list) {
    return Array.prototype.slice.call(list).map(f => {
      return { file: f, path: f.webkitRelativePath || f.name };
    });
  }

  // ---------- Espansione ZIP ----------
  // Da [{file,path}] a [{blob,path,name}] con le sole immagini (ZIP aperti).
  async function expand(entries) {
    const list = [];
    let skipped = 0;
    for (let i = 0; i < entries.length; i++) {
      const file = entries[i].file, path = entries[i].path;
      const ext = U.extOf(file.name);
      const isZip = ext === 'zip' || file.type === 'application/zip' || file.type === 'application/x-zip-compressed';

      if (isZip) {
        const zip = await JSZip.loadAsync(file);
        const names = Object.keys(zip.files);
        for (let j = 0; j < names.length; j++) {
          const n = names[j], z = zip.files[n];
          if (z.dir) continue;
          const fn = U.fileOf(n);
          if (n.indexOf('__MACOSX/') === 0 || fn.charAt(0) === '.') continue;
          if (!U.isImageName(fn)) { skipped++; continue; }
          const raw = await z.async('blob');
          list.push({ blob: new Blob([raw], { type: U.MIME[U.extOf(fn)] }), path: n, name: fn });
        }
      } else if (U.isImageName(file.name)) {
        list.push({ blob: file, path, name: file.name });
      } else {
        skipped++;
      }
    }
    return { list, skipped };
  }

  // ---------- Creazione degli elementi ----------
  async function loadItems(list, onProgress) {
    const items = [];
    let failed = 0;
    for (let i = 0; i < list.length; i++) {
      const blob = list[i].blob;
      const url = URL.createObjectURL(blob);
      try {
        const img = await loadImage(url);
        const w = img.naturalWidth, h = img.naturalHeight;
        const thumb = LS.watermark.makeThumb(img, w, h);
        const stats = LS.watermark.analyze(thumb);
        let exif = null;
        try { exif = await LS.exif.read(blob); } catch (e) { exif = null; }
        items.push({
          id: U.uid(), name: list[i].name, path: list[i].path, type: blob.type,
          blob, url, w, h, size: blob.size,
          thumb, stats, exif,
          selected: false, place: null, placeDone: false
        });
      } catch (e) {
        failed++;
        URL.revokeObjectURL(url);
      }
      if (onProgress) onProgress(i + 1, list.length);
      if (i % 3 === 2) await U.sleep(0);
    }
    return { items, failed };
  }

  LS.loader = {
    loadImage, fromDataTransfer, fromFileList,
    expand, loadItems
  };
})(window);
