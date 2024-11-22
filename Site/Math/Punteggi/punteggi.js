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

  if (vincitore) alert(`Il vincitore è: ${vincitore} 🏆🎉😊`);
  else alert("Nessun vincitore.");
}

function aggiornaListaPartecipanti() {
  const listaPartecipanti = document.getElementById("participant-list");
  (listaPartecipanti.innerHTML = ""),
    (partecipantiOrdinati = [...partecipanti].sort((a, b) =>
      modalitàVittoria === "max" ? b.punti - a.punti : a.punti - b.punti
    ));

  for (const partecipante of partecipantiOrdinati) {
    const listItem = document.createElement("li");
    listItem.textContent = `${partecipante.nome} - Punti: ${partecipante.punti}`;
    listaPartecipanti.appendChild(listItem);
  }
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

aggiornaSelezionePartecipante();
