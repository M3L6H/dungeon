import { renderActions } from "./actions.js";
import { createPlayer, entityInControl, getXpValue } from "./entities/index.js";
import { Item } from "./items/item.js";
import {
  addDangerLog,
  addEndLog,
  addLog,
  addSafeLog,
  addStartLog,
  addWarnLog,
} from "./logs.js";
import { Map, generateMap } from "./map.js";
import { schedule } from "./time.js";

export const NONE = "none";
export const ATTACK = "attack";
export const LEFT = "left";
export const MOVE = "move";
export const EXAMINE = "examine";
export const INTERACT = "interact";
export const RIGHT = "right";
export const SETTINGS = "settings";
export const SKILL = "skill";

class GameState {
  constructor() {
    this.actions = [
      MOVE,
      EXAMINE,
      INTERACT,
      LEFT,
      RIGHT,
      NONE,
      NONE,
      NONE,
      NONE,
      NONE,
      SETTINGS,
    ];
    this.entities = [];
    this.tileEntities = [];
    this.entityLabels = {};
    this.logs = [];
    this.selected = 0;
    this.time = 0;
    this.timeline = {};
  }
}

let gameState = {
  tileEntities: [],
};

export async function newGame() {
  gameState = new GameState();
  gameState.map = await generateMap();
  gameState.player = createPlayer();
  gameState.map.spawnEntities();
}

export function addEntity(entity) {
  entity.id = gameState.entities.length;
  gameState.entities.push(entity);
}

export function addTileEntity(tileEntity) {
  tileEntity.id = gameState.tileEntities.length;
  gameState.tileEntities.push(tileEntity);
}

export function getActions() {
  return gameState.actions;
}

export function getEntities() {
  return gameState.entities;
}

export function getEntityLabels() {
  return gameState.entityLabels;
}

export function getInput(entity) {
  if (entity.dead) return;
  getMap().updateMemory(entity);
  if (entity.stamina === 0) {
    rest(entity, true);
    return;
  }
  for (const behavior of entity.behaviors) {
    if (behavior(entity)) {
      return;
    }
  }
}

/**
 * @returns {string[]} List of logs
 */
export function getLogs() {
  return gameState.logs;
}

/**
 * @returns {Map} The current map
 */
export function getMap() {
  return gameState.map;
}

export function getPlayer() {
  return gameState.player;
}

export function getSelectedAction() {
  const action = gameState.actions[gameState.selected];
  switch (action) {
    case "left":
    case "right":
      return ATTACK;
    default:
      return action;
  }
}

export function getSelectedIndex() {
  return gameState.selected;
}

export function getSelectedItem() {
  return Item.idToItem[gameState.selectedItem];
}

export function getTileEntities() {
  return gameState.tileEntities;
}

export function getTime() {
  return gameState.time;
}

export function getTimeline() {
  return gameState.timeline;
}

export function setSelectedIndex(i) {
  gameState.selected = i;
}

export function setSelectedItem(itemId) {
  gameState.selectedItem = itemId;
  renderActions();
}

export function act(entity, action, data) {
  if (!inRange(entity, action, data)) return false;

  switch (action) {
    case "attack":
      return attack(entity, data);
    case "examine":
      return examine(entity, data);
    case "interact":
      return interact(entity, data);
    case "move":
      return move(entity, data);
    case "skill":
      return skill(entity, data);
    default:
      addLog(`${entity.name} cannot ${action}.`);
  }

  return false;
}

export function inRange(entity, action, data) {
  const { x, y } = data;
  const dx = Math.abs(x - entity.x);
  const dy = Math.abs(y - entity.y);
  switch (action) {
    case "attack":
      const entities = getMap()
        .getEntities(x, y)
        .filter((other) => other.id !== entity.id && !other.isItem);
      return (
        dx + dy <= entity.attackRange &&
        entity.stamina > 0 &&
        entities.length > 0 &&
        getMap().entityHasLoS(entity, x, y)
      );
    case "examine":
      const examineRange = Math.min(3, entity.sightRange);
      return (
        dx <= examineRange &&
        dy <= examineRange &&
        getMap().entityHasLoS(entity, x, y)
      );
    case "interact":
      return (
        !!getSelectedItem() &&
        getMap().getTileEntity(x, y)?.canInteract(entity, getSelectedItem()) &&
        dx + dy <= 1
      );
    case "move":
      return (
        (dx + dy === 0 && entity.stamina < entity.maxStamina) ||
        (dx + dy === 1 &&
          getMap().isTraversable(entity, x, y) &&
          entity.stamina > 0)
      );
    case "skill":
      return data.inRange();
    default:
      return false;
  }
}

export function incrementTime() {
  return ++gameState.time;
}

export function interrupt(entity, interrupter) {
  turnToFaceTarget(entity, interrupter);
  if (entityInControl(entity)) return;
  const events = getTimeline()[entity.nextActionTime];
  if (!events) return;
  for (let i = events.length - 1; i >= 0; --i) {
    const [id] = events[i];
    if (id === entity.id) {
      events.splice(i, 1);
      break;
    }
  }
  logCombatWarn(
    entity,
    interrupter,
    `${entity.displayName} has been interrupted.`,
  )?.classList.add("bold");
  entity.nextActionTime = getTime();
  return;
}

const DIRS = ["North", "East", "South", "West"];

function attack(entity, target) {
  const { accuracy, damage, displayName } = entity;
  const { x, y } = target;
  turnToFaceTarget(entity, target);

  const timeToAttack = 1 + entity.attackDelayMod;
  schedule(entity, timeToAttack, () => {
    const entities = getMap()
      .getEntities(x, y)
      .filter(
        (other) =>
          other.id !== entity.id &&
          other.name !== entity.name &&
          other.dir !== undefined,
      ); // Don't attack self or same type
    entities.forEach((other) => {
      if (entity.stamina === 0) return; // Can't attack with no stamina
      --entity.stamina;
      other.tSet.add(entity.name.toLowerCase());
      other.targetId = entity.id;
      const attack = roll(accuracy);
      const dodge = roll(other.dodge);
      if (attack <= dodge) {
        logCombatWarn(
          entity,
          other,
          `${other.displayName} dodged (${dodge}) an attack (${attack}) from ${displayName}.`,
        );
        return;
      }
      const defense = roll(other.defense);
      interrupt(other, entity);
      if (attack <= defense) {
        logCombatWarn(
          entity,
          other,
          `${other.displayName} defended (${defense}) an attack (${attack}) from ${displayName}.`,
        );
        return;
      }
      const damageDealt = roll(damage);
      logCombatDanger(
        entity,
        other,
        `${displayName} attacked ${other.displayName} and dealt ${damageDealt} damage!`,
      );
      other.health -= damageDealt;
      if (other.dead) {
        const xp = getXpValue(other);
        logSafe(
          entity,
          `${entity.displayName} earned ${xp} xp from defeating ${other.displayName}.`,
        );
        entity.xp += xp;
      }
    });
    const suffix = entities.length === 0 ? " and hit nothing" : "";
    logActionEnd(entity, `attacked${suffix}`);
  });
  logActionStart(entity, "attacking");
  return true;
}

function examine(entity, target) {
  const { x, y } = target;
  turnToFaceTarget(entity, target);
  schedule(entity, 1, () => {
    const result = getMap().examine(entity, x, y);
    if (entity.isPlayer) {
      addLog(result);
      logActionEnd(entity, `examined`);
    }
  });
  if (entity.isPlayer) {
    logActionStart(entity, `examining`);
  }
  return true;
}

function interact(entity, target) {
  const { x, y } = target;
  turnToFaceTarget(entity, target);
  schedule(entity, 1, () => {
    const tileEntity = getMap().getTileEntity(x, y);
    tileEntity?.interact(entity, getSelectedItem());
  });
  return true;
}

function move(entity, target) {
  const { x, y } = target;
  if (x === entity.x && y === entity.y) {
    return rest(entity);
  }

  const dx = x - entity.x;
  const dy = y - entity.y;
  const dir = Math.abs(dx) * (-dx + 2) + Math.abs(dy) * (dy + 1);
  entity.dir = dir;
  const time = getTimeToMove(entity);
  schedule(entity, time, () => {
    getMap().moveEntity(entity, x, y);
    --entity.stamina;
    logActionEnd(entity, `moved ${DIRS[dir]}`);
  });
  logActionStart(entity, `moving ${DIRS[dir]}`);
  return true;
}

export function rest(entity, full = false) {
  const time = full
    ? Math.ceil(entity.maxStamina / entity.constitution) + 1
    : 1;
  schedule(entity, time, () => {
    entity.stamina += full ? entity.maxStamina : entity.constitution;
    logActionEnd(entity, "rested");
  });
  logActionStart(entity, "resting");
  return true;
}

function skill(entity, data) {
  const { x, y, filter, manaCost, skill, staminaCost, timeTaken } = data;
  turnToFaceTarget(entity, data);

  schedule(entity, timeTaken, () => {
    const entities = getMap()
      .getEntities(x, y)
      .filter((entity) => filter(entity) && entity.dir !== undefined);
    entities.forEach((other) => {
      if (entity.stamina < staminaCost || entity.mana < manaCost) return;
      entity.mana -= manaCost;
      entity.stamina -= staminaCost;
      if (!entity.isItem && entity.name !== other.name) {
        other.tSet.add(entity.name.toLowerCase());
      }
      skill(other);
    });
    const suffix = entities.length === 0 ? " and hit nothing" : "";
    logActionEnd(entity, `used ${data.name}${suffix}`);
  });

  logActionStart(entity, `using ${data.name}`);
  return true;
}

function getTimeToMove(entity) {
  return Math.max(1, 6 - Math.floor(Math.sqrt(entity.speed)));
}

function logActionStart(entity, action) {
  const { displayName, isPlayer, x, y } = entity;
  const msg = `${displayName} is ${action}.`;
  if (!entity.isItem && getMap().canEntitySeeTile(getPlayer(), x, y)) {
    const logElt = addStartLog(msg);
    if (isPlayer) logElt.classList.add("player");
  }
}

export function logActionEnd(entity, action) {
  const { displayName, isPlayer, x, y } = entity;
  const msg = `${displayName} ${action}.`;
  if (!entity.isItem && getMap().canEntitySeeTile(getPlayer(), x, y)) {
    const logElt = addEndLog(msg);
    if (isPlayer) logElt.classList.add("player");
  }
}

export function logCombatDanger(a, b, msg) {
  if (
    a.isPlayer ||
    b.isPlayer ||
    getMap().canEntitySeeTile(getPlayer(), a.x, a.y) ||
    getMap().canEntitySeeTile(getPlayer(), b.x, b.y)
  ) {
    return addDangerLog(msg);
  }
}

export function logCombatWarn(a, b, msg) {
  if (
    a.isPlayer ||
    b.isPlayer ||
    getMap().canEntitySeeTile(getPlayer(), a.x, a.y) ||
    getMap().canEntitySeeTile(getPlayer(), b.x, b.y)
  ) {
    return addWarnLog(msg);
  }
}

export function logDanger(entity, msg) {
  if (
    entity.isPlayer ||
    getMap().canEntitySeeTile(getPlayer(), entity.x, entity.y)
  ) {
    return addDangerLog(msg);
  }
}

export function logSafe(entity, msg) {
  if (
    entity.isPlayer ||
    getMap().canEntitySeeTile(getPlayer(), entity.x, entity.y)
  ) {
    return addSafeLog(msg);
  }
}

export function logWarn(entity, msg) {
  if (
    entity.isPlayer ||
    getMap().canEntitySeeTile(getPlayer(), entity.x, entity.y)
  ) {
    return addWarnLog(msg);
  }
}

export function roll(n) {
  return roundMin(n * Math.random());
}

export function roundMin(n, min = 1) {
  return Math.max(Math.floor(n), min);
}

function turnToFaceTarget(entity, target) {
  const { x, y } = target;
  const dx = x - entity.x;
  const dxMag = Math.abs(dx);
  const dy = y - entity.y;
  const dyMag = Math.abs(dy);
  if (dxMag > dyMag) {
    entity.dir = 2 - dx / dxMag;
  } else if (dyMag > dxMag) {
    entity.dir = dy / dyMag + 1;
  } else if (dx < 0 && dy < 0 && entity.dir !== 0 && entity.dir !== 3) {
    entity.dir = 0;
  } else if (dx > 0 && dy < 0 && entity.dir !== 0 && entity.dir !== 1) {
    entity.dir = 1;
  } else if (dx > 0 && dy > 0 && entity.dir !== 1 && entity.dir !== 2) {
    entity.dir = 2;
  } else if (dx < 0 && dy > 0 && entity.dir !== 2 && entity.dir !== 3) {
    entity.dir = 3;
  }
}
