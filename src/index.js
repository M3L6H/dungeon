import { setUpActions } from "./actions.js";
import {
  createBlueSlimeSmall,
  createGreenSlimeSmall,
} from "./entities/index.js";
import { getMap, getPlayer, newGame } from "./gameState.js";
import { setupInventory } from "./inventory.js";
import { simpleDoor } from "./tileEntities/door.js";
import { renderViewport, setUpViewport } from "./viewport.js";

function setSize() {
  const main = document.getElementById("main");
  const width = Math.min(
    window.innerWidth,
    Math.floor((window.innerHeight / 16) * 9),
  );
  main.style.width = `${width}px`;
}

async function init() {
  setSize();

  await newGame();
  const map = getMap();
  const { x, y } = map.start;
  const player = getPlayer();
  map.moveEntity(player, x, y);
  createBlueSlimeSmall(map.w, map.h, x + 1, y + 1);
  createGreenSlimeSmall(map.w, map.h, x - 1, y + 1);
  createGreenSlimeSmall(map.w, map.h, x - 1, y - 1);
  createGreenSlimeSmall(map.w, map.h, x + 1, y - 1);
  map._setTileEntity(x + 1, y, simpleDoor(x + 1, y));

  setUpViewport();
  setUpActions();
  setupInventory();
  renderViewport();
}

addEventListener("load", async () => await init());
addEventListener("resize", () => setSize());
