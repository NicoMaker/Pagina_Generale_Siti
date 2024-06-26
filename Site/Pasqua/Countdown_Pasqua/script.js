document.addEventListener("DOMContentLoaded", function () {
  let dataCorrente = new Date(),
    annoCorrente = dataCorrente.getFullYear(),
    pasquaDate = calculateEasterDate(annoCorrente),
    countDownDate = pasquaDate.getTime(),
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
        document.getElementById("timer").innerHTML = "Happy Easter!!";
      }
    }, 1000);

  document.getElementById("anno").innerHTML = `
      <p>&copy; ${annoCorrente} Il Mio Sito di Pasqua</p>`;
});

function calculateEasterDate(year) {
  let a = year % 19,
    b = Math.floor(year / 100),
    c = year % 100,
    d = Math.floor(b / 4),
    e = b % 4,
    f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30,
    i = Math.floor(c / 4),
    k = c % 4,
    l = (32 + 2 * e + 2 * i - h - k) % 7,
    m = Math.floor((a + 11 * h + 22 * l) / 451),
    month = Math.floor((h + l - 7 * m + 114) / 31),
    day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}
