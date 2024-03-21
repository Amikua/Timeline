"use client"

import { useState } from "react"
import { DisplayProjects, type ProjectWithAuthorAndUserCount } from "./DisplayProjects"
import { FilterProjects } from "./FilterProjects"


export type filter = "active" | "archived" | 'all'

export function FilterAndDisplayProjects({ projects }: { projects: ProjectWithAuthorAndUserCount[] }) {
  const [filter, setFilter] = useState<filter>('all')
  return (
    <>
      <FilterProjects filter={filter} setFilter={setFilter} />
      <DisplayProjects projects={projects} filter={filter} />
    </>
  )
}
