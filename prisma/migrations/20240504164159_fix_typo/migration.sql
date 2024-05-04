/*
  Warnings:

  - You are about to drop the column `backgroundImageLigthMode` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "backgroundImageLigthMode",
ADD COLUMN     "backgroundImageLightMode" TEXT;
