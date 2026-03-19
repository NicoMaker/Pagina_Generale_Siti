// ============================================================
//  CONSTANTS
// ============================================================
const EMOJIS = ["🦁", "🐯", "🦊", "🐺", "🦅", "🐉", "🌟", "💎"];
const UPPER = [
  { id: "ones", name: "Asso (1)" },
  { id: "twos", name: "Due (2)" },
  { id: "threes", name: "Tre (3)" },
  { id: "fours", name: "Quattro (4)" },
  { id: "fives", name: "Cinque (5)" },
  { id: "sixes", name: "Sei (6)" },
];
const LOWER = [
  { id: "toak", name: "Tris" },
  { id: "foak", name: "Poker" },
  { id: "fh", name: "Full House" },
  { id: "ss", name: "Scala Piccola" },
  { id: "ls", name: "Scala Grande" },
  { id: "ytz", name: "✦ YAHTZEE" },
  { id: "ch", name: "Chance" },
];
const ALL = [...UPPER, ...LOWER];

// ============================================================
//  SCORE CALCULATOR
// ============================================================
function calc(id, dice) {
  const c = [0, 0, 0, 0, 0, 0, 0];
  dice.forEach((d) => c[d]++);
  const s = dice.reduce((a, b) => a + b, 0);
  switch (id) {
    case "ones":
      return c[1];
    case "twos":
      return c[2] * 2;
    case "threes":
      return c[3] * 3;
    case "fours":
      return c[4] * 4;
    case "fives":
      return c[5] * 5;
    case "sixes":
      return c[6] * 6;
    case "toak":
      return c.some((x) => x >= 3) ? s : 0;
    case "foak":
      return c.some((x) => x >= 4) ? s : 0;
    case "fh":
      return c.some((x) => x === 3) && c.some((x) => x === 2) ? 25 : 0;
    case "ss": {
      const u = [...new Set(dice)].sort((a, b) => a - b).join("");
      return ["1234", "2345", "3456"].some((p) => u.includes(p)) ? 30 : 0;
    }
    case "ls": {
      const u = [...new Set(dice)].sort((a, b) => a - b).join("");
      return u === "12345" || u === "23456" ? 40 : 0;
    }
    case "ytz":
      return c.some((x) => x === 5) ? 50 : 0;
    case "ch":
      return s;
    default:
      return 0;
  }
}

// ============================================================
//  STATE
// ============================================================
let players = [],
  curP = 0;
let rollsLeft = 3,
  hasRolled = false;
let dice = [0, 0, 0, 0, 0],
  kept = Array(5).fill(false);
let autoRunning = false;

// ============================================================
//  SETUP
// ============================================================
let selN = 2;

function initSetup() {
  const row = document.getElementById("cnt-row");
  row.innerHTML = "";
  for (let i = 1; i <= 8; i++) {
    const b = document.createElement("button");
    b.className = "cnt" + (i === selN ? " on" : "");
    b.textContent = i;
    b.onclick = () => {
      selN = i;
      document
        .querySelectorAll(".cnt")
        .forEach((x, j) => x.classList.toggle("on", j + 1 === i));
      renderNames();
    };
    row.appendChild(b);
  }
  renderNames();
}

function renderNames() {
  const g = document.getElementById("ngrid");
  const old = [...g.querySelectorAll(".ninp")].map((x) => x.value);
  g.innerHTML = "";
  for (let i = 0; i < selN; i++) {
    const w = document.createElement("div");
    w.className = "nwrap";
    const em = document.createElement("span");
    em.className = "nemo";
    em.textContent = EMOJIS[i % 8];
    const inp = document.createElement("input");
    inp.className = "ninp";
    inp.placeholder = "Giocatore " + (i + 1);
    inp.value = old[i] || "Giocatore " + (i + 1);
    w.appendChild(em);
    w.appendChild(inp);
    g.appendChild(w);
  }
}

function startGame() {
  players = [...document.querySelectorAll(".ninp")].map((inp, i) => ({
    name: inp.value.trim() || "Giocatore " + (i + 1),
    emoji: EMOJIS[i % 8],
    scores: {},
    yb: 0,
  }));
  curP = 0;
  autoRunning = false;
  document.getElementById("setup").style.display = "none";
  const g = document.getElementById("game");
  g.style.display = "flex";
  document.getElementById("end").classList.remove("show");
  
  // Mostra il bottone "Condividi Punteggi" su mobile
  const waMobileBtn = document.getElementById("wa-mobile-btn");
  if (waMobileBtn) {
    waMobileBtn.style.display = "";
  }
  
  buildUI();
  newTurn();
}

function showSetup() {
  document.getElementById("setup").style.display = "flex";
  document.getElementById("game").style.display = "none";
  document.getElementById("end").classList.remove("show");
  // Close mobile scoreboard
  document.getElementById("right-panel").classList.remove("open");
  document.getElementById("score-toggle").textContent = "📊 Mostra Segnapunti";
  autoRunning = false;
  initSetup();
}

// ============================================================
//  MOBILE SCORE TOGGLE
// ============================================================
function toggleScore() {
  const panel = document.getElementById("right-panel");
  const btn = document.getElementById("score-toggle");
  const open = panel.classList.toggle("open");
  btn.textContent = open ? "📊 Nascondi Segnapunti" : "📊 Mostra Segnapunti";
}

// ============================================================
//  BUILD UI
// ============================================================
function buildUI() {
  buildDice();
  buildStrip();
  buildTable();
}

function buildDice() {
  const r = document.getElementById("drow");
  r.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const d = document.createElement("div");
    d.className = "die blk";
    d.dataset.i = i;
    d.dataset.v = 1;
    d.innerHTML =
      '<div class="dot a"></div><div class="dot b"></div><div class="dot c"></div>' +
      '<div class="dot d"></div><div class="dot e"></div>' +
      '<div class="dot f"></div><div class="dot g"></div>';
    d.onclick = () => toggleKeep(i);
    r.appendChild(d);
  }
}

function buildStrip() {
  const s = document.getElementById("pstrip");
  s.innerHTML = "";
  players.forEach((p, i) => {
    const c = document.createElement("div");
    c.className = "pchip";
    c.id = "pc" + i;
    c.innerHTML =
      '<div class="cemo">' +
      p.emoji +
      "</div>" +
      '<div class="cname" id="cn' +
      i +
      '">' +
      p.name +
      "</div>" +
      '<div class="cscore" id="cs' +
      i +
      '">0</div>';
    s.appendChild(c);
  });
}

function buildTable() {
  const hr = document.getElementById("sch");
  hr.innerHTML = '<th class="ch">Categoria</th>';
  players.forEach((p, i) => {
    const th = document.createElement("th");
    th.id = "th" + i;
    th.title = p.name;
    th.innerHTML =
      p.emoji +
      '<br><span style="font-size:9px">' +
      p.name.substring(0, 9) +
      "</span>";
    hr.appendChild(th);
  });
  const b = document.getElementById("scb");
  b.innerHTML = "";
  addSec(b, "Sezione Superiore");
  UPPER.forEach((c) => addCat(b, c));
  const br = document.createElement("tr");
  br.className = "br";
  br.innerHTML =
    '<td class="cn">Bonus (≥63 → +35)</td>' +
    players.map((_, i) => '<td id="bon' + i + '">—</td>').join("");
  b.appendChild(br);
  addTot(b, "ut", "Totale Sup.");
  addSec(b, "Sezione Inferiore");
  LOWER.forEach((c) => addCat(b, c));
  addTot(b, "lt", "Totale Inf.");
  const gt = document.createElement("tr");
  gt.className = "gr";
  gt.innerHTML =
    '<td class="cn" style="letter-spacing:1px;font-size:10px;font-weight:700">TOTALE</td>' +
    players.map((_, i) => '<td id="gt' + i + '">0</td>').join("");
  b.appendChild(gt);
}

function addSec(b, label) {
  const tr = document.createElement("tr");
  tr.className = "sc";
  tr.innerHTML =
    '<td class="cn" colspan="' + (players.length + 1) + '">' + label + "</td>";
  b.appendChild(tr);
}
function addCat(b, cat) {
  const tr = document.createElement("tr");
  tr.innerHTML =
    '<td class="cn">' +
    cat.name +
    "</td>" +
    players
      .map((_, i) => '<td class="ve" id="sv-' + cat.id + "-" + i + '">—</td>')
      .join("");
  b.appendChild(tr);
}
function addTot(b, id, label) {
  const tr = document.createElement("tr");
  tr.className = "tr";
  tr.innerHTML =
    '<td class="cn">' +
    label +
    "</td>" +
    players.map((_, i) => '<td id="' + id + i + '">0</td>').join("");
  b.appendChild(tr);
}

// ============================================================
//  TURN
// ============================================================
function newTurn() {
  rollsLeft = 3;
  hasRolled = false;
  kept = Array(5).fill(false);
  dice = Array(5).fill(0);
  updateTopBar();
  updateRI();
  updateDiceUI();
  updateBtns();
  buildHints();
  refreshTable();
}

function updateTopBar() {
  const p = players[curP];
  document.getElementById("tb-emo").textContent = p.emoji;
  
  // Controlla se il giocatore ha completato tutte le 13 categorie
  const totalCats = ALL.length;
  const isWinner = Object.keys(p.scores).length === totalCats;
  
  // Mostra il nome con badge vincitore se necessario
  const nameEl = document.getElementById("tb-name");
  if (isWinner) {
    nameEl.innerHTML = p.name + ' <span style="color:var(--green);font-weight:700;margin-left:8px;">🏆 VINCITORE!</span>';
  } else {
    nameEl.textContent = p.name;
  }
  
  players.forEach((_, i) => {
    document.getElementById("pc" + i).classList.toggle("act", i === curP);
    document.getElementById("cn" + i).className =
      "cname" + (i === curP ? " an" : "");
    const th = document.getElementById("th" + i);
    if (th) th.className = i === curP ? "ath" : "";
  });
}

function updateRI() {
  const used = 3 - rollsLeft;
  for (let i = 0; i < 3; i++) {
    const ri = document.getElementById("ri" + i);
    ri.className = "ri";
    if (i < used) ri.classList.add(rollsLeft === 0 ? "danger" : "used");
  }
}

function updateDiceUI() {
  for (let i = 0; i < 5; i++) {
    const d = document.querySelector('.die[data-i="' + i + '"]');
    if (!d) continue;
    d.dataset.v = dice[i] || 1;
    d.classList.toggle("kpt", kept[i]);
    d.classList.toggle("blk", !hasRolled);
    d.classList.toggle("noh", !hasRolled || rollsLeft === 0 || autoRunning);
    d.style.pointerEvents =
      hasRolled && rollsLeft > 0 && !autoRunning ? "auto" : "none";
  }
}

function updateBtns() {
  const totalCats = ALL.length;
  const completed = Object.keys(players[curP].scores).length;
  const remaining = totalCats - completed;
  
  const rb = document.getElementById("rbtn");
  const rbt = document.getElementById("rbtn-txt");
  const ab = document.getElementById("abtn");
  const abt = document.getElementById("abtn-txt");
  const hint = document.getElementById("roll-hint");

  rb.disabled = rollsLeft === 0 || autoRunning;

  if (!hasRolled) {
    rbt.textContent = "LANCIA I DADI";
    if (remaining <= 1) {
      hint.innerHTML = "🏆 <span>" + players[curP].name + " può vincere!</span>";
    } else {
      hint.innerHTML = "Clicca <span>Lancia</span> per iniziare";
    }
  } else if (rollsLeft === 0) {
    rbt.textContent = "SCEGLI CATEGORIA";
    if (remaining <= 1) {
      hint.innerHTML = "🏆 <span>Ultima categoria! Scegli e vinci!</span>";
    } else if (remaining <= 3) {
      hint.innerHTML = "<span>Quasi finito!</span> " + remaining + " categorie rimaste";
    } else {
      hint.innerHTML = "<span>Scegli</span> dove assegnare il punteggio";
    }
  } else {
    rbt.textContent = "RILANCIA (" + rollsLeft + ")";
    if (remaining <= 1) {
      hint.innerHTML = "🏆 <span>Tocca e rilancia!</span> Ultima chance per vincere!";
    } else if (remaining <= 3) {
      hint.innerHTML = "Tocca i dadi, <span>Rilancia</span> (" + remaining + " categorie rimaste)";
    } else {
      hint.innerHTML = "Tocca i dadi per tenerli, poi <span>Rilancia</span>";
    }
  }

  ab.disabled = autoRunning;
  if (!autoRunning) {
    ab.classList.remove("running");
    abt.textContent = "AUTO";
  }
}

// ============================================================
//  ROLLING
// ============================================================
function rollDice() {
  if (rollsLeft <= 0 || autoRunning) return;
  rollsLeft--;
  hasRolled = true;
  for (let i = 0; i < 5; i++) {
    const d = document.querySelector('.die[data-i="' + i + '"]');
    if (!kept[i]) dice[i] = Math.ceil(Math.random() * 6);
    d.classList.add("rol");
    setTimeout(() => d.classList.remove("rol"), 560);
  }
  setTimeout(() => {
    updateDiceUI();
    updateRI();
    updateBtns();
    buildHints();
    const p = players[curP];
    if (calc("ytz", dice) === 50 && "ytz" in p.scores && p.scores.ytz === 50) {
      p.yb++;
      showToast("🎉 YAHTZEE BONUS! +100 punti extra!");
    }
  }, 570);
}

function toggleKeep(i) {
  if (!hasRolled || rollsLeft <= 0 || autoRunning) return;
  kept[i] = !kept[i];
  updateDiceUI();
}

// ============================================================
//  AUTO PLAY
// ============================================================
function autoPlay() {
  if (autoRunning) return;
  autoRunning = true;
  const ab = document.getElementById("abtn");
  const abt = document.getElementById("abtn-txt");
  ab.classList.add("running");
  ab.disabled = true;
  abt.textContent = "...";
  document.getElementById("rbtn").disabled = true;
  kept = Array(5).fill(false);
  doAutoStep(0);
}

function doAutoStep(step) {
  if (rollsLeft <= 0 || step >= 3) {
    setTimeout(autoAssign, 400);
    return;
  }
  rollsLeft--;
  hasRolled = true;
  for (let i = 0; i < 5; i++) {
    const d = document.querySelector('.die[data-i="' + i + '"]');
    if (!kept[i]) dice[i] = Math.ceil(Math.random() * 6);
    d.classList.add("rol");
    setTimeout(() => d.classList.remove("rol"), 560);
  }
  setTimeout(() => {
    updateDiceUI();
    updateRI();
    const p = players[curP];
    if (calc("ytz", dice) === 50 && "ytz" in p.scores && p.scores.ytz === 50) {
      p.yb++;
      showToast("🎉 YAHTZEE BONUS! +100 punti extra!");
    }
    buildHints();
    if (rollsLeft > 0) {
      autoChooseKeep();
      setTimeout(() => doAutoStep(step + 1), 900);
    } else {
      setTimeout(autoAssign, 600);
    }
  }, 600);
}

function autoChooseKeep() {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  dice.forEach((d) => counts[d]++);
  const maxCount = Math.max(...counts.slice(1));
  const modeVal = counts.indexOf(maxCount);

  if (maxCount >= 4) {
    kept = dice.map((v) => v === modeVal);
    return;
  }

  const has3 = counts.some((x) => x === 3);
  const has2 = counts.some((x, i) => x === 2 && i > 0);
  if (has3 && has2) {
    kept = Array(5).fill(true);
    return;
  }
  if (maxCount === 3) {
    kept = dice.map((v) => v === modeVal);
    return;
  }

  const unique = [...new Set(dice)].sort((a, b) => a - b);
  let maxSeq = 1,
    curSeq = 1,
    bestSeqVals = [unique[0]],
    seqVals = [unique[0]];
  for (let i = 1; i < unique.length; i++) {
    if (unique[i] === unique[i - 1] + 1) {
      curSeq++;
      seqVals.push(unique[i]);
    } else {
      curSeq = 1;
      seqVals = [unique[i]];
    }
    if (curSeq > maxSeq) {
      maxSeq = curSeq;
      bestSeqVals = [...seqVals];
    }
  }
  if (maxSeq >= 4) {
    const seqSet = new Set(bestSeqVals);
    const keptVals = new Set();
    kept = dice.map((v) => {
      if (seqSet.has(v) && !keptVals.has(v)) {
        keptVals.add(v);
        return true;
      }
      return false;
    });
    return;
  }
  if (maxCount === 2) {
    kept = dice.map((v) => v === modeVal);
    return;
  }
  const maxVal = Math.max(...dice);
  kept = dice.map((v) => v === maxVal);
}

function autoAssign() {
  const p = players[curP];
  let bestId = null,
    bestScore = -1;
  ALL.forEach((cat) => {
    if (!(cat.id in p.scores)) {
      const s = calc(cat.id, dice);
      if (s > bestScore) {
        bestScore = s;
        bestId = cat.id;
      }
    }
  });
  if (bestScore === 0 || bestId === null) {
    for (const cat of ALL) {
      if (!(cat.id in p.scores)) {
        bestId = cat.id;
        bestScore = 0;
        break;
      }
    }
  }
  if (bestId) {
    const catName = (ALL.find((c) => c.id === bestId) || { name: bestId }).name;
    showToast("⚡ Auto: +" + bestScore + " → " + catName);
    setTimeout(() => {
      autoRunning = false;
      document.getElementById("abtn").classList.remove("running");
      assign(bestId, bestScore);
    }, 500);
  } else {
    autoRunning = false;
    updateBtns();
  }
}

// ============================================================
//  HINTS
// ============================================================
function buildHints() {
  const g = document.getElementById("hgrid");
  g.innerHTML = "";
  const p = players[curP];
  let best = -1;
  if (hasRolled)
    ALL.forEach((c) => {
      if (!(c.id in p.scores)) {
        const s = calc(c.id, dice);
        if (s > best) best = s;
      }
    });

  ALL.forEach((cat) => {
    const div = document.createElement("div");
    div.className = "hint";
    const lk = cat.id in p.scores;
    let val = "—",
      vc = "mc",
      hc = "hbl";

    if (lk) {
      hc = "hlk";
      val = "✓ " + p.scores[cat.id];
      vc = "mc";
    } else if (hasRolled) {
      const s = calc(cat.id, dice);
      val = s;
      vc = s === 0 ? "rc" : s === best && s > 0 ? "gc" : "gr";
      hc = s === best && s > 0 ? "hbt" : s > 0 ? "hgd" : "hze";
      div.onclick = () => assign(cat.id, s);
    }

    div.classList.add(hc);
    div.innerHTML =
      '<span class="hn' +
      (!lk && hasRolled ? " ah" : "") +
      '">' +
      cat.name +
      "</span>" +
      '<span class="hv ' +
      vc +
      '">' +
      val +
      "</span>";
    g.appendChild(div);
  });
}

// ============================================================
//  ASSIGN
// ============================================================
function assign(catId, val) {
  const p = players[curP];
  if (catId in p.scores) {
    showToast("⛔ Categoria già usata!");
    return;
  }
  if (!hasRolled) {
    showToast("Lancia prima i dadi!");
    return;
  }
  p.scores[catId] = val;
  refreshTable();
  
  const totalCats = ALL.length;
  
  // Controlla se il giocatore attuale ha completato TUTTE le categorie
  if (Object.keys(players[curP].scores).length === totalCats) {
    // Questo giocatore ha completato tutto per PRIMO e vince!
    setTimeout(() => {
      showToast("🏆 " + p.name + " ha completato tutte le categorie!");
      setTimeout(showEnd, 600);
    }, 200);
    return;
  }
  
  // Se non tutti hanno completato, passa al prossimo giocatore
  let next = (curP + 1) % players.length,
    loops = 0;
  while (
    Object.keys(players[next].scores).length === totalCats &&
    loops < players.length
  ) {
    next = (next + 1) % players.length;
    loops++;
  }
  curP = next;
  setTimeout(newTurn, 150);
}

// ============================================================
//  TABLE REFRESH
// ============================================================
function getTot(pi) {
  const p = players[pi];
  const us = UPPER.reduce((s, c) => s + (p.scores[c.id] || 0), 0);
  const bon = us >= 63 ? 35 : 0;
  const ls = LOWER.reduce((s, c) => s + (p.scores[c.id] || 0), 0) + p.yb * 100;
  return { us, bon, ls, total: us + bon + ls };
}

function refreshTable() {
  const totalCats = ALL.length;
  
  players.forEach((p, pi) => {
    const isWinner = Object.keys(p.scores).length === totalCats;
    const th = document.getElementById("th" + pi);
    
    // Aggiungi classe "winner" all'intestazione della colonna se ha vinto
    if (th) {
      if (isWinner) {
        th.classList.add("winner-col");
      } else {
        th.classList.remove("winner-col");
      }
    }
    
    ALL.forEach((cat) => {
      const td = document.getElementById("sv-" + cat.id + "-" + pi);
      if (!td) return;
      if (cat.id in p.scores) {
        const v = p.scores[cat.id];
        td.textContent =
          v + (cat.id === "ytz" && p.yb > 0 && v > 0 ? " +" + p.yb * 100 : "");
        td.className = v > 0 ? "vf" : "vz";
      } else {
        td.textContent = "—";
        td.className = "ve";
      }
    });
    const { us, bon, ls, total } = getTot(pi);
    const bt = document.getElementById("bon" + pi);
    if (bt) {
      bt.textContent = bon > 0 ? "✓ +35" : us + "/63";
      bt.style.color = bon > 0 ? "var(--green)" : "";
    }
    const ut = document.getElementById("ut" + pi);
    if (ut) ut.textContent = us + bon;
    const lt = document.getElementById("lt" + pi);
    if (lt) lt.textContent = ls;
    const gt = document.getElementById("gt" + pi);
    if (gt) gt.textContent = total;
    const cs = document.getElementById("cs" + pi);
    if (cs) cs.textContent = total;
  });
}

// ============================================================
//  END GAME
// ============================================================
function showEnd() {
  const ranks = players
    .map((p, i) => {
      const t = getTot(i);
      return { name: p.name, emoji: p.emoji, ...t };
    })
    .sort((a, b) => b.total - a.total);
  const w = ranks[0];
  document.getElementById("eemo").textContent = w.emoji;
  document.getElementById("ewn").textContent = w.name;
  document.getElementById("ewp").textContent =
    "🏆 " + w.total + " punti — Ha vinto la partita!";

  const list = document.getElementById("elist");
  list.innerHTML = "";
  const medals = ["🥇", "🥈", "🥉"];
  ranks.forEach((r, i) => {
    const row = document.createElement("div");
    row.className = "erow" + (i === 0 ? " ew" : "");
    row.innerHTML =
      '<div class="erk">' +
      (medals[i] || i + 1 + ".") +
      "</div>" +
      '<div class="ee2">' +
      r.emoji +
      "</div>" +
      '<div style="flex:1"><div class="epn' +
      (i === 0 ? " ew" : "") +
      '">' +
      r.name +
      "</div>" +
      '<div class="esub">Sup: ' +
      (r.us + r.bon) +
      " | Inf: " +
      r.ls +
      (r.bon ? " | Bonus+35" : "") +
      "</div></div>" +
      '<div class="ept">' +
      r.total +
      "</div>";
    list.appendChild(row);
  });
  spawnConfetti();
  document.getElementById("end").classList.add("show");
  
  // Nascondi il bottone "Condividi Punteggi" su mobile quando la partita finisce
  const waMobileBtn = document.getElementById("wa-mobile-btn");
  if (waMobileBtn) {
    waMobileBtn.style.display = "none";
  }
}

// ============================================================
//  RESET GAME - Azzera tutto e ritorna al setup
// ============================================================
function resetGame() {
  // Se siamo in gioco, chiedi conferma
  const gamePanel = document.getElementById("game");
  if (gamePanel.style.display === "flex") {
    if (!confirm("⚠️ Sei sicuro? Perderai la partita in corso!")) {
      return; // Annulla il reset
    }
  }
  
  // Azzera lo stato globale
  players = [];
  curP = 0;
  rollsLeft = 3;
  hasRolled = false;
  dice = [0, 0, 0, 0, 0];
  kept = Array(5).fill(false);
  autoRunning = false;
  selN = 2;
  
  // Nascondi tutti gli schermi
  document.getElementById("setup").style.display = "none";
  document.getElementById("game").style.display = "none";
  document.getElementById("end").classList.remove("show");
  document.getElementById("right-panel").classList.remove("open");
  
  // Mostra il setup
  document.getElementById("setup").style.display = "flex";
  initSetup();
  showToast("✨ Partita resettata!");
}

function spawnConfetti() {
  const colors = [
    "#c9a84c",
    "#e8c96a",
    "#2ecc71",
    "#e74c3c",
    "#4ecdc4",
    "#f5f0e8",
    "#a29bfe",
  ];
  const container = document.getElementById("end");
  container.querySelectorAll(".conf").forEach((e) => e.remove());
  for (let i = 0; i < 72; i++) {
    const el = document.createElement("div");
    el.className = "conf";
    const size = Math.random() * 12 + 4,
      dur = Math.random() * 2.5 + 1.5,
      delay = Math.random() * 1.5;
    el.style.cssText =
      "position:absolute;width:" +
      size +
      "px;height:" +
      size +
      "px;background:" +
      colors[Math.floor(Math.random() * colors.length)] +
      ";border-radius:" +
      (Math.random() > 0.5 ? "50%" : "2px") +
      ";left:" +
      Math.random() * 100 +
      "%;top:-20px;opacity:" +
      (Math.random() * 0.7 + 0.3) +
      ";animation:cf " +
      dur +
      "s ease-in " +
      delay +
      "s forwards;pointer-events:none;z-index:0;";
    container.appendChild(el);
    setTimeout(
      () => {
        if (el.parentNode) el.parentNode.removeChild(el);
      },
      (dur + delay) * 1000 + 300,
    );
  }
}

// ============================================================
//  TOAST
// ============================================================
let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

// ============================================================
//  INIT
// ============================================================
//  WHATSAPP SHARE — statistiche complete
// ============================================================
function shareWhatsApp(finale) {
  const isFinale = finale !== false;
  const date = new Date().toLocaleDateString("it-IT");
  const time = new Date().toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Sort players by current total
  const sorted = players
    .map((p, i) => ({ p, i, t: getTot(i) }))
    .sort((a, b) => b.t.total - a.t.total);
  const medals = ["🥇", "🥈", "🥉"];
  const totalCats = ALL.length;

  let msg =
    "🎲 *YAHTZEE* — " +
    (isFinale ? "Risultati Finali" : "Classifica in corso") +
    "\n";
  msg += date + " alle " + time + "\n";
  msg += "━━━━━━━━━━━━━━━━━━━━━━\n\n";

  // For each player in rank order
  sorted.forEach(({ p, i, t }, rank) => {
    const medal = medals[rank] || rank + 1 + ".";
    const done = Object.keys(p.scores).length;
    msg += medal + " " + p.emoji + " *" + p.name + "*";
    if (!isFinale) msg += " (" + done + "/" + totalCats + " cat.)";
    msg += "\n";

    // UPPER section
    msg += "📊 *Sezione Superiore*\n";
    UPPER.forEach((cat) => {
      const v = cat.id in p.scores ? p.scores[cat.id] : null;
      const dot = v === null ? "⬜" : v > 0 ? "✅" : "❌";
      const val = v === null ? "—" : v;
      msg += "  " + dot + " " + cat.name + ": *" + val + "*\n";
    });
    msg += "  💎 Bonus: *" + (t.bon > 0 ? "+35 ✓" : t.us + "/63") + "*\n";
    msg += "  ▶ Totale Sup: *" + (t.us + t.bon) + " pt*\n\n";

    // LOWER section
    msg += "🎯 *Sezione Inferiore*\n";
    LOWER.forEach((cat) => {
      const v = cat.id in p.scores ? p.scores[cat.id] : null;
      const dot = v === null ? "⬜" : v > 0 ? "✅" : "❌";
      let val = v === null ? "—" : v;
      if (cat.id === "ytz" && p.yb > 0 && v > 0)
        val += " (+" + p.yb * 100 + " bonus)";
      msg += "  " + dot + " " + cat.name + ": *" + val + "*\n";
    });
    msg += "  ▶ Totale Inf: *" + t.ls + " pt*\n\n";

    msg += "  🏅 *TOTALE: " + t.total + " pt*\n";
    msg += "━━━━━━━━━━━━━━━━━━━━━━\n";
    if (rank < sorted.length - 1) msg += "\n";
  });

  if (isFinale) {
    msg +=
      "\n🏆 Ha vinto *" +
      sorted[0].p.name +
      "* con " +
      sorted[0].t.total +
      " punti!";
  } else {
    msg += "\n⏳ Partita ancora in corso...";
    msg +=
      "\n👑 In testa: *" +
      sorted[0].p.name +
      "* (" +
      sorted[0].t.total +
      " pt)";
  }
  msg += "\n\n🎲 Giocato con YAHTZEE App";

  const url = "https://wa.me/?text=" + encodeURIComponent(msg);
  window.open(url, "_blank");
}

initSetup();