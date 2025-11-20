import { setUpActions } from "./actions.js";
import { createSlime } from "./entity.js";
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
  createSlime(map.w, map.h, x + 1, y + 1);
  createSlime(map.w, map.h, x - 1, y + 1, "Green");

  setUpViewport();
  setUpActions();
  renderViewport();
}

addEventListener("load", async () => await init());
addEventListener("resize", () => setSize());
