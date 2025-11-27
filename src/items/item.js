export class Item {
  static idToItem = {};

  constructor(props) {
    this._id = props.id;
    this._name = props.name ?? "Unknown";
    this._description = props.description;
    this._sprite = props.sprite;

    for (const k in props.additionalProps ?? {}) {
      this[k] = props.additionalProps[k];
    }

    this._canInteract = props.canInteract;

    Item.idToItem[props.id] = this;
  }

  canInteract(entity, other) {
    if (!this._canInteract) return false;
    return this._canInteract(this, entity, other);
  }

  get description() {
    return this._description;
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
