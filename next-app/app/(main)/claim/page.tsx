"use client";

import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import { useState } from "react";

import WalletSection from "./components/WalletSection";
import StepGenerateSecret from "./components/StepGenerateSecret";
import StepExecuteClaim from "./components/StepExecuteClaim";

export default function ClaimFlow() {
  const { address } = useWallet();

  const [secret, setSecret] = useState<string | null>(null);
  const [commitment, setCommitment] = useState<string | null>(null);

  return (
    <div className="space-y-16">
      <WalletSection />

      <StepGenerateSecret
        address={address}
        onGenerated={(s, c) => {
          setSecret(s);
          setCommitment(c);
        }}
      />

      <StepExecuteClaim
        address={address}
        secret={secret}
        commitment={commitment}
      />
    </div>
  );
}