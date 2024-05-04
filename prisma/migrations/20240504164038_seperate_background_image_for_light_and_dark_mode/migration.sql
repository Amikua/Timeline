/*
  Warnings:

  - You are about to drop the column `backgroundImage` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "backgroundImage",
ADD COLUMN     "backgroundImageDarkMode" TEXT,
ADD COLUMN     "backgroundImageLigthMode" TEXT;
