import { setUpActions } from "./actions.js";
import { newGame } from "./gameState.js";
import { setUpInventory } from "./inventory.js";
import { setUpStats } from "./stats.js";
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
}

addEventListener("load", async () => await init());
addEventListener("resize", () => setSize());
