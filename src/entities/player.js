import { registerFn } from "../functions.js";
import { getMap } from "../gameState.js";
import { dagger, healthPotionMinor, key } from "../items/index.js";
import { setDescription } from "./data.js";
import { Entity, startEntity } from "./entity.js";

const NAMESPACE = "player";

const name = "player";
const maleVariant = "male";
const femaleVariant = "female";
const canInteract = registerFn(NAMESPACE, "canInteract", (self, _, item) => {
  return item.isHealthPotion && self.health < self.maxHealth;
});
export async function createPlayer(background, clazz, props) {
  const {
    w,
    h,
    start: { x, y },
  } = getMap();

  const inventory = {
    [healthPotionMinor.id]: 1,
  };

  if (background === "nobody") {
    inventory[key.id] = 2;
  }

  if (clazz === "rogue") {
    inventory[dagger.id] = 2;
  }

  return await startEntity(
    new Entity({
      name,
      level: 0,
      w,
      h,
      inventory,
      unique: true,
      additionalProps: {
        background,
        picksItems: true,
        skills: {},
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
