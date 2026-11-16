'use strict';

/* ================= Categorie ================= */
const ICON_RULES = [
  [/spesa|supermerc|aliment|cibo|market|coop|esselunga/, 'shopping_cart'],
  [/ristorant|pizz|\bbar\b|caff|pranzo|cena|trattor|sushi|fast ?food|aperitiv|colazion/, 'restaurant'],
  [/assicuraz/, 'shield'],
  [/affitt|mutuo|\bcasa\b|condomin|immobil|arredament|mobili/, 'home'],
  [/bollett|\bluce\b|energ|elettric|\bgas\b|acqua|utenz/, 'bolt'],
  [/internet|wifi|fibra|telefon|cellul|\bsim\b|mobile/, 'wifi'],
  [/benzin|carburant|diesel|rifornim/, 'local_gas_station'],
  [/\bauto\b|macchin|bollo|parcheggi|autostrad|pedagg|meccanic|moto/, 'directions_car'],
  [/trasport|\bbus\b|autobus|treno|metro|taxi|mezzi|biglietto/, 'directions_bus'],
  [/salute|farmac|medic|dentist|ospedal|visita|sanit|ticket/, 'medication'],
  [/palestr|sport|fitness|piscin|yoga|calcio/, 'fitness_center'],
  [/svago|cinema|film|diverti|tempo libero|teatro|concert|giochi|videogioc|serie/, 'movie'],
  [/abbigliament|vestit|scarp|moda|shopping/, 'checkroom'],
  [/viagg|vacanz|volo|aere|hotel|alberg|booking|ferie/, 'flight'],
  [/istruzion|scuola|universit|corso|libr|formazion|studio/, 'school'],
  [/abbonament|netflix|spotify|prime|streaming|disney/, 'subscriptions'],
  [/animal|\bcane\b|gatt|veterin/, 'pets'],
  [/bambin|figli|asilo|baby|giocattol/, 'child_care'],
  [/tass|imposte|imposta|irpef|\biva\b|tribut|fisc|commercialist/, 'receipt_long'],
  [/dona|benefic|offert|volontar/, 'volunteer_activism'],
  [/tecnolog|elettronic|computer|\bpc\b|software|informatic|gadget/, 'devices'],
  [/bellezz|parrucc|estetic|\bcura\b|barbier|cosmet/, 'spa'],
  [/stipend|salari|\bpaga\b|lavoro|busta|compens|fattur|freelance|consulen/, 'work'],
  [/bonus|premio|incentiv|tredicesim|quattordicesim|mancia/, 'redeem'],
  [/regal/, 'card_giftcard'],
  [/rimbors|\breso\b|storno|restituz/, 'undo'],
  [/investiment|azion|borsa|crypto|bitcoin|\betf\b|dividend|interess|rendit/, 'trending_up'],
  [/risparm|accantonament|fondo|salvadanaio/, 'savings'],
  [/vendit|\bvend|ebay|subito/, 'sell'],
  [/prestit|finanziament|\brata\b|debit/, 'account_balance'],
  [/altro|varie|divers/, 'category']
];
function autoIcon(name){
  const n = String(name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (const [re, ic] of ICON_RULES) if (re.test(n)) return ic;
  return 'label';
}
const catKey = n => String(n || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
const findCat = name => { const k = catKey(name); return state.categories.find(c => catKey(c.name) === k); };
const nextColor = () => PALETTE[state.categories.length % PALETTE.length];
function ensureCat(name,type){
  name = String(name ?? '').trim() || 'Altro';
  let c = findCat(name,type);
  if (!c) { c = { id: uid(), name, icon: autoIcon(name), color: nextColor() }; state.categories.push(c); }
  return c;
}
function seedCategories(){
  [...DEFAULTS.out, ...DEFAULTS.in].forEach(([name]) => { if (!findCat(name)) state.categories.push({ id:uid(), name, icon:autoIcon(name), color:nextColor() }); });
}
function mergeCategories(list){
  let n = 0;
  (list||[]).forEach(c => {
    const name = String(c && c.name || '').trim();
    if (!name || findCat(name)) return;
    state.categories.push({ id:uid(), name, icon: /^[a-z0-9_]+$/.test(c.icon||'') ? c.icon : autoIcon(name), color: /^#[0-9a-f]{6}$/i.test(c.color||'') ? c.color : nextColor() });
    n++;
  });
  return n;
}
const catColor = (name,type) => (findCat(name,type) || {}).color || '#94a3b8';
const catIcon  = name => (findCat(name) || {}).icon || autoIcon(name);
const catsOf = type => { const n = {}; state.tx.forEach(t => { if (!type || t.type===type) n[t.category] = (n[t.category]||0)+1; }); return state.categories.slice().sort((a,b) => ((n[b.name]||0)-(n[a.name]||0)) || a.name.localeCompare(b.name,'it')); };
function catTotals(arr){
  const m = {}; arr.forEach(t => m[t.category] = (m[t.category]||0) + t.amount);
  return Object.entries(m).sort((a,b)=>b[1]-a[1]);
}

