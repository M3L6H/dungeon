import { getDecision } from './entity.js';
import { getInput, getPlayer, inControl } from './player.js';
import { renderViewport } from './viewport.js';

let time = 0;
const timeline = {};

export function getTime() {
  return time;
}

export function advance() {
  while (!inControl()) {
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
}

export function tick() {
  const events = timeline[++time] ?? [];
  events.forEach(event => event());
  const { x, y, map } = getPlayer();
  renderViewport(x, y, map);
}