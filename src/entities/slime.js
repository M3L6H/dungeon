import { registerFn } from "../functions.js";
import { getMap } from "../gameState.js";
import { gold, goldPile } from "../items/gold.js";
import { healthPotionMinor } from "../items/healthPotion.js";
import { STATUS } from "../statuses.js";
import {
  findTarget,
  hunt,
  basicPoisonTouchTemplate,
  rest,
  simpleAttack,
  wander,
} from "./behaviors.js";
import {
  setBaseXp,
  setDescription,
  setDifficultyForEntityCreator,
  setDropTable,
  setLevelStrategy,
} from "./data.js";
import { Entity, startEntity } from "./entity.js";

const NAMESPACE = "slime";

const basicPoisonTouch = registerFn(NAMESPACE, "basicPoisonTouch", (entity) =>
  basicPoisonTouchTemplate(entity),
);

const blueSlimeName = "blue-slime";
const smallVariant = "small";
/**
 * Creates a small blue slime.
 * @returns {Entity} A small blue slime entity
 */
export async function createBlueSlimeSmall(x, y) {
  const { w, h } = getMap();
  return await startEntity(
    new Entity({
      displayName: "Slime",
      name: blueSlimeName,
      variant: smallVariant,
      w,
      h,
      strength: 2,
      attackDelayMod: 1,
      speedMod: -1,
      behaviors: [simpleAttack, findTarget, hunt, wander, rest],
      immunities: [STATUS.poison],
      tSet: ["player", "rat"],
      additionalProps: {
        hands: false,
      },
    }),
    x,
    y,
  );
}
setDifficultyForEntityCreator(1, createBlueSlimeSmall);
setBaseXp(blueSlimeName, 2);
setLevelStrategy(blueSlimeName, [0, 0.3, 0.3, 0, 0.4, 0]);
setDropTable(blueSlimeName, {
  0.3: (entity) => ({
    itemId: goldPile.id,
    additionalProps: {
      count: Math.floor(Math.random() * entity.level * 5),
      pickup: gold,
    },
  }),
});
setDescription(blueSlimeName, smallVariant, {
  0: (self) =>
    `${self.displayName} is semi-translucent. Its gelatinous body wobbles as it moves around.`,
  3: (self) => `${self.displayName} does physical damage.`,
});

const greenSlimeName = "green-slime";
/**
 * Creates a small green slime.
 * @returns {Entity} A small green slime entity
 */
export async function createGreenSlimeSmall(x, y) {
  const { w, h } = getMap();
  return await startEntity(
    new Entity({
      displayName: "Poison Slime",
      name: greenSlimeName,
      variant: smallVariant,
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
      immunities: [STATUS.poison],
      tSet: ["player", "rat"],
      additionalProps: {
        hands: false,
      },
    }),
    x,
    y,
  );
}
setDifficultyForEntityCreator(3, createGreenSlimeSmall);
setBaseXp(greenSlimeName, 3);
setLevelStrategy(greenSlimeName, [0, 0.2, 0.2, 0.3, 0, 0.3]);
setDropTable(greenSlimeName, {
  0.2: () => ({ itemId: healthPotionMinor.id }),
  0.2: (entity) => ({
    itemId: goldPile.id,
    additionalProps: {
      count: Math.floor(Math.random() * entity.level * 5),
      pickup: gold,
    },
  }),
});
setDescription(greenSlimeName, smallVariant, {
  0: (self) =>
    `${self.displayName} is tinged a venomous green. Its gelatinous body wobbles as it moves around.`,
  3: (self) => `${self.displayName} is slightly poisonous.`,
});
