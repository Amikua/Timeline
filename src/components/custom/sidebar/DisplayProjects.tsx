"use client";
import { type Project } from "@prisma/client";
import { useParams } from "next/navigation";


import { Prisma } from "@prisma/client";
import Link from "next/link";


export function DisplayProjects({ projects }: { projects: ProjectWithAuthorAndUserCount[] }) {
  const params = useParams<{ projectId?: string }>();
  return (
    <main className="flex flex-col gap-4 py-4">
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
    <Link href={`/dashboard/${project.id}`}>
      <div className="flex items-center gap-4  rounded-lg shadow shadow-gray-700 py-4 pl-4 hover:brightness-125">
        <div className={`flex size-12 items-center justify-center rounded-lg ${isActive ? "bg-primary" : 'bg-secondary'}`}>
          <h1 className="text-2xl text-foreground">{project.name[0]}</h1>
        </div>

        <div className="flex flex-col">
          <h1 className="text-xl text-foreground">{project.name}</h1>
          <h2 className="text-foreground">Creator: {project.author.username}</h2>
        </div>
        <div className="ml-auto mr-4 text-foreground">Users: {project._count.users}</div>
              
      </div>
    </Link>
  );
}

export type ProjectWithAuthorAndUserCount = Prisma.ProjectGetPayload<{
  include: { author: { select: { username: true }, }, _count: { select: { users: true } } },
}>
