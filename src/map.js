import {
  getRandomEntityForDifficultyRange,
  examineEntity,
} from "./entities/index.js";
import { getTileEntities } from "./gameState.js";
import { getNameForStart } from "./name.js";
import { Tile } from "./tile.js";
import { lockedDoor, ratSpawner, simpleDoor } from "./tileEntities/index.js";
import { DIRS, Heap } from "./utils.js";

const ROWS = 256;
const COLS = 256;
const ROOMS = Math.floor((ROWS * COLS) / 500);
const MIN_RADIUS = 3;
const OFFSETS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

const heat = new Array(ROWS * COLS).fill(0);

export function getHeat() {
  return heat;
}

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
    origins.push({ x, y, radius, id: origins.length });
  }

  return origins;
}

function generateRooms(origins) {
  return origins.map(({ x, y, radius, id }) => {
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

function cbd(x1, y1, x2, y2) {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

export const RoomType = {
  BOSS: "boss",
  COMBAT: "combat",
  MAZE: "maze",
  SECRET: "secret",
  START: "start",
  TREASURE: "treasure",
};

export class Map {
  constructor(width, height, origins, rooms, edges) {
    this.w = width;
    this.h = height;
    this.origins = origins;
    this.points = rooms;
    this.entities = new Array(width * height);
    this.tiles = new Array(width * height);
    this.tileToId = new Array(width * height).fill();

    for (let i = 0; i < this.tiles.length; ++i) {
      this.entities[i] = [];
      this.tiles[i] = [Tile.wall, undefined];
    }

    rooms.forEach((points) => {
      this._fillRect(points[0], points[6], Tile.floor, points[0].id);
      this._fillRect(points[10], points[4], Tile.floor, points[0].id);
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

    this.start = this.getRandomRoom();
    while (
      this.start.radius > 5 ||
      this.start.x < 30 ||
      this.start.y < 30 ||
      this.start.x > this.w - 30 ||
      this.start.y > this.h - 30
    ) {
      this.start = this.getRandomRoom();
    }
    this.start.name = getNameForStart();
    this.start.type = RoomType.START;
    this._assignDifficultyAndRoomType(edges);
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

    return (
      0 <= di &&
      di <= sightRange &&
      Math.abs(dj) <= di + 1 &&
      this.entityHasLoS(entity, tX, tY)
    );
  }

  entityHasLoS(entity, tX, tY) {
    const { x, y } = entity;
    return this._coordsEqual(this._rayCast(entity, x, y, tX, tY), {
      x: tX,
      y: tY,
    });
  }

  examine(examiner, tX, tY) {
    const details = [];
    this.getEntities(tX, tY).forEach((entity) => {
      details.push(examineEntity(entity, examiner));
    });
    const tileEntity = this.getTileEntity(tX, tY);
    if (tileEntity) details.push(tileEntity.examine(examiner));
    details.push(this.getTile(tX, tY).examine(examiner));
    this.updateMemory(examiner);
    return details.join("\r\n");
  }

  getEntities(x, y) {
    const idx = x + y * this.w;
    this.entities[idx] = this.entities[idx].filter(
      ({ dead, x: eX, y: eY }) => !dead && x === eX && y === eY,
    );
    return this.entities[idx];
  }

  getRandomRoom() {
    return this.origins[Math.floor(Math.random() * this.origins.length)];
  }

  /**
   * @returns {Tile} The tile at x, y
   */
  getTile(x, y) {
    return this.tiles[x + y * this.w][0];
  }

  /**
   * @returns {TileEntity} The tile entity at x, y
   */
  getTileEntity(x, y) {
    return this.tiles[x + y * this.w][1];
  }

  isTraversable(entity, x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return false;
    return this._isTraversable(
      entity,
      this.getTile(x, y),
      this.getTileEntity(x, y),
    );
  }

  /**
   * UPDATES the entityToMove with tX, tY and moves them in the map.
   */
  moveEntity(entityToMove, tX, tY) {
    const { id, x, y } = entityToMove;
    const entities = this.getEntities(x, y);
    if (entities.length === 1 && entities[0].id === id) {
      entities.pop();
    } else if (entities.length > 1) {
      const replacement = entities.pop();
      for (let i = 0; i < entities.length && replacement.id !== id; ++i) {
        if (entities[i].id === id) {
          entities[i] = replacement;
          break;
        }
      }
    }

    this.getEntities(tX, tY).push(entityToMove);
    entityToMove.x = tX;
    entityToMove.y = tY;
    
    if (entityToMove.isPlayer) {
      entityToMove.location = this.origins[this.tileToId[tX + tY * this.w]]?.name;
    } 
 
    this.updateMemory(entityToMove);
    this.getTileEntity(tX, tY)?.enter(entityToMove);
    return entityToMove;
  }

  path(entity, tX, tY, useHeat = false) {
    const visited = new Array(this.w * this.h);
    const heap = new Heap((a, b) => {
      if (a.hcost < b.hcost) return -1;
      else if (a.hcost > b.hcost) return 1;
      return 0;
    });
    const { x, y } = entity;
    let hcost = cbd(x, y, tX, tY);
    heap.push({ x, y, fcost: 0, hcost, pcount: 0, prev: null });

    while (heap.length > 0) {
      let curr = heap.pop();
      const idx = curr.x + curr.y * this.w;
      if (visited[idx]) continue;
      visited[idx] = true;

      if (curr.x === tX && curr.y === tY) {
        const path = new Array(curr.pcount + 1);
        for (let i = path.length - 1; i >= 0; --i) {
          path[i] = curr;
          curr = curr.prev;
        }

        return path;
      }

      for (const [dx, dy] of OFFSETS) {
        const newX = curr.x + dx;
        const newY = curr.y + dy;
        if (visited[newX + newY * this.w]) continue;
        if (
          !this._isTraversable(
            entity,
            entity.getTileInMemory(newX, newY),
            entity.getTileEntityInMemory(newX, newY),
          )
        )
          continue;
        const fcost =
          curr.fcost + 1 + (useHeat ? heat[newX + newY * this.w] : 0);
        const pcount = curr.pcount + 1;
        hcost = fcost + cbd(newX, newY, tX, tY);
        const neighbor = {
          x: newX,
          y: newY,
          fcost,
          hcost,
          pcount,
          prev: curr,
        };
        heap.push(neighbor);
      }
    }

    return [];
  }

  spawnEntities() {
    for (let id = 0; id < this.origins.length; ++id) {
      const { difficulty, radius, type } = this.origins[id];
      if (type !== RoomType.COMBAT) continue;
      const count = Math.min(20, (radius - 1) * (radius - 1));
      let budget = difficulty * count;
      for (let i = 0; i < count && budget > 0; ++i) {
        if (Math.random() < 0.5) continue;
        const [creator, actualDifficulty] = getRandomEntityForDifficultyRange(
          difficulty - 3,
          difficulty + 3,
        );
        if (!creator) continue;

        let a, b;
        if (Math.random() < 0.5) {
          a = this.points[id][0];
          b = this.points[id][6];
        } else {
          a = this.points[id][10];
          b = this.points[id][4];
        }

        while (true) {
          const x = randInRange(a.x, b.x);
          const y = randInRange(a.y, b.y);
          if (
            this.getTile(x, y).name === Tile.floor.name &&
            this.getTileEntity(x, y) === undefined
          ) {
            creator(x, y);
            budget -= actualDifficulty;
            break;
          }
        }
      }
    }
  }

  updateMemory(entity) {
    const dirMod2 = entity.dir % 2;
    const invDirMod2 = 1 - dirMod2;
    for (let i = 0; i <= entity.sightRange; ++i) {
      for (let j = -(i + 1); j <= i + 1; ++j) {
        const dx = dirMod2 * i * -(entity.dir - 2) + invDirMod2 * j;
        const dy = invDirMod2 * i * (entity.dir - 1) + dirMod2 * j;
        const x = entity.x + dx;
        const y = entity.y + dy;

        if (
          x < 0 ||
          x > this.w ||
          y < 0 ||
          y > this.h ||
          !this.canEntitySeeTile(entity, x, y)
        )
          continue;

        const tileEntity = this.getTileEntity(x, y);
        entity.setTileInMemory(
          x,
          y,
          tileEntity === undefined
            ? undefined
            : {
                id: tileEntity.id,
                sprite: tileEntity.sprite,
                state: tileEntity.state,
              },
        );
        entity.setEntitiesInMemory(x, y, this.getEntities(x, y));
      }
    }
  }

  writeToImage(imageData) {
    for (let x = 0; x < this.w; ++x) {
      for (let y = 0; y < this.h; ++y) {
        const idx = x + y * this.w;
        const tile = this.getTile(x, y);
        const tileEntity = this.getTileEntity(x, y);
        const id = this.tileToId[idx];
        const { difficulty } = this.origins[id] ?? { difficulty: 0 };
        for (let i = 0; i < 2; ++i) {
          const r = (x + 2 * y * this.w) * 8 + i * 4;
          const g = r + 1;
          const b = r + 2;
          const a = r + 3;
          imageData.data[a] = 255;
          const r1 = r + this.w * 8;
          const g1 = r1 + 1;
          const b1 = r1 + 2;
          const a1 = r1 + 3;
          imageData.data[a1] = 255;

          if (tileEntity?.name === "Door") {
            imageData.data[r] = 150;
            imageData.data[g] = 75;
            imageData.data[b] = 0;
            imageData.data[r1] = 150;
            imageData.data[g1] = 75;
            imageData.data[b1] = 0;
          } else if (id === this.start.id) {
            imageData.data[r] = 0;
            imageData.data[g] = 255;
            imageData.data[b] = 0;
            imageData.data[r1] = 0;
            imageData.data[g1] = 255;
            imageData.data[b1] = 0;
          } else if (this.origins[id]?.type === RoomType.SECRET) {
            imageData.data[r] = 0;
            imageData.data[g] = 0;
            imageData.data[b] = 255;
            imageData.data[r1] = 0;
            imageData.data[g1] = 0;
            imageData.data[b1] = 255;
          } else if (this.origins[id]?.type === RoomType.TREASURE) {
            imageData.data[r] = 255;
            imageData.data[g] = 255;
            imageData.data[b] = 0;
            imageData.data[r1] = 255;
            imageData.data[g1] = 255;
            imageData.data[b1] = 0;
          } else if (this.origins[id]?.type === RoomType.COMBAT) {
            imageData.data[r] = 255;
            imageData.data[g] = Math.max(0, 255 - difficulty * 8);
            imageData.data[b] = Math.max(0, 255 - difficulty * 8);
            imageData.data[r1] = 255;
            imageData.data[g1] = Math.max(0, 255 - difficulty * 8);
            imageData.data[b1] = Math.max(0, 255 - difficulty * 8);
          } else if (tile.isTraversable()) {
            imageData.data[r] = 255;
            imageData.data[g] = 255;
            imageData.data[b] = 255;
            imageData.data[r1] = 255;
            imageData.data[g1] = 255;
            imageData.data[b1] = 255;
          } else {
            imageData.data[r] = 0;
            imageData.data[g] = 0;
            imageData.data[b] = 0;
            imageData.data[r1] = 0;
            imageData.data[g1] = 0;
            imageData.data[b1] = 0;
          }
        }
      }
    }
  }

  /**
   * Assign room difficulty and annotate room types.
   */
  _assignDifficultyAndRoomType(edges) {
    const adj = Array.from({ length: this.origins.length }, () => []);
    const roomIdToEdge = {};
    edges.forEach(({ a, b }) => {
      adj[a.id].push(b.id);
      adj[b.id].push(a.id);
      const edgesA = roomIdToEdge[a.id] ?? [];
      edgesA.push(a);
      roomIdToEdge[a.id] = edgesA;
      const edgesB = roomIdToEdge[b.id] ?? [];
      edgesB.push(b);
      roomIdToEdge[b.id] = edgesB;
    });
    this.start.difficulty = 0;
    const q = [this.start];
    for (let i = 0; i < q.length; ++i) {
      adj[q[i].id].forEach((id) => {
        const origin = this.origins[id];
        if (origin.difficulty !== undefined) return;
        origin.difficulty = q[i].difficulty + 1;
        q.push(origin);
      });

      const { id } = q[i];
      const room = this.origins[id];
      if (room.type !== undefined) continue;

      // Terminating room
      if (adj[id].length === 1 && room.radius < 10) {
        const r = Math.random();

        if (r < 0.1) {
          // 10% chance of secret room
          room.type = RoomType.SECRET;
          continue;
        } else if (r < 1.3) {
          // 20% chance of treasure room
          room.type = RoomType.TREASURE;
          const { dir, x, y } = roomIdToEdge[id][0];
          const [dx, dy] = DIRS[dir];
          const newX = x + dx;
          const newY = y + dy;
          this._setTileEntity(newX, newY, lockedDoor(newX, newY));
          continue;
        }
      }

      if (room.radius < 15 && Math.random() < 0.75) {
        room.type = RoomType.COMBAT;
        const endpoints = [
          [this.points[id][0], this.points[id][1]],
          [this.points[id][3], this.points[id][4]],
          [this.points[id][6], this.points[id][7]],
          [this.points[id][9], this.points[id][10]],
        ];
        for (let i = 0; i < endpoints.length; ++i) {
          const [a, b] = endpoints[i];
          const xMin = Math.min(a.x, b.x);
          const xMax = Math.max(a.x, b.x);
          const yMin = Math.min(a.y, b.y);
          const yMax = Math.max(a.y, b.y);
          for (let x = xMin; x <= xMax; ++x) {
            for (let y = yMin; y <= yMax; ++y) {
              const dx = -(i % 2) * (i - 2);
              const dy = ((i + 1) % 2) * (i - 1);
              const newX = x + dx;
              const newY = y + dy;
              if (this.getTile(newX, newY).isTraversable()) {
                if (
                  Math.random() < 0.5 &&
                  this.getTile(newX + dx, newY + dy).isTraversable()
                ) {
                  this._setTileEntity(newX, newY, simpleDoor(newX, newY));
                }
                continue;
              }
              if (Math.random() < 0.05) {
                this._setTileEntity(newX, newY, ratSpawner(x, y, (i + 2) % 4));
              }
            }
          }
        }
        continue;
      }
    }
  }

  _coordsEqual(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  _fillRect(a, b, tile, id) {
    const x0 = Math.min(a.x, b.x);
    const x1 = Math.max(a.x, b.x);
    const y0 = Math.min(a.y, b.y);
    const y1 = Math.max(a.y, b.y);
    for (let x = x0; x <= x1; ++x) {
      for (let y = y0; y <= y1; ++y) {
        this._setTile(x, y, tile);
        if (id !== undefined) {
          this.tileToId[x + y * this.w] = id;
        }
      }
    }
  }

  _isTraversable(entity, tile, tileEntityData) {
    const tileEntity = getTileEntities()[tileEntityData?.id];
    return (
      (tile?.isTraversable(entity) ?? false) &&
      (tileEntity?._isTraversable(tileEntityData?.state, entity) ?? true)
    );
  }

  _rayCast(entity, x1, y1, x2, y2) {
    if (x1 < x2) {
      const m = (y2 - y1) / (x2 - x1);
      for (let i = 0; i <= x2 - x1; i += 0.2) {
        const x = this._round(x1 + i);
        const y = this._round(y1 + m * i);
        const tile = this.getTile(x, y);
        const tileEntity = this.getTileEntity(x, y);
        if (tile.isOpaque(entity) || tileEntity?.isOpaque(entity))
          return { x, y };
      }
    } else if (x2 < x1) {
      const m = (y2 - y1) / (x2 - x1);
      for (let i = 0; i >= x2 - x1; i -= 0.2) {
        const x = this._round(x1 + i);
        const y = this._round(y1 + m * i);
        const tile = this.getTile(x, y);
        const tileEntity = this.getTileEntity(x, y);
        if (tile.isOpaque(entity) || tileEntity?.isOpaque(entity))
          return { x, y };
      }
    } else if (y1 < y2) {
      for (let y = y1; y <= y2; ++y) {
        const tile = this.getTile(x1, y);
        const tileEntity = this.getTileEntity(x1, y);
        if (tile.isOpaque(entity) || tileEntity?.isOpaque(entity))
          return { x: x1, y };
      }
    } else {
      for (let y = y1; y >= y2; --y) {
        const tile = this.getTile(x1, y);
        const tileEntity = this.getTileEntity(x1, y);
        if (tile.isOpaque(entity) || tileEntity?.isOpaque(entity))
          return { x: x1, y };
      }
    }

    return { x: x2, y: y2 };
  }

  _round(n) {
    return Math.sign(n) * Math.round(Math.abs(n));
  }

  _setTile(x, y, tile) {
    this.tiles[x + y * this.w][0] = tile;
  }

  _setTileEntity(x, y, tileEntity) {
    this.tiles[x + y * this.w][1] = tileEntity;
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

  canvas.width = COLS * 2;
  canvas.height = ROWS * 2;

  const ctx = canvas.getContext("2d");
  const map = await generateMap();
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  map.writeToImage(imageData);
  ctx.putImageData(imageData, 0, 0);
}

window.addEventListener("load", async () => await init());
