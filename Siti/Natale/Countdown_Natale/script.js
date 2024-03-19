document.addEventListener("DOMContentLoaded", function () {
  let dataCorrente = new Date();
  let annoCorrente = dataCorrente.getFullYear();

  if (dataCorrente.getMonth() == 11 && dataCorrente.getDate() >= 26)
    annoCorrente++;

  let countDownDate = new Date(`Dec 25, ${annoCorrente} 00:00:00`).getTime();
  let x = setInterval(function () {
    let now = new Date().getTime();
    let distance = countDownDate - now;

    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("timer").innerHTML =
      days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

    if (distance < 0) {
      clearInterval(x);
      document.getElementById("timer").innerHTML = "MERRY CHRISTMAS!!";
    }
  }, 1000);

  let anno = `
        <p>&copy; ${annoCorrente} Il Mio Sito di Natale</p>`;
  document.getElementById("anno").innerHTML = anno;
});
