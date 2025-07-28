// Funzione principale di conversione
function convertAge() {
  const years = parseInt(document.getElementById("years").value) || 0;
  const months = parseInt(document.getElementById("months").value) || 0;
  const days = parseInt(document.getElementById("days").value) || 0;

  const resultDiv = document.getElementById("result");
  const funFactDiv = document.getElementById("funFact");
  const humanAgeSpan = document.getElementById("humanAge");
  const factTextSpan = document.getElementById("factText");

  const totalDays = years * 365 + months * 30 + days;

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
    humanAge = Math.round(24 + yearsAfterTwo * 4);
  }

  humanAgeSpan.textContent = humanAge;
  resultDiv.classList.add("show");

  let funFact;
  if (humanAge < 15) {
    funFact =
      "I gattini crescono incredibilmente veloce! A 6 mesi hanno già l'equivalente di 10 anni umani e sono pronti per esplorare il mondo.";
  } else if (humanAge < 25) {
    funFact =
      "I gatti giovani sono nel pieno dell'energia! Questo è il momento perfetto per socializzare e giocare molto con loro.";
  } else if (humanAge < 40) {
    funFact =
      "Il tuo gatto è nel fiore degli anni! Ha raggiunto il perfetto equilibrio tra energia giovanile e saggezza adulta.";
  } else if (humanAge < 60) {
    funFact =
      "I gatti di mezza età diventano spesso più affettuosi e rilassati. Apprezzano di più i momenti di coccole e tranquillità.";
  } else {
    funFact =
      "I gatti anziani sono tesori di saggezza! Meritano cure extra speciali e tutto il nostro amore per la loro lunga esperienza di vita.";
  }

  factTextSpan.textContent = funFact;

  setTimeout(() => {
    funFactDiv.style.opacity = "1";
    funFactDiv.style.transform = "translateY(0)";
  }, 400);

  // Animazione del numero
  humanAgeSpan.style.transform = "scale(1.1)";
  setTimeout(() => {
    humanAgeSpan.style.transform = "scale(1)";
  }, 300);
}

// Validazione input
document.getElementById("months").addEventListener("input", function () {
  if (this.value > 11) this.value = 11;
  if (this.value < 0) this.value = 0;
});

document.getElementById("days").addEventListener("input", function () {
  if (this.value > 30) this.value = 30;
  if (this.value < 0) this.value = 0;
});

document.getElementById("years").addEventListener("input", function () {
  if (this.value < 0) this.value = 0;
});

// Enter key support
document.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    convertAge();
  }
});

// Reset animazioni quando si cambia input
["years", "months", "days"].forEach((id) => {
  document.getElementById(id).addEventListener("input", function () {
    document.getElementById("result").classList.remove("show");
    const funFactDiv = document.getElementById("funFact");
    funFactDiv.style.opacity = "0";
    funFactDiv.style.transform = "translateY(20px)";
  });
});

// Funzioni per alert personalizzato
const showAlert = () => {
  document.getElementById("customAlert").style.display = "flex";
};

const closeAlert = () => {
  document.getElementById("customAlert").style.display = "none";
};

// Animazioni al caricamento della pagina
window.addEventListener("load", function () {
  // Aggiungi un leggero ritardo per le animazioni delle card info
  const infoCards = document.querySelectorAll(".info-card");
  infoCards.forEach((card, index) => {
    setTimeout(
      () => {
        card.style.opacity = "1";
        card.style.transform = "translateX(0)";
      },
      200 * (index + 1),
    );
  });
});

// Effetto hover sulle example cards
document.querySelectorAll(".example-card").forEach((card) => {
  card.addEventListener("click", function () {
    const catAge = this.querySelector(".example-cat-age").textContent;
    const humanAge = this.querySelector(".example-human-age").textContent;

    // Estrai i numeri dall'età del gatto
    const ageMatch = catAge.match(/(\d+)\s*(anni?|mesi?)/);
    if (ageMatch) {
      const ageValue = parseInt(ageMatch[1]);
      const ageUnit = ageMatch[2];

      if (ageUnit.includes("anno") || ageUnit.includes("anni")) {
        document.getElementById("years").value = ageValue;
        document.getElementById("months").value = 0;
        document.getElementById("days").value = 0;
      } else if (ageUnit.includes("mes")) {
        document.getElementById("years").value = 0;
        document.getElementById("months").value = ageValue;
        document.getElementById("days").value = 0;
      }

      // Converti automaticamente
      setTimeout(() => {
        convertAge();
      }, 100);
    }
  });
});

// Aggiungi effetto parallasse leggero al movimento del mouse
document.addEventListener("mousemove", function (e) {
  const mouseX = e.clientX / window.innerWidth;
  const mouseY = e.clientY / window.innerHeight;

  const converterCard = document.querySelector(".converter-card");
  const infoCards = document.querySelectorAll(".info-card");

  converterCard.style.transform = `perspective(1000px) rotateY(${(mouseX - 0.5) * 5}deg) rotateX(${(mouseY - 0.5) * -5}deg)`;

  infoCards.forEach((card, index) => {
    const offset = (index + 1) * 0.5;
    card.style.transform = `perspective(1000px) rotateY(${(mouseX - 0.5) * 3 * offset}deg) rotateX(${(mouseY - 0.5) * -3 * offset}deg)`;
  });
});

// Reset transform quando il mouse esce dalla finestra
document.addEventListener("mouseleave", function () {
  const converterCard = document.querySelector(".converter-card");
  const infoCards = document.querySelectorAll(".info-card");

  converterCard.style.transform =
    "perspective(1000px) rotateY(0deg) rotateX(0deg)";
  infoCards.forEach((card) => {
    card.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg)";
  });
});

// Aggiungi effetti sonori virtuali (feedback visivo)
function addRippleEffect(element, event) {
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const ripple = document.createElement("div");
  ripple.style.position = "absolute";
  ripple.style.borderRadius = "50%";
  ripple.style.background = "rgba(255,255,255,0.6)";
  ripple.style.transform = "scale(0)";
  ripple.style.animation = "ripple 0.6s ease-out";
  ripple.style.left = x - 10 + "px";
  ripple.style.top = y - 10 + "px";
  ripple.style.width = "20px";
  ripple.style.height = "20px";
  ripple.style.pointerEvents = "none";

  element.style.position = "relative";
  element.style.overflow = "hidden";
  element.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Aggiungi l'animazione CSS per il ripple
const style = document.createElement("style");
style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
document.head.appendChild(style);

// Applica l'effetto ripple ai bottoni
document.querySelector(".convert-btn").addEventListener("click", function (e) {
  addRippleEffect(this, e);
});

document
  .querySelector(".alert-content button")
  .addEventListener("click", function (e) {
    addRippleEffect(this, e);
  });

// Aggiungi feedback tattile visivo agli input
document.querySelectorAll('input[type="number"]').forEach((input) => {
  input.addEventListener("focus", function () {
    this.style.animation = "inputFocus 0.3s ease";
  });

  input.addEventListener("blur", function () {
    this.style.animation = "";
  });
});

// Aggiungi l'animazione per l'input focus
const inputStyle = document.createElement("style");
inputStyle.textContent = `
            @keyframes inputFocus {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); }
            }
        `;
document.head.appendChild(inputStyle);
