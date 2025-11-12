import { generateMap } from "./map.js";
import { createPlayer } from "./player.js";

class GameState {
  constructor(props) {
    this.controlling = true;
    this.map = props.map;
    this.player = props.player;
    this.time = 0;
    this.timeline = {};
  }
}

let gameState = {};

export async function newGame() {
  gameState = new GameState({
    map: await generateMap(),
    player: createPlayer(),
  });
}

export function getMap() {
  return gameState.map;
}

export function getInput() {
  gameState.controlling = true;
}

export function getPlayer() {
  return gameState.player;
}

export function getTime() {
  return gameState.time;
}

export function getTimeline() {
  return gameState.timeline;
}

export function inControl() {
  return gameState.controlling;
}

export function incrementTime() {
  return ++gameState.time;
}

export function releaseControl() {
  gameState.controlling = false;
}
