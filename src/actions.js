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
  actionElt.addEventListener("click", () => {
    const action = actionElt.dataset.action;
    if (action === NONE) return;
    if (action === INTERACT) {
      showInventory((selectedItem) => {
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
