CREATE TABLE "WebhookEndpoint" (
    "id" TEXT NOT NULL,
    "creatorAddress" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WebhookEndpoint_creatorAddress_idx" ON "WebhookEndpoint"("creatorAddress");
CREATE UNIQUE INDEX "WebhookEndpoint_creatorAddress_url_key" ON "WebhookEndpoint"("creatorAddress", "url");

INSERT INTO "WebhookEndpoint" ("id", "creatorAddress", "url", "secret", "active", "createdAt", "updatedAt")
SELECT
    md5(random()::text || clock_timestamp()::text || "creatorAddress" || "webhookUrl"),
    "creatorAddress",
    "webhookUrl",
    "webhookSecret",
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT "creatorAddress", "webhookUrl", "webhookSecret"
    FROM "PaymentLink"
    WHERE "creatorAddress" IS NOT NULL
      AND "webhookUrl" IS NOT NULL
) migrated_webhooks;

ALTER TABLE "WebhookDelivery"
ADD COLUMN "endpointId" TEXT;

UPDATE "WebhookDelivery" wd
SET "endpointId" = we."id"
FROM "WebhookEndpoint" we
JOIN "PaymentLink" pl ON pl."creatorAddress" = we."creatorAddress"
WHERE wd."linkId" = pl."id"
  AND wd."targetUrl" = we."url"
  AND wd."endpointId" IS NULL;

DELETE FROM "WebhookDelivery"
WHERE "endpointId" IS NULL;

ALTER TABLE "WebhookDelivery"
ALTER COLUMN "endpointId" SET NOT NULL;

CREATE INDEX "WebhookDelivery_endpointId_idx" ON "WebhookDelivery"("endpointId");

ALTER TABLE "WebhookDelivery"
ADD CONSTRAINT "WebhookDelivery_endpointId_fkey"
FOREIGN KEY ("endpointId") REFERENCES "WebhookEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PaymentLink"
DROP COLUMN "webhookUrl",
DROP COLUMN "webhookSecret";
