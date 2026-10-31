// Dati e logica: nessun codice di interfaccia qui.
const Store = {
  KEY: 'serie-habits-v1',
  DAYS: 14,
  load() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]') || []; }
    catch (e) { return []; }
  },
  save(habits) {
    try { localStorage.setItem(this.KEY, JSON.stringify(habits)); } catch (e) {}
  },
  ds(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },
  back(n) {
    const d = new Date(); d.setHours(12); d.setDate(d.getDate() - n); return d;
  },
  streak(h) {
    let n = 0, i = this.done(h, 0) ? 0 : 1;
    while (this.done(h, i)) { n++; i++; }
    return n;
  },
  done(h, daysAgo) { return h.done.includes(this.ds(this.back(daysAgo))); }
};
