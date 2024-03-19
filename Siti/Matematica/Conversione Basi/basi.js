function convert() {
    const inputNumber = document.getElementById('inputNumber').value;
    const fromBase = parseInt(document.getElementById('selectFromBase').value);
    const toBase = parseInt(document.getElementById('selectToBase').value);

    // Converti il numero nella base di origine alla base 10
    const base10Number = parseInt(inputNumber, fromBase);

    // Converti il numero dalla base 10 alla base di destinazione
    const convertedNumber = base10Number.toString(toBase);

    document.getElementById('outputNumber').value = convertedNumber;
}