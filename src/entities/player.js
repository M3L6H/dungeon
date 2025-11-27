import { getMap } from "../gameState.js";
import { healthPotionMinor } from "../items/healthPotion.js";
import { key } from "../items/key.js";
import { Entity, startEntity } from "./entity.js";

export function createPlayer() {
  const {
    w,
    h,
    start: { x, y },
  } = getMap();
  return startEntity(
    new Entity({
      name: "player",
      variant: "female",
      description: {
        0: (self) =>
          `You are a ${self.variant} elf. Your oddly colored hair is the only remarkable feature about you.`,
      },
      level: 0,
      w,
      h,
      inventory: {
        [key.id]: 2,
        [healthPotionMinor.id]: 1,
      },
      unique: true,
      additionalProps: {
        picksItems: true,
      },
      canInteract: (self, other, item) => {
        return item.isHealthPotion && self.health < self.maxHealth;
      },
    }),
    x,
    y,
  );
}
