const NONE = 'none';
const MOVE = 'move';
const SETTINGS = 'settings';
const actions = [
  MOVE,
  NONE,
  NONE,
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

const W = 11;
const H = 9;
const mapElt = document.getElementById('map');
const actionsElt = document.getElementById('actions');

function render() {
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

function createTile() {
  const tileElt = document.createElement('div');
  tileElt.classList.add('tile');
  return tileElt;
}

function createAction() {
  const actionElt = document.createElement('div');
  actionElt.classList.add('action');
  actionElt.classList.add('material-symbols-outlined');
  return actionElt;
}

function init() {
  for (let i = 0; i < W * H; ++i) {
    mapElt.appendChild(createTile());
  }
  actions.forEach(action => actionsElt.appendChild(createAction()));
  renderActions();
}

addEventListener('load', () => init());