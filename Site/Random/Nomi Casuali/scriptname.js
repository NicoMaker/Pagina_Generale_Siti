let nomi = [];

function aggiornaListaNomi() {
  let lista = document.getElementById("nomiInseriti");
  lista.innerHTML = ""; // Svuota la lista prima di aggiornarla

  nomi.forEach((nome, index) => {
    let li = document.createElement("li");
    li.textContent = nome;

    let cestino = document.createElement("span");
    cestino.textContent = " 🗑️";
    cestino.style.cursor = "pointer";
    cestino.onclick = function () {
      rimuoviNome(index);
    };

    li.appendChild(cestino);
    lista.appendChild(li);
  });
}

function aggiungiNome() {
  let inputNome = document.getElementById("nomeInput").value;
  if (inputNome.trim() !== "") {
    nomi.push(inputNome);
    aggiornaListaNomi();
    document.getElementById("nomeInput").value = ""; // Pulisce l'input
  }
}

function rimuoviNome(index) {
  nomi.splice(index, 1);
  aggiornaListaNomi();
}

function generaNomeCasuale() {
  if (nomi.length > 0) {
    let nomeCasuale = nomi[Math.floor(Math.random() * nomi.length)];
    document.getElementById(
      "nomeCasuale"
    ).textContent = `Nome Casuale: ${nomeCasuale}`;
  }
}

document
  .getElementById("generateButton")
  .addEventListener("click", function () {
    const randomGenerator = setInterval(generaNomeCasuale, 150);

    setTimeout(() => {
      clearInterval(randomGenerator);
      generaNomeCasuale();
    }, 500);
  });
