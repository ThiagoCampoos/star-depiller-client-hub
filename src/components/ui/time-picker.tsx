import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  
  // Inicializar com valores do value ou padrão
  const [hour, setHour] = React.useState<number>(() => {
    if (value && value.includes(':')) {
      const [hours] = value.split(':');
      return parseInt(hours) || 12;
    }
    return 12;
  });
  
  const [minute, setMinute] = React.useState<number>(() => {
    if (value && value.includes(':')) {
      const [, minutes] = value.split(':');
      return parseInt(minutes) || 0;
    }
    return 0;
  });
  
  const [open, setOpen] = React.useState(false);
  
  // Referência para controlar se o componente está montado
  const isMounted = React.useRef(true);
  
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Atualiza o estado quando o valor (horario_sessao) muda externamente
  React.useEffect(() => {
    if (value && value.includes(':') && isMounted.current) {
      const [hours, minutes] = value.split(':');
      const hoursNum = parseInt(hours);
      const minutesNum = parseInt(minutes);
      
      if (!isNaN(hoursNum) && !isNaN(minutesNum)) {
        setHour(hoursNum);
        setMinute(minutesNum);
      }
    }
  }, [value]);

  // Atualiza o valor quando hour ou minute mudam
  const updateValue = React.useCallback(() => {
    if (!isMounted.current || !onChange) return;
    
    try {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      const timeString = `${formattedHour}:${formattedMinute}`;
      
      onChange(timeString);
    } catch (error) {
      console.error("Erro ao atualizar horário:", error);
    }
  }, [hour, minute, onChange]);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMounted.current) return;
    
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      setHour(0);
      return;
    }

    if (value >= 0 && value <= 23) {
      setHour(value);
      if (value === 0 || value === 23) {
        minuteRef.current?.focus();
      }
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMounted.current) return;
    
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      setMinute(0);
      return;
    }

    if (value >= 0 && value <= 59) {
      setMinute(value);
      if (value === 0 || value === 59) {
        e.target.blur();
      }
    }
  };

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return "Selecionar horário";
    return timeString;
  };

  const handleConfirm = () => {
    if (!isMounted.current) return;
    
    updateValue();
    setTimeout(() => {
      if (isMounted.current) {
        setOpen(false);
      }
    }, 0);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatTime(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex items-center space-x-2">
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <label htmlFor="hours" className="text-sm font-medium">
                Hora:
              </label>
              <Input
                ref={hourRef}
                id="hours"
                type="number"
                min="0"
                max="23"
                value={hour}
                onChange={handleHourChange}
                className="w-16 text-center"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="minutes" className="text-sm font-medium">
                Min:
              </label>
              <Input
                ref={minuteRef}
                id="minutes"
                type="number"
                min="0"
                max="59"
                value={minute}
                onChange={handleMinuteChange}
                className="w-16 text-center"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleConfirm} size="sm">
            Confirmar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}