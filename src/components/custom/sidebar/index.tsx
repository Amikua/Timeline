import { db } from "~/server/db";
import { AddProject } from "./AddProject";
import { type User } from "lucia";
import { DisplayUser } from "./DisplayUser";
import { FilterAndDisplayProjects } from "./FilterAndDisplayProjects";
import { Suspense } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";

export function SkeletonFilterAndDisplayProjects() {
  const projects = Array.from({ length: 5 }, (_, i) => i);
  return (
    <>
      <div className="flex place-content-between gap-2 border-b-2 border-gray-700 px-1 pb-6">
        <Input className="border-primary" placeholder="Search Project" />
        <Select>
          <SelectTrigger className="w-44 border-primary">
            <SelectValue placeholder="Active" />
          </SelectTrigger>
          <SelectContent className="border-secondary">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <main className="flex flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden scrollbar scrollbar-track-background scrollbar-thumb-primary">
        {projects.map((_, i) => (
          <div key={i} className="ml-1 max-w-[97%]">
            <div className="flex flex-shrink-0 items-center gap-4  rounded-lg py-4 pl-4 shadow shadow-gray-700">
              <div className="flex size-12 min-h-[3rem] min-w-[3rem] items-center justify-center rounded-lg bg-secondary">
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
              <div className="flex flex-col gap-2 overflow-hidden">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="ml-auto mr-4">
                <Skeleton className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </main>
    </>
  );
}

async function LazyFilterAndDisplayProjects({ user }: { user: User }) {
  const [projects, _] = await Promise.all([
    db.project.findMany({
      where: {
        users: {
          some: {
            id: user.id,
          },
        },
      },
      include: {
        author: {
          select: { username: true },
        },
        users: {
          select: { avatarUrl: true },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    new Promise((resolve) => setTimeout(resolve, 500)),
  ]);
  return <FilterAndDisplayProjects projects={projects} />;
}

export default async function Sidebar({ user }: { user: User }) {
  return (
    <nav className="relative h-screen min-w-96 max-w-96 border-r border-gray-700">
      <div className="flex h-full max-h-full flex-col justify-between gap-12 px-6 pt-12">
        <div className="flex min-h-0 flex-1 flex-col gap-6">
          <DisplayUser user={user} />
          <Suspense fallback={<SkeletonFilterAndDisplayProjects />}>
            <LazyFilterAndDisplayProjects user={user} />
          </Suspense>
        </div>
        <AddProject />
      </div>
    </nav>
  );
}
