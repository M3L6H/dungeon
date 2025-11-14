import { Entity } from "./entity.js";

export function createPlayer(w, h) {
  return new Entity({
    name: "Player",
    variant: "female",
    agility: 4,
    constitution: 4,
    endurance: 3,
    w,
    h,
  });
}
