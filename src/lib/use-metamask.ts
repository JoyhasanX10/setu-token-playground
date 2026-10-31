import { useEffect, useRef, useState } from "react";
import { firstAccount, injectedMetaMask, requestConnection, walletError, type EthereumProvider } from "./metamask";

export function useMetaMask() {
  const [provider, setProvider] = useState<EthereumProvider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = useRef(true);
  const pending = useRef(false);
  const revision = useRef(0);

  useEffect(() => {
    const announce = (event: Event) => {
      const detail = (event as CustomEvent<{ info?: { rdns?: string }; provider?: EthereumProvider }>).detail;
      if (detail?.info?.rdns === "io.metamask" && detail.provider) setProvider(detail.provider);
    };
    window.addEventListener("eip6963:announceProvider", announce);
    setProvider((current) => current ?? injectedMetaMask());
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    return () => window.removeEventListener("eip6963:announceProvider", announce);
  }, []);

  useEffect(() => {
    if (!provider) return;
    let mounted = true;
    const version = revision.current;
    const accountsChanged = (accounts: unknown) => {
      revision.current += 1;
      if (mounted && active.current) setAddress(firstAccount(accounts));
    };
    const disconnected = () => {
      revision.current += 1;
      if (mounted) setAddress(null);
    };
    provider.on?.("accountsChanged", accountsChanged);
    provider.on?.("disconnect", disconnected);
    void provider.request({ method: "eth_accounts" }).then((accounts) => {
      if (mounted && active.current && revision.current === version) setAddress(firstAccount(accounts));
    }).catch(() => {});
    return () => {
      mounted = false;
      provider.removeListener?.("accountsChanged", accountsChanged);
      provider.removeListener?.("disconnect", disconnected);
    };
  }, [provider]);

  const connect = async (): Promise<string | null> => {
    if (pending.current) return null;
    const selected = provider ?? injectedMetaMask();
    if (!selected) {
      setError("MetaMask isn't installed. Install MetaMask from metamask.io, then reopen this page in that browser.");
      return null;
    }
    pending.current = true;
    active.current = true;
    revision.current += 1;
    setConnecting(true);
    setError(null);
    try {
      // This request starts directly in the click handler, opening the wallet's own approval popup.
      const account = await requestConnection(selected);
      setProvider(selected);
      setAddress(account);
      return account;
    } catch (err) {
      setError(walletError(err));
      return null;
    } finally {
      pending.current = false;
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    if (pending.current) return;
    pending.current = true;
    active.current = false;
    revision.current += 1;
    setAddress(null);
    setError(null);
    setDisconnecting(true);
    try {
      await provider?.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] });
    } catch {
      // Older wallets cannot revoke permissions: the site still disconnects locally.
    } finally {
      pending.current = false;
      setDisconnecting(false);
    }
  };

  return { address, connecting, disconnecting, error, connect, disconnect };
}