import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { type filter } from "./FilterAndDisplayProjects";

export function FilterProjects({ filter, setFilter }: { filter: filter, setFilter: (value: filter) => void }) {
    const handleFilterChange = (value: string) => {
        setFilter(value as filter);
    };

    return (
        <div className="flex gap-2 place-content-between px-1 pb-6 border-b-2 border-gray-700">
            <Input className="border-primary" placeholder="Search Project" />
            <Select value={filter} onValueChange={handleFilterChange}>
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
