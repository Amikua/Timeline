import { UserList } from "~/components/custom/UserList";
import { AddUserToProject } from "~/components/custom/AddUserToProject";
import { db } from "~/server/db";

export default async function Page({
  params: { projectId },
}: {
  params: { projectId: string };
}) {
  const usersNotInProejct = await db.user.findMany({
    where: { NOT: { projects: { some: { id: projectId } } } },
  });
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="w-[45vh] rounded-xl border p-4 shadow-md">
        <h1 className="mb-2 text-2xl font-bold text-white">
          Add a user to the project
        </h1>
        <h2 className="mb-4 text-lg text-white">
          Enter the username of the user you want to add to the project.
        </h2>
        <AddUserToProject users={usersNotInProejct} projectId={projectId} />
      </div>
      <div className="mt-2 flex w-[45vh] flex-col items-start justify-start rounded-xl border p-4 shadow-md">
        <h1 className="mb-2 text-2xl font-bold text-white">Current users</h1>
        <div className="flex w-full flex-1 items-center justify-center">
          <UserList projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
