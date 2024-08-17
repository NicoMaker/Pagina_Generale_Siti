const output = document.getElementById("output"),
  immagine = document.getElementById("immagine"),
  year = new Date().getFullYear();

async function loadZodiacConfig() {
  const response = await fetch("configurazioni.json");
  return await response.json();
}

const updateImmagine = (imageSrc) =>
    (immagine.innerHTML = `<img src="${imageSrc}">`),
  updateOutput = (text, isError = false) =>
    (output.innerHTML = `<p class="${
      isError ? "viola" : "colorSegno"
    }">${text}</p>`),
monthDayToDate = (month, day) =>
  day > new Date(year, month + 1, 0).getDate()
    ? undefined
    : new Date(year, month, day);

function parseDate(str) {
  const [month, day] = str.split("-").map(Number);
  return monthDayToDate(month - 1, day);
}

async function calcolaSegnoZodiacale() {
  const day = parseInt(document.getElementById("day").value),
    month = parseInt(document.getElementById("month").value),
    selectedDate = monthDayToDate(month - 1, day)?.valueOf(),
    config = await loadZodiacConfig(),
    segno = config.find(({ inizio, fine }) => {
      const inizioDate = parseDate(inizio)?.valueOf(),
        fineDate = parseDate(fine)?.valueOf();
      return selectedDate >= inizioDate && selectedDate <= fineDate;
    });

  if (!segno) {
    updateOutput("Data non valida", true);
    updateImmagine("img/segni.jpg");
    document.getElementById("definition").innerHTML = "";
    return;
  }

  updateOutput(`Il tuo segno zodiacale è ${segno.segno}`);
  updateImmagine(`img/${segno.segno}.jpg`);

  const caratteristicheFormatte =
    segno.Caratteristiche.split(",").join(",<br>");

  document.getElementById("definition").innerHTML = `
    <span class="viola">Elemento del segno:</span> ${segno.Elemento}<br><br>
    <span class="viola">Caratteristiche del segno:</span> ${caratteristicheFormatte}
  `;
}

updateImmagine("img/segni.jpg");
