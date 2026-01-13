import { registerFn } from "./functions.js";
import { logDanger, logSafe } from "./gameState.js";

export const STATUS = {
  healing: "healing",
  poison: "poison",
};

const NAMESPACE = "status";

const healingMinorPotency = 2;
const healingMinorEffect = registerFn(
  NAMESPACE,
  "healingMinor",
  async (entity) => {
    entity.health += healingMinorPotency;
    await logSafe(
      entity,
      `${entity.displayName} recovers ${healingMinorPotency} health from ${STATUS.healing}.`,
    );
  },
);
export const healingMinor = (id) => ({
  id,
  type: STATUS.healing,
  freq: 4,
  count: 5,
  effect: healingMinorEffect,
});

const healingImprovedPotency = healingMinorPotency * 2;
const healingImprovedEffect = registerFn(
  NAMESPACE,
  "healingImproved",
  async (entity) => {
    entity.health += healingImprovedPotency;
    await logSafe(
      entity,
      `${entity.displayName} recovers ${healingImprovedPotency} health from ${STATUS.healing}.`,
    );
  },
);
export const healingImproved = (id) => ({
  id,
  type: STATUS.healing,
  freq: 4,
  count: 5,
  effect: healingImprovedEffect,
});

const healingMajorPotency = healingImprovedPotency * 2;
const healingMajorEffect = registerFn(
  NAMESPACE,
  "healingMajor",
  async (entity) => {
    entity.health += healingMajorPotency;
    await logSafe(
      entity,
      `${entity.displayName} recovers ${healingMajorPotency} health from ${STATUS.healing}.`,
    );
  },
);
export const healingMajor = (id) => ({
  id,
  type: STATUS.healing,
  freq: 4,
  count: 5,
  effect: healingMajorEffect,
});

const poisonWeakPotency = 1;
const poisonWeakEffect = registerFn(NAMESPACE, "poisonWeak", async (entity) => {
  const damageDealt = await entity.calcDamage(
    { pure: poisonWeakPotency },
    STATUS.poison,
  );
  if (damageDealt > 0) {
    await logDanger(
      entity,
      `${entity.displayName} loses ${damageDealt} health and ${poisonWeakPotency} stamina from ${STATUS.poison}`,
    );
  } else {
    await logDanger(
      entity,
      `${entity.displayName} loses ${poisonWeakPotency} stamina from ${STATUS.poison}`,
    );
  }
  entity.health -= damageDealt;
  entity.stamina -= poisonWeakPotency;
});
export const poisonWeak = (id) => ({
  id,
  type: STATUS.poison,
  freq: 4,
  count: 5,
  effect: poisonWeakEffect,
});
