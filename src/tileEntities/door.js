import { registerFn } from "../functions.js";
import { getMap, logActionEnd } from "../gameState.js";
import { emptyHand, key } from "../items/index.js";
import { DIRS } from "../utils.js";
import { setDescription } from "./data.js";
import { TileEntity } from "./tileEntity.js";

const NAMESPACE = "door";

const name = "Door";
const getSprite = registerFn(NAMESPACE, "getSprite", ({ locked, open }) =>
  locked
    ? "url('images/dungeon-door-locked.png')"
    : `url("images/dungeon-door${open ? "-open" : ""}.png")`,
);
const canInteract = registerFn(
  NAMESPACE,
  "canInteract",
  ({ x, y }, entity, item) =>
    (entity.hands ?? true) &&
    !(entity.x === x && entity.y === y) &&
    (item.id === emptyHand.id || item.id === key.id),
);
const isOpaque = registerFn(NAMESPACE, "isOpaque", ({ open }) => !open);
const isTraversable = registerFn(
  NAMESPACE,
  "isTraversable",
  ({ locked, open }, entity) => !locked && (open || (entity.hands ?? true)),
);
const onEnter = registerFn(NAMESPACE, "onEnter", ({ open }, entity) => {
  if (open) return;
  const { dir, x, y } = entity;
  const [dx, dy] = DIRS[dir];
  const [newX, newY] = [x + dx, y + dy];
  if (
    (entity.hands ?? true) &&
    getMap().getTile(newX, newY).isTraversable(entity)
  ) {
    getMap().moveEntity(entity, newX, newY);
  } else {
    getMap().moveEntity(entity, x - dx, y - dy);
  }
});
const onInteract = registerFn(
  NAMESPACE,
  "onInteract",
  async (state, entity, item) => {
    if (state.locked && item.name !== key.name) {
      await logActionEnd(entity, `cannot unlock the door with ${item.name}`);
      return false;
    } else if (state.locked) {
      entity.removeItem(item);
      state.locked = false;
      await logActionEnd(entity, `used ${item.name} to unlock the door`);
      return true;
    }

    if (
      (entity.hands ?? true) &&
      (item.id === emptyHand.id || item.id === key.id)
    ) {
      state.open = !state.open;
      if (state.open) {
        await logActionEnd(entity, "opened the door");
      } else {
        await logActionEnd(entity, "closed the door");
      }
      return true;
    }
    return false;
  },
);
export function lockedDoor(x, y, locked = true) {
  return new TileEntity({
    name,
    getSprite,
    canInteract,
    isOpaque,
    isTraversable,
    onEnter,
    onInteract,
    initialState: {
      locked,
      open: false,
      x,
      y,
    },
  });
}
setDescription(name, {
  0: ({ locked, open }) =>
    `The door is ${locked ? "locked" : open ? "open" : "closed"}. It is made of a sturdy wood, reinforced with iron.`,
});

export function simpleDoor(x, y) {
  return lockedDoor(x, y, false);
}
