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
    disconnect,
  } = useWallet();

  const [shouldConnectShield, setShouldConnectShield] = useState(false);

  const handleConnectShield = () => {
    const shield = wallets.find((w) =>
      w.adapter?.name?.toLowerCase().includes("shield")
    );

    if (!shield) {
      alert("Shield Wallet extension not found. Please install it to continue.");
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
    <section className={`py-12 px-6 border-b transition-all duration-500 ${connected ? 'bg-white' : 'bg-[#fafafa]'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-6">
          
          {/* Header */}
          <div className="space-y-2">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#015FFD] font-bold">
              {connected ? "Session Authenticated" : "Wallet Connection"}
            </h3>
            <h2 className="text-xl font-medium text-black">
              {connected ? "Identity Linked" : "Access the Distribution"}
            </h2>
          </div>

          {!connected ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-[#666666] text-sm max-w-md mx-auto leading-relaxed">
                Connect your Aleo wallet to verify eligibility and generate 
                private claim proofs. We recommend using <span className="text-black font-semibold">Shield Wallet</span> for 
                seamless ZK-proof generation.
              </p>

              <button
                onClick={handleConnectShield}
                disabled={connecting}
                className="group relative bg-black text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#015FFD] transition-all disabled:opacity-50"
              >
                <span className="relative z-10">
                  {connecting ? "Initializing..." : "Connect Shield Wallet"}
                </span>
                <div className="absolute inset-0 bg-[#015FFD] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>
              
              <div className="flex justify-center items-center gap-4 text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Aleo Testnet
                </span>
                <span className="w-1px h-3 bg-gray-200" />
                <span>BHP256 Support</span>
              </div>
            </div>
          ) : (
            /* Connected Account Dashboard */
            <div className="flex flex-col md:flex-row items-center gap-4 bg-gray-50 border border-gray-100 p-2 rounded-full animate-in zoom-in-95">
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono font-medium text-gray-600">
                  {getShortAddress(address || "")}
                </span>
              </div>
              
              <div className="hidden md:block w-1px h-4 bg-gray-200" />

              <button 
                onClick={() => disconnect()}
                className="text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-red-500 transition-colors px-4"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}