import { startEntity } from "../entities/entity.js";
import { createRat, resetRat } from "../entities/index.js";
import { TileEntity } from "./tileEntity.js";

const DIV = 403;

export function ratSpawner(spawnX, spawnY, spawnDir) {
  return new TileEntity({
    name: "Hole",
    getSprite: () => "url('images/dungeon-wall-hole.png')",
    description: {
      0: () => "This hole in the wall is a seemingly endless source of Rats.",
    },
    canInteract: () => false,
    isOpaque: () => true,
    isTraversable: () => false,
    onTick: (state, time) => {
      const { offset, rat, spawnDir, spawnX, spawnY } = state;
      if ((time + offset) % DIV !== 0) return;
      if (rat !== undefined && !rat.dead) return;
      if (rat === undefined) {
        state.rat = createRat(spawnX, spawnY, { dir: spawnDir });
      } else {
        resetRat(state.rat, { dir: spawnDir });
        startEntity(state.rat, spawnX, spawnY);
      }
    },
    initialState: {
      rat: undefined,
      offset: Math.floor(Math.random() * DIV),
      spawnX,
      spawnY,
      spawnDir,
    },
  });
}
