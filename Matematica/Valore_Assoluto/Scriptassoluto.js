function calculateFactorial() {
    let numberInput = document.getElementById('number');
    let resultDiv = document.getElementById('result');
    let result = "";

    let number = parseInt(numberInput.value);

    if (isNaN(number)) {
        resultDiv.textContent = 'Inserisci un numero valido.';
        return;
    }

    if(number < 0)
        result = number * -1;
    else
        result = number;


    resultDiv.textContent = `Il valore assoluto di ${number} è : ${result}`;
}
