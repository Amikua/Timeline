import { type Project } from "@prisma/client";
import Link from "next/link";

export function DisplayProject({ project, isActive = false }: { project: Project, isActive?: boolean }) {
  return (
    <Link href={`/dashboard/${project.id}`}>
      <div className="flex items-center gap-4  rounded-lg shadow shadow-gray-700 py-4 pl-4 hover:brightness-125">
        <div className={`flex size-12 items-center justify-center rounded-lg ${isActive ? "bg-primary" : 'bg-secondary'}`}>
          <h1 className="text-2xl text-white">{project.name[0]}</h1>
        </div>
        <h1 className="text-xl text-white">{project.name}</h1>
      </div>
    </Link>
  );
}

