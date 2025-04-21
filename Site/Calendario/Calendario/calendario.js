document.addEventListener("DOMContentLoaded", () => {
  const calendarTable = document.getElementById("calendarTable").querySelector("tbody"),
    currentMonthElement = document.getElementById("currentMonth"),
    prevMonthBtn = document.getElementById("prevMonthBtn"),
    nextMonthBtn = document.getElementById("nextMonthBtn")

  const currentDate = new Date(),
    selectedDate = new Date(),
    events = loadEvents()

  // Funzione per salvare gli eventi nel localStorage
  function saveEvents() {
    localStorage.setItem("calendarEvents", JSON.stringify(events))
  }

  // Funzione per caricare gli eventi dal localStorage
  function loadEvents() {
    const savedEvents = localStorage.getItem("calendarEvents")
    return savedEvents ? JSON.parse(savedEvents) : {}
  }

  // Funzione per visualizzare il calendario
  function displayCalendar() {
    const year = selectedDate.getFullYear(),
      month = selectedDate.getMonth(),
      today = new Date(),
      firstDay = new Date(year, month, 1).getDay(),
      lastDay = new Date(year, month + 1, 0).getDate()

    // Aggiorna l'intestazione del mese
    currentMonthElement.textContent = `${getMonthName(month)} ${year}`

    // Crea le righe del calendario
    let calendarHTML = ""
    let dayCount = 1
    let rowCount = 0

    // Crea fino a 6 righe (per coprire tutti i possibili layout di mese)
    for (let row = 0; row < 6; row++) {
      if (dayCount > lastDay) break

      calendarHTML += "<tr>"

      for (let col = 0; col < 7; col++) {
        if ((row === 0 && col < firstDay) || dayCount > lastDay) {
          calendarHTML += "<td class='empty'></td>"
        } else {
          const dateKey = formatDateKey(year, month + 1, dayCount)
          const isToday = isSameDay(new Date(year, month, dayCount), today)
          const hasEvent = events[dateKey] ? true : false

          let cellClass = "cell"
          if (isToday) cellClass += " today"
          if (hasEvent) cellClass += " has-event"

          let eventText = ""
          if (hasEvent) {
            eventText = `<div class="event-text" title="${events[dateKey]}">${truncateText(events[dateKey], 10)}</div>`
          }

          calendarHTML += `<td class='${cellClass}' data-date='${dateKey}'>
            <div class="day-number">${dayCount}</div>
            ${eventText}
          </td>`

          dayCount++
        }
      }

      calendarHTML += "</tr>"
      rowCount++
    }

    calendarTable.innerHTML = calendarHTML

    // Aggiungi animazione di fade-in
    setTimeout(() => {
      calendarTable.classList.add("fade-in")
    }, 10)
  }

  // Funzione per formattare la chiave della data (YYYY-MM-DD)
  function formatDateKey(year, month, day) {
    return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
  }

  // Funzione per verificare se due date sono lo stesso giorno
  function isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  // Funzione per troncare il testo
  function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  // Funzione per ottenere il nome del mese
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
    ]
    return monthNames[monthIndex]
  }

  // Funzione per gestire il click su una cella del calendario
  function handleCellClick(event) {
    let cell = event.target

    // Trova la cella padre se si è fatto clic su un elemento figlio
    while (cell && !cell.hasAttribute("data-date")) {
      cell = cell.parentElement
      if (cell.tagName === "TR" || cell.tagName === "TBODY" || cell.tagName === "TABLE") {
        return // Clic fuori da una cella valida
      }
    }

    if (!cell || !cell.hasAttribute("data-date")) return

    const dateKey = cell.getAttribute("data-date")
    const [year, month, day] = dateKey.split("-").map(Number)
    const clickedDate = new Date(year, month - 1, day)
    const formattedDate = `${day} ${getMonthName(month - 1)} ${year}`

    if (events[dateKey]) {
      // Se esiste già un evento, chiedi se rimuoverlo
      if (confirm(`Impegno per il ${formattedDate}:\n"${events[dateKey]}"\n\nVuoi rimuovere questo impegno?`)) {
        delete events[dateKey]
        saveEvents()
        displayCalendar()
      }
    } else {
      // Se non esiste un evento, chiedi di aggiungerne uno
      const input = prompt(`Inserisci un impegno per il ${formattedDate}:`)
      if (input !== null && input.trim() !== "") {
        events[dateKey] = input.trim()
        saveEvents()
        displayCalendar()
      }
    }
  }

  // Inizializza il calendario
  displayCalendar()

  // Event listeners
  prevMonthBtn.addEventListener("click", () => {
    selectedDate.setMonth(selectedDate.getMonth() - 1)
    calendarTable.classList.remove("fade-in")
    setTimeout(() => {
      displayCalendar()
    }, 10)
  })

  nextMonthBtn.addEventListener("click", () => {
    selectedDate.setMonth(selectedDate.getMonth() + 1)
    calendarTable.classList.remove("fade-in")
    setTimeout(() => {
      displayCalendar()
    }, 10)
  })

  // Delega degli eventi per le celle del calendario
  calendarTable.addEventListener("click", handleCellClick)

  // Aggiungi scorciatoie da tastiera
  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      prevMonthBtn.click()
    } else if (event.key === "ArrowRight") {
      nextMonthBtn.click()
    }
  })
})
