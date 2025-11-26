import { getPlayer } from "./gameState.js";

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
  if (points === null) {
    pr.classList.add("hidden");
  } else {
    pr.classList.remove("hidden");
    pr.textContent = `Points Remaining: ${points}`;
  }

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
      const pip = pips[i];
      if (j <= stats[i]) {
        pip.classList.add("filled");
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

function init() {
  const { agility, constitution, endurance, intelligence, strength, wisdom } =
    getPlayer();
  const stats = [
    agility,
    constitution,
    endurance,
    intelligence,
    strength,
    wisdom,
  ];

  statsElt.querySelectorAll(".stat-bar").forEach((sb, i) => {
    const minus = document.createElement("button");
    minus.classList.add("material-symbols-outlined", "pip", "minus");
    minus.disabled = true;
    sb.appendChild(minus);
    for (let j = 1; j <= 25; ++j) {
      const pip = document.createElement("span");
      pip.classList.add("pip");
      if (j <= stats[i]) pip.classList.add("filled");
      sb.appendChild(pip);
    }
    const plus = document.createElement("button");
    plus.classList.add("material-symbols-outlined", "pip", "plus");
    sb.appendChild(plus);
  });
}

export function setUpStats() {
  init();
}
