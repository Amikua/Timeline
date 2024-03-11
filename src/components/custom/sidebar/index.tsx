import { db } from "~/server/db";
import { AddProject } from "./AddProject";
import { type User } from "lucia";
import { DisplayUser } from "./DisplayUser";
import { DisplayProjects } from "./DisplayProjects";

export default async function Sidebar({ user }: { user: User }) {
  const projects = await db.project.findMany({
    where: {
      users: {
        some: {
          id: user.id,
        },
      },
    },
    include: {
      author: {
        select: { username: true }
      },
      _count: {
        select: { users: true }
      }
    }
  });

  return (
    <nav className="relative h-screen min-w-96 max-w-96 border-r border-gray-700">
      <div className="flex h-full max-h-full flex-col justify-between px-6 pt-12">
        <div className="flex flex-col gap-6 max-h-[90%]">
          <DisplayUser user={user} />
          <DisplayProjects projects={projects} />
        </div>
        <AddProject />
      </div>
    </nav>
  );
}
