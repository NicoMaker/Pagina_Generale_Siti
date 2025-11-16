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
  let gameInProgress = false;

  // Statistics
  let gameCount = 1;
  let whiteWins = 0;
  let blackWins = 0;
  let draws = 0;
  let whiteCaptured = 0;
  let blackCaptured = 0;

  // Game settings
  let mandatoryCapture = false;

  // DOM elements
  const boardElement = document.getElementById("board");
  const statusElement = document.getElementById("status");
  const resetButton = document.getElementById("reset");
  const restartButton = document.getElementById("restart");
  const toggleRulesButton = document.getElementById("toggle-rules");
  const rulesElement = document.getElementById("rules");
  const mandatoryCaptureToggle = document.getElementById("mandatory-capture");
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

  // Initialize the game
  initGame();

  // Event listeners
  resetButton.addEventListener("click", () => {
    if (gameInProgress) {
      showMessage(
        "Non puoi iniziare una nuova partita mentre una è in corso! Usa 'Ricomincia Partita' per ricominciare."
      );
    } else {
      if (isDraw) {
        showDrawModal();
      } else {
        resetGame();
      }
    }
  });

  restartButton.addEventListener("click", () => {
    if (!gameInProgress) {
      showMessage(
        "Non puoi ricominciare una partita già conclusa. Inizia una nuova partita."
      );
    } else {
      restartGame();
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

  function showResetConfirmation() {
    confirmModal.classList.add("show");
  }

  function hideResetConfirmation() {
    confirmModal.classList.remove("show");
  }

  function showDrawModal() {
    drawModal.classList.add("show");
  }

  function hideDrawModal() {
    drawModal.classList.remove("show");
  }

  function toggleMandatoryCapture() {
    mandatoryCapture = mandatoryCaptureToggle.checked;
    showMessage(
      `La cattura è ora ${mandatoryCapture ? "obbligatoria" : "facoltativa"}.`
    );

    if (gameInProgress) {
      findMandatoryCaptures();
      if (selectedPiece) {
        findValidMoves(selectedPiece);
        clearSelection();
        selectPiece(selectedPiece.row, selectedPiece.col);
      }
    }
  }

  function initGame() {
    createBoard();
    setupPieces();

    currentPlayer = gameCount % 2 === 0 ? PLAYER_BLACK : PLAYER_WHITE;
    isDraw = false;
    gameInProgress = true;
    gameOver = false;

    updateButtonStates();
    updateStatus();
    updateStats();

    mandatoryCaptureToggle.checked = mandatoryCapture;
  }

  function updateButtonStates() {
    if (gameInProgress) {
      // Partita in corso: Ricomincia abilitato, Nuova Partita disabilitato
      restartButton.disabled = false;
      restartButton.classList.remove("disabled-btn");
      resetButton.disabled = true;
      resetButton.classList.add("disabled-btn");
    } else {
      // Partita finita: Nuova Partita abilitato, Ricomincia disabilitato
      restartButton.disabled = true;
      restartButton.classList.add("disabled-btn");
      resetButton.disabled = false;
      resetButton.classList.remove("disabled-btn");
    }
  }

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

        if ((row + col) % 2 === 1) {
          square.addEventListener("click", handleSquareClick);
        }

        boardElement.appendChild(square);
        board[row][col] = null;
      }
    }
  }

  function setupPieces() {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if ((row + col) % 2 === 1) {
          createPiece(row, col, PLAYER_BLACK);
        }
      }
    }

    for (let row = 5; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if ((row + col) % 2 === 1) {
          createPiece(row, col, PLAYER_WHITE);
        }
      }
    }

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
    const existingPiece = square.querySelector(".piece");
    if (existingPiece) {
      square.removeChild(existingPiece);
    }

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

    if (board[row][col] && board[row][col].player === currentPlayer) {
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
    } else if (selectedPiece) {
      const move = validMoves.find((m) => m.toRow === row && m.toCol === col);

      if (move) {
        movePiece(move);
        checkGameOver();
      }
    }
  }

  function selectPiece(row, col) {
    clearSelection();

    selectedPiece = board[row][col];
    const pieceElement = getSquareElement(row, col).querySelector(".piece");
    pieceElement.classList.add("selected");

    findValidMoves(selectedPiece);
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

    document
      .querySelectorAll(".valid-move, .capture-move")
      .forEach((el) => el.remove());
  }

  function findValidMoves(piece) {
    validMoves = [];

    if (mandatoryCapture && mandatoryCaptures.length > 0) {
      const pieceMandatoryCaptures = mandatoryCaptures.filter(
        (capture) =>
          capture.piece.row === piece.row && capture.piece.col === piece.col
      );

      validMoves = pieceMandatoryCaptures;
      return;
    }

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

    const capturesMoves = [];
    findCaptures(piece, [], capturesMoves);
    validMoves = [...validMoves, ...capturesMoves];
  }

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

      if (
        isValidPosition(jumpRow, jumpCol) &&
        board[jumpRow][jumpCol] &&
        board[jumpRow][jumpCol].player !== piece.player &&
        !capturedPieces.some((p) => p.row === jumpRow && p.col === jumpCol)
      ) {
        if (!piece.isKing && board[jumpRow][jumpCol].isKing) {
          continue;
        }

        if (isValidPosition(landRow, landCol) && !board[landRow][landCol]) {
          captureFound = true;

          const newCapturedPieces = [
            ...capturedPieces,
            board[jumpRow][jumpCol],
          ];

          const move = {
            piece,
            toRow: landRow,
            toCol: landCol,
            captures: newCapturedPieces,
          };

          moves.push(move);

          const originalRow = piece.row;
          const originalCol = piece.col;
          piece.row = landRow;
          piece.col = landCol;

          findCaptures(piece, newCapturedPieces, moves);

          piece.row = originalRow;
          piece.col = originalCol;
        }
      }
    }

    return captureFound;
  }

  function findMandatoryCaptures() {
    if (!mandatoryCapture) {
      mandatoryCaptures = [];
      return;
    }

    mandatoryCaptures = [];
    let maxCaptureCount = 0;
    let hasDamaCapture = false;

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];

        if (piece && piece.player === currentPlayer) {
          const pieceMoves = [];
          findCaptures(piece, [], pieceMoves);

          if (pieceMoves.length > 0) {
            const maxPieceCaptures = Math.max(
              ...pieceMoves.map((move) => move.captures.length)
            );

            const canCaptureDama = pieceMoves.some((move) =>
              move.captures.some((capture) => capture.isKing)
            );

            if (piece.isKing && !hasDamaCapture && pieceMoves.length > 0) {
              if (
                mandatoryCaptures.length === 0 ||
                !mandatoryCaptures[0].piece.isKing
              ) {
                mandatoryCaptures = [];
                maxCaptureCount = 0;
              }
              hasDamaCapture = true;
            }

            if (hasDamaCapture && !piece.isKing) {
              continue;
            }

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
            } else if (maxPieceCaptures === maxCaptureCount) {
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

  function movePiece(move) {
    const { piece, toRow, toCol, captures } = move;

    board[piece.row][piece.col] = null;
    piece.row = toRow;
    piece.col = toCol;
    board[toRow][toCol] = piece;

    captures.forEach((capturedPiece) => {
      board[capturedPiece.row][capturedPiece.col] = null;
      getSquareElement(capturedPiece.row, capturedPiece.col).innerHTML = "";

      if (capturedPiece.player === PLAYER_WHITE) {
        whiteCaptured++;
      } else {
        blackCaptured++;
      }
    });

    if (captures.length > 0) {
      updateStats();
    }

    if (
      !piece.isKing &&
      ((piece.player === PLAYER_WHITE && piece.row === 0) ||
        (piece.player === PLAYER_BLACK && piece.row === BOARD_SIZE - 1))
    ) {
      piece.isKing = true;
    }

    renderBoard();
    clearSelection();

    const furtherCaptures = [];
    findCaptures(piece, [], furtherCaptures);

    if (mandatoryCapture && captures.length > 0 && furtherCaptures.length > 0) {
      selectedPiece = piece;
      validMoves = furtherCaptures;
      highlightValidMoves();

      const pieceElement = getSquareElement(piece.row, piece.col).querySelector(
        ".piece"
      );
      pieceElement.classList.add("selected");
    } else {
      currentPlayer =
        currentPlayer === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;
      updateStatus();
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

  function checkGameOver() {
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

    if (whitePieces === 0 || blackPieces === 0) {
      gameOver = true;
      gameInProgress = false;
      const winner = whitePieces === 0 ? "Nero" : "Bianco";
      statusElement.textContent = `Partita finita! Vince: ${winner}`;

      if (winner === "Bianco") {
        whiteWins++;
      } else {
        blackWins++;
      }

      updateStats();
      updateButtonStates();
      showVictoryMessage(winner);
      return;
    }

    findMandatoryCaptures();

    let hasValidMoves = false;

    if (mandatoryCaptures.length > 0) {
      hasValidMoves = true;
    } else {
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const piece = board[row][col];

          if (piece && piece.player === currentPlayer) {
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

    if (!hasValidMoves) {
      gameOver = true;
      gameInProgress = false;

      if (whitePieces > 0 && blackPieces > 0) {
        isDraw = true;
        draws++;
        statusElement.textContent = `Partita finita in pareggio!`;
        showMessage("Partita finita in pareggio!");
        updateStats();
        updateButtonStates();

        setTimeout(() => {
          showDrawModal();
        }, 1000);
      } else {
        const winner = currentPlayer === PLAYER_WHITE ? "Nero" : "Bianco";
        statusElement.textContent = `Partita finita! Vince: ${winner}`;

        if (winner === "Bianco") {
          whiteWins++;
        } else {
          blackWins++;
        }

        updateStats();
        updateButtonStates();
        showVictoryMessage(winner);
      }
    }
  }

  function resetGame() {
    gameOver = false;
    gameCount++;
    whiteCaptured = 0;
    blackCaptured = 0;
    isDraw = false;
    gameInProgress = true;

    currentPlayer = gameCount % 2 === 0 ? PLAYER_BLACK : PLAYER_WHITE;

    selectedPiece = null;
    validMoves = [];
    mandatoryCaptures = [];

    createBoard();
    setupPieces();
    updateStatus();
    updateStats();
    updateButtonStates();

    showMessage("Nuova partita iniziata!");
  }

  function restartGame() {
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
    gameInProgress = true;

    currentPlayer = gameCount % 2 === 0 ? PLAYER_BLACK : PLAYER_WHITE;

    selectedPiece = null;
    validMoves = [];
    mandatoryCaptures = [];

    createBoard();
    setupPieces();
    updateStatus();
    updateStats();
    updateButtonStates();

    showMessage("Partita ricominciata!");
  }

  function resetAllStats() {
    gameCount = 1;
    whiteWins = 0;
    blackWins = 0;
    draws = 0;
    whiteCaptured = 0;
    blackCaptured = 0;

    gameOver = false;
    isDraw = false;
    gameInProgress = true;
    selectedPiece = null;
    validMoves = [];
    mandatoryCaptures = [];

    currentPlayer = PLAYER_WHITE;

    createBoard();
    setupPieces();
    updateStatus();
    updateStats();
    updateButtonStates();

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

  function showMessage(message) {
    const existingMessage = document.querySelector(".custom-alert");
    if (existingMessage) {
      existingMessage.remove();
    }

    const alertElement = document.createElement("div");
    alertElement.className = "custom-alert";

    const alertContent = document.createElement("div");
    alertContent.className = "alert-content";

    const messageElement = document.createElement("p");
    messageElement.textContent = message;

    const closeButton = document.createElement("button");
    closeButton.className = "alert-close-btn";
    closeButton.textContent = "OK";
    closeButton.addEventListener("click", () => {
      alertElement.classList.add("fade-out");
      setTimeout(() => {
        alertElement.remove();
      }, 300);
    });

    alertContent.appendChild(messageElement);
    alertContent.appendChild(closeButton);
    alertElement.appendChild(alertContent);

    document.body.appendChild(alertElement);

    setTimeout(() => {
      alertElement.classList.add("show");
    }, 10);

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
    const existingMessage = document.querySelector(".custom-alert");
    if (existingMessage) {
      existingMessage.remove();
    }

    const alertElement = document.createElement("div");
    alertElement.className = "custom-alert victory-alert";

    const alertContent = document.createElement("div");
    alertContent.className = "alert-content victory-content";

    const titleElement = document.createElement("h3");
    titleElement.textContent = "🏆 VITTORIA! 🏆";
    titleElement.className = "victory-title";

    const messageElement = document.createElement("p");
    messageElement.textContent = `Il giocatore ${winner} ha vinto la partita!`;
    messageElement.className = "victory-message";

    const statsElement = document.createElement("div");
    statsElement.className = "victory-stats";
    statsElement.innerHTML = `
      <p>Partita #${gameCount}</p>
      <p>Vittorie Bianco: ${whiteWins} | Vittorie Nero: ${blackWins} | Pareggi: ${draws}</p>
    `;

    const closeButton = document.createElement("button");
    closeButton.className = "alert-close-btn victory-btn";
    closeButton.textContent = "Continua";
    closeButton.addEventListener("click", () => {
      alertElement.classList.add("fade-out");
      setTimeout(() => {
        alertElement.remove();
      }, 300);
    });

    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.animationDelay = `${Math.random() * 3}s`;
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
      alertElement.appendChild(confetti);
    }

    alertContent.appendChild(titleElement);
    alertContent.appendChild(messageElement);
    alertContent.appendChild(statsElement);
    alertContent.appendChild(closeButton);
    alertElement.appendChild(alertContent);

    document.body.appendChild(alertElement);

    setTimeout(() => {
      alertElement.classList.add("show");
    }, 10);
  }
});
