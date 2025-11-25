import { getPlayer } from "./gameState.js";

const statsElt = document.getElementById("level-up");

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
    pip.classList.add("pip", "minus");
    minus.disabled = true;
    sb.appendChild(minus);
    for (let j = 1; j <= 25; ++j) {
      const pip = document.createElement("span");
      pip.classList.add("pip");
      if (j <= stats[i]) pip.classList.add("filled");
      sb.appendChild(pip);
    }
    const plus = document.createElement("button");
    pip.classList.add("pip", "plus");
    sb.appendChild(plus);
  });
}

export function setUpStats() {
  init();
}
