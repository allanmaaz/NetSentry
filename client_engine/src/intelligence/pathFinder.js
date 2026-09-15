/**
 * NetSentry — Multi-Hop Path Finder / BFS Graph Tracer (T5.3)
 * Computes shortest association chains between two suspects for court exhibits.
 */

/**
 * BFS shortest path between source and target over an undirected entity graph.
 * @param {object[]} nodes - entities with .id
 * @param {object[]} edges - links with .source/.target (id or object)
 * @param {string} sourceId
 * @param {string} targetId
 * @returns {string[]|null} ordered node-id path, or null if disconnected
 */
export function bfsShortestPath(nodes, edges, sourceId, targetId) {
  const adj = new Map();
  nodes.forEach((n) => adj.set(n.id, []));
  (edges || []).forEach((e) => {
    const s = typeof e.source === 'object' ? e.source.id : e.source;
    const t = typeof e.target === 'object' ? e.target.id : e.target;
    if (adj.has(s)) adj.get(s).push(t);
    if (adj.has(t)) adj.get(t).push(s);
  });
  if (!adj.has(sourceId) || !adj.has(targetId)) return null;
  if (sourceId === targetId) return [sourceId];

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

/**
 * Human-readable hop summary for the path panel.
 */
export function summarizePath(pathIds, nodeMap) {
  if (!pathIds || pathIds.length === 0) return 'No path.';
  const names = pathIds.map((id) => {
    const n = nodeMap.get ? nodeMap.get(id) : nodeMap[id];
    return (n && (n.canonical_name || n.name)) || id;
  });
  const hops = pathIds.length - 1;
  return `${hops} hop${hops === 1 ? '' : 's'}: ${names.join(' → ')}`;
}
