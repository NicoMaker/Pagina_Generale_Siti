(global => {
  'use strict';
  const LS = (global.LS = global.LS || {});
  const U = LS.utils;

  const FORMATS = {
    png: { mime: 'image/png', ext: 'png' },
    jpeg: { mime: 'image/jpeg', ext: 'jpg' },
    webp: { mime: 'image/webp', ext: 'webp' }
  };
  const TYPE_EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

  function specFor(item, s) {
    let f = s.format;
    if (f === 'original') {
      const e = U.extOf(item.name);
      f = (e === 'jpg' || e === 'jpeg') ? 'jpeg' : e === 'webp' ? 'webp' : 'png';
    }
    return FORMATS[f];
  }

  // Disegna l'immagine con logo e testo; maxSide limita la dimensione (anteprima).
  // opts: { noLogo, noInfo }
  async function renderCanvas(item, logo, s, maxSide, opts = {}) {
    const img = await LS.loader.loadImage(item.url);

    const limit = maxSide || 12000;
    const scale = Math.max(item.w, item.h) > limit ? limit / Math.max(item.w, item.h) : 1;
    const W = Math.max(1, Math.round(item.w * scale));
    const H = Math.max(1, Math.round(item.h * scale));

    if (!opts.noInfo && LS.stamp.wantsLookup(s) && item.exif && item.exif.gps) {
      await LS.geo.ensure(item);
    }

    const c = document.createElement('canvas');
    c.width = W;c.height = H;
    const ctx = c.getContext('2d');
    const spec = specFor(item, s);
    LS.watermark.render(ctx, img, opts.noLogo ? null : logo, s, W, H, {
      fill: spec.mime === 'image/jpeg' ? '#ffffff' : null,
      info: opts.noInfo ? null : { lines: LS.stamp.lines(item, s), stats: item.stats }
    });
    return c;
  }

  function canvasToBlob(canvas, spec, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(b => {
        if (b) resolve(b); else reject(new Error('Esportazione non riuscita'));
      }, spec.mime, spec.mime === 'image/png' ? undefined : quality / 100);
    });
  }

  // Risultato finale pronto da scaricare: { blob, name, path }
  async function renderFile(item, logo, s) {
    const canvas = await renderCanvas(item, logo, s);
    const spec = specFor(item, s);
    const blob = await canvasToBlob(canvas, spec, s.quality);
    canvas.width = canvas.height = 0;
    const ext = TYPE_EXT[blob.type] || spec.ext; // es. Safari non produce WebP
    const name = `${U.baseName(item.name) + (s.suffix || '')}.${ext}`;
    return { blob, name, path: U.dirOf(item.path) + name };
  }

  function uniquePath(path, used) {
    if (!used.has(path)) { used.add(path); return path; }
    const dot = path.lastIndexOf('.');
    const stem = dot > 0 ? path.slice(0, dot) : path, ext = dot > 0 ? path.slice(dot) : '';
    let n = 2, candidate;
    do { candidate = `${stem}-${n}${ext}`; n++; } while (used.has(candidate));
    used.add(candidate);
    return candidate;
  }

  async function buildZip(items, logo, s, onProgress) {
    const zip = new JSZip(), used = new Set();
    for (let i = 0; i < items.length; i++) {
      if (onProgress) onProgress(i, items.length, `Elaboro ${i + 1}/${items.length}`);
      const f = await renderFile(items[i], logo, s);
      zip.file(uniquePath(f.path, used), f.blob, { binary: true });
      await U.sleep(0);
    }
    if (onProgress) onProgress(items.length, items.length, 'Creo lo ZIP');
    return zip.generateAsync({ type: 'blob', compression: 'STORE' });
  }

  LS.exporter = { specFor, renderCanvas, renderFile, buildZip };
})(window);
