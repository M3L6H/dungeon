import {
  getEntities,
  getInput,
  getPlayer,
  getTime,
  getTimeline,
  incrementTime,
  logSafe,
  rest,
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

export function getDecision(entity) {
  if (entity.dead) return;

  if (entity.stamina === 0) {
    rest(entity, true);
  } else {
    getInput(entity);
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
      getDecision(entity);
    },
  ]);
  timeline[time + timeOffset] = events;
}

export function tick() {
  const timeline = getTimeline();
  const time = incrementTime();
  getEntities().forEach((entity) => {
    if (entity.dead) continue;
    entity.mana = Math.min(entity.mana + 1, entity.maxMana);
    for (let i = entity.statuses.length - 1; i >= 0; --i) {
      const { count, effect, freq, type } = entity.statuses[i];
      if (time % freq !== 0) continue;
      effect(entity);
      --entity.statuses[i].count;
      if (count <= 0) {
        logSafe(
          entity,
          `${entity.displayName}'s ${type} status has expired.`,
        ); 
        entity.statuses.splice(i, 1);
      }
    }
  });
  const events = timeline[time] ?? [];
  events.forEach(([entityId, event]) => {
    if (getEntities()[entityId].dead) return;
    event();
  });
  renderViewport();
  delete timeline[time];
}
