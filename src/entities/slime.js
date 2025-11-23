import { STATUS } from "../statuses.js";
import {
  findTarget,
  hunt,
  basicPoisonTouch,
  rest,
  simpleAttack,
  wander,
} from "./behaviors.js";
import { Entity, startEntity } from "./entity.js";

/**
 * Creates a small blue slime.
 * @returns {Entity} A small blue slime entity
 */
export function createBlueSlimeSmall(w, h, x, y) {
  return startEntity(
    new Entity({
      displayName: "Slime",
      name: "blue-slime",
      variant: "small",
      description: {
        0: (self) =>
          `The ${self.displayName} is semi-translucent. Its gelatinous body wobbles as it moves around.`,
        3: (self) => `The ${self.displayName} does physical damage.`,
        5: () =>
          `Slimes have the ability to merge with each other. Each time they do so, they become stronger.`,
      },
      w,
      h,
      strength: 2,
      constitution: 2,
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

/**
 * Creates a small green slime.
 * @returns {Entity} A small green slime entity
 */
export function createGreenSlimeSmall(w, h, x, y) {
  return startEntity(
    new Entity({
      displayName: "Poison Slime",
      name: "green-slime",
      variant: "small",
      description: {
        0: (self) =>
          `The ${self.displayName} is semi-translucent. Its gelatinous body wobbles as it moves around.`,
        3: (self) => `The ${self.displayName} is slightly poisonous.`,
        5: () =>
          `Slimes have the ability to merge with each other. Each time they do so, they become stronger.`,
      },
      w,
      h,
      wisdom: 3,
      constitution: 2,
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
