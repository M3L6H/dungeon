import { setUpActions } from "./actions.js";
import { getMap, getPlayer, newGame } from "./gameState.js";
import { renderViewport, setUpViewport } from "./viewport.js";

async function init() {
  await newGame();
  const map = getMap();
  const { x, y } = map.getRandomRoom();
  const player = getPlayer();
  player.x = x;
  player.y = y;

  setUpViewport();
  setUpActions();
  renderViewport();
}

addEventListener("load", async () => await init());
