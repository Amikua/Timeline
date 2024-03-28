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
  SPEECH: { emoji: "💬", label: "Chat" },
  ISSUE: { emoji: "🔥", label: "Issue" },
  BUG: { emoji: "🐛", label: "Bug" },
  FEATURES: { emoji: "✨", label: "Features" },
  WIP: { emoji: "🚧", label: "Work in Progress" },
  ZAP: { emoji: "⚡️", label: "Performance" },
  TADA: { emoji: "🎉", label: "Start" },
  AMBULANCE: { emoji: "🚨", label: "Alarm" },
  ROCKET: { emoji: "🚀", label: "Deployment" },
  CHECKMARK: { emoji: "✅", label: "Completion" },
  LOCK: { emoji: "🔒️", label: "Security" },
  PENCIL: { emoji: "✏️", label: "Sketch" },
  REWIND: { emoji: "⏪️", label: "Revert" },
  BULB: { emoji: "💡", label: "Idea" },
  PHONE: { emoji: "📱", label: "Mobile" },
  RUBBISH: { emoji: "🗑️", label: "Rubbish" },
};

export function AddCategoryToPost({
  selectedCategory,
  setSelectedCategory,
}: {
  selectedCategory: $Enums.Category;
  setSelectedCategory: (selectedCategory: $Enums.Category) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[280px] justify-between"
        >
          {`${categoryEmotes[selectedCategory].emoji} ${categoryEmotes[selectedCategory].label}`}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" max-h-44 w-[280px] overflow-y-auto p-0 scrollbar-none">
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
                    currentValue.toUpperCase() as $Enums.Category,
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
                {`${categoryEmotes[categoryValue].emoji} ${categoryEmotes[categoryValue].label}`}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
