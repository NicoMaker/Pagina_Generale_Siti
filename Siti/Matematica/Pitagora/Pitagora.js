function calcola() {
    let inputType = document.getElementById("input-type").value;
    let risultatoElement = document.getElementById("risultato");
    risultatoElement.innerHTML = "";
    let cateto1 = parseFloat(document.getElementById("cateto1").value);
    let cateto2 = parseFloat(document.getElementById("cateto2").value);

    let ipotenusa = Math.sqrt(cateto1 * cateto1 + cateto2 * cateto2);
    risultatoElement.innerHTML = `L'ipotenusa è: ${ipotenusa.toFixed(2)}`;

    if (inputType === "ipotenusa") {
        ipotenusa(risultatoElement,cateto1,cateto2);

    } else if (inputType === "cateto") {
        Cateto(risultatoElement);
    }
}

document.getElementById("input-type").addEventListener("change", function () {
    let ipotenusaInputs = document.getElementById("ipotenusa-inputs");
    let catetoInputs = document.getElementById("cateto-inputs");

    if (this.value === "ipotenusa") {
        ipotenusaInputs.style.display = "block";
        catetoInputs.style.display = "none";
    } else if (this.value === "cateto") {
        ipotenusaInputs.style.display = "none";
        catetoInputs.style.display = "block";
    }
});

function Ipotenusa(risultatoElement,cateto1,cateto2)
{
    if (isNaN(cateto1) || isNaN(cateto2)) {
        risultatoElement.innerHTML = "Inserisci entrambi i cateti.";
        return;
    }

    let ipotenusa = Math.sqrt(cateto1 * cateto1 + cateto2 * cateto2);
    risultatoElement.innerHTML = `L'ipotenusa è: ${ipotenusa.toFixed(2)}`;
}

function Cateto(risultatoElement){
    let ipotenusa = parseFloat(document.getElementById("ipotenusa").value);
    let cateto = parseFloat(document.getElementById("cateto").value);

    if (isNaN(ipotenusa) || isNaN(cateto)) {
        risultatoElement.innerHTML = "Inserisci l'ipotenusa e il cateto.";
        return;
    }

    if (cateto > ipotenusa) {
        risultatoElement.innerHTML = "Il cateto deve essere minore o uguale all'ipotenusa.";
        return;
    }

    let altroCateto = Math.sqrt(ipotenusa * ipotenusa - cateto * cateto);
    risultatoElement.innerHTML = `L'altro cateto è: ${altroCateto.toFixed(2)}`;
}