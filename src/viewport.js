const W = 11;
const H = 11;
const viewportElt = document.getElementById('viewport');

function renderViewport() {
}

function createTile() {
  const tileElt = document.createElement('div');
  tileElt.classList.add('tile');
  return tileElt;
}

export function setUpViewport() {
  for (let i = 0; i < W * H; ++i) {
    viewportElt.appendChild(createTile());
  }
  renderViewport();
}