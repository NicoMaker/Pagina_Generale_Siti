(() => {
  'use strict';
  const LS = window.LS;
  const MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const MOD = MAC ? '⌘' : 'Ctrl', ALT = MAC ? '⌥' : 'Alt';

  // Elenco mostrato nella guida (la logica vera è in onKey).
  const GROUPS = [
    ['Caricare', [
      [['O'], 'Scegli immagini'], [['Z'], 'Scegli uno ZIP'], [['F'], 'Scegli una cartella'],
      [[MOD, 'V'], 'Incolla immagini'], [['L'], 'Carica il logo'], [['Shift', 'L'], 'Logo di esempio']]],
    ['Logo e testo', [
      [['1', '…', '9'], 'Posizione del logo (come la griglia)'], [['T'], 'Mosaico on/off'], [['S'], 'Ombra on/off'],
      [['+', '−'], 'Dimensione del logo'], [[',', '.'], 'Opacità del logo'], [['Q', 'E'], 'Ruota a sinistra / destra'],
      [['B'], 'Logo on/off'], [['D'], 'Data on/off'], [['G'], 'Luogo on/off'], [['Shift', 'R'], 'Ripristina le impostazioni']]],
    ['Foto', [
      [['←', '↑', '↓', '→'], 'Muoviti tra le foto'], [['Invio'], 'Apri l’anteprima'], [['X'], 'Seleziona / deseleziona'],
      [['A'], 'Seleziona tutte'], [['Esc'], 'Deseleziona'], [['Canc'], 'Rimuovi (selezionate o in evidenza)'],
      [['Shift', 'Canc'], 'Svuota tutto']]],
    ['Anteprima', [
      [['←', '→'], 'Foto precedente / successiva'], [['C'], 'Mostra l’originale'], [['D'], 'Scarica questa foto'], [['Esc'], 'Chiudi']]],
    ['Esportare', [
      [[MOD, 'S'], 'Scarica tutto (ZIP)'], [[MOD, 'Shift', 'S'], 'Scarica ZIP'], [[MOD, ALT, 'S'], 'Scarica immagini singole']]],
    ['Generale', [
      [['M'], 'Tema chiaro / scuro'], [['P'], 'Pannello impostazioni (telefono)'], [['?'], 'Questa guida']]]
  ];

  function isTyping(t) {
    if (!t || !t.closest) return false;
    if (t.isContentEditable) return true;
    const el = t.closest('input,textarea,select');
    if (!el) return false;
    if (el.tagName !== 'INPUT') return true;
    return !/^(checkbox|radio|range|button|file|color)$/.test(el.type);
  }
  function click(sel) { const el = document.querySelector(sel); if (el) el.click(); }
  function adjust(key, delta, min, max) {
    const v = Math.min(max, Math.max(min, Number(LS.store.state.settings[key]) + delta));
    LS.store.updateSettings(Object.fromEntries([[key, v]]));
  }
  function toggle(key) { LS.store.updateSettings(Object.fromEntries([[key, !LS.store.state.settings[key]]])); }
  function exportVia(kind) {
    const btn = document.querySelector(`ls-export-bar [data-${kind}]`);
    const bar = document.querySelector('ls-export-bar .bar');
    if (!btn || bar.hidden) { LS.toast('Aggiungi prima qualche foto.', 'info'); return; }
    if (btn.disabled) {
      LS.toast(LS.store.state.busy ? 'C’è già un’operazione in corso.' : 'Carica un logo o attiva data e luogo per poter scaricare.', 'info');
      return;
    }
    btn.click();
  }
  function navigate(key, e) {
    const tiles = Array.prototype.slice.call(document.querySelectorAll('ls-card [data-open]'));
    const a = document.activeElement, i = tiles.indexOf(a);
    if (!tiles.length || (i < 0 && a !== document.body)) return false;
    let cols = 1;
    const top0 = tiles[0].getBoundingClientRect().top;
    while (cols < tiles.length && Math.abs(tiles[cols].getBoundingClientRect().top - top0) < 4) cols++;
    const n = i < 0 ? 0 : key === 'ArrowRight' ? i + 1 : key === 'ArrowLeft' ? i - 1 : key === 'ArrowDown' ? i + cols : i - cols;
    tiles[Math.max(0, Math.min(tiles.length - 1, n))].focus();
    e.preventDefault();
    return true;
  }

  class LSShortcuts extends LS.Element {
    render() {
      const groups = GROUPS.map((g, gi) => {
        return `<section class="guide__group" style="--g:${gi}"><h3>${g[0]}</h3>${g[1].map(r => {
  return `<div class="guide__row"><span class="guide__keys">${r[0].map(k => { return k === '…' ? '<span>…</span>' : `<kbd>${k}</kbd>`; }).join('')}</span><span class="guide__what">${r[1]}</span></div>`;
}).join('')}</section>`;
      }).join('');
      this.innerHTML =
        `<dialog class="modal modal--guide" aria-label="Scorciatoie da tastiera"><div class="modal__head"><div class="modal__title"><strong>Scorciatoie da tastiera</strong><span>Premi <kbd>?</kbd> in qualsiasi momento per riaprire questa guida</span></div><button class="btn btn--ghost btn--sm btn--icon" type="button" data-close aria-label="Chiudi"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="guide">${groups}</div></dialog>`;
      const dlg = this.$('dialog');
      this.$('[data-close]').addEventListener('click', () => { dlg.close(); });
      dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    }

    mounted() {
      const self = this;
      this.on(document, 'click', e => { if (e.target.closest && e.target.closest('[data-shortcuts]')) self.open(); });
      this.on(document, 'keydown', e => { self.onKey(e); });
      // Un solo suggerimento, solo su dispositivi con tastiera e mouse.
      try {
        if (matchMedia('(hover: hover) and (pointer: fine)').matches && !localStorage.getItem('ls-kbd-hint')) {
          setTimeout(() => {
            LS.toast('Suggerimento: premi ? per vedere le scorciatoie da tastiera.', 'info');
            localStorage.setItem('ls-kbd-hint', '1');
          }, 2800);
        }
      } catch (err) {}
    }

    open() { const d = this.$('dialog'); if (!d.open) d.showModal(); }

    onKey(e) {
      if (e.defaultPrevented || e.isComposing) return;
      const k = e.key, low = k.length === 1 ? k.toLowerCase() : k, dlg = this.$('dialog');
      const store = LS.store, s = store.state.settings, mod = e.ctrlKey || e.metaKey;

      if (dlg.open) { if (low === '?' || low === 'h') { dlg.close(); e.preventDefault(); } return; }
      const typing = isTyping(e.target);

      if (mod) {
        if (low === 's') { e.preventDefault(); exportVia(e.altKey ? 'images' : e.shiftKey ? 'zip' : 'all'); }
        else if (low === 'a' && !typing && store.state.images.length) { e.preventDefault(); store.selectAll(true); }
        return;
      }
      if (e.altKey || typing) return;

      const modal = document.querySelector('ls-preview-modal dialog');
      if (modal && modal.open) {
        if (low === 'c') { click('ls-preview-modal [data-compare]'); e.preventDefault(); }
        else if (low === 'd') { click('ls-preview-modal [data-dl]'); e.preventDefault(); }
        return;
      }

      let handled = true;
      if (low === '?' || low === 'h') this.open();
      else if (low === 'o') click('[data-in-images]');
      else if (low === 'z') click('[data-in-zip]');
      else if (low === 'f') click('[data-in-folder]');
      else if (k === 'L') click('[data-sample]');
      else if (low === 'l') click('ls-logo-panel [data-file]');
      else if (/^[1-9]$/.test(k)) { if (!s.tile) store.updateSettings({ position: Number(k) - 1 }); }
      else if (low === 't') toggle('tile');
      else if (low === 's') toggle('shadow');
      else if (low === 'b') toggle('logoEnabled');
      else if (low === 'd') toggle('infoDate');
      else if (low === 'g') toggle('infoPlace');
      else if (low === '+' || low === '=') adjust('size', 2, 5, 60);
      else if (low === '-') adjust('size', -2, 5, 60);
      else if (low === '.') adjust('opacity', 5, 10, 100);
      else if (low === ',') adjust('opacity', -5, 10, 100);
      else if (low === 'e') adjust('rotation', 5, -45, 45);
      else if (low === 'q') adjust('rotation', -5, -45, 45);
      else if (k === 'R') store.resetSettings();
      else if (low === 'm') click('[data-theme-toggle]');
      else if (low === 'p') { const b = document.querySelector('[data-settings-toggle]'); if (b && b.offsetParent) b.click(); else handled = false; }
      else if (low === 'a') { const all = store.state.images; if (all.length) store.selectAll(store.selected().length !== all.length); else handled = false; }
      else if (low === 'x') {
        const c = document.activeElement.closest && document.activeElement.closest('ls-card');
        if (c) store.toggleSelect(c.item.id, !c.item.selected); else handled = false;
      }
      else if (k === 'Escape') { if (store.selected().length) store.selectAll(false); handled = false; }
      else if (k === 'Delete' || k === 'Backspace') {
        const card = document.activeElement.closest && document.activeElement.closest('ls-card');
        if (e.shiftKey) { if (store.state.images.length && confirm('Svuotare tutte le foto?')) store.clearImages(); }
        else if (store.selected().length) store.selected().slice().forEach(it => { store.removeImage(it.id); });
        else if (card) store.removeImage(card.item.id);
        else handled = false;
      }
      else if (/^Arrow(Left|Right|Up|Down)$/.test(k)) handled = navigate(k, e) && false;
      else handled = false;
      if (handled) e.preventDefault();
    }
  }
  customElements.define('ls-shortcuts', LSShortcuts);
})();
