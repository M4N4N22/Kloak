-- AlterTable
ALTER TABLE "SelectiveDisclosureProof" ALTER COLUMN "commitment" DROP DEFAULT,
ALTER COLUMN "contractProgram" DROP DEFAULT,
ALTER COLUMN "ownerAddress" DROP DEFAULT,
ALTER COLUMN "proverAddress" DROP DEFAULT;
