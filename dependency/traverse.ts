import { StreamNode, StreamNodeDependency } from "./stream_node.ts";

export const traverse = (
  root: StreamNodeDependency,
  callback: (node: StreamNode, weight: number) => void
) => {
  const queue = [root];
  while (queue.length > 0) {
    const { node, weight } = queue.shift()!;
    callback(node, weight);
    for (const dependency of Object.values(node.dependents).sort(
      (a, b) => a.node.id - b.node.id
    )) {
      queue.push(dependency);
    }
  }
};
