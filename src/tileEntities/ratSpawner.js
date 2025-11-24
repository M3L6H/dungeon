import { TileEntity } from "./tileEntity.js";

const DIV = 17;

export function ratSpawner(spawnX, spawnY) {
  return new TileEntity({
    name: "Hole",
    getSprite: () => "url('images/dungeon-wall-hole.png')",
    description: {
      0: () => "This hole in the wall is a seemingly endless source of Rats.",
    },
    canInteract: () => false,
    isOpaque: () => true,
    isTraversable: () => false,
    initialState: {
      rat: undefined,
      offset: Math.floor(Math.random() * DIV),
      spawnX,
      spawnY,
    },
  });
}
