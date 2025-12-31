import { registerFn } from "../functions.js";
import { SKILL, act, addEntity, getMap, inRange } from "../gameState.js";
import { pickup } from "../skills.js";
import { renderViewport } from "../viewport.js";

const NAMESPACE = "item";

const pickupBehavior = registerFn(NAMESPACE, "pickup", async function (entity) {
  const { x, y } = entity;
  const data = pickup(this, x, y, this._pickup, this._count);
  if (inRange(this, SKILL, data)) {
    return await act(this, SKILL, data);
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

  get behaviors() {
    return [pickupBehavior];
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
