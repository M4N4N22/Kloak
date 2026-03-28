CREATE TABLE "CreatorProfile" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "isProUser" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CreatorProfile_walletAddress_key" ON "CreatorProfile"("walletAddress");
CREATE INDEX "CreatorProfile_walletAddress_idx" ON "CreatorProfile"("walletAddress");
