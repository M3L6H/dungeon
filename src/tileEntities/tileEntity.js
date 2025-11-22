import { addTileEntity } from "../gameState.js";

export class TileEntity {
  constructor(props) {
    this.name = props.name ?? "Unknown";
    this._displayName = this.displayName ?? this.name;
    this.getSprite = props.getSprite;
    this._sprite = props.sprite ?? "none";

    this.description = props.description ?? {
      0: () => `You see nothing interesting about ${this.name}`,
    };

    this._isOpaque = props.isOpaque ?? (() => false);
    this._isTraversable = props.isTraversable ?? (() => true);
    this.onEnter = props.onEnter;
    this.onInteract = props.onInteract;
    this.state = props.initialState ?? {};

    addTileEntity(this);
  }

  examine({ perception }) {
    const details = [];
    for (const threshold in this.description) {
      if (perception >= threshold) {
        details.push(this.description[threshold](this.state));
      }
    }
    return details.join("\r\n");
  }

  enter(entity) {
    if (this.onEnter !== undefined) {
      return this.onEnter(this.state, entity);
    }
    return false;
  }

  interact(entity, item) {
    if (this.onInteract !== undefined) {
      return this.onInteract(this.state, entity, item);
    }
    return false;
  }

  isOpaque(entity) {
    return this._isOpaque(this.state, entity);
  }

  isTraversable(entity) {
    return this._isTraversable(this.state, entity);
  }

  get displayName() {
    const suffix = this.label === undefined ? "" : ` ${this.label}`;
    return `<a data-id="${this.id}">${this._displayName}${suffix}</a>`;
  }

  get sprite() {
    if (this.getSprite !== undefined) {
      return this.getSprite(this.state);
    }
    return this._sprite;
  }
}

