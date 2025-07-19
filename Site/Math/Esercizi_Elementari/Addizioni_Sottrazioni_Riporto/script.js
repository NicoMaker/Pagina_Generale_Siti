// Gestione addizione e sottrazione con riporto/prestito, con spiegazione passo-passo

document.getElementById('addSotForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const numA = document.getElementById('numA').value;
    const numB = document.getElementById('numB').value;
    const op = document.getElementById('op').value;
    const addSotResult = document.getElementById('addSotResult');
    const addSotSteps = document.getElementById('addSotSteps');
    if (!numA || !numB) {
        addSotResult.textContent = 'Inserisci due numeri validi!';
        addSotSteps.innerHTML = '';
        return;
    }
    let a = numA.split('').reverse().map(Number);
    let b = numB.split('').reverse().map(Number);
    let maxLen = Math.max(a.length, b.length);
    let stepsHtml = '<ol>';
    if (op === 'add') {
        let carry = 0, res = [];
        for (let i = 0; i < maxLen; i++) {
            let sum = (a[i] || 0) + (b[i] || 0) + carry;
            stepsHtml += `<li>${(a[i] || 0)} + ${(b[i] || 0)} + riporto ${carry} = ${sum} (scrivo ${sum % 10}, riporto ${Math.floor(sum / 10)})</li>`;
            res.push(sum % 10);
            carry = Math.floor(sum / 10);
        }
        if (carry) { res.push(carry); stepsHtml += `<li>Riporto finale: ${carry}</li>`; }
        let result = res.reverse().join('');
        addSotResult.textContent = `${numA} + ${numB} = ${result}`;
    } else {
        let res = [], borrow = 0;
        let aCopy = a.slice();
        for (let i = 0; i < maxLen; i++) {
            let ai = (aCopy[i] || 0) - borrow;
            let bi = (b[i] || 0);
            if (ai < bi) {
                ai += 10;
                borrow = 1;
                stepsHtml += `<li>${(aCopy[i] || 0)} - ${bi} non si può, prendo 1 in prestito: ${ai} - ${bi} = ${ai - bi} (riporto 1)</li>`;
            } else {
                stepsHtml += `<li>${(aCopy[i] || 0)} - ${bi} = ${ai - bi} (nessun prestito)</li>`;
                borrow = 0;
            }
            res.push(ai - bi);
        }
        while (res.length > 1 && res[res.length - 1] === 0) res.pop();
        let result = res.reverse().join('');
        addSotResult.textContent = `${numA} - ${numB} = ${result}`;
    }
    stepsHtml += '</ol>';
    addSotSteps.innerHTML = stepsHtml;
}); 