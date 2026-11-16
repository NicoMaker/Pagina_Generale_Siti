((global) => {
  "use strict";
  const LS = (global.LS = global.LS || {});

  const IMAGE_EXT = ["png", "jpg", "jpeg", "webp", "gif", "bmp", "avif"];
  const MIME = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    bmp: "image/bmp",
    avif: "image/avif",
  };

  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }
  function extOf(name) {
    const m = /\.([a-z0-9]+)$/i.exec(name || "");
    return m ? m[1].toLowerCase() : "";
  }
  function baseName(name) {
    return String(name).replace(/\.[^.]+$/, "");
  }
  function fileOf(path) {
    return String(path).split("/").pop();
  }
  function dirOf(path) {
    const i = String(path).lastIndexOf("/");
    return i < 0 ? "" : path.slice(0, i + 1);
  }
  function isImageName(name) {
    return IMAGE_EXT.indexOf(extOf(name)) !== -1;
  }
  function clamp(v, a, b) {
    return Math.min(b, Math.max(a, v));
  }
  function sleep(ms) {
    return new Promise((r) => {
      setTimeout(r, ms);
    });
  }

  function formatBytes(n) {
    if (n < 1024) return `${n} B`;
    const units = ["KB", "MB", "GB"];
    let i = -1;
    do {
      n /= 1024;
      i++;
    } while (n >= 1024 && i < units.length - 1);
    return `${n.toFixed(n < 10 ? 1 : 0)} ${units[i]}`;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);
  }

  function timestamp() {
    const d = new Date(),
      p = (n) => {
        return String(n).padStart(2, "0");
      };
    return `${d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
  }

  // Notifiche: i componenti ascoltano l'evento, il core non dipende dall'interfaccia.
  function toast(message, type) {
    document.dispatchEvent(
      new CustomEvent("ls:toast", {
        detail: { message, type: type || "info" },
      }),
    );
  }

  LS.utils = {
    IMAGE_EXT,
    MIME,
    uid,
    extOf,
    baseName,
    fileOf,
    dirOf,
    isImageName,
    clamp,
    sleep,
    formatBytes,
    escapeHtml,
    downloadBlob,
    timestamp,
  };
  LS.toast = toast;
})(window);
