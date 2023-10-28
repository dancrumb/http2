import { Frame } from "./frame.ts";

export const enum DataFrameFlags {
  NONE = 0x0,
  END_STREAM = 0x1,
  PADDED = 0x8,
}

export class DataFrame extends Frame<Uint8Array, DataFrameFlags> {
  readonly type = 0;
  private paddingLength = 0;
  constructor(id: DataFrame["id"], flags: DataFrame["flags"]) {
    super(id, 0, flags);
  }
  get length() {
    return (
      this.paddingLength +
      (this.paddingLength > 0 ? 1 : 0) +
      (this.payload ? this.payload.length : 0)
    );
  }

  setPayload(payload: Uint8Array) {
    this.payload = payload;
  }

  setPaddingLength(length: number) {
    this.paddingLength = length;
  }

  getFrame(): Uint8Array {
    if (this.paddingLength > 0) {
      this.flags |= DataFrameFlags.PADDED;
    }
    const frame = this.getFrameHeader();

    if (this.paddingLength > 0) {
      frame.push(this.paddingLength);
    }
    frame.push(...(this.payload ?? []));
    for (let i = 0; i < this.paddingLength; i++) {
      frame.push(0);
    }
    return new Uint8Array(frame);
  }

  static fromBytes(bytes: number[]) {
    const type = bytes[3];

    if (type !== 0) {
      return null;
    }

    const flags = bytes[4];
    const id = (bytes[5] << 24) + (bytes[6] << 16) + (bytes[7] << 8) + bytes[8];
    const frame = new DataFrame(id, flags);
    if (flags & DataFrameFlags.PADDED) {
      frame.setPaddingLength(bytes[9]);
    }

    const length = (bytes[0] << 16) + (bytes[1] << 8) + bytes[2];
    frame.setPayload(new Uint8Array(bytes.slice(10, 9 + length - bytes[9])));
    return frame;
  }
}
