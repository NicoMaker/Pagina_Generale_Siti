// Estensioni dei file di codice
const EXTENSIONS_CODICE = new Set([
    'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs',
    'py', 'rb', 'php', 'java', 'kt', 'kts', 'scala',
    'c', 'cpp', 'h', 'hpp', 'cc', 'cxx',
    'cs', 'fs', 'fsx',
    'go', 'rs', 'swift', 'm', 'mm',
    'html', 'htm', 'css', 'scss', 'sass', 'less',
    'vue', 'svelte', 'astro',
    'json', 'yaml', 'yml', 'xml', 'toml',
    'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat',
    'sql', 'graphql', 'gql',
    'md', 'markdown', 'txt'
]);

let fileTree = {}; // Struttura ad albero dei file
let totalStats = {
    files: 0,
    lines: 0,
    size: 0
};

// DOM elementi
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const folderInput = document.getElementById('folderInput');
const escludiVuote = document.getElementById('escludiVuote');
const escludiCommenti = document.getElementById('escludiCommenti');
const soloCodice = document.getElementById('soloCodice');
const searchFilter = document.getElementById('searchFilter');

// Eventi drag & drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', async (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const items = e.dataTransfer.items;
    const files = [];
    
    for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) {
            const allFiles = await getAllFilesFromEntry(entry);
            files.push(...allFiles);
        }
    }
    
    if (files.length > 0) {
        processFiles(files);
    }
});

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
    fileInput.value = '';
});

folderInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
    folderInput.value = '';
});

// Legge ricorsivamente tutti i file da una directory
async function getAllFilesFromEntry(entry, path = '') {
    const files = [];
    
    if (entry.isFile) {
        const file = await new Promise((resolve) => {
            entry.file(resolve);
        });
        file.relativePath = path ? `${path}/${entry.name}` : entry.name;
        files.push(file);
    } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const entries = await new Promise((resolve) => {
            reader.readEntries(resolve);
        });
        
        for (const subEntry of entries) {
            const subPath = path ? `${path}/${entry.name}` : entry.name;
            const subFiles = await getAllFilesFromEntry(subEntry, subPath);
            files.push(...subFiles);
        }
    }
    
    return files;
}

// Processa i file selezionati
async function processFiles(files) {
    showLoading();
    
    const newFileTree = {};
    let processedCount = 0;
    
    for (const file of files) {
        const pathParts = file.relativePath ? file.relativePath.split('/') : [file.name];
        const fileName = pathParts.pop();
        const folderPath = pathParts.join('/');
        
        // Filtra per estensione se necessario
        const ext = fileName.split('.').pop().toLowerCase();
        if (soloCodice.checked && !EXTENSIONS_CODICE.has(ext)) {
            continue;
        }
        
        const content = await readFileContent(file);
        const lines = countLines(content);
        const size = file.size;
        
        addFileToTree(newFileTree, folderPath, fileName, {
            name: fileName,
            path: folderPath,
            lines: lines,
            size: size,
            content: content,
            fullPath: file.relativePath || file.name
        });
        
        processedCount++;
        if (processedCount % 10 === 0) {
            await delay(0); // Permette all'UI di aggiornarsi
        }
    }
    
    fileTree = newFileTree;
    updateFileTree();
    calculateTotalStats();
    hideLoading();
}

// Legge il contenuto del file
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file, 'UTF-8');
    });
}

// Conta le righe di un file
function countLines(content) {
    const excludeEmpty = escludiVuote.checked;
    const excludeComments = escludiCommenti.checked;
    
    const lines = content.split('\n');
    let validLines = 0;
    let inMultilineComment = false;
    
    for (let line of lines) {
        const trimmedLine = line.trim();
        
        if (excludeComments) {
            if (trimmedLine.includes('/*') && !trimmedLine.includes('*/')) {
                inMultilineComment = true;
                continue;
            }
            if (trimmedLine.includes('*/')) {
                inMultilineComment = false;
                continue;
            }
            if (inMultilineComment) continue;
        }
        
        if (excludeEmpty && trimmedLine === '') continue;
        
        if (excludeComments) {
            if (trimmedLine.startsWith('//') || 
                trimmedLine.startsWith('#') ||
                trimmedLine.startsWith('--') ||
                trimmedLine.startsWith('%') ||
                trimmedLine.startsWith('<!--')) {
                continue;
            }
        }
        
        validLines++;
    }
    
    return validLines;
}

// Aggiunge un file alla struttura ad albero
function addFileToTree(tree, folderPath, fileName, fileData) {
    if (!folderPath || folderPath === '') {
        if (!tree['__files__']) tree['__files__'] = [];
        tree['__files__'].push(fileData);
        return;
    }
    
    const parts = folderPath.split('/');
    let current = tree;
    
    for (const part of parts) {
        if (!current[part]) {
            current[part] = {
                '__files__': [],
                '__stats__': { files: 0, lines: 0, size: 0 }
            };
        }
        current = current[part];
    }
    
    if (!current['__files__']) current['__files__'] = [];
    current['__files__'].push(fileData);
}

// Aggiorna la visualizzazione ad albero
function updateFileTree() {
    const container = document.getElementById('fileTree');
    container.innerHTML = '';
    
    if (Object.keys(fileTree).length === 0) {
        container.innerHTML = '<div class="empty-message">📂 Nessun file selezionato<br>Seleziona uno o più file o un\'intera cartella per iniziare</div>';
        return;
    }
    
    const treeElement = createTreeElement(fileTree, '');
    container.appendChild(treeElement);
}

// Crea l'elemento dell'albero
function createTreeElement(node, path) {
    const div = document.createElement('div');
    div.className = 'tree-node';
    
    const folders = Object.keys(node).filter(k => k !== '__files__' && k !== '__stats__');
    const files = node['__files__'] || [];
    
    // Calcola statistiche della cartella
    const stats = calculateNodeStats(node);
    
    // Crea header per la cartella se ci sono sottocartelle o file
    if (folders.length > 0 || files.length > 0) {
        const header = document.createElement('div');
        header.className = 'tree-node-header';
        
        const toggle = document.createElement('span');
        toggle.className = 'tree-node-toggle';
        toggle.textContent = '📂';
        toggle.style.cursor = 'pointer';
        
        const icon = document.createElement('span');
        icon.className = 'tree-node-icon';
        icon.textContent = path === '' ? '📁' : '📁';
        
        const name = document.createElement('span');
        name.className = 'tree-node-name';
        name.textContent = path === '' ? '📁 Radice' : path.split('/').pop();
        
        const statsSpan = document.createElement('span');
        statsSpan.className = 'tree-node-stats';
        statsSpan.textContent = `${stats.files} file, ${stats.lines.toLocaleString()} righe`;
        
        header.appendChild(toggle);
        header.appendChild(icon);
        header.appendChild(name);
        header.appendChild(statsSpan);
        
        const childrenDiv = document.createElement('div');
        childrenDiv.className = 'tree-node-children';
        
        // Aggiungi sottocartelle
        for (const folder of folders) {
            const subPath = path ? `${path}/${folder}` : folder;
            const childElement = createTreeElement(node[folder], subPath);
            childrenDiv.appendChild(childElement);
        }
        
        // Aggiungi file
        for (const file of files) {
            if (matchesFilter(file.name)) {
                const fileElement = createFileElement(file);
                childrenDiv.appendChild(fileElement);
            }
        }
        
        header.onclick = (e) => {
            e.stopPropagation();
            const isOpen = childrenDiv.classList.contains('open');
            if (isOpen) {
                childrenDiv.classList.remove('open');
                toggle.textContent = '📁';
            } else {
                childrenDiv.classList.add('open');
                toggle.textContent = '📂';
            }
        };
        
        div.appendChild(header);
        div.appendChild(childrenDiv);
        
        // Apri la root di default
        if (path === '') {
            childrenDiv.classList.add('open');
            toggle.textContent = '📂';
        }
    }
    
    return div;
}

// Calcola statistiche di un nodo
function calculateNodeStats(node) {
    let files = 0;
    let lines = 0;
    let size = 0;
    
    const fileList = node['__files__'] || [];
    for (const file of fileList) {
        files++;
        lines += file.lines;
        size += file.size;
    }
    
    const folders = Object.keys(node).filter(k => k !== '__files__' && k !== '__stats__');
    for (const folder of folders) {
        const subStats = calculateNodeStats(node[folder]);
        files += subStats.files;
        lines += subStats.lines;
        size += subStats.size;
    }
    
    return { files, lines, size };
}

// Crea elemento per un file
function createFileElement(file) {
    const div = document.createElement('div');
    div.className = 'file-item';
    
    const icon = getFileIcon(file.name);
    
    const iconSpan = document.createElement('span');
    iconSpan.className = 'file-icon';
    iconSpan.textContent = icon;
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'file-name';
    nameSpan.textContent = file.name;
    nameSpan.title = file.fullPath;
    
    const linesSpan = document.createElement('span');
    linesSpan.className = 'file-lines';
    let linesClass = 'normal';
    if (file.lines > 1000) linesClass = 'high';
    else if (file.lines > 500) linesClass = 'medium';
    else if (file.lines > 100) linesClass = 'low';
    linesSpan.className = `file-lines ${linesClass}`;
    linesSpan.textContent = `${file.lines.toLocaleString()} righe`;
    
    const removeSpan = document.createElement('span');
    removeSpan.className = 'file-remove';
    removeSpan.textContent = '✖';
    removeSpan.onclick = (e) => {
        e.stopPropagation();
        removeFile(file.fullPath);
    };
    
    div.appendChild(iconSpan);
    div.appendChild(nameSpan);
    div.appendChild(linesSpan);
    div.appendChild(removeSpan);
    
    return div;
}

// Ottieni icona per tipo di file
function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
        js: '📜', jsx: '⚛️', ts: '🔷', tsx: '⚛️',
        py: '🐍', java: '☕', cpp: '⚙️', c: '🔧',
        html: '🌐', css: '🎨', scss: '🎨',
        json: '📦', xml: '📋', yaml: '📝', yml: '📝',
        md: '📖', txt: '📄', php: '🐘', rb: '💎',
        go: '🐹', rs: '🦀', swift: '🐦', kt: '🎯',
        sql: '🗄️', sh: '🐚', vue: '🖖'
    };
    return icons[ext] || '📄';
}

// Filtra i file
function matchesFilter(fileName) {
    const filter = searchFilter.value.toLowerCase();
    if (!filter) return true;
    return fileName.toLowerCase().includes(filter);
}

// Calcola statistiche totali
function calculateTotalStats() {
    totalStats = { files: 0, lines: 0, size: 0 };
    
    function calculate(node) {
        const files = node['__files__'] || [];
        for (const file of files) {
            totalStats.files++;
            totalStats.lines += file.lines;
            totalStats.size += file.size;
        }
        
        const folders = Object.keys(node).filter(k => k !== '__files__' && k !== '__stats__');
        for (const folder of folders) {
            calculate(node[folder]);
        }
    }
    
    calculate(fileTree);
    
    // Aggiorna UI
    document.getElementById('totalFiles').textContent = totalStats.files;
    document.getElementById('totalLines').textContent = totalStats.lines.toLocaleString();
    document.getElementById('avgLines').textContent = totalStats.files > 0 ? 
        Math.round(totalStats.lines / totalStats.files).toLocaleString() : 0;
    document.getElementById('totalSize').textContent = formatBytes(totalStats.size);
    document.getElementById('stats').style.display = 'grid';
    
    // Aggiorna titolo
    document.title = `📊 ${totalStats.lines.toLocaleString()} righe - Contatore Righe`;
}

// Rimuovi un file
function removeFile(filePath) {
    function removeFromTree(node, pathParts) {
        if (pathParts.length === 1) {
            const files = node['__files__'] || [];
            const index = files.findIndex(f => f.fullPath === filePath);
            if (index !== -1) files.splice(index, 1);
            return true;
        }
        
        const folder = pathParts[0];
        if (node[folder]) {
            removeFromTree(node[folder], pathParts.slice(1));
            // Se la cartella è vuota, rimuovila
            const remainingFiles = node[folder]['__files__'] || [];
            const remainingFolders = Object.keys(node[folder]).filter(k => k !== '__files__' && k !== '__stats__');
            if (remainingFiles.length === 0 && remainingFolders.length === 0) {
                delete node[folder];
            }
        }
        return true;
    }
    
    const pathParts = filePath.split('/');
    const fileName = pathParts.pop();
    const folderPath = pathParts.join('/');
    
    if (folderPath) {
        const parts = folderPath.split('/');
        removeFromTree(fileTree, parts);
    } else {
        const files = fileTree['__files__'] || [];
        const index = files.findIndex(f => f.name === fileName);
        if (index !== -1) files.splice(index, 1);
    }
    
    updateFileTree();
    calculateTotalStats();
}

// Utility: formatta bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility: delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Mostra loading
function showLoading() {
    const container = document.getElementById('fileTree');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Caricamento file in corso...</p></div>';
}

function hideLoading() {
    // Il loading viene rimosso quando updateFileTree viene chiamato
}

// Funzioni globali
function ricalcola() {
    if (Object.keys(fileTree).length > 0) {
        // Ricostruisci l'albero ricalcolando le righe
        const newFileTree = {};
        
        function processNode(node) {
            const files = node['__files__'] || [];
            for (const file of files) {
                const newLines = countLines(file.content);
                file.lines = newLines;
            }
            
            const folders = Object.keys(node).filter(k => k !== '__files__' && k !== '__stats__');
            for (const folder of folders) {
                processNode(node[folder]);
            }
        }
        
        processNode(fileTree);
        updateFileTree();
        calculateTotalStats();
    }
}

function rimuoviTutti() {
    if (confirm(`Sei sicuro di voler rimuovere tutti i ${totalStats.files} file?`)) {
        fileTree = {};
        updateFileTree();
        calculateTotalStats();
        document.title = '📊 Contatore Righe di Codice';
    }
}

function espandiTutti() {
    document.querySelectorAll('.tree-node-children').forEach(el => {
        el.classList.add('open');
    });
    document.querySelectorAll('.tree-node-toggle').forEach(el => {
        el.textContent = '📂';
    });
}

function comprimiTutti() {
    document.querySelectorAll('.tree-node-children').forEach(el => {
        el.classList.remove('open');
    });
    document.querySelectorAll('.tree-node-toggle').forEach(el => {
        el.textContent = '📁';
    });
}

// Event listeners
escludiVuote.addEventListener('change', ricalcola);
escludiCommenti.addEventListener('change', ricalcola);
searchFilter.addEventListener('input', () => {
    updateFileTree();
});

console.log('App pronta! 🎉');