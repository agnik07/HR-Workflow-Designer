import dagre from "dagre";

const NODE_WIDTH = 260;
const NODE_HEIGHT = 110;

/**
 * Automatically layout nodes using dagre (directed graph layout).
 * Returns an updated nodes array with new positions.
 */
export function autoLayout(nodes, edges, direction = "LR") {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 70, ranksep: 120, marginx: 40, marginy: 40 });

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      ...n,
      position: pos ? { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 } : n.position,
    };
  });
}
