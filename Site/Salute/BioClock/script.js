(function() {
    // Stato del questionario
    let currentQuestion = 0;
    const answers = {
        q1: null,
        q2: null,
        q3: null,
        q4: null
    };
    
    const questions = ['q1', 'q2', 'q3', 'q4'];
    let chronotype = null; // 'early', 'neutral', 'late'
    
    // Elementi DOM
    const questionSection = document.getElementById('questionSection');
    const resultsSection = document.getElementById('resultsSection');
    const progressFill = document.getElementById('progressFill');
    const questionCounter = document.getElementById('questionCounter');
    const resetBtn = document.getElementById('resetBtn');
    
    // Funzione per mostrare la domanda corrente
    function showQuestion(index) {
        // Nascondi tutte
        questions.forEach(q => {
            const el = document.getElementById(q);
            if (el) el.classList.add('hidden');
        });
        
        const currentQ = document.getElementById(questions[index]);
        if (currentQ) currentQ.classList.remove('hidden');
        
        // Aggiorna progresso
        const progressPercent = ((index + 1) / questions.length) * 100;
        progressFill.style.width = `${progressPercent}%`;
        questionCounter.textContent = `Domanda ${index + 1} di ${questions.length}`;
    }
    
    // Calcola cronotipo in base alle risposte
    function calculateChronotype() {
        let score = 0;
        // mappa valori: early = 1, neutral = 2, late = 3
        const values = {
            early: 1,
            neutral: 2,
            late: 3
        };
        
        score += values[answers.q1];
        score += values[answers.q2];
        score += values[answers.q3];
        score += values[answers.q4];
        
        if (score <= 6) return 'early';      // Allodola
        if (score <= 9) return 'neutral';    // Normotipo
        return 'late';                        // Gufo
    }
    
    // Genera la timeline di energia (orari)
    function generateTimeline(chrono) {
        const timeline = document.getElementById('timeline');
        const hours = [
            '06:00', '08:00', '10:00', '12:00', '14:00', 
            '16:00', '18:00', '20:00', '22:00', '00:00', '02:00'
        ];
        
        let energyLevels = [];
        
        if (chrono === 'early') {
            energyLevels = ['medium', 'high', 'peak', 'high', 'medium', 'medium', 'low', 'low', 'low', 'low', 'low'];
        } else if (chrono === 'neutral') {
            energyLevels = ['low', 'medium', 'high', 'peak', 'high', 'medium', 'medium', 'low', 'low', 'low', 'low'];
        } else {
            energyLevels = ['low', 'low', 'low', 'medium', 'medium', 'high', 'peak', 'high', 'medium', 'low', 'low'];
        }
        
        timeline.innerHTML = hours.map((hour, idx) => `
            <div class="time-block ${energyLevels[idx]}">
                ${hour}<br>
                <span style="font-size:0.6rem;">${energyLevels[idx] === 'peak' ? '⚡PICCO' : (energyLevels[idx] === 'high' ? '▲' : (energyLevels[idx] === 'medium' ? '●' : '▼'))}</span>
            </div>
        `).join('');
    }
    
    // Aggiorna tutti i consigli in base al cronotipo
    function updateAdvice(chrono) {
        // Imposta badge
        const chronoIcon = document.getElementById('chronoIcon');
        const chronoName = document.getElementById('chronoName');
        
        if (chrono === 'early') {
            chronoIcon.textContent = '🌅';
            chronoName.textContent = 'Allodola Mattutina';
        } else if (chrono === 'neutral') {
            chronoIcon.textContent = '🐦';
            chronoName.textContent = 'Normotipo (Colomba)';
        } else {
            chronoIcon.textContent = '🦉';
            chronoName.textContent = 'Gufo Notturno';
        }
        
        // Finestra di sonno ideale
        let sleepStart, sleepEnd, sleepDetail;
        if (chrono === 'early') {
            sleepStart = '21:30';
            sleepEnd = '05:30';
            sleepDetail = '8 ore · alba naturale';
        } else if (chrono === 'neutral') {
            sleepStart = '22:30';
            sleepEnd = '06:30';
            sleepDetail = '8 ore · ritmo standard';
        } else {
            sleepStart = '00:30';
            sleepEnd = '08:30';
            sleepDetail = '8 ore · recupero notturno';
        }
        document.getElementById('sleepWindow').textContent = `${sleepStart} → ${sleepEnd}`;
        document.getElementById('sleepDetail').textContent = sleepDetail;
        
        // Picco creatività
        let creativePeak;
        if (chrono === 'early') creativePeak = '09:00 - 11:00';
        else if (chrono === 'neutral') creativePeak = '10:00 - 12:00';
        else creativePeak = '16:00 - 18:00';
        document.getElementById('creativePeak').textContent = creativePeak;
        
        // Performance fisica
        let sportPeak;
        if (chrono === 'early') sportPeak = '10:30 - 12:00';
        else if (chrono === 'neutral') sportPeak = '15:00 - 17:00';
        else sportPeak = '18:00 - 20:00';
        document.getElementById('sportPeak').textContent = sportPeak;
        
        // Pasti principali
        let meals;
        if (chrono === 'early') meals = '07:30 / 12:30 / 19:00';
        else if (chrono === 'neutral') meals = '08:30 / 13:00 / 20:00';
        else meals = '10:00 / 14:00 / 21:30';
        document.getElementById('mealTimes').textContent = meals;
        
        // Momento relax
        let relaxTime;
        if (chrono === 'early') relaxTime = '20:30';
        else if (chrono === 'neutral') relaxTime = '21:30';
        else relaxTime = '23:30';
        document.getElementById('relaxTime').textContent = relaxTime;
        
        // Caffeina
        let caffeineAdvice;
        if (chrono === 'early') caffeineAdvice = 'Ultimo caffè entro le 14:00';
        else if (chrono === 'neutral') caffeineAdvice = 'Ultimo caffè entro le 15:30';
        else caffeineAdvice = 'Ultimo caffè entro le 17:00 (o niente dopo le 16)';
        document.getElementById('caffeineAdvice').textContent = caffeineAdvice;
        
        // Genera timeline
        generateTimeline(chrono);
    }
    
    // Gestione risposta
    function handleAnswer(questionId, value) {
        answers[questionId] = value;
        
        if (currentQuestion + 1 < questions.length) {
            currentQuestion++;
            showQuestion(currentQuestion);
        } else {
            // Fine questionario: calcola e mostra risultati
            chronotype = calculateChronotype();
            updateAdvice(chronotype);
            
            // Transizione UI
            questionSection.classList.add('hidden');
            resultsSection.classList.remove('hidden');
        }
    }
    
    // Reset del test
    function resetTest() {
        currentQuestion = 0;
        answers.q1 = null;
        answers.q2 = null;
        answers.q3 = null;
        answers.q4 = null;
        chronotype = null;
        
        // Resetta UI
        questionSection.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        showQuestion(0);
        
        // Rimuovi eventuali classi hidden extra dalle domande
        questions.forEach(q => {
            const el = document.getElementById(q);
            if (el) {
                if (q === 'q1') el.classList.remove('hidden');
                else el.classList.add('hidden');
            }
        });
        
        progressFill.style.width = '25%';
        questionCounter.textContent = 'Domanda 1 di 4';
    }
    
    // Attach event listeners ai bottoni delle domande
    function bindQuestionEvents() {
        // Domanda 1
        document.querySelectorAll('#q1 .opt-btn').forEach(btn => {
            btn.addEventListener('click', () => handleAnswer('q1', btn.dataset.value));
        });
        // Domanda 2
        document.querySelectorAll('#q2 .opt-btn').forEach(btn => {
            btn.addEventListener('click', () => handleAnswer('q2', btn.dataset.value));
        });
        // Domanda 3
        document.querySelectorAll('#q3 .opt-btn').forEach(btn => {
            btn.addEventListener('click', () => handleAnswer('q3', btn.dataset.value));
        });
        // Domanda 4
        document.querySelectorAll('#q4 .opt-btn').forEach(btn => {
            btn.addEventListener('click', () => handleAnswer('q4', btn.dataset.value));
        });
    }
    
    // Reset button
    resetBtn.addEventListener('click', resetTest);
    
    // Inizializzazione
    function init() {
        bindQuestionEvents();
        showQuestion(0);
    }
    
    init();
})();