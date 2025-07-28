document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const numberInput = document.getElementById("number");
  const exponentInput = document.getElementById("exponent");
  const operationSelect = document.getElementById("operation");
  const calculateButton = document.getElementById("calculate");
  const resultPlaceholder = document.getElementById("resultPlaceholder");
  const resultContent = document.getElementById("resultContent");
  const resultEquation = document.getElementById("resultEquation");
  const resultValue = document.getElementById("resultValue");
  const copyResultButton = document.getElementById("copyResult");
  const clearResultButton = document.getElementById("clearResult");
  const themeToggle = document.getElementById("themeToggle");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  const toastClose = document.getElementById("toastClose");
  const numberError = document.getElementById("numberError");
  const exponentError = document.getElementById("exponentError");

  // Theme Toggle
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    // Save theme preference to localStorage
    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });

  // Support keyboard navigation for theme toggle
  themeToggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      themeToggle.click();
    }
  });

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  } else if (
    savedTheme === null &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    // If no saved preference, check system preference
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
  }

  // Clear error messages when input changes
  numberInput.addEventListener("input", () => {
    numberInput.classList.remove("error");
    numberError.textContent = "";
  });

  exponentInput.addEventListener("input", () => {
    exponentInput.classList.remove("error");
    exponentError.textContent = "";
  });

  // Calculate Result
  calculateButton.addEventListener("click", () => {
    // Validate inputs
    if (!validateInputs()) {
      return;
    }

    const number = Number.parseFloat(numberInput.value);
    const exponent = Number.parseFloat(exponentInput.value);
    const operation = operationSelect.value;

    let result;
    let equation;

    try {
      if (operation === "power") {
        result = Math.pow(number, exponent);
        equation = `${number}<sup>${exponent}</sup> = `;
      } else if (operation === "root") {
        result = Math.pow(number, 1 / exponent);
        equation = `<sup>${exponent}</sup>√${number} = ${number}<sup>1/${exponent}</sup> = `;
      }

      // Check if result is valid
      if (isNaN(result) || !isFinite(result)) {
        showToast(
          "Risultato non valido. Controlla i valori inseriti.",
          "error",
        );
        return;
      }

      // Format result for display
      const formattedResult = formatResult(result);

      // Update UI with animation
      resultEquation.innerHTML = equation;
      resultValue.textContent = formattedResult;

      // Show result and hide placeholder with animation
      resultPlaceholder.style.display = "none";
      resultContent.style.display = "block";
      resultContent.classList.add("fade-in");

      // Remove animation class after animation completes
      setTimeout(() => {
        resultContent.classList.remove("fade-in");
      }, 300);

      // Show success toast
      showToast("Calcolo completato con successo!", "success");
    } catch (error) {
      showToast("Si è verificato un errore durante il calcolo.", "error");
      console.error("Calculation error:", error);
    }
  });

  // Validate Inputs
  function validateInputs() {
    let isValid = true;

    // Reset error states
    numberInput.classList.remove("error");
    exponentInput.classList.remove("error");
    numberError.textContent = "";
    exponentError.textContent = "";

    // Check if number input is valid
    if (
      numberInput.value.trim() === "" ||
      isNaN(Number.parseFloat(numberInput.value))
    ) {
      numberInput.classList.add("error");
      numberError.textContent = "Inserisci un numero valido.";
      showToast("Inserisci un numero valido.", "error");
      isValid = false;
    }

    // Check if exponent input is valid
    if (
      exponentInput.value.trim() === "" ||
      isNaN(Number.parseFloat(exponentInput.value))
    ) {
      exponentInput.classList.add("error");
      exponentError.textContent = "Inserisci un esponente valido.";
      showToast("Inserisci un esponente valido.", "error");
      isValid = false;
    }

    // Additional validation for root operation
    if (operationSelect.value === "root" && isValid) {
      const exponent = Number.parseFloat(exponentInput.value);

      // Check if exponent is zero
      if (exponent === 0) {
        exponentInput.classList.add("error");
        exponentError.textContent =
          "L'indice della radice non può essere zero.";
        showToast("L'indice della radice non può essere zero.", "error");
        isValid = false;
      }

      // Check if trying to calculate even root of negative number
      const number = Number.parseFloat(numberInput.value);
      if (number < 0 && exponent % 2 === 0) {
        numberInput.classList.add("error");
        numberError.textContent =
          "Non è possibile calcolare una radice di indice pari di un numero negativo.";
        showToast(
          "Non è possibile calcolare una radice di indice pari di un numero negativo.",
          "error",
        );
        isValid = false;
      }
    }

    return isValid;
  }

  // Format Result
  function formatResult(result) {
    // If result is an integer or has more than 10 digits, use exponential notation
    if (
      Number.isInteger(result) ||
      Math.abs(result) >= 1e10 ||
      (Math.abs(result) <= 1e-10 && result !== 0)
    ) {
      return result.toExponential(6);
    }

    // Otherwise, format with up to 10 decimal places
    return result.toLocaleString("it-IT", {
      maximumFractionDigits: 10,
      useGrouping: true,
    });
  }

  // Copy Result
  copyResultButton.addEventListener("click", () => {
    if (resultValue.textContent) {
      navigator.clipboard
        .writeText(resultValue.textContent)
        .then(() => {
          showToast("Risultato copiato negli appunti!", "success");
        })
        .catch((err) => {
          showToast("Impossibile copiare il risultato.", "error");
          console.error("Copy failed:", err);
        });
    } else {
      showToast("Nessun risultato da copiare.", "error");
    }
  });

  // Clear Result
  clearResultButton.addEventListener("click", () => {
    // Clear inputs
    numberInput.value = "";
    exponentInput.value = "";

    // Reset result display
    resultPlaceholder.style.display = "flex";
    resultContent.style.display = "none";

    // Remove error classes
    numberInput.classList.remove("error");
    exponentInput.classList.remove("error");
    numberError.textContent = "";
    exponentError.textContent = "";

    // Focus on number input
    numberInput.focus();

    showToast("Calcolatore resettato.", "success");
  });

  // Show Toast Notification
  function showToast(message, type = "success") {
    toastMessage.textContent = message;

    // Set toast icon color based on type
    const toastIcon = toast.querySelector(".toast-icon svg");
    if (type === "error") {
      toastIcon.style.stroke = "var(--error-color)";
    } else {
      toastIcon.style.stroke = "var(--success-color)";
    }

    // Show toast
    toast.classList.add("show");

    // Auto hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // Close Toast
  toastClose.addEventListener("click", () => {
    toast.classList.remove("show");
  });

  // Handle Enter key press
  numberInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      exponentInput.focus();
    }
  });

  exponentInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      calculateButton.click();
    }
  });

  // Operation change handler
  operationSelect.addEventListener("change", () => {
    const operation = operationSelect.value;
    const exponentLabel = document.querySelector(
      'label[for="exponent"] .label-text',
    );

    if (operation === "power") {
      exponentLabel.textContent = "Esponente";
    } else if (operation === "root") {
      exponentLabel.textContent = "Indice della Radice";
    }
  });
});
