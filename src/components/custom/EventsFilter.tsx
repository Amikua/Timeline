"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { type $Enums, Category } from "@prisma/client";
import { categoryEmotes } from "./AddCategoryToPost";

export function EventsFilter({
  filter,
  setFilter,
}: {
  filter: Category | "";
  setFilter: (filter: Category | "") => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-48 justify-between"
        >
          {filter
            ? `${categoryEmotes[filter].emoji} ${categoryEmotes[filter].label}`
            : "🌐 All"}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" max-h-44 w-[280px] overflow-y-auto p-0 scrollbar-none">
        <Command>
          <CommandInput placeholder="Search category..." />
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              value={""}
              className="cursor-pointer"
              onSelect={(currentValue) => {
                setFilter("");
                setOpen(false);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  !filter ? "opacity-100" : "opacity-0",
                )}
              />
              🌐 All
            </CommandItem>
            {Object.values(Category).map((categoryValue) => (
              <CommandItem
                key={categoryValue}
                value={categoryValue}
                className="cursor-pointer"
                onSelect={(currentValue) => {
                  setFilter(currentValue.toUpperCase() as $Enums.Category);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    filter === categoryValue ? "opacity-100" : "opacity-0",
                  )}
                />
                {`${categoryEmotes[categoryValue].emoji} ${categoryEmotes[categoryValue].label}`}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
