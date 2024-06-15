"use client";
import { type Prisma } from "@prisma/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import tinycolor from "tinycolor2";
import { type filter } from "./FilterAndDisplayProjects";
import Image from "next/image";
import { useTheme } from "next-themes";

export function DisplayProjects({
  projects,
  projectStatusFilter,
  projectNameFilter,
}: {
  projects: ProjectWithAuthorAndUsers[];
  projectStatusFilter: filter;
  projectNameFilter: string;
}) {
  const params = useParams<{ projectId?: string }>();
  return (
    <main className="flex flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden  scrollbar scrollbar-track-background scrollbar-thumb-primary">
      {projects
        .filter((project) => {
          if (
            !project.name
              .toLowerCase()
              .startsWith(projectNameFilter.toLowerCase())
          ) {
            return false;
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

const getColorForProjectName = (name: string, theme?: string): string => {
  let hashCode = 0;
  for (let i = 0; i < name.length; i++) {
    hashCode = (hashCode << 5) - hashCode + name.charCodeAt(i);
    hashCode &= hashCode;
  }
  const normalizedValue = ((hashCode % 360) + 360) % 360;
  const hue = normalizedValue;
  const color = tinycolor({ h: hue, s: 70, l: theme === "dark" ? 30 : 69 }); // adjust saturation (s) and lightness (l) for different effects
  return color.toHexString();
};

function DisplayProject({
  project,
  isActive = false,
}: {
  project: ProjectWithAuthorAndUsers;
  isActive?: boolean;
}) {
  // Slice the users array to display only the first three users
  const displayedUsers = project.users.slice(0, 3);
  const theme = useTheme();

  return (
    <Link href={`/dashboard/${project.id}`} className="max-w-[97%] pl-1">
      <div
        className={`flex flex-shrink-0 items-center gap-4 rounded-lg py-4 pl-4
         transition-all duration-200 ease-in-out
        shadow shadow-muted hover:brightness-105
        dark:hover:brightness-125 ${isActive ? "brightness-100 shadow-primary" : "brightness-75 dark:brightness-50"}`}
      >
        <div
          className="flex size-12 min-h-[3rem] min-w-[3rem] items-center justify-center rounded-lg"
          style={{
            backgroundColor: project.isActive
              ? getColorForProjectName(project.name, theme.resolvedTheme)
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

        <div className="relative ml-auto mr-4 flex min-w-max items-center space-x-[-4px]">
          {displayedUsers.map((user, index) => (
            <div
              key={index}
              className="relative"
              style={{ zIndex: displayedUsers.length - index }}
            >
              <Image
                alt={`Avatar of users`}
                width={32}
                height={32}
                className="size-4 rounded-2xl"
                src={user.avatarUrl}
              />
              <style jsx>{`
                .relative {
                  position: relative;
                  left: ${index === 0 ? 0 : -1}px;
                }
              `}</style>
            </div>
          ))}
          {project._count.users > 3 && (
            <div className="relative left-[6px]">
              <h2 className="text-sm text-foreground">
                +{project._count.users - 3}
              </h2>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export type ProjectWithAuthorAndUsers = Prisma.ProjectGetPayload<{
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
    users: {
      select: {
        avatarUrl: true;
      };
    };
  };
}>;
