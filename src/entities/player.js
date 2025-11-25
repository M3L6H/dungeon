import { getMap } from "../gameState.js";
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
      w,
      h,
      inventory: {
        key: 2,
      },
      unique: true,
    }),
    x,
    y,
  );
}
