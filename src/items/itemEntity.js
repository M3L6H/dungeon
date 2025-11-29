import { SKILL, act, addEntity, getMap, inRange } from "../gameState.js";
import { pickup } from "../skills.js";
import { renderViewport } from "../viewport.js";

export function spawnItem(item, x, y, additionalProps = {}) {
  const entity = new ItemEntity({ item, ...additionalProps });
  getMap().moveEntity(entity, x, y);
  renderViewport();
  return entity;
}

export class ItemEntity {
  constructor(props) {
    this._item = props.item;
    this._pickup = props.pickup ?? props.item;
    this._count = props.count ?? 1;

    this.x = 0;
    this.y = 0;
    this.nextActionTime = 0;

    addEntity(this);
  }

  get behaviors() {
    return [
      async ({ x, y }) => {
        const data = pickup(this, x, y, this._pickup, this._count);
        if (inRange(this, SKILL, data)) {
          return await act(this, SKILL, data);
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
