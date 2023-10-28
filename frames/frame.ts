import { numberToBytes } from "../utils/number_to_bytes.ts";

export class Frame<P, F extends number> {
  readonly id: number;
  type: number;
  flags: F;
  payload: P | null = null;

  constructor(id: number, type: number, flags: F) {
    this.id = id;
    this.type = type;
    this.flags = flags;
  }

  get length() {
    return 0;
  }

  getFrameHeader() {
    const frameHeader: number[] = [];
    frameHeader.push(...numberToBytes(this.length, 3));
    frameHeader.push(this.type);
    frameHeader.push(this.flags);
    frameHeader.push(...numberToBytes(this.id & ~0x80000000, 4));
    return frameHeader;
  }
}
