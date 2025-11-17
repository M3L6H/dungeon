const HITPOINTS_PER_CONSTITUTION = 3;
const STAMINA_PER_ENDURANCE = 2;

let id = 0;

export class Entity {
  constructor(props) {
    this.displayName = props.displayName ?? "Unknown";
    this.id = ++id;
    this.name = props.name;
    this.variant = props.variant;

    this.x = props.x ?? 0;
    this.y = props.y ?? 0;
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
  }
 
  getEntitiesInMemory(x, y) {
    return this.entityMemory[x + y * this.w];
  }

  getTileInMemory(x, y) {
    return this.memory[x + y * this.w];
  }
  
  setEntityInMemory(entity) {
    const { id, x, y } = entity;
    if (idToLoc[id]) {
      const { x: oldX, y: oldY } = idToLoc[id];
      const tile = this.entityMemory[oldX + oldY * this.w];
      const idx = tile.indexOf(id);
      if (idx > -1) {
        this.entityMemory[oldX + oldY * this.w] = tile.splice(idx, 1);
      }
    }
    this.idToLoc[id] = { x, y };
    this.entityMemory[x + y * this.w].push(id);
  }

  setTileInMemory(x, y, name) {
    this.memory[x + y * this.w] = name;
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
  });
}

function wander(entity) {}
