import { UserList } from "~/components/custom/UserList";
import { AddUserToProject } from "~/components/custom/AddUserToProject";
import { db } from "~/server/db";
import Link from "next/link";

function GoBackToProject({ projectId }: { projectId: string }) {
  return (
    <Link href={`/dashboard/${projectId}`} className="absolute right-4 top-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        className="size-8 text-foreground hover:brightness-75"
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="m2.87 7.75l1.97 1.97a.75.75 0 1 1-1.06 1.06L.53 7.53L0 7l.53-.53l3.25-3.25a.75.75 0 0 1 1.06 1.06L2.87 6.25h9.88a3.25 3.25 0 0 1 0 6.5h-2a.75.75 0 0 1 0-1.5h2a1.75 1.75 0 1 0 0-3.5z"
          clipRule="evenodd"
        ></path>
      </svg>
    </Link>
  );
}

export default async function Page({
  params: { projectId },
}: {
  params: { projectId: string };
}) {
  const usersNotInProejct = await db.user.findMany({
    where: { NOT: { projects: { some: { id: projectId } } } },
  });
  return (
    <>
      <GoBackToProject projectId={projectId} />
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
    </>
  );
}
