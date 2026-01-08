import { renderActions } from "../actions.js";
import { call } from "../functions.js";
import {
  addEntity,
  getEntities,
  getEntityLabels,
  getInput,
  getMap,
  getSelectedItems,
  getTileEntities,
  getTime,
  interrupt,
  logDanger,
  logSafe,
  logWarn,
  setSelectedItem,
} from "../gameState.js";
import { Item, spawnItem } from "../items/index.js";
import { showStats } from "../stats.js";
import { schedule } from "../time.js";
import { showRoomNameEntering, showRoomNameLeaving } from "../title.js";
import {
  getDescription,
  getDrop,
  levelUp,
  xpRequiredForLevel,
} from "./data.js";

const HITPOINTS_PER_CONSTITUTION = 4;
const MANA_PER_INTELLIGENCE = 5;
const STAMINA_PER_ENDURANCE = 2;

const MAX_LEVEL = 70;

const ZERO = 0 | 0;

export function canEntityInteract(entity, other, item) {
  const canInteractWithOther = !!other.canInteract
    ? other.canInteract(entity, item)
    : undefined;
  if (canInteractWithOther !== undefined) {
    return canInteractWithOther;
  }

  return item.canInteract(entity, other) ?? false;
}

export function entityInControl(entity) {
  return entity.nextActionTime <= getTime();
}

export async function entityInteract(entity, other, item) {
  const interactWithOther = !!other.interact
    ? await other.interact(entity, item)
    : undefined;
  if (interactWithOther !== undefined) {
    return interactWithOther;
  }

  return (await item.interact(entity, other)) ?? false;
}

export function examineEntity(entity, examiner) {
  const { perception } = examiner;
  const details = [];

  if (perception >= 3 && entity.status !== undefined) {
    details.push(entity.status);
  }

  if (perception >= 5 && entity.immunities !== undefined) {
    details.push(
      `${entity.displayName} immunities: ${Array.from(entity.immunities).join(", ")}`,
    );
  }

  const description = getDescription(entity) ?? {
    0: () => `You see nothing interesting about ${entity.displayName}`,
  };

  for (const threshold in description) {
    if (perception >= threshold) {
      details.push(description[threshold](entity));
    }
  }

  return details.join("\r\n");
}

export function getEntityById(id) {
  return getEntities()[id];
}

export function releaseControl(entity, time) {
  entity.nextActionTime = time;
}

export async function startEntity(entity, x, y) {
  const labels = getEntityLabels();

  if (labels[entity.name] === undefined) {
    labels[entity.name] = 0;

    if (!entity.unique) entity.label = 0;
  } else if (!entity.unique) {
    entity.label = ++labels[entity.name];
  }

  getMap().moveEntity(entity, x, y);
  await getInput(entity);
  return entity;
}

export class Entity {
  static fromData(data) {
    const entity = new Entity(
      {
        ...data.props,
        additionalProps: data.additionalProps,
      },
      false,
    );
    for (const k in data.setAfter) {
      entity[k] = data.setAfter[k];
    }
    // We cannot persist the timeline, so we have to recalculate actions
    entity.nextActionTime = 0;
    return entity;
  }

  constructor(props, firstTime = true) {
    this._displayName = props.displayName ?? props.name;
    this.name = props.name;
    this.variant = props.variant;

    this.x = props.x ?? 0;
    this.y = props.y ?? 0;

    this.nextActionTime = 0;
    this.dir = props.dir ?? Math.floor(Math.random() * 4);

    this.agility = props.agility ?? 1;
    this.constitution = props.constitution ?? 1;
    this.endurance = props.endurance ?? 1;
    this.intelligence = props.intelligence ?? 1;
    this.strength = props.strength ?? 1;
    this.wisdom = props.wisdom ?? 1;

    this.level = props.level ?? 1;
    if (firstTime) {
      for (let i = 1; i < this.level; ++i) levelUp(this);
    }
    this._xp = 0;

    this.attackRange = props.attackRange ?? 1;
    this.attackDelayMod = props.attackDelayMod ?? 0;
    this.accuracyMod = props.accuracyMod ?? 0;
    this.damageMod = props.damageMod ?? 0;
    this.defenseMod = props.defenseMod ?? 0;
    this.dodgeMod = props.dodgeMod ?? 0;
    this.speedMod = props.speedMod ?? 0;

    this._health = this.maxHealth;
    this._mana = this.maxMana;
    this._stamina = this.maxStamina;

    this.behaviors = props.behaviors ?? [];
    this.memory = {};
    this.entityMemory = {};
    this.tileEntityMemory = {};

    this.dead = false;
    this.idToLoc = {};
    this.immunities = new Set(props.immunities ?? []);
    this.inventory = props.inventory ?? {};
    this.statuses = [];
    this.targetId = null;
    this.tSet = new Set(props.tSet ?? ["player"]);
    this._unique = props.unique ?? false;

    for (const k in props.additionalProps ?? {}) {
      this[k] = props.additionalProps[k];
    }

    this._canInteract = props.canInteract;
    this.onInteract = props.onInteract;

    this.dataset = {};

    addEntity(this);
  }

  async addStatus(status) {
    if (this.immunities.has(status.type)) {
      await logWarn(this, `${this.displayName} is immune to ${status.type}.`);
      return false;
    }

    status.offset = status.freq - ((getTime() - 1) % status.freq);
    this.statuses.push(status);

    return true;
  }

  canInteract(entity, item) {
    if (!this._canInteract) return undefined;
    return call(this._canInteract, this, entity, item);
  }

  getEntitiesInMemory(x, y) {
    return (
      this.entityMemory[x + y * getMap().w]?.map(({ dir, id, sprite }) => {
        if (dir === undefined) return { id, sprite };
        const entity = getEntityById(id);
        const { displayName, name } = entity;
        return {
          id,
          dir: dir ?? entity.dir,
          displayName,
          name,
          sprite: sprite ?? entity.sprite,
        };
      }) ?? []
    );
  }

  getTileEntityInMemory(x, y) {
    return getTileEntities()[this.tileEntityMemory[x + y * getMap().w]];
  }

  getTileInMemory(x, y) {
    const idx = x + y * getMap().w;
    const q = idx >>> 5; // Divide by 32
    const r = idx & 31; // Modulo 32
    return ((this.memory[q] ?? ZERO) & (1 << r)) !== 0
      ? getMap().getTile(x, y)
      : undefined;
  }

  async interact(entity, item) {
    if (this.onInteract !== undefined) {
      return await call(this.onInteract, this, entity, item);
    }
    return undefined;
  }

  removeItem(item) {
    --this.inventory[item.id];

    if (this.inventory[item.id] <= 0) {
      for (const slot in getSelectedItems()) {
        if (getSelectedItems()[slot] === item.id) {
          setSelectedItem(null, slot);
        }
      }
    }

    renderActions();
  }

  setEntitiesInMemory(x, y, entities) {
    const idx = x + y * getMap().w;
    const myEntities = this.entityMemory[idx] ?? [];
    const toDelete = new Set();
    myEntities.forEach(({ id }) => {
      toDelete.add(id);
    });

    for (const entity of entities) {
      const { dir, id, sprite } = entity;
      toDelete.delete(id);
      if (this.idToLoc[id]) {
        const { x: oldX, y: oldY } = this.idToLoc[id];
        if (oldX === x && oldY === y) continue;
        const oldIdx = oldX + oldY * getMap().w;
        const tile = this.entityMemory[oldIdx] ?? [];
        for (let i = tile.length - 1; i >= 0; --i) {
          if (tile[i].id === id) {
            tile.splice(i, 1);
            break;
          }
        }
        if (this.entityMemory[oldIdx]?.length === 0)
          delete this.entityMemory[oldIdx];
      }
      this.idToLoc[id] = { x, y };
      myEntities.push(this.isPlayer ? { dir, id, sprite } : { id });
    }

    for (let i = myEntities.length - 1; i >= 0; --i) {
      if (toDelete.has(myEntities[i].id)) {
        myEntities.splice(i, 1);
      }
    }

    if (myEntities.length === 0) {
      delete this.entityMemory[idx];
    } else {
      this.entityMemory[idx] = myEntities;
    }
  }

  setTileInMemory(x, y, tileEntity) {
    const idx = x + y * getMap().w;
    const q = idx >>> 5; // Divide by 32
    const r = idx & 31; // Modulo 32
    const flags = this.memory[q] ?? ZERO;
    this.memory[q] = flags | (1 << r);
    if (tileEntity !== undefined) this.tileEntityMemory[idx] = tileEntity.id;
  }

  toData() {
    const propsKeys = [
      "accuracyMod",
      "agility",
      "attackDelayMod",
      "attackRange",
      "behaviors",
      "constitution",
      "damageMod",
      "defenseMod",
      "dir",
      "dodgeMod",
      "endurance",
      "immunities",
      "intelligence",
      "inventory",
      "level",
      "name",
      "onInteract",
      "speedMod",
      "strength",
      "tSet",
      "variant",
      "wisdom",
      "x",
      "y",
    ];
    const setAfterKeys = [
      "_canInteract",
      "_displayName",
      "_health",
      "_mana",
      "_stamina",
      "_unique",
      "_xp",
      "dataset",
      "dead",
      "entityMemory",
      "idToLoc",
      "memory",
      "nextActionTime",
      "statuses",
      "targetId",
      "tileEntityMemory",
    ];
    const allKeys = new Set(Object.keys(this));
    const data = { additionalProps: {}, props: {}, setAfter: {} };

    for (const key of propsKeys) {
      data.props[key] = this[key];
      allKeys.delete(key);
    }

    // immunities and tSet are special
    data.props.immunities = [...this.immunities];
    data.props.tSet = [...this.tSet];

    for (const key of setAfterKeys) {
      data.setAfter[key] = this[key];
      allKeys.delete(key);
    }

    allKeys.forEach((key) => {
      data.additionalProps[key] = this[key];
    });

    return data;
  }

  get accuracy() {
    return Math.max(this.strength + this.wisdom + this.accuracyMod, 1);
  }

  get damage() {
    return Math.max(this.strength + this.intelligence + this.damageMod, 1);
  }

  get defense() {
    return Math.max(this.constitution + this.wisdom + this.defenseMod, 1);
  }

  get displayName() {
    const suffix = this.label === undefined ? "" : ` ${this.label}`;
    return `<a data-id="${this.id}">${this._displayName}${suffix}</a>`;
  }

  get dodge() {
    return Math.max(this.agility + this.dodgeMod, 1);
  }

  get health() {
    return this._health;
  }

  get isPlayer() {
    return this.name === "player";
  }

  get label() {
    return this._label === undefined
      ? undefined
      : String.fromCharCode("A".charCodeAt(0) + (this._label % 26));
  }

  get mana() {
    return this._mana;
  }

  get maxHealth() {
    return this.constitution * HITPOINTS_PER_CONSTITUTION;
  }

  get maxMana() {
    return this.intelligence * MANA_PER_INTELLIGENCE;
  }

  get maxStamina() {
    return this.endurance * STAMINA_PER_ENDURANCE;
  }

  get perception() {
    return this.wisdom;
  }

  get sightRange() {
    return 5;
  }

  get speed() {
    return this.agility + this.speedMod;
  }

  get sprite() {
    const file = [this.name, this.variant, this.dir]
      .filter((part) => part !== undefined)
      .join("-");
    return `url('images/${file}.png')`;
  }

  get stamina() {
    return this._stamina;
  }

  get status() {
    return `${this.displayName}: Level: ${this.level}. Health: ${this.health} / ${this.maxHealth}. Mana: ${this.mana} / ${this.maxMana}. Stamina: ${this.stamina} / ${this.maxStamina}.`;
  }

  get unique() {
    return this._unique;
  }

  get xp() {
    return this._xp;
  }

  set health(val) {
    this._health = clamp(val, 0, this.maxHealth);
    if (this._health === 0) {
      this.dead = true;
      const drop = getDrop(this);
      if (drop) {
        const itemEntity = spawnItem(
          Item.idToItem[drop.itemId],
          this.x,
          this.y,
          drop.additionalProps,
        );
        logSafe(
          itemEntity,
          `${this.displayName} dropped a ${itemEntity.displayName}.`,
          false,
        );
      }
      logDanger(this, `${this.displayName} died.`, false)?.classList.add(
        "bold",
      );
    }
  }

  set label(val) {
    this._label = val;
  }

  set mana(val) {
    this._mana = clamp(val, 0, this.maxMana);
  }

  /**
   * @param {string} val - Name of the location
   */
  set location(val) {
    if (val !== this._location) {
      if (val !== undefined) {
        showRoomNameEntering(val);
      } else {
        showRoomNameLeaving(this._location);
      }
    }
    this._location = val;
  }

  set stamina(val) {
    this._stamina = clamp(val, 0, this.maxStamina);
  }

  set xp(val) {
    this._xp = val;
    const xpRequired = xpRequiredForLevel(this.level);
    if (this._xp >= xpRequired && this.level < MAX_LEVEL) {
      interrupt(this, this, false);
      schedule(this, 1, async () => {
        if (this.isPlayer) {
          showStats(this, true, 2);
        } else {
          levelUp(this);
          await logSafe(
            this,
            `${this.displayName} leveled up to level ${this.level}. Health, Mana, and Stamina restored. Statuses cleared.`,
          );
        }
        this._xp -= xpRequired;
      });
    }
  }
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
