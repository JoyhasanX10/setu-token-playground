import { describe, it, expect } from "vitest";
import { applyConvert, applyDeposit, applySwap, initialState, BDT_PER_USDT } from "./demo-store";

describe("demo store", () => {
  it("deposit adds BDT", () => {
    expect(applyDeposit(initialState, 1000, "bKash").bdt).toBe(1000);
  });
  it("convert uses demo rate", () => {
    const s = applyConvert(applyDeposit(initialState, 1225, "bKash"), 1225);
    expect(s.usdt).toBeCloseTo(1225 / BDT_PER_USDT);
    expect(s.bdt).toBe(0);
  });
  it("cannot convert more BDT than owned", () => {
    expect(() => applyConvert(initialState, 10)).toThrow();
  });
  it("swap only spends existing USDT", () => {
    expect(() => applySwap(initialState, "BTC", 5, "buy")).toThrow();
  });
});
