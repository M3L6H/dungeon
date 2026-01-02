import { getPlayer, logSafe, saveAll } from "./gameState.js";
import { renderViewport } from "./viewport.js";

const statsElt = document.getElementById("level-up");

export function showStats(
  entity,
  showButtons = false,
  points = null,
  bonus = [0, 0, 0, 0, 0, 0],
) {
  const { agility, constitution, endurance, intelligence, strength, wisdom } =
    entity;
  const stats = [
    agility,
    constitution,
    endurance,
    intelligence,
    strength,
    wisdom,
  ];

  const pr = statsElt.querySelector("#points-remaining");
  const cb = statsElt.querySelector(".close-button");
  const title = statsElt.querySelector(".title");
  if (points === null) {
    pr.classList.add("hidden");
    cb.classList.remove("hidden");
    title.textContent = `Stats (Lvl. ${entity.level})`;
  } else {
    pr.classList.remove("hidden");
    pr.textContent = `Points Remaining: ${points}`;
    cb.classList.add("hidden");
    title.textContent = points > 0 ? "Level Up" : "Confirm?";
  }

  const submit = statsElt.querySelector(".submit");
  if (showButtons) {
    submit.classList.remove("hidden");
  } else {
    submit.classList.add("hidden");
  }
  submit.disabled = points !== 0;
  submit.onclick = () => {
    [
      "agility",
      "constitution",
      "endurance",
      "intelligence",
      "strength",
      "wisdom",
    ].forEach((k, i) => {
      entity[k] += bonus[i];
    });
    ++entity.level;
    entity.health = entity.maxHealth;
    entity.mana = entity.maxMana;
    entity.stamina = entity.maxStamina;
    entity.statuses = [];
    showStats(entity);
    logSafe(
      entity,
      `${entity.displayName} leveled up to level ${entity.level}. Health, Mana, and Stamina restored. Statuses cleared.`,
      false,
    );
    saveAll();
    renderViewport();
  };

  statsElt.querySelectorAll(".stat-bar").forEach((sb, i) => {
    const minus = sb.querySelector(".minus");
    if (showButtons) {
      minus.classList.remove("hidden");
    } else {
      minus.classList.add("hidden");
    }
    minus.disabled = bonus[i] === 0;
    minus.onclick = () => {
      --bonus[i];
      ++points;
      showStats(entity, showButtons, points, bonus);
    };
    const pips = sb.children;
    for (let j = 1; j <= 25; ++j) {
      const pip = pips[j];
      if (j <= stats[i]) {
        pip.classList.add("filled");
        pip.classList.remove("bonus");
      } else if (j <= stats[i] + bonus[i]) {
        pip.classList.add("bonus");
      } else {
        pip.classList.remove("bonus", "filled");
      }
    }
    const plus = sb.querySelector(".plus");
    if (showButtons) {
      plus.classList.remove("hidden");
    } else {
      plus.classList.add("hidden");
    }
    plus.disabled = stats[i] === 25 || points === 0;
    plus.onclick = () => {
      ++bonus[i];
      --points;
      showStats(entity, showButtons, points, bonus);
    };
  });
  statsElt.classList.remove("hidden");
}

function hideStats() {
  statsElt.classList.add("hidden");
}

function init() {
  statsElt.querySelectorAll(".stat-bar").forEach((sb, i) => {
    const minus = document.createElement("button");
    minus.classList.add("material-symbols-outlined", "pip", "minus");
    minus.disabled = true;
    sb.appendChild(minus);
    for (let j = 1; j <= 25; ++j) {
      const pip = document.createElement("span");
      pip.classList.add("pip");
      sb.appendChild(pip);
    }
    const plus = document.createElement("button");
    plus.classList.add("material-symbols-outlined", "pip", "plus");
    sb.appendChild(plus);
  });
  statsElt.querySelector(".close-button")?.addEventListener("click", () => {
    hideStats();
  });
}

export function setUpStats() {
  init();
}
