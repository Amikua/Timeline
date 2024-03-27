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

export const categoryEmotes = {
  ISSUE: "💥",
  BUG: "🐛",
  FEATURES: "✨",
  WIP: "🚧",
  ZAP: "⚡️",
  TADA: "🎉",
};

export function AddCategoryToPost({
  selectedCategory,
  setSelectedCategory,
}: {
  selectedCategory: $Enums.Category | "";
  setSelectedCategory: (selectedCategory: $Enums.Category | "") => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[280px] justify-between"
        >
          {selectedCategory
            ? `${categoryEmotes[selectedCategory as keyof typeof categoryEmotes]} ${selectedCategory}`
            : "Select category..."}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search category..." />
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandGroup>
            {Object.values(Category).map((categoryValue) => (
              <CommandItem
                key={categoryValue}
                value={categoryValue}
                className="cursor-pointer"
                onSelect={(currentValue) => {
                  setSelectedCategory(
                    currentValue === selectedCategory.toUpperCase()
                      ? ""
                      : (currentValue.toUpperCase() as $Enums.Category),
                  );
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCategory === categoryValue
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {`${categoryEmotes[categoryValue]} ${categoryValue}`}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
