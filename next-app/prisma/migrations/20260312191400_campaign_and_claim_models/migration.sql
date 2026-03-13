-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "depth" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "totalRecipients" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "txHash" TEXT,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Claim_campaignId_address_key" ON "Claim"("campaignId", "address");

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
