// Gestione moltiplicazione in colonna con spiegazione passo-passo

document.getElementById('multForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const num1 = document.getElementById('num1').value;
    const num2 = document.getElementById('num2').value;
    const multResult = document.getElementById('multResult');
    const multSteps = document.getElementById('multSteps');
    if (!num1 || !num2) {
        multResult.textContent = 'Inserisci due numeri validi!';
        multSteps.innerHTML = '';
        return;
    }
    // Inverti le cifre per simulare la moltiplicazione in colonna
    let n1 = num1.split('').reverse();
    let n2 = num2.split('').reverse();
    let partials = [];
    let stepsHtml = '<ol>';
    for (let i = 0; i < n2.length; i++) {
        let carry = 0;
        let row = '';
        for (let j = 0; j < n1.length; j++) {
            let prod = (+n2[i]) * (+n1[j]) + carry;
            row = (prod % 10) + row;
            carry = Math.floor(prod / 10);
        }
        if (carry > 0) row = carry + row;
        row += '0'.repeat(i);
        partials.push(row);
        stepsHtml += `<li>${n2[i]} × ${num1} = ${row}</li>`;
    }
    stepsHtml += '</ol>';
    let sum = partials.reduce((acc, val) => acc + parseInt(val), 0);
    multResult.textContent = `${num1} × ${num2} = ${sum}`;
    multSteps.innerHTML = stepsHtml + `<b>Somma i risultati parziali: ${partials.join(' + ')} = ${sum}</b>`;
}); 