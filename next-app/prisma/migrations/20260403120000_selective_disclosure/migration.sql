-- CreateEnum
CREATE TYPE "SelectiveDisclosureProofStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateTable
CREATE TABLE "SelectiveDisclosureProof" (
    "id" TEXT NOT NULL,
    "proofId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "creatorAddress" TEXT NOT NULL,
    "constraints" JSONB NOT NULL,
    "signature" TEXT NOT NULL,
    "status" "SelectiveDisclosureProofStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    CONSTRAINT "SelectiveDisclosureProof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectiveDisclosureVerification" (
    "id" TEXT NOT NULL,
    "proofId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "verifier" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SelectiveDisclosureVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SelectiveDisclosureProof_proofId_key" ON "SelectiveDisclosureProof"("proofId");

-- CreateIndex
CREATE INDEX "SelectiveDisclosureProof_paymentId_idx" ON "SelectiveDisclosureProof"("paymentId");
CREATE INDEX "SelectiveDisclosureProof_txHash_idx" ON "SelectiveDisclosureProof"("txHash");
CREATE INDEX "SelectiveDisclosureProof_requestId_idx" ON "SelectiveDisclosureProof"("requestId");
CREATE INDEX "SelectiveDisclosureProof_creatorAddress_idx" ON "SelectiveDisclosureProof"("creatorAddress");
CREATE INDEX "SelectiveDisclosureProof_status_idx" ON "SelectiveDisclosureProof"("status");
CREATE INDEX "SelectiveDisclosureVerification_proofId_idx" ON "SelectiveDisclosureVerification"("proofId");
CREATE INDEX "SelectiveDisclosureVerification_createdAt_idx" ON "SelectiveDisclosureVerification"("createdAt");

-- AddForeignKey
ALTER TABLE "SelectiveDisclosureProof" ADD CONSTRAINT "SelectiveDisclosureProof_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SelectiveDisclosureVerification" ADD CONSTRAINT "SelectiveDisclosureVerification_proofId_fkey" FOREIGN KEY ("proofId") REFERENCES "SelectiveDisclosureProof"("proofId") ON DELETE CASCADE ON UPDATE CASCADE;
