document.addEventListener("DOMContentLoaded", () => {
  const inputDate = document.getElementById("input-date");
  const nativeDatePicker = document.getElementById("native-date-picker");
  const datePickerBtn = document.getElementById("date-picker-btn");
  const checkBtn = document.getElementById("check-btn");
  const resultContainer = document.getElementById("result-container");
  const errorContainer = document.getElementById("error-container");
  const dayCards = document.querySelectorAll(".day-card");

  // Formatta la data nel formato GG/MM/AAAA
  function formatDate(date) {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Gestisce l'input della data con formattazione automatica
  inputDate.addEventListener("input", (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Rimuove tutti i caratteri non numerici

    if (value.length > 0) {
      // Formatta automaticamente con gli slash
      if (value.length <= 2) {
        // Solo giorno
        inputDate.value = value;
      } else if (value.length <= 4) {
        // Giorno e parte del mese
        inputDate.value = `${value.substring(0, 2)}/${value.substring(2)}`;
      } else {
        // Giorno, mese e anno
        inputDate.value = `${value.substring(0, 2)}/${value.substring(
          2,
          4,
        )}/${value.substring(4, 8)}`;
      }
    }
  });

  // Gestisce il click sul pulsante del date picker
  datePickerBtn.addEventListener("click", () => {
    // Rimuovi temporaneamente la classe hidden per assicurarti che il date picker sia interagibile
    nativeDatePicker.classList.remove("hidden");
    nativeDatePicker.focus();
    nativeDatePicker.click();

    // Aggiungi un timeout per nascondere nuovamente il date picker dopo che è stato mostrato
    // (questo è necessario per alcuni browser)
    setTimeout(() => {
      if (!nativeDatePicker.classList.contains("hidden")) {
        nativeDatePicker.classList.add("hidden");
      }
    }, 100);
  });

  // Gestisce la selezione della data dal date picker nativo
  nativeDatePicker.addEventListener("change", function () {
    const selectedDate = new Date(this.value);
    inputDate.value = formatDate(selectedDate);

    // Verifica automaticamente la data quando selezionata dal date picker
    checkDay();
  });

  // Gestisce l'invio del form con il tasto Enter
  inputDate.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      checkDay();
    }
  });

  // Funzione principale per verificare il giorno della data
  window.checkDay = () => {
    // Resetta lo stato attivo dei day cards
    dayCards.forEach((card) => card.classList.remove("active"));

    // Nasconde i container dei risultati
    resultContainer.classList.add("hidden");
    errorContainer.classList.add("hidden");

    // Ottiene il valore dell'input
    const inputDateValue = inputDate.value;

    // Verifica se l'input è vuoto
    if (!inputDateValue.trim()) {
      showError("Inserisci una data nel formato GG/MM/AAAA.");
      return;
    }

    // Divide la data in parti
    const parts = inputDateValue.split("/");

    // Verifica se il formato è corretto
    if (parts.length !== 3) {
      showError("Formato data non valido. Usa il formato GG/MM/AAAA.");
      return;
    }

    // Converte le parti in numeri
    const day = Number.parseInt(parts[0], 10);
    const month = Number.parseInt(parts[1], 10);
    const year = Number.parseInt(parts[2], 10);

    // Verifica se i numeri sono validi
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      showError("La data contiene valori non numerici.");
      return;
    }

    // Crea un oggetto Date
    const date = new Date(year, month - 1, day);

    // Verifica se la data è valida
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      showError("Data non valida. Verifica giorno, mese e anno.");
      return;
    }

    // Ottiene il giorno della settimana
    let dayOfWeek = date.toLocaleDateString("it-IT", { weekday: "long" });

    // Capitalizza la prima lettera
    dayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

    // Mostra il risultato
    showResult(`Il ${day}/${month}/${year} è ${dayOfWeek}`);

    // Evidenzia il giorno della settimana corrispondente
    highlightDay(dayOfWeek);

    // Aggiunge l'animazione di successo
    addSuccessAnimation();
  };

  // Mostra un messaggio di errore
  function showError(message) {
    document.getElementById("error-message").textContent = message;
    errorContainer.classList.remove("hidden");

    // Aggiunge l'animazione di shake all'input
    inputDate.classList.add("shake");
    setTimeout(() => {
      inputDate.classList.remove("shake");
    }, 500);
  }

  // Mostra il risultato
  function showResult(message) {
    document.getElementById("result").textContent = message;
    resultContainer.classList.remove("hidden");
  }

  // Evidenzia il giorno della settimana corrispondente
  function highlightDay(dayOfWeek) {
    dayCards.forEach((card) => {
      if (card.getAttribute("data-day") === dayOfWeek) {
        card.classList.add("active");

        // Scorre automaticamente alla card attiva
        card.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    });
  }

  // Aggiunge un'animazione di successo
  function addSuccessAnimation() {
    resultContainer.classList.add("pulse");
    setTimeout(() => {
      resultContainer.classList.remove("pulse");
    }, 500);
  }

  // Aggiunge la funzionalità di click alle day cards
  dayCards.forEach((card) => {
    card.addEventListener("click", function () {
      const dayName = this.getAttribute("data-day");
      inputDate.value = findNextDateForDay(dayName);
      checkDay();
    });
  });

  // Trova la prossima data per un determinato giorno della settimana
  function findNextDateForDay(dayName) {
    const daysOfWeek = [
      "Domenica",
      "Lunedì",
      "Martedì",
      "Mercoledì",
      "Giovedì",
      "Venerdì",
      "Sabato",
    ];
    const targetDayIndex = daysOfWeek.indexOf(dayName);

    if (targetDayIndex === -1) return "";

    const today = new Date();
    const todayDayIndex = today.getDay();

    // Calcola quanti giorni aggiungere per arrivare al giorno target
    let daysToAdd = targetDayIndex - todayDayIndex;
    if (daysToAdd <= 0) daysToAdd += 7; // Se è oggi o nel passato, vai alla prossima settimana

    // Crea la data target
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);

    // Formatta la data
    return formatDate(targetDate);
  }

  /* Aggiunge l'animazione di shake */
  /* Declaring keyframes here as they were flagged as undeclared */
  const style = document.createElement("style");
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .shake {
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    .pulse {
      animation: pulse 0.5s ease-in-out;
    }
  `;
  document.head.appendChild(style);
});
