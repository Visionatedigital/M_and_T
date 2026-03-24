import * as React from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type BorrowerOption = { id: string; full_name?: string; phone_number?: string; email?: string };

type Props = {
    borrowers: BorrowerOption[];
    value: string;
    onChange: (borrowerId: string) => void;
    placeholder?: string;
    allowNone?: boolean;
    noneLabel?: string;
    className?: string;
    disabled?: boolean;
};

/**
 * Searchable borrower picker — avoids long Radix Select lists where typing doesn’t filter.
 * Use `modal` on Popover so focus + keyboard work reliably inside Dialogs.
 */
export function BorrowerCombobox({
    borrowers,
    value,
    onChange,
    placeholder = "Search borrower…",
    allowNone = false,
    noneLabel = "None",
    className,
    disabled,
}: Props) {
    const [open, setOpen] = React.useState(false);
    const selected = borrowers.find((b) => b.id === value);
    const searchRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (!open) return;
        const id = window.requestAnimationFrame(() => searchRef.current?.focus());
        return () => window.cancelAnimationFrame(id);
    }, [open]);

    return (
        <Popover modal open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn("w-full justify-between font-normal h-11 px-3", className)}
                >
                    <span className="flex items-center gap-2 min-w-0 truncate">
                        <User className="h-4 w-4 shrink-0 opacity-50" />
                        {selected ? (
                            <span className="truncate">{selected.full_name}</span>
                        ) : allowNone && !value ? (
                            <span className="text-muted-foreground">{noneLabel}</span>
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[min(100vw-2rem,420px)] p-0"
                align="start"
                sideOffset={4}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <Command className="rounded-md border-0">
                    <CommandInput
                        ref={searchRef}
                        placeholder={placeholder}
                        className="h-11"
                    />
                    <CommandList className="max-h-[280px]">
                        <CommandEmpty>No borrower found.</CommandEmpty>
                        <CommandGroup>
                            {allowNone && (
                                <CommandItem
                                    value={`__none__ ${noneLabel}`}
                                    onSelect={() => {
                                        onChange("");
                                        setOpen(false);
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
                                    {noneLabel}
                                </CommandItem>
                            )}
                            {borrowers.map((b) => {
                                const label = `${b.full_name || ""} ${b.phone_number || ""} ${b.email || ""}`.trim();
                                return (
                                    <CommandItem
                                        key={b.id}
                                        value={label || b.id}
                                        onSelect={() => {
                                            onChange(b.id);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", value === b.id ? "opacity-100" : "opacity-0")} />
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-medium truncate">{b.full_name}</span>
                                            {(b.phone_number || b.email) && (
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {[b.phone_number, b.email].filter(Boolean).join(" · ")}
                                                </span>
                                            )}
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
