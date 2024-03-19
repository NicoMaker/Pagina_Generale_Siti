function calcolaLogaritmo() {
    let numero = parseFloat(document.getElementById('number').value);
    let base = parseFloat(document.getElementById('base').value);

    let risultato = Math.log(numero) / Math.log(base);

    document.getElementById('result').innerHTML = `Il logaritmo di ${numero} in base ${base} è: ${risultato}`;
}