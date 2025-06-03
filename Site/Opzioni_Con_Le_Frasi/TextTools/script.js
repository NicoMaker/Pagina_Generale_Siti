// Text Counter with Live Updates
const textInput = document.getElementById('textInput');
const wordCountEl = document.getElementById('wordCount');
const sentenceCountEl = document.getElementById('sentenceCount');
const charCountEl = document.getElementById('charCount');

textInput.addEventListener('input', () => {
    const text = textInput.value;
    const wordCount = (text.match(/\b\w+\b/g) || []).length;
    const sentenceCount = (text.match(/[.!?]/g) || []).length;
    const charCount = text.length;

    // Animate numbers
    animateNumber(wordCountEl, parseInt(wordCountEl.textContent), wordCount);
    animateNumber(sentenceCountEl, parseInt(sentenceCountEl.textContent), sentenceCount);
    animateNumber(charCountEl, parseInt(charCountEl.textContent), charCount);
});

function animateNumber(element, from, to) {
    const duration = 300;
    const start = Date.now();
    const timer = setInterval(() => {
        const progress = (Date.now() - start) / duration;
        if (progress >= 1) {
            element.textContent = to;
            clearInterval(timer);
        } else {
            const current = Math.floor(from + (to - from) * progress);
            element.textContent = current;
        }
    }, 16);
}

function removeDuplicates() {
    const btn = event.target;
    btn.innerHTML = '<div class="loading"></div> Elaborando...';

    setTimeout(() => {
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
        btn.innerHTML = '<i class="fas fa-broom"></i> Pulisci Testo';
    }, 800);
}

function mockPOS() {
    const btn = event.target;
    btn.innerHTML = '<div class="loading"></div> Analizzando...';

    setTimeout(() => {
        const text = document.getElementById('posInput').value;
        const words = text.split(/\s+/).map(w => w.toLowerCase());
        const tags = words.map(w => {
            if (w.endsWith('are') || w.endsWith('ere') || w.endsWith('ire')) return `<span style="color: #43e97b; font-weight: 600;">${w}</span> <small>(verbo)</small>`;
            if (w.endsWith('o') || w.endsWith('a')) return `<span style="color: #4facfe; font-weight: 600;">${w}</span> <small>(nome)</small>`;
            if (w.endsWith('e')) return `<span style="color: #f093fb; font-weight: 600;">${w}</span> <small>(aggettivo)</small>`;
            return `<span style="color: #fee140; font-weight: 600;">${w}</span> <small>(?)</small>`;
        });

        document.getElementById('posResult').innerHTML = tags.join(', ');
        btn.innerHTML = '<i class="fas fa-search"></i> Analizza';
    }, 1000);
}

function suggestSynonym() {
    const btn = event.target;
    btn.innerHTML = '<div class="loading"></div> Cercando...';

    setTimeout(() => {
        const word = document.getElementById('synInput').value.toLowerCase();
        const synonyms = {
            bello: ['carino', 'grazioso', 'attraente', 'incantevole'],
            brutto: ['sgradevole', 'orribile', 'disgustoso'],
            veloce: ['rapido', 'celere', 'fulmineo', 'sprint'],
            lento: ['pigro', 'tardivo', 'lentissimo'],
            grande: ['immenso', 'enorme', 'gigantesco', 'colossale'],
            ciao: ['salve', 'buongiorno', 'arrivederci']
        };

        const result = synonyms[word];
        if (result) {
            document.getElementById('synResult').innerHTML =
                `<strong>Sinonimi per "${word}":</strong><br><span style="color: #43e97b;">${result.join(', ')}</span>`;
        } else {
            document.getElementById('synResult').innerHTML =
                `<span style="color: #f093fb;">Nessun sinonimo trovato per "${word}"</span>`;
        }

        btn.innerHTML = '<i class="fas fa-lightbulb"></i> Trova Sinonimi';
    }, 600);
}

function generateTongueTwister() {
    const btn = event.target;
    btn.innerHTML = '<div class="loading"></div> Generando...';

    setTimeout(() => {
        const samples = [
            'Trentatré trentini entrarono a Trento, tutti e trentatré trotterellando.',
            'Apelle figlio di Apollo fece una palla di pelle di pollo.',
            'Sopra la panca la capra campa, sotto la panca la capra crepa.',
            'Se l\'arcivescovo di Costantinopoli si disarcivescoviscostantinopolizzasse, vi disarcivescoviscostantinopolizzereste voi?',
            'Il cuoco cuoce in cucina e la cuoca cuoce in cucina il cuoco.',
        ];

        const random = Math.floor(Math.random() * samples.length);
        document.getElementById('twisterResult').innerHTML =
            `<span style="color: #fee140; font-weight: 600; font-size: 1.1rem;">"${samples[random]}"</span>`;

        btn.innerHTML = '<i class="fas fa-random"></i> Genera Scioglilingua';
    }, 500);
}

function generateWord() {
    const btn = event.target;
    btn.innerHTML = '<div class="loading"></div> Creando...';

    setTimeout(() => {
        const prefixes = ['tra', 'blin', 'gro', 'spi', 'zan', 'fro', 'blu', 'cri', 'dro', 'gli'];
        const suffixes = ['dor', 'esto', 'vix', 'otto', 'mento', 'azio', 'ello', 'ino', 'etto', 'oso'];
        const randomWord = prefixes[Math.floor(Math.random() * prefixes.length)] +
            suffixes[Math.floor(Math.random() * suffixes.length)];

        document.getElementById('inventedWord').innerHTML =
            `<span style="color: #4facfe; font-weight: 700; font-size: 1.5rem;">${randomWord}</span><br>
                     <small style="color: #94a3b8;">Parola completamente inventata!</small>`;

        btn.innerHTML = '<i class="fas fa-plus-circle"></i> Crea Parola';
    }, 400);
}

let timer = null;
let counter = 0;
let interval = null;

function startTypingTest() {
    const input = document.getElementById('speedInput');
    const btn = event.target;
    const timeDisplay = document.getElementById('timeDisplay');
    const wordDisplay = document.getElementById('wordDisplay');
    const charDisplay = document.getElementById('charDisplay');

    // Reset
    input.disabled = false;
    input.value = '';
    input.focus();
    counter = 0;

    // Update button
    btn.innerHTML = '<i class="fas fa-clock"></i> Test in corso...';
    btn.disabled = true;

    // Start timer
    interval = setInterval(() => {
        counter++;
        timeDisplay.textContent = counter;

        // Live updates during test
        const words = (input.value.match(/\b\w+\b/g) || []).length;
        const chars = input.value.length;
        wordDisplay.textContent = words;
        charDisplay.textContent = chars;
    }, 1000);

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
        input.disabled = true;
        clearInterval(interval);

        const words = (input.value.match(/\b\w+\b/g) || []).length;
        const chars = input.value.length;
        const wpm = Math.round((words / 10) * 60);

        // Final results with celebration
        timeDisplay.textContent = '10';
        wordDisplay.textContent = words;
        charDisplay.textContent = chars;

        // Show results
        setTimeout(() => {
            alert(`🎉 Test completato!\n\nRisultati:\n• ${words} parole scritte\n• ${chars} caratteri totali\n• ${wpm} parole al minuto\n\nOttimo lavoro!`);
        }, 500);

        btn.innerHTML = '<i class="fas fa-play"></i> Inizia Test';
        btn.disabled = false;
    }, 10000);
}

// Add some interactive effects
document.querySelectorAll('.tool').forEach(tool => {
    tool.addEventListener('mouseenter', () => {
        tool.style.transform = 'translateY(-8px) scale(1.02)';
    });

    tool.addEventListener('mouseleave', () => {
        tool.style.transform = 'translateY(0) scale(1)';
    });
});

// Add loading animation to page
window.addEventListener('load', () => {
    document.body.style.animation = 'fadeIn 1s ease-out';
});