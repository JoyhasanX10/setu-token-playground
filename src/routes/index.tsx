import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Toaster, toast } from "sonner";
import {
  Bell, Wallet, Home, PlusCircle, ArrowLeftRight, Repeat, Layers, Settings, LineChart,
  ArrowRight, ChevronRight, Eye, EyeOff, X, History, Plus, LogOut, Menu, Trash2,
} from "lucide-react";
import heroCoin from "@/assets/hero-coin.jpg";
import setuLogo from "@/assets/setu-logo.png";
import {
  useDemoStore, TOKENS, type TokenSym, BDT_PER_USDT, fmt, totalUsdt,
  applyDeposit, applyConvert, applySwap, initialState,
} from "@/lib/demo-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Setu Labs — Deposit BDT, Convert to USDT, Swap Tokens (Demo)" },
      { name: "description", content: "Setu Labs demo dashboard: simulate BDT deposits, convert to USDT and swap BTC, ETH, BNB, SOL. No real money." },
      { property: "og:title", content: "Setu Labs — Demo Dashboard" },
      { property: "og:description", content: "Deposit BDT. Convert to USDT. Swap any token. Demo mode only." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Modal = null | "wallet" | "deposit" | "convert" | "swap" | "history" | "settings";

const NETWORKS = [
  { name: "BNB Chain", tags: "Fast • Low Fee", color: "oklch(0.82 0.16 85)" },
  { name: "Ethereum", tags: "Secure • Widely Used", color: "oklch(0.62 0.17 275)" },
  { name: "Polygon", tags: "Low Fee • Scalable", color: "oklch(0.6 0.2 300)" },
  { name: "Arbitrum", tags: "Fast • EVM Compatible", color: "oklch(0.6 0.13 240)" },
  { name: "Base", tags: "Low Fee • Growing", color: "oklch(0.6 0.2 260)" },
];

function TokenDot({ sym, color, size = 36 }: { sym: string; color: string; size?: number }) {
  return (
    <div className="grid shrink-0 place-items-center rounded-full text-xs font-bold text-background"
      style={{ width: size, height: size, background: color }}>{sym.slice(0, 1)}</div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img src={setuLogo} alt="Setu Labs logo" width={40} height={40} className="h-10 w-10" />
      <span className="text-xl font-bold tracking-wide">SETU <span className="font-normal text-primary-glow">LABS</span></span>
    </div>
  );
}

function Dashboard() {
  const { state, setState, update } = useDemoStore();
  const [modal, setModal] = useState<Modal>(null);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const total = totalUsdt(state);

  const needWallet = (m: Modal) => {
    if (!state.wallet) { setModal("wallet"); toast.info("Connect the demo wallet first"); return; }
    setModal(m);
  };

  const nav: { label: string; icon: typeof Home; action: () => void; active?: boolean }[] = [
    { label: "Dashboard", icon: Home, action: () => setModal(null), active: true },
    { label: "Deposit", icon: PlusCircle, action: () => needWallet("deposit") },
    { label: "Convert", icon: ArrowLeftRight, action: () => needWallet("convert") },
    { label: "Swap", icon: Repeat, action: () => needWallet("swap") },
    { label: "History", icon: History, action: () => setModal("history") },
    { label: "Networks", icon: Layers, action: () => document.getElementById("networks")?.scrollIntoView({ behavior: "smooth" }) },
    { label: "Settings", icon: Settings, action: () => setModal("settings") },
  ];

  const WalletBtn = ({ big }: { big?: boolean }) =>
    state.wallet ? (
      <button onClick={() => setModal("wallet")} className={`flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium hover:bg-accent ${big ? "" : ""}`}>
        <span className="h-2 w-2 rounded-full bg-success" />{state.wallet.slice(0, 6)}…{state.wallet.slice(-4)}
      </button>
    ) : (
      <button onClick={() => setModal("wallet")} className="btn-primary flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium">
        <Wallet className="h-4 w-4" /> Connect Wallet {big && <ArrowRight className="h-4 w-4" />}
      </button>
    );

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" position="top-center" richColors />
      <div className="sticky top-0 z-30 bg-warning py-1 text-center text-xs font-bold tracking-widest text-background">
        ● DEMO MODE — no real money, crypto or blockchain transactions
      </div>

      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button className="lg:hidden" aria-label="Menu" onClick={() => setMenu(!menu)}><Menu className="h-6 w-6" /></button>
          <Logo />
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <button aria-label="Transaction history" onClick={() => setModal("history")} className="relative text-primary-glow">
            <Bell className="h-6 w-6" />
            {state.txs.length > 0 && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary-glow" />}
          </button>
          <WalletBtn />
        </div>
      </header>

      <div className="grid gap-5 p-4 md:p-5 lg:grid-cols-[200px_minmax(0,1fr)_220px] xl:grid-cols-[200px_minmax(0,1fr)_240px]">
        {/* Sidebar */}
        <aside className={`${menu ? "block" : "hidden"} space-y-5 lg:block`}>
          <nav className="space-y-1">
            {nav.map((n) => (
              <button key={n.label} onClick={() => { n.action(); setMenu(false); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${n.active ? "glow-border border bg-accent font-semibold" : "text-foreground/90 hover:bg-secondary"}`}>
                <n.icon className="h-5 w-5" /> {n.label}
              </button>
            ))}
          </nav>
          <div className="glass-card p-4">
            <div className="mb-3 flex items-center justify-between text-sm font-semibold">
              <span className="flex items-center gap-2"><LineChart className="h-4 w-4" />Live Price</span>
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="space-y-3">
              {(Object.keys(TOKENS) as TokenSym[]).map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <TokenDot sym={k} color={TOKENS[k].color} size={28} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{k}</div>
                    <div className="truncate text-[10px] text-muted-foreground">{TOKENS[k].name}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div>${fmt(TOKENS[k].price)}</div>
                    <div className="text-success">+{TOKENS[k].change}%</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground">Demo prices</p>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 space-y-5">
          <section className="glass-card relative overflow-hidden fade-up">
            <img src={heroCoin} alt="Setu Labs coin" width={1280} height={640} className="absolute inset-0 h-full w-full object-cover object-right opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
            <div className="relative p-6 md:p-7">
              <p className="text-sm text-muted-foreground">Welcome to</p>
              <h1 className="text-4xl font-bold md:text-5xl">Setu <span className="text-gradient">Labs</span></h1>
              <p className="mt-2 text-sm">Deposit BDT. Convert to USDT. Swap any token.</p>
              <p className="mt-1 text-xs text-muted-foreground">Local Payment → USDT Conversion → Token Swap → Your Wallet</p>
              <div className="mt-5"><WalletBtn big /></div>
            </div>
          </section>

          <section className="glass-card glow-border relative overflow-hidden p-6 fade-up [animation-delay:80ms]">
            <div className="flex items-center gap-3 text-lg">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/25"><Wallet className="h-5 w-5 text-primary-glow" /></div>
              Total Balance
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span key={`${hidden}-${total}`} className="balance-pop text-4xl font-bold md:text-5xl">{hidden ? "••••" : `$${fmt(total)}`}</span>
              <button aria-label="Toggle balance" onClick={() => setHidden(!hidden)} className="text-muted-foreground">
                {hidden ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
              </button>
            </div>
            <p className="mt-1 text-muted-foreground">≈ {hidden ? "••••" : fmt(state.usdt)} USDT available</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Chip>BDT ৳{hidden ? "••" : fmt(state.bdt)}</Chip>
              {(Object.keys(TOKENS) as TokenSym[]).filter((k) => state.tokens[k] > 0).map((k) => (
                <Chip key={k}>{k} {hidden ? "••" : fmt(state.tokens[k], 6)}</Chip>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <button onClick={() => needWallet("deposit")} className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-3.5 font-medium hover:-translate-y-0.5 hover:bg-accent hover:shadow-lg sm:col-span-1">
                <PlusCircle className="h-5 w-5" />Deposit
              </button>
              <button onClick={() => needWallet("swap")} className="btn-primary flex items-center justify-center gap-2 rounded-xl py-3.5 font-medium hover:-translate-y-0.5">
                <Repeat className="h-5 w-5" />Swap
              </button>
              <button onClick={() => needWallet("convert")} className="flex items-center justify-center gap-2 rounded-xl border border-primary/60 bg-secondary py-3.5 font-medium hover:-translate-y-0.5 hover:bg-accent hover:shadow-lg">
                <ArrowLeftRight className="h-5 w-5" />Convert
              </button>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-3 fade-up [animation-delay:160ms]">
            {[
              { t: "Deposit", d: "Add funds using local payment methods", i: PlusCircle, m: "deposit" as Modal },
              { t: "Convert to USDT", d: "Turn your BDT to USDT instantly", i: ArrowLeftRight, m: "convert" as Modal },
              { t: "Swap Tokens", d: "Trade tokens directly from your wallet", i: Repeat, m: "swap" as Modal },
            ].map((c) => (
              <button key={c.t} onClick={() => needWallet(c.m)} className="glass-card motion-control flex items-start gap-3 p-4 text-left hover:-translate-y-0.5 hover:glow-border">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent"><c.i className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{c.t}</div>
                  <div className="text-xs text-muted-foreground">{c.d}</div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0" />
              </button>
            ))}
          </section>

          <section className="glass-card p-5 fade-up [animation-delay:240ms]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Recent Transactions</h2>
              <button onClick={() => setModal("history")} className="text-xs text-primary-glow">View all</button>
            </div>
            <TxList txs={state.txs.slice(0, 5)} />
          </section>
        </main>

        {/* Right */}
        <aside id="networks" className="glass-card h-fit p-4 fade-up [animation-delay:160ms]">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Supported Networks</h2>
            <span className="text-xs text-primary-glow">Demo</span>
          </div>
          <div className="divide-y divide-border">
            {NETWORKS.map((n) => (
              <button key={n.name} onClick={() => toast(`${n.name} selected (demo)`)} className="flex w-full items-center gap-3 py-3 text-left">
                <TokenDot sym={n.name} color={n.color} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{n.name}</div>
                  <div className="text-[11px] text-muted-foreground">{n.tags}</div>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
            ))}
            <div className="flex items-center gap-3 py-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-accent"><Plus className="h-5 w-5" /></div>
              <div><div className="text-sm font-medium">More Networks</div><div className="text-[11px] text-muted-foreground">Coming Soon</div></div>
            </div>
          </div>
        </aside>
      </div>

      {modal === "wallet" && (
        <ModalShell title="Demo Wallet" onClose={() => setModal(null)}>
          {state.wallet ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Connected demo address</p>
              <p className="break-all rounded-lg bg-secondary p-3 font-mono text-sm">{state.wallet}</p>
              <button onClick={() => { setState({ ...state, wallet: null }); setModal(null); toast("Demo wallet disconnected"); }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-3 hover:bg-secondary"><LogOut className="h-4 w-4" />Disconnect</button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">This creates a fake wallet address for testing. Setu Labs will <b>never</b> ask for your private key or seed phrase.</p>
              {["Demo MetaMask", "Demo Trust Wallet", "Demo WalletConnect"].map((w) => (
                <button key={w} onClick={() => {
                  const addr = "0x" + Array.from({ length: 40 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
                  setState({ ...state, wallet: addr }); setModal(null); toast.success(`${w} connected`);
                }} className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary p-3 hover:bg-accent">
                  <span className="flex items-center gap-2"><Wallet className="h-4 w-4" />{w}</span><ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>
          )}
        </ModalShell>
      )}

      {modal === "deposit" && (
        <DepositModal onClose={() => setModal(null)} onSubmit={(amt, method) => {
          const err = update((s) => applyDeposit(s, amt, method));
          if (err) { toast.error(err); return; }
          toast.success(`৳${fmt(amt)} deposited (demo)`); setModal(null);
        }} />
      )}
      {modal === "convert" && (
        <ConvertModal bdt={state.bdt} onClose={() => setModal(null)} onDeposit={() => setModal("deposit")} onSubmit={(amt) => {
          const err = update((s) => applyConvert(s, amt));
          if (err) { toast.error(err); return; }
          toast.success(`Converted to ${fmt(amt / BDT_PER_USDT)} USDT`); setModal(null);
        }} />
      )}
      {modal === "swap" && (
        <SwapModal usdt={state.usdt} tokens={state.tokens} onClose={() => setModal(null)} onSubmit={(sym, amt, dir) => {
          const err = update((s) => applySwap(s, sym, amt, dir));
          if (err) { toast.error(err); return; }
          toast.success("Swap complete (demo)"); setModal(null);
        }} />
      )}
      {modal === "history" && (
        <ModalShell title="Transaction History" onClose={() => setModal(null)}>
          <div className="max-h-[60vh] overflow-y-auto"><TxList txs={state.txs} /></div>
        </ModalShell>
      )}
      {modal === "settings" && (
        <ModalShell title="Settings" onClose={() => setModal(null)}>
          <p className="mb-4 text-sm text-muted-foreground">All data is stored only in this browser.</p>
          <button onClick={() => { if (confirm("Reset all demo balances and history?")) { setState(initialState); setModal(null); toast("Demo data reset"); } }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive py-3 text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />Reset demo data
          </button>
        </ModalShell>
      )}
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-border bg-secondary px-3 py-1">{children}</span>;
}

function TxList({ txs }: { txs: { id: string; type: string; title: string; detail: string; at: number }[] }) {
  if (!txs.length) return <p className="py-6 text-center text-sm text-muted-foreground">No transactions yet. Try a demo deposit!</p>;
  const icon = { deposit: PlusCircle, convert: ArrowLeftRight, swap: Repeat } as const;
  return (
    <ul className="divide-y divide-border">
      {txs.map((t, idx) => {
        const I = icon[t.type as keyof typeof icon];
        return (
          <li key={t.id} className="flex items-center gap-3 py-3 fade-up" style={{ animationDelay: `${Math.min(idx, 4) * 45}ms` }}>
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent"><I className="h-4 w-4" /></div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{t.title}</div>
              <div className="text-[11px] text-muted-foreground">{t.detail} • {new Date(t.at).toLocaleString()}</div>
            </div>
            <span className="shrink-0 rounded bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">DEMO</span>
          </li>
        );
      })}
    </ul>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="modal-backdrop fixed inset-0 z-50 grid place-items-end bg-background/70 backdrop-blur-sm sm:place-items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="modal-panel glass-card glow-border w-full max-w-md bg-card p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button aria-label="Close" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        {children}
        <p className="mt-4 text-center text-[10px] font-semibold tracking-widest text-warning">DEMO MODE • SIMULATED ONLY</p>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-input bg-secondary px-3 py-3 text-lg outline-none focus:border-primary";

function DepositModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (a: number, m: string) => void }) {
  const [amt, setAmt] = useState("");
  const [method, setMethod] = useState("bKash");
  return (
    <ModalShell title="Deposit BDT" onClose={onClose}>
      <div className="mb-3 grid grid-cols-3 gap-2">
        {["bKash", "Nagad", "Bank"].map((m) => (
          <button key={m} onClick={() => setMethod(m)} className={`rounded-lg border py-2 text-sm ${method === m ? "glow-border bg-accent" : "border-border bg-secondary"}`}>{m}</button>
        ))}
      </div>
      <input className={inputCls} type="number" inputMode="decimal" placeholder="Amount in ৳" value={amt} onChange={(e) => setAmt(e.target.value)} />
      <div className="mt-2 flex gap-2">
        {[500, 1000, 5000, 10000].map((v) => <button key={v} onClick={() => setAmt(String(v))} className="flex-1 rounded-md bg-secondary py-1 text-xs hover:bg-accent">৳{v}</button>)}
      </div>
      <button onClick={() => onSubmit(Number(amt), method)} className="btn-primary mt-4 w-full rounded-lg py-3 font-semibold">Simulate Deposit</button>
    </ModalShell>
  );
}

function ConvertModal({ bdt, onClose, onSubmit, onDeposit }: { bdt: number; onClose: () => void; onSubmit: (a: number) => void; onDeposit: () => void }) {
  const [amt, setAmt] = useState("");
  const n = Number(amt) || 0;
  return (
    <ModalShell title="Convert BDT → USDT" onClose={onClose}>
      <div className="mb-2 flex justify-between text-xs text-muted-foreground">
        <span>Available: ৳{fmt(bdt)}</span>
        <button className="text-primary-glow" onClick={() => setAmt(String(bdt))}>Max</button>
      </div>
      <input className={inputCls} type="number" inputMode="decimal" placeholder="BDT amount" value={amt} onChange={(e) => setAmt(e.target.value)} />
      <div className="mt-3 rounded-lg bg-secondary p-3 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">You receive</span><b>{fmt(n / BDT_PER_USDT, 4)} USDT</b></div>
        <div className="flex justify-between text-xs text-muted-foreground"><span>Demo rate</span><span>1 USDT = ৳{BDT_PER_USDT}</span></div>
      </div>
      {bdt <= 0 && <button onClick={onDeposit} className="mt-3 w-full text-sm text-primary-glow">No BDT yet — make a demo deposit →</button>}
      <button onClick={() => onSubmit(n)} className="btn-primary mt-4 w-full rounded-lg py-3 font-semibold">Convert</button>
    </ModalShell>
  );
}

function SwapModal({ usdt, tokens, onClose, onSubmit }: {
  usdt: number; tokens: Record<TokenSym, number>; onClose: () => void; onSubmit: (s: TokenSym, a: number, d: "buy" | "sell") => void;
}) {
  const [sym, setSym] = useState<TokenSym>("BNB");
  const [dir, setDir] = useState<"buy" | "sell">("buy");
  const [amt, setAmt] = useState("");
  const n = Number(amt) || 0;
  const price = TOKENS[sym].price;
  const avail = dir === "buy" ? usdt : tokens[sym];
  const fromSym = dir === "buy" ? "USDT" : sym;
  const toSym = dir === "buy" ? sym : "USDT";
  const out = dir === "buy" ? n / price : n * price;
  return (
    <ModalShell title="Swap Tokens" onClose={onClose}>
      <div className="mb-3 grid grid-cols-4 gap-2">
        {(Object.keys(TOKENS) as TokenSym[]).map((k) => (
          <button key={k} onClick={() => setSym(k)} className={`flex items-center justify-center gap-1 rounded-lg border py-2 text-sm ${sym === k ? "glow-border bg-accent" : "border-border bg-secondary"}`}>
            <TokenDot sym={k} color={TOKENS[k].color} size={18} />{k}
          </button>
        ))}
      </div>
      <div className="rounded-lg bg-secondary p-3">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>From {fromSym}</span>
          <button className="text-primary-glow" onClick={() => setAmt(String(avail))}>Max {fmt(avail, 6)}</button>
        </div>
        <input className="w-full bg-transparent text-2xl outline-none" type="number" inputMode="decimal" placeholder="0.0" value={amt} onChange={(e) => setAmt(e.target.value)} />
      </div>
      <div className="-my-2 flex justify-center">
        <button aria-label="Flip direction" onClick={() => { setDir(dir === "buy" ? "sell" : "buy"); setAmt(""); }}
          className="relative z-10 grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:bg-accent"><Repeat className="h-4 w-4 rotate-90" /></button>
      </div>
      <div className="rounded-lg bg-secondary p-3">
        <div className="mb-1 text-xs text-muted-foreground">To {toSym}</div>
        <div className="text-2xl">{fmt(out, 6)}</div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Demo price: 1 {sym} = ${fmt(price)}</p>
      <button onClick={() => onSubmit(sym, n, dir)} className="btn-primary mt-4 w-full rounded-lg py-3 font-semibold">Swap</button>
    </ModalShell>
  );
}
