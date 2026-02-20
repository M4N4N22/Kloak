"use client";

import { FC, ReactNode, useEffect, useState } from "react";
import { AleoWalletProvider } from "@provablehq/aleo-wallet-adaptor-react";
import { WalletModalProvider } from "@provablehq/aleo-wallet-adaptor-react-ui";
import { Network } from "@provablehq/aleo-types";

export const KloakWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [wallets, setWallets] = useState<any[]>([]);

  useEffect(() => {
    async function loadWallets() {
      const { LeoWalletAdapter } = await import(
        "@provablehq/aleo-wallet-adaptor-leo"
      );
      const { ShieldWalletAdapter } = await import(
        "@provablehq/aleo-wallet-adaptor-shield"
      );

      setWallets([
        new LeoWalletAdapter(),
        new ShieldWalletAdapter(),
      ]);
    }

    loadWallets();
  }, []);

  if (!wallets.length) return null;

  return (
    <AleoWalletProvider
      wallets={wallets}
      autoConnect={false}
      network={Network.TESTNET}
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </AleoWalletProvider>
  );
};