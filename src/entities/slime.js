import { getMap } from "../gameState.js";
import { gold, goldPile } from "../items/gold.js";
import { healthPotionMinor } from "../items/healthPotion.js";
import { STATUS } from "../statuses.js";
import {
  findTarget,
  hunt,
  basicPoisonTouch,
  rest,
  simpleAttack,
  wander,
} from "./behaviors.js";
import {
  setBaseXp,
  setDifficultyForEntityCreator,
  setDropTable,
  setLevelStrategy,
} from "./data.js";
import { Entity, startEntity } from "./entity.js";

/**
 * Creates a small blue slime.
 * @returns {Entity} A small blue slime entity
 */
export async function createBlueSlimeSmall(x, y) {
  const { w, h } = getMap();
  return await startEntity(
    new Entity({
      displayName: "Slime",
      name: "blue-slime",
      variant: "small",
      description: {
        0: (self) =>
          `${self.displayName} is semi-translucent. Its gelatinous body wobbles as it moves around.`,
        3: (self) => `${self.displayName} does physical damage.`,
      },
      w,
      h,
      strength: 2,
      attackDelayMod: 1,
      speedMod: -1,
      behaviors: [simpleAttack, findTarget, hunt, wander, rest],
      immunities: new Set([STATUS.poison]),
      tSet: new Set(["player", "rat"]),
      additionalProps: {
        hands: false,
      },
    }),
    x,
    y,
  );
}
setDifficultyForEntityCreator(1, createBlueSlimeSmall);
setBaseXp("blue-slime", 2);
setLevelStrategy("blue-slime", [0, 0.3, 0.3, 0, 0.4, 0]);
setDropTable("blue-slime", {
  0.3: (entity) => ({
    itemId: goldPile.id,
    additionalProps: {
      count: Math.floor(Math.random() * entity.level * 5),
      pickup: gold,
    },
  }),
});

/**
 * Creates a small green slime.
 * @returns {Entity} A small green slime entity
 */
export async function createGreenSlimeSmall(x, y) {
  const { w, h } = getMap();
  return await startEntity(
    new Entity({
      displayName: "Poison Slime",
      name: "green-slime",
      variant: "small",
      description: {
        0: (self) =>
          `${self.displayName} is tinged a venomous green. Its gelatinous body wobbles as it moves around.`,
        3: (self) => `${self.displayName} is slightly poisonous.`,
      },
      w,
      h,
      wisdom: 3,
      attackDelayMod: 1,
      speedMod: -1,
      behaviors: [
        basicPoisonTouch,
        simpleAttack,
        findTarget,
        hunt,
        wander,
        rest,
      ],
      immunities: new Set([STATUS.poison]),
      tSet: new Set(["player", "rat"]),
      additionalProps: {
        hands: false,
      },
    }),
    x,
    y,
  );
}
setDifficultyForEntityCreator(3, createGreenSlimeSmall);
setBaseXp("green-slime", 3);
setLevelStrategy("green-slime", [0, 0.2, 0.2, 0.3, 0, 0.3]);
setDropTable("green-slime", {
  0.2: () => ({ itemId: healthPotionMinor.id }),
  0.2: (entity) => ({
    itemId: goldPile.id,
    additionalProps: {
      count: Math.floor(Math.random() * entity.level * 5),
      pickup: gold,
    },
  }),
});
