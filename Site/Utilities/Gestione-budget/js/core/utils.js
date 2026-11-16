'use strict';

/* ================= Utility ================= */
const $ = id => document.getElementById(id);
const eur = new Intl.NumberFormat('it-IT', { style:'currency', currency:'EUR' });
const fmt = n => eur.format(n || 0);
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2,'0');
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const monthLabel = ym => { const [y,m] = ym.split('-'); return `${MONTHS_FULL[+m-1]} ${y}`; };
const dmy = d => d.split('-').reverse().join('/');
const sum = arr => arr.reduce((a,t)=>a+t.amount,0);
const byType = (arr,type) => arr.filter(t => t.type === type);
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const need = (obj,name) => { if (typeof obj === 'undefined') { toast(`Libreria ${name} non caricata (serve internet)`); return false; } return true; };
function ask(msg, okLabel){
  return new Promise(res => {
    $('mText').textContent = msg; $('mYes').textContent = okLabel || 'Elimina'; $('modal').hidden = false; $('mYes').focus();
    const done = v => { $('modal').hidden = true; $('mYes').onclick = $('mNo').onclick = $('modal').onclick = null; document.removeEventListener('keydown', key); res(v); };
    const key = e => { if (e.key === 'Escape') done(false); };
    document.addEventListener('keydown', key);
    $('mYes').onclick = () => done(true); $('mNo').onclick = () => done(false);
    $('modal').onclick = e => { if (e.target.id === 'modal') done(false); };
  });
}
let toastT;
function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2800); }
function download(blob, name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),1500); }

