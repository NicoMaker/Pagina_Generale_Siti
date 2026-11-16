'use strict';

/* ================= Costanti e stato ================= */
const KEY = 'budget_app_v1';
const OLD_PALETTE = ['#5b5bf0','#f43f5e','#10b981','#f59e0b','#8b5cf6','#0ea5e9','#ec4899','#14b8a6','#f97316','#64748b','#06b6d4','#a16207','#84cc16','#e11d48'];
const PALETTE = ['#2BB38A','#F0644A','#F2B441','#4C9BE8','#A27BE8','#E46FA0','#3CC7C9','#9BC24B','#E58A3A','#7A92A6','#5B8DEF','#C98B5A','#6FCF97','#D2584F'];
const DEFAULTS = {
  out: [['Spesa','🛒'],['Casa','🏠'],['Affitto/Mutuo','🔑'],['Bollette','💡'],['Trasporti','🚌'],['Auto','🚗'],['Salute','💊'],['Svago','🎬'],['Ristoranti','🍽️'],['Abbigliamento','👕'],['Viaggi','✈️'],['Istruzione','📚'],['Abbonamenti','🔁'],['Altro','📦']],
  in:  [['Stipendio','💼'],['Bonus','🎁'],['Rimborso','↩️'],['Regalo','🎉'],['Investimenti','📈'],['Vendite','🏷️'],['Altro','📦']]
};
const MONTHS = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
const MONTHS_FULL = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const TITLES = { dash:'Dashboard', tx:'Operazioni', cat:'Categorie', tot:'Totali', rep:'Riepilogo', data:'Dati', help:'Guida' };

let state = { tx: [], budgets: {}, categories: [], theme: null, showAmounts: true };
try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.tx)) state = Object.assign(state, s); } catch(e){}
if (!Array.isArray(state.categories)) state.categories = [];
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){ toast('Impossibile salvare nel browser'); } };

