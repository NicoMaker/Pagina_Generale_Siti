// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const closeMenuBtn = document.getElementById("close-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-links a");
  const currentYearSpan = document.getElementById("current-year");
  const prevQuoteBtn = document.getElementById("prev-quote");
  const nextQuoteBtn = document.getElementById("next-quote");
  const quoteSlides = document.querySelectorAll(".quote-slide");
  const quoteDots = document.querySelectorAll(".dot");
  const galleryTabs = document.querySelectorAll(".gallery-tab");
  const galleryItems = document.querySelectorAll(".gallery-item");
  const mapMarkers = document.querySelectorAll(".map-marker");
  const conquestInfo = document.getElementById("conquest-info");

  // Caesar Cipher elements
  const inputText = document.getElementById("input-text");
  const clearBtn = document.getElementById("clear-btn");
  const randomBtn = document.getElementById("random-btn");
  const encryptBtn = document.getElementById("encrypt-btn");
  const decryptBtn = document.getElementById("decrypt-btn");
  const copyBtn = document.getElementById("copy-btn");
  const resultDiv = document.getElementById("result");
  const charCount = document.querySelector(".char-count");
  const caesarImage = document.getElementById("caesar-image");

  // Set current year
  currentYearSpan.textContent = new Date().getFullYear();

  // Mobile menu
  mobileMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.add("active");
  });

  closeMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
  });

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
    });
  });

  // Quotes slider
  let currentSlide = 0;

  function showSlide(index) {
    // Hide all slides
    quoteSlides.forEach((slide) => {
      slide.classList.remove("active");
    });

    // Remove active class from all dots
    quoteDots.forEach((dot) => {
      dot.classList.remove("active");
    });

    // Show current slide
    quoteSlides[index].classList.add("active");
    quoteDots[index].classList.add("active");
  }

  nextQuoteBtn.addEventListener("click", () => {
    currentSlide = (currentSlide + 1) % quoteSlides.length;
    showSlide(currentSlide);
  });

  prevQuoteBtn.addEventListener("click", () => {
    currentSlide = (currentSlide - 1 + quoteSlides.length) % quoteSlides.length;
    showSlide(currentSlide);
  });

  // Add event listeners to dots
  quoteDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentSlide = index;
      showSlide(currentSlide);
    });
  });

  // Auto-rotate quotes
  setInterval(() => {
    currentSlide = (currentSlide + 1) % quoteSlides.length;
    showSlide(currentSlide);
  }, 8000);

  // Gallery tabs
  galleryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      galleryTabs.forEach((t) => t.classList.remove("active"));

      // Add active class to clicked tab
      tab.classList.add("active");

      const category = tab.dataset.category;

      // Filter gallery items
      galleryItems.forEach((item) => {
        if (category === "all" || item.dataset.category === category) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  });

  // Map markers
  const conquestData = {
    Roma: {
      title: "Roma",
      description:
        "Capitale dell'Impero Romano e centro del potere di Cesare. Qui Cesare implementò numerose riforme politiche e sociali che trasformarono lo Stato romano.",
    },
    Gallia: {
      title: "Conquista della Gallia",
      description:
        "Dal 58 al 50 a.C., Cesare condusse una serie di brillanti campagne militari che portarono alla conquista dell'intera Gallia, estendendo il dominio romano fino all'Oceano Atlantico e al Reno.",
    },
    Britannia: {
      title: "Spedizioni in Britannia",
      description:
        "Nel 55 e 54 a.C., Cesare condusse due spedizioni in Britannia. Sebbene non portarono a conquiste permanenti, furono le prime incursioni romane documentate sull'isola.",
    },
    Egitto: {
      title: "Guerra Civile Alessandrina",
      description:
        "Nel 48-47 a.C., Cesare intervenne nella guerra civile egiziana a favore di Cleopatra VII, stabilendo un'alleanza strategica e personale con la regina d'Egitto.",
    },
    Asia: {
      title: "Campagna Pontica",
      description:
        "Nel 47 a.C., Cesare sconfisse rapidamente Farnace II del Ponto nella battaglia di Zela. Fu dopo questa vittoria che pronunciò la famosa frase 'Veni, vidi, vici' (Venni, vidi, vinsi).",
    },
  };

  mapMarkers.forEach((marker) => {
    marker.addEventListener("click", () => {
      const location = marker.dataset.location;
      const data = conquestData[location];

      if (data) {
        conquestInfo.innerHTML = `
          <h3>${data.title}</h3>
          <p>${data.description}</p>
        `;

        // Highlight the clicked marker
        mapMarkers.forEach((m) => {
          m.querySelector(".marker-dot").style.backgroundColor = "";
          m.querySelector(".marker-dot").style.transform = "";
        });

        marker.querySelector(".marker-dot").style.backgroundColor =
          "var(--secondary)";
        marker.querySelector(".marker-dot").style.transform = "scale(1.5)";
      }
    });
  });

  // Caesar Cipher functionality
  // Update character count
  inputText.addEventListener("input", () => {
    const count = inputText.value.length;
    charCount.textContent = `${count} caratteri`;
  });

  // Clear input
  clearBtn.addEventListener("click", () => {
    inputText.value = "";
    charCount.textContent = "0 caratteri";
    resultDiv.innerHTML =
      '<div class="placeholder-text">Il testo cifrato o decifrato apparirà qui</div>';
    inputText.focus();
  });

  // Random example
  randomBtn.addEventListener("click", () => {
    const examples = [
      "Veni, vidi, vici",
      "Alea iacta est",
      "Gallia est omnis divisa in partes tres",
      "Ave Caesar, morituri te salutant",
      "Divide et impera",
    ];
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    inputText.value = randomExample;
    charCount.textContent = `${randomExample.length} caratteri`;
    inputText.focus();
  });

  // Encrypt button
  encryptBtn.addEventListener("click", () => {
    if (!inputText.value.trim()) {
      showError("Inserisci del testo da cifrare");
      return;
    }

    const result = caesarCipher(inputText.value, 3); // Shift 3 positions forward
    showResult("Testo cifrato:", result);
  });

  // Decrypt button
  decryptBtn.addEventListener("click", () => {
    if (!inputText.value.trim()) {
      showError("Inserisci del testo da decifrare");
      return;
    }

    const result = caesarCipher(inputText.value, -3); // Shift 3 positions backward
    showResult("Testo decifrato:", result);
  });

  // Copy result
  copyBtn.addEventListener("click", () => {
    const resultText = resultDiv.textContent;
    if (
      resultText.includes("Il testo cifrato o decifrato apparirà qui") ||
      resultText.includes("Inserisci del testo")
    ) {
      return;
    }

    // Create a temporary textarea to copy the text
    const textarea = document.createElement("textarea");
    textarea.value = resultText
      .replace("Testo cifrato: ", "")
      .replace("Testo decifrato: ", "");
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    // Show success message
    const originalIcon = copyBtn.innerHTML;
    copyBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;

    setTimeout(() => {
      copyBtn.innerHTML = originalIcon;
    }, 2000);
  });

  // Caesar cipher implementation
  function caesarCipher(text, shift) {
    // Ensure shift is between 0-25
    shift = shift % 26;
    if (shift < 0) shift += 26;

    let result = "";

    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);

      // Check if character is a letter
      if (char.match(/[a-z]/i)) {
        // Get ASCII code
        const code = char.charCodeAt(0);

        // Handle uppercase letters
        if (code >= 65 && code <= 90) {
          // A-Z: ASCII 65-90
          result += String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        // Handle lowercase letters
        else if (code >= 97 && code <= 122) {
          // a-z: ASCII 97-122
          result += String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
      } else {
        // If not a letter, keep character unchanged
        result += char;
      }
    }

    return result;
  }

  // Show result
  function showResult(prefix, text) {
    resultDiv.textContent = `${prefix} ${text}`;
    resultDiv.classList.add("highlight");
    setTimeout(() => {
      resultDiv.classList.remove("highlight");
    }, 1500);
  }

  // Show error
  function showError(message) {
    resultDiv.innerHTML = `
      <div class="error-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>${message}</span>
      </div>
    `;
  }

  // Add keyboard support
  inputText.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      encryptBtn.click();
    } else if (e.altKey && e.key === "Enter") {
      decryptBtn.click();
    }
  });

  // Set Caesar image
  if (caesarImage) {
    caesarImage.src =
      "https://upload.wikimedia.org/wikipedia/commons/8/8f/Gaius_Iulius_Caesar_%28Vatican_Museum%29.jpg";
    caesarImage.alt = "Busto di Giulio Cesare";
  }

  // Page load animations
  const animatedElements = document.querySelectorAll(
    ".hero-title, .hero-subtitle, .hero-dates, .hero-cta",
  );
  animatedElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add("fade-in");
    }, 300 * index);
  });
});
