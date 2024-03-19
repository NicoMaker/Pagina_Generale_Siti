function generaNumeri4() {
    var numeroDadi = parseInt(document.getElementById('numero-dadi').value);
    var sommaTotale = 0;
    var somma = "";

    for (var i = 0; i < numeroDadi; i++) {
        var numeroCasuale = Math.floor(Math.random() * 4) + 1; // Genera un numero casuale tra 1 e 4
        sommaTotale += numeroCasuale;

        var risultato = "<div class=\"triangolo\"><div class=\"figure-container\">" + "<span class=\"number\">" + numeroCasuale + "</span>" + "</div>" + "</div>";
        somma += "<p>" + risultato + "</p>";
    }

    document.getElementById("risultato").innerHTML = somma;
    document.getElementById('somma-totale').innerHTML = sommaTotale;
}

function generaNumeri6() {
    var numeroDadi = parseInt(document.getElementById('numero-dadi').value);
    var sommaTotale = 0;
    var somma = "";

    for (var i = 0; i < numeroDadi; i++) {
        var numeroCasuale = Math.floor(Math.random() * 6) + 1; // Genera un numero casuale tra 1 e 6
        sommaTotale += numeroCasuale;

        var risultato = "<div class=\"quadrato\"><div class=\"figure-container\">" + "<span class=\"number\">" + numeroCasuale + "</span>" + "</div>" + "</div>";
        somma += "<p>" + risultato + "</p>";
    }

    document.getElementById("risultato").innerHTML = somma;
    document.getElementById('somma-totale').innerHTML = sommaTotale;
}

function generaNumeri8() {
    var numeroDadi = parseInt(document.getElementById('numero-dadi').value);
    var sommaTotale = 0;
    var somma = "";

    for (var i = 0; i < numeroDadi; i++) {
        var numeroCasuale = Math.floor(Math.random() * 8) + 1; // Genera un numero casuale tra 1 e 8
        sommaTotale += numeroCasuale;

        var risultato = "<div class=\"triangolo\"><div class=\"figure-container\">" + "<span class=\"number\">" + numeroCasuale + "</span>" + "</div>" + "</div>";
        somma += "<p>" + risultato + "</p>";
    }

    document.getElementById("risultato").innerHTML = somma;
    document.getElementById('somma-totale').innerHTML = sommaTotale;
}

function generaNumeri10() {
    var numeroDadi = parseInt(document.getElementById('numero-dadi').value);
    var sommaTotale = 0;
    var somma = "";

    for (var i = 0; i < numeroDadi; i++) {
        var numeroCasuale = Math.floor(Math.random() * 10) + 1; // Genera un numero casuale tra 1 e 10
        sommaTotale += numeroCasuale;

        var risultato = "<div class=\"rombo\"><div class=\"figure-container\">" + "<span class=\"number\">" + numeroCasuale + "</span>" + "</div>" + "</div>";
        somma += "<p>" + risultato + "</p>";
    }

    document.getElementById("risultato").innerHTML = somma;
    document.getElementById('somma-totale').innerHTML = sommaTotale;
}

function generaNumeri12() {
    var numeroDadi = parseInt(document.getElementById('numero-dadi').value);
    var sommaTotale = 0;
    var somma = "";

    for (var i = 0; i < numeroDadi; i++) {
        var numeroCasuale = Math.floor(Math.random() * 12) + 1; // Genera un numero casuale tra 1 e 12
        sommaTotale += numeroCasuale;

        var risultato = "<div class=\"pentagono\"><div class=\"figure-container\">" + "<span class=\"number\">" + numeroCasuale + "</span>" + "</div>" + "</div>";
        somma += "<p>" + risultato + "</p>";
    }

    document.getElementById("risultato").innerHTML = somma;
    document.getElementById('somma-totale').innerHTML = sommaTotale;
}

function generaNumeri20() {
    var numeroDadi = parseInt(document.getElementById('numero-dadi').value);
    var sommaTotale = 0;
    var somma = "";

    for (var i = 0; i < numeroDadi; i++) {
        var numeroCasuale = Math.floor(Math.random() * 20) + 1; // Genera un numero casuale tra 1 e 20
        sommaTotale += numeroCasuale;

        var risultato = "<div class=\"esagono\"><div class=\"figure-container\">" + "<span class=\"number\">" + numeroCasuale + "</span>" + "</div>" + "</div>";
        somma += "<p>" + risultato + "</p>";
    }

    document.getElementById("risultato").innerHTML = somma;
    document.getElementById('somma-totale').innerHTML = sommaTotale;
}

function generaNumeri100() {
    var numeroDadi = parseInt(document.getElementById('numero-dadi').value);
    var sommaTotale = 0;
    var somma = "";

    for (var i = 0; i < numeroDadi; i++) {
        var numeroCasuale = Math.floor(Math.random() * 100) + 1; // Genera un numero casuale tra 1 e 100
        sommaTotale += numeroCasuale;

        var risultato = "<div class=\"rombo\"><div class=\"figure-container\">" + "<span class=\"number\">" + numeroCasuale + "</span>" + "</div>" + "</div>";
        somma += "<p>" + risultato + "</p>";
    }

    document.getElementById("risultato").innerHTML = somma;
    document.getElementById('somma-totale').innerHTML = sommaTotale;
}

function generaNumerin() {
    var numeroDadi = parseInt(document.getElementById('numero-dadi').value);
    var n = parseInt(document.getElementById('facce-dadi').value);

    var sommaTotale = 0;
    var somma = "";

    for (var i = 0; i < numeroDadi; i++) {
        var numeroCasuale = Math.floor(Math.random() * n) + 1; // Genera un numero casuale tra 1 e n facce
        sommaTotale += numeroCasuale;

        var risultato = "<div class=\"cerchio\"><div class=\"figure-container\">" + "<span class=\"number\">" + numeroCasuale + "</span>" + "</div>" + "</div>";
        somma += "<p>" + risultato + "</p>";
    }

    document.getElementById("risultato").innerHTML = somma;
    document.getElementById('somma-totale').innerHTML = sommaTotale;
}