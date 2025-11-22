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
import { DIRS } from "../utils.js";
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
 * Behavior where entity will search for the first target in its memory that is on the targets list
 * @param entity {Entity} - The entity this behavior is for
 */
export function findTarget(entity) {
  const { entityMemory, tSet } = entity;
  if (tSet.size === 0) return false;
  if (entity.targetId !== null) return false;
  for (const entities of entityMemory) {
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
    let attempts = 0;
    do {
      [dx, dy] = DIRS[Math.floor(Math.random() * DIRS.length)];
      target = { x: x + dx, y: y + dy };
      ++attempts;
    } while (attempts < 4 && !inRange(entity, MOVE, target));
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
