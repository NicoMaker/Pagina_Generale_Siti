// Funzione principale di conversione
function convertAge() {
    const years = parseInt(document.getElementById('years').value) || 0;
    const months = parseInt(document.getElementById('months').value) || 0;
    const days = parseInt(document.getElementById('days').value) || 0;

    const resultDiv = document.getElementById('result');
    const funFactDiv = document.getElementById('funFact');
    const humanAgeSpan = document.getElementById('humanAge');
    const factTextSpan = document.getElementById('factText');

    const totalDays = (years * 365) + (months * 30) + days;

    if (totalDays <= 0) {
        showAlert();
        return;
    }

    const ageInMonths = Math.round(totalDays / 30);

    let humanAge;
    if (ageInMonths <= 6) {
        humanAge = Math.round((ageInMonths / 6) * 10);
    } else if (ageInMonths <= 12) {
        humanAge = Math.round(10 + ((ageInMonths - 6) / 6) * 5);
    } else if (ageInMonths <= 24) {
        humanAge = Math.round(15 + ((ageInMonths - 12) / 12) * 9);
    } else {
        const yearsAfterTwo = (ageInMonths - 24) / 12;
        humanAge = Math.round(24 + (yearsAfterTwo * 4));
    }

    humanAgeSpan.textContent = humanAge;
    resultDiv.classList.add('show');

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

    humanAgeSpan.style.transform = 'scale(1.2)';
    setTimeout(() => {
        humanAgeSpan.style.transform = 'scale(1)';
    }, 200);
}

// Blocca valori superiori a 11 per mesi e 30 per giorni
document.getElementById('months').addEventListener('input', function () {
    if (this.value > 11) this.value = 11;
});
document.getElementById('days').addEventListener('input', function () {
    if (this.value > 30) this.value = 30;
});

// Aggiungi evento per il tasto Enter su tutti gli input dentro #catAge
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

// Selezione dell'unità di tempo (se applicabile altrove)
document.getElementById('timeUnit')?.addEventListener('change', function () {
    document.getElementById('result').classList.remove('show');
    document.getElementById('funFact').classList.remove('show');
});

// Placeholder dinamico (se usato altrove)
const input = document.getElementById('catAgeInput'); // assicurati che esista
const select = document.getElementById('timeUnit');
function updatePlaceholder() {
    if (select?.value === 'months') {
        input.placeholder = 'es. 18 mesi';
    } else {
        input.placeholder = 'es. 3.5 anni';
    }
}
select?.addEventListener('change', updatePlaceholder);
updatePlaceholder();


const showAlert = () =>
    document.getElementById('customAlert').style.display = 'flex';

const closeAlert = () =>
    document.getElementById('customAlert').style.display = 'none';
