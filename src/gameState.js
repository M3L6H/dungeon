import { addEndLog, addLog, addStartLog } from "./logs.js";
import { generateMap } from "./map.js";
import { createPlayer } from "./player.js";
import { schedule } from "./time.js";

export const NONE = "none";
export const MOVE = "move";
export const EXAMINE = "examine";
export const INTERACT = "interact";
export const SETTINGS = "settings";

class GameState {
  constructor(props) {
    this.actions = [
      MOVE,
      EXAMINE,
      INTERACT,
      NONE,
      NONE,
      NONE,
      NONE,
      NONE,
      NONE,
      NONE,
      SETTINGS,
    ];
    this.entities = [];
    this.logs = [];
    this.map = props.map;
    this.selected = 0;
    this.time = 0;
    this.timeline = {};
  }
}

let gameState = {};

export async function newGame() {
  const map = await generateMap();
  gameState = new GameState({
    map,
  });
  gameState.player = createPlayer(map.w, map.h);
}

export function addEntity(entity) {
  entity.id = gameState.entities.length;
  gameState.entities.push(entity);
}

export function getActions() {
  return gameState.actions;
}

export function getEntities() {
  return gameState.entities;
}

export function getInput(entity) {
  getMap().updateMemory(entity);
  if (entity.isPlayer) {
    entity.controlling = true;
  } else {
    for (const behavior of entity.behaviors) {
      if (behavior(entity)) {
        entity.releaseControl();
        break;
      }
    }
  }
}

/**
 * @returns {string[]} List of logs
 */
export function getLogs() {
  return gameState.logs;
}

export function getMap() {
  return gameState.map;
}

export function getPlayer() {
  return gameState.player;
}

export function getSelectedAction() {
  return gameState.actions[gameState.selected];
}

export function getSelectedIndex() {
  return gameState.selected;
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

export function act(entity, action, target) {
  if (!inRange(entity, action, target)) return false;

  switch (action) {
    case "move":
      return move(entity, target);
    case "examine":
      return examine(entity, target);
    default:
      addLog(`${entity.name} cannot ${action}`);
  }

  return false;
}

export function inRange(entity, action, target) {
  const { x, y } = target;
  const dx = Math.abs(x - entity.x);
  const dy = Math.abs(y - entity.y);
  switch (action) {
    case "move":
      const tile = getMap().getTile(x, y);
      return (
        (dx + dy === 0 && entity.stamina < entity.maxStamina) ||
        (dx + dy === 1 && tile.isTraversable && entity.stamina > 0)
      );
    case "examine":
      const examineRange = Math.min(3, entity.sightRange);
      return (
        dx <= examineRange &&
        dy <= examineRange &&
        getMap().entityHasLoS(entity, x, y)
      );
    default:
      return false;
  }
}

export function incrementTime() {
  return ++gameState.time;
}

const DIRS = ["North", "East", "South", "West"];

function move(entity, target) {
  const { x, y } = target;
  if (x === entity.x && y === entity.y) {
    return rest(entity);
  }

  const dx = x - entity.x;
  const dy = y - entity.y;
  const dir = Math.abs(dx) * (-dx + 2) + Math.abs(dy) * (dy + 1);
  entity.dir = dir;
  --entity.stamina;
  const time = getTimeToMove(entity);
  schedule(entity, time, () => {
    getMap().moveEntity(entity, x, y);
    logActionEnd(entity, `moved ${DIRS[dir]}`);
  });
  logActionStart(entity, `moving ${DIRS[dir]}`);
  return true;
}

function examine(entity, target) {
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
  schedule(entity, 1, () => {
    getMap().examine(entity, x, y);
    logActionEnd(entity, `examined (${x}, ${y})`);
  });
  logActionStart(entity, `examining (${x}, ${y})`);
  return true;
}

export function rest(entity, full = false) {
  const time = full ? Math.ceil(entity.maxStamina / entity.constitution) : 1;
  schedule(entity, time, () => {
    entity.stamina += full ? entity.maxStamina : entity.constitution;
    logActionEnd(entity, "rested");
  });
  logActionStart(entity, "resting");
  return true;
}

function getTimeToMove(entity) {
  return Math.max(1, 11 - Math.floor(Math.sqrt(entity.speed)));
}

function logActionStart(entity, action) {
  const { isPlayer, name, x, y } = entity;
  if (getMap().canEntitySeeTile(getPlayer(), x, y)) {
    const logElt = addStartLog(`${name} is ${action}`);
    if (isPlayer) logElt.classList.add("player");
  }
}

function logActionEnd(entity, action) {
  const { isPlayer, name, x, y } = entity;
  if (getMap().canEntitySeeTile(getPlayer(), x, y)) {
    const logElt = addEndLog(`${name} ${action}`);
    if (isPlayer) logElt.classList.add("player");
  }
}
