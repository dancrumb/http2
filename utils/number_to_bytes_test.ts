import { assertEquals } from "https://deno.land/std@0.196.0/assert/mod.ts";
import { describe, it } from "https://deno.land/std@0.196.0/testing/bdd.ts";
import { numberToBytes } from "./number_to_bytes.ts";

describe("number_to_bytes", () => {
  it("converts 0 to 0", () => {
    assertEquals(numberToBytes(0), [0]);
    assertEquals(numberToBytes(0, 4), [0, 0, 0, 0]);
  });
  it("handles 1 byte", () => {
    assertEquals(numberToBytes(1), [1]);
  });
  it("handles 2 bytes", () => {
    assertEquals(numberToBytes(256), [1, 0]);
  });
  it("handles 4 bytes", () => {
    assertEquals(numberToBytes(16777216), [1, 0, 0, 0]);
  });
  it("supports a length", () => {
    assertEquals(numberToBytes(1, 4), [0, 0, 0, 1]);
    assertEquals(numberToBytes(1, 3), [0, 0, 1]);
    assertEquals(numberToBytes(1, 2), [0, 1]);
  });
});
