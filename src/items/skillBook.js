import { registerFn } from "../functions.js";
import { logSafe } from "../gameState.js";
import { poisonTouchSkill } from "../skills.js";
import { Item } from "./item.js";

const NAMESPACE = "item";

export const skillPickup = registerFn(NAMESPACE, "skillPickup", async function (entity, other) {
  const hasSkill = other.skills[entity.item.skillId];
  if (hasSkill) {
    return await logSafe(
      other,
      `${other.displayName} already has skill ${entity.item.skillName}.`,
    );
  }
  other.skills[entity.item.skillId] = true;
  await logSafe(
    other,
    `${other.displayName} has gained skill ${entity.item.skillName}.`,
  );
});

export const poisonTouchSkillBook = new Item({
  id: "poisonTouchSkillBook",
  name: "Poison Touch Skill Book",
  sprite: "skill-book-poison-touch",
  additionalProps: {
    onPickup: skillPickup,
    skillName: poisonTouchSkill.name,
    skillId: poisonTouchSkill.id,
  },
});
