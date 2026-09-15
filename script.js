let turn = "X";
let isgameover = false;
let isVsComputer = true; // Default: Vs Computer mode

// Scoreboard variables
let scoreX = 0;
let scoreO = 0;

const huPlayer = "X";
const aiPlayer = "0";

// Change turn
const changeTurn = () => {
    return turn === "X" ? "0" : "X";
};

// Mode Switcher Toggle
const modeToggleBtn = document.getElementById('modeToggle');
if (modeToggleBtn) {
    modeToggleBtn.addEventListener('click', () => {
        isVsComputer = !isVsComputer;
        modeToggleBtn.innerText = isVsComputer ? "Mode: Vs Unbeatable AI" : "Mode: 2 Player (PvP)";
        resetGame();
    });
}

// Check winning condition for current board state
const checkWinState = (board, player) => {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    return winPatterns.some(pattern => {
        return pattern.every(index => board[index] === player);
    });
};

// Get available spots on board
const emptyIndices = (board) => {
    return board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
};

// Unbeatable AI: Minimax Algorithm
const minimax = (newBoard, player) => {
    let availSpots = emptyIndices(newBoard);

    if (checkWinState(newBoard, huPlayer)) {
        return { score: -10 };
    } else if (checkWinState(newBoard, aiPlayer)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    let moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === aiPlayer) {
            let result = minimax(newBoard, huPlayer);
            move.score = result.score;
        } else {
            let result = minimax(newBoard, aiPlayer);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = "";
        moves.push(move);
    }

    let bestMove;
    if (player === aiPlayer) {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    return moves[bestMove];
};

// Make Smart AI Move
const makeComputerMove = () => {
    if (isgameover) return;

    let boxes = document.getElementsByClassName("box");
    let currentBoard = Array.from(boxes).map(box => box.querySelector('.boxtext').innerText);

    let bestSpot = minimax(currentBoard, aiPlayer);
    
    if (bestSpot && bestSpot.index !== undefined) {
        boxes[bestSpot.index].querySelector('.boxtext').innerText = turn;
        checkWin();

        if (!isgameover) {
            turn = changeTurn();
            document.getElementsByClassName("info")[0].innerText = "Turn for " + turn;
        }
    }
};

// Check for Win or Draw
const checkWin = () => {
    let boxtext = document.getElementsByClassName('boxtext');
    let wins = [
        [0, 1, 2, 5, 5, 0],
        [3, 4, 5, 5, 15, 0],
        [6, 7, 8, 5, 25, 0],
        [0, 3, 6, -5, 15, 90],
        [1, 4, 7, 5, 15, 90],
        [2, 5, 8, 15, 15, 90],
        [0, 4, 8, 5, 15, 45],
        [2, 4, 6, 5, 15, 135],
    ];

    let won = false;

    wins.forEach(e => {
        if ((boxtext[e[0]].innerText === boxtext[e[1]].innerText) && 
            (boxtext[e[2]].innerText === boxtext[e[1]].innerText) && 
            (boxtext[e[0]].innerText !== "")) {
            
            won = true;
            let winner = boxtext[e[0]].innerText;
            document.querySelector('.info').innerText = winner + " Won!";
            isgameover = true;
            
            // Update Scoreboard
            if (winner === "X") scoreX++;
            else if (winner === "0") scoreO++;
            updateScoreboardUI();

            // Show GIF & Win Line
            document.querySelector('.imgbox').getElementsByTagName('img')[0].style.width = "200px";
            document.querySelector(".line").style.transform = `translate(${e[3]}vw, ${e[4]}vw) rotate(${e[5]}deg)`;
            document.querySelector(".line").style.width = "20vw";
        }
    });

    // Draw check
    if (!won && !isgameover) {
        let boardValues = Array.from(boxtext).map(b => b.innerText);
        if (boardValues.every(val => val !== "")) {
            document.querySelector('.info').innerText = "Game Draw!";
            isgameover = true;
        }
    }
};

// Update Score UI
const updateScoreboardUI = () => {
    let scoreDisplay = document.querySelector('.scoreDisplay');
    if (scoreDisplay) {
        scoreDisplay.innerText = `X: ${scoreX} | O: ${scoreO}`;
    }
};

// Main Event Listeners
let boxes = document.getElementsByClassName("box");
Array.from(boxes).forEach(element => {
    let boxtext = element.querySelector('.boxtext');
    element.addEventListener('click', () => {
        if (boxtext.innerText === '' && !isgameover) {
            boxtext.innerText = turn;
            checkWin();

            if (!isgameover) {
                turn = changeTurn();
                document.getElementsByClassName("info")[0].innerText = "Turn for " + turn;

                if (isVsComputer && turn === "0") {
                    setTimeout(makeComputerMove, 300);
                }
            }
        }
    });
});

// Reset Functionality
const resetGame = () => {
    let boxtexts = document.querySelectorAll('.boxtext');
    Array.from(boxtexts).forEach(element => {
        element.innerText = "";
    });
    
    turn = "X";
    isgameover = false;
    document.querySelector(".line").style.width = "0vw";
    document.getElementsByClassName("info")[0].innerText = "Turn for " + turn;
    document.querySelector('.imgbox').getElementsByTagName('img')[0].style.width = "0px";
};

document.getElementById('reset').addEventListener('click', resetGame);