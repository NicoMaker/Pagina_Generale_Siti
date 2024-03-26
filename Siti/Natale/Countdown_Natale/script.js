document.addEventListener("DOMContentLoaded", function () {
  let dataCorrente = new Date(),
    annoCorrente = dataCorrente.getFullYear();

  if (dataCorrente.getMonth() == 11 && dataCorrente.getDate() >= 26)
    annoCorrente++;

  let countDownDate = new Date(`Dec 25, ${annoCorrente} 00:00:00`).getTime(),
    x = setInterval(function () {
      let now = new Date().getTime(),
        distance = countDownDate - now,
        days = Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById(
          "timer"
        ).innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      if (distance < 0) {
        clearInterval(x);
        document.getElementById("timer").innerHTML = "MERRY CHRISTMAS!!";
      }
    }, 1000);

  let anno = `
        <p>&copy; ${annoCorrente} Il Mio Sito di Natale</p>`;
  document.getElementById("anno").innerHTML = anno;
});
