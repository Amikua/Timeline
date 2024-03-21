"use client";
import { type Prisma } from "@prisma/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import tinycolor from 'tinycolor2';
import { type filter } from "./FilterAndDisplayProjects";


export function DisplayProjects({ projects, filter }: { projects: ProjectWithAuthorAndUserCount[], filter: filter }) {
  const params = useParams<{ projectId?: string }>();
  return (
    <main className="flex flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden  scrollbar scrollbar-thumb-primary scrollbar-track-background">
      {projects.filter((project) => {
        if (filter === "all") {
          return true;
        } else if (filter === "active") {
          return project.isActive;
        } else if (filter === "archived") {
          return !project.isActive;
        }
      }).map((project) => (
        <DisplayProject
          project={project}
          key={project.id}
          isActive={project.id === params?.projectId}
        />
      ))}
    </main>
  );
}


const getColorForProjectName = (name: string): string => {
  let hashCode = 0;
  for (let i = 0; i < name.length; i++) {
    hashCode = (hashCode << 5) - hashCode + name.charCodeAt(i);
    hashCode &= hashCode;
  }
  const normalizedValue = (hashCode % 360 + 360) % 360;
  const hue = normalizedValue;
  const color = tinycolor({ h: hue, s: 70, l: 30 }); // adjust saturation (s) and lightness (l) for different effects
  return color.toHexString();
};


function DisplayProject({ project, isActive = false }: { project: ProjectWithAuthorAndUserCount, isActive?: boolean }) {

  return (
    <Link href={`/dashboard/${project.id}`} className="max-w-[97%] pl-1">
      <div className={`flex flex-shrink-0 items-center gap-4  rounded-lg shadow shadow-gray-700 py-4 pl-4 hover:brightness-125 ${isActive ? "brightness-100" : "brightness-50"}`}>
        <div className="flex min-w-[3rem] min-h-[3rem] size-12 items-center justify-center rounded-lg" style={{ backgroundColor: getColorForProjectName(project.name) }}>
          <h1 className="text-2xl text-foreground">{project.name[0]}</h1>
        </div>

        <div className="flex flex-col overflow-hidden">
          <h1 className="text-lg text-foreground w-full break-words">{project.name}</h1>
          <h2 className="text-sm text-foreground">Creator: {project.author.username}</h2>
        </div>
        <h2 className="text-sm ml-auto mr-4 text-foreground min-w-max">Users: {project._count.users}</h2>

      </div>
    </Link>
  );
}

export type ProjectWithAuthorAndUserCount = Prisma.ProjectGetPayload<{
  include: {
    author: {
      select: {
        username: true;
      };
    };
    _count: {
      select: {
        users: true;
      };
    };
  };
}>;
