import { GraphModel } from './graph/GraphModel.js';
import { dijkstra } from './graph/Dijkstra.js';
import { CanvasView } from './ui/CanvasView.js';
import { ContextMenu } from './ui/ContextMenu.js';
import { Matrix } from './ui/Matrix.js';
import { buildToolbar } from './ui/Controls.js';

const model = new GraphModel(10);

const canvas = new CanvasView(document.getElementById('graph-canvas'), model);
const menu = new ContextMenu(document.getElementById('context-menu'));

const matrix = new Matrix(document.getElementById('matrix-editor'), model);

const status = document.getElementById('status-text');
const panelGraph = document.getElementById('graph-panel');
const panelMatrix = document.getElementById('matrix-panel');

// Toolbar
buildToolbar(document.getElementById('toolbar'), {
  runDijkstra: handleRun,
});

function setStatus(text) { status.textContent = text; }

function drawAll() {
  canvas.draw();
  matrix.draw();
}

// Matrix-panel buttons
const btnAddVertex = document.getElementById('btn-add-vertex');
if (btnAddVertex) {
  btnAddVertex.addEventListener('click', () => {
    model.addVertex();
    drawAll();
  });
}

const vertexDeleteInput = document.getElementById('vertex-index-input');
const btnDeleteVertex = document.getElementById('btn-delete-vertex');
if (btnDeleteVertex) {
  btnDeleteVertex.addEventListener('click', () => {
    if (!vertexDeleteInput) { setStatus('Поле ввода номера вершины не найдено.'); return; }
    const raw = vertexDeleteInput.value;
    
    const isPositiveInt = /^\+?\d+$/;
    if (!isPositiveInt.test(raw.trim())) { setStatus('Введите корректный номер вершины.'); return; }
    
    const id = Number(raw);
    if (!model.findVertex(id)) { setStatus(`Вершина ${id} не найдена.`); return; }
    
    model.removeVertex(id);
    drawAll();
    setStatus(`Вершина ${id} удалена.`);
  });
}

const matrixEditor = document.getElementById('matrix-editor');
if (matrixEditor) {
  matrixEditor.addEventListener('change', () => {
    drawAll();
  })
}

// Context menu bindings for graph operations
canvas.onContextMenu = ({ x, y, hitV, hitE }) => {
  const items = [];
  if (hitV) {
    items.push({ label: 'Начальная вершина', onClick: () => { canvas.setStart(hitV.id); canvas.draw(); } });
    items.push({ label: 'Конечная вершина', onClick: () => { canvas.setEnd(hitV.id); canvas.draw(); } })
    items.push({ label: `Удалить вершину ${hitV.id}`, onClick: () => { model.removeVertex(hitV.id); drawAll(); } });
  }
  else if (hitE) {
    items.push({ label: `Удалить дугу ${hitE.from}→${hitE.to}`, onClick: () => { model.removeEdge(hitE.from, hitE.to); drawAll(); } });
    items.push({ label: `Изменить вес ${hitE.from}→${hitE.to}`, onClick: () => {
      const w = prompt('Новый вес (неотриц.)', String(hitE.weight)); if (w !== null && !isNaN(Number(w)) && Number(w) >= 0) { model.setEdgeWeight(hitE.from, hitE.to, Number(w)); drawAll(); }
    }});
  }
  else {
    items.push({ label: 'Добавить вершину', onClick: () => { model.addVertex(); drawAll(); } });
    items.push({ label: 'Добавить дугу', onClick: () => { canvas.setMode('add-edge'); setStatus('Режим добавления дуги: кликните на стартовую и конечную вершины.'); } });
    items.push({ label: 'Очистить путь', onClick: () => canvas.setHighlight([]) });
  }
  
  menu.setItems(items);
  menu.show(x, y);
};
menu.onHide = () => {};

function handleRun() {
  const { start, end } = canvas.selection;
  if (start == null || end == null) { setStatus('Выберите начальную и конечную вершины.'); return; }
  const res = dijkstra(model, start, end);
  if (!res.path.length) {
    canvas.setHighlight([]);
    setStatus('Пути не существует.');
  } else {
    canvas.setHighlight(res.path);
    setStatus(`Длина пути: ${res.distance}. Путь: ${res.path.join(' → ')}.`);
  }
}
