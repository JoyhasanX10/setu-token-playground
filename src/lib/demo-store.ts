import { useEffect, useState } from "react";

export const BDT_PER_USDT = 122.5; // demo rate
export const TOKENS = {
  BTC: { name: "Bitcoin", price: 72480.32, change: 2.41, color: "oklch(0.75 0.17 60)" },
  ETH: { name: "Ethereum", price: 3842.17, change: 1.87, color: "oklch(0.62 0.17 275)" },
  BNB: { name: "BNB Chain", price: 645.32, change: 2.45, color: "oklch(0.82 0.16 85)" },
  SOL: { name: "Solana", price: 198.45, change: 3.21, color: "oklch(0.7 0.2 310)" },
} as const;
export type TokenSym = keyof typeof TOKENS;

export type Tx = {
  id: string;
  type: "deposit" | "convert" | "swap";
  title: string;
  detail: string;
  at: number;
};

export type DemoState = {
  wallet: string | null;
  bdt: number;
  usdt: number;
  tokens: Record<TokenSym, number>;
  txs: Tx[];
};

const KEY = "setu-labs-demo-v1";
export const initialState: DemoState = {
  wallet: null,
  bdt: 0,
  usdt: 0,
  tokens: { BTC: 0, ETH: 0, BNB: 0, SOL: 0 },
  txs: [],
};

const tx = (type: Tx["type"], title: string, detail: string): Tx => ({
  id: Math.random().toString(36).slice(2, 10),
  type,
  title,
  detail,
  at: Date.now(),
});

export function applyDeposit(s: DemoState, bdt: number, method: string): DemoState {
  if (!(bdt > 0)) throw new Error("Enter an amount greater than 0");
  return { ...s, bdt: s.bdt + bdt, txs: [tx("deposit", `Deposited ৳${fmt(bdt)}`, `via ${method}`), ...s.txs] };
}

export function applyConvert(s: DemoState, bdt: number): DemoState {
  if (!(bdt > 0)) throw new Error("Enter an amount greater than 0");
  if (bdt > s.bdt + 1e-9) throw new Error("Not enough BDT balance");
  const usdt = bdt / BDT_PER_USDT;
  return {
    ...s,
    bdt: s.bdt - bdt,
    usdt: s.usdt + usdt,
    txs: [tx("convert", `Converted ৳${fmt(bdt)} → ${fmt(usdt)} USDT`, `Rate 1 USDT = ৳${BDT_PER_USDT}`), ...s.txs],
  };
}

/** direction "buy": spend USDT for token; "sell": sell token for USDT */
export function applySwap(s: DemoState, sym: TokenSym, amount: number, direction: "buy" | "sell"): DemoState {
  if (!(amount > 0)) throw new Error("Enter an amount greater than 0");
  const price = TOKENS[sym].price;
  if (direction === "buy") {
    if (amount > s.usdt + 1e-9) throw new Error("Not enough USDT balance");
    const got = amount / price;
    return {
      ...s,
      usdt: s.usdt - amount,
      tokens: { ...s.tokens, [sym]: s.tokens[sym] + got },
      txs: [tx("swap", `Swapped ${fmt(amount)} USDT → ${fmt(got, 6)} ${sym}`, `@ $${fmt(price)}`), ...s.txs],
    };
  }
  if (amount > s.tokens[sym] + 1e-12) throw new Error(`Not enough ${sym} balance`);
  const got = amount * price;
  return {
    ...s,
    usdt: s.usdt + got,
    tokens: { ...s.tokens, [sym]: s.tokens[sym] - amount },
    txs: [tx("swap", `Swapped ${fmt(amount, 6)} ${sym} → ${fmt(got)} USDT`, `@ $${fmt(price)}`), ...s.txs],
  };
}

export function totalUsdt(s: DemoState) {
  return s.usdt + (Object.keys(s.tokens) as TokenSym[]).reduce((a, k) => a + s.tokens[k] * TOKENS[k].price, 0);
}

export function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: Math.min(d, 2), maximumFractionDigits: d });
}

export function useDemoStore() {
  const [state, setState] = useState<DemoState>(initialState);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initialState, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, loaded]);
  const update = (fn: (s: DemoState) => DemoState): string | null => {
    try {
      setState(fn(state));
      return null;
    } catch (e) {
      return (e as Error).message;
    }
  };
  return { state, setState, update };
}
