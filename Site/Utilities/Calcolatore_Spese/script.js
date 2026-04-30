let persone = [];

document.getElementById('generaPersoneBtn').addEventListener('click', generaPersone);
document.getElementById('calcolaBtn')?.addEventListener('click', calcolaSpese);
document.getElementById('copiaBtn')?.addEventListener('click', copiaRisultati);
document.getElementById('resetBtn')?.addEventListener('click', resetApp);

function generaPersone() {
    const totaleInput = document.getElementById('totale');
    const personeInput = document.getElementById('persone');
    
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
    
    // Memorizzo totale per uso futuro
    window.spesaTotale = totale;
    
    // Genero persone con nome e percentuale vuota
    persone = [];
    for (let i = 0; i < numPersone; i++) {
        persone.push({
            id: i,
            nome: `Persona ${i+1}`,
            percentuale: ''
        });
    }
    
    renderPersoneForm();
}

function renderPersoneForm() {
    const container = document.getElementById('personeContainer');
    const listContainer = document.getElementById('personeList');
    
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    persone.forEach((persona, index) => {
        const div = document.createElement('div');
        div.className = 'persona-item';
        div.innerHTML = `
            <div class="persona-header">
                <span class="persona-nome">${escapeHtml(persona.nome)}</span>
                <span class="persona-quota">Quota</span>
            </div>
            <input type="number" step="any" class="input-percentuale" id="perc_${index}" 
                   placeholder="Percentuale % (es. 25 oppure lascia vuoto)" value="${persona.percentuale}">
        `;
        listContainer.appendChild(div);
        
        // Aggiungo event listener per salvare il valore
        const input = document.getElementById(`perc_${index}`);
        input.addEventListener('input', (e) => {
            persone[index].percentuale = e.target.value;
        });
    });
    
    container.style.display = 'block';
    document.getElementById('risultatiContainer').style.display = 'none';
}

function calcolaSpese() {
    const totale = window.spesaTotale;
    if (!totale || isNaN(totale)) {
        alert('Errore: totale non valido. Ricomincia.');
        resetApp();
        return;
    }
    
    // Controllo percentuali
    let percentualiValide = [];
    let tutteValide = true;
    let sommaPercentuali = 0;
    let countPercentuali = 0;
    
    for (let i = 0; i < persone.length; i++) {
        const val = persone[i].percentuale;
        if (val !== undefined && val !== null && val !== '') {
            const num = parseFloat(val);
            if (isNaN(num) || num < 0) {
                mostraAlert(`Percentuale non valida per ${persone[i].nome}. Usa numeri positivi.`);
                tutteValide = false;
                break;
            }
            percentualiValide[i] = num;
            sommaPercentuali += num;
            countPercentuali++;
        } else {
            percentualiValide[i] = null;
        }
    }
    
    if (!tutteValide) return;
    
    // Se ci sono percentuali ma la somma non è 100
    if (countPercentuali > 0 && Math.abs(sommaPercentuali - 100) > 0.01) {
        mostraAlert(`La somma delle percentuali è ${sommaPercentuali}%, deve essere 100%!`);
        return;
    }
    
    // Calcolo quote
    let quote = [];
    
    if (countPercentuali === 0) {
        // Ripartizione equa
        const quotaUguale = totale / persone.length;
        for (let i = 0; i < persone.length; i++) {
            quote.push({
                nome: persone[i].nome,
                quota: quotaUguale,
                percentualeUsata: 100 / persone.length
            });
        }
    } else {
        // Ripartizione con percentuali
        for (let i = 0; i < persone.length; i++) {
            let perc = percentualiValide[i];
            if (perc === null) {
                mostraAlert(`Tutti devono avere una percentuale se si usa la personalizzazione. Manca quella di ${persone[i].nome}`);
                return;
            }
            const quotaPersona = (perc / 100) * totale;
            quote.push({
                nome: persone[i].nome,
                quota: quotaPersona,
                percentualeUsata: perc
            });
        }
    }
    
    // Verifica arrotondamenti: somma quote deve essere ≈ totale
    const sommaQuote = quote.reduce((sum, q) => sum + q.quota, 0);
    if (Math.abs(sommaQuote - totale) > 0.01) {
        // Aggiusto l'ultimo valore per arrotondamento
        const differenza = totale - sommaQuote;
        quote[quote.length - 1].quota += differenza;
    }
    
    mostrarRisultati(quote, totale);
}

function mostrarRisultati(quote, totale) {
    const container = document.getElementById('risultatiContainer');
    const listContainer = document.getElementById('risultatiList');
    
    listContainer.innerHTML = '';
    
    // Calcolo chi deve dare/ricevere (simuliamo un unico pagante ideale? Meglio mostrare quanto paga ognuno)
    // Mostro semplicemente quanto paga ciascuno
    quote.forEach(q => {
        const div = document.createElement('div');
        div.className = 'risultato-item';
        div.innerHTML = `
            <span class="risultato-nome">${escapeHtml(q.nome)}</span>
            <span class="risultato-importo">💰 ${q.quota.toFixed(2)} €</span>
        `;
        if (q.percentualeUsata) {
            const smallSpan = document.createElement('div');
            smallSpan.style.fontSize = '0.75rem';
            smallSpan.style.color = '#6b7280';
            smallSpan.style.marginTop = '4px';
            smallSpan.style.width = '100%';
            smallSpan.innerText = `(${q.percentualeUsata.toFixed(1)}%)`;
            div.appendChild(smallSpan);
        }
        listContainer.appendChild(div);
    });
    
    // Aggiungi riepilogo
    const riepilogo = document.createElement('div');
    riepilogo.style.marginTop = '16px';
    riepilogo.style.padding = '12px';
    riepilogo.style.background = '#e6f7e6';
    riepilogo.style.borderRadius = '12px';
    riepilogo.style.textAlign = 'center';
    riepilogo.innerHTML = `<strong>Totale spesa:</strong> ${totale.toFixed(2)} €`;
    listContainer.appendChild(riepilogo);
    
    container.style.display = 'block';
    
    // Nascondi alert
    document.getElementById('percentualeAlert').style.display = 'none';
    
    // Salvo i risultati per copia
    window.ultimiRisultati = quote;
    window.ultimoTotale = totale;
}

function copiaRisultati() {
    if (!window.ultimiRisultati || window.ultimiRisultati.length === 0) {
        alert('Nessun risultato da copiare');
        return;
    }
    
    let messaggio = `💰 SPESA DIVISA - Totale: ${window.ultimoTotale.toFixed(2)}€\n\n`;
    window.ultimiRisultati.forEach(r => {
        messaggio += `• ${r.nome}: ${r.quota.toFixed(2)}€\n`;
        if (r.percentualeUsata) {
            messaggio += `  (${r.percentualeUsata.toFixed(1)}%)\n`;
        }
    });
    
    navigator.clipboard.writeText(messaggio).then(() => {
        const btnCopia = document.getElementById('copiaBtn');
        const testoOriginale = btnCopia.innerText;
        btnCopia.innerText = '✅ Copiato!';
        setTimeout(() => {
            btnCopia.innerText = testoOriginale;
        }, 2000);
    }).catch(() => {
        alert('Non è stato possibile copiare manualmente');
    });
}

function mostraAlert(messaggio) {
    const alertDiv = document.getElementById('percentualeAlert');
    alertDiv.innerText = messaggio;
    alertDiv.style.display = 'block';
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 3000);
}

function resetApp() {
    persone = [];
    window.spesaTotale = null;
    window.ultimiRisultati = null;
    document.getElementById('totale').value = '';
    document.getElementById('persone').value = '';
    document.getElementById('personeContainer').style.display = 'none';
    document.getElementById('risultatiContainer').style.display = 'none';
    document.getElementById('percentualeAlert').style.display = 'none';
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