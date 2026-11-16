(global => {
  'use strict';
  const LS = (global.LS = global.LS || {});

  // Lettore EXIF minimale (JPEG, PNG eXIf, WebP): data di scatto e coordinate GPS.

  function findTiff(buf) {
    const dv = new DataView(buf), len = dv.byteLength;

    // JPEG
    if (len > 4 && dv.getUint16(0) === 0xFFD8) {
      let p = 2;
      while (p + 4 <= len) {
        if (dv.getUint8(p) !== 0xFF) { p++; continue; }
        const marker = dv.getUint8(p + 1);
        if (marker === 0xFF) { p++; continue; }
        if (marker === 0xD8 || marker === 0x01 || (marker >= 0xD0 && marker <= 0xD7)) { p += 2; continue; }
        if (marker === 0xDA || marker === 0xD9) break;
        const size = dv.getUint16(p + 2);
        if (marker === 0xE1 && p + 10 <= len && dv.getUint32(p + 4) === 0x45786966 && dv.getUint16(p + 8) === 0) {
          return { dv, start: p + 10 };
        }
        p += 2 + size;
      }
      return null;
    }

    // PNG (chunk eXIf)
    if (len > 8 && dv.getUint32(0) === 0x89504E47) {
      let q = 8;
      while (q + 12 <= len) {
        const csize = dv.getUint32(q), type = dv.getUint32(q + 4);
        if (type === 0x65584966) return { dv, start: q + 8 };
        q += 12 + csize;
      }
      return null;
    }

    // WebP (chunk EXIF)
    if (len > 12 && dv.getUint32(0) === 0x52494646 && dv.getUint32(8) === 0x57454250) {
      let w = 12;
      while (w + 8 <= len) {
        const wtype = dv.getUint32(w), wsize = dv.getUint32(w + 4, true);
        if (wtype === 0x45584946) {
          let s = w + 8;
          if (s + 6 <= len && dv.getUint32(s) === 0x45786966) s += 6;
          return { dv, start: s };
        }
        w += 8 + wsize + (wsize & 1);
      }
    }
    return null;
  }

  function parseTiff(dv, base) {
    const order = dv.getUint16(base);
    const le = order === 0x4949;
    if (!le && order !== 0x4D4D) return null;
    if (dv.getUint16(base + 2, le) !== 42) return null;

    function u16(o) { return dv.getUint16(base + o, le); }
    function u32(o) { return dv.getUint32(base + o, le); }
    const typeSize = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };

    function readIFD(off) {
      const tags = {};
      try {
        const n = u16(off);
        for (let i = 0; i < n; i++) {
          const e = off + 2 + i * 12;
          if (base + e + 12 > dv.byteLength) break;
          const tag = u16(e), type = u16(e + 2), count = u32(e + 4);
          const size = (typeSize[type] || 1) * count;
          tags[tag] = { type, count, off: size <= 4 ? e + 8 : u32(e + 8) };
        }
      } catch (err) {}
      return tags;
    }
    function str(t) {
      if (!t) return null;
      let s = '';
      for (let i = 0; i < t.count; i++) {
        const c = dv.getUint8(base + t.off + i);
        if (c === 0) break;
        s += String.fromCharCode(c);
      }
      return s.trim();
    }
    function rationals(t, n) {
      const out = [];
      for (let i = 0; i < n; i++) {
        const num = u32(t.off + i * 8), den = u32(t.off + i * 8 + 4);
        out.push(den ? num / den : 0);
      }
      return out;
    }

    const result = { date: null, gps: null };
    try {
      const ifd0 = readIFD(u32(4));
      const exifIfd = ifd0[0x8769] ? readIFD(u32(ifd0[0x8769].off)) : {};

      const raw = str(exifIfd[0x9003]) || str(exifIfd[0x9004]) || str(ifd0[0x0132]);
      const m = raw && /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(raw);
      if (m && +m[1] > 1900 && +m[2] >= 1 && +m[2] <= 12 && +m[3] >= 1) {
        result.date = { y: +m[1], mo: +m[2], d: +m[3], h: +m[4], mi: +m[5], s: +(m[6] || 0) };
      }

      if (ifd0[0x8825]) {
        const gps = readIFD(u32(ifd0[0x8825].off));
        if (gps[2] && gps[4] && gps[2].count >= 3 && gps[4].count >= 3) {
          const la = rationals(gps[2], 3), lo = rationals(gps[4], 3);
          let lat = la[0] + la[1] / 60 + la[2] / 3600;
          let lon = lo[0] + lo[1] / 60 + lo[2] / 3600;
          if ((str(gps[1]) || 'N').toUpperCase().charAt(0) === 'S') lat = -lat;
          if ((str(gps[3]) || 'E').toUpperCase().charAt(0) === 'W') lon = -lon;
          const valid = isFinite(lat) && isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
          if (valid && !(lat === 0 && lon === 0)) result.gps = { lat, lon };
        }
      }
    } catch (err) {}
    return result;
  }

  // Legge solo l'inizio del file: l'EXIF sta sempre nei primi blocchi.
  async function read(blob) {
    const slice = blob.slice(0, 4 * 1024 * 1024);
    const buf = await slice.arrayBuffer();
    const found = findTiff(buf);
    if (!found) return null;
    const data = parseTiff(found.dv, found.start);
    if (!data || (!data.date && !data.gps)) return null;
    return data;
  }

  LS.exif = { read };
})(window);
