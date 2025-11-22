import { getMap } from "../gameState.js";
import { DIRS } from "../utils.js";
import { TileEntity } from "./tileEntity.js";

export function simpleDoor() {
  return new TileEntity({
    name: "Door",
    getSprite: ({ open }) =>
      `url("images/dungeon-door${open ? "-open" : ""}.png")`,
    description: {
      0: ({ open }) =>
        `The door is ${open ? "open" : "closed"}. It is made of a sturdy wood, reinforced with iron.`,
    },
    isOpaque: ({ open }) => !open,
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
    initialState: {
      open: false,
    },
  });
}

