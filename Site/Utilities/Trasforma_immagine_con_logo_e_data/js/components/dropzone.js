(() => {
  "use strict";
  const LS = window.LS;

  function hasFiles(e) {
    return (
      e.dataTransfer &&
      Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") !== -1
    );
  }

  class LSDropzone extends LS.Element {
    render() {
      this.innerHTML =
        '<section class="drop">' +
        '<svg class="drop__art" viewBox="0 0 240 160" aria-hidden="true">' +
        '<defs><linearGradient id="da" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4f7b"/><stop offset="1" stop-color="#ffa94d"/></linearGradient></defs>' +
        '<rect x="34" y="30" width="104" height="78" rx="12" transform="rotate(-9 86 69)" fill="none" stroke="currentColor" stroke-width="2" opacity=".5"/>' +
        '<rect x="96" y="26" width="104" height="78" rx="12" transform="rotate(8 148 65)" fill="none" stroke="currentColor" stroke-width="2" opacity=".75"/>' +
        '<rect x="62" y="40" width="116" height="86" rx="14" fill="var(--surface-solid)" stroke="currentColor" stroke-width="2"/>' +
        '<circle cx="88" cy="66" r="8" fill="var(--accent-2)"/>' +
        '<path d="M63 118l29-30 22 20 18-16 45 36a14 14 0 01-14 12H77a14 14 0 01-14-12z" fill="var(--accent)" opacity=".3"/>' +
        '<rect x="136" y="104" width="54" height="34" rx="10" fill="url(#da)"/>' +
        '<path d="M150 126l8-12 8 12z" fill="#fff" opacity=".95"/><circle cx="176" cy="122" r="4" fill="#fff"/>' +
        "</svg>" +
        '<div class="drop__icon" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" width="30" height="30"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M4 16l4-4 3 3 4-5 5 6M4 5h16v14H4zM9 9.5a1 1 0 11-2 0 1 1 0 012 0z"/></svg>' +
        "</div>" +
        '<div class="drop__text">' +
        "<h2>Trascina qui le tue foto</h2>" +
        "<p>Una o più immagini, una cartella intera oppure uno ZIP pieno di foto.</p>" +
        "</div>" +
        '<div class="row row--center">' +
        '<button class="btn btn--primary" type="button" data-images>Scegli immagini</button>' +
        '<button class="btn" type="button" data-zip>Scegli uno ZIP</button>' +
        '<button class="btn btn--ghost" type="button" data-folder>Scegli una cartella</button>' +
        "</div>" +
        '<small class="drop__note">JPG · PNG · WebP · GIF · BMP · AVIF</small>' +
        '<small class="drop__note drop__tip">Su telefono, per leggere il luogo, scegli le foto da File / Sfoglia (non dalla galleria).</small>' +
        '<div class="drop__loading" role="status" aria-live="polite"><span class="drop__spinner"></span>' +
        "<div><strong data-load-label>Carico le immagini…</strong><br><small data-load-count></small></div><i><b data-load-bar></b></i></div>" +
        '<input type="file" hidden multiple accept="image/*,application/octet-stream" data-in-images>' +
        '<input type="file" hidden multiple accept=".zip,application/zip,application/x-zip-compressed" data-in-zip>' +
        '<input type="file" hidden webkitdirectory data-in-folder>' +
        "</section>" +
        '<div class="drop-overlay" aria-hidden="true"><span>Rilascia per aggiungere le foto</span></div>';

      const bind = (btn, inp) => {
        const input = this.$(inp);
        this.$(btn).addEventListener("click", () => {
          input.click();
        });
        input.addEventListener("change", () => {
          LS.actions.addFiles(LS.loader.fromFileList(input.files));
          input.value = "";
        });
      };
      bind("[data-images]", "[data-in-images]");
      bind("[data-zip]", "[data-in-zip]");
      bind("[data-folder]", "[data-in-folder]");
    }

    mounted() {
      let depth = 0;
      const body = document.body;
      const reset = () => {
        depth = 0;
        body.classList.remove("is-dragging");
      };

      this.on(window, "dragenter", (e) => {
        if (!hasFiles(e)) return;
        depth++;
        body.classList.add("is-dragging");
      });
      this.on(window, "dragleave", (e) => {
        if (!hasFiles(e)) return;
        depth = Math.max(0, depth - 1);
        if (!depth) body.classList.remove("is-dragging");
      });
      this.on(window, "dragover", (e) => {
        if (hasFiles(e)) e.preventDefault();
      });
      this.on(window, "drop", (e) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        reset();
        // Il rilascio sul riquadro del logo è gestito dal pannello del logo.
        if (e.target.closest && e.target.closest("[data-logo-drop]")) return;
        LS.loader.fromDataTransfer(e.dataTransfer).then(LS.actions.addFiles);
      });
      this.on(window, "blur", reset);
      this.on(window, "paste", (e) => {
        if (/^(input|textarea|select)$/i.test(e.target.tagName || "")) return;
        const files = Array.prototype.filter.call(
          (e.clipboardData && e.clipboardData.files) || [],
          (f) => {
            return /^image\//.test(f.type);
          },
        );
        if (!files.length) return;
        const dt = new DataTransfer();
        files.forEach((f) => {
          dt.items.add(f);
        });
        LS.actions.addFiles(LS.loader.fromFileList(dt.files));
        LS.toast(
          files.length === 1
            ? "Immagine incollata"
            : `${files.length} immagini incollate`,
          "success",
        );
      });

      this.listen("images", this.sync);
      this.listen("busy", this.syncBusy);
      this.sync();
    }

    syncBusy(busy) {
      const on = !!busy && /^Carico/.test(busy.label);
      this.$(".drop").classList.toggle("is-busy", on);
      if (!on) return;
      this.$("[data-load-label]").textContent = `${busy.label}…`;
      this.$("[data-load-count]").textContent = busy.total
        ? `${busy.done} di ${busy.total}`
        : "";
      this.$("[data-load-bar]").style.width = busy.total
        ? `${Math.round((busy.done / busy.total) * 100)}%`
        : "35%";
    }

    sync() {
      this.$(".drop").classList.toggle(
        "is-compact",
        LS.store.state.images.length > 0,
      );
    }
  }
  customElements.define("ls-dropzone", LSDropzone);
})();
