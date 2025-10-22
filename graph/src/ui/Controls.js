export function buildToolbar(root, api) {
  root.innerHTML = '';
  const btnRun = button('Найти путь', () => api.runDijkstra());
  btnRun.id = 'btn-run';
  const timingsToggle = checkbox('Показывать время', 'toggle-timings');
  root.append(btnRun, timingsToggle);
}

function button(label, onClick, cls) {
  const b = document.createElement('button'); b.textContent = label; if (cls) b.className = cls; b.addEventListener('click', onClick); return b;
}

function checkbox(label, id) {
  const wrap = document.createElement('label');
  wrap.className = 'toolbar-toggle';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = id;
  const span = document.createElement('span');
  span.textContent = label;
  wrap.append(input, span);
  return wrap;
}
