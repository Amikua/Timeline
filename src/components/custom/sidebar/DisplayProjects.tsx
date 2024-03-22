"use client";
import { type Prisma } from "@prisma/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import tinycolor from "tinycolor2";
import { type filter } from "./FilterAndDisplayProjects";

export function DisplayProjects({
  projects,
  projectStatusFilter,
  projectNameFilter,
}: {
  projects: ProjectWithAuthorAndUserCount[];
  projectStatusFilter: filter;
  projectNameFilter: string;
}) {
  const params = useParams<{ projectId?: string }>();
  return (
    <main className="flex flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden  scrollbar scrollbar-track-background scrollbar-thumb-primary">
      {projects
        .filter((project) => {
          if (!project.name.toLowerCase().startsWith(projectNameFilter.toLowerCase())) {
            return false
          }
          if (projectStatusFilter === "all") {
            return true;
          } else if (projectStatusFilter === "active") {
            return project.isActive;
          } else if (projectStatusFilter === "archived") {
            return !project.isActive;
          }
        })
        .map((project) => (
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
  const normalizedValue = ((hashCode % 360) + 360) % 360;
  const hue = normalizedValue;
  const color = tinycolor({ h: hue, s: 70, l: 30 }); // adjust saturation (s) and lightness (l) for different effects
  return color.toHexString();
};

function DisplayProject({
  project,
  isActive = false,
}: {
  project: ProjectWithAuthorAndUserCount;
  isActive?: boolean;
}) {
  return (
    <Link href={`/dashboard/${project.id}`} className="max-w-[97%] pl-1">
      <div
        className={`flex flex-shrink-0 items-center gap-4  rounded-lg py-4 pl-4 shadow shadow-gray-700 hover:brightness-125 ${isActive ? "brightness-100" : "brightness-50"}`}
      >
        <div
          className="flex size-12 min-h-[3rem] min-w-[3rem] items-center justify-center rounded-lg"
          style={{
            backgroundColor: project.isActive
              ? getColorForProjectName(project.name)
              : undefined,
          }}
        >
          <h1 className="text-2xl text-foreground">
            {project.isActive ? (
              project.name[0]
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-green-600"
                width="1em"
                height="1em"
                viewBox="0 0 512 512"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={32}
                  d="M416 128L192 384l-96-96"
                />
              </svg>
            )}
          </h1>
        </div>

        <div className="flex flex-col overflow-hidden">
          <h1 className="w-full break-words text-lg text-foreground">
            {project.name}
          </h1>
          <h2 className="text-sm text-foreground">
            Creator: {project.author.username}
          </h2>
        </div>
        <h2 className="ml-auto mr-4 min-w-max text-sm text-foreground">
          Users: {project._count.users}
        </h2>
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
