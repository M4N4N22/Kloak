import { useState } from "react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import { computeNullifier } from "@/core/zk";

export function useClaimGrant(PROGRAM_ID: string) {
  const { executeTransaction, transactionStatus } = useWallet();
  const [status, setStatus] = useState<"idle" | "proving" | "broadcasting" | "completed" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const executeClaim = async (proofData: any, effectiveSecret: string) => {
    try {
      setStatus("proving");
      
      const ensureField = (v: string) => v.endsWith("field") ? v : `${v}field`;
      const ensureU64 = (v: string | number) => v.toString().endsWith("u64") ? v.toString() : `${v}u64`;

      const inputs = [
        ensureField(proofData.merkleRoot),
        ensureU64(proofData.payout),
        ensureField(effectiveSecret),
        ensureField(proofData.proof.s1),
        ensureField(proofData.proof.s2),
        ensureField(proofData.proof.s3),
        proofData.proof.d1.toString(),
        proofData.proof.d2.toString(),
        proofData.proof.d3.toString(),
      ];

      const result = await executeTransaction({
        program: PROGRAM_ID,
        function: "claim",
        inputs,
        privateFee: false,
      });

      if (result?.transactionId) {
        setStatus("broadcasting");
        return result.transactionId;
      }
    } catch (err: any) {
      setStatus("error");
      if (err.message.includes("assertion failed")) {
        setErrorMsg("Double Claim Detected: This grant has already been nullified on-chain.");
      } else {
        setErrorMsg(err.message || "Proving failed. Check wallet balance.");
      }
    }
  };

  return { executeClaim, status, setStatus, errorMsg, setErrorMsg };
}