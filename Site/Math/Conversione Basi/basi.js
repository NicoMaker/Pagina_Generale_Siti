// Validate input based on selected base
function validateInput() {
  const inputNumber = document.getElementById("inputNumber").value;
  const fromBase = Number.parseInt(
    document.getElementById("selectFromBase").value,
  );
  const inputGroup = document.querySelector(".input-group");
  const inputHint = document.querySelector(".input-hint");

  // Define valid characters for each base
  const validChars = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^[0-9]+$/,
    16: /^[0-9A-Fa-f]+$/,
  };

  if (inputNumber === "") {
    inputGroup.classList.remove("error");
    inputHint.textContent = "Inserisci un numero valido nella base selezionata";
    return false;
  }

  if (!validChars[fromBase].test(inputNumber)) {
    inputGroup.classList.add("error");
    inputHint.textContent = `Numero non valido per base ${fromBase}`;
    return false;
  }

  inputGroup.classList.remove("error");
  inputHint.textContent = "Inserisci un numero valido nella base selezionata";
  return true;
}

// Convert number between bases
function convert() {
  if (!validateInput()) return;

  const inputNumber = document.getElementById("inputNumber").value;
  const fromBase = Number.parseInt(
    document.getElementById("selectFromBase").value,
  );
  const toBase = Number.parseInt(document.getElementById("selectToBase").value);

  try {
    // Convert to base 10 first
    const base10Number = Number.parseInt(inputNumber, fromBase);

    // Then convert from base 10 to target base
    let convertedNumber = base10Number.toString(toBase);

    // Convert to uppercase for hex
    if (toBase === 16) {
      convertedNumber = convertedNumber.toUpperCase();
    }

    document.getElementById("outputNumber").value = convertedNumber;

    // Add animation to result
    const resultDisplay = document.querySelector(".result-display");
    resultDisplay.classList.add("highlight");
    setTimeout(() => {
      resultDisplay.classList.remove("highlight");
    }, 500);
  } catch (error) {
    document.getElementById("outputNumber").value = "Errore di conversione";
  }
}

// Swap the from and to bases
function swapBases() {
  const fromBaseSelect = document.getElementById("selectFromBase");
  const toBaseSelect = document.getElementById("selectToBase");

  const tempValue = fromBaseSelect.value;
  fromBaseSelect.value = toBaseSelect.value;
  toBaseSelect.value = tempValue;

  // If there's already a result, convert again
  if (document.getElementById("outputNumber").value !== "") {
    // Swap input and output
    const inputNumber = document.getElementById("inputNumber");
    const outputNumber = document.getElementById("outputNumber");

    inputNumber.value = outputNumber.value;
    convert();
  }
}

// Copy result to clipboard
function copyResult() {
  const outputNumber = document.getElementById("outputNumber");

  if (outputNumber.value === "") return;

  // Copy to clipboard
  navigator.clipboard.writeText(outputNumber.value).then(() => {
    // Show toast notification
    const toast = document.getElementById("copyToast");
    toast.classList.add("show");

    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  });
}

// Add event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Input validation on typing
  document
    .getElementById("inputNumber")
    .addEventListener("input", validateInput);

  // Convert on Enter key
  document
    .getElementById("inputNumber")
    .addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        convert();
      }
    });

  // Add highlight effect to result display
  const resultDisplay = document.querySelector(".result-display");
  resultDisplay.classList.add("highlight");

  // Add animation class
  document.querySelector(".result-display").style.transition = "all 0.3s ease";
});
