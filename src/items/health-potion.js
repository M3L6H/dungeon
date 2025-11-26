import { Item } from "./item.js";

const description = {
  0: (self) => `The ${self.displayName} is a bottle of rich, red fluid.`,
  3: (self) => `The ${self.displayName} restores ${self.item.health} health.`,
};

export const healthPotionMinor = new Item({
  id: "health-potion-minor",
  name: "Minor Health Potion",
  description,
  sprite: "health-potion-minor",
  additionalProperties: {
    health: 10,
  },
});

export const healthPotionImproved = new Item({
  id: "health-potion-improved",
  name: "Improved Health Potion",
  sprite: "health-potion-improved",
  additionalProperties: {
    health: 20,
  },
});

export const healthPotionMajor = new Item({
  id: "health-potion-major",
  name: "Major Health Potion",
  sprite: "health-potion-major",
  additionalProperties: {
    health: 40,
  },
});
