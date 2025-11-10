const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function drawCircle({ x, y, radius }) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(0, 0, 255, 0.25)';
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
    Math.min(ROWS, COLS, Math.ceil(radius * 1.25))
  );
}

function randArm(min, max, radiusSq) {
  if (max < min) return [0, 0];
  
  const arm = randInRange(min, max);
  return [
    arm - 1,
    Math.floor(Math.sqrt(radiusSq - (arm * arm))) - 1,
  ];
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

function generateRooms(origins) {
  return origins.map(({ x, y, radius }) => {
    const radiusSq = radius * radius;
    const min = Math.ceil(radius * 0.35);
    const max = Math.floor(radius * 0.9);
    const [depth1, arm1] = randArm(min, max, radiusSq);
    const [depth2, arm2] = randArm(arm1 + 1, max, radiusSq);
    
    const points = []; 
 
    // TODO: clean this up
    if (Math.random() < 0.5) {
      points.push({
        x: x - arm1,
        y: y - depth1,
      });
      points.push({
        x: x + arm1,
        y: y - depth1,
      });
      for (let i = 0; i < 4; ++i) {
        points.push({ x: x + arm1, y });
      }
      points.push({
        x: x + arm1,
        y: y + depth1,
      });
      points.push({
        x: x - arm1,
        y: y + depth1,
      });
      for (let i = 0; i < 4; ++i) {
        points.push({ x: x - arm1, y });
      }
      
      if (Math.random() < 0.5 && arm2 > 0) {
        const side = Math.random();
        if (side < 0.375 || side >= 0.75) {
          points[2].y = y - arm2;
          points[3] = {
            x: x + depth2,
            y: y - arm2,
          };
          points[4] = {
            x: x + depth2,
            y: y + arm2,
          };
          points[5].y = y + arm2;
        }
        if (side >= 0.375) {
          points[8].y = y + arm2;
          points[9] = {
            x: x - depth2,
            y: y + arm2,
          };
          points[10] = {
            x: x - depth2,
            y: y - arm2,
          };
          points[11].y = y - arm2;
        }
      }
    } else {
      for (let i = 0; i < 3; ++i) {
        points.push({ x, y: y - arm1 });
      }
      points.push({
        x: x + depth1,
        y: y - arm1,
      });
      points.push({
        x: x + depth1,
        y: y + arm1,
      });
      for (let i = 0; i < 4; ++i) {
        points.push({ x, y: y + arm1 });
      }
      points.push({
        x: x - depth1,
        y: y + arm1,
      });
      points.push({
        x: x - depth1,
        y: y - arm1,
      });
      points.push({ x, y: y - arm1 });
      
      if (Math.random() < 0.5 && arm2 > 0) {
        const side = Math.random();
        if (side < 0.375 || side >= 0.75) {
          points[11].x = x - arm2;
          points[0] = {
            x: x - arm2,
            y: y - depth2,
          };
          points[1] = {
            x: x + arm2,
            y: y - depth2,
          };
          points[2].x = x + arm2;
        }
        if (side >= 0.375) {
          points[5].x = x + arm2;
          points[6] = {
            x: x + arm2,
            y: y + depth2,
          };
          points[7] = {
            x: x - arm2,
            y: y + depth2,
          };
          points[8].x = x - arm2;
        }
      }
    }

    return points;
  });
}

function generateMap() {
}

function init() {
  const origins = generateOrigins();
  origins.forEach(circle => drawCircle(circle));
  const rooms = generateRooms(origins);
  rooms.forEach(room => drawRoom(room));
}

addEventListener('load', () => init());