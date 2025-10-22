export function Dijkstra(graph, startId, endId) {
  const vertices = graph.vertices.map(v => v.id);
  if (!vertices.includes(startId) || !vertices.includes(endId)) {
    return { distance: Infinity, path: [], prev: new Map(), visited: new Set() };
  }

  function hasNegativeEdge(adj) {
    for (const edges of adj.values()) {
      for (const { weight } of edges) {
        if (weight < 0) return true;
      }
    }
    return false;
  }

  const adj = graph.getAdjacencyList();
  if (hasNegativeEdge(adj)) {
    return null;
  }
  
  const dist = new Map(vertices.map(id => [id, Infinity]));
  const prev = new Map(vertices.map(id => [id, null]));
  const visited = new Set();
  visited.add(startId);
  dist.set(startId, 0);

  let from = startId;

  while (!visited.has(endId)) {
    for (const { to, weight } of adj.get(from)) {
      if (!visited.has(to) && dist.get(to) > dist.get(from) + weight) {
        dist.set(to, dist.get(from) + weight);
        prev.set(to, from);
      }
    }
    let best = Infinity;
    for (const id of vertices) {
      if (!visited.has(id) && dist.get(id) < best) { best = dist.get(id); from = id; }
    }
    if (best === Infinity) break;
    visited.add(from);
  }

  // Build path
  const path = [];
  if (dist.get(endId) !== Infinity) {
    let curr = endId;
    while (curr !== null) { path.push(curr); curr = prev.get(curr); }
    path.reverse();
  }
  return { dist: dist.get(endId), path };
}
