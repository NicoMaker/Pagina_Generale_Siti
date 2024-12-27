const partecipanti = [];
let modalitàVittoria = "max";

function aggiungiPartecipante() {
  const nome = document.getElementById("participant-name").value;
  if (nome.trim() !== "") {
    partecipanti.push({ nome, punti: 0 });
    aggiornaListaPartecipanti();
    aggiornaSelezionePartecipante();
    document.getElementById("participant-name").value = "";
  }
}

function aggiungiPunti() {
  const punti = parseFloat(document.getElementById("points").value),
    selectedParticipantIndex = document.getElementById(
      "selected-participant"
    ).value;
  if (!isNaN(punti)) {
    if (selectedParticipantIndex === "all")
      for (const partecipante of partecipanti) partecipante.punti += punti;
    else if (selectedParticipantIndex >= 0)
      partecipanti[selectedParticipantIndex].punti += punti;

    aggiornaListaPartecipanti();
    document.getElementById("points").value = "0";
  }
}

function togliPunti() {
  const punti = parseFloat(document.getElementById("points").value),
    selectedParticipantIndex = document.getElementById(
      "selected-participant"
    ).value;
  if (!isNaN(punti)) {
    if (selectedParticipantIndex === "all")
      for (const partecipante of partecipanti) partecipante.punti -= punti;
    else if (selectedParticipantIndex >= 0)
      partecipanti[selectedParticipantIndex].punti -= punti;
    aggiornaListaPartecipanti();
    document.getElementById("points").value = "0";
  }
}

function impostaModalitàVittoria(modalità) {
  modalitàVittoria = modalità;
  aggiornaListaPartecipanti();
}

function trovaVincitore() {
  let vincitore = null,
    massimoPunti = modalitàVittoria === "max" ? -Infinity : Infinity;

  for (const partecipante of partecipanti) {
    if (
      (modalitàVittoria === "max" && partecipante.punti > massimoPunti) ||
      (modalitàVittoria === "min" && partecipante.punti < massimoPunti)
    ) {
      vincitore = partecipante.nome;
      massimoPunti = partecipante.punti;
    } else if (partecipante.punti === massimoPunti) vincitore = "Pareggio";
  }

  alert(
    vincitore === "Pareggio"
      ? `${vincitore}`
      : vincitore
      ? `Il vincitore è: ${vincitore} 🏆🎉😊`
      : "Nessun vincitore."
  );
}

function aggiornaListaPartecipanti() {
  const listaPartecipanti = document.getElementById("participant-list");
  listaPartecipanti.innerHTML = "";

  // Ordinamento dei partecipanti in base alla modalità di vittoria
  partecipantiOrdinati = [...partecipanti].sort((a, b) =>
    modalitàVittoria === "max" ? b.punti - a.punti : a.punti - b.punti
  );

  // Creazione degli elementi per ogni partecipante
  partecipantiOrdinati.forEach((partecipante, index) => {
    const listItem = document.createElement("li");

    // Aggiungi il nome e i punti
    listItem.textContent = `${partecipante.nome} - Punti: ${partecipante.punti}`;

    // Creazione del bottone del cestino con classe 'trash-button'
    const trashButton = document.createElement("button");
    trashButton.textContent = "🗑️";
    trashButton.classList.add("trash-button"); // Aggiungi la classe trash-button
    trashButton.style.marginLeft = "10px";
    trashButton.onclick = () => eliminaPartecipante(index); // Funzione di eliminazione

    // Aggiungi il cestino all'elemento della lista
    listItem.appendChild(trashButton);

    // Aggiungi l'elemento alla lista dei partecipanti
    listaPartecipanti.appendChild(listItem);
  });
}

function aggiornaSelezionePartecipante() {
  const select = document.getElementById("selected-participant");
  select.innerHTML =
    '<option value="-1">Seleziona un partecipante</option><option value="all">Tutti</option>';

  partecipanti.forEach((partecipante, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = partecipante.nome;
    select.appendChild(option);
  });
}

function resettaPunti() {
  partecipanti.forEach((partecipante) => (partecipante.punti = 0));
  aggiornaListaPartecipanti();
}

function resettaTotale() {
  partecipanti.length = 0; // Reset all participants
  aggiornaListaPartecipanti();
  aggiornaSelezionePartecipante();
}

function eliminaPartecipante(index) {
  partecipanti.splice(index, 1); // Rimuove il partecipante dall'array
  aggiornaListaPartecipanti(); // Rende aggiornata la lista visualizzata
  aggiornaSelezionePartecipante(); // Rende aggiornata la selezione del partecipante
}

aggiornaSelezionePartecipante();
