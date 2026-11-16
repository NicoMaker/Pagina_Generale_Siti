(() => {
  'use strict';
  const LS = window.LS;

  class LSToast extends LS.Element {
    render() {
      this.innerHTML = '<div class="toasts" aria-live="polite"></div>';
    }
    mounted() {
      this.on(document, 'ls:toast', this.show.bind(this));
    }
    show(e) {
      const d = e.detail;
      const box = this.$('.toasts');
      const t = document.createElement('div');
      t.className = `toast toast--${d.type}`;
      t.textContent = d.message;
      box.appendChild(t);
      requestAnimationFrame(() => { t.classList.add('is-in'); });
      setTimeout(() => {
        t.classList.remove('is-in');
        setTimeout(() => { t.remove(); }, 300);
      }, d.type === 'error' ? 6000 : 4000);
    }
  }
  customElements.define('ls-toast', LSToast);
})();
