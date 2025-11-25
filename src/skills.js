import { getMap, logCombatDanger, logCombatWarn, roll } from "./gameState.js";
import { poisonWeak } from "./statuses.js";

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
    timeTaken: 2,
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
    skill: (other) => {
      const attack = roll(entity.accuracy);
      const dodge = roll(other.dodge);
      if (attack <= dodge) {
        logCombatWarn(
          entity,
          other,
          `${other.displayName} dodged (${dodge}) a skill (${attack}) from ${entity.displayName}.`,
        );
        return;
      }
      const success = other.addStatus(poisonWeak(entity.id));
      if (success) {
        logCombatDanger(
          entity,
          other,
          `${entity.displayName} has poisoned ${other.displayName}.`,
        );
      }
    },
  };
};
