import { setUpActions } from "./actions.js";
import { createGreenSlimeSmall } from "./entities/slime.js";
import { getPlayer, newGame } from "./gameState.js";
import { setUpInventory } from "./inventory.js";
import { setUpStats, showStats } from "./stats.js";
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

  setUpViewport();
  setUpActions();
  setUpInventory();
  setUpStats();
  renderViewport();

  // createGreenSlimeSmall(getPlayer().x + 1, getPlayer().y);
  showStats(getPlayer(), true, 5);
}

addEventListener("load", async () => await init());
addEventListener("resize", () => setSize());
