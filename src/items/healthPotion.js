import { logActionEnd } from "../gameState.js";
import { healingMinor, healingImproved, healingMajor } from "../statuses.js";
import { Item } from "./item.js";

const description = {
  0: (self) => `The ${self.displayName} is a bottle of rich, red fluid.`,
  3: (self) => `The ${self.displayName} restores ${self.item.health} health.`,
};

const onInteract = (item, entity, other) => {
  if (entity.id !== other.id) return false;
  other.addStatus(item.status(entity.id));
  logActionEnd(entity, `used ${item.name}`);
};

export const healthPotionMinor = new Item({
  id: "health-potion-minor",
  name: "Minor Health Potion",
  description,
  sprite: "health-potion-minor",
  additionalProps: {
    health: 10,
    isHealthPotion: true,
    status: healingMinor,
  },
  onInteract,
});

export const healthPotionImproved = new Item({
  id: "health-potion-improved",
  name: "Improved Health Potion",
  sprite: "health-potion-improved",
  additionalProps: {
    health: 20,
    isHealthPotion: true,
    status: healingImproved,
  },
  onInteract,
});

export const healthPotionMajor = new Item({
  id: "health-potion-major",
  name: "Major Health Potion",
  sprite: "health-potion-major",
  additionalProps: {
    health: 40,
    isHealthPotion: true,
    status: healingMajor,
  },
  onInteract,
});
