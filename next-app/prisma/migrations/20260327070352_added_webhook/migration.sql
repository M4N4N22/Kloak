-- AlterTable
ALTER TABLE "PaymentLink" ADD COLUMN     "telegramId" TEXT,
ALTER COLUMN "creatorAddress" DROP NOT NULL;
