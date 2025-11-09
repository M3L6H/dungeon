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

const NONE = 'none';
const MOVE = 'move';
const EXAMINE = 'examine';
const INTERACT = 'interact';
const SETTINGS = 'settings';
const actions = [
  MOVE,
  EXAMINE,
  INTERACT,
  NONE,
  NONE,
  NONE,
  NONE,
  NONE,
  NONE,
  NONE,
  SETTINGS,
];
let selected = 0;
const actionsElt = document.getElementById('actions');

const logsElt = document.getElementById('logs');

let time = 0;

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

function renderActions() {
  actions.forEach((action, i) => {
    const actionElt = actionsElt.children[i];
    actionElt.dataset.action = action;
    
    if (i === selected) {
      actionElt.classList.add('selected');
    } else {
      actionElt.classList.remove('selected');
    }
  });
}

function createTile() {
  const tileElt = document.createElement('div');
  tileElt.classList.add('tile');
  return tileElt;
}

function createAction() {
  const actionElt = document.createElement('div');
  actionElt.classList.add('action');
  actionElt.classList.add('material-symbols-outlined');
  actionElt.addEventListener('click', () => {
    const action = actionElt.dataset.action;
    if (action === NONE || actions[selection] === action) return; 
    selection = actions.indexOf(action);
    renderActions();
    addLog(`Changed selected action to '${action}'`);
  });
  return actionElt;
}

function addLog(msg) {
  const logElt = document.createElement('p');
  logElt.classList.add('log');
  logElt.textContent = `${time}: ${msg}`;
  logsElt.appendChild(logElt);
  logsElt.scrollTop = logsElt.scrollHeight;
}

function init() {
  for (let i = 0; i < W * H; ++i) {
    mapElt.appendChild(createTile());
  }
  renderBars();
  actions.forEach(action => actionsElt.appendChild(createAction())); 
  renderActions();
}

addEventListener('load', () => init());