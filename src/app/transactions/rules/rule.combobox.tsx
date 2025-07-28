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
import { ProfileContext } from "@/app/context/profile.context";
import { useRef } from "react";

interface RuleComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function RuleCombobox({ value, onChange }: RuleComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { profile, setProfile, saveProfile } = React.useContext(ProfileContext);
  const categoriesSelection = profile.categories.map((c) => ({
    value: c,
    label: c,
  }));
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
            ? categoriesSelection.find((category) => category.value === value)
                ?.label
            : "Select or add category..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder="Select or add category..."
            className="h-9"
            ref={inputRef}
          />
          <CommandList>
            <CommandEmpty>
              <Button
                onClick={() => {
                  const input = inputRef?.current?.value.toLowerCase().trim();
                  if (input) {
                    profile.categories.push(input);
                    setProfile(profile);
                    saveProfile(profile);
                    onChange(input);
                    setOpen(false);
                  }
                }}
              >
                Add Category
              </Button>
            </CommandEmpty>
            <CommandGroup>
              {categoriesSelection.map((category) => (
                <CommandItem
                  key={category.value}
                  value={category.value}
                  onSelect={(currentValue) => {
                    const newVal = currentValue === value ? "" : currentValue;
                    onChange(newVal);
                    setOpen(false);
                  }}
                >
                  {category.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === category.value ? "opacity-100" : "opacity-0"
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
