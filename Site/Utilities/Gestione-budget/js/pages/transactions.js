'use strict';

/* ================= OPERAZIONI ================= */
function defaultDate(){ const t = todayISO(), p = per(); if (t.startsWith(p)) return t; return p.length===7 ? p+'-01' : p+'-01-01'; }
function setType(t){
  $('fType').value = t;
  document.querySelectorAll('#typeSeg button').forEach(b => b.classList.toggle('active', b.dataset.t === t));
  renderChips();
}
$('typeSeg').onclick = e => { const b = e.target.closest('button'); if (b) setType(b.dataset.t); };
let chipsAll = false;
function renderChips(){
  const type = $('fType').value, raw = $('fCat').value.trim(), q = catKey(raw), ex = q ? findCat(raw) : null;
  const all = catsOf(type), filtering = !!q && !ex, LIM = 10;
  let list = filtering ? all.filter(c => catKey(c.name).includes(q)) : all;
  if (ex) list = [ex, ...all.filter(c => c.id !== ex.id)];
  const shown = (!chipsAll && !filtering && list.length > LIM) ? list.slice(0, LIM) : list;
  const chip = c => `<button type="button" class="chip ${ex && c.id===ex.id ? 'sel' : ''}" data-c="${esc(c.name)}" style="--c:${c.color}"><span class="ci">${esc(c.icon)}</span>${esc(c.name)}</button>`;
  let html = shown.map(chip).join('');
  if (!filtering && list.length > LIM) html += `<button type="button" class="chip more" data-more="1">${chipsAll ? 'Mostra meno' : `Mostra tutte (${list.length})`}</button>`;
  $('chipBox').innerHTML = html;
  $('chipHint').innerHTML = !all.length ? 'Nessuna categoria: creane una nella pagina <b>Categorie</b>'
    : !q ? 'Scegli una categoria tra quelle disponibili'
    : ex ? `Selezionata: ${esc(ex.name)}`
    : list.length ? 'Tocca una categoria per sceglierla' : 'Nessuna categoria con questo nome: puoi crearla solo dalla pagina <b>Categorie</b>';
}
$('chipBox').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.more) { chipsAll = !chipsAll; return renderChips(); }
  if (b.dataset.c) { $('fCat').value = b.dataset.c; renderChips(); }
};
$('fCat').addEventListener('input', renderChips);
function resetForm(){
  $('txForm').reset(); $('fId').value = ''; $('fDate').value = defaultDate(); setType('out');
  $('formTitleT').textContent = 'Nuova operazione'; $('fSubmitT').textContent = 'Aggiungi'; $('fCancel').style.display = 'none';
}
$('fCancel').onclick = resetForm;
$('txForm').onsubmit = e => {
  e.preventDefault();
  const amount = Math.round(parseFloat($('fAmount').value)*100)/100;
  if (!(amount>0)) return toast('Importo non valido');
  const type = $('fType').value, before = state.categories.length;
  const c = findCat($('fCat').value);
  if (!c) { $('fCat').focus(); return toast(state.categories.length ? 'Scegli una categoria tra quelle presenti (le crei nella pagina Categorie)' : 'Prima crea una categoria nella pagina Categorie'); }
  const rec = { id: $('fId').value || uid(), date: $('fDate').value, type, category: c.name, description: $('fDesc').value.trim(), amount };
  const i = state.tx.findIndex(t => t.id === rec.id);
  if (i>=0) { state.tx[i] = rec; toast('Operazione modificata'); } else { state.tx.push(rec); toast(state.categories.length>before ? `Operazione aggiunta · categoria "${c.name}" creata` : 'Operazione aggiunta'); }
  save();
  const ym = rec.date.slice(0,7);
  if (!ym.startsWith(per())) { cur = ym; syncInputs(); }
  resetForm(); setType(type); render();
};
function editTx(id){
  const t = state.tx.find(x => x.id===id); if (!t) return;
  $('fId').value = t.id; $('fDate').value = t.date; $('fAmount').value = t.amount; $('fCat').value = t.category; $('fDesc').value = t.description;
  setType(t.type);
  $('formTitleT').textContent = 'Modifica operazione'; $('fSubmitT').textContent = 'Salva'; $('fCancel').style.display = '';
  $('txForm').scrollIntoView({behavior:'smooth', block:'center'});
}
async function delTx(id){ if (!await ask('Eliminare questa operazione?')) return; state.tx = state.tx.filter(t => t.id!==id); save(); render(); toast('Eliminata'); }
const WD = ['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'];
function dayLabel(d){ const dt = new Date(d+'T12:00:00'); if (isNaN(dt)) return d; const t = new Date(), iso = x => x.toISOString().slice(0,10), y = new Date(t.getTime()-864e5);
  const nm = d===iso(new Date(t.getTime()-t.getTimezoneOffset()*6e4)) ? 'Oggi' : d===iso(new Date(y.getTime()-y.getTimezoneOffset()*6e4)) ? 'Ieri' : WD[dt.getDay()][0].toUpperCase()+WD[dt.getDay()].slice(1);
  return `${nm} · ${dmy(d)}`; }
function txRow(t, actions){
  const sub = actions ? (t.description ? esc(t.description) : '<span class="faint">Nessuna descrizione</span>') : `${dmy(t.date)}${t.description?' · '+esc(t.description):''}`;
  return `<div class="txrow"><span class="cdot lg" style="--c:${catColor(t.category,t.type)}">${esc(catIcon(t.category,t.type))}</span>
    <div class="txmain"><b>${esc(t.category)}</b><span class="muted">${sub}</span></div>
    <div class="txamt ${t.type}"><b>${t.type==='in'?'+':'−'}${fmt(t.amount)}</b><span class="pill ${t.type}">${t.type==='in'?'Entrata':'Uscita'}</span></div>
    ${actions ? `<div class="txact"><button class="iconbtn" data-e="${t.id}" title="Modifica" aria-label="Modifica"><span class="mi">edit</span></button><button class="iconbtn danger" data-d="${t.id}" title="Elimina" aria-label="Elimina"><span class="mi">delete</span></button></div>` : ''}</div>`; }
function renderTx(){
  if (!$('fId').value) { $('fDate').value = $('fDate').value && $('fDate').value.startsWith(per()) ? $('fDate').value : defaultDate(); }
  renderChips();
  const selCat = $('qCat').value;
  $('qCat').innerHTML = '<option value="">Tutte le categorie</option>' + [...new Set(state.categories.map(c => c.name))].sort((a,b)=>a.localeCompare(b,'it')).map(n => `<option ${n===selCat?'selected':''}>${esc(n)}</option>`).join('');
  const q = $('qSearch').value.trim().toLowerCase(), ty = $('qType').value, cat = $('qCat').value, all = $('qAll').checked;
  const rows = (all ? state.tx : inPer())
    .filter(t => (!ty || t.type===ty) && (!cat || t.category===cat) && (!q || (t.category+' '+t.description).toLowerCase().includes(q)))
    .sort((a,b) => b.date.localeCompare(a.date));
  { let lastD = '', h = '';
    rows.forEach(t => {
      if (t.date !== lastD) { lastD = t.date; const day = rows.filter(r => r.date === t.date), dn = sum(byType(day,'in')) - sum(byType(day,'out'));
        h += `<div class="dayhd"><span>${dayLabel(t.date)}</span><span class="${dn<0?'out':'in'}">${dn<0?'−':'+'}${fmt(Math.abs(dn))}</span></div>`; }
      h += txRow(t, true);
    });
    $('tbody').innerHTML = h; }
  $('emptyMsg').style.display = rows.length ? 'none' : 'block';
  const ti = sum(byType(rows,'in')), to = sum(byType(rows,'out'));
  { const y = cur.slice(0,4), M = inKey(cur), Y = inKey(y),
      tile = (ic, lab, a, end) => { const i = sum(byType(a,'in')), o = sum(byType(a,'out')), r = i - o;
        return `<div class="stile"><div class="sh"><span class="mi">${ic}</span>${lab}</div><div class="sv ${r<0?'out':'in'}">${fmt(r)}</div><div class="ss"><span class="in">+${fmt(i)}</span><span class="out">−${fmt(o)}</span></div><div class="ss acc"><span>Accumulato <b class="${cc(accum(end))}">${fmt(accum(end))}</b></span></div></div>`; };
    $('txBoth').innerHTML = tile('today', 'Oggi', inKey(todayISO()), todayISO()) + tile('calendar_month', monthLabel(cur), M, cur+'-31') + tile('date_range', 'Anno '+y, Y, y+'-12-31') + tile('all_inclusive', 'Totale', state.tx, '9999'); }
  $('txCount').textContent = rows.length ? `${rows.length} operazioni · entrate ${fmt(ti)} · uscite ${fmt(to)} · differenza ${fmt(ti-to)}` : '';
}
$('tMonthsB').onclick = e => { const tr = e.target.closest('tr'); if (tr && tr.dataset.k) { cur = tr.dataset.k; syncInputs(); setMode('month'); go('dash'); } };
$('tbody').onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.e) editTx(b.dataset.e); if (b.dataset.d) delTx(b.dataset.d); };
['qSearch','qType','qCat','qAll'].forEach(id => $(id).addEventListener('input', renderTx));

