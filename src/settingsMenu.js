import { getSettings, loadSettings, saveSettings } from "./gameState.js";

const settingsMenuElt = document.getElementById("settings-menu");
const gameSpeedElt = document.getElementById("game-speed");
const backButton = document.getElementById("settings-menu-back");

export function showSettingsMenu() {
  settingsMenuElt.classList.remove("hidden");

  renderGameSpeed();
}

function hideSettingsMenu() {
  settingsMenuElt.classList.add("hidden");
}

function renderGameSpeed() {
  const minus = gameSpeedElt.querySelector(".slow");
  const gameSpeedIndex = 5 - (getSettings()?.gameSpeed ?? 250) / 50;
  minus.disabled = gameSpeedIndex === 0;
  minus.onclick = () => {
    setGameSpeed(gameSpeedIndex - 1);
    renderGameSpeed();
  };
  const pips = gameSpeedElt.children;
  for (let i = 0; i < 5; ++i) {
    const pip = pips[i + 1];
    if (i <= gameSpeedIndex) {
      pip.classList.add("filled");
    } else {
      pip.classList.remove("filled");
    }
  }
  const plus = gameSpeedElt.querySelector(".fast");
  plus.disabled = gameSpeedIndex === 4;
  plus.onclick = () => {
    setGameSpeed(gameSpeedIndex + 1);
    renderGameSpeed();
  };
}

function setGameSpeed(gameSpeedIndex) {
  getSettings().gameSpeed = (5 - gameSpeedIndex) * 50;
  saveSettings();
}

function setUpGameSpeed() {
  const minus = document.createElement("button");
  minus.classList.add("material-symbols-outlined", "pip", "slow");
  minus.disabled = true;
  gameSpeedElt.appendChild(minus);
  for (let j = 1; j <= 5; ++j) {
    const pip = document.createElement("span");
    pip.classList.add("pip");
    gameSpeedElt.appendChild(pip);
  }
  const plus = document.createElement("button");
  plus.classList.add("material-symbols-outlined", "pip", "fast");
  gameSpeedElt.appendChild(plus);
}

export function setUpSettingsMenu() {
  loadSettings();

  backButton.addEventListener("click", () => {
    hideSettingsMenu();
  });

  setUpGameSpeed();
}
