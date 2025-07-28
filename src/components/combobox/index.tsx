"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


interface ComboboxProps {
  selections: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function Combobox({ selections, value, onChange }: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? selections.find((selection) => selection.value === value)?.label
            : "Select..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No selection found.</CommandEmpty>
            <CommandGroup>
              {selections.map((selection) => (
                <CommandItem
                  key={selection.value}
                  value={selection.value}
                  onSelect={(currentValue) => {
                    const newVal = currentValue === value ? "" : currentValue;
                    onChange(newVal);
                    setOpen(false);
                  }}
                >
                  {selection.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === selection.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
