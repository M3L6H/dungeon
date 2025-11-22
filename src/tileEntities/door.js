import { getMap } from "../gameState.js";
import { TileEntity } from "./tileEntity.js";

const DIRS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

export function simpleDoor() {
  return new TileEntity({
    name: "Door",
    getSprite: ({ open }) => `url("images/dungeon-door${open ? "-open" : ""}.png")`,
    description: {
      0: ({ open }) => `The door is ${open ? "open" : "closed"}. It is made of a sturdy wood, reinforced with iron.`,
    },
    isOpaque: ({ open }) => !open,
    onEnter: ({ open }, entity) => {
      if (open) return;
      const { dir, x, y } === entity;
      const [dx, dy] = DIRS[dir];
      getMap().moveEntity(entity, x + dx, y + dy);
    },
    initialState: {
      open: false,
    },
  });
}