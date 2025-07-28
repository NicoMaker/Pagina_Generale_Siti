document.addEventListener("DOMContentLoaded", function () {
  // Elementi DOM
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const generatePasswordBtn = document.getElementById("generatePassword");
  const strengthText = document.getElementById("strengthText");
  const crackTimeElement = document.getElementById("crackTime");
  const suggestionsElement = document.getElementById("suggestions");
  const ultraSecureBadge = document.getElementById("ultraSecureBadge");

  // Segmenti della barra di forza
  const segments = [
    document.getElementById("segment1"),
    document.getElementById("segment2"),
    document.getElementById("segment3"),
    document.getElementById("segment4"),
  ];

  // Testi per la forza della password
  const strengthLabels = {
    0: "Nessuna password",
    1: "Molto debole",
    2: "Debole",
    3: "Media",
    4: "Forte",
    5: "Ultra sicura",
  };

  // Toggle visibilità password
  togglePassword.addEventListener("click", function () {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    // Cambia l'icona dell'occhio
    const eyeIcon = this.querySelector(".eye-icon");
    if (type === "password") {
      eyeIcon.innerHTML =
        '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    } else {
      eyeIcon.innerHTML =
        '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    }
  });

  // Genera password sicura
  generatePasswordBtn.addEventListener("click", function () {
    const password = generateSecurePassword();
    passwordInput.value = password;
    passwordInput.type = "text";

    // Aggiorna l'icona dell'occhio
    const eyeIcon = togglePassword.querySelector(".eye-icon");
    eyeIcon.innerHTML =
      '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';

    // Valuta la forza della password generata
    evaluatePassword(password);
  });

  // Valuta la forza della password all'input
  passwordInput.addEventListener("input", function () {
    const password = this.value;
    evaluatePassword(password);
  });

  // Funzione principale per valutare la password
  function evaluatePassword(password) {
    const result = checkPasswordStrength(password);

    // Aggiorna il testo della forza
    strengthText.textContent = strengthLabels[result.score];

    // Aggiorna i segmenti della barra di forza
    updateStrengthSegments(result.score);

    // Aggiorna il tempo di violazione
    crackTimeElement.textContent = result.crackTime;

    // Aggiorna i suggerimenti
    updateSuggestions(password, result.score);

    // Gestisci il badge per password ultra-sicure
    if (result.crackTime === "Più di 100 anni") {
      ultraSecureBadge.classList.remove("hidden");
      // Aggiungi effetto pulsante ai segmenti
      segments.forEach((segment) => {
        if (segment.classList.contains("ultra-strong")) {
          segment.classList.add("pulse");
        }
      });
    } else {
      ultraSecureBadge.classList.add("hidden");
      // Rimuovi effetto pulsante
      segments.forEach((segment) => {
        segment.classList.remove("pulse");
      });
    }
  }

  // Aggiorna i segmenti della barra di forza
  function updateStrengthSegments(score) {
    // Resetta tutti i segmenti
    segments.forEach((segment) => {
      segment.className = "segment";
    });

    // Colora i segmenti in base al punteggio
    for (let i = 0; i < score && i < 4; i++) {
      if (score === 1) {
        segments[i].classList.add("weak");
      } else if (score === 2) {
        segments[i].classList.add("medium");
      } else if (score === 3) {
        segments[i].classList.add("strong");
      } else if (score >= 4) {
        segments[i].classList.add("ultra-strong");
      }
    }
  }

  // Controlla la forza della password
  function checkPasswordStrength(password) {
    // Se la password è vuota
    if (!password) {
      return {
        score: 0,
        crackTime: "Inserisci una password",
      };
    }

    let score = 0;

    // Controllo lunghezza
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Controllo complessità
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Penalizza pattern comuni
    if (/123|abc|qwerty|password|admin|welcome/i.test(password)) score -= 2;

    // Assicura che il punteggio sia tra 0-4
    score = Math.max(0, Math.min(4, score));

    // Calcola il tempo stimato di violazione
    const crackTime = estimateCrackTime(password, score);

    return {
      score: score,
      crackTime: crackTime,
    };
  }

  // Stima il tempo necessario per violare la password
  function estimateCrackTime(password, score) {
    const length = password.length;
    let possibleChars = 0;

    // Calcola la dimensione del set di caratteri
    if (/[a-z]/.test(password)) possibleChars += 26;
    if (/[A-Z]/.test(password)) possibleChars += 26;
    if (/[0-9]/.test(password)) possibleChars += 10;
    if (/[^A-Za-z0-9]/.test(password)) possibleChars += 33;

    // Predefinito almeno alle lettere minuscole
    possibleChars = Math.max(26, possibleChars);

    // Supponiamo 10 miliardi di tentativi al secondo per un attaccante sofisticato
    const guessesPerSecond = 10000000000;

    // Calcola il totale delle combinazioni possibili
    const combinations = Math.pow(possibleChars, length);

    // Calcola il tempo in secondi
    let seconds = combinations / guessesPerSecond;

    // Formatta il tempo
    if (seconds < 1) {
      return "Istantaneamente";
    } else if (seconds < 60) {
      return `${Math.round(seconds)} secondi`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)} minuti`;
    } else if (seconds < 86400) {
      return `${Math.round(seconds / 3600)} ore`;
    } else if (seconds < 31536000) {
      return `${Math.round(seconds / 86400)} giorni`;
    } else if (seconds < 3153600000) {
      // 100 anni
      return `${Math.round(seconds / 31536000)} anni`;
    } else {
      return "Più di 100 anni";
    }
  }

  // Aggiorna i suggerimenti
  function updateSuggestions(password, score) {
    let suggestions = [];

    if (password.length < 12) {
      suggestions.push("Usa almeno 12 caratteri");
    }

    if (!/[A-Z]/.test(password)) {
      suggestions.push("Aggiungi lettere maiuscole");
    }

    if (!/[a-z]/.test(password)) {
      suggestions.push("Aggiungi lettere minuscole");
    }

    if (!/[0-9]/.test(password)) {
      suggestions.push("Aggiungi numeri");
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      suggestions.push("Aggiungi simboli speciali (!@#$%^&*)");
    }

    if (/123|abc|qwerty|password|admin|welcome/i.test(password)) {
      suggestions.push("Evita sequenze comuni e parole prevedibili");
    }

    if (password.length > 0 && score >= 3 && suggestions.length === 0) {
      suggestions.push("Ottimo lavoro! La tua password è forte.");
    }

    // Aggiorna la lista dei suggerimenti
    suggestionsElement.innerHTML = "";
    suggestions.forEach((suggestion) => {
      const li = document.createElement("li");
      li.textContent = suggestion;
      suggestionsElement.appendChild(li);
    });
  }

  // Genera una password sicura
  function generateSecurePassword() {
    const length = 16;
    const charset = {
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
    };

    let password = "";

    // Assicurati che ci sia almeno un carattere di ogni tipo
    password += charset.lowercase.charAt(
      Math.floor(Math.random() * charset.lowercase.length),
    );
    password += charset.uppercase.charAt(
      Math.floor(Math.random() * charset.uppercase.length),
    );
    password += charset.numbers.charAt(
      Math.floor(Math.random() * charset.numbers.length),
    );
    password += charset.symbols.charAt(
      Math.floor(Math.random() * charset.symbols.length),
    );

    // Completa la password con caratteri casuali
    const allChars =
      charset.lowercase + charset.uppercase + charset.numbers + charset.symbols;
    for (let i = 4; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Mescola i caratteri della password
    return shuffleString(password);
  }

  // Mescola una stringa
  function shuffleString(string) {
    const array = string.split("");
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join("");
  }
});
