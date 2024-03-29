const partecipanti = [];

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
    if (selectedParticipantIndex === "all") {
      // Aggiungi punti a tutti i partecipanti
      for (const partecipante of partecipanti) partecipante.punti += punti;
    } else if (selectedParticipantIndex >= 0)
      // Aggiungi punti solo al partecipante selezionato
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
    if (selectedParticipantIndex === "all") {
      // Togli punti a tutti i partecipanti
      for (const partecipante of partecipanti) partecipante.punti -= punti;
    } else if (selectedParticipantIndex >= 0)
      // Togli punti solo al partecipante selezionato
      partecipanti[selectedParticipantIndex].punti -= punti;
    aggiornaListaPartecipanti();
    document.getElementById("points").value = "0";
  }
}

function trovaVincitore() {
  let vincitore = null,
    massimoPunti = -Infinity;

  for (const partecipante of partecipanti) {
    if (partecipante.punti > massimoPunti) {
      vincitore = partecipante.nome;
      massimoPunti = partecipante.punti;
    } else if (partecipante.punti === massimoPunti) vincitore = "Pareggio";
  }

  if (vincitore) alert(`Il vincitore è: ${vincitore}`);
  else alert("Nessun vincitore.");
}

function aggiornaListaPartecipanti() {
  const listaPartecipanti = document.getElementById("participant-list");
  listaPartecipanti.innerHTML = "";

  for (const partecipante of partecipanti) {
    const listItem = document.createElement("li");
    listItem.textContent = `${partecipante.nome} - Punti: ${partecipante.punti}`;
    listaPartecipanti.appendChild(listItem);
  }
}

function aggiornaSelezionePartecipante() {
  const select = document.getElementById("selected-participant");
  select.innerHTML = '<option value="-1">Seleziona un partecipante</option>';
  select.innerHTML += '<option value="all">Tutti</option>';

  for (let i = 0; i < partecipanti.length; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = partecipanti[i].nome;
    select.appendChild(option);
  }
}

aggiornaSelezionePartecipante();
