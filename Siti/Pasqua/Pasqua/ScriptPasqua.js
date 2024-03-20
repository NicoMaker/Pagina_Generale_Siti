function calculateEaster() {
  let yearInput = document.getElementById("year"),
    year = yearInput.value,
    a = year % 19,
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
    n = Math.floor((h + l - 7 * m + 114) / 31),
    p = (h + l - 7 * m + 114) % 31,
    day = p + 1,
    month = n;

  if (month == 4) month = "Aprile";
  else month = "Marzo";

  let formattedDate = `${day} ${month}`,
    resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `La data di Pasqua per l'anno ${year} e' il ${formattedDate}`;
}
