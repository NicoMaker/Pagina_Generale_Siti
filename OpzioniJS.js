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


let Matematica = () =>
  (document.getElementById("dati").innerHTML = `

  <h2>Matematica </h2>
  <table>
      <tr>
          <td class="contorno">
              <a href="https://eserciziotrifase.netlify.app/" target="_blank">
              Esercizio Trifase</a>
          </td>

          <td class="contorno">
              <a href="https://alant.netlify.app/" target="_blank">
              Biografia su Alan Turing</a>
          </td>

          <td class="contorno">
              <a href="https://calcolatricenico.netlify.app/" target="_blank">Calcolatrice</a>
          </td>

          <td class="contorno">
              <a href="https://conversionebasi.netlify.app/" target="_blank">Conversioni Base</a>
          </td>
      </tr>

      <tr>
          <td class="contorno">
              <a href="https://numeriprimi.netlify.app/" target="_blank">Verifica Numero Primo</a>
          </td>

          <td class="contorno">
              <a href="https://verificanumeriprimiprecedenti.netlify.app/" target="_blank">Verifica Numeri Primi
              Precedenti</a>
          </td>

          <td class="contorno">
               <a href="https://tabellinenico.netlify.app/" target="blank">Tabelline</a>
          </td>

          <td class="contorno">
              <a href="https://tartaglianico.netlify.app/" target="_blank">Triangolo di Tartaglia</a>
          </td>

      </tr>

      <tr>
          <td class="contorno">
              <a href="https://esponenzialiradici.netlify.app/" target="_blank">Calcola Esponenziali / Radici</a>
          </td>

          <td class="contorno">
               <a href="https://logaritmi.netlify.app/" target="_blank">
              Calcola Logaritmi</a>
          </td>

          <td class="contorno">
              <a href="https://calcolofattoriale.netlify.app/" target="_blank">Fattoriale</a>
          </td>

          <td class="contorno">
              <a href="https://fibonaccinicomaker.netlify.app/" target="_blank">Calcola Numero di Fibonacci</a>
          </td>
      </tr>

      <tr>
          <td class="contorno">
              <a href="https://pitagora.netlify.app/" target="_blank">Calcolatore Triangolo di Pitagora</a>
          </td>

          <td class="contorno">
              <a href="https://gestionepunteggi.netlify.app/" target="_blank">Gestione Punteggi</a>
          </td>
  
          <td class="contorno">
              <a href="https://segnozodiacale.netlify.app/" target="_blank">Calcolo Segno Zodiacale</a>
          </td>

          <td class="contorno">
              <a href="https://stampanumeri.netlify.app/" target="_blank">Stampa Numeri Pari / dispari o tutti</a>
          </td>
      </tr>

      <tr>
          <td class="contorno">
              <a href="https://valoreassoluto.netlify.app/" target="_blank">Calcolo Valore Assoluto</a>
          </td>

          <td class="contorno">
              <a href="https://ahmes.netlify.app/" target="_blank">Ahmes</a>
          </td>
  
          <td class="contorno">
              <a href="https://euclide.netlify.app/" target="_blank">Euclide</a>
          </td>

          <td class="contorno">
              <a href="https://collatznico.netlify.app/" target="_blank">Collatz</a>
          </td>
      </tr>

      <tr>
          <td class="contorno">
              <a href="https://trigonometrianico.netlify.app/" target="_blank">Calcolo Trigonometrico</a>
          </td>
      </tr>
  </table>
  `);

let Bici = () =>
  (document.getElementById("dati").innerHTML = `
  <h2>Bici </h2>
    <table>
        <br>
        <tr>
            <td class="contorno">
                <a href="https://giri-in-bici.netlify.app/" target="_blank">Giri In Bici</a>
            </td>
        </tr>
    </table>    
    `);

let Random = () =>
  (document.getElementById("dati").innerHTML = `
    <h2>Opzioni Random </h2>
    <table>
        <tr>
            <td class="contorno">
                <a href="https://generatorepassword.netlify.app/" target="_blank">Generatore Password</a>
            </td>

            <td class="contorno">
                <a href="https://lanciodadi.netlify.app/" target="_blank">Lancio dei dadi</a>
            </td>
    
            <td class="contorno">
                <a href="https://lanciodeidadipernfacce.netlify.app/" target="_blank">Lancio dei dadi con n facce Grafico</a>
            </td>
    
            <td class="contorno">
                <a href="https://lanciodeidadiconpifaccenumeriparziali.netlify.app/" target="_blank">Lancio dei dadi con n facce
                Normale</a>
            </td>
        </tr>

        <tr>
            <td class="contorno">
                <a href="https://letterecasuali.netlify.app/" target="_blank">Estrazione Lettera Casuale</a>
            </td>

            <td class="contorno">
                <a href="https://numericasualinico.netlify.app/" target="_blank">Estrazione Numeri Casuali tra un intervallo</a>
            </td>

            <td class="contorno">
                <a href="https://lanciomonete.netlify.app/" target="_blank">Estrazionne Lancio n Monete</a>
            </td>

            <td class="contorno">
                <a href="https://casualecarta.netlify.app/" target="_blank">Generatore di Carte (Scala 40 o Briscola)</a>
            </td>
        </tr>

        <tr>
            <td class="contorno">
                 <a href="https://criptazione.netlify.app/" target="_blank">
                Criptazione con Alfabeto Opposto</a>
            </td>

            <td class="contorno">
                <a href="https://nomicasuali.netlify.app/" target="_blank">Genera Nomi Casuali</a>
            </td>
        </tr>
    </table>`);

let Giochi = () =>
  (document.getElementById("dati").innerHTML = `
    <h2>Giochi </h2>
    <table>
        <tr>
            <td class="contorno">
                 <a href="https://tombolanico.netlify.app/" target="_blank">Gioco della Tombola</a>
            </td>

            <td class="contorno">
                <a href="https://giocosassocartaforbice.netlify.app/" target="_blank">Gioco Sasso Carta Forbice</a>
            </td>

            <td class="contorno">
                <a href="https://tris.netlify.app/" target="_blank">
                Gioco del Tris</a>
            </td>

        </tr>

        <tr>

            <td class="contorno">
                <a href="https://forza4nico.netlify.app" target="_blank">Forza 4</a>
            </td>
            
            <td class="contorno">
                <a href="https://snakegamenico.netlify.app/" target="_blank">Snake Game</a>
            </td>

            <td class="contorno">
                <a href="https://indovinellodinosauri.netlify.app/" target="_blank">Indovinello dei Dinosauri</a>
            </td>
        </tr>
    </table>
    `);

let Borsa = () =>
  (document.getElementById("dati").innerHTML = `
    <h2>Borsa </h2>
    <table>
        <tr>
            <td class="contorno">
                <a href="https://cambivalute.netlify.app/" target="_blank">Cambi Valute</a>
            </td>

            <td class="contorno">
                <a href="https://valoretitoliborsa.netlify.app/" target="_blank">Valore Titoli di Borsa</a>
            </td>
        </tr>
    </table>`);

let Calendario = () =>
  (document.getElementById("dati").innerHTML = `
    <h2>Siti sul Calendario </h2>
    <table>
        <tr>
            <td class="contorno">
                <a href="https://calendariogiorno.netlify.app/" target="_blank">Calcola Giorno della Settimana</a>
            </td>

            <td class="contorno">
                <a href="https://cronometrotimer.netlify.app/" target="_blank">Cronometro / Timer</a>
            </td>

            <td class="contorno">
                <a href="https://calendarionico.netlify.app/" target="_blank">Calendario</a>
            </td>

            <td class="contorno">
                <a href="https://calcolatoreditempo.netlify.app/" target="_blank">Calcolatore di Tempo</a>
            </td>
        </tr>
    </table>
    `);

let InfoPaesiStati = () =>
  (document.getElementById("dati").innerHTML = `
    <h2>Info Paese / Stati</h2>
    <table>
        <tr>
            <td class="contorno">
                <a href="https://fusoorario.netlify.app/" target="_blank">Verifica Fuso Orario Città</a>
            </td>

            <td class="contorno">
                <a href="https://statiinfo.netlify.app/" target="_blank">Info Stato</a>
            </td>
        </tr>
    </table>
    `);

let Natale = () =>
  (document.getElementById("dati").innerHTML = `
    <h2> Siti sul Natale </h2>
    <table>
        <tr>
            <td class="contorno">
                <a href="https://adventcalendarnico.netlify.app/" target="_blank">Calendario dell'Avvento</a>
            </td>

            <td class="contorno">
                <a href="https://contoallarovescianatale.netlify.app/" target="_blank">Conto alla rovescia data di Natale</a>
            </td>

            <td class="contorno">
                <a href="https://contoallarovesciaannonuovo.netlify.app/" target="_blank">Conto Alla rovescia Anno Nuovo</a>
            </td>
        </tr>
    </table>
    `);

let Salute = () =>
  (document.getElementById("dati").innerHTML = `
    <h2>Siti sulla Salute </h2>
    <table>
        <tr>
            <td class="contorno">
                <a href="https://calcolopesoaltzzaideale.netlify.app/" target="_blank">Sito che Calcola Altezza ideale o Peso
                Ideale</a>
            </td>
        </tr>
    </table>
    `);

let Pasqua = () =>
  (document.getElementById("dati").innerHTML = `
    <h2> Siti Sulla Pasqua </h2>
    <table>
        <tr>
            <td class="contorno">
                 <a href="https://calcolapasqua.netlify.app/" target="_blank">Calcola la Data di Pasqua</a>
            </td>

            <td class="contorno">
                <a href="https://contoallarovesciapasqua.netlify.app/" target="_blank">Conto alla rovescia data di Pasqua</a>
            </td>
        </tr>
    </table>
    `);
