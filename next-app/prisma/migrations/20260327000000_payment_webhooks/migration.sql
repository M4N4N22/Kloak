ALTER TABLE "PaymentLink"
ADD COLUMN "webhookUrl" TEXT,
ADD COLUMN "webhookSecret" TEXT;

CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "responseStatus" INTEGER,
    "responseBody" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WebhookDelivery_linkId_idx" ON "WebhookDelivery"("linkId");
CREATE INDEX "WebhookDelivery_eventType_idx" ON "WebhookDelivery"("eventType");
CREATE UNIQUE INDEX "Payment_txHash_key" ON "Payment"("txHash");

ALTER TABLE "WebhookDelivery"
ADD CONSTRAINT "WebhookDelivery_linkId_fkey"
FOREIGN KEY ("linkId") REFERENCES "PaymentLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
