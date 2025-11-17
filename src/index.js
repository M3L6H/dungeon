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
  const { x, y } = map.getRandomRoom();
  const player = getPlayer();
  map.moveEntity(player, x, y);
  const slime1 = createSlime(map.w, map.h);
  map.moveEntity(slime1, x + 1, y + 1);
  const slime2 = createSlime(map.w, map.h, "Green");
  map.moveEntity(slime2, x - 1, y + 1);

  setUpViewport();
  setUpActions();
  renderViewport();
}

addEventListener("load", async () => await init());
addEventListener("resize", () => setSize());
