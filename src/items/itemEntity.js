import { addEntity, getMap } from "../gameState.js";

export function spawnItem(item, x, y) {
  const entity = new ItemEntity(item);
  getMap().moveEntity(entity, x, y);
  return entity;
}

export class ItemEntity {
  constructor(props) {
    this._item = props.item;

    this.x = 0;
    this.y = 0;

    addEntity(this);
  }

  get behaviors() {
    return [];
  }

  get displayName() {
    return `<a data-id="${this.id}">${this.item.name}</a>`;
  }

  get isItem() {
    return true;
  }

  get item() {
    return this._item;
  }

  get sprite() {
    return this.item.sprite;
  }
}
