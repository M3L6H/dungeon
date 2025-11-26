let id = 0;

export class ItemEntity {
  constructor(props) {
    this._id = id++;
    this._item = props.item;

    this.x = 0;
    this.y = 0;
  }

  get id() {
    return [this.item.id, this._id].join("-");
  }

  get item() {
    return this._item;
  }

  get sprite() {
    return this.item.sprite;
  }
}
