"use strict";

/* ─── Config per dimensione ──────────────────────────── */
const SIZE_CONFIG = {
  4: {
    N: 4,
    B: 2,
    symbols: "1234",
    cols: 2,
    remove: { easy: 4, medium: 6, hard: 8, expert: 10 },
  },
  6: {
    N: 6,
    B: null,
    BW: 3,
    BH: 2,
    symbols: "123456",
    cols: 3,
    remove: { easy: 12, medium: 16, hard: 20, expert: 24 },
  },
  9: {
    N: 9,
    B: 3,
    symbols: "123456789",
    cols: 3,
    remove: { easy: 35, medium: 45, hard: 52, expert: 58 },
  },
  16: {
    N: 16,
    B: 4,
    symbols: "123456789ABCDEF",
    cols: 4,
    remove: { easy: 80, medium: 100, hard: 120, expert: 140 },
  },
};

/* ─── Colori numeri ──────────────────────────────────── */
const NUM_COLORS = {
  1: "#f87171",
  2: "#fb923c",
  3: "#facc15",
  4: "#4ade80",
  5: "#38bdf8",
  6: "#c084fc",
  7: "#f472b6",
  8: "#34d399",
  9: "#60a5fa",
  A: "#f87171",
  B: "#fb923c",
  C: "#facc15",
  D: "#4ade80",
  E: "#38bdf8",
  F: "#c084fc",
};

/* ─── Stato globale ──────────────────────────────────── */
let cfg = SIZE_CONFIG[9];
let N = 9,
  B = 3;
let solution = [],
  puzzle = [],
  userGrid = [],
  notes = [];
let selected = null,
  mode = "num";
let mistakes = 0,
  hints = 3,
  timerSec = 0;
let timerInt = null,
  gameOver = false,
  paused = false,
  started = false;

/* ─── Utilità ────────────────────────────────────────── */
function fmt(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function blockId(r, c) {
  if (cfg.B) {
    const bw = cfg.B,
      bh = cfg.B;
    return Math.floor(r / bh) * bh + Math.floor(c / bw);
  }
  const bw = cfg.BW,
    bh = cfg.BH;
  return Math.floor(r / bh) * (N / bw) + Math.floor(c / bw);
}

function blockStart(r, c) {
  if (cfg.B) {
    return {
      br: Math.floor(r / cfg.B) * cfg.B,
      bc: Math.floor(c / cfg.B) * cfg.B,
    };
  }
  return {
    br: Math.floor(r / cfg.BH) * cfg.BH,
    bc: Math.floor(c / cfg.BW) * cfg.BW,
  };
}

function blockSize() {
  if (cfg.B) return { bh: cfg.B, bw: cfg.B };
  return { bh: cfg.BH, bw: cfg.BW };
}

/* ─── Modale Regole ──────────────────────────────────── */
function openRules() {
  document.getElementById("rules-overlay").classList.remove("hidden");
}
function closeRules() {
  document.getElementById("rules-overlay").classList.add("hidden");
}

document
  .getElementById("rules-overlay")
  .addEventListener("click", function (e) {
    if (e.target === this) closeRules();
  });

/* ─── Generazione ────────────────────────────────────── */
function isValid(g, r, c, v) {
  for (let i = 0; i < N; i++) {
    if (g[r][i] === v || g[i][c] === v) return false;
  }
  const { br, bc } = blockStart(r, c);
  const { bh, bw } = blockSize();
  for (let i = 0; i < bh; i++)
    for (let j = 0; j < bw; j++) if (g[br + i][bc + j] === v) return false;
  return true;
}

function generateSolution() {
  const g = Array.from({ length: N }, () => Array(N).fill(0));
  const syms = cfg.symbols.split("");
  function fill(pos) {
    if (pos === N * N) return true;
    const r = Math.floor(pos / N),
      c = pos % N;
    const vals = shuffle([...syms]);
    for (const v of vals) {
      if (isValid(g, r, c, v)) {
        g[r][c] = v;
        if (fill(pos + 1)) return true;
        g[r][c] = 0;
      }
    }
    return false;
  }
  fill(0);
  return g;
}

function countSolutions(g, limit = 2) {
  const copy = g.map((r) => [...r]);
  let count = 0;
  function solve(pos) {
    if (pos === N * N) {
      count++;
      return count < limit;
    }
    const r = Math.floor(pos / N),
      c = pos % N;
    if (copy[r][c] !== 0) return solve(pos + 1);
    const syms = cfg.symbols.split("");
    for (const v of syms) {
      if (isValid(copy, r, c, v)) {
        copy[r][c] = v;
        if (!solve(pos + 1)) {
          return false;
        }
        copy[r][c] = 0;
      }
    }
    return true;
  }
  solve(0);
  return count;
}

function createPuzzle(sol, removeCount) {
  const p = sol.map((r) => [...r]);
  const cells = shuffle([...Array(N * N)].map((_, i) => i));
  let removed = 0;
  for (const idx of cells) {
    if (removed >= removeCount) break;
    const r = Math.floor(idx / N),
      c = idx % N;
    const bk = p[r][c];
    p[r][c] = 0;
    if (countSolutions(p) !== 1) p[r][c] = bk;
    else removed++;
  }
  return p;
}

/* ─── Cambio dimensione ──────────────────────────────── */
function onSizeChange() {}

/* ─── Avvio / Pausa / Ricomincia ─────────────────────── */
function startGame() {
  const size = parseInt(document.getElementById("size-sel").value);
  cfg = SIZE_CONFIG[size];
  N = cfg.N;

  const diff = document.getElementById("diff-sel").value;
  const removeCount = cfg.remove[diff];

  mistakes = 0;
  hints = 3;
  timerSec = 0;
  selected = null;
  gameOver = false;
  paused = false;
  started = true;

  document.getElementById("board").style.display = "table";
  document.getElementById("sidebar").classList.add("visible");

  const wrap = document.getElementById("board-wrap");
  wrap.className = "board-wrap size-" + N;

  document.getElementById("win-banner").classList.add("hidden");
  document.getElementById("start-overlay").classList.add("hidden");
  document.getElementById("pause-overlay").classList.add("hidden");
  document.getElementById("s-mistakes").textContent = "0";
  document.getElementById("s-hints").textContent = "3";
  document.getElementById("hints-count").textContent = "3";
  document.getElementById("s-time").textContent = "0:00";
  const diffText =
    document.getElementById("diff-sel").options[
      document.getElementById("diff-sel").selectedIndex
    ].text;
  document.getElementById("s-diff").textContent = diffText;

  document.getElementById("btn-pause").disabled = false;
  document.getElementById("btn-restart").disabled = false;
  document
    .getElementById("btn-pause")
    .querySelector("#pause-label").textContent = "Pausa";
  setPauseIcon(false);
  setMode("num");
  document.getElementById("hint-btn").disabled = false;

  clearInterval(timerInt);
  timerInt = setInterval(() => {
    if (!gameOver && !paused) {
      timerSec++;
      document.getElementById("s-time").textContent = fmt(timerSec);
    }
  }, 1000);

  solution = generateSolution();
  puzzle = createPuzzle(solution, removeCount);
  userGrid = puzzle.map((r) => [...r]);
  notes = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => new Set()),
  );

  renderBoard();
  buildNumpad();
  updateCounter();
}

function togglePause() {
  if (!started || gameOver) return;
  paused = !paused;
  document.getElementById("pause-overlay").classList.toggle("hidden", !paused);
  document
    .getElementById("btn-pause")
    .querySelector("#pause-label").textContent = paused ? "Riprendi" : "Pausa";
  setPauseIcon(paused);
}

function setPauseIcon(isPaused) {
  const icon = document.getElementById("pause-icon");
  icon.innerHTML = isPaused
    ? '<polygon points="5,3 19,12 5,21"/>'
    : '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
}

function restartGame() {
  if (!started) return;
  userGrid = puzzle.map((r) => [...r]);
  notes = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => new Set()),
  );
  mistakes = 0;
  hints = 3;
  timerSec = 0;
  gameOver = false;
  paused = false;
  selected = null;

  document.getElementById("win-banner").classList.add("hidden");
  document.getElementById("pause-overlay").classList.add("hidden");
  document.getElementById("s-mistakes").textContent = "0";
  document.getElementById("s-hints").textContent = "3";
  document.getElementById("hints-count").textContent = "3";
  document.getElementById("s-time").textContent = "0:00";
  document
    .getElementById("btn-pause")
    .querySelector("#pause-label").textContent = "Pausa";
  setPauseIcon(false);
  setMode("num");
  document.getElementById("hint-btn").disabled = false;

  clearInterval(timerInt);
  timerInt = setInterval(() => {
    if (!gameOver && !paused) {
      timerSec++;
      document.getElementById("s-time").textContent = fmt(timerSec);
    }
  }, 1000);

  renderBoard();
  updateCounter();
}

/* ─── Rendering ──────────────────────────────────────── */
function isBlockBorder(r, c) {
  const { bh, bw } = blockSize();
  return {
    right: (c + 1) % bw === 0 && c < N - 1,
    bottom: (r + 1) % bh === 0 && r < N - 1,
  };
}

function renderBoard() {
  const table = document.getElementById("board");
  table.innerHTML = "";

  for (let r = 0; r < N; r++) {
    const tr = document.createElement("tr");
    for (let c = 0; c < N; c++) {
      const td = document.createElement("td");
      td.dataset.r = r;
      td.dataset.c = c;
      td.tabIndex = 0;

      const bb = isBlockBorder(r, c);
      if (bb.right) td.classList.add("block-right");
      if (bb.bottom) td.classList.add("block-bottom");

      td.addEventListener("click", () => selectCell(r, c));
      td.addEventListener("keydown", handleCellKey);

      const v = puzzle[r][c];
      if (v !== 0) {
        td.classList.add("given");
        td.dataset.n = v;
        td.textContent = v;
      } else {
        renderCellContent(td, r, c);
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }

  if (N === 16) {
    document.querySelectorAll("#board td").forEach((td) => {
      td.style.width = "38px";
      td.style.height = "38px";
      td.style.fontSize = "12px";
    });
  }
}

function renderCellContent(td, r, c) {
  const v = userGrid[r][c];
  if (v !== 0) {
    td.dataset.n = v;
    const isWrong = v !== solution[r][c];
    // Apply error class directly on td for persistent background
    if (isWrong) {
      td.classList.add("user-val", "has-error");
      td.classList.remove("user-correct");
    } else {
      td.classList.add("user-val", "user-correct");
      td.classList.remove("has-error");
    }
    td.innerHTML = `<div class="ci">${v}</div>`;
  } else if (notes[r][c].size > 0) {
    delete td.dataset.n;
    td.classList.remove("user-val", "has-error", "user-correct");
    const cols = cfg.cols;
    const syms = cfg.symbols.split("");
    let html = `<div class="cell-notes" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${Math.ceil(N / cols)},1fr);">`;
    for (const s of syms) {
      const active = notes[r][c].has(s);
      const sz = N <= 6 ? "9px" : N <= 9 ? "7px" : "5px";
      html += `<div class="note-item${active ? " active" : ""}" style="${active ? `color:${NUM_COLORS[s]};` : ""}font-size:${sz}">${active ? s : ""}</div>`;
    }
    html += "</div>";
    td.innerHTML = html;
  } else {
    delete td.dataset.n;
    td.classList.remove("user-val", "has-error", "user-correct");
    td.innerHTML = "";
  }
}

function refreshStyles() {
  document.querySelectorAll("#board td").forEach((td) => {
    td.classList.remove("selected", "highlight", "same-num");
    const r = +td.dataset.r,
      c = +td.dataset.c;

    if (!selected) return;
    const { r: sr, c: sc } = selected;
    const selVal = userGrid[sr][sc] || puzzle[sr][sc] || 0;
    const sameBlock = blockId(r, c) === blockId(sr, sc);

    if (r === sr && c === sc) {
      td.classList.add("selected");
    } else if (r === sr || c === sc || sameBlock) {
      td.classList.add("highlight");
      const cv = td.classList.contains("given") ? puzzle[r][c] : userGrid[r][c];
      if (selVal && cv === selVal) td.classList.add("same-num");
    } else {
      const cv = td.classList.contains("given") ? puzzle[r][c] : userGrid[r][c];
      if (selVal && cv === selVal) td.classList.add("same-num");
    }
  });
}

/* ─── Selezione & Input ──────────────────────────────── */
function selectCell(r, c) {
  if (!started || gameOver || paused) return;
  selected = { r, c };
  refreshStyles();
}

function setMode(m) {
  mode = m;
  document.getElementById("mode-num").classList.toggle("active", m === "num");
  document.getElementById("mode-note").classList.toggle("active", m === "note");
}

function inputNum(v) {
  if (!selected || gameOver || paused || !started) return;
  const { r, c } = selected;
  if (puzzle[r][c] !== 0) return;

  if (v === 0) {
    userGrid[r][c] = 0;
    notes[r][c].clear();
  } else if (mode === "note") {
    userGrid[r][c] = 0;
    if (notes[r][c].has(v)) notes[r][c].delete(v);
    else notes[r][c].add(v);
  } else {
    const correct = solution[r][c] === v;
    if (!correct) {
      mistakes++;
      document.getElementById("s-mistakes").textContent = mistakes;
      // Animate the error stat pill
      const pill = document.querySelector(".sp-err");
      pill.classList.remove("bump");
      void pill.offsetWidth;
      pill.classList.add("bump");
    }
    userGrid[r][c] = v;
    if (correct) clearAffectedNotes(r, c, v);
  }

  updateSingleCell(r, c);
  updateCounter();
  checkWin();
}

function eraseCell() {
  inputNum(0);
}

function clearAffectedNotes(r, c, v) {
  for (let i = 0; i < N; i++) {
    notes[r][i].delete(v);
    notes[i][c].delete(v);
    if (puzzle[r][i] === 0) refreshSingleCell(r, i);
    if (puzzle[i][c] === 0) refreshSingleCell(i, c);
  }
  const { br, bc } = blockStart(r, c);
  const { bh, bw } = blockSize();
  for (let i = 0; i < bh; i++)
    for (let j = 0; j < bw; j++) {
      notes[br + i][bc + j].delete(v);
      if (puzzle[br + i][bc + j] === 0) refreshSingleCell(br + i, bc + j);
    }
}

function getCell(r, c) {
  return document.querySelector(`#board td[data-r="${r}"][data-c="${c}"]`);
}
function refreshSingleCell(r, c) {
  const td = getCell(r, c);
  if (td && !td.classList.contains("given")) renderCellContent(td, r, c);
}
function updateSingleCell(r, c) {
  const td = getCell(r, c);
  if (!td || td.classList.contains("given")) return;
  renderCellContent(td, r, c);
  refreshStyles();
}

/* ─── Suggerisci ─────────────────────────────────────── */
function useHint() {
  if (hints <= 0 || !selected || gameOver || !started || paused) return;
  const { r, c } = selected;
  if (puzzle[r][c] !== 0 || userGrid[r][c] === solution[r][c]) return;

  hints--;
  document.getElementById("s-hints").textContent = hints;
  document.getElementById("hints-count").textContent = hints;
  if (hints === 0) document.getElementById("hint-btn").disabled = true;

  userGrid[r][c] = solution[r][c];
  notes[r][c].clear();
  clearAffectedNotes(r, c, solution[r][c]);
  updateSingleCell(r, c);
  updateCounter();
  checkWin();
}

/* ─── Numpad & Counter ───────────────────────────────── */
function buildNumpad() {
  const np = document.getElementById("numpad");
  np.innerHTML = "";
  np.style.gridTemplateColumns = `repeat(${cfg.cols},1fr)`;

  for (const s of cfg.symbols.split("")) {
    const btn = document.createElement("button");
    btn.className = "num-btn";
    btn.textContent = s;
    btn.dataset.n = s;
    btn.setAttribute("aria-label", `Simbolo ${s}`);
    btn.addEventListener("click", () => inputNum(s));
    np.appendChild(btn);
  }
}

function updateCounter() {
  const count = {};
  for (const s of cfg.symbols.split("")) count[s] = 0;
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      const v = userGrid[r][c];
      if (v && count[v] !== undefined) count[v]++;
    }

  document.querySelectorAll(".num-btn").forEach((btn) => {
    const s = btn.dataset.n;
    btn.classList.toggle("exhausted", count[s] >= N);
  });

  const nc = document.getElementById("num-counter");
  nc.innerHTML = "";
  const cols = cfg.cols >= 4 ? 4 : 3;
  nc.style.gridTemplateColumns = `repeat(${cols},1fr)`;

  for (const s of cfg.symbols.split("")) {
    const rem = N - count[s];
    const item = document.createElement("div");
    item.className = "nc-item" + (rem === 0 ? " done" : "");
    item.innerHTML = `<span class="nc-digit" style="color:${NUM_COLORS[s]}">${s}</span><span class="nc-rem">${rem === 0 ? "✓" : rem}</span>`;
    nc.appendChild(item);
  }
}

/* ─── Vittoria ───────────────────────────────────────── */
function checkWin() {
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) if (userGrid[r][c] !== solution[r][c]) return;

  gameOver = true;
  clearInterval(timerInt);

  document.getElementById("win-time").textContent = `⏱ ${fmt(timerSec)}`;
  document.getElementById("win-mistakes").textContent = `✗ ${mistakes} errori`;
  document.getElementById("win-banner").classList.remove("hidden");
}

/* ─── Tastiera ───────────────────────────────────────── */
function handleCellKey(e) {
  const r = +e.currentTarget.dataset.r;
  const c = +e.currentTarget.dataset.c;
  selectCell(r, c);
  const key = e.key;
  if (key === "ArrowUp") {
    e.preventDefault();
    moveTo(r - 1, c);
    return;
  }
  if (key === "ArrowDown") {
    e.preventDefault();
    moveTo(r + 1, c);
    return;
  }
  if (key === "ArrowLeft") {
    e.preventDefault();
    moveTo(r, c - 1);
    return;
  }
  if (key === "ArrowRight") {
    e.preventDefault();
    moveTo(r, c + 1);
    return;
  }
  handleInput(key);
}

document.addEventListener("keydown", function (e) {
  if (!document.getElementById("rules-overlay").classList.contains("hidden")) {
    if (e.key === "Escape") closeRules();
    return;
  }
  const tag = document.activeElement?.tagName;
  if (tag === "SELECT" || tag === "BUTTON") return;
  if (e.key === "Escape") closeRules();
  if (e.key === " ") {
    e.preventDefault();
    togglePause();
    return;
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (selected) moveTo(selected.r - 1, selected.c);
    return;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (selected) moveTo(selected.r + 1, selected.c);
    return;
  }
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    if (selected) moveTo(selected.r, selected.c - 1);
    return;
  }
  if (e.key === "ArrowRight") {
    e.preventDefault();
    if (selected) moveTo(selected.r, selected.c + 1);
    return;
  }
  handleInput(e.key);
});

function moveTo(r, c) {
  r = Math.max(0, Math.min(N - 1, r));
  c = Math.max(0, Math.min(N - 1, c));
  selectCell(r, c);
  getCell(r, c)?.focus();
}

function handleInput(key) {
  if (!started || gameOver || paused) return;
  if (key === "n" || key === "N") {
    setMode(mode === "num" ? "note" : "num");
    return;
  }
  if (key === "Backspace" || key === "Delete") {
    inputNum(0);
    return;
  }
  const up = key.toUpperCase();
  if (cfg.symbols.includes(up)) {
    inputNum(up);
    return;
  }
}

/* ─── Init ───────────────────────────────────────────── */
buildNumpad();
updateCounter();
