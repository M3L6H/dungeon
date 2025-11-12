import { setUpActions } from './actions.js';
import { generateMap } from './map.js';
import { getPlayer } from './player.js';
import { renderViewport, setUpViewport } from './viewport.js';

let maxHealth = 10;
let health = maxHealth;
const healthElt = document.getElementById('health');
let maxMana = 10;
let mana = maxMana;
const manaElt = document.getElementById('mana');
let maxStamina = 10;
let stamina = maxStamina;
const staminaElt = document.getElementById('stamina');

function renderBar(elt, curr, max) {
  const fillElt = elt.querySelector('.fill');
  const textElt = elt.querySelector('.bar-text');
  
  fillElt.style.width = `${curr / max * 100}%`;
  textElt.textContent = `${curr} / ${max}`;
}

function renderBars() {
  renderBar(healthElt, health, maxHealth);
  renderBar(manaElt, mana, maxMana);
  renderBar(staminaElt, stamina, maxStamina);
};

async function init() {
  setUpViewport();
  renderBars();
  setUpActions();
  
  const map = await generateMap();
  const { x, y } = map.getRandomRoom();
  const player = getPlayer();
  player.x = x;
  player.y = y;
  player.map = map;
  renderViewport(x, y, map);
}

addEventListener('load', async () => await init());