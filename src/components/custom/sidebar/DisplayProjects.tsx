"use client";
import { type Project } from "@prisma/client";
import { useParams } from "next/navigation";
import { DisplayProject } from "./DisplayProject";

export function DisplayProjects({ projects }: { projects: Project[] }) {
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
