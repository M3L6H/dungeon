import {
  getMap,
  logCombatDanger,
  logCombatWarn,
  logSafe,
  roll,
} from "./gameState.js";
import { poisonWeak } from "./statuses.js";

export const pickup = (entity, tX, tY, pickupItem, count) => {
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
      other.inventory[pickupItem.id] =
        (other.inventory[pickupItem.id] ?? 0) + count;
      await logSafe(
        other,
        `${other.displayName} has picked up ${entity.displayName}.`,
      );
    },
  };
};

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
    name: "Poison Touch",
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
      if (attack <= dodge) {
        await logCombatWarn(
          entity,
          other,
          `${other.displayName} dodged (${dodge}) a skill (${attack}) from ${entity.displayName}.`,
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
