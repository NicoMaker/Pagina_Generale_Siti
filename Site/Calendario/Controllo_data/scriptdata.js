function checkDay() {
  let inputDate = document.getElementById("input-date").value,
    parts = inputDate.split("/"),
    day = parseInt(parts[0]),
    month = parseInt(parts[1]),
    year = parseInt(parts[2]),
    date = new Date(year, month - 1, day);

  calculatedate(day, month, year, date, inputDate);
}

function calculatedate(day, month, year, date, inputDate) {
  if (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  ) {
    let dayOfWeek = date.toLocaleDateString(undefined, { weekday: "long" });
    document.getElementById(
      "result"
    ).innerHTML = `Il giorno corrispondente alla data ${inputDate} e': ${dayOfWeek}`;
    document.getElementById("error-message").innerHTML = "";
  } else {
    document.getElementById("result").innerHTML = "";
    document.getElementById("error-message").innerHTML =
      "Data non valida. Reinserisci la data nel formato GG/MM/AAAA.";
  }
}
