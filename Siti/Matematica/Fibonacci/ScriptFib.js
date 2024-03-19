function calculateFibonacci() {
    let numInput = document.getElementById("num-input");
    let outputDiv = document.getElementById("output");
    outputDiv.textContent = "";
    let fibNumbers = [1];

    let somma = 0;

    let num = parseInt(numInput.value);
    if (isNaN(num) || num < 0) {
        outputDiv.textContent = "Inserisci un numero valido.";
        return;
    }

    switch(num)
    {
        case 0:
            somma = 1;
            break;

        case 1:
            somma = 2;
            fibNumbers = [1, 1];
            break;
        
        default:
            fibNumbers = [1, 1];
            break;
    }

    Sequenza(num,outputDiv, somma, fibNumbers)

}

function Sequenza(num,outputDiv, somma, fibNumbers){
    for (let i = 2; i <= num; i++) {
        let nextFib = fibNumbers[i - 1] + fibNumbers[i - 2];
        fibNumbers.push(nextFib);

        somma = fibNumbers[i] + fibNumbers[i - 1];
    }

    let output = "";
    for (let i = 0; i < fibNumbers.length; i++) {
        output += fibNumbers[i];
        if (i !== fibNumbers.length - 1) {
            output += ", ";
        }
    }

    outputDiv.textContent = `Sequenza di Fibonacci: ${output}  , Somma : ${somma}`;
}