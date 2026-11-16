(() => {
  'use strict';
  const LS = window.LS;

  // Il nome del luogo si cerca in automatico quando servono (nuove foto o impostazioni cambiate).
  LS.store.on('images', LS.geo.autoResolve);
  LS.store.on('settings', LS.geo.autoResolve);

  // Cassetto "Logo e impostazioni" su telefono e tablet.
  const setSheet = open => {
    document.body.classList.toggle('sidebar-open', open);
    const b = document.querySelector('[data-settings-toggle]');
    if (b) b.setAttribute('aria-expanded', String(open));
  };
  document.addEventListener('click', e => {
    if (e.target.closest('[data-settings-toggle]')) setSheet(!document.body.classList.contains('sidebar-open'));
    else if (e.target.closest('[data-sheet-close]')) setSheet(false);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setSheet(false); });
  matchMedia('(min-width: 1021px)').addEventListener('change', m => { if (m.matches) setSheet(false); });

  // Schermata di avvio: resta almeno ~1,2 s, poi svanisce.
  let splash = document.getElementById('splash');
  const hideSplash = () => {
    if (!splash) return;
    splash.classList.add('is-done');
    document.body.classList.add('is-ready');
    const s = splash; splash = null;
    setTimeout(() => { s.remove(); }, 800);
  };
  const go = () => { setTimeout(hideSplash, Math.max(0, 1250 - performance.now())); };
  if (document.readyState === 'complete') go(); else window.addEventListener('load', go);
  setTimeout(hideSplash, 4000);

  // Installabile e utilizzabile offline (serve http/https: con doppio clic su file:// resta tutto come prima).
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // Rete di sicurezza: un errore inatteso non deve lasciare l'interfaccia "occupata".
  window.addEventListener('unhandledrejection', e => {
    console.error(e.reason);
    if (LS.store.state.busy) LS.store.setBusy(null);
    LS.toast('Qualcosa è andato storto. Riprova.', 'error');
  });
})();
