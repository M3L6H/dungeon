import { renderActions } from "./actions.js";
import {
  Entity,
  canEntityInteract,
  createPlayer,
  entityInControl,
  entityInteract,
  getXpValue,
} from "./entities/index.js";
import { callAsync } from "./functions.js";
import { Item } from "./items/item.js";
import {
  addDangerLog,
  addEndLog,
  addLog,
  addSafeLog,
  addStartLog,
  addWarnLog,
  waitForReading,
} from "./logs.js";
import { Map, generateMap } from "./map.js";
import { loadItemData, saveItemData } from "./storage.js";
import { TileEntity } from "./tileEntities/tileEntity.js";
import { schedule } from "./time.js";
import { renderViewport } from "./viewport.js";

export const NONE = "none";
export const ATTACK = "attack";
export const LEFT = "left";
export const MOVE = "move";
export const EXAMINE = "examine";
export const INTERACT = "interact";
export const RIGHT = "right";
export const SETTINGS = "settings";
export const SKILL = "skill";

const ENTITIES_KEY = "entities";
const ENTITY_LABELS_KEY = "entityLabels";
const LOGS_KEY = "logs";
const MAP_KEY = "map";
const SELECTED_KEY = "selected";
const SELECTED_ITEM_KEY = "selectedItem";
const SETTINGS_KEY = "settings";
const TILE_ENTITIES_KEY = "tileEntities";
const TIME_KEY = "time";

class GameState {
  constructor() {
    this.actions = [
      MOVE,
      EXAMINE,
      INTERACT,
      LEFT,
      RIGHT,
      SKILL,
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
    this.selectedItems = {};
    this.settings = {
      gameSpeed: 250,
    };
    this.time = 0;
    this.timeline = {};
  }
}

let gameState = new GameState();

export async function createOrLoadGame(create = false, playerData) {
  if (create || !loadGame()) {
    gameState = new GameState();
    gameState.map = await generateMap();
    gameState.player = await createPlayer(
      playerData.background,
      playerData.props,
    );
    await gameState.map.spawnEntities();
  }
  saveAll();
}

function loadGame() {
  gameState = new GameState();
  const success =
    loadMap() &&
    loadEntities() &&
    loadTileEntities() &&
    loadEntityLabels() &&
    loadLogs() &&
    loadSelected() &&
    loadSettings() &&
    loadTime();

  if (!success) return false;
  gameState.player = getEntities()[0];
  return true;
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

export async function getInput(entity) {
  if (entity.dead) return;
  getMap().updateMemory(entity);
  if (entity.stamina === 0) {
    await rest(entity, true);
    return;
  }
  for (const behavior of entity.behaviors) {
    if (await callAsync(behavior, entity)) {
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

/**
 * Returns the selected item in the slot specified by i or the current selected slot.
 */
export function getSelectedItem(i) {
  return Item.idToItem[gameState.selectedItems[i ?? getSelectedIndex()]];
}

export function getSelectedItems() {
  return gameState.selectedItems;
}

export function getSettings() {
  return gameState.settings;
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
  saveSelected();
  saveLogs();
}

export function setSelectedItem(itemId, i) {
  gameState.selectedItems[i ?? getSelectedIndex()] = itemId;
  renderActions();
  saveSelected();
}

export async function act(entity, action, data) {
  if (!inRange(entity, action, data)) return false;

  switch (action) {
    case "attack":
      return await attack(entity, data);
    case "examine":
      return await examine(entity, data);
    case "interact":
      return interact(entity, data);
    case "move":
      return await move(entity, data);
    case "skill":
      return await skill(entity, data);
    default:
      await addLog(`${entity.name} cannot ${action}.`);
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
        .filter((other) => other.name !== entity.name && !other.isItem);
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
      if (!getSelectedItem() || dx + dy > 1) return false;
      const tileEntity = getMap().getTileEntity(x, y);
      if (
        !!tileEntity &&
        canEntityInteract(entity, tileEntity, getSelectedItem())
      ) {
        return true;
      }
      for (const other of getMap().getEntities(x, y)) {
        if (canEntityInteract(entity, other, getSelectedItem())) return true;
      }
      return false;
    case "move":
      return (
        (dx + dy === 0 && entity.stamina < entity.maxStamina) ||
        (dx + dy === 1 &&
          getMap().isTraversable(entity, x, y) &&
          entity.stamina > 0)
      );
    case "skill":
      return !!data.inRange && data.inRange();
    default:
      return false;
  }
}

export function incrementTime() {
  return ++gameState.time;
}

/**
 * @returns {Promise<undefined>|undefined} A Promise if log is true, undefined otherwise.
 */
export function interrupt(entity, interrupter, log = true) {
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
  entity.nextActionTime = getTime();
  delete entity.dataset.action;
  if (log) {
    return new Promise((resolve) => {
      logCombatWarn(
        entity,
        interrupter,
        `${entity.displayName} has been interrupted.`,
      ).then((logElt) => {
        logElt?.classList.add("bold");
        resolve();
      });
    });
  }
  return;
}

const DIRS = ["North", "East", "South", "West"];

async function attack(entity, target) {
  const { accuracy, damage, displayName } = entity;
  const { x, y } = target;
  turnToFaceTarget(entity, target);

  const timeToAttack = 1 + entity.attackDelayMod;
  schedule(entity, timeToAttack, async () => {
    const entities = getMap()
      .getEntities(x, y)
      .filter(
        (other) =>
          other.id !== entity.id && other.name !== entity.name && !other.isItem,
      ); // Don't attack self or same type
    for (const other of entities) {
      if (entity.stamina === 0) return; // Can't attack with no stamina
      --entity.stamina;
      other.tSet.add(entity.name.toLowerCase());
      other.targetId = entity.id;
      const attack = roll(accuracy);
      const dodge = roll(other.dodge);
      if (attack < dodge) {
        await logCombatWarn(
          entity,
          other,
          `${other.displayName} dodged (${dodge}) an attack (${attack}) from ${displayName}.`,
        );
        return;
      }
      const defense = roll(other.defense);
      await interrupt(other, entity);
      if (attack < defense) {
        await logCombatWarn(
          entity,
          other,
          `${other.displayName} defended (${defense}) an attack (${attack}) from ${displayName}.`,
        );
        return;
      }
      const damageDealt = roll(damage);
      await logCombatDanger(
        entity,
        other,
        `${displayName} attacked ${other.displayName} and dealt ${damageDealt} damage!`,
      );
      other.health -= damageDealt;
      if (other.dead) {
        const xp = getXpValue(other);
        await logSafe(
          entity,
          `${entity.displayName} earned ${xp} xp from defeating ${other.displayName}.`,
        );
        entity.xp += xp;
      }
    }
    const suffix = entities.length === 0 ? " and hit nothing" : "";
    await logActionEnd(entity, `attacked${suffix}`);
  });
  await logActionStart(entity, "attacking");
  return true;
}

async function examine(entity, target) {
  const { x, y } = target;
  turnToFaceTarget(entity, target);
  schedule(entity, 1, async () => {
    const result = getMap().examine(entity, x, y);
    if (entity.isPlayer) {
      await addLog(result);
    }
  });
  if (entity.isPlayer) {
    await logActionStart(entity, `examining`);
  }
  return true;
}

function interact(entity, target) {
  const { x, y } = target;
  turnToFaceTarget(entity, target);
  schedule(entity, 1, async () => {
    const tileEntity = getMap().getTileEntity(x, y);
    if (
      !!tileEntity &&
      (await entityInteract(entity, tileEntity, getSelectedItem()))
    ) {
      return;
    }
    for (const other of getMap().getEntities(x, y)) {
      if (await entityInteract(entity, other, getSelectedItem())) return;
    }
  });
  return true;
}

async function move(entity, target) {
  const { x, y, silent } = target;
  if (x === entity.x && y === entity.y) {
    return rest(entity);
  }

  const dx = x - entity.x;
  const dy = y - entity.y;
  const dir = Math.abs(dx) * (-dx + 2) + Math.abs(dy) * (dy + 1);
  entity.dir = dir;
  const time = getTimeToMove(entity);
  schedule(entity, time, async () => {
    getMap().moveEntity(entity, x, y);
    --entity.stamina;
    if (silent) return;
    const action = `moved ${DIRS[dir]}`;
    if (entity.isPlayer) {
      logActionEnd(entity, action, false);
    } else {
      await logActionEnd(entity, `moved ${DIRS[dir]}`);
    }
  });
  if (silent) return true;
  const action = `moving ${DIRS[dir]}`;
  if (entity.isPlayer) {
    await logActionStart(entity, action, false);
  } else {
    await logActionStart(entity, action);
  }
  return true;
}

export async function rest(entity, full = false) {
  const time = full
    ? Math.ceil(entity.maxStamina / entity.constitution) + 1
    : 1;
  schedule(entity, time, async () => {
    entity.stamina += full ? entity.maxStamina : entity.constitution;
    await logActionEnd(entity, "rested");
  });
  entity.dataset.action = "rest";
  await logActionStart(entity, "resting");
  return true;
}

async function skill(entity, data) {
  const { x, y, filter, manaCost, skill, staminaCost, timeTaken } = data;
  turnToFaceTarget(entity, data);

  schedule(entity, timeTaken, async () => {
    const entities = getMap()
      .getEntities(x, y)
      .filter((entity) => filter(entity) && !entity.isItem);
    for (const other of entities) {
      if (entity.stamina < staminaCost || entity.mana < manaCost) return;
      entity.mana -= manaCost;
      entity.stamina -= staminaCost;
      if (!entity.isItem && entity.name !== other.name) {
        other.tSet.add(entity.name);
      }
      await skill(other);
    }
    const suffix = entities.length === 0 ? " and hit nothing" : "";
    await logActionEnd(entity, `used ${data.name}${suffix}`);
  });

  await logActionStart(entity, `using ${data.name}`);
  return true;
}

function getTimeToMove(entity) {
  return Math.max(1, 6 - Math.floor(Math.sqrt(entity.speed)));
}

/**
 * @returns {Promise<HTMLParagraphElement|undefined>|HTMLParagraphElement|undefined}
 */
function logActionStart(entity, action, wait = true) {
  const { displayName, isPlayer, x, y } = entity;
  const msg = `${displayName} is ${action}.`;
  if (!entity.isItem && getMap().canEntitySeeTile(getPlayer(), x, y)) {
    const logElt = addStartLog(msg, false);
    if (isPlayer) logElt.classList.add("player");
    if (wait) {
      renderViewport();
      return waitForReading(logElt, msg);
    }
    return logElt;
  }
  if (wait) return new Promise((resolve) => resolve());
}

/**
 * @returns {Promise<HTMLParagraphElement|undefined>|HTMLParagraphElement|undefined}
 */
export function logActionEnd(entity, action, wait = true) {
  const { displayName, isPlayer, x, y } = entity;
  delete entity.dataset.action;
  const msg = `${displayName} ${action}.`;
  if (!entity.isItem && getMap().canEntitySeeTile(getPlayer(), x, y)) {
    const logElt = addEndLog(msg, false);
    if (isPlayer) logElt.classList.add("player");
    if (wait) {
      renderViewport();
      return waitForReading(logElt, msg);
    }
    return logElt;
  }
  if (wait) return new Promise((resolve) => resolve());
}

export function logCombatDanger(a, b, msg, wait = true) {
  return logIfCanSee(a, b, msg, addDangerLog, wait);
}

export function logCombatWarn(a, b, msg, wait = true) {
  return logIfCanSee(a, b, msg, addWarnLog, wait);
}

export function logDanger(entity, msg, wait = true) {
  return logIfCanSee(entity, entity, msg, addDangerLog, wait);
}

export function logSafe(entity, msg, wait = true) {
  return logIfCanSee(entity, entity, msg, addSafeLog, wait);
}

export function logWarn(entity, msg, wait = true) {
  return logIfCanSee(entity, entity, msg, addWarnLog, wait);
}

/**
 * @returns {Promise<HTMLParagraphElement|undefined>|HTMLParagraphElement|undefined}
 */
function logIfCanSee(a, b, msg, logFunc, wait) {
  if (wait) {
    return new Promise((resolve) => {
      if (
        a.isPlayer ||
        b.isPlayer ||
        getMap().canEntitySeeTile(getPlayer(), a.x, a.y) ||
        getMap().canEntitySeeTile(getPlayer(), b.x, b.y)
      ) {
        logFunc(msg).then((logElt) => {
          resolve(logElt);
        });
      }
      resolve();
    });
  }
  if (
    a.isPlayer ||
    b.isPlayer ||
    getMap().canEntitySeeTile(getPlayer(), a.x, a.y) ||
    getMap().canEntitySeeTile(getPlayer(), b.x, b.y)
  ) {
    return logFunc(msg, false);
  }
}

export function roll(n) {
  return roundMin(n * Math.random());
}

export function roundMin(n, min = 1) {
  return Math.max(Math.floor(n), min);
}

export function loadEntities() {
  const itemData = loadItemData(ENTITIES_KEY);
  if (!itemData) return false;
  gameState.entities = itemData.map((datum) => Entity.fromData(datum));
  return !gameState.entities[0].dead;
}

function loadEntityLabels() {
  gameState.entityLabels = loadItemData(ENTITY_LABELS_KEY);
  return gameState.entityLabels !== undefined;
}

function loadLogs() {
  gameState.logs = loadItemData(LOGS_KEY);
  return gameState.logs !== undefined;
}

function loadMap() {
  const itemData = loadItemData(MAP_KEY);
  if (!itemData) return false;
  gameState.map = Map.fromData(itemData);
  return true;
}

function loadSelected() {
  gameState.selected = loadItemData(SELECTED_KEY);
  gameState.selectedItems = loadItemData(SELECTED_ITEM_KEY);
  return gameState.selected !== undefined;
}

export function loadSettings() {
  const settings = loadItemData(SETTINGS_KEY);
  if (settings) gameState.settings = settings;
  return gameState.settings !== undefined;
}

function loadTileEntities() {
  const itemData = loadItemData(TILE_ENTITIES_KEY);
  if (!itemData) return false;
  gameState.tileEntities = itemData.map((datum) => TileEntity.fromData(datum));
  return true;
}

function loadTime() {
  gameState.time = loadItemData(TIME_KEY);
  return gameState.time !== undefined;
}

export function saveAll() {
  saveEntities();
  saveEntityLabels();
  saveMap();
  saveLogs();
  saveMap();
  saveSelected();
  saveSettings();
  saveTileEntities();
  saveTime();
}

function saveEntities() {
  saveItemData(
    ENTITIES_KEY,
    getEntities().map((entity) => entity.toData()),
  );
}

function saveEntityLabels() {
  saveItemData(ENTITY_LABELS_KEY, gameState.entityLabels);
}

export function saveLogs() {
  saveItemData(LOGS_KEY, gameState.logs);
}

function saveMap() {
  saveItemData(MAP_KEY, getMap().toData());
}

export function saveSelected() {
  saveItemData(SELECTED_KEY, gameState.selected);
  if (gameState.selectedItems !== undefined) {
    saveItemData(SELECTED_ITEM_KEY, gameState.selectedItems);
  }
}

export function saveSettings() {
  saveItemData(SETTINGS_KEY, gameState.settings);
}

function saveTileEntities() {
  saveItemData(
    TILE_ENTITIES_KEY,
    getTileEntities().map((tileEntity) => tileEntity.toData()),
  );
}

function saveTime() {
  saveItemData(TIME_KEY, gameState.time);
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
