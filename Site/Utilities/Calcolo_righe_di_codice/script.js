// ── CONSTANTS ──
const EXTENSIONS_CODICE = new Set([
  'js','jsx','ts','tsx','mjs','cjs',
  'py','rb','php','java','kt','kts','scala',
  'c','cpp','h','hpp','cc','cxx',
  'cs','fs','fsx',
  'go','rs','swift','m','mm',
  'html','htm','css','scss','sass','less',
  'vue','svelte','astro',
  'json','yaml','yml','xml','toml',
  'sh','bash','zsh','fish','ps1','bat',
  'sql','graphql','gql',
  'md','markdown','txt'
]);

// ── STATE ──
let fileTree = {};

// ── DOM REFS ──
const dropzone        = document.getElementById('dropzone');
const fileInput       = document.getElementById('fileInput');
const folderInput     = document.getElementById('folderInput');
const escludiVuote    = document.getElementById('escludiVuote');
const escludiCommenti = document.getElementById('escludiCommenti');
const soloCodice      = document.getElementById('soloCodice');
const searchFilter    = document.getElementById('searchFilter');

// ── DRAG & DROP ──
dropzone.addEventListener('dragover', e => {
  e.preventDefault();
  dropzone.classList.add('drag-over');
});

dropzone.addEventListener('dragleave', e => {
  if (!dropzone.contains(e.relatedTarget)) dropzone.classList.remove('drag-over');
});

dropzone.addEventListener('drop', async e => {
  e.preventDefault();
  dropzone.classList.remove('drag-over');
  const items = Array.from(e.dataTransfer.items);
  const files = [];
  for (const item of items) {
    const entry = item.webkitGetAsEntry && item.webkitGetAsEntry();
    if (entry) files.push(...await getAllFilesFromEntry(entry));
  }
  if (files.length) await processFiles(files, 'drop');
});

fileInput.addEventListener('change', async e => {
  const files = Array.from(e.target.files);
  if (files.length) await processFiles(files, 'files');
  fileInput.value = '';
});

folderInput.addEventListener('change', async e => {
  const files = Array.from(e.target.files);
  if (files.length) await processFiles(files, 'folder');
  folderInput.value = '';
});

// ── FILE READING ──
async function getAllFilesFromEntry(entry, path = '') {
  const files = [];
  if (entry.isFile) {
    const file = await new Promise(res => entry.file(res));
    file.relativePath = path ? `${path}/${entry.name}` : entry.name;
    files.push(file);
  } else if (entry.isDirectory) {
    const subPath = path ? `${path}/${entry.name}` : entry.name;
    const reader = entry.createReader();
    const entries = await readAllEntries(reader);
    for (const sub of entries) files.push(...await getAllFilesFromEntry(sub, subPath));
  }
  return files;
}

function readAllEntries(reader) {
  return new Promise(resolve => {
    const all = [];
    function read() {
      reader.readEntries(entries => {
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
    r.onload = e => res(e.target.result);
    r.onerror = rej;
    r.readAsText(file, 'UTF-8');
  });
}

// ── PROCESS FILES ──
async function processFiles(files, sourceType) {
  showLoading();

  const sourceName = getSourceName(files, sourceType);
  const branch = {};
  let count = 0;

  for (const file of files) {
    const relPath = file.relativePath || file.webkitRelativePath || file.name;
    const parts = relPath.split('/').filter(Boolean);

    const fileName = parts[parts.length - 1];
    const ext = fileName.split('.').pop().toLowerCase();
    if (soloCodice.checked && !EXTENSIONS_CODICE.has(ext)) continue;

    let content;
    try { content = await readFileContent(file); } catch(e) { continue; }

    const lines = countLines(content);

    // ── BUG FIX ──
    // Se il primo segmento del path coincide col nome della source, lo saltiamo.
    // Questo evita pippo → { pippo: { ... } } che mostrerebbe "pippo pippo".
    let folders = parts.slice(0, -1);
    if (folders.length > 0 && folders[0] === sourceName) {
      folders = folders.slice(1);
    }

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
    showToast('⚠ Nessun file di codice trovato');
    return;
  }

  // Deduplica nome source
  let name = sourceName;
  let i = 2;
  while (fileTree[name]) { name = `${sourceName} (${i++})`; }
  fileTree[name] = branch;

  renderSources();
  renderTree();
  updateStats();
  showToast(`✓ ${count} file da "${name}"`);
}

function getSourceName(files, sourceType) {
  if (sourceType === 'folder') {
    const rel = files[0].webkitRelativePath || files[0].relativePath || files[0].name;
    return rel.split('/')[0] || 'cartella';
  }
  if (sourceType === 'drop') {
    const rel = files[0].relativePath || files[0].name;
    return rel.split('/')[0] || 'drop';
  }
  return `file (${files.length})`;
}

// ── LINE COUNTING ──
function countLines(content) {
  const exEmpty    = escludiVuote.checked;
  const exComments = escludiCommenti.checked;
  const lines = content.split('\n');
  let count = 0;
  let inMulti = false;

  for (const raw of lines) {
    const t = raw.trim();
    if (exComments) {
      if (!inMulti && t.includes('/*') && !t.includes('*/')) { inMulti = true; continue; }
      if (inMulti) { if (t.includes('*/')) inMulti = false; continue; }
      if (t.startsWith('//') || t.startsWith('#') || t.startsWith('--') ||
          t.startsWith('%') || t.startsWith('<!--')) continue;
    }
    if (exEmpty && t === '') continue;
    count++;
  }
  return count;
}

// ── STATS ──
function calcNodeStats(node, filter = '') {
  let files = 0, lines = 0, size = 0;
  const fl = (node.__files__ || []).filter(f => !filter || f.name.toLowerCase().includes(filter));
  for (const f of fl) { files++; lines += f.lines; size += f.size; }
  for (const k of Object.keys(node).filter(k => k !== '__files__')) {
    const s = calcNodeStats(node[k], filter);
    files += s.files; lines += s.lines; size += s.size;
  }
  return { files, lines, size };
}

function updateStats() {
  let files = 0, lines = 0, size = 0;
  for (const root of Object.keys(fileTree)) {
    const s = calcNodeStats(fileTree[root]);
    files += s.files; lines += s.lines; size += s.size;
  }

  document.getElementById('totalFiles').textContent = files.toLocaleString();
  document.getElementById('totalLines').textContent = lines.toLocaleString();
  document.getElementById('avgLines').textContent   = files > 0 ? Math.round(lines / files).toLocaleString() : '0';
  document.getElementById('totalSize').textContent  = formatBytes(size);

  const statsRow = document.getElementById('statsRow');
  if (files > 0) statsRow.classList.remove('hidden');
  else statsRow.classList.add('hidden');

  document.title = files > 0 ? `{ ${lines.toLocaleString()} ln }` : '{ lines }';
}

// ── RENDER TREE ──
function renderTree() {
  const container = document.getElementById('fileTree');
  const filter = searchFilter.value.toLowerCase();
  container.innerHTML = '';

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
    const el = renderNode(fileTree[rootName], rootName, 0, filter, true);
    if (el) container.appendChild(el);
  }
}

function renderNode(node, name, depth, filter, isRoot = false) {
  const folders = Object.keys(node).filter(k => k !== '__files__');
  const files   = (node.__files__ || []).filter(f => !filter || f.name.toLowerCase().includes(filter));
  const stats   = calcNodeStats(node, filter);
  if (stats.files === 0 && filter) return null;

  const wrap = document.createElement('div');
  wrap.className = `tree-folder depth-${Math.min(depth, 3)}`;

  const header = document.createElement('div');
  header.className = 'folder-header';

  const arrow = document.createElement('span');
  arrow.className = 'folder-arrow open';
  arrow.textContent = '▶';

  const icon = document.createElement('span');
  icon.className = 'folder-icon';
  icon.textContent = isRoot ? '⬡' : '◈';

  const nameSp = document.createElement('span');
  nameSp.className = 'folder-name';
  nameSp.textContent = name;

  const badge = document.createElement('span');
  badge.className = 'folder-badge';
  badge.textContent = `${stats.lines.toLocaleString()} ln`;

  const countSp = document.createElement('span');
  countSp.className = 'folder-count';
  countSp.textContent = `${stats.files}f`;

  header.append(arrow, icon, nameSp, badge, countSp);

  const children = document.createElement('div');
  children.className = 'folder-children open';

  for (const sub of folders) {
    const child = renderNode(node[sub], sub, depth + 1, filter);
    if (child) children.appendChild(child);
  }
  for (const file of files) children.appendChild(renderFile(file));

  header.onclick = () => {
    const open = children.classList.toggle('open');
    arrow.classList.toggle('open', open);
  };

  wrap.append(header, children);
  return wrap;
}

function renderFile(file) {
  const div = document.createElement('div');
  div.className = 'file-item';

  const icon = document.createElement('span');
  icon.className = 'file-icon';
  icon.textContent = getIcon(file.name);

  const name = document.createElement('span');
  name.className = 'file-name';
  name.textContent = file.name;
  name.title = file.fullPath;

  const cls = file.lines > 1000 ? 'badge-vhigh'
            : file.lines > 500  ? 'badge-high'
            : file.lines > 100  ? 'badge-mid'
            : file.lines > 0    ? 'badge-low'
            : 'badge-zero';

  const badge = document.createElement('span');
  badge.className = `file-badge ${cls}`;
  badge.textContent = file.lines.toLocaleString();

  const remove = document.createElement('span');
  remove.className = 'file-remove';
  remove.textContent = '✕';
  remove.title = 'Rimuovi file';
  remove.onclick = e => { e.stopPropagation(); removeFile(file.fullPath); };

  div.append(icon, name, badge, remove);
  return div;
}

// ── SOURCE CHIPS ──
function renderSources() {
  const wrap = document.getElementById('sourcesWrap');
  const keys = Object.keys(fileTree);
  if (!keys.length) { wrap.classList.add('hidden'); return; }
  wrap.classList.remove('hidden');
  wrap.innerHTML = '';

  for (const key of keys) {
    const chip = document.createElement('div');
    chip.className = 'source-chip';
    chip.innerHTML = `<span style="opacity:0.5">⬡</span> ${escHtml(key)}`;
    const rm = document.createElement('span');
    rm.className = 'source-chip-remove';
    rm.textContent = '✕';
    rm.title = `Rimuovi "${key}"`;
    rm.onclick = () => removeSource(key);
    chip.appendChild(rm);
    wrap.appendChild(chip);
  }
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
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
      const idx = node.__files__.findIndex(f => f.fullPath === fullPath);
      if (idx !== -1) { node.__files__.splice(idx, 1); return true; }
    }
    for (const k of Object.keys(node).filter(k => k !== '__files__')) {
      if (remove(node[k])) return true;
    }
    return false;
  }
  for (const root of Object.keys(fileTree)) remove(fileTree[root]);

  function pruneEmpty(node) {
    for (const k of Object.keys(node).filter(k => k !== '__files__')) {
      pruneEmpty(node[k]);
      const sub = node[k];
      const hasFiles = (sub.__files__ || []).length > 0;
      const hasSubs  = Object.keys(sub).filter(k => k !== '__files__').length > 0;
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

// ── GLOBAL ACTIONS ──
function ricalcola() {
  function recalc(node) {
    for (const f of (node.__files__ || [])) f.lines = countLines(f.content);
    for (const k of Object.keys(node).filter(k => k !== '__files__')) recalc(node[k]);
  }
  for (const root of Object.keys(fileTree)) recalc(fileTree[root]);
  renderTree();
  updateStats();
  showToast('↺ Ricalcolato');
}

function rimuoviTutti() {
  if (!Object.keys(fileTree).length) return;
  if (!confirm('Rimuovere tutti i file caricati?')) return;
  fileTree = {};
  renderSources();
  renderTree();
  updateStats();
}

function espandiTutti() {
  document.querySelectorAll('.folder-children').forEach(el => el.classList.add('open'));
  document.querySelectorAll('.folder-arrow').forEach(el => el.classList.add('open'));
}

function comprimiTutti() {
  document.querySelectorAll('.folder-children').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.folder-arrow').forEach(el => el.classList.remove('open'));
}

// ── ICONS ──
function getIcon(n) {
  const ext = n.split('.').pop().toLowerCase();
  const map = {
    js:'◈', jsx:'⚛', ts:'◆', tsx:'⚛', mjs:'◈', cjs:'◈',
    py:'🐍', java:'☕', cpp:'⚙', c:'⚙', h:'⚙', hpp:'⚙',
    cs:'◆', go:'◈', rs:'◈', swift:'◈', kt:'◈', rb:'◆',
    html:'◉', htm:'◉', css:'◎', scss:'◎', sass:'◎', less:'◎',
    vue:'▲', svelte:'▲', astro:'▲',
    json:'{}', xml:'</>', yaml:'—', yml:'—', toml:'—',
    md:'≡', txt:'≡', markdown:'≡',
    sh:'$', bash:'$', zsh:'$', ps1:'$', bat:'$',
    sql:'▦', graphql:'◈', gql:'◈', php:'◈'
  };
  return map[ext] || '◦';
}

// ── UTILITIES ──
function formatBytes(b) {
  if (!b) return '0 B';
  const k = 1024, s = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return (b / Math.pow(k, i)).toFixed(i ? 1 : 0) + ' ' + s[i];
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

function showLoading() {
  document.getElementById('fileTree').innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <div style="font-size:12px;font-family:var(--mono);color:var(--dim)">Caricamento...</div>
    </div>`;
}

// ── LISTENERS ──
escludiVuote.addEventListener('change', ricalcola);
escludiCommenti.addEventListener('change', ricalcola);
soloCodice.addEventListener('change', ricalcola);
searchFilter.addEventListener('input', renderTree);

console.log('{ lines } v2 ready ✓');