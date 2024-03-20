import { AddUserToProject } from "~/components/custom/AddUserToProject";
import { db } from "~/server/db";
import Link from "next/link";
import Image from "next/image";
import { type User } from "lucia";
import { validateRequest } from "~/lib/auth";
import { redirect } from "next/navigation";
import { RemoveUserFromProject } from "~/components/custom/RemoveUserFromProject";
import { DeleteProject } from "~/components/custom/DeleteProject";
import { ChangeProjectStatus } from "~/components/custom/ChangeProjectStatus";

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

function DisplayUser({
  user,
  isCurrentUser,
  projectId,
  disabledRemoveButton,
}: {
  user: User;
  isCurrentUser: boolean;
  projectId: string;
  disabledRemoveButton: boolean;
}) {
  return (
    <div
      className={`flex justify-between pb-4 ${isCurrentUser && "mb-2 border-b border-muted"}`}
    >
      <div className="flex items-center gap-4">
        <Image
          src={user.avatarUrl}
          alt="Current user avatar"
          width={40}
          height={40}
          className="size-10 rounded-full"
        />
        <div>
          <h1>{user.username}</h1>
          <h2>{user.email}</h2>
        </div>
      </div>
      <RemoveUserFromProject
        disabled={disabledRemoveButton}
        projectId={projectId}
        user={user}
        text={isCurrentUser ? "Leave" : "Remove"}
      />
    </div>
  );
}

export default async function Page({
  params: { projectId },
}: {
  params: { projectId: string };
}) {
  const { user: currentUser } = await validateRequest();
  if (!currentUser) {
    return redirect("/");
  }

  const usersNotInProject = await db.user.findMany({
    where: { NOT: { projects: { some: { id: projectId } } } },
  });

  const allUsers = await db.user.findMany({
    where: { projects: { some: { id: projectId } } },
  });

  const project = await db.project.findFirst({
    where: { id: projectId },
    select: { isActive: true },
  });
  if (!project) {
    return redirect("/");
  }

  const disabledRemoveButton = allUsers.length < 2;

  return (
    <div className="max-h-full min-h-full min-w-full max-w-full rounded-2xl shadow-lg shadow-secondary">
      <GoBackToProject projectId={projectId} />
      <h1 className="mx-auto w-11/12 border-b-2 border-secondary px-16 py-10 text-center text-4xl font-bold">
        Project Settings
      </h1>
      <div className="grid grid-cols-1 gap-4 px-16 py-12 xl:grid-cols-2 xl:gap-0">
        <div className="flex flex-col gap-8">
          <div className="flex w-full flex-col gap-4">
            <h1 className="text-2xl font-bold">Add New User</h1>
            <h2 className="text-lg">
              Enter the username of the user to add to the project.
            </h2>
            <AddUserToProject users={usersNotInProject} projectId={projectId} />
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Project Status</h1>
            <h2 className="text-lg">
              This project is currently{" "}
              {project.isActive ? "active" : "archived"}.
            </h2>
            <ChangeProjectStatus
              user={currentUser}
              projectId={projectId}
              isActive={project.isActive}
            >
              {project.isActive ? "Finish" : "Reactivate"}
            </ChangeProjectStatus>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Delete Project </h1>
            <h2 className="text-lg">This action cannot be undone.</h2>
            <DeleteProject
              user={currentUser}
              projectId={projectId}
            ></DeleteProject>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Current Users</h1>
          <h2 className="text-lg">
            These are the currenct users of your project.
          </h2>
          <div className="flex flex-col gap-4 overflow-y-auto">
            <DisplayUser
              user={currentUser}
              isCurrentUser={true}
              disabledRemoveButton={disabledRemoveButton}
              projectId={projectId}
            />
            {allUsers
              .filter((user) => user.username !== currentUser.username)
              .map((user) => (
                <DisplayUser
                  key={user.id}
                  user={user}
                  isCurrentUser={false}
                  disabledRemoveButton={disabledRemoveButton}
                  projectId={projectId}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
