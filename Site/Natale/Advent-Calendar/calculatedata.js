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
      html += `<td class="${
        currentDay >= i ? "available" : "locked"
      }">${content}</td>`;
      if (i % 5 === 0) html += "</tr>";
    }

    table.innerHTML = html;

    // Aggiungi animazione al giorno corrente
    if (currentDay <= 25) {
      setTimeout(() => {
        const currentDayCell = document.querySelector(
          `td:nth-child(${((currentDay - 1) % 5) + 1}):nth-of-type(${Math.ceil(
            currentDay / 5,
          )})`,
        );
        if (currentDayCell) {
          currentDayCell.classList.add("today-pulse");
        }
      }, 500);
    }
  } else {
    let nextDecember = new Date(
      currentYear + (currentMonth >= 11 ? 1 : 0),
      11,
      1,
      0,
      0,
      0,
    );
    startCountdown(nextDecember);

    // Aggiungi un messaggio festivo
    const table = document.getElementById("calendarTable");
    table.innerHTML = `
      <tr>
        <td colspan="5" class="countdown-message">
          <div class="snow-container">
            <div class="snowflake">❄</div>
            <div class="snowflake">❅</div>
            <div class="snowflake">❆</div>
            <div class="snowflake">❄</div>
            <div class="snowflake">❅</div>
            <div class="snowflake">❆</div>
            <div class="snowflake">❄</div>
            <div class="snowflake">❅</div>
            <div class="snowflake">❆</div>
          </div>
          <h2>Merry Christmas!</h2>
          <p>Aspettando il calendario dell'avvento...</p>
        </td>
      </tr>
    `;
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
      <div class="countdown-container">
        <div class="countdown-box">
          <div class="countdown-value">${days}</div>
          <div class="countdown-label">${pluralize(
            days,
            "Giorno",
            "Giorni",
          )}</div>
        </div>
        <div class="countdown-box">
          <div class="countdown-value">${hours}</div>
          <div class="countdown-label">${pluralize(hours, "Ora", "Ore")}</div>
        </div>
        <div class="countdown-box">
          <div class="countdown-value">${minutes}</div>
          <div class="countdown-label">${pluralize(
            minutes,
            "Minuto",
            "Minuti",
          )}</div>
        </div>
        <div class="countdown-box">
          <div class="countdown-value">${seconds}</div>
          <div class="countdown-label">${pluralize(
            seconds,
            "Secondo",
            "Secondi",
          )}</div>
        </div>
      </div>
      <p class="countdown-message">all'apertura del calendario dell'avvento!</p>
    `;
  }

  let interval = setInterval(updateCountdown, 1000);
  updateCountdown();
}

function showDaysLeft(day, daysLeft) {
  if (daysLeft > 0) {
    const messageElement = document.createElement("div");
    messageElement.className = "day-message";
    messageElement.innerHTML = `
      <div class="message-content">
        <h3>${
          daysLeft === 1
            ? `Manca ${daysLeft} giorno`
            : `Mancano ${daysLeft} giorni`
        } al giorno ${day}</h3>
        <p>Torna presto per scoprire la sorpresa!</p>
        <button onclick="this.parentElement.parentElement.remove()">Chiudi</button>
      </div>
    `;
    document.body.appendChild(messageElement);

    // Aggiungi animazione e rimuovi dopo 5 secondi
    setTimeout(() => {
      messageElement.classList.add("show");
    }, 10);

    setTimeout(() => {
      messageElement.classList.remove("show");
      setTimeout(() => messageElement.remove(), 500);
    }, 5000);
  } else window.location.href = `Giorni/${day}.html`;
}

// Aggiungi effetti di neve
function createSnowfall() {
  const snowContainer = document.createElement("div");
  snowContainer.className = "snow-background";
  document.body.appendChild(snowContainer);

  for (let i = 0; i < 50; i++) {
    const snowflake = document.createElement("div");
    snowflake.className = "snow";
    snowflake.style.left = `${Math.random() * 100}%`;
    snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`;
    snowflake.style.animationDelay = `${Math.random() * 5}s`;
    snowflake.style.opacity = Math.random() * 0.8 + 0.2;
    snowflake.style.fontSize = `${Math.random() * 15 + 10}px`;
    snowflake.innerHTML = ["❄", "❅", "❆"][Math.floor(Math.random() * 3)];
    snowContainer.appendChild(snowflake);
  }
}

window.onload = function () {
  generateCalendarLinks();
  createSnowfall();

  // Aggiungi effetto audio
  const audioButton = document.createElement("button");
  audioButton.className = "audio-button";
  audioButton.innerHTML = "<span>🔔</span> Musica Natalizia";
  audioButton.onclick = toggleMusic;
  document.body.appendChild(audioButton);

  // Crea elemento audio
  const audioElement = document.createElement("audio");
  audioElement.id = "christmas-music";
  audioElement.loop = true;
  audioElement.volume = 0.5;
  audioElement.innerHTML = `
    <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mp3">
  `;
  document.body.appendChild(audioElement);
};

// Funzione per attivare/disattivare la musica
function toggleMusic() {
  const audio = document.getElementById("christmas-music");
  const button = document.querySelector(".audio-button");

  if (audio.paused) {
    audio.play();
    button.classList.add("playing");
    button.innerHTML = "<span>🔔</span> Ferma Musica";
  } else {
    audio.pause();
    button.classList.remove("playing");
    button.innerHTML = "<span>🔔</span> Musica Natalizia";
  }
}
