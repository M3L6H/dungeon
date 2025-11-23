import { getMap, logActionEnd } from "../gameState.js";
import { key } from "../items/index.js";
import { DIRS } from "../utils.js";
import { TileEntity } from "./tileEntity.js";

export function lockedDoor(x, y, locked = true) {
  return new TileEntity({
    name: "Door",
    getSprite: ({ locked, open }) =>
      locked
        ? "url('images/dungeon-door-locked.png')"
        : `url("images/dungeon-door${open ? "-open" : ""}.png")`,
    description: {
      0: ({ locked, open }) =>
        `The door is ${locked ? "locked" : open ? "open" : "closed"}. It is made of a sturdy wood, reinforced with iron.`,
    },
    canInteract: ({ x, y }, entity) =>
      (entity.hands ?? true) && !(entity.x === x && entity.y === y),
    isOpaque: ({ open }) => !open,
    isTraversable: ({ locked, open }, entity) =>
      !locked && (open || (entity.hands ?? true)),
    onEnter: ({ open }, entity) => {
      if (open) return;
      const { dir, x, y } = entity;
      const [dx, dy] = DIRS[dir];
      const [newX, newY] = [x + dx, y + dy];
      if (getMap().getTile(newX, newY).isTraversable(entity)) {
        getMap().moveEntity(entity, newX, newY);
      } else {
        getMap().moveEntity(entity, x - dx, y - dy);
      }
    },
    onInteract: (state, entity, item) => {
      if (state.locked && item.name !== key.name) {
        logActionEnd(entity, `cannot unlock the door with ${item.name}`);
        return false;
      } else if (state.locked) {
        entity.removeItem(item);
        state.locked = false;
        logActionEnd(entity, `used ${item.name} to unlock the door`);
        return true;
      }

      if (entity.hands ?? true) {
        state.open = !state.open;
        if (state.open) {
          logActionEnd(entity, "opened the door");
        } else {
          logActionEnd(entity, "closed the door");
        }
        return true;
      }
      return false;
    },
    initialState: {
      locked,
      open: false,
      x,
      y,
    },
  });
}

export function simpleDoor(x, y) {
  return lockedDoor(x, y, false);
}
