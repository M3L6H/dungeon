import { addLog } from './logs.js';

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