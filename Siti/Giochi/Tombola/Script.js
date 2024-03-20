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

let manageKeyb = () => extractRandom();

init();
document.onkeypress = manageKeyb;

function tombola_writeln() {
  let nr;
  for (let yy = 0; yy < 9; yy++) {
    document.writeln("<tr>");
    for (let xx = 0; xx < 10; xx++) {
      nr = yy * 10 + xx + 1;
      document.writeln(
        '<td id="nr' + nr + '" onclick="choseMe(this)">' + nr + "</td>"
      );
    }
    document.writeln("</tr>");
  }
}
