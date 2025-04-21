// Funzione per aggiornare l'interfaccia con i valori calcolati
function updateTimeDisplay(years, months, days, hours, minutes, seconds, isInFuture) {
  // Aggiorna i valori nei rispettivi elementi
  document.getElementById("years").textContent = years
  document.getElementById("months").textContent = months
  document.getElementById("days").textContent = days
  document.getElementById("hours").textContent = hours
  document.getElementById("minutes").textContent = minutes
  document.getElementById("seconds").textContent = seconds

  // Aggiorna il testo del risultato
  const message = isInFuture
    ? `Mancano ${formatTimeText(years, months, days, hours, minutes, seconds)} alla data inserita.`
    : `Sono passati ${formatTimeText(years, months, days, hours, minutes, seconds)} dalla data inserita.`

  document.getElementById("risultato").textContent = message

  // Mostra il container del risultato
  document.getElementById("result-container").classList.remove("hidden")

  // Aggiungi animazione pulse alle unità di tempo
  const timeUnits = document.querySelectorAll(".time-unit")
  timeUnits.forEach((unit, index) => {
    setTimeout(() => {
      unit.classList.add("pulse")
      setTimeout(() => {
        unit.classList.remove("pulse")
      }, 1500)
    }, index * 100)
  })
}

// Funzione per formattare il testo del risultato
function formatTimeText(years, months, days, hours, minutes, seconds) {
  const parts = []

  if (years > 0) parts.push(`${years} ${years === 1 ? "anno" : "anni"}`)
  if (months > 0) parts.push(`${months} ${months === 1 ? "mese" : "mesi"}`)
  if (days > 0) parts.push(`${days} ${days === 1 ? "giorno" : "giorni"}`)
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? "ora" : "ore"}`)
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? "minuto" : "minuti"}`)
  if (seconds > 0) parts.push(`${seconds} ${seconds === 1 ? "secondo" : "secondi"}`)

  if (parts.length === 0) return "0 secondi"

  if (parts.length === 1) return parts[0]

  const lastPart = parts.pop()
  return `${parts.join(", ")} e ${lastPart}`
}

// Funzione principale per calcolare il tempo trascorso
function calcolaTempoTrascorso() {
  const inputData = new Date(document.getElementById("inputDate").value)

  // Verifica se la data è valida
  if (isNaN(inputData.getTime())) {
    document.getElementById("risultato").textContent = "Inserisci una data valida"
    document.getElementById("result-container").classList.remove("hidden")

    // Resetta i valori
    document.getElementById("years").textContent = "0"
    document.getElementById("months").textContent = "0"
    document.getElementById("days").textContent = "0"
    document.getElementById("hours").textContent = "0"
    document.getElementById("minutes").textContent = "0"
    document.getElementById("seconds").textContent = "0"
    return
  }

  // Ottieni la data corrente
  let dataCorrente = new Date()

  // Calcola la differenza di tempo
  const isInFuture = inputData > dataCorrente
  let differenzaTempo = isInFuture ? inputData - dataCorrente : dataCorrente - inputData

  // Calcola le unità di tempo
  let anni = Math.floor(differenzaTempo / (365.25 * 24 * 60 * 60 * 1000))
  let mesi = Math.floor((differenzaTempo % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000))
  let giorni = Math.floor((differenzaTempo % (30.44 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000))
  let ore = Math.floor((differenzaTempo % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  let minuti = Math.floor((differenzaTempo % (60 * 60 * 1000)) / (60 * 1000))
  let secondi = Math.floor((differenzaTempo % (60 * 1000)) / 1000)

  // Aggiorna l'interfaccia
  updateTimeDisplay(anni, mesi, giorni, ore, minuti, secondi, isInFuture)

  // Aggiorna in tempo reale se la data è nel futuro
  if (isInFuture) {
    // Cancella eventuali timer precedenti
    if (window.timeUpdateInterval) {
      clearInterval(window.timeUpdateInterval)
    }

    // Imposta un nuovo timer che aggiorna ogni secondo
    window.timeUpdateInterval = setInterval(() => {
      dataCorrente = new Date()
      differenzaTempo = inputData - dataCorrente

      // Se la data è passata, ferma l'aggiornamento e ricalcola
      if (differenzaTempo <= 0) {
        clearInterval(window.timeUpdateInterval)
        calcolaTempoTrascorso()
        return
      }

      anni = Math.floor(differenzaTempo / (365.25 * 24 * 60 * 60 * 1000))
      mesi = Math.floor((differenzaTempo % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000))
      giorni = Math.floor((differenzaTempo % (30.44 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000))
      ore = Math.floor((differenzaTempo % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
      minuti = Math.floor((differenzaTempo % (60 * 60 * 1000)) / (60 * 1000))
      secondi = Math.floor((differenzaTempo % (60 * 1000)) / 1000)

      updateTimeDisplay(anni, mesi, giorni, ore, minuti, secondi, true)
    }, 1000)
  } else {
    // Cancella eventuali timer se la data è nel passato
    if (window.timeUpdateInterval) {
      clearInterval(window.timeUpdateInterval)
    }
  }
}

// Imposta la data e ora corrente come valore predefinito
document.addEventListener("DOMContentLoaded", () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")

  const defaultValue = `${year}-${month}-${day}T${hours}:${minutes}`
  document.getElementById("inputDate").value = defaultValue
})

// Aggiungi event listener per calcolare quando si preme Invio
document.getElementById("inputDate").addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault()
    calcolaTempoTrascorso()
  }
})
