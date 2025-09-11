export function buildToolbar(root, api) {
  root.innerHTML = '';
  const btnRun = button('Найти путь', () => api.runDijkstra());
  root.append( btnRun);
}

function button(label, onClick, cls) {
  const b = document.createElement('button'); b.textContent = label; if (cls) b.className = cls; b.addEventListener('click', onClick); return b;
}
