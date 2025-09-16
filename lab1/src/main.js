import { GraphModel } from './graph/GraphModel.js';
import { Dijkstra } from './graph/Dijkstra.js';
import { CanvasView } from './ui/CanvasView.js';
import { ContextMenu } from './ui/ContextMenu.js';
import { Matrix } from './ui/Matrix.js';
import { buildToolbar } from './ui/Controls.js';

const maxVertNum = 10;

const model = new GraphModel(maxVertNum);

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

// Keep status bar height when clearing text by using a non-breaking space
function setStatus(text) {
  const t = (text == null || String(text).trim() === '') ? '\u00A0' : String(text);
  status.textContent = t;
}

function drawAll() {
  canvas.draw();
  matrix.draw();
}

// ---------- Matrix-panel buttons ----------

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
    if (!isPositiveInt.test(raw.trim())) { setStatus('Номер вершины является неотрицательным целым числом.'); return; }
    
    const id = Number(raw);

    if (!(id < maxVertNum)) {setStatus(`Номер вершины не может быть больше ${maxVertNum - 1}.`); return; }
    
    if (!model.findVertex(id)) { setStatus(`Вершина ${id} не найдена.`); return; }
    
    model.removeVertex(id);
    drawAll();
  });
}

const btnClearMatrix = document.getElementById('btn-clear-matrix');
if (btnClearMatrix) {
  btnClearMatrix.addEventListener('click', () => {
    model.edges = [];
    drawAll();
  });
}

//TODO: clear way
const btnClearWay = document.getElementById('btn-clear-way');
if (btnClearWay) {
  btnClearWay.addEventListener('click', () => {
    canvas.setHighlight([]);
  });
}

// Update all when matrix changed
const matrixEditor = document.getElementById('matrix-editor');
if (matrixEditor) {
  matrixEditor.addEventListener('change', () => {
    drawAll();
  })
}

// Update matrix and status when edge added
canvas.onChanged = (reason) => {
  if (reason === 'edge-added') {
    setStatus(null);
    matrix.draw();
  } else if (reason === 'negative-weight') {
    setStatus('Вес не может быть отрицательным числом.')
  }
};

// ---------- Context menu ----------

canvas.onContextMenu = ({ x, y, hitV, hitE }) => {
  const items = [];
  if (hitV) {
    items.push({ label: 'Начальная вершина', onClick: () => { canvas.setStart(hitV.id); } });
    items.push({ label: 'Конечная вершина', onClick: () => { canvas.setEnd(hitV.id); } })
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
    items.push({ label: 'Добавить дугу', onClick: () => { canvas.setMode('add-edge'); setStatus('Добавление дуги: кликните на стартовую и конечную вершины.'); } });
    items.push({ label: 'Очистить путь', onClick: () => { setStatus(null); canvas.setHighlight([]) } });
  }
  
  menu.setItems(items);
  menu.show(x, y);
};
menu.onHide = () => {};

function handleRun() {
  const start = canvas.start;
  const end = canvas.end;
  if (start == null || end == null) { setStatus('Выберите начальную и конечную вершины.'); return; }
  const res = Dijkstra(model, start, end);
  if (!res.path.length) {
    canvas.setHighlight([]);
    setStatus('Пути не существует.');
  } else {
    canvas.setHighlight(res.path);
    setStatus(`Длина пути: ${res.distance}. Путь: ${res.path.join(' → ')}.`);
  }
}
