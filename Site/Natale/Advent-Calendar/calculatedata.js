function generateCalendarLinks() {
  let currentDate = new Date(Date.now()),
    currentDay = currentDate.getDate(),
    currentMonth = currentDate.getMonth(),
    currentYear = currentDate.getFullYear(),
    table = document.getElementById("calendarTable"),
    html = "";

  if (currentMonth === 11) {
    for (let i = 1; i <= 25; i++) {
      let content =
        currentDay > i
          ? `<a href="Giorni/${i}.html">${i}</a>`
          : currentDay === i
          ? `<a href="Giorni/${i}.html">${i}</a>`
          : `<a href="#" onclick="showDaysLeft(${i}, ${
              i - currentDay
            });">${i}</a>`;

      if ((i - 1) % 5 === 0) html += "<tr>";
      html += `<td>${content}</td>`;
      if (i % 5 === 0) html += "</tr>";
    }

    table.innerHTML = html;
  } else {
    let nextDecember = new Date(
      currentYear + (currentMonth >= 11 ? 1 : 0),
      11,
      1,
      0,
      0,
      0
    );
    startCountdown(nextDecember);
  }
}

function startCountdown(targetDate) {
  let countdownElement = document.getElementById("dati");

  function updateCountdown() {
    let currentDate = new Date(),
      diffTime = targetDate - currentDate;

    if (diffTime <= 0) {
      countdownElement.innerHTML =
        "<p>Il calendario dell'avvento è iniziato!</p>";
      clearInterval(interval);
      return;
    }

    let days = Math.floor(diffTime / (1000 * 60 * 60 * 24)),
      hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60)),
      seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

    const pluralize = (value, singular, plural) =>
      value === 1 ? singular : plural;

    countdownElement.innerHTML = `
      <p>${pluralize(days, "Manca", "Mancano")}  ${days} ${pluralize(days, "giorno", "giorni")}, 
      ${hours} ${pluralize(hours, "ora", "ore")}, 
      ${minutes} ${pluralize(minutes, "minuto", "minuti")} e 
      ${seconds} ${pluralize(seconds, "secondo", "secondi")} 
      all'apertura del calendario dell'avvento!</p>
    `;
  }

  let interval = setInterval(updateCountdown, 1000);
  updateCountdown();
}

function showDaysLeft(day, daysLeft) {
  daysLeft > 0
    ? alert(
        `Manca ${daysLeft} ${
          daysLeft === 1 ? "giorno" : "giorni"
        } al giorno ${day}`
      )
    : (window.location.href = `Giorni/${day}.html`);
}

window.onload = generateCalendarLinks;
