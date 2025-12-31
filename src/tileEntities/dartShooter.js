import { createDart, resetDart, startEntity } from "../entities/index.js";
import { registerFn } from "../functions.js";
import { setDescription } from "./data.js";
import { TileEntity } from "./tileEntity.js";

const NAMESPACE = "dartShooter";
const DIV = 47;

const name = "Dart Shooter";
const getSprite = registerFn(
  NAMESPACE,
  "getSprite",
  () => "url('images/dungeon-wall-dart.png')",
);
const canInteract = registerFn(NAMESPACE, "canInteract", () => false);
const isOpaque = registerFn(NAMESPACE, "isOpaque", () => true);
const isTraversable = registerFn(NAMESPACE, "isTraversable", () => false);
const onTick = registerFn(NAMESPACE, "onTick", async (state, time) => {
  const { offset, dart, spawnDir, spawnX, spawnY } = state;
  if ((time + offset) % DIV !== 0) return;
  if (dart !== undefined && !dart.dead) return;
  if (dart === undefined) {
    state.dart = await createDart(spawnX, spawnY, { dir: spawnDir });
  } else {
    resetDart(state.dart, { dir: spawnDir });
    await startEntity(state.dart, spawnX, spawnY);
  }
});
export function dartShooter(spawnX, spawnY, spawnDir) {
  return new TileEntity({
    name,
    getSprite,
    canInteract,
    isOpaque,
    isTraversable,
    onTick,
    initialState: {
      dart: undefined,
      offset: Math.floor(Math.random() * DIV),
      spawnX,
      spawnY,
      spawnDir,
    },
  });
}
setDescription(name, {
  0: () =>
    "If you look carefully, you can just barely make out the mechanism that sends deadly darts rocketing out at murderous speeds.",
});
