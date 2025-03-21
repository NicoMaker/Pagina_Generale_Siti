let orig = [],
  hist = new Set(),
  firstStart = true, // Controlla se è la prima volta che si preme il bottone
  gameStarted = false; // Indica se il gioco è in corso

function init() {
  orig = [];
  for (let ii = 1; ii <= 90; ii++) orig.push(ii);
  // Annuncia "Si inizia!" all'avvio senza estrarre numeri
  speechSynthesis.speak(new SpeechSynthesisUtterance("Si inizia!"));
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

const announceNumber = (nn) =>
  speechSynthesis.speak(new SpeechSynthesisUtterance(`${nn}`));

function startGame() {
  if (firstStart) {
    // Al primo click dice solo "Si inizia!" senza estrarre numeri
    speechSynthesis.speak(new SpeechSynthesisUtterance("Si inizia!"));
    firstStart = false;
    gameStarted = true;
    return;
  }
  extractRandom();
}

function selectNr(nn) {
  let celnode = document.getElementById("nr" + nn);
  celnode.className = "on";
  orig.splice(orig.indexOf(nn), 1);
  hist.add(nn);
  let cc = new BlinkNode(celnode, 9, 300);
  cc.blink();
  announceNumber(nn);
  dumpHist();
}

function resetNr(nn) {
  let celnode = document.getElementById("nr" + nn);
  celnode.className = "";
  hist.delete(nn);
  orig.push(nn);
  dumpHist();
}

const dumpHist = () => (ss = Array.from(hist).join(" "));

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

function resetGame() {
  firstStart = true; // Ripristina l'annuncio "Si inizia!"
  gameStarted = false;
  hist.clear();
  init();
  document.querySelectorAll("td").forEach((td) => (td.className = ""));
  dumpHist();
}

async function fetchTables() {
  const response = await fetch("../tables.json"),
    data = await response.json();
  return data.tables;
}

function generateTables(tables) {
  const container = document.getElementById("tombola-container");
  let tableContent = "";
  tables.forEach((table) => {
    tableContent += `<div class="sub-table"><table>`;
    for (let i = 0; i < table.numbers.length; i += 5) {
      tableContent += "<tr>";
      for (let j = 0; j < 5; j++) {
        const number = table.numbers[i + j];
        if (number)
          tableContent += `<td id="nr${number}" onclick="choseMe(this)">${number}</td>`;
        else tableContent += "<td></td>";
      }
      tableContent += "</tr>";
    }
    tableContent += "</table></div>";
  });
  container.innerHTML = tableContent;
}

document.addEventListener("DOMContentLoaded", async () => {
  init();
  const tables = await fetchTables();
  generateTables(tables);
});
