'use strict';

/* ================= DASHBOARD ================= */
function renderDash(){
  const m = inPer(), inc = sum(byType(m,'in')), out = sum(byType(m,'out')), bal = inc-out;
  const tot = sum(byType(state.tx,'in')) - sum(byType(state.tx,'out'));
  const k = (l,v,c,d,kind) => `<div class="card kpi"><div class="lbl"><span class="dot" style="background:${d}"></span>${l}</div><div class="val ${c}">${v}</div>${trio(kind)}</div>`;
  $('dKpis').innerHTML =
    `<div class="hero"><div class="lbl">Rimanente ${W()}</div><div class="big">${fmt(bal)}</div><div class="flowbar">${flowBar(m)}</div><div class="cap">Ogni colore è una categoria di spesa, la parte chiara è quello che ti resta</div>${trio('bal')}</div>` +
    k('Entrate '+W(), fmt(inc), 'in', 'var(--in)', 'in') + k('Spese '+W(), fmt(out), 'out', 'var(--out)', 'out');
  renderBudget();

  $('top5').innerHTML = catBars(m,'out');
  $('flowD').innerHTML = flowHtml(m);
  $('dBoth').innerHTML = bothHtml();

  const last = m.slice().sort((a,b) => b.date.localeCompare(a.date)).slice(0,8);
  $('lastTx').innerHTML = last.length ? last.map(t => txRow(t, false)).join('')
    : '<div class="empty">Nessuna operazione</div>';

  $('hFlow').textContent = 'Entrate vs Uscite ' + (mm() ? '(per giorno)' : mode==='year' ? '(per mese)' : '(per anno)');
  drawCharts();
}
$('budgetSave').onclick = () => {
  const v = parseFloat($('budgetInput').value);
  if (isNaN(v) || v<=0) delete state.budgets[cur]; else state.budgets[cur] = v;
  save(); renderBudget(); toast('Budget aggiornato');
};
function renderBudget(){
  const mo = mm(), b = mo ? state.budgets[cur] : budFor(per());
  const spent = sum(byType(mode==='day' ? inKey(cur) : inPer(),'out'));
  $('hBudget').textContent = mo ? 'Budget del mese' : mode==='year' ? "Budget dell'anno (somma dei mensili)" : 'Budget totale (somma dei mensili)';
  $('budgetForm').style.display = mo ? '' : 'none';
  $('budgetInput').value = mo ? (b || '') : '';
  const bar = $('budgetBar');
  if (!b) { bar.style.width = '0'; $('budgetText').textContent = mo ? 'Nessun budget impostato per questo mese.' : 'Nessun budget mensile impostato (passa a Mensile per impostarli).'; return; }
  const p = spent/b*100, left = b-spent;
  bar.style.width = Math.min(p,100)+'%';
  bar.style.background = p>=100 ? cssVar('--out') : p>=80 ? cssVar('--warn') : cssVar('--in');
  $('budgetText').innerHTML = `Speso <b>${fmt(spent)}</b> di <b>${fmt(b)}</b> (${p.toFixed(0)}%) · ` + (left>=0 ? `ancora disponibili <b>${fmt(left)}</b>` : `<b class="out">sforato di ${fmt(-left)}</b>`);
}

