import { showMainMenu } from "./mainMenu.js";
import { showSettingsMenu } from "./settingsMenu.js";

const pauseMenuElt = document.getElementById("pause-menu");
const resumeButton = document.getElementById("pause-menu-resume");
const mainMenuButton = document.getElementById("pause-menu-main-menu");
const settingsBtn = document.getElementById("pause-menu-settings");
const wikiBtn = document.getElementById("pause-menu-wiki");

export function showPauseMenu() {
  pauseMenuElt.classList.remove("hidden");
}

function hidePauseMenu() {
  pauseMenuElt.classList.add("hidden");
}

function init() {
  resumeButton.addEventListener("click", () => {
    hidePauseMenu();
  });

  mainMenuButton.addEventListener("click", () => {
    showMainMenu();
    hidePauseMenu();
  });

  settingsBtn.addEventListener("click", () => {
    showSettingsMenu();
  });
}

export function setUpPauseMenu() {
  init();
}
