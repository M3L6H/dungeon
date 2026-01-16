import { renderActions } from "./actions.js";
import { setUpEquipment } from "./equipment.js";
import { createOrLoadGame, loadEntities } from "./gameState.js";
import { setUpInventory } from "./inventory.js";
import { setUpLogs } from "./logs.js";
import { showNewGame } from "./newGame.js";
import { showSettingsMenu } from "./settingsMenu.js";
import { getVersion, isVersionCompatible, VERSION } from "./version.js";
import { renderViewport } from "./viewport.js";

const mainMenuElt = document.getElementById("main-menu");
const newGameBtn = document.getElementById("main-menu-new-game");
const continueBtn = document.getElementById("main-menu-continue");
const settingsBtn = document.getElementById("main-menu-settings");
const wikiBtn = document.getElementById("main-menu-wiki");

export function showMainMenu() {
  mainMenuElt.classList.remove("hidden");
  continueBtn.disabled = !isVersionCompatible() || !hasSavedGame();
}

function hideMainMenu() {
  mainMenuElt.classList.add("hidden");
}

function hasSavedGame() {
  return loadEntities();
}

function init() {
  newGameBtn.addEventListener("click", async () => {
    if (
      !hasSavedGame() ||
      (isVersionCompatible() &&
        confirm("This will overwrite your saved game. Are you sure?")) ||
      (!isVersionCompatible() &&
        confirm(
          `You have an old save game from ${getVersion()} that is not compatible with ${VERSION}. This will overwrite it. Are you sure?`,
        ))
    ) {
      hideMainMenu();
      showNewGame();
    }
  });

  continueBtn.addEventListener("click", async () => {
    await createOrLoadGame(false);

    setUpEquipment();
    setUpInventory();
    setUpLogs();
    renderActions();
    renderViewport();
    hideMainMenu();
  });

  settingsBtn.addEventListener("click", () => {
    showSettingsMenu();
  });

  showMainMenu();
}

export function setUpMainMenu() {
  init();
}
