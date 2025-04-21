document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM per il selettore di fusi orari
  const timezoneSelect = document.getElementById("timezone-select");
  const timeDisplay = document.getElementById("time");
  const dateDisplay = document.getElementById("date");
  const timezoneInfoDisplay = document.getElementById("timezone-info");
  const timezoneButtons = document.querySelectorAll(".timezone-button");

  // Formatta l'ora in base al fuso orario selezionato
  function updateCurrentTime() {
    const selectedTimezone = timezoneSelect.value;
    const now = new Date();

    // Opzioni per la formattazione dell'ora
    const timeOptions = {
      timeZone: selectedTimezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    // Opzioni per la formattazione della data
    const dateOptions = {
      timeZone: selectedTimezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    // Formatta l'ora e la data
    const timeString = now.toLocaleTimeString("it-IT", timeOptions);
    const dateString = now.toLocaleDateString("it-IT", dateOptions);

    // Ottieni informazioni sul fuso orario
    const timezoneOffset = getTimezoneOffset(selectedTimezone);

    // Aggiorna i display
    timeDisplay.textContent = timeString;
    dateDisplay.textContent = capitalizeFirstLetter(dateString);
    timezoneInfoDisplay.textContent = timezoneOffset;

    // Aggiorna il pulsante attivo
    updateActiveButton(selectedTimezone);
  }

  // Ottieni l'offset del fuso orario in formato UTC+/-X
  function getTimezoneOffset(timezone) {
    const now = new Date();
    const options = { timeZone: timezone, timeZoneName: "short" };
    const timeString = now.toLocaleString("en-US", options);
    const match = timeString.match(/[A-Z]{3,4}$/);

    if (match) {
      return match[0];
    } else {
      // Fallback: estrai l'offset dal testo della select
      const selectedOption =
        timezoneSelect.options[timezoneSelect.selectedIndex];
      const offsetMatch = selectedOption.text.match(/UTC([+-]\d+)/);
      return offsetMatch ? `UTC${offsetMatch[1]}` : "";
    }
  }

  // Capitalizza la prima lettera di una stringa
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Aggiorna il pulsante attivo
  function updateActiveButton(selectedTimezone) {
    timezoneButtons.forEach((button) => {
      if (button.dataset.timezone === selectedTimezone) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }

  // Event Listeners
  timezoneSelect.addEventListener("change", updateCurrentTime);

  // Event Listener per i pulsanti dei fusi orari
  timezoneButtons.forEach((button) => {
    button.addEventListener("click", () => {
      timezoneSelect.value = button.dataset.timezone;
      updateCurrentTime();
    });
  });

  // Imposta Roma come fuso orario predefinito
  timezoneSelect.value = "Europe/Rome";

  // Aggiorna l'ora ogni secondo
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
});
