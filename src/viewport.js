import {
  act,
  getEntities,
  getInput,
  getMap,
  getPlayer,
  getSelectedAction,
  inRange,
} from "./gameState.js";
import { Tile } from "./tile.js";
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

function renderTile(tX, tY, tileElt) {
  const tile = getMap().getTile(tX, tY);
  tileElt.style.backgroundImage = tile.url;
}

function renderMemoryTile(tileName, tileElt) {
  const tile = Tile.nameToTile[tileName];
  tileElt.style.backgroundImage = tile.url;
  tileElt.classList.add("memory");
}

function renderRange(tX, tY, tileElt) {
  const target = { x: tX, y: tY };
  if (inRange(getPlayer(), getSelectedAction(), target)) {
    tileElt.classList.add("in-range");
  } else {
    tileElt.classList.remove("in-range");
  }

  tileElt.onclick = () => {
    if (!getPlayer().inControl) return;
    if (act(getPlayer(), getSelectedAction(), target)) {
      getPlayer().releaseControl();
      getEntities().forEach((entity) => {
        if (entity.inControl) {
          getInput(entity);
        }
      });
      advance();
    }
  };
}

function renderEntities(entities, tileElt) {
  const entityMaxIdx = Math.max(tileElt.children.length, entities.length);
  for (let i = 0; i < entityMaxIdx; ++i) {
    if (i >= entities.length) {
      tileElt.children[i].style.backgroundImage = "none";
      continue;
    } else if (i >= tileElt.children.length) {
      const entityElt = document.createElement("div");
      entityElt.classList.add("entity");
      tileElt.appendChild(entityElt);
    }
    tileElt.children[i].style.backgroundImage = entities[i].sprite;
  }
}

export function renderViewport() {
  const player = getPlayer();
  const { dir, x, y } = player;
  const dirMod2 = dir % 2;
  const map = getMap();
  for (let i = 0; i < W; ++i) {
    for (let j = 0; j < H; ++j) {
      const tileElt = viewportElt.children[i + j * W];
      const tX = x - HW + i;
      const tY = y - HH + j;

      tileElt.classList.remove("memory");

      if (tX < 0 || tX >= map.w || tY < 0 || tY >= map.h) {
        tileElt.style.backgroundImage = "none";
        tileElt.onclick = undefined;
        continue;
      }

      if (map.canEntitySeeTile(player, tX, tY)) {
        renderTile(tX, tY, tileElt);
        renderEntities(map.getEntities(tX, tY), tileElt);
      } else if (player.getTileInMemory(tX, tY) !== undefined) {
        renderMemoryTile(player.getTileInMemory(tX, tY), tileElt);
        renderEntities(player.getEntitiesInMemory(tX, tY), tileElt);
      } else {
        tileElt.style.backgroundImage = "none";
      }
      renderRange(tX, tY, tileElt);
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
