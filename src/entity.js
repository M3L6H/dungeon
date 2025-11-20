import {
  ATTACK,
  EXAMINE,
  MOVE,
  act,
  addEntity,
  getEntities,
  getInput,
  getMap,
  getPlayer,
  inRange,
} from "./gameState.js";
import { addLog } from "./logs.js";

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
    this.targetId = null;
    this.tSet = props.tSet ?? new Set(["player"]);

    addEntity(this);
  }

  examine({ perception }) {
    const details = [];

    if (perception >= 3) {
      details.push(this.status);
    }

    for (const threshold in this.description) {
      if (perception >= threshold) {
        details.push(this.description[threshold](this));
      }
    }

    return details.join("\r\n");
  }

  getEntitiesInMemory(x, y) {
    return this.entityMemory[x + y * this.w].map(({ id, dir }) => {
      const entity = getEntityById(id);
      entity.dir = dir;
      return entity;
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
      const { id, dir } = entity;
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
      myEntities.push({ id, dir });
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
    }
  }

  set stamina(val) {
    this._stamina = clamp(val, 0, this.maxStamina);
  }
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Creates a slime entity of the given color and variant.
 * @returns {Entity} A slime entity
 */
export function createSlime(w, h, x, y, color = "Blue", variant = "small") {
  return startEntity(new Entity({
    name: `${color} Slime`,
    variant,
    description: {
      0: (self) =>
        `The ${self.displayName} is semi-translucent. Its gelatinous body wobbles as it moves around.`,
      3: (self) => {
        if (color === "Green") {
          return `The ${self.displayName} is slightly poisonous.`;
        } else {
          return `The ${self.displayName} does physical damage.`;
        }
      },
      5: () =>
        `Slimes have the ability to merge with each other. Each time they do so, they become stronger.`,
    },
    w,
    h,
    strength: 2,
    constitution: 2,
    behaviors: [simpleAttack, findTarget, hunt, wander, rest],
  }), x, y);
}

function startEntity(entity, x, y) {
  getMap().moveEntity(entity, x, y);
  getInput(entity);
  return entity;
}

function getEntityById(id) {
  return getEntities()[id];
}

const DIRS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

/**
 * Behavior where entity will search for the first target in its memory that is on the targets list
 * @param entity {Entity} - The entity this behavior is for
 */
function findTarget(entity) {
  const { entityMemory, tSet } = entity;
  if (tSet.size === 0) return false;
  if (entity.targetId !== null) return false;
  for (const entities of entityMemory) {
    for (const { id } of entities) {
      const other = getEntityById(id);
      if (tSet.has(other.name.toLowerCase())) {
        entity.targetId = id;
        return false;
      }
    }
  }
  return false;
}

function hunt(entity) {
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

function simpleAttack(entity) {
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

function wander(entity) {
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

function rest(entity) {
  const { x, y } = entity;
  return act(entity, MOVE, { x, y });
}

function logBehavior(entity, behavior) {
  const { displayName, x, y } = entity;
  if (getMap().canEntitySeeTile(getPlayer(), x, y)) {
    addLog(`${displayName} is ${behavior}`);
  }
}
