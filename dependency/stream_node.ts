import { traverse } from "./traverse.ts";

export type StreamNodeDependency = {
  node: StreamNode;
  weight: number;
};

export class StreamNode {
  readonly id: number;
  private _dependents: Record<StreamNode["id"], StreamNodeDependency> = {};
  protected parent: StreamNode | null = null;

  constructor(id: number) {
    this.id = id;
  }

  isDependentOn(node: StreamNode): boolean {
    const thisId = this.id;
    return Object.values(node._dependents).some((dependency) => {
      let dependsOn = false;
      traverse(dependency, (dep) => {
        if (dep.id === thisId) {
          dependsOn = true;
        }
      });
      return dependsOn;
    });
  }

  addDependent(node: StreamNode, weight: number = 16, exclusive = false) {
    if (this.isDependentOn(node)) {
      const currentWeight = this.parent?.getWeight(this) || 0;
      this.parent?._detach(this);
      node.parent?.addDependent(this, currentWeight);
      node.parent?._detach(node);
      this.addDependent(node, weight, exclusive);
      return;
    }
    if (exclusive) {
      Object.values(this._dependents).forEach((dependency) => {
        this.removeDependent(dependency.node);
        node.addDependent(dependency.node, dependency.weight);
      });
    }
    this._dependents[node.id] = { node, weight };
    node.parent = this;
  }

  private getWeight(node: StreamNode): number {
    const dependency = this._dependents[node.id];
    return dependency ? dependency.weight : 0;
  }

  private _detach(node: StreamNode) {
    const detached = this._dependents[node.id];
    delete this._dependents[node.id];
    node.parent = null;
    return detached;
  }

  removeDependent(child: StreamNode) {
    const { weight } = this._detach(child);

    const totalWeight = Object.values(this._dependents).reduce(
      (total, dependency) => total + dependency.weight,
      0
    );
    let weightToDistribute = weight;
    if (weight < totalWeight) {
      weightToDistribute = totalWeight;
    }

    Object.values(child.dependents).forEach((dependency) => {
      this.addDependent(
        dependency.node,
        dependency.weight * (1 + weightToDistribute / totalWeight)
      );
    });
  }

  get dependents(): Readonly<StreamNode["_dependents"]> {
    return this._dependents;
  }
}

export const getRootNode = () => new StreamNode(0);
