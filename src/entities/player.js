import { Entity } from "./entity.js";

export function createPlayer(w, h) {
  return new Entity({
    name: "Player",
    variant: "female",
    description: {
      0: (self) =>
        `You are a ${self.variant} elf. Your oddly colored hair is the only remarkable feature about you.`,
    },
    agility: 4,
    constitution: 4,
    endurance: 3,
    intelligence: 5,
    wisdom: 5,
    w,
    h,
    inventory: {
      key: 2,
    },
  });
}
