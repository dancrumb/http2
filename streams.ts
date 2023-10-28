import { StreamNode, getRootNode } from "./dependency/stream_node.ts";
import { getStreamState } from "./stream-state.ts";

export class ConnectionStreams {
  private priorityTree: StreamNode;
  private streamStates: Record<number, ReturnType<typeof getStreamState>> = {};
  private nextStreamId = 1;
  private maxConcurrentStreams = 100;

  constructor() {
    this.priorityTree = getRootNode();
  }

  private countStreams() {
    return Object.values(this.streamStates).reduce((count, streamService) => {
      if (
        streamService.state === "Open" ||
        /Half Closed/.test(streamService.state)
      ) {
        return count + 1;
      }
      return count;
    }, 0);
  }

  public initiateStream() {
    if (this.countStreams() >= this.maxConcurrentStreams) {
      throw new Error("Max concurrent streams exceeded");
    }
    const stream = new StreamNode(this.nextStreamId);
    this.nextStreamId += 2;
    this.priorityTree.addDependent(stream);
    this.streamStates[stream.id] = getStreamState();

    return stream;
  }
}
