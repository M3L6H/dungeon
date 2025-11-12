import { addLog } from './logs.js';
import { schedule } from './time.js';

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

export function getSelectedAction() {
  return actions[selected];
}

export function act(entity, action, target) {
  switch (action) {
  case 'move':
    return move(entity, target);
  default:
    addLog(`${entity.name} cannot ${action}`);
  }
  
  return false;
}

function move(entity, target) {
  const { x, y } = target;
  const dx = Math.abs(x - entity.x);
  const dy = Math.abs(y - entity.y);
  if (dx + dy !== 1) return false;
  const time = getTimeToMove(entity);
  schedule(entity, time, () => {
    entity.x = x;
    entity.y = y;
    addLog(`${entity.name} moved`);
  });
}

function getTimeToMove(entity) {
  return Math.max(1, 10 - Math.floor(Math.sqrt(entity.speed)));
}

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

function createAction() {
  const actionElt = document.createElement('div');
  actionElt.classList.add('action');
  actionElt.classList.add('material-symbols-outlined');
  actionElt.addEventListener('click', () => {
    const action = actionElt.dataset.action;
    if (action === NONE || actions[selected] === action) return; 
    selected = actions.indexOf(action);
    renderActions();
    addLog(`Changed selected action to '${action}'`);
  });
  return actionElt;
}

export function setUpActions() {
  actions.forEach(action => actionsElt.appendChild(createAction())); 
  renderActions();
}