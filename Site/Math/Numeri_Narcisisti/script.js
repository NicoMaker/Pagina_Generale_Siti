(function() {
    // --------------------------------------------------------------
    // ALGORITMO COMBINATORIO PER NUMERI NARCISISTI FINO A 60 CIFRE (BigInt)
    // Basato su distribuzione di cifre (multiset) e potature avanzate
    // --------------------------------------------------------------
    const MAX_LEN = 60;
    
    // precalcolo potenze: powers[digit][len] = digit^len (BigInt)
    const powers = Array(10);
    for (let d = 0; d <= 9; d++) {
        powers[d] = Array(MAX_LEN + 1);
        for (let n = 0; n <= MAX_LEN; n++) {
            if (n === 0) powers[d][n] = 1n;
            else powers[d][n] = powers[d][n-1] * BigInt(d);
        }
    }
    
    // somma da conteggi
    function sumFromCounts(counts, L) {
        let total = 0n;
        for (let d = 0; d <= 9; d++) {
            if (counts[d] === 0) continue;
            total += BigInt(counts[d]) * powers[d][L];
        }
        return total;
    }
    
    // estrae conteggi da un numero BigInt e lunghezza L
    function getDigitCountsFromNumber(numBig, L) {
        let numStr = numBig.toString();
        if (numStr.length !== L) return null;
        const counts = Array(10).fill(0);
        for (let i = 0; i < numStr.length; i++) {
            const digit = parseInt(numStr[i], 10);
            counts[digit]++;
        }
        return counts;
    }
    
    // verifica se la combinazione genera un narcisista
    function checkCombination(counts, L) {
        if (L > 1) {
            let hasNonZero = false;
            for (let d = 1; d <= 9; d++) if (counts[d] > 0) { hasNonZero = true; break; }
            if (!hasNonZero) return null;
        }
        
        const sumBig = sumFromCounts(counts, L);
        const sumStr = sumBig.toString();
        if (sumStr.length !== L) return null;
        
        const sumCounts = getDigitCountsFromNumber(sumBig, L);
        if (!sumCounts) return null;
        
        for (let i = 0; i <= 9; i++) {
            if (sumCounts[i] !== counts[i]) return null;
        }
        return sumBig;
    }
    
    function getBounds(L) {
        let lower = (L === 1) ? 0n : 10n ** BigInt(L-1);
        let upper = (10n ** BigInt(L)) - 1n;
        return { lower, upper };
    }
    
    // backtracking principale
    function findNarcissisticNumbersByLength(L) {
        if (L < 1 || L > MAX_LEN) return [];
        if (L === 1) {
            return [0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n];
        }
        
        const results = [];
        const initialCounts = Array(10).fill(0);
        const { lower, upper } = getBounds(L);
        
        function backtrack(digitIdx, remaining, currentCounts, currentSum) {
            if (remaining === 0) {
                const num = checkCombination(currentCounts, L);
                if (num !== null) results.push(num);
                return;
            }
            if (digitIdx > 9) return;
            
            // potature base
            let minFuture = 0n;
            for (let i = 0; i < remaining; i++) minFuture += powers[digitIdx][L];
            let maxFuture = 0n;
            for (let i = 0; i < remaining; i++) maxFuture += powers[9][L];
            
            if (currentSum + minFuture > upper) return;
            if (currentSum + maxFuture < lower) return;
            
            for (let cnt = 0; cnt <= remaining; cnt++) {
                currentCounts[digitIdx] = cnt;
                let addSum = powers[digitIdx][L] * BigInt(cnt);
                let newSum = currentSum + addSum;
                if (newSum > upper) break;
                
                let futureMinRest = 0n;
                if (digitIdx + 1 <= 9) {
                    for (let r = 0; r < (remaining - cnt); r++) futureMinRest += powers[digitIdx+1][L];
                }
                if (newSum + futureMinRest > upper) {
                    continue;
                }
                backtrack(digitIdx + 1, remaining - cnt, currentCounts, newSum);
            }
            currentCounts[digitIdx] = 0;
        }
        
        backtrack(0, L, initialCounts, 0n);
        
        // deduplica e ordina
        const uniqueMap = new Map();
        for (let num of results) {
            uniqueMap.set(num.toString(), num);
        }
        return Array.from(uniqueMap.values()).sort((a,b) => (a < b ? -1 : (a > b ? 1 : 0)));
    }
    
    // genera la dimostrazione completa formattata
    function buildDemonstration(numBig, L) {
        const numStr = numBig.toString();
        const digits = numStr.split('').map(ch => parseInt(ch, 10));
        const exponent = L;
        const terms = digits.map(d => `${d}<sup>${exponent}</sup>`);
        const sumOfPowers = digits.reduce((acc, d) => acc + powers[d][L], 0n);
        const equationString = terms.join(' + ');
        const sumValueStr = sumOfPowers.toString();
        const fullEquation = `${numStr} = ${equationString} = ${sumValueStr}`;
        return {
            numberStr: numStr,
            equationHTML: fullEquation,
            length: L
        };
    }
    
    // ---------- UI e corretta gestione dei plurali ----------
    const lengthInput = document.getElementById('lengthInput');
    const searchBtn = document.getElementById('searchBtn');
    const narcContainer = document.getElementById('narcListContainer');
    const statsTextSpan = document.getElementById('statsText');
    const timeBadge = document.getElementById('timeBadge');
    const timeElapsedSpan = document.getElementById('timeElapsed');
    
    function setLoading(isLoading, lengthVal) {
        if (isLoading) {
            narcContainer.innerHTML = `<div class="loading-message">
                <div style="font-size:2rem;">⏳</div>
                <p>Ricerca in corso per lunghezza ${lengthVal} ...<br>Algoritmo combinatorio avanzato</p>
            </div>`;
            statsTextSpan.innerHTML = `🔬 Ricerca in corso per L = ${lengthVal} ...`;
            timeBadge.style.display = 'none';
        }
    }
    
    // funzione per il plurale corretto
    function pluralize(count, singolare, plurale) {
        return count === 1 ? singolare : plurale;
    }
    
    function renderResults(length, numbersBig, elapsedMs) {
        if (!numbersBig || numbersBig.length === 0) {
            narcContainer.innerHTML = `<div class="empty-message">
                😢 Nessun numero narcisista trovato con ESATTAMENTE ${length} cifre.<br>
                <span style="font-size:0.8rem;">(range: 10^${length-1} a 10^${length}-1)</span>
            </div>`;
            const nessunoTesto = `Lunghezza ${length} → 0 numeri narcisisti.`;
            statsTextSpan.innerHTML = `📊 ${nessunoTesto}`;
            timeBadge.style.display = 'flex';
            timeElapsedSpan.innerHTML = `${elapsedMs} ms`;
            return;
        }
        
        const count = numbersBig.length;
        const numeroTesto = pluralize(count, 'numero', 'numeri');
        const trovatoTesto = pluralize(count, 'Trovato', 'Trovati');
        
        // generazione card per ogni numero con dimostrazione
        const cardsHTML = [];
        for (let numBig of numbersBig) {
            const demo = buildDemonstration(numBig, length);
            cardsHTML.push(`
                <div class="narc-demo-card">
                    <div class="narc-number">
                        🔢 ${demo.numberStr}
                        <span class="badge-length">${demo.length} cifre</span>
                    </div>
                    <div class="equation-full">
                        📐 <strong>Dimostrazione:</strong><br>
                        ${demo.equationHTML}
                        <div style="margin-top: 6px; font-size:0.75rem; color:#9dd6ff;">
                            ✅ Verifica: la somma delle potenze restituisce esattamente il numero.
                        </div>
                    </div>
                </div>
            `);
        }
        
        narcContainer.innerHTML = cardsHTML.join('');
        // stats con plurale corretto
        statsTextSpan.innerHTML = `🎯 ${trovatoTesto} ${count} ${numeroTesto} narcisista${count === 1 ? '' : 'i'} con esattamente ${length} cifre.`;
        timeBadge.style.display = 'flex';
        timeElapsedSpan.innerHTML = `${elapsedMs} ms`;
    }
    
    // ricerca asincrona
    async function performSearch() {
        let raw = lengthInput.value.trim();
        if (raw === "") {
            narcContainer.innerHTML = `<div class="error-message">⚠️ Inserisci una lunghezza valida (1-60).</div>`;
            statsTextSpan.innerHTML = `⚠️ Input vuoto`;
            timeBadge.style.display = 'none';
            return;
        }
        const L = parseInt(raw, 10);
        if (isNaN(L) || !Number.isInteger(L) || L < 1 || L > MAX_LEN) {
            narcContainer.innerHTML = `<div class="error-message">❌ Lunghezza non valida! Inserisci un intero da 1 a 60.</div>`;
            statsTextSpan.innerHTML = `🔴 Errore: range consentito 1-60`;
            timeBadge.style.display = 'none';
            return;
        }
        
        setLoading(true, L);
        await new Promise(r => setTimeout(r, 20));
        
        const startTime = performance.now();
        try {
            const results = findNarcissisticNumbersByLength(L);
            const endTime = performance.now();
            const elapsed = (endTime - startTime).toFixed(1);
            renderResults(L, results, elapsed);
        } catch (err) {
            console.error(err);
            narcContainer.innerHTML = `<div class="error-message">⚠️ Errore nel calcolo: ${err.message}</div>`;
            statsTextSpan.innerHTML = `⚠️ Errore durante l'elaborazione.`;
            timeBadge.style.display = 'none';
        }
    }
    
    // eventi
    searchBtn.addEventListener('click', () => performSearch());
    lengthInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
    
    // demo iniziale con lunghezza 3 (mostra 153,370,371,407)
    setTimeout(() => {
        lengthInput.value = "3";
        performSearch();
    }, 80);
})();