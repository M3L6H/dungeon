import { createRat, resetRat, startEntity } from "../entities/index.js";
import { registerFn } from "../functions.js";
import { getEntities } from "../gameState.js";
import { setDescription } from "./data.js";
import { TileEntity } from "./tileEntity.js";

const NAMESPACE = "ratSpawner";

const DIV = 403;

const name = "Hole";
const getSprite = registerFn(
  NAMESPACE,
  "getSprite",
  () => "url('images/dungeon-wall-hole.png')",
);
const canInteract = registerFn(NAMESPACE, "canInteract", () => false);
const isOpaque = registerFn(NAMESPACE, "isOpaque", () => true);
const isTraversable = registerFn(NAMESPACE, "isTraversable", () => false);
const onTick = registerFn(NAMESPACE, "onTick", async (state, time) => {
  const { offset, ratId, spawnDir, spawnX, spawnY } = state;
  if ((time + offset) % DIV !== 0) return;
  if (ratId !== undefined && !getEntities(ratId).dead) return;
  if (ratId === undefined) {
    const rat = await createRat(spawnX, spawnY, { dir: spawnDir });
    state.ratId = rat.id;
  } else {
    resetRat(getEntities()[ratId], { dir: spawnDir });
    await startEntity(getEntities()[ratId], spawnX, spawnY);
  }
});
export function ratSpawner(spawnX, spawnY, spawnDir) {
  return new TileEntity({
    name,
    getSprite,
    canInteract,
    isOpaque,
    isTraversable,
    onTick,
    initialState: {
      ratId: undefined,
      offset: Math.floor(Math.random() * DIV),
      spawnX,
      spawnY,
      spawnDir,
    },
  });
}
setDescription(name, {
  0: () => "This hole in the wall is a seemingly endless source of Rats.",
});
