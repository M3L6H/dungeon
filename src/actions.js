import {
  getActions,
  getSelectedAction,
  getSelectedIndex,
  getSelectedItem,
  INTERACT,
  NONE,
  setSelectedIndex,
  setSelectedItem,
  SETTINGS,
} from "./gameState.js";
import { hideInventory, showInventory } from "./inventory.js";
import { addLog } from "./logs.js";
import { showPauseMenu } from "./pauseMenu.js";
import { renderViewport } from "./viewport.js";

const actionsElt = document.getElementById("actions");

export function renderActions() {
  getActions().forEach((action, i) => {
    const actionElt = actionsElt.children[i];
    actionElt.dataset.action = action;

    if (action !== INTERACT) {
      actionElt.querySelector(".se").classList.add("hidden");
    } else if (getSelectedItem(i)) {
      const badge = actionElt.querySelector(".se");
      badge.style.backgroundImage = getSelectedItem(i).sprite;
      badge.classList.remove("hidden");
    } else {
      const badge = actionElt.querySelector(".se");
      badge.classList.add("hidden");
    }

    if (i === getSelectedIndex()) {
      actionElt.classList.add("selected");
    } else {
      actionElt.classList.remove("selected");
    }
  });
}

function createAction(index) {
  const actionElt = document.createElement("div");
  actionElt.classList.add("action");
  actionElt.classList.add("material-symbols-outlined");
  const se = document.createElement("span");
  se.classList.add("se", "no-highlight", "hidden");
  actionElt.appendChild(se);
  actionElt.addEventListener("click", () => {
    const action = actionElt.dataset.action;
    if (action === NONE) return;
    if (action === SETTINGS) {
      showPauseMenu();
      return;
    }
    if (
      action === INTERACT &&
      (!getSelectedItem(index) || getSelectedIndex() === index)
    ) {
      showInventory((selectedItem) => {
        setSelectedItem(selectedItem);
        hideInventory();
        addLog(`Selected ${getSelectedItem().name} for interaction.`, false);
        renderViewport();
      }, true);
    }
    if (getSelectedIndex() === index) return;
    setSelectedIndex(index);
    renderActions();
    renderViewport();
    addLog(`Changed selected action to '${action}'`, false);
  });
  return actionElt;
}

export function setUpActions() {
  getActions().forEach((_, idx) => actionsElt.appendChild(createAction(idx)));
  renderActions();
}
