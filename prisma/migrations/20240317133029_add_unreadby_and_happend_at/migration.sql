-- AlterTable
ALTER TABLE "ProjectEvent" ADD COLUMN     "happendAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "_UnreadProjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UnreadProjects_AB_unique" ON "_UnreadProjects"("A", "B");

-- CreateIndex
CREATE INDEX "_UnreadProjects_B_index" ON "_UnreadProjects"("B");

-- AddForeignKey
ALTER TABLE "_UnreadProjects" ADD CONSTRAINT "_UnreadProjects_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UnreadProjects" ADD CONSTRAINT "_UnreadProjects_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
