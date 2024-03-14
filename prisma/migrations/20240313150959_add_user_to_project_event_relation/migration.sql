-- AddForeignKey
ALTER TABLE "ProjectEvent" ADD CONSTRAINT "ProjectEvent_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
