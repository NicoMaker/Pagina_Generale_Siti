const output = document.getElementById("output"),
  immagine = document.getElementById("immagine"),
  year = new Date().getFullYear(),
  imgZodiacali = [
    {
      segno: "Capricorno",
      inizio: new Date(year, 11, 22).valueOf(),
      fine: new Date(year, 11, 31, 23, 59, 59).valueOf(),
      Elemento: "Terra",
      Caratteristiche: "<br> Ambizioso, <br> responsabile, <br> pragmatico.",
    },
    {
      segno: "Capricorno",
      inizio: new Date(year, 0, 1).valueOf(),
      fine: new Date(year, 0, 19, 23, 59, 59).valueOf(),
      Elemento: "Terra",
      Caratteristiche: "<br> Ambizioso, <br> responsabile, <br> pragmatico.",
    },
    {
      segno: "Acquario",
      inizio: new Date(year, 0, 20).valueOf(),
      fine: new Date(year, 1, 19, 23, 59, 59).valueOf(),
      Elemento: "Aria",
      Caratteristiche: "<br> Ambizioso, <br> responsabile, <br> pragmatico.",
    },
    {
      segno: "Pesci",
      inizio: new Date(year, 1, 20).valueOf(),
      fine: new Date(year, 2, 20, 23, 59, 59).valueOf(),
      Elemento: "Acqua",
      Caratteristiche: "<br> Sensibile, <br> intuitivo, <br> spirituale.",
    },
    {
      segno: "Ariete",
      inizio: new Date(year, 2, 21).valueOf(),
      fine: new Date(year, 3, 19, 23, 59, 59).valueOf(),
      Elemento: "Fuoco",
      Caratteristiche: "<br> Coraggioso, <br> impulsivo, <br> dinamico.",
    },
    {
      segno: "Toro",
      inizio: new Date(year, 3, 20).valueOf(),
      fine: new Date(year, 4, 20, 23, 59, 59).valueOf(),
      Elemento: "Terra",
      Caratteristiche: "<br> Sensuale, <br> stabile, <br> pratico.",
    },
    {
      segno: "Gemelli",
      inizio: new Date(year, 4, 21).valueOf(),
      fine: new Date(year, 5, 20, 23, 59, 59).valueOf(),
      Elemento: "Aria",
      Caratteristiche: "<br> Curioso, <br> comunicativo, <br> adattabile.",
    },
    {
      segno: "Cancro",
      inizio: new Date(year, 5, 21).valueOf(),
      fine: new Date(year, 6, 22, 23, 59, 59).valueOf(),
      Elemento: "Acqua",
      Caratteristiche: "<br> Empatico, <br> protettivo, <br> emotivo.",
    },
    {
      segno: "Leone",
      inizio: new Date(year, 6, 23).valueOf(),
      fine: new Date(year, 7, 23, 23, 59, 59).valueOf(),
      Elemento: "Fuoco",
      Caratteristiche: "<br> Carismatico, <br> creativo, <br> leale.",
    },
    {
      segno: "Vergine",
      inizio: new Date(year, 7, 24).valueOf(),
      fine: new Date(year, 8, 22, 23, 59, 59).valueOf(),
      Elemento: "Terra",
      Caratteristiche: "<br> Analitico, <br> preciso, <br> riservato.",
    },
    {
      segno: "Bilancia",
      inizio: new Date(year, 8, 23).valueOf(),
      fine: new Date(year, 9, 22, 23, 59, 59).valueOf(),
      Elemento: "Aria",
      Caratteristiche: "<br> Socievole, <br> diplomatico, <br> armonioso.",
    },
    {
      segno: "Scorpione",
      inizio: new Date(year, 9, 23).valueOf(),
      fine: new Date(year, 10, 21, 23, 59, 59).valueOf(),
      Elemento: "Acqua",
      Caratteristiche: "<br> Intenso, <br> passionale, <br> misterioso.",
    },
    {
      segno: "Sagittario",
      inizio: new Date(year, 10, 22).valueOf(),
      fine: new Date(year, 11, 21, 23, 59, 59).valueOf(),
      Elemento: "Fuoco",
      Caratteristiche: "<br> Avventuroso, <br> ottimista, <br> filosofico.",
    },
  ],
  updateImmagine = (imageSrc) =>
    (immagine.innerHTML = `<img src="${imageSrc}">`),
  updateOutput = (text, isError = false) =>
    (output.innerHTML = `<p class="${
      isError ? "viola" : "colorSegno"
    }">${text}</p>`),
  monthDayToDate = (month, day) =>
    day > new Date(year, month + 1, 0).getDate()
      ? undefined
      : new Date(year, month, day);

updateImmagine("img/segni.jpg");

function calcolaSegnoZodiacale() {
  const day = parseInt(document.getElementById("day").value),
    month = parseInt(document.getElementById("month").value),
    selectedDate = monthDayToDate(month - 1, day)?.valueOf(),
    segno = imgZodiacali.find(
      ({ inizio, fine }) => selectedDate >= inizio && selectedDate <= fine
    );

  if (!segno) {
    updateOutput("Data non valida", true);
    updateImmagine("img/segni.jpg");
    document.getElementById("definition").innerHTML = "";
    return;
  }

  updateOutput(`Il tuo segno zodiacale è ${segno.segno}`);
  updateImmagine(`img/${segno.segno}.jpg`);

  document.getElementById("definition").innerHTML = `
    <span class="viola">Elemento del segno:</span> ${segno.Elemento}<br><br>
    <span class="viola">Caratteristiche del segno:</span> ${segno.Caratteristiche}
  `;
}
