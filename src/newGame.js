import { renderActions } from "./actions.js";
import { setUpEquipment } from "./equipment.js";
import { createOrLoadGame, getPlayer } from "./gameState.js";
import { setUpInventory } from "./inventory.js";
import { setUpLogs } from "./logs.js";
import { showStats } from "./stats.js";
import { renderViewport } from "./viewport.js";

const newGameElt = document.getElementById("new-game");
const newGameForm = newGameElt.querySelector("form");
const playerPreviewImg = document.getElementById("player-preview");
const playerNameElt = document.getElementById("player-name");
const playerMaleElt = document.getElementById("male");
const playerFemaleElt = document.getElementById("female");
const playerBackground = document.getElementById("player-background");
const playerClass = document.getElementById("player-class");
const submitButton = newGameForm.querySelector(".submit");

let displayName = "";
let variant = "male";

function hideNewGame() {
  newGameElt.classList.add("hidden");
}

export function showNewGame() {
  newGameElt.classList.remove("hidden");
}

function init() {
  newGameForm.addEventListener("submit", (e) => {
    e.preventDefault();
  });
  playerNameElt.addEventListener("change", () => {
    displayName = playerNameElt.value;
    submitButton.disabled = displayName.length === 0;
  });
  playerMaleElt.addEventListener("click", () => {
    if (playerMaleElt.checked) {
      playerPreviewImg.src = "images/player-male-2.png";
      variant = "male";
    }
  });
  playerFemaleElt.addEventListener("click", () => {
    if (playerFemaleElt.checked) {
      playerPreviewImg.src = "images/player-female-2.png";
      variant = "female";
    }
  });
  submitButton.addEventListener("click", async () => {
    const props = {
      displayName,
      variant,
    };

    const background = playerBackground.value;

    if (background !== "nobody") {
      props[background] = 2;
    }

    const clazz = playerClass.value;

    await createOrLoadGame(true, {
      background,
      clazz,
      props,
    });

    setUpEquipment();
    setUpInventory();
    setUpLogs();
    renderActions();
    renderViewport();
    showStats(getPlayer(), true, 5);
    hideNewGame();
  });
}

export function setUpNewGame() {
  init();
}
