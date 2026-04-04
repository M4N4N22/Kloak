-- AlterTable
ALTER TABLE "Payment"
ADD COLUMN "merchantAddress" TEXT,
ADD COLUMN "receiptCommitment" TEXT,
ADD COLUMN "receiptOwner" TEXT;

-- AlterTable
ALTER TABLE "SelectiveDisclosureProof"
RENAME COLUMN "txHash" TO "paymentTxHash";

ALTER TABLE "SelectiveDisclosureProof"
DROP COLUMN "signature",
ADD COLUMN "commitment" TEXT NOT NULL DEFAULT '',
ADD COLUMN "contractProgram" TEXT NOT NULL DEFAULT 'kloak_protocol_v8.aleo',
ADD COLUMN "disclosureTxHash" TEXT,
ADD COLUMN "nullifier" TEXT,
ADD COLUMN "ownerAddress" TEXT NOT NULL DEFAULT '',
ADD COLUMN "proofPayload" JSONB,
ADD COLUMN "proverAddress" TEXT NOT NULL DEFAULT '';

-- DropIndex
DROP INDEX IF EXISTS "SelectiveDisclosureProof_txHash_idx";

-- CreateIndex
CREATE INDEX "SelectiveDisclosureProof_paymentTxHash_idx" ON "SelectiveDisclosureProof"("paymentTxHash");
CREATE INDEX "SelectiveDisclosureProof_disclosureTxHash_idx" ON "SelectiveDisclosureProof"("disclosureTxHash");
CREATE INDEX "SelectiveDisclosureProof_proverAddress_idx" ON "SelectiveDisclosureProof"("proverAddress");
