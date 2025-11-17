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
    this.dir = 2; 

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
    return this.entityMemory[x + y * this.w].map((id) => getEntityById(id));
  }

  getTileInMemory(x, y) {
    return this.memory[x + y * this.w];
  }

  releaseControl() {
    this.controlling = false;
  }

  setEntityInMemory(entity) {
    const { id, x, y } = entity;
    if (this.idToLoc[id]) {
      const { x: oldX, y: oldY } = this.idToLoc[id];
      if (oldX === x && oldY === y) return;
      const tile = this.entityMemory[oldX + oldY * this.w];
      const idx = tile.indexOf(id);
      if (idx > -1) tile.splice(idx, 1);
    }
    this.idToLoc[id] = { x, y };
    this.entityMemory[x + y * this.w].push(id);
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
    behaviors: [
      wander,
    ],
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
    do {
      [dx, dy] = DIRS[Math.floor(Math.random() * DIRS.length)];
      target = { x: x + dx, y: y + dy };
    } while (!inRange(entity, MOVE, target));
  }
  
  return act(entity, MOVE, target);
}
