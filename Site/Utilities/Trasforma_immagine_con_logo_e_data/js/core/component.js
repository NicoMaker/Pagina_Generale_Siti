((global) => {
  "use strict";
  const LS = (global.LS = global.LS || {});

  // Base per tutti i componenti (Custom Elements nel DOM normale, senza build).
  //  render()  -> una sola volta, costruisce il markup e i listener DOM
  //  mounted() -> a ogni inserimento nel DOM, qui ci si iscrive allo store
  class LSElement extends HTMLElement {
    connectedCallback() {
      if (!this._init) {
        this._init = true;
        this.render();
      }
      this._offs = [];
      if (this.mounted) this.mounted();
    }
    disconnectedCallback() {
      (this._offs || []).forEach((off) => {
        off();
      });
      this._offs = [];
    }
    listen(evt, fn) {
      this._offs.push(LS.store.on(evt, fn.bind(this)));
    }
    on(target, evt, fn, opts) {
      target.addEventListener(evt, fn, opts);
      this._offs.push(() => {
        target.removeEventListener(evt, fn, opts);
      });
    }
    $(sel) {
      return this.querySelector(sel);
    }
    $$(sel) {
      return Array.prototype.slice.call(this.querySelectorAll(sel));
    }
  }

  LS.Element = LSElement;
})(window);
