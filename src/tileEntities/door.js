import { getMap, logActionEnd } from "../gameState.js";
import { DIRS } from "../utils.js";
import { TileEntity } from "./tileEntity.js";

export function simpleDoor(x, y) {
  return new TileEntity({
    name: "Door",
    getSprite: ({ open }) =>
      `url("images/dungeon-door${open ? "-open" : ""}.png")`,
    description: {
      0: ({ open }) =>
        `The door is ${open ? "open" : "closed"}. It is made of a sturdy wood, reinforced with iron.`,
    },
    canInteract: ({ x, y }, entity) =>
      (entity.hands ?? true) && !(entity.x === x && entity.y === y),
    isOpaque: ({ open }) => !open,
    isTraversable: ({ open }, entity) => {
      return open || (entity.hands ?? true);
    },
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
      open: false,
      x,
      y,
    },
  });
}
