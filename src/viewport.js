import { act, getSelectedAction } from './actions.js';
import { getPlayer, inControl, releaseControl } from './player.js';
import { advance } from './time.js';

const W = 11;
const HW = Math.floor(W / 2);
const H = 11;
const HH = Math.floor(H / 2);
const viewportElt = document.getElementById('viewport');

export function renderViewport(x, y, map) {
  for (let i = 0; i < W; ++i) {
    for (let j = 0; j < H; ++j) {
      const tileElt = viewport.children[i + j * W];
      const tX = x - HW + i;
      const tY = y - HH + j;
      
      if (tX < 0 || tX >= map.w || tY < 0 || tY >= map.h) {
        tileElt.style.backgroundImage = undefined;
        tileElt.onclick = undefined;
        continue;
      }
      
      const tile = map.getTile(tX, tY);
      tileElt.style.backgroundImage = tile.url;
      tileElt.onclick = () => {
        if (!inControl()) return;
        if (act(
          getPlayer(),
          getSelectedAction(),
          { x: tX, y: tY },
        )) {
          releaseControl();
          advance();
        } 
      }; 
    }
  }
}

function createTile() {
  const tileElt = document.createElement('div');
  tileElt.classList.add('tile');
  return tileElt;
}

export function setUpViewport() {
  for (let i = 0; i < W * H; ++i) {
    viewportElt.appendChild(createTile());
  }
}