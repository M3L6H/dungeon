import { Entity } from "./entity.js";

export function createPlayer() {
  return new Entity({
    name: "Player",
    isPlayer: true,
    agility: 4,
    constitution: 4,
    endurance: 3,
  });
}
