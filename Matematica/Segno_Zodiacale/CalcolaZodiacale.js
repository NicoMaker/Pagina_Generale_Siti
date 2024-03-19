const output = document.getElementById("output");
const immagine = document.getElementById("immagine");
const year = new Date().getFullYear();

const segniZodiacali = [
  {
    segno: "Capricorno",
    inizio: new Date(`${year}-12-22T00:00:00Z`).valueOf(),
    fine: new Date(`${year}-12-31T23:59:59Z`).valueOf(),
    Elemento: "Terra",
    Caratteristiche: "<br> Ambizioso, <br> responsabile, <br> pragmatico.",
  },
  {
    segno: "Capricorno",
    inizio: new Date(`${year}-01-01T00:00:00Z`).valueOf(),
    fine: new Date(`${year}-01-19T23:59:59Z`).valueOf(),
    Elemento: "Terra",
    Caratteristiche: "<br>Ambizioso, responsabile, pragmatico.",
  },
  {
    segno: "Acquario",
    inizio: new Date(`${year}-01-20T00:00:00Z`).valueOf(),
    fine: new Date(`${year}-02-19T23:59:59Z`).valueOf(),
    Elemento: "Aria",
    Caratteristiche: "<br> Ambizioso, <br> responsabile, <br> pragmatico.",
  },
  {
    segno: "Pesci",
    inizio: new Date(`${year}-02-20T00:00:00Z`).valueOf(),
    fine: new Date(`${year}-03-20T23:59:59Z`).valueOf(),
    Elemento: "Acqua",
    Caratteristiche: "<br> Sensibile, <br> intuitivo, <br>spirituale.",
  },
  {
    segno: "Ariete",
    inizio: new Date(`${year}-03-21T00:00:00Z`).valueOf(),
    fine: new Date(`${year}-04-19T23:59:59Z`).valueOf(),
    Elemento: "Fuoco",
    Caratteristiche: "<br> Coraggioso, <br> impulsivo, <br> dinamico.",
  },
  {
    segno: "Toro",
    inizio: new Date(`${year}-04-20T00:00:00Z`).valueOf(),
    fine: new Date(`${year}-05-20T23:59:59Z`).valueOf(),
    Elemento: "Terra",
    Caratteristiche: "<br> Sensuale, <br> stabile, <br> pratico.",
  },
  {
    segno: "Gemelli",
    inizio: new Date(`${year}-05-21T00:00:00Z`).valueOf(),
    fine: new Date(`${year}-06-20T23:59:59Z`).valueOf(),
    Elemento: "Aria",
    Caratteristiche: "<br> Curioso, <br> comunicativo, <br> adattabile.",
  },
  {
    segno: "Cancro",
    inizio: new Date(`${year}-06-21T00:00:00Z`).valueOf(),
    fine: new Date(`${year}-07-22T23:59:59Z`).valueOf(),
    Elemento: "Acqua",
    Caratteristiche: "<br> Empatico, <br> protettivo, <br>emotivo.",
  },
  {
    segno: "Leone",
    inizio: new Date(`${year}-07-23T00:00:00Z`).valueOf(),
    fine: new Date(`${year}-08-23T23:59:59Z`).valueOf(),
    Elemento: "Fuoco",
    Caratteristiche: "<br> Carismatico, <br>creativo, <br> leale.",
  },
  {
    segno: "Vergine",
    inizio: new Date(`${year}-08-24T00:00:00Z`).valueOf(),
    fine: new Date(`${year}-09-22T23:59:59Z`).valueOf(),
    Elemento: "Terra",
    Caratteristiche: "<br> Analitico, <br> preciso, <br> riservato.",
  },
  {
    segno: "Bilancia",
    inizio: new Date(`${year}-09-23T00:00:00Z`).valueOf(),
    fine: new Date(`${year}-10-22T23:59:59Z`).valueOf(),
    Elemento: "Aria",
    Caratteristiche: "<br> Socievole, <br> diplomatico, <br> armonioso.",
  },
  {
    segno: "Scorpione",
    inizio: new Date(`${year}-10-23T00:00:00Z`).valueOf(),
    fine: new Date(`${year}-11-21T23:59:59Z`).valueOf(),
    Elemento: "Acqua",
    Caratteristiche: "<br> Intenso, <br> passionale, <br> misterioso.",
  },
  {
    segno: "Sagittario",
    inizio: new Date(`${year}-11-22T00:00:00Z`).valueOf(),
    fine: new Date(`${year}-12-21T23:59:59Z`).valueOf(),
    Elemento: "Fuoco",
    Caratteristiche: "<br> Avventuroso, <br> ottimista, <br> filosofico.",
  },
];

const updateImmagine = (imageSrc) =>
  (immagine.innerHTML = `<img src="${imageSrc}">`);

function updateOutput(text, isError = false) {
  const outputClass = isError ? "viola" : "colorSegno";
  output.innerHTML = `<p class="${outputClass}">${text}</p>`;
}

updateImmagine("SEGNI/segni.jpg");

function calcolaSegnoZodiacale() {
  const day = parseInt(document.getElementById("day").value);
  const month = parseInt(document.getElementById("month").value);
  const selectedDate = monthDayToDate(month - 1, day)?.valueOf();

  const segno = segniZodiacali.find(
    (segno) => selectedDate >= segno.inizio && selectedDate <= segno.fine
  );

  if (!segno) {
    updateOutput("Data non valida", true);
    updateImmagine("SEGNI/segni.jpg");
    return;
  }

  updateOutput(`Il tuo segno zodiacale è ${segno.segno}`);
  updateImmagine(`SEGNI/${segno.segno}.jpg`);

  document.getElementById("definition").innerHTML = `
    <span class="viola">Elemento del segno:</span> ${segno.Elemento}<br><br>
    <span class="viola">Caratteristiche del segno:</span> ${segno.Caratteristiche}
  `;
}

function monthDayToDate(month, day) {
  const date = new Date();
  date.setMonth(month, day);
  return day > new Date(year, month + 1, 0).getDate() ? undefined : date;
}
