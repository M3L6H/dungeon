import { setUpActions } from "./actions.js";
import {
  createBlueSlimeSmall,
  createGreenSlimeSmall,
  createRat,
} from "./entities/index.js";
import { getMap, newGame } from "./gameState.js";
import { setupInventory } from "./inventory.js";
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
  const { x, y } = getMap().start;
  createBlueSlimeSmall(x + 1, y + 1);
  createGreenSlimeSmall(x - 1, y + 1);
  createGreenSlimeSmall(x - 1, y - 1);
  createGreenSlimeSmall(x + 1, y - 1);

  createRat(x + 1, y);
  createRat(x - 1, y);
  createRat(x, y + 1);
  createRat(x, y - 1);

  setUpViewport();
  setUpActions();
  setupInventory();
  renderViewport();
}

addEventListener("load", async () => await init());
addEventListener("resize", () => setSize());
