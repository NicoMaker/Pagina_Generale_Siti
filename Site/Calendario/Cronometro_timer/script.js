let cronometro,
  cronometroDisplay = document.getElementById("cronometroDisplay"),
  seconds = 0,
  minutes = 0,
  hours = 0;

function startCronometro() {
  cronometro = setInterval(() => {
    seconds++;

    if (seconds >= 60) {
      seconds = 0;
      minutes++;
    }

    if (minutes >= 60) {
      minutes = 0;
      hours++;
    }

    cronometroDisplay.textContent = `${hours}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, 1000);
}

function stopCronometro() {
  clearInterval(cronometro);
  cronometro = null;
}

function Reset() {
  seconds = 0;
  minutes = 0;
  hours = 0;

  clearInterval(cronometro);
  cronometro = null;
  cronometroDisplay.textContent = `${hours}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return seconds, minutes, hours;
}

let timerDisplay = document.getElementById("timerDisplay"),
  stopButton;

function impostaTimer() {
  let ore = parseInt(document.getElementById("ore").value) || 0,
    minuti = parseInt(document.getElementById("minuti").value) || 0,
    secondi = parseInt(document.getElementById("secondi").value) || 0;

  let totaleSecondi = ore * 3600 + minuti * 60 + secondi;

  if (totaleSecondi <= 0) {
    alert("Inserisci un tempo valido");
    return;
  }

  let timer = setInterval(() => {
    totaleSecondi--;

    if (totaleSecondi <= 0) {
      clearInterval(timer);
      timerDisplay.textContent = "Tempo scaduto!";
      riproduciMessaggioVocale("Timer finito!");
    } else {
      let h = Math.floor(totaleSecondi / 3600),
        m = Math.floor((totaleSecondi % 3600) / 60),
        s = totaleSecondi % 60;

      timerDisplay.textContent = `${h}:${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
    }
  }, 1000);
}

function riproduciMessaggioVocale(messaggio) {
  let synthesis = window.speechSynthesis,
    utterance = new SpeechSynthesisUtterance(messaggio);
  synthesis.speak(utterance);
}

function stopTimer() {
  clearInterval(timer);
  timerDisplay.textContent = "";
  document.body.removeChild(stopButton);
}
