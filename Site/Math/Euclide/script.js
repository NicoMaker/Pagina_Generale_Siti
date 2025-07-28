document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const numero1Input = document.getElementById("numero1");
  const numero2Input = document.getElementById("numero2");
  const calcolaButton = document.getElementById("calcola");
  const passaggiDiv = document.getElementById("passaggi");
  const risultatoDiv = document.getElementById("risultato");
  const resultPlaceholder = document.getElementById("result-placeholder");
  const resultContent = document.getElementById("result-content");
  const resultCard = document.getElementById("result-card");
  const themeToggle = document.getElementById("themeToggle");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  const toastClose = document.getElementById("toast-close");

  // Theme Toggle - Corretto per funzionare correttamente
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");

      // Save theme preference to localStorage
      if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
      } else {
        localStorage.setItem("theme", "light");
      }
    });

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
    }
  }

  // Event Listeners
  calcolaButton.addEventListener("click", CalcolaEuclide);
  if (toastClose) {
    toastClose.addEventListener("click", closeToast);
  }

  // Handle Enter key press
  numero1Input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      numero2Input.focus();
    }
  });

  numero2Input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      CalcolaEuclide();
    }
  });

  // Main calculation function
  function CalcolaEuclide() {
    const numero1 = Number.parseInt(numero1Input.value);
    const numero2 = Number.parseInt(numero2Input.value);

    // Validate inputs
    if (!validateInputs(numero1, numero2)) {
      return;
    }

    // Calculate result
    const risultato = CalcolaRisultato(numero1, numero2);

    // Show results
    resultPlaceholder.style.display = "none";
    resultContent.style.display = "block";

    // Add animation class to result card
    resultCard.classList.add("fade-in");

    // Scroll to result card
    resultCard.scrollIntoView({ behavior: "smooth" });

    // Show success toast
    showToast("Calcolo completato con successo!");
  }

  // Validate inputs
  function validateInputs(numero1, numero2) {
    if (isNaN(numero1) || isNaN(numero2) || numero1 <= 0 || numero2 <= 0) {
      let errorMessage = "";

      if (isNaN(numero1) && isNaN(numero2)) {
        errorMessage = "Inserisci numeri validi in entrambi i campi.";
      } else if (isNaN(numero1)) {
        errorMessage = "Inserisci un valore valido per il primo numero.";
      } else if (isNaN(numero2)) {
        errorMessage = "Inserisci un valore valido per il secondo numero.";
      } else if (numero1 <= 0 && numero2 <= 0) {
        errorMessage = "Entrambi i numeri devono essere maggiori di zero.";
      } else if (numero1 <= 0) {
        errorMessage = "Il primo numero deve essere maggiore di zero.";
      } else if (numero2 <= 0) {
        errorMessage = "Il secondo numero deve essere maggiore di zero.";
      }

      showToast(errorMessage, "error");
      return false;
    }

    return true;
  }

  // Calculate result with steps
  function CalcolaRisultato(numero1, numero2) {
    const passaggi = [];
    let passaggio = 0;

    // Ensure numero1 is greater than or equal to numero2
    let a = Math.max(numero1, numero2);
    let b = Math.min(numero1, numero2);

    // If we swapped the numbers, add a note
    if (numero1 < numero2) {
      passaggi.push(
        `<div class="step">
          <div class="step-number">!</div>
          <div class="step-content">Scambio i numeri per avere il maggiore come primo: ${numero2} e ${numero1}</div>
        </div>`,
      );
    }

    let resto = a % b;
    let quoziente = Math.floor(a / b);

    while (resto > 0) {
      passaggio++;
      passaggi.push(
        `<div class="step">
          <div class="step-number">${passaggio}</div>
          <div class="step-content">${a} = ${b} × ${quoziente} + ${resto}</div>
        </div>`,
      );

      a = b;
      b = resto;
      resto = a % b;
      quoziente = Math.floor(a / b);
    }

    // Add final step
    passaggio++;
    passaggi.push(
      `<div class="step">
        <div class="step-number">${passaggio}</div>
        <div class="step-content">${a} = ${b} × ${quoziente} + ${resto}</div>
      </div>`,
    );

    // Add summary
    passaggi.push(
      `<div class="step-summary">
        Per calcolare l'MCD sono stati necessari ${passaggio} ${
          passaggio === 1 ? "passaggio" : "passaggi"
        }.
      </div>`,
    );

    // Update UI
    passaggiDiv.innerHTML = passaggi.join("");
    risultatoDiv.innerHTML = `MCD = ${b}`;

    return b;
  }

  // Show toast notification
  function showToast(message, type = "success") {
    toastMessage.textContent = message;

    // Set toast icon color based on type
    const toastIcon = toast.querySelector(".toast-icon svg");
    if (type === "error") {
      toastIcon.style.stroke = "var(--error)";
    } else {
      toastIcon.style.stroke = "var(--primary)";
    }

    // Show toast
    toast.classList.add("show");

    // Auto hide after 4 seconds
    setTimeout(() => {
      closeToast();
    }, 4000);
  }

  // Close toast
  function closeToast() {
    toast.classList.remove("show");
  }
});
