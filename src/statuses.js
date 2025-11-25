import { logDanger } from "./gameState.js";

export const STATUS = {
  poison: "poison",
};

export const poisonWeak = (id) => ({
  id,
  type: STATUS.poison,
  freq: 4,
  count: 3,
  effect: (entity) => {
    entity.health -= 2;
    logDanger(
      entity,
      `${entity.displayName} takes 2 damage from ${STATUS.poison}.`,
    );
  },
});
