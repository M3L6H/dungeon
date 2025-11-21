import { setUpActions } from "./actions.js";
import { createBlueSlimeSmall, createGreenSlimeSmall } from "./entity.js";
import { getMap, getPlayer, newGame } from "./gameState.js";
import { renderViewport, setUpViewport } from "./viewport.js";

function setSize() {
  const main = document.getElementById("main");
  const width = Math.min(window.innerWidth, (window.innerHeight / 16) * 9);
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

  setUpViewport();
  setUpActions();
  renderViewport();
}

addEventListener("load", async () => await init());
addEventListener("resize", () => setSize());
