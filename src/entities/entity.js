import {
  addEntity,
  getEntities,
  getInput,
  getMap,
  logDanger,
  logWarn,
} from "../gameState.js";

const HITPOINTS_PER_CONSTITUTION = 3;
const MANA_PER_INTELLIGENCE = 5;
const STAMINA_PER_ENDURANCE = 2;

export class Entity {
  constructor(props) {
    this.displayName = props.displayName ?? props.name;
    this.name = props.name;
    this.variant = props.variant;

    this.description = props.description ?? {
      0: () => `You see nothing interesting about ${this.displayName}`,
    };

    this.x = props.x ?? 0;
    this.y = props.y ?? 0;

    this.controlling = true;
    this.dir = props.dir ?? Math.floor(Math.random() * 4);

    this.level = 1;
    this.xp = 0;

    this.agility = props.agility ?? 1;
    this.constitution = props.constitution ?? 1;
    this.endurance = props.endurance ?? 1;
    this.intelligence = props.intelligence ?? 1;
    this.strength = props.strength ?? 1;
    this.wisdom = props.wisdom ?? 1;

    this.attackRange = 1;
    this.attackDelayMod = 0;
    this.accuracyMod = 0;
    this.damageMod = 0;
    this.defenseMod = 0;
    this.dodgeMod = 0;

    this._health = this.maxHealth;
    this.mana = this.maxMana;
    this._stamina = this.maxStamina;

    this.w = props.w;
    this.behaviors = props.behaviors ?? [];
    this.memory = new Array(props.w * props.h).fill();
    this.entityMemory = new Array(props.w * props.h);

    for (let i = 0; i < this.entityMemory.length; ++i) {
      this.entityMemory[i] = [];
    }

    this.dead = false;
    this.idToLoc = {};
    this.immunities = props.immunities ?? new Set();
    this.statuses = [];
    this.targetId = null;
    this.tSet = props.tSet ?? new Set(["player"]);

    addEntity(this);
  }

  addStatus(status) {
    if (this.immunities.has(status.type)) {
      logWarn(this, `${this.displayName} is immune to ${status.type}.`);
      return false;
    }

    this.statuses.push(status);

    return true;
  }

  examine({ perception }) {
    const details = [];

    if (perception >= 3) {
      details.push(this.status);
    }

    if (perception >= 6) {
      details.push(
        `${this.displayName} immunities: ${Array.from(this.immunities).join(", ")}`,
      );
    }

    for (const threshold in this.description) {
      if (perception >= threshold) {
        details.push(this.description[threshold](this));
      }
    }

    return details.join("\r\n");
  }

  getEntitiesInMemory(x, y) {
    return this.entityMemory[x + y * this.w].map(({ dir, id, sprite }) => {
      const { displayName, name } = getEntityById(id);
      return {
        id,
        dir,
        displayName,
        name,
        sprite,
      };
    });
  }

  getTileInMemory(x, y) {
    return this.memory[x + y * this.w];
  }

  releaseControl() {
    this.controlling = false;
  }

  setEntitiesInMemory(x, y, entities) {
    const myEntities = this.entityMemory[x + y * this.w];
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
        const tile = this.entityMemory[oldX + oldY * this.w];
        for (let i = tile.length - 1; i >= 0; --i) {
          if (tile[i].id === id) {
            tile.splice(i, 1);
            break;
          }
        }
      }
      this.idToLoc[id] = { x, y };
      myEntities.push({ dir, id, sprite });
    }

    for (let i = myEntities.length - 1; i >= 0; --i) {
      if (toDelete.has(myEntities[i].id)) {
        myEntities.splice(i, 1);
      }
    }
  }

  setTileInMemory(x, y, name) {
    this.memory[x + y * this.w] = name;
  }

  get accuracy() {
    return Math.max(this.strength + this.wisdom + this.accuracyMod, 1);
  }

  get damage() {
    return Math.max(this.strength + this.intelligence + this.damageMod, 1);
  }

  get defense() {
    return Math.max(this.constitution + this.defenseMod, 1);
  }

  get dodge() {
    return Math.max(this.agility + this.dodgeMod, 1);
  }

  get health() {
    return this._health;
  }

  get inControl() {
    return this.controlling;
  }

  get isPlayer() {
    return this.name === "Player";
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
    return this.agility;
  }

  get sprite() {
    const file = [
      this.name.toLowerCase().replaceAll(" ", "-"),
      this.variant,
      this.dir,
    ]
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

  set health(val) {
    this._health = clamp(val, 0, this.maxHealth);
    if (this._health === 0) {
      this.dead = true;
      logDanger(this, `${this.displayName} died.`)?.classList.add("bold");
    }
  }

  set stamina(val) {
    this._stamina = clamp(val, 0, this.maxStamina);
  }
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function startEntity(entity, x, y) {
  getMap().moveEntity(entity, x, y);
  getInput(entity);
  return entity;
}

export function getEntityById(id) {
  return getEntities()[id];
}
