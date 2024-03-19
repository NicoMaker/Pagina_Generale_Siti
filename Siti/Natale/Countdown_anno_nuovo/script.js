document.addEventListener("DOMContentLoaded", function () {
  let dataCorrente = new Date();
  let annoCorrente = dataCorrente.getFullYear();

  let countDownDate = new Date(`Jan 1, ${annoCorrente + 1} 00:00:00`).getTime();

  let x = setInterval(function () {
    let now = new Date().getTime();
    let distance = countDownDate - now;

    if (
      distance > 0 &&
      dataCorrente.getMonth() == 0 &&
      dataCorrente.getDate() == 1
    )
      document.getElementById(
        "timer"
      ).innerHTML = `HAPPY NEW YEAR ${annoCorrente}`;
    else {
      let days = Math.floor(distance / (1000 * 60 * 60 * 24));
      let hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);

      document.getElementById("timer").innerHTML =
        days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
    }

    if (distance < 0) {
      clearInterval(x);
      countDownDate = new Date(`Jan 2, ${annoCorrente + 1} 00:00:00`).getTime();
    }
  }, 1000);

  let anno = `
    <p>&copy; ${annoCorrente} Il Mio Sito di Nuovo Anno</p>`;
  document.getElementById("anno").innerHTML = anno;
});
