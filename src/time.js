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
  while (
    !getPlayer().dead &&
    !getPlayer().inControl &&
    Object.keys(getTimeline()).length > 0
  ) {
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
  entity.releaseControl(nextActionTime);
}

export function tick() {
  const timeline = getTimeline();
  const time = incrementTime();
  getEntities().forEach((entity) => {
    if (entity.dead) return;
    entity.mana = Math.min(entity.mana + 1, entity.maxMana);
    for (let i = entity.statuses.length - 1; i >= 0; --i) {
      const { count, effect, freq, type } = entity.statuses[i];
      if (time % freq !== 0) continue;
      effect(entity);
      --entity.statuses[i].count;
      if (count <= 0) {
        logSafe(entity, `${entity.displayName}'s ${type} status has expired.`);
        entity.statuses.splice(i, 1);
      }
    }
  });
  getTileEntities().forEach((tileEntity) => tileEntity.tick(time));
  const events = timeline[time] ?? [];
  events.forEach(([entityId, event]) => {
    const entity = getEntities()[entityId];
    if (entity.dead) return;
    event();
    if (entity.inControl) getInput(entity);
  });
  renderViewport();
  delete timeline[time];
}
