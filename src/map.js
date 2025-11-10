const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function drawCircle({ x, y, radius }) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 1;
  ctx.stroke();
}

const ROWS = 1000;
const COLS = 1000;
const ROOMS = Math.floor(ROWS * COLS / 500);
const MIN_RADIUS = 3;
const map = new Array(ROWS * COLS);

function randInRange(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randRadius(radius) {
  return randInRange(
    Math.max(MIN_RADIUS, Math.floor(radius * 0.75)),
    Math.min(ROWS, COLS, Math.ceil(radius * 1.25)),
  );
}

function dSquared(x1, y1, x2, y2) {
  return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}

function generateOrigins() {
  const origins = [];
 
  let currRadius = Math.floor((ROWS + COLS) / 20);
  let maxFail = 10;
  let failures = 0;
 
  while (origins.length < ROOMS) {
    if (failures > maxFail) {
      failures = 0;
      maxFail *= 2;
      currRadius = Math.max(MIN_RADIUS, Math.floor(currRadius / 2));
    }

    const radius = randRadius(currRadius);
    const x = randInRange(radius, COLS - radius);
    const y = randInRange(radius, ROWS - radius);

    let success = true;
    for (const origin of origins) {
      const dist = origin.radius + radius;
      if (dSquared(origin.x, origin.y, x, y) <= dist * dist) {
        success = false;
        break;
      }
    }
    
    if (!success) {
      failures++;
      continue;
    }
    
    failures = 0;
    origins.push({ x, y, radius });
  }
 
  return origins;
}

function generateMap() {
}

function init() {
  generateOrigins().forEach(circle => {
    drawCircle(circle);
  });
}

addEventListener('load', () => init());