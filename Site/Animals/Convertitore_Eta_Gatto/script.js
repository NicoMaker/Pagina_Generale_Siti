function convertAge() {
    const catAge = parseFloat(document.getElementById('catAge').value);
    const timeUnit = document.getElementById('timeUnit').value;
    const resultDiv = document.getElementById('result');
    const funFactDiv = document.getElementById('funFact');
    const humanAgeSpan = document.getElementById('humanAge');
    const factTextSpan = document.getElementById('factText');

    if (!catAge || catAge < 0) {
        alert('🐱 Per favore inserisci un\'età valida per il tuo gatto!');
        return;
    }

    let ageInMonths;
    if (timeUnit === 'years')
        ageInMonths = catAge * 12;
    else
        ageInMonths = catAge;

    // Formula più accurata per convertire l'età del gatto
    let humanAge;
    if (ageInMonths <= 6) {
        // I primi 6 mesi equivalgono a circa 10 anni umani
        humanAge = Math.round((ageInMonths / 6) * 10);
    } else if (ageInMonths <= 12) {
        // Dal 6° al 12° mese: da 10 a 15 anni umani
        humanAge = Math.round(10 + ((ageInMonths - 6) / 6) * 5);
    } else if (ageInMonths <= 24) {
        // Dal 1° al 2° anno: da 15 a 24 anni umani
        humanAge = Math.round(15 + ((ageInMonths - 12) / 12) * 9);
    } else {
        // Dopo i 2 anni: ogni anno felino = 4 anni umani
        const yearsAfterTwo = (ageInMonths - 24) / 12;
        humanAge = Math.round(24 + (yearsAfterTwo * 4));
    }

    // Aggiorna il risultato
    humanAgeSpan.textContent = humanAge;
    resultDiv.classList.add('show');

    // Fun facts basati sull'età
    let funFact;
    if (humanAge < 18) {
        funFact = "I gatti giovani sono molto energici e curiosi, proprio come i bambini umani!";
    } else if (humanAge < 40) {
        funFact = "Il tuo gatto è nel fiore degli anni, perfetto equilibrio tra energia e saggezza!";
    } else if (humanAge < 60) {
        funFact = "I gatti di mezza età sono spesso i più affettuosi e rilassati della famiglia!";
    } else {
        funFact = "I gatti anziani sono saggi e meritano cure extra speciali per la loro esperienza di vita!";
    }

    factTextSpan.textContent = funFact;

    setTimeout(() => {
        funFactDiv.classList.add('show');
    }, 300);

    // Animazione del risultato
    humanAgeSpan.style.transform = 'scale(1.2)';
    setTimeout(() => {
        humanAgeSpan.style.transform = 'scale(1)';
    }, 200);
}

// Aggiungi evento per il tasto Enter
document.getElementById('catAge').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        convertAge();
    }
});

// Reset delle animazioni quando si cambia input
document.getElementById('catAge').addEventListener('input', function () {
    document.getElementById('result').classList.remove('show');
    document.getElementById('funFact').classList.remove('show');
});

document.getElementById('timeUnit').addEventListener('change', function () {
    document.getElementById('result').classList.remove('show');
    document.getElementById('funFact').classList.remove('show');
});

// Aggiungi placeholder dinamico
const input = document.getElementById('catAge');
const select = document.getElementById('timeUnit');

function updatePlaceholder() {
    if (select.value === 'months') {
        input.placeholder = 'es. 18 mesi';
    } else {
        input.placeholder = 'es. 3.5 anni';
    }
}

select.addEventListener('change', updatePlaceholder);
updatePlaceholder(); // Imposta il placeholder iniziale