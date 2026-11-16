'use strict';

/* ================= DATI: export ================= */
const exScope = () => $('expScope').value;
const exPeriod = () => exScope()==='period' && mode!=='all';
const exRows = () => (exPeriod() ? inPer() : state.tx).slice().sort((a,b) => a.date.localeCompare(b.date));
const exName = () => exPeriod() ? per() : 'completo';
const exLabel = () => exPeriod() ? perLabel() : 'Tutti i dati';
function exLevel(rows){
  if (exPeriod() && mm()) return null;
  const yrs = new Set(rows.map(t => t.date.slice(0,4)));
  return (!exPeriod() && yrs.size>1) || (mode==='all' && yrs.size>1) ? 'year' : 'month';
}
function summary(rows, level){
  const n = level==='year' ? 4 : 7;
  return [...new Set(rows.map(t => t.date.slice(0,n)))].sort().map(k => { const m = rows.filter(t => t.date.startsWith(k)); return { label: level==='year' ? k : monthLabel(k), a: sum(byType(m,'in')), b: sum(byType(m,'out')) }; });
}
const HEAD = ['Data','Tipo','Categoria','Descrizione','Importo'];
const toRow = t => [t.date, t.type==='in'?'Entrata':'Uscita', t.category, t.description, t.amount];
function renderData(){ $('scopeHint').textContent = `Ambito attuale: ${exLabel()} · ${exRows().length} operazioni`; }
$('expScope').onchange = renderData;

$('exJson').onclick = () => {
  download(new Blob([JSON.stringify({ app:'budget', version:2, exported:new Date().toISOString(), transactions:state.tx, categories:state.categories.map(({id,name,icon,color})=>({id,name,icon,color})), budgets:state.budgets }, null, 2)], {type:'application/json'}), `budget_backup_${todayISO()}.json`);
  toast('Backup JSON esportato');
};
$('exCsv').onclick = () => {
  const q = v => `"${String(v).replace(/"/g,'""')}"`;
  const lines = [HEAD.join(';'), ...exRows().map(t => { const r = toRow(t); return [r[0],r[1],q(r[2]),q(r[3]),String(r[4]).replace('.',',')].join(';'); })];
  download(new Blob(['﻿'+lines.join('\r\n')], {type:'text/csv;charset=utf-8'}), `budget_${exName()}.csv`);
  toast('CSV esportato');
};
$('exXlsx').onclick = () => {
  if (!need(window.XLSX,'XLSX')) return;
  const rows = exRows(), wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([HEAD, ...rows.map(toRow)]); ws['!cols'] = [{wch:12},{wch:10},{wch:18},{wch:34},{wch:12}];
  XLSX.utils.book_append_sheet(wb, ws, 'Operazioni');
  const lv = exLevel(rows) || 'month', sm = summary(rows, lv);
  const sAoa = [[lv==='year'?'Anno':'Mese','Entrate','Uscite','Rimanente'], ...sm.map(r => [r.label,r.a,r.b,r.a-r.b])];
  const ti = sum(byType(rows,'in')), to = sum(byType(rows,'out')); sAoa.push(['TOTALE',ti,to,ti-to]);
  const ws2 = XLSX.utils.aoa_to_sheet(sAoa); ws2['!cols'] = [{wch:18},{wch:14},{wch:14},{wch:14}];
  XLSX.utils.book_append_sheet(wb, ws2, 'Riepilogo');
  const cAoa = [['Categoria','Tipo','Totale']];
  catTotals(byType(rows,'out')).forEach(([k,v]) => cAoa.push([k,'Uscita',v]));
  catTotals(byType(rows,'in')).forEach(([k,v]) => cAoa.push([k,'Entrata',v]));
  const ws3 = XLSX.utils.aoa_to_sheet(cAoa); ws3['!cols'] = [{wch:22},{wch:10},{wch:14}];
  XLSX.utils.book_append_sheet(wb, ws3, 'Totali categorie');
  const ws4 = XLSX.utils.aoa_to_sheet([['Nome','Colore'], ...state.categories.map(c => [c.name, c.color])]);
  ws4['!cols'] = [{wch:22},{wch:10}];
  XLSX.utils.book_append_sheet(wb, ws4, 'Elenco categorie');
  XLSX.writeFile(wb, `budget_${exName()}.xlsx`);
  toast('XLSX esportato');
};
function catImage(rows){
  const c = catTotals(byType(rows,'out')); if (!c.length || typeof Chart === 'undefined') return null;
  const cv = document.createElement('canvas'); cv.width = 640; cv.height = 320; cv.style.display = 'none'; document.body.appendChild(cv);
  try {
    const ch = new Chart(cv, { type:'doughnut', data:{ labels:c.map(x=>x[0]), datasets:[{ data:c.map(x=>x[1]), backgroundColor:c.map(x=>catColor(x[0],'out')), borderColor:'#fff', borderWidth:2 }] },
      options:{ responsive:false, animation:false, plugins:{ legend:{position:'right',labels:{color:'#222',usePointStyle:true}} } } });
    const img = ch.toBase64Image('image/png',1); ch.destroy(); return img;
  } catch(e){ return null; } finally { cv.remove(); }
}
$('exPdf').onclick = () => {
  if (!window.jspdf) return toast('Libreria PDF non caricata (serve internet)');
  const { jsPDF } = window.jspdf, doc = new jsPDF(), rows = exRows();
  const inc = sum(byType(rows,'in')), out = sum(byType(rows,'out'));
  doc.setFontSize(18); doc.text('Report Entrate e Uscite', 14, 18);
  doc.setFontSize(11); doc.setTextColor(100); doc.text(exLabel(), 14, 25);
  doc.text(`Generato il ${new Date().toLocaleDateString('it-IT')}`, 196, 25, {align:'right'}); doc.setTextColor(0);
  doc.autoTable({ startY:31, head:[['Entrate','Uscite','Rimanente']], body:[[fmt(inc),fmt(out),fmt(inc-out)]], theme:'grid', headStyles:{fillColor:[91,91,240]}, styles:{halign:'center',fontSize:12} });
  let y = doc.lastAutoTable.finalY + 8;
  const img = catImage(rows);
  if (img) { try { doc.addImage(img, 'PNG', 14, y, 110, 55); y += 61; } catch(e){} }
  const lv = exLevel(rows);
  if (lv) {
    const sm = summary(rows, lv), body = sm.map(r => [r.label, fmt(r.a), fmt(r.b), fmt(r.a-r.b)]); body.push(['TOTALE', fmt(inc), fmt(out), fmt(inc-out)]);
    doc.autoTable({ startY:y, head:[[lv==='year'?'Anno':'Mese','Entrate','Uscite','Rimanente']], body, theme:'grid', headStyles:{fillColor:[91,91,240]}, styles:{fontSize:9},
      columnStyles:{1:{halign:'right'},2:{halign:'right'},3:{halign:'right'}}, didParseCell: d => { if (d.section==='body' && d.row.index===body.length-1) d.cell.styles.fontStyle = 'bold'; } });
    y = doc.lastAutoTable.finalY + 8;
  }
  const cats = catTotals(byType(rows,'out'));
  if (cats.length) { doc.autoTable({ startY:y, head:[['Spese per categoria','Totale','%']], body:cats.map(([k,v]) => [k,fmt(v),(v/out*100).toFixed(1)+'%']), theme:'striped', headStyles:{fillColor:[244,63,94]}, columnStyles:{1:{halign:'right'},2:{halign:'right'}}, tableWidth:120 }); y = doc.lastAutoTable.finalY + 8; }
  const icats = catTotals(byType(rows,'in'));
  if (icats.length) { doc.autoTable({ startY:y, head:[['Entrate per categoria','Totale','%']], body:icats.map(([k,v]) => [k,fmt(v),(v/inc*100).toFixed(1)+'%']), theme:'striped', headStyles:{fillColor:[16,185,129]}, columnStyles:{1:{halign:'right'},2:{halign:'right'}}, tableWidth:120 }); y = doc.lastAutoTable.finalY + 8; }
  doc.autoTable({ startY:y, head:[HEAD], body: rows.map(t => [dmy(t.date), t.type==='in'?'Entrata':'Uscita', t.category, t.description, (t.type==='in'?'+':'-')+fmt(t.amount)]),
    theme:'striped', headStyles:{fillColor:[91,91,240]}, columnStyles:{4:{halign:'right'}}, styles:{fontSize:9},
    didParseCell: d => { if (d.section==='body' && d.column.index===4) d.cell.styles.textColor = String(d.cell.raw).startsWith('+') ? [16,150,100] : [229,50,80]; } });
  const n = doc.getNumberOfPages();
  for (let i=1;i<=n;i++){ doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150); doc.text(`Pagina ${i} di ${n}`, 105, 290, {align:'center'}); }
  doc.save(`budget_${exName()}.pdf`); toast('PDF esportato');
};

