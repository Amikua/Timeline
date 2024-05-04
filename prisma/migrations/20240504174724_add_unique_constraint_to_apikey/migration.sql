/*
  Warnings:

  - A unique constraint covering the columns `[userId,projectId]` on the table `ApiKey` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_userId_projectId_key" ON "ApiKey"("userId", "projectId");
