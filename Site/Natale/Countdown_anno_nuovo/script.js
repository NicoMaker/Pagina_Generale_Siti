document.addEventListener("DOMContentLoaded", function () {
  const dataCorrente = new Date(),
    annoCorrente = dataCorrente.getFullYear(),
    countDownDate = new Date(`Jan 1, ${annoCorrente + 1} 00:00:00`).getTime();

  const timerInterval = setInterval(function () {
    const now = new Date().getTime(),
      distance = countDownDate - now;

    if (
      distance > 0 &&
      dataCorrente.getMonth() === 0 &&
      dataCorrente.getDate() === 1
    )
      document.getElementById(
        "timer"
      ).innerHTML = `HAPPY NEW YEAR ${annoCorrente}`;
    else {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds = Math.floor((distance % (1000 * 60)) / 1000);

      document.getElementById(
        "timer"
      ).innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    if (distance < 0) {
      clearInterval(timerInterval);
      countDownDate = new Date(`Jan 2, ${annoCorrente + 1} 00:00:00`).getTime();
    }
  }, 1000);

  document.getElementById(
    "anno"
  ).innerHTML = `<p>&copy; ${annoCorrente} Il Mio Sito di Nuovo Anno</p>`;
});