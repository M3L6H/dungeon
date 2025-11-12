import { getInput } from './player.js';

export class Entity {
  constructor(props) {
    this.name = props.name ?? 'Unknown';
    this.isPlayer = props.isPlayer ?? false;
    
    this.x = props.x;
    this.y = props.y;
    
    this.agility = props.agility ?? 1;
  }
}

export function getDecision(entity) {
  if (entity.isPlayer) {
    getInput(entity);
  }
}