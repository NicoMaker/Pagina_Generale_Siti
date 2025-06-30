function convertAge() {
    const years = parseInt(document.getElementById('years').value) || 0;
    const months = parseInt(document.getElementById('months').value) || 0;
    const days = parseInt(document.getElementById('days').value) || 0;

    const totalDays = (years * 365) + (months * 30) + days;
    if (totalDays <= 0) {
        showAlert();
        return;
    }

    const ageInMonths = Math.round(totalDays / 30);
    let humanAge;

    if (ageInMonths <= 12) {
        humanAge = Math.round((ageInMonths / 12) * 15);
    } else if (ageInMonths <= 24) {
        humanAge = Math.round(15 + ((ageInMonths - 12) / 12) * 9);
    } else {
        const yearsAfterTwo = (ageInMonths - 24) / 12;
        humanAge = Math.round(24 + (yearsAfterTwo * 5));
    }

    document.getElementById('humanAge').textContent = humanAge;
    document.getElementById('result').classList.add('show');

    let funFact = "";
    if (humanAge < 18) {
        funFact = "I cani giovani sono vivaci, giocherelloni e imparano in fretta!";
    } else if (humanAge < 40) {
        funFact = "Il tuo cane è nel pieno della sua forza e intelligenza!";
    } else if (humanAge < 60) {
        funFact = "I cani maturi sono spesso i più fedeli e affettuosi compagni!";
    } else {
        funFact = "I cani anziani meritano coccole extra e tanto amore!";
    }

    document.getElementById('factText').textContent = funFact;

    setTimeout(() => {
        document.getElementById('funFact').classList.add('show');
    }, 300);

    // Animazione leggera sul numero
    const humanAgeSpan = document.getElementById('humanAge');
    humanAgeSpan.style.transform = 'scale(1.2)';
    setTimeout(() => {
        humanAgeSpan.style.transform = 'scale(1)';
    }, 200);
}

// Limita i valori dei mesi e giorni nei range corretti
document.getElementById('months').addEventListener('input', function () {
    if (this.value > 11) this.value = 11;
});
document.getElementById('days').addEventListener('input', function () {
    if (this.value > 30) this.value = 30;
});

// Abilita invio con tasto Enter su ogni campo
['years', 'months', 'days'].forEach(id => {
    document.getElementById(id).addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            convertAge();
        }
    });

    document.getElementById(id).addEventListener('input', function () {
        document.getElementById('result').classList.remove('show');
        document.getElementById('funFact').classList.remove('show');
    });
});

const showAlert = () =>
    document.getElementById('customAlert').style.display = 'flex';

const closeAlert = () =>
    document.getElementById('customAlert').style.display = 'none';
