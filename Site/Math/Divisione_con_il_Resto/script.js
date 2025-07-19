document.getElementById('divisionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const dividendo = parseInt(document.getElementById('dividendo').value, 10);
    const divisore = parseInt(document.getElementById('divisore').value, 10);
    const resultDiv = document.getElementById('result');
    const stepsDiv = document.getElementById('steps');
    stepsDiv.innerHTML = '';

    if (isNaN(dividendo) || isNaN(divisore) || divisore === 0) {
        resultDiv.textContent = 'Inserisci numeri validi e un divisore diverso da zero!';
        return;
    }

    const quoziente = Math.floor(dividendo / divisore);
    const resto = dividendo % divisore;

    resultDiv.textContent = `${dividendo} ÷ ${divisore} = ${quoziente} con resto di ${resto}`;

    // Spiegazione passo-passo
    let stepsHtml = `<ol>`;
    stepsHtml += `<li>Dividiamo ${dividendo} per ${divisore}.</li>`;
    stepsHtml += `<li>Vediamo quante volte ${divisore} sta in ${dividendo} senza superarlo: <b>${quoziente} volte</b>.</li>`;
    stepsHtml += `<li>Moltiplichiamo: ${divisore} × ${quoziente} = ${divisore * quoziente}.</li>`;
    stepsHtml += `<li>Sottraiamo: ${dividendo} - ${divisore * quoziente} = ${resto}.</li>`;
    stepsHtml += `<li>Quindi il <b>resto</b> è ${resto}.</li>`;
    stepsHtml += `</ol>`;
    stepsDiv.innerHTML = stepsHtml;
}); 