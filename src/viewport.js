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

const healthElt = document.getElementById("health");
let maxMana = 10;
let mana = maxMana;
const manaElt = document.getElementById("mana");
const staminaElt = document.getElementById("stamina");
const viewportElt = document.getElementById("viewport");

function renderBar(elt, curr, max) {
  const fillElt = elt.querySelector(".fill");
  const textElt = elt.querySelector(".bar-text");

  fillElt.style.width = `${(curr / max) * 100}%`;
  textElt.textContent = `${curr} / ${max}`;
}

function renderBars() {
  const { hitpoints, maxHitpoints, stamina, maxStamina } = getPlayer();
  renderBar(healthElt, hitpoints, maxHitpoints);
  renderBar(manaElt, mana, maxMana);
  renderBar(staminaElt, stamina, maxStamina);
}

export function renderViewport() {
  const { x, y } = getPlayer();
  const map = getMap();
  for (let i = 0; i < W; ++i) {
    for (let j = 0; j < H; ++j) {
      const tileElt = viewportElt.children[i + j * W];
      const tX = x - HW + i;
      const tY = y - HH + j;

      const entities = map.getEntities(tX, tY);
      const entityMaxIdx = Math.max(tileElt.children.length, entities.length);
      for (let i = 0; i < entityMaxIdx; ++i) {
        if (i >= entities.length) {
          tileElt.children[i].style.backgroundImage = "none";
        } else if (i >= tileElt.children.length) {
          const entityElt = document.createElement("div");
          entityElt.classList.add("entity");
          tileElt.appendChild(entityElt);
        }
        tileElt.children[i].style.backgroundImage = entities[i].sprite;
      }

      if (tX < 0 || tX >= map.w || tY < 0 || tY >= map.h) {
        tileElt.style.backgroundImage = "none";
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

  renderBars();
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
