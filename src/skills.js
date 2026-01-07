import {
  getMap,
  getPlayer,
  logCombatDanger,
  logCombatWarn,
  logSafe,
  roll,
} from "./gameState.js";
import { poisonWeak } from "./statuses.js";

export const idToSkill = {};

function registerSkill(id, skill) {
  skill.id = id;
  idToSkill[id] = skill;
}

export const pickup = (entity, tX, tY) => {
  const filter = (other) => other.picksItems;
  return {
    x: tX,
    y: tY,
    name: "Pick Up",
    manaCost: 0,
    staminaCost: 0,
    timeTaken: 1,
    filter,
    inRange: () => {
      const entities = getMap().getEntities(tX, tY).filter(filter);
      return tX === entity.x && tY === entity.y && entities.length > 0;
    },
    skill: async (other) => {
      if (entity.dead) return;
      entity.dead = true;
      await entity.onPickup(other);
    },
  };
};

const poisonTouchName = "Poison Touch";
export const poisonTouch = (entity, tX, tY) => {
  const dx = Math.abs(tX - entity.x);
  const dy = Math.abs(tY - entity.y);
  const filter = (other) =>
    other.id !== entity.id && other.name !== entity.name;
  const manaCost = Math.max(1, 5 - Math.floor(Math.sqrt(entity.wisdom)));
  const staminaCost = 1;
  return {
    x: tX,
    y: tY,
    name: poisonTouchName,
    manaCost,
    staminaCost,
    timeTaken: 3,
    filter,
    inRange: () => {
      const entities = getMap().getEntities(tX, tY).filter(filter);
      return (
        dx + dy <= 1 &&
        entity.stamina >= staminaCost &&
        entities.length > 0 &&
        entity.mana >= manaCost
      );
    },
    skill: async (other) => {
      const attack = roll(entity.accuracy);
      const dodge = roll(other.dodge);
      if (attack < dodge) {
        await logCombatWarn(
          entity,
          other,
          `${other.displayName} dodged (${dodge}) ${poisonTouchName} (${attack}) from ${entity.displayName}.`,
        );
        return;
      }
      const success = await other.addStatus(poisonWeak(entity.id));
      if (success) {
        await logCombatDanger(
          entity,
          other,
          `${entity.displayName} has poisoned ${other.displayName}.`,
        );
      }
    },
  };
};
export const poisonTouchSkill = {
  name: poisonTouchName,
  skill: poisonTouch,
  sprite: 'url("images/skill-book-poison-touch.png")',
};
registerSkill("poisonTouchSkill", poisonTouchSkill);

const skillsElt = document.getElementById("skills");
let contentsElt;

export function hideSkills() {
  skillsElt.classList.add("hidden");
}

export function showSkills(onSelect) {
  skillsElt.classList.remove("hidden");

  const { skills } = getPlayer();
  let i = 0;

  for (const skill in skills) {
    createOrUpdateSkillItem(i, idToSkill[skill]);
    ++i;
  }

  for (; i < contentsElt.children.length; ++i) {
    contentsElt.children[i].classList.add("hidden");
  }

  contentsElt.querySelectorAll(".inventory-button").forEach((btn) => {
    btn.onclick = () => onSelect(btn.dataset.skill);
  });
}

export function setUpSkills() {
  skillsElt.querySelector(".close-button").onclick = () => {
    hideSkills();
  };
  contentsElt = skillsElt.querySelector(".contents");
}

function createSkillItem() {
  const skillItemElt = document.createElement("span");
  skillItemElt.classList.add("inventory-button");
  return skillItemElt;
}

function createOrUpdateSkillItem(i, { id, sprite }) {
  let skillItemElt;

  if (i >= contentsElt.children.length) {
    skillItemElt = createSkillItem();
    contentsElt.appendChild(skillItemElt);
  } else {
    skillItemElt = contentsElt.children[i];
  }

  skillItemElt.classList.remove("hidden");
  skillItemElt.style.backgroundImage = sprite;
  skillItemElt.dataset.skill = id;
}
