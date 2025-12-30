import { createDart, resetDart, startEntity } from "../entities/index.js";
import { TileEntity } from "./tileEntity.js";

const DIV = 47;

export function dartShooter(spawnX, spawnY, spawnDir) {
  return new TileEntity({
    name: "Dart Shooter",
    getSprite: () => "url('images/dungeon-wall-dart.png')",
    description: {
      0: () => "If you look carefully, you can just barely make out the mechanism that sends deadly darts rocketing out at murderous speeds.",
    },
    canInteract: () => false,
    isOpaque: () => true,
    isTraversable: () => false,
    onTick: async (state, time) => {
      const { offset, dart, spawnDir, spawnX, spawnY } = state;
      if ((time + offset) % DIV !== 0) return;
      if (dart !== undefined && !dart.dead) return;
      if (dart === undefined) {
        state.dart = await createDart(spawnX, spawnY, { dir: spawnDir });
      } else {
        resetDart(state.dart, { dir: spawnDir });
        await startEntity(state.dart, spawnX, spawnY);
      }
    },
    initialState: {
      dart: undefined,
      offset: Math.floor(Math.random() * DIV),
      spawnX,
      spawnY,
      spawnDir,
    },
  });
}
