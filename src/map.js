const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function drawCircle({ x, y, radius }) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255, 0, 0, 1)";
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
  ctx.strokeStyle = "rgba(0, 0, 255, 1)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawEdge({ a, b }) {
  ctx.beginPath();

  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = "rgba(0, 255, 0, 1)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

const ROWS = 1000;
const COLS = 1000;
const ROOMS = Math.floor((ROWS * COLS) / 500);
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

function randArm(min, max, radiusSq) {
  if (max < min) return [0, 0];

  const arm = randInRange(min, max);
  return [arm - 1, Math.floor(Math.sqrt(radiusSq - arm * arm)) - 1];
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
  return origins.map(({ x, y, radius }, id) => {
    const radiusSq = radius * radius;
    const min = Math.ceil(radius * 0.35);
    const max = Math.floor(radius * 0.95);
    const [depth1, arm1] = randArm(min, max, radiusSq);
    const [depth2, arm2] = randArm(arm1 + 1, max, radiusSq);

    const points = [];

    // TODO: clean this up
    if (Math.random() < 0.5) {
      points.push({
        id,
        x: x - arm1,
        y: y - depth1,
      });
      points.push({
        id,
        x: x + arm1,
        y: y - depth1,
      });
      for (let i = 0; i < 4; ++i) {
        points.push({ id, x: x + arm1, y });
      }
      points.push({
        id,
        x: x + arm1,
        y: y + depth1,
      });
      points.push({
        id,
        x: x - arm1,
        y: y + depth1,
      });
      for (let i = 0; i < 4; ++i) {
        points.push({ id, x: x - arm1, y });
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
        points.push({ id, x, y: y - arm1 });
      }
      points.push({
        id,
        x: x + depth1,
        y: y - arm1,
      });
      points.push({
        id,
        x: x + depth1,
        y: y + arm1,
      });
      for (let i = 0; i < 4; ++i) {
        points.push({ id, x, y: y + arm1 });
      }
      points.push({
        id,
        x: x - depth1,
        y: y + arm1,
      });
      points.push({
        id,
        x: x - depth1,
        y: y - arm1,
      });
      points.push({ id, x, y: y - arm1 });

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

function roomsToNodes(rooms) {
  const nodes = [];
  rooms.forEach((points) => {
    for (let i = 0; i < points.length; i += 3) {
      const curr = points[i];
      const next = points[i + 1];

      const dx = next.x - curr.x;
      const dy = next.y - curr.y;

      if (dx === 0 && dy === 0) continue;

      const diff = Math.max(Math.abs(dx), Math.abs(dy));

      const offsets = [];

      for (let j = 0; j < 3; ++j) {
        const offset = randInRange(1, diff - 1);

        let pass = true;
        for (const other of offsets) {
          if (Math.abs(offset - other) < 10) {
            pass = false;
            break;
          }
        }

        if (pass) offsets.push(offset);
      }

      offsets.forEach((offset) => {
        if (dx > 0) {
          nodes.push({
            id: curr.id,
            dir: i / 3,
            x: curr.x + offset,
            y: curr.y,
          });
        } else if (dy > 0) {
          nodes.push({
            id: curr.id,
            dir: i / 3,
            x: curr.x,
            y: curr.y + offset,
          });
        } else if (dx < 0) {
          nodes.push({
            id: curr.id,
            dir: i / 3,
            x: curr.x - offset,
            y: curr.y,
          });
        } else if (dy < 0) {
          nodes.push({
            id: curr.id,
            dir: i / 3,
            x: curr.x,
            y: curr.y - offset,
          });
        }
      });
    }
  });
  return nodes;
}

class EdgeHeap {
  constructor() {
    this.values = [];
  }

  get length() {
    return this.values.length;
  }

  push(edge) {
    this.values.push(edge);
    this._bubbleUp(this.length - 1);
  }

  pop() {
    if (this.length === 0) return undefined;
    if (this.length === 1) return this.values.pop();
    const value = this.values[0];
    this.values[0] = this.values.pop();
    this._bubbleDown(0);
    return value;
  }

  _bubbleUp(idx) {
    if (idx === 0) return;
    const pIdx = Math.floor(idx / 2);
    const curr = this.values[idx];
    if (this._lt(this.values[pIdx], curr)) {
      return;
    }
    this.values[idx] = this.values[pIdx];
    this.values[pIdx] = curr;
    this._bubbleUp(pIdx);
  }

  _bubbleDown(idx) {
    const lIdx = idx * 2 + 1;
    const rIdx = idx * 2 + 2;
    let mIdx = lIdx;
    if (lIdx >= this.length) return;
    if (rIdx < this.length && this._lt(this.values[rIdx], this.values[lIdx])) {
      mIdx = rIdx;
    }
    const curr = this.values[idx];
    if (this._lt(curr, this.values[mIdx])) {
      return;
    }
    this.values[idx] = this.values[mIdx];
    this.values[mIdx] = curr;
    this._bubbleUp(mIdx);
  }

  _lt(a, b) {
    return this._city(a) < this._city(b);
  }

  _city(e) {
    return Math.abs(e.a.x - e.b.x) + Math.abs(e.a.y - e.b.y);
  }
}

function validDir(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  switch (a.dir) {
    case 0:
      return dy < 0;
    case 1:
      return dx > 0;
    case 2:
      return dy > 0;
    default:
      return dx < 0;
  }
}

function generateMST(count, nodes) {
  const inTree = new Array(count).fill(false);
  const edgeHeap = new EdgeHeap();

  for (let i = 0; i < nodes.length; ++i) {
    for (let j = i + 1; j < nodes.length; ++j) {
      if (nodes[i].id === nodes[j].id) continue;
      if (!validDir(nodes[i], nodes[j]) || !validDir(nodes[j], nodes[i]))
        continue;
      edgeHeap.push({
        a: nodes[i],
        b: nodes[j],
      });
    }
  }

  const edges = [];

  while (edgeHeap.length > 0) {
    const edge = edgeHeap.pop();

    if (inTree[edge.a.id] && inTree[edge.b.id]) continue;

    edges.push(edge);
    inTree[edge.a.id] = true;
    inTree[edge.b.id] = true;
  }

  return edges;
}

function generateMap() {}

function init() {
  const origins = generateOrigins();
  const rooms = generateRooms(origins);
  rooms.forEach((room) => drawRoom(room));
  const nodes = roomsToNodes(rooms);
  nodes.forEach((node) => drawCircle({ radius: 1, ...node }));
  const edges = generateMST(origins.length, nodes);
  edges.forEach((edge) => drawEdge(edge));
}

addEventListener("load", () => init());

