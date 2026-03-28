-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterEnum
ALTER TYPE "Token" ADD VALUE 'USAD';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "payerAddress" TEXT,
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "telegramId" TEXT;

-- AlterTable
ALTER TABLE "PaymentLink" ADD COLUMN     "createdViaBot" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telegramChatId" TEXT,
ADD COLUMN     "telegramMessageId" TEXT;

-- CreateTable
CREATE TABLE "PayerStats" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT,
    "walletAddress" TEXT,
    "totalPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalPayments" INTEGER NOT NULL DEFAULT 0,
    "lastPaymentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayerStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionMetadata" (
    "id" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "explorerUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramUser" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "walletAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramSession" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PayerStats_telegramId_idx" ON "PayerStats"("telegramId");

-- CreateIndex
CREATE INDEX "PayerStats_walletAddress_idx" ON "PayerStats"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionMetadata_txHash_key" ON "TransactionMetadata"("txHash");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramUser_telegramId_key" ON "TelegramUser"("telegramId");

-- CreateIndex
CREATE INDEX "TelegramSession_telegramId_idx" ON "TelegramSession"("telegramId");

-- CreateIndex
CREATE INDEX "Payment_telegramId_idx" ON "Payment"("telegramId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "TelegramUser"("telegramId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelegramSession" ADD CONSTRAINT "TelegramSession_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "TelegramUser"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;
