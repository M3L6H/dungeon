import { showEquipment } from "./equipment.js";
import {
  EQUIPMENT,
  getActions,
  getPlayer,
  getSelectedIndex,
  getSelectedItem,
  getSelectedSkill,
  INTERACT,
  NONE,
  setSelectedIndex,
  setSelectedItem,
  setSelectedSkill,
  SETTINGS,
  SKILL,
} from "./gameState.js";
import { hideInventory, showInventory } from "./inventory.js";
import { addLog } from "./logs.js";
import { showPauseMenu } from "./pauseMenu.js";
import { hideSkills, showSkills } from "./skills.js";
import { renderViewport } from "./viewport.js";

const actionsElt = document.getElementById("actions");

export function renderActions() {
  getActions().forEach((action, i) => {
    const actionElt = actionsElt.children[i];
    actionElt.dataset.action = action;
    const badge = actionElt.querySelector(".se");

    if (action !== INTERACT && action !== SKILL) {
      actionElt.style.backgroundImage = "none";
      badge.classList.add("hidden");
    } else if (getSelectedItem(i)) {
      actionElt.style.backgroundImage = getSelectedItem(i).sprite;
      actionElt.classList.add("hide-icon");
      const count = getPlayer().inventory[getSelectedItem(i).id];
      badge.textContent = count > 1 ? count : "";

      if (count > 1) {
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    } else if (getSelectedSkill(i)) {
      actionElt.style.backgroundImage = getSelectedSkill(i).sprite;
      actionElt.classList.add("hide-icon");
    } else {
      actionElt.style.backgroundImage = "none";
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
    if (action === EQUIPMENT) {
      showEquipment();
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
    } else if (
      action === SKILL &&
      (!getSelectedSkill(index) || getSelectedIndex() === index)
    ) {
      showSkills((selectedSkill) => {
        setSelectedSkill(selectedSkill);
        hideSkills();
        addLog(`Selected ${getSelectedSkill().name} for skill.`, false);
        renderViewport();
      });
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
