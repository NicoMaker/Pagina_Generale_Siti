// Funzionalità navigazione
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Chiudi menu mobile quando si clicca su un link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Chiudi menu mobile quando si clicca fuori
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Scorrimento fluido alla sezione strumenti
function scrollToTools() {
    document.getElementById('tools').scrollIntoView({
        behavior: 'smooth'
    });
}

// Rilevamento sezione attiva durante lo scroll
function updateActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === currentSection) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveSection);
document.addEventListener('DOMContentLoaded', updateActiveSection);

// Contatore Testo con Aggiornamenti Live
const textInput = document.getElementById('textInput');
const wordCountEl = document.getElementById('wordCount');
const sentenceCountEl = document.getElementById('sentenceCount');
const charCountEl = document.getElementById('charCount');

if (textInput) {
    textInput.addEventListener('input', () => {
        const text = textInput.value;
        const wordCount = text.trim() === '' ? 0 : (text.match(/\b\w+\b/g) || []).length;
        const sentenceCount = (text.match(/[.!?]+/g) || []).length;
        const charCount = text.length;

        animateNumber(wordCountEl, parseInt(wordCountEl.textContent), wordCount);
        animateNumber(sentenceCountEl, parseInt(sentenceCountEl.textContent), sentenceCount);
        animateNumber(charCountEl, parseInt(charCountEl.textContent), charCount);
    });
}

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

// Funzione Rimuovi Duplicati
function removeDuplicates() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="loading"></div> Elaborando...';
    btn.disabled = true;

    setTimeout(() => {
        const text = document.getElementById('dupInput').value;
        if (!text.trim()) {
            document.getElementById('dupResult').textContent = 'Inserisci del testo prima.';
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }

        const words = text.split(/\s+/);
        const seen = new Set();
        const unique = words.filter(word => {
            const lowerWord = word.toLowerCase();
            if (seen.has(lowerWord)) return false;
            seen.add(lowerWord);
            return true;
        });

        const result = unique.join(' ');
        const removedCount = words.length - unique.length;

        document.getElementById('dupResult').innerHTML =
            `<strong>Rimosse ${removedCount} parole duplicate:</strong><br><br>${result}`;

        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 800);
}

// Analizzatore Grammaticale
function analyzeGrammar() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="loading"></div> Analizzando...';
    btn.disabled = true;

    setTimeout(() => {
        const text = document.getElementById('posInput').value;
        if (!text.trim()) {
            document.getElementById('posResult').textContent = 'Inserisci del testo prima.';
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }

        const words = text.split(/\s+/).map(w => w.toLowerCase().replace(/[^\w]/g, ''));
        const analysis = words.map(word => {
            if (word.match(/are$/)) return `<span style="color: #10b981; font-weight: 600;">${word}</span> <small>(verbo-are)</small>`;
            if (word.match(/ere$/)) return `<span style="color: #10b981; font-weight: 600;">${word}</span> <small>(verbo-ere)</small>`;
            if (word.match(/ire$/)) return `<span style="color: #10b981; font-weight: 600;">${word}</span> <small>(verbo-ire)</small>`;
            if (word.match(/mente$/)) return `<span style="color: #f59e0b; font-weight: 600;">${word}</span> <small>(avverbio)</small>`;
            if (word.match(/^(il|la|lo|gli|le|un|una|uno)$/)) return `<span style="color: #ec4899; font-weight: 600;">${word}</span> <small>(articolo)</small>`;
            if (word.match(/^(e|o|ma|però|quindi)$/)) return `<span style="color: #8b5cf6; font-weight: 600;">${word}</span> <small>(congiunzione)</small>`;
            if (word.match(/i$/)) return `<span style="color: #06b6d4; font-weight: 600;">${word}</span> <small>(nome-plurale)</small>`;
            return `<span style="color: #06b6d4; font-weight: 600;">${word}</span> <small>(nome)</small>`;
        });

        document.getElementById('posResult').innerHTML = analysis.join(' ');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 1000);
}

// Trova Sinonimi
function findSynonyms() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="loading"></div> Cercando...';
    btn.disabled = true;

    setTimeout(() => {
        const word = document.getElementById('synInput').value.toLowerCase().trim();
        if (!word) {
            document.getElementById('synResult').textContent = 'Inserisci una parola prima.';
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }

        const synonyms = {
            felice: ['gioioso', 'allegro', 'contento', 'lieto', 'sereno'],
            triste: ['infelice', 'malinconico', 'afflitto', 'sconsolato', 'mesto'],
            grande: ['enorme', 'immenso', 'gigantesco', 'vasto', 'colossale'],
            piccolo: ['minuscolo', 'tiny', 'minimo', 'ridotto', 'compatto'],
            veloce: ['rapido', 'celere', 'fulmineo', 'sprint', 'svelto'],
            lento: ['pigro', 'tardivo', 'graduale', 'flemmatico', 'ritardato'],
            buono: ['eccellente', 'ottimo', 'fantastico', 'splendido', 'magnifico'],
            cattivo: ['terribile', 'orribile', 'pessimo', 'spaventoso', 'malvagio'],
            bello: ['magnifico', 'stupendo', 'incantevole', 'attraente', 'grazioso'],
            brutto: ['orrendo', 'sgradevole', 'ripugnante', 'disgustoso', 'orribile']
        };

        const result = synonyms[word];
        if (result) {
            document.getElementById('synResult').innerHTML =
                `<strong>Sinonimi per "${word}":</strong><br><br><span style="color: #10b981; font-weight: 600;">${result.join(', ')}</span>`;
        } else {
            document.getElementById('synResult').innerHTML =
                `<span style="color: #f59e0b;">Nessun sinonimo trovato per "${word}". Prova parole come: felice, triste, grande, piccolo, veloce, lento, buono, cattivo, bello, brutto</span>`;
        }

        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 600);
}

// Generatore Scioglilingua
function generateTongueTwister() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="loading"></div> Generando...';
    btn.disabled = true;

    setTimeout(() => {
        const twisters = [
            'Trentatré trentini entrarono a Trento, tutti e trentatré trotterellando.',
            'Apelle figlio di Apollo fece una palla di pelle di pollo.',
            'Sopra la panca la capra campa, sotto la panca la capra crepa.',
            'Se l\'arcivescovo di Costantinopoli si disarcivescoviscostantinopolizzasse, vi disarcivescoviscostantinopolizzereste voi?',
            'Il cuoco cuoce in cucina e la cuoca cuoce in cucina il cuoco.',
            'Chi ama chiama, chi è chiamato ama.',
            'Tre tigri contro tre tigri.',
            'Figlia, sfoglia la foglia, sfoglia la foglia, figlia.',
            'Sotto le frasche del capanno quattro gatti grossi stanno.',
            'Al pozzo dei pazzi una pazza lavava le pezze.'
        ];

        const randomTwister = twisters[Math.floor(Math.random() * twisters.length)];
        document.getElementById('twisterResult').innerHTML =
            `<span style="color: #f59e0b; font-weight: 600; font-size: 1.1rem;">"${randomTwister}"</span><br><br><small style="color: #64748b;">Prova a dirlo tre volte velocemente! 🗣️</small>`;

        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 500);
}

// Generatore Parole
function generateWord() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="loading"></div> Creando...';
    btn.disabled = true;

    setTimeout(() => {
        const prefixes = ['blin', 'glow', 'spark', 'whim', 'flux', 'zeph', 'quib', 'snaz', 'glim', 'friz'];
        const middles = ['mer', 'tic', 'ble', 'zle', 'ple', 'dle', 'gle', 'kle', 'fle', 'tle'];
        const suffixes = ['ton', 'ify', 'ous', 'ing', 'ery', 'ism', 'ity', 'ful', 'ish', 'ize'];

        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const middle = middles[Math.floor(Math.random() * middles.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

        const newWord = prefix + middle + suffix;
        const definition = generateDefinition();

        document.getElementById('inventedWord').innerHTML =
            `<span style="color: #06b6d4; font-weight: 700; font-size: 1.8rem;">${newWord}</span><br><br>
             <small style="color: #94a3b8; font-style: italic;">${definition}</small><br><br>
             <small style="color: #64748b;">✨ Parola completamente inventata!</small>`;

        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 400);
}

function generateDefinition() {
    const adjectives = ['misterioso', 'scintillante', 'bizzarro', 'incantato', 'peculiare', 'delizioso'];
    const nouns = ['sentimento', 'oggetto', 'fenomeno', 'esperienza', 'stato', 'qualità'];
    const verbs = ['descrive', 'rappresenta', 'incarna', 'cattura', 'esprime', 'significa'];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];

    return `Un ${adj} ${noun} che ${verb} qualcosa di indescrivibile.`;
}

// Test Velocità Scrittura - AGGIORNATO PER 60 SECONDI
let typingTimer = null;
let typingCounter = 0;
let typingInterval = null;

function startTypingTest() {
    const input = document.getElementById('speedInput');
    const btn = event.target;
    const timeDisplay = document.getElementById('timeDisplay');
    const wordDisplay = document.getElementById('wordDisplay');
    const charDisplay = document.getElementById('charDisplay');

    // Reset tutto
    input.disabled = false;
    input.value = '';
    input.focus();
    typingCounter = 0;

    // Aggiorna stato pulsante
    btn.innerHTML = '<span>⏱️ Test in Corso... (60s)</span>';
    btn.disabled = true;

    // Avvia il timer
    typingInterval = setInterval(() => {
        typingCounter++;
        timeDisplay.textContent = typingCounter;

        // Aggiorna statistiche live
        const words = input.value.trim() === '' ? 0 : (input.value.match(/\b\w+\b/g) || []).length;
        const chars = input.value.length;
        wordDisplay.textContent = words;
        charDisplay.textContent = chars;
    }, 1000);

    // Imposta durata test (60 secondi)
    if (typingTimer) clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        // Ferma il test
        input.disabled = true;
        clearInterval(typingInterval);

        const finalWords = input.value.trim() === '' ? 0 : (input.value.match(/\b\w+\b/g) || []).length;
        const finalChars = input.value.length;
        const wpm = Math.round(finalWords); // WPM per 60 secondi

        // Aggiorna display finale
        timeDisplay.textContent = '60';
        wordDisplay.textContent = finalWords;
        charDisplay.textContent = finalChars;

        // Mostra modal risultati
        setTimeout(() => {
            showResultsModal(finalWords, wpm, finalChars);
        }, 500);

        // Reset pulsante
        btn.innerHTML = '<span>Inizia Test</span>';
        btn.disabled = false;
    }, 60000); // 60 secondi
}

// Funzione per mostrare il modal dei risultati
function showResultsModal(words, wpm, chars) {
    const modal = document.getElementById('resultsModal');
    const modalWords = document.getElementById('modalWords');
    const modalWPM = document.getElementById('modalWPM');
    const modalChars = document.getElementById('modalChars');
    const performanceBadge = document.getElementById('performanceBadge');
    const performanceText = document.getElementById('performanceText');

    // Aggiorna i valori nel modal
    modalWords.textContent = words;
    modalWPM.textContent = wpm;
    modalChars.textContent = chars;

    // Determina il livello di performance
    let performance = '';
    let badgeClass = '';

    if (wpm >= 60) {
        performance = 'Straordinario! 🏆';
        badgeClass = 'excellent';
    } else if (wpm >= 45) {
        performance = 'Eccellente! 🌟';
        badgeClass = 'great';
    } else if (wpm >= 30) {
        performance = 'Ottimo lavoro! 🎉';
        badgeClass = 'good';
    } else if (wpm >= 20) {
        performance = 'Buon lavoro! 👍';
        badgeClass = 'fair';
    } else {
        performance = 'Continua a praticare! 💪';
        badgeClass = 'practice';
    }

    performanceText.textContent = performance;
    performanceBadge.className = `performance-badge ${badgeClass}`;

    // Mostra il modal
    modal.style.display = 'block';

    // Aggiungi animazione di entrata
    setTimeout(() => {
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
        modal.querySelector('.modal-content').style.opacity = '1';
    }, 10);
}

// Funzione per chiudere il modal
function closeModal() {
    const modal = document.getElementById('resultsModal');
    modal.style.display = 'none';
}

// Chiudi modal cliccando fuori
window.onclick = function (event) {
    const modal = document.getElementById('resultsModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Chiudi modal con ESC
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Intersection observer per animazioni
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Osserva tutte le card degli strumenti
document.addEventListener('DOMContentLoaded', () => {
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        observer.observe(card);
    });
});

// Effetti hover interattivi
document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Effetto scroll navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(15, 23, 42, 0.95)';
    } else {
        navbar.style.background = 'rgba(15, 23, 42, 0.8)';
    }
});