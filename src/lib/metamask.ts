export interface EthereumProvider {
  isMetaMask?: boolean;
  providers?: EthereumProvider[];
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
}

export function injectedMetaMask(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
  return ethereum?.providers?.find((provider) => provider.isMetaMask)
    ?? (ethereum?.isMetaMask ? ethereum : null);
}

export function firstAccount(accounts: unknown): string | null {
  if (!Array.isArray(accounts)) return null;
  const account: unknown = accounts[0];
  return typeof account === "string" && /^0x[0-9a-f]{40}$/i.test(account) ? account : null;
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export async function requestConnection(provider: EthereumProvider): Promise<string> {
  const account = firstAccount(await provider.request({ method: "eth_requestAccounts" }));
  if (!account) throw new Error("No account was connected. Please unlock MetaMask and try again.");
  return account;
}

export function walletError(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error ? error.code : null;
  if (code === 4001) return "Connection cancelled. You can connect MetaMask whenever you're ready.";
  if (code === -32002) return "A connection request is already open. Please check your MetaMask popup.";
  return "Unable to connect to MetaMask. Please unlock your wallet and try again.";
}