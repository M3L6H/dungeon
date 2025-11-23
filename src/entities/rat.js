import { explore, flee, rest, wander } from "./behaviors.js";
import { Entity, startEntity } from "./entity.js";

/**
 * Creates a rat.
 * @returns {Entity} A rat entity
 */
export function createRat(w, h, x, y) {
  return startEntity(
    new Entity({
      displayName: "Rat",
      name: "rat",
      description: {
        0: (self) =>
          `The ${self.displayName} is small and whiskered. It sniffs the air nervously.`,
        3: (self) => `The ${self.displayName} does physical damage.`,
        5: () => `Rats are notorious thieves, but they are also very cowardly.`,
      },
      w,
      h,
      agility: 4,
      speedMod: 5,
      behaviors: [explore, flee, wander, rest],
      additionalProps: {
        hands: false,
      },
    }),
    x,
    y,
  );
}
