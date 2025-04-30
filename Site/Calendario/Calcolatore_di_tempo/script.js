// Variabile globale per l'intervallo di aggiornamento
let updateInterval = null;
// Variabili per le date di riferimento
let data1 = null;
let data2 = null;
// Flag per indicare se il conteggio è attivo
let conteggioAttivo = false;

// Funzione per impostare le date di default
function impostaDateDefault() {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + 7); // Data futura di una settimana

  document.getElementById("inputDate1").value = formatDateForInput(now);
  document.getElementById("inputDate2").value = formatDateForInput(futureDate);
}

// Funzione per formattare la data per l'input datetime-local
function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Funzione per aggiornare l'interfaccia con i valori calcolati
function updateTimeDisplay(
  years,
  months,
  days,
  hours,
  minutes,
  seconds,
  isInFuture
) {
  // Aggiorna i valori nei rispettivi elementi con animazione
  updateValueWithAnimation("years", years);
  updateValueWithAnimation("months", months);
  updateValueWithAnimation("days", days);
  updateValueWithAnimation("hours", hours);
  updateValueWithAnimation("minutes", minutes);
  updateValueWithAnimation("seconds", seconds);

  // Aggiorna l'indicatore di direzione
  const directionIndicator = document.getElementById("direction-indicator");
  if (isInFuture) {
    directionIndicator.textContent = "⏱️ Conteggio in avanti (tempo rimanente)";
    directionIndicator.className = "direction-indicator future";
  } else {
    directionIndicator.textContent =
      "⏱️ Conteggio all'indietro (tempo trascorso)";
    directionIndicator.className = "direction-indicator past";
  }

  // Aggiorna il testo del risultato
  const message = isInFuture
    ? `Mancano ${formatTimeText(
        years,
        months,
        days,
        hours,
        minutes,
        seconds
      )} dalla data ${formatDateForDisplay(
        data1
      )} alla data ${formatDateForDisplay(data2)}.`
    : `Sono passati ${formatTimeText(
        years,
        months,
        days,
        hours,
        minutes,
        seconds
      )} dalla data ${formatDateForDisplay(
        data2
      )} alla data ${formatDateForDisplay(data1)}.`;

  document.getElementById("risultato").textContent = message;

  // Mostra il container del risultato
  document.getElementById("result-container").classList.remove("hidden");
}

// Funzione per aggiornare un valore con animazione se è cambiato
function updateValueWithAnimation(elementId, newValue) {
  const element = document.getElementById(elementId);
  const currentValue = Number.parseInt(element.textContent);

  if (currentValue !== newValue) {
    element.textContent = newValue;
    element.classList.add("update-flash");
    setTimeout(() => {
      element.classList.remove("update-flash");
    }, 500);
  }
}

// Funzione per formattare la data per la visualizzazione
function formatDateForDisplay(date) {
  return date.toLocaleDateString("it-IT", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Funzione per formattare il testo del risultato
function formatTimeText(years, months, days, hours, minutes, seconds) {
  const parts = [];

  if (years > 0) parts.push(`${years} ${years === 1 ? "anno" : "anni"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "mese" : "mesi"}`);
  if (days > 0) parts.push(`${days} ${days === 1 ? "giorno" : "giorni"}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? "ora" : "ore"}`);
  if (minutes > 0)
    parts.push(`${minutes} ${minutes === 1 ? "minuto" : "minuti"}`);
  if (seconds > 0)
    parts.push(`${seconds} ${seconds === 1 ? "secondo" : "secondi"}`);

  if (parts.length === 0) return "0 secondi";

  if (parts.length === 1) return parts[0];

  const lastPart = parts.pop();
  return `${parts.join(", ")} e ${lastPart}`;
}

// Funzione per avviare il conteggio in tempo reale
function avviaConteggio() {
  // Ferma qualsiasi conteggio precedente
  fermaConteggio();

  // Ottieni le date inserite
  data1 = new Date(document.getElementById("inputDate1").value);
  data2 = new Date(document.getElementById("inputDate2").value);

  // Verifica se le date sono valide
  if (isNaN(data1.getTime()) || isNaN(data2.getTime())) {
    document.getElementById("risultato").textContent = "Inserisci date valide";
    document.getElementById("result-container").classList.remove("hidden");
    resetTimeValues();
    return;
  }

  // Imposta il flag di conteggio attivo
  conteggioAttivo = true;

  // Esegui il primo aggiornamento
  aggiornaConteggio();

  // Imposta l'intervallo per aggiornare il conteggio ogni secondo
  updateInterval = setInterval(aggiornaConteggio, 1000);
}

// Funzione per aggiornare il conteggio
function aggiornaConteggio() {
  if (!conteggioAttivo) return;

  // Ottieni la data corrente
  const now = new Date();

  // Determina se il conteggio è in avanti o indietro
  // Se data1 è più recente di data2, contiamo all'indietro (quanto tempo è passato)
  // Se data2 è più recente di data1, contiamo in avanti (quanto tempo manca)
  const isInFuture = data1 < data2;

  // Calcola la differenza di tempo
  let differenzaTempo;

  if (isInFuture) {
    // Conteggio in avanti: quanto tempo manca da ora a data2
    differenzaTempo = data2 - now;

    // Se la data2 è già passata, inverti il conteggio
    if (differenzaTempo < 0) {
      differenzaTempo = Math.abs(differenzaTempo);
      updateTimeDisplay(
        ...calcolaUnitaTempo(differenzaTempo),
        false // Ora è nel passato
      );
      return;
    }
  } else {
    // Conteggio all'indietro: quanto tempo è passato da data2 a ora
    differenzaTempo = now - data2;
  }

  // Calcola le unità di tempo
  updateTimeDisplay(...calcolaUnitaTempo(differenzaTempo), isInFuture);
}

// Funzione per calcolare le unità di tempo da una differenza in millisecondi
function calcolaUnitaTempo(differenzaMillisecondi) {
  const anni = Math.floor(
    differenzaMillisecondi / (365.25 * 24 * 60 * 60 * 1000)
  );
  const mesi = Math.floor(
    (differenzaMillisecondi % (365.25 * 24 * 60 * 60 * 1000)) /
      (30.44 * 24 * 60 * 60 * 1000)
  );
  const giorni = Math.floor(
    (differenzaMillisecondi % (30.44 * 24 * 60 * 60 * 1000)) /
      (24 * 60 * 60 * 1000)
  );
  const ore = Math.floor(
    (differenzaMillisecondi % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
  );
  const minuti = Math.floor(
    (differenzaMillisecondi % (60 * 60 * 1000)) / (60 * 1000)
  );
  const secondi = Math.floor((differenzaMillisecondi % (60 * 1000)) / 1000);

  return [anni, mesi, giorni, ore, minuti, secondi];
}

// Funzione per fermare il conteggio
function fermaConteggio() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  conteggioAttivo = false;
}

// Funzione per resettare i valori delle unità di tempo
function resetTimeValues() {
  document.getElementById("years").textContent = "0";
  document.getElementById("months").textContent = "0";
  document.getElementById("days").textContent = "0";
  document.getElementById("hours").textContent = "0";
  document.getElementById("minutes").textContent = "0";
  document.getElementById("seconds").textContent = "0";
}

// Inizializza l'applicazione quando il DOM è caricato
document.addEventListener("DOMContentLoaded", () => {
  // Imposta le date di default
  impostaDateDefault();

  // Aggiungi event listener per calcolare quando si preme Invio
  document
    .getElementById("inputDate1")
    .addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("inputDate2").focus();
      }
    });

  document
    .getElementById("inputDate2")
    .addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        avviaConteggio();
      }
    });
});
