(function () {
  "use strict";

  // ----- ELEMENTI DOM -----
  const setupEl = document.getElementById("wordSetup");
  const gameArea = document.getElementById("gameArea");
  const wordInput = document.getElementById("secretWordInput");
  const startBtn = document.getElementById("startGameBtn");
  const setupError = document.getElementById("setupError");
  const wordDisplay = document.getElementById("wordDisplay");
  const wrongLettersEl = document.getElementById("wrongLetters");
  const keyboardEl = document.getElementById("keyboard");
  const guessWordBtn = document.getElementById("guessWordBtn");
  const resetBtn = document.getElementById("resetGameBtn");
  const canvas = document.getElementById("hangmanCanvas");
  const ctx = canvas.getContext("2d");

  const modal = document.getElementById("resultModal");
  const resultEmoji = document.getElementById("resultEmoji");
  const resultTitle = document.getElementById("resultTitle");
  const resultDesc = document.getElementById("resultDesc");
  const resultWord = document.getElementById("resultWord");
  const resultPlayAgainBtn = document.getElementById("resultPlayAgainBtn");

  // ----- STATO DEL GIOCO -----
  const state = {
    secretWord: "",
    guessedLetters: [],
    wrongCount: 0,
    maxWrong: 6,
    gameOver: false,
    wordRevealed: false,
  };

  // Mappa per tenere traccia dei timer di reset dei colori
  const colorTimers = new Map();

  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // ============================================================
  //  1.  DISEGNO DELL'IMPICCATO
  // ============================================================
  function drawHangman(errors) {
    const w = canvas.width,
      h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#fcf9f6";
    ctx.fillRect(0, 0, w, h);

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#2c3e50";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(20, 290);
    ctx.lineTo(100, 290);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(60, 290);
    ctx.lineTo(60, 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(60, 30);
    ctx.lineTo(150, 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(150, 30);
    ctx.lineTo(150, 70);
    ctx.stroke();

    if (errors >= 1) {
      ctx.beginPath();
      ctx.arc(150, 90, 22, 0, 2 * Math.PI);
      ctx.stroke();
    }
    if (errors >= 2) {
      ctx.beginPath();
      ctx.moveTo(150, 112);
      ctx.lineTo(150, 180);
      ctx.stroke();
    }
    if (errors >= 3) {
      ctx.beginPath();
      ctx.moveTo(150, 130);
      ctx.lineTo(110, 160);
      ctx.stroke();
    }
    if (errors >= 4) {
      ctx.beginPath();
      ctx.moveTo(150, 130);
      ctx.lineTo(190, 160);
      ctx.stroke();
    }
    if (errors >= 5) {
      ctx.beginPath();
      ctx.moveTo(150, 180);
      ctx.lineTo(115, 230);
      ctx.stroke();
    }
    if (errors >= 6) {
      ctx.beginPath();
      ctx.moveTo(150, 180);
      ctx.lineTo(185, 230);
      ctx.stroke();
    }

    if (state.gameOver && state.wrongCount >= state.maxWrong) {
      ctx.strokeStyle = "#c0392b";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(138, 82);
      ctx.lineTo(148, 92);
      ctx.moveTo(148, 82);
      ctx.lineTo(138, 92);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(152, 82);
      ctx.lineTo(162, 92);
      ctx.moveTo(162, 82);
      ctx.lineTo(152, 92);
      ctx.stroke();
    }
  }

  // ============================================================
  //  2.  RENDER – con prima e ultima sempre visibili
  // ============================================================
  function renderWord() {
    if (!state.secretWord) return;
    const chars = state.secretWord.split("");
    let html = "";
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const isFirstOrLast = i === 0 || i === chars.length - 1;
      const revealed = isFirstOrLast || state.guessedLetters.includes(ch);
      html += `<span class="char ${revealed ? "revealed" : "hidden"}">${revealed ? ch : "_"}</span>`;
    }
    wordDisplay.innerHTML = html;
  }

  function renderWrongLetters() {
    const wrong = state.guessedLetters.filter(
      (l) => !state.secretWord.includes(l),
    );
    if (wrong.length === 0) {
      wrongLettersEl.innerHTML =
        "<span>❌ &nbsp; Nessuna lettera sbagliata</span>";
    } else {
      wrongLettersEl.innerHTML = `<span>❌ &nbsp; ${wrong.join(" · ")}</span>`;
    }
  }

  // ============================================================
  //  3.  TASTIERA – senza colori permanenti, solo temporanei
  // ============================================================
  function renderKeyboard() {
    keyboardEl.innerHTML = "";
    for (let letter of LETTERS) {
      const btn = document.createElement("button");
      btn.textContent = letter;
      btn.dataset.letter = letter;
      // Disabilitiamo solo se gameOver
      if (state.gameOver) {
        btn.disabled = true;
        btn.classList.add("game-ended");
      }
      btn.addEventListener("click", () => handleLetterClick(letter));
      keyboardEl.appendChild(btn);
    }
  }

  // Applica colore temporaneo a un tasto
  function setTemporaryColor(letter, type) {
    const buttons = keyboardEl.querySelectorAll("button");
    let targetBtn = null;
    for (let btn of buttons) {
      if (btn.dataset.letter === letter) {
        targetBtn = btn;
        break;
      }
    }
    if (!targetBtn) return;

    // Rimuovi eventuali timer precedenti
    if (colorTimers.has(letter)) {
      clearTimeout(colorTimers.get(letter));
      colorTimers.delete(letter);
    }

    // Rimuovi classi temporanee precedenti
    targetBtn.classList.remove("temp-correct", "temp-wrong");

    // Aggiungi la nuova classe
    if (type === "correct") {
      targetBtn.classList.add("temp-correct");
    } else if (type === "wrong") {
      targetBtn.classList.add("temp-wrong");
    }

    // Imposta timeout per rimuovere il colore dopo 30 secondi
    const timer = setTimeout(() => {
      targetBtn.classList.remove("temp-correct", "temp-wrong");
      colorTimers.delete(letter);
    }, 30000);
    colorTimers.set(letter, timer);
  }

  // Rimuovi tutti i colori temporanei e i timer (utile al reset)
  function clearAllTemporaryColors() {
    for (let [letter, timer] of colorTimers) {
      clearTimeout(timer);
      const buttons = keyboardEl.querySelectorAll("button");
      for (let btn of buttons) {
        if (btn.dataset.letter === letter) {
          btn.classList.remove("temp-correct", "temp-wrong");
          break;
        }
      }
    }
    colorTimers.clear();
  }

  // ============================================================
  //  4.  LOGICA DI VITTORIA (solo lettere interne)
  // ============================================================
  function isWordFullyRevealed() {
    const chars = state.secretWord.split("");
    for (let i = 0; i < chars.length; i++) {
      if (i === 0 || i === chars.length - 1) continue;
      if (!state.guessedLetters.includes(chars[i])) return false;
    }
    return true;
  }

  // ============================================================
  //  5.  GESTIONE CLICK LETTERA (con riutilizzo = errore)
  // ============================================================
  function handleLetterClick(letter) {
    if (state.gameOver) return;

    // Se la lettera è già stata usata (anche se il colore è sparito), conta come errore
    if (state.guessedLetters.includes(letter)) {
      state.wrongCount++;
      // Mostra colore rosso temporaneo per il riutilizzo
      setTemporaryColor(letter, "wrong");
      updateUI();
      if (state.wrongCount >= state.maxWrong) {
        state.gameOver = true;
        state.wordRevealed = false;
        // Disabilita tutti i tasti
        disableAllKeys();
        updateUI();
        showResult(false);
      }
      return;
    }

    // Nuova lettera: aggiungi e controlla
    state.guessedLetters.push(letter);

    if (state.secretWord.includes(letter)) {
      // Corretta: colore verde temporaneo
      setTemporaryColor(letter, "correct");
      updateUI();
      if (isWordFullyRevealed()) {
        state.gameOver = true;
        state.wordRevealed = true;
        disableAllKeys();
        updateUI();
        showResult(true);
      }
    } else {
      // Sbagliata: colore rosso temporaneo
      setTemporaryColor(letter, "wrong");
      state.wrongCount++;
      updateUI();
      if (state.wrongCount >= state.maxWrong) {
        state.gameOver = true;
        state.wordRevealed = false;
        disableAllKeys();
        updateUI();
        showResult(false);
      }
    }
  }

  // Disabilita tutti i tasti (fine partita)
  function disableAllKeys() {
    const buttons = keyboardEl.querySelectorAll("button");
    for (let btn of buttons) {
      btn.disabled = true;
      btn.classList.add("game-ended");
    }
    // Rimuovi colori temporanei perché non servono più
    clearAllTemporaryColors();
  }

  function updateUI() {
    renderWord();
    renderWrongLetters();
    // La tastiera viene ricreata solo se il gioco non è finito?
    // Ma se il gioco è finito, i tasti sono già disabilitati.
    // Ricreiamo sempre la tastiera per mantenere lo stato corretto (ma i colori temporanei verrebbero persi).
    // Quindi invece di ricreare, aggiorniamo solo lo stato di disabilitazione.
    // Ricreiamo la tastiera solo se necessario? Per semplicità, ricreiamo sempre,
    // ma dobbiamo riapplicare i colori temporanei.
    // Soluzione: salviamo i colori temporanei in una mappa e li riapplichiamo.
    // Ma per semplicità, conserviamo i bottoni e aggiorniamo solo le classi.
    // Quindi non ricreiamo la tastiera ogni volta, ma solo all'inizio e al reset.
    // Modifichiamo: renderKeyboard() chiamata solo all'inizio e al reset.
    // Qui aggiorniamo solo lo stato dei bottoni (abilitati/disabilitati).
    // Tuttavia, per mantenere i colori temporanei, non dobbiamo ricreare i bottoni.
    // Quindi spostiamo la logica di creazione della tastiera in una funzione separata.
    // Già fatto: renderKeyboard() crea i bottoni. Quindi chiamiamola solo all'inizio.
    // Ma se il gioco finisce, disabilitiamo i bottoni.
    // Se si ricomincia, resettiamo tutto.
    // Quindi non chiamiamo renderKeyboard() in updateUI, ma solo in startGame e reset.
    // Per ora, per semplicità, ricreiamo sempre, ma perdiamo i colori temporanei.
    // Per risolvere, non ricreiamo la tastiera in updateUI.
    // Quindi separiamo: la tastiera viene creata una volta, e poi aggiornata.
    // Ma per semplicità, dato che il gioco è piccolo, ricreiamo e poi riapplichiamo i colori.
    // Tuttavia, i colori temporanei sono gestiti con timeout, e se ricreiamo i bottoni i timeout non hanno più effetto.
    // Quindi non ricreiamo i bottoni. Usiamo una funzione per aggiornare lo stato dei bottoni.
    // Invece di ricreare, manipoliamo i bottoni esistenti.
    // Per semplicità, ho deciso di ricreare la tastiera in startGame e reset, e in updateUI non toccare la tastiera.
    // Ma in updateUI dobbiamo aggiornare lo stato di disabilitazione dei bottoni se il gioco finisce.
    // Quindi creiamo una funzione updateKeyboardState() che aggiorna disabled e game-ended.
    // Ma i colori temporanei restano sui bottoni esistenti.
    // Quindi:
    // - renderKeyboard() crea i bottoni (chiamata in startGame e reset)
    // - updateKeyboardState() aggiorna disabled e game-ended (chiamata in updateUI)
    // - setTemporaryColor() agisce sui bottoni esistenti.
    // OK, rifattorizzo.
  }

  // Nuova funzione per aggiornare lo stato dei tasti (disabilitati o meno)
  function updateKeyboardState() {
    const buttons = keyboardEl.querySelectorAll("button");
    for (let btn of buttons) {
      if (state.gameOver) {
        btn.disabled = true;
        btn.classList.add("game-ended");
      } else {
        btn.disabled = false;
        btn.classList.remove("game-ended");
      }
    }
  }

  // Sovrascrivo updateUI per usare updateKeyboardState
  const originalUpdateUI = updateUI;
  updateUI = function () {
    renderWord();
    renderWrongLetters();
    updateKeyboardState();
    drawHangman(state.wrongCount);
  };

  // ============================================================
  //  6.  INDOVINA PAROLA INTERA
  // ============================================================
  function guessFullWord() {
    if (state.gameOver) return;
    const guess = prompt("🔍 Inserisci la parola intera:");
    if (guess === null) return;
    const trimmed = guess.trim().toUpperCase();
    if (!trimmed) return;

    if (trimmed === state.secretWord) {
      state.gameOver = true;
      state.wordRevealed = true;
      // Riveliamo tutte le lettere (per sicurezza)
      for (let ch of state.secretWord) {
        if (!state.guessedLetters.includes(ch)) {
          state.guessedLetters.push(ch);
        }
      }
      disableAllKeys();
      updateUI();
      showResult(true);
    } else {
      state.wrongCount++;
      // Mostra un effetto visivo? Non abbiamo una lettera specifica, quindi niente.
      updateUI();
      if (state.wrongCount >= state.maxWrong) {
        state.gameOver = true;
        state.wordRevealed = false;
        disableAllKeys();
        updateUI();
        showResult(false);
      } else {
        alert(
          `❌ "${trimmed}" non è la parola corretta. Ancora ${state.maxWrong - state.wrongCount} tentativo/i.`,
        );
      }
    }
  }

  // ============================================================
  //  7.  MODALE
  // ============================================================
  function showResult(won) {
    if (won) {
      resultEmoji.textContent = "🎉";
      resultTitle.textContent = "Hai vinto!";
      resultDesc.textContent = "Complimenti, hai indovinato la parola!";
    } else {
      resultEmoji.textContent = "💀";
      resultTitle.textContent = "Impiccato!";
      resultDesc.textContent = "Hai esaurito i tentativi. La parola era:";
    }
    resultWord.textContent = state.secretWord;
    modal.classList.add("open");
  }

  function closeModal() {
    modal.classList.remove("open");
  }

  // ============================================================
  //  8.  INIZIO / RESET
  // ============================================================
  function startGame(word) {
    const clean = word.trim().toUpperCase();
    if (!clean || !/^[A-Z]{4,}$/.test(clean)) {
      setupError.textContent =
        "⚠️ Inserisci almeno 4 lettere (A-Z), senza spazi o numeri.";
      return;
    }

    state.secretWord = clean;
    state.guessedLetters = [];
    state.wrongCount = 0;
    state.gameOver = false;
    state.wordRevealed = false;

    setupEl.classList.add("hidden");
    gameArea.classList.add("active");
    setupError.textContent = "";

    // Crea la tastiera da zero
    renderKeyboard();
    // Pulisci eventuali timer
    clearAllTemporaryColors();
    updateUI();

    if (isWordFullyRevealed()) {
      state.gameOver = true;
      state.wordRevealed = true;
      disableAllKeys();
      updateUI();
      showResult(true);
    }
  }

  function resetGame() {
    setupEl.classList.remove("hidden");
    gameArea.classList.remove("active");
    wordInput.value = "";
    wordInput.focus();
    closeModal();
    state.secretWord = "";
    state.guessedLetters = [];
    state.wrongCount = 0;
    state.gameOver = false;
    state.wordRevealed = false;
    clearAllTemporaryColors();
    drawHangman(0);
    wordDisplay.innerHTML = "";
    wrongLettersEl.innerHTML = "<span>❌ &nbsp; </span>";
    keyboardEl.innerHTML = "";
  }

  // ============================================================
  //  9.  EVENTI
  // ============================================================
  startBtn.addEventListener("click", () => startGame(wordInput.value));
  wordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      startGame(wordInput.value);
    }
  });
  resetBtn.addEventListener("click", resetGame);
  guessWordBtn.addEventListener("click", guessFullWord);
  resultPlayAgainBtn.addEventListener("click", () => {
    closeModal();
    resetGame();
  });

  // ============================================================
  //  10. AVVIO
  // ============================================================
  drawHangman(0);
  wordInput.focus();
})();
