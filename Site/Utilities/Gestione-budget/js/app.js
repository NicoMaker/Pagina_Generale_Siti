'use strict';

/* ================= Avvio ================= */
try { document.fonts.load('18px "Material Symbols Rounded"', 'home').then(f => { if (f && f.length) document.documentElement.classList.add('icons'); }); } catch(e){}
{ const seen = new Set(); state.categories = state.categories.filter(c => { const k = catKey(c.name); if (seen.has(k)) return false; seen.add(k); delete c.type; if (!/^[a-z0-9_]+$/.test(c.icon||'')) c.icon = autoIcon(c.name); return true; }); }
if (!state.categories.length) seedCategories();
state.categories.forEach(c => { const i = OLD_PALETTE.indexOf(c.color); if (i >= 0) c.color = PALETTE[i]; });
state.tx.forEach(t => { t.category = ensureCat(t.category, t.type).name; });
save();
applyTheme(); syncInputs(); resetForm(); resetCatForm();
let startPage = 'dash'; try { const h = location.hash.slice(1); if (TITLES[h]) startPage = h; } catch(e){}
go(startPage);
