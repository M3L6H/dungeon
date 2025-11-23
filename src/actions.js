import {
  getActions,
  getSelectedAction,
  getSelectedIndex,
  getSelectedItem,
  INTERACT,
  NONE,
  setSelectedIndex,
  setSelectedItem,
} from "./gameState.js";
import { hideInventory, showInventory } from "./inventory.js";
import { addLog } from "./logs.js";
import { renderViewport } from "./viewport.js";

const actionsElt = document.getElementById("actions");

export function renderActions() {
  getActions().forEach((action, i) => {
    const actionElt = actionsElt.children[i];
    actionElt.dataset.action = action;

    if (action !== INTERACT) {
      actionElt.querySelector(".se").classList.add("hidden");
    } else if (getSelectedItem()) {
      const badge = actionElt.querySelector(".se");
      badge.style.backgroundImage = getSelectedItem().sprite;
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
    if (
      action === INTERACT &&
      (!getSelectedItem() || getSelectedAction() === action)
    ) {
      showInventory((selectedItem) => {
        setSelectedItem(selectedItem);
        hideInventory();
        addLog(`Selected ${getSelectedItem().name} for interaction.`);
        renderViewport();
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
