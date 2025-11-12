import { Entity } from "./entity.js";

export function createPlayer() {
  return new Entity({
    name: "Player",
    isPlayer: true,
  });
}

