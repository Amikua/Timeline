import { AddUserToProject } from "~/components/custom/AddUserToProject";
import { UserList } from "~/components/custom/UserList";
import { db } from "~/server/db";
import { Fragment } from "react";

export default async function Page({
  params: { projectId },
}: {
  params: { projectId: string };
}) {
  const usersNotInProejct = await db.user.findMany({
    where: { NOT: { projects: { some: { id: projectId } } } },
  });
  return (
    <Fragment>
      <div className="text-center">
        <h1 className="mb-2">Add users to the project.</h1>
        <AddUserToProject
          users={usersNotInProejct}
          projectId={projectId}
        ></AddUserToProject>
      </div>
      <UserList projectId={projectId}></UserList>
    </Fragment>
  );
}
