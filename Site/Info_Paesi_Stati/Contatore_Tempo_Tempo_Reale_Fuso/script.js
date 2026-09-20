// ---------------------------------------------------------------
// Sigle dei fusi orari: [ora standard, ora legale]
// Se c'è una sola sigla, quel fuso non usa l'ora legale.
// ---------------------------------------------------------------
const TZ_ABBR = {
  "Pacific/Midway": ["SST"],
  "Pacific/Honolulu": ["HST"],
  "America/Anchorage": ["AKST", "AKDT"],
  "America/Los_Angeles": ["PST", "PDT"],
  "America/Denver": ["MST", "MDT"],
  "America/Chicago": ["CST", "CDT"],
  "America/New_York": ["EST", "EDT"],
  "America/Caracas": ["VET"],
  "America/Santiago": ["CLT", "CLST"],
  "America/Sao_Paulo": ["BRT"],
  "Atlantic/Azores": ["AZOT", "AZOST"],
  "Europe/London": ["GMT", "BST"],
  "Europe/Rome": ["CET", "CEST"],
  "Europe/Paris": ["CET", "CEST"],
  "Europe/Helsinki": ["EET", "EEST"],
  "Europe/Moscow": ["MSK"],
  "Asia/Dubai": ["GST"],
  "Asia/Karachi": ["PKT"],
  "Asia/Dhaka": ["BDT"],
  "Asia/Jakarta": ["WIB"],
  "Asia/Shanghai": ["CST"],
  "Asia/Tokyo": ["JST"],
  "Australia/Sydney": ["AEST", "AEDT"],
  "Pacific/Noumea": ["NCT"],
  "Pacific/Auckland": ["NZST", "NZDT"],
};

// Offset (in minuti) di un fuso orario rispetto a UTC in un dato momento
function getOffsetMinutes(timezone, date) {
  const parts = {};
  new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  })
    .formatToParts(date)
    .forEach((p) => (parts[p.type] = p.value));

  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  const realUTC = Math.floor(date.getTime() / 1000) * 1000;
  return Math.round((asUTC - realUTC) / 60000);
}

// Per i fusi non presenti nella lista: prova a ricavare la sigla dal browser
function fallbackAbbr(timezone) {
  let firstFound = "";
  for (const locale of ["en-US", "en-GB"]) {
    try {
      const name = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        timeZoneName: "short",
      })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value;
      if (!name) continue;
      if (/^[A-Z]{2,5}$/.test(name)) return name; // sigla vera (es. CEST)
      if (!firstFound) firstFound = name; // es. "GMT+5:30"
    } catch (e) {
      /* ignora */
    }
  }
  return firstFound;
}

// Restituisce la sigla corretta (ora solare o legale) di un fuso orario
function getTimezoneAbbr(timezone) {
  const entry = TZ_ABBR[timezone];
  if (!entry) return fallbackAbbr(timezone);
  if (entry.length === 1) return entry[0];

  const now = new Date();
  const year = now.getUTCFullYear();
  const jan = getOffsetMinutes(timezone, new Date(Date.UTC(year, 0, 1)));
  const jul = getOffsetMinutes(timezone, new Date(Date.UTC(year, 6, 1)));
  const current = getOffsetMinutes(timezone, now);
  const standardOffset = Math.min(jan, jul);

  return current > standardOffset ? entry[1] : entry[0];
}

// Rileva il fuso orario del dispositivo dell'utente
function detectUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Rome";
  } catch (e) {
    return "Europe/Rome";
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM per il selettore di fusi orari
  const timezoneSelect = document.getElementById("timezone-select");
  const timeDisplay = document.getElementById("time");
  const dateDisplay = document.getElementById("date");
  const timezoneInfoDisplay = document.getElementById("timezone-info");
  const timezoneButtons = document.querySelectorAll(".timezone-button");

  // Sostituisce "(UTC-4)" nelle voci della select con la sigla (EDT, CEST...)
  Array.from(timezoneSelect.options).forEach((option) => {
    const city = option.textContent.replace(/\s*\(.*\)\s*$/, "").trim();
    option.textContent = `${city} (${getTimezoneAbbr(option.value)})`;
  });

  // Fuso orario automatico: quello del dispositivo dell'utente
  const userTimezone = detectUserTimezone();
  const isInList = Array.from(timezoneSelect.options).some(
    (option) => option.value === userTimezone,
  );

  // Se il fuso dell'utente non è nella lista, lo aggiungo in cima
  if (!isInList) {
    const city = userTimezone.split("/").pop().replace(/_/g, " ");
    const option = document.createElement("option");
    option.value = userTimezone;
    option.textContent = `${city} (${getTimezoneAbbr(userTimezone)}) - il tuo fuso`;
    timezoneSelect.insertBefore(option, timezoneSelect.firstChild);
  }

  timezoneSelect.value = userTimezone;

  // Formatta l'ora in base al fuso orario selezionato
  function updateCurrentTime() {
    const selectedTimezone = timezoneSelect.value;
    const now = new Date();

    const timeOptions = {
      timeZone: selectedTimezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    const dateOptions = {
      timeZone: selectedTimezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const timeString = now.toLocaleTimeString("it-IT", timeOptions);
    const dateString = now.toLocaleDateString("it-IT", dateOptions);

    timeDisplay.textContent = timeString;
    dateDisplay.textContent = capitalizeFirstLetter(dateString);
    timezoneInfoDisplay.textContent = getTimezoneAbbr(selectedTimezone);

    updateActiveButton(selectedTimezone);
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

  timezoneButtons.forEach((button) => {
    button.addEventListener("click", () => {
      timezoneSelect.value = button.dataset.timezone;
      updateCurrentTime();
    });
  });

  // Aggiorna l'ora ogni secondo
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
});
