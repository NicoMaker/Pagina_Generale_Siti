const timezoneSelect = document.getElementById("timezone-select"),
  currentTimeDisplay = document.getElementById("current-time");

function updateCurrentTime() {
  const selectedTimezone = timezoneSelect.value,
    now = new Date(),
    options = {
      timeZone: selectedTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
      hour12: false,
    },
    nowString = now.toLocaleString("it-IT", options),
    timezoneOffset = now
      .toLocaleTimeString("it-IT", {
        timeZone: selectedTimezone,
      })
      .split(" ")[2];

  currentTimeDisplay.textContent = `Ora corrente: ${nowString}`;
}

timezoneSelect.addEventListener("change", updateCurrentTime);
updateCurrentTime();

setInterval(updateCurrentTime, 1);
