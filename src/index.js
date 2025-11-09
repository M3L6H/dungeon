import { setUpActions } from './actions.js';

const W = 11;
const H = 9;
const mapElt = document.getElementById('map');

let maxHealth = 10;
let health = maxHealth;
const healthElt = document.getElementById('health');
let maxMana = 10;
let mana = maxMana;
const manaElt = document.getElementById('mana');
let maxStamina = 10;
let stamina = maxStamina;
const staminaElt = document.getElementById('stamina');

function renderMap() {
}

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

function createTile() {
  const tileElt = document.createElement('div');
  tileElt.classList.add('tile');
  return tileElt;
}

function init() {
  for (let i = 0; i < W * H; ++i) {
    mapElt.appendChild(createTile());
  }
  renderBars();
  setUpActions();
}

addEventListener('load', () => init());