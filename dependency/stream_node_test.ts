import { assertEquals } from "https://deno.land/std@0.196.0/assert/mod.ts";
import { describe, it } from "https://deno.land/std@0.196.0/testing/bdd.ts";
import { StreamNode, getRootNode } from "./stream_node.ts";
import { traverse } from "./traverse.ts";

describe("StreamNode", () => {
  describe("isDependencyOf", () => {
    it("returns true if the node depends on the given node", () => {
      const node1 = new StreamNode(1);
      const node2 = new StreamNode(2);
      const RootNode = getRootNode();
      RootNode.addDependent(node1, 1);
      node1.addDependent(node2, 1);
      assertEquals(node2.isDependentOn(node1), true);
    });
    it("returns falls if the node does not depend on the given node", () => {
      const node1 = new StreamNode(1);
      const node2 = new StreamNode(2);
      const RootNode = getRootNode();
      RootNode.addDependent(node1, 1);
      node1.addDependent(node2, 1);
      assertEquals(node1.isDependentOn(node2), false);
    });
  });
  it("should be able to add a dependency", () => {
    const node1 = new StreamNode(1);
    const RootNode = getRootNode();
    RootNode.addDependent(node1, 1);
    const nodeIds: number[] = [];
    traverse({ node: RootNode, weight: 1 }, (node, weight) => {
      nodeIds.push(node.id);
    });
    assertEquals(nodeIds, [0, 1]);
  });
  it("should be able to remove a dependency", () => {
    const node1 = new StreamNode(1);
    const RootNode = getRootNode();
    RootNode.addDependent(node1, 1);
    const nodeIds: number[] = [];
    traverse({ node: RootNode, weight: 1 }, (node, weight) => {
      nodeIds.push(node.id);
    });
    assertEquals(nodeIds, [0, 1]);
    RootNode.removeDependent(node1);

    nodeIds.length = 0;
    traverse({ node: RootNode, weight: 1 }, (node, weight) => {
      nodeIds.push(node.id);
    });
    assertEquals(nodeIds, [0]);
  });
  it("should be able to add a dependency to a dependency", () => {
    const node1 = new StreamNode(1);
    const node2 = new StreamNode(2);
    const RootNode = getRootNode();
    RootNode.addDependent(node1, 1);
    node1.addDependent(node2, 1);
    const nodeIds: number[] = [];
    traverse({ node: RootNode, weight: 1 }, (node, weight) => {
      nodeIds.push(node.id);
    });
    assertEquals(nodeIds, [0, 1, 2]);
  });
  it("should be able to remove a dependency from a dependency", () => {
    const node1 = new StreamNode(1);
    const node2 = new StreamNode(2);
    const RootNode = getRootNode();
    RootNode.addDependent(node1, 1);
    node1.addDependent(node2, 1);
    const nodeIds: number[] = [];
    traverse({ node: RootNode, weight: 1 }, (node, weight) => {
      nodeIds.push(node.id);
    });
    assertEquals(nodeIds, [0, 1, 2]);
    node1.removeDependent(node2);
    nodeIds.length = 0;
    traverse({ node: RootNode, weight: 1 }, (node, weight) => {
      nodeIds.push(node.id);
    });
    assertEquals(nodeIds, [0, 1]);
  });
  it("should be able to remove a dependency between dependencies", () => {
    const node1 = new StreamNode(1);
    const node2 = new StreamNode(2);
    const RootNode = getRootNode();
    RootNode.addDependent(node1, 1);
    node1.addDependent(node2, 1);
    const nodeIds: number[] = [];
    traverse({ node: RootNode, weight: 1 }, (node, weight) => {
      nodeIds.push(node.id);
    });
    assertEquals(nodeIds, [0, 1, 2]);

    RootNode.removeDependent(node1);
    nodeIds.length = 0;
    traverse({ node: RootNode, weight: 1 }, (node, weight) => {
      nodeIds.push(node.id);
    });
    assertEquals(nodeIds, [0, 2]);
  });
  it("should support multiple dependencies", () => {
    const RootNode = getRootNode();
    RootNode.addDependent(new StreamNode(1), 1);
    RootNode.addDependent(new StreamNode(2), 1);
    RootNode.addDependent(new StreamNode(3), 1);
    const nodeIds: number[] = [];
    traverse({ node: RootNode, weight: 1 }, (node, weight) => {
      nodeIds.push(node.id);
    });
    assertEquals(nodeIds, [0, 1, 2, 3]);
  });
  it("supports adding exclusive dependencies", () => {
    const RootNode = getRootNode();
    RootNode.addDependent(new StreamNode(1), 1);
    RootNode.addDependent(new StreamNode(2), 1);
    RootNode.addDependent(new StreamNode(3), 1);
    const nodeIds: number[] = [];
    traverse({ node: RootNode, weight: 1 }, (node) => {
      nodeIds.push(node.id);
    });
    assertEquals(nodeIds, [0, 1, 2, 3]);
    assertEquals(Object.keys(RootNode.dependents).length, 3);
    RootNode.addDependent(new StreamNode(4), 1, true);
    nodeIds.length = 0;
    traverse({ node: RootNode, weight: 1 }, (node) => {
      nodeIds.push(node.id);
    });
    assertEquals(nodeIds, [0, 4, 1, 2, 3]);
    assertEquals(Object.keys(RootNode.dependents).length, 1);
  });
  it("handles 5.3.3 from the spec (non-exclusive)", () => {
    //see https://datatracker.ietf.org/doc/html/rfc7540#section-5.3.3
    const RootNode = getRootNode();
    const A = new StreamNode(1);
    RootNode.addDependent(A, 1);
    A.addDependent(new StreamNode(3), 1);
    const C = new StreamNode(5);
    A.addDependent(C, 1);
    const D = new StreamNode(7);
    const E = new StreamNode(9);
    const F = new StreamNode(11);
    C.addDependent(D, 1);
    C.addDependent(E, 1);
    D.addDependent(F, 1);
    const nodeIds: number[] = [];
    traverse({ node: RootNode, weight: 1 }, (node) => {
      nodeIds.push(node.id);
    });
    assertEquals(nodeIds, [0, 1, 3, 5, 7, 9, 11]);

    D.addDependent(A, 1);
    nodeIds.length = 0;
    traverse({ node: RootNode, weight: 1 }, (node) => {
      nodeIds.push(node.id);
    });
    assertEquals(nodeIds, [0, 7, 1, 11, 3, 5, 9]);
  });
  it("handles 5.3.3 from the spec (exclusive)", () => {
    //see https://datatracker.ietf.org/doc/html/rfc7540#section-5.3.3
    const RootNode = getRootNode();
    const A = new StreamNode(1);
    RootNode.addDependent(A, 1);
    A.addDependent(new StreamNode(3), 1);
    const C = new StreamNode(5);
    A.addDependent(C, 1);
    const D = new StreamNode(7);
    const E = new StreamNode(9);
    const F = new StreamNode(11);
    C.addDependent(D, 1);
    C.addDependent(E, 1);
    D.addDependent(F, 1);
    const nodeIds: number[] = [];
    traverse({ node: RootNode, weight: 1 }, (node) => {
      nodeIds.push(node.id);
    });
    assertEquals(nodeIds, [0, 1, 3, 5, 7, 9, 11]);

    D.addDependent(A, 1, true);
    nodeIds.length = 0;
    traverse({ node: RootNode, weight: 1 }, (node) => {
      nodeIds.push(node.id);
    });
    assertEquals(nodeIds, [0, 7, 1, 3, 5, 11, 9]);
  });
});
