function generateCalendarLinks() {
  let currentDate = new Date(),
    currentDay = currentDate.getDate(),
    month = currentDate.getMonth(),
    table = document.getElementById("calendarTable"),
    html = "";

  if (month === 11) {
    for (let i = 1; i <= 25; i++) {
      let content = "";
      if (currentDay >= i) content = `<a href="Giorni/${i}.html">${i}</a>`;
      else {
        let daysLeft = i - currentDay;
        content = `<a href="#" onclick="showDaysLeft(${i}, ${daysLeft});">${i}</a>`;
      }

      if ((i - 1) % 5 === 0) html += "<tr>";
      html += `<td>${content}</td>`;

      if (i % 5 === 0) html += "</tr>";
    }
  } else
    document.getElementById(
      "dati"
    ).innerHTML = ` <p> Nel mese di Dicembre troverete i giorni dove poter vedere il calendario </p>`;
  table.innerHTML = html;
}

function showDaysLeft(day, daysLeft) {
  if (daysLeft > 0) alert(`Mancano ${daysLeft} giorni al giorno ${day}`);
  else window.location.href = `Giorni/${day}.html`;
}

window.onload = generateCalendarLinks;
