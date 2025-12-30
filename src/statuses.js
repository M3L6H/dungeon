import { logDanger, logSafe } from "./gameState.js";

export const STATUS = {
  healing: "healing",
  poison: "poison",
};

const healingMinorEffect = 2;
export const healingMinor = (id) => ({
  id,
  type: STATUS.healing,
  freq: 4,
  count: 5,
  effect: async (entity) => {
    entity.health += healingMinorEffect;
    await logSafe(
      entity,
      `${entity.displayName} recovers ${healingMinorEffect} health from ${STATUS.healing}.`,
    );
  },
});

const healingImprovedEffect = healingMinorEffect * 2;
export const healingImproved = (id) => ({
  id,
  type: STATUS.healing,
  freq: 4,
  count: 5,
  effect: async (entity) => {
    entity.health += healingImprovedEffect;
    await logSafe(
      entity,
      `${entity.displayName} recovers ${healingImprovedEffect} health from ${STATUS.healing}.`,
    );
  },
});

const healingMajorEffect = healingImprovedEffect * 2;
export const healingMajor = (id) => ({
  id,
  type: STATUS.healing,
  freq: 4,
  count: 5,
  effect: async (entity) => {
    entity.health += healingMajorEffect;
    await logSafe(
      entity,
      `${entity.displayName} recovers ${healingMajorEffect} health from ${STATUS.healing}.`,
    );
  },
});

const poisonWeakEffect = 1;
export const poisonWeak = (id) => ({
  id,
  type: STATUS.poison,
  freq: 4,
  count: 5,
  effect: async (entity) => {
    await logDanger(
      entity,
      `${entity.displayName} loses ${poisonWeakEffect} health & stamina from ${STATUS.poison}.`,
    );
    entity.health -= poisonWeakEffect;
    entity.stamina -= poisonWeakEffect;
  },
});
