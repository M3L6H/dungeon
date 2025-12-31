import { getMap, getTime } from "../gameState.js";
import { projectile } from "./behaviors.js";
import { setDescription } from "./data.js";
import { Entity, startEntity } from "./entity.js";

const name = "dart";
const physicalVariant = "physical";
/**
 * Creates a dart.
 * @returns {Promise<Entity>} A dart entity
 */
export async function createDart(x, y, props) {
  const { w, h } = getMap();
  return await startEntity(
    new Entity({
      displayName: "Dart",
      name,
      variant: physicalVariant,
      w,
      h,
      agility: 0,
      endurance: 99,
      strength: 0,
      wisdom: 0,
      damageMod: 2,
      speedMod: 16,
      behaviors: [projectile],
      unique: true,
      additionalProps: {
        hands: false,
        isProjectile: true,
      },
      ...props,
    }),
    x,
    y,
  );
}
setDescription(name, physicalVariant, {
  0: () => `The dart whizzes through the air with hair-raising velocity.`,
});

export function resetDart(dart, props) {
  dart.nextActionTime = getTime();
  dart.dir = props.dir;
  dart._health = dart.maxHealth;
  dart.speedMod = 16;
  dart.dead = false;
}
