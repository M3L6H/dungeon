function init() {
  const map = document.getElementById('map');
  const x = 10;
  const y = 8;
  for (let i = 0; i < x * y; ++i) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    map.appendChild(tile);
  }
}

addEventListener('load', () => init());