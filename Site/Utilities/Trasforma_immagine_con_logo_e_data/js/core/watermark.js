((global) => {
  "use strict";
  const LS = (global.LS = global.LS || {});

  const FONT =
    '"Segoe UI", system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif';
  const ANCHORS = ["tl", "tc", "tr", "bl", "bc", "br"];

  // ---------- Logo ----------
  // Disegna il logo e restituisce il rettangolo occupato (serve a tenere il testo lontano).
  function drawLogo(ctx, logo, s, W, H) {
    const ratio = logo.h / logo.w;
    let lw = W * (s.size / 100);
    let lh = lw * ratio;
    const maxH = H * (s.tile ? 0.5 : 0.9);
    if (lh > maxH) {
      lh = maxH;
      lw = lh / ratio;
    }
    const rot = ((s.rotation || 0) * Math.PI) / 180;

    ctx.save();
    ctx.globalAlpha = LS.utils.clamp(s.opacity / 100, 0, 1);
    if (s.shadow) {
      ctx.shadowColor = "rgba(0,0,0,.35)";
      ctx.shadowBlur = Math.max(2, lw * 0.05);
      ctx.shadowOffsetY = Math.max(1, lw * 0.015);
    }

    let rect;
    if (s.tile) {
      const gx = lw * (s.gap / 100),
        gy = lh * (s.gap / 100);
      const stepX = lw + gx,
        stepY = lh + gy;
      const diag = Math.hypot(W, H);
      ctx.translate(W / 2, H / 2);
      ctx.rotate(rot);
      let row = 0;
      for (let y = -diag / 2; y < diag / 2; y += stepY, row++) {
        const offset = row % 2 ? stepX / 2 : 0;
        for (let x = -diag / 2 - stepX + offset; x < diag / 2; x += stepX) {
          ctx.drawImage(logo.img, x, y, lw, lh);
        }
      }
      rect = { x: 0, y: 0, w: W, h: H };
    } else {
      const m = Math.min(W, H) * (s.margin / 100);
      const col = s.position % 3,
        rw = Math.floor(s.position / 3);
      const px = col === 0 ? m : col === 1 ? (W - lw) / 2 : W - lw - m;
      const py = rw === 0 ? m : rw === 1 ? (H - lh) / 2 : H - lh - m;
      ctx.translate(px + lw / 2, py + lh / 2);
      ctx.rotate(rot);
      ctx.drawImage(logo.img, -lw / 2, -lh / 2, lw, lh);
      const bw = Math.abs(lw * Math.cos(rot)) + Math.abs(lh * Math.sin(rot));
      const bh = Math.abs(lw * Math.sin(rot)) + Math.abs(lh * Math.cos(rot));
      rect = { x: px + lw / 2 - bw / 2, y: py + lh / 2 - bh / 2, w: bw, h: bh };
    }
    ctx.restore();
    return rect;
  }

  // ---------- Data e luogo ----------
  function overlap(a, b) {
    const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    return w > 0 && h > 0 ? w * h : 0;
  }
  function grow(r, p) {
    return { x: r.x - p, y: r.y - p, w: r.w + 2 * p, h: r.h + 2 * p };
  }

  // Scrive il testo nell'angolo più "tranquillo" della foto (poca variazione di luminosità),
  // evitando il logo, con colore chiaro/scuro scelto in base allo sfondo.
  function drawInfo(ctx, W, H, lines, s, logoRect, stats) {
    if (!lines || !lines.length) return;
    const base = Math.min(W, H);
    let fs = Math.max(9, base * (s.infoSize / 100));

    ctx.save();
    ctx.font = `600 ${fs}px ${FONT}`;
    let tw = Math.max.apply(
      null,
      lines.map((l) => {
        return ctx.measureText(l).width;
      }),
    );
    if (tw > W * 0.9) {
      fs = (fs * (W * 0.9)) / tw;
      ctx.font = `600 ${fs}px ${FONT}`;
      tw = Math.max.apply(
        null,
        lines.map((l) => {
          return ctx.measureText(l).width;
        }),
      );
    }
    const lh = fs * 1.3,
      th = lh * lines.length;
    const pad = Math.max(fs * 0.8, base * 0.02);

    const cand = {
      tl: { x: pad, y: pad, align: "left" },
      tc: { x: W / 2, y: pad, align: "center" },
      tr: { x: W - pad, y: pad, align: "right" },
      bl: { x: pad, y: H - pad - th, align: "left" },
      bc: { x: W / 2, y: H - pad - th, align: "center" },
      br: { x: W - pad, y: H - pad - th, align: "right" },
    };
    function rectOf(c) {
      const x0 =
        c.align === "left"
          ? c.x
          : c.align === "center"
            ? c.x - tw / 2
            : c.x - tw;
      return { x: x0, y: c.y, w: tw, h: th };
    }

    let key = s.infoPosition;
    if (!cand[key]) {
      let best = "br",
        bestScore = Infinity;
      ANCHORS.forEach((k) => {
        const r = rectOf(cand[k]);
        let score =
          (stats && stats[k] ? stats[k].sd : 0.2) +
          (k === "tc" || k === "bc" ? 0.04 : 0);
        if (logoRect) {
          const ov = overlap(r, grow(logoRect, pad * 0.6));
          if (ov > 0) score += 10 + ov / (r.w * r.h);
        }
        if (score < bestScore) {
          bestScore = score;
          best = k;
        }
      });
      key = best;
    }

    const c = cand[key];
    const lum = stats && stats[key] ? stats[key].lum : 0.4;
    const lightBg = lum > 0.58;

    ctx.globalAlpha = LS.utils.clamp(s.infoOpacity / 100, 0, 1);
    ctx.textAlign = c.align;
    ctx.textBaseline = "top";
    ctx.lineJoin = "round";
    ctx.lineWidth = fs * 0.2;
    ctx.strokeStyle = lightBg ? "rgba(255,255,255,.7)" : "rgba(0,0,0,.65)";
    ctx.fillStyle = lightBg ? "#14161d" : "#ffffff";
    lines.forEach((l, i) => {
      const y = c.y + i * lh + (lh - fs) / 2;
      ctx.strokeText(l, c.x, y);
      ctx.fillText(l, c.x, y);
    });
    ctx.restore();
  }

  // Luminosità media e variazione nelle 6 zone dove può andare il testo.
  function analyze(canvas) {
    const W = canvas.width,
      H = canvas.height,
      out = {};
    const rw = Math.max(8, Math.round(W * 0.34)),
      rh = Math.max(8, Math.round(H * 0.14));
    const pos = {
      tl: [0, 0],
      tc: [(W - rw) / 2, 0],
      tr: [W - rw, 0],
      bl: [0, H - rh],
      bc: [(W - rw) / 2, H - rh],
      br: [W - rw, H - rh],
    };
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ANCHORS.forEach((k) => {
      let d;
      try {
        d = ctx.getImageData(
          Math.round(pos[k][0]),
          Math.round(pos[k][1]),
          rw,
          rh,
        ).data;
      } catch (e) {
        out[k] = { lum: 0.5, sd: 0.2 };
        return;
      }
      let sum = 0,
        sum2 = 0,
        n = 0;
      for (let i = 0; i < d.length; i += 4) {
        const l = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
        sum += l;
        sum2 += l * l;
        n++;
      }
      const mean = sum / n;
      out[k] = {
        lum: mean,
        sd: Math.sqrt(Math.max(0, sum2 / n - mean * mean)),
      };
    });
    return out;
  }

  // ---------- API ----------
  // opts: { fill, info: { lines, stats } }
  function render(ctx, source, logo, s, W, H, opts = {}) {
    if (opts.fill) {
      ctx.fillStyle = opts.fill;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, W, H);
    const logoRect =
      logo && s.logoEnabled !== false ? drawLogo(ctx, logo, s, W, H) : null;
    if (opts.info)
      drawInfo(ctx, W, H, opts.info.lines, s, logoRect, opts.info.stats);
  }

  function makeThumb(img, w, h, max = 640) {
    const scale = Math.min(1, max / Math.max(w, h));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w * scale));
    c.height = Math.max(1, Math.round(h * scale));
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c;
  }

  LS.watermark = { render, makeThumb, analyze };
})(window);
