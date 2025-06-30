function convertDogAge() {
    const dogAge = parseFloat(document.getElementById('dogAge').value);
    const timeUnit = document.getElementById('timeUnit').value;
    const resultDiv = document.getElementById('result');
    const funFactDiv = document.getElementById('funFact');
    const humanAgeSpan = document.getElementById('humanAge');
    const factTextSpan = document.getElementById('factText');

    if (!dogAge || dogAge < 0) {
        alert('🐶 Per favore inserisci un\'età valida per il tuo cane!');
        return;
    }

    let ageInMonths = timeUnit === 'years' ? dogAge * 12 : dogAge;

    let humanAge;
    const years = ageInMonths / 12;

    if (years <= 1) {
        humanAge = Math.round(years * 15);
    } else if (years <= 2) {
        humanAge = Math.round(15 + (years - 1) * 9);
    } else {
        humanAge = Math.round(24 + (years - 2) * 4);
    }

    humanAgeSpan.textContent = humanAge;
    resultDiv.classList.add('show');

    let funFact;
    if (humanAge < 18) {
        funFact = "I cuccioli sono pieni di energia e imparano molto in fretta!";
    } else if (humanAge < 40) {
        funFact = "Il tuo cane è nel pieno della forma, ideale per tante avventure insieme!";
    } else if (humanAge < 60) {
        funFact = "I cani maturi sono spesso i più affettuosi e tranquilli!";
    } else {
        funFact = "I cani anziani meritano tanto amore, coccole e cure speciali!";
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

document.getElementById('dogAge').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        convertDogAge();
    }
});

document.getElementById('dogAge').addEventListener('input', function () {
    document.getElementById('result').classList.remove('show');
    document.getElementById('funFact').classList.remove('show');
});

document.getElementById('timeUnit').addEventListener('change', function () {
    document.getElementById('result').classList.remove('show');
    document.getElementById('funFact').classList.remove('show');
});

const input = document.getElementById('dogAge');
const select = document.getElementById('timeUnit');

function updatePlaceholder() {
    input.placeholder = select.value === 'months' ? 'es. 18 mesi' : 'es. 3.5 anni';
}

select.addEventListener('change', updatePlaceholder);
updatePlaceholder();
