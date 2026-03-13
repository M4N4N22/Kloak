"use client";

import { FC, ReactNode, useMemo } from "react";

import { AleoWalletProvider } from "@provablehq/aleo-wallet-adaptor-react";
import { WalletModalProvider } from "@provablehq/aleo-wallet-adaptor-react-ui";

import { Network } from "@provablehq/aleo-types";
import { DecryptPermission } from "@provablehq/aleo-wallet-adaptor-core";

import { LeoWalletAdapter } from "@provablehq/aleo-wallet-adaptor-leo";
import { ShieldWalletAdapter } from "@provablehq/aleo-wallet-adaptor-shield";

export const KloakWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {

  const wallets = useMemo(
    () => [
      new LeoWalletAdapter(),
      new ShieldWalletAdapter(),
    ],
    []
  );

  return (
    <AleoWalletProvider
      wallets={wallets}
      autoConnect
      network={Network.TESTNET}
      decryptPermission={DecryptPermission.UponRequest}
      programs={[
        "credits.aleo",
        "kloak_protocol_v5.aleo"
      ]}
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </AleoWalletProvider>
  );
};