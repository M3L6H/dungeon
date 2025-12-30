import { getMap, getTime } from "../gameState.js";
import { projectile } from "./behaviors.js";
import { Entity, startEntity } from "./entity.js";

/**
 * Creates a dart.
 * @returns {Promise<Entity>} A dart entity
 */
const name = "dart";
export async function createDart(x, y, props) {
  const { w, h } = getMap();
  return await startEntity(
    new Entity({
      displayName: "Dart",
      name,
      description: {
        0: () =>
          `The dart whizzes through the air with hair-raising velocity.`,
      },
      w,
      h,
      agility: 0,
      speedMod: 16,
      behaviors: [projectile],
      additionalProps: {
        damage: 2,
        hands: false,
        isProjectile: true,
      },
      ...props,
    }),
    x,
    y,
  );
}

export function resetDart(dart, props) {
  dart.nextActionTime = getTime();
  dart.dir = props.dir;
  dart._health = dart.maxHealth;
  dart.speedMod = 16;
  dart.dead = false;
}
