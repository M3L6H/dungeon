import {
  getEntities,
  getInput,
  getPlayer,
  getTime,
  getTimeline,
  incrementTime,
  rest,
} from "./gameState.js";
import { renderViewport } from "./viewport.js";

export function advance() {
  while (!getPlayer().inControl && Object.keys(getTimeline()).length > 0) {
    tick();
  }
}

export function getDecision(entity) {
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
  events.push(() => {
    effect();
    getDecision(entity);
  });
  timeline[time + timeOffset] = events;
}

export function tick() {
  const timeline = getTimeline();
  const time = incrementTime();
  getEntities().forEach(entity => {
    entity.mana = Math.min(entity.mana + 1, entity.maxMana);
  });
  const events = timeline[time] ?? [];
  events.forEach((event) => event());
  renderViewport();
  delete timeline[time]; 
}
