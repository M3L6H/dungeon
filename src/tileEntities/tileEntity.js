import { call, callAsync, registerFn } from "../functions.js";
import { addTileEntity } from "../gameState.js";
import { getDescription } from "./data.js";

const NAMESPACE = "tileEntity";

const defaultCanInteract = registerFn(NAMESPACE, "canInteract", () => false);
const defaultIsOpaque = registerFn(NAMESPACE, "canInteract", () => false);
const defaultIsTraversable = registerFn(NAMESPACE, "canInteract", () => true);

export class TileEntity {
  constructor(props) {
    this.name = props.name;
    this._displayName = props.displayName ?? this.name;
    this.getSprite = props.getSprite;
    this._sprite = props.sprite ?? "none";

    this._canInteract = props.canInteract ?? defaultCanInteract;
    this._isOpaque = props.isOpaque ?? defaultIsOpaque;
    this._isTraversable = props.isTraversable ?? defaultIsTraversable;
    this.onEnter = props.onEnter;
    this.onInteract = props.onInteract;
    this.onTick = props.onTick;
    this.state = props.initialState ?? {};

    addTileEntity(this);
  }

  canInteract(entity, item) {
    if (!this._canInteract) return undefined;
    return call(this._canInteract, this.state, entity, item);
  }

  examine({ perception }) {
    const details = [];
    const description = getDescription(this) ?? {
      0: () => `You see nothing interesting about ${this.name}`,
    };

    for (const threshold in description) {
      if (perception >= threshold) {
        details.push(
          description[threshold]({
            displayName: this.displayName,
            ...this.state,
          }),
        );
      }
    }
    return details.join("\r\n");
  }

  enter(entity) {
    if (this.onEnter !== undefined) {
      return call(this.onEnter, this.state, entity);
    }
    return false;
  }

  async interact(entity, item) {
    if (this.onInteract !== undefined) {
      return await callAsync(this.onInteract, this.state, entity, item);
    }
    return undefined;
  }

  isOpaque(entity) {
    return call(this._isOpaque, this.state, entity);
  }

  isTraversable(entity) {
    return call(this._isTraversable, this.state, entity);
  }

  async tick(time) {
    if (this.onTick !== undefined) {
      await call(this.onTick, this.state, time);
    }
  }

  get displayName() {
    return `<a data-id="${this.id}">${this._displayName}</a>`;
  }

  get sprite() {
    if (this.getSprite !== undefined) {
      return call(this.getSprite, this.state);
    }
    return this._sprite;
  }
}
