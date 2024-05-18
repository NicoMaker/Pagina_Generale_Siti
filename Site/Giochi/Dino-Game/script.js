let dinosauri = [],
  indiceCorrente = 0,
  dinosauroCorrente = {},
  stampaImg = "";

async function caricaDinosauri() {
  try {
    const response = await fetch("dinosauri.json");
    dinosauri = await response.json();
    dinosauroCorrente = dinosauri[indiceCorrente];
    document.getElementById("hint").textContent = dinosauroCorrente.indizi[0];
    popolaSelettore();
  } catch (error) {
    console.error("Errore nel caricamento dei dati dei dinosauri:", error);
  }
}

function controllaIndovinello() {
  const selezionato = document.getElementById("dinosaurSelector"),
    indovinelloUtente = dinosauri[selezionato.value].nome.toLowerCase();

  if (indovinelloUtente === dinosauroCorrente.nome.toLowerCase()) {
    stampaImg = '<img src="Img/Immagine_contenta.jpg">';
    document.getElementById("risultato").innerHTML = stampaImg;
  } else {
    stampaImg = '<img src="Img/Immagine_scontenta.jpg">';
    document.getElementById("risultato").innerHTML = stampaImg;
  }
}

function nuovoDinosauro() {
  indiceCorrente = (indiceCorrente + 1) % dinosauri.length;
  dinosauroCorrente = dinosauri[indiceCorrente];

  const indizioCasualeIndex = Math.floor(
      Math.random() * dinosauroCorrente.indizi.length
    ),
    indizioCasuale = dinosauroCorrente.indizi[indizioCasualeIndex];

  document.getElementById("hint").textContent = indizioCasuale;
  document.getElementById("risultato").textContent = "";
  document.getElementById("guessInput").value = "";
}

function popolaSelettore() {
  const selettore = document.getElementById("dinosaurSelector");

  dinosauri.forEach((dinosauro, index) => {
    const opzione = document.createElement("option");
    opzione.value = index;
    opzione.textContent = dinosauro.nome;
    selettore.appendChild(opzione);
  });
}

function selezionaDinosauro() {
  indiceCorrente = document.getElementById("dinosaurSelector").value;
  dinosauroCorrente = dinosauri[indiceCorrente];
  const indizi = dinosauroCorrente.indizi,
    tuttiGliIndizi = indizi.join(", ");
  document.getElementById("hint").textContent = tuttiGliIndizi;
  document.getElementById("risultato").textContent = "";
  document.getElementById("guessInput").value = "";
}

caricaDinosauri();
