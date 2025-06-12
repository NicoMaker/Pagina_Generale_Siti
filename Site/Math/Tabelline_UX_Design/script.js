// Attendi che il DOM sia completamente caricato
document.addEventListener("DOMContentLoaded", () => {
    // Aggiungi event listener per la navigazione da tastiera
    document.getElementById("number").addEventListener("keypress", handleEnterKey);
    document.getElementById("min").addEventListener("keypress", handleEnterKey);
    document.getElementById("max").addEventListener("keypress", handleEnterKey);

    // Aggiungi funzionalità di stampa
    document.getElementById("print-btn").addEventListener("click", () => {
        window.print();
    });

    // Aggiungi event listener per il pulsante di generazione
    document.getElementById("generate-btn").addEventListener("click", generaTabellina);
});

// Gestisci la pressione del tasto Invio
function handleEnterKey(event) {
    if (event.key === "Enter") {
        generaTabellina();
    }
}

// Funzione principale per generare la tabellina
function generaTabellina() {
    // Ottieni gli elementi del container dei risultati e del messaggio di errore
    const resultContainer = document.getElementById("result-container");
    const errorMessageElement = document.getElementById("error-message");
    const tableContainer = document.getElementById("table-container");

    // Reimposta lo stato dell'UI
    resultContainer.classList.add("hidden");
    errorMessageElement.classList.add("hidden");
    errorMessageElement.textContent = "";
    errorMessageElement.classList.remove("shake");

    // Ottieni i valori di input
    const num = getInputValue("number");
    let min = getInputValue("min");
    let max = getInputValue("max");

    // Valida gli input
    if (isNaN(num) || num === 0) {
        showError("Per favore, inserisci un numero valido per la tabellina.");
        return;
    }

    if (isNaN(min) || isNaN(max)) {
        showError("Per favore, inserisci valori numerici validi per il range.");
        return;
    }

    // Scambia min e max se min > max
    if (min > max) {
        [min, max] = [max, min];
        document.getElementById("min").value = min;
        document.getElementById("max").value = max;
        showNotification("I valori minimo e massimo sono stati scambiati.");
    }

    const number = 1000000; // Numero massimo di operazioni consentite
    // Limita il range per evitare problemi di prestazioni
    if (max - min > number) {
        showError(`Per favore, limita l'intervallo a ${number} numeri per prestazioni ottimali.`);
        return;
    }

    // Aggiorna il titolo del risultato
    document.getElementById("result-title").textContent = `La tua tabellina del ${num}`;

    // Genera e visualizza la tabella
    generateTable(num, min, max);

    // Mostra il container dei risultati con animazione
    resultContainer.classList.remove("hidden");

    // Lancia coriandoli per rendere l'esperienza più divertente
    setTimeout(() => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, 300);

    // Scorri fino al risultato
    setTimeout(() => {
        resultContainer.scrollIntoView({ behavior: "smooth" });
    }, 100);
}

// Ottieni il valore di input come intero
function getInputValue(id) {
    return parseInt(document.getElementById(id).value) || 0;
}

// Mostra messaggio di errore
function showError(message) {
    const errorElement = document.getElementById("error-message");
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");

    // Aggiungi animazione shake
    errorElement.classList.add("shake");
    setTimeout(() => {
        errorElement.classList.remove("shake");
    }, 500);
}

// Mostra notifica cambiando temporaneamente il testo del pulsante
function showNotification(message) {
    const button = document.getElementById("generate-btn");
    const originalText = document.getElementById("btn-text").textContent;

    document.getElementById("btn-text").textContent = message;
    button.classList.add("notification");

    setTimeout(() => {
        document.getElementById("btn-text").textContent = originalText;
        button.classList.remove("notification");
    }, 3000);
}

// Genera la tabella delle moltiplicazioni
function generateTable(num, min, max) {
    const tableContainer = document.getElementById("table-container");
    const summaryElement = document.getElementById("summary");

    // Determina se usare il layout compatto in base alla larghezza dello schermo e al numero di righe
    const isSmallScreen = window.innerWidth <= 768;
    const isVerySmallScreen = window.innerWidth <= 480;
    const rowCount = max - min + 1;

    // Usa layout compatto se lo schermo è piccolo o ci sono molte righe
    const useCompactLayout = isSmallScreen || rowCount > 10;

    // Crea tabella HTML
    let tableHTML = `
    <table class="${useCompactLayout ? 'compact-table' : ''}">
      <thead>
        <tr>
          <th>Numero</th>
          <th>Moltiplicatore</th>
          <th>Risultato</th>
        </tr>
      </thead>
      <tbody>
  `;

    // Contatore per operazioni
    let operationCount = 0;

    // Genera righe della tabella
    for (let i = min; i <= max; i++) {
        const risultato = num * i;
        tableHTML += `
      <tr class="table-row" data-index="${operationCount}">
        <td>${num}</td>
        <td>${i}</td>
        <td>${risultato}</td>
      </tr>
    `;
        operationCount++;
    }

    tableHTML += `
      </tbody>
    </table>
  `;

    // Aggiorna la tabella nel DOM
    tableContainer.innerHTML = tableHTML;

    // Crea testo di riepilogo
    const summaryText = operationCount === 1
        ? `È stata calcolata ${operationCount} operazione.`
        : `Sono state calcolate ${operationCount} operazioni.`;

    // Aggiorna riepilogo
    summaryElement.innerHTML = `
    <p>${summaryText}</p>
    <p class="summary-detail">Tabellina del ${num} da ${min} a ${max}</p>
  `;

    // Aggiungi animazione alle righe della tabella
    const rows = document.querySelectorAll(".table-row");
    rows.forEach((row, index) => {
        setTimeout(() => {
            row.style.opacity = "0";
            row.style.transform = "translateY(10px)";

            // Force reflow
            void row.offsetWidth;

            row.style.transition = "opacity 0.3s ease, transform 0.3s ease";
            row.style.opacity = "1";
            row.style.transform = "translateY(0)";
        }, index * 30);
    });
}