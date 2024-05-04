import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { type filter } from "./FilterAndDisplayProjects";

export function FilterProjects({
  projectStatusFilter,
  setProjectStatusFilter,
  projectNameFilter,
  setProjectNameFilter,
}: {
  projectStatusFilter: filter;
  setProjectStatusFilter: (value: filter) => void;
  projectNameFilter: string;
  setProjectNameFilter: (value: string) => void;
}) {
  const handleFilterChange = (value: string) => {
    setProjectStatusFilter(value as filter);
  };

  return (
    <div className="flex place-content-between gap-2 border-b-2 border-muted px-1 pb-6">
      <Input
        className="border-primary"
        placeholder="Search Project"
        value={projectNameFilter}
        onChange={(e) => setProjectNameFilter(e.target.value)}
      />
      <Select value={projectStatusFilter} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-44 border-primary">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent className="border-secondary">
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
