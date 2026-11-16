'use strict';

/* ================= Render generale ================= */
function render(){
  $('pageTitle').textContent = TITLES[page];
  $('pageSub').textContent = (page==='data' || page==='help') ? '' : page==='tot' ? monthLabel(cur) : perLabel();
  $('periodBar').style.display = (page==='data' || page==='help') ? 'none' : '';
  $('welcome').style.display = (page==='dash' && !state.tx.length) ? '' : 'none';
  applyTheme();
  document.querySelectorAll('.amt').forEach(c => c.checked = !!state.showAmounts);
  updateBar();
  ({ dash:renderDash, tx:renderTx, cat:renderCats, tot:renderTot, rep:renderRep, data:renderData, help:()=>{} })[page]();
}

/* riga Mese · Anno · Totale sotto i titoli/indicatori */
function trio(kind){
  const y = cur.slice(0,4);
  const g = a => kind==='in' ? sum(byType(a,'in')) : kind==='out' ? sum(byType(a,'out')) : sum(byType(a,'in')) - sum(byType(a,'out'));
  return `<div class="trio"><span>Oggi <b>${fmt(g(inKey(todayISO())))}</b></span><span>Mese <b>${fmt(g(inKey(cur)))}</b></span><span>Anno <b>${fmt(g(inKey(y)))}</b></span><span>Totale <b>${fmt(g(state.tx))}</b></span></div>`;
}

/* accumulato = quello che ti rimane: saldo di tutte le operazioni fino a una data (entrate − uscite, riportato di mese in mese) */
const accum = end => { const a = state.tx.filter(t => t.date <= end); return sum(byType(a,'in')) - sum(byType(a,'out')); };
const cc = v => v>=0 ? 'in' : 'out';

/* tabella Mese | Anno sempre completa */
function bothHtml(){
  const y = cur.slice(0,4), S = a => ({ a:sum(byType(a,'in')), b:sum(byType(a,'out')) });
  const d = S(inKey(todayISO())), m = S(inKey(cur)), yy = S(inKey(y)), T = S(state.tx), c = v => v>=0 ? 'in' : 'out';
  const sv = x => x.a ? ((x.a-x.b)/x.a*100).toFixed(0)+'%' : '—';
  const cols = [d,m,yy,T], row = (lab, f, cls) => `<tr><td>${lab}</td>${cols.map(x => `<td class="num ${typeof cls==='function'?cls(x):cls}">${f(x)}</td>`).join('')}</tr>`;
  return `<div class="tablewrap" style="max-height:none"><table class="both"><thead><tr><th></th><th class="num">Oggi</th><th class="num">${MONTHS[+cur.slice(5,7)-1]} ${y}</th><th class="num">Anno ${y}</th><th class="num">Totale</th></tr></thead><tbody>
    ${row('Entrate', x => `<b>${fmt(x.a)}</b>`, 'in')}
    ${row('Spese', x => `<b>${fmt(x.b)}</b>`, 'out')}
    ${row('Rimanente', x => `<b>${fmt(x.a-x.b)}</b>`, x => c(x.a-x.b))}
    ${row('Risparmio', sv, '')}
    <tr class="acc"><td>Accumulato</td>${[todayISO(), cur+'-31', y+'-12-31', '9999'].map(e => `<td class="num ${cc(accum(e))}"><b>${fmt(accum(e))}</b></td>`).join('')}</tr></tbody></table></div>`;
}

/* barra: le entrate divise per categoria di spesa, la parte chiara è il rimanente */
function flowBar(arr){
  const inc = sum(byType(arr,'in')), out = sum(byType(arr,'out')), left = inc - out, base = Math.max(inc,out) || 1;
  return catTotals(byType(arr,'out')).map(([n,v]) => `<div title="${esc(n)}: ${fmt(v)}" style="width:${v/base*100}%;background:${catColor(n,'out')}"></div>`).join('')
    + (left > 0 ? `<div title="Rimanente: ${fmt(left)}" style="width:${left/base*100}%;background:var(--in);opacity:.4"></div>` : '');
}

/* da dove arrivano i soldi (entrate per fonte) e dove vanno (spese per categoria) */
function flowHtml(arr){
  const inc = sum(byType(arr,'in')), out = sum(byType(arr,'out')), left = inc - out;
  const ins = catTotals(byType(arr,'in')), outs = catTotals(byType(arr,'out'));
  if (!inc && !out) return '<div class="empty">Nessun dato nel periodo</div>';
  const base = Math.max(inc,out) || 1, den = inc || out || 1;
  const cnt = (type) => { const o = {}; byType(arr,type).forEach(t => o[t.category] = (o[t.category]||0)+1); return o; };
  const ci = cnt('in'), co = cnt('out');
  const seg = flowBar(arr);
  const row = (n,v,type,pctOf,count,suffix) => `<div class="it"><div class="head"><span class="catcell"><span class="cdot" style="--c:${catColor(n,type)}">${esc(catIcon(n,type))}</span>${esc(n)}</span><span><b>${fmt(v)}</b> <span class="muted">· ${(v/pctOf*100).toFixed(0)}%${suffix} · ${count} op.</span></span></div><div class="progress" style="margin:0"><div style="width:${Math.min(v/pctOf*100,100)}%;background:${catColor(n,type)}"></div></div></div>`;
  const inList = ins.length ? ins.map(([n,v]) => row(n,v,'in',inc,ci[n],'')).join('') : '<div class="empty">Nessuna entrata</div>';
  const outList = outs.length ? outs.map(([n,v]) => row(n,v,'out',den,co[n],inc ? ' delle entrate' : '')).join('') : '<div class="empty">Nessuna spesa</div>';
  const rest = !inc ? `<div class="muted">Nessuna entrata nel periodo: le percentuali sono sul totale speso.</div>`
    : left >= 0 ? `<div class="head tot"><span>Rimanente</span><span><b class="in">${fmt(left)}</b> <span class="muted">· ${(left/inc*100).toFixed(0)}% delle entrate</span></span></div>`
    : `<div class="head tot"><span>Spese oltre le entrate</span><b class="out">${fmt(-left)}</b></div>`;
  return `<div class="flow">
    <div class="head" style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;font-weight:700"><span class="in">Entrate ${fmt(inc)}</span><span class="out">Spese ${fmt(out)}</span><span class="${left>=0?'in':'out'}">= ${fmt(left)}</span></div>
    <div class="flowbar">${seg}</div>
    <div class="muted">La barra rappresenta le tue entrate: ogni colore è una categoria di spesa, la parte chiara è quello che ti resta.</div>
    <div class="cols2">
      <div><h4>Da dove arrivano (entrate)</h4><div class="catlist">${inList}</div></div>
      <div><h4>Come li hai spesi</h4><div class="catlist">${outList}${rest}</div></div>
    </div></div>`;
}

/* lista ordinata: categoria, importo, % sul totale, numero operazioni, barra */
function catBars(arr, type){
  const rows = byType(arr, type), c = catTotals(rows), tot = sum(rows), cnt = {};
  rows.forEach(t => cnt[t.category] = (cnt[t.category]||0) + 1);
  if (!c.length) return `<div class="empty">Nessuna ${type==='out'?'spesa':'entrata'} nel periodo</div>`;
  const mx = c[0][1];
  return `<div class="catlist">` + c.map(([n,v]) => `<div class="it"><div class="head"><span class="catcell"><span class="cdot" style="--c:${catColor(n,type)}">${esc(catIcon(n,type))}</span>${esc(n)}</span><span><b>${fmt(v)}</b> <span class="muted">· ${(v/tot*100).toFixed(0)}% · ${cnt[n]} op.</span></span></div><div class="progress" style="margin:0"><div style="width:${v/mx*100}%;background:${catColor(n,type)}"></div></div></div>`).join('')
    + `<div class="head tot"><span>Totale ${type==='out'?'speso':'incassato'}</span><b>${fmt(tot)}</b></div></div>`;
}

