import { logDanger, logSafe } from "./gameState.js";

export const STATUS = {
  healing: "healing",
  poison: "poison",
};

export const healingMinor = (id) => ({
  id,
  type: STATUS.healing,
  freq: 4,
  count: 5,
  effect: (entity) => {
    entity.health += 2;
    logSafe(
      entity,
      `${entity.displayName} recovers 2 health from ${STATUS.healing}.`,
    );
  },
});

export const healingImproved = (id) => ({
  id,
  type: STATUS.healing,
  freq: 4,
  count: 5,
  effect: (entity) => {
    entity.health += 4;
    logSafe(
      entity,
      `${entity.displayName} recovers 4 health from ${STATUS.healing}.`,
    );
  },
});

export const healingMajor = (id) => ({
  id,
  type: STATUS.healing,
  freq: 4,
  count: 5,
  effect: (entity) => {
    entity.health += 8;
    logSafe(
      entity,
      `${entity.displayName} recovers 8 health from ${STATUS.healing}.`,
    );
  },
});

export const poisonWeak = (id) => ({
  id,
  type: STATUS.poison,
  freq: 4,
  count: 5,
  effect: (entity) => {
    entity.health -= 1;
    logDanger(
      entity,
      `${entity.displayName} takes 1 damage from ${STATUS.poison}.`,
    );
  },
});
