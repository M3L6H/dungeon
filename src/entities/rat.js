import { getMap } from "../gameState.js";
import { explore, flee, rest, wander } from "./behaviors.js";
import { Entity, startEntity } from "./entity.js";

/**
 * Creates a rat.
 * @returns {Entity} A rat entity
 */
export function createRat(x, y, props) {
  const { w, h } = getMap();
  return startEntity(
    new Entity({
      displayName: "Rat",
      name: "rat",
      description: {
        0: (self) =>
          `The ${self.displayName} is small and whiskered. It sniffs the air nervously.`,
        3: (self) => `The ${self.displayName} does physical damage.`,
        5: () => `Rats are notorious thieves, but they are also very cowardly.`,
      },
      w,
      h,
      agility: 4,
      speedMod: 5,
      behaviors: [explore, flee, wander, rest],
      additionalProps: {
        hands: false,
      },
      ...props,
    }),
    x,
    y,
  );
}

export function resetRat(rat, props) {
  rat.controlling = true;
  rat.dir = props.dir ?? Math.floor(Math.random() * 4);

  rat.level = 1;
  rat.xp = 0;

  rat.agility = 4;
  rat.constitution = 1;
  rat.endurance = 1;
  rat.intelligence = 1;
  rat.strength = 1;
  rat.wisdom = 1;

  rat.attackRange = 1;
  rat.attackDelayMod = 0;
  rat.accuracyMod = 0;
  rat.damageMod = 0;
  rat.defenseMod = 0;
  rat.dodgeMod = 0;
  rat.speedMod = 5;

  rat._health = rat.maxHealth;
  rat.mana = rat.maxMana;
  rat._stamina = rat.maxStamina;
  
  rat.memory = {};
  rat.entityMemory = {};
  rat.tileEntityMemory = {};

  rat.dead = false;
  rat.idToLoc = {};
  rat.inventory = {};
  rat.statuses = [];
  rat.targetId = null;
  rat.tSet = props.tSet ?? new Set(["player"]);
  for (const k in props.additionalProps ?? {}) {
    rat[k] = props.additionalProps[k];
  }
}
