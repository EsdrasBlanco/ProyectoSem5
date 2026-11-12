-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "createdAt" SET DATA TYPE DATE,
ALTER COLUMN "updatedAt" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "medics" ALTER COLUMN "createdAt" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "patients" ALTER COLUMN "createdAt" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "createdAt" SET DATA TYPE DATE;
