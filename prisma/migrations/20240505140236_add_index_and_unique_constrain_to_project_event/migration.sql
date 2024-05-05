/*
  Warnings:

  - A unique constraint covering the columns `[projectId,happendAt]` on the table `ProjectEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "happendAt_projectId_index" ON "ProjectEvent"("happendAt", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectEvent_projectId_happendAt_key" ON "ProjectEvent"("projectId", "happendAt");
