document.addEventListener("DOMContentLoaded", () => {
    // Elementi DOM
    const chessboard = document.getElementById("chessboard")
    const gameStatus = document.getElementById("game-status")
    const turnIndicator = document.getElementById("turn-indicator")
    const currentPlayerText = document.getElementById("current-player")
    const newGameBtn = document.getElementById("new-game-btn")
    const resetBtn = document.getElementById("reset-btn")
    const resetStatsBtn = document.getElementById("reset-stats-btn")
    const whiteCaptured = document.getElementById("white-captured")
    const blackCaptured = document.getElementById("black-captured")
    const whiteWins = document.getElementById("white-wins")
    const blackWins = document.getElementById("black-wins")
    const gameCount = document.getElementById("game-count")

    // Elementi per l'overlay di vittoria
    const victoryOverlay = document.getElementById("victory-overlay")
    const victoryTitle = document.getElementById("victory-title")
    const victoryMessage = document.getElementById("victory-message")
    const victoryPiece = document.getElementById("victory-piece")
    const continueBtn = document.getElementById("continue-btn")

    // Elementi per le regole e il tema
    const infoBtn = document.getElementById("info-btn")
    const themeToggleBtn = document.getElementById("theme-toggle-btn")
    const rulesOverlay = document.getElementById("rules-overlay")
    const closeRulesBtn = document.getElementById("close-rules-btn")

    // Stato del gioco
    let board = []
    let selectedPiece = null
    let validMoves = []
    let currentPlayer = "white"
    let gameNumber = 1
    let gameOver = false
    let whiteCaptures = []
    let blackCaptures = []
    const stats = {
        white: 0,
        black: 0,
    }

    // Assicurati che gli overlay siano nascosti all'inizio
    victoryOverlay.classList.remove("active")
    rulesOverlay.classList.remove("active")

    // Rimuovi eventuali classi di stile dal pezzo di vittoria
    victoryPiece.classList.remove("white-piece", "black-piece")

    // Gestione del tema
    function toggleTheme() {
        document.body.classList.toggle("dark-theme")

        // Aggiorna l'icona del pulsante
        if (document.body.classList.contains("dark-theme")) {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>'
            themeToggleBtn.title = "Passa al tema chiaro"
        } else {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>'
            themeToggleBtn.title = "Passa al tema scuro"
        }

        // Salva la preferenza dell'utente
        localStorage.setItem("chessTheme", document.body.classList.contains("dark-theme") ? "dark" : "light")
    }

    // Carica il tema preferito dell'utente
    function loadThemePreference() {
        const savedTheme = localStorage.getItem("chessTheme")
        if (savedTheme === "dark") {
            document.body.classList.add("dark-theme")
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>'
            themeToggleBtn.title = "Passa al tema chiaro"
        }
    }

    // Mostra le regole
    function showRules() {
        rulesOverlay.classList.add("active")
    }

    // Nascondi le regole
    function hideRules() {
        rulesOverlay.classList.remove("active")
    }

    // Inizializzazione della scacchiera
    function initBoard() {
        chessboard.innerHTML = ""
        board = []

        // Crea la griglia 8x8
        for (let row = 0; row < 8; row++) {
            const rowArray = []
            for (let col = 0; col < 8; col++) {
                const square = document.createElement("div")
                square.className = `chess-square ${(row + col) % 2 === 0 ? "white" : "black"}`
                square.dataset.row = row
                square.dataset.col = col
                square.addEventListener("click", () => handleSquareClick(row, col))

                chessboard.appendChild(square)
                rowArray.push({ piece: null, color: null })
            }
            board.push(rowArray)
        }

        // Posiziona i pezzi
        setupPieces()

        // Aggiorna l'interfaccia
        updateTurnIndicator()
        updateCapturedPieces()

        // Abilita il pulsante di reset
        resetBtn.disabled = false

        // Rimuovi eventuali classi di animazione dalla scacchiera
        chessboard.classList.remove("victory-effect", "checkmate")
    }

    // Posiziona i pezzi sulla scacchiera
    function setupPieces() {
        // Determina il colore del giocatore iniziale in base al numero della partita
        const startingPlayer = gameNumber % 2 === 0 ? "black" : "white"
        currentPlayer = startingPlayer

        // Pedoni
        for (let col = 0; col < 8; col++) {
            placePiece(1, col, "pawn", "black")
            placePiece(6, col, "pawn", "white")
        }

        // Torri
        placePiece(0, 0, "rook", "black")
        placePiece(0, 7, "rook", "black")
        placePiece(7, 0, "rook", "white")
        placePiece(7, 7, "rook", "white")

        // Cavalli
        placePiece(0, 1, "knight", "black")
        placePiece(0, 6, "knight", "black")
        placePiece(7, 1, "knight", "white")
        placePiece(7, 6, "knight", "white")

        // Alfieri
        placePiece(0, 2, "bishop", "black")
        placePiece(0, 5, "bishop", "black")
        placePiece(7, 2, "bishop", "white")
        placePiece(7, 5, "bishop", "white")

        // Regina
        placePiece(0, 3, "queen", "black")
        placePiece(7, 3, "queen", "white")

        // Re
        placePiece(0, 4, "king", "black")
        placePiece(7, 4, "king", "white")
    }

    // Posiziona un pezzo sulla scacchiera
    function placePiece(row, col, piece, color) {
        board[row][col] = { piece, color }
        updateSquare(row, col)
    }

    // Aggiorna la visualizzazione di una casella
    function updateSquare(row, col) {
        const square = getSquareElement(row, col)
        square.innerHTML = ""

        const pieceData = board[row][col]
        if (pieceData.piece) {
            const pieceElement = document.createElement("div")
            pieceElement.className = "chess-piece"
            pieceElement.textContent = getPieceSymbol(pieceData.piece, pieceData.color)

            // Modifica: Applica stile pieno per i pezzi bianchi
            if (pieceData.color === "white") {
                pieceElement.classList.add("white-piece")
            } else {
                pieceElement.classList.add("black-piece")
            }

            square.appendChild(pieceElement)
        }
    }

    // Ottiene il simbolo Unicode per un pezzo
    function getPieceSymbol(piece, color) {
        const symbols = {
            white: {
                king: "♔",
                queen: "♕",
                rook: "♖",
                bishop: "♗",
                knight: "♘",
                pawn: "♙",
            },
            black: {
                king: "♚",
                queen: "♛",
                rook: "♜",
                bishop: "♝",
                knight: "♞",
                pawn: "♟",
            },
        }

        return symbols[color][piece]
    }

    // Ottiene l'elemento DOM di una casella
    function getSquareElement(row, col) {
        return document.querySelector(`.chess-square[data-row="${row}"][data-col="${col}"]`)
    }

    // Gestisce il click su una casella
    function handleSquareClick(row, col) {
        if (gameOver) return

        const clickedSquare = board[row][col]

        // Se è già selezionato un pezzo, prova a muoverlo
        if (selectedPiece) {
            const [selectedRow, selectedCol] = selectedPiece

            // Controlla se la mossa è valida
            if (isValidMove(selectedRow, selectedCol, row, col)) {
                // Verifica se questa mossa darà scacco
                const willGiveCheck = willMoveGiveCheck(selectedRow, selectedCol, row, col)

                // Verifica se questa mossa catturerà un pezzo
                const willCapture = board[row][col].piece !== null

                // Rimuovi l'evidenziazione del pezzo che dà scacco
                document.querySelectorAll(".checking-piece").forEach((square) => {
                    square.classList.remove("checking-piece")
                })

                movePiece(selectedRow, selectedCol, row, col)
                clearSelection()

                // Se il gioco non è terminato (non è stato catturato un re)
                if (!gameOver) {
                    // Passa il turno all'altro giocatore
                    currentPlayer = getOpponentColor(currentPlayer)
                    updateTurnIndicator()

                    // Controlla se il re è sotto scacco
                    const isCheck = highlightCheck()

                    // Mostra messaggio di scacco se la mossa ha dato scacco
                    if (willGiveCheck && isCheck) {
                        gameStatus.textContent = `${getOpponentColor(currentPlayer) === "white" ? "Bianco" : "Nero"} ha dato scacco!`
                        gameStatus.classList.add("check-message")

                        // Rimuovi la classe dopo un po'
                        setTimeout(() => {
                            gameStatus.classList.remove("check-message")
                        }, 2000)

                        // Controlla se c'è scacco matto
                        const isCheckmateVar = isCheckmate(currentPlayer);
                        if (isCheckmateVar) {
                            // Dichiara la vittoria per scacco matto
                            gameOver = true

                            // Aggiorna le statistiche
                            stats[getOpponentColor(currentPlayer)]++
                            updateStats(getOpponentColor(currentPlayer))

                            // Aggiungi effetto di vittoria alla scacchiera
                            chessboard.classList.add("victory-effect")

                            // Mostra l'animazione di scacco matto
                            animateCheckmate()

                            // Mostra l'overlay di vittoria dopo un breve ritardo
                            setTimeout(() => {
                                showVictoryOverlay(getOpponentColor(currentPlayer), true)
                            }, 1500)

                            // Disabilita il pulsante di reset
                            resetBtn.disabled = true
                        }
                    }

                    // Controlla se c'è stallo
                    if (isStalemate(currentPlayer)) {
                        endGame("Patta per stallo!")
                    }
                }
            } else if (clickedSquare.piece && clickedSquare.color === currentPlayer) {
                // Se clicca su un altro suo pezzo, seleziona quello
                selectPiece(row, col)
            } else {
                // Mossa non valida, deseleziona
                clearSelection()
            }
        } else if (clickedSquare.piece && clickedSquare.color === currentPlayer) {
            // Seleziona il pezzo
            selectPiece(row, col)
        }
    }

    // Verifica se una mossa darà scacco
    function willMoveGiveCheck(fromRow, fromCol, toRow, toCol) {
        // Crea una copia temporanea della scacchiera
        const tempBoard = JSON.parse(JSON.stringify(board))

        // Esegui la mossa sulla copia
        tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol]
        tempBoard[fromRow][fromCol] = { piece: null, color: null }

        // Trova la posizione del re avversario
        const opponentColor = getOpponentColor(tempBoard[toRow][toCol].color)
        let kingRow, kingCol

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (tempBoard[r][c].piece === "king" && tempBoard[r][c].color === opponentColor) {
                    kingRow = r
                    kingCol = c
                    break
                }
            }
        }

        if (!kingRow && !kingCol) return false

        // Verifica se il re avversario sarà sotto scacco dopo la mossa
        const originalBoard = board
        board = tempBoard
        const willBeInCheck = isSquareAttacked(kingRow, kingCol, opponentColor)
        board = originalBoard

        return willBeInCheck
    }

    // Seleziona un pezzo
    function selectPiece(row, col) {
        clearSelection()

        selectedPiece = [row, col]
        const square = getSquareElement(row, col)
        square.classList.add("selected")

        // Calcola e mostra le mosse valide
        validMoves = calculateValidMoves(row, col)
        highlightValidMoves(row, col)
    }

    // Pulisce la selezione corrente
    function clearSelection() {
        if (selectedPiece) {
            const [row, col] = selectedPiece
            const square = getSquareElement(row, col)
            square.classList.remove("selected")
        }

        // Rimuovi l'evidenziazione delle mosse valide
        document.querySelectorAll(".valid-move").forEach((square) => {
            square.classList.remove("valid-move", "can-capture-king", "can-give-check")
        })

        selectedPiece = null
        validMoves = []
    }

    // Evidenzia le mosse valide
    function highlightValidMoves(fromRow, fromCol) {
        validMoves.forEach(([toRow, toCol]) => {
            const square = getSquareElement(toRow, toCol)
            square.classList.add("valid-move")

            // Verifica se questa mossa può catturare un re
            if (board[toRow][toCol].piece === "king") {
                square.classList.add("can-capture-king")
            }

            // Verifica se questa mossa darà scacco
            if (willMoveGiveCheck(fromRow, fromCol, toRow, toCol)) {
                square.classList.add("can-give-check")
            }
        })
    }

    // Evidenzia il re sotto scacco e il pezzo che dà scacco
    function highlightCheck() {
        // Rimuovi l'evidenziazione precedente
        document.querySelectorAll(".check").forEach((square) => {
            square.classList.remove("check")
        })

        // Trova la posizione del re
        const kingPosition = findKing(currentPlayer)
        if (kingPosition && isInCheck(currentPlayer, kingPosition[0], kingPosition[1])) {
            const square = getSquareElement(kingPosition[0], kingPosition[1])
            square.classList.add("check")

            // Aggiorna il messaggio di gioco
            gameStatus.textContent = `${currentPlayer === "white" ? "Bianco" : "Nero"} è sotto scacco!`
            gameStatus.classList.add("check-message")

            // Trova il pezzo che dà scacco per evidenziarlo
            highlightCheckingPiece(kingPosition[0], kingPosition[1], currentPlayer)

            return true
        } else {
            gameStatus.textContent = ""
            gameStatus.classList.remove("check-message")
            return false
        }
    }

    // Evidenzia il pezzo che dà scacco
    function highlightCheckingPiece(kingRow, kingCol, defendingColor) {
        const attackingColor = getOpponentColor(defendingColor)

        // Controlla attacchi da pedoni
        const pawnDirections =
            defendingColor === "white"
                ? [
                    [1, -1],
                    [1, 1],
                ]
                : [
                    [-1, -1],
                    [-1, 1],
                ]
        for (const [dr, dc] of pawnDirections) {
            const newRow = kingRow + dr
            const newCol = kingCol + dc

            if (
                isInBounds(newRow, newCol) &&
                board[newRow][newCol].piece === "pawn" &&
                board[newRow][newCol].color === attackingColor
            ) {
                const square = getSquareElement(newRow, newCol)
                square.classList.add("checking-piece")
                return
            }
        }

        // Controlla attacchi da cavalli
        const knightMoves = [
            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1],
        ]

        for (const [dr, dc] of knightMoves) {
            const newRow = kingRow + dr
            const newCol = kingCol + dc

            if (
                isInBounds(newRow, newCol) &&
                board[newRow][newCol].piece === "knight" &&
                board[newRow][newCol].color === attackingColor
            ) {
                const square = getSquareElement(newRow, newCol)
                square.classList.add("checking-piece")
                return
            }
        }

        // Controlla attacchi da torri e regine (movimenti orizzontali e verticali)
        const rookDirections = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
        ]
        for (const [dr, dc] of rookDirections) {
            let newRow = kingRow + dr
            let newCol = kingCol + dc

            while (isInBounds(newRow, newCol)) {
                if (board[newRow][newCol].piece) {
                    if (
                        (board[newRow][newCol].piece === "rook" || board[newRow][newCol].piece === "queen") &&
                        board[newRow][newCol].color === attackingColor
                    ) {
                        const square = getSquareElement(newRow, newCol)
                        square.classList.add("checking-piece")
                        return
                    }
                    break
                }

                newRow += dr
                newCol += dc
            }
        }

        // Controlla attacchi da alfieri e regine (movimenti diagonali)
        const bishopDirections = [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1],
        ]
        for (const [dr, dc] of bishopDirections) {
            let newRow = kingRow + dr
            let newCol = kingCol + dc

            while (isInBounds(newRow, newCol)) {
                if (board[newRow][newCol].piece) {
                    if (
                        (board[newRow][newCol].piece === "bishop" || board[newRow][newCol].piece === "queen") &&
                        board[newRow][newCol].color === attackingColor
                    ) {
                        const square = getSquareElement(newRow, newCol)
                        square.classList.add("checking-piece")
                        return
                    }
                    break
                }

                newRow += dr
                newCol += dc
            }
        }
    }

    // Aggiorna l'indicatore di turno
    function updateTurnIndicator() {
        // Aggiorna la classe dell'indicatore di turno
        turnIndicator.className = `turn-indicator ${currentPlayer}-turn`

        // Aggiorna il testo del giocatore corrente
        currentPlayerText.textContent = currentPlayer === "white" ? "Bianco" : "Nero"

        // Aggiungi animazione per evidenziare il cambio di turno
        turnIndicator.classList.add("turn-active")

        // Rimuovi la classe di animazione dopo che è terminata
        setTimeout(() => {
            turnIndicator.classList.remove("turn-active")
        }, 500)
    }

    // Muove un pezzo
    function movePiece(fromRow, fromCol, toRow, toCol) {
        const movingPiece = board[fromRow][fromCol]
        const targetSquare = board[toRow][toCol]
        const targetElement = getSquareElement(toRow, toCol)

        // Se c'è un pezzo nella casella di destinazione, lo cattura
        if (targetSquare.piece) {
            // Aggiungi effetto di cattura
            targetElement.classList.add("piece-captured-effect")
            setTimeout(() => {
                targetElement.classList.remove("piece-captured-effect")
            }, 500)

            // Controlla se il pezzo catturato è un re
            if (targetSquare.piece === "king") {
                // Dichiara immediatamente la vittoria
                gameOver = true

                // Aggiorna le statistiche
                stats[currentPlayer]++
                updateStats(currentPlayer)

                // Aggiungi effetto di vittoria alla scacchiera
                chessboard.classList.add("victory-effect")

                // Mostra l'overlay di vittoria dopo un breve ritardo
                setTimeout(() => {
                    showVictoryOverlay(currentPlayer)
                }, 800)

                // Disabilita il pulsante di reset
                resetBtn.disabled = true
            }

            capturePiece(targetSquare.piece, targetSquare.color)
        }

        // Gestione dell'arrocco
        if (movingPiece.piece === "king" && Math.abs(fromCol - toCol) === 2) {
            // Arrocco
            const rookCol = toCol > fromCol ? 7 : 0
            const newRookCol = toCol > fromCol ? toCol - 1 : toCol + 1

            // Muovi la torre
            board[toRow][newRookCol] = board[toRow][rookCol]
            board[toRow][rookCol] = { piece: null, color: null }

            // Aggiorna la visualizzazione
            updateSquare(toRow, rookCol)
            updateSquare(toRow, newRookCol)
        }

        // Gestione della promozione del pedone
        if (movingPiece.piece === "pawn" && (toRow === 0 || toRow === 7)) {
            // Promuovi a regina (per semplicità)
            movingPiece.piece = "queen"
        }

        // Muovi il pezzo
        board[toRow][toCol] = movingPiece
        board[fromRow][fromCol] = { piece: null, color: null }

        // Aggiorna la visualizzazione
        updateSquare(fromRow, fromCol)
        updateSquare(toRow, toCol)

        // Aggiungi un effetto di movimento
        const pieceElement = getSquareElement(toRow, toCol).querySelector(".chess-piece")
        pieceElement.style.animation = "none"
        setTimeout(() => {
            pieceElement.style.animation = ""
        }, 10)
    }

    // Cattura un pezzo
    function capturePiece(piece, color) {
        if (color === "white") {
            blackCaptures.push(piece)
        } else {
            whiteCaptures.push(piece)
        }

        updateCapturedPieces()
    }

    // Aggiorna la visualizzazione dei pezzi catturati
    function updateCapturedPieces() {
        whiteCaptured.innerHTML = ""
        blackCaptured.innerHTML = ""

        whiteCaptures.forEach((piece) => {
            const pieceElement = document.createElement("span")
            pieceElement.className = "captured-piece"
            pieceElement.textContent = getPieceSymbol(piece, "black")
            whiteCaptured.appendChild(pieceElement)
        })

        blackCaptures.forEach((piece) => {
            const pieceElement = document.createElement("span")
            pieceElement.className = "captured-piece"
            pieceElement.textContent = getPieceSymbol(piece, "white")
            blackCaptured.appendChild(pieceElement)
        })
    }

    // Calcola le mosse valide per un pezzo
    function calculateValidMoves(row, col) {
        const piece = board[row][col]
        if (!piece.piece) return []

        let moves = []

        switch (piece.piece) {
            case "pawn":
                moves = calculatePawnMoves(row, col, piece.color)
                break
            case "rook":
                moves = calculateRookMoves(row, col, piece.color)
                break
            case "knight":
                moves = calculateKnightMoves(row, col, piece.color)
                break
            case "bishop":
                moves = calculateBishopMoves(row, col, piece.color)
                break
            case "queen":
                moves = [...calculateRookMoves(row, col, piece.color), ...calculateBishopMoves(row, col, piece.color)]
                break
            case "king":
                moves = calculateKingMoves(row, col, piece.color)
                break
        }

        // Filtra le mosse che metterebbero il re sotto scacco
        return moves.filter(([toRow, toCol]) => {
            return !wouldBeInCheck(piece.color, row, col, toRow, toCol)
        })
    }

    // Calcola le mosse valide per un pedone
    function calculatePawnMoves(row, col, color) {
        const moves = []
        const direction = color === "white" ? -1 : 1
        const startRow = color === "white" ? 6 : 1

        // Movimento in avanti di una casella
        if (isInBounds(row + direction, col) && !board[row + direction][col].piece) {
            moves.push([row + direction, col])

            // Movimento in avanti di due caselle dalla posizione iniziale
            if (row === startRow && !board[row + 2 * direction][col].piece) {
                moves.push([row + 2 * direction, col])
            }
        }

        // Catture in diagonale
        const captureDirections = [
            [direction, -1],
            [direction, 1],
        ]
        captureDirections.forEach(([dr, dc]) => {
            const newRow = row + dr
            const newCol = col + dc

            if (isInBounds(newRow, newCol) && board[newRow][newCol].piece && board[newRow][newCol].color !== color) {
                moves.push([newRow, newCol])
            }
        })

        return moves
    }

    // Calcola le mosse valide per una torre
    function calculateRookMoves(row, col, color) {
        const moves = []
        const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
        ] // Su, Giù, Sinistra, Destra

        directions.forEach(([dr, dc]) => {
            let newRow = row + dr
            let newCol = col + dc

            while (isInBounds(newRow, newCol)) {
                if (!board[newRow][newCol].piece) {
                    moves.push([newRow, newCol])
                } else if (board[newRow][newCol].color !== color) {
                    moves.push([newRow, newCol])
                    break
                } else {
                    break
                }

                newRow += dr
                newCol += dc
            }
        })

        return moves
    }

    // Calcola le mosse valide per un cavallo
    function calculateKnightMoves(row, col, color) {
        const moves = []
        const knightMoves = [
            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1],
        ]

        knightMoves.forEach(([dr, dc]) => {
            const newRow = row + dr
            const newCol = col + dc

            if (isInBounds(newRow, newCol) && (!board[newRow][newCol].piece || board[newRow][newCol].color !== color)) {
                moves.push([newRow, newCol])
            }
        })

        return moves
    }

    // Calcola le mosse valide per un alfiere
    function calculateBishopMoves(row, col, color) {
        const moves = []
        const directions = [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1],
        ] // Diagonali

        directions.forEach(([dr, dc]) => {
            let newRow = row + dr
            let newCol = col + dc

            while (isInBounds(newRow, newCol)) {
                if (!board[newRow][newCol].piece) {
                    moves.push([newRow, newCol])
                } else if (board[newRow][newCol].color !== color) {
                    moves.push([newRow, newCol])
                    break
                } else {
                    break
                }

                newRow += dr
                newCol += dc
            }
        })

        return moves
    }

    // Calcola le mosse valide per un re
    function calculateKingMoves(row, col, color) {
        const moves = []
        const kingMoves = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1],
        ]

        kingMoves.forEach(([dr, dc]) => {
            const newRow = row + dr
            const newCol = col + dc

            if (isInBounds(newRow, newCol) && (!board[newRow][newCol].piece || board[newRow][newCol].color !== color)) {
                moves.push([newRow, newCol])
            }
        })

        // Arrocco
        if (!isInCheckFunc(color, row, col)) {
            // Arrocco corto
            if (canCastle(row, col, row, 7, color)) {
                moves.push([row, col + 2])
            }

            // Arrocco lungo
            if (canCastle(row, col, row, 0, color)) {
                moves.push([row, col - 2])
            }
        }

        return moves
    }

    // Controlla se è possibile fare l'arrocco
    function canCastle(kingRow, kingCol, rookRow, rookCol, color) {
        // Controlla se il re e la torre sono nelle posizioni iniziali
        if (kingCol !== 4 || (rookCol !== 0 && rookCol !== 7)) {
            return false
        }

        // Controlla se ci sono pezzi tra il re e la torre
        const direction = rookCol > kingCol ? 1 : -1
        for (let col = kingCol + direction; col !== rookCol; col += direction) {
            if (board[kingRow][col].piece) {
                return false
            }
        }

        // Controlla se il re passerebbe attraverso una casella sotto scacco
        const castlingCol = rookCol > kingCol ? kingCol + 2 : kingCol - 2
        const intermediateCol = rookCol > kingCol ? kingCol + 1 : kingCol - 1

        if (isSquareAttacked(kingRow, intermediateCol, color) || isSquareAttacked(kingRow, castlingCol, color)) {
            return false
        }

        // Controlla se la torre è presente
        return board[rookRow][rookCol].piece === "rook" && board[rookRow][rookCol].color === color
    }

    // Controlla se una mossa è valida
    function isValidMove(fromRow, fromCol, toRow, toCol) {
        // Se il re è sotto scacco, verifica che la mossa risolva lo scacco
        const kingPosition = findKing(currentPlayer)
        if (kingPosition && isInCheckFunc(currentPlayer, kingPosition[0], kingPosition[1])) {
            // Crea una copia temporanea della scacchiera
            const tempBoard = JSON.parse(JSON.stringify(board))

            // Esegui la mossa sulla copia
            tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol]
            tempBoard[fromRow][fromCol] = { piece: null, color: null }

            // Trova la posizione del re dopo la mossa
            let kingRow, kingCol
            if (tempBoard[toRow][toCol].piece === "king" && tempBoard[toRow][toCol].color === currentPlayer) {
                kingRow = toRow
                kingCol = toCol
            } else {
                kingRow = kingPosition[0]
                kingCol = kingPosition[1]
            }

            // Controlla se il re è ancora sotto scacco dopo la mossa
            const originalBoard = board
            board = tempBoard
            const stillInCheck = isSquareAttacked(kingRow, kingCol, currentPlayer)
            board = originalBoard

            // Se il re è ancora sotto scacco, la mossa non è valida
            if (stillInCheck) {
                return false
            }
        }

        // Verifica se la mossa è tra quelle valide calcolate
        return validMoves.some(([row, col]) => row === toRow && col === toCol)
    }

    // Controlla se una posizione è all'interno della scacchiera
    function isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8
    }

    // Ottiene il colore dell'avversario
    function getOpponentColor(color) {
        return color === "white" ? "black" : "white"
    }

    // Trova la posizione del re
    function findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col].piece === "king" && board[row][col].color === color) {
                    return [row, col]
                }
            }
        }
        return null
    }

    // Controlla se una casella è sotto attacco
    function isSquareAttacked(row, col, defendingColor) {
        const attackingColor = getOpponentColor(defendingColor)

        // Controlla attacchi da pedoni
        const pawnDirections =
            defendingColor === "white"
                ? [
                    [1, -1],
                    [1, 1],
                ]
                : [
                    [-1, -1],
                    [-1, 1],
                ]
        for (const [dr, dc] of pawnDirections) {
            const newRow = row + dr
            const newCol = col + dc

            if (
                isInBounds(newRow, newCol) &&
                board[newRow][newCol].piece === "pawn" &&
                board[newRow][newCol].color === attackingColor
            ) {
                return true
            }
        }

        // Controlla attacchi da cavalli
        const knightMoves = [
            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1],
        ]

        for (const [dr, dc] of knightMoves) {
            const newRow = row + dr
            const newCol = col + dc

            if (
                isInBounds(newRow, newCol) &&
                board[newRow][newCol].piece === "knight" &&
                board[newRow][newCol].color === attackingColor
            ) {
                return true
            }
        }

        // Controlla attacchi da re
        const kingMoves = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1],
        ]

        for (const [dr, dc] of kingMoves) {
            const newRow = row + dr
            const newCol = col + dc

            if (
                isInBounds(newRow, newCol) &&
                board[newRow][newCol].piece === "king" &&
                board[newRow][newCol].color === attackingColor
            ) {
                return true
            }
        }

        // Controlla attacchi da torri e regine (movimenti orizzontali e verticali)
        const rookDirections = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
        ]
        for (const [dr, dc] of rookDirections) {
            let newRow = row + dr
            let newCol = col + dc

            while (isInBounds(newRow, newCol)) {
                if (board[newRow][newCol].piece) {
                    if (
                        (board[newRow][newCol].piece === "rook" || board[newRow][newCol].piece === "queen") &&
                        board[newRow][newCol].color === attackingColor
                    ) {
                        return true
                    }
                    break
                }

                newRow += dr
                newCol += dc
            }
        }

        // Controlla attacchi da alfieri e regine (movimenti diagonali)
        const bishopDirections = [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1],
        ]
        for (const [dr, dc] of bishopDirections) {
            let newRow = row + dr
            let newCol = col + dc

            while (isInBounds(newRow, newCol)) {
                if (board[newRow][newCol].piece) {
                    if (
                        (board[newRow][newCol].piece === "bishop" || board[newRow][newCol].piece === "queen") &&
                        board[newRow][newCol].color === attackingColor
                    ) {
                        return true
                    }
                    break
                }

                newRow += dr
                newCol += dc
            }
        }

        return false
    }

    // Controlla se un re è sotto scacco
    function isInCheckFunc(color, row, col) {
        return isSquareAttacked(row, col, color);
    }

    // Controlla se una mossa metterebbe il re sotto scacco
    function wouldBeInCheck(color, fromRow, fromCol, toRow, toCol) {
        // Crea una copia temporanea della scacchiera
        const tempBoard = JSON.parse(JSON.stringify(board));

        // Esegui la mossa sulla copia
        tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
        tempBoard[fromRow][fromCol] = { piece: null, color: null };

        // Trova la posizione del re dopo la mossa
        let kingRow, kingCol;
        if (tempBoard[toRow][toCol].piece === "king") {
            kingRow = toRow;
            kingCol = toCol;
        } else {
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (tempBoard[r][c].piece === "king" && tempBoard[r][c].color === color) {
                        kingRow = r;
                        kingCol = c;
                        break;
                    }
                }
            }
        }

        // Controlla se il re sarebbe sotto scacco
        const originalBoard = board;
        board = tempBoard;
        const inCheck = isSquareAttacked(kingRow, kingCol, color);
        board = originalBoard;

        return inCheck;
    }

    // Controlla se c'è scacco matto
    function isCheckmate(color) {
        // Trova la posizione del re
        const kingPosition = findKing(color);
        if (!kingPosition) return false;

        const [kingRow, kingCol] = kingPosition;

        // Se il re non è sotto scacco, non c'è scacco matto
        if (!isInCheckFunc(color, kingRow, kingCol)) return false;

        // Controlla se c'è qualche mossa valida che possa togliere il re dallo scacco
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col].color === color) {
                    const validMoves = calculateValidMoves(row, col);
                    for (const move of validMoves) {
                        const [toRow, toCol] = move;
                        if (!wouldBeInCheck(color, row, col, toRow, toCol)) {
                            return false;
                        }
                    }
                }
            }
        }

        // Se non c'è nessuna mossa valida, c'è scacco matto
        return true;
    }

    // Controlla se c'è stallo
    function isStalemate(color) {
        // Trova la posizione del re
        const kingPosition = findKing(color);
        if (!kingPosition) return false;

        const [kingRow, kingCol] = kingPosition;

        // Se il re è sotto scacco, non c'è stallo
        if (isInCheckFunc(color, kingRow, kingCol)) return false;

        // Controlla se c'è qualche mossa valida per qualsiasi pezzo
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col].color === color) {
                    const validMoves = calculateValidMoves(row, col);
                    if (validMoves.length > 0) {
                        return false;
                    }
                }
            }
        }

        // Se non c'è nessuna mossa valida, c'è stallo
        return true;
    }

    // Termina il gioco
    function endGame(message) {
        gameOver = true
        gameStatus.textContent = message
        gameStatus.classList.add("end-message")

        // Disabilita il pulsante di reset
        resetBtn.disabled = true
    }

    // Mostra l'overlay di vittoria
    function showVictoryOverlay(winner, checkmate = false) {
        victoryOverlay.classList.add("active")

        // Aggiorna il titolo e il messaggio
        victoryTitle.textContent = checkmate ? "Scacco Matto!" : "Vittoria!"
        victoryMessage.textContent = `${winner === "white" ? "Bianco" : "Nero"} ha vinto la partita!`

        // Aggiorna il pezzo di vittoria
        victoryPiece.className = "victory-piece"
        victoryPiece.classList.add(`${winner}-piece`)
        victoryPiece.textContent = getPieceSymbol("king", winner)
    }

    // Nascondi l'overlay di vittoria
    function hideVictoryOverlay() {
        victoryOverlay.classList.remove("active")
    }

    // Aggiorna le statistiche
    function updateStats(winner) {
        whiteWins.textContent = `${stats.white}`
        blackWins.textContent = `${stats.black}`
        gameCount.textContent = `${gameNumber}`
    }

    // Anima lo scacco matto
    function animateCheckmate() {
        chessboard.classList.add("checkmate")
    }

    // Resetta il gioco
    function resetGame() {
        // Resetta lo stato del gioco
        board = []
        selectedPiece = null
        validMoves = []
        currentPlayer = "white"
        gameOver = false
        whiteCaptures = []
        blackCaptures = []

        // Nascondi l'overlay di vittoria
        hideVictoryOverlay()

        // Inizializza la scacchiera
        initBoard()

        // Aggiorna l'interfaccia
        updateTurnIndicator()
        updateCapturedPieces()

        // Aggiorna il messaggio di gioco
        gameStatus.textContent = ""
        gameStatus.classList.remove("check-message", "end-message")

        // Rimuovi eventuali classi di animazione dalla scacchiera
        chessboard.classList.remove("victory-effect", "checkmate")
    }

    // Inizia una nuova partita
    function newGame() {
        // Incrementa il numero della partita
        gameNumber++

        // Resetta il gioco
        resetGame()

        // Inizializza la scacchiera
        initBoard()

        // Aggiorna le statistiche
        updateStats()
    }

    // Resetta le statistiche
    function resetStats() {
        stats.white = 0
        stats.black = 0
        gameNumber = 1

        // Aggiorna le statistiche
        updateStats()
    }

    // Carica il tema preferito dell'utente all'avvio
    loadThemePreference()

    // Inizializza la scacchiera all'avvio
    initBoard()

    // Gestione degli eventi
    newGameBtn.addEventListener("click", newGame)
    resetBtn.addEventListener("click", resetGame)
    resetStatsBtn.addEventListener("click", resetStats)
    continueBtn.addEventListener("click", hideVictoryOverlay)
    infoBtn.addEventListener("click", showRules)
    themeToggleBtn.addEventListener("click", toggleTheme)
    closeRulesBtn.addEventListener("click", hideRules)

    // Declare isInCheck here
    function isInCheck(color, row, col) {
        return isSquareAttacked(row, col, color);
    }
})