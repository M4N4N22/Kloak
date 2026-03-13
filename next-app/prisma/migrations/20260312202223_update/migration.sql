-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "creationTxHash" TEXT,
ADD COLUMN     "fundingTxHash" TEXT,
ADD COLUMN     "poolAmount" BIGINT NOT NULL DEFAULT 0;
