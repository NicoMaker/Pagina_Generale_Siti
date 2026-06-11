// ── EXTENSIONS CONFIG ──
let EXTENSIONS_CODICE = new Set();

async function loadExtensions() {
  try {
    const res = await fetch("extensions.json");
    if (!res.ok) throw new Error("fetch failed");
    const config = await res.json();
    EXTENSIONS_CODICE = new Set(Object.values(config).flat());
    console.log(
      `{ lines } — caricate ${EXTENSIONS_CODICE.size} estensioni da extensions.json ✓`,
    );
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
  if (!dropzone.contains(e.relatedTarget))
    dropzone.classList.remove("drag-over");
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
    for (const sub of entries)
      files.push(...(await getAllFilesFromEntry(sub, subPath)));
  }
  return files;
}

function readAllEntries(reader) {
  return new Promise((resolve) => {
    const all = [];
    function read() {
      reader.readEntries((entries) => {
        if (!entries.length) resolve(all);
        else {
          all.push(...entries);
          read();
        }
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
    try {
      content = await readFileContent(file);
    } catch (e) {
      continue;
    }

    const lines = countLines(content);
    let folders = parts.slice(0, -1);
    if (folders.length > 0 && folders[0] === sourceName)
      folders = folders.slice(1);

    let node = branch;
    for (const f of folders) {
      if (!node[f]) node[f] = { __files__: [] };
      node = node[f];
    }
    if (!node.__files__) node.__files__ = [];
    node.__files__.push({
      name: fileName,
      fullPath: relPath,
      lines,
      size: file.size,
      content,
      functions: parseFunctions(content, fileName),
    });
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
    const rel =
      files[0].webkitRelativePath || files[0].relativePath || files[0].name;
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
  let m = url.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\/tree\/([^/]+)(?:\/(.+))?)?$/,
  );
  if (m)
    return {
      provider: "github",
      owner: m[1],
      repo: m[2],
      branch: m[3] || null,
      subpath: m[4] || "",
    };

  // GitLab: https://gitlab.com/owner/repo[/-/tree/branch[/path]]
  m = url.match(
    /^https?:\/\/gitlab\.com\/([^/]+(?:\/[^/]+)*)\/([^/]+?)(?:\/-\/tree\/([^/]+)(?:\/(.+))?)?$/,
  );
  if (m)
    return {
      provider: "gitlab",
      owner: m[1],
      repo: m[2],
      branch: m[3] || null,
      subpath: m[4] || "",
    };

  // Bitbucket: https://bitbucket.org/owner/repo[/src/branch[/path]]
  m = url.match(
    /^https?:\/\/bitbucket\.org\/([^/]+)\/([^/]+?)(?:\/src\/([^/]+)(?:\/(.+))?)?$/,
  );
  if (m)
    return {
      provider: "bitbucket",
      owner: m[1],
      repo: m[2],
      branch: m[3] || null,
      subpath: m[4] || "",
    };

  // Codeberg: https://codeberg.org/owner/repo[/src/branch/branch[/path]]
  m = url.match(
    /^https?:\/\/codeberg\.org\/([^/]+)\/([^/]+?)(?:\/src\/branch\/([^/]+)(?:\/(.+))?)?$/,
  );
  if (m)
    return {
      provider: "codeberg",
      owner: m[1],
      repo: m[2],
      branch: m[3] || null,
      subpath: m[4] || "",
    };

  return null;
}

async function importFromUrl(url, tokenOverride) {
  const parsed = parseRepoUrl(url);
  if (!parsed) {
    showToast(
      "⚠ URL non riconosciuto. Supporto: GitHub, GitLab, Bitbucket, Codeberg",
    );
    return;
  }

  const modal = document.getElementById("urlModal");
  modal.classList.add("hidden");
  showLoading();

  const token =
    tokenOverride || document.getElementById("urlToken").value.trim() || null;

  try {
    let virtualFiles = [];
    switch (parsed.provider) {
      case "github":
        virtualFiles = await fetchGitHub(parsed, token);
        break;
      case "gitlab":
        virtualFiles = await fetchGitLab(parsed, token);
        break;
      case "bitbucket":
        virtualFiles = await fetchBitbucket(parsed, token);
        break;
      case "codeberg":
        virtualFiles = await fetchCodeberg(parsed, token);
        break;
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
    const meta = await apiFetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
      headers,
    );
    branch = meta.default_branch || "main";
  }

  // Get file tree
  const treePath = parsed.subpath ? `${parsed.subpath}` : "";
  const treeUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/trees/${branch}?recursive=1`;
  const treeData = await apiFetch(treeUrl, headers);

  if (!treeData.tree)
    throw new Error("Repo non trovato o privato (serve token)");

  const sub = parsed.subpath ? parsed.subpath.replace(/\/$/, "") + "/" : "";
  const blobs = treeData.tree.filter(
    (item) => item.type === "blob" && (!sub || item.path.startsWith(sub)),
  );

  const virtualFiles = [];
  for (const blob of blobs) {
    const ext = blob.path.split(".").pop().toLowerCase();
    if (soloCodice.checked && !EXTENSIONS_CODICE.has(ext)) continue;

    const rawUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branch}/${blob.path}`;
    const content = await fetchRaw(
      rawUrl,
      token ? { Authorization: `Bearer ${token}` } : {},
    );
    const relPath = sub ? blob.path.slice(sub.length) : blob.path;
    virtualFiles.push({
      path: relPath,
      content,
      size: blob.size || content.length,
    });
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
    const meta = await apiFetch(
      `https://gitlab.com/api/v4/projects/${projectId}`,
      headers,
    );
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
    if (!Array.isArray(data))
      throw new Error("GitLab: repo non trovato o privato (serve token)");
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
    const relPath = subpath
      ? item.path.slice(subpath.length).replace(/^\//, "")
      : item.path;
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
    const meta = await apiFetch(
      `https://api.bitbucket.org/2.0/repositories/${parsed.owner}/${parsed.repo}`,
      headers,
    );
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
    const meta = await apiFetch(
      `https://codeberg.org/api/v1/repos/${parsed.owner}/${parsed.repo}`,
      headers,
    );
    branch = meta.default_branch || "main";
  }

  const treeUrl = `https://codeberg.org/api/v1/repos/${parsed.owner}/${parsed.repo}/git/trees/${branch}?recursive=true&token=${token || ""}`;
  const treeData = await apiFetch(treeUrl, headers);

  const items = treeData.tree || [];
  const sub = parsed.subpath ? parsed.subpath.replace(/\/$/, "") + "/" : "";
  const blobs = items.filter(
    (i) => i.type === "blob" && (!sub || i.path.startsWith(sub)),
  );

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
    node.__files__.push({
      name: fileName,
      fullPath: vf.path,
      lines,
      size: vf.size,
      content: vf.content,
      functions: parseFunctions(vf.content, fileName),
    });
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
    const msg =
      res.status === 403
        ? "Rate limit o accesso negato (prova con un token)"
        : res.status === 404
          ? "Repository non trovato (privato? prova con un token)"
          : `HTTP ${res.status}`;
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

  if (!url) {
    errEl.textContent = "Inserisci un URL valido.";
    return;
  }
  const parsed = parseRepoUrl(url);
  if (!parsed) {
    errEl.textContent =
      "URL non riconosciuto. Esempio: https://github.com/owner/repo";
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
      if (!inMulti && t.includes("/*") && !t.includes("*/")) {
        inMulti = true;
        continue;
      }
      if (inMulti) {
        if (t.includes("*/")) inMulti = false;
        continue;
      }
      if (
        t.startsWith("//") ||
        t.startsWith("#") ||
        t.startsWith("--") ||
        t.startsWith("%") ||
        t.startsWith("<!--")
      )
        continue;
    }
    if (exEmpty && t === "") continue;
    count++;
  }
  return count;
}

// ── STATS ──
function calcNodeStats(node, filter = "") {
  let files = 0,
    lines = 0,
    size = 0,
    fns = 0;
  const fl = (node.__files__ || []).filter(
    (f) => !filter || f.name.toLowerCase().includes(filter),
  );
  for (const f of fl) {
    files++;
    lines += f.lines;
    size += f.size;
    fns += (f.functions || []).length;
  }
  for (const k of Object.keys(node).filter((k) => k !== "__files__")) {
    const s = calcNodeStats(node[k], filter);
    files += s.files;
    lines += s.lines;
    size += s.size;
    fns += s.fns;
  }
  return { files, lines, size, fns };
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
    const el = renderNode(fileTree[rootName], rootName, 0, filter, true, [
      rootName,
    ]);
    if (el) container.appendChild(el);
  }
}

function renderNode(node, name, depth, filter, isRoot = false, nodePath = []) {
  const folders = Object.keys(node).filter((k) => k !== "__files__");
  const files = (node.__files__ || []).filter(
    (f) => !filter || f.name.toLowerCase().includes(filter),
  );
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
  badge.textContent = `${fmtN(stats.lines)} ln`;

  const countSp = document.createElement("span");
  countSp.className = "folder-count";
  countSp.textContent = `${stats.files}f`;

  const fnSp = document.createElement("span");
  fnSp.className = "folder-fn-count";
  fnSp.title = `${stats.fns} funzioni — clicca per vedere nella tab Funzioni`;
  fnSp.innerHTML = `<span class="fn-chip-icon">ƒ</span>${stats.fns}`;
  if (stats.fns === 0) fnSp.style.display = "none";
  fnSp.onclick = (e) => {
    e.stopPropagation();
    apriCartellaNellaTabFn(nodePath);
  };

  const removeBtn = document.createElement("span");
  removeBtn.className = "folder-remove";
  removeBtn.textContent = "✕";
  removeBtn.title = `Rimuovi cartella "${name}"`;
  removeBtn.onclick = (e) => {
    e.stopPropagation();
    removeFolder(nodePath);
  };

  header.append(arrow, icon, nameSp, badge, countSp, fnSp, removeBtn);

  const children = document.createElement("div");
  children.className = "folder-children open";

  for (const sub of folders) {
    const child = renderNode(node[sub], sub, depth + 1, filter, false, [
      ...nodePath,
      sub,
    ]);
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
  div.className = "file-item file-item-clickable";
  div.title = "Clicca per vedere il file";
  div.onclick = () => apriFileModal(file);

  const icon = document.createElement("span");
  icon.className = "file-icon";
  icon.textContent = getIcon(file.name);

  const name = document.createElement("span");
  name.className = "file-name";
  name.textContent = file.name;
  name.title = file.fullPath;

  const cls =
    file.lines > 1000
      ? "badge-vhigh"
      : file.lines > 500
        ? "badge-high"
        : file.lines > 100
          ? "badge-mid"
          : file.lines > 0
            ? "badge-low"
            : "badge-zero";

  const badge = document.createElement("span");
  badge.className = `file-badge ${cls}`;
  badge.textContent = fmtN(file.lines);

  // ── Functions button ──
  const fns = file.functions || [];
  if (fns.length > 0) {
    const fnBtn = document.createElement("span");
    fnBtn.className = "fn-chip";
    fnBtn.title = `${fns.length} funzioni — clicca per dettagli`;
    fnBtn.innerHTML = `<span class="fn-chip-icon">ƒ</span>${fns.length}`;
    fnBtn.onclick = (e) => {
      e.stopPropagation();
      chiudiFileModal();
      apriFunzioniModal(file);
    };
    div.append(icon, name, badge, fnBtn);
  } else {
    div.append(icon, name, badge);
  }

  const remove = document.createElement("span");
  remove.className = "file-remove";
  remove.textContent = "✕";
  remove.title = "Rimuovi file";
  remove.onclick = (e) => {
    e.stopPropagation();
    removeFile(file.fullPath);
  };

  div.appendChild(remove);
  return div;
}

// ── SOURCE CHIPS ──
function renderSources() {
  const wrap = document.getElementById("sourcesWrap");
  const keys = Object.keys(fileTree);
  if (!keys.length) {
    wrap.classList.add("hidden");
    return;
  }
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
      if (idx !== -1) {
        node.__files__.splice(idx, 1);
        return true;
      }
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
      const hasSubs =
        Object.keys(sub).filter((k) => k !== "__files__").length > 0;
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
        const hasSubs =
          Object.keys(sub).filter((k) => k !== "__files__").length > 0;
        if (!hasFiles && !hasSubs) delete node[k];
      }
    }
    pruneEmpty(fileTree[folderPath[0]]);
    if (calcNodeStats(fileTree[folderPath[0]]).files === 0)
      delete fileTree[folderPath[0]];
  }
  renderSources();
  renderTree();
  updateStats();
}

// ── GLOBAL ACTIONS ──
function ricalcola() {
  function recalc(node) {
    for (const f of node.__files__ || []) {
      f.lines = countLines(f.content);
      f.functions = parseFunctions(f.content, f.name);
    }
    for (const k of Object.keys(node).filter((k) => k !== "__files__"))
      recalc(node[k]);
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
  document
    .querySelectorAll(".folder-children")
    .forEach((el) => el.classList.add("open"));
  document
    .querySelectorAll(".folder-arrow")
    .forEach((el) => el.classList.add("open"));
}

function comprimiTutti() {
  document
    .querySelectorAll(".folder-children")
    .forEach((el) => el.classList.remove("open"));
  document
    .querySelectorAll(".folder-arrow")
    .forEach((el) => el.classList.remove("open"));
}

// ── ICONS ──
function getIcon(n) {
  const ext = n.split(".").pop().toLowerCase();
  const map = {
    js: "◈",
    jsx: "⚛",
    ts: "◆",
    tsx: "⚛",
    mjs: "◈",
    cjs: "◈",
    py: "🐍",
    java: "☕",
    cpp: "⚙",
    c: "⚙",
    h: "⚙",
    hpp: "⚙",
    cs: "◆",
    go: "◈",
    rs: "◈",
    swift: "◈",
    kt: "◈",
    rb: "◆",
    html: "◉",
    htm: "◉",
    css: "◎",
    scss: "◎",
    sass: "◎",
    less: "◎",
    vue: "▲",
    svelte: "▲",
    astro: "▲",
    json: "{}",
    xml: "</>",
    yaml: "—",
    yml: "—",
    toml: "—",
    md: "≡",
    txt: "≡",
    markdown: "≡",
    mmd: "⬡",
    mermaid: "⬡",
    sh: "$",
    bash: "$",
    zsh: "$",
    ps1: "$",
    bat: "$",
    sql: "▦",
    graphql: "◈",
    gql: "◈",
    php: "◈",
  };
  return map[ext] || "◦";
}

// ── UTILITIES ──
function fmtN(n) {
  // Always use dot as thousands separator (Italian style)
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatBytes(b) {
  if (!b) return "0 B";
  const k = 1024,
    s = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return (b / Math.pow(k, i)).toFixed(i ? 1 : 0) + " " + s[i];
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

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

// Close modals on backdrop click
document.getElementById("urlModal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("urlModal")) chiudiModalUrl();
});
document.getElementById("fnModal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("fnModal")) chiudiFunzioniModal();
});
document.getElementById("fileModal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("fileModal")) chiudiFileModal();
});
document.getElementById("codeModal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("codeModal")) chiudiCodiceModal();
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
    if (btn) {
      btn.textContent = "☾";
      btn.title = "Passa al tema scuro";
    }
  } else {
    root.removeAttribute("data-theme");
    if (btn) {
      btn.textContent = "☀";
      btn.title = "Passa al tema chiaro";
    }
  }
}

function toggleTheme() {
  const isLight =
    document.documentElement.getAttribute("data-theme") === "light";
  const next = isLight ? "dark" : "light";
  applyTheme(next);
  try {
    localStorage.setItem("lines-theme", next);
  } catch (e) {}
}

// ── TAB SWITCHER ────────────────────────────────────────────────────

let activeTab = "files";

// ── OPEN FOLDER IN FUNCTIONS TAB ────────────────────────────────────
function apriCartellaNellaTabFn(nodePath) {
  // Collect all file paths that belong to this folder (at any depth)
  const all = collectAllFunctions();
  const prefix = nodePath.join("/");
  const filesInFolder = [
    ...new Set(
      all
        .filter(
          (r) => r.filePath === prefix || r.filePath.startsWith(prefix + "/"),
        )
        .map((r) => r.filePath),
    ),
  ];
  if (!filesInFolder.length) return;

  // Set file filter to exactly these files
  fnFullFileFilter.clear();
  filesInFolder.forEach((f) => fnFullFileFilter.add(f));

  // Switch to functions tab
  switchTab("functions");
}

function switchTab(tab) {
  activeTab = tab;
  document
    .getElementById("paneFiles")
    .classList.toggle("hidden", tab !== "files");
  document
    .getElementById("paneFunctions")
    .classList.toggle("hidden", tab !== "functions");
  document
    .getElementById("tabFiles")
    .classList.toggle("ctab-active", tab === "files");
  document
    .getElementById("tabFunctions")
    .classList.toggle("ctab-active", tab === "functions");
  if (tab === "functions") renderFnFull();
}

// ── FUNCTIONS PANEL (legacy stubs – kept so updateStats doesn't crash) ──

let fnSortMode = "lines";
function toggleFnSort() {}
function renderFnPanel() {}

// ── COLLECT ALL FUNCTIONS ────────────────────────────────────────────

function collectAllFunctions() {
  const all = [];
  function walk(node, pathParts) {
    for (const f of node.__files__ || []) {
      const filePath = pathParts.length
        ? pathParts.join("/") + "/" + f.name
        : f.name;
      for (const fn of f.functions || []) {
        const slice = f.content
          .split("\n")
          .slice(fn.startLine - 1, fn.endLine)
          .join("\n");
        const linesFiltered = countLines(slice);
        all.push({
          fnName: fn.name,
          kind: fn.kind,
          startLine: fn.startLine,
          endLine: fn.endLine,
          linesFiltered,
          linesRaw: fn.endLine - fn.startLine + 1,
          fileName: f.name,
          filePath,
          fileContent: f.content,
        });
      }
    }
    for (const k of Object.keys(node).filter((k) => k !== "__files__")) {
      walk(node[k], [...pathParts, k]);
    }
  }
  for (const root of Object.keys(fileTree)) {
    walk(fileTree[root], [root]);
  }
  return all;
}

// ── FULL FUNCTIONS VIEW ──────────────────────────────────────────────

let fnFullSortMode = "lines"; // "lines" | "name" | "file" | "kind"
let fnFullKindFilter = new Set(); // empty = show all
let fnFullFileFilter = new Set(); // empty = show all files

function toggleFnFullSort(mode) {
  fnFullSortMode = mode;
  ["lines", "name", "file", "kind"].forEach((m) => {
    const btn = document.getElementById(
      "btnSort" + m.charAt(0).toUpperCase() + m.slice(1),
    );
    if (btn) btn.classList.toggle("sort-active", m === mode);
  });
  renderFnFull();
}

function renderFnFull() {
  const listEl = document.getElementById("fnFullList");
  const summary = document.getElementById("fnFullSummary");
  const statsBar = document.getElementById("fnFullStatsBar");
  const searchEl = document.getElementById("fnFullSearch");
  const badge = document.getElementById("tabFnBadge");

  const all = collectAllFunctions();

  // Update badge
  if (badge) {
    if (all.length) {
      badge.textContent = fmtN(all.length);
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  }

  if (!all.length) {
    listEl.innerHTML = `<div class="empty-state"><div class="empty-icon">ƒ</div><div class="empty-text">Carica dei file di codice per vedere le funzioni rilevate.</div></div>`;
    statsBar.innerHTML = "";
    if (summary) summary.innerHTML = "";
    renderKindFilters([]);
    renderFileFilter([]);
    return;
  }

  // Kind filter pills
  const allKinds = [...new Set(all.map((r) => r.kind))].sort();
  renderKindFilters(allKinds);

  // File filter list
  const allFiles = [...new Set(all.map((r) => r.filePath))].sort();
  renderFileFilter(allFiles);

  // Text + kind + file filter
  const textFilter = (searchEl ? searchEl.value : "").toLowerCase().trim();
  let rows = all.filter((r) => {
    const kindOk = fnFullKindFilter.size === 0 || fnFullKindFilter.has(r.kind);
    const fileOk =
      fnFullFileFilter.size === 0 || fnFullFileFilter.has(r.filePath);
    if (!kindOk || !fileOk) return false;
    if (!textFilter) return true;
    return (
      r.fnName.toLowerCase().includes(textFilter) ||
      r.filePath.toLowerCase().includes(textFilter) ||
      r.kind.toLowerCase().includes(textFilter)
    );
  });

  // Sort
  if (fnFullSortMode === "lines")
    rows = rows.slice().sort((a, b) => b.linesFiltered - a.linesFiltered);
  else if (fnFullSortMode === "name")
    rows = rows.slice().sort((a, b) => a.fnName.localeCompare(b.fnName));
  else if (fnFullSortMode === "file")
    rows = rows
      .slice()
      .sort(
        (a, b) =>
          a.filePath.localeCompare(b.filePath) ||
          b.linesFiltered - a.linesFiltered,
      );
  else if (fnFullSortMode === "kind")
    rows = rows
      .slice()
      .sort(
        (a, b) =>
          a.kind.localeCompare(b.kind) || b.linesFiltered - a.linesFiltered,
      );

  // Stats (always on full set, not filtered)
  const totalLines = all.reduce((s, r) => s + r.linesFiltered, 0);
  const avgLines = all.length ? Math.round(totalLines / all.length) : 0;
  const maxLines = all.length
    ? Math.max(...all.map((r) => r.linesFiltered))
    : 0;
  const sortedForMedian = all.map((r) => r.linesFiltered).sort((a, b) => a - b);
  const median = sortedForMedian.length
    ? sortedForMedian[Math.floor(sortedForMedian.length / 2)]
    : 0;
  const uniqueFiles = new Set(all.map((r) => r.filePath)).size;

  statsBar.innerHTML = `
    <div class="fn-full-stat sv-total"><span class="fn-full-stat-value">${fmtN(all.length)}</span><span class="fn-full-stat-label">Funzioni</span></div>
    <div class="fn-full-stat sv-avg"><span class="fn-full-stat-value">${avgLines}</span><span class="fn-full-stat-label">Media ln</span></div>
    <div class="fn-full-stat sv-med"><span class="fn-full-stat-value">${median}</span><span class="fn-full-stat-label">Mediana ln</span></div>
    <div class="fn-full-stat sv-max"><span class="fn-full-stat-value">${maxLines}</span><span class="fn-full-stat-label">Max ln</span></div>
    <div class="fn-full-stat sv-files"><span class="fn-full-stat-value">${uniqueFiles}</span><span class="fn-full-stat-label">File con fn</span></div>`;

  if (summary)
    summary.innerHTML = `<span class="fn-panel-count">${fmtN(rows.length)} / ${fmtN(all.length)} funzioni</span>`;

  // Render rows
  const rowMaxLines = rows.length
    ? Math.max(...rows.map((r) => r.linesFiltered))
    : 1;

  listEl.innerHTML = "";

  if (!rows.length) {
    listEl.innerHTML = `<div class="fn-empty">Nessuna funzione corrisponde al filtro</div>`;
    return;
  }

  rows.forEach((r) => {
    const barPct =
      rowMaxLines > 0
        ? Math.max(2, Math.round((r.linesFiltered / rowMaxLines) * 100))
        : 2;
    const lCls =
      r.linesFiltered > 100
        ? "fn-lb-high"
        : r.linesFiltered > 30
          ? "fn-lb-mid"
          : "fn-lb-low";
    const kindCls = kindColor(r.kind);
    const key = fnInlineKey(r);
    const isSel = fnInlineSelection.has(key);

    const row = document.createElement("div");
    row.className = `fn-full-row fn-clickable${isSel ? " fn-row-selected" : ""}`;
    row.title = "Clicca per vedere il codice";
    row.innerHTML = `
      <div class="frc-chk"><div class="fn-row-checkbox" title="Seleziona funzione">${isSel ? "✓" : ""}</div></div>
      <div class="frc-lines">
        <span class="frc-lines-n ${lCls}">${r.linesFiltered}</span>
        <span class="frc-lines-u">ln</span>
      </div>
      <div class="frc-kind"><span class="fn-kind ${kindCls}">${escHtml(r.kind)}</span></div>
      <div class="frc-name" title="${escHtml(r.fnName)}">${escHtml(r.fnName)}</div>
      <div class="frc-file" title="${escHtml(r.filePath)}">${escHtml(r.filePath)}</div>
      <div class="frc-range">${r.startLine}–${r.endLine} <span style="color:var(--border3)">(${r.linesRaw})</span></div>
      <div class="frc-bar-wrap">
        <div class="fn-full-bar-track"><div class="fn-full-bar" style="width:${barPct}%"></div></div>
      </div>`;

    // Checkbox click: toggle selection, don't open modal
    row.querySelector(".fn-row-checkbox").addEventListener("click", (e) => {
      e.stopPropagation();
      if (fnInlineSelection.has(key)) fnInlineSelection.delete(key);
      else fnInlineSelection.add(key);
      updateFnSelBar();
      // update just this row visually
      row.classList.toggle("fn-row-selected", fnInlineSelection.has(key));
      row.querySelector(".fn-row-checkbox").textContent = fnInlineSelection.has(
        key,
      )
        ? "✓"
        : "";
      updateFnHdrCheckbox(rows);
    });

    row.onclick = () =>
      apriCodiceModal(
        r.fnName,
        r.kind,
        r.filePath,
        r.fileContent,
        r.startLine,
        r.endLine,
      );
    listEl.appendChild(row);
  });

  updateFnHdrCheckbox(rows);
  updateFnSelBar();
}

function renderKindFilters(kinds) {
  const container = document.getElementById("fnKindFilters");
  if (!container) return;
  container.innerHTML = "";
  if (!kinds.length) return;

  kinds.forEach((kind) => {
    const pill = document.createElement("span");
    pill.className = `fn-kind-pill ${kindColor(kind)}${fnFullKindFilter.size === 0 || fnFullKindFilter.has(kind) ? " active" : ""}`;
    pill.textContent = kind;
    pill.title = `Filtra per tipo: ${kind}`;
    pill.onclick = () => {
      if (fnFullKindFilter.has(kind)) {
        fnFullKindFilter.delete(kind);
      } else {
        fnFullKindFilter.add(kind);
      }
      renderFnFull();
    };
    container.appendChild(pill);
  });

  // "Tutti" reset pill
  const all = document.createElement("span");
  all.className = `fn-kind-pill${fnFullKindFilter.size === 0 ? " active" : ""}`;
  all.style.cssText =
    "background:var(--surf3);color:var(--muted);border-color:var(--border2);";
  all.textContent = "tutti";
  all.onclick = () => {
    fnFullKindFilter.clear();
    renderFnFull();
  };
  container.prepend(all);
}

// ── FILE FILTER DROPDOWN ─────────────────────────────────────────────

let fnFileDropdownOpen = false;

function renderFileFilter(files) {
  const wrapper = document.getElementById("fnFileFilterWrap");
  if (!wrapper) return;

  if (!files.length) {
    wrapper.innerHTML = "";
    return;
  }

  const activeCount = fnFullFileFilter.size;
  const label =
    activeCount === 0
      ? "Tutti i file"
      : activeCount === 1
        ? [...fnFullFileFilter][0].split("/").pop()
        : `${activeCount} file selezionati`;

  // Collect fn counts per file
  const all = collectAllFunctions();
  const fnCountPerFile = {};
  all.forEach((r) => {
    fnCountPerFile[r.filePath] = (fnCountPerFile[r.filePath] || 0) + 1;
  });

  // Search term inside dropdown
  const prevSearch = wrapper.querySelector(".fn-file-search")?.value || "";

  wrapper.innerHTML = `
    <div class="fn-file-filter-btn${activeCount > 0 ? " ff-active" : ""}" id="fnFileBtn" onclick="toggleFileDropdown()">
      <span class="ff-icon">&#9636;</span>
      <span class="ff-label" id="ffLabel">${escHtml(label)}</span>
      <span class="ff-arrow${fnFileDropdownOpen ? " open" : ""}">&#8964;</span>
      ${activeCount > 0 ? `<span class="ff-clear" onclick="event.stopPropagation();clearFileFilter()" title="Rimuovi filtro file">✕</span>` : ""}
    </div>
    <div class="fn-file-dropdown${fnFileDropdownOpen ? "" : " hidden"}" id="fnFileDropdown">
      <div class="fn-file-search-wrap">
        <input class="fn-file-search search-box" id="fnFileSearch" placeholder="&#9906; Cerca file..." type="text" value="${escHtml(prevSearch)}" oninput="filterFileList()" />
      </div>
      <div class="fn-file-list" id="fnFileList"></div>
      <div class="fn-file-actions">
        <button class="btn btn-xs" onclick="selectAllFiles()">Seleziona tutti</button>
        <button class="btn btn-xs" onclick="clearFileFilter()">Deseleziona tutti</button>
      </div>
    </div>`;

  renderFileList(files, fnCountPerFile, prevSearch);

  // Close dropdown on outside click
  if (fnFileDropdownOpen) {
    setTimeout(() => {
      document.addEventListener("click", closeFileDropdownOutside, {
        once: true,
      });
    }, 0);
  }
}

function renderFileList(files, fnCountPerFile, searchTerm) {
  const listEl = document.getElementById("fnFileList");
  if (!listEl) return;
  const term = (searchTerm || "").toLowerCase();
  const visible = term
    ? files.filter((f) => f.toLowerCase().includes(term))
    : files;

  listEl.innerHTML = "";
  visible.forEach((fp) => {
    // When set is empty it means "all selected" — show all as checked
    const isChecked = fnFullFileFilter.size === 0 || fnFullFileFilter.has(fp);
    const count = fnCountPerFile[fp] || 0;
    const shortName = fp.split("/").pop();
    const dir = fp.includes("/") ? fp.substring(0, fp.lastIndexOf("/")) : "";

    const item = document.createElement("div");
    item.className = `fn-file-item${isChecked ? " ff-checked" : ""}`;
    item.onclick = () => toggleFileItem(fp);
    item.innerHTML = `
      <span class="ff-checkbox${isChecked ? " checked" : ""}"></span>
      <span class="ff-item-name" title="${escHtml(fp)}">${escHtml(shortName)}</span>
      ${dir ? `<span class="ff-item-dir">${escHtml(dir)}</span>` : ""}
      <span class="ff-item-count">${count} fn</span>`;
    listEl.appendChild(item);
  });

  if (!visible.length) {
    listEl.innerHTML = `<div class="fn-empty" style="padding:12px 14px;font-size:11px;">Nessun file trovato</div>`;
  }
}

function filterFileList() {
  const search = document.getElementById("fnFileSearch")?.value || "";
  const all = collectAllFunctions();
  const files = [...new Set(all.map((r) => r.filePath))].sort();
  const fnCountPerFile = {};
  all.forEach((r) => {
    fnCountPerFile[r.filePath] = (fnCountPerFile[r.filePath] || 0) + 1;
  });
  renderFileList(files, fnCountPerFile, search);
}

function toggleFileItem(fp) {
  if (fnFullFileFilter.size === 0) {
    // "All selected" state — deselecting one means populate set with all except this
    const allFns = collectAllFunctions();
    const allFiles = [...new Set(allFns.map((r) => r.filePath))];
    allFiles.forEach((f) => {
      if (f !== fp) fnFullFileFilter.add(f);
    });
  } else if (fnFullFileFilter.has(fp)) {
    fnFullFileFilter.delete(fp);
    // If now empty again it means all are selected — canonical empty = all
  } else {
    fnFullFileFilter.add(fp);
    // If all files are now selected, collapse back to empty = "all" canonical state
    const allFns = collectAllFunctions();
    const allFiles = [...new Set(allFns.map((r) => r.filePath))];
    if (allFiles.every((f) => fnFullFileFilter.has(f))) {
      fnFullFileFilter.clear();
    }
  }
  renderFnFull();
}

function toggleFileDropdown() {
  fnFileDropdownOpen = !fnFileDropdownOpen;
  renderFnFull();
  if (fnFileDropdownOpen) {
    setTimeout(() => document.getElementById("fnFileSearch")?.focus(), 50);
  }
}

function closeFileDropdownOutside(e) {
  const wrap = document.getElementById("fnFileFilterWrap");
  if (wrap && !wrap.contains(e.target)) {
    fnFileDropdownOpen = false;
    renderFnFull();
  }
}

function clearFileFilter() {
  fnFullFileFilter.clear();
  fnFileDropdownOpen = false;
  renderFnFull();
}

function selectAllFiles() {
  fnFullFileFilter.clear();
  fnFileDropdownOpen = false;
  renderFnFull();
}

document.addEventListener("DOMContentLoaded", () => {
  const s = document.getElementById("fnFullSearch");
  if (s) s.addEventListener("input", renderFnFull);
  // init sort button state
  const btn = document.getElementById("btnSortLines");
  if (btn) btn.classList.add("sort-active");
});

// ── FUNCTIONS MODAL ──────────────────────────────────────────────────

function apriFunzioniModal(file) {
  _fnModalFile = file;
  const modal = document.getElementById("fnModal");
  const title = document.getElementById("fnModalTitle");
  const list = document.getElementById("fnModalList");
  const stats = document.getElementById("fnModalStats");
  const search = document.getElementById("fnModalSearch");

  title.textContent = file.name;
  search.value = "";

  const fns = (file.functions || []).slice().sort((a, b) => b.lines - a.lines);

  function renderList(filter) {
    list.innerHTML = "";
    const filtered = filter
      ? fns.filter((f) => f.name.toLowerCase().includes(filter.toLowerCase()))
      : fns;

    if (!filtered.length) {
      list.innerHTML = `<div class="fn-empty">Nessuna funzione trovata</div>`;
      return;
    }

    // Re-count lines per function respecting current filters
    const fileLines = file.content.split("\n");
    const counted = filtered.map((fn) => {
      const slice = fileLines.slice(fn.startLine - 1, fn.endLine).join("\n");
      return { ...fn, linesFiltered: countLines(slice) };
    });
    // Re-sort by filtered count for accurate bar
    counted.sort((a, b) => b.linesFiltered - a.linesFiltered);
    const maxFiltered = counted[0] ? counted[0].linesFiltered : 1;

    counted.forEach((fn) => {
      const row = document.createElement("div");
      row.className = "fn-row fn-clickable";
      row.title = "Clicca per vedere il codice";
      const barPct =
        maxFiltered > 0
          ? Math.max(4, Math.round((fn.linesFiltered / maxFiltered) * 100))
          : 4;
      const kindClass = kindColor(fn.kind);
      const lCls =
        fn.linesFiltered > 100
          ? "fn-lb-high"
          : fn.linesFiltered > 30
            ? "fn-lb-mid"
            : "fn-lb-low";

      row.innerHTML = `
        <div class="fn-row-top">
          <span class="fn-kind ${kindClass}">${escHtml(fn.kind)}</span>
          <span class="fn-name">${escHtml(fn.name)}</span>
          <span class="fn-lines-num ${lCls}">${fn.linesFiltered}</span><span class="fn-lines-unit">ln</span>
        </div>
        <div class="fn-row-meta">righe ${fn.startLine}–${fn.endLine} &nbsp;·&nbsp; totali ${fn.endLine - fn.startLine + 1}</div>
        <div class="fn-bar-track"><div class="fn-bar" style="width:${barPct}%"></div></div>`;
      row.onclick = () => {
        chiudiFunzioniModal();
        apriCodiceModal(
          fn.name,
          fn.kind,
          file.name,
          file.content,
          fn.startLine,
          fn.endLine,
        );
      };
      list.appendChild(row);
    });
  }

  // Stats (re-count all functions through countLines filter)
  const fileLines = file.content.split("\n");
  const allCounted = fns.map((fn) => {
    const slice = fileLines.slice(fn.startLine - 1, fn.endLine).join("\n");
    return countLines(slice);
  });
  const totalFnLines = allCounted.reduce((s, n) => s + n, 0);
  const maxFn = allCounted.length ? Math.max(...allCounted) : 0;
  const avg = fns.length ? Math.round(totalFnLines / fns.length) : 0;
  stats.innerHTML = `
    <span class="fn-stat"><b>${fns.length}</b> funzioni</span>
    <span class="fn-stat-sep">·</span>
    <span class="fn-stat">media <b>${avg}</b> ln</span>
    <span class="fn-stat-sep">·</span>
    <span class="fn-stat">max <b>${maxFn}</b> ln</span>`;

  renderList("");
  search.oninput = () => renderList(search.value);

  modal.classList.remove("hidden");
  setTimeout(() => search.focus(), 60);
}

function chiudiFunzioniModal() {
  document.getElementById("fnModal").classList.add("hidden");
}

function kindColor(kind) {
  const map = {
    function: "kc-fn",
    arrow: "kc-arrow",
    method: "kc-method",
    fun: "kc-fun",
    func: "kc-fun",
    def: "kc-def",
    fn: "kc-fn",
    sub: "kc-sub",
    defp: "kc-defp",
    class_method: "kc-method",
  };
  return map[kind] || "kc-fn";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    chiudiFunzioniModal();
    chiudiModalUrl();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    chiudiCodiceModal();
    chiudiFileModal();
    chiudiFunzioniModal();
    chiudiModalUrl();
  }
});

// ── FILE VIEWER MODAL ─────────────────────────────────────────────────

function apriFileModal(file) {
  const modal = document.getElementById("fileModal");
  const titleEl = document.getElementById("fileModalTitle");
  const metaEl = document.getElementById("fileModalMeta");
  const codeEl = document.getElementById("fileModalPre");
  const copyBtn = document.getElementById("fileModalCopy");
  const fnBtn = document.getElementById("fileModalFnBtn");

  titleEl.textContent = file.name;

  const totalRaw = file.content.split("\n").length;
  metaEl.innerHTML = `
    <span class="code-modal-file">${escHtml(file.fullPath)}</span>
    <span class="code-modal-range">${fmtN(file.lines)} righe · ${fmtN(totalRaw)} totali · ${formatBytes(file.size)}</span>`;

  // Build numbered lines
  const lines = file.content.split("\n");
  codeEl.innerHTML = "";
  lines.forEach((lineText, i) => {
    const lineEl = document.createElement("div");
    lineEl.className = "cm-line";
    lineEl.innerHTML = `<span class="cm-ln">${i + 1}</span><span class="cm-code">${escHtml(lineText) || " "}</span>`;
    codeEl.appendChild(lineEl);
  });

  // Functions button
  const fns = file.functions || [];
  if (fns.length > 0) {
    fnBtn.style.display = "";
    fnBtn.textContent = `ƒ ${fns.length} funzioni`;
    fnBtn.onclick = () => {
      chiudiFileModal();
      apriFunzioniModal(file);
    };
  } else {
    fnBtn.style.display = "none";
  }

  // Copy
  copyBtn.onclick = () => {
    navigator.clipboard
      .writeText(file.content)
      .then(() => {
        copyBtn.textContent = "✓ Copiato!";
        setTimeout(() => (copyBtn.textContent = "⎘ Copia"), 1800);
      })
      .catch(() => showToast("⚠ Copia non riuscita"));
  };

  // Download
  const dlBtn = document.getElementById("fileModalDlBtn");
  dlBtn.onclick = () => _scaricaFileCorrente(file.name, file.content);

  modal.classList.remove("hidden");
  codeEl.scrollTop = 0;
}

function chiudiFileModal() {
  document.getElementById("fileModal").classList.add("hidden");
}

// ── CODE VIEWER MODAL ────────────────────────────────────────────────

function apriCodiceModal(
  fnName,
  kind,
  filePath,
  fileContent,
  startLine,
  endLine,
) {
  const modal = document.getElementById("codeModal");
  const titleEl = document.getElementById("codeModalTitle");
  const metaEl = document.getElementById("codeModalMeta");
  const codeEl = document.getElementById("codeModalPre");
  const copyBtn = document.getElementById("codeModalCopy");

  const lines = fileContent.split("\n");
  const slice = lines.slice(startLine - 1, endLine);

  // Dedent
  const minIndent = slice
    .filter((l) => l.trim().length > 0)
    .reduce((min, l) => Math.min(min, l.match(/^(\s*)/)[1].length), Infinity);
  const dedented = slice.map((l) =>
    l.slice(minIndent === Infinity ? 0 : minIndent),
  );

  titleEl.textContent = fnName;
  const kindCls = kindColor(kind);
  metaEl.innerHTML = `
    <span class="fn-kind ${kindCls}">${escHtml(kind)}</span>
    <span class="code-modal-file">${escHtml(filePath)}</span>
    <span class="code-modal-range">righe ${fmtN(startLine)}–${fmtN(endLine)} · ${fmtN(endLine - startLine + 1)} totali</span>`;

  codeEl.innerHTML = "";
  dedented.forEach((lineText, i) => {
    const lineEl = document.createElement("div");
    lineEl.className = "cm-line";
    lineEl.innerHTML = `<span class="cm-ln">${startLine + i}</span><span class="cm-code">${escHtml(lineText) || " "}</span>`;
    codeEl.appendChild(lineEl);
  });

  copyBtn.onclick = () => {
    navigator.clipboard
      .writeText(dedented.join("\n"))
      .then(() => {
        copyBtn.textContent = "✓ Copiato!";
        setTimeout(() => (copyBtn.textContent = "⎘ Copia"), 1800);
      })
      .catch(() => showToast("⚠ Copia non riuscita"));
  };

  // Download
  const dlBtn = document.getElementById("codeModalDlBtn");
  dlBtn.onclick = () =>
    _scaricaFunzione(fnName, fileContent, startLine, endLine, filePath);

  modal.classList.remove("hidden");
  codeEl.scrollTop = 0;
}

function chiudiCodiceModal() {
  document.getElementById("codeModal").classList.add("hidden");
}

// ── DOWNLOAD HELPERS ─────────────────────────────────────────────────

/** Trigger a browser file download */
function dlBlob(content, filename, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Collect all files from fileTree as flat array of { path, content } */
function collectAllFiles() {
  const result = [];
  function walk(node, parts) {
    for (const f of node.__files__ || []) {
      result.push({
        path: parts.length ? parts.join("/") + "/" + f.name : f.name,
        content: f.content,
        file: f,
      });
    }
    for (const k of Object.keys(node).filter((k) => k !== "__files__"))
      walk(node[k], [...parts, k]);
  }
  for (const root of Object.keys(fileTree)) walk(fileTree[root], [root]);
  return result;
}

/** Download a single function's code — called from codeModal */
function _scaricaFunzione(fnName, fileContent, startLine, endLine, filePath) {
  const lines = fileContent.split("\n").slice(startLine - 1, endLine);
  const minIndent = lines
    .filter((l) => l.trim())
    .reduce((m, l) => Math.min(m, l.match(/^(\s*)/)[1].length), Infinity);
  const dedented = lines.map((l) =>
    l.slice(minIndent === Infinity ? 0 : minIndent),
  );
  const ext = filePath.split(".").pop() || "txt";
  const safeName = fnName.replace(/[^a-zA-Z0-9_\-]/g, "_");
  dlBlob(dedented.join("\n"), `${safeName}.${ext}`);
  showToast(`⬇ Scaricato ${safeName}.${ext}`);
}

/** Download the file currently open in fileModal */
function _scaricaFileCorrente(name, content) {
  dlBlob(content, name);
  showToast(`⬇ Scaricato ${name}`);
}

/** Download all functions of a single file as a .txt report (called from fnModal) */
let _fnModalFile = null; // set when fnModal opens

function scaricaFunzioniFile() {
  if (!_fnModalFile) return;
  const file = _fnModalFile;
  const fns = (file.functions || []).slice().sort((a, b) => b.lines - a.lines);
  if (!fns.length) {
    showToast("⚠ Nessuna funzione da scaricare");
    return;
  }
  const lines = file.content.split("\n");
  const parts = [`// ── Funzioni di: ${file.name} ── ${fns.length} funzioni\n`];
  fns.forEach((fn, i) => {
    const slice = lines.slice(fn.startLine - 1, fn.endLine);
    const minI = slice
      .filter((l) => l.trim())
      .reduce((m, l) => Math.min(m, l.match(/^(\s*)/)[1].length), Infinity);
    const code = slice
      .map((l) => l.slice(minI === Infinity ? 0 : minI))
      .join("\n");
    parts.push(
      `\n// [${i + 1}] ${fn.kind} ${fn.name}  (righe ${fn.startLine}–${fn.endLine})\n${code}\n`,
    );
  });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  dlBlob(parts.join("\n"), `${baseName}_functions.txt`);
  showToast(`⬇ Scaricato ${baseName}_functions.txt`);
}

/** Download ALL visible/filtered functions from the fn full tab */
async function scaricaTutteFunzioni() {
  const all = collectAllFunctions();
  if (!all.length) {
    showToast("⚠ Nessuna funzione da scaricare");
    return;
  }

  // Group by file for neat ZIP structure
  const byFile = {};
  all.forEach((r) => {
    if (!byFile[r.filePath]) byFile[r.filePath] = [];
    byFile[r.filePath].push(r);
  });

  if (typeof JSZip === "undefined") {
    // Fallback: single txt
    const parts = [`// ── Tutte le funzioni — ${fmtN(all.length)} totali\n`];
    all.forEach((r, i) => {
      const lines = (r.fileContent || "")
        .split("\n")
        .slice(r.startLine - 1, r.endLine);
      const minI = lines
        .filter((l) => l.trim())
        .reduce((m, l) => Math.min(m, l.match(/^(\s*)/)[1].length), Infinity);
      const code = lines
        .map((l) => l.slice(minI === Infinity ? 0 : minI))
        .join("\n");
      parts.push(
        `\n// [${i + 1}] ${r.kind} ${r.fnName}  —  ${r.filePath}  (righe ${r.startLine}–${r.endLine})\n${code}\n`,
      );
    });
    dlBlob(parts.join("\n"), "all_functions.txt");
    showToast(`⬇ Scaricato all_functions.txt (${fmtN(all.length)} funzioni)`);
    return;
  }

  const zip = new JSZip();
  const fnFolder = zip.folder("functions");
  Object.entries(byFile).forEach(([fp, fns]) => {
    const parts = [`// ── ${fp} — ${fns.length} funzioni\n`];
    fns
      .sort((a, b) => a.startLine - b.startLine)
      .forEach((r, i) => {
        const lines = (r.fileContent || "")
          .split("\n")
          .slice(r.startLine - 1, r.endLine);
        const minI = lines
          .filter((l) => l.trim())
          .reduce((m, l) => Math.min(m, l.match(/^(\s*)/)[1].length), Infinity);
        const code = lines
          .map((l) => l.slice(minI === Infinity ? 0 : minI))
          .join("\n");
        parts.push(
          `\n// [${i + 1}] ${r.kind} ${r.fnName}  (righe ${r.startLine}–${r.endLine})\n${code}\n`,
        );
      });
    const safeFile = fp
      .replace(/[\/\\]/g, "__")
      .replace(/[^a-zA-Z0-9._\-]/g, "_");
    fnFolder.file(`${safeFile}.txt`, parts.join("\n"));
  });
  const blob = await zip.generateAsync({ type: "blob" });
  dlBlob(blob, "functions.zip", "application/zip");
  showToast(`⬇ Scaricato functions.zip (${fmtN(all.length)} funzioni)`);
}

/** Download ALL loaded files as a ZIP */
async function scaricaTuttiFile() {
  const allFiles = collectAllFiles();
  if (!allFiles.length) {
    showToast("⚠ Nessun file da scaricare");
    return;
  }

  if (typeof JSZip === "undefined") {
    showToast("⚠ JSZip non caricato — impossibile creare ZIP");
    return;
  }

  const zip = new JSZip();
  allFiles.forEach(({ path, content }) => zip.file(path, content));
  const blob = await zip.generateAsync({ type: "blob" });
  dlBlob(blob, "progetto.zip", "application/zip");
  showToast(`⬇ Scaricato progetto.zip (${fmtN(allFiles.length)} file)`);
}

// ── BOOT ──
loadExtensions().then(() => {
  console.log("{ lines } v3 ready ✓");
});

// Restore saved theme
try {
  const saved = localStorage.getItem("lines-theme");
  if (saved) applyTheme(saved);
} catch (e) {}

function updateStats() {
  let files = 0,
    lines = 0,
    size = 0,
    fns = 0;
  for (const root of Object.keys(fileTree)) {
    const s = calcNodeStats(fileTree[root]);
    files += s.files;
    lines += s.lines;
    size += s.size;
    fns += s.fns;
  }

  document.getElementById("totalFiles").textContent = fmtN(files);
  document.getElementById("totalLines").textContent = fmtN(lines);
  document.getElementById("avgLines").textContent =
    files > 0 ? fmtN(Math.round(lines / files)) : "0";
  document.getElementById("totalSize").textContent = formatBytes(size);
  document.getElementById("totalFunctions").textContent = fmtN(fns);

  const statsRow = document.getElementById("statsRow");
  if (files > 0) statsRow.classList.remove("hidden");
  else statsRow.classList.add("hidden");

  const logoMark = document.getElementById("logoCounter");
  if (logoMark) {
    logoMark.innerHTML = files > 0 ? `lines: ${fmtN(lines)}` : "{ lines }";
  }

  // Update the functions tab (badge + content if active)
  if (activeTab === "functions") renderFnFull();
  else {
    // Update badge count without full render
    const all = collectAllFunctions();
    const badge = document.getElementById("tabFnBadge");
    if (badge) {
      if (all.length) {
        badge.textContent = fmtN(all.length);
        badge.classList.remove("hidden");
      } else badge.classList.add("hidden");
    }
  }
}
// ══════════════════════════════════════════════════════════════════════
// ── DOWNLOAD SELECTION MODAL ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════

let dlActivetab = "files";
let dlFileSelection = new Set(); // selected file fullPaths
let dlFnSelection = new Set(); // selected fn keys (filePath+':'+fnName+':'+startLine)

function apriModalScarica() {
  const allFiles = collectAllFiles();
  if (!allFiles.length) {
    showToast("⚠ Nessun file caricato");
    return;
  }

  // Default: select all
  dlFileSelection = new Set(allFiles.map((f) => f.path));
  const allFns = collectAllFunctions();
  dlFnSelection = new Set(allFns.map(fnKey));

  dlActivetab = "files";
  switchDlTab("files");
  renderDlFileList();
  renderDlFnList();

  document.getElementById("dlSelModal").classList.remove("hidden");
}

function chiudiModalScarica() {
  document.getElementById("dlSelModal").classList.add("hidden");
}

function fnKey(r) {
  return `${r.filePath}::${r.fnName}::${r.startLine}`;
}

function switchDlTab(tab) {
  dlActivetab = tab;
  document
    .getElementById("dlPaneFiles")
    .classList.toggle("hidden", tab !== "files");
  document
    .getElementById("dlPaneFunctions")
    .classList.toggle("hidden", tab !== "functions");
  document
    .getElementById("dlTabFiles")
    .classList.toggle("dl-tab-active", tab === "files");
  document
    .getElementById("dlTabFunctions")
    .classList.toggle("dl-tab-active", tab !== "files");
  updateDlConfirmBtn();
}

function updateDlConfirmBtn() {
  const btn = document.getElementById("dlSelConfirmBtn");
  const count =
    dlActivetab === "files" ? dlFileSelection.size : dlFnSelection.size;
  btn.textContent = `⬇ Scarica ${fmtN(count)} ${dlActivetab === "files" ? "file" : "funzioni"}`;
  btn.disabled = count === 0;
}

// ── FILE LIST ────────────────────────────────────────────────────────

function renderDlFileList() {
  const container = document.getElementById("dlFileList");
  const summary = document.getElementById("dlFileSummary");
  const filter = (
    document.getElementById("dlFileSearch").value || ""
  ).toLowerCase();
  const allFiles = collectAllFiles();
  const visible = filter
    ? allFiles.filter((f) => f.path.toLowerCase().includes(filter))
    : allFiles;

  // Group by source root
  const groups = {};
  for (const f of visible) {
    const root = f.path.split("/")[0] || "—";
    if (!groups[root]) groups[root] = [];
    groups[root].push(f);
  }

  container.innerHTML = "";
  for (const [root, files] of Object.entries(groups)) {
    const gh = document.createElement("div");
    gh.className = "dl-group-header";
    const selCount = files.filter((f) => dlFileSelection.has(f.path)).length;
    gh.innerHTML = `<span>⬡ ${escHtml(root)}</span><span style="color:var(--a1);margin-left:4px">${selCount}/${files.length}</span>`;
    const tog = document.createElement("span");
    tog.className = "dl-group-toggle";
    const allSel = files.every((f) => dlFileSelection.has(f.path));
    tog.textContent = allSel ? "Deseleziona gruppo" : "Seleziona gruppo";
    tog.onclick = (e) => {
      e.stopPropagation();
      files.forEach((f) =>
        allSel ? dlFileSelection.delete(f.path) : dlFileSelection.add(f.path),
      );
      renderDlFileList();
      updateDlConfirmBtn();
    };
    gh.appendChild(tog);
    container.appendChild(gh);

    for (const f of files) {
      const row = document.createElement("div");
      const checked = dlFileSelection.has(f.path);
      row.className = `dl-row${checked ? " dl-checked" : ""}`;
      const relPath = f.path.split("/").slice(1).join("/") || f.path;
      const lines = f.file ? fmtN(f.file.lines) + " ln" : "";
      const size = f.file ? formatBytes(f.file.size) : "";
      const icon = getIcon(f.path);
      row.innerHTML = `
        <div class="dl-checkbox">${checked ? "✓" : ""}</div>
        <span class="dl-row-icon">${icon}</span>
        <span class="dl-row-name" title="${escHtml(f.path)}">${escHtml(relPath)}</span>
        <span class="dl-row-meta">${lines} · ${size}</span>`;
      row.onclick = () => {
        if (dlFileSelection.has(f.path)) dlFileSelection.delete(f.path);
        else dlFileSelection.add(f.path);
        renderDlFileList();
        updateDlConfirmBtn();
      };
      container.appendChild(row);
    }
  }

  if (!visible.length) {
    container.innerHTML =
      '<div class="fn-empty" style="padding:20px;text-align:center;color:var(--muted)">Nessun file corrisponde al filtro</div>';
  }

  summary.textContent = `${fmtN(dlFileSelection.size)} / ${fmtN(allFiles.length)} file selezionati`;
  updateDlConfirmBtn();
}

function dlSelectAllFiles(sel) {
  const filter = (
    document.getElementById("dlFileSearch").value || ""
  ).toLowerCase();
  const allFiles = collectAllFiles();
  const visible = filter
    ? allFiles.filter((f) => f.path.toLowerCase().includes(filter))
    : allFiles;
  visible.forEach((f) =>
    sel ? dlFileSelection.add(f.path) : dlFileSelection.delete(f.path),
  );
  renderDlFileList();
  updateDlConfirmBtn();
}

// ── FUNCTION LIST ────────────────────────────────────────────────────

function renderDlFnList() {
  const container = document.getElementById("dlFnList");
  const summary = document.getElementById("dlFnSummary");
  const filter = (
    document.getElementById("dlFnSearch").value || ""
  ).toLowerCase();
  const allFns = collectAllFunctions();
  const visible = filter
    ? allFns.filter(
        (r) =>
          r.fnName.toLowerCase().includes(filter) ||
          r.filePath.toLowerCase().includes(filter) ||
          r.kind.toLowerCase().includes(filter),
      )
    : allFns;

  // Group by file
  const groups = {};
  for (const r of visible) {
    if (!groups[r.filePath]) groups[r.filePath] = [];
    groups[r.filePath].push(r);
  }

  container.innerHTML = "";
  for (const [fp, fns] of Object.entries(groups)) {
    const gh = document.createElement("div");
    gh.className = "dl-group-header";
    const selCount = fns.filter((r) => dlFnSelection.has(fnKey(r))).length;
    gh.innerHTML = `<span style="font-family:var(--mono)">${escHtml(fp)}</span><span style="color:var(--a1);margin-left:4px">${selCount}/${fns.length}</span>`;
    const tog = document.createElement("span");
    tog.className = "dl-group-toggle";
    const allSel = fns.every((r) => dlFnSelection.has(fnKey(r)));
    tog.textContent = allSel ? "Deseleziona gruppo" : "Seleziona gruppo";
    tog.onclick = (e) => {
      e.stopPropagation();
      fns.forEach((r) =>
        allSel ? dlFnSelection.delete(fnKey(r)) : dlFnSelection.add(fnKey(r)),
      );
      renderDlFnList();
      updateDlConfirmBtn();
    };
    gh.appendChild(tog);
    container.appendChild(gh);

    for (const r of fns) {
      const key = fnKey(r);
      const checked = dlFnSelection.has(key);
      const row = document.createElement("div");
      row.className = `dl-row${checked ? " dl-checked" : ""}`;
      const kindCls = kindColor(r.kind);
      row.innerHTML = `
        <div class="dl-checkbox">${checked ? "✓" : ""}</div>
        <span class="fn-kind dl-row-kind ${kindCls}" style="font-size:9px">${escHtml(r.kind)}</span>
        <span class="dl-row-name" title="${escHtml(r.fnName)}">${escHtml(r.fnName)}</span>
        <span class="dl-row-meta">${r.linesFiltered} ln · ${r.startLine}–${r.endLine}</span>`;
      row.onclick = () => {
        if (dlFnSelection.has(key)) dlFnSelection.delete(key);
        else dlFnSelection.add(key);
        renderDlFnList();
        updateDlConfirmBtn();
      };
      container.appendChild(row);
    }
  }

  if (!visible.length) {
    container.innerHTML =
      '<div class="fn-empty" style="padding:20px;text-align:center;color:var(--muted)">Nessuna funzione corrisponde al filtro</div>';
  }

  summary.textContent = `${fmtN(dlFnSelection.size)} / ${fmtN(allFns.length)} funzioni selezionate`;
  updateDlConfirmBtn();
}

function dlSelectAllFns(sel) {
  const filter = (
    document.getElementById("dlFnSearch").value || ""
  ).toLowerCase();
  const allFns = collectAllFunctions();
  const visible = filter
    ? allFns.filter(
        (r) =>
          r.fnName.toLowerCase().includes(filter) ||
          r.filePath.toLowerCase().includes(filter) ||
          r.kind.toLowerCase().includes(filter),
      )
    : allFns;
  visible.forEach((r) =>
    sel ? dlFnSelection.add(fnKey(r)) : dlFnSelection.delete(fnKey(r)),
  );
  renderDlFnList();
  updateDlConfirmBtn();
}

// ── EXECUTE DOWNLOAD ─────────────────────────────────────────────────

async function eseguiDownloadSelezione() {
  if (dlActivetab === "files") {
    await _scaricaFileSelezionati();
  } else {
    await _scaricaFunzioniSelezionate();
  }
  chiudiModalScarica();
}

async function _scaricaFileSelezionati() {
  if (!dlFileSelection.size) {
    showToast("⚠ Nessun file selezionato");
    return;
  }

  const allFiles = collectAllFiles();
  const sel = allFiles.filter((f) => dlFileSelection.has(f.path));

  if (sel.length === 1) {
    dlBlob(sel[0].content, sel[0].path.split("/").pop());
    showToast(`⬇ Scaricato ${sel[0].path.split("/").pop()}`);
    return;
  }

  if (typeof JSZip === "undefined") {
    showToast("⚠ JSZip non caricato");
    return;
  }
  const zip = new JSZip();
  sel.forEach(({ path, content }) => zip.file(path, content));
  const blob = await zip.generateAsync({ type: "blob" });
  dlBlob(blob, "selezione_file.zip", "application/zip");
  showToast(`⬇ Scaricato selezione_file.zip (${fmtN(sel.length)} file)`);
}

async function _scaricaFunzioniSelezionate() {
  if (!dlFnSelection.size) {
    showToast("⚠ Nessuna funzione selezionata");
    return;
  }

  const allFns = collectAllFunctions();
  const sel = allFns.filter((r) => dlFnSelection.has(fnKey(r)));

  if (sel.length === 1) {
    const r = sel[0];
    _scaricaFunzione(
      r.fnName,
      r.fileContent,
      r.startLine,
      r.endLine,
      r.filePath,
    );
    return;
  }

  if (typeof JSZip === "undefined") {
    // Fallback: single txt
    const parts = [`// ── Selezione funzioni — ${fmtN(sel.length)} totali\n`];
    sel.forEach((r, i) => {
      const lines = (r.fileContent || "")
        .split("\n")
        .slice(r.startLine - 1, r.endLine);
      const minI = lines
        .filter((l) => l.trim())
        .reduce((m, l) => Math.min(m, l.match(/^(\s*)/)[1].length), Infinity);
      const code = lines
        .map((l) => l.slice(minI === Infinity ? 0 : minI))
        .join("\n");
      parts.push(
        `\n// [${i + 1}] ${r.kind} ${r.fnName}  —  ${r.filePath}  (righe ${r.startLine}–${r.endLine})\n${code}\n`,
      );
    });
    dlBlob(parts.join("\n"), "selezione_funzioni.txt");
    showToast(
      `⬇ Scaricato selezione_funzioni.txt (${fmtN(sel.length)} funzioni)`,
    );
    return;
  }

  const zip = new JSZip();
  const byFile = {};
  sel.forEach((r) => {
    if (!byFile[r.filePath]) byFile[r.filePath] = [];
    byFile[r.filePath].push(r);
  });

  Object.entries(byFile).forEach(([fp, fns]) => {
    const parts = [`// ── ${fp} — ${fns.length} funzioni selezionate\n`];
    fns
      .sort((a, b) => a.startLine - b.startLine)
      .forEach((r, i) => {
        const lines = (r.fileContent || "")
          .split("\n")
          .slice(r.startLine - 1, r.endLine);
        const minI = lines
          .filter((l) => l.trim())
          .reduce((m, l) => Math.min(m, l.match(/^(\s*)/)[1].length), Infinity);
        const code = lines
          .map((l) => l.slice(minI === Infinity ? 0 : minI))
          .join("\n");
        parts.push(
          `\n// [${i + 1}] ${r.kind} ${r.fnName}  (righe ${r.startLine}–${r.endLine})\n${code}\n`,
        );
      });
    const safeFile = fp
      .replace(/[\/\\]/g, "__")
      .replace(/[^a-zA-Z0-9._\-]/g, "_");
    zip.file(`funzioni_selezionate/${safeFile}.txt`, parts.join("\n"));
  });

  const blob = await zip.generateAsync({ type: "blob" });
  dlBlob(blob, "selezione_funzioni.zip", "application/zip");
  showToast(
    `⬇ Scaricato selezione_funzioni.zip (${fmtN(sel.length)} funzioni)`,
  );
}

// Close download modal on backdrop click
document.getElementById("dlSelModal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("dlSelModal")) chiudiModalScarica();
});

// ══════════════════════════════════════════════════════════════════════
// ── INLINE FUNCTION SELECTION (tab Funzioni) ───────────────────────────
// ══════════════════════════════════════════════════════════════════════

let fnInlineSelection = new Set(); // keys of selected rows

function fnInlineKey(r) {
  return `${r.filePath}::${r.fnName}::${r.startLine}`;
}

/** Update the floating selection bar visibility + count */
function updateFnSelBar() {
  const bar = document.getElementById("fnSelBar");
  const countEl = document.getElementById("fnSelBarCount");
  if (!bar) return;
  const n = fnInlineSelection.size;
  if (n === 0) {
    bar.classList.add("hidden");
  } else {
    bar.classList.remove("hidden");
    countEl.textContent = `${fmtN(n)} ${n === 1 ? "funzione selezionata" : "funzioni selezionate"}`;
  }
}

/** Update the header checkbox state (unchecked / indeterminate / all) */
function updateFnHdrCheckbox(visibleRows) {
  const el = document.getElementById("fnHdrCheckbox");
  if (!el) return;
  const total = visibleRows.length;
  const selected = visibleRows.filter((r) =>
    fnInlineSelection.has(fnInlineKey(r)),
  ).length;
  el.classList.remove("all-checked", "some-checked");
  el.textContent = "";
  if (total > 0 && selected === total) {
    el.classList.add("all-checked");
    el.textContent = "✓";
  } else if (selected > 0) {
    el.classList.add("some-checked");
    el.textContent = "–";
  }
}

/** Header checkbox: toggle all visible rows */
function fnToggleSelectAll() {
  const allFns = collectAllFunctions();
  // Rebuild visible rows using current filters (same logic as renderFnFull)
  const searchEl = document.getElementById("fnFullSearch");
  const textFilter = (searchEl ? searchEl.value : "").toLowerCase().trim();
  let rows = allFns.filter((r) => {
    const kindOk = fnFullKindFilter.size === 0 || fnFullKindFilter.has(r.kind);
    const fileOk =
      fnFullFileFilter.size === 0 || fnFullFileFilter.has(r.filePath);
    if (!kindOk || !fileOk) return false;
    if (!textFilter) return true;
    return (
      r.fnName.toLowerCase().includes(textFilter) ||
      r.filePath.toLowerCase().includes(textFilter) ||
      r.kind.toLowerCase().includes(textFilter)
    );
  });

  const allSelected = rows.every((r) => fnInlineSelection.has(fnInlineKey(r)));
  if (allSelected) {
    rows.forEach((r) => fnInlineSelection.delete(fnInlineKey(r)));
  } else {
    rows.forEach((r) => fnInlineSelection.add(fnInlineKey(r)));
  }
  renderFnFull();
}

/** Select all currently visible rows */
function fnSelectAllVisible() {
  const allFns = collectAllFunctions();
  const searchEl = document.getElementById("fnFullSearch");
  const textFilter = (searchEl ? searchEl.value : "").toLowerCase().trim();
  let rows = allFns.filter((r) => {
    const kindOk = fnFullKindFilter.size === 0 || fnFullKindFilter.has(r.kind);
    const fileOk =
      fnFullFileFilter.size === 0 || fnFullFileFilter.has(r.filePath);
    if (!kindOk || !fileOk) return false;
    if (!textFilter) return true;
    return (
      r.fnName.toLowerCase().includes(textFilter) ||
      r.filePath.toLowerCase().includes(textFilter) ||
      r.kind.toLowerCase().includes(textFilter)
    );
  });
  rows.forEach((r) => fnInlineSelection.add(fnInlineKey(r)));
  renderFnFull();
}

/** Clear all inline selection */
function fnClearSelection() {
  fnInlineSelection.clear();
  renderFnFull();
}

/** Download only the inline-selected functions */
async function scaricaFunzioniSelezionate() {
  if (!fnInlineSelection.size) {
    showToast("⚠ Nessuna funzione selezionata");
    return;
  }

  const allFns = collectAllFunctions();
  const sel = allFns.filter((r) => fnInlineSelection.has(fnInlineKey(r)));

  if (sel.length === 1) {
    const r = sel[0];
    _scaricaFunzione(
      r.fnName,
      r.fileContent,
      r.startLine,
      r.endLine,
      r.filePath,
    );
    return;
  }

  if (typeof JSZip === "undefined") {
    const parts = [`// ── Funzioni selezionate — ${fmtN(sel.length)} totali\n`];
    sel.forEach((r, i) => {
      const lines = (r.fileContent || "")
        .split("\n")
        .slice(r.startLine - 1, r.endLine);
      const minI = lines
        .filter((l) => l.trim())
        .reduce((m, l) => Math.min(m, l.match(/^(\s*)/)[1].length), Infinity);
      const code = lines
        .map((l) => l.slice(minI === Infinity ? 0 : minI))
        .join("\n");
      parts.push(
        `\n// [${i + 1}] ${r.kind} ${r.fnName}  —  ${r.filePath}  (righe ${r.startLine}–${r.endLine})\n${code}\n`,
      );
    });
    dlBlob(parts.join("\n"), "funzioni_selezionate.txt");
    showToast(
      `⬇ Scaricato funzioni_selezionate.txt (${fmtN(sel.length)} funzioni)`,
    );
    return;
  }

  const zip = new JSZip();
  const byFile = {};
  sel.forEach((r) => {
    if (!byFile[r.filePath]) byFile[r.filePath] = [];
    byFile[r.filePath].push(r);
  });

  Object.entries(byFile).forEach(([fp, fns]) => {
    const parts = [`// ── ${fp} — ${fns.length} funzioni selezionate\n`];
    fns
      .sort((a, b) => a.startLine - b.startLine)
      .forEach((r, i) => {
        const lines = (r.fileContent || "")
          .split("\n")
          .slice(r.startLine - 1, r.endLine);
        const minI = lines
          .filter((l) => l.trim())
          .reduce((m, l) => Math.min(m, l.match(/^(\s*)/)[1].length), Infinity);
        const code = lines
          .map((l) => l.slice(minI === Infinity ? 0 : minI))
          .join("\n");
        parts.push(
          `\n// [${i + 1}] ${r.kind} ${r.fnName}  (righe ${r.startLine}–${r.endLine})\n${code}\n`,
        );
      });
    const safeFile = fp
      .replace(/[\/\\]/g, "__")
      .replace(/[^a-zA-Z0-9._\-]/g, "_");
    zip.file(`${safeFile}.txt`, parts.join("\n"));
  });

  const blob = await zip.generateAsync({ type: "blob" });
  dlBlob(blob, "funzioni_selezionate.zip", "application/zip");
  showToast(
    `⬇ Scaricato funzioni_selezionate.zip (${fmtN(sel.length)} funzioni)`,
  );
}
