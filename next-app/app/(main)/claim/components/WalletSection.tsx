"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import { Network } from "@provablehq/aleo-types";
import { getShortAddress } from "@provablehq/aleo-wallet-adaptor-core";

export default function WalletSection() {
  const {
    wallets,
    wallet,
    address,
    connected,
    connecting,
    selectWallet,
    connect,
  } = useWallet();

  const [shouldConnectShield, setShouldConnectShield] = useState(false);

  const handleConnectShield = () => {
    const shield = wallets.find((w) =>
      w.adapter?.name?.toLowerCase().includes("shield")
    );

    if (!shield) {
      console.error("Shield wallet not found");
      return;
    }

    selectWallet(shield.adapter.name);
    setShouldConnectShield(true);
  };

  useEffect(() => {
    const connectShield = async () => {
      if (
        shouldConnectShield &&
        wallet &&
        wallet.adapter.name.toLowerCase().includes("shield") &&
        !connected &&
        !connecting
      ) {
        try {
          await connect(Network.TESTNET);
        } catch (err) {
          console.error("Shield connection error:", err);
        } finally {
          setShouldConnectShield(false);
        }
      }
    };

    connectShield();
  }, [wallet, shouldConnectShield, connected, connecting, connect]);

  return (
    <section className="py-16 px-6 border-b border-[#eeeeee] bg-[#fafafa]">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h3 className="text-sm uppercase tracking-widest text-[#015FFD] font-bold">
          Wallet Connection Required
        </h3>

        {!connected ? (
          <>
            <p className="text-[#666666] max-w-xl mx-auto">
              Connect your wallet to proceed. For best compatibility,
              please use <span className="font-medium text-[#111111]">Shield Wallet</span>.
            </p>

            <button
              onClick={handleConnectShield}
              disabled={connecting}
              className="bg-[#015FFD] text-white px-6 py-3 text-sm font-medium hover:bg-[#0052db] transition-colors disabled:opacity-50"
            >
              {connecting ? "Connecting..." : "Connect Shield Wallet"}
            </button>
          </>
        ) : (
          <>
            <div className="inline-block px-4 py-2 border border-[#111111] text-sm font-mono">
              {getShortAddress(address || "")}
            </div>
          </>
        )}
      </div>
    </section>
  );
}