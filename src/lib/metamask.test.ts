import { describe, expect, it, vi } from "vitest";
import { firstAccount, injectedMetaMask, requestConnection, shortAddress, walletError } from "./metamask";

const address = "0x123456789012345678901234567890123456abcd";

describe("real MetaMask connection", () => {
  it("requests approval using the standard Ethereum provider API only", async () => {
    const request = vi.fn().mockResolvedValue([address]);
    expect(await requestConnection({ request })).toBe(address);
    expect(request.mock.calls).toEqual([[{ method: "eth_requestAccounts" }]]);
  });
  it("does not fabricate a connection when approval returns no accounts", async () => {
    await expect(requestConnection({ request: vi.fn().mockResolvedValue([]) })).rejects.toThrow("No account");
    expect(firstAccount(["fake-wallet"])).toBeNull();
  });
  it("does not replace a rejected connection with a fake address", async () => {
    await expect(requestConnection({ request: vi.fn().mockRejectedValue({ code: 4001 }) })).rejects.toEqual({ code: 4001 });
  });
  it("shortens the address to the first six and last four characters", () => {
    expect(shortAddress(address)).toBe("0x1234…abcd");
  });
  it("selects MetaMask rather than another injected wallet", () => {
    const metamask = { isMetaMask: true, request: vi.fn() };
    vi.stubGlobal("window", { ethereum: { providers: [{ request: vi.fn() }, metamask] } });
    expect(injectedMetaMask()).toBe(metamask);
    vi.unstubAllGlobals();
  });
  it("returns no provider when MetaMask is missing", () => {
    vi.stubGlobal("window", {});
    expect(injectedMetaMask()).toBeNull();
    vi.unstubAllGlobals();
  });
  it("handles rejected and pending requests", () => {
    expect(walletError({ code: 4001 })).toContain("cancelled");
    expect(walletError({ code: -32002 })).toContain("already open");
  });
});