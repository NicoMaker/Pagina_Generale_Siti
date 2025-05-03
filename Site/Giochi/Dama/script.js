document.addEventListener("DOMContentLoaded", () => {
  // Game constants
  const BOARD_SIZE = 8;
  const PLAYER_WHITE = "white";
  const PLAYER_BLACK = "black";

  // Game state
  let board = [];
  let currentPlayer = PLAYER_WHITE;
  let selectedPiece = null;
  let validMoves = [];
  let mandatoryCaptures = [];
  let gameOver = false;
  let isDraw = false;
  let gameInProgress = false; // Nuova variabile per tracciare se la partita è in corso

  // Aggiungi queste nuove variabili per le statistiche
  let gameCount = 1;
  let whiteWins = 0;
  let blackWins = 0;
  let draws = 0;
  let whiteCaptured = 0;
  let blackCaptured = 0;

  // Impostazioni di gioco
  let mandatoryCapture = false; // Modificato da true a false per rendere la cattura facoltativa di default

  // DOM elements
  const boardElement = document.getElementById("board");
  const statusElement = document.getElementById("status");
  const resetButton = document.getElementById("reset");
  const restartButton = document.getElementById("restart");
  const toggleRulesButton = document.getElementById("toggle-rules");
  const rulesElement = document.getElementById("rules");
  const mandatoryCaptureToggle = document.getElementById("mandatory-capture");

  // Aggiungi questi nuovi riferimenti
  const resetAllButton = document.getElementById("reset-all");
  const gameCounterElement = document.getElementById("game-counter");
  const whiteWinsElement = document.getElementById("white-wins");
  const blackWinsElement = document.getElementById("black-wins");
  const drawsElement = document.getElementById("draws");
  const whiteCapturedElement = document.getElementById("white-captured");
  const blackCapturedElement = document.getElementById("black-captured");

  // Modal elements
  const confirmModal = document.getElementById("confirm-modal");
  const cancelResetButton = document.getElementById("cancel-reset");
  const confirmResetButton = document.getElementById("confirm-reset");

  // Draw modal elements
  const drawModal = document.getElementById("draw-modal");
  const continueGameButton = document.getElementById("continue-game");
  const newGameDrawButton = document.getElementById("new-game-draw");

  // Settings modal elements
  const settingsModal = document.getElementById("settings-modal");
  const captureSetting = document.getElementById("capture-setting");
  const saveSettingsButton = document.getElementById("save-settings");
  const cancelSettingsButton = document.getElementById("cancel-settings");

  // Initialize the game
  initGame();

  // Event listeners
  resetButton.addEventListener("click", () => {
    // Se la partita è finita in pareggio, mostra il modal di pareggio invece di resettare direttamente
    if (isDraw) {
      showDrawModal();
    } else {
      resetGame();
    }
  });

  restartButton.addEventListener("click", () => {
    // Controlla se la partita è in corso prima di permettere il riavvio
    if (gameInProgress) {
      restartGame();
    } else {
      showMessage(
        "Non puoi ricominciare una partita già conclusa. Inizia una nuova partita."
      );
    }
  });

  toggleRulesButton.addEventListener("click", toggleRules);
  resetAllButton.addEventListener("click", showResetConfirmation);
  mandatoryCaptureToggle.addEventListener("change", toggleMandatoryCapture);

  // Modal event listeners
  cancelResetButton.addEventListener("click", hideResetConfirmation);
  confirmResetButton.addEventListener("click", () => {
    hideResetConfirmation();
    resetAllStats();
  });

  // Draw modal event listeners
  continueGameButton.addEventListener("click", () => {
    hideDrawModal();
  });

  newGameDrawButton.addEventListener("click", () => {
    hideDrawModal();
    resetGame();
  });

  // Settings modal event listeners
  saveSettingsButton.addEventListener("click", () => {
    saveSettings();
    hideSettingsModal();
  });

  cancelSettingsButton.addEventListener("click", hideSettingsModal);

  // Funzione per mostrare il modal di conferma
  function showResetConfirmation() {
    confirmModal.classList.add("show");
  }

  // Funzione per nascondere il modal di conferma
  function hideResetConfirmation() {
    confirmModal.classList.remove("show");
  }

  // Funzione per mostrare il modal di pareggio
  function showDrawModal() {
    drawModal.classList.add("show");
  }

  // Funzione per nascondere il modal di pareggio
  function hideDrawModal() {
    drawModal.classList.remove("show");
  }

  // Funzione per mostrare il modal delle impostazioni
  function showSettingsModal() {
    // Imposta il valore corrente dell'opzione di cattura
    captureSetting.value = mandatoryCapture ? "mandatory" : "optional";
    settingsModal.classList.add("show");
  }

  // Funzione per nascondere il modal delle impostazioni
  function hideSettingsModal() {
    settingsModal.classList.remove("show");
  }

  // Funzione per salvare le impostazioni
  function saveSettings() {
    mandatoryCapture = captureSetting.value === "mandatory";
    mandatoryCaptureToggle.checked = mandatoryCapture;
    showMessage(
      `Impostazioni salvate! La cattura è ora ${
        mandatoryCapture ? "obbligatoria" : "facoltativa"
      }.`
    );
  }

  // Funzione per attivare/disattivare la cattura obbligatoria
  function toggleMandatoryCapture() {
    mandatoryCapture = mandatoryCaptureToggle.checked;
    showMessage(
      `La cattura è ora ${mandatoryCapture ? "obbligatoria" : "facoltativa"}.`
    );

    // Se la partita è in corso, aggiorna le mosse valide
    if (gameInProgress) {
      findMandatoryCaptures();
      if (selectedPiece) {
        findValidMoves(selectedPiece);
        clearSelection();
        selectPiece(selectedPiece.row, selectedPiece.col);
      }
    }
  }

  // Modifica la funzione initGame per impostare il giocatore iniziale in base al numero della partita
  function initGame() {
    createBoard();
    setupPieces();

    // Imposta il giocatore iniziale in base al numero della partita
    currentPlayer = gameCount % 2 === 0 ? PLAYER_BLACK : PLAYER_WHITE;

    // Resetta lo stato di pareggio
    isDraw = false;

    // Imposta la partita come in corso
    gameInProgress = true;

    // Abilita il pulsante "Ricomincia Partita"
    restartButton.disabled = false;
    restartButton.classList.remove("disabled-btn");

    updateStatus();
    updateStats();

    // Assicurati che lo switch della cattura obbligatoria sia impostato correttamente
    mandatoryCaptureToggle.checked = mandatoryCapture;
  }

  // Aggiungi questa funzione per aggiornare le statistiche visualizzate
  function updateStats() {
    gameCounterElement.textContent = `Partita: ${gameCount}`;
    whiteWinsElement.textContent = whiteWins;
    blackWinsElement.textContent = blackWins;
    drawsElement.textContent = draws;
    whiteCapturedElement.textContent = whiteCaptured;
    blackCapturedElement.textContent = blackCaptured;
  }

  function createBoard() {
    boardElement.innerHTML = "";
    board = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      board[row] = [];

      for (let col = 0; col < BOARD_SIZE; col++) {
        const square = document.createElement("div");
        square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`;
        square.dataset.row = row;
        square.dataset.col = col;

        // Only add click event to dark squares (playable)
        if ((row + col) % 2 === 1) {
          square.addEventListener("click", handleSquareClick);
        }

        boardElement.appendChild(square);
        board[row][col] = null;
      }
    }
  }

  function setupPieces() {
    // Place black pieces (rows 0-2)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if ((row + col) % 2 === 1) {
          createPiece(row, col, PLAYER_BLACK);
        }
      }
    }

    // Place white pieces (rows 5-7)
    for (let row = 5; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if ((row + col) % 2 === 1) {
          createPiece(row, col, PLAYER_WHITE);
        }
      }
    }

    // Find mandatory captures for the starting player
    findMandatoryCaptures();
  }

  function createPiece(row, col, player) {
    const piece = {
      player,
      isKing: false,
      row,
      col,
    };

    board[row][col] = piece;
    renderPiece(piece);
  }

  function renderPiece(piece) {
    if (!piece) return;

    const square = getSquareElement(piece.row, piece.col);

    // Remove existing piece if any
    const existingPiece = square.querySelector(".piece");
    if (existingPiece) {
      square.removeChild(existingPiece);
    }

    // Create new piece element
    const pieceElement = document.createElement("div");
    pieceElement.className = `piece ${piece.player}${
      piece.isKing ? " king" : ""
    }`;

    square.appendChild(pieceElement);
  }

  function getSquareElement(row, col) {
    return document.querySelector(
      `.square[data-row="${row}"][data-col="${col}"]`
    );
  }

  function handleSquareClick(event) {
    if (gameOver) return;

    const square = event.currentTarget;
    const row = Number.parseInt(square.dataset.row);
    const col = Number.parseInt(square.dataset.col);

    // If there's a piece at the clicked position and it belongs to the current player
    if (board[row][col] && board[row][col].player === currentPlayer) {
      // Se la cattura è obbligatoria e ci sono catture disponibili, controlla se il pezzo può catturare
      if (mandatoryCapture && mandatoryCaptures.length > 0) {
        const canCapture = mandatoryCaptures.some(
          (capture) => capture.piece.row === row && capture.piece.col === col
        );

        if (!canCapture) {
          showMessage("Cattura obbligatoria!");
          return;
        }
      }

      selectPiece(row, col);
    }
    // If a piece is already selected and the clicked square is a valid move
    else if (selectedPiece) {
      const move = validMoves.find((m) => m.toRow === row && m.toCol === col);

      if (move) {
        movePiece(move);

        // Check if the game is over
        checkGameOver();
      }
    }
  }

  function selectPiece(row, col) {
    // Clear previous selection
    clearSelection();

    // Select the new piece
    selectedPiece = board[row][col];
    const pieceElement = getSquareElement(row, col).querySelector(".piece");
    pieceElement.classList.add("selected");

    // Find valid moves for the selected piece
    findValidMoves(selectedPiece);

    // Highlight valid moves
    highlightValidMoves();
  }

  function clearSelection() {
    if (selectedPiece) {
      const pieceElement = getSquareElement(
        selectedPiece.row,
        selectedPiece.col
      ).querySelector(".piece");
      if (pieceElement) {
        pieceElement.classList.remove("selected");
      }
    }

    selectedPiece = null;

    // Remove move indicators
    document
      .querySelectorAll(".valid-move, .capture-move")
      .forEach((el) => el.remove());
  }

  function findValidMoves(piece) {
    validMoves = [];

    // Se la cattura è obbligatoria e ci sono catture disponibili, considera solo quelle per questo pezzo
    if (mandatoryCapture && mandatoryCaptures.length > 0) {
      const pieceMandatoryCaptures = mandatoryCaptures.filter(
        (capture) =>
          capture.piece.row === piece.row && capture.piece.col === piece.col
      );

      validMoves = pieceMandatoryCaptures;
      return;
    }

    // Regular moves (no captures)
    const directions = piece.isKing
      ? [
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ]
      : piece.player === PLAYER_WHITE
      ? [
          [-1, -1],
          [-1, 1],
        ]
      : [
          [1, -1],
          [1, 1],
        ];

    for (const [rowDir, colDir] of directions) {
      const newRow = piece.row + rowDir;
      const newCol = piece.col + colDir;

      if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
        validMoves.push({
          piece,
          toRow: newRow,
          toCol: newCol,
          captures: [],
        });
      }
    }

    // Check for captures
    const capturesMoves = [];
    findCaptures(piece, [], capturesMoves);

    // Aggiungi le mosse di cattura alle mosse valide
    validMoves = [...validMoves, ...capturesMoves];
  }

  // Modifica la funzione findCaptures per implementare la regola che le pedine non possono mangiare le dame
  function findCaptures(piece, capturedPieces = [], moves = []) {
    const directions = piece.isKing
      ? [
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ]
      : piece.player === PLAYER_WHITE
      ? [
          [-1, -1],
          [-1, 1],
        ]
      : [
          [1, -1],
          [1, 1],
        ];

    let captureFound = false;

    for (const [rowDir, colDir] of directions) {
      const jumpRow = piece.row + rowDir;
      const jumpCol = piece.col + colDir;
      const landRow = piece.row + 2 * rowDir;
      const landCol = piece.col + 2 * colDir;

      // Check if the jump position is valid and contains an opponent's piece
      if (
        isValidPosition(jumpRow, jumpCol) &&
        board[jumpRow][jumpCol] &&
        board[jumpRow][jumpCol].player !== piece.player &&
        !capturedPieces.some((p) => p.row === jumpRow && p.col === jumpCol)
      ) {
        // Aggiungi controllo: le pedine non possono mangiare le dame
        if (!piece.isKing && board[jumpRow][jumpCol].isKing) {
          continue; // Salta questa direzione se una pedina sta cercando di mangiare una dama
        }

        // Check if the landing position is valid and empty
        if (isValidPosition(landRow, landCol) && !board[landRow][landCol]) {
          captureFound = true;

          // Create a new list of captured pieces
          const newCapturedPieces = [
            ...capturedPieces,
            board[jumpRow][jumpCol],
          ];

          // Create a move object
          const move = {
            piece,
            toRow: landRow,
            toCol: landCol,
            captures: newCapturedPieces,
          };

          // Add the move to the list
          moves.push(move);

          // Temporarily move the piece to check for further captures
          const originalRow = piece.row;
          const originalCol = piece.col;
          piece.row = landRow;
          piece.col = landCol;

          // Recursively find more captures
          findCaptures(piece, newCapturedPieces, moves);

          // Move the piece back
          piece.row = originalRow;
          piece.col = originalCol;
        }
      }
    }

    return captureFound;
  }

  function findMandatoryCaptures() {
    // Se la cattura non è obbligatoria, non cercare catture obbligatorie
    if (!mandatoryCapture) {
      mandatoryCaptures = [];
      return;
    }

    mandatoryCaptures = [];
    let maxCaptureCount = 0;
    let hasDamaCapture = false;

    // Check all pieces of the current player
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];

        if (piece && piece.player === currentPlayer) {
          const pieceMoves = [];
          findCaptures(piece, [], pieceMoves);

          if (pieceMoves.length > 0) {
            // Find the maximum number of captures for this piece
            const maxPieceCaptures = Math.max(
              ...pieceMoves.map((move) => move.captures.length)
            );

            // Check if this piece can capture a dama
            const canCaptureDama = pieceMoves.some((move) =>
              move.captures.some((capture) => capture.isKing)
            );

            // If this is a dama and we haven't found a dama capture yet
            if (piece.isKing && !hasDamaCapture && pieceMoves.length > 0) {
              // Reset mandatory captures if this is the first dama with captures
              if (
                mandatoryCaptures.length === 0 ||
                !mandatoryCaptures[0].piece.isKing
              ) {
                mandatoryCaptures = [];
                maxCaptureCount = 0;
              }
              hasDamaCapture = true;
            }

            // If we found a dama capture, only consider dama captures
            if (hasDamaCapture && !piece.isKing) {
              continue;
            }

            // If this piece can capture more pieces than we've seen so far
            if (
              maxPieceCaptures > maxCaptureCount ||
              (canCaptureDama &&
                !mandatoryCaptures.some((move) =>
                  move.captures.some((capture) => capture.isKing)
                ))
            ) {
              mandatoryCaptures = pieceMoves.filter(
                (move) =>
                  move.captures.length === maxPieceCaptures ||
                  (canCaptureDama &&
                    move.captures.some((capture) => capture.isKing))
              );
              maxCaptureCount = maxPieceCaptures;
            }
            // If this piece can capture the same number of pieces
            else if (maxPieceCaptures === maxCaptureCount) {
              // Add these moves to the mandatory captures
              mandatoryCaptures.push(
                ...pieceMoves.filter(
                  (move) => move.captures.length === maxCaptureCount
                )
              );
            }
          }
        }
      }
    }
  }

  function highlightValidMoves() {
    validMoves.forEach((move) => {
      const square = getSquareElement(move.toRow, move.toCol);
      const indicator = document.createElement("div");
      indicator.className =
        move.captures.length > 0 ? "capture-move" : "valid-move";
      square.appendChild(indicator);
    });
  }

  // Modifica la funzione movePiece per contare i pezzi catturati
  function movePiece(move) {
    const { piece, toRow, toCol, captures } = move;

    // Remove the piece from its current position
    board[piece.row][piece.col] = null;

    // Update the piece's position
    piece.row = toRow;
    piece.col = toCol;

    // Place the piece in its new position
    board[toRow][toCol] = piece;

    // Remove captured pieces and update capture counts
    captures.forEach((capturedPiece) => {
      board[capturedPiece.row][capturedPiece.col] = null;
      getSquareElement(capturedPiece.row, capturedPiece.col).innerHTML = "";

      // Aggiorna i contatori dei pezzi catturati
      if (capturedPiece.player === PLAYER_WHITE) {
        whiteCaptured++;
      } else {
        blackCaptured++;
      }
    });

    // Aggiorna le statistiche se ci sono state catture
    if (captures.length > 0) {
      updateStats();
    }

    // Check if the piece should be promoted to a king
    if (
      !piece.isKing &&
      ((piece.player === PLAYER_WHITE && piece.row === 0) ||
        (piece.player === PLAYER_BLACK && piece.row === BOARD_SIZE - 1))
    ) {
      piece.isKing = true;
    }

    // Render the board
    renderBoard();

    // Clear selection
    clearSelection();

    // Check if the player can make another capture with the same piece
    const furtherCaptures = [];
    findCaptures(piece, [], furtherCaptures);

    if (mandatoryCapture && captures.length > 0 && furtherCaptures.length > 0) {
      // The player must continue capturing with the same piece
      selectedPiece = piece;
      validMoves = furtherCaptures;
      highlightValidMoves();

      // Add selected class to the piece
      const pieceElement = getSquareElement(piece.row, piece.col).querySelector(
        ".piece"
      );
      pieceElement.classList.add("selected");
    } else {
      // Switch to the other player
      currentPlayer =
        currentPlayer === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;
      updateStatus();

      // Find mandatory captures for the new current player
      findMandatoryCaptures();
    }
  }

  function renderBoard() {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const square = getSquareElement(row, col);
        square.innerHTML = "";

        if (board[row][col]) {
          renderPiece(board[row][col]);
        }
      }
    }
  }

  function updateStatus() {
    statusElement.textContent = `Turno: ${
      currentPlayer === PLAYER_WHITE ? "Bianco" : "Nero"
    }`;
    statusElement.style.backgroundColor =
      currentPlayer === PLAYER_WHITE ? "#f0f0f0" : "#333";
    statusElement.style.color =
      currentPlayer === PLAYER_WHITE ? "#333" : "#f0f0f0";
  }

  // Modifica la funzione checkGameOver per aggiornare le statistiche quando la partita finisce
  function checkGameOver() {
    // Count pieces for each player
    let whitePieces = 0;
    let blackPieces = 0;

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col]) {
          if (board[row][col].player === PLAYER_WHITE) {
            whitePieces++;
          } else {
            blackPieces++;
          }
        }
      }
    }

    // Check if a player has no pieces left
    if (whitePieces === 0 || blackPieces === 0) {
      gameOver = true;
      gameInProgress = false; // La partita non è più in corso
      const winner = whitePieces === 0 ? "Nero" : "Bianco";
      statusElement.textContent = `Partita finita! Vince: ${winner}`;

      // Aggiorna i contatori delle vittorie
      if (winner === "Bianco") {
        whiteWins++;
      } else {
        blackWins++;
      }

      updateStats();

      // Disabilita il pulsante "Ricomincia Partita" quando un giocatore vince
      restartButton.disabled = true;
      restartButton.classList.add("disabled-btn");

      // Mostra un messaggio di vittoria personalizzato
      showVictoryMessage(winner);
      return;
    }

    // Check if the current player has no valid moves
    findMandatoryCaptures();

    let hasValidMoves = false;

    // If there are mandatory captures, the player has valid moves
    if (mandatoryCaptures.length > 0) {
      hasValidMoves = true;
    } else {
      // Check if any piece of the current player can move
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const piece = board[row][col];

          if (piece && piece.player === currentPlayer) {
            const pieceMoves = [];

            // Check regular moves
            const directions = piece.isKing
              ? [
                  [-1, -1],
                  [-1, 1],
                  [1, -1],
                  [1, 1],
                ]
              : piece.player === PLAYER_WHITE
              ? [
                  [-1, -1],
                  [-1, 1],
                ]
              : [
                  [1, -1],
                  [1, 1],
                ];

            for (const [rowDir, colDir] of directions) {
              const newRow = piece.row + rowDir;
              const newCol = piece.col + colDir;

              if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
                hasValidMoves = true;
                break;
              }
            }

            if (hasValidMoves) break;
          }
        }

        if (hasValidMoves) break;
      }
    }

    // If the current player has no valid moves, the game is over
    if (!hasValidMoves) {
      gameOver = true;
      gameInProgress = false; // La partita non è più in corso

      // Se non ci sono mosse valide, è un pareggio
      if (whitePieces > 0 && blackPieces > 0) {
        isDraw = true;
        draws++;
        statusElement.textContent = `Partita finita in pareggio!`;
        showMessage("Partita finita in pareggio!");
        updateStats();

        // Disabilita il pulsante "Ricomincia Partita" quando la partita finisce in pareggio
        restartButton.disabled = true;
        restartButton.classList.add("disabled-btn");

        // Mostra il modal di pareggio
        setTimeout(() => {
          showDrawModal();
        }, 1000);
      } else {
        // Se un giocatore non ha pezzi, l'altro ha vinto
        const winner = currentPlayer === PLAYER_WHITE ? "Nero" : "Bianco";
        statusElement.textContent = `Partita finita! Vince: ${winner}`;

        // Aggiorna i contatori delle vittorie
        if (winner === "Bianco") {
          whiteWins++;
        } else {
          blackWins++;
        }

        updateStats();

        // Disabilita il pulsante "Ricomincia Partita" quando un giocatore vince
        restartButton.disabled = true;
        restartButton.classList.add("disabled-btn");

        // Mostra un messaggio di vittoria personalizzato
        showVictoryMessage(winner);
      }
    }
  }

  // Modifica la funzione resetGame per incrementare il contatore delle partite e resettare i contatori dei pezzi catturati
  function resetGame() {
    gameOver = false;
    gameCount++;
    whiteCaptured = 0;
    blackCaptured = 0;
    isDraw = false;
    gameInProgress = true; // La partita è ora in corso

    // Imposta il giocatore iniziale in base al numero della partita
    currentPlayer = gameCount % 2 === 0 ? PLAYER_BLACK : PLAYER_WHITE;

    selectedPiece = null;
    validMoves = [];
    mandatoryCaptures = [];

    // Riabilita il pulsante "Ricomincia Partita"
    restartButton.disabled = false;
    restartButton.classList.remove("disabled-btn");

    createBoard();
    setupPieces();
    updateStatus();
    updateStats();

    // Mostra un messaggio di conferma
    showMessage("Nuova partita iniziata!");
  }

  // Aggiungi questa nuova funzione per ricominciare la partita corrente
  function restartGame() {
    // Controlla se la partita è in corso
    if (!gameInProgress) {
      showMessage(
        "Non puoi ricominciare una partita già conclusa. Inizia una nuova partita."
      );
      return;
    }

    gameOver = false;
    whiteCaptured = 0;
    blackCaptured = 0;
    isDraw = false;
    gameInProgress = true; // La partita è ora in corso

    // Mantieni lo stesso giocatore iniziale in base al numero della partita
    currentPlayer = gameCount % 2 === 0 ? PLAYER_BLACK : PLAYER_WHITE;

    selectedPiece = null;
    validMoves = [];
    mandatoryCaptures = [];

    createBoard();
    setupPieces();
    updateStatus();
    updateStats();

    // Mostra un messaggio di conferma
    showMessage("Partita ricominciata!");
  }

  // Aggiungi questa funzione per resettare completamente tutte le statistiche
  function resetAllStats() {
    gameCount = 1;
    whiteWins = 0;
    blackWins = 0;
    draws = 0;
    whiteCaptured = 0;
    blackCaptured = 0;

    gameOver = false;
    isDraw = false;
    gameInProgress = true; // La partita è ora in corso
    selectedPiece = null;
    validMoves = [];
    mandatoryCaptures = [];

    // Riabilita il pulsante "Ricomincia Partita"
    restartButton.disabled = false;
    restartButton.classList.remove("disabled-btn");

    // Imposta il giocatore iniziale (partita 1 = bianco)
    currentPlayer = PLAYER_WHITE;

    createBoard();
    setupPieces();
    updateStatus();
    updateStats();

    // Mostra un messaggio di conferma
    showMessage(
      "Reset totale completato! Tutte le statistiche sono state azzerate."
    );
  }

  function toggleRules() {
    rulesElement.classList.toggle("hidden");
    toggleRulesButton.textContent = rulesElement.classList.contains("hidden")
      ? "Mostra Regole"
      : "Nascondi Regole";
  }

  function isValidPosition(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  }

  // Sostituisci la funzione showMessage con una versione personalizzata
  function showMessage(message) {
    // Rimuovi eventuali messaggi precedenti
    const existingMessage = document.querySelector(".custom-alert");
    if (existingMessage) {
      existingMessage.remove();
    }

    // Crea l'elemento alert
    const alertElement = document.createElement("div");
    alertElement.className = "custom-alert";

    // Crea il contenuto dell'alert
    const alertContent = document.createElement("div");
    alertContent.className = "alert-content";

    // Aggiungi il messaggio
    const messageElement = document.createElement("p");
    messageElement.textContent = message;

    // Aggiungi il pulsante di chiusura
    const closeButton = document.createElement("button");
    closeButton.className = "alert-close-btn";
    closeButton.textContent = "OK";
    closeButton.addEventListener("click", () => {
      alertElement.classList.add("fade-out");
      setTimeout(() => {
        alertElement.remove();
      }, 300);
    });

    // Assembla l'alert
    alertContent.appendChild(messageElement);
    alertContent.appendChild(closeButton);
    alertElement.appendChild(alertContent);

    // Aggiungi l'alert al documento
    document.body.appendChild(alertElement);

    // Aggiungi la classe per l'animazione di entrata
    setTimeout(() => {
      alertElement.classList.add("show");
    }, 10);

    // Auto-chiusura dopo 3 secondi
    setTimeout(() => {
      if (document.body.contains(alertElement)) {
        alertElement.classList.add("fade-out");
        setTimeout(() => {
          if (document.body.contains(alertElement)) {
            alertElement.remove();
          }
        }, 300);
      }
    }, 3000);
  }

  function showVictoryMessage(winner) {
    // Rimuovi eventuali messaggi precedenti
    const existingMessage = document.querySelector(".custom-alert");
    if (existingMessage) {
      existingMessage.remove();
    }

    // Crea l'elemento alert
    const alertElement = document.createElement("div");
    alertElement.className = "custom-alert victory-alert";

    // Crea il contenuto dell'alert
    const alertContent = document.createElement("div");
    alertContent.className = "alert-content victory-content";

    // Aggiungi il titolo
    const titleElement = document.createElement("h3");
    titleElement.textContent = "🏆 VITTORIA! 🏆";
    titleElement.className = "victory-title";

    // Aggiungi il messaggio
    const messageElement = document.createElement("p");
    messageElement.textContent = `Il giocatore ${winner} ha vinto la partita!`;
    messageElement.className = "victory-message";

    // Aggiungi statistiche
    const statsElement = document.createElement("div");
    statsElement.className = "victory-stats";
    statsElement.innerHTML = `
      <p>Partita #${gameCount}</p>
      <p>Vittorie Bianco: ${whiteWins} | Vittorie Nero: ${blackWins} | Pareggi: ${draws}</p>
    `;

    // Aggiungi il pulsante di chiusura
    const closeButton = document.createElement("button");
    closeButton.className = "alert-close-btn victory-btn";
    closeButton.textContent = "Continua";
    closeButton.addEventListener("click", () => {
      alertElement.classList.add("fade-out");
      setTimeout(() => {
        alertElement.remove();
      }, 300);
    });

    // Aggiungi confetti (elementi decorativi)
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.animationDelay = `${Math.random() * 3}s`;
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
      alertElement.appendChild(confetti);
    }

    // Assembla l'alert
    alertContent.appendChild(titleElement);
    alertContent.appendChild(messageElement);
    alertContent.appendChild(statsElement);
    alertContent.appendChild(closeButton);
    alertElement.appendChild(alertContent);

    // Aggiungi l'alert al documento
    document.body.appendChild(alertElement);

    // Aggiungi la classe per l'animazione di entrata
    setTimeout(() => {
      alertElement.classList.add("show");
    }, 10);

    // Non chiudere automaticamente l'alert di vittoria, lascia che l'utente lo chiuda
  }
});
