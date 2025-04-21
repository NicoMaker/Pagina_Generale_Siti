let dinosauri = [],
  indiceCorrente = 0,
  dinosauroCorrente = {},
  indiceIndizioCorrente = 0,
  dinoSelezionato = null;

async function caricaDinosauri() {
  try {
    const response = await fetch("Dinosauri.json");
    dinosauri = await response.json();
    dinosauroCorrente = dinosauri[indiceCorrente];

    // Imposta il primo indizio
    mostraIndizio();

    // Popola il selettore classico
    popolaSelettore();

    // Genera le card dei dinosauri
    generaDinoCards();
  } catch (error) {
    console.error("Errore nel caricamento dei dati dei dinosauri:", error);
  }
}

function mostraIndizio() {
  const indizio = dinosauroCorrente.indizi[indiceIndizioCorrente];
  document.getElementById("hint").textContent = indizio;

  // Aggiorna il contatore degli indizi
  document.getElementById("currentHintIndex").textContent =
    indiceIndizioCorrente + 1;
  document.getElementById("totalHints").textContent =
    dinosauroCorrente.indizi.length;

  // Disabilita il pulsante se siamo all'ultimo indizio
  const nextHintBtn = document.getElementById("nextHintBtn");
  if (indiceIndizioCorrente >= dinosauroCorrente.indizi.length - 1) {
    nextHintBtn.disabled = true;
    nextHintBtn.classList.add("disabled");
  } else {
    nextHintBtn.disabled = false;
    nextHintBtn.classList.remove("disabled");
  }
}

function mostraProssimoIndizio() {
  if (indiceIndizioCorrente < dinosauroCorrente.indizi.length - 1) {
    indiceIndizioCorrente++;
    mostraIndizio();
  }
}

function popolaSelettore() {
  const selettore = document.getElementById("dinosaurSelector");
  selettore.innerHTML = ""; // Pulisci il selettore

  // Aggiungi un'opzione vuota
  const opzioneVuota = document.createElement("option");
  opzioneVuota.value = "";
  opzioneVuota.textContent = "Seleziona un dinosauro...";
  selettore.appendChild(opzioneVuota);

  // Aggiungi le opzioni dei dinosauri
  dinosauri.forEach((dinosauro, index) => {
    const opzione = document.createElement("option");
    opzione.value = index;
    opzione.textContent = dinosauro.nome;
    selettore.appendChild(opzione);
  });
}

function generaDinoCards() {
  const dinoGrid = document.getElementById("dinoGrid");
  dinoGrid.innerHTML = ""; // Pulisci la griglia

  dinosauri.forEach((dinosauro, index) => {
    const card = document.createElement("div");
    card.className = "dino-card";
    card.dataset.index = index;
    card.onclick = () => selezionaDinoCard(index);

    const iniziale = dinosauro.nome.charAt(0);

    card.innerHTML = `
            <div class="dino-icon">${iniziale}</div>
            <div class="dino-name">${dinosauro.nome}</div>
        `;

    dinoGrid.appendChild(card);
  });
}

function selezionaDinoCard(index) {
  // Rimuovi la classe selected da tutte le card
  document.querySelectorAll(".dino-card").forEach((card) => {
    card.classList.remove("selected");
  });

  // Aggiungi la classe selected alla card selezionata
  const selectedCard = document.querySelector(
    `.dino-card[data-index="${index}"]`
  );
  if (selectedCard) {
    selectedCard.classList.add("selected");
  }

  // Aggiorna il selettore classico
  document.getElementById("dinosaurSelector").value = index;

  // Salva l'indice del dinosauro selezionato
  dinoSelezionato = index;
}

function selezionaDinosauro() {
  const selettore = document.getElementById("dinosaurSelector");
  const index = selettore.value;

  if (index !== "") {
    // Seleziona la card corrispondente
    selezionaDinoCard(index);
  } else {
    // Deseleziona tutte le card
    document.querySelectorAll(".dino-card").forEach((card) => {
      card.classList.remove("selected");
    });
    dinoSelezionato = null;
  }
}

function filtraDinosauri() {
  const searchInput = document.getElementById("searchInput");
  const filter = searchInput.value.toLowerCase();

  document.querySelectorAll(".dino-card").forEach((card) => {
    const dinoName = card.querySelector(".dino-name").textContent.toLowerCase();
    if (dinoName.includes(filter)) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
}

function controllaIndovinello() {
  if (dinoSelezionato === null) {
    // Mostra un messaggio di errore se nessun dinosauro è selezionato
    mostraRisultato(false, "Seleziona un dinosauro prima di controllare!");
    return;
  }

  const indovinelloUtente = dinosauri[dinoSelezionato].nome.toLowerCase();
  const corretto = indovinelloUtente === dinosauroCorrente.nome.toLowerCase();

  if (corretto) {
    mostraRisultato(
      true,
      `Corretto! Hai indovinato ${dinosauroCorrente.nome}!`
    );
  } else {
    mostraRisultato(
      false,
      `Sbagliato! La risposta corretta era ${dinosauroCorrente.nome}.`
    );
  }
}

function mostraRisultato(corretto, messaggio) {
  const risultatoContainer = document.getElementById("risultatoContainer");
  const risultatoTesto = document.getElementById("risultatoTesto");
  const risultatoDiv = document.getElementById("risultato");

  // Imposta il messaggio
  risultatoTesto.textContent = messaggio;
  risultatoTesto.className = corretto
    ? "risultato-testo correct"
    : "risultato-testo incorrect";

  // Imposta l'immagine
  if (corretto) {
    risultatoDiv.innerHTML =
      '<img src="Img/Immagine_contenta.jpg" alt="Corretto">';
  } else {
    risultatoDiv.innerHTML =
      '<img src="Img/Immagine_scontenta.jpg" alt="Sbagliato">';
  }

  // Mostra il container
  risultatoContainer.classList.remove("hidden");
  setTimeout(() => {
    risultatoContainer.classList.add("visible");
  }, 10);
}

function chiudiRisultato() {
  const risultatoContainer = document.getElementById("risultatoContainer");
  risultatoContainer.classList.remove("visible");
  setTimeout(() => {
    risultatoContainer.classList.add("hidden");
  }, 300);
}

function nuovoDinosauro() {
  // Passa al prossimo dinosauro
  indiceCorrente = (indiceCorrente + 1) % dinosauri.length;
  dinosauroCorrente = dinosauri[indiceCorrente];

  // Resetta l'indice dell'indizio
  indiceIndizioCorrente = 0;

  // Mostra il primo indizio
  mostraIndizio();

  // Deseleziona tutte le card
  document.querySelectorAll(".dino-card").forEach((card) => {
    card.classList.remove("selected");
  });

  // Resetta il selettore
  document.getElementById("dinosaurSelector").value = "";

  // Resetta il dinosauro selezionato
  dinoSelezionato = null;

  // Chiudi il risultato se è aperto
  chiudiRisultato();
}

// Carica i dinosauri all'avvio
document.addEventListener("DOMContentLoaded", caricaDinosauri);
