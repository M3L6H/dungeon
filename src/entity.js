import { MOVE, act, inRange } from "./gameState.js";

const HITPOINTS_PER_CONSTITUTION = 3;
const STAMINA_PER_ENDURANCE = 2;

let id = 0;
const entitiesById = {};

export class Entity {
  constructor(props) {
    this.displayName = props.displayName ?? "Unknown";
    this.id = ++id;
    this.name = props.name;
    this.variant = props.variant;

    this.x = props.x ?? 0;
    this.y = props.y ?? 0;

    this.controlling = true;
    this.dir = props.dir ?? Math.floor(Math.random() * 4);

    this.level = 1;
    this.xp = 0;

    this.agility = props.agility ?? 1;
    this.constitution = props.constitution ?? 1;
    this.endurance = props.endurance ?? 1;

    this.hitpoints = this.maxHitpoints;
    this._stamina = this.maxStamina;

    this.w = props.w;
    this.behaviors = props.behaviors ?? [];
    this.memory = new Array(props.w * props.h);
    this.entityMemory = new Array(props.w * props.h);

    for (let i = 0; i < this.entityMemory.length; ++i) {
      this.entityMemory[i] = [];
    }

    this.idToLoc = {};

    entitiesById[this.id] = this;
  }

  getEntitiesInMemory(x, y) {
    return this.entityMemory[x + y * this.w].map(({ id, dir }) => ({ ...getEntityById(id), dir }));
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
      const { id } = entity;
      if (this.idToLoc[id]) {
        const { x: oldX, y: oldY } = this.idToLoc[id];
        if (oldX === x && oldY === y) continue;
        const tile = this.entityMemory[oldX + oldY * this.w];
        for (let i = tile.length - 1; i >= 0; --i) {
          if (tile[i].id === id) {
            tile.splice(idx, 1);
            break;
          } 
        }
      }
      this.idToLoc[id] = { x, y };
      myEntities.push({ id, dir });
      toDelete.delete(id);
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

  get inControl() {
    return this.controlling;
  }

  get isPlayer() {
    return this.name === "Player";
  }

  get maxHitpoints() {
    return this.constitution * HITPOINTS_PER_CONSTITUTION;
  }

  get maxStamina() {
    return this.endurance * STAMINA_PER_ENDURANCE;
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
export function createSlime(w, h, color = "Blue", variant = "small") {
  return new Entity({
    name: `${color} Slime`,
    variant,
    w,
    h,
    behaviors: [wander],
  });
}

function getEntityById(id) {
  return entitiesById[id];
}

const DIRS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

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

  return act(entity, MOVE, target);
}
