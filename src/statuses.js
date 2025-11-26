import { logDanger } from "./gameState.js";

export const STATUS = {
  poison: "poison",
};

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
