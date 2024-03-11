"use client";
import { type Project } from "@prisma/client";
import { useParams } from "next/navigation";


import { Prisma } from "@prisma/client";
import Link from "next/link";


export function DisplayProjects({ projects }: { projects: ProjectWithAuthorAndUserCount[] }) {
  const params = useParams<{ projectId?: string }>();
  return (
    <main className="flex flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden  scrollbar scrollbar-thumb-primary scrollbar-track-background">
      {projects.map((project) => (
        <DisplayProject
          project={project}
          key={project.id}
          isActive={project.id === params?.projectId}
        />
      ))}
    </main>
  );
}

function DisplayProject({ project, isActive = false }: { project: ProjectWithAuthorAndUserCount, isActive?: boolean }) {
  return (
    <Link href={`/dashboard/${project.id}`} className="max-w-[97%] pl-1">
      <div className="flex flex-shrink-0 items-center gap-4  rounded-lg shadow shadow-gray-700 py-4 pl-4 hover:brightness-125">
        <div className={`flex min-w-[3rem] min-h-[3rem] size-12 items-center justify-center rounded-lg ${isActive ? "bg-primary" : 'bg-secondary'}`}>
          <h1 className="text-2xl text-foreground">{project.name[0]}</h1>
        </div>

        <div className="flex flex-col overflow-hidden">
          <h1 className="text-xl text-foreground w-full break-words">{project.name}</h1>
          <h2 className="text-foreground">Creator: {project.author.username}</h2>
        </div>
        <h2 className="ml-auto mr-4 text-foreground min-w-max">Users: {project._count.users}</h2>

      </div>
    </Link>
  );
}

export type ProjectWithAuthorAndUserCount = Prisma.ProjectGetPayload<{
  include: { author: { select: { username: true }, }, _count: { select: { users: true } } },
}>
