function calculateEaster() {
    let yearInput = document.getElementById("year");
    let year = yearInput.value;

    // Algoritmo per il calcolo della data di Pasqua (Algoritmo di Meeus/Jones/Butcher)
    let a = year % 19;
    let b = Math.floor(year / 100);
    let c = year % 100;
    let d = Math.floor(b / 4);
    let e = b % 4;
    let f = Math.floor((b + 8) / 25);
    let g = Math.floor((b - f + 1) / 3);
    let h = (19 * a + b - d - g + 15) % 30;
    let i = Math.floor(c / 4);
    let k = c % 4;
    let l = (32 + 2 * e + 2 * i - h - k) % 7;
    let m = Math.floor((a + 11 * h + 22 * l) / 451);
    let n = Math.floor((h + l - 7 * m + 114) / 31);
    let p = (h + l - 7 * m + 114) % 31;

    let day = p + 1;
    let month = n;

    if(month == 4)
        month = "Aprile";
    else
        month = "Marzo"

    // Formattazione della data nel formato "gg/mm/aaaa"
    let formattedDate = `${day} ${month}`;

    // Visualizzazione del risultato
    let resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `La data di Pasqua per l'anno ${year} e' il ${formattedDate}`;
}