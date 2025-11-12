import {
  getInput,
  getTime,
  getTimeline,
  inControl,
  incrementTime,
} from "./gameState.js";
import { renderViewport } from "./viewport.js";

export function advance() {
  while (!inControl() && Object.keys(getTimeline()).length > 0) {
    tick();
  }
}

export function getDecision(entity) {
  if (entity.isPlayer) {
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
  const events = timeline[time] ?? [];
  events.forEach((event) => event());
  renderViewport();
  delete timeline[time];
}

