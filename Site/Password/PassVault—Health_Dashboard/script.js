// ── STATE ──
let vault = JSON.parse(localStorage.getItem("passvault") || "[]");

// ── UTILS ──
function save() {
  localStorage.setItem("passvault", JSON.stringify(vault));
}

function scorePassword(pw) {
  if (!pw) return { score: 0, label: "Debole", cls: "health-weak", tier: 0 };
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (pw.length >= 16) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^a-zA-Z0-9]/.test(pw)) score += 1;
  if (pw.length >= 20) score += 1;

  if (score >= 6)
    return { score, label: "Forte", cls: "health-strong", tier: 2 };
  if (score >= 4)
    return { score, label: "Media", cls: "health-medium", tier: 1 };
  return { score, label: "Debole", cls: "health-weak", tier: 0 };
}

function toggleVis(id, btn) {
  const inp = document.getElementById(id);
  if (inp.type === "password") {
    inp.type = "text";
    btn.textContent = "🙈";
  } else {
    inp.type = "password";
    btn.textContent = "👁";
  }
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

function siteIcon(name) {
  return (name || "?").slice(0, 2).toUpperCase();
}

// ── STRENGTH PREVIEW ──
function previewStrength(pw) {
  const segs = [
    document.getElementById("s1"),
    document.getElementById("s2"),
    document.getElementById("s3"),
    document.getElementById("s4"),
  ];
  const s = scorePassword(pw);
  const colors = ["var(--red)", "var(--yellow)", "var(--green)"];
  const fill = Math.ceil((s.score / 8) * 4);
  segs.forEach((seg, i) => {
    seg.style.background = i < fill ? colors[s.tier] : "var(--surface3)";
  });
}

// ── VAULT ──
function addEntry() {
  const site = document.getElementById("inp-site").value.trim();
  const user = document.getElementById("inp-user").value.trim();
  const pass = document.getElementById("inp-pass").value;

  if (!site || !pass) {
    showToast("⚠ Sito e password sono obbligatori");
    return;
  }

  vault.unshift({ id: Date.now(), site, user, pass });
  save();
  renderVault();
  updateDashboard();

  document.getElementById("inp-site").value = "";
  document.getElementById("inp-user").value = "";
  document.getElementById("inp-pass").value = "";
  previewStrength("");
  showToast("✓ Credenziale aggiunta");
}

function deleteEntry(id) {
  vault = vault.filter((v) => v.id !== id);
  save();
  renderVault();
  updateDashboard();
  showToast("🗑 Voce eliminata");
}

function copyPassword(pw) {
  navigator.clipboard
    .writeText(pw)
    .then(() => showToast("✓ Password copiata!"));
}

function renderVault() {
  const list = document.getElementById("vault-list");
  document.getElementById("count-label").textContent =
    `${vault.length} ${vault.length === 1 ? "voce" : "voci"}`;

  if (vault.length === 0) {
    list.innerHTML = `<div class="vault-empty"><span class="empty-icon">🔒</span>Il vault è vuoto.<br>Aggiungi la tua prima credenziale.</div>`;
    return;
  }

  list.innerHTML = vault
    .map((entry) => {
      const s = scorePassword(entry.pass);
      const masked = "•".repeat(Math.min(entry.pass.length, 14));
      return `
      <div class="vault-item">
        <div class="item-site">
          <div class="site-icon">${siteIcon(entry.site)}</div>
          <div>
            <div style="font-weight:600;font-size:14px">${entry.site}</div>
            <div style="font-size:11px;color:var(--text-dim);font-family:var(--mono)">${entry.user || "–"}</div>
          </div>
        </div>
        <div class="item-password">
          <span class="pw-dots" id="pw-${entry.id}">${masked}</span>
          <button class="copy-btn" title="Copia" onclick="copyPassword('${entry.pass.replace(/'/g, "\\'")}')" >📋</button>
          <button class="copy-btn" title="Mostra/Nascondi" onclick="toggleEntry(${entry.id}, '${entry.pass.replace(/'/g, "\\'")}')">👁</button>
        </div>
        <div>
          <span class="health-badge ${s.cls}">${s.label.toUpperCase()}</span>
        </div>
        <div class="item-actions">
          <button class="del-btn" title="Elimina" onclick="deleteEntry(${entry.id})">🗑</button>
        </div>
      </div>
    `;
    })
    .join("");
}

function toggleEntry(id, pw) {
  const el = document.getElementById("pw-" + id);
  if (!el) return;
  if (el.dataset.shown === "1") {
    el.textContent = "•".repeat(Math.min(pw.length, 14));
    el.dataset.shown = "0";
  } else {
    el.textContent = pw;
    el.dataset.shown = "1";
  }
}

// ── DASHBOARD ──
function updateDashboard() {
  const total = vault.length;
  const strong = vault.filter((v) => scorePassword(v.pass).tier === 2).length;
  const medium = vault.filter((v) => scorePassword(v.pass).tier === 1).length;
  const weak = vault.filter((v) => scorePassword(v.pass).tier === 0).length;

  document.getElementById("d-total").textContent = total;
  document.getElementById("d-strong").textContent = strong;
  document.getElementById("d-medium").textContent = medium;
  document.getElementById("d-weak").textContent = weak;

  // Bars
  const maxBar = total || 1;
  const setBar = (id, nId, val) => {
    document.getElementById(id).style.width = (val / maxBar) * 100 + "%";
    document.getElementById(nId).textContent = val;
  };

  // Duplicates
  const passMap = {};
  vault.forEach((v) => {
    if (!passMap[v.pass]) passMap[v.pass] = [];
    passMap[v.pass].push(v.site);
  });
  const dups = Object.values(passMap).filter((arr) => arr.length > 1);
  const dupCount = dups.reduce((acc, arr) => acc + arr.length, 0);

  setBar("b-strong", "b-strong-n", strong);
  setBar("b-medium", "b-medium-n", medium);
  setBar("b-weak", "b-weak-n", weak);
  setBar("b-dup", "b-dup-n", dupCount);

  // Health Score
  let score = 0;
  if (total > 0) {
    const strengthScore = (strong * 100 + medium * 50 + weak * 0) / total;
    const dupPenalty = (dupCount / total) * 30;
    score = Math.round(Math.max(0, strengthScore - dupPenalty));
  }

  document.getElementById("score-num").textContent = total > 0 ? score : "–";

  const ring = document.getElementById("score-ring-fill");
  const circumference = 339.3;
  const offset = circumference - (score / 100) * circumference;
  ring.style.strokeDashoffset = total > 0 ? offset : circumference;

  let grade, desc, color;
  if (total === 0) {
    grade = "–";
    desc = "Aggiungi password";
    color = "var(--text-dim)";
  } else if (score >= 80) {
    grade = "OTTIMO";
    desc = "Vault ben protetto";
    color = "var(--green)";
    ring.style.stroke = "var(--green)";
  } else if (score >= 60) {
    grade = "BUONO";
    desc = "Qualche miglioramento possibile";
    color = "var(--green)";
    ring.style.stroke = "var(--green)";
  } else if (score >= 40) {
    grade = "DISCRETO";
    desc = "Rafforza le password deboli";
    color = "var(--yellow)";
    ring.style.stroke = "var(--yellow)";
  } else {
    grade = "CRITICO";
    desc = "Vault a rischio elevato";
    color = "var(--red)";
    ring.style.stroke = "var(--red)";
  }

  document.getElementById("score-grade").textContent = grade;
  document.getElementById("score-grade").style.color = color;
  document.getElementById("score-desc").textContent = desc;

  // Duplicates list
  const dupList = document.getElementById("dup-list");
  if (dups.length === 0) {
    dupList.innerHTML =
      '<div class="no-dup">✓ Nessuna password duplicata rilevata</div>';
  } else {
    dupList.innerHTML =
      '<div class="dup-list">' +
      dups
        .map(
          (sites) => `
        <div class="dup-item">
          <div class="dup-icon">⚠️</div>
          <div class="dup-text">
            <div class="dup-sites">${sites.join(" · ")}</div>
            <div class="dup-warn">Usano la stessa password — cambiane almeno una</div>
          </div>
        </div>
      `,
        )
        .join("") +
      "</div>";
  }
}

// ── TABS ──
function switchTab(name) {
  document
    .querySelectorAll(".panel")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById("tab-" + name).classList.add("active");
  event.target.classList.add("active");
  if (name === "dashboard") updateDashboard();
}

// ── INIT ──
renderVault();
updateDashboard();