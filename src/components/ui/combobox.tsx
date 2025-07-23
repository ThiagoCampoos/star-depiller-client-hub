import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
    options: { value: string; label: string }[]
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    emptyMessage?: string
    className?: string
    searchPlaceholder?: string
}

export function Combobox({
    options,
    value,
    onValueChange,
    placeholder = "Selecione uma opção",
    emptyMessage = "Nenhum resultado encontrado.",
    className,
    searchPlaceholder = "Pesquisar...",
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    // Garantir que options seja sempre um array, mesmo que vazio
    const safeOptions = Array.isArray(options) ? options : []

    // Encontrar a opção selecionada com base no valor
    const selectedOption = React.useMemo(() => {
        console.log("Combobox value:", value);
        console.log("Available options:", safeOptions);
        return safeOptions.find((option) => option.value === value);
    }, [safeOptions, value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup className="max-h-60 overflow-auto">
                            {safeOptions.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        onValueChange(option.value)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}