import { db } from "~/server/db";
import { AddProject } from "./AddProject";
import { type User } from "lucia";
import { DisplayUser } from "./DisplayUser";
import { DisplayProjects } from "./DisplayProjects";
import { Suspense } from "react";
import { Skeleton } from "~/components/ui/skeleton";

export function DisplaySkeletonProjects() {
  const projects = Array.from({ length: 5 }, (_, i) => i);
  return (
    <main className="flex flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden scrollbar scrollbar-thumb-primary scrollbar-track-background">
      {projects.map((_, i) => (
        <div key={i} className="max-w-[97%] ml-1">
          <div className="flex flex-shrink-0 items-center gap-4  rounded-lg shadow shadow-gray-700 py-4 pl-4">
            <div className="flex min-w-[3rem] min-h-[3rem] size-12 items-center justify-center rounded-lg bg-secondary">
              <Skeleton className="w-12 h-12 rounded-lg" />
            </div>
            <div className="flex flex-col gap-2 overflow-hidden">
              <Skeleton className="w-16 h-5" />
              <Skeleton className="w-24 h-3" />
            </div>
            <div className="ml-auto mr-4">
              <Skeleton className="w-16 h-5" />
            </div>
          </div>
        </div>
      ))
      }
    </main >
  );
}

async function GetAndDisplayProjects({ user }: { user: User }) {
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
    <DisplayProjects projects={projects} />
  );
}


export default async function Sidebar({ user }: { user: User }) {

  return (
    <nav className="relative h-screen min-w-96 max-w-96 border-r border-gray-700" >
      <div className="flex gap-12 h-full max-h-full flex-col justify-between px-6 pt-12">
        <div className="flex flex-col gap-6 flex-1 min-h-0">
          <DisplayUser user={user} />
          <Suspense fallback={<DisplaySkeletonProjects />}>
            <GetAndDisplayProjects user={user} />
          </Suspense>
        </div>
        <AddProject />
      </div>
    </nav >
  );
}
