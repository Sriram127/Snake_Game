const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("bestScore");
const speedLabel = document.getElementById("speedLabel");
const levelEl = document.getElementById("level");
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const wrapToggle = document.getElementById("wrapToggle");
const soundToggle = document.getElementById("soundToggle");
const modeButtons = document.querySelectorAll(".mode");
const padButtons = document.querySelectorAll(".mobile-pad button");

const gridSize = 24;
const tileCount = canvas.width / gridSize;
const speeds = {
  easy: { label: "Easy", delay: 150 },
  normal: { label: "Normal", delay: 110 },
  hard: { label: "Hard", delay: 80 }
};

let snake;
let food;
let direction;
let nextDirection;
let score;
let level;
let selectedSpeed = "normal";
let timer = null;
let running = false;
let paused = false;
let lastFoodTime = 0;
let bestScore = Number(localStorage.getItem("snakeBestScore")) || 0;

bestScoreEl.textContent = bestScore;
speedLabel.textContent = speeds[selectedSpeed].label;

function resetGame() {
  snake = [
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  level = 1;
  paused = false;
  scoreEl.textContent = score;
  levelEl.textContent = level;
  pauseBtn.textContent = "II";
  overlay.querySelector("h2").textContent = "Ready?";
  overlay.querySelector("p").textContent = "Choose a speed and press start.";
  startBtn.textContent = "Start Game";
  placeFood();
  draw();
}

function startGame() {
  resetGame();
  running = true;
  overlay.classList.add("hidden");
  clearInterval(timer);
  timer = setInterval(tick, speeds[selectedSpeed].delay);
}

function endGame() {
  running = false;
  clearInterval(timer);
  timer = null;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("snakeBestScore", bestScore);
    bestScoreEl.textContent = bestScore;
  }
  overlay.querySelector("h2").textContent = "Game Over";
  overlay.querySelector("p").textContent = `Score: ${score}`;
  startBtn.textContent = "Play Again";
  overlay.classList.remove("hidden");
}

function tick() {
  if (!running || paused) {
    return;
  }

  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  const willEat = head.x === food.x && head.y === food.y;

  if (isWallHit(head) || isSnakeHit(head, willEat)) {
    playTone(120, 0.18, "sawtooth");
    endGame();
    return;
  }

  snake.unshift(head);

  if (willEat) {
    score += 10;
    level = Math.floor(score / 50) + 1;
    scoreEl.textContent = score;
    levelEl.textContent = level;
    lastFoodTime = performance.now();
    playTone(520 + level * 24, 0.08, "triangle");
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = "#242a2f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawScoreGlow();
  drawFood();
  drawSnake();
}

function drawGrid() {
  ctx.strokeStyle = "#313941";
  ctx.lineWidth = 1;
  for (let i = 0; i <= tileCount; i++) {
    const pos = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#42d392" : "#27a86d";
    roundRect(part.x * gridSize + 3, part.y * gridSize + 3, gridSize - 6, gridSize - 6, 6);

    if (index === 0) {
      ctx.fillStyle = "#172026";
      const eyeOffsetX = direction.x === 0 ? 5 : direction.x * 5;
      const eyeOffsetY = direction.y === 0 ? 5 : direction.y * 5;
      ctx.beginPath();
      ctx.arc(part.x * gridSize + 12 + eyeOffsetX, part.y * gridSize + 12 + eyeOffsetY, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawFood() {
  const pulse = 1 + Math.sin(Date.now() / 130) * 0.12;
  ctx.fillStyle = "#ff5a5f";
  ctx.beginPath();
  ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize * 0.34 * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffbd2e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize * 0.48 * pulse, 0, Math.PI * 2);
  ctx.stroke();
}

function drawScoreGlow() {
  const age = performance.now() - lastFoodTime;
  if (age > 240) {
    return;
  }
  ctx.fillStyle = `rgba(255, 189, 46, ${0.22 * (1 - age / 240)})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.fill();
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake.some((part) => part.x === food.x && part.y === food.y));
}

function isWallHit(head) {
  if (wrapToggle.checked) {
    head.x = (head.x + tileCount) % tileCount;
    head.y = (head.y + tileCount) % tileCount;
    return false;
  }
  return head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount;
}

function isSnakeHit(head, willEat) {
  const body = willEat ? snake : snake.slice(0, -1);
  return body.some((part) => part.x === head.x && part.y === head.y);
}

function setDirection(newDirection) {
  const reversing = newDirection.x + direction.x === 0 && newDirection.y + direction.y === 0;
  if (!reversing) {
    nextDirection = newDirection;
  }
}

function togglePause() {
  if (!running) {
    return;
  }
  paused = !paused;
  pauseBtn.textContent = paused ? ">" : "II";
  overlay.querySelector("h2").textContent = "Paused";
  overlay.querySelector("p").textContent = "Press pause again to continue.";
  startBtn.textContent = "Restart";
  overlay.classList.toggle("hidden", !paused);
}

function playTone(frequency, duration, type) {
  if (!soundToggle.checked) {
    return;
  }
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    return;
  }
  const audio = new AudioContext();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.05, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + duration);
}

document.addEventListener("keydown", (event) => {
  const keys = {
    ArrowUp: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    d: { x: 1, y: 0 }
  };

  if (keys[event.key]) {
    event.preventDefault();
    setDirection(keys[event.key]);
  }

  if (event.key === " " || event.key === "p") {
    event.preventDefault();
    togglePause();
  }
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedSpeed = button.dataset.speed;
    speedLabel.textContent = speeds[selectedSpeed].label;
    modeButtons.forEach((item) => item.classList.toggle("active", item === button));
    if (running) {
      startGame();
    }
  });
});

padButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const directions = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };
    setDirection(directions[button.dataset.dir]);
  });
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);

resetGame();
