// T5.3 — BFS shortest-path graph tracer (shared by React frontend)
export function bfsShortestPath(nodes, edges, sourceId, targetId) {
  const adj = new Map();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => {
    const s = typeof e.source === "object" ? e.source.id : e.source;
    const t = typeof e.target === "object" ? e.target.id : e.target;
    if (adj.has(s)) adj.get(s).push(t);
    if (adj.has(t)) adj.get(t).push(s);
  });
  if (!adj.has(sourceId) || !adj.has(targetId)) return null;
  const visited = new Set([sourceId]);
  const queue = [[sourceId]];
  while (queue.length > 0) {
    const path = queue.shift();
    const last = path[path.length - 1];
    if (last === targetId) return path;
    for (const nb of adj.get(last) || []) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push([...path, nb]);
      }
    }
  }
  return null;
}

export function pathNodeNames(pathIds, nodes) {
  const map = new Map(nodes.map((n) => [n.id, n.canonical_name || n.name || n.label || n.id]));
  return (pathIds || []).map((id) => map.get(id) || id);
}
