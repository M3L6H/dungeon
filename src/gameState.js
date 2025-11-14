import { addLog } from "./logs.js";
import { generateMap } from "./map.js";
import { createPlayer } from "./player.js";
import { schedule } from "./time.js";

export const NONE = "none";
const MOVE = "move";
const EXAMINE = "examine";
const INTERACT = "interact";
const SETTINGS = "settings";

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
    this.controlling = true;
    this.entities = [props.player];
    this.logs = [];
    this.map = props.map;
    this.player = props.player;
    this.selected = 0;
    this.time = 0;
    this.timeline = {};
  }
}

let gameState = {};

export async function newGame() {
  gameState = new GameState({
    map: await generateMap(),
    player: createPlayer(),
  });
}

export function getActions() {
  return gameState.actions;
}

export function getEntities() {
  return gameState.entities;
}

export function getInput() {
  if (getPlayer().stamina === 0) {
    return rest(getPlayer(), true);
  }

  gameState.controlling = true;
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
    default:
      addLog(`${entity.name} cannot ${action}`);
  }

  return false;
}

export function inControl() {
  return gameState.controlling;
}

export function inRange(entity, action, target) {
  const { x, y } = target;
  switch (action) {
    case "move":
      const dx = Math.abs(x - entity.x);
      const dy = Math.abs(y - entity.y);
      const tile = getMap().getTile(x, y);
      return (
        (dx + dy === 0 && entity.stamina < entity.maxStamina) ||
        (dx + dy === 1 && tile.isTraversable && entity.stamina > 0)
      );
    default:
      return false;
  }
}

export function incrementTime() {
  return ++gameState.time;
}

export function releaseControl() {
  gameState.controlling = false;
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
    addLog(`${entity.name} moved ${DIRS[dir]}`);
  });
  addLog(`${entity.name} is moving ${DIRS[dir]}`);
  return true;
}

function rest(entity, full = false) {
  const time = full ? Math.ceil(entity.maxStamina / entity.constitution) : 1;
  schedule(entity, time, () => {
    entity.stamina += full ? entity.maxStamina : entity.constitution;
    addLog(`${entity.name} rested`);
  });
  addLog(`${entity.name} is resting`);
  return true;
}

function getTimeToMove(entity) {
  return Math.max(1, 11 - Math.floor(Math.sqrt(entity.speed)));
}
