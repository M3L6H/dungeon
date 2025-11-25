import { getXpValue } from "./entities/data.js";
import { getEntityById } from "./entities/entity.js";
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
  while (!getPlayer().dead && !getPlayer().inControl) {
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
  const events = timeline[time] ?? [];
  events.forEach(([_, event]) => {
    event();
  });
  getEntities().forEach((entity) => {
    if (entity.dead) return;
    entity.mana = Math.min(entity.mana + 1, entity.maxMana);
    for (let i = entity.statuses.length - 1; i >= 0; --i) {
      const { count, effect, freq, id, type } = entity.statuses[i];
      if (time % freq !== 0) continue;
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
          `${owner.displayName} earned ${xp} xp from defeating ${entity.name} with ${type}.`,
        );
        owner.xp += xp;
      }
    }
    if (entity.inControl) getInput(entity);
  });
  getTileEntities().forEach((tileEntity) => tileEntity.tick(time));
  renderViewport();
  delete timeline[time];
}
