/*
  Warnings:

  - Added the required column `category` to the `ProjectEvent` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('ISSUE', 'BUG', 'FEATURES', 'WIP', 'ZAP');

-- AlterTable
ALTER TABLE "ProjectEvent" ADD COLUMN     "category" "Category" NOT NULL;
