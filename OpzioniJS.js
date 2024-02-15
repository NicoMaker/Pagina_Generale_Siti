const menu = document.querySelector(".menu");
const hamburger = document.querySelector(".hamburger");
const closeIcon = document.querySelector(".CloseIcon");
const menuIcon = document.querySelector(".MenuIcon");

function toggleMenu() {
  if (menu.classList.contains("showMwnu")) {
    menu.classList.remove("showMwnu");
    closeIcon.style.display = "none";
    menuIcon.style.display = "block";
  } else {
    menu.classList.add("showMwnu");
    closeIcon.style.display = "block";
    menuIcon.style.display = "none";
  }
}

hamburger.addEventListener("click", toggleMenu);

const categories = {
  Matematica: [
    {
      name: "Esercizio Trifase",
      link: "https://eserciziotrifase.netlify.app/",
    },
    { name: "Biografia su Alan Turing", link: "https://alant.netlify.app/" },
    { name: "Calcolatrice", link: "https://calcolatricenico.netlify.app/" },
    { name: "Conversioni Base", link: "https://conversionebasi.netlify.app/" },
    { name: "Verifica Numero Primo", link: "https://numeriprimi.netlify.app/" },
    {
      name: "Verifica Numeri Primi Precedenti",
      link: "https://verificanumeriprimiprecedenti.netlify.app/",
    },
    { name: "Tabelline", link: "https://tabellinenico.netlify.app/" },
    {
      name: "Triangolo di Tartaglia",
      link: "https://tartaglianico.netlify.app/",
    },
    {
      name: "Calcola Esponenziali / Radici",
      link: "https://esponenzialiradici.netlify.app/",
    },
    { name: "Calcola Logaritmi", link: "https://logaritmi.netlify.app/" },
    { name: "Fattoriale", link: "https://calcolofattoriale.netlify.app/" },
    {
      name: "Calcola Numero di Fibonacci",
      link: "https://fibonaccinicomaker.netlify.app/",
    },
    {
      name: "Calcolatore Triangolo di Pitagora",
      link: "https://pitagora.netlify.app/",
    },
    {
      name: "Gestione Punteggi",
      link: "https://gestionepunteggi.netlify.app/",
    },
    {
      name: "Calcolo Segno Zodiacale",
      link: "https://segnozodiacale.netlify.app/",
    },
    {
      name: "Stampa Numeri Pari / Dispari o Tutti",
      link: "https://stampanumeri.netlify.app/",
    },
    {
      name: "Calcolo Valore Assoluto",
      link: "https://valoreassoluto.netlify.app/",
    },
    { name: "Ahmes", link: "https://ahmes.netlify.app/" },
    { name: "Euclide", link: "https://euclide.netlify.app/" },
    { name: "Collatz", link: "https://collatznico.netlify.app/" },
    {
      name: "Calcolo Trigonometrico",
      link: "https://trigonometrianico.netlify.app/",
    },
  ],
  Bici: [{ name: "Giri In Bici", link: "https://giri-in-bici.netlify.app/" }],
  Random: [
    {
      name: "Generatore Password",
      link: "https://generatorepassword.netlify.app/",
    },
    { name: "Lancio dei dadi", link: "https://lanciodadi.netlify.app/" },
    {
      name: "Lancio dei dadi con n facce Grafico",
      link: "https://lanciodeidadipernfacce.netlify.app/",
    },
    {
      name: "Lancio dei dadi con n facce Normale",
      link: "https://lanciodeidadiconpifaccenumeriparziali.netlify.app/",
    },
    {
      name: "Estrazione Lettera Casuale",
      link: "https://letterecasuali.netlify.app/",
    },
    {
      name: "Estrazione Numeri Casuali tra un intervallo",
      link: "https://numericasualinico.netlify.app/",
    },
    {
      name: "Estrazionne Lancio n Monete",
      link: "https://lanciomonete.netlify.app/",
    },
    {
      name: "Generatore di Carte (Scala 40 o Briscola)",
      link: "https://casualecarta.netlify.app/",
    },
    {
      name: "Criptazione con Alfabeto Opposto",
      link: "https://criptazione.netlify.app/",
    },
    { name: "Genera Nomi Casuali", link: "https://nomicasuali.netlify.app/" },
    {
      name: "Coach Life Generator",
      link: "https://coachlifegenerator.netlify.app/",
    },
    {
      name: "Generatore Colore Casuale",
      link: "https://colorecasuale.netlify.app/",
    },
  ],
  Giochi: [
    { name: "Gioco della Tombola", link: "https://tombolanico.netlify.app/" },
    {
      name: "Gioco Sasso Carta Forbice",
      link: "https://giocosassocartaforbice.netlify.app/",
    },
    { name: "Gioco del Tris", link: "https://tris.netlify.app/" },
    { name: "Forza 4", link: "https://forza4nico.netlify.app" },
    { name: "Snake Game", link: "https://snakegamenico.netlify.app/" },
    {
      name: "Indovinello dei Dinosauri",
      link: "https://indovinellodinosauri.netlify.app/",
    },
    {
      name: "Generazione 4 Lettere Casuali",
      link: "https://generated4letters.netlify.app/",
    },
    {
      name: "Gioco Briscola Scala",
      link: "https://giocobriscolascala.netlify.app/",
    },
    {
      name: "Generazione 4 Numeri Casuali",
      link: "https://generated4numbers.netlify.app/",
    },
  ],
  Borsa: [
    { name: "Cambi Valute", link: "https://cambivalute.netlify.app/" },
    {
      name: "Valore Titoli di Borsa",
      link: "https://valoretitoliborsa.netlify.app/",
    },
  ],
  Calendario: [
    {
      name: "Calcola Giorno della Settimana",
      link: "https://calendariogiorno.netlify.app/",
    },
    {
      name: "Cronometro / Timer",
      link: "https://cronometrotimer.netlify.app/",
    },
    { name: "Calendario", link: "https://calendarionico.netlify.app/" },
    {
      name: "Calcolatore di Tempo",
      link: "https://calcolatoreditempo.netlify.app/",
    },
  ],
  Info_Paesi_Stati: [
    {
      name: "Verifica Fuso Orario Città",
      link: "https://fusoorario.netlify.app/",
    },
    { name: "Info Stato", link: "https://statiinfo.netlify.app/" },
  ],
  Natale: [
    {
      name: "Calendario dell'Avvento",
      link: "https://adventcalendarnico.netlify.app/",
    },
    {
      name: "Conto alla rovescia data di Natale",
      link: "https://contoallarovescianatale.netlify.app/",
    },
    {
      name: "Conto Alla rovescia Anno Nuovo",
      link: "https://contoallarovesciaannonuovo.netlify.app/",
    },
  ],
  Salute: [
    {
      name: "Sito che Calcola Altezza ideale o Peso Ideale",
      link: "https://calcolopesoaltzzaideale.netlify.app/",
    },
  ],
  Pasqua: [
    {
      name: "Calcola la Data di Pasqua",
      link: "https://calcolapasqua.netlify.app/",
    },
    {
      name: "Conto alla rovescia data di Pasqua",
      link: "https://contoallarovesciapasqua.netlify.app/",
    },
  ],
};

function generateCategoryHTML(categoryName, category) {
  let linksHTML = "";
  let rowCount = 0;
  category.forEach((item, index) => {
    let divisibile = 0;

    if (categoryName == "Matematica" || categoryName == "Giochi")
      divisibile = 3;
    else divisibile = 4;

    if (index % divisibile === 0) {
      if (index !== 0) linksHTML += "</tr>";
      linksHTML += "<tr>";
      rowCount = 0;
    }
    linksHTML += `
    <td class="contorno">
        <a href="${item.link}" target="_blank">${item.name}</a>
    </td>`;
    rowCount++;
  });
  if (rowCount !== 0) {
    linksHTML += "</tr>";
  }
  return `
      <h2>${categoryName}</h2> 
      <br>
      <table>${linksHTML}</table>
    `;
}

function displayCategory(categoryName) {
  const category = categories[categoryName];
  if (category) {
    document.getElementById("dati").innerHTML = generateCategoryHTML(
      categoryName,
      category
    );
  }
}
