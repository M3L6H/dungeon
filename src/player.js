import { Entity } from './entity.js';

let controlling = true;

const player = new Entity({
  name: 'Player',
  isPlayer: true, 
});

export function getPlayer() {
  return player;
}

export function getInput() {
  controlling = true;
}

export function inControl() {
  return controlling;
}

export function releaseControl() {
  controlling = false;
}