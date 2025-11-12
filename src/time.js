import { getInput, getPlayer, inControl } from "./player.js";
import { renderViewport } from "./viewport.js";

let time = 0;
const timeline = {};

export function getTime() {
  return time;
}

export function advance() {
  while (!inControl() && Object.keys(timeline).length > 0) {
    tick();
  }
}

export function getDecision(entity) {
  if (entity.isPlayer) {
    getInput(entity);
  }
}

export function schedule(entity, timeOffset, effect) {
  const events = timeline[time + timeOffset] ?? [];
  events.push(() => {
    effect();
    getDecision(entity);
  });
  timeline[time + timeOffset] = events;
}

export function tick() {
  const events = timeline[++time] ?? [];
  events.forEach((event) => event());
  const { x, y, map } = getPlayer();
  renderViewport(x, y, map);
  delete timeline[time];
}

