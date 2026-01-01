import { setUpActions } from "./actions.js";
import { createOrLoadGame, getPlayer, loadMap } from "./gameState.js";
import { setUpInventory } from "./inventory.js";
import { setUpLogs } from "./logs.js";
import { setUpStats, showStats } from "./stats.js";
import { renderViewport } from "./viewport.js";

const mainMenuElt = document.getElementById("main-menu");
const newGameBtn = document.getElementById("main-menu-new-game");
const continueBtn = document.getElementById("main-menu-continue");
const settingsBtn = document.getElementById("main-menu-settings");
const wikiBtn = document.getElementById("main-menu-wiki");

function init() {
  newGameBtn.addEventListener("click", async () => {
    if (
      !loadMap() ||
      confirm("This will overwrite your saved game. Are you sure?")
    ) {
      await createOrLoadGame(true);

      setUpActions();
      setUpInventory();
      setUpStats();
      setUpLogs();
      renderViewport();
      mainMenuElt.classList.add("hidden");

      showStats(getPlayer(), true, 5);
    }
  });

  continueBtn.disabled = !loadMap();
  continueBtn.addEventListener("click", async () => {
    await createOrLoadGame(false);

    setUpActions();
    setUpInventory();
    setUpStats();
    setUpLogs();
    renderViewport();
    mainMenuElt.classList.add("hidden");
  });
}

export function setUpMainMenu() {
  init();
}
