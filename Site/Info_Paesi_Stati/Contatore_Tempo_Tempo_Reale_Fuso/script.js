const timezoneSelect = document.getElementById("timezone-select"),
  currentTimeDisplay = document.getElementById("current-time");

function updateCurrentTime() {
  const selectedTimezone = timezoneSelect.value,
    now = new Date(),
    options = {
      timeZone: selectedTimezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    },
    nowString = now.toLocaleString("it-IT", options);

  currentTimeDisplay.textContent = `Ora corrente: ${nowString}`;
}

timezoneSelect.addEventListener("change", updateCurrentTime);
updateCurrentTime();

setInterval(updateCurrentTime, 1);
