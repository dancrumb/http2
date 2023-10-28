import { assertEquals } from "https://deno.land/std@0.196.0/assert/mod.ts";
import { describe, it } from "https://deno.land/std@0.196.0/testing/bdd.ts";

import { DataFrame, DataFrameFlags } from "./data_frame.ts";

describe("DataFrame", () => {
  it("it can be instantiated with no payload", () => {
    const frame = new DataFrame(1, 0);
    const frameOctets = frame.getFrame();
    assertEquals(frameOctets, new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1]));
  });
  it("it supports padding", () => {
    const frame = new DataFrame(1, 0);
    frame.setPaddingLength(3);
    const frameOctets = frame.getFrame();
    assertEquals(
      frameOctets,
      new Uint8Array([0, 0, 4, 0, 8, 0, 0, 0, 1, 3, 0, 0, 0])
    );
  });
  it("supports a payload", () => {
    const frame = new DataFrame(1, 0);
    frame.setPaddingLength(4);
    frame.setPayload(new Uint8Array([1, 2, 3, 4]));
    const frameOctets = frame.getFrame();
    assertEquals(
      frameOctets,
      new Uint8Array([0, 0, 9, 0, 8, 0, 0, 0, 1, 4, 1, 2, 3, 4, 0, 0, 0, 0])
    );
  });
  it("can be instantiated from bytes", () => {
    const frame = DataFrame.fromBytes([
      0, 0, 9, 0, 8, 0, 0, 0, 1, 4, 1, 2, 3, 4, 0, 0, 0, 0,
    ]);
    assertEquals(frame?.id, 1);
    assertEquals(frame?.type, 0);
    assertEquals(frame?.flags, DataFrameFlags.PADDED);
    assertEquals(frame?.payload, new Uint8Array([1, 2, 3, 4]));
  });
  it("can be instantiated from bytes (empty)", () => {
    const frame = DataFrame.fromBytes([0, 0, 0, 0, 0, 0, 0, 0, 1]);
    assertEquals(frame?.id, 1);
    assertEquals(frame?.type, 0);
    assertEquals(frame?.flags, DataFrameFlags.NONE);
    assertEquals(frame?.payload, new Uint8Array([]));
  });
  it("can be instantiated from bytes (empty + padded)", () => {
    const frame = DataFrame.fromBytes([0, 0, 4, 0, 8, 0, 0, 0, 1, 3, 0, 0, 0]);
    assertEquals(frame?.id, 1);
    assertEquals(frame?.type, 0);
    assertEquals(frame?.flags, DataFrameFlags.PADDED);
    assertEquals(frame?.payload, new Uint8Array([]));
  });
  it("returns null if bytes are not a data frame", () => {
    const frame = DataFrame.fromBytes([0, 0, 0, 9, 0, 0, 0, 0, 2]);
    assertEquals(frame, null);
  });
});
