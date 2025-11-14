import { Tile } from "./tile.js";

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

  let currRadius = Math.floor((ROWS + COLS) / 25);
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
    const edgeWorker = new Worker("edgeWorker.js" + `?${Math.random()}`);
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
  constructor(width, height, origins, rooms, edges) {
    this.w = width;
    this.h = height;
    this.origins = origins;
    this.entities = new Array(width * height);
    this.tiles = new Array(width * height);

    for (let i = 0; i < this.tiles.length; ++i) {
      this.entities[i] = [];
      this.tiles[i] = Tile.wall;
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

      const mCoord =
        a.dir % 2 === 0
          ? randInRange(Math.min(a.y, b.y) + 2, Math.max(a.y, b.y) - 2)
          : randInRange(Math.min(a.x, b.x) + 2, Math.max(a.x, b.x) - 2);
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

  /**
   * @returns {boolean} Whether or not the entity can see the tile
   */
  canEntitySeeTile(entity, tX, tY) {
    const { dir, sightRange, x, y } = entity;
    const dirMod2 = dir % 2;
    const invDirMod2 = 1 - dirMod2;
    const di =
      (tX - x) * dirMod2 * -(dir - 2) + (tY - y) * invDirMod2 * (dir - 1);
    const dj = (tY - y) * dirMod2 + (tX - x) * invDirMod2;

    return 0 <= di && di <= sightRange && Math.abs(dj) <= di + 1 && this._coordsEqual(this._rayCast(x, y, tX, tY), { x: tX, y: tY });
  }

  getEntities(x, y) {
    return this.entities[x + y * this.w];
  }

  getRandomRoom() {
    const origin =
      this.origins[Math.floor(Math.random() * this.origins.length)];
    return {
      x: origin.x,
      y: origin.y,
    };
  }

  /**
   * UPDATES the entityToMove with tX, tY and moves them in the map.
   */
  moveEntity(entityToMove, tX, tY) {
    const { name, x, y } = entityToMove;
    const entities = this.getEntities(x, y);
    if (entities.length === 1 && entities[0].name === name) {
      entities.pop();
    } else if (entities.length > 1) {
      const replacement = entities.pop();
      for (let i = 0; i < entities.length && replacement.name !== name; ++i) {
        if (entities[i].name === name) {
          entities[i] = replacement;
          break;
        }
      }
    }

    this.getEntities(tX, tY).push(entityToMove);
    entityToMove.x = tX;
    entityToMove.y = tY;
    this._updateMemory(entityToMove);
    return entityToMove;
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

  _coordsEqual(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  _fillRect(a, b, tile) {
    const x0 = Math.min(a.x, b.x);
    const x1 = Math.max(a.x, b.x);
    const y0 = Math.min(a.y, b.y);
    const y1 = Math.max(a.y, b.y);
    for (let x = x0; x <= x1; ++x) {
      for (let y = y0; y <= y1; ++y) {
        this._setTile(x, y, tile);
      }
    }
  }
  
  _rayCast(x1, y1, x2, y2) {
    if (x1 < x2) {
      const m = (y2 - y1) / (x2 - x1);
      for (let i = 0; i <= x2 - x1; i += 0.25) {
        const x = Math.round(x1 + i);
        const y = y1 + Math.round(m * i);
        const tile = this.getTile(x, y);
        if (tile.isOpaque) return { x, y }; 
      }
    } else if (x2 < x1) {
      const m = (y2 - y1) / (x2 - x1);
      for (let i = 0; i >= x2 - x1; i -= 0.25) {
        const x = Math.round(x1 + i);
        const y = y1 + Math.round(m * i);
        const tile = this.getTile(x, y);
        if (tile.isOpaque) return { x, y }; 
      }
    } else if (y1 < y2) {
      for (let j = y1; j <= y2; ++j) {
        const tile = this.getTile(x1, j);
        if (tile.isOpaque) return { x: x1, y: j }; 
      }
    } else {
      for (let j = y1; j >= y2; --j) {
        const tile = this.getTile(x1, j);
        if (tile.isOpaque) return { x: x1, y: j }; 
      }
    }
    
    return { x: x2, y: y2 };
  }

  _setTile(x, y, tile) {
    this.tiles[x + y * this.w] = tile;
  }

  _updateMemory(entity) {
    const dirMod2 = entity.dir % 2;
    const invDirMod2 = 1 - dirMod2;
    for (let i = 0; i <= entity.sightRange; ++i) {
      for (let j = -(i + 1); j <= i + 1; ++j) {
        const dx = dirMod2 * i * -(entity.dir - 2) + invDirMod2 * j;
        const dy = invDirMod2 * i * (entity.dir - 1) + dirMod2 * j;
        const x = entity.x + dx;
        const y = entity.y + dy;

        if (x < 0 || x > this.w || y < 0 || y > this.h || !this.canEntitySeeTile(entity, x, y)) continue;

        entity.setTileInMemory(x, y, this.getTile(x, y).name);
      }
    }
  }
}

export async function generateMap() {
  const origins = generateOrigins();
  const rooms = generateRooms(origins);
  const nodes = roomsToNodes(rooms);
  const edges = await generateEdges(origins.length, nodes);
  return new Map(COLS, ROWS, origins, rooms, edges);
}

async function init() {
  const canvas = document.getElementById("canvas");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const map = await generateMap();
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  map.writeToImage(imageData);
  ctx.putImageData(imageData, 0, 0);
}

window.addEventListener("load", async () => await init());
