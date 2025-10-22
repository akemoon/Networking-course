import { GraphModel } from './graph/GraphModel.js';
import { Dijkstra } from './graph/Dijkstra.js';
import { CanvasView } from './ui/CanvasView.js';
import { ContextMenu } from './ui/ContextMenu.js';
import { Matrix } from './ui/Matrix.js';
import { buildToolbar } from './ui/Controls.js';
import { Floyd } from './graph/Floyd.js';

let mode = 'Floyd';

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
const timingsToggle = document.getElementById('toggle-timings');

// Keep status bar height when clearing text by using a non-breaking space
function setStatus(text) {
  const t = (text == null || String(text).trim() === '') ? '\u00A0' : String(text);
  status.textContent = t;
}

function now() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

function formatDuration(ms) {
  if (ms >= 1) {
    return `${ms.toFixed(2)} мс`;
  }
  const micro = ms * 1e3;
  if (micro >= 1) {
    return `${micro.toFixed(2)} мкс`;
  }
  const nano = micro * 1e3;
  return `${nano.toFixed(2)} нс`;
}

function shouldShowTimings() {
  return Boolean(timingsToggle && timingsToggle.checked);
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

const btnClearWay = document.getElementById('btn-clear-way');
if (btnClearWay) {
  btnClearWay.addEventListener('click', () => {
    setStatus(null); 
    canvas.setHighlight([]);
    canvas.setStart(null);
    canvas.setEnd(null);
  });
}

// Update all when matrix changed
const matrixEditor = document.getElementById('matrix-editor');
if (matrixEditor) {
  matrixEditor.addEventListener('change', () => {
    drawAll();
  })
}

function checkEdgeWeightStatuses(status) {
  if (status === 'correct' || status === 'null') {
    setStatus(null);
  } else if (status === 'not-a-num' || status === 'empty') {
    setStatus('Вес должен быть числом.');
  }
}

// Update matrix when edge added
canvas.onChanged = (status) => {
  if (status === 'correct') {
    matrix.draw();
  }
  checkEdgeWeightStatuses(status);
};

// ---------- Context menu ----------

canvas.onContextMenu = ({ x, y, hitV, hitE }) => {
  const items = [];
  if (hitV && mode === 'Dijkstra') {
    items.push({ label: 'Начальная вершина', onClick: () => { canvas.setStart(hitV.id); } });
    items.push({ label: 'Конечная вершина', onClick: () => { canvas.setEnd(hitV.id); } })
    items.push({ label: `Удалить вершину ${hitV.id}`, onClick: () => { model.removeVertex(hitV.id); drawAll(); } });
  }
  else if (hitE) {
    items.push({ label: `Удалить дугу ${hitE.from}→${hitE.to}`, onClick: () => { model.removeEdge(hitE.from, hitE.to); drawAll(); } });
    items.push({ label: `Изменить вес ${hitE.from}→${hitE.to}`, onClick: () => {
      const raw = prompt('Новый вес');
      const status = model.checkEdgeWeight(raw);
      if (status === 'correct') { 
        model.setEdgeWeight(hitE.from, hitE.to, Number(raw));
        drawAll();
      }
      checkEdgeWeightStatuses(status);
    }});
  }
  else {
    items.push({ label: 'Добавить вершину', onClick: () => { model.addVertex(); drawAll(); } });
    items.push({ label: 'Добавить дугу', onClick: () => { canvas.setMode('add-edge'); setStatus('Добавление дуги: кликните на начальную и конечную вершины.'); } });
    items.push({ label: 'Очистить путь', onClick: () => {
      setStatus(null); 
      canvas.setHighlight([]);
      canvas.setStart(null);
      canvas.setEnd(null);
    }});
  }
  
  menu.setItems(items);
  menu.show(x, y);
};
menu.onHide = () => {};

function handleRun() {
  if (mode === 'Dijkstra') {
    const start = canvas.start;
    const end = canvas.end;
    if (start == null || end == null) { setStatus('Выберите начальную и конечную вершины.'); return; }
    const t0 = now();
    const res = Dijkstra(model, start, end);
    const elapsed = now() - t0;
    if (res === null) {
      canvas.setHighlight([]);
      let message = 'Граф содержит отрицательные веса.';
      if (shouldShowTimings()) { message += `\nВремя Дейкстры: ${formatDuration(elapsed)}`; }
      setStatus(message);
      return;
    }
    const distance = res.distance ?? res.dist;
    if (!res.path.length) {
      canvas.setHighlight([]);
      let message = 'Пути не существует.';
      if (shouldShowTimings()) { message += `\nВремя Дейкстры: ${formatDuration(elapsed)}`; }
      setStatus(message);
    } else {
      canvas.setHighlight(res.path);
      let message = `Длина пути: ${distance}. Путь: ${res.path.join(' → ')}.`;
      if (shouldShowTimings()) { message += `\nВремя Дейкстры: ${formatDuration(elapsed)}`; }
      setStatus(message);
    }
  }
  else if (mode === 'Floyd') {
    const w = model.getWeightMatrix();
    
    function formRes(res) {
      let out = '[\n';
      for (const [from, other] of res) {
        for (const {to, path, dist} of other) {
          out += `  [${from}, ${to}, [${path}], ${dist}]`;
        }
        out += '\n';
      }
      out += ']';
      return out;
    }

    const startFloyd = now();
    const resFloyd = Floyd(w);
    const elapsedFloyd = now() - startFloyd;
    let outFloyd = 'Флойд:\n';
    if (resFloyd === null) {
      outFloyd += 'Граф содержит отрицательный цикл.';
    } else {
      outFloyd += formRes(resFloyd);
    }

    let negWeight = false;
    const resDijkstra = new Map();
    let totalTimeDijkstra = 0;
    let countRunsDijkstra = 0;
    for (let i = 0; i < model.size; i++) {
      let js = [];
      for (let j = 0; j < model.size; j++) {
        if (i !== j) {
          const startDijkstra = now();
          const res = Dijkstra(model, i, j);
          const elapsedDijkstra = now() - startDijkstra;
          totalTimeDijkstra += elapsedDijkstra;
          countRunsDijkstra++;
          if (res === null) {
            negWeight = true;
            break;
          }
          js.push({to: j, path: res.path, dist: res.dist});
        }
      }
      if (negWeight) {
        break;
      }
      resDijkstra.set(i, js);
    }

    let outDijkstra = 'Дейкстра:\n';
    if (negWeight) {
      outDijkstra += 'Граф содержит отрицательные веса.';
    } else {
      outDijkstra += formRes(resDijkstra);
    }

    let out = '';
    if (shouldShowTimings()) {
      const timingLines = [
        `Время Флойда: ${formatDuration(elapsedFloyd)}`,
        `\nСуммарное время Дейкстры (${countRunsDijkstra} запусков): ${formatDuration(totalTimeDijkstra)}\n\n`
      ];
      out += timingLines;
    }
    out += (outFloyd + '\n\n' + outDijkstra);
    setStatus(out);
  }
}
