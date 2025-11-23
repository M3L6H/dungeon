export class Item {
  static idToItem = {};

  constructor(props) {
    this._id = props.id;
    this._name = props.name ?? "Unknown";
    this._sprite = props.sprite;

    Item.idToItem[props.id] = this;
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get sprite() {
    return this._sprite !== undefined
      ? `url("images/${this._sprite}.png")`
      : "none";
  }
}
