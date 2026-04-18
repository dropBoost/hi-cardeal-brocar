"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export default function SelectComboBox({
  options = [],
  value = "",
  onChange,
  placeholder = "Seleziona un'opzione",
  searchPlaceholder = "Cerca...",
  emptyMessage = "Nessun risultato trovato.",
  className = "",
}) {
  const [open, setOpen] = React.useState(false);

  const selectedItem = options.find((item) => item.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedItem ? selectedItem.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((item) => (
                <CommandItem
                  key={item.key}
                  value={item.label}
                  onSelect={() => {
                    onChange?.(item.value);
                    setOpen(false);
                  }}
                >
                  <Check className={cn( "h-4 w-4", value === item.value ? "opacity-100" : "opacity-0" )} />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}