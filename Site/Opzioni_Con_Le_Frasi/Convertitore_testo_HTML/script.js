
function convertiTesto() {
    const input = document.getElementById('inputArea').value;
    const outputElement = document.getElementById('risultatoTesto');
    const copyBtn = document.querySelector('.copy-btn');

    const tipoConversione = document.querySelector('input[name="conversionType"]:checked').value;
    let risultato = '';

    if (!input.trim()) {
        outputElement.textContent = "⚠️ Per favore, inserisci un testo o codice per iniziare.";
        copyBtn.style.display = 'none';
        return;
    }

    if (tipoConversione === 'toHtml') {
        // CONVERSIONE COMPLETA: Testo → HTML
        risultato = testoToHtml(input);
    } else if (tipoConversione === 'toText') {
        // CONVERSIONE COMPLETA: HTML → Testo
        risultato = htmlToTesto(input);
    }

    outputElement.textContent = risultato;
    copyBtn.style.display = 'block';
}

function testoToHtml(testo) {
    // Codifica caratteri speciali
    let html = testo
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // Gestisce titoli (# per Markdown-style)
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // Gestisce grassetto **testo**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Gestisce corsivo *testo*
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Gestisce link [testo](url)
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

    // Gestisce liste
    const linee = html.split('\n');
    let inLista = false;
    let risultato = [];

    for (let i = 0; i < linee.length; i++) {
        const linea = linee[i];

        // Lista puntata
        if (linea.trim().match(/^[-*]\s+(.+)/)) {
            if (!inLista) {
                risultato.push('<ul>');
                inLista = true;
            }
            risultato.push('  <li>' + linea.trim().replace(/^[-*]\s+/, '') + '</li>');
        }
        // Lista numerata
        else if (linea.trim().match(/^\d+\.\s+(.+)/)) {
            if (!inLista) {
                risultato.push('<ol>');
                inLista = true;
            }
            risultato.push('  <li>' + linea.trim().replace(/^\d+\.\s+/, '') + '</li>');
        } else {
            if (inLista) {
                risultato.push('</ul>');
                inLista = false;
            }

            // Paragrafi normali
            if (linea.trim() && !linea.match(/<h[1-6]>/)) {
                risultato.push('<p>' + linea + '</p>');
            } else if (linea.match(/<h[1-6]>/)) {
                risultato.push(linea);
            } else if (linea.trim() === '') {
                risultato.push('<br>');
            }
        }
    }

    if (inLista) {
        risultato.push('</ul>');
    }

    return risultato.join('\n');
}

function htmlToTesto(html) {
    // Gestisce titoli HTML
    html = html.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
    html = html.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
    html = html.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
    html = html.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n');
    html = html.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n##### $1\n');
    html = html.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n###### $1\n');

    // Gestisce grassetto
    html = html.replace(/<(?:strong|b)[^>]*>(.*?)<\/(?:strong|b)>/gi, '**$1**');

    // Gestisce corsivo
    html = html.replace(/<(?:em|i)[^>]*>(.*?)<\/(?:em|i)>/gi, '*$1*');

    // Gestisce link
    html = html.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');

    // Gestisce liste
    html = html.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    html = html.replace(/<\/?(?:ul|ol)[^>]*>/gi, '\n');

    // Sostituisce tag di blocco con salti di riga
    html = html.replace(/<\s*(?:p|div|br)\s*\/?>/gi, '\n');

    // Rimuove tutti gli altri tag
    html = html.replace(/<[^>]*>/g, '');

    // Decodifica entità HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    let testo = tempDiv.textContent || tempDiv.innerText;

    // Pulisce righe multiple vuote
    testo = testo.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

    return testo;
}

function copiaRisultato() {
    const risultato = document.getElementById('risultatoTesto').textContent;

    navigator.clipboard.writeText(risultato).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.textContent;
        btn.textContent = '✅ Copiato!';
        btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        }, 2000);
    }).catch(err => {
        alert('Errore nella copia: ' + err);
    });
}

// Supporto per Enter
document.getElementById('inputArea').addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && event.ctrlKey) {
        convertiTesto();
    }
});