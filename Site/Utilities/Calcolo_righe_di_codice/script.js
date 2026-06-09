// ── EXTENSIONS CONFIG ──
let EXTENSIONS_CODICE = new Set();

async function loadExtensions() {
  try {
    const res = await fetch("extensions.json");
    if (!res.ok) throw new Error("fetch failed");
    const config = await res.json();
    EXTENSIONS_CODICE = new Set(Object.values(config).flat());
    console.log(`{ lines } — caricate ${EXTENSIONS_CODICE.size} estensioni da extensions.json ✓`);
  } catch (e) {
    console.warn("extensions.json non trovato, uso fallback.", e);
  }
}

// ── STATE ──
let fileTree = {};

// ── DOM REFS ──
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const folderInput = document.getElementById("folderInput");
const escludiVuote = document.getElementById("escludiVuote");
const escludiCommenti = document.getElementById("escludiCommenti");
const soloCodice = document.getElementById("soloCodice");
const searchFilter = document.getElementById("searchFilter");

// ── DRAG & DROP ──
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("drag-over");
});

dropzone.addEventListener("dragleave", (e) => {
  if (!dropzone.contains(e.relatedTarget)) dropzone.classList.remove("drag-over");
});

dropzone.addEventListener("drop", async (e) => {
  e.preventDefault();
  dropzone.classList.remove("drag-over");
  const items = Array.from(e.dataTransfer.items);
  const files = [];
  for (const item of items) {
    const entry = item.webkitGetAsEntry && item.webkitGetAsEntry();
    if (entry) files.push(...(await getAllFilesFromEntry(entry)));
  }
  if (files.length) await processFiles(files, "drop");
});

fileInput.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  if (files.length) await processFiles(files, "files");
  fileInput.value = "";
});

folderInput.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  if (files.length) await processFiles(files, "folder");
  folderInput.value = "";
});

// ── FILE READING ──
async function getAllFilesFromEntry(entry, path = "") {
  const files = [];
  if (entry.isFile) {
    const file = await new Promise((res) => entry.file(res));
    file.relativePath = path ? `${path}/${entry.name}` : entry.name;
    files.push(file);
  } else if (entry.isDirectory) {
    const subPath = path ? `${path}/${entry.name}` : entry.name;
    const reader = entry.createReader();
    const entries = await readAllEntries(reader);
    for (const sub of entries) files.push(...(await getAllFilesFromEntry(sub, subPath)));
  }
  return files;
}

function readAllEntries(reader) {
  return new Promise((resolve) => {
    const all = [];
    function read() {
      reader.readEntries((entries) => {
        if (!entries.length) resolve(all);
        else { all.push(...entries); read(); }
      });
    }
    read();
  });
}

function readFileContent(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.onerror = rej;
    r.readAsText(file, "UTF-8");
  });
}

// ── PROCESS FILES (local) ──
async function processFiles(files, sourceType) {
  showLoading();
  const sourceName = getSourceName(files, sourceType);
  const branch = {};
  let count = 0;

  for (const file of files) {
    const relPath = file.relativePath || file.webkitRelativePath || file.name;
    const parts = relPath.split("/").filter(Boolean);
    const fileName = parts[parts.length - 1];
    const ext = fileName.split(".").pop().toLowerCase();
    if (soloCodice.checked && !EXTENSIONS_CODICE.has(ext)) continue;

    let content;
    try { content = await readFileContent(file); } catch (e) { continue; }

    const lines = countLines(content);
    let folders = parts.slice(0, -1);
    if (folders.length > 0 && folders[0] === sourceName) folders = folders.slice(1);

    let node = branch;
    for (const f of folders) {
      if (!node[f]) node[f] = { __files__: [] };
      node = node[f];
    }
    if (!node.__files__) node.__files__ = [];
    node.__files__.push({ name: fileName, fullPath: relPath, lines, size: file.size, content });
    count++;
    if (count % 20 === 0) await delay(0);
  }

  if (count === 0) {
    renderTree();
    showToast("⚠ Nessun file di codice trovato");
    return;
  }

  let name = sourceName;
  let i = 2;
  while (fileTree[name]) name = `${sourceName} (${i++})`;
  fileTree[name] = branch;

  renderSources();
  renderTree();
  updateStats();
  showToast(`✓ ${count} file da "${name}"`);
}

function getSourceName(files, sourceType) {
  if (sourceType === "folder") {
    const rel = files[0].webkitRelativePath || files[0].relativePath || files[0].name;
    return rel.split("/")[0] || "cartella";
  }
  if (sourceType === "drop") {
    const rel = files[0].relativePath || files[0].name;
    return rel.split("/")[0] || "drop";
  }
  return `file (${files.length})`;
}

// ══════════════════════════════════════════════
// ── REMOTE URL IMPORT ──
// ══════════════════════════════════════════════

/**
 * Parses a repo URL and returns provider info.
 * Supports: GitHub, GitLab, Bitbucket, Codeberg, Gitea-like instances
 */
function parseRepoUrl(url) {
  url = url.trim().replace(/\.git$/, "");

  // GitHub: https://github.com/owner/repo[/tree/branch[/path]]
  let m = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\/tree\/([^/]+)(?:\/(.+))?)?$/);
  if (m) return { provider: "github", owner: m[1], repo: m[2], branch: m[3] || null, subpath: m[4] || "" };

  // GitLab: https://gitlab.com/owner/repo[/-/tree/branch[/path]]
  m = url.match(/^https?:\/\/gitlab\.com\/([^/]+(?:\/[^/]+)*)\/([^/]+?)(?:\/-\/tree\/([^/]+)(?:\/(.+))?)?$/);
  if (m) return { provider: "gitlab", owner: m[1], repo: m[2], branch: m[3] || null, subpath: m[4] || "" };

  // Bitbucket: https://bitbucket.org/owner/repo[/src/branch[/path]]
  m = url.match(/^https?:\/\/bitbucket\.org\/([^/]+)\/([^/]+?)(?:\/src\/([^/]+)(?:\/(.+))?)?$/);
  if (m) return { provider: "bitbucket", owner: m[1], repo: m[2], branch: m[3] || null, subpath: m[4] || "" };

  // Codeberg: https://codeberg.org/owner/repo[/src/branch/branch[/path]]
  m = url.match(/^https?:\/\/codeberg\.org\/([^/]+)\/([^/]+?)(?:\/src\/branch\/([^/]+)(?:\/(.+))?)?$/);
  if (m) return { provider: "codeberg", owner: m[1], repo: m[2], branch: m[3] || null, subpath: m[4] || "" };

  return null;
}

async function importFromUrl(url, tokenOverride) {
  const parsed = parseRepoUrl(url);
  if (!parsed) {
    showToast("⚠ URL non riconosciuto. Supporto: GitHub, GitLab, Bitbucket, Codeberg");
    return;
  }

  const modal = document.getElementById("urlModal");
  modal.classList.add("hidden");
  showLoading();

  const token = tokenOverride || document.getElementById("urlToken").value.trim() || null;

  try {
    let virtualFiles = [];
    switch (parsed.provider) {
      case "github":    virtualFiles = await fetchGitHub(parsed, token); break;
      case "gitlab":    virtualFiles = await fetchGitLab(parsed, token); break;
      case "bitbucket": virtualFiles = await fetchBitbucket(parsed, token); break;
      case "codeberg":  virtualFiles = await fetchCodeberg(parsed, token); break;
    }
    await processVirtualFiles(virtualFiles, parsed);
  } catch (err) {
    renderTree();
    console.error(err);
    showToast(`✕ Errore: ${err.message}`);
  }
}

// ── GITHUB ──
async function fetchGitHub(parsed, token) {
  const headers = { Accept: "application/vnd.github+json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Resolve default branch if not specified
  let branch = parsed.branch;
  if (!branch) {
    const meta = await apiFetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, headers);
    branch = meta.default_branch || "main";
  }

  // Get file tree
  const treePath = parsed.subpath ? `${parsed.subpath}` : "";
  const treeUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/trees/${branch}?recursive=1`;
  const treeData = await apiFetch(treeUrl, headers);

  if (!treeData.tree) throw new Error("Repo non trovato o privato (serve token)");

  const sub = parsed.subpath ? parsed.subpath.replace(/\/$/, "") + "/" : "";
  const blobs = treeData.tree.filter(
    (item) => item.type === "blob" && (!sub || item.path.startsWith(sub))
  );

  const virtualFiles = [];
  for (const blob of blobs) {
    const ext = blob.path.split(".").pop().toLowerCase();
    if (soloCodice.checked && !EXTENSIONS_CODICE.has(ext)) continue;

    const rawUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branch}/${blob.path}`;
    const content = await fetchRaw(rawUrl, token ? { Authorization: `Bearer ${token}` } : {});
    const relPath = sub ? blob.path.slice(sub.length) : blob.path;
    virtualFiles.push({ path: relPath, content, size: blob.size || content.length });
  }
  return virtualFiles;
}

// ── GITLAB ──
async function fetchGitLab(parsed, token) {
  const headers = {};
  if (token) headers["PRIVATE-TOKEN"] = token;

  const projectId = encodeURIComponent(`${parsed.owner}/${parsed.repo}`);
  let branch = parsed.branch;
  if (!branch) {
    const meta = await apiFetch(`https://gitlab.com/api/v4/projects/${projectId}`, headers);
    branch = meta.default_branch || "main";
  }

  // List repository tree (recursive, paginated)
  let allFiles = [];
  let page = 1;
  const subpath = parsed.subpath ? parsed.subpath.replace(/\/$/, "") : "";
  while (true) {
    const qPath = subpath ? `&path=${encodeURIComponent(subpath)}` : "";
    const url = `https://gitlab.com/api/v4/projects/${projectId}/repository/tree?recursive=true&per_page=100&page=${page}&ref=${branch}${qPath}`;
    const data = await apiFetch(url, headers);
    if (!Array.isArray(data)) throw new Error("GitLab: repo non trovato o privato (serve token)");
    const blobs = data.filter((i) => i.type === "blob");
    allFiles.push(...blobs);
    if (data.length < 100) break;
    page++;
  }

  const virtualFiles = [];
  for (const item of allFiles) {
    const ext = item.path.split(".").pop().toLowerCase();
    if (soloCodice.checked && !EXTENSIONS_CODICE.has(ext)) continue;

    const rawUrl = `https://gitlab.com/api/v4/projects/${projectId}/repository/files/${encodeURIComponent(item.path)}/raw?ref=${branch}`;
    const content = await fetchRaw(rawUrl, headers);
    const relPath = subpath ? item.path.slice(subpath.length).replace(/^\//, "") : item.path;
    virtualFiles.push({ path: relPath, content, size: content.length });
  }
  return virtualFiles;
}

// ── BITBUCKET ──
async function fetchBitbucket(parsed, token) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let branch = parsed.branch;
  if (!branch) {
    const meta = await apiFetch(`https://api.bitbucket.org/2.0/repositories/${parsed.owner}/${parsed.repo}`, headers);
    branch = meta.mainbranch?.name || "main";
  }

  // Paginated file listing
  let allFiles = [];
  let nextUrl = `https://api.bitbucket.org/2.0/repositories/${parsed.owner}/${parsed.repo}/src/${branch}/${parsed.subpath}?pagelen=100&fields=values.path,values.type,next`;
  while (nextUrl) {
    const data = await apiFetch(nextUrl, headers);
    if (!data.values) throw new Error("Bitbucket: repo non trovato o privato");
    allFiles.push(...data.values.filter((i) => i.type === "commit_file"));
    nextUrl = data.next || null;
  }

  const virtualFiles = [];
  for (const item of allFiles) {
    const ext = item.path.split(".").pop().toLowerCase();
    if (soloCodice.checked && !EXTENSIONS_CODICE.has(ext)) continue;

    const rawUrl = `https://api.bitbucket.org/2.0/repositories/${parsed.owner}/${parsed.repo}/src/${branch}/${item.path}`;
    const content = await fetchRaw(rawUrl, headers);
    const sub = parsed.subpath ? parsed.subpath.replace(/\/$/, "") + "/" : "";
    const relPath = sub ? item.path.slice(sub.length) : item.path;
    virtualFiles.push({ path: relPath, content, size: content.length });
  }
  return virtualFiles;
}

// ── CODEBERG (Gitea API) ──
async function fetchCodeberg(parsed, token) {
  const headers = {};
  if (token) headers["Authorization"] = `token ${token}`;

  let branch = parsed.branch;
  if (!branch) {
    const meta = await apiFetch(`https://codeberg.org/api/v1/repos/${parsed.owner}/${parsed.repo}`, headers);
    branch = meta.default_branch || "main";
  }

  const treeUrl = `https://codeberg.org/api/v1/repos/${parsed.owner}/${parsed.repo}/git/trees/${branch}?recursive=true&token=${token || ""}`;
  const treeData = await apiFetch(treeUrl, headers);

  const items = treeData.tree || [];
  const sub = parsed.subpath ? parsed.subpath.replace(/\/$/, "") + "/" : "";
  const blobs = items.filter((i) => i.type === "blob" && (!sub || i.path.startsWith(sub)));

  const virtualFiles = [];
  for (const item of blobs) {
    const ext = item.path.split(".").pop().toLowerCase();
    if (soloCodice.checked && !EXTENSIONS_CODICE.has(ext)) continue;

    const rawUrl = `https://codeberg.org/${parsed.owner}/${parsed.repo}/raw/branch/${branch}/${item.path}`;
    const content = await fetchRaw(rawUrl, headers);
    const relPath = sub ? item.path.slice(sub.length) : item.path;
    virtualFiles.push({ path: relPath, content, size: content.length });
  }
  return virtualFiles;
}

// ── PROCESS VIRTUAL FILES (remote) ──
async function processVirtualFiles(virtualFiles, parsed) {
  if (virtualFiles.length === 0) {
    renderTree();
    showToast("⚠ Nessun file di codice trovato nel repository");
    return;
  }

  const branch = {};
  let count = 0;

  for (const vf of virtualFiles) {
    const parts = vf.path.split("/").filter(Boolean);
    const fileName = parts[parts.length - 1];
    const lines = countLines(vf.content);
    const folders = parts.slice(0, -1);

    let node = branch;
    for (const f of folders) {
      if (!node[f]) node[f] = { __files__: [] };
      node = node[f];
    }
    if (!node.__files__) node.__files__ = [];
    node.__files__.push({ name: fileName, fullPath: vf.path, lines, size: vf.size, content: vf.content });
    count++;
    if (count % 20 === 0) await delay(0);
  }

  const baseName = `${parsed.owner}/${parsed.repo}`;
  let name = baseName;
  let i = 2;
  while (fileTree[name]) name = `${baseName} (${i++})`;
  fileTree[name] = branch;

  renderSources();
  renderTree();
  updateStats();
  showToast(`✓ ${count} file da "${name}"`);
}

// ── HTTP HELPERS ──
async function apiFetch(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const msg = res.status === 403 ? "Rate limit o accesso negato (prova con un token)" :
                res.status === 404 ? "Repository non trovato (privato? prova con un token)" :
                `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

async function fetchRaw(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Impossibile scaricare file: ${url}`);
  return res.text();
}

// ── URL MODAL ──
function apriModalUrl() {
  document.getElementById("urlModal").classList.remove("hidden");
  document.getElementById("urlInput").focus();
}

function chiudiModalUrl() {
  document.getElementById("urlModal").classList.add("hidden");
  document.getElementById("urlInput").value = "";
  document.getElementById("urlToken").value = "";
  document.getElementById("urlError").textContent = "";
}

async function confermaImportUrl() {
  const url = document.getElementById("urlInput").value.trim();
  const token = document.getElementById("urlToken").value.trim();
  const errEl = document.getElementById("urlError");

  if (!url) { errEl.textContent = "Inserisci un URL valido."; return; }
  const parsed = parseRepoUrl(url);
  if (!parsed) {
    errEl.textContent = "URL non riconosciuto. Esempio: https://github.com/owner/repo";
    return;
  }
  errEl.textContent = "";
  await importFromUrl(url, token || null);
}

// ── LINE COUNTING ──
function countLines(content) {
  const exEmpty = escludiVuote.checked;
  const exComments = escludiCommenti.checked;
  const lines = content.split("\n");
  let count = 0;
  let inMulti = false;

  for (const raw of lines) {
    const t = raw.trim();
    if (exComments) {
      if (!inMulti && t.includes("/*") && !t.includes("*/")) { inMulti = true; continue; }
      if (inMulti) { if (t.includes("*/")) inMulti = false; continue; }
      if (t.startsWith("//") || t.startsWith("#") || t.startsWith("--") || t.startsWith("%") || t.startsWith("<!--")) continue;
    }
    if (exEmpty && t === "") continue;
    count++;
  }
  return count;
}

// ── STATS ──
function calcNodeStats(node, filter = "") {
  let files = 0, lines = 0, size = 0;
  const fl = (node.__files__ || []).filter((f) => !filter || f.name.toLowerCase().includes(filter));
  for (const f of fl) { files++; lines += f.lines; size += f.size; }
  for (const k of Object.keys(node).filter((k) => k !== "__files__")) {
    const s = calcNodeStats(node[k], filter);
    files += s.files; lines += s.lines; size += s.size;
  }
  return { files, lines, size };
}

// ── RENDER TREE ──
function renderTree() {
  const container = document.getElementById("fileTree");
  const filter = searchFilter.value.toLowerCase();
  container.innerHTML = "";

  const keys = Object.keys(fileTree);
  if (!keys.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">&#9633;</div>
        <div class="empty-text">Nessun file caricato.<br>Puoi trascinare <strong>più cartelle contemporaneamente.</strong></div>
      </div>`;
    return;
  }

  for (const rootName of keys) {
    const el = renderNode(fileTree[rootName], rootName, 0, filter, true, [rootName]);
    if (el) container.appendChild(el);
  }
}

function renderNode(node, name, depth, filter, isRoot = false, nodePath = []) {
  const folders = Object.keys(node).filter((k) => k !== "__files__");
  const files = (node.__files__ || []).filter((f) => !filter || f.name.toLowerCase().includes(filter));
  const stats = calcNodeStats(node, filter);
  if (stats.files === 0 && filter) return null;

  const wrap = document.createElement("div");
  wrap.className = `tree-folder depth-${Math.min(depth, 3)}`;

  const header = document.createElement("div");
  header.className = "folder-header";

  const arrow = document.createElement("span");
  arrow.className = "folder-arrow open";
  arrow.textContent = "▶";

  const icon = document.createElement("span");
  icon.className = "folder-icon";
  icon.textContent = isRoot ? "⬡" : "◈";

  const nameSp = document.createElement("span");
  nameSp.className = "folder-name";
  nameSp.textContent = name;

  const badge = document.createElement("span");
  badge.className = "folder-badge";
  badge.textContent = `${stats.lines.toLocaleString()} ln`;

  const countSp = document.createElement("span");
  countSp.className = "folder-count";
  countSp.textContent = `${stats.files}f`;

  const removeBtn = document.createElement("span");
  removeBtn.className = "folder-remove";
  removeBtn.textContent = "✕";
  removeBtn.title = `Rimuovi cartella "${name}"`;
  removeBtn.onclick = (e) => { e.stopPropagation(); removeFolder(nodePath); };

  header.append(arrow, icon, nameSp, badge, countSp, removeBtn);

  const children = document.createElement("div");
  children.className = "folder-children open";

  for (const sub of folders) {
    const child = renderNode(node[sub], sub, depth + 1, filter, false, [...nodePath, sub]);
    if (child) children.appendChild(child);
  }
  for (const file of files) children.appendChild(renderFile(file));

  header.onclick = () => {
    const open = children.classList.toggle("open");
    arrow.classList.toggle("open", open);
  };

  wrap.append(header, children);
  return wrap;
}

function renderFile(file) {
  const div = document.createElement("div");
  div.className = "file-item";

  const icon = document.createElement("span");
  icon.className = "file-icon";
  icon.textContent = getIcon(file.name);

  const name = document.createElement("span");
  name.className = "file-name";
  name.textContent = file.name;
  name.title = file.fullPath;

  const cls =
    file.lines > 1000 ? "badge-vhigh" :
    file.lines > 500  ? "badge-high"  :
    file.lines > 100  ? "badge-mid"   :
    file.lines > 0    ? "badge-low"   : "badge-zero";

  const badge = document.createElement("span");
  badge.className = `file-badge ${cls}`;
  badge.textContent = file.lines.toLocaleString();

  const remove = document.createElement("span");
  remove.className = "file-remove";
  remove.textContent = "✕";
  remove.title = "Rimuovi file";
  remove.onclick = (e) => { e.stopPropagation(); removeFile(file.fullPath); };

  div.append(icon, name, badge, remove);
  return div;
}

// ── SOURCE CHIPS ──
function renderSources() {
  const wrap = document.getElementById("sourcesWrap");
  const keys = Object.keys(fileTree);
  if (!keys.length) { wrap.classList.add("hidden"); return; }
  wrap.classList.remove("hidden");
  wrap.innerHTML = "";

  for (const key of keys) {
    const chip = document.createElement("div");
    chip.className = "source-chip";
    const isRemote = key.includes("/");
    chip.innerHTML = `<span style="opacity:0.5">${isRemote ? "⬡" : "⬡"}</span> ${escHtml(key)}`;
    const rm = document.createElement("span");
    rm.className = "source-chip-remove";
    rm.textContent = "✕";
    rm.title = `Rimuovi "${key}"`;
    rm.onclick = () => removeSource(key);
    chip.appendChild(rm);
    wrap.appendChild(chip);
  }
}

function escHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── REMOVE ──
function removeSource(name) {
  delete fileTree[name];
  renderSources();
  renderTree();
  updateStats();
}

function removeFile(fullPath) {
  function remove(node) {
    if (node.__files__) {
      const idx = node.__files__.findIndex((f) => f.fullPath === fullPath);
      if (idx !== -1) { node.__files__.splice(idx, 1); return true; }
    }
    for (const k of Object.keys(node).filter((k) => k !== "__files__"))
      if (remove(node[k])) return true;
    return false;
  }
  for (const root of Object.keys(fileTree)) remove(fileTree[root]);

  function pruneEmpty(node) {
    for (const k of Object.keys(node).filter((k) => k !== "__files__")) {
      pruneEmpty(node[k]);
      const sub = node[k];
      const hasFiles = (sub.__files__ || []).length > 0;
      const hasSubs = Object.keys(sub).filter((k) => k !== "__files__").length > 0;
      if (!hasFiles && !hasSubs) delete node[k];
    }
  }
  for (const root of Object.keys(fileTree)) {
    pruneEmpty(fileTree[root]);
    if (calcNodeStats(fileTree[root]).files === 0) delete fileTree[root];
  }

  renderSources();
  renderTree();
  updateStats();
}

function removeFolder(folderPath) {
  if (folderPath.length === 1) {
    delete fileTree[folderPath[0]];
  } else {
    let node = fileTree[folderPath[0]];
    for (let i = 1; i < folderPath.length - 1; i++) {
      if (!node || !node[folderPath[i]]) return;
      node = node[folderPath[i]];
    }
    delete node[folderPath[folderPath.length - 1]];
    function pruneEmpty(node) {
      for (const k of Object.keys(node).filter((k) => k !== "__files__")) {
        pruneEmpty(node[k]);
        const sub = node[k];
        const hasFiles = (sub.__files__ || []).length > 0;
        const hasSubs = Object.keys(sub).filter((k) => k !== "__files__").length > 0;
        if (!hasFiles && !hasSubs) delete node[k];
      }
    }
    pruneEmpty(fileTree[folderPath[0]]);
    if (calcNodeStats(fileTree[folderPath[0]]).files === 0) delete fileTree[folderPath[0]];
  }
  renderSources();
  renderTree();
  updateStats();
}

// ── GLOBAL ACTIONS ──
function ricalcola() {
  function recalc(node) {
    for (const f of node.__files__ || []) f.lines = countLines(f.content);
    for (const k of Object.keys(node).filter((k) => k !== "__files__")) recalc(node[k]);
  }
  for (const root of Object.keys(fileTree)) recalc(fileTree[root]);
  renderTree();
  updateStats();
  showToast("↺ Ricalcolato");
}

function rimuoviTutti() {
  if (!Object.keys(fileTree).length) return;
  if (!confirm("Rimuovere tutti i file caricati?")) return;
  fileTree = {};
  renderSources();
  renderTree();
  updateStats();
}

function espandiTutti() {
  document.querySelectorAll(".folder-children").forEach((el) => el.classList.add("open"));
  document.querySelectorAll(".folder-arrow").forEach((el) => el.classList.add("open"));
}

function comprimiTutti() {
  document.querySelectorAll(".folder-children").forEach((el) => el.classList.remove("open"));
  document.querySelectorAll(".folder-arrow").forEach((el) => el.classList.remove("open"));
}

// ── ICONS ──
function getIcon(n) {
  const ext = n.split(".").pop().toLowerCase();
  const map = {
    js: "◈", jsx: "⚛", ts: "◆", tsx: "⚛", mjs: "◈", cjs: "◈",
    py: "🐍", java: "☕", cpp: "⚙", c: "⚙", h: "⚙", hpp: "⚙",
    cs: "◆", go: "◈", rs: "◈", swift: "◈", kt: "◈", rb: "◆",
    html: "◉", htm: "◉", css: "◎", scss: "◎", sass: "◎", less: "◎",
    vue: "▲", svelte: "▲", astro: "▲",
    json: "{}", xml: "</>", yaml: "—", yml: "—", toml: "—",
    md: "≡", txt: "≡", markdown: "≡", mmd: "⬡", mermaid: "⬡",
    sh: "$", bash: "$", zsh: "$", ps1: "$", bat: "$",
    sql: "▦", graphql: "◈", gql: "◈", php: "◈",
  };
  return map[ext] || "◦";
}

// ── UTILITIES ──
function formatBytes(b) {
  if (!b) return "0 B";
  const k = 1024, s = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return (b / Math.pow(k, i)).toFixed(i ? 1 : 0) + " " + s[i];
}

function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

function showLoading() {
  document.getElementById("fileTree").innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <div style="font-size:12px;font-family:var(--mono);color:var(--dim)">Caricamento...</div>
    </div>`;
}

// ── LISTENERS ──
escludiVuote.addEventListener("change", ricalcola);
escludiCommenti.addEventListener("change", ricalcola);
soloCodice.addEventListener("change", ricalcola);
searchFilter.addEventListener("input", renderTree);

// Close modal on backdrop click
document.getElementById("urlModal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("urlModal")) chiudiModalUrl();
});

// Enter key in URL input
document.getElementById("urlInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") confermaImportUrl();
});

// ── THEME ──
function applyTheme(theme) {
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");
  if (theme === "light") {
    root.setAttribute("data-theme", "light");
    if (btn) { btn.textContent = "☾"; btn.title = "Passa al tema scuro"; }
  } else {
    root.removeAttribute("data-theme");
    if (btn) { btn.textContent = "☀"; btn.title = "Passa al tema chiaro"; }
  }
}

function toggleTheme() {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  const next = isLight ? "dark" : "light";
  applyTheme(next);
  try { localStorage.setItem("lines-theme", next); } catch(e) {}
}

// ── BOOT ──
loadExtensions().then(() => { console.log("{ lines } v3 ready ✓"); });

// Restore saved theme
try {
  const saved = localStorage.getItem("lines-theme");
  if (saved) applyTheme(saved);
} catch(e) {}

function updateStats() {
  let files = 0, lines = 0, size = 0;
  for (const root of Object.keys(fileTree)) {
    const s = calcNodeStats(fileTree[root]);
    files += s.files; lines += s.lines; size += s.size;
  }

  document.getElementById("totalFiles").textContent = files.toLocaleString();
  document.getElementById("totalLines").textContent = lines.toLocaleString();
  document.getElementById("avgLines").textContent = files > 0 ? Math.round(lines / files).toLocaleString() : "0";
  document.getElementById("totalSize").textContent = formatBytes(size);

  const statsRow = document.getElementById("statsRow");
  if (files > 0) statsRow.classList.remove("hidden");
  else statsRow.classList.add("hidden");

  const logoMark = document.getElementById("logoCounter");
  if (logoMark) {
    logoMark.innerHTML = files > 0 ? `lines: ${lines.toLocaleString()}` : "{ lines }";
  }
}