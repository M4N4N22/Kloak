/*
  Warnings:

  - You are about to drop the column `totalAmount` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the `Claim` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `asset` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalBudget` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('PENDING', 'CREATED', 'FUNDED');

-- DropForeignKey
ALTER TABLE "Claim" DROP CONSTRAINT "Claim_campaignId_fkey";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "totalAmount",
ADD COLUMN     "asset" INTEGER NOT NULL,
ADD COLUMN     "claimedAmount" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "claimedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "CampaignStatus" NOT NULL,
ADD COLUMN     "totalBudget" BIGINT NOT NULL,
ALTER COLUMN "totalRecipients" DROP DEFAULT;

-- DropTable
DROP TABLE "Claim";

-- CreateTable
CREATE TABLE "MerkleProofStore" (
    "lookupHash" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "payout" BIGINT NOT NULL,
    "proofData" JSONB NOT NULL,

    CONSTRAINT "MerkleProofStore_pkey" PRIMARY KEY ("lookupHash")
);

-- CreateTable
CREATE TABLE "ClaimNullifier" (
    "nullifier" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimNullifier_pkey" PRIMARY KEY ("nullifier")
);

-- CreateIndex
CREATE INDEX "MerkleProofStore_campaignId_idx" ON "MerkleProofStore"("campaignId");

-- CreateIndex
CREATE INDEX "ClaimNullifier_campaignId_idx" ON "ClaimNullifier"("campaignId");

-- CreateIndex
CREATE INDEX "Campaign_creatorAddress_idx" ON "Campaign"("creatorAddress");

-- AddForeignKey
ALTER TABLE "MerkleProofStore" ADD CONSTRAINT "MerkleProofStore_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimNullifier" ADD CONSTRAINT "ClaimNullifier_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
