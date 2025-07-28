function generaTabella() {
  const numeroInput = document.getElementById("numero");
  const scelta = document.getElementById("scelta").value;
  const risultato = document.getElementById("risultato");

  // Validate input
  const numero = parseInt(numeroInput.value);
  if (isNaN(numero) || numero <= 0) {
    risultato.innerHTML =
      '<p class="error-message">Inserisci un numero valido maggiore di zero.</p>';
    // Add shake animation to input
    numeroInput.classList.add("shake");
    setTimeout(() => numeroInput.classList.remove("shake"), 500);
    return;
  }

  // Generate the appropriate number sequence
  let numeri = [];
  if (scelta === "tutti") {
    numeri = Array.from({ length: numero }, (_, i) => i + 1);
  } else if (scelta === "pari") {
    numeri = Array.from(
      { length: Math.ceil(numero / 2) },
      (_, i) => (i + 1) * 2,
    ).filter((num) => num <= numero);
  } else if (scelta === "dispari") {
    numeri = Array.from(
      { length: Math.ceil(numero / 2) },
      (_, i) => i * 2 + 1,
    ).filter((num) => num <= numero);
  }

  // Calculate optimal columns based on screen width
  const screenWidth = window.innerWidth;
  let columnsPerRow = 5; // Default

  if (screenWidth < 480) {
    columnsPerRow = 3;
  } else if (screenWidth < 768) {
    columnsPerRow = 4;
  }

  // Create the table
  let tabella = "<table>";
  for (let i = 0; i < numeri.length; i++) {
    if (i % columnsPerRow === 0) tabella += "<tr>";
    tabella += `<td>${numeri[i]}</td>`;
    if (i % columnsPerRow === columnsPerRow - 1 || i === numeri.length - 1)
      tabella += "</tr>";
  }
  tabella += "</table>";

  // Add fade-in animation
  risultato.style.opacity = 0;
  setTimeout(() => {
    risultato.innerHTML = tabella;
    risultato.style.opacity = 1;
  }, 150);
}

// Add event listeners for better UX
document.addEventListener("DOMContentLoaded", function () {
  // Allow Enter key to trigger generation
  document.getElementById("numero").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      generaTabella();
    }
  });

  // Add animation to the button
  const button = document.querySelector("button");
  button.addEventListener("mousedown", function () {
    this.style.transform = "scale(0.98)";
  });

  button.addEventListener("mouseup", function () {
    this.style.transform = "scale(1)";
  });

  button.addEventListener("mouseleave", function () {
    this.style.transform = "scale(1)";
  });
});

// Add CSS for shake animation
document.head.insertAdjacentHTML(
  "beforeend",
  `
  <style>
  @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
      }
      
      .shake {
        animation: shake 0.5s ease;
      }
      
      .placeholder-text {
        color: #aaa;
        text-align: center;
        font-style: italic;
      }
    </style>
`,
);
