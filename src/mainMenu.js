import { setUpActions } from "./actions.js";
import { createOrLoadGame, getEntities, loadEntities } from "./gameState.js";
import { setUpInventory } from "./inventory.js";
import { setUpLogs } from "./logs.js";
import { showNewGame } from "./newGame.js";
import { setUpStats } from "./stats.js";
import { renderViewport } from "./viewport.js";

const mainMenuElt = document.getElementById("main-menu");
const newGameBtn = document.getElementById("main-menu-new-game");
const continueBtn = document.getElementById("main-menu-continue");
const settingsBtn = document.getElementById("main-menu-settings");
const wikiBtn = document.getElementById("main-menu-wiki");

export function showMainMenu() {
  mainMenuElt.classList.remove("hidden");
}

function hideMainMenu() {
  mainMenuElt.classList.add("hidden");
}

function hasSavedGame() {
  return loadEntities(); // TODO: add version check
}

function init() {
  newGameBtn.addEventListener("click", async () => {
    if (
      !hasSavedGame() ||
      confirm("This will overwrite your saved game. Are you sure?")
    ) {
      hideMainMenu();
      showNewGame();
    }
  });

  continueBtn.disabled = !hasSavedGame();
  continueBtn.addEventListener("click", async () => {
    await createOrLoadGame(false);

    setUpActions();
    setUpInventory();
    setUpStats();
    setUpLogs();
    renderViewport();
    hideMainMenu();
  });
}

export function setUpMainMenu() {
  init();
}
