import {
  act,
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
const manaElt = document.getElementById("mana");
const staminaElt = document.getElementById("stamina");
const viewportElt = document.getElementById("viewport");

export function highlight(id) {
  const elt = viewportElt.querySelector(`div[data-id="${id}"]`)?.parentElement;
  elt?.classList.add("highlight");
  setTimeout(() => {
    elt?.classList.remove("highlight");
  }, 1000);
}

function renderBar(elt, curr, max) {
  const fillElt = elt.querySelector(".fill");
  const textElt = elt.querySelector(".bar-text");

  fillElt.style.width = `${(curr / max) * 100}%`;
  textElt.textContent = `${curr} / ${max}`;
}

function renderBars() {
  const { health, maxHealth, mana, maxMana, stamina, maxStamina } = getPlayer();
  renderBar(healthElt, health, maxHealth);
  renderBar(manaElt, mana, maxMana);
  renderBar(staminaElt, stamina, maxStamina);
}

function renderTile(tX, tY, tileElt) {
  const tileEntity = getMap().getTileEntity(tX, tY);
  if (tileEntity) {
    tileElt.style.backgroundImage = tileEntity.sprite;
  } else {
    const tile = getMap().getTile(tX, tY);
    tileElt.style.backgroundImage = tile.url;
  }
}

function renderMemoryTile(tile, tileEntitySprite, tileElt) {
  if (tileEntitySprite) {
    tileElt.style.backgroundImage = tileEntitySprite;
  } else {
    tileElt.style.backgroundImage = tile.url;
  }
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
    if (!getPlayer().inControl || getPlayer().dead) return;
    if (act(getPlayer(), getSelectedAction(), target)) {
      getPlayer().releaseControl();
      advance();
    }
  };
}

function createEntityElt(parent) {
  const entityElt = document.createElement("div");
  entityElt.classList.add("entity");
  const nw = document.createElement("span");
  nw.classList.add("nw", "no-highlight");
  entityElt.appendChild(nw);
  const ne = document.createElement("span");
  ne.classList.add("ne", "no-highlight");
  entityElt.appendChild(ne);
  const sw = document.createElement("span");
  sw.classList.add("sw", "no-highlight");
  entityElt.appendChild(sw);
  const se = document.createElement("span");
  se.classList.add("se", "no-highlight");
  entityElt.appendChild(se);
  parent.appendChild(entityElt);
}

function renderEntities(entities, tileElt) {
  const entityMaxIdx = Math.max(tileElt.children.length, entities.length);
  const offset = 1 / entities.length;
  for (let i = 0; i < entityMaxIdx; ++i) {
    if (i >= entities.length) {
      const entityElt = tileElt.children[i];
      delete entityElt.dataset.id;
      entityElt.style.backgroundImage = "none";
      entityElt.getAnimations().forEach((a) => a.cancel());
      continue;
    }

    if (i >= tileElt.children.length) createEntityElt(tileElt);
    const entityElt = tileElt.children[i];
    entityElt.dataset.id = entities[i].id;
    entityElt.style.backgroundImage = entities[i].sprite;
    entityElt.querySelector(".se").textContent = entities[i].label ?? "";
    entityElt.getAnimations().forEach((a) => a.cancel());
    entityElt.animate([{ display: "block" }, { display: "none", offset }], {
      delay: 1000 * i,
      duration: 1000 * entities.length,
      iterations: Infinity,
    });
  }
}

export function renderViewport() {
  const player = getPlayer();
  const { x, y } = player;
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
        renderMemoryTile(player.getTileInMemory(tX, tY), player.getTileEntityInMemory(tX, tY)?.sprite, tileElt);
        renderEntities(player.getEntitiesInMemory(tX, tY), tileElt);
      } else {
        tileElt.style.backgroundImage = "none";
        renderEntities([], tileElt);
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
