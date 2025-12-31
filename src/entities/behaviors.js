import { registerFn } from "../functions.js";
import {
  ATTACK,
  EXAMINE,
  MOVE,
  SKILL,
  act,
  getMap,
  getPlayer,
  inRange,
  logCombatDanger,
} from "../gameState.js";
import { addLog } from "../logs.js";
import { getHeat } from "../map.js";
import { poisonTouch } from "../skills.js";
import { CARDINAL_DIRS, DIRS, Heap, permuteArr } from "../utils.js";
import { Entity, getEntityById } from "./entity.js";

const BEHAVIOR = "behavior";

/**
 * Behavior where entity will use the Poison Touch skill on an adjacent target
 * @param entity {Entity} - The entity this behavior is for
 */
export async function basicPoisonTouchTemplate(entity, chance = 0.5) {
  if (Math.random() >= chance) return false;
  const targetLoc = getTargetLoc(entity);
  if (!targetLoc) return false;
  const { x: tX, y: tY } = targetLoc;
  const data = poisonTouch(entity, tX, tY);
  if (inRange(entity, SKILL, data)) {
    return await act(entity, SKILL, data);
  }
  return false;
}

/**
 * Behavior where entity will use examine to look around itself
 * @param entity {Entity} - The entity this behavior is for
 */
export async function exploreTemplate(entity, range = 2) {
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
  await logBehavior(entity, "exploring");
  return await act(
    entity,
    EXAMINE,
    opts[Math.floor(Math.random() * opts.length)],
  );
}

/**
 * Behavior where entity will search for the first target in its memory that is on the targets list
 * @param entity {Entity} - The entity this behavior is for
 */
export const findTarget = registerFn(BEHAVIOR, "findTarget", async function(entity) {
  const { entityMemory, tSet } = entity;
  if (tSet.size === 0) return false;
  if (entity.targetId !== null) return false;
  for (const k in entityMemory) {
    const entities = entityMemory[k];
    for (const { id } of entities) {
      const other = getEntityById(id);
      if (!other.isItem && !other.dead && tSet.has(other.name.toLowerCase())) {
        entity.targetId = id;
        return false;
      }
    }
  }
  return false;
});

/**
 * Behavior where entity will flee from things it is afraid of.
 * @param entity {Entity} - The entity this behavior is for
 */
export async function fleeTemplate(entity, afraid = () => true) {
  const { w, h } = getMap();
  const { entityMemory, name, sightRange, x, y } = entity;
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
      for (const { dir, id } of entities) {
        if (dir === undefined) continue;
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

  if (options[x + y * w].heat <= 0) return false;

  const heap = new Heap((a, b) => {
    if (a.heat < b.heat) return -1;
    if (b.heat < a.heat) return 1;
    return 0;
  });

  for (const option of Object.values(options)) {
    heap.push(option);
    getHeat()[option.x + option.y * w] = option.heat;
  }

  let minHeat = Infinity;
  let minCost = Infinity;
  let minPath = undefined;

  while (heap.length > 0) {
    const { x: tX, y: tY, heat } = heap.pop();
    if (heat > minHeat) break;
    const path = getMap().path(entity, tX, tY, true);
    if (path && path.length > 1) {
      minHeat = Math.min(minHeat, heat);
      const cost = path.reduce(
        (prev, { x: cX, y: cY }) =>
          prev + 1 + (options[cX + cY * w]?.heat ?? 0),
        0,
      );
      if (cost < minCost) {
        minPath = path;
        minCost = cost;
      }
    }
  }

  if (minPath !== undefined) {
    await logBehavior(entity, "fleeing");
    return await act(entity, MOVE, minPath[1]);
  }

  return false;
}

/**
 * Behavior where entity will path to the entity identified by targetId based on its memory
 * @param entity {Entity} - The entity this behavior is for
 */
export const hunt = registerFn(BEHAVIOR, "hunt", async function(entity) {
  const { searching, x, y } = entity;
  const targetLoc = getTargetLoc(entity);
  if (!targetLoc) return false;
  const { x: tX, y: tY } = targetLoc;
  if (x === tX && y === tY) {
    if (!searching) {
      entity.searching = true;
      await logBehavior(entity, "searching");
      return await act(entity, EXAMINE, { x, y: y - 1 });
    } else if (entity.dir < 3) {
      return await act(entity, EXAMINE, {
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

  await logBehavior(entity, "hunting");
  return await act(entity, MOVE, path[1]);
});

/**
 * Behavior where entity will fly like a projectile
 * @param entity {Entity} - The entity this behavior is for
 */
export const projectile = registerFn(BEHAVIOR, "projectile", async function(entity) {
  const { dir, displayName, x, y } = entity;
  const [dx, dy] = DIRS[dir];
  const target = { x: x + dx, y: y + dy };

  for (const other of getMap().getEntities(x, y)) {
    if (!other.isProjectile && !other.isItem) {
      await logCombatDanger(
        entity,
        other,
        `${other.displayName} was hit by a ${displayName} and took ${entity.damage} damage!`,
      );

      other.health -= entity.damage;
      entity.dead = true;

      return true;
    }
  }

  if (!inRange(entity, MOVE, target)) {
    entity.dead = true;
    return true;
  }

  await act(entity, MOVE, { ...target, silent: true });
  await logBehavior(entity, `flying ${CARDINAL_DIRS[dir]}`);
  return true;
});

/**
 * Behavior where entity will attack an adjacent target
 * @param entity {Entity} - The entity this behavior is for
 */
export const simpleAttack = registerFn(BEHAVIOR, "simpleAttack", async function(entity) {
  const targetLoc = getTargetLoc(entity);
  if (!targetLoc) return false;
  const { x: tX, y: tY } = targetLoc;
  const target = { x: tX, y: tY };
  if (inRange(entity, ATTACK, target)) {
    return await act(entity, ATTACK, target);
  }
  return false;
});

/**
 * Behavior where entity will wander randomly
 * @param entity {Entity} - The entity this behavior is for
 */
export const wander = registerFn(BEHAVIOR, "wander", async function(entity) {
  const { x, y } = entity;
  let [dx, dy] = DIRS[entity.dir];
  let target = { x: x + dx, y: y + dy };

  if (Math.random() >= 0.75 || !inRange(entity, MOVE, target)) {
    const pDirs = permuteArr([...DIRS]);
    for (const dir of pDirs) {
      const [dx, dy] = dir;
      target = { x: x + dx, y: y + dy };
      if (inRange(entity, MOVE, target)) {
        return await act(entity, MOVE, target);
      }
    }
  }

  await logBehavior(entity, "wandering");
  return await act(entity, MOVE, target);
});

/**
 * Behavior where an entity will rest
 * @param entity {Entity} - The entity this behavior is for
 */
export const rest = registerFn(BEHAVIOR, "rest", async function(entity) {
  const { x, y } = entity;
  return await act(entity, MOVE, { x, y });
});

function getTargetLoc(entity) {
  const { targetId } = entity;
  if (targetId === null) return undefined;
  if (getEntityById(targetId).dead) {
    entity.targetId = null;
    return undefined;
  }
  return entity.idToLoc[targetId];
}

function logBehavior(entity, behavior, wait = true) {
  const { displayName, x, y } = entity;
  if (getMap().canEntitySeeTile(getPlayer(), x, y)) {
    const msg = `${displayName} is ${behavior}`;
    if (wait) {
      return new Promise((resolve) => {
        addLog(msg).then((logElt) => resolve(logElt));
      });
    }
    return addLog(msg, false);
  }
}
