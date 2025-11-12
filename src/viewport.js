import {
  act,
  getMap,
  getPlayer,
  getSelectedAction,
  inControl,
  inRange,
  releaseControl,
} from "./gameState.js";
import { advance } from "./time.js";

const W = 11;
const HW = Math.floor(W / 2);
const H = 11;
const HH = Math.floor(H / 2);
const viewportElt = document.getElementById("viewport");

export function renderViewport() {
  const { x, y } = getPlayer();
  const map = getMap();
  for (let i = 0; i < W; ++i) {
    for (let j = 0; j < H; ++j) {
      const tileElt = viewportElt.children[i + j * W];
      const tX = x - HW + i;
      const tY = y - HH + j;

      if (tX < 0 || tX >= map.w || tY < 0 || tY >= map.h) {
        tileElt.style.backgroundImage = undefined;
        tileElt.onclick = undefined;
        continue;
      }

      const target = { x: tX, y: tY };
      if (inRange(getPlayer(), getSelectedAction(), target)) {
        tileElt.classList.add("in-range");
      } else {
        tileElt.classList.remove("in-range");
      }

      const tile = map.getTile(tX, tY);
      tileElt.style.backgroundImage = tile.url;
      tileElt.onclick = () => {
        if (!inControl()) return;
        if (act(getPlayer(), getSelectedAction(), target)) {
          releaseControl();
          advance();
        }
      };
    }
  }
}

function createTile() {
  const tileElt = document.createElement("div");
  tileElt.classList.add("tile");
  return tileElt;
}

export function setUpViewport() {
  for (let i = 0; i < W * H; ++i) {
    viewportElt.appendChild(createTile());
  }
}

