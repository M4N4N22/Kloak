-- CreateTable
CREATE TABLE "CampaignEscrow" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "recordCiphertext" TEXT NOT NULL,
    "recordPlaintext" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignEscrow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignEscrow_campaignId_key" ON "CampaignEscrow"("campaignId");

-- AddForeignKey
ALTER TABLE "CampaignEscrow" ADD CONSTRAINT "CampaignEscrow_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
