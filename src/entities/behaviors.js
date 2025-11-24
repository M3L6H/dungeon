import {
  ATTACK,
  EXAMINE,
  MOVE,
  SKILL,
  act,
  getMap,
  getPlayer,
  inRange,
} from "../gameState.js";
import { addLog } from "../logs.js";
import { poisonTouch } from "../skills.js";
import { DIRS, Heap } from "../utils.js";
import { Entity, getEntityById } from "./entity.js";

/**
 * Behavior where entity will use the Poison Touch skill on an adjacent target
 * @param entity {Entity} - The entity this behavior is for
 */
export function basicPoisonTouch(entity, baseChance = 0.5) {
  if (Math.random() >= baseChance) return false;
  const { targetId } = entity;
  if (targetId === null) return false;
  const targetLoc = entity.idToLoc[targetId];
  if (!targetLoc) return false;
  const { x: tX, y: tY } = targetLoc;
  const data = poisonTouch(entity, tX, tY);
  if (inRange(entity, SKILL, data)) {
    return act(entity, SKILL, data);
  }
  return false;
}

/**
 * Behavior where entity will use examine to look around itself
 * @param entity {Entity} - The entity this behavior is for
 */
export function explore(entity, range = 2) {
  const { x, y } = entity;
  const opts = [];
  for (let dx = -range; dx <= range; ++dx) {
    for (let dy = -range; dy <= range; ++dy) {
      const tX = x + dx;
      const tY = y + dy;
      if (
        !entity.getTileInMemory(tX, tY) &&
        getMap().canEntitySeeTile(entity, tX, tY)
      ) {
        opts.push({ x: tX, y: tY });
      }
    }
  }
  if (opts.length < 12) return false;
  logBehavior(entity, "exploring");
  return act(entity, EXAMINE, opts[Math.floor(Math.random() * opts.length)]);
}

/**
 * Behavior where entity will search for the first target in its memory that is on the targets list
 * @param entity {Entity} - The entity this behavior is for
 */
export function findTarget(entity) {
  const { entityMemory, tSet } = entity;
  if (tSet.size === 0) return false;
  if (entity.targetId !== null) return false;
  for (const k in entityMemory) {
    const entities = entityMemory[k];
    for (const { id } of entities) {
      const other = getEntityById(id);
      if (!other.dead && tSet.has(other.name.toLowerCase())) {
        entity.targetId = id;
        return false;
      }
    }
  }
  return false;
}

/**
 * Behavior where entity will flee from things it is afraid of.
 * @param entity {Entity} - The entity this behavior is for
 */
export function flee(entity, afraid = () => true) {
  const { entityMemory, memory, name, sightRange, w, h, x, y } = entity;
  const options = {};
  for (let dx = -sightRange; dx <= sightRange; ++dx) {
    for (let dy = -sightRange; dy <= sightRange; ++dy) {
      const [eX, eY] = [x + dx, y + dy];
      if (getMap().isTraversable(entity, eX, eY)) {
        options[eX + eY * w] = {
          x: eX,
          y: eY,
          heat: 0,
        };
      }
    }
  }
  const extRange = sightRange + 3;
  let enemiesInRange = false;
  for (let dx = -extRange; dx <= extRange; ++dx) {
    for (let dy = -extRange; dy <= extRange; ++dy) {
      const [eX, eY] = [x + dx, y + dy];
      if (eX < 0 || eY < 0 || eX >= w || eY >= h) continue;
      const entities = entityMemory[eX + eY * w] ?? [];
      for (const { id } of entities) {
        const other = getEntityById(id);
        if (!other.dead && other.name !== name && afraid(other)) {
          enemiesInRange = true;
          for (let ddx = -3; ddx <= 3; ++ddx) {
            for (let ddy = -3; ddy <= 3; ++ddy) {
              const sum = Math.abs(ddx) + Math.abs(ddy);
              if (sum > 3) continue;
              const [hX, hY] = [eX + ddx, eY + ddy];
              const idx = hX + hY * w;
              if (!options[idx]) continue;
              options[idx].heat +=
                4 - sum + (hX === other.x && hY === other.y ? 1 : 0);
            }
          }
        }
      }
    }
  }

  if (!enemiesInRange) return false;

  const heap = new Heap((a, b) => {
    if (a.heat < b.heat) return -1;
    if (b.heat < a.heat) return 1;
    return 0;
  });

  for (const option of Object.values(options)) {
    heap.push(option);
    const tile = memory[option.x + option.y * w];
    if (tile) tile.heat = option.heat;
  }

  while (heap.length > 0) {
    const { x: tX, y: tY } = heap.pop();
    const path = getMap().path(entity, tX, tY);
    if (path && path.length > 1) {
      logBehavior(entity, "fleeing");

      return act(entity, MOVE, path[1]);
    }
  }

  return false;
}

/**
 * Behavior where entity will path to the entity identified by targetId based on its memory
 * @param entity {Entity} - The entity this behavior is for
 */
export function hunt(entity) {
  const { searching, targetId, x, y } = entity;
  if (targetId === null) return false;

  const targetLoc = entity.idToLoc[targetId];
  if (!targetLoc) return false;
  const { x: tX, y: tY } = targetLoc;
  if (x === tX && y === tY) {
    if (!searching) {
      entity.searching = true;
      logBehavior(entity, "searching");
      return act(entity, EXAMINE, { x, y: y - 1 });
    } else if (entity.dir < 3) {
      return act(entity, EXAMINE, {
        x: x + DIRS[entity.dir + 1][0],
        y: y + DIRS[entity.dir + 1][1],
      });
    } else {
      entity.targetId = null;
      entity.searching = false;
      return false;
    }
  }
  const path = getMap().path(entity, tX, tY);
  if (!path || path.length <= 1) return false;

  logBehavior(entity, "hunting");
  return act(entity, MOVE, path[1]);
}

/**
 * Behavior where entity will attack an adjacent target
 * @param entity {Entity} - The entity this behavior is for
 */
export function simpleAttack(entity) {
  const { targetId } = entity;
  if (targetId === null) return false;
  const targetLoc = entity.idToLoc[targetId];
  if (!targetLoc) return false;
  const { x: tX, y: tY } = targetLoc;
  const target = { x: tX, y: tY };
  if (inRange(entity, ATTACK, target)) {
    return act(entity, ATTACK, target);
  }
  return false;
}

/**
 * Behavior where entity will wander randomly
 * @param entity {Entity} - The entity this behavior is for
 */
export function wander(entity) {
  const { x, y } = entity;
  let [dx, dy] = DIRS[entity.dir];
  let target = { x: x + dx, y: y + dy };

  if (Math.random() >= 0.75 || !inRange(entity, MOVE, target)) {
    const dirsCopy = [...DIRS];
    const pDirs = [];
    while (dirsCopy.length > 0) {
      pDirs.push(
        dirsCopy.splice(Math.floor(Math.random(dirsCopy.length)), 1)[0],
      );
    }
    for (const dir of pDirs) {
      const [dx, dy] = dir;
      target = { x: x + dx, y: y + dy };
      if (inRange(entity, MOVE, target)) break;
    }
  }

  logBehavior(entity, "wandering");
  return act(entity, MOVE, target);
}

/**
 * Behavior where an entity will rest
 * @param entity {Entity} - The entity this behavior is for
 */
export function rest(entity) {
  const { x, y } = entity;
  return act(entity, MOVE, { x, y });
}

function logBehavior(entity, behavior) {
  const { displayName, x, y } = entity;
  if (getMap().canEntitySeeTile(getPlayer(), x, y)) {
    addLog(`${displayName} is ${behavior}`);
  }
}
