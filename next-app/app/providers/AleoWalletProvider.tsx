"use client";

import { FC, ReactNode, useMemo } from "react";
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import {
    DecryptPermission,
    WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";

import "@demox-labs/aleo-wallet-adapter-reactui/styles.css";

export const AleoWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const wallets = useMemo(
        () => [
            new LeoWalletAdapter({
                appName: "Kloak",
            }),
        ],
        []
    );

    return (
        <WalletProvider
            wallets={wallets}
            autoConnect={false}
            decryptPermission={DecryptPermission.UponRequest}
            network={WalletAdapterNetwork.TestnetBeta}
        >

            <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
    );
};
