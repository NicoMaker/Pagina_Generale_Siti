const CANVAS_BORDER_COLOUR = "black";
const CANVAS_BACKGROUND_COLOUR = "yellow";
const SNAKE_COLOUR = "lightgreen";
const SNAKE_BORDER_COLOUR = "darkgreen";
let gameIsRunning;
let snake = [
  { x: 170, y: 150 },
  { x: 160, y: 150 },
  { x: 150, y: 150 },
  { x: 140, y: 150 },
];
let score = 0;
let foodX, foodY;
let dx = 10;
let dy = 0;
const pageWidth = window.innerWidth || document.body.clientWidth;
const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints;
const isMobile = isTouchDevice || pageWidth <= 800;
let treshold = Math.max(1, Math.floor(0.01 * pageWidth));
let touchstartX = 0;
let touchstartY = 0;
let touchendX = 0;
let touchendY = 0;
const limit = Math.tan(((45 * 1.5) / 180) * Math.PI);
const gestureZone = document.getElementById("gameCanvas");

gestureZone.addEventListener(
  "touchstart",
  function (event) {
    touchstartX = event.changedTouches[0].screenX;
    touchstartY = event.changedTouches[0].screenY;
  },
  false
);

gestureZone.addEventListener(
  "touchend",
  function (event) {
    touchendX = event.changedTouches[0].screenX;
    touchendY = event.changedTouches[0].screenY;
    handleGesture(event);
  },
  false
);

function handleGesture(e) {
  let x = touchendX - touchstartX;
  let y = touchendY - touchstartY;
  let xy = Math.abs(x / y);
  let yx = Math.abs(y / x);
  const goingUp = dy === -10;
  const goingDown = dy === 10;
  const goingRight = dx === 10;
  const goingLeft = dx === -10;

  if (Math.abs(x) > treshold || Math.abs(y) > treshold) {
    if (yx <= limit) {
      if (x < 0 && !goingRight) {
        dx = -10;
        dy = 0;
      }
      if (x > 0 && !goingLeft) {
        dx = 10;
        dy = 0;
      }
    }
    if (xy <= limit) {
      if (y < 0 && !goingDown) {
        dx = 0;
        dy = -10;
      }
      if (y > 0 && !goingUp) {
        dx = 0;
        dy = 10;
      }
    }
  } else {
    // Handle arrow key presses or button clicks
    if (isMobile) {
      switch (e.target.id) {
        case "upButtonMobile":
          if (dy !== 10) {
            dx = 0;
            dy = -10;
          }
          break;
        case "downButtonMobile":
          if (dy !== -10) {
            dx = 0;
            dy = 10;
          }
          break;
        case "leftButtonMobile":
          if (dx !== 10) {
            dx = -10;
            dy = 0;
          }
          break;
        case "rightButtonMobile":
          if (dx !== -10) {
            dx = 10;
            dy = 0;
          }
          break;
      }
    } else {
      // Arrow key presses for PC
      switch (e.key) {
        case "ArrowUp":
          if (dy !== 10) {
            dx = 0;
            dy = -10;
          }
          break;
        case "ArrowDown":
          if (dy !== -10) {
            dx = 0;
            dy = 10;
          }
          break;
        case "ArrowLeft":
          if (dx !== 10) {
            dx = -10;
            dy = 0;
          }
          break;
        case "ArrowRight":
          if (dx !== -10) {
            dx = 10;
            dy = 0;
          }
          break;
      }
    }
  }
}

const resetButton = document.getElementById("button");
const upButtonMobile = document.getElementById("upButtonMobile");
const downButtonMobile = document.getElementById("downButtonMobile");
const leftButtonMobile = document.getElementById("leftButtonMobile");
const rightButtonMobile = document.getElementById("rightButtonMobile");
const upButtonPC = document.getElementById("upButtonPC");
const downButtonPC = document.getElementById("downButtonPC");
const leftButtonPC = document.getElementById("leftButtonPC");
const rightButtonPC = document.getElementById("rightButtonPC");
const gameCanvas = document.getElementById("gameCanvas");
const ctx = gameCanvas.getContext("2d");

function clearCanvas() {
  ctx.fillStyle = CANVAS_BACKGROUND_COLOUR;
  ctx.strokestyle = CANVAS_BORDER_COLOUR;
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
  ctx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height);
}

function drawSnake() {
  snake.forEach(drawSnakePart);
}

function drawSnakePart(snakePart) {
  ctx.fillStyle = SNAKE_COLOUR;
  ctx.strokestyle = SNAKE_BORDER_COLOUR;
  ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
  ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
}

function randomTen(min, max) {
  return Math.round((Math.random() * (max - min) + min) / 10) * 10;
}

function createFood() {
  foodX = randomTen(0, gameCanvas.width - 10);
  foodY = randomTen(0, gameCanvas.height - 10);
  snake.forEach(isFoodOnSnake);
}

createFood();

function advanceSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  const didEatFood = snake[0].x === foodX && snake[0].y === foodY;
  if (didEatFood) {
    score += 1;
    document.getElementById("score").innerHTML = score;
    createFood();
  } else {
    snake.pop();
  }

  const hitLeftWall = snake[0].x < 0;
  const hitRightWall = snake[0].x > gameCanvas.width - 10;
  const hitTopWall = snake[0].y < 0;
  const hitBottomWall = snake[0].y > gameCanvas.height - 10;

  if (hitRightWall) {
    snake[0].x = 0;
  }
  if (hitLeftWall) {
    snake[0].x = 290;
  }
  if (hitBottomWall) {
    snake[0].y = 0;
  }
  if (hitTopWall) {
    snake[0].y = 290;
  }
}

function isFoodOnSnake(part) {
  const foodIsOnSnake = part.x == foodX && part.y == foodY;
  if (foodIsOnSnake) createFood();
}

function drawFood() {
  ctx.fillStyle = "red";
  ctx.strokestyle = "darkred";
  ctx.fillRect(foodX, foodY, 10, 10);
  ctx.strokeRect(foodX, foodY, 10, 10);
}

function didGameEnd() {
  for (let i = 4; i < snake.length; i++) {
    const didCollide = snake[i].x === snake[0].x && snake[i].y === snake[0].y;
    if (didCollide) {
      alert("GAME OVER");
      resetGame();
      return true;
    }
  }
  const hitLeftWall = snake[0].x < 0;
  const hitRightWall = snake[0].x > gameCanvas.width - 10;
  const hitTopWall = snake[0].y < 0;
  const hitBottomWall = snake[0].y > gameCanvas.height - 10;

  if (hitRightWall || hitLeftWall || hitTopWall || hitBottomWall) {
    resetGame();
    return true;
  }

  return false;
}

resetButton.addEventListener("click", resetGame);

if (isMobile) {
  upButtonMobile.addEventListener("click", function () {
    if (dy !== 10) {
      dx = 0;
      dy = -10;
    }
  });

  downButtonMobile.addEventListener("click", function () {
    if (dy !== -10) {
      dx = 0;
      dy = 10;
    }
  });

  leftButtonMobile.addEventListener("click", function () {
    if (dx !== 10) {
      dx = -10;
      dy = 0;
    }
  });

  rightButtonMobile.addEventListener("click", function () {
    if (dx !== -10) {
      dx = 10;
      dy = 0;
    }
  });
} else {
  // Aggiungi la gestione degli eventi 'keydown' per i pulsanti del PC
  document.addEventListener("keydown", function (e) {
    switch (e.key) {
      case "ArrowUp":
        if (dy !== 10) {
          dx = 0;
          dy = -10;
        }
        break;
      case "ArrowDown":
        if (dy !== -10) {
          dx = 0;
          dy = 10;
        }
        break;
      case "ArrowLeft":
        if (dx !== 10) {
          dx = -10;
          dy = 0;
        }
        break;
      case "ArrowRight":
        if (dx !== -10) {
          dx = 10;
          dy = 0;
        }
        break;
    }
  });
}

function resetGame() {
  score = 0;
  dx = 10;
  dy = 0;
  snake = [
    { x: 170, y: 150 },
    { x: 160, y: 150 },
    { x: 150, y: 150 },
    { x: 140, y: 150 },
  ];
  document.getElementById("score").innerHTML = score;

  if (gameIsRunning) {
    clearTimeout(gameIsRunning);
  }
  gameIsRunning = setTimeout(main, 200);
}

function main() {
  if (didGameEnd()) {
    return;
  }

  gameIsRunning = setTimeout(function onTick() {
    clearCanvas();
    advanceSnake();
    drawFood();
    drawSnake();
    main();
  }, 200);
}

main();
