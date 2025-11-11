import { Tile } from './tile.js';

const ROWS = 1000;
const COLS = 1000;
const ROOMS = Math.floor((ROWS * COLS) / 500);
const MIN_RADIUS = 3;

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
        points[2].y = y - arm2;
        points[3].y = y - arm2;
        points[4].y = y + arm2;
        points[5].y = y + arm2;
        points[8].y = y + arm2;
        points[9].y = y + arm2;
        points[10].y = y - arm2;
        points[11].y = y - arm2;

        const side = Math.random();
        if (side < 0.375 || side >= 0.75) {
          points[3].x = x + depth2;
          points[4].x = x + depth2;
        }
        if (side >= 0.375) {
          points[9].x = x - depth2;
          points[10].x = x - depth2;
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
        points[0].x = x - arm2;
        points[1].x = x + arm2;
        points[2].x = x + arm2;
        points[5].x = x + arm2;
        points[6].x = x + arm2;
        points[7].x = x - arm2;
        points[8].x = x - arm2;
        points[11].x = x - arm2;

        const side = Math.random();
        if (side < 0.375 || side >= 0.75) {
          points[0].y = y - depth2;
          points[1].y = y - depth2;
        }
        if (side >= 0.375) {
          points[6].y = y + depth2;
          points[7].y = y + depth2;
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

function generateEdges(count, nodes) {
  return new Promise((resolve) => {
    const edgeWorker = new Worker("edgeWorker.js");
    edgeWorker.postMessage({ count, nodes });
    edgeWorker.onmessage = function (event) {
      resolve(event.data);
    };
  });
}

function isL(a, b) {
  return Math.abs(a.dir - b.dir) % 2 === 1;
}

class Map {
  constructor(width, height, rooms, edges) {
    this.w = width;
    this.h = height;
    this.tiles = new Array(width * height);

    for (let i = 0; i < this.tiles.length; ++i) {
      this.tiles[i] = Tile.wall();
    }

    rooms.forEach((points) => {
      this._fillRect(points[0], points[6], Tile.floor);
      this._fillRect(points[10], points[4], Tile.floor);
    });
    
    edges.forEach(({ a, b }) => {
      if (isL(a, b)) {
        const m = {
          x: a.dir % 2 === 0 ? a.x : b.x,
          y: a.dir % 2 === 1 ? a.y : b.y,
        };
        this._fillRect(a, m, Tile.floor);
        this._fillRect(m, b, Tile.floor);
        return;
      }
      
      const mCoord = a.dir % 2 === 0 ? randInRange(Math.min(a.y, b.y) + 1, Math.max(a.y, b.y) - 1) : randInRange(Math.min(a.x, b.x) + 1, Math.max(a.x, b.x) - 1);
      const m1 = {
        x: a.dir % 2 === 0 ? a.x : mCoord,
        y: a.dir % 2 === 1 ? a.y : mCoord,
      };
      const m2 = {
        x: b.dir % 2 === 0 ? b.x : mCoord,
        y: b.dir % 2 === 1 ? b.y : mCoord,
      };
      this._fillRect(a, m1, Tile.floor);
      this._fillRect(m1, m2, Tile.floor);
      this._fillRect(m2, b, Tile.floor);
    });
  }

  writeToImage(imageData) {
    for (let x = 0; x < this.w; ++x) {
      for (let y = 0; y < this.h; ++y) {
        const tile = this.getTile(x, y);
        const r = (x + y * this.w) * 4;
        const g = r + 1;
        const b = r + 2;
        const a = r + 3;
        imageData.data[a] = 255;

        if (tile.isTraversable) {
          imageData.data[r] = 255;
          imageData.data[g] = 255;
          imageData.data[b] = 255;
        } else {
          imageData.data[r] = 0;
          imageData.data[g] = 0;
          imageData.data[b] = 0;
        }
      }
    }
  }

  /**
   * @returns {Tile} The tile at x, y
   */
  getTile(x, y) {
    return this.tiles[x + y * this.w];
  }

  _fillRect(a, b, tileFn) {
    const x0 = Math.min(a.x, b.x);
    const x1 = Math.max(a.x, b.x);
    const y0 = Math.min(a.y, b.y);
    const y1 = Math.max(a.y, b.y);
    for (let x = x0; x <= x1; ++x) {
      for (let y = y0; y <= y1; ++y) {
        this._setTile(x, y, tileFn());
      }
    }
  }

  _setTile(x, y, tile) {
    this.tiles[x + y * this.w] = tile;
  }
}

export async function generateMap() {
  const origins = generateOrigins();
  const rooms = generateRooms(origins);
  const nodes = roomsToNodes(rooms);
  const edges = await generateEdges(origins.length, nodes);
  return new Map(COLS, ROWS, rooms, edges);
}

async function init() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const drawCircle = ({ x, y, radius }) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 0, 0, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  const drawRoom = (points) => {
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
  };

  const drawEdge = ({ a, b }) => {
    ctx.beginPath();

    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = "rgba(0, 255, 0, 1)";
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  const drawMap = (map) => {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    map.writeToImage(imageData);
    ctx.putImageData(imageData, 0, 0);
  };

  const map = await generateMap();
  drawMap(map);
}
