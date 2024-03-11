import { AddUserToProject } from "~/components/custom/AddUserToProject";
import { db } from "~/server/db";
export default async function Page({
  params: { projectId },
}: {
  params: { projectId: string };
}) {
  const users = await db.user.findMany({
    where: { NOT: { projects: { some: { id: projectId } } } },
  });
  return (
    <AddUserToProject users={users} projectId={projectId}></AddUserToProject>
  );

  //alert dialog
}
