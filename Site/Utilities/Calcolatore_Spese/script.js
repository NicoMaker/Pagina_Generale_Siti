let persone = [];
let modalitaScelta = 'uguali';
let spesaTotale = 0;

// DOM Elements
const totaleInput = document.getElementById('totale');
const personeInput = document.getElementById('persone');
const generaBtn = document.getElementById('generaBtn');
const personalizzataSection = document.getElementById('personalizzataSection');
const risultatiContainer = document.getElementById('risultatiContainer');
const personeListDiv = document.getElementById('personeListPersonalizzata');
const calcolaPersonalizzataBtn = document.getElementById('calcolaPersonalizzataBtn');
const annullaPersonalizzataBtn = document.getElementById('annullaPersonalizzataBtn');
const copiaBtn = document.getElementById('copiaBtn');
const resetBtn = document.getElementById('resetBtn');

// Radio buttons per la scelta modalità
const radioUguali = document.querySelector('input[value="uguali"]');
const radioPersonalizzata = document.querySelector('input[value="personalizzata"]');

radioUguali.addEventListener('change', () => { modalitaScelta = 'uguali'; });
radioPersonalizzata.addEventListener('change', () => { modalitaScelta = 'personalizzata'; });

generaBtn.addEventListener('click', avviaCalcolo);
calcolaPersonalizzataBtn.addEventListener('click', calcolaPersonalizzata);
annullaPersonalizzataBtn.addEventListener('click', annullaPersonalizzata);
copiaBtn.addEventListener('click', copiaRisultati);
resetBtn.addEventListener('click', resetApp);

function avviaCalcolo() {
    const totale = parseFloat(totaleInput.value);
    const numPersone = parseInt(personeInput.value);
    
    if (isNaN(totale) || totale <= 0) {
        alert('Inserisci un totale valido (maggiore di 0)');
        return;
    }
    
    if (isNaN(numPersone) || numPersone < 1) {
        alert('Inserisci un numero di persone valido (almeno 1)');
        return;
    }
    
    spesaTotale = totale;
    
    if (modalitaScelta === 'uguali') {
        // Calcolo diretto: tutti uguali
        const quota = totale / numPersone;
        const quote = [];
        for (let i = 0; i < numPersone; i++) {
            quote.push({
                nome: `Persona ${i+1}`,
                quota: quota,
                percentualeUsata: 100 / numPersone,
                eAuto: true
            });
        }
        mostrarRisultati(quote, totale);
    } else {
        // Modalità personalizzata: mostra form per nomi e %
        generaPersonePersonalizzata(numPersone);
        personalizzataSection.style.display = 'block';
        risultatiContainer.style.display = 'none';
        document.querySelector('.card:first-of-type').style.opacity = '0.5';
    }
}

function generaPersonePersonalizzata(numPersone) {
    persone = [];
    for (let i = 0; i < numPersone; i++) {
        persone.push({
            id: i,
            nome: `Persona ${i+1}`,
            percentuale: ''
        });
    }
    renderPersoneFormPersonalizzata();
}

function renderPersoneFormPersonalizzata() {
    personeListDiv.innerHTML = '';
    
    persone.forEach((persona, index) => {
        const div = document.createElement('div');
        div.className = 'persona-item';
        div.innerHTML = `
            <div class="persona-header">
                <input type="text" class="persona-nome-input" id="nome_${index}" value="${escapeHtml(persona.nome)}" placeholder="Nome">
                <span class="auto-badge" id="autoBadge_${index}" style="${persona.percentuale ? 'display:none' : 'display:inline-block'}">⚡ Auto</span>
            </div>
            <input type="number" step="any" class="input-percentuale" id="perc_${index}" 
                   placeholder="Percentuale % (es. 25 o lascia vuoto per auto)" value="${persona.percentuale}">
        `;
        personeListDiv.appendChild(div);
        
        const nomeInput = document.getElementById(`nome_${index}`);
        nomeInput.addEventListener('change', (e) => {
            persone[index].nome = e.target.value || `Persona ${index+1}`;
        });
        
        const percInput = document.getElementById(`perc_${index}`);
        const autoBadge = document.getElementById(`autoBadge_${index}`);
        percInput.addEventListener('input', (e) => {
            const val = e.target.value;
            persone[index].percentuale = val;
            if (val && val !== '') {
                autoBadge.style.display = 'none';
            } else {
                autoBadge.style.display = 'inline-block';
            }
        });
    });
}

function calcolaPersonalizzata() {
    const totale = spesaTotale;
    
    // Raccogli percentuali
    let percentualiInserite = [];
    let sommaPercentuali = 0;
    let countPercentuali = 0;
    
    for (let i = 0; i < persone.length; i++) {
        const val = persone[i].percentuale;
        if (val && val !== '') {
            const num = parseFloat(val);
            if (isNaN(num) || num < 0) {
                mostraAlert(`Percentuale non valida per ${persone[i].nome}`);
                return;
            }
            if (num > 100) {
                mostraAlert(`Percentuale per ${persone[i].nome} non può superare 100%`);
                return;
            }
            percentualiInserite[i] = num;
            sommaPercentuali += num;
            countPercentuali++;
        } else {
            percentualiInserite[i] = null;
        }
    }
    
    if (sommaPercentuali > 100.01) {
        mostraAlert(`La somma delle percentuali è ${sommaPercentuali.toFixed(1)}%, non può superare 100%!`);
        return;
    }
    
    const personeSenzaPercentuale = persone.length - countPercentuali;
    const percentualeRestante = 100 - sommaPercentuali;
    
    // Se tutti hanno percentuali ma la somma non è 100
    if (personeSenzaPercentuale === 0 && Math.abs(sommaPercentuali - 100) > 0.01) {
        mostraAlert(`Hai inserito percentuali per tutti ma la somma è ${sommaPercentuali}%, deve essere 100%!`);
        return;
    }
    
    // Calcola quote
    let quote = [];
    for (let i = 0; i < persone.length; i++) {
        let percentualeUsata;
        if (percentualiInserite[i] !== null) {
            percentualeUsata = percentualiInserite[i];
        } else {
            percentualeUsata = personeSenzaPercentuale > 0 ? percentualeRestante / personeSenzaPercentuale : 0;
        }
        const quota = (percentualeUsata / 100) * totale;
        quote.push({
            nome: persone[i].nome,
            quota: quota,
            percentualeUsata: percentualeUsata,
            eAuto: percentualiInserite[i] === null
        });
    }
    
    // Correzione arrotondamenti
    const sommaQuote = quote.reduce((sum, q) => sum + q.quota, 0);
    if (Math.abs(sommaQuote - totale) > 0.01) {
        const differenza = totale - sommaQuote;
        for (let i = quote.length - 1; i >= 0; i--) {
            if (quote[i].eAuto) {
                quote[i].quota += differenza;
                break;
            }
        }
    }
    
    personalizzataSection.style.display = 'none';
    document.querySelector('.card:first-of-type').style.opacity = '1';
    mostrarRisultati(quote, totale);
}

function annullaPersonalizzata() {
    personalizzataSection.style.display = 'none';
    document.querySelector('.card:first-of-type').style.opacity = '1';
    document.getElementById('percentualeAlert').style.display = 'none';
}

function mostrarRisultati(quote, totale) {
    const listContainer = document.getElementById('risultatiList');
    listContainer.innerHTML = '';
    
    quote.forEach(q => {
        const div = document.createElement('div');
        div.className = 'risultato-item';
        div.innerHTML = `
            <div style="flex:1">
                <strong>${escapeHtml(q.nome)}</strong>
                ${q.eAuto ? '<span style="font-size:0.7rem; margin-left:8px; background:#dbeafe; padding:2px 8px; border-radius:20px;">auto</span>' : ''}
                <div style="font-size:0.75rem; color:#6b7280;">${q.percentualeUsata.toFixed(1)}%</div>
            </div>
            <span style="font-weight:700; font-size:1.1rem;">💰 ${q.quota.toFixed(2)} €</span>
        `;
        listContainer.appendChild(div);
    });
    
    const riepilogo = document.createElement('div');
    riepilogo.style.marginTop = '16px';
    riepilogo.style.padding = '12px';
    riepilogo.style.background = '#e6f7e6';
    riepilogo.style.borderRadius = '12px';
    riepilogo.style.textAlign = 'center';
    riepilogo.innerHTML = `<strong>Totale spesa:</strong> ${totale.toFixed(2)} €`;
    listContainer.appendChild(riepilogo);
    
    risultatiContainer.style.display = 'block';
    window.ultimiRisultati = quote;
    window.ultimoTotale = totale;
}

function copiaRisultati() {
    if (!window.ultimiRisultati) return;
    let msg = `💰 SPESA DIVISA - Totale: ${window.ultimoTotale.toFixed(2)}€\n\n`;
    window.ultimiRisultati.forEach(r => {
        msg += `• ${r.nome}: ${r.quota.toFixed(2)}€ (${r.percentualeUsata.toFixed(1)}%)\n`;
    });
    navigator.clipboard.writeText(msg);
    const btn = document.getElementById('copiaBtn');
    const oldText = btn.innerText;
    btn.innerText = '✅ Copiato!';
    setTimeout(() => { btn.innerText = oldText; }, 2000);
}

function mostraAlert(msg) {
    const alertDiv = document.getElementById('percentualeAlert');
    alertDiv.innerText = msg;
    alertDiv.style.display = 'block';
    setTimeout(() => { alertDiv.style.display = 'none'; }, 3000);
}

function resetApp() {
    persone = [];
    spesaTotale = 0;
    document.getElementById('totale').value = '';
    document.getElementById('persone').value = '';
    personalizzataSection.style.display = 'none';
    risultatiContainer.style.display = 'none';
    document.querySelector('.card:first-of-type').style.opacity = '1';
    document.getElementById('percentualeAlert').style.display = 'none';
    radioUguali.checked = true;
    modalitaScelta = 'uguali';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}