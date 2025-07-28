document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM
  const calendarDays = document.getElementById("calendarDays");
  const currentMonthElement = document.getElementById("currentMonth");
  const prevMonthBtn = document.getElementById("prevMonthBtn");
  const nextMonthBtn = document.getElementById("nextMonthBtn");
  const todayBtn = document.getElementById("todayBtn");
  const eventModal = document.getElementById("eventModal");
  const confirmModal = document.getElementById("confirmModal");
  const modalTitle = document.getElementById("modalTitle");
  const eventsList = document.getElementById("eventsList");
  const newEventInput = document.getElementById("newEventInput");
  const eventTimeInput = document.getElementById("eventTimeInput");
  const addEventBtn = document.getElementById("addEventBtn");
  const clearEventsBtn = document.getElementById("clearEventsBtn");
  const closeModal = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const closeConfirmModal = document.getElementById("closeConfirmModal");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  const confirmMessage = document.getElementById("confirmMessage");

  // Variabili di stato
  const today = new Date();
  const selectedDate = new Date();
  let currentDateKey = "";
  let editingEventId = null;
  let deleteEventId = null;
  let deleteAllEvents = false;

  // Carica gli eventi dal localStorage
  function loadEvents() {
    const savedEvents = localStorage.getItem("calendarEvents");
    return savedEvents ? JSON.parse(savedEvents) : {};
  }

  // Salva gli eventi nel localStorage
  function saveEvents(events) {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }

  // Ottieni gli eventi per una data specifica
  function getEventsForDate(dateKey) {
    const events = loadEvents();
    return events[dateKey] || [];
  }

  // Salva gli eventi per una data specifica
  function saveEventsForDate(dateKey, dateEvents) {
    const events = loadEvents();
    if (dateEvents.length === 0) {
      delete events[dateKey]; // Rimuovi la chiave se non ci sono eventi
    } else {
      events[dateKey] = dateEvents;
    }
    saveEvents(events);
  }

  // Formatta la chiave della data (YYYY-MM-DD)
  function formatDateKey(year, month, day) {
    return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  }

  // Verifica se due date sono lo stesso giorno
  function isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // Ottieni il nome del mese
  function getMonthName(monthIndex) {
    const monthNames = [
      "Gennaio",
      "Febbraio",
      "Marzo",
      "Aprile",
      "Maggio",
      "Giugno",
      "Luglio",
      "Agosto",
      "Settembre",
      "Ottobre",
      "Novembre",
      "Dicembre",
    ];
    return monthNames[monthIndex];
  }

  // Genera un ID univoco per gli eventi
  function generateEventId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Formatta la data per la visualizzazione
  function formatDateForDisplay(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return `${day} ${getMonthName(month - 1)} ${year}`;
  }

  // Visualizza il calendario
  function displayCalendar() {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    // Aggiorna l'intestazione del mese
    currentMonthElement.textContent = `${getMonthName(month)} ${year}`;

    // Crea i giorni del calendario
    let calendarHTML = "";

    // Aggiungi celle vuote per i giorni prima del primo giorno del mese
    for (let i = 0; i < firstDay; i++) {
      calendarHTML += `<div class="calendar-day empty"></div>`;
    }

    // Aggiungi i giorni del mese
    for (let day = 1; day <= lastDay; day++) {
      const dateKey = formatDateKey(year, month + 1, day);
      const isToday = isSameDay(new Date(year, month, day), today);
      const events = getEventsForDate(dateKey);
      const hasEvent = events.length > 0;

      let dayClass = "calendar-day";
      if (isToday) dayClass += " today";
      if (hasEvent) dayClass += " has-event";

      let eventIndicator = "";
      if (hasEvent) {
        if (events.length <= 3) {
          // Mostra fino a 3 puntini per gli eventi
          eventIndicator = `<div class="event-indicator">
            ${Array(events.length).fill('<div class="event-dot"></div>').join("")}
          </div>`;
        } else {
          // Mostra il numero di eventi se sono più di 3
          eventIndicator = `<div class="event-count">${events.length}</div>`;
        }
      }

      calendarHTML += `
        <div class="${dayClass}" data-date="${dateKey}">
          <div class="day-number">${day}</div>
          ${eventIndicator}
        </div>
      `;
    }

    calendarDays.innerHTML = calendarHTML;

    // Aggiungi event listeners per i giorni del calendario
    document.querySelectorAll(".calendar-day:not(.empty)").forEach((day) => {
      day.addEventListener("click", handleDayClick);
    });
  }

  // Gestisci il click su un giorno
  function handleDayClick(event) {
    let dayElement = event.target;

    // Trova l'elemento del giorno se si è fatto clic su un elemento figlio
    while (dayElement && !dayElement.classList.contains("calendar-day")) {
      dayElement = dayElement.parentElement;
    }

    if (!dayElement || !dayElement.hasAttribute("data-date")) return;

    const dateKey = dayElement.getAttribute("data-date");
    showEventModal(dateKey);
  }

  // Mostra la modale degli eventi
  function showEventModal(dateKey) {
    currentDateKey = dateKey;
    const formattedDate = formatDateForDisplay(dateKey);
    modalTitle.textContent = `Impegni per il ${formattedDate}`;

    // Resetta i campi di input
    newEventInput.value = "";
    eventTimeInput.value = "";

    // Visualizza gli eventi esistenti
    displayEvents(dateKey);

    // Mostra la modale
    eventModal.classList.add("show");

    // Focus sull'input per il nuovo evento
    setTimeout(() => {
      newEventInput.focus();
    }, 300);
  }

  // Nascondi la modale degli eventi
  function hideEventModal() {
    eventModal.classList.remove("show");
    editingEventId = null;
  }

  // Mostra la modale di conferma
  function showConfirmModal(message, isDeleteAll = false, eventId = null) {
    confirmMessage.textContent = message;
    deleteAllEvents = isDeleteAll;
    deleteEventId = eventId;
    confirmModal.classList.add("show");
  }

  // Nascondi la modale di conferma
  function hideConfirmModal() {
    confirmModal.classList.remove("show");
    deleteAllEvents = false;
    deleteEventId = null;
  }

  // Visualizza gli eventi per una data specifica
  function displayEvents(dateKey) {
    const events = getEventsForDate(dateKey);

    if (events.length === 0) {
      eventsList.innerHTML = `<div class="no-events">Nessun impegno per questa data</div>`;
      return;
    }

    // Ordina gli eventi per orario
    events.sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });

    let eventsHTML = "";

    events.forEach((event) => {
      if (editingEventId === event.id) {
        // Mostra il form di modifica per l'evento selezionato
        eventsHTML += `
          <div class="event-item editing" data-id="${event.id}">
            <form class="edit-form">
              <input type="time" class="form-input edit-time" value="${event.time || ""}" id="editTime-${event.id}">
              <input type="text" class="form-input edit-description" value="${event.description}" id="editDesc-${event.id}">
              <div class="edit-actions">
                <button type="button" class="edit-btn save" data-id="${event.id}" aria-label="Salva">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                </button>
                <button type="button" class="edit-btn cancel" data-id="${event.id}" aria-label="Annulla">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        `;
      } else {
        // Mostra l'evento normalmente
        eventsHTML += `
          <div class="event-item" data-id="${event.id}">
            <div class="event-time">${event.time || ""}</div>
            <div class="event-description">${event.description}</div>
            <div class="event-actions">
              <button class="event-btn edit" data-id="${event.id}" aria-label="Modifica">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </button>
              <button class="event-btn delete" data-id="${event.id}" aria-label="Elimina">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        `;
      }
    });

    eventsList.innerHTML = eventsHTML;

    // Aggiungi event listeners per i pulsanti di modifica ed eliminazione
    document.querySelectorAll(".event-btn.edit").forEach((button) => {
      button.addEventListener("click", handleEditEvent);
    });

    document.querySelectorAll(".event-btn.delete").forEach((button) => {
      button.addEventListener("click", handleDeleteEvent);
    });

    document.querySelectorAll(".edit-btn.save").forEach((button) => {
      button.addEventListener("click", handleSaveEdit);
    });

    document.querySelectorAll(".edit-btn.cancel").forEach((button) => {
      button.addEventListener("click", handleCancelEdit);
    });
  }

  // Aggiungi un nuovo evento
  function addEvent() {
    const description = newEventInput.value.trim();
    const time = eventTimeInput.value;

    if (description === "") {
      alert("Inserisci una descrizione per l'impegno");
      return;
    }

    const events = getEventsForDate(currentDateKey);

    events.push({
      id: generateEventId(),
      description: description,
      time: time,
    });

    saveEventsForDate(currentDateKey, events);

    // Aggiorna la visualizzazione
    displayEvents(currentDateKey);
    displayCalendar();

    // Resetta i campi di input
    newEventInput.value = "";
    eventTimeInput.value = "";
    newEventInput.focus();
  }

  // Elimina tutti gli eventi per una data
  function clearEvents() {
    showConfirmModal(
      "Sei sicuro di voler eliminare tutti gli impegni per questa data?",
      true,
    );
  }

  // Gestisci il click per modificare un evento
  function handleEditEvent(e) {
    const eventId = e.currentTarget.getAttribute("data-id");
    editingEventId = eventId;
    displayEvents(currentDateKey);
  }

  // Gestisci il click per eliminare un evento
  function handleDeleteEvent(e) {
    const eventId = e.currentTarget.getAttribute("data-id");
    const events = getEventsForDate(currentDateKey);
    const event = events.find((e) => e.id === eventId);

    if (event) {
      showConfirmModal(
        `Sei sicuro di voler eliminare l'impegno "${event.description}"?`,
        false,
        eventId,
      );
    }
  }

  // Esegui l'eliminazione di un evento con animazione
  function deleteEvent(eventId) {
    const eventElement = document.querySelector(
      `.event-item[data-id="${eventId}"]`,
    );

    if (eventElement) {
      // Aggiungi la classe per l'animazione
      eventElement.classList.add("deleting");

      // Attendi che l'animazione finisca prima di rimuovere effettivamente l'evento
      setTimeout(() => {
        const events = getEventsForDate(currentDateKey);
        const updatedEvents = events.filter((event) => event.id !== eventId);
        saveEventsForDate(currentDateKey, updatedEvents);

        // Aggiorna la visualizzazione
        displayEvents(currentDateKey);
        displayCalendar();
      }, 500); // Durata dell'animazione
    }
  }

  // Esegui l'eliminazione di tutti gli eventi
  function deleteAllEventsForDate() {
    const eventElements = document.querySelectorAll(".event-item");

    if (eventElements.length === 0) {
      saveEventsForDate(currentDateKey, []);
      displayEvents(currentDateKey);
      displayCalendar();
      return;
    }

    // Aggiungi la classe per l'animazione a tutti gli elementi
    eventElements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add("deleting");
      }, index * 100); // Aggiungi un ritardo crescente per un effetto a cascata
    });

    // Attendi che tutte le animazioni finiscano
    setTimeout(
      () => {
        saveEventsForDate(currentDateKey, []);
        displayEvents(currentDateKey);
        displayCalendar();
      },
      eventElements.length * 100 + 500,
    );
  }

  // Gestisci il salvataggio di un evento modificato
  function handleSaveEdit(e) {
    const eventId = e.currentTarget.getAttribute("data-id");
    const timeInput = document.getElementById(`editTime-${eventId}`);
    const descInput = document.getElementById(`editDesc-${eventId}`);

    const newTime = timeInput.value;
    const newDesc = descInput.value.trim();

    if (newDesc === "") {
      alert("La descrizione non può essere vuota");
      return;
    }

    const events = getEventsForDate(currentDateKey);
    const updatedEvents = events.map((event) => {
      if (event.id === eventId) {
        return {
          ...event,
          time: newTime,
          description: newDesc,
        };
      }
      return event;
    });

    saveEventsForDate(currentDateKey, updatedEvents);
    editingEventId = null;
    displayEvents(currentDateKey);
  }

  // Gestisci l'annullamento della modifica di un evento
  function handleCancelEdit() {
    editingEventId = null;
    displayEvents(currentDateKey);
  }

  // Vai al mese corrente
  function goToToday() {
    selectedDate.setFullYear(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    displayCalendar();
  }

  // Inizializza il calendario
  displayCalendar();

  // Event listeners
  prevMonthBtn.addEventListener("click", () => {
    selectedDate.setMonth(selectedDate.getMonth() - 1);
    displayCalendar();
  });

  nextMonthBtn.addEventListener("click", () => {
    selectedDate.setMonth(selectedDate.getMonth() + 1);
    displayCalendar();
  });

  todayBtn.addEventListener("click", goToToday);

  // Event listeners per la modale degli eventi
  addEventBtn.addEventListener("click", addEvent);
  clearEventsBtn.addEventListener("click", clearEvents);
  closeModal.addEventListener("click", hideEventModal);
  cancelBtn.addEventListener("click", hideEventModal);

  // Event listeners per la modale di conferma
  closeConfirmModal.addEventListener("click", hideConfirmModal);
  cancelDeleteBtn.addEventListener("click", hideConfirmModal);

  confirmDeleteBtn.addEventListener("click", () => {
    if (deleteAllEvents) {
      deleteAllEventsForDate();
    } else if (deleteEventId) {
      deleteEvent(deleteEventId);
    }
    hideConfirmModal();
  });

  // Gestisci l'invio del form
  newEventInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addEvent();
    }
  });

  // Chiudi le modali quando si fa clic all'esterno
  eventModal.addEventListener("click", (e) => {
    if (
      e.target === eventModal ||
      e.target.classList.contains("modal-backdrop")
    ) {
      hideEventModal();
    }
  });

  confirmModal.addEventListener("click", (e) => {
    if (
      e.target === confirmModal ||
      e.target.classList.contains("modal-backdrop")
    ) {
      hideConfirmModal();
    }
  });

  // Aggiungi scorciatoie da tastiera
  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      prevMonthBtn.click();
    } else if (event.key === "ArrowRight") {
      nextMonthBtn.click();
    } else if (event.key === "Escape") {
      if (confirmModal.classList.contains("show")) {
        hideConfirmModal();
      } else if (eventModal.classList.contains("show")) {
        hideEventModal();
      }
    }
  });
});
