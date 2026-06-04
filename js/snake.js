// Snake Game — open source

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID = 20;
const COLS = canvas.width / GRID;
const ROWS = canvas.height / GRID;

const BASE_SPEED = 150;    // ms per tick
const SPEED_STEP = 8;      // ms faster every 5 points
const MIN_SPEED  = 60;

const COLORS = {
  bg:         '#0d1f12',
  grid:       '#111f15',
  snake:      '#25a352',
  snakeHead:  '#2ecc71',
  snakeBorder:'#1a7a3c',
  food:       '#e8c96a',
  foodGlow:   '#C8A951',
  text:       '#f0f4f1',
  muted:      '#8da090',
  overlay:    'rgba(13,31,18,0.88)',
};

let snake, dir, nextDir, food, score, hiScore, gameLoop, state, touchStart;

function init() {
  snake   = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  dir     = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  food    = spawnFood();
  score   = 0;
  hiScore = parseInt(localStorage.getItem('snake_hi') || '0', 10);
  state   = 'running';
  clearInterval(gameLoop);
  gameLoop = setInterval(tick, speed());
  updateScoreDisplay();
}

function speed() {
  return Math.max(MIN_SPEED, BASE_SPEED - Math.floor(score / 5) * SPEED_STEP);
}

function spawnFood() {
  let pos;
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

function tick() {
  if (state !== 'running') return;

  dir = { ...nextDir };
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // Wall collision
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    return endGame();
  }
  // Self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    return endGame();
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    if (score > hiScore) {
      hiScore = score;
      localStorage.setItem('snake_hi', hiScore);
    }
    food = spawnFood();
    updateScoreDisplay();
    // Adjust speed
    clearInterval(gameLoop);
    gameLoop = setInterval(tick, speed());
  } else {
    snake.pop();
  }

  draw();
}

function endGame() {
  state = 'over';
  clearInterval(gameLoop);
  draw();
  drawOverlay('¡Juego terminado!', `Puntuación: ${score}`, 'Toca o presiona Enter para reiniciar');
}

function pause() {
  if (state === 'running') {
    state = 'paused';
    clearInterval(gameLoop);
    draw();
    drawOverlay('Pausado', `Puntuación: ${score}`, 'Toca o presiona P para continuar');
  } else if (state === 'paused') {
    state = 'running';
    gameLoop = setInterval(tick, speed());
  }
}

// ── Drawing ──────────────────────────────────────────────────────────────────

function draw() {
  // Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid dots
  ctx.fillStyle = COLORS.grid;
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      ctx.fillRect(c * GRID + GRID / 2 - 1, r * GRID + GRID / 2 - 1, 2, 2);
    }
  }

  // Food glow
  ctx.save();
  ctx.shadowColor = COLORS.foodGlow;
  ctx.shadowBlur  = 12;
  ctx.fillStyle   = COLORS.food;
  ctx.beginPath();
  ctx.arc(food.x * GRID + GRID / 2, food.y * GRID + GRID / 2, GRID / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Snake
  snake.forEach((seg, i) => {
    const isHead = i === 0;
    ctx.fillStyle   = isHead ? COLORS.snakeHead : COLORS.snake;
    ctx.strokeStyle = COLORS.snakeBorder;
    ctx.lineWidth   = 1.5;
    roundRect(seg.x * GRID + 1, seg.y * GRID + 1, GRID - 2, GRID - 2, isHead ? 6 : 4);
  });

  // Eyes on head
  drawEyes();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawEyes() {
  const hx = snake[0].x * GRID;
  const hy = snake[0].y * GRID;
  const offsets = getEyeOffsets();
  ctx.fillStyle = COLORS.bg;
  offsets.forEach(([ox, oy]) => {
    ctx.beginPath();
    ctx.arc(hx + ox, hy + oy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function getEyeOffsets() {
  if (dir.x === 1)  return [[14, 5],  [14, 14]];
  if (dir.x === -1) return [[5,  5],  [5,  14]];
  if (dir.y === -1) return [[5,  5],  [14,  5]];
  return                    [[5,  14], [14, 14]];
}

function drawOverlay(title, subtitle, hint) {
  ctx.fillStyle = COLORS.overlay;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';

  ctx.font = 'bold 26px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = '#e8c96a';
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 30);

  ctx.font = '17px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = COLORS.text;
  ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 5);

  ctx.font = '13px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(hint, canvas.width / 2, canvas.height / 2 + 32);
}

function updateScoreDisplay() {
  document.getElementById('score').textContent  = score;
  document.getElementById('hiScore').textContent = hiScore;
  document.getElementById('level').textContent  = Math.floor(score / 5) + 1;
}

// ── Controls ─────────────────────────────────────────────────────────────────

const KEY_MAP = {
  ArrowUp:    { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
  ArrowDown:  { x: 0, y:  1 }, s: { x: 0, y:  1 }, S: { x: 0, y:  1 },
  ArrowLeft:  { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
  ArrowRight: { x: 1,  y: 0 }, d: { x: 1,  y: 0 }, D: { x: 1,  y: 0 },
};

document.addEventListener('keydown', e => {
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
    if (state === 'over') return;
    return pause();
  }
  if (e.key === 'Enter') {
    if (state === 'over' || state === 'idle') return init();
  }
  const d = KEY_MAP[e.key];
  if (!d) return;
  // Prevent reversing
  if (d.x !== -dir.x || d.y !== -dir.y) nextDir = d;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
});

canvas.addEventListener('touchstart', e => {
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });

canvas.addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  touchStart = null;

  if (state === 'over' || state === 'idle') { init(); return; }
  if (state === 'paused') { pause(); return; }

  if (Math.abs(dx) < 10 && Math.abs(dy) < 10) { pause(); return; }

  let d;
  if (Math.abs(dx) > Math.abs(dy)) {
    d = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
  } else {
    d = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
  }
  if (d.x !== -dir.x || d.y !== -dir.y) nextDir = d;
}, { passive: true });

document.getElementById('btnStart').addEventListener('click', () => {
  if (state === 'over' || state === 'idle') init();
});
document.getElementById('btnPause').addEventListener('click', () => {
  if (state !== 'over') pause();
});

// ── Boot ─────────────────────────────────────────────────────────────────────

state = 'idle';
hiScore = parseInt(localStorage.getItem('snake_hi') || '0', 10);
snake   = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
dir     = { x: 1, y: 0 };
nextDir = { x: 1, y: 0 };
food    = { x: 15, y: 10 };
score   = 0;
updateScoreDisplay();
draw();
drawOverlay('Snake', 'Usa flechas, WASD o desliza', 'Presiona Enter o toca para jugar');
