const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function drawCircle({ x, y, radius }) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawRoom(points) {
  ctx.beginPath();
 
  for (let i = 0; i < points.length; ++i) {
    const dx = i > 0 && i <= 6 ? 0.5 : -0.5;
    const dy = i > 3 && i <= 9 ? -0.5 : 0.5;
    
    if (i === 0) {
      ctx.moveTo(points[i].x + dx, points[i].y + dy);
    } else {
      ctx.lineTo(points[i].x + dx, points[i].y + dy);
    }
  }
  
  ctx.closePath();
  ctx.strokeStyle = 'rgba(0, 0, 255, 1)';
  ctx.lineWidth = 1;
  ctx.stroke();
};

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

const DIRS = [
  [ 0, 1 ],
  [ 1, 0 ],
  [ 0, -1 ],
  [ -1, 0 ],
];

function generateRooms(origins) {
  return origins.map(({ x, y, radius }) => {
    let arm1 = randInRange(MIN_RADIUS, MIN_RADIUS + 2 * (radius - MIN_RADIUS));
    arm1 = (arm1 - 1) / 2;
    const points = []; 
 
    if (Math.random() < 0.5) {
      points.push({
        x: x - arm1,
        y: y + radius - 1 - arm1,
      });
      points.push({
        x: x + arm1,
        y: y + radius - 1 - arm1,
      });
      for (let i = 0; i < 4; ++i) {
        points.push({ x: x + arm1, y });
      }
      points.push({
        x: x + arm1,
        y: y - (radius - 1 - arm1),
      });
      points.push({
        x: x - arm1,
        y: y - (radius - 1 - arm1),
      });
      for (let i = 0; i < 4; ++i) {
        points.push({ x: x - arm1, y });
      }
    } else {
      for (let i = 0; i < 3; ++i) {
        points.push({ x, y: y - arm1 });
      }
      points.push({
        x: x + radius - 1 - arm1,
        y: y - arm1,
      });
      points.push({
        x: x + radius - 1 - arm1,
        y: y + arm1,
      });
      for (let i = 0; i < 4; ++i) {
        points.push({ x, y: y + arm1 });
      }
      points.push({
        x: x - (radius - 1 - arm1),
        y: y + arm1,
      });
      points.push({
        x: x - (radius - 1 - arm1),
        y: y - arm1,
      });
      points.push({ x, y: y - arm1 });
    }

    return points;
  });
}

function generateMap() {
}

function init() {
  const origins = generateOrigins();
  origins.forEach(circle => drawCircle(circle));
  drawRoom([
    { x: 100, y: 100 }, 
    { x: 200, y: 100 }, 
    { x: 200, y: 200 },
    { x: 300, y: 200 },
    { x: 300, y: 300 },
    { x: 200, y: 300 },
    { x: 200, y: 400 },
    { x: 100, y: 400 },
    { x: 100, y: 300 },
    { x: 0, y: 300 },
    { x: 0, y: 200 },
    { x: 100, y: 200 },
  ]);
  const rooms = generateRooms(origins);
  rooms.forEach(room => drawRoom(room));
}

addEventListener('load', () => init());