"use client"

import { useState } from "react"
import { DisplayProjects, type ProjectWithAuthorAndUserCount } from "./DisplayProjects"
import { FilterProjects } from "./FilterProjects"


export type filter = "active" | "archived" | 'all'

export function FilterAndDisplayProjects({ projects }: { projects: ProjectWithAuthorAndUserCount[] }) {
  // const [filter, setFilter] = useState<filter>('all')
  const [projectStatusFilter, setProjectStatusFilter] = useState<filter>('active')
  const [projectNameFilter, setProjectNameFilter] = useState<string>('')
  return (
    <>
      <FilterProjects
        projectStatusFilter={projectStatusFilter}
        setProjectStatusFilter={setProjectStatusFilter}
        projectNameFilter={projectNameFilter}
        setProjectNameFilter={setProjectNameFilter}
      />
      <DisplayProjects
        projects={projects}
        projectStatusFilter={projectStatusFilter}
        projectNameFilter={projectNameFilter}
      />
    </>
  )
}
