import { SKILL, act, addEntity, getMap, inRange } from "../gameState.js";
import { pickup } from "../skills.js";
import { renderViewport } from "../viewport.js";

export function spawnItem(item, x, y) {
  const entity = new ItemEntity({ item });
  getMap().moveEntity(entity, x, y);
  renderViewport();
  return entity;
}

export class ItemEntity {
  constructor(props) {
    this._item = props.item;

    this.x = 0;
    this.y = 0;
    this.nextActionTime = 0;

    addEntity(this);
  }

  get behaviors() {
    return [
      ({ x, y }) => {
        const data = pickup(this, x, y);
        if (inRange(this, SKILL, data)) {
          return act(this, SKILL, data);
        }
        return false;
      },
    ];
  }

  get description() {
    return this.item?.description;
  }

  get displayName() {
    return `<a data-id="${this.id}">${this.item?.name}</a>`;
  }

  get isItem() {
    return true;
  }

  get item() {
    return this._item;
  }

  get sprite() {
    return this.item?.sprite;
  }
}
