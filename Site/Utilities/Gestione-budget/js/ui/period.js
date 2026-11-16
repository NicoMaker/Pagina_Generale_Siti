'use strict';

/* ================= Periodo e pagina ================= */
let cur = todayISO().slice(0,7);
let mode = 'month';           // day | month | year | all
let curDay = todayISO();
const mm = () => mode==='month' || mode==='day';
let page = 'dash';
const per = () => mode==='day' ? curDay : mode==='all' ? '' : mode==='year' ? cur.slice(0,4) : cur;
const perLabel = () => mode==='day' ? dayLabel(curDay) : mode==='all' ? 'Tutti i dati' : mode==='year' ? `Anno ${cur.slice(0,4)}` : monthLabel(cur);
const inPer = () => state.tx.filter(t => t.date.startsWith(per()));
const inKey = k => state.tx.filter(t => t.date.startsWith(k));
const budFor = k => Object.entries(state.budgets).filter(([q]) => q.startsWith(k)).reduce((a,[,v]) => a+v, 0);
const W = () => ({ day: curDay===todayISO() ? 'di oggi' : 'del giorno', month:'del mese', year:"dell'anno", all:'totali' })[mode];

function syncInputs(){ $('day').value = curDay; $('month').value = cur; $('year').value = cur.slice(0,4); }
function setCur(ym){ if (!ym) return; cur = ym; if (!curDay.startsWith(ym)) curDay = ym===todayISO().slice(0,7) ? todayISO() : ym+'-01'; syncInputs(); render(); }
function setMode(m){
  mode = m;
  $('mDay').classList.toggle('active', m==='day');
  $('mMonth').classList.toggle('active', m==='month');
  $('mYear').classList.toggle('active', m==='year');
  $('mAll').classList.toggle('active', m==='all');
  render();
}
function updateBar(){
  const m = page==='tot' ? 'month' : mode;
  $('day').style.display = m==='day' ? '' : 'none';
  $('month').style.display = m==='month' ? '' : 'none';
  $('year').style.display  = m==='year'  ? '' : 'none';
  ['prevM','nextM','todayM'].forEach(id => $(id).style.display = m==='all' ? 'none' : '');
  document.querySelector('#periodBar .seg').style.display = page==='tot' ? 'none' : '';
}
const prevMonth = ym => { let [y,m] = ym.split('-').map(Number); m--; if (m<1) { m=12; y--; } return `${y}-${pad(m)}`; };
function shift(d){ if (mode==='day' && page!=='tot') { const t = new Date(curDay+'T12:00:00'); t.setDate(t.getDate()+d); curDay = `${t.getFullYear()}-${pad(t.getMonth()+1)}-${pad(t.getDate())}`; cur = curDay.slice(0,7); syncInputs(); return render(); }
  let [y,m] = cur.split('-').map(Number); m += d*(mode==='year' && page!=='tot' ? 12 : 1); while(m>12){m-=12;y++} while(m<1){m+=12;y--} setCur(`${y}-${pad(m)}`); }
$('mDay').onclick = () => { if (!curDay.startsWith(cur)) curDay = cur===todayISO().slice(0,7) ? todayISO() : cur+'-01'; syncInputs(); setMode('day'); };
$('day').onchange = e => { if (!e.target.value) return; curDay = e.target.value; cur = curDay.slice(0,7); syncInputs(); render(); };
$('mMonth').onclick = () => setMode('month');
$('mYear').onclick  = () => setMode('year');
$('mAll').onclick   = () => setMode('all');
$('month').onchange = e => setCur(e.target.value);
$('year').onchange  = e => { const y = parseInt(e.target.value); if (y>=1900 && y<=2200) setCur(`${y}-${cur.slice(5,7)}`); };
$('prevM').onclick = () => shift(-1);
$('nextM').onclick = () => shift(1);
$('todayM').onclick = () => { curDay = todayISO(); setCur(todayISO().slice(0,7)); };

function go(p){
  page = p;
  document.querySelectorAll('.page').forEach(s => s.classList.toggle('show', s.id === 'p-'+p));
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('active', b.dataset.page === p));
  $('helpBtn').classList.toggle('on', p==='help');
  try { history.replaceState(null,'','#'+p); } catch(e){}
  $('pages').scrollTop = 0;
  render();
}
document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });
$('nav').onclick = e => { const b = e.target.closest('button'); if (b) go(b.dataset.page); };

/* serie temporale in base al periodo: giorni (mese), mesi (anno), anni (totale) */
function series(){
  const y = cur.slice(0,4); let keys, labels, start;
  if (mm()) {
    const [yy,mo] = cur.split('-').map(Number), n = new Date(yy,mo,0).getDate();
    keys = Array.from({length:n}, (_,i) => `${cur}-${pad(i+1)}`); labels = keys.map((_,i) => String(i+1)); start = cur+'-01';
  } else if (mode==='year') {
    keys = Array.from({length:12}, (_,i) => `${y}-${pad(i+1)}`); labels = MONTHS; start = y+'-01';
  } else {
    const ys = state.tx.map(t => +t.date.slice(0,4)); const lo = ys.length ? Math.min(...ys) : +y, hi = ys.length ? Math.max(...ys) : +y;
    keys = []; for (let k=lo;k<=hi;k++) keys.push(String(k)); labels = keys.slice(); start = '0000';
  }
  let run = state.tx.reduce((a,t) => t.date < start ? a + (t.type==='in' ? t.amount : -t.amount) : a, 0);
  return keys.map((k,i) => {
    const m = inKey(k), a = sum(byType(m,'in')), b = sum(byType(m,'out')); run += a-b;
    return { key:k, label:labels[i], a, b, bal:a-b, run:Math.round(run*100)/100 };
  });
}

