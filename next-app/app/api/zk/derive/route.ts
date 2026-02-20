import { NextResponse } from "next/server";
import {
  generateDeterministicSecret,
  computeCommitment,
} from "@/core/zk";

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const start = Date.now();

  try {
    console.log(`[ZK-DERIVE][${requestId}] Incoming request`);

    const { address } = await req.json();

    if (!address) {
      console.warn(
        `[ZK-DERIVE][${requestId}] Missing address in request`
      );

      return NextResponse.json(
        { error: "Missing address" },
        { status: 400 }
      );
    }

    console.log(
      `[ZK-DERIVE][${requestId}] Deriving for address: ${address.slice(
        0,
        10
      )}...`
    );

    // Deterministic secret (shared logic from core)
    const secret = generateDeterministicSecret(address);

    // Commitment = hash1(secret)
    const commitment = computeCommitment(secret);

    const duration = Date.now() - start;

    console.log(
      `[ZK-DERIVE][${requestId}] Success in ${duration}ms`
    );

    console.log(
      `[ZK-DERIVE][${requestId}] Secret: ${secret
        .toString()
        .slice(0, 20)}...`
    );

    console.log(
      `[ZK-DERIVE][${requestId}] Commitment: ${commitment
        .toString()
        .slice(0, 20)}...`
    );

    return NextResponse.json({
      secret: secret.toString(),
      commitment: commitment.toString(),
      requestId,
      durationMs: duration,
    });
  } catch (err: any) {
    const duration = Date.now() - start;

    console.error(
      `[ZK-DERIVE][${requestId}] Failed after ${duration}ms`,
      err
    );

    return NextResponse.json(
      { error: "Derivation failed", requestId },
      { status: 500 }
    );
  }
}