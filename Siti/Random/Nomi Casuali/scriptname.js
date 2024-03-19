var nomi = [];

function aggiungiNome() {
    var inputNome = document.getElementById("nomeInput").value;
    if (inputNome.trim() !== "") {
        nomi.push(inputNome);
        document.getElementById("nomiInseriti").textContent = "Nomi inseriti: " + nomi.join(", ");
        document.getElementById("nomeInput").value = ""; // Pulisce l'input
    }
}

function generaNomeCasuale() {
    if (nomi.length > 0) {
        var nomeCasuale = nomi[Math.floor(Math.random() * nomi.length)];
        document.getElementById("nomeCasuale").textContent = "Nome Casuale: " + nomeCasuale;
    }
}