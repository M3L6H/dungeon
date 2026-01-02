import { registerFn } from "../functions.js";
import { getMap } from "../gameState.js";
import { healthPotionMinor } from "../items/healthPotion.js";
import { key } from "../items/key.js";
import { setDescription } from "./data.js";
import { Entity, startEntity } from "./entity.js";

const NAMESPACE = "player";

const name = "player";
const maleVariant = "male";
const femaleVariant = "female";
const canInteract = registerFn(NAMESPACE, "canInteract", (self, _, item) => {
  return item.isHealthPotion && self.health < self.maxHealth;
});
export async function createPlayer(background, props) {
  const {
    w,
    h,
    start: { x, y },
  } = getMap();
  return await startEntity(
    new Entity({
      name,
      level: 0,
      w,
      h,
      inventory:
        background === "nobody"
          ? {
              [key.id]: 2,
              [healthPotionMinor.id]: 1,
            }
          : {
              [healthPotionMinor.id]: 1,
            },
      unique: true,
      additionalProps: {
        background,
        picksItems: true,
      },
      canInteract,
      ...props,
    }),
    x,
    y,
  );
}
setDescription(name, femaleVariant, {
  0: (self) =>
    `You are a ${self.variant} elf. Your oddly colored hair is the only remarkable feature about you.`,
});
setDescription(name, maleVariant, {
  0: (self) =>
    `You are a ${self.variant} elf. Your oddly colored hair is the only remarkable feature about you.`,
});
