import {
  entityInControl,
  getXpValue,
  getEntityById,
  releaseControl,
} from "./entities/index.js";
import {
  getEntities,
  getInput,
  getPlayer,
  getTileEntities,
  getTime,
  getTimeline,
  incrementTime,
  logSafe,
} from "./gameState.js";
import { renderViewport } from "./viewport.js";

export async function advance() {
  while (!getPlayer().dead && !entityInControl(getPlayer())) {
    await tick();
  }
}

export function schedule(entity, timeOffset, effect) {
  const timeline = getTimeline();
  const time = getTime();
  const events = timeline[time + timeOffset] ?? [];
  events.push([entity.id, effect]);
  const nextActionTime = time + timeOffset;
  timeline[nextActionTime] = events;
  releaseControl(entity, nextActionTime);
}

export async function tick() {
  const timeline = getTimeline();
  const time = incrementTime();
  const events = timeline[time] ?? [];
  for (const [_, event] of events) {
    await event();
  }
  for (const entity of getEntities()) {
    if (entity.dead || entity.isItem) return;
    entity.mana = Math.min(entity.mana + 1, entity.maxMana);
    for (let i = entity.statuses.length - 1; i >= 0; --i) {
      const { count, effect, freq, id, offset, type } = entity.statuses[i];
      if ((time + offset) % freq !== 0) continue;
      await effect(entity);
      --entity.statuses[i].count;
      if (count <= 0) {
        await logSafe(
          entity,
          `${entity.displayName}'s ${type} status has expired.`,
        );
        entity.statuses.splice(i, 1);
      }
      if (entity.dead) {
        const owner = getEntityById(id);
        const xp = getXpValue(entity);
        await logSafe(
          owner,
          `${owner.displayName} earned ${xp} xp from defeating ${entity.displayName} with ${type}.`,
        );
        owner.xp += xp;
      }
    }
  }
  for (const entity of getEntities()) {
    if (entity.dead) return;
    if (entityInControl(entity)) await getInput(entity);
  }
  for (const tileEntity of getTileEntities()) {
    await tileEntity.tick(time);
  }
  renderViewport();
  delete timeline[time];
}
