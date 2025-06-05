// Navigation functionality
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Smooth scroll to tools section
function scrollToTools() {
    document.getElementById('tools').scrollIntoView({
        behavior: 'smooth'
    });
}

// Text Counter with Live Updates
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

        // Animate numbers
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

// Remove Duplicates Function
function removeDuplicates() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="loading"></div> Processing...';
    btn.disabled = true;

    setTimeout(() => {
        const text = document.getElementById('dupInput').value;
        if (!text.trim()) {
            document.getElementById('dupResult').textContent = 'Please enter some text first.';
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
            `<strong>Removed ${removedCount} duplicate word(s):</strong><br><br>${result}`;

        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 800);
}

// Grammar Analyzer (Mock Implementation)
function analyzeGrammar() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="loading"></div> Analyzing...';
    btn.disabled = true;

    setTimeout(() => {
        const text = document.getElementById('posInput').value;
        if (!text.trim()) {
            document.getElementById('posResult').textContent = 'Please enter some text first.';
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }

        const words = text.split(/\s+/).map(w => w.toLowerCase().replace(/[^\w]/g, ''));
        const analysis = words.map(word => {
            // Simple mock analysis based on word patterns
            if (word.match(/ing$/)) return `<span style="color: #10b981; font-weight: 600;">${word}</span> <small>(verb-ing)</small>`;
            if (word.match(/ed$/)) return `<span style="color: #10b981; font-weight: 600;">${word}</span> <small>(verb-past)</small>`;
            if (word.match(/ly$/)) return `<span style="color: #f59e0b; font-weight: 600;">${word}</span> <small>(adverb)</small>`;
            if (word.match(/^(the|a|an)$/)) return `<span style="color: #ec4899; font-weight: 600;">${word}</span> <small>(article)</small>`;
            if (word.match(/^(and|or|but|so)$/)) return `<span style="color: #8b5cf6; font-weight: 600;">${word}</span> <small>(conjunction)</small>`;
            if (word.match(/s$/)) return `<span style="color: #06b6d4; font-weight: 600;">${word}</span> <small>(noun-plural)</small>`;
            return `<span style="color: #06b6d4; font-weight: 600;">${word}</span> <small>(noun)</small>`;
        });

        document.getElementById('posResult').innerHTML = analysis.join(' ');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 1000);
}

// Synonym Finder
function findSynonyms() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="loading"></div> Searching...';
    btn.disabled = true;

    setTimeout(() => {
        const word = document.getElementById('synInput').value.toLowerCase().trim();
        if (!word) {
            document.getElementById('synResult').textContent = 'Please enter a word first.';
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }

        const synonyms = {
            happy: ['joyful', 'cheerful', 'delighted', 'pleased', 'content'],
            sad: ['unhappy', 'sorrowful', 'melancholy', 'dejected', 'gloomy'],
            big: ['large', 'huge', 'enormous', 'massive', 'gigantic'],
            small: ['tiny', 'little', 'miniature', 'petite', 'compact'],
            fast: ['quick', 'rapid', 'swift', 'speedy', 'hasty'],
            slow: ['sluggish', 'leisurely', 'gradual', 'unhurried', 'delayed'],
            good: ['excellent', 'wonderful', 'great', 'fantastic', 'superb'],
            bad: ['terrible', 'awful', 'horrible', 'dreadful', 'poor'],
            beautiful: ['gorgeous', 'stunning', 'lovely', 'attractive', 'pretty'],
            ugly: ['hideous', 'unattractive', 'unsightly', 'repulsive', 'grotesque']
        };

        const result = synonyms[word];
        if (result) {
            document.getElementById('synResult').innerHTML =
                `<strong>Synonyms for "${word}":</strong><br><br><span style="color: #10b981; font-weight: 600;">${result.join(', ')}</span>`;
        } else {
            document.getElementById('synResult').innerHTML =
                `<span style="color: #f59e0b;">No synonyms found for "${word}". Try words like: happy, sad, big, small, fast, slow, good, bad, beautiful, ugly</span>`;
        }

        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 600);
}

// Tongue Twister Generator
function generateTongueTwister() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="loading"></div> Generating...';
    btn.disabled = true;

    setTimeout(() => {
        const twisters = [
            'Peter Piper picked a peck of pickled peppers.',
            'She sells seashells by the seashore.',
            'How much wood would a woodchuck chuck if a woodchuck could chuck wood?',
            'Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair.',
            'Red lorry, yellow lorry, red lorry, yellow lorry.',
            'Six sick slick slim sycamore saplings.',
            'A proper copper coffee pot.',
            'Which witch switched the Swiss wristwatches?',
            'Toy boat, toy boat, toy boat.',
            'Unique New York, unique New York, unique New York.'
        ];

        const randomTwister = twisters[Math.floor(Math.random() * twisters.length)];
        document.getElementById('twisterResult').innerHTML =
            `<span style="color: #f59e0b; font-weight: 600; font-size: 1.1rem;">"${randomTwister}"</span><br><br><small style="color: #64748b;">Try saying this three times fast! 🗣️</small>`;

        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 500);
}

// Word Generator
function generateWord() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="loading"></div> Creating...';
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
             <small style="color: #64748b;">✨ Completely invented word!</small>`;

        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 400);
}

function generateDefinition() {
    const adjectives = ['mysterious', 'sparkling', 'whimsical', 'enchanted', 'peculiar', 'delightful'];
    const nouns = ['feeling', 'object', 'phenomenon', 'experience', 'state', 'quality'];
    const verbs = ['describes', 'represents', 'embodies', 'captures', 'expresses', 'signifies'];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];

    return `A ${adj} ${noun} that ${verb} something indescribable.`;
}

// Typing Speed Test
let typingTimer = null;
let typingCounter = 0;
let typingInterval = null;

function startTypingTest() {
    const input = document.getElementById('speedInput');
    const btn = event.target;
    const timeDisplay = document.getElementById('timeDisplay');
    const wordDisplay = document.getElementById('wordDisplay');
    const charDisplay = document.getElementById('charDisplay');

    // Reset everything
    input.disabled = false;
    input.value = '';
    input.focus();
    typingCounter = 0;

    // Update button state
    btn.innerHTML = '<span>⏱️ Test in Progress...</span>';
    btn.disabled = true;

    // Start the timer
    typingInterval = setInterval(() => {
        typingCounter++;
        timeDisplay.textContent = typingCounter;

        // Update live stats
        const words = input.value.trim() === '' ? 0 : (input.value.match(/\b\w+\b/g) || []).length;
        const chars = input.value.length;
        wordDisplay.textContent = words;
        charDisplay.textContent = chars;
    }, 1000);

    // Set test duration (30 seconds)
    if (typingTimer) clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        // Stop the test
        input.disabled = true;
        clearInterval(typingInterval);

        const finalWords = input.value.trim() === '' ? 0 : (input.value.match(/\b\w+\b/g) || []).length;
        const finalChars = input.value.length;
        const wpm = Math.round((finalWords / 30) * 60);

        // Show final results
        timeDisplay.textContent = '30';
        wordDisplay.textContent = finalWords;
        charDisplay.textContent = finalChars;

        // Show results modal
        setTimeout(() => {
            let performance = '';
            if (wpm >= 40) performance = 'Excellent! 🏆';
            else if (wpm >= 30) performance = 'Great job! 🎉';
            else if (wpm >= 20) performance = 'Good work! 👍';
            else performance = 'Keep practicing! 💪';

            alert(`🎯 Typing Test Complete!\n\nResults:\n• ${finalWords} words typed\n• ${finalChars} characters total\n• ${wpm} words per minute\n\n${performance}`);
        }, 500);

        // Reset button
        btn.innerHTML = '<span>Start Test</span>';
        btn.disabled = false;
    }, 30000); // 30 seconds
}

// Add intersection observer for animations
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

// Observe all tool cards
document.addEventListener('DOMContentLoaded', () => {
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        observer.observe(card);
    });
});

// Add some interactive hover effects
document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(15, 23, 42, 0.95)';
    } else {
        navbar.style.background = 'rgba(15, 23, 42, 0.8)';
    }
});