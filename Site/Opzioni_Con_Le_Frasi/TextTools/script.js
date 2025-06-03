const textInput = document.getElementById('textInput');
const textStats = document.getElementById('textStats');
textInput.addEventListener('input', () => {
    const text = textInput.value;
    const wordCount = (text.match(/\b\w+\b/g) || []).length;
    const sentenceCount = (text.match(/[.!?]/g) || []).length;
    const charCount = text.length;
    textStats.textContent = `Parole: ${wordCount} | Frasi: ${sentenceCount} | Caratteri: ${charCount}`;
});

function removeDuplicates() {
    const text = document.getElementById('dupInput').value;
    const words = text.split(/\s+/);
    const seen = new Set();
    const unique = words.filter(w => {
        const lw = w.toLowerCase();
        if (seen.has(lw)) return false;
        seen.add(lw);
        return true;
    });
    document.getElementById('dupResult').textContent = unique.join(' ');
}

function mockPOS() {
    const text = document.getElementById('posInput').value;
    const words = text.split(/\s+/).map(w => w.toLowerCase());
    const tags = words.map(w => {
        if (w.endsWith('are') || w.endsWith('ere') || w.endsWith('ire')) return `${w} (verbo)`;
        if (w.endsWith('o') || w.endsWith('a')) return `${w} (nome)`;
        if (w.endsWith('e')) return `${w} (aggettivo)`;
        return `${w} (?)`;
    });
    document.getElementById('posResult').innerHTML = tags.join(', ');
}

function suggestSynonym() {
    const word = document.getElementById('synInput').value.toLowerCase();
    const synonyms = {
        bello: 'carino',
        brutto: 'sgradevole',
        veloce: 'rapido',
        lento: 'pigro',
        grande: 'immenso',
        ciao: 'salve'
    };
    document.getElementById('synResult').textContent = synonyms[word] ? `Sinonimo: ${synonyms[word]}` : 'Nessun sinonimo trovato';
}

function generateTongueTwister() {
    const samples = [
        'Trentatré trentini entrarono a Trento...',
        'Apelle figlio di Apollo...',
        'Sopra la panca la capra campa...'
    ];
    const r = Math.floor(Math.random() * samples.length);
    document.getElementById('twisterResult').textContent = samples[r];
}

function generateWord() {
    const prefixes = ['tra', 'blin', 'gro', 'spi', 'zan'];
    const suffixes = ['dor', 'esto', 'vix', 'otto', 'mento'];
    const randomWord = prefixes[Math.floor(Math.random() * prefixes.length)] + suffixes[Math.floor(Math.random() * suffixes.length)];
    document.getElementById('inventedWord').textContent = `Parola: ${randomWord}`;
}

let timer = null;
let counter = 0;
function startTypingTest() {
    const input = document.getElementById('speedInput');
    const stats = document.getElementById('speedStats');
    input.disabled = false;
    input.value = '';
    input.focus();
    counter = 0;
    stats.textContent = 'Tempo: 0s';

    const interval = setInterval(() => {
        counter++;
        stats.textContent = `Tempo: ${counter}s`;
    }, 1000);

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
        input.disabled = true;
        clearInterval(interval);
        const words = (input.value.match(/\b\w+\b/g) || []).length;
        const chars = input.value.length;
        stats.textContent = `Tempo: ${counter}s | Hai scritto ${words} parole e ${chars} caratteri.`;
    }, 10000);
}