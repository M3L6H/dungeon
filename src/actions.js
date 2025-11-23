import {
  getActions,
  getSelectedAction,
  getSelectedIndex,
  INTERACT,
  NONE,
  setSelectedIndex,
} from "./gameState.js";
import { showInventory } from "./inventory.js";
import { addLog } from "./logs.js";
import { renderViewport } from "./viewport.js";

const actionsElt = document.getElementById("actions");

function renderActions() {
  getActions().forEach((action, i) => {
    const actionElt = actionsElt.children[i];
    actionElt.dataset.action = action;
    
    if (action !== INTERACT) {
      delete actionElt.dataset.mode;
      actionElt.querySelector(".se").classList.add("hidden");
    }

    if (i === getSelectedIndex()) {
      actionElt.classList.add("selected");
    } else {
      actionElt.classList.remove("selected");
    }
  });
}

function createAction() {
  const actionElt = document.createElement("div");
  actionElt.classList.add("action");
  actionElt.classList.add("material-symbols-outlined");
  const se = document.createElement("span");
  se.classList.add("se", "no-highlight", "hidden");
  actionElt.appendChild(se);
  actionElt.addEventListener("click", () => {
    const action = actionElt.dataset.action;
    if (action === NONE) return;
    if (action === INTERACT && (!actionElt.dataset.mode || getSelectedAction() === action)) {
      showInventory((selectedItem) => {
        actionElt.dataset.mode = selectedItem;
        const badge = actionElt.querySelector(".se");
        badge.style.backgroundImage = `url("images/${selectedItem}.png")`;
        badge.classList.remove("hidden");
        addLog(`Selected ${selectedItem} for interaction.`);
      }, true);
    }
    if (getSelectedAction() === action) return;
    setSelectedIndex(getActions().indexOf(action));
    renderActions();
    renderViewport();
    addLog(`Changed selected action to '${action}'`);
  });
  return actionElt;
}

export function setUpActions() {
  getActions().forEach(() => actionsElt.appendChild(createAction()));
  renderActions();
}
