let orig = [],
  hist = new Set();

function init() {
  for (let ii = 1; ii <= 90; ii++) orig.push(ii);
}

function BlinkNode(celnode, times, millis) {
  this.celnode = celnode;
  this.times = times;
  this.millis = millis;
  let self = this;
  this.blink = function () {
    if (self.times % 2 == 0) self.celnode.className = "on";
    else self.celnode.className = "blink";
    if (self.times > 0) {
      self.times--;
      setTimeout(self.blink, self.millis);
    } else self = null;
  };
}

function selectNr(nn) {
  let celnode = document.getElementById("nr" + nn);
  celnode.className = "on";

  orig.splice(orig.indexOf(nn), 1);
  hist.add(nn);

  let cc = new BlinkNode(celnode, 9, 300);
  cc.blink();

  dumpHist();
}

function resetNr(nn) {
  let celnode = document.getElementById("nr" + nn);
  celnode.className = "";

  hist.delete(nn);
  orig.push(nn);

  dumpHist();
}

function dumpHist() {
  let ss = Array.from(hist).join(" ");
  document.getElementById("dumplist").innerHTML = ss;
}

function choseMe(anode) {
  let id = anode.id,
    nn = +id.match(/\d+/)[0];

  if (!hist.has(nn)) selectNr(nn);
  else resetNr(nn);
}

function extractRandom() {
  if (orig.length <= 0) return;

  let idx = Math.floor(Math.random() * orig.length),
    nn = orig[idx];

  if (!hist.has(nn)) selectNr(nn);
}

const manageKeyb = () => extractRandom();

init();
document.onkeypress = manageKeyb;

function tombola_writeln() {
  const container = document.getElementById("tombola-container");
  let tableContent = "";

  for (let block = 0; block < 6; block++) {
    // 6 blocchi (cartelle)
    tableContent += '<div class="sub-table"><table>';

    for (let row = 0; row < 3; row++) {
      // Ogni cartella ha 3 righe
      tableContent += "<tr>";

      for (let col = 0; col < 5; col++) {
        // Ogni riga ha 5 numeri
        let number = block * 15 + row * 5 + col + 1; // Calcola il numero corrente
        tableContent += `<td id="nr${number}" onclick="choseMe(this)">${number}</td>`;
      }

      tableContent += "</tr>";
    }

    tableContent += "</table></div>";
  }

  container.innerHTML = tableContent; // Aggiorna il contenuto del contenitore
}

// Chiama la funzione per generare la tombola
document.addEventListener("DOMContentLoaded", tombola_writeln);
