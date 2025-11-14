const HITPOINTS_PER_CONSTITUTION = 3;
const STAMINA_PER_ENDURANCE = 2;

export class Entity {
  constructor(props) {
    this.name = props.name ?? 'Unknown';
    this.gender = props.gender;
    this.isPlayer = props.isPlayer ?? false;
    
    this.x = props.x;
    this.y = props.y;
    this.dir = 2;
    
    this.agility = props.agility ?? 1;
    this.constitution = props.constitution ?? 1;
    this.endurance = props.endurance ?? 1;
    
    this.hitpoints = this.maxHitpoints;
    this._stamina = this.maxStamina;
  }
  
  get maxHitpoints() {
    return this.constitution * HITPOINTS_PER_CONSTITUTION;
  } 
  
  get maxStamina() {
    return this.endurance * STAMINA_PER_ENDURANCE;
  }
  
  get speed() {
    return this.agility;
  }
  
  get sprite() {
    const file = [
      this.name.toLowerCase(),
      this.gender,
      this.dir,
    ].filter(part => !!part).join('-');
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