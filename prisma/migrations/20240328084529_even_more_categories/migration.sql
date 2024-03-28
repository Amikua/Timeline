-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Category" ADD VALUE 'AMBULANCE';
ALTER TYPE "Category" ADD VALUE 'ROCKET';
ALTER TYPE "Category" ADD VALUE 'CHECKMARK';
ALTER TYPE "Category" ADD VALUE 'LOCK';
ALTER TYPE "Category" ADD VALUE 'PENCIL';
ALTER TYPE "Category" ADD VALUE 'REWIND';
ALTER TYPE "Category" ADD VALUE 'BULB';
ALTER TYPE "Category" ADD VALUE 'SPEECH';
ALTER TYPE "Category" ADD VALUE 'PHONE';
ALTER TYPE "Category" ADD VALUE 'RUBBISH';
