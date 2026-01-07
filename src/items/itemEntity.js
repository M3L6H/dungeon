import { callAsync, registerFn } from "../functions.js";
import { SKILL, act, addEntity, getMap, inRange, logSafe } from "../gameState.js";
import { pickup } from "../skills.js";
import { renderViewport } from "../viewport.js";

const NAMESPACE = "item";

const pickupBehavior = registerFn(NAMESPACE, "pickup", async function (entity) {
  const { x, y } = entity;
  const data = pickup(entity, x, y);
  if (inRange(entity, SKILL, data)) {
    return await act(entity, SKILL, data);
  }
  return false;
});

export function spawnItem(item, x, y, additionalProps = {}) {
  const entity = new ItemEntity({ item, ...additionalProps });
  getMap().moveEntity(entity, x, y);
  renderViewport();
  return entity;
}

export class ItemEntity {
  static fromData(data) {
    const itemEntity = new ItemEntity(data.props);
    for (const k in data.setAfter) {
      itemEntity[k] = data.setAfter[k];
    }
    // We cannot persist the timeline, so we have to recalculate actions
    itemEntity.nextActionTime = 0;
    return itemEntity;
  }

  constructor(props) {
    this._item = props.item;
    this._pickup = props.pickup ?? props.item;
    this._count = props.count ?? 1;

    this.x = 0;
    this.y = 0;
    this.nextActionTime = 0;

    this.dataset = {};

    addEntity(this);
  }

  toData() {
    return {
      props: {
        count: this._count,
        item: this._item,
        pickup: this._pickup,
      },
      setAfter: {
        x: this.x,
        y: this.y,
        nextActionTime: this.nextActionTime,
        dataset: this.dataset,
      },
    };
  }

  get behaviors() {
    return [pickupBehavior];
  }
  
  get count() {
    return this._count;
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
  
  get pickup() {
    return this._pickup;
  }

  get sprite() {
    return this.item?.sprite;
  }
  
  async onPickup(other) {
    if (!!this.item.onPickup) {
      return await callAsync(this.item.onPickup, this, other);
    }
    
    other.inventory[this.pickup.id] =
        (other.inventory[this.pickup.id] ?? 0) + this.count;
    await logSafe(
      other,
      `${other.displayName} has picked up ${this.displayName}.`,
    );
  }
}
