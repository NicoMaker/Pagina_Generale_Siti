(() => {
  "use strict";
  const LS = window.LS;

  function slider(key, label, min, max, step, unit) {
    return `<div class="field" data-field="${key}"><div class="field__row"><label for="s-${key}">${label}</label><output data-out="${key}"></output></div><input id="s-${key}" type="range" min="${min}" max="${max}" step="${step}" data-key="${key}" data-unit="${unit || ""}"></div>`;
  }
  function toggle(key, label, hint) {
    return `<div class="field" data-field="${key}"><label class="switch"><input type="checkbox" data-key="${key}"><span class="switch__track" aria-hidden="true"></span><span class="switch__label">${label}${hint ? `<small>${hint}</small>` : ""}</span></label></div>`;
  }
  function select(key, label, options) {
    return `<div class="field" data-field="${key}"><label for="s-${key}">${label}</label><select id="s-${key}" data-key="${key}">${options
      .map((o) => {
        return `<option value="${o[0]}">${o[1]}</option>`;
      })
      .join("")}</select></div>`;
  }

  const ICONS = {
    logoEnabled:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M4 5h16v14H4zM13 14h5v3h-5z"/></svg>',
    infoDate:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/></svg>',
    infoPlace:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/></svg>',
  };
  const choice = (key, label) =>
    `<label class="choice__item"><input type="checkbox" data-key="${key}"><span class="choice__box">${ICONS[key]}${label}</span></label>`;
  // Tutte le combinazioni possibili: [nome, logo, data, luogo]
  const PRESETS = [
    ["Tutto", 1, 1, 1],
    ["Solo logo", 1, 0, 0],
    ["Solo data", 0, 1, 0],
    ["Solo luogo", 0, 0, 1],
    ["Data + luogo", 0, 1, 1],
    ["Logo + data", 1, 1, 0],
    ["Logo + luogo", 1, 0, 1],
  ];

  const POS_LABELS = [
    "Alto a sinistra",
    "Alto al centro",
    "Alto a destra",
    "Al centro a sinistra",
    "Centro",
    "Al centro a destra",
    "Basso a sinistra",
    "Basso al centro",
    "Basso a destra",
  ];

  // Quando mostrare ogni campo.
  const RULES = {
    margin: function (s) {
      return !s.tile;
    },
    gap: function (s) {
      return s.tile;
    },
    quality: function (s) {
      return s.format !== "png";
    },
    infoTime: function (s) {
      return s.infoDate;
    },
    infoLookup: function (s) {
      return s.infoPlace;
    },
    infoPosition: function (s) {
      return s.infoEnabled;
    },
    infoSize: function (s) {
      return s.infoEnabled;
    },
    infoOpacity: function (s) {
      return s.infoEnabled;
    },
  };

  class LSSettingsPanel extends LS.Element {
    render() {
      const grid = POS_LABELS.map((l, i) => {
        return `<button type="button" class="pos" role="radio" data-pos="${i}" aria-label="${l}" title="${l}"><span></span></button>`;
      }).join("");

      this.innerHTML = `<section class="card"><div class="card__head"><h2>Cosa mettere sulle foto</h2></div><div class="choice" role="group" aria-label="Elementi da scrivere sulle foto">${choice("logoEnabled", "Logo")}${choice("infoDate", "Data")}${choice("infoPlace", "Luogo")}</div>${toggle("infoTime", "Aggiungi anche l’ora")}<div class="presets" role="group" aria-label="Combinazioni rapide">${PRESETS.map((p) => `<button type="button" class="chip" data-preset="${p.slice(1).join(",")}">${p[0]}</button>`).join("")}</div><small data-empty-hint hidden>Scegli almeno una cosa da mettere sulle foto.</small><small>Data e luogo vengono letti dai dati EXIF: le foto senza EXIF non avranno testo.</small></section><section class="card" data-section="logo"><div class="card__head"><h2>Posizione del logo</h2></div><div class="field" data-field="position"><div class="pos-grid" role="radiogroup" aria-label="Posizione del logo">${grid}</div></div>${toggle("tile", "Mosaico su tutta l’immagine", "Ripete il logo in diagonale, utile come filigrana")}${slider("size", "Dimensione", 5, 60, 1, "%")}${slider("opacity", "Opacità", 10, 100, 1, "%")}${slider("margin", "Distanza dal bordo", 0, 15, 0.5, "%")}${slider("gap", "Spazio tra i loghi", 0, 300, 5, "%")}${slider("rotation", "Rotazione", -45, 45, 1, "°")}${toggle("shadow", "Ombra morbida", "Aiuta su sfondi chiari o molto vari")}</section><section class="card" data-section="info"><div class="card__head"><h2>Testo su data e luogo</h2></div>${toggle("infoLookup", "Cerca il nome del luogo online", "Invia le coordinate a OpenStreetMap. Se spento scrive le coordinate.")}${select(
        "infoPosition",
        "Dove scriverla",
        [
          ["auto", "Automatica (consigliata)"],
          ["tl", "Alto a sinistra"],
          ["tc", "Alto al centro"],
          ["tr", "Alto a destra"],
          ["bl", "Basso a sinistra"],
          ["bc", "Basso al centro"],
          ["br", "Basso a destra"],
        ],
      )}${slider("infoSize", "Dimensione del testo", 0.8, 8, 0.1, "%")}${slider("infoOpacity", "Opacità del testo", 30, 100, 1, "%")}</section><section class="card"><div class="card__head"><h2>Esportazione</h2><button class="link" type="button" data-reset>Ripristina tutto</button></div>${select(
        "format",
        "Formato",
        [
          ["original", "Come l’originale"],
          ["png", "PNG"],
          ["jpeg", "JPG"],
          ["webp", "WebP"],
        ],
      )}${slider("quality", "Qualità", 50, 100, 1, "%")}<div class="field" data-field="suffix"><label for="s-suffix">Aggiunta al nome del file</label><input id="s-suffix" type="text" class="input" data-key="suffix" maxlength="24" placeholder="-logo" autocomplete="off"></div></section>`;

      this.addEventListener("input", (e) => {
        const t = e.target,
          key = t.dataset && t.dataset.key;
        if (!key) return;
        let v;
        if (t.type === "checkbox") v = t.checked;
        else if (t.type === "range") v = Number(t.value);
        else if (key === "suffix") v = t.value.replace(/[\\/:*?"<>|]/g, "");
        else v = t.value;
        LS.store.updateSettings(Object.fromEntries([[key, v]]));
      });
      this.addEventListener("click", (e) => {
        const pos = e.target.closest && e.target.closest("[data-pos]");
        if (pos && !LS.store.state.settings.tile)
          LS.store.updateSettings({ position: Number(pos.dataset.pos) });
        if (e.target.closest && e.target.closest("[data-reset]"))
          LS.store.resetSettings();
        const preset = e.target.closest && e.target.closest("[data-preset]");
        if (preset) {
          const [logo, date, place] = preset.dataset.preset
            .split(",")
            .map((x) => x === "1");
          LS.store.updateSettings({
            logoEnabled: logo,
            infoDate: date,
            infoPlace: place,
          });
        }
      });
    }

    mounted() {
      this.listen("settings", this.sync);
      this.sync(LS.store.state.settings);
    }

    sync(s) {
      this.$$("[data-key]").forEach((el) => {
        const v = s[el.dataset.key];
        if (el.type === "checkbox") {
          if (el.checked !== !!v) el.checked = !!v;
        } else if (
          String(el.value) !== String(v) &&
          document.activeElement !== el
        )
          el.value = v;
      });
      this.$$("[data-out]").forEach((o) => {
        const key = o.dataset.out;
        const input =
          o.parentElement.parentElement.querySelector("input[type=range]");
        o.textContent = s[key] + (input ? input.dataset.unit : "");
      });
      this.$$("[data-pos]").forEach((b) => {
        b.setAttribute(
          "aria-checked",
          String(Number(b.dataset.pos) === s.position && !s.tile),
        );
      });
      this.$('[data-field="position"]').classList.toggle(
        "is-disabled",
        !!s.tile,
      );
      this.$$("[data-preset]").forEach((b) => {
        const [l, d, p] = b.dataset.preset.split(",").map((x) => x === "1");
        b.setAttribute(
          "aria-pressed",
          String(
            l === !!s.logoEnabled && d === !!s.infoDate && p === !!s.infoPlace,
          ),
        );
      });
      this.$('[data-section="logo"]').hidden = !s.logoEnabled;
      this.$('[data-section="info"]').hidden = !s.infoEnabled;
      this.$("[data-empty-hint]").hidden = !!(s.logoEnabled || s.infoEnabled);
      const lp = document.querySelector("ls-logo-panel");
      if (lp) lp.classList.toggle("is-off", !s.logoEnabled);
      Object.keys(RULES).forEach(function (key) {
        const f = this.$(`[data-field="${key}"]`);
        if (f) f.hidden = !RULES[key](s);
      }, this);
    }
  }
  customElements.define("ls-settings-panel", LSSettingsPanel);
})();
