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

export function advance() {
  while (!getPlayer().dead && !entityInControl(getPlayer())) {
    tick();
  }
}

export function schedule(entity, timeOffset, effect) {
  const timeline = getTimeline();
  const time = getTime();
  const events = timeline[time + timeOffset] ?? [];
  events.push([
    entity.id,
    () => {
      effect();
    },
  ]);
  const nextActionTime = time + timeOffset;
  timeline[nextActionTime] = events;
  releaseControl(entity, nextActionTime);
}

export function tick() {
  const timeline = getTimeline();
  const time = incrementTime();
  const events = timeline[time] ?? [];
  events.forEach(([_, event]) => {
    event();
  });
  getEntities().forEach((entity) => {
    if (entity.dead || entity.isItem) return;
    entity.mana = Math.min(entity.mana + 1, entity.maxMana);
    for (let i = entity.statuses.length - 1; i >= 0; --i) {
      const { count, effect, freq, id, offset, type } = entity.statuses[i];
      if ((time + offset) % freq !== 0) continue;
      effect(entity);
      --entity.statuses[i].count;
      if (count <= 0) {
        logSafe(entity, `${entity.displayName}'s ${type} status has expired.`);
        entity.statuses.splice(i, 1);
      }
      if (entity.dead) {
        const owner = getEntityById(id);
        const xp = getXpValue(entity);
        logSafe(
          owner,
          `${owner.displayName} earned ${xp} xp from defeating ${entity.displayName} with ${type}.`,
        );
        owner.xp += xp;
      }
    }
  });
  getEntities().forEach((entity) => {
    if (entity.dead) return;
    if (entityInControl(entity)) getInput(entity);
  });
  getTileEntities().forEach((tileEntity) => tileEntity.tick(time));
  renderViewport();
  delete timeline[time];
}
